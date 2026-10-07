// 打卡提交成功后的收尾链路校验（不构建、不开浏览器）：
// 把 submit/js.vue、detail/js.vue 与 diary/js.vue 的 script 原样抽出来，用桩喂 uni / getCurrentPages / $api，
// 断言三件事：
//   A. 提交页成功后：关本页 → 回活动主页停在动态栏，并把「要打开的日记 id」交给主页（写在 vm 上 / 走 ?open_record=），
//      **不在 navigateBack / redirectTo 的 success 里再跳**——H5 端这两个 API 的 success 是同步立即回调的，
//      history 遍历还没执行，在 success 里 navigateTo 会和未落定的跳转互踩（实测：提交后停在打卡列表，没进动态详情）；
//   B. 活动主页收到这个 id 后，在 onShow（退栈/替换已落定）里才 push 日记详情，带 daily=1；没有 id 就不开；
//   C. 日记详情页只有把日记数据取到手才自动弹日签图（取不到不弹空海报），且日签图仅本人可见
//      （别人的动态带着 daily=1 进来不弹，「更多」菜单也随之为空、右上角入口不出）。
// 用法：node tuzi-mobile/scripts/check-daily-close-back.js   （exit 0 = 全部符合预期）
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../src/pages/app/checkin');
const SRC = path.resolve(__dirname, '../src');
const DIARY = '/pages/app/checkin/diary/diary?id=9001&checkin_id=628&daily=1';
const DETAIL_URL = '/pages/app/checkin/detail/detail?id=628&tab=feed';
const DETAIL_OPEN_URL = DETAIL_URL + '&open_record=9001';
const DETAIL_OPEN_URL_EMPTY = DETAIL_URL + '&open_record=0';
const SUBMIT_PAGE = { route: 'pages/app/checkin/submit/submit' };

function loadOptions(file, stub) {
  let src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  src = src.replace(/^[\s\S]*?<script>/, '').replace(/<\/script>[\s\S]*$/, '').replace('export default', 'module.exports =');
  // 具名/默认 import 换成同名空实现桩：new Function 不吃 ESM 语法，而被桩化的辅助函数在本链路里只是打标签/设分享
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']*["'];?\s*$/gm, (m, names) =>
    'const ' + names.split(',').map((n) => n.trim()).filter(Boolean).map((n) => n + ' = () => ({})').join(', ') + ';');
  src = src.replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, 'const $1 = () => ({});');
  const m = { exports: {} };
  new Function('module', 'exports', 'uni', 'getCurrentPages', src)(m, m.exports, stub.uni, stub.getCurrentPages);
  return m.exports;
}

// 活动主页：id 传 999 就是「栈里压着的是别的活动的详情页」；showFeedTab 记进当次日志，
// pendingDiaryId 用 setter 记录（提交页写进来的「要打开的那条日记」）
const detailPage = (log, id) => {
  const vm = { id: id, showFeedTab: () => log.push('showFeedTab'), getData: () => log.push('getData') };
  Object.defineProperty(vm, 'pendingDiaryId', {
    get: () => vm._pendingDiaryId,
    set: (v) => { vm._pendingDiaryId = v; log.push('pendingDiaryId=' + v); },
  });
  return { route: 'pages/app/checkin/detail/detail', $vm: vm };
};

// 任务详情页：taskId 传 999 就是「栈里压着的是别条任务的详情页」；它没有页签，只有 pendingDiaryId
const taskPage = (log, taskId) => {
  const vm = { taskId: taskId, getData: () => log.push('getData') };
  Object.defineProperty(vm, 'pendingDiaryId', {
    get: () => vm._pendingDiaryId,
    set: (v) => { vm._pendingDiaryId = v; log.push('pendingDiaryId=' + v); },
  });
  return { route: 'pages/app/checkin/taskdetail/taskdetail', $vm: vm };
};

