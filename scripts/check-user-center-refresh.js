// 个人中心「不再每次 onShow 都重取 + 登录成功取一次 + 下拉刷新」校验（不构建、不开浏览器）：
// 把 pages/user/index/js.vue 的 script 原样抽出来，用桩喂 uni / $api / $tools，断言五件事：
//   A. 首进这一屏取一次 user/info（骨架屏那一次不能少）；
//   B. 数据落地后再走 onShow（从子页退回、页签来回切）**不再**发请求——这是 2026-10-05
//      用户点名改掉的：「也不用每次切换我的页面都要触发刷新」；
//   C. 身份变了（登录成功 / 换号 / 退出后重登，判据＝本地 user_token 与上一次取数时那枚不同）
//      再走 onShow 必须重取，否则登录后还摆着游客那一屏；
//   D. 下拉刷新（onPullDownRefresh）取一次，且转圈要等这一趟有回音才收
//      （uni.stopPullDownRefresh 落在 user/info 的 resolve/reject 之后，不在触发那一刻）；
//   E. 首屏那一趟取失败不记「已取过」，下一次 onShow 照样重试，不会卡在空骨架上；
//   F. **切 tab 回来是新实例**（底部导航走 redirectTo，实例已销毁）：按会话快照复原，
//      零请求、内容照旧，装修配置也不再取——这就是 2026-10-28 用户点名的「已加载的页面要保存」；
//   G. 换号后新实例**不许**复原上一个人的快照（余额/券/奖品都带用户），必须重取。
// 另外钉住 pages.json：用户中心这一路由必须开 enablePullDownRefresh，否则下拉那一下没有收条。
// 用法：node tuzi-mobile/scripts/check-user-center-refresh.js   （exit 0 = 全部符合预期）
const fs = require('fs');
const path = require('path');

const PAGE = path.resolve(__dirname, '../src/pages/user/index/js.vue');
const PAGES_JSON = path.resolve(__dirname, '../src/pages.json');
const SNAPSHOT = path.resolve(__dirname, '../src/common/utils/page-snapshot.js');

/** 快照工具用真件（只把 export 外壳换成 CommonJS）：要验的就是它存/取与身份分档 */
function loadSnapshotModule() {
  let src = fs.readFileSync(SNAPSHOT, 'utf8').replace(/export function /g, 'function ');
  src += '\nmodule.exports = { readPageSnapshot: readPageSnapshot, writePageSnapshot: writePageSnapshot };\n';
  const m = { exports: {} };
  new Function('module', 'exports', src)(m, m.exports);
  return m.exports;
}

function loadOptions(stub) {
  let src = fs.readFileSync(PAGE, 'utf8');
  src = src.replace(/^[\s\S]*?<script>/, '').replace(/<\/script>[\s\S]*$/, '').replace('export default', 'module.exports =');
  // 快照工具先用真件接上，再走下面的空实现桩
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']*page-snapshot["'];?\s*$/gm,
    (m, names) => 'const {' + names + '} = __snapshot;');
  // 具名/默认 import 换成同名空实现桩：new Function 不吃 ESM 语法，而被桩化的辅助函数在本链路里只是装配装修配置
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']*["'];?\s*$/gm, (m, names) =>
    'const ' + names.split(',').map((n) => n.trim()).filter(Boolean).map((n) => n + ' = () => ({})').join(', ') + ';');
  src = src.replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, 'const $1 = () => ({});');
  const m = { exports: {} };
  new Function('module', 'exports', 'uni', '__snapshot', src)(m, m.exports, stub.uni, stub.snapshot);
  return m.exports;
}

// 记账用的 uni / $api 桩
function makeEnv(bootToken) {
  const storage = { user_token: bootToken };
  const calls = {};
  let stops = 0;
  let failNext = false;
  const uni = {
    getStorageSync: (k) => storage[k],
    setStorageSync: (k, v) => { storage[k] = v; },
    stopPullDownRefresh: () => { stops++; },
    navigateTo: () => {},
  };
  const api = (name) => {
    calls[name] = (calls[name] || 0) + 1;
    // user/info 每次都带一枚 token 回来（本页会把它写回本地），这里按「发请求那一刻本地那枚」回，
    // 与真实后端一致：同一个人每次拿到同一枚，换了人就是另一枚
    const token = storage.user_token;
    if (name === 'user.info.index' && failNext) {
      failNext = false;
      return Promise.reject(new Error('network down'));
    }
    const data = {
      'user.info.index': { token, nickname: '凸知', avatar: '', money: '1.00', score: 2, coupon_num: 3, prize_num: 4 },
      'page.userCenter.getConfig': { config: null, options: {} },
      'config.service': {},
    };
    return Promise.resolve({ code: 1, msg: 'ok', data: data[name] || {} });
  };
  return {
    storage, uni, api, calls,
    stops: () => stops,
    breakOnce: () => { failNext = true; },
  };
}

function makeVm(opts, env) {
  const vm = Object.assign({}, opts.data(), {
    $api: env.api,
    $nav: { parsePageParams: () => ({}) },
    $tools: { systemConfig: () => 'false' },
  });
  Object.keys(opts.methods).forEach((k) => { vm[k] = opts.methods[k].bind(vm); });
  return vm;
}

const tick = () => new Promise((r) => setTimeout(r, 10));
const infoCalls = (calls) => calls['user.info.index'] || 0;

let fail = 0;
const assert = (name, ok, got) => {
  if (!ok) fail++;
  console.log((ok ? '[PASS] ' : '[FAIL] ') + name + ' -> ' + got);
};

