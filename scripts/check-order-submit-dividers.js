/**
 * 提交订单页「块间间隔条不许叠」的机器验法（2026-10-30 用户实报）
 *
 * 用户原话：「pages/order/submit/submit?goodsList=%5B%5D&gb_activity=11602&gb_spec=2844&gb_spec_set=1
 * &gb_campus=1994&gb_goods_type=school_package&gb_goods_id=834 出现了两个相连的 divider。
 * 这个最多只能出现一个相邻。」
 *
 * 为什么会叠：商品卡之后那几块（购买前表单 / 拼团额外信息 / 券段 / 送好友留言 / 积分备注）
 * 原先各自把间隔条摆在「块外」——表单段前一条无条件、拼团段前一条无条件、券段后一条……
 * 两个条件块的条件同时成立（拼团教务套餐 / 线下活动要填额外信息）时，两条就贴在一起；
 * 表单段不渲染（普通拼团）时，它那条无条件的前导条又和拼团段那条挨上，任何一档都叠两条。
 *
 * 修法（本脚本钉的就是这个结构）：**每条块间间隔条归它后面那一块自己所有（前导条）**。
 * 块自己不渲染 ⇒ 条也一起消失，由后一块的前导条补位；两块之间恒为 0 或 1 条。
 *
 * 两条判据：
 *  ① 结构：五个「信息块」各自的第一枚节点必须是同一条件的 `tz-divider`（前导条归块自己所有）；
 *  ② 组合模拟：把模板顶层节点按 `v-if`/`v-else`/透明 `<template>` 拍平，对
 *     loading / 送好友 / 拼团 / 虚拟支付 / 表单 / 拼团额外信息 / 地址 的全部组合求可见序列，
 *     任何一组里都不许出现两枚相邻的 `tz-divider`。
 *
 * 跑法：node tuzi-mobile/scripts/check-order-submit-dividers.js
 *      node tuzi-mobile/scripts/check-order-submit-dividers.js --selftest   # 每类坏样件必须各红一次
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ORDER_VUE = 'src/components/order/submit-order.vue';

let pass = 0;
let fail = 0;
function ok(name, good, note) {
  if (good) { pass++; console.log('[PASS] ' + name + (note ? ' -> ' + note : '')); }
  else { fail++; console.log('[FAIL] ' + name + (note ? ' -> ' + note : '')); }
  return !!good;
}

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/** 只留模板那一层；注释按行数换成空白，避免注释里的旧写法当违规 */
function templateOf(src) {
  const at = src.indexOf('<template');
  const end = src.lastIndexOf('</template>');
  const body = end <= at ? '' : src.slice(src.indexOf('>', at) + 1, end);
  return body.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
}

/** 把模板拍成一棵只认标签的树（文本节点不要：判据只看块与条的顺序） */
function parseTags(src) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;
  while ((m = re.exec(src))) {
    const [, closing, tag, attrText, selfClosing] = m;
    if (closing) {
      if (stack.length > 1) { stack.pop(); }
      continue;
    }
    const attrs = {};
    const ar = /([^\s=]+)(?:\s*=\s*"([^"]*)")?/g;
    let a;
    while ((a = ar.exec(attrText))) {
      if (a[1] && !(a[1] in attrs)) { attrs[a[1]] = a[2] === undefined ? true : a[2]; }
    }
    const node = { tag: tag.toLowerCase(), attrs, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!selfClosing) { stack.push(node); }
  }
  return root;
}

/**
 * 拍平「页面顶层」节点：`<template>` 是透明壳（它的孩子升到同一层），
 * 带 v-if 的元素/壳自身算一个块；`v-else` 取上一兄弟条件的反。
 * 返回 [{ tag, cond }]，cond 是可直接求值的表达式串。
 */