// A：跑提交页的收尾。apiData 是 submit 接口返回的 data（record_id 从这儿来），
// query 是本页 URL 参数（从任务详情页进来时才有 task_id）
function submitChain(stackBuilder, apiData, query) {
  const log = [];
  const stub = {
    uni: {
      showToast: (o) => log.push('toast:' + o.title),
      // H5 真实行为：这两个 API 的平台层直接返回 errMsg，success 是同步立即回调的（后退/替换的
      // 历史遍历还没执行）。这里如实模拟——不主动触发 success，只断言调用参数里不该再带 success
      navigateBack: (o) => log.push('navigateBack:delta=' + (o && o.delta) + (o && o.success ? '+success' : '')),
      redirectTo: (o) => log.push('redirectTo:' + o.url + (o && o.success ? '+success' : '')),
      navigateTo: (o) => log.push('navigateTo:' + o.url),
      getStorageSync: () => ({}),
    },
    getCurrentPages: () => stackBuilder(log),
  };
  const opts = loadOptions('submit/js.vue', stub);
  const vm = Object.assign({}, opts.data(), {
    id: 628,
    content: '今天完成了打卡',
    $tools: { systemConfig: () => true },
    $api: () => Promise.resolve({ code: 1, data: apiData }),
  });
  Object.keys(opts.methods).forEach((k) => { vm[k] = opts.methods[k].bind(vm); });
  opts.onLoad.call(vm, Object.assign({ id: '628' }, query || {}));
  // 真实次序是「接口回来 → 存 record_id → 收尾」，所以连点两次提交由两次 doSubmit 模拟，
  // 收尾链必须只走一次（finished 收口），否则多退一层、多开一层详情
  vm.doSubmit();
  vm.doSubmit();
  return new Promise((resolve) => setTimeout(() => resolve({ log: log, vm: vm }), 0));
}

const cases = [
  ['① 主页→提交页：退 1 层 + 把日记 id 交给主页（不再自己开详情）', (log) => [detailPage(log, 628), SUBMIT_PAGE], { record_id: 9001, total_days: 3 },
    ['showFeedTab', 'pendingDiaryId=9001', 'navigateBack:delta=1']],
  ['② 主页→任务日历→提交页：要退两层，不把日历页留在栈里', (log) => [detailPage(log, 628), { route: 'pages/app/checkin/taskcalendar/taskcalendar' }, SUBMIT_PAGE], { record_id: 9001 },
    ['showFeedTab', 'pendingDiaryId=9001', 'navigateBack:delta=2']],
  ['③ 深链直达提交页（栈里没有本活动主页）：换页时用 ?open_record= 带上日记 id', () => [SUBMIT_PAGE], { record_id: 9001 },
    ['redirectTo:' + DETAIL_OPEN_URL]],
  ['④ 栈里那层主页是别的活动（id 不符）', (log) => [detailPage(log, 999), SUBMIT_PAGE], { record_id: 9001 },
    ['redirectTo:' + DETAIL_OPEN_URL]],
  ['⑤ 后端没回 record_id：只回列表，不带要开的日记', (log) => [detailPage(log, 628), SUBMIT_PAGE], { total_days: 3 },
    ['showFeedTab', 'pendingDiaryId=0', 'navigateBack:delta=1']],
  ['⑥ H5 端 route 只挂在 $page 上', (log) => [{
    $page: { route: '/pages/app/checkin/detail/detail' },
    $vm: (() => {
      const vm = { id: 628, showFeedTab: () => log.push('showFeedTab') };
      Object.defineProperty(vm, 'pendingDiaryId', {
        get: () => vm._pendingDiaryId,
        set: (v) => { vm._pendingDiaryId = v; log.push('pendingDiaryId=' + v); },
      });
      return vm;
    })(),
  }, SUBMIT_PAGE], { record_id: 9001 },
    ['showFeedTab', 'pendingDiaryId=9001', 'navigateBack:delta=1']],
  // 承接页从近到远找：从任务详情页点「立即打卡」的人，退回的必须是任务详情页，
  // 否则从日记按返回落到活动主页，那条任务就回不去了（2026-09-25 用户点名）
  ['⑦ 主页→任务详情页→提交页：退 1 层回任务详情页，不是一路退到活动主页', (log) => [detailPage(log, 628), taskPage(log, 55), SUBMIT_PAGE], { record_id: 9001 },
    ['pendingDiaryId=9001', 'navigateBack:delta=1'], { task_id: '55' }],
  ['⑧ 栈里那层任务详情页是别条任务（task_id 不符）：跳过它，退到活动主页', (log) => [detailPage(log, 628), taskPage(log, 999), SUBMIT_PAGE], { record_id: 9001 },
    ['showFeedTab', 'pendingDiaryId=9001', 'navigateBack:delta=2'], { task_id: '55' }],
];

