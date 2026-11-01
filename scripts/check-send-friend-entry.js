/**
 * M-P1 送好友入口（components/tz/send-friend-area.vue + 宿主 pages/course/detail）—— 不构建、不开浏览器
 *
 * 为什么单拉一个脚本：这一族坏法，`sfc-check`（只编译模板）与 `ui-audit`（只按正则查版式）一条都看不见：
 *  ① 未装插件照样发请求（闸门写在使用处而不是装载之前 ⇒ 标准版每个商详页白发一条 404 口）；
 *  ② 入口显隐在前端把「总开关 ∧ 类别勾选 ∧ 商品可送」重判一遍（硬约束 31/M36②：三枚轴各存一份就是分叉）；
 *  ③ 判据挂在 `list.length > 0` 上（硬约束 27②：新礼单永远等不到第一行 ⇒ 「开了却没有按钮」）；
 *  ④ 组件对外事件名用 `tap`（M28/硬约束 27①：H5 编译器单向改名，源码看着对称、实跑永远收不到）；
 *  ⑤ 进送礼下单页把课程详情页的 onShow 三档判据翻掉（硬约束 16 例外二 ⇒ 「切一次标签页重播一遍」复发）；
 *  ⑥ 区块排到 `tz-footer` 之后（页面最底、页脚之下＝用户看不见；另有挂载点上 ∧ 订阅态的第二种「看不见」——
 *     2026-10-16 用户点名「mobile 的详情页为什么没有送好友按钮，我拿什么去送呢」，两条都在本脚本钉住）。
 *
 * 所以本脚本**真的把组件与页面 onShow 的方法体跑起来**（不构建、不跑浏览器，只 new Function 求值），
 * 逐档喂载荷矩阵与生命周期序列，而不是拿正则数一数关键字。
 *
 * 用法：node tuzi-mobile/scripts/check-send-friend-entry.js            # 验真件
 *       node tuzi-mobile/scripts/check-send-friend-entry.js --selftest # 验这道门禁「能红」
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const AREA = path.join(ROOT, 'src/components/tz/send-friend-area.vue');
const DETAIL_JS = path.join(ROOT, 'src/pages/course/detail/js.vue');
const DETAIL_VUE = path.join(ROOT, 'src/pages/course/detail/detail.vue');
const API_LIST = path.join(ROOT, 'src/common/request/api_list.js');
const PAGES_JSON = path.join(ROOT, 'src/pages.json');

// 样件里那种「只有 .then 没有 .catch」的写法必然抛未处理拒绝；本脚本只读源码求值，
// 不把这件事报成崩溃（真件的 reject 分支自己写了 catch）
process.on('unhandledRejection', (e) => { console.log('[note] 未处理的 promise 拒绝（坏样件故意留的那一支）：' + (e && e.message)); });

const REAL_SETTIMEOUT = setTimeout;
const tick = () => new Promise((r) => REAL_SETTIMEOUT(r, 5));
const NATIVE_EVENTS = ['tap', 'click', 'longpress', 'longtap', 'input', 'change', 'blur', 'focus', 'confirm'];

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
  if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  return !!ok;
}

const read = (f) => fs.readFileSync(f, 'utf8');
const scriptOf = (file) => {
  const m = read(file).match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error(file + ' 里没有 <script>');
  return m[1];
};
/** 根 template 的内容：非贪婪正则会在第一个内层 </template> 上截断（= 假绿），所以按首尾定位 */
const templateOf = (file) => {
  const src = read(file);
  const m = src.match(/<template[^>]*>/);
  if (!m) return '';
  const at = src.indexOf(m[0]);
  const end = src.lastIndexOf('</template>');
  return end <= at ? '' : src.slice(at + m[0].length, end);
};
/** 注释不是界面：判「界面上有没有这一块」之前必须先把 HTML/JS 注释剥干净 */
const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/[^\n]*/gm, ' ');
/** 组件的 <style> 体：⑯ 判「购买栏那一档的类名有没有残留」要连样式一起看（模板/脚本干净、样式留一条也算残留） */
const styleOf = (file) => {
  const m = read(file).match(/<style[^>]*>([\s\S]*?)<\/style>/);
  return m ? m[1] : '';
};

/** 按大括号配平抠方法体（与 check-side-entry-style.js 同一手法） */
function methodBody(code, at) {
  const open = code.indexOf('{', at);
  if (open < 0) throw new Error('找不到左大括号');
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') { depth--; if (!depth) return code.slice(open + 1, i); }
  }
  throw new Error('大括号没配平');
}
function bodyOf(code, signature) {
  const at = code.search(signature);
  if (at < 0) return null;
  return methodBody(code, at);
}

/** 从 at 处那枚 { 开始按大括号配平，返回整块长度（含收尾括号） */
function balancedEnd(text, at) {
  const open = text.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') { depth--; if (!depth) return i - at + 1; }
  }
  return text.length - at;
}

function makeEnv(opt) {
  const o = opt || {};
  const env = {
    calls: [], trace: [], toasts: [], timers: [], emits: [], nav: [],
    install: o.install === undefined ? '' : o.install,
    payload: o.payload, code: o.code === undefined ? 1 : o.code, apiFail: !!o.apiFail,
  };
  env.uni = {
    getStorageSync: (k) => (k === 'user_token' ? (o.token || '') : ''),
    setStorageSync: () => {},
    showToast: (a) => { env.toasts.push((a && a.title) || ''); env.trace.push('toast'); },
    navigateBack: () => { env.trace.push('navigateBack'); },
    getSystemInfoSync: () => ({ windowHeight: o.windowHeight || 700 }),
    stopPullDownRefresh: () => { env.trace.push('stopPullDownRefresh'); },
    showLoading: () => {}, hideLoading: () => {},
    $u: { toast: () => {} },
  };
  env.$tools = {
    systemConfig: (k) => (k === 'app_isinstall_send_friend' ? env.install : ''),
    copy: () => {},
  };
  // 付费插件闸门（`common/utils/plugin-guard.js`）的桩：三态由 `installState` 给，
  // `onSystemConfigReady` 把回调收着，测试里手动触发「init 回包」那一拍。
  // 缺省由旧 `install` 推出（'' = 未装 / 非空 = 已装），老断言不用改。
  env.installState = o.installState !== undefined ? o.installState
    : (env.install === '' || env.install === undefined ? false : true);
  env.pluginMissing = !!o.pluginMissing;
  env.$api = function (name, params) {
    env.calls.push({ name, params });
    env.trace.push('api:' + name);
    if (env.apiFail && (o.failWhen || 'send_friend.gift.entry') === name) return Promise.reject(new Error('network down'));
    if (name === 'send_friend.gift.entry') {
      // `pendingEntry`：模拟「flag 还在路上」那一帧（真件在这一帧不许摆可点入口）
      if (o.pendingEntry) {
        return new Promise((resolve) => {
          env.resolveEntry = () => resolve({ code: env.code, msg: 'ok', data: env.payload });
        });
      }
      return Promise.resolve({ code: env.code, msg: 'ok', data: env.payload });
    }
    return Promise.resolve({ code: 1, msg: 'ok', data: {} });
  };
  env.$nav = {
    to: (dest, type, mode) => { env.trace.push('nav:' + dest); env.nav.push({ dest, type, mode }); },
    parsePageParams: (p) => p,
    share: () => ({}),
  };
  // 真 mpKey 的规则就是「把点吃掉」；桩按同一口径实现，读写两头不一致时断言必然翻红
  env.mpKey = (v) => String(v).replace(/[^0-9A-Za-z_-]/g, '_');
  env.setTimeout = (fn, ms) => { env.timers.push({ fn, ms }); return env.timers.length; };
  env.clearTimeout = (id) => { if (env.timers[id - 1]) env.timers[id - 1].cancelled = true; };
  return env;
}

