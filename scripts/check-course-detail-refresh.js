// 课程详情页「回到本页不再整页重取」（2026-10-09 刷新分层）校验，不构建、不开浏览器。
// 把 pages/course/detail/js.vue 的 script 原样抽出来，用桩喂 uni / $api / courseLibrary，
// 实跑 onLoad → onShow → 各种回收档位，断言这十件事：
//   A 首进只走一次完整取数，浏览数只加这一次（老写法挂在 onShow 上，切一次标签页 views 就 +1）；
//   B 数据落地后每次 onShow（切标签页 / 微信小窗还原 / 从子页退回）**一条请求都不发**——
//     这正是用户点名要修的：「每次页面刷新、标签页切换都会触发页面刷新，播放视频、音频直播时
//     会因为刷新导致播放中断，甚至播放一半时还会因为刷新重置播放进度」；
//   C 但学习心跳与防录屏要接上（老写法是靠 getData 末端顺手重起定时器的，不接上就变成
//     「切回来学习时长不涨」）；
//   D 回收档（付过款 / 取数超窗）静默：不闪骨架屏，且订阅态没翻时**保住正在播的那一份播流地址**
//     （后端每次都重签 fullurl，video-h5 的 watch:source 是换源即重建播放器）；
//   E 回收档不打组 1（推荐商品 / 圈子 / 推荐评价）那三条；
//   F 购买后返回：订阅态翻那一支等价于重新进过一次这门课——学习链重跑、直播课自动进直播间；
//   G 支付成功的全站事件（common/utils/pay.js 的 goOrder 发 orderPaid）把账标脏，
//     本页发起的下单/订阅专栏/开会员也各自标脏；onLoad 注册、onUnload 按 handler 注销；
//   H 下拉刷新仍是完整重取（组 1 跟着回来），但不闪骨架屏（顶部已有原生转圈）；
//   I 页签是 computed：同一份数据取几轮都不出重复页签（老写法靠 token 丢过期响应才不至于重复）；
//   J 首取失败不记「已落地」，下一次 onShow 重试，且重试那一趟不再加浏览数。
// 用法：node tuzi-mobile/scripts/check-course-detail-refresh.js   （exit 0 = 全部符合预期）
const fs = require('fs');
const path = require('path');

const PAGE = path.resolve(__dirname, '../src/pages/course/detail/js.vue');
const PAGES_JSON = path.resolve(__dirname, '../src/pages.json');
const PAY = path.resolve(__dirname, '../src/common/utils/pay.js');
const VIDEO_H5 = path.resolve(__dirname, '../src/components/video/video-h5.vue');
const AUDIO = path.resolve(__dirname, '../src/components/tz/course-audio.vue');
// 后端那枚播流地址签发有效期在仓库另一头，页面保源窗口不得大于它（大了一枚过期地址就会被保住）
const ALIVOD = path.resolve(__dirname, '../../tuzhi-selfbuilt-backend/addons/alivod/library/Alivod.php');

const read = (f) => fs.readFileSync(f, 'utf8');

// 两枚时间常量都从页面源码里读，脚本不许跟着页面漂（漂了就是假绿：门禁按老值判，页面按新值跑）。
// 页面写的是 `5 * 60 * 1000` 这种算式，所以整条右值取出来再算——只容数字与 + - * / ( ) .，
// 出现别的字符就当读不到（宁可红在门禁上，也不拿一个 5 毫秒的假窗口把「超窗」验成通过）
function readConst(name) {
  const m = read(PAGE).match(new RegExp('const ' + name + '\\s*=\\s*([^;]+);'));
  if (!m) { console.error('[FAIL] 页面里读不到常量 ' + name); process.exit(1); }
  const expr = m[1].trim();
  if (!/^[\d\s+\-*/().]+$/.test(expr)) {
    console.error('[FAIL] 常量 ' + name + ' 的写法不是纯算术，readConst 读不了：' + expr);
    process.exit(1);
  }
  return Number(new Function('return (' + expr + ')')());
}
const STALE_MS = readConst('STALE_MS');
const MEDIA_MAX_AGE = readConst('MEDIA_MAX_AGE');
// 后端签发的播流地址有效期是 6 小时，保源的年龄闸门必须留出安全边（取到 6h 就等于没有边）
const VOD_URL_TTL = 21600 * 1000;