// B：活动主页收到 id 后，在 onShow 里开日记详情；没有 id 就什么都不做
function detailOpen(loadOptions_, hasPending) {
  const log = [];
  const stub = {
    uni: {
      showToast: (o) => log.push('toast:' + o.title),
      navigateBack: (o) => log.push('navigateBack:delta=' + (o && o.delta)),
      navigateTo: (o) => log.push('navigateTo:' + o.url),
      getStorageSync: () => ({}),
    },
    getCurrentPages: () => [{ route: 'pages/app/checkin/detail/detail' }],
  };
  const opts = loadOptions('detail/js.vue', stub);
  const vm = Object.assign({}, opts.data(), {
    $tools: { systemConfig: () => true },
    $api: (name) => {
      if (name === 'checkin.checkin.detail') return Promise.resolve({ code: 1, data: { id: 628, title: '自律行动营', tasks: [] } });
      return Promise.resolve({ code: 1, data: { rows: [], total: 0 } });
    },
  });
  Object.keys(opts.methods).forEach((k) => { vm[k] = opts.methods[k].bind(vm); });
  // 退栈这一支：提交页把 id 写在本实例上；深链这一支：换成 onLoad 的 ?open_record=
  if (hasPending === 'url') opts.onLoad.call(vm, { id: '628', tab: 'feed', open_record: '9001' });
  else {
    opts.onLoad.call(vm, { id: '628', tab: 'feed' });
    if (hasPending) vm.pendingDiaryId = 9001;
  }
  opts.onShow.call(vm);
  return new Promise((resolve) => setTimeout(() => resolve({ log: log, vm: vm }), 10));
}

// C：日记详情页带 daily=1 进来，日签图只在日记数据到位后自动弹
function diaryAuto(detailData) {
  const log = [];
  const stub = {
    uni: { showToast: () => log.push('toast'), navigateBack: () => {}, getStorageSync: () => ({}) },
    getCurrentPages: () => [{ route: 'pages/app/checkin/diary/diary' }],
  };
  const opts = loadOptions('diary/js.vue', stub);
  const vm = Object.assign({}, opts.data(), {
    $tools: { systemConfig: () => true },
    $api: (name) => {
      if (name === 'checkin.checkin.diaryDetail') {
        return Promise.resolve(detailData ? { code: 1, data: detailData } : { code: 0, msg: '日记不存在' });
      }
      return Promise.resolve({ code: 1, data: { rows: [] } });
    },
  });
  Object.keys(opts.methods).forEach((k) => { vm[k] = opts.methods[k].bind(vm); });
  opts.onLoad.call(vm, { id: '9001', checkin_id: '628', daily: '1' });
  return new Promise((resolve) => setTimeout(() => resolve(vm), 10));
}

let fail = 0;
const assert = (name, ok, got) => {
  if (!ok) fail++;
  console.log((ok ? '[PASS] ' : '[FAIL] ') + name + ' -> ' + got);
};

