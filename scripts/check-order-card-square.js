/**
 * 订单列表 / 订单详情的「卡级直角」（2026-10-28 用户点名）
 *
 * 用户原话：给的是两页路由「/pages/order/list/list → pages/order/detail/detail?order_no=…」，
 * 要的是「去掉 box 圆角」。
 *
 * 为什么单独落一条门禁：
 *  - `ui-audit --pattern card-rounded-shadow` 的判据是「单值圆角 ≥12px 与卡片投影」，
 *    这两页的卡级圆角正好是 **10px**，落在阈值下面 ⇒ 全站门禁一直报 PASS，
 *    而 M21 明写「页面里不给卡片写圆角与投影」。这一族没有机器化验法时，静默偏离就是常态
 *    （`.trae/rules/frame.md` 硬约束 26）。
 *  - 这一类很容易被下一次改版顺手带回来（`tz-box` 自带 `round` prop，一行 `round` 就恢复 10px）。
 *
 * 合同四条（都只认「卡片那一层」，不碰小元素）：
 *  ① 列表订单卡 `components/order/order.vue` 的 tz-box 开标签不写 `border-radius`；
 *  ② 列表骨架卡 `.ols-sk-card` 无圆角（M16：骨架与真实卡逐块同几何，四角不能跳形）；
 *  ③ 详情页**所有** `tz-box` 都不传 `round`（注释里的旧代码不计）；
 *  ④ 详情骨架卡 `.detail-sk-card` 无圆角（同 ②）。
 *
 * 小元素仍按 M21 保留圆角（状态标签 / 筛选 chip / 按钮 4px、封面 6–8px、弹层顶部 10–12px），
 * 本脚本不查它们 —— 只钉「整张卡的外壳」。
 *
 * 用法：node tuzi-mobile/scripts/check-order-card-square.js
 *       node tuzi-mobile/scripts/check-order-card-square.js --selftest   （四颗坏样件必须全红）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const M = path.join(ROOT, 'tuzi-mobile/src');
const FILES = {
  order: path.join(M, 'components/order/order.vue'),
  listCss: path.join(M, 'pages/order/list/css.css'),
  detail: path.join(M, 'pages/order/detail/detail.vue'),
  detailCss: path.join(M, 'pages/order/detail/css.css'),
};

const stripHtmlComments = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ');
const stripCssComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ');

/** 取 `sel { ... }` 这一条规则的声明块（按花括号配平，取第一条命中） */
function ruleBlock(css, sel) {
  const at = css.indexOf(sel);
  if (at < 0) return '';
  const open = css.indexOf('{', at + sel.length);
  if (open < 0) return '';
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (!depth) return css.slice(open + 1, i);
    }
  }
  return '';
}

function readSources() {
  const src = {};
  for (const k of Object.keys(FILES)) src[k] = fs.readFileSync(FILES[k], 'utf8');
  return src;
}

function check(src) {
  const pass = [];
  const fail = [];
  const ok = (name, cond, got) => {
    if (cond) pass.push(name);
    else fail.push(name + (got === undefined ? '' : ' -> ' + got));
  };

  /* ① 列表订单卡：tz-box 开标签不写圆角 */
  const orderTpl = stripHtmlComments(src.order);
  const orderBoxTag = (orderTpl.match(/<tz-box[^>]*>/) || [''])[0];
  ok('① 列表订单卡 tz-box 开标签不写 border-radius（卡级直角）',
    orderBoxTag !== '' && !/border-radius/i.test(orderBoxTag),
    orderBoxTag);

  /* ② 列表骨架卡无圆角 */
  const listSk = ruleBlock(stripCssComments(src.listCss), '.ols-sk-card');
  ok('② 列表骨架卡 .ols-sk-card 无 border-radius（骨架与真实卡同几何，M16）',
    listSk !== '' && !/border-radius/i.test(listSk),
    listSk.replace(/\s+/g, ' ').trim());

  /* ③ 详情页所有 tz-box 不传 round */
  const detailTpl = stripHtmlComments(src.detail);
  const detailBoxes = detailTpl.match(/<tz-box[^>]*>/g) || [];
  const rounded = detailBoxes.filter((t) => /\bround\b/.test(t));
  ok('③ 详情页所有 tz-box 都不传 round（注释里的旧代码不计）',
    detailBoxes.length > 0 && rounded.length === 0,
    'tz-box=' + detailBoxes.length + ' 带圆角=' + rounded.length + (rounded.length ? ' ' + rounded.join(' | ') : ''));

  /* ④ 详情骨架卡无圆角 */
  const detailSk = ruleBlock(stripCssComments(src.detailCss), '.detail-sk-card');
  ok('④ 详情骨架卡 .detail-sk-card 无 border-radius（同 ②）',
    detailSk !== '' && !/border-radius/i.test(detailSk),
    detailSk.replace(/\s+/g, ' ').trim());

  return { pass, fail };
}

function report({ pass, fail }) {
  pass.forEach((n) => console.log('[PASS] ' + n));
  fail.forEach((n) => console.log('[FAIL] ' + n));
  console.log('\n结果：' + (fail.length ? '有 ' + fail.length + ' 项不符合预期' : '全部符合预期')
    + '（通过 ' + pass.length + ' 项 / 违反 ' + fail.length + ' 项）');
}

if (process.argv.includes('--selftest')) {
  // 四颗坏样件：把被点名的形态逐个改回「圆角」，合同必须各自报红
  const src = readSources();
  const bad = {
    order: src.order.replace('<tz-box padding="10px 10px">', '<tz-box padding="10px 10px" style="border-radius: 10px;">'),
    listCss: src.listCss.replace('.ols-sk-card {', '.ols-sk-card {\n    border-radius: 10px;'),
    detail: src.detail.replace('<tz-box :marginTop="10">', '<tz-box :marginTop="10" round>'),
    detailCss: src.detailCss.replace('.detail-sk-card {', '.detail-sk-card {\n    border-radius: 10px;'),
  };
  ['order', 'listCss', 'detail', 'detailCss'].forEach((k) => {
    if (bad[k] === src[k]) {
      console.log('[FAIL] 坏样件没能造出来（' + k + ' 的锚点文本变了，请同步本脚本）');
      process.exit(1);
    }
  });
  const res = check(bad);
  report(res);
  console.log(res.fail.length === 4
    ? '\nSELFTEST PASS：四颗坏样件全部报红'
    : '\nSELFTEST FAIL：期望 4 项报红，实得 ' + res.fail.length);
  process.exit(res.fail.length === 4 ? 0 : 1);
}

const res = check(readSources());
report(res);
process.exit(res.fail.length ? 1 : 0);