let fail = 0;
const assert = (name, ok, got) => {
  if (!ok) fail++;
  console.log((ok ? '[PASS] ' : '[FAIL] ') + name + (got === undefined ? '' : ' -> ' + got));
};
const tick = () => new Promise((r) => setTimeout(r, 5));

/** 一份课程行：每次取数都换一枚播流地址，这就是后端真实行为（阿里云每次重签） */
function courseRow(sign, over) {
  return Object.assign(
    {
      id: 1213,
      name: '测试课程',
      type: 'video',
      subscription: false,
      pay_type: 'pay',
      sales_type: ['alone'],
      price: '9.90',
      briefing: '简介',
      cover: 'cover.jpg',
      detail: '<p>正文</p>',
      bind_data: [],
      audio_path: [],
      video_path: { fullurl: 'https://vod/a.m3u8?sign=' + sign, play_auth: 'auth-' + sign },
      try_watch_content: [],
      try_listen_content: [],
    },
    over
  );
}

/**
 * 装配一份页面环境：桩 uni / $api / courseLibrary / 定时器，全部记账
 * @param {Array} detailResponses course.detail 依次回什么（数组用完就回最后一项）
 */
function makeEnv(detailResponses, options) {
  const opt = options || {};
  const storage = Object.assign(
    {
      user_token: 'tok-test',
      platform: 'h5',
      // 插件安装态由 Common::init 下发到 systemConfig（getPluginInstallState 读这一份）
      systemConfig: JSON.stringify({
        app_isinstall_checkin: true,
        app_isinstall_circle: true,
        app_isinstall_form: true,
      }),
    },
    opt.storage || {}
  );

  const env = {
    storage,
    requests: [],
    intervals: [],
    emits: [],
    navTo: [],
    uniListeners: {},
    stops: 0,
    apiCalls: {},
    courseCalls: { setStudyLog: 0, banScreenRecordStart: 0, banScreenRecordCancel: 0, checkBanPc: 0 },
  };

  let detailIndex = 0;
  const nextDetail = () => {
    const item = detailResponses[Math.min(detailIndex, detailResponses.length - 1)];
    detailIndex++;
    return item;
  };

  env.uni = {
    getStorageSync: (k) => (storage[k] === undefined ? '' : storage[k]),
    setStorageSync: (k, v) => { storage[k] = v; },
    removeStorageSync: (k) => { delete storage[k]; },
    $on: (name, cb) => { (env.uniListeners[name] = env.uniListeners[name] || []).push(cb); },
    $off: (name, cb) => {
      const list = env.uniListeners[name] || [];
      const i = list.indexOf(cb);
      if (i >= 0) list.splice(i, 1);
    },
    $emit: (name, payload) => {
      env.emits.push(name);
      (env.uniListeners[name] || []).slice().forEach((cb) => cb(payload));
    },
    $u: { toast: () => {} },
    stopPullDownRefresh: () => { env.stops++; },
    setNavigationBarTitle: () => {},
    showModal: () => {},
    reLaunch: () => {},
    showToast: () => {},
    showLoading: () => {},
    hideLoading: () => {},
    createSelectorQuery: () => ({ in: () => ({ exec: (cb) => cb([]) }) }),
  };

  env.$api = function (name, params, extra) {
    env.requests.push({ name, params, extra });
    env.apiCalls[name] = (env.apiCalls[name] || 0) + 1;
    if (name === 'course.detail') {
      const item = nextDetail();
      if (item instanceof Error) return Promise.reject(item);
      // 每次回一份新克隆：保源那一步是把旧对象**写进响应体**的（页面就是这么实现的），
      // 直接回共享夹具会让下一档回收拿到的"新地址"已经被上一档改过——K 那条就是这么被假绿骗到的
      return Promise.resolve({ code: 1, msg: 'ok', data: JSON.parse(JSON.stringify(item)) });
    }
    if (name === 'app.recommend.getRecommendGoods') {
      return Promise.resolve({ code: 1, data: [{ id: 1, name: '推荐位' }] });
    }
    if (name === 'circle.circle.courseCircle') {
      return Promise.resolve({ code: 1, data: { has_circle: 1, list: [] } });
    }
    if (name === 'checkin.course.courseCheckin') {
      return Promise.resolve({ code: 1, data: { rows: [], has_more: 0 } });
    }
    if (name === 'app.form.checkBeforeLearn') {
      return Promise.resolve({ code: 1, data: { has_form: 0, all_submitted: 1 } });
    }
    if (name === 'order.evaluate.getCourseRecommendList') {
      return Promise.resolve({ code: 1, data: { count: 0, list: [] } });
    }
    return Promise.resolve({ code: 1, msg: 'ok', data: {} });
  };

  const courseLibrary = {
    setStudyLog: () => { env.courseCalls.setStudyLog++; },
    stopStudyLog: () => {},
    banScreenRecordStart: () => { env.courseCalls.banScreenRecordStart++; },
    banScreenRecordCancel: () => { env.courseCalls.banScreenRecordCancel++; },
    checkBanPc: () => { env.courseCalls.checkBanPc++; },
  };
  const liveInviter = { rememberInviter: () => {}, resolveInviter: () => '', inviterFromParams: () => '' };
  env.deps = { courseLibrary, liveInviter, goActivity: () => {}, tools: { systemConfig: () => '' } };
  return env;
}