/** 把一段 <script> 源码装成组件/页面 options：import 全部桩化，export default → module.exports */
function loadOptions(code, env) {
  let src = code.replace(/export\s+default/, 'module.exports =');
  src = src.replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, 'const $1 = {};');
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']*["'];?\s*$/gm, (m, names) => {
    const list = names.split(',').map((s) => s.trim()).filter(Boolean);
    return 'const ' + list.map((n) => n + ' = __STUB__.named("' + n + '")').join(', ') + ';';
  });
  const mod = { exports: {} };
  const stubs = {
    def: () => ({}),
    named: (n) => {
      if (n === 'mpKey') { return env.mpKey; }
      if (n === 'pluginState') { return () => env.installState; }
      if (n === 'pluginMissing') { return () => env.pluginMissing; }
      if (n === 'onSystemConfigReady') {
        return (cb) => { env.readyCb = cb; return () => { if (env.readyCb === cb) { env.readyCb = null; } }; };
      }
      return () => {};
    },
  };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', 'uni', '__STUB__', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'document', 'window', src)(
    mod, mod.exports, env.uni, stubs, env.setTimeout, env.clearTimeout, () => 0, () => {},
    { createElement: () => ({ style: {}, click() {}, remove() {} }), body: { appendChild() {}, removeChild() {} } }, {}
  );
  return mod.exports;
}

function buildVm(code, opt, props) {
  const env = makeEnv(opt);
  const options = loadOptions(code, env);
  const vm = Object.assign({}, typeof options.data === 'function' ? options.data() : {}, props || {});
  Object.keys(options.computed || {}).forEach((k) => {
    Object.defineProperty(vm, k, { get: () => options.computed[k].call(vm), configurable: true });
  });
  Object.keys(options.methods || {}).forEach((k) => { vm[k] = options.methods[k].bind(vm); });
  vm.$api = env.$api; vm.$tools = env.$tools; vm.$nav = env.$nav; vm.$refs = (opt && opt.refs) || {};
  vm.$set = (o, k, v) => { o[k] = v; };
  vm.$emit = (name, payload) => { env.emits.push(name); env.trace.push('emit:' + name); };
  vm.$message = { warning: () => {}, error: () => {} };
  ['created', 'onLoad', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'beforeDestroy'].forEach((h) => {
    if (typeof options[h] === 'function') vm[h] = options[h].bind(vm);
  });
  return { vm, env, options };
}

/** 模板 v-if 表达式按运行时求值（with 绑到实例上，等价于 Vue 的属性代理） */
function evalExpr(expr, vm) {
  if (!expr) return undefined;
  // eslint-disable-next-line no-new-func
  return new Function('ctx', 'with(ctx){return (' + expr + ')}')(vm);
}
function rootVif(tmpl) {
  const m = /(?:<tz-box|<view)[^>]*\bv-if="([^"]*)"/.exec(tmpl);
  return m ? m[1] : null;
}

// ── 可复用的判据（真件与坏样件走同一组函数，坏样件必须每一条都翻红）─────────────────

/** ① 未装插件 ⇒ 零请求 + 整段不渲染 */
function checkUninstalledSilent(code, tmpl, label) {
  const { vm, env } = buildVm(code, { install: '', payload: { send_friend_entry: 1 } }, { goodsId: 1213, goodsType: 'course' });
  if (typeof vm.created === 'function') vm.created();
  const expr = rootVif(tmpl);
  const visible = evalExpr(expr, vm);
  const ok = env.calls.length === 0 && vm.installed === false && !visible;
  return { ok, got: 'requests=' + env.calls.length + ' v-if=' + JSON.stringify(expr) + ' → ' + visible + ' [' + label + ']', hits: env.calls.map((c) => c.name) };
}

