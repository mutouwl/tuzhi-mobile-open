/**
 * M-P4 赠送记录页（pages/app/send_friend/gift）—— 不构建、不开浏览器
 *
 * 钉七件事（这一族的坏法都在本仓点过名）：
 *  ① 页签 = 礼单状态机那三档 + 全部（2026-10-20 取消待领取），且「全部」那一档不发 status 参数；
 *  ② 回体里的 total 必须在界面上有一处消费（硬约束 32②：拿 rows.length 当总数 = 静默截断没人发现），
 *     上拉加载的收口吃 total / 后端 has_more，不吃「本页有几行」；2026-10-27 用户点名去掉头部
 *     那条「共 N 份」，消费点只剩上拉收口（见 ⑮ 钉下线后的零残留）；
 *  ③ 骨架必须待在真实那一行的外壳里（M16/硬约束 12：在纯白面板上另铺一棵灰块树 = 加载完整体换版）；
 *  ④ 加载态不许退化成 `u-loading-page`/`tz-loading-page`/转圈 + 「加载中」文字块；
 *  ⑤ 退回本页由本页自己在 onShow 静默重取，且不把 loading 翻回 true（M23/硬约束 16），
 *     禁止离开的子页在 onUnload 里 getCurrentPages()[length-2].$vm.getData() 跨页替上级取数；
 *  ⑥ 封面地址这类外部串作 data 的键必过 mpKey()，读写两头都要（M27/硬约束 25）：
 *     只改写点 ⇒ 兜底图静默失效；写成裸地址当键 ⇒ 微信把点当嵌套路径解析，整拍 setData 被丢掉；
 *  ⑦ 未装闸门 / 未登录两档都不发那条必然失败或必然被 cancel 的请求（M14/M13）；
 *  ⑧ 列表里的两处图（领取人头像、商品封面）取不到时都必须落到一张默认图（⑯，2026-10-29 用户点名）。
 *
 * 用法：node tuzi-mobile/scripts/check-send-friend-gift.js            # 验真件
 *       node tuzi-mobile/scripts/check-send-friend-gift.js --selftest # 验这道门禁「能红」
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'src/pages/app/send_friend/gift');
const JS = path.join(DIR, 'js.vue');
const VUE = path.join(DIR, 'gift.vue');
const CSS = path.join(DIR, 'css.css');
const RECEIVE_DIR = path.join(ROOT, 'src/pages/app/send_friend/receive');
const AREA = path.join(ROOT, 'src/components/tz/send-friend-area.vue');
const SHARE_MODAL = path.join(ROOT, 'src/components/modal/share-modal.vue');
const API_LIST = path.join(ROOT, 'src/common/request/api_list.js');
// 条目卡（封面归它管，见 ⑥；兜底图见 ⑯）
const COURSE_MINI = path.join(ROOT, 'src/components/tz/course-mini.vue');

// 坏样件故意留一支没有 .catch 的取数链，这里只出声、不改判定（真件的 reject 分支自己写了 catch）
process.on('unhandledRejection', (e) => { console.log('[note] 未处理的 promise 拒绝（坏样件故意留的那一支）：' + (e && e.message)); });
const REAL_SETTIMEOUT = setTimeout;
const tick = () => new Promise((r) => REAL_SETTIMEOUT(r, 5));

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
  if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  return !!ok;
}
const read = (f) => fs.readFileSync(f, 'utf8');
const scriptOf = (f) => (read(f).match(/<script[^>]*>([\s\S]*?)<\/script>/) || [])[1] || '';
/** 根 template 的内容：非贪婪正则会在第一个内层 </template> 上截断（假绿），所以按首尾定位 */
function templateText(src) {
  const m = src.match(/<template[^>]*>/);
  if (!m) return '';
  const at = src.indexOf(m[0]);
  const end = src.lastIndexOf('</template>');
  return end <= at ? '' : src.slice(at + m[0].length, end);
}
const templateOf = (f) => templateText(read(f));
const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/[^\n]*/gm, ' ');

/**
 * 页尾两枚常驻组件是否在位（`<tz-tab-bar />` + `<tz-footer />`）——打卡族 / 优惠券族同一档。
 * 2026-10-19 用户点名「拼团与送礼物的移动端页面底部为什么没有 TZ Tabbar 和 TZ Footer」：
 * 送礼物那一族当时 gift 页两枚都缺、receive 页只有页脚没有导航条，**同一功能族两页形态不一致**
 * 正是这类漏的形态（sfc-check 只编译模板、ui-audit 只按正则查版式，都看不见「少挂了一整枚组件」）。
 */
function checkPageTail(tpl, name) {
  const flat = stripComments(tpl);
  const miss = [];
  if (!/<tz-tab-bar\b/.test(flat)) miss.push('缺 <tz-tab-bar />');
  if (!/<tz-footer\b/.test(flat)) miss.push('缺 <tz-footer />');
  return { ok: miss.length === 0, got: (name || '') + (miss.length ? miss.join('、') : '两枚都在位') };
}

function bodyOf(code, signature) {
  const at = code.search(signature);
  if (at < 0) return null;
  const open = code.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') { depth--; if (!depth) return code.slice(open + 1, i); }
  }
  throw new Error(String(signature) + ' 的大括号没配平');
}
const classes = (tag) => ((/class="([^"]*)"/.exec(tag) || [])[1] || '').trim().split(/\s+/).filter(Boolean);

/** 真 mpKey 的口径：把点与特殊字符吃掉；桩照同一口径实现，读写两头不一致时断言必然翻红 */
function loadMpKey() {
  const f = path.join(ROOT, 'src/common/utils/mp-data-key.js');
  try {
    const src = read(f).replace(/export\s+function/g, 'function').replace(/export\s+default[^\n]*/g, '');
    // eslint-disable-next-line no-new-func
    const fn = new Function(src + '\nreturn typeof mpKey === "function" ? mpKey : null;')();
    if (typeof fn === 'function') return fn;
  } catch (e) { /* 落到下面的兜底桩 */ }
  return (v) => String(v).replace(/[^0-9A-Za-z_-]/g, '_');
}
const MPKEY = loadMpKey();

