/**
 * M-P2 送礼下单（2026-10-16 起并回**标准提交订单页**）—— 不构建、不开浏览器
 *
 * 架构口径（用户 2026-10-16 点名「这个完全可以在提交订单页完成啊，为什么新建一个页面」）：
 * 全站购买流（课程/打卡/圈子/练习/实物/会员/教务…）本来就都落 `pages/order/submit/submit`，
 * 送好友只在这条链上多两枚标记：`sf=1`（建单口从 `order.create` 切到插件 `send_friend.gift.create`，
 * source=send_friend 与礼单结算都在那一条口上）与 `sf_max`（份数上限，后端下发）。
 * 插件自己的送礼下单页已整页撤掉（同一实体只留一套编辑形态，硬约束 20③）。
 *
 * 钉四件事：
 *  ① 入口的落页 = `/pages/order/submit/submit?sf=1&goodsList=…`（与「立即购买」逐字同形，只多标记），
 *     旧插件路由零残留；
 *  ② `components/order/submit-order.vue` 的送礼分支四处齐全：`sf=1` 门控、份数行（`:max="sfMax"`）、
 *     建单口切换（载荷四键）、未装闸门守卫；且**非 sf 档逐字不变**（`order.create` + `: that.form` 原载荷、
 *     积分/备注那一箱只在非 sf 档出）；
 *  ③ 礼物口回体没有 `status` ⇒ 走支付面板那一支；金额以回体 `real_price` 为准；
 *  ④ 支付成功页【去赠送】吃后端 `gift_entry`（后端随订单详情下发，与 M-P3 同口径），
 *     落点是赠送详情（送礼页，凭据 `gift_code`），拿不到凭据才回落赠送记录列表（带 order_no）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const AREA = path.join(ROOT, 'src/components/tz/send-friend-area.vue');
const ORDER_VUE = path.join(ROOT, 'src/components/order/submit-order.vue');
const BOTTOM_BTN = path.join(ROOT, 'src/components/tz/bottom-btn.vue');
// 2026-10-28 起三步条抽成共用组件（送礼页第二步复用同一根条），几何断言改读组件本体
const STEPS_VUE = path.join(ROOT, 'src/components/tz/sf-steps.vue');
const RESULT = path.join(ROOT, 'src/pages/public/result/result.vue');
const RESULT_JS = path.join(ROOT, 'src/pages/public/result/js.vue');
const PAGES_JSON = path.join(ROOT, 'src/pages.json');
const API_LIST = path.join(ROOT, 'src/common/request/api_list.js');

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

/** 真实功能开关（2026-10-22 起 submit-order.vue 引用 FEATURE_SEND_FRIEND / FEATURE_GROUP_BUY）：
 *  取数壳剥 import 时这两枚必须绑定到真值，否则 eval 里 ReferenceError（开关置 true 复跑门禁时暴露），
 *  值只认 feature-flags.js 那一份，壳不自带第二份。 */
const FLAGS = (() => {
  const src = read(path.join(ROOT, 'src/common/utils/feature-flags.js'));
  const out = {};
  const re = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*(true|false)\s*;/g;
  let m; while ((m = re.exec(src))) { out[m[1]] = m[2] === 'true'; }
  return out;
})();
const scriptOf = (f) => (read(f).match(/<script[^>]*>([\s\S]*?)<\/script>/) || [])[1] || '';
const templateOf = (f) => {
  const src = read(f);
  const at = src.indexOf('<template');
  const end = src.lastIndexOf('</template>');
  return end <= at ? '' : src.slice(src.indexOf('>', at) + 1, end);
};
const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/[^\n]*/gm, ' ');

/** 把三段式/单文件组件脚本跑起来：入口组件只需要 $api / $nav / $tools / uni 四个桩 */
function buildArea(code, opt) {
  const o = opt || {};
  const env = { calls: [], trace: [], toasts: [] };
  const uni = {
    getStorageSync: (k) => (k === 'user_token' ? (o.token === undefined ? 'tok' : o.token) : ''),
    setStorageSync: () => {}, showToast: (a) => env.toasts.push(a && a.title), getSystemInfoSync: () => ({ windowHeight: 700 }),
  };
  let s = code.replace(/export\s+default/, 'module.exports =');
  s = s.replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, 'const $1 = {};');
  s = s.replace(/^import\s*\{([^}]*)\}\s*from\s*["']([^"']*feature-flags[^"']*)["'];?\s*$/gm, (all, names) => names.split(',')
    .map((n) => n.trim()).filter(Boolean)
    .map((n) => 'const ' + n + ' = ' + (n in FLAGS ? String(FLAGS[n]) : 'false') + ';').join(' '));
  // 付费插件三态闸门的桩（组件 2026-10-27 起走 `pluginState`，构造实例时这些名字必须在作用域里）：
  // 这一组只判「送礼落页 / 建单分支」，插件安装态放行即可 —— 三态本身由 `check-plugin-guard.js` 钉
  const NAMED_STUBS = {
    pluginState: '() => true',
    pluginMissing: '() => false',
    onSystemConfigReady: '(cb) => { if (typeof cb === "function") { cb(); } return () => {}; }',
  };
  s = s.replace(/^import\s*\{([^}]*)\}\s*from\s*["']([^"']*)["'];?\s*$/gm, (all, names, mod) => {
    if (/plugin-guard/.test(mod)) {
      return names.split(',').map((n) => n.trim()).filter(Boolean)
        .map((n) => 'const ' + n + ' = ' + (NAMED_STUBS[n] || '() => {}') + ';').join(' ');
    }
    return '';
  });
  const mod = { exports: {} };
  new Function('module', 'exports', 'uni', 'setTimeout', 'clearTimeout', s)(mod, mod.exports, uni, REAL_SETTIMEOUT, clearTimeout);
  const options = mod.exports;
  const vm = Object.assign({}, typeof options.data === 'function' ? options.data() : {});
  Object.keys(options.computed || {}).forEach((k) => Object.defineProperty(vm, k, { get: () => options.computed[k].call(vm), configurable: true }));
  Object.keys(options.methods || {}).forEach((k) => { vm[k] = options.methods[k].bind(vm); });
  vm.$api = (name, params) => {
    env.calls.push({ name, params });
    if (name === 'send_friend.gift.entry') {
      return Promise.resolve(o.entry || { code: 1, data: { send_friend_entry: 1, max_per_order: 5, order_type: 'goods' } });
    }
    return Promise.resolve({ code: 1, data: {} });
  };
  vm.$tools = { systemConfig: (k) => (k === 'app_isinstall_send_friend' ? (o.install === undefined ? 1 : o.install) : ''), copy: () => {} };
  vm.$nav = { to: (d, t, m) => { env.trace.push('nav:' + d); }, parsePageParams: (p) => p };
  vm.$emit = (n) => { env.trace.push('emit:' + n); };
  ['created', 'onLoad', 'onShow'].forEach((h) => { if (typeof options[h] === 'function') vm[h] = options[h].bind(vm); });
  return { vm, env };
}

