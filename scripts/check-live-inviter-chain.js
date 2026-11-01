// 直播「分享归因」跨页接线校验（不构建、不开浏览器）—— 2026-10-04 现场：
// 邀请人（user 38）用课程详情页链接 #/pages/course/detail/detail?id=331&share=38 邀请，
// 受邀人进直播间后达人榜与分享有礼记录全空；实查 dev 库 tuzhi_app_invite_rank_visit /
// tuzhi_app_share_gift_assist 两张表该场 0 行。
//
// 根因不在后端：直播课的分享链接落点是**详情页**（Links.php type='course' 出 /pages/course/detail/detail?id=&share=），
// 而两条上报都在**直播间页**发；详情页 → 直播间那一次 redirectTo 只搬 id 与 column_id，share 在这一跳丢掉，
// 而 reportInviteRank 只读 pageParams.share（PRD §12.3-12 明令不许回落到全站 storage 那份跨课程长期留着的 share）。
// sfc-check 只编译模板、ui-audit 只查版式、后端 curl 只验接口出口，**跨页丢参数这一族三件门禁全看不见**
// （硬约束 27③），所以这条链由本脚本实跑断言：真实 util + 两个页面脚本喂同一份 storage 桩跑一遍。
//
// ===== 2026-10-04 第二次复查：上一版这个门禁自己是绿的，字段却仍然是坏的 =====
// 上面那些用例**每一组都手敲 `share: '38'`**。当时判成"产品发出去的链接叫 `share_id`、端上只认 `share`"，
// 于是又给端上加了 `share_id` 别名、还把这条写进了硬约束 33。
//
// ===== 2026-10-05 第三次复查：**上面那个判是错的，门禁自己造的** =====
// `Links::getShareParams()` 返回的 `$params['share_id']` 是**输入键**，还要经 `parseParams()` 改名才上线：
//     $fields[$type]['share'] = 'share_id';        // Links.php:216  左＝输出键，右＝取值键
//     foreach (...) { $data[$index] = $params[$item]; }   // ⇒ $data['share'] = $params['share_id']
// ⇒ 产品发出去的地址是 `…/pages/course/detail/detail?id=4544&**share**=38`，`grep -rn "share_id" src/`
//   那次零命中查的是**输入键的名字**，而它从不出现在 URL 上。
// 铁证是本仓库自己：旧 ⓪ 组扫 `$params[...] = $userId`，扫到的正是这个**输入键**，
// 于是「后端发 share_id」被 ⓪ 组亲手坐实，再照着它改客户端、改规则 —— **门禁把假前提验成了绿**。
// ⇒ 本次把 ⓪ 组改成反推改名表的**左值**（线上那一个），并把喂输入键的用例全改成喂线上键。
//   后端以后要改名字、或者改的是「输入键 vs 输出键」这一处，⓪ 组都会先红。
// 同一份教训对后端自检工具同样成立：`InviteAttrTrace` 第 3 环曾直接 `http_build_query($params)`，
// 打印出一个产品从不产生的地址——**已改为走 `Links::getLink()`**，见 `InviteShareLinkProbe`。
// 用法：node tuzi-mobile/scripts/check-live-inviter-chain.js   （exit 0 = 全部符合预期）
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const UTIL = 'src/common/utils/live-inviter.js';
const DETAIL = 'src/pages/course/detail/js.vue';
const LIVE = 'src/pages/course/live/js.vue';
const LIVE_VUE = 'src/pages/course/live/live.vue';
const SHARE_GIFT = 'src/pages/course/live/share-gift/js.vue';
const SHARE_GIFT_VUE = 'src/pages/course/live/share-gift/share-gift-popup.vue';
// 后端唯一发参口：全站分享链接上的邀请人 id 由它拼出来（2026-10-04 第二次复查新增）
const LINKS_PHP = path.resolve(ROOT, '../tuzhi-selfbuilt-backend/application/common/library/share/Links.php');

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

let failures = 0;
function assert(name, cond, note) {
  if (!cond) failures++;
  console.log((cond ? '✓ ' : '✗ ') + name + (note === undefined || note === '' ? '' : '   [' + note + ']'));
}
// 要等 promise 链跑完的组（⑬ 顺序、② 尾那条链）登记到这里，收口统一 Promise.all（硬约束 2 同族：
// 门禁自己不等完就汇报，等于把「还没跑到」当成「没通过」，摘掉一段断言它照样报绿）
const pending = [];
const later = (fn) => { pending.push(fn()); };

// 任何成员访问都给一只可调用桩：组件注册表、courseLibrary.xxx() 这类本链路用不到，但不能炸编译
const ANY = new Proxy(function () {}, { get: () => ANY, apply: () => ANY });
const WIN = { addEventListener() {}, removeEventListener() {}, location: { href: '' } };

/* ---------- 真实的 live-inviter util（只把 uni 桩掉，逻辑一行不改） ---------- */
function loadInviterUtil(uni) {
  const src = read(UTIL)
    .replace(/export\s+default[^\n]*\n?/g, '')
    .replace(/export\s+function/g, 'function');
  return new Function('uni', src + '\nreturn { rememberInviter, resolveInviter, inviterFromParams };')(uni);
}

/* ---------- 页面脚本：抽 <script> 体，import 全桩成 no-op，只有被测的 util 引真件 ---------- */
function loadPage(rel, env) {
  let src = read(rel)
    .replace(/^[\s\S]*?<script[^>]*>/, '')
    .replace(/<\/script>[\s\S]*$/, '')
    .replace(/export\s+default/, 'module.exports =');
  // 被测的那一条 import 必须吃真实 util（顺序在前，先替换掉）
  src = src.replace(
    /^import\s*\{([^}]*)\}\s*from\s*["']@\/common\/utils\/live-inviter["'];?\s*$/gm,
    (m, names) => 'const {' + names + '} = __LIVE_INVITER__;'
  );
  src = src.replace(
    /^import\s*\{([^}]*)\}\s*from\s*["'][^"']*["'];?\s*$/gm,
    (m, names) => 'const ' + names.trim().split(',').map((n) => n.trim()).filter(Boolean).map((n) => n + ' = __ANY__').join(', ') + ';'
  );
  src = src.replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, 'const $1 = __ANY__;');
  src = src.replace(/^import\s+["'][^"']*["'];?\s*$/gm, '');
  const m = { exports: {} };
  new Function(
    'module', 'exports', 'uni', 'window', 'setTimeout', 'clearTimeout', '__ANY__', '__LIVE_INVITER__',
    src
  )(m, m.exports, env.uni, WIN, () => 0, () => {}, ANY, env.liveInviter);
  return m.exports;
}

