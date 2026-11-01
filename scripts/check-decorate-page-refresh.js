/**
 * 自定义页（含首页）「切页面 / 切 tab 不再重拉，只有首次与下拉刷新才取数」校验 —— 不构建、不开浏览器。
 *
 * 用户 2026-10-28 点名：「自定义页面（特别是首页），每次切换页面或 tabbar 都会触发重新加载，
 * 并且加载速度较慢，调整刷新逻辑：① 页面初始化时 / 下拉刷新时才会加载；② 已加载的页面要保存，
 * 不要在每次切换页面或 tabbar 触发刷新。」
 *
 * 老写法是 `onShow` 里无条件 `getData()`：从子页退回、切 tab 回来、切标签页回来都整页重拉
 * （远端这一发实测 2~7 秒，每次都先挂一次全屏加载页）。而底部导航是自定义的 `tz/tab-bar`，
 * 切 tab 走 `redirectTo` ⇒ 页面实例被销毁，只在 data 上记「已加载」跨不过切页，
 * 所以修改后按页面 id 存一份本会话缓存（`common/utils/decorate-page-cache`）。
 *
 * 把 `pages/index/js.vue` 的 script 原样抽出来（剥掉小程序条件编译分支、换成 CommonJS），
 * 用桩喂 uni / $api / $tools，实跑 onLoad → onShow → 下拉刷新 → 新实例（切 tab）矩阵，断言：
 *   A. 首进这一次取数：一次 getPage、把装修数据落到页面、收起加载页、写 index_id；
 *   B. 数据落地后同一个实例再 onShow（从子页退回 / 切标签页回来）**一条请求都不发**；
 *   C. 下拉刷新是唯一强制出口：再取一次，且收条等这一趟有回音才落；
 *   D. 切 tab 回来是**新实例**（redirectTo 销毁旧实例）：零请求、同步出内容（不闪加载页），
 *      圈子那两段也不重取（缓存里已凑齐）；
 *   E. 换一个自定义页 id（新实例）是缓存未命中：照常取一次；
 *   F. 同一个 id 再进一次：吃缓存，零请求；
 *   G. 首取失败不写缓存、收起加载页，下一次 onShow 仍重试；
 *   H. `pages.json` 的 `pages/index/index` 已开 enablePullDownRefresh（下拉那一下要有收条）；
 *   I. 缓存键归一化：默认首页（空 id）与具体页面 id 互不串格；
 *   J. 登录态变了（登录 / 换号 / 退出 ⇒ 本地 user_token 变化）那份缓存作废、重取一次
 *      ——装修接口里券那几段是带用户维度的（后端 `user_info()` + userCoupons）；
 *   K. **id 变了＝另一个自定义页**：H5 同一路由只换 query 会复用同一个实例（onLoad 不重跑），
 *      onShow 必须按新 id 清页面级状态、滚动回顶部、按新 id 取数/吃缓存，切回已访问过的 id 仍吃缓存；
 *   L. id 解析只取 `id=` 那一段（`?id=3&share=486` ⇒ `3`，不能把 `3&share=486` 整段当 id）。
 * 用法：node tuzi-mobile/scripts/check-decorate-page-refresh.js   （exit 0 = 全部符合预期）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGE = path.join(ROOT, 'src/pages/index/js.vue');
const CACHE = path.join(ROOT, 'src/common/utils/decorate-page-cache.js');
const PAGES_JSON = path.join(ROOT, 'src/pages.json');

const read = (f) => fs.readFileSync(f, 'utf8');

/** 取 js.vue 的 script 段（文件整体就是 `<script>…</script>`） */
function scriptOf(file) {
  const src = read(file);
  const m = src.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return m ? m[1] : src;
}

/**
 * 剥条件编译：小程序分支整段删（Node 里没有 getCurrentPages，且它会与 H5 分支的 `path` 重名），
 * H5 分支只去掉标记、保留内容（`window` 由桩提供）。
 */