function makeEnv(opt) {
  const o = opt || {};
  const env = { calls: [], toasts: [], traces: [], stops: 0, nav: [], emits: [] };
  env.uni = {
    getStorageSync: (k) => (k === 'user_token' ? (o.token === undefined ? 'tok' : o.token) : ''),
    setStorageSync: () => {},
    showToast: (a) => { env.toasts.push((a && a.title) || ''); },
    navigateBack: () => { env.traces.push('navigateBack'); },
    stopPullDownRefresh: () => { env.stops++; env.traces.push('stop'); },
    showLoading: () => {}, hideLoading: () => {},
    createSelectorQuery: () => ({ in: () => ({ exec: (cb) => cb([]) }) }),
    getSystemInfoSync: () => ({ windowHeight: 700 }),
    $u: { toast: () => {} },
  };
  env.$tools = { systemConfig: (k) => (k === 'app_isinstall_send_friend' ? (o.install === undefined ? 1 : o.install) : ''), copy: () => {} };
  // 付费插件三态闸门（`common/utils/plugin-guard.js`）的桩：已装/未装/未回包三档由 installState 给；
  // onSystemConfigReady 收着回调，测试里由 fireReady() 手动放行（与真实现的「init 回包后重判」同一档）
  env.installState = o.installState === undefined ? (o.install === undefined ? true : !!Number(o.install)) : o.installState;
  env.readyCbs = [];
  env.fireReady = (state) => {
    env.installState = state === undefined ? true : state;
    const cbs = env.readyCbs.slice();
    env.readyCbs = [];
    cbs.forEach((cb) => cb());
  };
  env.$api = function (name, params) {
    env.calls.push({ name, params });
    if (name === 'send_friend.gift.list') {
      if (o.listFail) return Promise.reject(new Error('network down'));
      return Promise.resolve(o.list || { code: 1, msg: 'ok', data: { total: 0, rows: [] } });
    }
    if (name === 'send_friend.gift.share') {
      if (o.shareFail) return Promise.reject(new Error('network down'));
      return Promise.resolve(o.share || { code: 1, msg: 'ok', data: {} });
    }
    return Promise.resolve({ code: 1, msg: 'ok', data: {} });
  };
  env.$nav = { parsePageParams: (p) => p, to: (d, t, m) => { env.nav.push({ d, t, m }); }, share: () => ({ title: 't', path: 'p' }) };
  env.mpKey = MPKEY;
  env.setTimeout = (fn, ms) => { env.traces.push('timer:' + ms); return 1; };
  env.clearTimeout = () => {};
  return env;
}

function loadOptions(code, env) {
  let src = code.replace(/export\s+default/, 'module.exports =');
  src = src.replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, 'const $1 = {};');
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']*["'];?\s*$/gm, (m, names) =>
    'const ' + names.split(',').map((s) => s.trim()).filter(Boolean)
      .map((n) => n + ' = __imports(' + JSON.stringify(n) + ')').join(', ') + ';');
  const mod = { exports: {} };
  const imports = (n) => {
    if (n === 'mpKey') { return env.mpKey; }
    if (n === 'pluginState') { return () => env.installState; }
    if (n === 'pluginMissing') { return () => !!o.pluginMissing; }
    if (n === 'onSystemConfigReady') {
      return (cb) => { if (typeof cb === 'function') { env.readyCbs.push(cb); } return () => { env.readyCbs = env.readyCbs.filter((f) => f !== cb); }; };
    }
    return env.mpKey;
  };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', 'uni', '__imports', 'setTimeout', 'clearTimeout', src)(
    mod, mod.exports, env.uni, imports, env.setTimeout, env.clearTimeout
  );
  return mod.exports;
}

function buildVm(code, opt) {
  const env = makeEnv(opt);
  const options = loadOptions(code, env);
  const vm = Object.assign({}, typeof options.data === 'function' ? options.data() : {});
  Object.keys(options.computed || {}).forEach((k) => {
    Object.defineProperty(vm, k, { get: () => options.computed[k].call(vm), configurable: true });
  });
  Object.keys(options.methods || {}).forEach((k) => { vm[k] = options.methods[k].bind(vm); });
  vm.$api = env.$api; vm.$tools = env.$tools; vm.$nav = env.$nav;
  vm.$refs = opt && opt.sheet ? { sheet: { open: (row) => env.traces.push('sheet.open:' + row.id) } } : {};
  vm.$set = (o, k, v) => { o[k] = v; };
  vm.$emit = (n, p) => { env.emits.push(n); };
  ['created', 'onLoad', 'onShow', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'beforeDestroy'].forEach((h) => {
    if (typeof options[h] === 'function') vm[h] = options[h].bind(vm);
  });
  return { vm, env, options };
}

// ── 判据 ─────────────────────────────────────────────────────────────────────

/** ① 页签档位与「全部不发 status」（名称只认同一次回体的 attr.statusList——fixture 用
 *  「Z0/Z2/Z3」这种标记名，端上写死一份中文枚举就必然配不上，M44 的端侧形态；
 *  2026-10-20 起只有三档：0 待赠送 / 2 已领取 / 3 已失效） */
async function checkTabs(jsCode, label) {
  const statusList = { 0: 'Z0', 2: 'Z2', 3: 'Z3' };
  const list = { code: 1, data: { total: 1, rows: [{ id: 1, status: 0, goods_name: 'N' }], attr: { statusList } } };
  const { vm, env } = buildVm(jsCode, { list });
  vm.getData(true);
  await tick();
  const tabs = vm.tabs || [];
  const names = tabs.map((t) => t.name);
  const statuses = tabs.map((t) => t.status);
  const shapeOk = tabs.length === 4 && names[0] === '全部' && statuses[0] === ''
    && ['Z0', 'Z2', 'Z3'].every((n) => names.indexOf(n) >= 0)
    && statuses.slice(1).join(',') === '0,2,3'
    && statuses.indexOf('1') < 0;
  env.calls.length = 0;
  vm.onTab({ key: 1, status: '0', name: 'Z0' });
  await tick();
  const pendingReq = env.calls.filter((c) => c.name === 'send_friend.gift.list')[0];
  env.calls.length = 0;
  vm.onTab({ key: 0, status: '', name: '全部' });
  await tick();
  const allReq = env.calls.filter((c) => c.name === 'send_friend.gift.list')[0];
  const ok = shapeOk && !!pendingReq && pendingReq.params.status === '0'
    && !!allReq && !('status' in allReq.params) && allReq.params.limit > 0 && allReq.params.page === 1;
  return {
    ok,
    got: '页签=' + JSON.stringify(names) + ' status=' + JSON.stringify(statuses)
      + '；待赠送那一发 params.status=' + (pendingReq ? JSON.stringify(pendingReq.params.status) : '(没发)')
      + '；全部那一发 params=' + (allReq ? JSON.stringify(Object.keys(allReq.params)) : '(没发)') + ' [' + label + ']',
  };
}

/** ② total 被消费，收口不吃 rows.length
 *  2026-10-27 用户点名去掉头部那条「共 N 份」：界面上不再有直接显示 total 的节点，
 *  total 的消费点只剩上拉收口（后端没发 has_more 时按 `rows.length < total` 兜底）。
 *  这一条因此改为钉「回体 total 进到收口判据里 + 模板没有拿 rows.length 当总数 + 头部两条零残留」。 */