/* ---------- 一份 storage 桩，详情页与直播间页共用（跨页接力就验在这一处） ---------- */
function makeEnv() {
  const storage = { user_token: 'tok-invitee' };
  const env = {
    storage,
    requests: [],
    uni: {
      getStorageSync: (k) => (storage[k] === undefined ? '' : storage[k]),
      setStorageSync: (k, v) => { storage[k] = v; },
      removeStorageSync: (k) => { delete storage[k]; },
      // 详情页 onLoad 现在要注册「支付成功」监听（回收购买态那一条链），桩要有这一对面才装得起来
      $on: () => {},
      $off: () => {},
      showToast: () => {},
      showModal: () => {},
      hideLoading: () => {},
      stopPullDownRefresh: () => {},
      setNavigationBarTitle: () => {},
      stopPullDownRefresh: () => {},
    },
    tools: { systemConfig: () => true, cachedUser: () => ({ id: 1000012271 }) },
    $api: null,
    liveInviter: null,
  };
  env.$api = function (name, params, extra) {
    // 第三参也要记下来：第 ⑮ 组断的是「归因这一发有没有按静默请求发」，
    // 只看源码里的字面量不算（拼串与漏传都长得一样）
    env.requests.push({ name, params, extra });
    // 真 Promise：详情页 getData 现在把「归因 → course.detail」串成一条链，
    // 桩要是返回假 thenable，链会永不 settle，第 ⑬ 组那条顺序断言就永远等不到 course.detail。
    // course.detail 一律回 code=0 —— 本脚本只验**请求发出顺序**，成功分支会调到
    // loadCircleCourseNav / $nav.share 等一屏方法，没必要为它铺一整套桩。
    return Promise.resolve(name === 'course.detail' ? { code: 0, msg: '门禁不读这一支' } : { code: 1 });
  };
  env.liveInviter = loadInviterUtil(env.uni);
  return env;
}

const detailVm = (opts, env) => {
  const vm = {
    pageParams: {},
    data: {},
    isPageActive: false,
    _inviteRankReported: '',
    _inviteRankNoLogin: false,
    _inviteRankNoInviterWarned: false,
    $api: env.$api,
    finish() {},
    setStudyLog() {},
    playHandle() {},
    $nav: { to() {}, share() {}, parsePageParams: (p) => Object.assign({}, p) },
    $tools: env.tools,
  };
  // 2026-10-09 刷新分层：getData 现在从 fetchDetail 这一个出口打 course.detail，
  // 只挂原来那几个方法会报 TypeError（而不是红在断言上，看不出是接线掉了还是判据错了），
  // 所以这里把 methods 全量绑上——已经单独绑过的那几条保持不动
  Object.keys(opts.methods).forEach((name) => {
    if (!vm[name]) vm[name] = opts.methods[name].bind(vm);
  });
  vm.onLoad = opts.onLoad.bind(vm);
  vm.startLearning = () => opts.methods.startLearning.call(vm);
  // 2026-10-05 起归因上报住在**详情页**（判据 = tuzhi_live_user 有无行进过 live_user，而那张行
  // 正是本页下一次 course.detail 建的，见 Report::enteredBefore()），故这两条挂到详情页 vm 上
  vm.reportInviteRank = () => opts.methods.reportInviteRank.call(vm);
  // 2026-10-05 起分享有礼助力也住在**详情页**（与达人榜同一次「受邀人点开分享链接落到本页」的事实）。
  // 少了这一行挂载，第 ⑭ 组会报 TypeError 而不是红在断言上——那时看不出是接线掉了还是断言写错了
  vm.reportShareGiftAssist = () => opts.methods.reportShareGiftAssist.call(vm);
  vm.getData = (addViews) => opts.methods.getData.call(vm, addViews);
  return vm;
};

const liveVm = (opts, env) => {
  const vm = {
    pageParams: {},
    data: {},
    $api: env.$api,
    $tools: env.tools,
    $refs: {},
    $set() {},
    $nav: { to() {}, parsePageParams: (p) => Object.assign({}, p), share: () => ({}) },
    setContainerHeight() {},
    refresh() {},
    finishRefresh() {},
  };
  Object.defineProperty(vm, 'liveInviterId', { get: () => opts.computed.liveInviterId.call(vm) });
  vm.onLoad = opts.onLoad.bind(vm);
  return vm;
};

const reportReqs = (env) => env.requests.filter((r) => r.name === 'invite_rank.rank.report');

/* ---------- ⓪ 参数名对账：后端**发到线上**的那个名字，客户端必须认（2026-10-05 第三次复查重写） ----------
   这一组不喂任何手写地址，而是**从 Links.php 里反推**后端实际发到 URL 上的 key，
   再断言客户端那一份读法（live-inviter 的 inviterFromParams）认它。
   改了后端参数名而忘了改客户端，这一组立刻红——这正是前几轮"验过还是坏"的那一格。

   ===== 上一版这一组是反推错的，而且错得比看起来严重 =====
   上一版扫的是 `$params['xxx'] = $userId;`，拿到的是 **`getShareParams()` 的输出键**，
   也就是 `share_id` —— **那是输入键，不是线上那一个**。`getShareParams()` 的返回值还要经
   `parseParams()` 改名才落到 URL 上：

       $fields[$type]['share'] = 'share_id';     // Links.php:216 —— 左＝输出键，右＝取值键
       foreach ($fields[$type] as $index => $item){
           if (isset($params[$item])) $data[$index] = $params[$item];   // ⇒ $data['share'] = $params['share_id']
       }

   于是产品发出去的地址是 `…/pages/course/detail/detail?id=4544&**share**=38`，
   而 ⓪ 组钉的是 `share_id` —— **门禁一直在验一个产品从不产生的名字，恒绿、什么都没钉住**。
   更糟的是「后端发 share_id / 端上只认 share」这个**假结论**被 ⓪ 组亲手坐实，
   于是又照着它改了端上别名、改了硬约束 33、把排查引到了后端出链上。
   ⇒ 本组改为反推**改名表的左值**（输出键），右值只当信息打印、不参与断言。 */