function stripConditional(src) {
  return src
    .replace(/\/\/\s*#ifdef\s+MP-[^\n]*\n[\s\S]*?\/\/\s*#endif/g, '')
    .replace(/\/\/\s*#ifdef\s+H5[^\n]*\n/g, '')
    .replace(/^\s*\/\/\s*#endif\s*$/gm, '')
    .replace(/^\s*\/\/\s*#ifndef[^\n]*$/gm, '');
}

/** 缓存模块是 ESM：只把 export 外壳换成 CommonJS（不重写实现，验的就是真代码） */
function loadCacheModule() {
  let src = read(CACHE)
    .replace(/export function /g, 'function ')
    .replace(/export const /g, 'const ');
  src += '\nmodule.exports = { decoratePageKey: decoratePageKey, readDecoratePage: readDecoratePage, writeDecoratePage: writeDecoratePage };\n';
  const mod = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', src)(mod, mod.exports);
  return mod.exports;
}

function loadPageModule(cache) {
  let src = scriptOf(PAGE);
  src = stripConditional(src);
  src = src.replace(
    /^import\s*\{([^}]*)\}\s*from\s*["'][^"']*decorate-page-cache["'];?\s*$/m,
    (all, names) => 'const {' + names + '} = __cache;'
  );
  src = src.replace('export default', 'module.exports =');
  const mod = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', '__cache', src)(mod, mod.exports, cache);
  return mod.exports;
}

/** 一份装修接口回包：id 为空 = 默认首页 */
function pageData(id) {
  return {
    id: id ? Number(id) : 2,
    type: id ? 'other' : 'index',
    default_page: id ? 0 : 1,
    page: { name: id ? '自定义页' + id : '首页', bgColor: 'default' },
    compontents: [{ type: 'circle', config: { source: 'auto', maxShowNum: 6 } }],
  };
}

function makeEnv(opts) {
  const options = opts || {};
  const storage = {};
  const calls = {};
  const titles = [];
  let stops = 0;
  let failNext = false;
  let lastGetPage = null;

  const api = (name, data) => {
    calls[name] = (calls[name] || 0) + 1;
    if (name === 'page.decorate.getPage') {
      if (failNext) {
        failNext = false;
        return Promise.reject(new Error('network down'));
      }
      lastGetPage = data || {};
      const id = data && data.id !== undefined && data.id !== null ? String(data.id) : '';
      return Promise.resolve({ code: 1, msg: 'ok', data: pageData(id) });
    }
    if (name === 'circle.circle.goodsList') {
      return Promise.resolve({ code: 1, data: [{ id: 11, name: '圈子一' }] });
    }
    if (name === 'circle.post.previewList') {
      return Promise.resolve({ code: 1, data: [{ id: 21 }] });
    }
    return Promise.resolve({ code: 1, data: {} });
  };

  const scrolls = [];
  const uni = {
    getStorageSync: (k) => storage[k],
    setStorageSync: (k, v) => { storage[k] = v; },
    stopPullDownRefresh: () => { stops++; },
    setNavigationBarTitle: (o) => { titles.push(o && o.title); },
    pageScrollTo: (o) => { scrolls.push(o || {}); },
    navigateTo: () => {},
  };

  return {
    storage, calls, titles, api, uni,
    win: { location: { hash: options.hash || '#/pages/index/index' } },
    stops: () => stops,
    scrolls: () => scrolls,
    lastGetPagePayload: () => lastGetPage,
    breakOnce: () => { failNext = true; },
  };
}

function makeVm(mod, env) {
  const vm = Object.assign({}, mod.data(), {
    $api: env.api,
    $nav: { parsePageParams: (p) => p || {}, share: () => {}, to: () => {} },
    // 圈子插件算作已安装（验证「缓存凑齐后不再重取」这一条要走得到圈子那两段）
    $tools: { systemConfig: (k) => (k === 'app_isinstall_circle' ? '1' : '0') },
    $refs: {},
  });
  Object.keys(mod.methods).forEach((k) => { vm[k] = mod.methods[k].bind(vm); });
  return vm;
}

/** 直接对某个实例调 onShow 之前，先把全局的 uni / window 指向它那个环境 */
function bindEnv(env) {
  global.uni = env.uni;
  global.window = env.win;
}

/** 新开一个页面实例（H5 切 tab＝redirectTo 旧实例销毁、新实例 onLoad → onShow） */
function openPage(mod, env) {
  global.uni = env.uni;
  global.window = env.win;
  const vm = makeVm(mod, env);
  mod.onLoad.call(vm, {});
  mod.onShow.call(vm);
  return vm;
}

const tick = () => new Promise((r) => setTimeout(r, 20));
const getPageCalls = (env) => env.calls['page.decorate.getPage'] || 0;

let fail = 0;
const assert = (name, ok, got) => {
  if (!ok) fail++;
  console.log((ok ? '[PASS] ' : '[FAIL] ') + name + (got === undefined ? '' : ' -> ' + got));
};

(async () => {
  const cache = loadCacheModule();
  const mod = loadPageModule(cache);

  // A：首进一次取数
  const env = makeEnv();
  const vm = openPage(mod, env);
  assert('A 首进先挂着加载页（首取还没回来）', vm.loading === true, 'loading=' + vm.loading);
  await tick();
  assert('A 首进取一次 page/decorate/getPage', getPageCalls(env) === 1, 'calls=' + getPageCalls(env));
  assert('A 装修数据落到页面、加载页收起、页名写进导航栏',
    vm.data && vm.data.page && vm.data.page.name === '首页' && vm.loading === false && env.titles.indexOf('首页') !== -1,
    'name=' + (vm.data.page && vm.data.page.name) + '，loading=' + vm.loading);
  assert('A 默认首页把 page_decorate id 写进本地 index_id（底部导航判归属要用）',
    String(env.storage.index_id) === '2', 'index_id=' + env.storage.index_id);
  assert('A 圈子那两段只取一次（装修接口不下发）',
    (env.calls['circle.circle.goodsList'] || 0) === 1 && vm.circleList.length === 1,
    'circleCalls=' + (env.calls['circle.circle.goodsList'] || 0));

  // B：同一实例再 onShow（从子页退回 / 切标签页回来）
  mod.onShow.call(vm);
  await tick();
  mod.onShow.call(vm);
  await tick();
  assert('B 落地后同一实例再 onShow 零请求（从子页退回 / 切标签页）',
    getPageCalls(env) === 1, 'calls=' + getPageCalls(env));

  // C：下拉刷新是唯一强制出口
  const stopsBefore = env.stops();
  mod.onPullDownRefresh.call(vm);
  const stopsSync = env.stops();
  await tick();
  assert('C 下拉刷新强制重取一次', getPageCalls(env) === 2, 'calls=' + getPageCalls(env));
  assert('C 收条等这一趟有回音才收（不在触发那一刻收）',
    stopsSync === stopsBefore && env.stops() === stopsBefore + 1,
    '触发后=' + stopsSync + '，回音后=' + env.stops());

  // D：切 tab 回来＝新实例（旧实例被 redirectTo 销毁）
  const envTab = env;
  const circleBeforeTab = envTab.calls['circle.circle.goodsList'] || 0;
  const vmTab = openPage(mod, envTab);
  assert('D 新实例（切 tab 回来）同步出内容：不挂加载页', vmTab.loading === false, 'loading=' + vmTab.loading);
  assert('D 新实例吃缓存，零请求', getPageCalls(envTab) === 2, 'calls=' + getPageCalls(envTab));
  assert('D 新实例页面内容就是上一次那一份',
    vmTab.data.page.name === '首页' && vmTab.circleList.length === 1,
    'name=' + vmTab.data.page.name);
  assert('D 缓存复原也要判插件安装态（否则圈子那两段被模板闸门挡掉）',
    vmTab.circleInstalled === true, 'circleInstalled=' + vmTab.circleInstalled);
  await tick();
  assert('D 缓存已凑齐时不再重取圈子那两段（切 tab 回来零请求）',
    (envTab.calls['circle.circle.goodsList'] || 0) === circleBeforeTab,
    'circleCalls=' + (envTab.calls['circle.circle.goodsList'] || 0) + '，切 tab 前=' + circleBeforeTab);

  // E：换一个自定义页 id＝缓存未命中，照常取一次
  envTab.win.location.hash = '#/pages/index/index?id=3';
  const vmOther = openPage(mod, envTab);
  await tick();
  assert('E 换自定义页 id 取一次（缓存未命中）', getPageCalls(envTab) === 3, 'calls=' + getPageCalls(envTab));
  assert('E 换成 id=3 那一页的内容', vmOther.data.page.name === '自定义页3', 'name=' + vmOther.data.page.name);

  // F：同一个 id 再进一次＝吃缓存
  const vmOtherAgain = openPage(mod, envTab);
  await tick();
  assert('F 同一个自定义页 id 再进零请求', getPageCalls(envTab) === 3, 'calls=' + getPageCalls(envTab));
  assert('F 内容是 id=3 那一份（不与默认首页串格）',
    vmOtherAgain.data.page.name === '自定义页3', 'name=' + vmOtherAgain.data.page.name);

  // G：首取失败不写缓存，下一次 onShow 重试
  const envFail = makeEnv({ hash: '#/pages/index/index?id=8' });
  envFail.breakOnce();
  const vmFail = openPage(mod, envFail);
  await tick();
  assert('G 首取失败收起加载页（不卡在空屏）', vmFail.loading === false, 'loading=' + vmFail.loading);
  assert('G 首取失败不写缓存（同 id 新实例仍要重试）',
    cache.readDecoratePage(8) === null, 'cache=' + JSON.stringify(cache.readDecoratePage(8)));
  const vmRetry = openPage(mod, envFail);
  await tick();
  assert('G 下一次进页（新实例）照样重试取数', getPageCalls(envFail) === 2, 'calls=' + getPageCalls(envFail));
  assert('G 重试成功后落到页面', vmRetry.data.page.name === '自定义页8', 'name=' + vmRetry.data.page.name);

  // I：缓存键归一化（默认首页 vs 具体 id 互不串格）
  const keyDefault = cache.decoratePageKey('');
  const keyZero = cache.decoratePageKey(0);
  const keyStringZero = cache.decoratePageKey('0');
  assert('I 空 id 归一成默认页，且 0 / "0" 自成一格',
    keyDefault === 'default' && keyZero !== keyDefault && keyStringZero === keyZero,
    'default=' + keyDefault + '，0=' + keyZero + '，"0"=' + keyStringZero);

  // J：登录态变了（券那几段带用户维度）
  // J1 同一实例（从登录页退回）：不能因为「还是同一页」就跳过重取
  const callsBeforeToken = getPageCalls(envTab);
  envTab.storage.user_token = 'TOKEN_B';
  bindEnv(envTab);
  mod.onShow.call(vmOtherAgain);
  await tick();
  assert('J 同一实例身份变了也重取（不能因为「还是同一页」就跳过）',
    getPageCalls(envTab) === callsBeforeToken + 1,
    'calls=' + getPageCalls(envTab));
  assert('J 重取后那枚页面已落地', vmOtherAgain.data.page.name === '自定义页3', 'name=' + vmOtherAgain.data.page.name);
  assert('J 缓存里记的是新身份那枚 token',
    (cache.readDecoratePage(3) || {}).token === 'TOKEN_B',
    'token=' + (cache.readDecoratePage(3) || {}).token);

  // J2 新身份已经有缓存（上面刚写）：再切 tab 回来零请求
  const vmToken = openPage(mod, envTab);
  await tick();
  assert('J2 新身份已有缓存：再切 tab 回来零请求',
    getPageCalls(envTab) === callsBeforeToken + 1 && vmToken.data.page.name === '自定义页3',
    'calls=' + getPageCalls(envTab));

  // J3 再换一个没缓存过的身份：新实例必须重取，不许复用上一个人的
  envTab.storage.user_token = 'TOKEN_C';
  const vmTokenC = openPage(mod, envTab);
  await tick();
  assert('J3 换到没缓存过的身份：必须重取（不许复用上一个人的页面）',
    getPageCalls(envTab) === callsBeforeToken + 2,
    'calls=' + getPageCalls(envTab));
  assert('J3 页面仍是同一页，但缓存已换成新身份', vmTokenC.data.page.name === '自定义页3', 'name=' + vmTokenC.data.page.name);

  // K：同一个实例换 id（H5 同一路由只换 query 会复用实例，onLoad 不重跑）＝另一个自定义页
  envTab.win.location.hash = '#/pages/index/index?id=4';
  const callsBeforeIdChange = getPageCalls(envTab);
  const scrollsBeforeIdChange = envTab.scrolls().length;
  bindEnv(envTab);
  mod.onShow.call(vmOtherAgain);
  await tick();
  assert('K 同一实例换 id 后取一次（另一个页面＝缓存未命中）',
    getPageCalls(envTab) === callsBeforeIdChange + 1,
    'calls=' + getPageCalls(envTab));
  assert('K 页面内容换成新 id 那一份', vmOtherAgain.data.page.name === '自定义页4', 'name=' + vmOtherAgain.data.page.name);
  assert('K 换 id 时滚动回顶部（新页从第一屏看起）',
    envTab.scrolls().length > scrollsBeforeIdChange
      && envTab.scrolls()[envTab.scrolls().length - 1].scrollTop === 0,
    'scrolls=' + JSON.stringify(envTab.scrolls()));
  envTab.win.location.hash = '#/pages/index/index?id=3';
  // 身份保持 TOKEN_C（J3 那一轮刚把 id=3 的缓存写成这个身份），验的是「吃缓存」本身
  mod.onShow.call(vmOtherAgain);
  await tick();
  assert('K 切回已访问过的 id 吃缓存（零请求）',
    getPageCalls(envTab) === callsBeforeIdChange + 1 && vmOtherAgain.data.page.name === '自定义页3',
    'calls=' + getPageCalls(envTab) + '，name=' + vmOtherAgain.data.page.name);

  // L：id 解析只取 id 本身（后面跟 share 等参数时不能整段当 id）
  envTab.win.location.hash = '#/pages/index/index?id=5&share=486';
  const vmTrailing = openPage(mod, envTab);
  await tick();
  assert('L `?id=5&share=486` 只把 5 当 id 发给接口',
    String((envTab.lastGetPagePayload() || {}).id) === '5',
    'id=' + JSON.stringify((envTab.lastGetPagePayload() || {}).id));
  assert('L 落到 id=5 那一页', vmTrailing.data.page.name === '自定义页5', 'name=' + vmTrailing.data.page.name);
  envTab.win.location.hash = '#/pages/index/index?share=486&id=6';
  const vmLeading = openPage(mod, envTab);
  await tick();
  assert('L `?share=486&id=6` 同样只取 6',
    String((envTab.lastGetPagePayload() || {}).id) === '6' && vmLeading.data.page.name === '自定义页6',
    'id=' + JSON.stringify((envTab.lastGetPagePayload() || {}).id));

  // H：下拉刷新那条路由开关
  const pagesJson = read(PAGES_JSON);
  const route = pagesJson.match(/"path":\s*"pages\/index\/index"[\s\S]{0,300}?"enablePullDownRefresh":\s*true/);
  assert('H pages.json：pages/index/index 已开 enablePullDownRefresh', route !== null, route ? '已开' : '未开');

  console.log(fail === 0 ? '全部符合预期' : '有 ' + fail + ' 项不符合预期');
  process.exitCode = fail === 0 ? 0 : 1;
})();