/** 把页面 script 抽出来跑：import 全部桩化，computed 用 getter 挂上，methods 全量绑实例 */
function loadPage(env) {
  let src = read(PAGE);
  src = src
    .replace(/^[\s\S]*?<script>/, '')
    .replace(/<\/script>[\s\S]*$/, '')
    .replace('export default', 'module.exports =');
  src = src.replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, (m, name) =>
    name === 'courseLibrary' ? 'const courseLibrary = __DEP__.courseLibrary;' : 'const ' + name + ' = {};'
  );
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']*["'];?\s*$/gm, (m, names) => {
    const list = names.split(',').map((n) => n.trim()).filter(Boolean);
    if (list.indexOf('rememberInviter') >= 0) return 'const ' + list.map((n) => n + ' = __DEP__.liveInviter.' + n).join(', ') + ';';
    return 'const ' + list.map((n) => n + ' = __DEP__.goActivity').join(', ') + ';';
  });
  const m = { exports: {} };
  new Function('module', 'exports', 'uni', '__DEP__', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', src)(
    m, m.exports, env.uni, env.deps,
    // 定时器全部记账：心跳（setStudyLog）有没有恢复，就看这一处
    (fn, ms) => { env.intervals.push(ms); return env.intervals.length; },
    () => {},
    (fn, ms) => 0,
    () => {}
  );
  return m.exports;
}

function makeVm(opts, env) {
  const vm = Object.assign({}, opts.data(), {
    $api: env.$api,
    $tools: {
      systemConfig: (k) => {
        if (k === 'comment_entry_status') return 'open';
        if (k === 'app_isinstall_checkin' || k === 'app_isinstall_circle' || k === 'app_isinstall_form') return true;
        // 达人榜 / 分享有礼两个归因插件在本脚本里一律判未装：归因那条链由
        // check-live-inviter-chain.js 钉，这里只验刷新分层，不让它多插两条请求
        if (k === 'app_isinstall_invite_rank' || k === 'app_isinstall_share_gift') return false;
        return '';
      },
    },
    $nav: {
      parsePageParams: (p) => Object.assign({ id: '1213', column_id: '', circle_id: '' }, p),
      to: (dest, type, mode) => { env.navTo.push({ dest, type, mode }); },
      share: () => {},
    },
    $refs: {},
  });
  Object.defineProperty(vm, 'tabs', { get: () => opts.computed.tabs.call(vm) });
  Object.keys(opts.methods).forEach((k) => { vm[k] = opts.methods[k].bind(vm); });
  vm.onLoad = opts.onLoad.bind(vm);
  vm.onShow = opts.onShow.bind(vm);
  vm.onHide = opts.onHide.bind(vm);
  vm.onUnload = opts.onUnload.bind(vm);
  vm.onPullDownRefresh = opts.onPullDownRefresh.bind(vm);
  return vm;
}

const detailReqs = (env) => env.requests.filter((r) => r.name === 'course.detail');
const extrasReqs = (env) =>
  env.requests.filter((r) =>
    ['app.recommend.getRecommendGoods', 'circle.circle.courseCircle', 'order.evaluate.getCourseRecommendList'].indexOf(r.name) >= 0
  );

