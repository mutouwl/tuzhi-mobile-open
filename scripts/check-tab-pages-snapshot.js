/**
 * 三个「tab 列表页」的会话快照校验 —— 不构建、不开浏览器。
 *
 * 用户 2026-10-28 点名：`/pages/course/category/category`、`/pages/course/group/group?id=28`、
 * `/pages/app/physical/list/list` 与自定义页/首页同样「每次切换页面或 tabbar 都会触发重新加载」。
 * 底部导航是自定义 `tz/tab-bar`，切 tab 走 `redirectTo` ⇒ 页面实例销毁，所以「已加载的页面要保存」
 * 只能靠模块作用域的会话快照（`common/utils/page-snapshot`），下拉刷新是唯一失效口。
 *
 * 把三页的 script 原样抽出来（剥掉 ESM import、条件编译），用桩喂 uni / $api，逐页实跑：
 *   A. 首进取一次；数据落地、列表有内容；
 *   B. **同一个页面参数再开一个新实例**（切 tab 回来的真实形态）——零请求、列表/选中项原样；
 *   C. 下拉刷新强制重取一次，刷新后覆盖快照（再开新实例拿到的是刷新后的那一份）；
 *   D. **换参数就是另一个页面**（分类 id / 分组 id / 分类 + 搜索词）——不许复用上一屏快照，
 *      且切回原参数仍吃原快照；
 *   E. 分类页下拉刷新不许把 id 丢掉（老写法 `getList({})` 会回根分类树）。
 * 用法：node tuzi-mobile/scripts/check-tab-pages-snapshot.js   （exit 0 = 全部符合预期）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'src/common/utils/page-snapshot.js');

let fail = 0;
const assert = (name, ok, got) => {
  if (!ok) fail++;
  console.log((ok ? '[PASS] ' : '[FAIL] ') + name + (got === undefined ? '' : ' -> ' + got));
};
const tick = () => new Promise((r) => setTimeout(r, 20));

function scriptOf(file) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const m = src.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return m ? m[1] : src;
}

/** 剥条件编译（小程序分支整段删、H5 分支去标记留内容） */
function stripConditional(src) {
  return src
    .replace(/\/\/\s*#ifdef\s+MP-[^\n]*\n[\s\S]*?\/\/\s*#endif/g, '')
    .replace(/\/\/\s*#ifdef\s+H5[^\n]*\n/g, '')
    .replace(/^\s*\/\/\s*#endif\s*$/gm, '')
    .replace(/^\s*\/\/\s*#ifndef[^\n]*$/gm, '');
}

/** 快照工具用真件（只换 export 外壳）：验的就是它存/取/JSON 克隆 */
function loadSnapshotModule() {
  let src = fs.readFileSync(SNAPSHOT, 'utf8').replace(/export function /g, 'function ');
  src += '\nmodule.exports = { readPageSnapshot: readPageSnapshot, writePageSnapshot: writePageSnapshot };\n';
  const m = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', src)(m, m.exports);
  return m.exports;
}

/** 抽页面 script → 去 import → CommonJS。组件/lodash 这类只做装配的默认导入换成空对象 */
function loadPage(file, snapshot) {
  let src = stripConditional(scriptOf(file));
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']*page-snapshot["'];?\s*$/m,
    (all, names) => 'const {' + names + '} = __snapshot;');
  src = src.replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm,
    (all, name) => 'const ' + name + ' = {};');
  src = src.replace(/^import\s*\{[^}]*\}\s*from\s*["'][^"']*["'];?\s*$/gm, '');
  src = src.replace('export default', 'module.exports =');
  const mod = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', '__snapshot', src)(mod, mod.exports, snapshot);
  return mod.exports;
}

