/**
 * M-P6 / M-P7 好友领取页（pages/app/send_friend/receive）—— 不构建、不开浏览器
 *
 * 钉六件事，每条都把真 computed / 真方法体跑起来，不靠正则数关键字：
 *  ① `?code=` 只在 onLoad 读一次（硬约束 16：onShow 里重读等于把用户刚改过的那一屏按旧地址重刷）；
 *     「再领一份」换的是后端在回执里给的下一份凭据，不是回来重读路由。
 *  ② 未登录那一档除商品名与封面外什么都不给（§2.3-4 防枚举探测）——本脚本自带一个模板作用域小栈，
 *     逐处检查「这一格渲染时祖先里有没有 !needLogin」，不是看它有没有写在同一行。
 *  ③ 三态各一句、句子来自后端那一档（已被领取 / 已失效 + 原因 / 现在不能领），
 *     全都落一句「服务处理失败，请稍后重试」= 报错没自带出路（硬约束 39②）。
 *  ④ 领取成功 → 弹后端 `tip` + `redirectTo` 商品详情（2026-10-28 用户点名「关闭当前页面跳转到课程详情」）；
 *     旧 M-P7 成功屏（看课程 / 去赠送记录 / 还有 N 份）整块下线，全站不存在 `next_code`。
 *  ⑤ 异步回调写 data 前过「已销毁」闸门 + 取数序号（M26/硬约束 23：好友领完顺手退回，
 *     那一刻回来的回音写进已出栈的页面能把整条 setData 通道拖死）。
 *  ⑥ 未装那一档不发请求、也不 navigateBack（深链常常没有上一页可退，退回去就把人留在空白里）。
 *  ⑦ 安装态是**三态**（`pluginState()`：true / false / null）：`null` = init 还没回包，既不判「未装」、
 *     也不发请求，骨架照铺等一次；回包后由 `onSystemConfigReady` 走同一个入口自动放行（⑮）。
 *  另加：骨架待在真实区块外壳里、样式 token（禁 rpx、按钮只 4px、颜色只吃名单内那几档）、
 *     加载态不许是转圈 + 「加载中」。
 *
 * 用法：node tuzi-mobile/scripts/check-send-friend-receive.js            # 验真件
 *       node tuzi-mobile/scripts/check-send-friend-receive.js --selftest # 验这道门禁「能红」
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'src/pages/app/send_friend/receive');
const JS = path.join(DIR, 'js.vue');
const VUE = path.join(DIR, 'receive.vue');
const CSS = path.join(DIR, 'css.css');
const API_LIST = path.join(ROOT, 'src/common/request/api_list.js');
const SUBSCRIPTION = '/pages/user/subscription/subscription';
const GENERIC = '服务处理失败，请稍后重试';

process.on('unhandledRejection', (e) => { console.log('[note] 未处理的 promise 拒绝（坏样件故意留的那一支）：' + (e && e.message)); });
const REAL_SETTIMEOUT = setTimeout;
const tick = () => new Promise((r) => REAL_SETTIMEOUT(r, 5));
// 关页跳详情那一条留了 600ms 让 toast 看得见，门禁要等它落地
const wait = (ms) => new Promise((r) => REAL_SETTIMEOUT(r, ms));

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
  if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  return !!ok;
}
const read = (f) => fs.readFileSync(f, 'utf8');
const scriptOf = (f) => (read(f).match(/<script[^>]*>([\s\S]*?)<\/script>/) || [])[1] || '';
const styleOf = (f) => (read(f).match(/<style[^>]*>([\s\S]*?)<\/style>/) || [])[1] || '';
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
 * 判据与同族 check-send-friend-gift.js 那份同名同语义；2026-10-19 用户点名两族页面缺这两枚时
 * 这一页是「只有页脚、没有导航条」那一档（同一功能族两页形态不一致 = 分叉的直接证据）。
 */
function checkPageTail(tpl, name) {
  const flat = stripComments(tpl);
  const miss = [];
  if (!/<tz-tab-bar\b/.test(flat)) miss.push('缺 <tz-tab-bar />');
  if (!/<tz-footer\b/.test(flat)) miss.push('缺 <tz-footer />');
  return { ok: miss.length === 0, got: (name || '') + (miss.length ? miss.join('、') : '两枚都在位') };
}

function loadMpKey() {
  const f = path.join(ROOT, 'src/common/utils/mp-data-key.js');
  try {
    const src = read(f).replace(/export\s+function/g, 'function').replace(/export\s+default[^\n]*/g, '');
    // eslint-disable-next-line no-new-func
    const fn = new Function(src + '\nreturn typeof mpKey === "function" ? mpKey : null;')();
    if (typeof fn === 'function') return fn;
  } catch (e) { /* 兜底桩 */ }
  return (v) => String(v).replace(/[^0-9A-Za-z_-]/g, '_');
}
const MPKEY = loadMpKey();

function makeEnv(opt) {
  const o = opt || {};
  const env = { calls: [], toasts: [], nav: [], traces: [], back: 0, infoQueue: (o.infoReplies || []).slice() };
  env.uni = {
    getStorageSync: (k) => (k === 'user_token' ? (o.token === undefined ? 'tok' : o.token) : ''),
    setStorageSync: () => {},
    showToast: (a) => { env.toasts.push((a && a.title) || ''); },
    showLoading: () => {}, hideLoading: () => {},
    navigateBack: () => { env.back++; env.traces.push('navigateBack'); },
    redirectTo: (a) => { env.traces.push('redirectTo:' + (a && a.url)); },
    stopPullDownRefresh: () => {}, getSystemInfoSync: () => ({ windowHeight: 700 }),
    $u: { toast: () => {} },
  };
  env.$tools = { systemConfig: (k) => (k === 'app_isinstall_send_friend' ? (o.install === undefined ? 1 : o.install) : ''), copy: () => {} };
  // 安装态三态闸门（`src/common/utils/plugin-guard.js`）：'true' / 'false' / 'null'（init 还没回包）。
  // 页面 `onLoad` 走的是 `this.start()` 这一条口，探针必须照真语义给值，否则「未装」与「等 init」
  // 两支根本走不到（拿 mpKey 那个兜底桩顶上去 = 恒判「已装」，⑦ 会假绿）。
  env.installState = o.installState === undefined ? (o.install === '' ? false : true) : o.installState;
  env.readyCbs = [];
  env.$imports = {
    pluginState: () => env.installState,
    onSystemConfigReady: (cb) => { if (typeof cb === 'function') { env.readyCbs.push(cb); } return () => { env.readyCbs = env.readyCbs.filter((f) => f !== cb); }; },
  };
  env.fireReady = (state) => { env.installState = state === undefined ? true : state; const cbs = env.readyCbs.slice(); env.readyCbs = []; cbs.forEach((cb) => cb()); };
  env.$api = function (name, params) {
    env.calls.push({ name, params });
    if (name === 'send_friend.gift.info') {
      if (o.infoFail) return Promise.reject(new Error('network down'));
      const next = env.infoQueue.length ? env.infoQueue.shift() : o.info;
      if (next instanceof Error) return Promise.reject(next);
      return Promise.resolve(next || { code: 1, msg: 'ok', data: {} });
    }
    if (name === 'send_friend.gift.receive') {
      if (o.receiveFail) return Promise.reject(new Error('network down'));
      return Promise.resolve(o.receive || { code: 1, msg: '领取成功，已放进你的已购', data: { other_pending: 0 } });
    }
    return Promise.resolve({ code: 1, msg: 'ok', data: {} });
  };
  env.$nav = {
    parsePageParams: (p) => p,
    // 路由型别映射走全站唯一那一份：探针只按同一形状回一个可断言的地址（真实现见 common/utils/router.js）
    getPagePath: (id, type) => (id && type ? '/pages/' + type + '/detail/detail?id=' + id : ''),
    to: (d, t, m) => { env.nav.push({ d, t, m }); env.traces.push('nav:' + d); },
    share: () => ({}),
  };
  env.mpKey = MPKEY;
  env.setTimeout = (fn, ms) => { setTimeout(fn, ms); return 1; };
  env.clearTimeout = () => {};
  return env;
}

function loadOptions(code, env) {
  let src = code.replace(/export\s+default/, 'module.exports =');
  src = src.replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, 'const $1 = {};');
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']*["'];?\s*$/gm, (m, names) =>
    'const ' + names.split(',').map((s) => s.trim()).filter(Boolean).map((n) =>
      n + ' = (__imports && Object.prototype.hasOwnProperty.call(__imports, ' + JSON.stringify(n) + ')) ? __imports[' + JSON.stringify(n) + '] : __mpKey').join(', ') + ';');
  const mod = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', 'uni', '__mpKey', '__imports', 'setTimeout', 'clearTimeout', src)(
    mod, mod.exports, env.uni, env.mpKey, env.$imports, env.setTimeout, env.clearTimeout
  );
  return mod.exports;
}