function flattenTop(list, inherited) {
  const out = [];
  let prevCond = null;
  list.forEach((n) => {
    const ownIf = typeof n.attrs['v-if'] === 'string' ? n.attrs['v-if'] : null;
    const elseIf = typeof n.attrs['v-else-if'] === 'string' ? n.attrs['v-else-if'] : null;
    const hasElse = n.attrs['v-else'] !== undefined;
    const own = elseIf || (hasElse ? (prevCond ? '!(' + prevCond + ')' : 'true') : ownIf);
    const cond = [inherited, own].filter(Boolean).join(' && ');
    if (n.tag === 'template') {
      out.push(...flattenTop(n.children, cond));
    } else {
      out.push({ tag: n.tag, cond });
    }
    if (ownIf) { prevCond = ownIf; }
    else if (elseIf) { prevCond = elseIf; }
    else if (hasElse) { prevCond = null; }
  });
  return out;
}

/** 页面顶层节点（根 `<view>` 的孩子；没有根 view 时退回 template 顶层） */
function topLevelNodes(tpl) {
  const tree = parseTags(tpl);
  const rootView = tree.children.filter((n) => n.tag === 'view')[0] || tree.children[0];
  return flattenTop(rootView.children, '');
}

function evalIn(expr, scope) {
  try {
    // eslint-disable-next-line no-new-func
    return !!(new Function('with(this){ return (' + expr + '); }').call(scope));
  } catch (e) {
    return false;
  }
}

/** 「信息块」白名单：条件里出现这些键的顶层块都必须是「前导条 + 自己」这一对 */
const BLOCK_KEYS = ['isSendFriend', 'formRequirement.hasForm', 'gbExtra.kind', 'isVirtualPay'];

function runCase(src) {
  const nodes = topLevelNodes(templateOf(src));
  const out = [];

  /* ① 每块自带前导条：条件里提到上述键的块（tz-box / 表单需求卡），前一枚节点必须是**同条件**的间隔条。
        共享条（条件与块不同，通常是无条件那条）会在这里报红；块不渲染时那条也不会自己露出来。 */
  const orphans = [];
  nodes.forEach((n, i) => {
    const isInfoBlock = (n.tag === 'tz-box' || /form-requirement-card/.test(n.tag))
      && BLOCK_KEYS.some((k) => n.cond.indexOf(k) >= 0);
    if (!isInfoBlock) { return; }
    const prev = nodes[i - 1];
    if (!prev || prev.tag !== 'tz-divider' || prev.cond !== n.cond) {
      orphans.push((prev ? prev.tag + '(' + prev.cond + ')' : '开头') + ' -> ' + n.tag + '(' + n.cond + ')');
    }
  });
  out.push({
    id: '① 信息块自带前导间隔条（条与块同条件：块不渲染时条一起消失，不许在块外摆共享条）',
    pass: orphans.length === 0,
    note: orphans.join(' | ') || '五块各有一条同条件前导条',
  });

  /* ② 组合模拟：全部口径组合下，可见序列里都不许出现两枚相邻的 `tz-divider` */
  const flagNames = ['loading', 'isSendFriend', 'isGroupBuy', 'isVirtualPay', 'needShipping'];
  const extraFlags = [['formRequirement.hasForm', [false, true]], ['gbExtra.kind', ['', 'activity', 'school']]];
  const dups = [];
  const variants = [];
  extraFlags[0][1].forEach((form) => extraFlags[1][1].forEach((extra) => variants.push([form, extra])));
  variants.forEach(([form, extra]) => {
    for (let mask = 0; mask < (1 << flagNames.length); mask++) {
      const scope = {};
      flagNames.forEach((f, i) => { scope[f] = !!(mask & (1 << i)); });
      scope.formRequirement = { hasForm: form };
      // 2026-10-31 起拼团额外信息块只认 `kind === 'activity'`（教务套餐那一档整块不渲染），
      // 组合模拟按真实取值跑：'' / 'activity' / 'school' 三档都要过
      scope.gbExtra = { kind: extra };
      const visible = nodes.filter((n) => evalIn(n.cond || 'true', scope));
      for (let i = 1; i < visible.length; i++) {
        if (visible[i].tag === 'tz-divider' && visible[i - 1].tag === 'tz-divider') {
          dups.push(flagNames.map((f) => f + '=' + scope[f]).join(',')
            + ',form=' + form + ',extra=' + extra);
          break;
        }
      }
    }
  });
  out.push({
    id: '② 任意口径组合下都没有两枚相邻的 tz-divider（最多一条）',
    pass: dups.length === 0,
    note: dups.length ? dups.slice(0, 3).join(' | ') + (dups.length > 3 ? ' …共 ' + dups.length + ' 组' : '') : '组合全部合规',
  });

  return out;
}