function makeEnv(handlers) {
  const calls = {};
  const payloads = {};
  let stops = 0;
  const api = (name, data) => {
    calls[name] = (calls[name] || 0) + 1;
    payloads[name] = data || {};
    const handler = handlers[name];
    if (!handler) return Promise.resolve({ code: 1, data: [] });
    try {
      return Promise.resolve(handler(data || {}));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const uni = {
    getStorageSync: () => '',
    setStorageSync: () => {},
    getSystemInfoSync: () => ({ statusBarHeight: 20, safeArea: { height: 800 } }),
    getSystemInfo: (opts) => { if (opts && opts.success) opts.success({ windowTop: 20 }); },
    stopPullDownRefresh: () => { stops++; },
    setNavigationBarTitle: () => {},
    showLoading: () => {},
    hideLoading: () => {},
  };
  return { calls, payloads, api, uni, stops: () => stops };
}

function makeVm(mod, env) {
  const vm = Object.assign({}, mod.data(), {
    $api: env.api,
    $nav: { parsePageParams: (p) => p || {}, share: () => {}, to: () => {} },
    $tools: { systemConfig: () => false },
    $refs: {},
  });
  Object.keys(mod.methods || {}).forEach((k) => { vm[k] = mod.methods[k].bind(vm); });
  // computed 也要装：分类页的 courseGroupId 决定「要不要取课程列表」这一支
  Object.keys(mod.computed || {}).forEach((k) => {
    Object.defineProperty(vm, k, { get: () => mod.computed[k].call(vm), configurable: true });
  });
  return vm;
}

function openPage(mod, env, options) {
  global.uni = env.uni;
  const vm = makeVm(mod, env);
  mod.onLoad.call(vm, options || {});
  return vm;
}

/* ------------------------------- 每页的假数据 ------------------------------- */

function categoryTree(id) {
  return {
    code: 1,
    data: {
      group_level: 2,
      list: [
        {
          id: Number(id) || 1,
          name: '一级-' + (id || 'default'),
          image: '`a.png`',
          children: [
            { id: 101, name: '二级A' },
            { id: 102, name: '二级B' },
          ],
        },
      ],
    },
  };
}

function courseRows(tag, n) {
  const rows = [];
  for (let i = 0; i < n; i++) rows.push({ id: tag * 100 + i, name: '课程' + tag + '-' + i });
  return rows;
}

function physicalRows(tag, n) {
  const rows = [];
  for (let i = 0; i < n; i++) rows.push({ id: tag * 100 + i, name: '商品' + tag + '-' + i, price: 10, image: '`p.png`' });
  return rows;
}

(async () => {
  const snapshot = loadSnapshotModule();

  /* ------------------------------ 1. 课程分类 ------------------------------ */
  {
    const env = makeEnv({
      'course.group.index': (data) => categoryTree(data.id),
      'course.course': (data) => ({ code: 1, data: courseRows(Number(data.group) || 1, 10) }),
    });
    const mod = loadPage('src/pages/course/category/js.vue', snapshot);
    const vm = openPage(mod, env, { id: '28' });
    await tick();
    assert('分类页 A 首进取一次分类树 + 一次课程列表',
      (env.calls['course.group.index'] || 0) === 1 && (env.calls['course.course'] || 0) === 1,
      'index=' + (env.calls['course.group.index'] || 0) + '，courses=' + (env.calls['course.course'] || 0));
    assert('分类页 A 数据落地（左栏分类 / 右栏课程）',
      vm.loading === false && vm.categoryList.children.length === 1 && vm.courseList.length === 10,
      'children=' + vm.categoryList.children.length + '，courses=' + vm.courseList.length);

    // 切 tab 回来＝新实例，同一参数
    const vmTab = openPage(mod, env, { id: '28' });
    await tick();
    assert('分类页 B 切 tab 回来（新实例）零请求',
      (env.calls['course.group.index'] || 0) === 1 && (env.calls['course.course'] || 0) === 1,
      'index=' + (env.calls['course.group.index'] || 0) + '，courses=' + (env.calls['course.course'] || 0));
    assert('分类页 B 复原后左右两栏与选中项都在',
      vmTab.loading === false && vmTab.courseList.length === 10 && vmTab.categoryList.children[0].name.indexOf('28') !== -1,
      'courses=' + vmTab.courseList.length);

    // 下拉刷新：重新取数，且 id 不许丢
    mod.onPullDownRefresh.call(vmTab);
    await tick();
    assert('分类页 C 下拉刷新重取一次', (env.calls['course.group.index'] || 0) === 2, 'index=' + (env.calls['course.group.index'] || 0));
    assert('分类页 E 下拉刷新仍带本页 id（老写法 getList({}) 会回根分类树）',
      String((env.payloads['course.group.index'] || {}).id) === '28',
      'id=' + JSON.stringify((env.payloads['course.group.index'] || {}).id));

    // 换 id＝另一个分类页
    const vmOther = openPage(mod, env, { id: '29' });
    await tick();
    assert('分类页 D 换 id 当另一页：重新取数、内容不是上一页的',
      (env.calls['course.group.index'] || 0) === 3
        && vmOther.categoryList.children[0].name.indexOf('29') !== -1,
      'index=' + (env.calls['course.group.index'] || 0) + '，name=' + vmOther.categoryList.children[0].name);

    // 切回 28：仍吃 28 自己那份快照
    const back = openPage(mod, env, { id: '28' });
    await tick();
    assert('分类页 D 切回原 id 仍吃原快照（零请求）',
      (env.calls['course.group.index'] || 0) === 3
        && back.categoryList.children[0].name.indexOf('28') !== -1,
      'index=' + (env.calls['course.group.index'] || 0) + '，name=' + back.categoryList.children[0].name);
  }

  /* ------------------------------ 2. 课程分组 ------------------------------ */
  {
    const env = makeEnv({
      'course.group.getList': () => ({ code: 1, data: [{ id: 101, name: '分组A' }, { id: 102, name: '分组B' }] }),
      'course.course': (data) => ({ code: 1, data: courseRows(Number(data.group) || 28, 4) }),
    });
    const mod = loadPage('src/pages/course/group/js.vue', snapshot);

    // 真实链接 `group?id=28` 不带 tabs：只有列表，没有页签请求
    const vm = openPage(mod, env, { id: '28' });
    await tick();
    assert('分组页 A 首进取一次列表（不带 tabs 时不发页签请求）',
      (env.calls['course.group.getList'] || 0) === 0 && (env.calls['course.course'] || 0) === 1,
      'groups=' + (env.calls['course.group.getList'] || 0) + '，courses=' + (env.calls['course.course'] || 0));
    assert('分组页 A 数据落地（列表 4 条）', vm.loading === false && vm.list.length === 4, 'list=' + vm.list.length);

    const vmTab = openPage(mod, env, { id: '28' });
    await tick();
    assert('分组页 B 切 tab 回来（新实例）零请求、列表原样',
      (env.calls['course.course'] || 0) === 1 && vmTab.list.length === 4,
      'courses=' + (env.calls['course.course'] || 0) + '，list=' + vmTab.list.length);

    mod.onPullDownRefresh.call(vmTab);
    await tick();
    assert('分组页 C 下拉刷新重取一次', (env.calls['course.course'] || 0) === 2, 'courses=' + (env.calls['course.course'] || 0));

    const vmOther = openPage(mod, env, { id: '30' });
    await tick();
    assert('分组页 D 换 id 当另一页：重新取数', (env.calls['course.course'] || 0) === 3, 'courses=' + (env.calls['course.course'] || 0));
    const back = openPage(mod, env, { id: '28' });
    await tick();
    assert('分组页 D 切回原 id 仍吃原快照（零请求）',
      (env.calls['course.course'] || 0) === 3 && back.list.length === 4,
      'courses=' + (env.calls['course.course'] || 0) + '，list=' + back.list.length);

    // 带页签那一档（链上带 tabs=1）：页签也要进快照，缺页签的半份快照不许复原
    const vmTabs = openPage(mod, env, { id: '28', tabs: 1 });
    await tick();
    assert('分组页 A2 带 tabs 时页签与列表都取到',
      (env.calls['course.group.getList'] || 0) === 1 && vmTabs.tabsList.length === 3 && vmTabs.list.length === 4,
      'groups=' + (env.calls['course.group.getList'] || 0) + '，tabs=' + vmTabs.tabsList.length);
    const vmTabsBack = openPage(mod, env, { id: '28', tabs: 1 });
    await tick();
    assert('分组页 B2 带 tabs 切回来：零请求、页签原样',
      (env.calls['course.group.getList'] || 0) === 1 && vmTabsBack.tabsList.length === 3,
      'groups=' + (env.calls['course.group.getList'] || 0) + '，tabs=' + vmTabsBack.tabsList.length);
  }

  /* ---------------------------- 3. 实物商品列表 ---------------------------- */
  {
    const env = makeEnv({
      'physical.physical.index': (data) => ({
        code: 1,
        data: {
          data: physicalRows(Number(data.category_id) || 0, 2),
          total: 2,
          current_page: 1,
          last_page: 1,
        },
      }),
    });
    const mod = loadPage('src/pages/app/physical/list/js.vue', snapshot);
    const vm = openPage(mod, env, { categoryId: '5' });
    await tick();
    assert('商品列表 A 首进取一次', (env.calls['physical.physical.index'] || 0) === 1,
      'calls=' + (env.calls['physical.physical.index'] || 0));
    assert('商品列表 A 数据落地（2 条 / 骨架收起）',
      vm.loading === false && vm.pagination.data.length === 2, 'data=' + vm.pagination.data.length);

    // 改一下页内筛选（切到「销量」）再切 tab，回来要保住
    vm.onTabsChange(1);
    await tick();
    const vmTab = openPage(mod, env, { categoryId: '5' });
    await tick();
    assert('商品列表 B 切 tab 回来（新实例）零请求、列表与排序原样',
      vmTab.loading === false && vmTab.pagination.data.length === 2 && vmTab.currentTab === 1
        && vmTab.currentSort === 'total_sales',
      'data=' + vmTab.pagination.data.length + '，tab=' + vmTab.currentTab + '，sort=' + vmTab.currentSort);

    mod.onPullDownRefresh.call(vmTab);
    await tick();
    assert('商品列表 C 下拉刷新重取一次', (env.calls['physical.physical.index'] || 0) >= 3,
      'calls=' + (env.calls['physical.physical.index'] || 0));

    const vmOther = openPage(mod, env, { categoryId: '6' });
    await tick();
    assert('商品列表 D 换分类当另一页：重新取数',
      vmOther.pagination.data.length === 2
        && String((env.payloads['physical.physical.index'] || {}).category_id) === '6',
      'category_id=' + JSON.stringify((env.payloads['physical.physical.index'] || {}).category_id));
    const back = openPage(mod, env, { categoryId: '5' });
    await tick();
    assert('商品列表 D 切回原分类仍吃原快照（零请求、排序仍是销量）',
      back.currentTab === 1 && back.currentSort === 'total_sales' && back.pagination.data.length === 2,
      'tab=' + back.currentTab + '，sort=' + back.currentSort);
  }

  /* -------------------- 4. 迟到响应不许混进新一屏（竞态） -------------------- */
  {
    // 商品列表：切排序会连发两发，后发先回、前一发迟到——迟到那一发不许覆盖新排序
    const pending = [];
    const env = makeEnv({
      'physical.physical.index': (data) => new Promise((resolve) => {
        pending.push({ data: data, resolve: resolve });
      }),
    });
    const mod = loadPage('src/pages/app/physical/list/js.vue', snapshot);
    const vm = openPage(mod, env, { categoryId: '9' });
    pending.shift().resolve({
      code: 1,
      data: { data: [{ id: 1, name: '首屏', price: 1 }], total: 1, current_page: 1, last_page: 1 },
    });
    await tick();
    vm.onTabsChange(1);   // 销量（请求 A）
    vm.onTabsChange(2);   // 新品（请求 B）
    const first = pending.shift();   // A
    const second = pending.shift();  // B
    assert('竞态 商品页两发都在飞', !!first && !!second && first.data.sort === 'total_sales' && second.data.sort === 'createtime',
      'A=' + (first && first.data.sort) + '，B=' + (second && second.data.sort));
    second.resolve({
      code: 1,
      data: { data: [{ id: 2, name: '新品那一发', price: 1 }], total: 1, current_page: 1, last_page: 1 },
    });
    await tick();
    first.resolve({
      code: 1,
      data: { data: [{ id: 3, name: '销量那一发（迟到）', price: 1 }], total: 1, current_page: 1, last_page: 1 },
    });
    await tick();
    assert('竞态 商品页迟到的销量响应不覆盖新品那一屏',
      vm.currentTab === 2 && vm.pagination.data.length === 1 && vm.pagination.data[0].name === '新品那一发',
      'tab=' + vm.currentTab + '，data=' + JSON.stringify(vm.pagination.data.map((i) => i.name)));
  }

  {
    // 课程分组：切页签连发两发，后发先回、前一发迟到——迟到那一发不许拼进新组的列表
    const pending = [];
    const env = makeEnv({
      'course.group.getList': () => ({ code: 1, data: [{ id: 101, name: '分组A' }, { id: 102, name: '分组B' }] }),
      'course.course': (data) => new Promise((resolve) => {
        pending.push({ group: data.group, resolve: resolve });
      }),
    });
    const mod = loadPage('src/pages/course/group/js.vue', snapshot);
    // 用一个没访问过的 id（前面那几屏已进快照，复原就不会发请求了）
    const vm = openPage(mod, env, { id: '31', tabs: 1 });
    pending.shift().resolve({ code: 1, data: courseRows(31, 4) });
    await tick();
    vm.tabsHandle({ id: 101 });   // 请求 A
    vm.tabsHandle({ id: 102 });   // 请求 B
    const first = pending.shift();
    const second = pending.shift();
    assert('竞态 分组页两发都在飞', !!first && !!second && first.group === 101 && second.group === 102,
      'A=' + (first && first.group) + '，B=' + (second && second.group));
    second.resolve({ code: 1, data: courseRows(102, 4) });
    await tick();
    first.resolve({ code: 1, data: courseRows(101, 4) });
    await tick();
    assert('竞态 分组页迟到的上一组响应不拼进新组列表',
      vm.list.length === 4 && vm.list[0].name.indexOf('102') !== -1,
      'list=' + JSON.stringify(vm.list.map((i) => i.name)));
  }

  {
    // 课程分类：同一分组「上拉翻页 + 下拉刷新」两发叠着，后发先回、前一发迟到——
    // 迟到那一发（page=2）不许把行 append 进刷新后的第一页
    const pending = [];
    const env = makeEnv({
      'course.group.index': (data) => categoryTree(data.id),
      'course.course': (data) => new Promise((resolve) => {
        pending.push({ data: data, resolve: resolve });
      }),
    });
    const mod = loadPage('src/pages/course/category/js.vue', snapshot);
    const vm = openPage(mod, env, { id: '32' });   // 没访问过的 id，不会命中快照
    await tick();   // 分类树回来之后才会发课程那一发
    pending.shift().resolve({ code: 1, data: courseRows(32, 10) });
    await tick();
    assert('竞态 分类页首屏课程已落地', vm.courseList.length === 10, 'list=' + vm.courseList.length);

    vm.courseForm.page = 2;
    vm.loadCourseList(101);     // A：第 2 页（追加）
    vm.reloadCourseList();      // B：回到第 1 页（覆盖）
    const first = pending.shift();
    const second = pending.shift();
    assert('竞态 分类页两发都在飞', !!first && !!second, 'pending=' + pending.length);
    second.resolve({ code: 1, data: courseRows(88, 10) });   // B 先回
    await tick();
    first.resolve({ code: 1, data: courseRows(77, 10) });    // A 迟到
    await tick();
    assert('竞态 分类页迟到的第 2 页不 append 进刷新后的列表',
      vm.courseList.length === 10 && vm.courseList[0].name.indexOf('88') !== -1,
      'list=' + JSON.stringify(vm.courseList.map((i) => i.name)));
  }

  console.log(fail === 0 ? '全部符合预期' : '有 ' + fail + ' 项不符合预期');
  process.exitCode = fail === 0 ? 0 : 1;
})();