function buildVm(code, opt) {
  const env = makeEnv(opt);
  const options = loadOptions(code, env);
  const base = Object.assign({}, typeof options.data === 'function' ? options.data() : {});
  const vm = base;
  const dataKeys = Object.keys(base);
  // Vue 2 的 initState 顺序是 data → computed，且装 computed 前有一句 `if (!(key in vm))`：
  // 与 data 同名的 computed **根本不会被装上**（dev 只 warn 一句），界面吃到的是 data 那个值。
  // 门禁必须照这个真实行为来，否则就会像本仓这次一样把一个「永远走不到的兜底句」验成绿的。
  Object.keys(options.computed || {}).forEach((k) => {
    if (dataKeys.indexOf(k) >= 0) { return; }
    Object.defineProperty(vm, k, { get: () => options.computed[k].call(vm), configurable: true });
  });
  Object.keys(options.methods || {}).forEach((k) => { vm[k] = options.methods[k].bind(vm); });
  vm.$api = env.$api; vm.$tools = env.$tools; vm.$nav = env.$nav; vm.$refs = {};
  vm.$set = (o, k, v) => { o[k] = v; };
  vm.$emit = (n) => { env.traces.push('emit:' + n); };
  ['created', 'onLoad', 'onShow', 'onUnload', 'onPullDownRefresh', 'beforeDestroy'].forEach((h) => {
    if (typeof options[h] === 'function') vm[h] = options[h].bind(vm);
  });
  return { vm, env, options };
}

/**
 * 模板作用域小栈：找出每一处 `{{ expr }}` 渲染点被哪些元素包着，
 * 再问这些祖先里有没有带 `!needLogin` 闸门的那一枚（判「未登录不泄信息」不能只看同一行）。
 */
function guardStack(tpl) {
  const out = [];
  const stack = [];
  const re = /<\/?([a-zA-Z][\w.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;
  let last = 0;
  while ((m = re.exec(tpl)) !== null) {
    const text = tpl.slice(last, m.index);
    const fills = [...text.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)].map((f) => f[1].trim());
    fills.forEach((expr) => out.push({ expr, guards: stack.filter((s) => s.needLogin).length, depth: stack.length }));
    last = re.lastIndex;
    const isClose = m[0][1] === '/';
    if (isClose) { stack.pop(); continue; }
    const attrs = m[2] || '';
    const selfClosed = m[3] === '/';
    // `v-if` 与 `v-else-if` 都算：2026-10-28 可领/已领取两档用 `v-else-if="!needLogin && …"`，
    // 只认 `v-if` 会把这两支里的送出人/权益说明误报成「没有 !needLogin 祖先」
    const entry = { name: m[1], needLogin: /v-(?:else-)?if="[^"]*!\s*needLogin/.test(attrs) };
    if (!selfClosed) stack.push(entry);
    else out.push({ expr: '<tag:' + m[1] + '>', guards: stack.filter((s) => s.needLogin).length + (entry.needLogin ? 1 : 0), depth: stack.length });
  }
  return out;
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
  return null;
}

/** ⑬ data 与 computed 不许同名（Vue 里同名那个 computed 压根装不上去 = 死代码） */
function checkNameCollision(code, label) {
  const options = loadOptions(code, makeEnv({}));
  const dataKeys = Object.keys(typeof options.data === 'function' ? options.data() : {});
  const computedKeys = Object.keys(options.computed || {});
  const dup = dataKeys.filter((k) => computedKeys.indexOf(k) >= 0);
  return {
    ok: dup.length === 0,
    got: dup.length
      ? 'data 与 computed 同名：' + dup.join(',') + ' ⇒ `if (!(key in vm))` 那条走不到，computed 里那句兜底文案永远不生效'
      : '无同名（data ' + dataKeys.length + ' 枚 / computed ' + computedKeys.length + ' 枚）[' + label + ']',
  };
}

/** api_list.js 里 send_friend 那一块（按大括号配平切，别拿整张表当本插件的证据——
 *  整张表里别的族也有 info/auth:false 那种写法，全表正则会把它一起算进来 = 假绿） */
function sendFriendApiBlock() {
  const src = stripComments(read(API_LIST));
  const at = src.indexOf('send_friend: {');
  if (at < 0) return '';
  const open = src.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (!depth) return src.slice(at, i + 1); }
  }
  return src.slice(at);
}

/** ⑭ 渲染路径模拟：根级 template 状态块 + 同一条 v-if/v-else-if 链只出一枚 */
function safeEval(expr, vm) {
  try {
    // eslint-disable-next-line no-new-func
    return new Function('ctx', 'with(ctx){return (' + expr + ')}')(vm);
  } catch (e) { return false; }
}
function stateBlocks(tpl) {
  const re = /<template\s+(v-if|v-else-if|v-else)(?:="([^"]*)")?\s*>/g;
  const out = [];
  let m;
  while ((m = re.exec(tpl)) !== null) {
    const start = m.index + m[0].length;
    const end = tpl.indexOf('</template>', start);
    out.push({ kind: m[1], cond: m[2] || '', body: tpl.slice(start, end < 0 ? tpl.length : end) });
  }
  return out;
}
function activeBlock(tpl, vm) {
  const blocks = stateBlocks(tpl);
  for (const b of blocks) {
    if (b.kind === 'v-else') return b;
    if (b.cond && safeEval(b.cond, vm)) return b;
  }
  return blocks.length ? blocks[blocks.length - 1] : null;
}
/**
 * 取某个位置之前「还没闭合」的那些元素的 v-if/v-else-if 条件（祖先闸门）。
 *
 * 为什么要有：`visibleButtons` 早先只看按钮自己那一行有没有 v-if，而这一页的主操作外面还套了一层
 * `<view class="sfr-action" v-if="needLogin || canClaim">`（布局需要那一格内衬，条件只能写在它上面）——
 * 只判自己那一行就会把「不可领态里明明收起来的按钮」算成摆出来了，门禁从此看不见这一类回归。
 */
function ancestorConditions(body, upto) {
  const re = /<\/?([a-zA-Z][\w.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  const stack = [];
  const src = body.slice(0, upto);
  let m;
  while ((m = re.exec(src)) !== null) {
    if (m[0][1] === '/') { stack.pop(); continue; }
    const attrs = m[2] || '';
    const ifM = /(^|[\s:])v-if="([^"]*)"/.exec(attrs);
    const elseifM = /(^|[\s:])v-else-if="([^"]*)"/.exec(attrs);
    const elseM = /(^|[\s:])v-else(\s|=|>|$)/.test(attrs);
    let cond = null;
    if (ifM) { cond = ifM[2]; }
    else if (elseifM) { cond = elseifM[2]; }
    else if (elseM) { cond = 'true'; }
    if (m[3] !== '/') { stack.push({ cond }); }
  }
  return stack.map((s) => s.cond).filter((c) => c !== null && c !== undefined);
}