/** ① 入口落页 */
async function checkSubmitUrl(code, label) {
  const { vm, env } = buildArea(code, {});
  if (typeof vm.created === 'function') vm.created();
  await tick();
  vm.goodsId = 1213;
  vm.openSubmit();
  await tick(); // 点击复核那一发是异步的：导航在它回包里（2026-10-20 起）
  const url = (env.trace.filter((t) => /^nav:/.test(t))[0] || '').replace('nav:', '');
  // goodsList 自 2026-10-29 起**编码后进地址**（送好友入口跳提交订单页白屏那一轮改的），
  // 反推载荷要先解回明文再 JSON.parse —— 拿原始串直接 parse 会恒失败（那条是门禁自己的锅，不是产品没做）
  let raw = (url.match(/goodsList=([^&]*)/) || [])[1] || 'null';
  try { raw = decodeURIComponent(raw); } catch (e) { /* 已是明文时原样用 */ }
  let gl = null;
  try { gl = JSON.parse(raw); } catch (e) { gl = null; }
  const ok = /^\/pages\/order\/submit\/submit\?sf=1/.test(url) && /sf_max=5/.test(url)
    && Array.isArray(gl) && gl.length === 1 && String(gl[0].goodsId) === '1213' && gl[0].goodsType === 'course' && Number(gl[0].count) === 1
    && url.indexOf('send_friend/submit') < 0;
  return { ok, got: '落页=' + JSON.stringify(url) + ' [' + label + ']' };
}

/** ② submit-order.vue 送礼分支四处 + 非 sf 档逐字不变 */
function checkOrderBranch(orderSrc, label) {
  const s = stripComments(orderSrc);
  const gate = /isSendFriend\(\)\s*\{\s*\n\s*return Number\(this\.pageParams && this\.pageParams\.sf\) === 1;/.test(orderSrc);
  const countRow = /<u-number-box v-model="form\.gift_count" :min="1" :max="sfMax" :integer="true"/.test(s)
    && /onGiftCount/.test(s);
  // 份数步进器靠右（2026-10-16 用户点名「分数这个步进选择器为什么要靠左侧呀？你应该靠在右侧呀」）：
  // 同页其余行都是「满宽 + 靠右」（券值 .input-item / 积分与会员折扣 .item-val 的 `width:100% + text-align:right`、
  // 备注 `inputAlign="right"`），参照页是实物 SKU 弹窗的「数量」行（标题左、步进器右）。
  // 判据＝外层那一格必须满宽 + flex 收口到右端（`text-align` 挪不动 flex 盒子，所以不能用 text-align 顶替）。
  const rowBody = (() => {
    const css = s.slice(s.indexOf('<style'));
    const m = /\.gift-count-row\s*\{([^}]*)\}/.exec(css);
    return m ? m[1] : '';
  })();
  const countAligned = /<view class="gift-count-row">\s*<u-number-box/.test(s)
    && /width:\s*100%/.test(rowBody) && /display:\s*flex/.test(rowBody) && /justify-content:\s*flex-end/.test(rowBody);
  const switchApi = /that\.isSendFriend \? "send_friend\.gift\.create" : "order\.create"/.test(s);
  // `buyer_remark` 2026-10-27 起必须在载荷里：图1 摆了留言行，后端 gift/create 早就读它并交给
  // OrderBridge（Gift.php:94）——端上不传就是把那一格输入静默丢掉
  const payload = ['goods_id', 'goods_type', 'count', 'coupon_id', 'buyer_remark'].every((k) => new RegExp('\\b' + k + ':').test(s))
    && /count: that\.form\.gift_count/.test(s);
  // 未装守卫：2026-10-27 起走三态 `pluginGate('send_friend', '送好友')`（init 未回包先等、未装才退回）；
  // 老的「直接读 app_isinstall_send_friend」形态也接受（守卫在位即可，具体形态由 check-plugin-guard.js 钉）
  const guard = /this\.isSendFriend && \(?(!FEATURE_SEND_FRIEND\s*\|\|\s*)?!this\.pluginGate\('send_friend',\s*'送好友'\)\)?/.test(s)
    || /this\.isSendFriend && \(?(!FEATURE_SEND_FRIEND\s*\|\|\s*)?!this\.\$tools\.systemConfig\('app_isinstall_send_friend'\)/.test(s);
  const untouched = /} : that\.form/.test(s)
    && /that\.isSendFriend \|\| res\.data\.status == "unpaid"/.test(s)
    && /that\.data\.real_price = res\.data\.real_price/.test(s)
    // 积分 / 会员折扣 / 备注那一段：送好友档整段不收（自己走 gift/create）。
    // 2026-10-19 拼团档不再跟着收整段——买家留言与普通单同一张 order 表同一列，team.open/join
    // 已接住 buyer_remark ⇒ 段壳只留 `!isSendFriend`，拼团只摘「积分 + 会员折扣」两行
    // （那一档的判据由 check-group-buy-popup.js 钉，两边各管自己那一档）
    // 2026-10-30 起这一段自带前导间隔条、整段包在 `<template v-if="!isSendFriend">` 里（与其他块同一档：
    // 条归块自己所有，块不渲染时条也一起不渲染，不与相邻块叠成两条）；老形态（v-if 挂在 tz-box 上）仍接受，
    // 判据只钉「送好友档不收这一段」这一件事
    && ( /<template v-if="!isSendFriend">\s*<tz-divider[^>]*\/>\s*<tz-box padding="5px 15px">/.test(s)
      || /<tz-box padding="5px 15px" v-if="!isSendFriend">/.test(s) );
  const ok = gate && countRow && countAligned && switchApi && payload && guard && untouched;
  return {
    ok,
    got: 'sf 门控=' + gate + ' 份数行=' + countRow + ' 份数靠右=' + countAligned + ' 建单口切换=' + switchApi
      + ' 载荷五键=' + payload + ' 未装守卫=' + guard + ' 非 sf 档不变=' + untouched + ' [' + label + ']',
  };
}