(async () => {
  for (const c of cases) {
    const r = await submitChain(c[1], c[2], c[4]);
    const got = JSON.stringify(r.log);
    assert(c[0], got === JSON.stringify(c[3]), got + (got === JSON.stringify(c[3]) ? '' : '  期望 ' + JSON.stringify(c[3])));
    if (c[2].record_id) assert('   └ 提交页不再自己弹日签图（本页无 dailyShow 字段）', r.vm.dailyShow === undefined, 'dailyShow=' + r.vm.dailyShow);
  }

  const backOpen = await detailOpen(null, true);
  assert('⑦ 主页收到 pendingDiaryId（退栈支）→ onShow 里开日记详情（带 daily=1）',
    JSON.stringify(backOpen.log) === JSON.stringify(['navigateTo:' + DIARY]) && backOpen.vm.tabIndex === 1,
    JSON.stringify(backOpen.log) + ' tabIndex=' + backOpen.vm.tabIndex);
  const urlOpen = await detailOpen(null, 'url');
  assert('⑧ 主页带 ?open_record=（深链支）→ 同样打开日记详情', JSON.stringify(urlOpen.log) === JSON.stringify(['navigateTo:' + DIARY]),
    JSON.stringify(urlOpen.log));
  const idleOpen = await detailOpen(null, false);
  assert('⑨ 普通进入活动主页（没有待开日记）→ 不弹详情', JSON.stringify(idleOpen.log) === JSON.stringify([]), JSON.stringify(idleOpen.log));
  const zeroOpen = await detailOpen(null, false);
  zeroOpen.vm.openRecordId = 0;
  zeroOpen.vm.openPendingDiary();
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert('⑩ record_id=0（老后端）→ 只切动态栏、不开 ?id=undefined 的详情',
    JSON.stringify(zeroOpen.log) === JSON.stringify([]), JSON.stringify(zeroOpen.log));

  const okDetail = await diaryAuto({ id: 9001, is_mine: 1, nickname: '凸知', checkin_title: '自律行动营', total_days: 3 });
  assert('⑪ 详情页日记取到 → 自动弹日签图', okDetail.dailyShow === true && okDetail.autoDaily === false, 'dailyShow=' + okDetail.dailyShow + ' title=' + okDetail.checkinTitle);
  const badDetail = await diaryAuto(null);
  assert('⑫ 详情页日记取不到 → 不弹空海报', badDetail.dailyShow === false, 'dailyShow=' + badDetail.dailyShow);
  // 日签图是「本人这一条打卡记录」的海报（2026-09-26 用户口径：仅自己可见）：别人的动态带着 daily=1 进来也不弹
  const otherDetail = await diaryAuto({ id: 9002, is_mine: 0, nickname: '别人', checkin_title: '自律行动营', total_days: 3 });
  assert('⑬ daily=1 落在别人的动态上 → 不弹日签图', otherDetail.dailyShow === false && otherDetail.autoDaily === true,
    'dailyShow=' + otherDetail.dailyShow + ' autoDaily=' + otherDetail.autoDaily);

  // 「更多」菜单三项全是本人动作：菜单为空时右上角入口也不出（组件按 post.is_mine 判，本页只给 show-more）。
  // 页 script 的 computed 在本脚本的桩 vm 上不自动求值，故显式 call 一个只读 detail 的 computed
  const menuVm = (detail) => Object.assign({}, opts0.data(), { detail: detail });
  const menuNames = (vm) => (opts0.computed.moreActions.call(vm) || []).map((a) => a.name).join('/');
  const opts0 = loadOptions('diary/js.vue', {
    uni: { showToast: () => {}, navigateBack: () => {}, getStorageSync: () => ({}) },
    getCurrentPages: () => [{ route: 'pages/app/checkin/diary/diary' }],
  });
  const own = menuVm({ id: 9001, is_mine: 1 });
  const visit = menuVm({ id: 9002, is_mine: 0 });
  const official = menuVm({ id: 9003, is_official: 1, is_mine: 0 });
  assert('⑭ 本人动态的更多菜单 = 日签图/编辑/删除', menuNames(own) === '日签图/编辑/删除', menuNames(own));
  assert('⑮ 别人的动态与官方动态 → 菜单为空（入口随之不出）', menuNames(visit) === '' && menuNames(official) === '',
    'visit=' + menuNames(visit) + ' official=' + menuNames(official));
  const headSrc = fs.readFileSync(path.join(SRC, 'components/tz/circle-post-head.vue'), 'utf8');
  assert('⑯ 更多入口的判据只有一条 is_mine（moreForAll prop 已下线）',
    !/moreForAll\s*:/.test(headSrc) && /v-if="showMore && post\.is_mine"/.test(headSrc),
    'circle-post-head 的入口判据');

  console.log(fail === 0 ? '全部符合预期（' + (cases.length * 2 + 11) + ' 项断言）' : '有 ' + fail + ' 项不符合预期');
  process.exitCode = fail === 0 ? 0 : 1;
})();