async function checkTotalConsumed(jsCode, tpl, label) {
  const { vm, env } = buildVm(jsCode, { list: { code: 1, data: { total: 37, rows: mkRows(10) } } });
  vm.getData(true);
  await tick();
  const first = { total: vm.total, rows: vm.rows.length, hasMore: vm.hasMore, loadStatus: vm.loadStatus };
  const flatTpl = stripComments(tpl);
  const tplNoCountRow = !/sfg-count|sfg-progress|claimedCount|claimedPercent|u-line-progress/.test(flatTpl);
  const tplUsesRowsAsTotal = /\{\{\s*(rows\.length|rows\s*\.\s*length)\s*\}\}/.test(flatTpl);
  const sentLimit = env.calls.some((c) => c.name === 'send_friend.gift.list' && c.params.limit === vm.limit
    && 'page' in c.params && c.params.page === 1 && !('offset' in c.params));
  // 后端把总数改成 10（刚好等于本页行数）时收口必须翻成 nomore —— 这一档证明 total 真在收口判据里
  const { vm: vm2 } = buildVm(jsCode, { list: { code: 1, data: { total: 10, rows: mkRows(10) } } });
  vm2.getData(true);
  await tick();
  const { vm: vm3 } = buildVm(jsCode, { list: { code: 1, data: { rows: mkRows(10), total: 37, has_more: 0 } } });
  vm3.getData(true);
  await tick();
  const ok = first.total === 37 && first.rows === 10 && first.hasMore === true && first.loadStatus === 'loadmore'
    && tplNoCountRow && !tplUsesRowsAsTotal && sentLimit && vm2.hasMore === false && vm2.loadStatus === 'nomore'
    && vm3.hasMore === false;
  return {
    ok,
    got: '回体 total=37/rows=10 → total=' + first.total + ' hasMore=' + first.hasMore + ' loadStatus=' + first.loadStatus
      + '；total=10（截断那一档）→ hasMore=' + vm2.hasMore
      + '；后端 has_more=0 → 收口=' + vm3.hasMore
      + '；头部两条零残留=' + tplNoCountRow + ' 把 rows.length 当总数=' + tplUsesRowsAsTotal + ' 请求带 page(不带 offset)=' + sentLimit,
  };
}
function mkRows(n) {
  const a = [];
  for (let i = 0; i < n; i++) a.push({ id: i + 1, status: i % 4, goods_name: '礼物' + (i + 1), cover: 'https://cdn.a-b.com/c' + i + '.png' });
  return a;
}