function visibleButtons(tpl, vm) {
  const block = activeBlock(tpl, vm);
  if (!block) return [];
  const out = [];
  let chainTaken = false;
  [...block.body.matchAll(/<tz-button((?:"[^"]*"|'[^']*'|[^>"'])*)>/g)].forEach((m) => {
    const attrs = m[1];
    const ifM = /(^|[\s:])v-if="([^"]*)"/.exec(attrs);
    const elseifM = /(^|[\s:])v-else-if="([^"]*)"/.exec(attrs);
    const elseM = /(^|[\s:])v-else(\s|=|>|$)/.test(attrs);
    let visible = true;
    if (ifM) { visible = !!safeEval(ifM[2], vm); chainTaken = visible; }
    else if (elseifM) { visible = !chainTaken && !!safeEval(elseifM[2], vm); chainTaken = chainTaken || visible; }
    else if (elseM) { visible = !chainTaken; chainTaken = true; }
    else { chainTaken = false; }
    if (!visible) { return; }
    // 祖先那一层的 v-if 也不成立 ⇒ 这一枚根本没渲染（口径同硬约束 22：门禁要把每一支都走一遍）
    if (ancestorConditions(block.body, m.index).some((c) => !safeEval(c, vm))) { return; }
    let text = '';
    const bound = /:text="([^"]*)"/.exec(attrs);
    const lit = /(?:^|[\s])text="([^"]*)"/.exec(attrs);
    if (bound) { text = String(safeEval(bound[1], vm) || ''); }
    else if (lit) { text = lit[1]; }
    out.push({ text, primary: /type="primary"/.test(attrs) });
  });
  return out;
}
async function checkRenderStates(jsCode, tpl, label) {
  const probe = buildVm(jsCode, {});
  if (typeof probe.vm.onLoad !== 'function') {
    return { ok: false, got: '这一页没有 onLoad/getData/receive 这条链，逐档模拟跑不起来 [' + label + ']' };
  }
  const mk = async (opt) => {
    const { vm } = buildVm(jsCode, opt);
    vm.onLoad({ code: 'C' });
    await tick();
    if (opt && opt.claimed) { vm.claimed = true; }
    return vm;
  };
  // fixture 逐键照 `Gift::info()` 的生产者清单给（M44⑤）：可领判据是 `claimable`，
  // 写成列表行那枚 `can_claim` 就是自造键 —— 那样「可领」这一档会整段收起来，门禁反而不红
  const full = { code: 1, data: { status: 0, claimable: 1, goods_name: 'N', button_text: '领取赠送' } };
  // 「领取成功」不再切一张成功屏（2026-10-28 用户点名关页跳详情）：真的把领取链跑完，
  // 断言的是「那句 tip 弹出来 + redirectTo 到商品详情」，不是旧的 claimed/doneTip 两枚 data
  const succ = buildVm(jsCode, { info: full, receive: { code: 1, msg: '', data: { tip: '后端给的那一句成功提示', detail_id: 9, detail_type: 'course' } } });
  succ.vm.onLoad({ code: 'C' });
  await tick();
  if (typeof succ.vm.receive === 'function') { succ.vm.receive(); }
  await tick();
  await wait(700);
  const states = [
    { n: '未登录', vm: await mk({ token: '', info: { code: 1, data: { need_login: 1, goods_name: 'N', cover: 'c.jpg' } } }) },
    { n: '可领', vm: await mk({ info: full }) },
    { n: '已被领', vm: await mk({ info: { code: 1, data: { status: 2, claimable: 0, goods_name: 'N' } } }) },
    { n: '整页取不到', vm: await mk({ info: { code: 0, msg: '这一条礼物没有取到' } }) },
  ];
  const problems = [];
  const report = [];
  states.forEach((s) => {
    const btns = visibleButtons(tpl, s.vm);
    const primaries = btns.filter((b) => b.primary);
    report.push(s.n + '[' + btns.map((b) => (b.primary ? '★' : '') + b.text).join('|') + ']');
    if (primaries.length > 1) problems.push(s.n + ' 那一档同时摆出 ' + primaries.length + ' 枚主按钮（M17 一页内主操作只一处）');
  });
  const login = states[0].vm;
  const loginBtns = visibleButtons(tpl, login).map((b) => b.text);
  const onlyLoginCta = loginBtns.length === 1 && /登录/.test(loginBtns[0]);
  if (!onlyLoginCta) problems.push('未登录那一档摆出来的不是「登录后领取」这一枚，而是 ' + JSON.stringify(loginBtns));
  const successToast = succ.env.toasts.indexOf('后端给的那一句成功提示') >= 0;
  const successNav = (succ.env.nav || []).filter((n) => n.m === 'redirectTo');
  const tipOk = successToast && successNav.length === 1 && /\/pages\/course\/detail\/detail\?id=9$/.test(successNav[0].d);
  if (!tipOk) problems.push('领取成功后没有「弹后端那一句 + redirectTo 商品详情」：toasts=' + JSON.stringify(succ.env.toasts)
    + ' nav=' + JSON.stringify(succ.env.nav));
  return {
    ok: problems.length === 0,
    got: problems.length ? problems.join('；')
      : report.join(' ') + '；每档主按钮 ≤1；未登录只出登录口；成功=toast+关页跳详情 [' + label + ']',
  };
}

// ── 判据 ─────────────────────────────────────────────────────────────────────