/** ⑥ 页内重算=局部刷新（2026-10-18 用户点名「每点一次增加次数都整页刷新」） */
function checkLocalRefresh(orderSrc, label) {
  const s = stripComments(orderSrc);
  const body = (name) => {
    const i = s.indexOf(name);
    return i < 0 ? '' : s.slice(i, i + 1200);
  };
  // ⑥a 签名与门控：`getData(silent)`，首屏才置 loading（loading 一真，整块模板就翻成骨架，
  // 步进器与券行被销毁重建 —— 用户读出来就是「点一次刷一次」）
  const sig = /getData\(silent\)\s*\{/.test(s);
  const skelGated = /if \(!silent\) \{\s*this\.loading = true;\s*that\.getUserData\(\);/.test(s.replace(/\r?\n/g, ' ').replace(/\s+/g, ' '));
  // ⑥b 页内两处交互都走静默：改份数、选券
  const giftSilent = /onGiftCount[\s\S]{0,700}?this\.getData\(true\)/.test(s) && !/onGiftCount[\s\S]{0,700}?this\.getData\(\)/.test(s);
  const couponSilent = /couponChange\(id\)\s*\{[\s\S]{0,300}?this\.getData\(true\)/.test(s);
  // ⑥c 回包作废闸门（then 与 catch 两头都要）：连点时先发的请求可能后回，
  // 不设号就把新份数的金额盖回上一档；号记在实例上（模块级 that 会被另一个宿主顶掉）
  const seqGuard = (s.match(/if \(seq !== this\.calcSeq\) \{ return; \}/g) || []).length;
  // ⑥d 静默那一趟失败不许把人送离下单页（原先不分首屏都弹「确认后返回上一页」）
  const softFail = /else if \(silent\)[\s\S]{0,200}?showToast/.test(s) && /\}\s*else \{\s*uni\.showModal\(/.test(s);
  // ⑥e 卸载时撤计时器 + 作废在途那一号（硬约束 23：回包不许写到已出栈的实例）
  const teardown = /clearTimeout\(this\.giftTimer\);/.test(s) && /this\.calcSeq = \(this\.calcSeq \|\| 0\) \+ 1;/.test(s);
  // ⑥f 首屏两枚调用点仍不带参（该闪骨架的地方照旧闪）
  const firstPaint = (s.match(/this\.getData\(\);/g) || []).length >= 2;
  const ok = sig && skelGated && giftSilent && couponSilent && seqGuard >= 2 && softFail && teardown && firstPaint;
  return {
    ok,
    got: '签名=' + sig + ' 骨架门控=' + skelGated + ' 份数静默=' + giftSilent + ' 选券静默=' + couponSilent
      + ' 作废闸门=' + seqGuard + '/2 软失败=' + softFail + ' 卸载收口=' + teardown + ' 首屏不带参=' + firstPaint + ' [' + label + ']',
  };
}

/** ⑦ 支付面板那一枚金额不许被 0/空覆盖（2026-10-18 用户点名「付款弹窗的金额为0」） */
function checkPayAmount(orderSrc, label) {
  const s = stripComments(orderSrc);
  // 面板吃的是 `data.real_price`：先由 `order.calculate` 填上应付，建单回体再覆盖一次。
  // 原先覆盖的条件是 `res.data.real_price !== undefined` —— 回体给 null/空串也照样过，
  // 于是把算好的应付盖成空，`|| 0` 收尾就成了 ¥0.00（后端那一头同批改吐订单行 real_price，见 SendFriendOrderAmountTest）
  const helper = /isGiftNum\(v\)\s*\{[\s\S]{0,200}?v !== null[\s\S]{0,120}?isFinite\(Number\(v\)\)/.test(s);
  // 2026-10-28 虚拟支付那一档把赋值拆成 display_price / real_price 两跳，仍然整体在 isSendFriend 里、
  // 两跳都过 isGiftNum：按「外层 if + real_price 跳有数值闸」判，不再要求写成同一行 &&
  const guarded = /if \(that\.isSendFriend\)[\s\S]{0,600}?isGiftNum\(res\.data\.real_price\)/.test(s);
  const noRaw = !/real_price !== undefined/.test(s);
  const moneyBound = /<tz-pay[\s\S]{0,200}?:money="data\.real_price \|\| 0"/.test(s);
  const ok = helper && guarded && noRaw && moneyBound;
  return { ok, got: '数值判据=' + helper + ' 覆盖前过闸=' + guarded + ' 裸 undefined 判据已清=' + noRaw
    + ' 面板绑定=' + moneyBound + ' [' + label + ']' };
}

/** ⑧ 送礼档首屏复核入口（2026-10-20 用户实报：旧 flag 放进来，提交才被拦） */
function checkGiftGateOnSubmit(orderSrc, label) {
  const s = stripComments(orderSrc);
  const call = /if \(this\.isSendFriend && !silent\) \{\s*this\.checkGiftEntry\(\);\s*\}/.test(s);
  const api = /checkGiftEntry\(\)\s*\{[\s\S]{0,600}?send_friend\.gift\.entry/.test(s);
  const flag = /checkGiftEntry\(\)\s*\{[\s\S]{0,2400}?send_friend_entry/.test(s);
  const blocked = /giftBlocked = true/.test(s)
    && /showModal\(\s*\{[\s\S]{0,200}?暂不支持赠送/.test(s) && /\$nav\.back\(\)/.test(s);
  const max = /giftMax = Number\(d\.max_per_order\) \|\| 0/.test(s);
  const sfmax = /const fresh = Number\(this\.giftMax\) \|\| 0;/.test(s);
  const submitGuard = /that\.isSendFriend && that\.giftBlocked/.test(s);
  const ok = call && api && flag && blocked && max && sfmax && submitGuard;
  return {
    ok,
    got: '首屏调用=' + call + ' 取数口=' + api + ' flag判读=' + flag + ' 拦下并退回=' + blocked
      + ' 上限吃回体=' + max + ' sfMax优先新值=' + sfmax + ' 提交守卫=' + submitGuard + ' [' + label + ']',
  };
}

/** ⑧ 的运行时态：把 submit-order 的 `checkGiftEntry` 真跑一遍（flag=0 拦下 / flag=1 收上限） */
function buildOrderVm(code, opt) {
  const o = opt || {};
  const env = { calls: [], modals: [], navs: [] };
  const uni = {
    showModal: (a) => { env.modals.push(a); if (a && typeof a.success === 'function') { a.success({ confirm: true }); } },
    showToast: () => {}, showLoading: () => {}, hideLoading: () => {},
    getStorageSync: () => 'tok', removeStorageSync: () => {}, setStorageSync: () => {},
  };
  let s = code.replace(/export\s+default/, 'module.exports =');
  s = s.replace(/^\s*import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, 'const $1 = {};');
  s = s.replace(/^\s*import\s*\{([^}]*)\}\s*from\s*["']([^"']*feature-flags[^"']*)["'];?\s*$/gm, (all, names) => names.split(',')
    .map((n) => n.trim()).filter(Boolean)
    .map((n) => 'const ' + n + ' = ' + (n in FLAGS ? String(FLAGS[n]) : 'false') + ';').join(' '));
  // 三态闸门的桩：这一组只验「复核 flag=0/1 两档」，安装态放行（三态本身由 check-plugin-guard.js 钉）
  s = s.replace(/^\s*import\s*\{([^}]*)\}\s*from\s*["']([^"']*)["'];?\s*$/gm, (all, names, mod) => {
    if (/plugin-guard/.test(mod)) {
      return names.split(',').map((n) => n.trim()).filter(Boolean).map((n) => 'const ' + n + ' = '
        + ({ pluginState: '() => true', pluginMissing: '() => false', onSystemConfigReady: '(cb) => { if (typeof cb === "function") { cb(); } return () => {}; }' }[n] || '() => {}') + ';').join(' ');
    }
    return '';
  });
  const mod = { exports: {} };
  new Function('module', 'exports', 'uni', '$tools', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', s)(
    mod, mod.exports, uni, { systemConfig: () => 1, copy: () => {} }, setTimeout, clearTimeout, () => 0, () => {}
  );
  const options = mod.exports;
  const vm = Object.assign({}, typeof options.data === 'function' ? options.data() : {});
  Object.keys(options.computed || {}).forEach((k) => Object.defineProperty(vm, k, {
    get: () => options.computed[k].call(vm), configurable: true,
  }));
  Object.keys(options.methods || {}).forEach((k) => { vm[k] = options.methods[k].bind(vm); });
  vm.$api = (name, params) => {
    env.calls.push({ name, params });
    return Promise.resolve(o.entry || { code: 1, data: { send_friend_entry: 0 } });
  };
  vm.$tools = { systemConfig: () => 1, copy: () => {} };
  vm.$nav = { back: () => env.navs.push('back'), to: (d) => env.navs.push('to:' + d) };
  vm.$refs = {};
  vm.$set = (obj, k, v) => { obj[k] = v; };
  vm.pageParams = o.pageParams || { sf: 1, sf_max: 5, goodsList: [{ goodsId: 12933, goodsType: 'course' }] };
  return { vm, env };
}

async function checkGiftGateRuntime(orderSrc, label) {
  const off = buildOrderVm(orderSrc, { entry: { code: 1, data: { send_friend_entry: 0 } } });
  off.vm.loading = true;
  off.vm.checkGiftEntry();
  await tick();
  const blocked = off.vm.giftBlocked === true && off.vm.loading === false
    && off.env.modals.length === 1 && /暂不支持赠送/.test(String((off.env.modals[0] || {}).content || ''))
    && off.env.navs.indexOf('back') >= 0;

  const on = buildOrderVm(orderSrc, { entry: { code: 1, data: { send_friend_entry: 1, max_per_order: 3 } } });
  on.vm.checkGiftEntry();
  await tick();
  const allowed = on.vm.giftBlocked === false && on.vm.giftMax === 3 && on.env.modals.length === 0
    && on.vm.sfMax === 3; // URL 里的 sf_max=5 要让位给本次回体

  return {
    ok: blocked && allowed,
    got: 'flag0: blocked=' + blocked + ' modal=' + off.env.modals.length + ' navs=' + JSON.stringify(off.env.navs)
      + ' / flag1: allowed=' + allowed + ' giftMax=' + on.vm.giftMax + ' sfMax=' + on.vm.sfMax + ' [' + label + ']',
  };
}

/**
 * ⑨ 2026-10-27 图1 那一版：三步条 + 留言/商品金额两行 + 券行文案 + 底栏配色档
 *
 * 只钉「这一档才出」的东西：全部挂在 `isSendFriend`（页自身携带的 `sf=1`）上，
 * 普通下单页与直播间下单弹窗都不许被重绘（用户点名只改送好友这一档）。
 * 三步条是静态文案 ⇒ 必须在骨架屏那一支之外（加载中也显示），否则首屏会先空一段再出现。
 */
function checkSendFriendUi(orderSrc, label, stepsSrc) {
  const s = stripComments(orderSrc);
  // 三步条本体在共用组件里（`components/tz/sf-steps.vue`），调用点只留 :active；
  // 坏样件 15 需要把组件源码改坏，故第二参可注入
  const steps = stripComments(stepsSrc === undefined ? read(STEPS_VUE) : stepsSrc);
  const bandAt = s.indexOf('<tz-sf-steps');
  const skelAt = s.indexOf('<template v-if="loading">');
  const band = bandAt >= 0 && skelAt > bandAt
    && /<tz-sf-steps v-if="isSendFriend" :active="1" \/>/.test(s)
    && /1\. 购买礼物/.test(steps) && /2\. 赠送好友/.test(steps) && /3\. 好友收礼/.test(steps)
    && (steps.match(/class="sf-step-sep"/g) || []).length >= 2
    && /<tz-divider v-if="isSendFriend" bgColor="#fafafa" \/>/.test(s);
  const remark = /label="留言"/.test(s) && /placeholder="选填，建议和商家沟通后再填写"/.test(s)
    && /v-model="form\.buyer_remark"/.test(s);
  const amount = /label="商品金额"/.test(s) && /data\.goods_total_price/.test(s);
  const saved = /buyer_remark: that\.form\.buyer_remark/.test(s);
  // 券行文案 2026-10-30 起走 computed `couponEmptyText`（送好友档「无可用优惠券」，普通/拼团档
  // 再分「请选择优惠券 / 暂无可用优惠券」）—— 模板里不再写死那一串，判据跟着读到 computed 那一层
  const coupon = /'优惠券\/码'/.test(s) && /couponEmptyText/.test(s)
    && /'无可用优惠券'/.test(s) && /'暂无可用优惠券'/.test(s);
  // 底栏配色档：送好友深钢蓝；拼团档红橙（2026-10-30 用户点名「拼团的订单，立即支付按钮也要红橙主题色」）
  const theme = /:theme="isSendFriend \? 'send-friend' : \(isGroupBuy \? 'group-buy' : ''\)"/.test(s);
  const btnCss = /\.tbb-bar--sf \.price\b/.test(read(BOTTOM_BTN)) && /\.tbb-bar--sf \.u-button\b/.test(read(BOTTOM_BTN));
  /* 2026-10-27 用户点名「向右的箭头要与 icon+文字 垂直方向居中对齐」：三角按**整格**居中，
     判据两枚缺一不可 —— ① 容器 `align-items: center`（三角按整行十字轴中线摆）；
     ② 三角自身不写 height（写死 20px 就退回「只与图标那一行齐顶」，中线从 24 掉到 10）。 */
  const stepsCss = (steps.match(/\.sf-steps \{[\s\S]*?\}/) || [''])[0];
  const sepCss = (steps.match(/\.sf-step-sep \{[\s\S]*?\}/) || [''])[0];
  const sepCentered = /align-items:\s*center/.test(stepsCss) && sepCss.length > 0 && !/(^|[\s;{])height\s*:/.test(sepCss);
  /* 2026-10-27 用户点名「中间的间隔条，背景色调整为页面的背景色」：块与块之间那几枚一律 `#fafafa`
     （= App.vue `page{background:rgba(250,250,250,1)}`，H5 编译成 `uni-page-body{background:#fafafa}`）；
     tz-divider 默认 #f5f5f5 比页面底色深一档，10px 高的一条就读成一道浅灰条。
     卡内围着虚线那两枚仍写 `#fff`（与所在白卡同底）⇒ 判据：每一枚都必须显式给色，且恰好两枚是 #fff。 */
  const gapDividers = (s.match(/<tz-divider[^>]*>/g) || []);
  const gaps = gapDividers.filter((t) => /bgColor="#fafafa"/.test(t));
  const cardDividers = gapDividers.filter((t) => /bgColor="#fff"/.test(t));
  const gapOk = gaps.length >= 6 && cardDividers.length === 2
    && gapDividers.length === gaps.length + cardDividers.length;
  /* 2026-10-27 用户点名「份数 cell 的上下内边距有点小，参考优惠券」：这一格的内容盒必须与券行
     `.input-item` 同档 —— H5/APP 40 高（并把步进器垂直居中），MP 24（那端 form-item 固定 40）。 */
  /* 这两格要看**未去注释**的源码：条件编译标记本身就是 CSS 注释（#ifndef MP 那几个），
     stripComments 会把它们一起吃掉，于是「哪一档给 40」就判不出来。 */
  const countRowCss = (orderSrc.match(/\.gift-count-row\s*\{([^}]*)\}/) || [])[1] || '';
  const inputItemCss = (orderSrc.match(/\.input-item\s*\{([^}]*)\}/) || [])[1] || '';
  const countRowH = /#ifndef MP[\s\S]*?height:\s*40px/.test(countRowCss) && /align-items:\s*center/.test(countRowCss);
  const cellH = countRowH
    && /#ifndef MP[\s\S]*?height:\s*40px/.test(inputItemCss)
    && /#ifdef MP[\s\S]*?height:\s*24px/.test(inputItemCss);
  const ok = band && remark && amount && saved && coupon && theme && btnCss && sepCentered && gapOk && cellH;
  return {
    ok,
    got: '三步条=' + band + ' 留言行=' + remark + ' 商品金额=' + amount + ' 留言进载荷=' + saved
      + ' 券行文案=' + coupon + ' 底栏配色档=' + theme + ' 底栏样式=' + btnCss
      + ' 三角按整格居中=' + sepCentered
      + ' 间隔条取页面底色=' + gapOk + '(' + gaps.length + '+卡内' + cardDividers.length + ')'
      + ' 份数行与券行同高=' + cellH + ' [' + label + ']',
  };
}

/** ④ 支付成功页【去赠送】由后端 flag 把关（把 v-if 表达式真的求值），且落点是赠送详情（送礼页）——
 *  2026-10-28 用户点名「在这个页面点进去赠送，直接跳转赠送详情」：目标页必须带 `gift_code` 拼的 `code`，
 *  拿不到凭据才回落赠送记录列表（且带 order_no 只列这一单）。两段都读源码，缺一段即判红。 */
function checkResultGoGift(tpl, js, label) {
  // 只认代码：注释里写着「gift_code」不算读了它（坏样件 19 就是靠这一条被抓红的）
  js = stripComments(js);
  const idx = tpl.indexOf('去赠送');
  if (idx < 0) return { ok: false, got: 'result.vue 里找不到【去赠送】那一档 [' + label + ']' };
  const before = tpl.slice(0, idx);
  const opens = [...before.matchAll(/<template\s+v-if="([^"]*)"/g)];
  const closes = (before.match(/<\/template>/g) || []).length;
  const unclosed = opens.length - closes;
  const cond = unclosed >= 1 ? opens[opens.length - 1][1] : null;
  // eslint-disable-next-line no-new-func
  const evalExpr = (expr, scope) => { try { return new Function('with(this){ return (' + expr + '); }').call(scope); } catch (e) { return false; } };
  // result.vue 的 v-if 自 2026-10-22 起多了一枚前端开关（featureSendFriend，读真实 feature-flags.js），
  // 求值域必须带上它，否则 with(this) 里 ReferenceError 被 catch 吃掉、两档都算 false。
  const ctx = (flag) => ({ featureSendFriend: !!FLAGS.FEATURE_SEND_FRIEND, orderDetail: { gift_entry: flag, order_type: 'course', goodsList: [] }, $nav: { to: () => {} } });
  const shownOn = cond ? !!evalExpr(cond, ctx(1)) : false;
  const shownOff = cond ? !!evalExpr(cond, ctx(0)) : true;
  const rawCompare = /source\s*===?\s*['"]send_friend['"]/.test(tpl);
  // 按钮点的是本页方法（不把落点写死在模板里）：handler 名从模板取，再到 js.vue 里认它真存在
  const handler = (tpl.match(/<tz-button[^>]*text="去赠送"[^>]*?@click="([A-Za-z_$][\w$]*)"/) || [])[1] || '';
  const handlerDefined = handler !== ''
    && new RegExp('\\b' + handler.replace(/\$/g, '\\$') + '\\s*\\(').test(js);
  // 落点①赠送详情（送礼页）：带凭据 gift_code，且过 encodeURIComponent（32 位十六进制凭据照旧安全拼接）
  const detailJump = /\/pages\/app\/send_friend\/send\/send\?code=['"]\s*\+\s*encodeURIComponent\(/.test(js)
    && /gift_code/.test(js);
  // 落点②拿不到凭据才回落赠送记录列表，且带 order_no 只列这一张购买单（同一句里拼，不是别处随便出现）
  const listLine = (js.match(/\/pages\/app\/send_friend\/gift\/gift['"]\s*\+[^;]*;/) || [])[0] || '';
  const listFallback = listLine !== '' && /order_no/.test(listLine);
  const redirectTo = (js.match(/redirectTo/g) || []).length >= 2;
  const ok = !!cond && shownOn && !shownOff && !rawCompare && /gift_entry/.test(cond) && !/is_gift/.test(cond)
    && handlerDefined && detailJump && listFallback && redirectTo;
  return {
    ok,
    got: 'v-if=' + JSON.stringify(cond) + ' flag=1→' + shownOn + ' flag=0→' + shownOff
      + ' handler=' + (handler || '-') + ' 定义=' + handlerDefined
      + ' 详情跳转(gift_code+encode)=' + detailJump + ' 列表回落(order_no)=' + listFallback
      + ' redirectTo×' + (js.match(/redirectTo/g) || []).length + ' [' + label + ']',
  };
}

(async () => {
  if (process.argv.indexOf('--selftest') >= 0) return selftest();
  console.log('=== check-send-friend-submit（M-P2：并回标准提交订单页后的送礼分支）===');

  let r = await checkSubmitUrl(scriptOf(AREA), '真件');
  assert('① 入口落页 = /pages/order/submit/submit?sf=1&goodsList=…（与「立即购买」同一条；旧插件路由零残留）', r.ok, r.got);

  r = checkOrderBranch(read(ORDER_VUE), '真件');
  assert('② submit-order.vue 送礼分支：sf 门控 / 份数行(:max=sfMax) / 建单口切换+载荷五键（含留言） / 未装守卫，且非 sf 档逐字不变', r.ok, r.got);

  r = checkLocalRefresh(read(ORDER_VUE), '真件');
  assert('⑥ 页内重算是局部刷新：`getData(silent)` 只让首屏翻骨架，改份数/选券走静默、回包带作废号、静默失败不返回上一页、卸载收口（2026-10-18 用户点名「每点一次增加次数整页刷新一次」）', r.ok, r.got);

  r = checkPayAmount(read(ORDER_VUE), '真件');
  assert('⑦ 支付面板金额不许被空值覆盖：建单回体只在「是个数值」时才覆盖 `data.real_price`（`!== undefined` 挡不住 null ⇒ 面板 ¥0，2026-10-18 用户点名）', r.ok, r.got);

  r = checkGiftGateOnSubmit(read(ORDER_VUE), '真件');
  assert('⑧ 送礼档首屏复核入口：flag=0 说原因并退回、份数上限吃本次回体、提交口有拦下守卫（2026-10-20 用户实报）', r.ok, r.got);

  r = await checkGiftGateRuntime(scriptOf(ORDER_VUE), '真件');
  assert('⑧b 复核运行时态：flag=0 弹一句并退回、flag=1 收下本次份数上限（URL 旧 sf_max 让位）', r.ok, r.got);

  r = checkSendFriendUi(read(ORDER_VUE), '真件');
  assert('⑨ 图1 那一档：三步条（静态、骨架之外、三角按整格居中）/ 留言行（且进 gift/create 载荷）/ 商品金额 / 券行文案 / 底栏深钢蓝（全部只挂 sf=1）', r.ok, r.got);

  r = checkResultGoGift(stripComments(templateOf(RESULT)), read(RESULT_JS), '真件');
  assert('④ 支付成功页【去赠送】吃后端 flag（`gift_entry`；`is_gift` 是全站从不发的旧键，出现即判红），不是常显、也不是裸串比对；落点＝赠送详情（`gift_code` 拼 code），拿不到凭据才回落记录列表（带 order_no）', r.ok, r.got);

  const pagesSrc = read(PAGES_JSON);
  const apiSrc = stripComments(read(API_LIST));
  assert('⑤ 插件下单页路由已撤（pages.json 零残留）且 gift.create 仍登记 auth:true（调用点=提交订单页送礼分支）',
    pagesSrc.indexOf('send_friend/submit/submit') < 0
      && /create:\s*\{[\s\S]{0,120}?url:\s*['"]app\/send_friend\/gift\/create['"][\s\S]{0,80}?auth:\s*true/.test(apiSrc),
    'pages残留=' + (pagesSrc.indexOf('send_friend/submit/submit') >= 0) + ' api登记=' + /gift\/create/.test(apiSrc));

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
    const BAD_OLD_ROUTE = scriptOf(AREA).replace("/pages/order/submit/submit?sf=1", "/pages/app/send_friend/submit/submit?goods_id=");
    expect('坏样件 1：落页指回已撤掉的插件下单页', await checkSubmitUrl(BAD_OLD_ROUTE, '样件1'));
    const BAD_NO_COUNT = read(ORDER_VUE).replace('count: that.form.gift_count,', 'count: 1,');
    expect('坏样件 2：建单载荷不带所选份数（固定 1）', checkOrderBranch(BAD_NO_COUNT, '样件2'));
    const BAD_NO_SWITCH = read(ORDER_VUE).replace('that.isSendFriend ? "send_friend.gift.create" : "order.create"', '"order.create"');
    expect('坏样件 3：建单口没切（礼物单当普通订单建）', checkOrderBranch(BAD_NO_SWITCH, '样件3'));
    const BAD_NO_GUARD = read(ORDER_VUE)
      .replace(/this\.isSendFriend && \(?(!FEATURE_SEND_FRIEND\s*\|\|\s*)?!this\.pluginGate\('send_friend',\s*'送好友'\)\)?/, 'false');
    expect('坏样件 4：未装闸门守卫被摘（标准版白等一条 404）', checkOrderBranch(BAD_NO_GUARD, '样件4'));
    // 坏样件 5：份数步进器没靠右（= 用户 2026-10-16 点名的那一版：裸 u-number-box 贴在 label 右侧）
    const BAD_COUNT_LEFT = read(ORDER_VUE).replace(/<view class="gift-count-row">[\s\S]*?<\/view>\r?\n(\s*)<\/u-form-item>/,
      '<u-number-box v-model="form.gift_count" :min="1" :max="sfMax" :integer="true"\n                        @change="onGiftCount"></u-number-box>\n$1</u-form-item>');
    expect('坏样件 5：份数步进器没靠右（裸 u-number-box 贴在左侧）', checkOrderBranch(BAD_COUNT_LEFT, '样件5'));
    // ⑥ 的四颗样件：把局部刷新改回整页翻骨架 / 页内调用不带 silent / 作废闸门摘掉 / 卸载不撤计时器
    expect('坏样件 6：首屏之外的改动也把整块模板翻成骨架（`if (!silent)` 门控被摘）',
      checkLocalRefresh(read(ORDER_VUE).replace(/if \(!silent\) \{\r?\n(\s*)this\.loading = true;/, 'if (true) {$1this.loading = true;'), '样件6'));
    expect('坏样件 7：改份数仍走整页取数（`getData(true)` 退回 `getData()`）',
      checkLocalRefresh(read(ORDER_VUE).split('this.getData(true);').join('this.getData();'), '样件7'));
    expect('坏样件 8：回包不作废（连点时旧份数的金额会把新的盖回去）',
      checkLocalRefresh(read(ORDER_VUE).replace(/if \(seq !== this\.calcSeq\) \{ return; \}/g, ''), '样件8'));
    expect('坏样件 9：卸载不撤计时器、不作废在途那一号（回包写到已出栈的实例上）',
      checkLocalRefresh(read(ORDER_VUE).replace(/clearTimeout\(this\.giftTimer\);\r?\n\s*this\.calcSeq = \(this\.calcSeq \|\| 0\) \+ 1;/, ''), '样件9'));
    // 2026-10-28 起虚拟支付把赋值拆成 display_price / real_price 两跳（外层 `if (that.isSendFriend)`），
    // 样件改摘 real_price 那一跳的数值闸（旧样件按整行 && 拼的写法已对不上源码 = 判据会瞎）
    expect('坏样件 10：覆盖金额的条件退回 `!== undefined`（回体给 null 就把应付盖成空 ⇒ 面板 ¥0）',
      checkPayAmount(read(ORDER_VUE).replace('that.isGiftNum(res.data.real_price)',
        'res.data.real_price !== undefined'), '样件10'));
    expect('坏样件 11：首屏不复核入口 flag（页面来自历史栈/设置变更后照样能提交）',
      checkGiftGateOnSubmit(read(ORDER_VUE).replace(/if \(this\.isSendFriend && !silent\) \{\s*this\.checkGiftEntry\(\);\s*\}/,
        'if (false) {}'), '样件11'));
    expect('坏样件 12：复核判死后提交口没拦（弹窗确认前又点一下仍会建单）',
      checkGiftGateOnSubmit(read(ORDER_VUE).replace(/if \(that\.isSendFriend && that\.giftBlocked\) \{\s*return false;\s*\}/,
        'if (false) {}'), '样件12'));
    expect('坏样件 13：复核把一切 flag 都放行（运行时态拦不住）',
      await checkGiftGateRuntime(scriptOf(ORDER_VUE).replace(
        /FEATURE_SEND_FRIEND && \(Number\(d\.send_friend_entry\) === 1 \|\| d\.send_friend_entry === true\)/, 'true'), '样件13'));
    expect('坏样件 14：留言行还在、建单载荷却把 buyer_remark 摘了（图1 那一格输入被静默丢掉）',
      checkSendFriendUi(read(ORDER_VUE).replace(/\r?\n\s*buyer_remark: that\.form\.buyer_remark,/, ''), '样件14'));
    // 坏样件 15：三角退回「只与图标那一行齐顶」= 用户 2026-10-27 点名的那一版（容器 flex-start + 三角写死 20px）
    expect('坏样件 15：三角只与图标行齐顶、不与「图标 + 文字」整格居中',
      checkSendFriendUi(read(ORDER_VUE), '样件15', read(STEPS_VUE)
        .replace(/(\.sf-steps \{[^}]*?align-items:\s*)center/, '$1flex-start')
        .replace(/(\.sf-step-sep \{[^}]*?width: 12px;)/, '$1\n        height: 20px;')));
    // 坏样件 16 / 17：用户 2026-10-27 同一轮的两条点名（间隔条取页面底色 / 份数 cell 内边距照券行）
    expect('坏样件 16：块间间隔条退回 tz-divider 默认 #f5f5f5（比页面底色深一档，读成一道浅灰条）',
      checkSendFriendUi(read(ORDER_VUE).split('bgColor="#fafafa"').join(''), '样件16'));
    expect('坏样件 17：份数行内容盒退回步进器自身 24 高（整格比券行矮 16px、上下各少 8px）',
      checkSendFriendUi(read(ORDER_VUE).replace(/(\.gift-count-row\s*\{[^}]*?)(\s*height:\s*40px;\s*align-items:\s*center;)/, '$1'), '样件17'));
    // 坏样件 18~20：用户 2026-10-28 那句「在这个页面点进去赠送，直接跳转赠送详情」的三支走偏
    const RESULT_TPL = stripComments(templateOf(RESULT));
    const RESULT_JS_SRC = read(RESULT_JS);
    expect('坏样件 18：去赠送落点退回赠送记录列表（点完还要再找那条记录）',
      checkResultGoGift(RESULT_TPL, RESULT_JS_SRC.replace(
        "'/pages/app/send_friend/send/send?code=' + encodeURIComponent(code)",
        "'/pages/app/send_friend/gift/gift?code=' + encodeURIComponent(code)"), '样件18'));
    expect('坏样件 19：落点仍是送礼页，但凭据改读 order_no（送礼页认的是 gift_no，点进去必是「礼物不存在」）',
      checkResultGoGift(RESULT_TPL, RESULT_JS_SRC.replace(
        "String((this.orderDetail || {}).gift_code || '')",
        "String((this.orderDetail || {}).order_no || '')"), '样件19'));
    expect('坏样件 20：回落列表时不带 order_no（把用户丢进「我的全部礼单」而不是这一单）',
      checkResultGoGift(RESULT_TPL, RESULT_JS_SRC.replace(
        "'/pages/app/send_friend/gift/gift' + (this.order_no ? '?order_no=' + this.order_no : '')",
        "'/pages/app/send_friend/gift/gift'"), '样件20'));
    // 坏样件 21 / 22（2026-10-30）：拼团底栏配色档丢掉 / 券行「暂无可用优惠券」退回「请选择优惠券」
    expect('坏样件 21：拼团档不再传 `theme="group-buy"`（立即支付又变回蓝底）',
      checkSendFriendUi(read(ORDER_VUE).replace(
        ":theme=\"isSendFriend ? 'send-friend' : (isGroupBuy ? 'group-buy' : '')\"",
        ":theme=\"isSendFriend ? 'send-friend' : ''\""), '样件21'));
    expect('坏样件 22：没有可用券时券行退回「请选择优惠券」',
      checkSendFriendUi(read(ORDER_VUE).replace("'暂无可用优惠券'", "'请选择优惠券'"), '样件22'));
    // 坏样件 23（2026-10-30）：积分/会员折扣/备注那一段的 `!isSendFriend` 门控被摘（送好友档又多出一段
    // 本不该出现的「备注」，与上面藏好的留言块重复）。落点只认带前导条的那一处（商品小记那块同样挂
    // `!isSendFriend`，不一起误伤）。
    expect('坏样件 23：积分/会员折扣/备注段不再排除送好友档（同一张单摆两处买家留言）',
      checkOrderBranch(read(ORDER_VUE).replace(
        /<template v-if="!isSendFriend">(\s*<tz-divider bgColor="#fafafa" \/>\s*<tz-box padding="5px 15px">)/,
        '<template>$1'), '样件23'));
    const good = checkOrderBranch(read(ORDER_VUE), '好样件');
    if (good.ok) { pass++; console.log('[SELFTEST-OK] 好样件未被误判 -> ' + good.got); }
    else { fail++; console.log('[SELFTEST-FAIL] 好样件被判红 ⇒ 判据太宽 -> ' + good.got); }
    console.log('\n[SELFTEST] 坏样件 ' + fired + ' 条被抓红（要求 ≥20），合格样件不误报；总通过 ' + pass + ' / 失败 ' + fail);
    process.exitCode = fail === 0 && fired >= 20 ? 0 : 1;
    return undefined;
  }
})().catch((e) => {
  console.log('[HARNESS-ERROR] ' + (e && e.stack ? e.stack : e));
  process.exitCode = 1;
});
