// 打卡「改完日记退回来数据要跟上」校验（不构建、不开浏览器）：
// 把 diary/js.vue、record/js.vue、submit/js.vue 的 script 原样抽出来，用桩喂 uni / $api，断言三件事：
//   A. 回到的那一页自己在 onShow 里重取：首进（onLoad 的取数还在路上，loading=true）不重复取，
//      数据到手后再走一次 onShow（= 从提交页改完退回 / 切回前台）必须重取；
//   B. 打卡记录页重取时连带重拉「当前所选日期」那天的日记（保留所选日期，不跳回今天）；
//   C. 提交页不再跨页替上级页取数：原先挂在 onUnload 里的 `getCurrentPages()[length-2].$vm.getData()`
//      在 H5 端够错页（onUnload 由 router.afterEach 触发，那一刻 getCurrentPages 已把本页摘掉，
//      见 uni-h5 create-app.js「删除已经准备销毁的上个页面」），length-2 取到的是目标页再下面的一层，
//      于是「修改完成后自动跳转该页面，但数据没有自动刷新」（2026-09-25 用户点名）。
// 用法：node tuzi-mobile/scripts/check-diary-refresh.js   （exit 0 = 全部符合预期）
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../src/pages/app/checkin');

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

const UNI_STUB = {
  showToast: () => {},
  navigateBack: () => {},
  navigateTo: () => {},
  redirectTo: () => {},
  stopPullDownRefresh: () => {},
  setNavigationBarTitle: () => {},
  getStorageSync: () => ({}),
  getSystemInfoSync: () => ({}, {}),
};

// 按接口名计数的 $api 桩：命中即回一份能过页面判据的最小数据
const counter = () => {
  const calls = {};
  const api = (name) => {
    calls[name] = (calls[name] || 0) + 1;
    const data = {
      'checkin.checkin.diaryDetail': { id: 9001, checkin_id: 628, nickname: '凸知', checkin_title: '自律行动营', content: '改后的正文', day_seq: 3 },
      'checkin.checkin.commentList': { rows: [] },
      'checkin.checkin.calendar': { title: '自律行动营', stats: {}, days: {}, joined_days: 3 },
      'checkin.checkin.dayDetail': { records: [] },
      'checkin.checkin.detail': { id: 628, title: '自律行动营', tasks: [] },
      'checkin.checkin.taskDetail': { id: 7, checkin_id: 628, title: '晨读', tasks: [] },
      'checkin.checkin.feed': { rows: [], total: 0 },
    };
    return Promise.resolve({ code: 1, msg: 'ok', data: data[name] || {} });
  };
  return { calls, api };
};

// 把 methods 挂到 vm 上并绑好 this（页面里靠模块级 that，onLoad 会把它指向这个 vm）
function makeVm(opts, extra) {
  const vm = Object.assign({}, opts.data(), { $tools: { systemConfig: () => true, cachedUser: () => ({ nickname: '凸知', avatar: '' }) } }, extra);
  Object.keys(opts.methods).forEach((k) => { vm[k] = opts.methods[k].bind(vm); });
  return vm;
}

const tick = () => new Promise((r) => setTimeout(r, 10));

let fail = 0;
const assert = (name, ok, got) => {
  if (!ok) fail++;
  console.log((ok ? '[PASS] ' : '[FAIL] ') + name + ' -> ' + got);
};

// 一条链：进页面 → 首进 onShow（不该重复取）→ 数据落地 → 改完退回的 onShow（必须重取）
async function refreshChain(file, loadParams, apiName, extraCheck) {
  const c = counter();
  const opts = loadOptions(file, { uni: UNI_STUB, getCurrentPages: () => [{ route: 'x' }] });
  const vm = makeVm(opts, { $api: c.api });
  opts.onLoad.call(vm, loadParams);
  const afterLoad = c.calls[apiName] || 0;
  opts.onShow.call(vm);
  const afterFirstShow = c.calls[apiName] || 0;
  await tick();
  opts.onShow.call(vm);
  await tick();
  const afterBackShow = c.calls[apiName] || 0;
  assert(file + '：onLoad 取过一次 ' + apiName, afterLoad === 1, 'calls=' + afterLoad);
  assert(file + '：首进紧跟着的 onShow 不重复取（loading 还在 true）', afterFirstShow === afterLoad, 'calls=' + afterFirstShow);
  assert(file + '：数据落地后再走 onShow（从提交页改完退回）重取 ' + apiName, afterBackShow > afterLoad, 'calls=' + afterBackShow);
  if (extraCheck) extraCheck(vm, c);
}

(async () => {
  await refreshChain('diary/js.vue', { id: '9001', checkin_id: '628' }, 'checkin.checkin.diaryDetail');
  await refreshChain('record/js.vue', { id: '628' }, 'checkin.checkin.calendar', (vm, c) => {
    // 重取日历要连带重拉当前所选那天的日记：首进 1 次 + 退回重取 1 次
    assert('   └ 记录页 onShow 一并重拉所选日期的日记（保留 selectedDay=' + vm.selectedDay + '）',
      (c.calls['checkin.checkin.dayDetail'] || 0) === 2, 'calls=' + (c.calls['checkin.checkin.dayDetail'] || 0));
  });
  // 动态栏所在的两页本来就有 onShow（本轮没动它们，钉住别被改回去）
  for (const [file, apiName] of [['detail/js.vue', 'checkin.checkin.detail'], ['taskdetail/js.vue', 'checkin.checkin.taskDetail']]) {
    const opts = loadOptions(file, { uni: UNI_STUB, getCurrentPages: () => [{ route: 'x' }] });
    assert(file + '：保留了 onShow（' + apiName + ' 由它重取）', typeof opts.onShow === 'function', typeof opts.onShow);
  }

  const submit = loadOptions('submit/js.vue', { uni: UNI_STUB, getCurrentPages: () => [{ route: 'x' }] });
  assert('提交页不再挂 onUnload 跨页替上级取数（H5 端够错页）', submit.onUnload === undefined, 'onUnload=' + typeof submit.onUnload);

  console.log(fail === 0 ? '全部符合预期' : '有 ' + fail + ' 项不符合预期');
  process.exitCode = fail === 0 ? 0 : 1;
})();