(async () => {
  // ---------- A + B + C：首进取一次，切回来零请求，但心跳与防录屏要接上 ----------
  const env = makeEnv([courseRow('FIRST', { subscription: true }), courseRow('SECOND', { subscription: true })]);
  const opts = loadPage(env);
  const vm = makeVm(opts, env);

  vm.onLoad({ id: '1213' });
  vm.onShow();
  await tick();
  assert('A 首进取了一次 course.detail', detailReqs(env).length === 1, 'calls=' + detailReqs(env).length);
  assert('   └ 首进那一次浏览数加一次（add_views=1）', detailReqs(env)[0].params.add_views === 1, JSON.stringify(detailReqs(env)[0].params));
  assert('   └ 组 1（推荐商品/圈子/评价）随首进取了', extrasReqs(env).length === 3, 'calls=' + extrasReqs(env).length);
  // 这一条同时是「改动前每次 onShow 都要跑一整串」的量化证据：老写法的 onShow 直接进的就是这一整串
  assert('   └ 首进那一条链取齐 组1+组2（这一整串就是老写法每次 onShow 的量）',
    env.requests.length === 8 &&
      ['course.detail', 'app.form.checkBeforeLearn', 'circle.circle.courseCircle', 'checkin.course.courseCheckin',
        'order.evaluate.getCourseRecommendList', 'app.recommend.getRecommendGoods',
        'user.collect.getIsCollect', 'app.vip.goods_privilege'].every((n) => (env.apiCalls[n] || 0) >= 1),
    '共 ' + env.requests.length + ' 条：' + env.requests.map((r) => r.name).join(','));
  assert('   └ 数据已落地（loaded=true）、骨架屏已撤', vm.loaded === true && vm.loading === false, 'loaded=' + vm.loaded + ' loading=' + vm.loading);

  const requestsAfterFirst = env.requests.length;
  const intervalsAfterFirst = env.intervals.length;
  vm.onShow(); // 浏览器切标签页回来
  await tick();
  vm.onShow(); // 微信小窗还原
  await tick();
  assert('B 切标签页 / 小窗还原：一条请求都不发（用户点名的就是这一条）', env.requests.length === requestsAfterFirst,
    '多发 ' + (env.requests.length - requestsAfterFirst) + ' 条');
  assert('   └ 浏览数没有跟着涨', detailReqs(env).length === 1, 'calls=' + detailReqs(env).length);
  assert('C 回到本页把心跳定时器接上了（学习时长不会断）', env.intervals.length === intervalsAfterFirst + 2,
    'intervals ' + intervalsAfterFirst + '→' + env.intervals.length);
  assert('   └ 防录屏也重新上了（onHide 撤过，回来必须再上）', env.courseCalls.banScreenRecordStart >= 3,
    'start=' + env.courseCalls.banScreenRecordStart);

  // ---------- G：支付成功事件 / 本页发起的下单，都要把账标脏 ----------
  const payHandlers = (env.uniListeners.orderPaid || []).length;
  assert('G 页面 onLoad 注册了 orderPaid 监听（pay.js 的 goOrder 那一条广播）', payHandlers === 1, 'handlers=' + payHandlers);
  env.uni.$emit('orderPaid', { order_no: 'NO1' });
  assert('   └ 收到广播只标脏账，不在那一刻发请求', vm.stateDirty === true, 'stateDirty=' + vm.stateDirty);

  // ---------- D + E：回收档静默，订阅态没翻就不换播流地址，且不打组 1 ----------
  const before = env.requests.length;
  const sourceRefBefore = vm.data.video_path;
  vm.onShow();
  await tick();
  assert('D 付过款后回本页回收一次（判据②：账脏了）', detailReqs(env).length === 2, 'calls=' + detailReqs(env).length);
  assert('   └ 回收那一趟不加浏览数（add_views=0）', detailReqs(env)[1].params.add_views === 0, JSON.stringify(detailReqs(env)[1].params));
  assert('   └ 不闪骨架屏（loading 始终是 false）', vm.loading === false, 'loading=' + vm.loading);
  assert('   └ 订阅态没翻 → 播流地址保持页面上正在播的那一枚（播放器不重建、进度不归零）',
    vm.data.video_path.fullurl === 'https://vod/a.m3u8?sign=FIRST', vm.data.video_path.fullurl);
  // 值相等之外还要钉身份：小程序视图层按属性值 diff，同一个对象引用连一次 diff 都收不到，
  // 原生 <video> 的 src 才绝无可能被换掉（微信小窗回消息再返回「从头播放」那一条的落点）
  assert('   └ 保住的正是原来那一个对象（不是同值的新对象，MP 端连属性 diff 都不发）',
    vm.data.video_path === sourceRefBefore,
    vm.data.video_path === sourceRefBefore ? '同一引用' : '已被新对象替换');
  assert('E 回收档不打组 1（推荐商品/圈子/评价没跟着重取）', extrasReqs(env).length === 3, 'extras=' + extrasReqs(env).length);
  assert('   └ 回收一共只多发 3 条（详情 + 收藏 + 会员权益）', env.requests.length - before === 3,
    '多发 ' + (env.requests.length - before) + ' 条：' + env.requests.slice(before).map((r) => r.name).join(','));
  assert('   └ 账收掉了，再切标签页仍然零请求', vm.stateDirty === false, 'stateDirty=' + vm.stateDirty);

  const requestsAfterState = env.requests.length;
  vm.onShow();
  await tick();
  assert('   └ 回收之后回到判据③：切页签还是零请求', env.requests.length === requestsAfterState,
    '多发 ' + (env.requests.length - requestsAfterState) + ' 条');

  // ---------- K：保源有上限——地址挂过 MEDIA_MAX_AGE 那一趟要换新签的（H5 挂一夜、小程序实例活到第二天）----------
  vm.mediaAt = Date.now() - MEDIA_MAX_AGE - 1000;
  env.uni.$emit('orderPaid', { order_no: 'NO-K' });
  vm.onShow();
  await tick();
  assert('K 地址超龄那一趟吃新签的地址（宁可贵一次重建，也不留一枚必然过期的地址）',
    vm.data.video_path.fullurl === 'https://vod/a.m3u8?sign=SECOND', vm.data.video_path.fullurl);
  assert('   └ 换新地址后把 mediaAt 复位（下一次回收回到保源那一档）',
    Date.now() - vm.mediaAt < 5000, 'mediaAt 距今 ' + (Date.now() - vm.mediaAt) + 'ms');
  const vodTtl = Number((read(ALIVOD).match(/PLAY_URL_AUTH_TIMEOUT = (\d+)/) || [])[1]);
  assert('   └ 后端签发窗口 ≥ 页面保源窗口（保源窗口比签发窗口长就等于把过期地址钉在页面上）',
    vodTtl * 1000 >= MEDIA_MAX_AGE, '后端 ' + vodTtl + 's / 页面保源 ' + MEDIA_MAX_AGE / 1000 + 's');

  const types = vm.tabs.map((t) => t.type);
  assert('I 页签集合没有重复枚', new Set(types).size === types.length, JSON.stringify(types));

  // ---------- F：购买后返回，订阅态翻那一支要重跑学习链 ----------
  const envPaid = makeEnv([courseRow('T1', { subscription: false }), courseRow('T2', { subscription: true })]);
  const optsPaid = loadPage(envPaid);
  const vmPaid = makeVm(optsPaid, envPaid);
  vmPaid.onLoad({ id: '1213' });
  vmPaid.onShow();
  await tick();
  const formBefore = envPaid.apiCalls['app.form.checkBeforeLearn'] || 0;
  const extrasBefore = extrasReqs(envPaid).length;
  envPaid.uni.$emit('orderPaid', { order_no: 'NO2' });
  vmPaid.onShow();
  await tick();
  assert('F 已订阅那一支走完整回填：学习前表单闸门重新判过一次',
    (envPaid.apiCalls['app.form.checkBeforeLearn'] || 0) === formBefore + 1,
    'form ' + formBefore + '→' + envPaid.apiCalls['app.form.checkBeforeLearn']);
  assert('   └ 订阅态翻了才换播流地址（试看片 → 正片）',
    vmPaid.data.video_path.fullurl === 'https://vod/a.m3u8?sign=T2', vmPaid.data.video_path.fullurl);
  assert('   └ 打卡列表只在翻转后补取（未订阅那一档这条请求根本不发）',
    (envPaid.apiCalls['checkin.course.courseCheckin'] || 0) === 1,
    'checkin=' + envPaid.apiCalls['checkin.course.courseCheckin']);
  assert('   └ 这一支仍然不打组 1', extrasReqs(envPaid).length === extrasBefore, 'extras=' + extrasReqs(envPaid).length);

  // ---------- F2：翻成已订阅的直播课要自动进直播间（老写法靠 onShow 全量刷新顺带做到，不能丢） ----------
  const envLive = makeEnv([
    courseRow('L1', { type: 'live', subscription: false, video_path: [], live_start_time: 0 }),
    courseRow('L2', { type: 'live', subscription: true, video_path: [], live_start_time: 0 }),
  ]);
  const optsLive = loadPage(envLive);
  const vmLive = makeVm(optsLive, envLive);
  vmLive.onLoad({ id: '1213' });
  vmLive.onShow();
  await tick();
  envLive.navTo.length = 0;
  envLive.uni.$emit('orderPaid', { order_no: 'NO3' });
  vmLive.onShow();
  await tick();
  const redirect = envLive.navTo.filter((n) => n.mode === 'redirectTo');
  assert('F2 直播课买完回来仍然自动跳直播间（判据翻转那一支重跑学习链）',
    redirect.length === 1 && String(redirect[0].dest).indexOf('/pages/course/live/live?id=1213') === 0,
    JSON.stringify(envLive.navTo));

  // ---------- H：下拉刷新是完整重取（组 1 跟着回来），但不闪骨架屏 ----------
  const extrasBeforePull = extrasReqs(env).length;
  vm.onPullDownRefresh();
  await tick();
  assert('H 下拉刷新把组 1 一起重取了（这是唯一的强制重载出口）', extrasReqs(env).length === extrasBeforePull + 3,
    'extras ' + extrasBeforePull + '→' + extrasReqs(env).length);
  assert('   └ 下拉刷新不加浏览数', detailReqs(env)[detailReqs(env).length - 1].params.add_views === 0);
  assert('   └ 不闪骨架屏（顶部原生转圈已经在了）', vm.loading === false, 'loading=' + vm.loading);
  assert('   └ 下拉收条等这一趟有回音才收', env.stops >= 1, 'stops=' + env.stops);

  // ---------- 兜底：取数超窗（商家改价 / 订阅到期 / 其他设备购买没有事件源，靠这一条） ----------
  const requestsBeforeStale = env.requests.length;
  vm.loadedAt = Date.now() - STALE_MS - 1000;
  vm.onShow();
  await tick();
  assert('超窗回本页补一次静默回收（不是每次都回，只有超窗那一次）',
    detailReqs(env).length === 5 && env.requests.length - requestsBeforeStale === 3,
    'detail=' + detailReqs(env).length + ' 多发=' + (env.requests.length - requestsBeforeStale));
  const requestsAfterStale = env.requests.length;
  vm.onShow();
  await tick();
  assert('   └ 回收成功把 loadedAt 换了，紧接着再切页签不回第 4 次', env.requests.length === requestsAfterStale,
    '多发 ' + (env.requests.length - requestsAfterStale) + ' 条');

  // ---------- J：首取失败不留空骨架 ----------
  const envFail = makeEnv([new Error('network down'), courseRow('R2')]);
  const optsFail = loadPage(envFail);
  const vmFail = makeVm(optsFail, envFail);
  vmFail.onLoad({ id: '1213' });
  vmFail.onShow();
  await tick();
  assert('J 首取失败：骨架屏收起、不记「已落地」', vmFail.loaded === false && vmFail.loading === false,
    'loaded=' + vmFail.loaded + ' loading=' + vmFail.loading);
  vmFail.onShow();
  await tick();
  assert('   └ 下一次 onShow 重试，且重试那一趟不再加浏览数',
    detailReqs(envFail).length === 2 && detailReqs(envFail)[0].params.add_views === 1 && detailReqs(envFail)[1].params.add_views === 0,
    JSON.stringify(detailReqs(envFail).map((r) => r.params.add_views)));

  // ---------- G2：onUnload 按 handler 注销，不能把别的页面的监听一起摘掉 ----------
  const handlersBefore = (env.uniListeners.orderPaid || []).length;
  vm.onUnload();
  assert('G2 onUnload 把自己那一份 orderPaid 监听注销了',
    handlersBefore === 1 && (env.uniListeners.orderPaid || []).length === 0,
    'handlers ' + handlersBefore + '→' + (env.uniListeners.orderPaid || []).length);

  // ---------- 跨文件事实：承重的那三处写法必须还在 ----------
  const paySrc = read(PAY);
  assert('pay.js 的 goOrder 发 orderPaid（各端支付成功都收在这一处，取消/失败另有出口）',
    /goOrder\(\)\s*\{[\s\S]{0,400}uni\.\$emit\('orderPaid'/.test(paySrc), '在位');
  const videoSrc = read(VIDEO_H5);
  assert('video-h5 的 watch: source 是「换源即重建播放器」（D 条为什么必须保源的依据）',
    /watch:\s*\{[\s\S]{0,200}source\(\)\s*\{[\s\S]{0,600}dispose\(\)/.test(videoSrc), '在位');
  const audioSrc = read(AUDIO);
  assert('course-audio 的 watch: path 把 currentTime 归零（同上，音频那一族）',
    /path:\s*\{[\s\S]{0,400}this\.currentTime\s*=\s*0/.test(audioSrc), '在位');
  // 用户这次点名的正是小程序端：微信来信息 → 点开小窗回复 → 返回 = 一次 onShow，
  // 而原生 <video> 的 src 换值就是从头播，所以 MP 那一侧的绑法也要钉在门禁里
  const VIDEO_MP = path.resolve(__dirname, '../src/components/video/video-mp.vue');
  const mpSrc = read(VIDEO_MP);
  assert('video-mp 把 :src 直接绑在原生 <video> 上、watch: source 还自动 playVideo()（小窗返回从头播的成因）',
    /<video[^>]{0,600}:src="source"/.test(mpSrc) && /watch:\s*\{[\s\S]{0,120}source\(\)\s*\{[\s\S]{0,120}this\.playVideo\(\)/.test(mpSrc), '在位');
  const pageSrc = read(PAGE);
  assert('详情页里 course.detail 只从 fetchDetail 这一个出口打（归因先后的前提，口径同 ⑬ 组）',
    (pageSrc.match(/that\.\$api\("course\.detail"/g) || []).length === 1,
    '出现 ' + (pageSrc.match(/that\.\$api\("course\.detail"/g) || []).length + ' 次');
  // ---- 跨端（H5 + 微信小程序）两条：出口要在两端都在，回收链不许长出一端专属的 API ----
  const manifest = read(PAGES_JSON);
  const courseBlock = manifest.slice(manifest.indexOf('"root": "pages/course"'));
  assert('pages.json：pages/course/detail/detail 已开 enablePullDownRefresh（小程序端唯一的强制重载出口，H5 还有浏览器刷新，小程序没有）',
    /"path":\s*"detail\/detail"[\s\S]{0,300}?"enablePullDownRefresh":\s*true/.test(courseBlock), '已开');
  const newChain = pageSrc.slice(pageSrc.indexOf('fetchDetail(addViews)'), pageSrc.indexOf('applyDefaultTab()'));
  assert('刷新这一整段（fetchDetail / getData / applyCourseData / runLearnChain / refreshState / keepRenderingSource）没有一端专属的 DOM 或 wx 调用',
    !/\bdocument\.|\bwindow\.|\bwx\./.test(newChain),
    /\b(document|window|wx)\./.test(newChain) ? '出现单端 API' : '干净');
  assert('reactivate 里「禁止 PC 端学习」那一处仍带 MP-WEIXIN 条件编译（wx.getDeviceInfo 只在小程序端存在）',
    new RegExp('reactivate\\(\\)\\s*\\{[\\s\\S]{0,700}// #ifdef MP-WEIXIN[\\s\\S]*?checkBanPc').test(pageSrc), '在位');

  // M23 的原文是「onShow() 的**注释之后**第一条语句必须是 that = this;」，所以正则要容得下前置注释
  assert('onShow 第一条语句把模块级 that 收回当前实例（M23 硬要求）',
    /onShow\(\)\s*\{(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*that = this;/.test(pageSrc), '在位');
  assert('onShow 里没有再挂整页重取（这条改动的主句，被回退就红在这里）',
    !/onShow\(\)\s*\{[\s\S]{0,1600}?this\.getData\(true\)/.test(pageSrc), '已摘掉');

  console.log(fail === 0 ? '全部符合预期' : '有 ' + fail + ' 项不符合预期');
  process.exitCode = fail === 0 ? 0 : 1;
})();