/** ③ 骨架待在真实行的外壳里（另铺一棵灰树 = 违规） */
function checkSkeletonPlacement(tpl, jsCode, label) {
  const flat = stripComments(tpl);
  const rowTag = (/<view[^>]*class="[^"]*"[^>]*v-for="row in rows"/.exec(flat) || /<view[^>]*v-for="row in rows"[^>]*>/.exec(flat) || [''])[0];
  const skTags = (flat.match(/<view[^>]*v-for="i in skRows"[^>]*>/g) || []);
  const rowCls = classes(rowTag);
  const shell = rowCls.filter((c) => /card|item|row|block|cell/.test(c));
  const skCls = skTags.length ? classes(skTags[0]) : [];
  const inside = skTags.length > 0 && shell.length > 0 && skCls.some((c) => shell.indexOf(c) >= 0);
  const drivenBy = bodyOf(jsCode, /skRows\s*\(\s*\)\s*\{/) || '';
  const guard = /loading/.test(drivenBy) && /rows/.test(drivenBy);
  const { vm } = buildVm(jsCode, {});
  const cases = [
    { st: { loading: true, rows: [] }, want: 3 },
    { st: { loading: true, rows: [{ id: 1 }] }, want: 0 },
    { st: { loading: false, rows: [] }, want: 0 },
  ];
  let matrixOk = true;
  cases.forEach((c) => {
    const v = buildVm(jsCode, {}).vm;
    v.loading = c.st.loading; v.rows = c.st.rows;
    if ((v.skRows || []).length !== c.want) matrixOk = false;
  });
  const usesSkeletonComp = (/<u-skeleton/.test(flat) && /:rows-width="(\[|')/.test(flat))
    || /<tz-course-mini[^>]*:skeleton="true"/.test(flat);
  return {
    ok: inside && guard && matrixOk && usesSkeletonComp,
    got: '真实行外壳 class=' + JSON.stringify(rowCls) + ' 骨架 class=' + JSON.stringify(skCls)
      + (inside ? '（灰块进到了外壳内部）' : '（另铺了一棵灰树 = 换版）')
      + '；skRows 判据=' + (guard ? '只在没行时铺' : '没判 rows/loading') + ' 三档矩阵=' + matrixOk
      + ' u-skeleton+rows-width 数组=' + usesSkeletonComp + ' [' + label + ']',
  };
}

/** ④ 加载态形态：整页加载组件与转圈 + 文字块都不许出现（收的是 template 文本，不再回读磁盘） */
function checkLoadingForm(files, label) {
  const bad = [];
  files.forEach((f) => {
    const t = stripComments(f.t === undefined ? templateText(read(f.v)) : f.t);
    const name = f.n;
    if (/<u-loading-page|<tz-loading-page/.test(t)) bad.push(name + ': 整页加载组件');
    if (/>\s*(页面)?加载中[….]*\s*</.test(t)) bad.push(name + ': 「加载中」文字块');
    if (/<u-loading-icon[^>]*text=/.test(t)) bad.push(name + ': 转圈带文字');
    if (/<u-loading[^>]*><\/u-loading>\s*<text[^>]*>\s*(加载中|页面加载中)/.test(t)) bad.push(name + ': 转圈 + 文字');
  });
  return { ok: bad.length === 0, got: bad.length ? bad.join('；') : files.length + ' 份界面里的加载态全是骨架（灰块 + u-skeleton）' + ' [' + label + ']' };
}

/** ⑤ onShow 静默重取：不把 loading 翻回 true，也不跨页替上级取数 */
async function checkOnShowSilent(jsCode, label) {
  const { vm, env } = buildVm(jsCode, { list: { code: 1, data: { total: 2, rows: mkRows(2) } } });
  if (typeof vm.onLoad === 'function') vm.onLoad();
  else if (typeof vm.getData === 'function') vm.getData();
  await tick();
  const afterLoad = env.calls.length;
  if (vm.loading !== false) return { ok: false, got: '首取之后 loading 还是 ' + vm.loading };
  // 「闪一次骨架」是同步那一拍的事：onShow 返回的那一刻 loading 被翻回 true 就算违规，
  // 等 tick() 之后再看已经被取数关掉了 ⇒ 必须在这里同步抓一次
  vm.onShow();
  const flash1 = vm.loading === true;
  await tick();
  const afterFirstShow = env.calls.length;
  vm.onShow();
  const flash2 = vm.loading === true;
  await tick();
  const secondShowReq = env.calls.length - afterFirstShow;
  const flash = flash1 || flash2;
  const reqParams = env.calls.slice(-1)[0];
  const ok = afterLoad === 1 && secondShowReq === 1 && !flash && reqParams && reqParams.name === 'send_friend.gift.list';
  return {
    ok,
    got: 'onLoad 发 ' + afterLoad + ' 条；第一次 onShow 多发 ' + (afterFirstShow - afterLoad) + ' 条（shownOnce 那一档）；'
      + '第二次 onShow 多发 ' + secondShowReq + ' 条；onShow 那一刻 loading=' + (flash ? 'true（闪骨架）' : 'false（静默）') + ' [' + label + ']',
  };
}

/** ⑤b 跨页取数禁令 + onShow 里没有 loading=true */
function checkNoCrossPage(dirs, jsCode, label) {
  const hits = [];
  dirs.forEach((f) => {
    const src = stripComments(read(f));
    if (/getCurrentPages\s*\(/.test(src)) hits.push(path.relative(ROOT, f) + ': getCurrentPages()');
  });
  const onShowBody = bodyOf(jsCode, /^ {2}onShow\s*\(\s*\)\s*\{/m) || '';
  if (/loading\s*=\s*true/.test(onShowBody)) hits.push('onShow 里把 loading 翻回 true');
  return { ok: hits.length === 0, got: (hits.length ? hits.join('；') : '三份新页面里没有 getCurrentPages 跨页取数，onShow 也不翻骨架') + ' [' + label + ']' };
}

/** ⑥ 封面不再由本页管：条目卡复用**紧凑档** `tz-course-mini`（2026-10-20 用户点名 course-item mini；
 *  口径同「我的拼团」那一页）—— 自建兜底表（coverErrors/showCover/onCoverError）与自拼封面节点都要零残留 */
function checkCardReuse(jsCode, tpl, label) {
  const flatJs = stripComments(jsCode);
  const flatTpl = stripComments(tpl);
  const noTable = !/coverErrors/.test(flatJs) && !/showCover/.test(flatJs) && !/onCoverError/.test(flatJs);
  const noSelfCover = !/sfg-cover/.test(flatTpl);
  const usesCard = /<tz-course-mini[^>]*:list="courseCard\(row\)"/.test(flatTpl);
  const skFromCard = /<tz-course-mini[^>]*:skeleton="true"/.test(flatTpl);
  const noOldCard = !/<tz-course[\s>]/.test(flatTpl);
  return {
    ok: noTable && noSelfCover && usesCard && skFromCard && noOldCard,
    got: '自建兜底表零残留=' + noTable + ' 自拼封面零残留=' + noSelfCover
      + ' 条目卡走 tz-course-mini=' + usesCard + ' 骨架走卡自带档=' + skFromCard
      + ' 旧 tz-course 零残留=' + noOldCard + ' [' + label + ']',
  };
}

/** ⑦ 两条闸门：未装 / 未登录都不发请求，且都撤骨架 */
function checkGates(jsCode, label) {
  const a = buildVm(jsCode, { install: '' });
  a.vm.onLoad();
  const b = buildVm(jsCode, { install: 1, token: '' });
  b.vm.onLoad();
  const ok = a.env.calls.length === 0 && a.vm.loading === false && a.vm.blocked === true && !!a.vm.notice
    && b.env.calls.length === 0 && b.vm.loading === false && b.vm.blocked === true && /登录/.test(b.vm.notice || '');
  a.vm.onShow(); b.vm.onShow();
  const stayed = a.env.calls.length === 0 && b.env.calls.length === 0;
  return {
    ok: ok && stayed,
    got: '未装：请求 ' + a.env.calls.length + ' 条、notice=' + JSON.stringify(a.vm.notice)
      + '；未登录：请求 ' + b.env.calls.length + ' 条、notice=' + JSON.stringify(b.vm.notice)
      + '；两档 onShow 之后仍不发请求=' + stayed + ' [' + label + ']',
  };
}

/** ⑧ 下拉收条等回音（两条分支都要收） */
async function checkPullDown(jsCode, label) {
  const a = buildVm(jsCode, { list: { code: 1, data: { total: 0, rows: [] } } });
  a.vm.onLoad();
  await tick();
  a.vm.onPullDownRefresh();
  await tick();
  const b = buildVm(jsCode, { install: '' });
  b.vm.onLoad();
  b.vm.onPullDownRefresh();
  const ok = a.env.stops >= 1 && b.env.stops >= 1;
  return { ok, got: '正常档收条 ' + a.env.stops + ' 次、被闸门那一档 ' + b.env.stops + ' 次（两支都有回音才收）[' + label + ']' };
}

/** ⑨ 行内【赠送】→ **送礼页**（M-P9，2026-10-28）：
 *  赠送记录只负责带着礼单凭据过去，分享弹窗与「记送出时刻」都在送礼页那一屏（同一条 UI 只留一份，
 *  硬约束 20③）。这里钉三件：
 *  · 本页不再挂 `<share-modal>`、也不再 import 公共弹窗（否则同一个动作两条入口各写一份）；
 *  · `goSend(row)` 落到 `/pages/app/send_friend/send/send?code=<gift_no>`；
 *  · 缺凭据那一支先说话再 return（不给一条点了没反应的路，硬约束 27②）。 */
function checkSendEntry(jsCode, tpl, label) {
  const flatTpl = stripComments(tpl);
  const flatJs = stripComments(jsCode);
  const noModal = !/<share-modal\b/.test(flatTpl) && !/share-modal\.vue/.test(flatJs);
  const body = bodyOf(flatJs, /goSend\s*\([^)]*\)\s*\{/);
  const goes = !!body && /\/pages\/app\/send_friend\/send\/send\?code=/.test(body);
  const guard = !!body && /if\s*\(!row\s*\|\|\s*!row\.gift_no\)/.test(body);
  const noOldSheet = !/send-friend-share-sheet|custom-share-sheet/.test(flatTpl + flatJs);
  return {
    ok: noModal && goes && guard && noOldSheet,
    got: '本页不再挂弹窗=' + noModal + ' 跳送礼页=' + goes + ' 缺凭据先说话=' + guard
      + ' 自建面板零残留=' + noOldSheet + ' [' + label + ']',
  };
}

/** ⑩ 样式 token（禁 rpx、按钮只 4px、颜色在名单内） */
function checkStyle(css, label) {
  const flat = stripComments(css);
  const bad = [];
  const rpx = flat.match(/[\d.]+rpx/g);
  if (rpx) bad.push('rpx：' + rpx.slice(0, 3).join(','));
  const ALLOW = ['#0968f6', '#86909c', '#f7f8fa', '#fff', '#ffffff', '#f53f3f', '#e5e6eb', '#1d2129',
    // 2026-10-26 列表丰富：三档状态标（待赠送蓝 / 已领取绿 / 已失效灰）与领取人块的底色
    '#e8f3ff', '#0d5bc4', '#e8ffea', '#008123', '#f2f3f5', '#4e5969'];
  (flat.match(/#[0-9a-fA-F]{3,8}\b/g) || []).forEach((c) => { if (ALLOW.indexOf(c.toLowerCase()) < 0) bad.push('越界颜色 ' + c); });
  [...flat.matchAll(/([^{}]+)\{([^}]*)\}/g)].forEach((m) => {
    const sel = m[1].trim().replace(/\s+/g, ' ');
    const v = (/border-radius:\s*([^;]+)/.exec(m[2]) || [])[1];
    if (!v) return;
    const isBtn = /btn|button|cta|submit|pay\b/i.test(sel);
    if (!isBtn) return;
    if (/(^|[\s,;])(21|22)px|50%/.test(v) || !/^4px/.test(v.trim())) bad.push('按钮圆角 ' + v.trim() + '（' + sel + '）');
  });
  return { ok: bad.length === 0, got: bad.length ? bad.join('；') : '无 rpx、颜色在 token 内、行内按钮走 4px 档' + ' [' + label + ']' };
}

/** ⑭ 列表卡下信息区（2026-10-26 用户点名「参考拼团优化方式丰富一下」）：
 *  · 状态标按后端 status 三档上色（0 待赠送 / 2 已领取 / 3 已失效），词条仍吃 status_label；
 *  · 领取人块：头像读 receiver_avatar（端上不拼地址、不自查用户表），未领取时说「还没人领取」；
 *  · 份数刻度：seq + goods_count 同读，只有一份时整句不出；
 *  · 骨架与真实行同形：状态标 / 份数 / 头像 / 昵称 / 时间 / 按钮各有灰块（M16）。
 *  这一族跨「字段 → 方法 → 模板 → 样式」四层，sfc-check / ui-audit / curl 三条都看不见。 */
function checkRichCard(jsCode, tpl, css, label) {
  const flatJs = stripComments(jsCode);
  const flatTpl = stripComments(tpl);
  const flatCss = stripComments(css);
  const tagMap = /tagClass\s*\(status\)\s*\{[\s\S]{0,260}0:\s*'sfg-tag--pending'[\s\S]{0,120}2:\s*'sfg-tag--claimed'[\s\S]{0,120}3:\s*'sfg-tag--void'/.test(flatJs);
  const tagUse = /:class="\[?tagClass\(row\.status\)\]?"/.test(flatTpl) && /\{\{\s*row\.status_label\s*\}\}/.test(flatTpl);
  // 头像那一格走 avatarSrc(row)（取不到时由它换默认头像，见 ⑯），地址仍只认 receiver_avatar
  const avatarRead = /receiver_avatar/.test(flatJs) && /:src="avatarSrc\(row\)"/.test(flatTpl);
  const emptyReceiver = /还没人领取/.test(flatTpl);
  const seqRead = /seqText\s*\(row\)\s*\{[\s\S]{0,240}r\.seq[\s\S]{0,120}r\.goods_count/.test(flatJs)
    && /seqText\(row\)/.test(flatTpl);
  const skShape = /sfg-sk-seq/.test(flatTpl) && /sfg-avatar--sk/.test(flatTpl)
    && /sfg-sk-name/.test(flatTpl) && /sfg-sk-time/.test(flatTpl);
  const colors = /\.sfg-tag--pending[\s\S]{0,120}#0d5bc4/.test(flatCss)
    && /\.sfg-tag--claimed[\s\S]{0,120}#008123/.test(flatCss)
    && /\.sfg-tag--void[\s\S]{0,120}#4e5969/.test(flatCss);
  return {
    ok: tagMap && tagUse && avatarRead && emptyReceiver && seqRead && skShape && colors,
    got: '三档色档=' + tagMap + ' 模板用色档=' + tagUse + ' 头像读 receiver_avatar=' + avatarRead
      + ' 未领取空态=' + emptyReceiver + ' 份数刻度=' + seqRead + ' 骨架六块=' + skShape
      + ' 色值与深一档=' + colors + ' [' + label + ']',
  };
}

/** ⑮ 头部两条（「共 N 份」计数行 + 已领取进度条）2026-10-27 由用户点名下线：
 *  模板 / 页面私有 CSS / 脚本里的 `status_count` 消费点三处都要零残留——只删模板会留死样式，
 *  只删样式会留孤儿节点，留着 `status_count` 读点则下一次有人把那一行接回去。
 *  total 仍被上拉收口消费，见 ②（不是「不再消费 total」）。 */
function checkHeaderRowsGone(jsCode, tpl, css, label) {
  const flatJs = stripComments(jsCode);
  const flatTpl = stripComments(tpl);
  const flatCss = stripComments(css);
  const tplGone = !/sfg-count|sfg-progress|u-line-progress/.test(flatTpl);
  const cssGone = !/sfg-count|sfg-progress/.test(flatCss);
  const jsGone = !/status_count|statusCount|claimedCount|claimedPercent/.test(flatJs);
  return {
    ok: tplGone && cssGone && jsGone,
    got: '模板零残留=' + tplGone + ' 私有样式零残留=' + cssGone + ' 脚本零残留=' + jsGone + ' [' + label + ']',
  };
}

/** ⑯ 列表里的图片取不到要有「默认填充」的图（2026-10-29 用户点名「列表中的图片如果加载失败
 *  要有默认填充的图片」）。这一页有两处图，一处在本页、一处归条目卡管，两处都要钉：
 *   ① 两处都必须是 `<image>` + `@error` —— `background-image` 根本没有「加载失败」这一档，
 *      地址失效时那一格永远是白的（这正是本次被点名的形态）；
 *   ② 失败档落到全站那一张默认图：头像 `/static/image/default-avatar.png`（同族领取页、打卡族、
 *      达人榜同一张）、封面 `/static/image/default-goods.jpg`（套餐卡 / 确认报名页 / 规格弹窗同一张）；
 *   ③ 失败表以**地址**作键，读写两头都要过 mpKey（只改写点 = 兜底图静默失效，M27/硬约束 25）；
 *   ④ 回调体第一句过 `gone()`（图片 `@error` 常晚于页面卸载才到，M26②）；
 *   ⑤ 空封面那一档仍走浅灰占位 ——「本来没配图」与「配了图取不到」是两件事，
 *      不许被兜底图顶掉（否则整页列表全变成同一张默认封面，反而分不出哪条没配图）。
 *  src 可注入（坏样件用），默认读真件四份。
 */
function checkImageFallback(src, label) {
  const flatTpl = stripComments(src.tpl);
  const flatJs = stripComments(src.js);
  const miniTpl = stripComments(src.miniTpl);
  const miniJs = stripComments(src.miniJs);

  // ① 本页头像：`<image>` 上同时有 :src 与 @error
  const avatarTag = /<image[^>]*class="sfg-avatar"[^>]*>/.exec(flatTpl);
  const avatarImage = !!avatarTag && /:src="avatarSrc\(row\)"/.test(avatarTag[0])
    && /@error="onAvatarError\(row\)"/.test(avatarTag[0]);

  // ② 头像兜底链：失败标记 → 默认头像
  const avatarSrcBody = bodyOf(flatJs, /avatarSrc\s*\(row\)\s*\{/) || '';
  const avatarFallback = /'\/static\/image\/default-avatar\.png'/.test(avatarSrcBody);

  // ③ 头像失败表：读点与写点同一口径（都过 mpKey）
  const avatarReadKey = /this\.avatarErrors\[mpKey\(url\)\]/.test(avatarSrcBody);
  const avatarWriteBody = bodyOf(flatJs, /onAvatarError\s*\(row\)\s*\{/) || '';
  const avatarWriteKey = /\$set\(\s*this\.avatarErrors\s*,\s*mpKey\(url\)/.test(avatarWriteBody);

  // ④ 两个回调入口都在第一句过 gone()
  const avatarGone = /^\s*if\s*\(this\.gone\(\)\)\s*\{\s*return;\s*\}/m.test(avatarWriteBody.trim());
  const miniWriteBody = bodyOf(miniJs, /onCoverError\s*\(item\)\s*\{/) || '';
  const miniGone = /^\s*if\s*\(this\.gone\(\)\)\s*\{\s*return;\s*\}/m.test(miniWriteBody.trim());

  // ⑤ 封面归卡片：`<image>` + @error + 默认商品图；读点过 mpKey
  const miniCoverTag = /<image[^>]*class="mini-cover"[^>]*>/.exec(miniTpl);
  const miniImage = !!miniCoverTag && /:src="item\.cover"/.test(miniCoverTag[0])
    && /@error="onCoverError\(item\)"/.test(miniCoverTag[0]);
  const miniFallback = /:src="defaultCover"/.test(miniTpl) && /default-goods\.jpg/.test(miniJs);
  const miniFailedBody = bodyOf(miniJs, /coverFailed\s*\(item\)\s*\{/) || '';
  const miniReadKey = /this\.coverErrors\[mpKey\(cover\)\]/.test(miniFailedBody);
  const miniWriteKey = /\$set\(\s*this\.coverErrors\s*,\s*mpKey\(cover\)/.test(miniWriteBody);

  // ⑥ 空封面那一档仍是浅灰占位（不是兜底图）
  const emptyKeepsPlaceholder = /class="placeholder"[^>]*v-else|v-else[^>]*class="placeholder"/.test(miniTpl);
  // ⑦ 旧写法零残留：本页不许再自己拼封面，卡片不许再用 background-image 画封面
  const noBgImage = !/background-image/.test(miniTpl);

  const ok = avatarImage && avatarFallback && avatarReadKey && avatarWriteKey && avatarGone
    && miniImage && miniFallback && miniReadKey && miniWriteKey && miniGone
    && emptyKeepsPlaceholder && noBgImage;
  return {
    ok,
    got: '头像 image+@error=' + avatarImage + ' 默认头像=' + avatarFallback
      + ' 头像键读写=' + (avatarReadKey && avatarWriteKey) + ' gone闸门=' + (avatarGone && miniGone)
      + '；封面 image+@error=' + miniImage + ' 默认封面=' + miniFallback
      + ' 封面键读写=' + (miniReadKey && miniWriteKey)
      + ' 空封面仍走占位=' + emptyKeepsPlaceholder + ' 背景图零残留=' + noBgImage + ' [' + label + ']',
  };
}
const IMAGE_SRC = () => ({
  tpl: templateOf(VUE),
  js: scriptOf(JS),
  miniTpl: templateOf(COURSE_MINI),
  miniJs: scriptOf(COURSE_MINI),
});

const ALL_FILES = [
  { n: 'gift.vue', v: VUE },
  { n: 'receive.vue', v: path.join(RECEIVE_DIR, 'receive.vue') },
  { n: 'send-friend-area.vue', v: AREA },
  { n: 'share-modal.vue', v: SHARE_MODAL },
];

(async () => {
  if (process.argv.indexOf('--selftest') >= 0) return selftest();
  console.log('=== check-send-friend-gift（M-P4 页签/总数/骨架层次/onShow/mpKey/闸门）===');
  const jsCode = scriptOf(JS);
  const tpl = templateOf(VUE);

  let r = await checkTabs(jsCode, '真件');
  assert('① 页签 = 后端 attr.statusList 那三档 + 全部（名称零写死，fixture 用标记名验），全部那一发不发 status、翻页发 page/limit', r.ok, r.got);

  r = await checkTotalConsumed(jsCode, tpl, '真件');
  assert('② 回体 total 被界面消费，收口吃 total/has_more 而不是本页行数；翻页参数是 page（发 offset 会让上拉永远重拼第 1 页，2026-10-16 接线核出）', r.ok, r.got);

  r = checkSkeletonPlacement(tpl, jsCode, '真件');
  assert('③ 骨架块进到了真实行的外壳里（不在白面板上另铺一棵灰树）', r.ok, r.got);

  r = checkLoadingForm(ALL_FILES, '真件');
  assert('④ 四份界面里没有 u-loading-page/tz-loading-page/转圈 + 「加载中」文字块', r.ok, r.got);

  r = await checkOnShowSilent(jsCode, '真件');
  assert('⑤ 退回本页静默重取：一条请求、不闪骨架', r.ok, r.got);

  r = checkNoCrossPage([JS, path.join(DIR, 'gift.vue'), path.join(RECEIVE_DIR, 'js.vue'), path.join(RECEIVE_DIR, 'receive.vue')], jsCode, '真件');
  assert('   └ 三份新页面里没有 getCurrentPages 跨页取数（M23 禁令那一半）', r.ok, r.got);

  r = checkCardReuse(jsCode, tpl, '真件');
  assert('⑥ 封面归条目卡管：自建兜底表/自拼封面零残留，卡走 tz-course-mini（列表与骨架同一只）', r.ok, r.got);

  r = checkGates(jsCode, '真件');
  assert('⑦ 未装 / 未登录两档都不发请求、都撤骨架、onShow 也不再发', r.ok, r.got);

  r = await checkPullDown(jsCode, '真件');
  assert('⑧ 下拉刷新两条分支都等回音才收条（M23）', r.ok, r.got);

  r = checkSendEntry(jsCode, tpl, '真件');
  assert('⑨ 行内【赠送】→ 送礼页（带 gift_no），本页不再挂分享弹窗、自建面板零残留', r.ok, r.got);

  r = checkStyle(read(CSS), '真件');
  assert('⑩ 样式 token：禁 rpx、按钮只 4px、颜色在名单内', r.ok, r.got);

  const apiBlock = stripComments(read(API_LIST));
  assert('⑪ send_friend.gift.list 已登记且 auth:true，页面按表里的键调用',
    /list:\s*\{[\s\S]{0,120}?url:\s*['"]app\/send_friend\/gift\/list['"][\s\S]{0,80}?auth:\s*true/.test(apiBlock)
      && /\$api\(\s*['"]send_friend\.gift\.list['"]/.test(jsCode), '在位');

  const flatTpl = stripComments(tpl);
  assert('⑫ 整条记录与商品卡都进送礼页（卡自身关掉商品详情跳转）；行内「赠送/查看」两档走 tz-button，且按钮点击不冒泡',
    /<view class="school-card sfg-item"[^>]*@click="goSend\(row\)"/.test(flatTpl)
      && /<tz-course-mini[^>]*:clickable="false"/.test(flatTpl)
      && /class="sfg-action"[^>]*@click\.stop/.test(flatTpl)
      && /<tz-button[^>]*v-if="canGive\(row\)"[^>]*text="赠送"/.test(flatTpl)
      && /<tz-button[^>]*v-else[^>]*text="查看"/.test(flatTpl)
      && /canView\(row\)\s*\{[\s\S]{0,200}?status === 2 \|\| status === 3/.test(stripComments(jsCode))
      && !/row\.receive_url/.test(flatTpl)
      && !/Number\(row\.status\)/.test(flatTpl) && !/<button[\s>]/.test(flatTpl), '整条记录/商品卡/按钮三层接线在位；状态重判零残留');

  r = checkPageTail(tpl, 'gift.vue');
  assert('⑬ 页尾两枚常驻组件在位：<tz-tab-bar /> + <tz-footer />（同族 receive 页已有页脚，两页不许各摆一套）', r.ok, r.got);

  // 2026-10-26 用户点名「赠送记录列表也比较单调，参考拼团优化方式丰富一下」
  r = checkRichCard(jsCode, tpl, read(CSS), '真件');
  assert('⑭ 卡下信息区三段：三档状态标 / 领取人头像 + 空态 / 第 N-M 份；骨架六块同形', r.ok, r.got);

  r = checkHeaderRowsGone(jsCode, tpl, read(CSS), '真件');
  assert('⑮ 头部「共 N 份」与已领取进度已下线：模板 / 私有样式 / status_count 读点三处零残留', r.ok, r.got);

  // 2026-10-29 用户点名「列表中的图片如果加载失败要有默认填充的图片」
  r = checkImageFallback(IMAGE_SRC(), '真件');
  assert('⑯ 列表两处图（领取人头像 / 商品封面）都挂 @error 且落到默认图；失败表读写两头过 mpKey、回调过 gone()；空封面仍走浅灰占位', r.ok, r.got);

  const receiveTpl = templateOf(path.join(RECEIVE_DIR, 'receive.vue'));
  r = checkPageTail(receiveTpl, 'receive.vue');
  assert('   └ 领取页同一档（2026-10-19 补的那一枚是导航条：当时只有页脚、没有 tab-bar）', r.ok, r.got);

  console.log(fail === 0 ? '\n结果：全部符合预期（通过 ' + pass + ' 项 / 违反 ' + fail + ' 项）'
    : '\n结果：有 ' + fail + ' 项不符合预期（通过 ' + pass + ' 项）');
  process.exitCode = fail === 0 ? 0 : 1;

  // ── 坏样件 ────────────────────────────────────────────────────────────────
  async function selftest() {
    console.log('=== --selftest：坏样件必须每一条都被同一组判据抓红 ===');
    let fired = 0;
    const expect = (name, res) => {
      if (res.ok) { console.log('[SELFTEST-FAIL] ' + name + ' 没被抓到（这条判据是瞎的）-> ' + res.got); fail++; }
      else { fired++; console.log('[SELFTEST-FIRE] ' + name + ' 已报红 -> ' + res.got); pass++; }
    };

    const BAD_THREE_TABS = `
      export default {
        data() { return { tabs: [{ name: '待赠送', key: 1, status: 0 }, { name: '已领取', key: 3, status: 2 }], active: 1, status: 0, rows: [], total: 0, offset: 0, limit: 10, hasMore: false, loading: false, fetching: false, seq: 0, blocked: false, notice: '', loadStatus: 'loadmore', coverErrors: {} }; },
        methods: { gone() { return false; }, getData(r, s) { const p = { offset: 0, limit: this.limit, status: this.status }; return this.$api('send_friend.gift.list', p).then(() => {}); },
          onTab(i) { this.status = i.status; return this.getData(true); },
          onCoverError(row) { this.$set(this.coverErrors, row.cover, true); },
          showCover(row) { return !!row.cover && !this.coverErrors[row.cover]; } },
      };`;
    const BAD_ROWS_AS_TOTAL = `
      export default {
        data() { return { tabs: [{ name: '全部', key: 0, status: '' }, { name: '待赠送', key: 1, status: 0 }, { name: '待领取', key: 2, status: 1 }, { name: '已领取', key: 3, status: 2 }, { name: '已失效', key: 4, status: 3 }], status: '', rows: [], total: 0, limit: 10, hasMore: false, loading: false, seq: 0, blocked: true, notice: '', loadStatus: 'loadmore', coverErrors: {} }; },
        methods: { gone() { return false; },
          getData(refresh) { return this.$api('send_friend.gift.list', { limit: this.limit }).then((ret) => { const d = (ret && ret.data) || {}; this.rows = d.rows || []; this.total = (d.rows || []).length; this.hasMore = this.rows.length >= 10; }); },
          onTab(i) { this.status = i.status; } },
      };`;
    const BAD_ROWS_TPL = `<template><view class="white-panel">
        <view class="grey-tree" v-for="i in skRows" :key="i"><view class="grey-block"></view></view>
        <view class="school-card sfg-item" v-for="row in rows" :key="row.id">{{ rows.length }}</view>
      </view></template>`;
    const BAD_TPL_FOR_BAD_SK = `<template><view class="school-cards">
        <view class="sfg-sk" v-for="i in skRows" :key="i"><u-skeleton :rows="2" :rows-width="['66%','42%']"></u-skeleton></view>
        <view class="school-card sfg-item" v-for="row in rows" :key="row.id">{{ total }}</view>
      </view></template>`;
    const BAD_SPINNER = `<template><view><view class="box"><u-loading-icon text="加载中"></u-loading-icon><text>加载中…</text></view></view></template>`;
    const BAD_ONSHOW_FLASH = `
      export default {
        data() { return { rows: [], total: 0, limit: 10, loading: true, blocked: false, seq: 0, hasMore: false, notice: '', coverErrors: {} }; },
        onShow() { this.loading = true; this.getData(); },
        methods: { gone() { return false; }, getData() { return this.$api('send_friend.gift.list', { limit: this.limit }).then(() => { this.loading = false; }); },
          onCoverError(row) { this.$set(this.coverErrors, row.cover, true); },
          showCover(row) { return !!row.cover && !this.coverErrors[row.cover]; } },
      };`;
    const BAD_RAW_KEY = `
      export default {
        data() { return { coverErrors: {} }; },
        methods: { onCoverError(row) { this.$set(this.coverErrors, row.cover, true); }, showCover(row) { return !!row.cover && !this.coverErrors[row.cover]; } },
      };`;
    const BAD_GATE = `
      export default {
        data() { return { loading: true, blocked: false, notice: '', rows: [] }; },
        onLoad() { this.getData(); },
        onShow() { this.getData(); },
        onPullDownRefresh() { this.getData(); },
        methods: { gone() { return false; }, getData() { return this.$api('send_friend.gift.list', {}).then(() => { this.loading = false; }); },
          onSent() { this.getData(); } },
      };`;

    expect('坏样件 1：页签少了两档、没有「全部」，且每一发都带 status', await checkTabs(BAD_THREE_TABS, '样件1'));
    expect('坏样件 2：把 rows.length 当总数（静默截断没人发现）', await checkTotalConsumed(BAD_ROWS_AS_TOTAL, BAD_ROWS_TPL, '样件2'));
    expect('坏样件 3：白面板上另铺一棵灰树', checkSkeletonPlacement(BAD_TPL_FOR_BAD_SK, BAD_ROWS_AS_TOTAL, '样件3'));
    expect('坏样件 4：转圈 + 「加载中」文字块 / 整页加载组件', checkLoadingForm([{ n: '样件4', t: BAD_SPINNER }], '样件4'));
    expect('坏样件 5：onShow 把 loading 翻回 true（退回就闪骨架）', await checkOnShowSilent(BAD_ONSHOW_FLASH, '样件5'));
    expect('坏样件 6：页面还在自建封面兜底表（没归卡片管）', checkCardReuse(BAD_RAW_KEY, '<template><view class="sfg-cover"></view></template>', '样件6'));
    expect('坏样件 7：闸门没立在取数之前（未装照样发请求）', checkGates(BAD_GATE, '样件7'));
    expect('坏样件 8：下拉不等回音就收条', await checkPullDown(BAD_GATE, '样件8'));
    const BAD_SELF_SHEET = `
      export default {
        data() { return { shareVisible: false, shareRow: null, rows: [], loading: false }; },
        methods: {
          openShare(row) { this.shareVisible = true; this.rows = [{ id: row.id, status: 1, status_label: '待领取' }]; },
          markShared(row) { return this.$api('send_friend.gift.share', { id: row.id }); },
        },
      };`;
    expect('坏样件 9：还在用自建分享面板、点赠送就把行写成 status=1（待领取）',
      checkSendEntry(BAD_SELF_SHEET, '<template><send-friend-share-sheet ref="sheet" @sent="onSent"></send-friend-share-sheet></template>', '样件9'));

    expect('坏样件 10：胶囊按钮 22px / rpx / 越界颜色', checkStyle('.sfg-btn{border-radius:22px}.sfg-x{padding:12rpx;color:#ff7a00}', '样件10'));
    // 只写吸底按钮条（class 里带 school-footer 字样）不算挂了页脚 —— 2026-10-19 拼团详情页正是这一档
    expect('坏样件 11：页尾没挂 tz-tab-bar / tz-footer（只有吸底栏那一档）',
      checkPageTail('<template><view class="sfg"><view class="school-footer h5-bottom-bar"><text>再开一团</text></view></view></template>', '样件11'));

    // 2026-10-26 列表丰富：状态标单色、没有领取人头像/空态/份数刻度 ⇒ 必须报红
    const BAD_RICH_JS = `
      export default {
        methods: {
          tagClass() { return 'sfg-tag'; },
          receiverAvatar() { return ''; },
          seqText() { return ''; },
        },
      };`;
    const BAD_RICH_TPL = `<template><view class="school-card sfg-item">
        <text class="sfg-tag">{{ row.status_label }}</text>
        <text>{{ row.receiver_name }}</text>
      </view></template>`;
    expect('坏样件 12：状态标仍是单色、没有领取人头像与「还没人领取」空态、没有份数刻度',
      checkRichCard(BAD_RICH_JS, BAD_RICH_TPL, '.sfg-tag{color:#86909c;background:#f7f8fa}', '样件12'));

    expect('坏样件 13：头部「共 N 份」/ 已领取进度只删了一半（模板、私有样式、status_count 读点任一残留）',
      checkHeaderRowsGone(`export default { computed: { claimedCount() { return (this.statusCount || {})[2] || 0; } } };`,
        '<template><view class="sfg-count">{{ total }}</view><view class="sfg-progress"><u-line-progress :percentage="claimedPercent" /></view></template>',
        '.sfg-progress { padding: 8px 10px 0; }', '样件13'));

    // 2026-10-29 图片兜底那一族：三种坏法各一枚（没 @error / 键没转 / 只挂 @error 不给默认图）
    const BAD_NO_ERROR = {
      tpl: '<template><view class="school-card sfg-item"><image class="sfg-avatar" v-if="receiverAvatar(row)" :src="receiverAvatar(row)" mode="aspectFill" /></view></template>',
      js: 'export default { data() { return {}; }, methods: { receiverAvatar(row) { return String((row || {}).receiver_avatar || ""); } } };',
      miniTpl: '<template><view class="course-list-box"><div class="cover" :style="{ \'background-image\': \'url(\' + item.cover + \')\' }"></div></view></template>',
      miniJs: 'export default {};',
    };
    const BAD_RAW_AVATAR_KEY = {
      tpl: '<template><view class="school-card sfg-item"><image class="sfg-avatar" v-if="receiverAvatar(row)" :src="avatarSrc(row)" mode="aspectFill" @error="onAvatarError(row)" /></view></template>',
      js: `export default { data() { return { avatarErrors: {} }; }, methods: {
        gone() { return false; },
        receiverAvatar(row) { return String((row || {}).receiver_avatar || ""); },
        avatarSrc(row) { const url = this.receiverAvatar(row); if (!url) { return ""; } return this.avatarErrors[url] ? '/static/image/default-avatar.png' : url; },
        onAvatarError(row) { if (this.gone()) { return; } const url = this.receiverAvatar(row); if (url) { this.$set(this.avatarErrors, url, true); } } } };`,
      miniTpl: templateOf(COURSE_MINI),
      miniJs: scriptOf(COURSE_MINI),
    };
    const BAD_FLAG_ONLY = {
      tpl: '<template><view class="school-card sfg-item"><image class="sfg-avatar" v-if="receiverAvatar(row)" :src="avatarSrc(row)" mode="aspectFill" @error="onAvatarError(row)" /></view></template>',
      js: `export default { data() { return {}; }, methods: {
        gone() { return false; },
        receiverAvatar(row) { return String((row || {}).receiver_avatar || ""); },
        avatarSrc(row) { return this.receiverAvatar(row); },
        onAvatarError(row) { if (this.gone()) { return; } } } };`,
      miniTpl: '<template><div class="cover"><image class="mini-cover" :src="item.cover" @error="onCoverError(item)" /></div></template>',
      miniJs: 'export default { data() { return {}; }, methods: { gone() { return false; }, onCoverError(item) { if (this.gone()) { return; } } } };',
    };
    expect('坏样件 14：图片没挂 @error、封面仍用 background-image（地址失效时那一格永远是白的）',
      checkImageFallback(BAD_NO_ERROR, '样件14'));
    expect('坏样件 15：失败表用裸地址当键（读写都没过 mpKey —— 微信把点当嵌套路径，兜底图静默失效）',
      checkImageFallback(BAD_RAW_AVATAR_KEY, '样件15'));
    expect('坏样件 16：只挂了 @error 却没给默认图（失败档仍是空的）',
      checkImageFallback(BAD_FLAG_ONLY, '样件16'));

    // 反向样件：合格写法不该被抓
    const goodStyle = checkStyle('.sfg-tag{border-radius:4px;background:#f7f8fa}.sfg-cover{border-radius:6px}.sfr-avatar{border-radius:50%}', '好样件');
    if (goodStyle.ok) { pass++; console.log('[SELFTEST-OK] 好样件未被误判 -> ' + goodStyle.got); }
    else { fail++; console.log('[SELFTEST-FAIL] 好样件被判红 ⇒ 判据太宽 -> ' + goodStyle.got); }

    const goodTail = checkPageTail('<template><view class="sfg"><text>行</text><tz-tab-bar /><tz-footer /></view></template>', '好样件-页尾');
    if (goodTail.ok) { pass++; console.log('[SELFTEST-OK] 页尾判据不误判合格写法 -> ' + goodTail.got); }
    else { fail++; console.log('[SELFTEST-FAIL] 页尾判据把合格写法判红了 ⇒ 判据太宽 -> ' + goodTail.got); }

    console.log('\n[SELFTEST] 坏样件 ' + fired + ' 条被抓红（要求 ≥16），合格样件不误报；总通过 ' + pass + ' / 失败 ' + fail);
    process.exitCode = fail === 0 && fired >= 16 ? 0 : 1;
    return undefined;
  }
})().catch((e) => {
  // 脚本自己坏了要出声：不许被上面那道 unhandledRejection 吞成「跑完了、exit 0」的假绿
  console.log('[HARNESS-ERROR] ' + (e && e.stack ? e.stack : e));
  process.exitCode = 1;
});