const SRC = read(ORDER_VUE);

if (process.argv.indexOf('--selftest') > -1) {
  let red = 0;
  const expectRed = (name, code, idPrefix) => {
    const res = runCase(code);
    const hit = res.filter((r) => !r.pass && r.id.indexOf(idPrefix) === 0);
    if (hit.length) { red++; console.log('[RED] ' + name + ' → ' + idPrefix + ' | ' + hit[0].note); }
    else { console.log('[GREEN] ' + name + ' 没让 ' + idPrefix + ' 变红 -> ' + res.map((r) => r.id.slice(0, 1) + '=' + r.pass).join(',')); }
  };
  // 坏样件 1：块外再摆一条无条件共享条（= 用户 2026-10-30 报的那一版：表单段前那条无条件的前导条）——
  // 表单段自己有前导条，所以第①条结构判据看不出来；叠条发生在拼团块那一档，由组合模拟抓
  expectRed('坏样件 1：表单需求块外摆一条无条件共享条（与拼团块那条叠在一起）',
    SRC.replace('        <template v-if="formRequirement.hasForm">',
      '        <tz-divider bgColor="#fafafa" />\n        <template v-if="formRequirement.hasForm">'), '②');
  // 坏样件 2：拼团块多一条（两条无条件条背靠背）
  expectRed('坏样件 2：拼团额外信息块前多摆一条间隔条（两条背靠背）',
    SRC.replace('<tz-divider v-if="isGroupBuy" bgColor="#fafafa" />',
      '<tz-divider v-if="isGroupBuy" bgColor="#fafafa" />\n        <tz-divider v-if="isGroupBuy" bgColor="#fafafa" />'), '②');
  // 坏样件 3：拼团额外信息块的前导条被摘掉（两块白卡直接贴死，成对结构被破坏）
  // 2026-10-31 起该块条件是 `gbExtra.kind === 'activity'`（教务套餐那一档不再渲染本块）
  expectRed('坏样件 3：拼团额外信息块的前导条被摘掉（白卡贴白卡）',
    SRC.replace(/(<template v-if="isGroupBuy && gbExtra\.kind === 'activity'">)\s*<tz-divider bgColor="#fafafa" \/>/, '$1'), '①');
  // 坏样件 4：券段前导条条件写歪（与块不同条件 ⇒ 券段在、条不在 / 条在、券段不在）
  expectRed('坏样件 4：券段前导条条件写歪（`!isVirtualPay` 被写成 `isVirtualPay`）',
    SRC.replace('<template v-if="!isVirtualPay">\n        <tz-divider bgColor="#fafafa" />',
      '<template v-if="!isVirtualPay">\n        <tz-divider v-if="isVirtualPay" bgColor="#fafafa" />'), '①');
  console.log('\n能红 ' + red + ' / 4');
  process.exit(red === 4 ? 0 : 1);
  return;
}

console.log('=== check-order-submit-dividers（块间间隔条：最多一条相邻）===');
const results = runCase(SRC);
results.forEach((r) => ok(r.id, r.pass, r.note));
console.log('\n共 ' + results.length + ' 条，失败 ' + fail + ' 条');
process.exitCode = fail ? 1 : 0;