/** ① code 只在 onLoad 读一次 */
function checkCodeOnce(jsCode, label) {
  const flat = stripComments(jsCode);
  const { vm, env } = buildVm(jsCode, { info: { code: 1, data: { status: 1, claimable: 1, goods_name: 'N' } } });
  vm.onLoad({ code: 'GF-1' });
  const afterLoad = vm.code;
  env.calls.length = 0;
  if (typeof vm.onShow === 'function') vm.onShow();
  const reqOnShow = env.calls.length;
  const parses = (flat.match(/parsePageParams/g) || []).length;
  const onShowBody = (() => { const at = flat.search(/^ {2}onShow\s*\(\s*\)\s*\{/m); return at < 0 ? '' : flat.slice(at, at + 600); })();
  const leakInOnShow = /onShow[\s\S]{0,400}?(code|parsePageParams)/.test(onShowBody);
  const ok = afterLoad === 'GF-1' && reqOnShow === 0 && !leakInOnShow && parses === 1;
  return {
    ok,
    got: 'onLoad 之后 code=' + JSON.stringify(afterLoad) + '；onShow ' + (typeof vm.onShow === 'function' ? '存在' : '不存在')
      + '，它发的请求 ' + reqOnShow + ' 条；parsePageParams 出现 ' + parses + ' 次（只能 1 次）[' + label + ']',
  };
}

/** ② 未登录除商品名与封面外不泄任何信息（模板作用域逐处查闸门） */
async function checkNoLeak(tpl, jsCode, label) {
  const t = stripComments(tpl);
  const flat = stripComments(jsCode);
  const SENSITIVE = ['goodsDesc', 'giverName', 'giverAvatar', 'stateSub', 'other_pending', 'canClaim'];
  const found = guardStack(t);
  const naked = [];
  SENSITIVE.forEach((key) => {
    const hits = found.filter((f) => new RegExp('\\b' + key + '\\b').test(f.expr) && f.guards === 0);
    if (!hits.length) { return; }
    // 也可以由那一枚 computed 自己把 needLogin 折进去（判一次只存一处），那就不是裸露
    const own = bodyOf(flat, new RegExp(key + '\\s*\\(\\s*\\)\\s*\\{'));
    if (own && /needLogin/.test(own)) { return; }
    naked.push(key + ' 有 ' + hits.length + ' 处渲染点既没有 !needLogin 祖先、computed 自己也没折这一步');
  });
  const phoneish = /(手机号|mobile|phone|\btelephone\b)/i.test(t);
  const { vm, env } = buildVm(jsCode, { token: '', info: { code: 1, data: { need_login: 1, goods_name: 'N', cover: 'c.jpg', goods_desc: '权益说明', giver_name: '送出人', giver_avatar: 'a.jpg', expire_text: '还有 3 天', status: 1 } } });
  vm.onLoad({ code: 'GF-1' });
  await tick();
  const loginSentence = /登录/.test(vm.stateText || '');
  const subBlank = vm.stateSub === '';
  const claimBlocked = vm.canClaim === false;
  const ok = naked.length === 0 && !phoneish && vm.needLogin === true && loginSentence && subBlank;
  return {
    ok,
    got: (naked.length ? naked.join('；') : '敏感格全在 !needLogin 之后（或由那一枚 computed 自己折进 needLogin）')
      + '；界面出现手机号类字段=' + phoneish
      + '；need_login 那一句=' + JSON.stringify(vm.stateText) + '；副句不外泄=' + subBlank + ' [' + label + ']',
  };
}

/** ③ 三态各一句、句子优先吃后端 `block_reason`（「为什么不能领」的唯一真源），都不是一句通用「服务处理失败」 */
async function checkThreeStates(jsCode, label) {
  const mk = async (data, token) => {
    const { vm } = buildVm(jsCode, { token: token === undefined ? 'tok' : token, info: { code: 1, data } });
    vm.onLoad({ code: 'C' });
    await tick();
    return vm;
  };
  const claimable = await mk({ status: 1, claimable: 1, goods_name: 'N' });
  const taken = await mk({ status: 2, claimable: 0, goods_name: 'N' });
  const voided = await mk({ status: 3, claimable: 0, goods_name: 'N', block_reason: '这一份的购买单已退款' });
  const sentences = [claimable.stateText, taken.stateText, voided.stateText];
  const distinct = new Set(sentences).size;
  const generic = sentences.filter((s) => String(s).indexOf(GENERIC) >= 0);
  const reasonShown = String(voided.stateText).indexOf('这一份的购买单已退款') >= 0;
  const fromBackend = await mk({ status: 3, block_reason: '后端给的那一句：这一份已经作废' });
  const backendWins = fromBackend.stateText === '后端给的那一句：这一份已经作废';
  const ov = await mk({ status: 1, claimable: 1 });
  ov.stateOverride = '这份礼物已经被领走了';
  const override = ov.stateText === '这份礼物已经被领走了' && ov.stateSub === '' && ov.canClaim === false;
  const ok = distinct >= 3 && generic.length === 0 && reasonShown && backendWins && override;
  return {
    ok,
    got: '三态句子 ' + distinct + ' 种：' + JSON.stringify(sentences)
      + (generic.length ? '；其中 ' + generic.length + ' 句是通用「' + GENERIC + '」' : '；没有一句落成通用报错')
      + '；失效原因吃后端 block_reason=' + reasonShown + ' 后端句子优先=' + backendWins
      + ' 领取被拒后盖住那一句=' + override + ' [' + label + ']',
  };
}

/** ④ 领取回执：成功 → 弹后端那一句 + 关页跳商品详情；失败 → 盖后端那一句并重取一次让态对齐。
 *  2026-10-28 用户点名「领取成功关闭当前页面跳转到课程详情」：成功屏整块下线，
 *  判据改成两枚动作（toast + redirectTo），并钉「后端没给 detail 两枚时只关页、不跳空地址」。
 *  全站不存在 `next_code`，也不许前端自己发 gift.list 查「还有几份」。 */
async function checkReceiveFlow(jsCode, label) {
  const probe = buildVm(jsCode, {});
  if (typeof probe.vm.onLoad !== 'function' || typeof probe.vm.receive !== 'function' || typeof probe.vm.getData !== 'function') {
    return { ok: false, got: '这一页缺领取这条链（onLoad/receive/getData 不齐全），无从谈三态与回执 [' + label + ']' };
  }
  const g = buildVm(jsCode, { receive: { code: 0, msg: '这份礼物已经被领走了' }, info: { code: 1, data: { status: 2, claimable: 0 } } });
  g.vm.onLoad({ code: 'C1' });
  await tick();
  g.env.calls.length = 0;
  g.vm.receive();
  await tick();
  const told = g.vm.stateOverride === '这份礼物已经被领走了';
  const refetch = g.env.calls.some((c) => c.name === 'send_friend.gift.info');
  const btnGone = g.vm.canClaim === false;

  const s = buildVm(jsCode, {
    receive: { code: 1, msg: '领取成功，已放进你的已购', data: { tip: '领取成功，已放进你的已购', detail_id: 88, detail_type: 'video' } },
    info: { code: 1, data: { status: 1 } },
  });
  s.vm.onLoad({ code: 'C2' });
  await tick();
  s.vm.receive();
  await tick();
  await wait(700);
  const toastOk = (s.env.toasts || []).indexOf('领取成功，已放进你的已购') >= 0;
  const redir = (s.env.nav || []).filter((n) => n.m === 'redirectTo');
  const redirected = redir.length === 1 && redir[0].d === '/pages/video/detail/detail?id=88';

  // 后端没给 detail 两枚（老包/脏数据）：只关页并说一句，不许跳一个空地址
  const n = buildVm(jsCode, { receive: { code: 1, msg: 'ok', data: { tip: 'ok' } }, info: { code: 1, data: { status: 1 } } });
  n.vm.onLoad({ code: 'C3' });
  await tick();
  n.vm.receive();
  await tick();
  await wait(700);
  const backFallback = n.env.back >= 1 && (n.env.nav || []).length === 0;

  const flat = stripComments(jsCode);
  const noListQuery = !/send_friend\.gift\.list|gift\.list/.test(flat);
  const noOldSuccess = !/\bclaimed\b|\bdoneTip\b|\bmorePending\b/.test(flat)
    && !/\$nav\.to\(\s*['"]\/pages\/user\/subscription\/subscription/.test(flat)
    && !/\$nav\.to\(\s*['"]\/pages\/app\/send_friend\/gift\/gift/.test(flat);
  const ok = told && refetch && btnGone && toastOk && redirected && backFallback && noListQuery && noOldSuccess;
  return {
    ok,
    got: '失败：盖住后端那一句=' + told + ' 重取对齐=' + refetch + ' 按钮收掉=' + btnGone
      + '；成功：弹后端 tip=' + toastOk + ' redirectTo 详情=' + redirected
      + '；缺 detail 时只关页=' + backFallback + '；旧成功屏/旧出口零残留=' + noOldSuccess
      + '；前端不自己查列表=' + noListQuery + ' [' + label + ']',
  };
}

/** ⑤ `goDetail()` 的路由收口：型别映射走 `$nav.getPagePath`，跳转方式必须是 `redirectTo`（关掉本页） */
async function checkDetailRedirect(jsCode, label) {
  const { vm, env } = buildVm(jsCode, {});
  if (typeof vm.goDetail !== 'function') { return { ok: false, got: '这一页没有 goDetail()，领取成功后无处可去 [' + label + ']' }; }
  vm.goDetail(88, 'video');
  await wait(700);
  const nav = (env.nav || [])[0] || {};
  const ok = nav.d === '/pages/video/detail/detail?id=88' && nav.m === 'redirectTo';
  return { ok, got: 'goDetail(88, video) -> ' + JSON.stringify(nav) + ' [' + label + ']' };
}

/** ⑥ 异步回调写 data 前过「已销毁」闸门 + 序号丢旧回音（M26/硬约束 23） */
async function checkDestroyedGuard(jsCode, label) {
  const a = buildVm(jsCode, { info: { code: 1, data: { status: 1, goods_name: 'LATE' } } });
  a.vm.onLoad({ code: 'C' });
  const infoBefore = a.vm.info;
  a.vm._isDestroyed = true;
  await tick();
  const lateIgnored = a.vm.info === infoBefore && a.vm.loading === true;

  const b = buildVm(jsCode, { infoReplies: [{ code: 1, data: { status: 1, goods_name: 'SLOW-OLD' } }, { code: 1, data: { status: 2, goods_name: 'FAST-NEW' } }] });
  b.vm.getData();                       // 第一发：慢
  const p1 = b.env.calls.length;
  b.vm.getData();                       // 第二发：快（序号比第一发大）
  b.env.infoQueue = [];
  await tick();
  await tick();
  const firstIsOld = String((b.vm.info || {}).goods_name) !== 'SLOW-OLD';

  const c = buildVm(jsCode, { info: { code: 1, data: { status: 1 } } });
  c.vm.onLoad({ code: 'C' });
  await tick();
  const settled = c.vm.loading === false;
  const d = buildVm(jsCode, { infoFail: true });
  d.vm.onLoad({ code: 'C' });
  await tick();
  const failSettled = d.vm.loading === false && !!d.vm.notice;
  const e = buildVm(jsCode, { receive: { code: 1, msg: 'ok', data: {} } });
  e.vm.onLoad({ code: 'C' });
  await tick();
  let receiveGuarded = true;
  if (typeof e.vm.receive === 'function') {
    e.vm.receiving = false;
    e.vm._isDestroyed = true;
    e.vm.receive();
    await tick();
    // 领取这一条链的回调也要过闸门：销毁之后不许再把 receiving 翻回去（往已出栈的页面 setData）
    receiveGuarded = e.vm.receiving === false;
  } else {
    receiveGuarded = false;
  }
  const initTrue = buildVm(jsCode, {}).vm.loading === true;
  const ok = lateIgnored && firstIsOld && settled && failSettled && initTrue && receiveGuarded;
  return {
    ok,
    got: '销毁后回音整档丢弃=' + lateIgnored + '（loading 仍 ' + a.vm.loading + '）；慢的那一发不许盖过快的=' + firstIsOld
      + '（info=' + JSON.stringify((b.vm.info || {}).goods_name) + '）；成功撤骨架=' + settled + ' 失败撤骨架并说一句=' + failSettled
      + '；loading 初值 true=' + initTrue + ' [' + label + ']',
  };
}

/** ⑦ 未装那一档：不发请求、不 navigateBack（深链常常没有上一页可退） */
function checkUninstalledDeepLink(jsCode, label) {
  const { vm, env } = buildVm(jsCode, { install: '' });
  vm.onLoad({ code: 'GF-1' });
  const ok = env.calls.length === 0 && vm.loading === false && vm.blocked === true && !!vm.notice && env.back === 0;
  return { ok, got: '请求 ' + env.calls.length + ' 条、navigateBack ' + env.back + ' 次、整页那一句=' + JSON.stringify(vm.notice) + ' [' + label + ']' };
}
function checkEmptyCode(jsCode, label) {
  const { vm, env } = buildVm(jsCode, {});
  vm.onLoad({ code: '' });
  const ok = env.calls.length === 0 && vm.loading === false && /凭据|链接/.test(vm.notice || '');
  return { ok, got: '没带 code：请求 ' + env.calls.length + ' 条、那一句=' + JSON.stringify(vm.notice) + ' [' + label + ']' };
}

/**
 * ⑧ 骨架待在真实区块外壳里（另铺一棵灰树 = 违规），且**外壳与真实卡同一只、并带上左右留边**。
 *
 * 2026-10-27 用户点名「加载时的骨架屏宽度 100% 了，没有左右边距」：上一版骨架挂的是通栏
 * `.school-block`（左右内衬 0），数据到手后却是 `.school-cards`（左右留边 10）里的卡 —— 加载前后差 20px。
 * 所以判据不是「骨架在不在某个白卡里」，而是**骨架所在的那一层外壳要与真实卡同一只**：
 *  ① 骨架节点（类名带 `-sk` / 带 `:skeleton` 的组件 / 含 `<u-skeleton>`）往上找祖先，
 *     必须命中真实卡用的那枚外壳类（`school-block` / `school-cards` / `school-card`）；
 *  ② 命中 `school-card` 的还要再往上有一层 `school-cards`（留边由它给）——
 *     直接把 `.school-card` 摆进页面根上就是「通栏 100%」，与这一条要挡的病是同一个。
 */
function checkSkeletonShell(tpl, label) {
  const t = stripComments(tpl);
  // 2026-10-28：可领/已领取两档换成礼盒版式，骨架外壳也跟着换成 sfs-main / sfs-hero / sfs-gift
  const SHELL = /^(school-block|school-cards|school-card|sfs-main|sfs-hero|sfs-gift)$/;
  // ① 全模板里出现过的真实外壳类（先扫一遍，别让「骨架写在真实卡前面」把外壳漏掉）
  const shells = new Set();
  [...t.matchAll(/<[a-zA-Z][\w.-]*[^>]*class="([^"]*)"/g)].forEach((mm) => {
    mm[1].split(/\s+/).filter(Boolean).forEach((c) => { if (SHELL.test(c)) shells.add(c); });
  });
  // ② 找到第一处骨架节点，连它的祖先一起拼成一条类名链
  const re = /<\/?([a-zA-Z][\w.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  const stack = [];
  let skChain = null;
  let m;
  while ((m = re.exec(t)) !== null) {
    if (m[0][1] === '/') { stack.pop(); continue; }
    const attrs = m[2] || '';
    const cls = (/(?:^|\s)class="([^"]*)"/.exec(attrs) || [])[1] || '';
    const classes = cls.split(/\s+/).filter(Boolean);
    const isSk = /\bskeleton\b/.test(attrs) || classes.some((c) => /(^|-)sk($|-)/.test(c)) || /<u-skeleton/.test(m[0]);
    if (isSk && !skChain) {
      skChain = stack.reduce((acc, e) => acc.concat(e.classes), []).concat(classes);
    }
    if (m[3] !== '/') { stack.push({ classes }); }
  }
  const chain = skChain || [];
  const shellHit = chain.filter((c) => SHELL.test(c));
  const inside = shellHit.length > 0;
  // `.school-card` 的左右留边来自外层 `.school-cards`（padding 10）：直接摆在页面根上就是通栏 100%
  const hasContainer = shellHit.indexOf('school-card') < 0 || chain.indexOf('school-cards') >= 0;
  // 新骨架用 CSS 灰条 + `tz-course-mini :skeleton`，不再有 u-skeleton；两种都算「骨架在」
  const hasSkeleton = /<u-skeleton|:skeleton="true"|--sk/.test(t);
  return {
    ok: inside && hasContainer && hasSkeleton && shells.size > 0,
    got: '真实区块外壳 class=' + JSON.stringify([...shells]) + '；骨架所在那一串 class=' + JSON.stringify(chain)
      + (inside ? '（灰块进到外壳内部）' : '（在没有真实外壳的页根上另铺了一棵灰树 = 加载完整体换版）')
      + (hasContainer ? '' : '（`.school-card` 外面没有 `.school-cards` = 骨架通栏 100%、左右没有留边）')
      + ' u-skeleton=' + hasSkeleton + ' [' + label + ']',
  };
}

/**
 * ⑮ 安装态三态闸门（`src/common/utils/plugin-guard.js`）：`pluginState()` 回 `null` = `common.init`
 * 还没回包，这一档**既不判「未装」（整页误给一句「还没开通」）、也不发那条必然失败的请求**，
 * 骨架照铺等一次；init 回包后同一个入口自动放行并取数（`onSystemConfigReady` 那一条路）。
 * 深链首屏与 init 并行是常态，这一条挡的就是「把一次竞态写成一整屏错话」。
 */
async function checkInstallPending(jsCode, label) {
  const { vm, env } = buildVm(jsCode, {
    installState: null,
    info: { code: 1, data: { status: 1, claimable: 1, goods_name: 'N' } },
  });
  if (typeof vm.onLoad !== 'function') { return { ok: false, got: '这一页没有 onLoad，无从谈闸门 [' + label + ']' }; }
  vm.onLoad({ code: 'C' });
  await tick();
  const quietCount = env.calls.length;
  const quiet = quietCount === 0;
  const wasWaiting = vm.loading === true;
  const wasBlocked = vm.blocked === true;
  const wasNotice = String(vm.notice || '');
  const waiting = wasWaiting && !wasBlocked && !wasNotice;
  const hooked = env.readyCbs.length === 1;
  env.fireReady(true);
  await tick();
  await tick();
  const resumed = env.calls.some((c) => c.name === 'send_friend.gift.info');
  const landed = vm.loading === false && String((vm.info || {}).goods_name) === 'N';
  return {
    ok: quiet && waiting && hooked && resumed && landed,
    got: 'init 未回包：请求 ' + quietCount + ' 条（须 0）、骨架照铺=' + wasWaiting
      + '、未判未装=' + !wasBlocked + '、没给错话=' + (wasNotice === '') + '、挂在 ready 回调上=' + hooked
      + '；回包后自动放行=' + resumed + '、数据到手=' + landed + ' [' + label + ']',
  };
}

/** ⑨ 样式与形态：禁 rpx、按钮只 4px（胶囊 21/22px 与圆形 50% 都算自造）、颜色只吃 token */
function checkStyle(css, tpl, label) {
  const flat = stripComments(css);
  const bad = [];
  const rpx = flat.match(/[\d.]+rpx/g);
  if (rpx) bad.push('rpx 单位：' + rpx.slice(0, 3).join(','));
  // 色板：§1 那七枚 + M6/M21 已登记、同模块「赠送记录」页也在用的四档
  // （正文 #1d2129 / 次级 #4e5969 / 发丝线与浅底 #f2f3f5 / 蓝标签档 #e8f3ff + #0d5bc4）。
  // 多出来的颜色一律判红：这一页没有自己的业务主色，捡一个别的色系进来就是「配色表叠两套」那一族。
  // 2026-10-28 用户点名「.school-page.sfr-page--gift 页面的背景色恢复为默认」（同轮也点名了送礼页）：
  // 礼盒版式保留、暖米底 #fdf5e4 整族下线 —— 两页白名单都不再放行这一色。
  const ALLOW = ['#0968f6', '#86909c', '#f7f8fa', '#fff', '#ffffff', '#f53f3f', '#e5e6eb',
    '#1d2129', '#4e5969', '#f2f3f5', '#e8f3ff', '#0d5bc4'];
  (flat.match(/#[0-9a-fA-F]{3,8}\b/g) || []).forEach((c) => { if (ALLOW.indexOf(c.toLowerCase()) < 0) bad.push('token 之外的颜色 ' + c); });
  [...flat.matchAll(/([^{}]+)\{([^}]*)\}/g)].forEach((m) => {
    const sel = m[1].trim().replace(/\s+/g, ' ');
    const v = (/border-radius:\s*([^;]+)/.exec(m[2]) || [])[1];
    if (!v) return;
    const val = v.trim();
    const isBtn = /btn|button|cta|submit|pay\b/i.test(sel);
    if (!isBtn) return;
    if (/(^|[\s,;])(21|22)px|50%/.test(val)) bad.push('自造按钮形态：' + sel + ' 圆角 ' + val + '（只许 tz-button 的 4px）');
    else if (!/^4px/.test(val)) bad.push('按钮圆角不是 4px：' + sel + ' = ' + val);
  });
  const t = stripComments(tpl);
  if (/<button[\s>]/.test(t)) bad.push('裸 <button>');
  if (/<u-loading-page|<tz-loading-page/.test(t)) bad.push('整页加载组件（M16 只认骨架屏）');
  if (/>\s*(页面)?加载中[….]*\s*</.test(t) || /<u-loading-icon[^>]*text=/.test(t)) bad.push('转圈 + 「加载中」文字块');
  return { ok: bad.length === 0, got: bad.length ? bad.join('；') : '无 rpx、颜色全在 token 内、按钮 4px、加载态是骨架屏' + ' [' + label + ']' };
}

/** ⑯ 已领取那一档（2026-10-28 参考图「礼物已领取」）：切到与送礼页共用的礼盒版式
 *  （大标题 + 蓝面板 + 白卡），字段吃后端 receiver_name / receiver_avatar / claimed_at_date；
 *  只挂在 `!needLogin && status === 2` 那一支，可领/已失效/未登录仍走原白卡版式。 */
function checkClaimedLayout(tpl, js) {
	const t = stripComments(tpl);
	const j = stripComments(js);
	const branch = /v-else-if="!needLogin && status === 2"/.test(t);
	const title = /class="sfs-result-title"/.test(t);
	const hero = /class="sfs-hero"/.test(t) && /礼物已备好 给Ta送心意/.test(t) && /class="sfs-gift"/.test(t);
	const card = /class="sfs-claim-card"/.test(t) && /class="sfs-claim-text"/.test(t)
		&& /claimActionText/.test(t) && /领取了你的赠送/.test(j);
	const fields = /receiver_name/.test(j) && /receiver_avatar/.test(j) && /claimed_at_date/.test(j)
		&& /resultTitle\(\)/.test(j) && /claimedLabel\(\)/.test(j);
	return {
		ok: branch && title && hero && card && fields,
		got: 'status=2 专支=' + branch + ' 大标题=' + title + ' 蓝面板/礼物已备好=' + hero
			+ ' 白卡/领取人=' + card + ' 四枚字段=' + fields,
	};
}

/** ⑰ 可领那一档（2026-10-28 用户点名「领礼物的页面啊 没动」）：也切到礼盒视觉——
 *  送出人一行 + 蓝面板「好友赠礼 请领取」+ 商品卡 + 权益/有效期 + 立即领取；
 *  礼盒版式只在非 notice 档挂 `giftPage`（2026-10-28 起只换版式、不再换底色，见 ⑲）。 */
function checkClaimableLayout(tpl, js) {
	const t = stripComments(tpl);
	const j = stripComments(js);
	const branch = /v-else-if="!needLogin && status === 0"/.test(t);
	const head = /class="sfr-giver-head"/.test(t) && /送你的礼物/.test(t);
	const hero = /class="sfs-hero"/.test(t) && /好友赠礼 请领取/.test(t);
	const action = /class="sfr-claim-action"/.test(t) && /@click="receive"/.test(t);
	// 2026-10-28 统一样式：除 notice 外全部礼盒视觉（含未登录/已失效），判据收成 `!this.notice`
	const page = /giftPage\(\)/.test(j) && /return !this\.notice;/.test(j);
	return {
		ok: branch && head && hero && action && page,
		got: '可领专支=' + branch + ' 送出人一行=' + head + ' 蓝面板/好友赠礼=' + hero
			+ ' 立即领取=' + action + ' 礼盒版式判据=' + page,
	};
}

/** ⑱ 统一样式（2026-10-28 用户第二次点名「就不能一次性搞好吗，统一下样式」）：
 *  未登录不再回旧白卡，同样走礼盒（蓝面板 + 商品卡 + 「登录后领取」）；已失效/其余终局档
 *  走「大标题 + 蓝面板 + 白卡原因」；除整页取不到（notice）外，`giftPage` 一律礼盒版式。 */
function checkUnifiedStates(tpl, js) {
	const t = stripComments(tpl);
	const j = stripComments(js);
	const need = /v-else-if="needLogin"/.test(t) && /登录后领取/.test(t) && /@click="goLogin"/.test(t);
	const needHero = /v-else-if="needLogin"[\s\S]{0,1200}?class="sfs-hero"/.test(t);
	const voidCard = /class="sfs-result-title"/.test(t) && /class="sfs-claim-card"/.test(t)
		&& /class="sfs-claim-reason"/.test(t);
	const page = /giftPage\(\)[\s\S]{0,200}?return !this\.notice;/.test(j);
	return {
		ok: need && needHero && voidCard && page,
		got: '未登录专支/登录键=' + need + ' 未登录礼盒=' + needHero
			+ ' 失效白卡原因=' + voidCard + ' 礼盒版式=' + page,
	};
}

/** ⑲ 页面底色回全站默认（2026-10-28 用户点名「.school-page.sfr-page--gift 页面的背景色恢复为默认」）：
 *  礼盒那一档只留排版（竖轴 + 正文撑满 + 去底部留白），**根双类上不写 background**，
 *  底色落到 `App.vue` 的 `.school-page` = #f7f8fa；暖米底 #fdf5e4 整族下线（同轮送礼页
 *  `.school-page.sfs-page` 一起撤，见 `check-send-friend-send.js` ⑨），别再捡回来。 */
function checkGiftRootNoBg(css) {
	const flat = stripComments(css);
	const m = /\.school-page\.sfr-page--gift\s*\{([^}]*)\}/.exec(flat);
	const body = m ? m[1] : '';
	const noBg = !/background(-color)?\s*:/i.test(body);
	const layout = /display:\s*flex/.test(body) && /flex-direction:\s*column/.test(body)
		&& /padding-bottom:\s*0/.test(body);
	return { ok: !!m && noBg && layout, got: '根双类在=' + !!m + ' 未写背景=' + noBg + ' 排版齐=' + layout };
}

/** ⑳ 商品卡可点进详情（2026-10-28 用户点名「收礼详情页中点击商品要能够跳转到对应的页面」）：
 *  登录后 `courseCard` 带 `id` / `type`，四档卡片一律 `:clickable="canOpenGoods"`，由
 *  `tz-course-mini` 走 `$nav.getPagePath(id, type)` 跳商品详情；未登录那一档后端只回商品名/封面
 *  （§2.3-4），没有 id ⇒ 不可点，不给一条点了没反应的路（硬约束 27②）。 */
function checkCardClick(tpl, js) {
	const t = stripComments(tpl);
	const j = stripComments(js);
	const listCards = (t.match(/<tz-course-mini[^>]*:list="courseCard"/g) || []).length;
	const bound = (t.match(/:clickable="canOpenGoods"/g) || []).length;
	const idType = /item\.id = Number\(d\.goods_id\)/.test(j)
		&& /item\.type = String\(d\.course_type \|\| d\.gift_type/.test(j);
	const inLogged = /if \(!this\.needLogin\) \{[\s\S]{0,320}?item\.id =/.test(j);
	const guard = /canOpenGoods\(\) \{[\s\S]{0,240}?return !!d\.id && !!d\.type;/.test(j);
	return {
		ok: listCards >= 4 && bound === listCards && idType && inLogged && guard,
		got: '带 list 的商品卡=' + listCards + ' 可点绑定=' + bound + ' id/type 在位=' + idType
			+ ' 只在登录档给=' + inLogged + ' 判据=id&&type=' + guard,
	};
}

const jsCode = scriptOf(JS);
const tpl = templateOf(VUE);
const css = read(CSS);

(async () => {
  if (process.argv.indexOf('--selftest') >= 0) return selftest();
  console.log('=== check-send-friend-receive（M-P6/M-P7 凭据 / 防枚举 / 三态 / 已销毁闸门 / 样式）===');

  let r = checkCodeOnce(jsCode, '真件');
  assert('① ?code= 只在 onLoad 读一次（onShow 里没有重读、也没有再发请求）', r.ok, r.got);
  r = await checkNoLeak(tpl, jsCode, '真件');
  assert('② 未登录那一档只出商品名与封面 + 一枚「登录后领取」（模板逐处查到过 !needLogin 祖先）', r.ok, r.got);
  r = await checkThreeStates(jsCode, '真件');
  assert('③ 三态各一句、句子优先吃后端，没有一句落成「服务处理失败，请稍后重试」', r.ok, r.got);
  r = await checkReceiveFlow(jsCode, '真件');
  assert('④ 领取成功 → 弹后端 tip + 关页跳商品详情；失败盖后端那一句并重取；旧成功屏/next_code 零残留', r.ok, r.got);
  r = await checkDetailRedirect(jsCode, '真件');
  assert('⑤ goDetail() 走 $nav.getPagePath + redirectTo（关闭当前页再进详情）', r.ok, r.got);
  r = await checkDestroyedGuard(jsCode, '真件');
  assert('⑥ 回音写 data 前过「已销毁」闸门 + 序号丢旧回音；四条退出分支都撤骨架', r.ok, r.got);
  r = checkUninstalledDeepLink(jsCode, '真件');
  assert('⑦ 未装那一档：不发请求、不 navigateBack，整页给一句去处', r.ok, r.got);
  r = checkEmptyCode(jsCode, '真件');
  assert('⑧ 链接没带凭据：那一句要说得出原因，不发那条必然失败的请求', r.ok, r.got);
  r = checkSkeletonShell(tpl, '真件');
  assert('⑨ 骨架待在真实区块外壳里（school-block 那一档），不在白面板上另铺灰树', r.ok, r.got);
  r = checkStyle(css, tpl, '真件');
  assert('⑩ 样式：禁 rpx、颜色只吃名单内那几档、按钮只 4px、加载态是骨架屏', r.ok, r.got);

  const apiBlock = sendFriendApiBlock();
  assert('⑪ gift/info 免登录、gift/receive 要登录，页面按表里的键调用',
    /info:\s*\{[\s\S]{0,120}?url:\s*['"]app\/send_friend\/gift\/info['"][\s\S]{0,80}?auth:\s*false/.test(apiBlock)
      && /receive:\s*\{[\s\S]{0,120}?url:\s*['"]app\/send_friend\/gift\/receive['"][\s\S]{0,80}?auth:\s*true/.test(apiBlock)
      && /\$api\(\s*['"]send_friend\.gift\.info['"]/.test(jsCode) && /\$api\(\s*['"]send_friend\.gift\.receive['"]/.test(jsCode), '在位');

  r = await checkRenderStates(jsCode, tpl, '真件');
  assert('⑫ 逐档渲染路径模拟：主按钮每档 ≤1、未登录只出登录口、成功=toast+跳详情', r.ok, r.got);

  const ALL_SCRIPTS = [
    [JS, 'receive/js.vue'],
    [path.join(ROOT, 'src/pages/app/send_friend/gift/js.vue'), 'gift/js.vue'],
    [path.join(ROOT, 'src/components/modal/share-modal.vue'), 'share-modal.vue'],
    [path.join(ROOT, 'src/components/tz/send-friend-area.vue'), 'send-friend-area.vue'],
  ];
  const dups = [];
  ALL_SCRIPTS.forEach(([f, n]) => { const one = checkNameCollision(scriptOf(f), n); if (!one.ok) dups.push(one.got); });
  assert('⑬ 四份文件里 data 与 computed 都没有同名（同名那一枚 computed 在 Vue 里根本装不上去 = 死代码）',
    dups.length === 0, dups.length ? dups.join('　') : ALL_SCRIPTS.map((x) => x[1]).join(' / ') + ' 都无同名');

  r = checkPageTail(tpl, 'receive.vue');
  assert('⑭ 页尾两枚常驻组件在位：<tz-tab-bar /> + <tz-footer />（与赠送记录页同一档）', r.ok, r.got);

  r = await checkInstallPending(jsCode, '真件');
  assert('⑮ 安装态三态闸门：init 未回包时不判未装、不发请求，回包后自动放行取数', r.ok, r.got);

  r = checkClaimedLayout(tpl, jsCode);
  assert('⑯ 已领取那一档：切到「礼物已领取」礼盒版式（大标题 + 蓝面板 + 领取人白卡）', r.ok, r.got);

  r = checkClaimableLayout(tpl, jsCode);
  assert('⑰ 待赠送那一档：送出人一行 + 蓝面板「好友赠礼 请领取」+ 立即领取（不能领时给后端那句）', r.ok, r.got);

  r = checkUnifiedStates(tpl, jsCode);
  assert('⑱ 未登录/已失效也统一礼盒版式（未登录「登录后领取」、失效白卡原因、除 notice 外礼盒版式）', r.ok, r.got);

  r = checkGiftRootNoBg(css);
  assert('⑲ 礼盒版式的页面底色回全站默认（根双类只留排版、不写 background，暖米底整族下线）', r.ok, r.got);

  r = checkCardClick(tpl, jsCode);
  assert('⑳ 商品卡可点进详情（登录后带 id/type，四档卡一律 canOpenGoods；未登录没有 id 不可点）', r.ok, r.got);

  console.log(fail === 0 ? '\n结果：全部符合预期（通过 ' + pass + ' 项 / 违反 ' + fail + ' 项）'
    : '\n结果：有 ' + fail + ' 项不符合预期（通过 ' + pass + ' 项）');
  process.exitCode = fail === 0 ? 0 : 1;

  async function selftest() {
    console.log('=== --selftest：坏样件必须每一条都被同一组判据抓红 ===');
    let fired = 0;
    const expect = (name, res) => {
      if (res.ok) { console.log('[SELFTEST-FAIL] ' + name + ' 没被抓到（这条判据是瞎的）-> ' + res.got); fail++; }
      else { fired++; console.log('[SELFTEST-FIRE] ' + name + ' 已报红 -> ' + res.got); pass++; }
    };

    const BAD_ONSHOW_REREAD = `
      export default {
        data() { return { code: '', loading: true, blocked: false, info: {}, notice: '', seq: 0 } },
        onLoad(p) { this.code = String((this.$nav.parsePageParams(p) || {}).code || ''); this.getData(); },
        onShow() { const q = this.$nav.parsePageParams({ code: 'REREAD' }); this.code = q.code; },
        methods: { gone() { return false; }, getData() { return this.$api('send_friend.gift.info', { code: this.code }).then((r) => { this.info = r.data; this.loading = false; }); } },
      };`;
    const BAD_LEAK = `<template><view>
        <view>{{ goodsName }}</view><image :src="cover"/>
        <view class="desc">{{ goodsDesc }}</view>
        <view class="giver"><image :src="giverAvatar"/><text>{{ giverName }}</text></view>
        <text>{{ stateSub }}</text>
        <tz-button text="登录后领取" @click="goLogin"/>
      </view></template>`;
    const BAD_ONE_SENTENCE = `
      export default {
        data() { return { info: {}, notice: '', stateOverride: '', code: '', loading: true, blocked: false } },
        onLoad(p) { this.code = (p || {}).code; this.getData(); },
        methods: { gone() { return false; }, getData() { return this.$api('send_friend.gift.info', { code: this.code }).then((r) => { this.info = r.data || {}; this.loading = false; }); } },
        computed: {
          needLogin() { return Number((this.info || {}).need_login || 0) === 1; },
          canClaim() { return Number((this.info || {}).can_claim || 0) === 1; },
          status() { return Number((this.info || {}).status); },
          stateText() { return '${GENERIC}'; },
          stateSub() { return (this.info || {}).expire_text || ''; },
        },
      };`;
    const BAD_SELF_QUERY = `
      export default {
        data() { return { code: '', loading: true, blocked: false, info: {}, notice: '', seq: 0, claimed: true, pendingFromList: 0, doneTip: '' } },
        onLoad(p) { this.code = (p || {}).code; this.getData(); },
        methods: {
          gone() { return false; },
          getData() {
            return this.$api('send_friend.gift.info', { code: this.code }).then((r) => {
              this.info = r.data || {}; this.loading = false;
              return this.$api('send_friend.gift.list', {}).then((l) => { this.pendingFromList = ((l && l.data) || {}).total || 0; });
            });
          },
          receive() { return this.$api('send_friend.gift.receive', { code: this.code }).then(() => { this.claimed = true; }); },
          goGiftList() { this.$nav.to('/pages/app/send_friend/gift/gift'); },
          goSubscription() { this.$nav.to('/pages/user/index/index'); },
        },
        computed: {
          needLogin() { return Number((this.info || {}).need_login || 0) === 1; },
          canClaim() { return Number((this.info || {}).claimable || 0) === 1; },
          status() { return Number((this.info || {}).status); },
          stateText() { return 'x'; },
          stateSub() { return ''; },
          morePending() { return this.claimed && this.pendingFromList > 0 ? this.pendingFromList : 0; },
        },
      };`;
    const BAD_NO_GUARD = `
      export default {
        data() { return { code: '', loading: true, blocked: false, info: {}, notice: '', seq: 0 } },
        onLoad(p) { this.code = (p || {}).code; this.getData(); },
        methods: { getData() { return this.$api('send_friend.gift.info', { code: this.code }).then((r) => { this.info = r.data; this.loading = false; }); } },
      };`;
    const BAD_BACK_ON_MISSING = `
      export default {
        data() { return { loading: true, blocked: false, notice: '', code: '' } },
        onLoad(p) {
          if (!this.$tools.systemConfig('app_isinstall_send_friend')) { uni.showToast({ title: '未安装' }); uni.navigateBack(); this.loading = false; return; }
          this.code = (p || {}).code; if (!this.code) { this.loading = false; this.notice = '链接不对'; return; }
        },
        methods: { getData() { return this.$api('send_friend.gift.info', {}).then(() => {}); } },
      };`;
    const BAD_GREY_TREE = `<template><view class="page-white">
        <view class="sk-tree"><view class="grey"></view><view class="grey"></view></view>
        <view class="school-block"><text>礼物</text></view>
      </view></template>`;
    // 骨架在真卡里、但外面没套 `.school-cards`：卡片贴着屏幕两缘铺满（= 用户点名的「宽度 100%、没有左右边距」）
    const BAD_SK_NO_MARGIN = `<template><view class="school-card">
        <u-skeleton :loading="true" :rows="1" :rows-width="['60%']"></u-skeleton>
      </view></template>`;
    const BAD_PILL = `.sfr-go-btn { border-radius: 22px; background: #ff7a00; } .sfr-round { border-radius: 50%; }
      .sfr-cover { padding: 20rpx; }`;

    expect('坏样件 1：onShow 里重读 code（退回就把用户改过的那一屏按旧地址重刷）', checkCodeOnce(BAD_ONSHOW_REREAD, '样件1'));
    expect('坏样件 2：未登录把权益说明与送出人一起摆出来（防枚举那一条没守住）', await checkNoLeak(BAD_LEAK, BAD_ONE_SENTENCE, '样件2'));
    expect('坏样件 3：三态都落一句通用报错（没有出路）', await checkThreeStates(BAD_ONE_SENTENCE, '样件3'));
    expect('坏样件 4：领取成功不关页跳详情、还在切旧成功屏 + 自己发 gift.list 查剩余份数', await checkReceiveFlow(BAD_SELF_QUERY, '样件4'));
    expect('坏样件 5：成功那一档没有 goDetail（旧出口指去订阅页/赠送记录）', await checkDetailRedirect(BAD_SELF_QUERY, '样件5'));
    expect('坏样件 6：回音不过「已销毁」闸门就写 data（M26）', await checkDestroyedGuard(BAD_NO_GUARD, '样件6'));
    expect('坏样件 7：未装那一档 navigateBack，深链把人留在空白里', checkUninstalledDeepLink(BAD_BACK_ON_MISSING, '样件7'));
    expect('坏样件 9：白面板上另铺一棵灰树', checkSkeletonShell(BAD_GREY_TREE, '样件9'));
    expect('坏样件 9b：骨架卡没套 .school-cards（通栏 100%、左右没有留边）', checkSkeletonShell(BAD_SK_NO_MARGIN, '样件9b'));
    expect('坏样件 10：胶囊按钮 22px + 越界颜色 + rpx', checkStyle(BAD_PILL, '<view></view>', '样件10'));
    expect('坏样件 11：转圈 + 「加载中」文字块', checkStyle('.x{border-radius:4px}', '<view class="b"><u-loading-icon text="加载中"></u-loading-icon><text>加载中…</text></view>', '样件11'));
    const BAD_EMPTY_REQ = `
      export default {
        data() { return { loading: true, blocked: false, notice: '', code: '' } },
        onLoad(p) { this.code = (p || {}).code || ''; this.getData(); },
        methods: { gone() { return false; }, getData() { return this.$api('send_friend.gift.info', { code: this.code }).then(() => { this.loading = false; }); } },
      };`;
    expect('坏样件 8：没带凭据还照发那条必然失败的请求', checkEmptyCode(BAD_EMPTY_REQ, '样件8'));
    expect('坏样件 12：info 那一口改成要登录（好友点开的深链取不到数）', (function () {
      const flipped = sendFriendApiBlock().replace(/info:\s*\{([\s\S]{0,160}?)auth:\s*false/, 'info: {$1auth: true');
      return {
        ok: /info:\s*\{[\s\S]{0,160}?url:\s*['"]app\/send_friend\/gift\/info['"][\s\S]{0,80}?auth:\s*false/.test(flipped),
        got: '把 send_friend 那一块的 info 改成 auth:true 之后，判据必须翻红（实得：' + (/auth:\s*false/.test(/info:\s*\{([\s\S]{0,160}?)/.exec(flipped)[1]) ? '仍判绿 ⇒ 判据太宽' : '已翻红') + '）',
      };
    })());

    const BAD_SHADOW = `
      export default {
        data() { return { doneTip: '' }; },
        computed: { doneTip() { return this.doneTip || '现在去「已购」就能开始学习这份礼物。'; } },
        methods: { receiveOk(msg) { this.doneTip = msg || ''; } },
      };`;
    expect('坏样件 13：data 与 computed 同名 ⇒ 界面吃的是 data，那句兜底文案永远走不到', checkNameCollision(BAD_SHADOW, '样件13'));

    const BAD_TWO_PRIMARY = `<template v-if="loading"><view>骨架</view></template>
      <template v-else-if="notice"><view>{{ notice }}</view></template>
      <template v-else>
        <view>{{ goodsName }}</view>
        <tz-button type="primary" text="登录后领取" @click="goLogin"></tz-button>
        <tz-button type="primary" :text="receiveBtnText" @click="receive"></tz-button>
      </template>`;
    expect('坏样件 14：未登录与可领两枚主按钮同时摆出（M17 + §2.3-4 一起破）', await checkRenderStates(BAD_ONE_SENTENCE, BAD_TWO_PRIMARY, '样件14'));

    expect('坏样件 16：init 还没回包就直接发请求（把一次竞态当成已装，⑦ 那条判据抓不到）',
      await checkInstallPending(BAD_NO_GUARD, '样件16'));

    expect('坏样件 15：页尾没挂 tz-tab-bar / tz-footer（吸底那一档不算页脚）',
      checkPageTail('<template><view class="sfr"><view class="school-block"><text>礼物</text></view></view></template>', '样件15'));

    expect('坏样件 17：已领取那一档没有切到共用礼盒版式（仍是旧白卡）',
      checkClaimedLayout(tpl.replace('v-else-if="!needLogin && status === 2"', 'v-else-if="false"'), jsCode));
    expect('坏样件 18：待赠送那一档没有切到礼盒视觉（仍是旧白卡）',
      checkClaimableLayout(tpl.replace('v-else-if="!needLogin && status === 0"', 'v-else-if="false"'), jsCode));
    expect('坏样件 20：礼盒版式的根双类又写回暖米底（页面底色不是默认了）',
      checkGiftRootNoBg(css.replace('.school-page.sfr-page--gift {', '.school-page.sfr-page--gift {\n  background: #FDF5E4;')));
    expect('坏样件 21：商品卡又退回 `:clickable="false"`（点商品不跳详情了）',
      checkCardClick(tpl.replace(/:clickable="canOpenGoods"/g, ':clickable="false"'), jsCode));

    // 反向样件：合格写法不该被抓
    const goodStyle = checkStyle('.sfr-avatar{border-radius:50%;width:36px}.sfr-sk-btn{border-radius:4px;background:#e5e6eb}.sfr-name{color:#86909c}', '<view><tz-button type="primary" text="领取赠送"/></view>', '好样件');
    if (!goodStyle.ok) { fail++; console.log('[SELFTEST-FAIL] 好样件被判红 ⇒ 判据太宽 -> ' + goodStyle.got); }
    else { pass++; console.log('[SELFTEST-OK] 好样件未被误判（圆形头像、正文深色不吃按钮档位）-> ' + goodStyle.got); }

    const goodTail = checkPageTail('<template><view class="sfr"><text>行</text><tz-tab-bar /><tz-footer /></view></template>', '好样件-页尾');
    if (!goodTail.ok) { fail++; console.log('[SELFTEST-FAIL] 页尾判据把合格写法判红了 ⇒ 判据太宽 -> ' + goodTail.got); }
    else { pass++; console.log('[SELFTEST-OK] 页尾判据不误判合格写法 -> ' + goodTail.got); }

    // 骨架外壳：`.school-cards > .school-card` 这一档（留边 10 由容器给）是合格写法，不许被判红
    const goodShell = checkSkeletonShell('<template><view class="school-cards"><view class="school-card">'
      + '<u-skeleton :loading="true" :rows="1" :rows-width="[\'60%\']"></u-skeleton></view></view></template>', '好样件-骨架');
    if (!goodShell.ok) { fail++; console.log('[SELFTEST-FAIL] 骨架外壳判据把合格写法判红了 ⇒ 判据太宽 -> ' + goodShell.got); }
    else { pass++; console.log('[SELFTEST-OK] 骨架外壳判据不误判合格写法（.school-cards > .school-card）-> ' + goodShell.got); }

    // 页面底色：根双类只留排版（不写 background）是合格写法，白卡/蓝面板的 `background` 不在这条判据里
    const goodRoot = checkGiftRootNoBg('.school-page.sfr-page--gift{display:flex;flex-direction:column;min-height:100vh;padding-bottom:0}'
      + '.sfs-hero{background:#234A9A}');
    if (!goodRoot.ok) { fail++; console.log('[SELFTEST-FAIL] 页面底色判据把合格写法判红了 ⇒ 判据太宽 -> ' + goodRoot.got); }
    else { pass++; console.log('[SELFTEST-OK] 页面底色判据不误判合格写法（根双类无 background、面板底色不算）-> ' + goodRoot.got); }

    console.log('\n[SELFTEST] 坏样件 ' + fired + ' 条被抓红（要求 ≥15），合格样件不误报；总通过 ' + pass + ' / 失败 ' + fail);
    process.exitCode = fail === 0 && fired >= 15 ? 0 : 1;
    return undefined;
  }
})().catch((e) => {
  console.log('[HARNESS-ERROR] ' + (e && e.stack ? e.stack : e));
  process.exitCode = 1;
});