(async () => {
  const snapshot = loadSnapshotModule();
  // A + B：首进取一次，之后每次 onShow 都不再取
  const env = makeEnv('TOKEN_A');
  const opts = loadOptions({ uni: env.uni, snapshot: snapshot });
  const vm = makeVm(opts, env);
  opts.onLoad.call(vm);
  opts.onShow.call(vm);
  const afterFirst = infoCalls(env.calls);
  await tick();
  const stopsAfterFirst = env.stops();
  opts.onShow.call(vm);   // 从子页退回
  await tick();
  opts.onShow.call(vm);   // 页签切回来
  await tick();
  assert('A 首进这一屏取一次 user/info', afterFirst === 1, 'calls=' + afterFirst);
  assert('B 数据落地后再走 onShow 不重取（切页签 / 从子页退回）', infoCalls(env.calls) === 1, 'calls=' + infoCalls(env.calls));
  assert('   └ 首进那一次也把下拉收条收了（没下拉时是无害的空调用）', stopsAfterFirst === 1, 'stops=' + stopsAfterFirst);

  // C：登录成功 / 换号 → token 变了 → 下一次 onShow 必须重取
  env.storage.user_token = 'TOKEN_B';
  opts.onShow.call(vm);
  await tick();
  assert('C 身份变了（登录成功/换号）后 onShow 重取', infoCalls(env.calls) === 2, 'calls=' + infoCalls(env.calls));
  opts.onShow.call(vm);
  await tick();
  assert('   └ 换号后同一个人再切页签仍不重取', infoCalls(env.calls) === 2, 'calls=' + infoCalls(env.calls));

  // D：下拉刷新取一次，且收条等有回音才落
  const stopsBeforePull = env.stops();
  opts.onPullDownRefresh.call(vm);
  const stopsSync = env.stops();
  await tick();
  assert('D 下拉刷新取一次 user/info', infoCalls(env.calls) === 3, 'calls=' + infoCalls(env.calls));
  assert('   └ 收条不在触发那一刻收，等这一趟有回音才收', stopsSync === stopsBeforePull && env.stops() === stopsBeforePull + 1,
    '触发后=' + stopsSync + ' 回音后=' + env.stops());

  // F：切 tab 回来＝新实例（redirectTo 已把旧实例销毁）——按会话快照复原，零请求
  await tick();
  const beforeF = infoCalls(env.calls);
  const decorateBeforeF = env.calls['page.userCenter.getConfig'] || 0;
  const vmTab = makeVm(opts, env);
  opts.onLoad.call(vmTab);
  opts.onShow.call(vmTab);
  await tick();
  assert('F 切 tab 回来（新实例）按快照复原：零请求、内容照旧',
    infoCalls(env.calls) === beforeF && vmTab.userInfo.nickname === '凸知' && vmTab.loading === false && vmTab.fetched === true,
    'calls=' + infoCalls(env.calls) + '，nickname=' + (vmTab.userInfo && vmTab.userInfo.nickname));
  assert('F 复原时装修配置也不再取一次',
    (env.calls['page.userCenter.getConfig'] || 0) === decorateBeforeF,
    'decorateCalls=' + (env.calls['page.userCenter.getConfig'] || 0));

  // G：换号后再切 tab（新实例）——上一个人的快照不许复用
  const beforeG = infoCalls(env.calls);
  const decorateBeforeG = env.calls['page.userCenter.getConfig'] || 0;
  env.storage.user_token = 'TOKEN_H';
  const vmOther = makeVm(opts, env);
  opts.onLoad.call(vmOther);
  opts.onShow.call(vmOther);
  await tick();
  assert('G 换号后新实例不复用旧身份快照：user/info 重取一次',
    infoCalls(env.calls) === beforeG + 1,
    'calls=' + infoCalls(env.calls));
  assert('G 换号后装修配置也重新取一次',
    (env.calls['page.userCenter.getConfig'] || 0) === decorateBeforeG + 1,
    'decorateCalls=' + (env.calls['page.userCenter.getConfig'] || 0));

  // E：首屏那一趟取失败不写「已取过」——页面还停在空骨架上，下一次 onShow 必须重试，不会卡死
  const env2 = makeEnv('TOKEN_C');
  env2.breakOnce();
  const opts2 = loadOptions({ uni: env2.uni, snapshot: snapshot });
  const vm2 = makeVm(opts2, env2);
  opts2.onShow.call(vm2);
  await tick();
  const afterFail = infoCalls(env2.calls);
  const loadedAfterFail = vm2.loading;
  opts2.onShow.call(vm2);
  await tick();
  assert('E 首屏取失败后骨架屏收起、下一次 onShow 仍重试（不卡在空屏）',
    afterFail === 1 && loadedAfterFail === false && infoCalls(env2.calls) === 2,
    '失败后 calls=' + afterFail + ' loading=' + loadedAfterFail + ' 重试后 calls=' + infoCalls(env2.calls));

  // pages.json：用户中心这一路由要开下拉刷新
  const manifest = fs.readFileSync(PAGES_JSON, 'utf8');
  const sub = manifest.slice(manifest.indexOf('"root": "pages/user"'));
  const route = sub.match(/"path":\s*"index\/index"[\s\S]{0,400}?"enablePullDownRefresh":\s*true/);
  assert('pages.json：pages/user/index/index 已开 enablePullDownRefresh', route !== null, route ? '已开' : '未开');

  console.log(fail === 0 ? '全部符合预期' : '有 ' + fail + ' 项不符合预期');
  process.exitCode = fail === 0 ? 0 : 1;
})();