(function checkParamNameReconcile() {
  assert('后端 Links.php 在位（这一组靠它反推，读不到就不许静默通过）', fs.existsSync(LINKS_PHP), LINKS_PHP);
  if (!fs.existsSync(LINKS_PHP)) return;

  const php = fs.readFileSync(LINKS_PHP, 'utf8');

  // ① 反推**线上那一个**：`$fields[$type]['<输出键>'] = '<取值键>';`（parseParams 的改名表）
  const emitted = [];
  const inputs = [];
  const re = /\$fields\[\s*\$\w+\s*\]\[\s*['"]([A-Za-z_]\w*)['"]\s*\]\s*=\s*['"]([A-Za-z_]\w*)['"]/g;
  let m;
  while ((m = re.exec(php)) !== null) {
    if (emitted.indexOf(m[1]) < 0) emitted.push(m[1]);
    if (inputs.indexOf(m[2]) < 0) inputs.push(m[2]);
  }
  // ② 兜底：改名表被挪走/改名时，用「赋给 $params 的那个键」顶上，并明确区分二者
  if (emitted.length === 0) {
    const re2 = /\$params\[\s*['"]([A-Za-z_]\w*)['"]\s*\]\s*=\s*\$userId\b/g;
    while ((m = re2.exec(php)) !== null) {
      if (emitted.indexOf(m[1]) < 0) emitted.push(m[1]);
    }
    assert('Links.php 里反推得到邀请人参数名（至少一个）', emitted.length > 0,
      '没找到改名表 `$fields[$type][\'x\'] = \'y\';`，Links.php 改写法了，这一组需要跟着改');
  }
  console.log('   · 后端 getShareParams() 塞进去的键（**输入键，不上线**）：' + (inputs.join(',') || '(没扫到)'));
  console.log('   · 后端 parseParams() 改名后落到 URL 上的键（**线上键**）：' + (emitted.join(',') || '(没扫到)'));
  assert('反推到的是**线上那一个**（改名表左值），不是 $params[...] 的输入键',
    emitted.length > 0 && !inputs.some((k) => emitted.indexOf(k) >= 0 && inputs.indexOf(k) >= 0 && emitted.length === inputs.length && emitted[0] === inputs[0]),
    'emitted=' + JSON.stringify(emitted) + ' inputs=' + JSON.stringify(inputs));

  const { inviterFromParams } = makeEnv().liveInviter;
  emitted.forEach((key) => {
    // ① 这一份读法认它
    assert('客户端 inviterFromParams 认得后端**线上发出来的** `' + key + '`',
      inviterFromParams({ [key]: 38 }) === '38', 'got=' + JSON.stringify(inviterFromParams({ [key]: 38 })));

    // ② 链接直达详情页（海报二维码就是这一落点）：进页就记下，不靠"详情页再中转一次"救
    const envD = makeEnv();
    const vmD = detailVm(loadPage(DETAIL, envD), envD);
    vmD.onLoad({ id: '331', [key]: '38' });
    assert('`' + key + '=38` 直达**详情页**：onLoad 就记下这一间直播间由谁请进来',
      !!envD.storage.live_inviter && String(envD.storage.live_inviter.share) === '38',
      'storage=' + JSON.stringify(envD.storage.live_inviter));

    // ③ 链接直达 → 达人榜归因发得出去（**2026-10-05 起这一跳的落点是详情页**，直播间那枚
    //   `buildInviteLink` 落点仍在，但达人榜归因已搬走，见第 ⑬ 组）
    const envD2 = makeEnv();
    const vmD2 = detailVm(loadPage(DETAIL, envD2), envD2);
    vmD2.onLoad({ id: '331', [key]: '38' });
    vmD2.reportInviteRank();
    const reqD2 = reportReqs(envD2)[0];
    assert('`' + key + '=38` 直达**详情页**：达人榜归因请求发得出去且带着 38',
      !!reqD2 && String(reqD2.params.share) === '38', JSON.stringify(envD2.requests.map((r) => r.name)));

    // ④ 分享有礼读的是同一个 liveInviterId，两插件不许各算各的（同一条链，故同一条断言）
    assert('`' + key + '=38` 落到分享有礼那一侧同样拿得到（live.vue 传的就是 liveInviterId）',
      /:inviter-id="liveInviterId"/.test(read(LIVE_VUE)));
  });

  // ④ 读法收口：两个页面的读点必须走 inviterFromParams，不许再各写一条裸 OR 链
  //    （散着写的代价：后端改一次名字要改三处，漏一处就是这次的现场）
  const raw = read(DETAIL) + '\n' + read(LIVE);
  assert('两个页面的读点都收口到 inviterFromParams（无残留的裸 `share || inviter_id` 链）',
    !/\.share\s*\|\|\s*[\w.]*\.?inviter_id/.test(raw),
    (raw.match(/.{0,40}\.share\s*\|\|\s*[\w.]*\.?inviter_id.{0,20}/) || [''])[0]);
  assert('live-inviter.js 导出 inviterFromParams', /export\s+function\s+inviterFromParams/.test(read(UTIL)));
})();

/* ---------- ① util 本体：按课程隔离，跨课程一律给空 ---------- */
(function checkUtil() {
  const { rememberInviter, resolveInviter } = makeEnv().liveInviter;
  rememberInviter(331, 38);
  assert('util：同一直播间能取回邀请人', resolveInviter(331) === '38', 'got=' + resolveInviter(331));
  assert('util：换一间直播间取不到（不许把上一场请的人算到这一场，PRD §12.3-12）',
    resolveInviter(2736) === '', 'got=' + resolveInviter(2736));
  rememberInviter('331', '45');
  assert('util：同一直播间以最后一次点击为准', resolveInviter(331) === '45', 'got=' + resolveInviter(331));
  rememberInviter(331, '');
  assert('util：链接不带 share 时不写、也不抹掉已有的', resolveInviter(331) === '45', 'got=' + resolveInviter(331));
  assert('util 不吃全站那份跨课程的 storage.share（那份是分销口径，回落它等于串场）',
    !/getStorageSync\((["'])share\1\)/.test(read(UTIL)));
})();

/* ---------- ② 详情页 → 直播间这一跳：URL 必须把邀请人带过去（现场丢的就是这一跳） ---------- */
(function checkDetailHop() {
  const env = makeEnv();
  const detail = loadPage(DETAIL, env);
  const vm = detailVm(detail, env);
  vm.onLoad({ id: '331', share: '38' });
  assert('详情页 onLoad：链接上的 share 已按课程记进 storage',
    env.storage.live_inviter && String(env.storage.live_inviter.course_id) === '331'
      && String(env.storage.live_inviter.share) === '38', JSON.stringify(env.storage.live_inviter));

  vm.data = { type: 'live', id: 331, subscription: 1 };
  let url = '没跳转';
  vm.$nav.to = (u) => { url = u; };
  vm.startLearning();
  assert('详情页跳直播间的 URL 带上 share=38', /&share=38(&|$)/.test(url), url);

  // URL 上已经没有 share（登录往返、支付回程那一族）时，仍然吃记住的那一份
  const env2 = makeEnv();
  env2.liveInviter.rememberInviter(331, 38);
  const detail2 = loadPage(DETAIL, env2);
  const vm2 = detailVm(detail2, env2);
  vm2.onLoad({ id: '331' });
  vm2.data = { type: 'live', id: 331, subscription: 1 };
  let url2 = '没跳转';
  vm2.$nav.to = (u) => { url2 = u; };
  vm2.startLearning();
  assert('详情页 URL 没有 share 时，跳转仍吃记住的那一份', /&share=38(&|$)/.test(url2), url2);

  // 上一场记住的人不许带进这一场
  const env3 = makeEnv();
  env3.liveInviter.rememberInviter(2736, 38);
  const detail3 = loadPage(DETAIL, env3);
  const vm3 = detailVm(detail3, env3);
  vm3.onLoad({ id: '331' });
  vm3.data = { type: 'live', id: 331, subscription: 1 };
  let url3 = '没跳转';
  vm3.$nav.to = (u) => { url3 = u; };
  vm3.startLearning();
  assert('别的直播间记住的邀请人不带进这一场', url3.indexOf('share=') < 0, url3);

  // **产品实际发出的形状**：`Links::getLink()` 出的链接，形如 `…/detail?id=331&share=38`。
  // 2026-10-04 第二次复查曾把这几组写成 `share_id=38`，并据此得出"后端发 share_id、端上只认 share"的
  // **假结论**；2026-10-05 第三次复查查实：线上那一个是 `share`（`parseParams` 改名表的左值，
  // `share_id` 只是 `getShareParams()` 的输入键）。这里按真形状重跑，并保留一句反向断言：
  // 产品**从不**发出 `share_id` —— 若哪天有人改回去，这一组会先红。
  const envR = makeEnv();
  const vmR = detailVm(loadPage(DETAIL, envR), envR);
  vmR.onLoad({ id: '331', share: '38' });
  vmR.data = { type: 'live', id: 331, subscription: 1 };
  let urlR = '没跳转';
  vmR.$nav.to = (u) => { urlR = u; };
  vmR.startLearning();
  assert('产品实际发出的链接（share=38）跳进直播间时带上 &share=38',
    /&share=38(&|$)/.test(urlR), urlR);
})();

later(async function checkDetailReportChain() {
  // 整条链走完：**2026-10-05 起归因不再经直播间中转**——详情页自己就地发，
  // 直播间的 redirectTo 那一跳与达人榜归因已彻底解耦（分享有礼的助力仍在直播间那一页）。
  // 上一版这里断言的是「详情页 → 直播间 → 上报」，那条路现在不再存在了。
  const liveSrc = read(LIVE);
  assert('归因已从直播间页迁到详情页：live/js.vue 不再有 reportInviteRank 的定义或调用',
    !/reportInviteRank\s*\(/.test(liveSrc), (liveSrc.match(/.*reportInviteRank.*/) || [''])[0]);
  const envC = makeEnv();
  const vmC = detailVm(loadPage(DETAIL, envC), envC);
  vmC.onLoad({ id: '331', share: '38' });
  vmC.getData();
  await new Promise((r) => setTimeout(r, 0));
  const reqC = reportReqs(envC)[0];
  assert('整条链（share=38 链接 → 详情页）跑完确实发出归因上报，不必再跳一次直播间',
    !!reqC && String(reqC.params.share) === '38', JSON.stringify(envC.requests.map((r) => r.name)));
});

/* ---------- ③ 直播间：归因上报的邀请人来源 ---------- */
(function checkDetailReport() {
  // 2026-10-05：这一组整体从**直播间页**搬到**课程详情页**。搬迁的根因是产品规则本身——
  // 用户点名「被邀请要排除已经进过直播间的人，不要重复触发邀请成功」，而后端唯一可靠的
  // 「进来过没有」判据是 tuzhi_live_user 有没有 (受邀人, 这间) 那一行，而那张行正是本页
  // 下一次 `course.detail` 建的（api/controller/course/Course.php 的 detail() 调 joinLive）。
  // 于是「第一次到这一间的人」与「早进来过的人」只能靠**发的先后**分开，见第 ⑬ 组。
  const env = makeEnv();
  const vm = detailVm(loadPage(DETAIL, env), env);
  vm.onLoad({ id: '331', share: '38' });
  vm.reportInviteRank();
  const req = reportReqs(env)[0];
  assert('链接直达详情页：归因上报发出 share=38', req && String(req.params.share) === '38',
    JSON.stringify(req && req.params));
  assert('上报带的是这一场的课程 id（后端按 (课程, 邀请人, 受邀人) 建归因行）',
    req && String(req.params.course_id) === '331', JSON.stringify(req && req.params));

  const env2 = makeEnv();
  env2.liveInviter.rememberInviter(331, 38);
  const vm2 = detailVm(loadPage(DETAIL, env2), env2);
  vm2.onLoad({ id: '331' });
  vm2.reportInviteRank();
  const req2 = reportReqs(env2)[0];
  assert('本页 URL 无 share（详情页→直播间那一跳回来的形态）：仍按记住的那一份上报 share=38',
    req2 && String(req2.params.share) === '38', JSON.stringify(req2 && req2.params));

  const env3 = makeEnv();
  const vm3 = detailVm(loadPage(DETAIL, env3), env3);
  vm3.onLoad({ id: '331' });
  vm3.reportInviteRank();
  assert('链接没带邀请人、也没记住过：一条上报都不发，不把空邀请人送到后端',
    reportReqs(env3).length === 0, JSON.stringify(env3.requests.map((r) => r.name)));

  const env4 = makeEnv();
  env4.liveInviter.rememberInviter(2736, 38);
  const vm4 = detailVm(loadPage(DETAIL, env4), env4);
  vm4.onLoad({ id: '331' });
  vm4.reportInviteRank();
  assert('别处直播间的记忆不顶到这一场', reportReqs(env4).length === 0,
    JSON.stringify(env4.requests.map((r) => r.name)));

  // 同一场只报一次：onShow 与下拉刷新都会再进 getData，不去重就是同一份邀请关系重复触发
  const envD = makeEnv();
  const vmD = detailVm(loadPage(DETAIL, envD), envD);
  vmD.onLoad({ id: '331', share: '38' });
  vmD.reportInviteRank();
  vmD.reportInviteRank();
  assert('同一场重复触发（onShow / 下拉刷新）：只发一条', reportReqs(envD).length === 1,
    JSON.stringify(envD.requests.map((r) => r.name)));

  assert('直播间 onLoad 仍把链接上的 share 记一份（分享有礼那一跳靠它续）',
    /rememberInviter\(that\.pageParams\.id/.test(read(LIVE)));
})();

/* ---------- ④ 分享有礼的助力读同一份（两插件不许各算各的） ---------- */
(function checkSharedSource() {
  const liveVue = read(LIVE_VUE);
  assert('live.vue：share-gift 的 :inviter-id 读 liveInviterId（与达人榜同一份来源）',
    /:inviter-id="liveInviterId"/.test(liveVue), (liveVue.match(/:inviter-id="[^"]*"/) || [''])[0]);
  assert('live.vue：不再只吃 pageParams（中转进来那一带永远是空）',
    !/:inviter-id="pageParams\./.test(liveVue));
  assert('share-gift-popup 仍在 courseId / inviterId 落齐后补报助力（boot + watch 两条链）',
    /inviterId\(val\)/.test(read(SHARE_GIFT)) && /this\.tryAssist\(\);/.test(read(SHARE_GIFT)));
  assert('直播间两处读点都不许碰全站那份 storage.share',
    !/getStorageSync\((["'])share\1\)/.test(read(LIVE) + liveVue));
})();

/* ---------- ⑤ 未登录那一档：不发请求，也不许把「已上报」烧掉（PRD §12.3-2） ----------
   后端 report 对未登录回的是 code=1 / counted=false，与「已上报」在前端完全不可区分：
   照发就会把 _inviteRankReported 占住，登录之后这一场再也不会补报 ——
   症状正是「我明明点了好友链接，榜上却还是没有」。2026-10-04 当晚复查补这一组。 */
(function checkNotLoggedIn() {
  const env = makeEnv();
  delete env.storage.user_token;
  const vm = detailVm(loadPage(DETAIL, env), env);
  vm.onLoad({ id: '331', share: '38' });
  vm.reportInviteRank();
  assert('未登录：一条归因请求都不发（PRD §12.3-2）', reportReqs(env).length === 0,
    JSON.stringify(env.requests.map((r) => r.name)));
  assert('未登录：没有占住「已上报」标记', vm._inviteRankReported === '', vm._inviteRankReported);

  // 登录之后（token 出现，同一个页面实例）下一次取数必须补报得出来
  env.storage.user_token = 'tok-after-login';
  vm.reportInviteRank();
  const req = reportReqs(env)[0];
  assert('登录之后：下一次取数补报成功（share=38）', req && String(req.params.share) === '38',
    JSON.stringify(req && req.params));

  // 同一条闸门，换成**产品实际发出的那个参数名**再走一遍：登录后不得再因为"名字对不上"漏报
  // （2026-10-05 更正：这一组此前喂的是 `share_id` —— 后端 `getShareParams()` 的**输入键**，
  //   产品发到线上的是 `share`，喂错了名字就等于验了一个不存在的场景）
  const env2 = makeEnv();
  const vm2 = detailVm(loadPage(DETAIL, env2), env2);
  vm2.onLoad({ id: '331', share: '38' });
  vm2.data = { id: 331 };
  delete env2.storage.user_token;
  vm2.reportInviteRank();
  assert('未登录 + 产品实际发出的 share=38：同样一条都不发', reportReqs(env2).length === 0,
    JSON.stringify(env2.requests.map((r) => r.name)));
  env2.storage.user_token = 'tok-after-login';
  vm2.reportInviteRank();
  assert('未登录 → 登录后补报（share=38 这一形状也补得出来）',
    reportReqs(env2).length === 1 && String(reportReqs(env2)[0].params.share) === '38',
    JSON.stringify(env2.requests.map((r) => r.name)));
})();

/* ---------- ⑬ 先后顺序：**这一条承重**，2026-10-05 新增 -------------
   用户点名的是「被邀请要排除已经进过直播间的人，不要重复触发邀请成功」。后端据此落了一条
   `Report::enteredBefore()`：查 tuzhi_live_user 有没有 (受邀人, 这间) 那一行，有就是「早进来过」，
   落一行 fail_type=FAIL_ENTERED 不计。**判据成立的前提是端上的先后**——那张行是后端
   `api/controller/course/Course.php` 的 `detail()` 在 `if($row['subscription'])` 里调
   `admin\model\live\User::joinLive()` 建的，而那正是本页下一次 `course.detail` 干的事：
       先发 report  → 行还不存在 → 他是第一次到这一间 → 计入（这才是被邀请链接带来的人）
       后发 report  → 行刚被本次请求自己建好 → 判据恒为「进过」→ **一个人都算不进**
   所以把这一跳挪到 course.detail 之后不是"顺序不好看"，是**把整条排除规则作废**。
   这一组既钉源码里的先后（正则看得见的那一半），也实跑一遍记真发出去的顺序（拼出来的那一半）。 */
later(async function checkReportBeforeDetail() {
  const src = read(DETAIL);
  const iReport = src.indexOf('that.reportInviteRank()');
  const iAssist = src.indexOf('that.reportShareGiftAssist()');
  const iDetail = src.indexOf('that.$api("course.detail"');
  assert('详情页 getData 里有归因上报、分享有礼助力与 course.detail 三跳',
    iReport >= 0 && iAssist >= 0 && iDetail >= 0,
    'report=' + iReport + ' assist=' + iAssist + ' detail=' + iDetail);
  assert('源码里 reportInviteRank 排在 course.detail **之前**（顺序即判据，调换＝整条规则作废）',
    iReport >= 0 && iDetail >= 0 && iReport < iDetail, 'report=' + iReport + ' detail=' + iDetail);
  // 调换两行之外的那条退化路径同样要拦住：把上报塞进 course.detail 的 .then 里，源码顺序看着
  // 还对（第一个出现处仍在前面），实跑顺序已经反了 —— 所以下一条实跑断言不许省
  assert('reportInviteRank 不许藏在 course.detail 的回调里（`.then` 里排第二条）',
    iDetail >= 0 && src.indexOf('that.reportInviteRank()', iDetail) < 0,
    'report@' + src.indexOf('that.reportInviteRank()', iDetail));

  const env = makeEnv();
  const vm = detailVm(loadPage(DETAIL, env), env);
  vm.onLoad({ id: '331', share: '38' });
  vm.getData();
  await new Promise((r) => setTimeout(r, 0));
  const names = env.requests.map((r) => r.name);
  assert('实跑：真发出去的顺序是 invite_rank.rank.report → share_gift.gift.assist → course.detail',
    names.length >= 3 && names[0] === 'invite_rank.rank.report'
    && names[1] === 'share_gift.gift.assist' && names[2] === 'course.detail',
    JSON.stringify(names));

  // 后端那一半：Report::enteredBefore() 查的那张表，必须还是 joinLive 建的那一张，
  // 且建它的必须是 course.detail —— 端上顺序钉住了，这两处才共同构成判据
  const backend = path.resolve(ROOT, '../tuzhi-selfbuilt-backend');
  const report = fs.readFileSync(path.join(backend,
    'application/common/library/app/invite_rank/Report.php'), 'utf8');
  const course = fs.readFileSync(path.join(backend,
    'application/api/controller/course/Course.php'), 'utf8');
  assert('后端 Report::enteredBefore() 查的就是 tuzhi_live_user',
    /function enteredBefore[\s\S]{0,600}live_user/.test(report));
  assert('建 tuzhi_live_user 的正是 course/Course.php 的 joinLive（端上那一跳的另一半）',
    /joinLive\(/.test(course));
});

/* ---------- ⑭ 分享有礼助力：与达人榜**同一次「受邀人点开链接落到详情页」**（2026-10-05 新增） ---------
   用户原话：「只有邀请达人榜正确的显示了邀请记录，但是分享有礼的邀请，并没有生效」。
   现场形状：app_invite_rank_visit 有 (邀请人 27 → 受邀人 486, course 4776) 一行，
             app_share_gift_assist 整场 0 行 —— 同一个受邀人、同一场直播，两张表一有一无。

   根因不是后端（Gift::assist / Assist::join 那一路查过了，没有任何一条能拒这一对 id），
   是**落点页 ≠ 上报页**：达人榜在详情页发，助力只等 `share-gift-popup` 的 `tryAssist`，
   而受邀人点开链接后落在详情页，**要等他再点一次「进入直播间」**才有机会发出去。
   PRD 附录那一段自己认的「进入直播间」事实就是 `joinLive` 写的那张 tuzhi_live_user 行，
   而那张行正是详情页的 course.detail 建的 ⇒ 助力以详情页这一次事实为准，与达人榜对齐。

   本组钉住的是**四档必须发**与**三档必须不发**：
     发 —— 有邀请人 + 已登录 + 插件在装（达人榜那一套判据，同一份 liveInviter 口径）；
     不发 —— 插件未装 / 无邀请人 / 未登录（发一记注定失败的请求会把「已上报」标记烧掉）。
   外加「重复触发只发一次」与「失败撤标记、下次补发」两条——这两条少一条，
   现场就会表现成「第一次进页面时接口正好抖了一下，之后再怎么刷都是空的」。 */
later(async function checkShareGiftAssistOnDetail() {
  const src = read(DETAIL);
  assert('详情页有 reportShareGiftAssist 这一发（助力与达人榜同页同一次事实）',
    /reportShareGiftAssist\s*\(\s*\)\s*\{/.test(src));
  assert('reportShareGiftAssist 排在 course.detail **之前**（它记的是「进来过」这一事实）',
    src.indexOf('that.reportShareGiftAssist()') >= 0
    && src.indexOf('that.reportShareGiftAssist()') < src.indexOf('that.$api("course.detail"'));

  const assistReqs = (env) => env.requests.filter((r) => r.name === 'share_gift.gift.assist');

  // 正向：链接带 share=38 进详情页 → 详情页自己就发出助力
  const env1 = makeEnv();
  const vm1 = detailVm(loadPage(DETAIL, env1), env1);
  vm1.onLoad({ id: '331', share: '38' });
  vm1.getData();
  await new Promise((r) => setTimeout(r, 0));
  assert('链接直达详情页：助力当拍就发（不用再点一次「进入直播间」）',
    assistReqs(env1).length === 1, JSON.stringify(env1.requests.map((r) => r.name)));
  assert('助力带的是这一场的课程 id 与这一位的邀请人 id',
    assistReqs(env1).length === 1
    && String(assistReqs(env1)[0].params.course_id) === '331'
    && String(assistReqs(env1)[0].params.inviter_id) === '38',
    JSON.stringify(assistReqs(env1)[0] && assistReqs(env1)[0].params));

  // 本页 URL 无 share（详情页 → 直播间那一跳回来的形态）：仍吃 live-inviter 记住的那一份
  const env2 = makeEnv();
  const vm2 = detailVm(loadPage(DETAIL, env2), env2);
  vm2.onLoad({ id: '331', share: '38' });
  env2.liveInviter.rememberInviter('331', '38');
  vm2.pageParams = { id: '331' };
  vm2.getData();
  await new Promise((r) => setTimeout(r, 0));
  assert('本页 URL 无 share：仍按记住的那一份补发助力 invite_id=38',
    assistReqs(env2).some((r) => String(r.params.inviter_id) === '38'),
    JSON.stringify(assistReqs(env2).map((r) => r.params)));

  // 重复触发（onShow / 下拉刷新）：只发一条
  const env3 = makeEnv();
  const vm3 = detailVm(loadPage(DETAIL, env3), env3);
  vm3.onLoad({ id: '331', share: '38' });
  vm3.getData();
  vm3.getData();
  vm3.getData();
  await new Promise((r) => setTimeout(r, 0));
  assert('同一场重复触发（onShow / 下拉刷新）：只发一条助力', assistReqs(env3).length === 1,
    JSON.stringify(assistReqs(env3).map((r) => r.params)));

  // 失败那一支：撤掉「已上报」标记，下一次 getData 补发（不撤 = 现场永久空白）
  const env4 = makeEnv();
  env4.$api = (name) => {
    env4.requests.push({ name, params: {} });
    return Promise.resolve({ code: 0, msg: '本直播当前没有进行中的分享有礼活动' });
  };
  const vm4 = detailVm(loadPage(DETAIL, env4), env4);
  vm4.onLoad({ id: '331', share: '38' });
  vm4.getData();
  await new Promise((r) => setTimeout(r, 0));
  vm4.getData();
  await new Promise((r) => setTimeout(r, 0));
  assert('第一发失败（没有进行中的活动）之后还能补发，不被标记永久挡住',
    assistReqs(env4).length === 2, JSON.stringify(assistReqs(env4).length));

  // 不发那一档①：没有邀请人
  const env5 = makeEnv();
  const vm5 = detailVm(loadPage(DETAIL, env5), env5);
  vm5.onLoad({ id: '331' });
  vm5.getData();
  await new Promise((r) => setTimeout(r, 0));
  assert('链接没带邀请人、也没记住过：一条助力都不发，不把空邀请人送到后端',
    assistReqs(env5).length === 0, JSON.stringify(assistReqs(env5).length));

  // 不发那一档②：未登录
  const env6 = makeEnv();
  env6.storage.user_token = '';
  const vm6 = detailVm(loadPage(DETAIL, env6), env6);
  vm6.onLoad({ id: '331', share: '38' });
  vm6.getData();
  await new Promise((r) => setTimeout(r, 0));
  assert('未登录：一条助力都不发（后端对未登录回 code!=0，照发等于把标记烧掉）',
    assistReqs(env6).length === 0, JSON.stringify(assistReqs(env6).length));
  assert('未登录：没有占住「已上报」标记',
    String(vm6._shareGiftAssistReported || '') === '', vm6._shareGiftAssistReported);

  // 不发那一档③：付费插件未安装（代码即插件）—— systemConfig 那一枚在
  const env7 = makeEnv();
  env7.tools.systemConfig = (k) => (k === 'app_isinstall_share_gift' ? false : true);
  const vm7 = detailVm(loadPage(DETAIL, env7), env7);
  vm7.onLoad({ id: '331', share: '38' });
  vm7.getData();
  await new Promise((r) => setTimeout(r, 0));
  assert('分享有礼插件未安装：一条助力都不发（接口与后端类都不存在，发了必然报错）',
    assistReqs(env7).length === 0, JSON.stringify(assistReqs(env7).length));

  // 直播间页那一发不许被拆掉：它替邀请人记一笔归因（app_share_gift_assist），与界面无关。
  // 2026-10-06 用户点名「被邀请的用户进入直播间后，不要弹出来」⇒ 这一发仍在、弹窗那一层撤干净。
  // 撤干净分三处断言（组件文件 / 挂载点 / 状态字段）。**判之前先剥注释**：本仓的惯例是把被撤掉的东西
  // 写在注释里说明来历，不剥的话「assist-tip 已删」这一句自己就把正则撞红
  const jsOnly = (src) => src.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const giftJs = jsOnly(read(SHARE_GIFT));
  assert('直播间页的 tryAssist 仍在（助力这一发要落库，与弹不弹窗无关）',
    /tryAssist\(\)\s*\{/.test(giftJs)
    && /this\.\$api\(['"]share_gift\.gift\.assist['"]/.test(giftJs));
  assert('受邀人进房不再弹窗（assist-tip 整层撤干净：组件文件、挂载点、状态字段三处都不留）',
    !fs.existsSync(path.join(ROOT, 'src/pages/course/live/share-gift/assist-tip.vue'))
    && !/<assist-tip|assistTip/.test(jsOnly(read(SHARE_GIFT_VUE)))
    && !/assistShow|assistData|joinByInvite/.test(giftJs));
  assert('页面那一条 @assist → onShareGiftAssist 的接线一起撤（跨组件边界的接线要逐跳核，硬约束 27③）',
    !/@assist=/.test(jsOnly(read(LIVE_VUE))) && !/onShareGiftAssist/.test(jsOnly(read(LIVE))));
  assert('助力成功不再置任何弹窗状态、失败只进 console（这一发不是用户点出来的，不许凭空弹一句提示）',
    // 从 tryAssist **方法定义**那一处起切（boot/reload 里的 `this.tryAssist();` 在它之前，
    // 拿 'tryAssist()' 去 indexOf 会切到 openDetail 那句提示上，把门禁自己判红）
    !/uni\.showToast/.test(giftJs.slice(giftJs.indexOf('tryAssist() {')))
    && /console\.warn\('\[share_gift\] 助力上报未成功/.test(giftJs)
    && /console\.warn\('\[share_gift\] 助力上报请求失败/.test(giftJs));
  const sg = fs.readFileSync(path.resolve(ROOT,
    '../tuzhi-selfbuilt-backend/application/api/controller/app/share_gift/Gift.php'), 'utf8');
  assert('后端 assist 接口仍在同一路径上（两发打的是同一个出口）',
    /function assist\s*\(/.test(sg) && /Assist::join/.test(sg));
});

/* ---------- ⑮ 归因那一发必须是「静默请求」（2026-10-06 用户点名「被邀请的用户进入直播间后，不要弹出来」） ----------
   弹窗删掉之后还剩一条会弹的路：**请求层**对 `code=0` 自己弹一句后端 msg（1 秒 + mask），
   而 `share_gift/gift/assist` 在「本场没有进行中的活动」「活动已结束」两档回的正是在这里——
   受邀人一进房就凭空冒一句，与他刚点开的这条链接有关、与他要做的事无关。
   这一组跑的是仓库里那一份 `common/request/index.js`（只把 uview 的 Request 类换成一只
   收拦截器与出参的桩），钉的是「api() 有没有把 custom 透传下去」+「拦截器读的是不是
   response.config.custom.noToast 这一行」+「默认调用点一句不少」，
   不照抄一份判断逻辑（硬约束 33②：工具自己重建一遍要验的东西，就永远是绿的）。 */
const REQUEST_INDEX = 'src/common/request/index.js';
const API_LIST = 'src/common/request/api_list.js';
const REQUEST_CLASS = 'src/common/request/request.js';

function loadApiLayer() {
  const lm = { exports: {} };
  new Function('module', 'window', 'uni',
    read(API_LIST).replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, 'const $1 = {};')
      .replace(/export\s+default/, 'module.exports ='))(lm, WIN, { getStorageSync: () => '' });
  const apiList = lm.exports;
  const env = { toasts: 0, lastOptions: null, interceptors: {} };
  class FakeRequest {
    get interceptor() {
      return {
        request: (cb) => { env.interceptors.req = cb; },
        response: (cb) => { env.interceptors.res = cb; },
      };
    }
    request(options) { env.lastOptions = options; return Promise.resolve({}); }
  }
  const src = read(REQUEST_INDEX)
    .replace(/^import\s+Request\s+from\s*["'][^"']*["'];?\s*$/m, '')
    .replace(/^import\s+apiList\s+from\s*["'][^"']*["'];?\s*$/m, 'const apiList = __API_LIST__;')
    .replace(/^export default function api/m, 'function api') + '\nreturn api;';
  const quiet = { log() {}, warn() {}, error() {} };
  env.api = new Function('Request', 'uni', 'console', 'getCurrentPages', '__API_LIST__', 'window',
    'var module = { exports: {} };' + src)(
    FakeRequest,
    { getStorageSync: () => 'tok-invitee', showToast: () => { env.toasts++; },
      hideLoading: () => {}, showModal: () => {}, setStorageSync: () => {}, removeStorageSync: () => {} },
    quiet, () => [{ $page: { fullPath: '/x' }, __page__: { fullPath: '/x' } }], apiList, WIN);
  env.api('share_gift.gift.assist', { course_id: 331, inviter_id: 38 }, { custom: { noToast: true } });
  return env;
}

later(async function checkSilentAssistRequest() {
  const layer = loadApiLayer();
  const assistKey = layer.lastOptions;
  assert('⑮ api() 把第三参的 custom 透传进请求配置（noToast 到得了拦截器）',
    assistKey && assistKey.custom && assistKey.custom.noToast === true,
    JSON.stringify(assistKey && assistKey.custom));
  // 真拦截器实跑两档：带 noToast 一句不弹；不带的照旧弹（默认行为一个字节没改）
  const resp = (cfg) => layer.interceptors.res({ data: { code: 0, msg: '本直播当前没有进行中的分享有礼活动' }, config: cfg });
  layer.toasts = 0; resp({ custom: { noToast: true } });
  assert('⑮ 带 noToast 的 code=0：请求层那一句黑 toast 不弹（这一发不是用户点出来的）',
    layer.toasts === 0, `实弹 ${layer.toasts} 次`);
  layer.toasts = 0; resp({ custom: {} });
  assert('⑮ 不带 noToast 的 code=0：全站既有那一句仍然弹（默认行为没被顺手改掉）',
    layer.toasts === 1, `实弹 ${layer.toasts} 次`);
  layer.toasts = 0; resp(undefined);
  assert('⑮ 老调用点没有 response.config 也不炸（判据读点带 || 兜底）', layer.toasts === 1);
  // request.js 那三行是这条链的承重墙：options.custom 收下 → 留给 handleRe → 挂到 response.config。
  // 它自己没被改动，但谁把它重构掉，上面那两条就红了，所以这一处只钉「三行都还在」
  const reqCls = read(REQUEST_CLASS);
  assert('⑮ request.js 仍把 options.custom 收进 handleRe 并挂到 response.config（noToast 走得到拦截器的那条路）',
    /options\.custom\s*=\s*\{/.test(reqCls) && /response\.config\s*=\s*handleRe/.test(reqCls)
    && /handleRe = \{\s*\n?\s*\.\.\.this\.requestBeforeFun\(options, cancel\)/.test(reqCls));

  // 两处调用点都必须真的带上这一参（源码字面量不算，实跑取请求记录）
  const envA = makeEnv();
  const vmA = detailVm(loadPage(DETAIL, envA), envA);
  vmA.onLoad({ id: '331', share: '38' });
  vmA.getData();
  await new Promise((r) => setTimeout(r, 0));
  const fromDetail = envA.requests.filter((r) => r.name === 'share_gift.gift.assist');
  assert('⑮ 详情页那一发带 noToast（受邀人落到详情页那一刻也不许冒一句）',
    fromDetail.length === 1 && fromDetail[0].extra && fromDetail[0].extra.custom
    && fromDetail[0].extra.custom.noToast === true,
    JSON.stringify(fromDetail.map((r) => r.extra)));

  const envG = makeEnv();
  const giftOpts = loadPage(SHARE_GIFT, envG);
  const vmG = Object.assign({}, typeof giftOpts.data === 'function' ? giftOpts.data() : {}, {
    courseId: 331, inviterId: '38', $api: envG.$api, $tools: envG.tools, $emit() {},
  });
  Object.keys(giftOpts.methods || {}).forEach((k) => { vmG[k] = (...a) => giftOpts.methods[k].apply(vmG, a); });
  vmG.tryAssist();
  await new Promise((r) => setTimeout(r, 0));
  const fromLive = envG.requests.filter((r) => r.name === 'share_gift.gift.assist');
  assert('⑮ 直播间那一发带 noToast，且失败两支都只进 console',
    fromLive.length === 1 && fromLive[0].extra && fromLive[0].extra.custom
    && fromLive[0].extra.custom.noToast === true,
    JSON.stringify(fromLive.map((r) => r.extra)));
});

// 上面几组是 async（要等 promise 链跑完），收口统一 Promise.all —— 否则它们还没跑到
// 就已经按 failures 汇报并 exit，等于把「还没跑」当成「跑过了」
Promise.all(pending).then(() => {
  console.log(failures === 0 ? '\n全部符合预期' : '\n有 ' + failures + ' 项不符合预期');
  process.exit(failures === 0 ? 0 : 1);
});