/** ② 显隐只吃后端一枚 flag：v-if 与 reload 的闸门都不许含第二枚判据 */
function checkSingleFlag(code, tmpl, label) {
  const expr = rootVif(tmpl) || '';
  const flat = stripComments(code);
  const gateBody = bodyOf(flat, /reload\s*\(\s*\)\s*\{/) || '';
  // 判读收在 parseEntry() 一处（首屏与点击复核共用），flag 读点要连它一起数
  const parseBody = bodyOf(flat, /parseEntry\s*\([^)]*\)\s*\{/) || '';
  const vifOffenders = ['length', 'status', 'gift_types', 'is_gift', 'max_per_order', 'goods_status']
    .filter((k) => new RegExp('\\b' + k + '\\b').test(expr));
  const gateOffenders = ['status', 'gift_types', 'is_gift', 'goods_status', 'list', 'rows']
    .filter((k) => new RegExp('\\b' + k + '\\b').test(gateBody + parseBody));
  const flagReads = ((gateBody + parseBody).match(/send_friend_entry/g) || []).length;
  const ok = !!expr && vifOffenders.length === 0 && gateOffenders.length === 0 && flagReads >= 1;
  return {
    ok,
    got: 'v-if=' + JSON.stringify(expr) + (vifOffenders.length ? '（重判了 ' + vifOffenders.join(',') + '）' : '')
      + (gateOffenders.length ? '；闸门里读了 ' + gateOffenders.join(',') : '')
      + '；send_friend_entry 读点=' + flagReads + ' [' + label + ']',
  };
}

/** ③ 载荷矩阵：字段缺失 / 0 / '0' / 整份为 null 一律不显示，只有 1|true 才显示（硬约束 31④） */
async function checkFlagMatrix(code, tmpl, label) {
  const cases = [
    { payload: null, want: false, why: '整份为 null' },
    { payload: { send_friend_entry: 0 }, want: false, why: 'flag=0' },
    { payload: { send_friend_entry: '0' }, want: false, why: "flag='0'" },
    { payload: { send_friend_entry: '' }, want: false, why: "flag=''" },
    { payload: { max_per_order: 5 }, want: false, why: '字段缺失（不许默认显示）' },
    { payload: { send_friend_entry: false }, want: false, why: 'flag=false' },
    { payload: { send_friend_entry: 1 }, want: true, why: 'flag=1' },
    { payload: { send_friend_entry: true }, want: true, why: 'flag=true' },
  ];
  const expr = rootVif(tmpl);
  const wrong = [];
  for (const c of cases) {
    const { vm } = buildVm(code, { install: 1, payload: c.payload }, { goodsId: 1213, goodsType: 'course' });
    if (typeof vm.created === 'function') vm.created();
    await tick();
    const visible = !!evalExpr(expr, vm);
    if (visible !== c.want) wrong.push(c.why + ' 期望 ' + c.want + ' 实得 ' + visible);
  }
  return { ok: wrong.length === 0, got: wrong.length ? wrong.join('；') : cases.length + ' 档全部与期望一致', count: cases.length, label };
}

/**
 * ③b flag 未到手那一帧不许摆可点入口（2026-10-20 用户实报：视频课程底栏先出礼盒图标，
 * 点进去提交才被「该内容暂不支持赠送」挡回）
 *
 * `loading` 不是 flag：取数在途时 `entry` 还是 null，入口整枚不渲染；
 * 回包为 1 才出现。这一条与 ③ 的矩阵分开，因为矩阵每一档都等到回包之后才看。
 */
async function checkHiddenWhileLoading(code, tmpl, label) {
  const { vm, env } = buildVm(code, { install: 1, pendingEntry: true, payload: { send_friend_entry: 1 } },
    { goodsId: 1213, goodsType: 'course' });
  if (typeof vm.created === 'function') vm.created();
  const expr = rootVif(tmpl);
  const visibleWhile = !!evalExpr(expr, vm);
  if (typeof env.resolveEntry === 'function') { env.resolveEntry(); }
  await tick();
  const visibleAfter = !!evalExpr(expr, vm);
  return {
    ok: !visibleWhile && visibleAfter,
    got: '在途可见=' + visibleWhile + ' / 回包后可见=' + visibleAfter + ' [' + label + ']',
  };
}

/** ④ 事件名不许是原生名（M28） */
function checkEmitNames(code, label) {
  const names = (code.match(/\$emit\(\s*'([^']+)'/g) || []).map((s) => /'([^']+)'/.exec(s)[1]);
  const native = names.filter((n) => NATIVE_EVENTS.indexOf(n) >= 0);
  const declared = ((/emits:\s*\[([^\]]*)\]/.exec(code) || [])[1] || '').replace(/["'\s]/g, '');
  return {
    ok: names.length > 0 && native.length === 0,
    got: '$emit ' + JSON.stringify(names) + (native.length ? ' 含原生名 ' + native.join(',') : '') + '，emits 声明=' + (declared || '(无)') + ' [' + label + ']',
  };
}

/**
 * ⑯ 形态按落点分档（2026-10-16 用户点名「明明左侧这几个 icon 图标呀，都没有底下的文字，为什么你要添加呢」；
 *    2026-10-27 用户点名「送好友已经有 sfa-entry sfa-entry--card 了，就不用在底部操作栏再显示 iconfont icon-lipin」）
 *
 * 现口径只有两档，判据三条：
 *  ① **购买栏那一档整档撤掉** —— `scene === 'order'` / `.sfa-entry--order` 在模板、脚本、样式里都不许残留
 *     （未订阅态的入口由信息卡里的长条承担，底栏再摆一枚纯图标就是同一个入口说两遍）；
 *  ② `inCard` 那一档是长条形态：`scene === 'inCard'` 分支里必须是 `.sfa-card-icon` 这一组，且**不许**带
 *     `.sfa-entry-text`（长条的文字是 `.sfa-card-title` / `.sfa-card-action-text`，不是底栏那一格）；
 *  ③ 底栏那一档（`v-else`）才带 `.sfa-entry-text` + 图标 —— 只落在唯一剩下的控制栏那一档里。
 * 只钉「有文字」或只钉「没文字」都会漏掉另一半：本判据要的是**分档**，所以位置关系一起钉。
 */
function checkEntryTextScene(tmpl, code, css, label) {
  const body = stripComments(tmpl);
  const codeOnly = stripComments(code || '');
  const cssOnly = stripComments(css || '');
  const cardAt = body.indexOf('v-if="scene === \'inCard\'"');
  const elseAt = cardAt < 0 ? -1 : body.indexOf('v-else', cardAt);
  const iconAt = body.indexOf('class="sfa-card-icon"');
  const textAt = body.indexOf('class="sfa-entry-text"');
  const noOrder = !/sfa-entry--order|scene === 'order'/.test(body + codeOnly + cssOnly);
  const cardOk = cardAt > -1 && elseAt > cardAt && iconAt > cardAt && iconAt < elseAt;
  const textInControl = elseAt > -1 && textAt > elseAt;
  const defaultScene = /scene:\s*\{\s*type:\s*String,\s*default:\s*'control'\s*\}/.test(codeOnly);
  return {
    ok: noOrder && cardOk && textInControl && defaultScene,
    got: '购买栏那一档残留=' + (noOrder ? '无' : '有')
      + ' / inCard 长条=' + (cardOk ? '是' : '否')
      + ' / 文字格只在底栏档=' + (textInControl ? '是' : '否')
      + ' / scene 缺省=control ' + (defaultScene ? '是' : '否') + ' [' + label + ']',
  };
}

/**
 * ⑧c 商详长条的上边距只由宿主那一页给（2026-10-28 用户第二次点名「sfa-entry sfa-entry--card
 * 要留出上边距，注意，仅在这个页面调整」）：
 *  ① **组件样式表 `.sfa-entry--card` 不许写死 `margin-top`** —— 写死一枚就是全部宿主（课程商详 /
 *     圈子售前 / 圈子首页 / 练习详情 / 会员中心）全吃这一档，正是当天第一次被点名「去掉上边距」的病根；
 *  ② 组件留一枚 `marginTop` prop（默认 0），只在 `inCard` 档落到根节点 style 上（底栏那档不吃）；
 *  ③ 每一页的期望值由调用点逐页列出来（`gap`）：
 *     · 课程商详 = 8（2026-10-28「仅在这个页面调整」那一档）；
 *     · 圈子售前 = 8（2026-10-29 用户点名「送好友卡片要有上边距」：它上方是 `人加入 · 动态`，
 *       不传就与上面那行文字粘成一段）；
 *     · 练习详情 = 8（2026-10-30 用户点名「sfa-entry sfa-entry--card 要有上边距」：上方是优惠券条 /
 *       属性卡，不传就与上面那一块粘成一段）；
 *     · 会员中心 = 0（宿主容器已有内衬，本轮不动）。
 *     圈子首页 2026-10-29 起整枚不挂（用户点名「不要显示送好友卡片」），不在本表里；
 *     它「一处都不许留」由 ⑱ 钉住。
 * 只钉「组件写死」或只钉「某一页没传」都只盖一半：组件 + 每一页的期望值一起钉，改一页就得改这里的数。
 * @param {String} areaSrc 组件源码
 * @param {Array<{name:String, src:String, gap:Number}>} hosts 宿主页（`gap > 0` = 必须传这一枚数；`0` = 一处都不许传）
 * @param {String} label
 */
function checkCardGapTop(areaSrc, hosts, label) {
  const cardRule = (/\.sfa-entry--card\s*\{([\s\S]*?)\}/.exec(areaSrc) || [])[1] || '';
  const cssFree = !/margin-top\s*:/.test(cardRule);
  const propOk = /marginTop:\s*\{\s*type:\s*\[Number,\s*String\],\s*default:\s*0\s*\}/.test(areaSrc);
  const inCardOnly = /this\.scene\s*!==\s*'inCard'/.test(areaSrc)
    && /return\s+'margin-top:'\s*\+\s*top\s*\+\s*'px'/.test(areaSrc);
  const rows = (hosts || []).filter((h) => /<tz-send-friend-area/.test(h.src)).map((h) => {
    const tag = (/<tz-send-friend-area[^>]*scene="inCard"[^>]*\/>/.exec(h.src) || [])[0] || '';
    const m = /:margin-top="(\d+)"/.exec(tag);
    const got = m ? Number(m[1]) : 0;
    return { name: h.name, gap: h.gap, got: got, ok: got === h.gap };
  });
  return {
    ok: cssFree && propOk && inCardOnly && rows.every((r) => r.ok),
    got: '组件样式表写死=' + (cssFree ? '无' : '有')
      + ' / prop 默认 0=' + (propOk ? '是' : '否')
      + ' / 只落 inCard=' + (inCardOnly ? '是' : '否')
      + ' / 各页上距=' + (rows.length ? rows.map((r) => r.name + ':' + r.got + '(期望' + r.gap + ')').join('、') : '无宿主')
      + ' [' + label + ']',
  };
}

/**
 * ⑱b 圈子首页（成员端）不许挂送好友（2026-10-29 用户点名「/pages/app/circle/index/index?id=3168 中，
 * 不要显示送好友卡片」）：
 *  ① 模板里不许再有 `<tz-send-friend-area>`（长条）与 `<tz-circle-spec-popup>`（本页只有送礼会开它）；
 *  ② 脚本里不许留着四个送礼方法与 `specs`/`currentSpec`/`showSpec`/`giftMax`/`isVirtualPay`/`coinName`
 *     那六枚 data —— 组件撤了、方法还在 = 一只永远点不到的弹层 + 一份没人读的 state；
 *  ③ **判之前先剥注释**：页面里那段「为什么撤掉」的说明会提到这些名字，不剥就会把说明判成残留。
 * @param {String} vueSrc 页面模板 + 样式源码
 * @param {String} jsSrc 页面脚本源码
 * @param {String} label
 */
function checkCircleIndexGone(vueSrc, jsSrc, label) {
  const vueBare = stripComments(vueSrc);
  const jsBare = stripComments(jsSrc);
  const mount = /<tz-send-friend-area/.test(vueBare) || /<tz-circle-spec-popup/.test(vueBare);
  const methods = /onGiftOpen|onSpecPick|closeGiftSpec|confirmGiftSpec/.test(jsBare);
  const state = /\b(specs|currentSpec|showSpec|giftMax|isVirtualPay|coinName)\b/.test(jsBare);
  return {
    ok: !mount && !methods && !state,
    got: '组件还在=' + (mount ? '是' : '否')
      + ' / 方法还在=' + (methods ? '是' : '否')
      + ' / 送礼 data 还在=' + (state ? '是' : '否')
      + ' [' + label + ']',
  };
}

/** ⑤ 取数的每条退出分支都要关 loading（硬约束 22） */
async function checkLoadingExits(code, label) {
  const branches = [
    { name: '成功且开', env: { install: 1, payload: { send_friend_entry: 1 } } },
    { name: '成功但关', env: { install: 1, payload: { send_friend_entry: 0 } } },
    { name: '后端回 code!=1', env: { install: 1, payload: null, code: 0 } },
    { name: '网络异常 reject', env: { install: 1, apiFail: true } },
  ];
  const stuck = [];
  for (const b of branches) {
    const { vm } = buildVm(code, b.env, { goodsId: 1213, goodsType: 'course' });
    if (typeof vm.created === 'function') vm.created();
    await tick();
    if (vm.loading !== false) stuck.push(b.name);
    if (b.name !== '成功且开' && vm.entry) stuck.push(b.name + ' 还留着 entry');
  }
  return { ok: stuck.length === 0, got: stuck.length ? '这一支没退出：' + stuck.join('、') : branches.length + ' 条退出分支都落了 loading=false', label };
}

/** ⑥ 进下单页：点击这一拍先向后端复核，再「先标脏、后导航」（不许顺手整页重取） */
async function checkOpenSubmit(code, label) {
  const { vm, env } = buildVm(code, { install: 1, payload: { send_friend_entry: 1, max_per_order: 5 }, token: 'tok' }, { goodsId: 1213, goodsType: 'course' });
  if (typeof vm.created === 'function') vm.created();
  await tick(); // 先把入口载荷落地，才谈得上「上限随载荷带走」
  const callsBefore = env.calls.length;
  vm.openSubmit();
  await tick(); // 点击复核那一发是异步的，导航在它的回包里
  const rechecked = env.calls.length - callsBefore >= 1
    && env.calls[env.calls.length - 1].name === 'send_friend.gift.entry';
  // `emit:visible`（2026-10-29 新增：入口这一拍该不该占底栏那一格）不参与「先 open 后导航」的顺序断言，
  // 它可能在复核前就抛过若干次；这里只留 open / 导航两种
  const order = env.trace.filter((t) => (/^emit:/.test(t) && t !== 'emit:visible') || /^nav:/.test(t));
  const ok = rechecked && order[0] === 'emit:open' && /^nav:\/pages\/order\/submit\/submit\?sf=1/.test(order[1] || '')
    && NATIVE_EVENTS.indexOf((order[0] || '').replace('emit:', '')) < 0
    && /sf_max=5/.test(order[1] || '') && /goodsList=/.test(order[1] || '');
  return { ok, got: 'rechecked=' + rechecked + ' trace=' + JSON.stringify(order) + ' [' + label + ']' };
}

/** ⑥b 点击复核回 flag=0 ⇒ 不导航、不发 open、入口收掉并说原因（页面停留期间的旧值不许放行） */
async function checkOpenSubmitRechecks(code, label) {
  const { vm, env } = buildVm(code, { install: 1, payload: { send_friend_entry: 1, max_per_order: 5 }, token: 'tok' }, { goodsId: 1213, goodsType: 'course' });
  if (typeof vm.created === 'function') vm.created();
  await tick();
  env.payload = { send_friend_entry: 0 }; // 商家在页面停留期间改了「可赠送内容」
  vm.openSubmit();
  await tick();
  const toast = env.toasts[env.toasts.length - 1] || '';
  return {
    ok: env.nav.length === 0 && env.emits.indexOf('open') < 0 && vm.entry === null && /不支持赠送/.test(toast),
    got: 'nav=' + env.nav.length + ' emits=' + JSON.stringify(env.emits)
      + ' entry=' + JSON.stringify(vm.entry) + ' toast=' + JSON.stringify(toast) + ' [' + label + ']',
  };
}

/** ⑦ 未登录不许把人送进一张必然 401 的下单页（硬约束 27） */
function checkLoginFirst(code, label) {
  const { vm, env } = buildVm(code, { install: 1, payload: { send_friend_entry: 1 }, token: '' }, { goodsId: 1213, goodsType: 'course' });
  if (typeof vm.created === 'function') vm.created();
  vm.openSubmit();
  const ok = env.nav.length === 0 && env.emits.indexOf('open') < 0;
  return { ok, got: 'nav=' + env.nav.length + ' emits=' + JSON.stringify(env.emits) + ' [' + label + ']' };
}

/** ⑧ 宿主 onShow 三档判据：把真方法体跑起来（loaded/脏/超窗各一档） */
function execOnShow(body, state, STALE_MS) {
  const calls = [];
  const vm = {
    isPageActive: false, loaded: state.loaded, loadedAt: state.loadedAt, stateDirty: state.stateDirty,
    studyTimer: 0, id: 1213, loading: false,
    getData: (a) => { calls.push('getData:' + a); },
    refreshState: () => { calls.push('refreshState'); },
    reactivate: () => { calls.push('reactivate'); },
    applyDefaultTab: () => {}, runLearnChain: () => {},
  };
  const courseLibrary = { stopStudyLog: () => {}, banScreenRecordStart: () => {}, banScreenRecordCancel: () => {}, checkBanPc: () => {} };
  // 外层 new Function 只是把闭包变量（courseLibrary / STALE_MS）注进去，
  // 返回的内层函数才是 onShow 本体 —— 必须再 .call(vm) 一次，否则跑的是「定义」不是「执行」
  // eslint-disable-next-line no-new-func
  new Function('courseLibrary', 'clearInterval', 'STALE_MS', 'return function () {' + body + '}')
    .call(null, courseLibrary, () => {}, STALE_MS).call(vm);
  return calls;
}

/** 同一手法跑一枚方法体，回报它有没有真的执行 */
function execMethod(body, vm) {
  // eslint-disable-next-line no-new-func
  new Function('return function () {' + body + '}')().call(vm);
  return vm;
}

function readConst(file, name) {
  const m = read(file).match(new RegExp('const ' + name + '\\s*=\\s*([^;]+);'));
  if (!m) return NaN;
  const expr = m[1].trim();
  if (!/^[\d\s+\-*/().]+$/.test(expr)) return NaN;
  // eslint-disable-next-line no-new-func
  return Number(new Function('return (' + expr + ')')());
}

const areaScript = scriptOf(AREA);
const areaTmpl = templateOf(AREA);

(async () => {
  if (process.argv.indexOf('--selftest') >= 0) return selftest();

  console.log('=== check-send-friend-entry（M-P1 入口闸门 / 单判据 / 事件名 / 宿主账）===');
  const STALE_MS = readConst(DETAIL_JS, 'STALE_MS');
  const detailJs = read(DETAIL_JS);
  const detailCode = scriptOf(DETAIL_JS);
  const detailVue = read(DETAIL_VUE);

  // ① 未装静默
  let r = checkUninstalledSilent(areaScript, areaTmpl, '真件');
  assert('① 未装 app_isinstall_send_friend ⇒ 一条请求都不发、整段 v-if 不成立', r.ok, r.got);

  // ② 单判据
  r = checkSingleFlag(areaScript, areaTmpl, '真件');
  assert('② 显隐只吃后端一枚 send_friend_entry（前端不重判三枚轴、不看 list.length）', r.ok, r.got);

  // ③ 载荷矩阵
  r = await checkFlagMatrix(areaScript, areaTmpl, '真件');
  assert('③ 入口 flag 矩阵（缺失/0/\'0\'/null/false 不显示，1/true 才显示）', r.ok, r.got);

  // ③b flag 未到手那一帧不许摆可点入口（2026-10-20 用户实报的那一条链）
  r = await checkHiddenWhileLoading(areaScript, areaTmpl, '真件');
  assert('③b 取数在途（flag 还没到手）入口不渲染；回包为 1 才出现', r.ok, r.got);

  // ④ 事件名
  r = checkEmitNames(areaScript, '真件');
  assert('④ 组件对外事件名非原生（$emit(\'open\') 而不是 $tap 那一族）', r.ok, r.got);

  // ⑤ 退出分支
  r = await checkLoadingExits(areaScript, '真件');
  assert('⑤ 取数四条退出分支都关骨架（不留永远不走的灰块）', r.ok, r.got);

  // ⑥⑦ 导航与登录
  r = await checkOpenSubmit(areaScript, '真件');
  assert('⑥ 进下单页：点击这一拍先向后端复核，再 $emit(\'open\') 标脏、后导航，上限随载荷带走', r.ok, r.got);
  r = await checkOpenSubmitRechecks(areaScript, '真件');
  assert('⑥b 复核回 flag=0 ⇒ 不导航、不发 open、入口收掉并说原因（旧 flag 不许放行）', r.ok, r.got);
  r = checkLoginFirst(areaScript, '真件');
  assert('⑦ 未登录不导航、不点亮入口（不把人送进必然 401 的下单页）', r.ok, r.got);

  // ⑧ 宿主接线：两处各挂一次——
  //    · 商详标题下那一长条（2026-10-27 用户点名图2）：**不挂 slot**、带 `scene="inCard"`、`ref="sfCard"`；
  //    · 已订阅=控制栏 control-extra（2026-10-16 用户追问「课程购买之后就不能送好友了？」补的那一处）。
  //    2026-10-27 用户点名「送好友已经有 sfa-entry sfa-entry--card 了，就不用在底部操作栏再显示
  //    iconfont icon-lipin」⇒ 购买栏 order-extra 那一枚已撤，**不许再挂回来**（同一入口说两遍）。
  //    两处都必须接 @open；都不许自己 ∧ 订阅态（入口判据只吃后端 flag）
  const mounts = [...detailVue.matchAll(/<tz-send-friend-area[\s\S]*?\/>/g)].map((m) => m[0]);
  const slotOf = (needle) => mounts.filter((m) => m.indexOf('slot="' + needle + '"') >= 0);
  const orderMount = slotOf('order-extra')[0] || '';
  const controlMount = slotOf('control-extra')[0] || '';
  const cardMount = mounts.filter((m) => !/slot="/.test(m) && /scene="inCard"/.test(m))[0] || '';
  assert('⑧ 两处各挂一次：商详标题下=inCard（不挂 slot）/ 已订阅=control-extra；购买栏 order-extra 已撤（底栏不再出 icon-lipin）',
    mounts.length === 2 && !orderMount && !!controlMount && !!cardMount,
    'mounts=' + mounts.length + ' slots=' + JSON.stringify(mounts.map((m) => ((/slot="([^"]+)"/.exec(m) || [])[1] || ''))));
  assert('   └ 两处都接 @open、都不写 @tap/@click、都不自己 ∧ 订阅态（入口判据只吃后端 flag）',
    !!controlMount && !!cardMount
      && /@open="sfGoPay"/.test(controlMount)
      && /@open="sfGoPay"/.test(cardMount)
      && !/@tap=|@click=/.test(controlMount + cardMount) && !/subscription/.test(controlMount + cardMount),
    JSON.stringify(mounts.map((m) => m.replace(/\s+/g, ' ').slice(0, 90))));
  assert('   └ 卡片那一枚带自己的 ref="sfCard"（与底栏那枚 sfArea 分开：两档互斥，下拉/支付回来各调各的 reload）',
    /ref="sfCard"/.test(cardMount) && /ref="sfArea"/.test(controlMount), cardMount.replace(/\s+/g, ' ').slice(0, 100));
  assert('   └ 下拉刷新与支付成功两条路都调 sfCard.reload() + sfArea.reload()（少一条 = 入口停在旧 flag 上）',
    (detailCode.match(/\$refs\.sfCard\.reload\(\)/g) || []).length === 2
      && (detailCode.match(/\$refs\.sfArea\.reload\(\)/g) || []).length === 2,
    'sfCard=' + (detailCode.match(/\$refs\.sfCard\.reload\(\)/g) || []).length
      + ' sfArea=' + (detailCode.match(/\$refs\.sfArea\.reload\(\)/g) || []).length);
  // ⑧c 上边距按页给（2026-10-28 同日第二次点名 + 2026-10-29 圈子售前点名，见 checkCardGapTop 头注释）
  {
    const gapHosts = [
      { name: '课程商详', file: 'src/pages/course/detail/detail.vue', gap: 8 },
      { name: '圈子售前', file: 'src/pages/app/circle/presale/presale.vue', gap: 8 },
      { name: '练习详情', file: 'src/pages/app/exam/detail/detail.vue', gap: 8 },
      { name: '会员中心', file: 'src/pages/app/vip/center/center.vue', gap: 0 },
    ].map((h) => ({ name: h.name, gap: h.gap, src: read(path.join(ROOT, h.file)) }));
    const gap = checkCardGapTop(read(AREA), gapHosts, '真件');
    assert('⑧c 长条上边距按页给：组件不写死（`marginTop` 默认 0、只落 inCard），课程商详 / 圈子售前 / 练习详情传 8，会员中心不传', gap.ok, gap.got);
  }
  const gbBody = bodyOf(detailCode, /gbGoPay\s*\(\s*\)\s*\{/);
  const sfBody = bodyOf(detailCode, /sfGoPay\s*\(\s*\)\s*\{/);
  if (!sfBody) assert('⑨ js.vue 缺 sfGoPay（入口事件没人在接）', false, '找不到 sfGoPay()');
  else {
    const run = (body) => {
      const calls = [];
      const vm = { stateDirty: false, getData: () => calls.push('getData'), $api: () => calls.push('api'), $nav: { to: (d) => calls.push('nav:' + d) } };
      execMethod(body, vm);
      return { dirty: vm.stateDirty, calls };
    };
    const gb = run(gbBody);
    const sf = run(sfBody);
    assert('⑨ sfGoPay 与 gbGoPay 同判据：只把 stateDirty 置真、不发请求不导航（硬约束 16 例外二）',
      gb.dirty === true && sf.dirty === true && sf.calls.length === 0 && gb.calls.length === 0,
      'gb=' + JSON.stringify(gb) + ' sf=' + JSON.stringify(sf));
  }

  // ⑩ onShow 三档判据没被送礼入口翻掉
  const onShowBody = bodyOf(detailCode, /^ {2}onShow\(\)\s*\{/m);
  if (!onShowBody) assert('⑩ 详情页取不到 onShow 方法体', false, '');
  else {
    assert('   └ STALE_MS 常量仍读得到（判据②的分母）', STALE_MS > 0, String(STALE_MS));
    const now = Date.now();
    const fresh = execOnShow(onShowBody, { loaded: true, loadedAt: now, stateDirty: false }, STALE_MS);
    assert('⑪ 已落地 + 账没脏 + 未超窗 ⇒ 一条取数都不发（切标签页/小窗还原不重播）',
      fresh.length === 1 && fresh[0] === 'reactivate', JSON.stringify(fresh));
    const dirty = execOnShow(onShowBody, { loaded: true, loadedAt: now, stateDirty: true }, STALE_MS);
    assert('   └ 标过脏那一档走静默回收 refreshState，不是整页 getData',
      dirty.indexOf('refreshState') >= 0 && !dirty.some((c) => /^getData/.test(c)), JSON.stringify(dirty));
    const stale = execOnShow(onShowBody, { loaded: true, loadedAt: now - STALE_MS - 1000, stateDirty: false }, STALE_MS);
    assert('   └ 超窗那一档同样只回收', stale.indexOf('refreshState') >= 0 && !stale.some((c) => /^getData/.test(c)), JSON.stringify(stale));
    const first = execOnShow(onShowBody, { loaded: false, loadedAt: 0, stateDirty: false }, STALE_MS);
    assert('   └ 首屏没落地才完整取数', first.some((c) => /^getData/.test(c)), JSON.stringify(first));
    assert('   └ onShow 里没有 getData(true)（老写法每切一次标签页 views+1 的那一形）',
      !/getData\(\s*true\s*\)/.test(onShowBody), '已摘掉');
    assert('   └ 送好友入口没在 onShow 里另挂一条取数（reload 只归下拉刷新与支付广播两条路，两枚 ref 都不许出现在这里）',
      !/\$refs\.(?:sfArea|sfCard)|sfArea\b|sfCard\b|send.?friend/i.test(onShowBody), onShowBody.replace(/\s+/g, ' ').length + ' 行体内无 sfArea/sfCard 引用');
  }

  // ⑫ api_list 与路由登记
  const apiSrc = stripComments(read(API_LIST));
  const blockStart = apiSrc.indexOf('send_friend: {');
  const block = blockStart < 0 ? '' : apiSrc.slice(blockStart, blockStart + balancedEnd(apiSrc, blockStart));
  const keys = (block.match(/^\t{3}(\w+):/gm) || []).map((s) => /\w+/.exec(s)[0]);
  const entryOf = (k) => {
    const m = new RegExp('\\b' + k + ':\\s*\\{[\\s\\S]{0,200}?url:\\s*[\'"]([^\'"]+)[\'"][\\s\\S]{0,120}?auth:\\s*(true|false)').exec(block);
    return m ? { url: m[1], auth: m[2] } : null;
  };
  assert('⑬ api_list.js 在 send_friend 这一块里登记了七口（调用一律写键；2026-10-28 新增 selfUse）',
    keys.length === 7 && ['entry', 'create', 'list', 'share', 'info', 'receive', 'selfUse'].every((k) => keys.indexOf(k) >= 0),
    JSON.stringify(keys));
  const eInfo = entryOf('entry');
  const nInfo = entryOf('info');
  assert('   └ 免登录两口（entry / gift info）auth:false，其余四口 auth:true',
    !!eInfo && eInfo.auth === 'false' && !!nInfo && nInfo.auth === 'false'
      && ['create', 'list', 'share', 'receive'].every((k) => { const v = entryOf(k); return v && v.auth === 'true'; }),
    'entry=' + JSON.stringify(eInfo) + ' info=' + JSON.stringify(nInfo));
  const PLUGIN_FILES = [
    AREA, path.join(ROOT, 'src/components/modal/share-modal.vue'),
    path.join(ROOT, 'src/pages/app/send_friend/gift/js.vue'),
    path.join(ROOT, 'src/pages/app/send_friend/receive/js.vue'),
  ].map((f) => stripComments(read(f))).join('\n');
  assert('   └ 插件这几份文件里没有 $api.post（没有这一档，取数那一刻必抛 is not a function）',
    !/\$api\.post\(/.test(PLUGIN_FILES) && !/\$api\.get\(/.test(PLUGIN_FILES), '零命中（注释里的反面教材不算）');

  const pagesSrc = read(PAGES_JSON);
  const routes = ['send_friend/gift/gift', 'send_friend/receive/receive'];
  assert('⑭ 插件自己的送礼下单页已撤（与全站购买流并成一条落页）',
    pagesSrc.indexOf('send_friend/submit/submit') < 0, '残留即红');
  routes.forEach((p) => {
    const at = pagesSrc.indexOf('"path": "' + p + '"');
    const next = pagesSrc.indexOf('"path": "', at + 5);
    const blk = at < 0 ? '' : pagesSrc.slice(at, next < 0 ? at + 400 : next);
    assert('⑭ pages.json 注册 ' + p + '（h5.titleNView:false、不写 navigationStyle）',
      at >= 0 && /"h5":\s*\{\s*"titleNView":\s*false\s*\}/.test(blk) && !/navigationStyle/.test(blk), blk.replace(/\s+/g, ' ').slice(0, 110));
  });
  const giftAt = pagesSrc.indexOf('"path": "send_friend/gift/gift"');
  const giftBlock = pagesSrc.slice(giftAt, pagesSrc.indexOf('"path": "', giftAt + 5));
  // pullToRefresh 必须是对象（`true` 会被 H5 的 <Page> 当成 Boolean 传给 `type: Object` 的 prop，
  // 每次进页面/redirectTo 回同一路由都打一条 [Vue warn]，见 group_buy/detail 那三处）
  assert('   └ 列表页（赠送记录）开了 enablePullDownRefresh + app-plus.pullToRefresh（对象形式）',
    /"enablePullDownRefresh":\s*true/.test(giftBlock) && /"pullToRefresh":\s*\{\s*"support":\s*true\s*\}/.test(giftBlock), '在位');
  assert('   └ 两个路由都在 root=pages/app 那个分包里（未另起分包）', (() => {
    const rootAt = pagesSrc.indexOf('"root": "pages/app"');
    return routes.every((p) => pagesSrc.indexOf('"path": "' + p + '"') > rootAt);
  })(), '在 pages/app 分包内');

  // ⑮ 个人中心入口（2026-10-16 用户追问「我买了没有送出去，记录在哪里查看呢，个人中心没有入口」）：
  //    与「我的拼团」同一份判据（只吃装没装，不吃有没有礼单）；图标不许用空字形 liwu/liwu1
  const ucSrc = stripComments(read(path.join(ROOT, 'src/pages/user/index/js.vue')));
  assert('⑮ 个人中心有「赠送记录」入口：只吃 app_isinstall_send_friend、path 对、图标 lipin（liwu 系是空字形）',
    /app_isinstall_send_friend[\s\S]{0,320}?send_friend\/gift\/gift/.test(ucSrc)
      && /name: "赠送记录"/.test(ucSrc)
      && /icon: "lipin"/.test(ucSrc)
      && !/icon: "liwu/.test(ucSrc), '用户中心入口在位');
  assert('   └ 底栏那一枚的图标也不用空字形（lipin）',
    /<tz-icon name="lipin"/.test(areaTmpl),
    'icon=' + (((/<tz-icon name="([^"]+)"/.exec(areaTmpl)) || [])[1] || '无'));

  // ⑯ 形态按落点分档（见 checkEntryTextScene 头注释）
  const textScene = checkEntryTextScene(areaTmpl, areaScript, styleOf(AREA), '真件');
  assert('⑯ 送好友入口只剩两档：inCard 长条（信息卡）/ control 图标+文字（控制栏），购买栏那一档整档撤净',
    textScene.ok, textScene.got);

  // ⑰ 付费插件安装态三态（2026-10-27 用户点名「如果没有安装插件前端请求对应的初始化接口会报错。要做好适配」）：
  //    init 还没回包（null）时**一条请求都不发、也不判「未装」**；回包说已装 ⇒ 补发一次入口；
  //    回包说未装 ⇒ 仍然一条都不发。
  {
    const wait = buildVm(areaScript, { install: 1, installState: null, payload: { send_friend_entry: 1 } },
      { goodsId: 1213, goodsType: 'course' });
    if (typeof wait.vm.created === 'function') { wait.vm.created(); }
    const before = wait.env.calls.length;
    wait.env.installState = true;
    if (typeof wait.env.readyCb === 'function') { wait.env.readyCb(); }
    const afterInstalled = wait.env.calls.length;
    assert('⑰ init 未回包（null）不发请求、不判未装；回包说已装 ⇒ 恰好补发一次入口',
      before === 0 && afterInstalled === 1 && wait.vm.installed === true,
      'before=' + before + ' after=' + afterInstalled + ' installed=' + wait.vm.installed);

    const gone = buildVm(areaScript, { install: 1, installState: null, payload: { send_friend_entry: 1 } },
      { goodsId: 1213, goodsType: 'course' });
    if (typeof gone.vm.created === 'function') { gone.vm.created(); }
    gone.env.installState = false;
    if (typeof gone.env.readyCb === 'function') { gone.env.readyCb(); }
    assert('   └ 回包说未装 ⇒ 仍然一条请求都不发（入口整段不出）',
      gone.env.calls.length === 0 && gone.vm.installed === false,
      'requests=' + gone.env.calls.length + ' installed=' + gone.vm.installed);
  }


  // ⑱ 圈子 / 练习 / 会员三类的入口（2026-10-28 用户点名「送好友图片中的几个类型商品并没有对应的入口」）：
  //   ① 三个宿主页（圈子预售、练习详情、会员中心）都挂了同一枚组件，另两枚（课程两档）保持不动；
  //      **圈子首页（成员端）不挂**（2026-10-29 用户点名「/pages/app/circle/index/index?id=3168 中，
  //      不要显示送好友卡片」）：入口只留售前页那一处，长条 / 规格弹层 / 四个送礼方法一起撤净
  //      （留一只没人开的弹层与 `specs`/`showSpec` 那几枚 data 就是死代码）；
  //   ② 圈子/会员卡要把规格原样带走：圈子 `extend`、会员卡 `goodsId` 里的 `_下标`，且落页补 `type`；
  //   ③ 组件不许 `Number(goodsId)` 整串（`12_0` → NaN 会让入口永远不出）。
  {
    const hosts = {
      '圈子预售': 'src/pages/app/circle/presale/presale.vue',
      '练习详情': 'src/pages/app/exam/detail/detail.vue',
      '会员中心': 'src/pages/app/vip/center/center.vue',
    };
    const found = {};
    Object.keys(hosts).forEach((k) => {
      const src = read(path.join(ROOT, hosts[k]));
      found[k] = /<tz-send-friend-area[\s\S]{0,320}?goods-type="(circle|exercises|vipcard)"/.test(src);
    });
    assert('⑱ 三类商品的宿主页都挂了送好友入口（圈子预售/练习详情/会员中心）',
      Object.keys(found).every((k) => found[k]), JSON.stringify(found));

    // 圈子首页（成员端）：**一处都不许留**（2026-10-29 用户点名）
    const idxVue = read(path.join(ROOT, 'src/pages/app/circle/index/index.vue'));
    const idxJs = read(path.join(ROOT, 'src/pages/app/circle/index/js.vue'));
    const gone = checkCircleIndexGone(idxVue, idxJs, '真件');
    assert('   └ 圈子首页（成员端）不挂送好友：长条与规格弹层都不在，四个送礼方法与那六枚 data 一起撤净',
      gone.ok, gone.got);

    const pre = read(path.join(ROOT, hosts['圈子预售']));
    assert('   └ 圈子预售页：manual + 当前有效期 `extend` + @open，规格选完由 `submitUrlFor()` 落页',
      /scene="inCard"\s+manual/.test(pre) && /:extend="currentSpec/.test(pre)
      && /@open="onGiftOpen"/.test(pre) && /submitUrlFor\(/.test(read(path.join(ROOT, 'src/pages/app/circle/presale/js.vue'))));
    const vip = read(path.join(ROOT, hosts['会员中心']));
    assert('   └ 会员中心：`卡ID_SKU下标` 随当前 skuIndex 一起进 goods-id（换卡/换规格会重取）',
      /:goods-id="detail\[checkCardIndex\]\.id \+ '_' \+ skuIndex"/.test(vip));

    // 运行时：会员卡 `12_0` 这类字符串不许被 Number() 吃掉；落页带 type + SKU
    const vipVm = buildVm(areaScript, { install: 1, token: 't', payload: { send_friend_entry: 1, max_per_order: 5, order_goods_id: '12_0', extend: '' } },
      { goodsId: '12_0', goodsType: 'vipcard' });
    if (typeof vipVm.vm.created === 'function') { vipVm.vm.created(); }
    await tick();
    vipVm.vm.openSubmit();
    await tick();
    const vipUrl = (vipVm.env.trace.filter((t) => /^nav:/.test(t))[0] || '').replace('nav:', '');
    const vipCall = vipVm.env.calls.find((c) => c.name === 'send_friend.gift.entry') || {};
    assert('   └ 会员卡：entry 请求带 `12_0`，落页 goodsId=12_0 且 type=vipcard（不再 NaN）',
      String((vipCall.params || {}).goods_id) === '12_0' && /goodsId%22%3A%2212_0%22|"goodsId":"12_0"/.test(vipUrl)
      && /type=vipcard/.test(vipUrl), 'api=' + JSON.stringify(vipCall.params || {}) + ' url=' + vipUrl);

    // 运行时：圈子带规格位，落页带 extend + type=circle
    const cVm = buildVm(areaScript, { install: 1, token: 't', payload: { send_friend_entry: 1, max_per_order: 5, order_goods_id: '88', extend: '3_19.90' } },
      { goodsId: 88, goodsType: 'circle', extend: '3_19.90' });
    if (typeof cVm.vm.created === 'function') { cVm.vm.created(); }
    await tick();
    cVm.vm.openSubmit();
    await tick();
    const cUrl = (cVm.env.trace.filter((t) => /^nav:/.test(t))[0] || '').replace('nav:', '');
    const cCall = cVm.env.calls.find((c) => c.name === 'send_friend.gift.entry') || {};
    assert('   └ 圈子：entry 请求带 extend，落页 goodsList 带 extend + type=circle',
      String((cCall.params || {}).extend) === '3_19.90' && /extend/.test(cUrl) && /type=circle/.test(cUrl),
      'api=' + JSON.stringify(cCall.params || {}) + ' url=' + cUrl);
  }

  // ⑲ 圈子「送好友」一律先选有效期（2026-10-28 用户实报「送好友，如果是圈子，为什么不显示规格选择弹窗」）：
  //   病根：售前页单档时 `specs.length === 1` 直接走下单页（而同屏「立即购买」无论几档都弹）。
  //   ⇒ 售前页走 `tz-circle-spec-popup`，入口 `manual` + `@open`，确认后才用 `submitUrlFor()` 落 `sf=1` 单。
  //   **2026-10-29 起圈子首页不再挂入口**（用户点名「不要显示送好友卡片」），所以这一组只剩售前页那一页；
  //   那一页「入口 / 弹层 / 四个方法都撤净」另由 ⑱ 钉住（两处判据不重复抄同一份正则）。
  {
    const POPUP = 'src/components/tz/circle-spec-popup.vue';
    const popupSrc = read(path.join(ROOT, POPUP));
    const preVue = read(path.join(ROOT, 'src/pages/app/circle/presale/presale.vue'));
    const preJs = read(path.join(ROOT, 'src/pages/app/circle/presale/js.vue'));

    assert('⑲ 圈子规格弹层只有一份（`components/tz/circle-spec-popup.vue`，确认只上抛事件）',
      /name: 'CircleSpecPopup'/.test(popupSrc) && /emit\('confirm'/.test(popupSrc)
      && /emit\('pick'/.test(popupSrc) && /emit\('update:show'/.test(popupSrc));

    assert('   └ 售前页：改用共用弹层，页面里不再自写一只规格 u-popup',
      /<tz-circle-spec-popup[\s\S]{0,400}?@confirm="confirmSpec"/.test(preVue)
      && !/class="spec-popup"/.test(preVue));

    assert('   └ 售前页：单档不再短路（旧写法 `specs.length === 1` 直接 goGift 已删）',
      !/specs\.length\s*===?\s*1/.test(preJs) && /onGiftOpen[\s\S]{0,700}?showSpec = true/.test(preJs)
      && /onSpecPick/.test(preJs));
  }

  console.log(fail === 0 ? '\n结果：全部符合预期（通过 ' + pass + ' 项 / 违反 ' + fail + ' 项）'
    : '\n结果：有 ' + fail + ' 项不符合预期（通过 ' + pass + ' 项）');
  process.exitCode = fail === 0 ? 0 : 1;

  // ── 坏样件：同一组判据函数喂「非命中不可」的样件，验这道门禁能红 ──────────────
  async function selftest() {
    console.log('=== --selftest：坏样件必须每一条都被同一组判据抓红 ===');
    let fired = 0;
    const expect = (name, res) => {
      if (res.ok) { console.log('[SELFTEST-FAIL] ' + name + ' 没被抓到（门禁是瞎的）-> ' + res.got); fail++; }
      else { fired++; console.log('[SELFTEST-FIRE] ' + name + ' 已报红 -> ' + res.got); pass++; }
    };

    const BAD_NO_GATE = `
      export default {
        data() { return { installed: false, loading: false, entry: null }; },
        created() { this.reload(); },
        methods: { reload() { this.loading = true; this.$api('send_friend.gift.entry', {}); } },
      };`;
    const BAD_THREE_AXES = `
      export default {
        data() { return { installed: true, loading: false, entry: null, settings: { status: 1 }, giftTypes: ['course'] }; },
        methods: { reload() { this.entry = this.$api('send_friend.gift.entry', {}); } },
      };`;
    const BAD_LIST_LEN = `
      export default {
        data() { return { installed: true, loading: false, list: [] }; },
        methods: { reload() { this.$api('send_friend.gift.list', {}); } },
      };`;
    const BAD_TAP_EMIT = `
      export default {
        data() { return { installed: true, entry: 1 }; },
        methods: { openSubmit() { this.$emit('tap', {}); } },
      };`;
    const BAD_LOADING_STUCK = `
      export default {
        data() { return { installed: false, loading: false, entry: null }; },
        created() { this.reload(); },
        methods: {
          reload() { this.loading = true; this.$api('send_friend.gift.entry', {}).then((ret) => { this.entry = ret.data; this.loading = false; }); },
        },
      };`;
    const BAD_DEFAULT_ON_MISSING = `
      export default {
        data() { return { installed: false, loading: false, entry: null }; },
        created() { this.installed = !!this.$tools.systemConfig('app_isinstall_send_friend'); if (this.installed) { this.reload(); } },
        methods: {
          reload() {
            this.loading = true;
            this.$api('send_friend.gift.entry', {}).then((ret) => { this.loading = false; this.entry = ret.data || { send_friend_entry: 1 }; });
          },
        },
      };`;
    const BAD_NO_RECHECK = `
      export default {
        data() { return { entry: { send_friend_entry: 1 }, goodsId: 1213, goodsType: 'course' }; },
        computed: {
          submitUrl() { return '/pages/order/submit/submit?sf=1&sf_max=5&goodsList=' + JSON.stringify([{ goodsId: 1213 }]); },
        },
        methods: {
          openSubmit() { this.$emit('open', {}); this.$nav.to(this.submitUrl, 'local'); },
        },
      };`;

    expect('坏样件 1：未装照样发请求', checkUninstalledSilent(BAD_NO_GATE, '<tz-box v-if="entry || loading"><view/></tz-box>', '样件1'));
    expect('坏样件 2：前端重判三枚轴', checkSingleFlag(BAD_THREE_AXES, '<tz-box v-if="installed && settings.status == 1 && giftTypes.indexOf(goods_type) >= 0"></tz-box>', '样件2'));
    expect('坏样件 3：判据挂在 list.length', checkSingleFlag(BAD_LIST_LEN, '<tz-box v-if="installed && list.length > 0"></tz-box>', '样件3'));
    expect('坏样件 4：$emit 用原生名 tap', checkEmitNames(BAD_TAP_EMIT, '样件4'));
    expect('坏样件 5：reject 那一支没关 loading', await checkLoadingExits(BAD_LOADING_STUCK, '样件5'));
    expect('坏样件 6：字段缺失回落成「显示」（硬约束 31④那一族）', await checkFlagMatrix(BAD_DEFAULT_ON_MISSING, '<tz-box v-if="installed && (entry || loading)"></tz-box>', '样件6'));
    expect('坏样件 6b：flag 未到手就先摆可点入口（loading 混进 v-if）',
      await checkHiddenWhileLoading(BAD_DEFAULT_ON_MISSING, '<tz-box v-if="installed && (entry || loading)"></tz-box>', '样件6b'));
    expect('坏样件 6c：点击不复核，旧 flag 直接导航',
      await checkOpenSubmitRechecks(BAD_NO_RECHECK, '样件6c'));

    const badOnShow = `
      that = this;
      that.isPageActive = true;
      that.getData(true);`;
    let red = false;
    try {
      const calls = execOnShow(badOnShow, { loaded: true, loadedAt: Date.now(), stateDirty: false }, 300000);
      red = calls.some((c) => /^getData/.test(c));
    } catch (e) { red = true; }
    expect('坏样件 7：onShow 退回整页重取（老写法）', { ok: !red, got: 'execOnShow 跑出 ' + red });

    const badSf = `this.stateDirty = true; this.getData(true); this.$api('course.detail', {});`;
    const calls = (() => {
      const acc = [];
      const vm = { stateDirty: false, getData: () => acc.push('getData'), $api: () => acc.push('api') };
      execMethod(badSf, vm);
      return acc;
    })();
    expect('坏样件 8：入口事件处理里整页重取（该只标脏）', { ok: calls.length === 0, got: '发了 ' + calls.length + ' 次 ' + JSON.stringify(calls) });

    // 坏样件 9：又摆回购买栏那一档（= 2026-10-16 那一版：底栏纯图标 + 卡片长条同时出，
    // 2026-10-27 用户点名「送好友已经有 sfa-entry sfa-entry--card 了，就不用在底部操作栏再显示」）
    const BAD_TEXT_ALWAYS = '<view class="sfa-entry sfa-entry--order"><view><tz-icon name="lipin" :size="28" color="#444" /></view>'
      + '<view class="sfa-entry-text">送好友</view></view>';
    expect('坏样件 9：购买栏那一档（.sfa-entry--order）又摆回来了', checkEntryTextScene(BAD_TEXT_ALWAYS, '', '', '样件9'));
    // 坏样件 9b：卡片长条那一段塞进底栏的「图标 + 文字」（两档形态串了）
    const BAD_CARD_TEXT = '<view class="sfa-entry sfa-entry--card" v-if="scene === \'inCard\'">'
      + '<view class="sfa-card-icon"></view><view class="sfa-entry-text">送好友</view></view>'
      + '<view v-else><view class="sfa-entry-text">送好友</view></view>';
    expect('坏样件 9b：inCard 长条里塞了底栏那一格文字（两档形态串了）', checkEntryTextScene(BAD_CARD_TEXT, '', '', '样件9b'));
    // 坏样件 9c：上边距又写回组件样式表（五个宿主全吃），且宿主页不再传值
    const BAD_CARD_GAP = 'export default { props: { marginTop: { type: [Number, String], default: 8 } },'
      + ' computed: { cardGapStyle() { return "margin-top:8px"; } } };\n'
      + '.sfa-entry--card {\n\tmargin-top: 8px;\n}';
    expect('坏样件 9c：上边距写死在 `.sfa-entry--card`（宿主不传也吃 8px）',
      checkCardGapTop(BAD_CARD_GAP, [
        { name: '课程商详', src: '<tz-send-friend-area scene="inCard" :margin-top="8" />', gap: 8 },
      ], '样件9c'));
    // 坏样件 9d：组件是干净的，但圈子售前那一页没传上距（= 2026-10-29 点名前的样子：
    // 长条与上方 `人加入 · 动态` 粘成一段）。只钉「组件没写死」会漏掉这一档。
    expect('坏样件 9d：圈子售前页没传 `:margin-top`（与上方 `人加入 · 动态` 粘成一段）',
      checkCardGapTop(read(AREA), [
        { name: '课程商详', src: '<tz-send-friend-area scene="inCard" :margin-top="8" />', gap: 8 },
        { name: '圈子售前', src: '<tz-send-friend-area v-if="id" ref="sfCard" scene="inCard" manual :goods-id="id" />', gap: 8 },
      ], '样件9d'));
    // 坏样件 9e：圈子首页又把 2026-10-29 点名撤掉的那一枚挂回来（长条 + 弹层 + 方法 + data 一套）
    expect('坏样件 9e：圈子首页又挂回送好友卡片（长条 / 规格弹层 / 四个方法与六枚 data 一起回来）',
      checkCircleIndexGone(
        '<view class="head"></view><tz-send-friend-area ref="sfCard" scene="inCard" manual goods-type="circle" />'
          + '<tz-circle-spec-popup :show="showSpec" @confirm="confirmGiftSpec" />',
        'export default { data() { return { specs: [], currentSpec: null, showSpec: false, giftMax: 0 }; },\n'
          + '  methods: { onGiftOpen(p) { this.giftMax = p.max_per_order; this.showSpec = true; } } };',
        '样件9e'));
    // 反向样件 9e：撤干净的那一版（注释里提到这些名字不许被当成残留）
    const goodCircleIndex = checkCircleIndexGone(
      '<view class="head"></view><!-- 送好友：tz-send-friend-area / tz-circle-spec-popup 本页都不挂 -->',
      '// onGiftOpen / confirmGiftSpec 已随组件一起撤掉\nexport default { data() { return {}; } };',
      '好样件9e');
    if (goodCircleIndex.ok) {
      pass++; console.log('[SELFTEST-OK] 圈子首页撤干净那一版没有被误判（注释里提到的名字不算残留）-> ' + goodCircleIndex.got);
    } else {
      fail++; console.log('[SELFTEST-FAIL] 圈子首页撤干净那一版被判红 ⇒ 判据会把说明文字一起挡掉 -> ' + goodCircleIndex.got);
    }

    // 反向样件：判据不许把合格写法也判红（否则下一轮就有人 --update-baseline 把它关掉）
    const good = checkEmitNames("export default { emits: ['open'], methods: { go() { this.$emit('open', {}); } } };", '好样件');
    if (good.ok) { pass++; console.log('[SELFTEST-OK] 好样件没有被误判（这条断言不是恒真，也不是恒假）-> ' + good.got); }
    else { fail++; console.log('[SELFTEST-FAIL] 好样件被判红 ⇒ 这条判据太宽，会把合规写法一起挡掉 -> ' + good.got); }

    console.log('\n[SELFTEST] 坏样件 ' + fired + ' 条被抓红（要求 ≥11），合格样件不误报；总通过 ' + pass + ' / 失败 ' + fail);
    process.exitCode = fail === 0 && fired >= 11 ? 0 : 1;
    return undefined;
  }
})().catch((e) => {
  // 脚本自己坏了要出声：不许被上面那道 unhandledRejection 吞成「跑完了、exit 0」的假绿
  console.log('[HARNESS-ERROR] ' + (e && e.stack ? e.stack : e));
  process.exitCode = 1;
});
