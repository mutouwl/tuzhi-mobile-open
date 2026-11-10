#!/usr/bin/env node
/**
 * 积分兑换模式下「规格弹层 / 票券行」画的是积分而不是现金价（2026-11-08 用户点名）
 *
 * 用户原话（教务套餐商详 `/pages/app/school/package/detail/detail?id=951&score_goods_id=565`）：
 * 「多规格商品，如果是属于积分商品兑换的话，那么点击立即兑换，弹出来的多规格选择弹窗，
 *   上面的这个价格呀，应该显示为积分。」
 *
 * 为什么必须单独一只脚本（硬约束 26/27③）：这一族的每一跳都跨组件边界 ——
 * 宿主页 `isScoreExchange` / `scoreExchangeScore`（mixin computed）→ 规格弹层的 `score-mode` /
 * `score-value` 入参 → 弹层自己的价格 computed → 外壳 `tz-spec-popup-shell` 的 `is-virtual-pay` 分支
 * （那一支才决定挂不挂 ¥）。`sfc-check` 只编译模板、`ui-audit` 只按正则查版式，**没有一跳看得见**：
 * 「宿主没传参」= 弹层照常渲染现金价，编译零 error、门禁全绿，用户读到的就是「弹窗上还是 ¥」。
 *
 * 钉的五件事：
 *   A. 六只规格弹层**全集普查**：凡出现 `<tz-spec-popup-shell` 的文件都要登记在本脚本 `PANELS` 里
 *      （硬约束 38：覆盖 = 枚举全集跑差集，新写一只弹层不登记当场报红）。
 *   B. 画价格的那几只必须声明 `scoreMode` + `scoreValue` 两枚入参。
 *   C. 弹层的价格 computed 必须按 `scoreMode` 把三枚外壳入参一起切：价格 → 积分、单位 → 「积分」、
 *      虚拟支付档 → 打开（不打开外壳就仍走「¥ + 数值」那一支）。
 *   D. 宿主页调用点必须真把页面那两枚传下去 —— 只声明不入参 = 弹层永远走现金价。
 *   E. 票券行 / 报名信息页行金额在兑换模式下也走积分（同一件事的「列表版」）。
 *   F. 共用组件（`tz-course-mini` / `order` / `course`）必须有 `score_mode` 这一支，
 *      且调用点真把它传下去（共用组件默认不传 ⇒ 其余调用点逐字不变）。
 *   G. 中间页 / 订单页自己的价格格（商品小记、合计、日均价）必须按兑换模式分档，
 *      不许出现「兑换单还画 ¥0.00 / 约¥x/天」。
 *
 * 2026-11-09 第二轮扩面（用户原话）：「如果说是通过积分兑换的，那么这里的票券列表呀，也应该显示
 * 对应的积分价格。另外你像其他的多规格商品，有中间页的，就是购买时候需要选择规格，或者说提交
 * 信息的，涉及到价格显示也应该调整为积分的形式。」⇒ 覆盖从「商详的规格弹层」扩到**整条购买链上
 * 每一个画价的落点**：选票页 / 报名信息页（列表与合计）、提交订单页（商品小记与商品卡）、
 * 订单详情与订单列表（合计与商品卡）、会员卡规格卡（现金日均价）。
 *
 * 跑法：node tuzi-mobile/scripts/check-score-spec-price.js
 *      node tuzi-mobile/scripts/check-score-spec-price.js --selftest   # 每类坏样件必须各红一次
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/** 规格弹层登记表：price = 这只弹层画不画商品价；style = 头部实现形态
 *  · `shell`  = 接共用外壳 `tz-spec-popup-shell`（实物 / 组合 / 圈子）：外壳只在「非虚拟支付」那一支挂 ¥
 *  · `inline` = 自带头部（教务套餐是定高 80vh 的另一档，见外壳文件头那条说明）：¥ 由模板自己挂
 */
const PANELS = [
  { file: 'src/pages/app/physical/components/sku-select-modal.vue', price: true, style: 'shell', host: 'src/pages/app/physical/detail/detail.vue' },
  { file: 'src/pages/app/composite/components/spec-select-modal.vue', price: true, style: 'shell', host: 'src/pages/app/composite/detail/detail.vue' },
  { file: 'src/components/tz/circle-spec-popup.vue', price: true, style: 'shell', host: 'src/pages/app/circle/presale/presale.vue' },
  { file: 'src/pages/app/school/package/components/package-sku-select-modal.vue', price: true, style: 'inline', host: 'src/pages/app/school/package/detail/detail.vue' },
  // 下面两只不摆商品价（拼团档位只画活动价、阶梯档只画人数档），登记在册只为全集普查
  { file: 'src/components/tz/group-buy-config-popup.vue', price: false },
  { file: 'src/components/tz/gb-ladder-picker.vue', price: false },
];

/** 兑换模式下不许再出现现金价的列表/汇总行（规格弹窗之外的「同一件事」） */
const SCORE_ROWS = [
  { file: 'src/pages/app/activity/ticket/ticket.vue', what: '票券行单价' },
  { file: 'src/pages/app/activity/form/form.vue', what: '报名信息页行金额' },
];

/**
 * 共用组件 + 调用点（F 组，2026-11-09）
 *
 * 这三只组件被全站几十处调用，**只有调用点才知道这一单是兑换单** ⇒ 组件必须有积分这一支
 * （缺省 false 时逐字不变），调用点必须真把它传下去。只加组件不接调用点 =
 * 兑换单的商品卡还是现金价，编译与其余门禁全绿。
 *
 * 两档形态（别混）：
 *  · `field`：组件吃 `list`，一枚标记跟着**每一行**走（`tz-course-mini` 的 `item.score_mode`）——
 *    调用点那一侧是「映射行字段」，不是属性绑定；
 *  · `prop`：组件自己就是一张卡（`order` / `course`），调用点用 `:score-mode="..."` 传。
 */
const SCORE_SHARED = [
  {
    component: 'src/components/tz/course-mini.vue',
    kind: 'field',
    field: 'score_mode',
    calls: [{ file: 'src/components/order/submit-order.vue', what: '提交订单页商品卡', tag: 'tz-course-mini' }],
  },
  {
    component: 'src/components/order/order.vue',
    kind: 'prop',
    prop: 'score-mode',
    calls: [{ file: 'src/pages/order/list/list.vue', what: '订单列表合计', tag: 'order' }],
  },
  {
    component: 'src/components/order/course.vue',
    kind: 'prop',
    prop: 'score-mode',
    calls: [
      { file: 'src/pages/order/detail/detail.vue', what: '订单详情商品行', tag: 'course' },
      { file: 'src/pages/order/list/list.vue', what: '订单列表商品行', tag: 'course' },
    ],
  },
];

/**
 * 中间页 / 订单页自己的价格格（G 组，2026-11-09）
 *
 * 三种形状，判据各写各的（拿一条通用正则套三种会把「这一页有没有画积分」误当成「这一处改没改」）：
 *  · `amount-branch`：金额来自订单行/订单的 `score_amount`（兑换单现金价恒 0），
 *    要求 `v-if="...score_amount..."` 那一支里带「积分」；
 *  · `mode-branch`：页面自己有 `isScoreExchange`，价格格要按它分档且分支里带「积分」；
 *  · `cash-average-gated`：现金日均价（`formatAveragePrice`，`约¥x/天`）必须在兑换模式整行收起
 *    —— 兑换价不随天数档变，摆一行「约¥0.33/天」会被读成「还要再付现金」。
 */
const SCORE_GATES = [
  {
    file: 'src/components/order/submit-order.vue',
    what: '提交订单页「商品小记」',
    kind: 'mode-branch',
    judge: 'isScoreExchange',
    // 这一格的形状：`商品小记` 那个 total-box 里先出兑换分支
    shape: /class="total-box"[\s\S]{0,400}?v-if="isScoreExchange"/,
  },
  {
    file: 'src/pages/order/detail/detail.vue',
    what: '订单详情「合计」',
    kind: 'amount-branch',
    judge: 'data.score_amount',
    // 这一格的形状：合计那一枚 `.price` 自带 `v-if="data.score_amount"`
    // （只判「模板里有 score_amount」会被下方「消耗积分」那一行骗过去）
    shape: /class="price"\s+v-if="data\.score_amount"/,
  },
  {
    file: 'src/pages/app/vip/center/center.vue',
    what: '会员卡规格卡日均价',
    kind: 'cash-average-gated',
    judge: 'isScoreExchange',
  },
];

const abs = (rel) => path.join(ROOT, rel);
const read = (rel) => (fs.existsSync(abs(rel)) ? fs.readFileSync(abs(rel), 'utf8') : '');

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) { walk(p, out); } else if (/\.vue$/.test(p)) { out.push(p); }
  }
  return out;
}

const tplOf = (src) => (src.match(/<template>[\s\S]*<\/template>/) || [''])[0];
const stripHtmlComments = (src) => src.replace(/<!--[\s\S]*?-->/g, '');

/* ---------------------------------------------------------------- 判据（纯函数，自检复用） */

/** A. 全集普查：给定「相对路径 → 源码」表，返回未登记的带外壳文件 */
function censusMisses(sources) {
  const registered = new Set(PANELS.map((p) => p.file));
  return Object.keys(sources)
    .filter((rel) => rel !== 'src/components/tz/spec-popup-shell.vue')
    .filter((rel) => /<tz-spec-popup-shell\b/.test(sources[rel]))
    .filter((rel) => !registered.has(rel));
}

/** B+C. 弹层源码：两枚入参 + 价格/单位按 scoreMode 切（两种头部形态各一套判据） */
function panelIssues(src, style) {
  const issues = [];
  if (!/scoreMode\s*:\s*\{/.test(src)) { issues.push('没有声明 scoreMode 入参'); }
  if (!/scoreValue\s*:\s*\{/.test(src)) { issues.push('没有声明 scoreValue 入参'); }

  if (style === 'inline') {
    // 自带头部（教务套餐）：¥ 与单位都由模板自己挂 ⇒ 判「符号按 !scoreMode 收掉 + 数值换成积分 + 积分单位在」
    const tpl = stripHtmlComments(tplOf(src));
    if (!/'积分'/.test(src) && !/>积分</.test(tpl)) { issues.push('没有把单位切成「积分」'); }
    if (!/v-if="!scoreMode">¥/.test(tpl)) { issues.push('模板的 ¥ 符号没有按 !scoreMode 收掉'); }
    if (!/scoreMode\s*\?/.test(tpl)) { issues.push('模板数值没有按 scoreMode 换成积分'); }
    return issues;
  }

  // 共用外壳：单位由外壳按 `coinName` 画 ⇒ 这里必须把币名切到「积分」
  if (!/'积分'/.test(src)) { issues.push('没有把单位切成「积分」'); }
  if (!/this\.scoreMode\s*\?/.test(src)) { issues.push('价格 computed 没有按 this.scoreMode 切'); }
  // 外壳只在「非虚拟支付」那一支挂 ¥ ⇒ 兑换模式必须把虚拟支付档打开
  if (!/scoreMode\s*\?\s*true\s*:\s*this\.isVirtualPay/.test(src)) {
    issues.push('虚拟支付档没有按 scoreMode 打开（外壳仍会挂 ¥）');
  }
  return issues;
}

/** D. 宿主调用点：两枚入参都真的传了 */
function hostIssues(hostSrc) {
  const issues = [];
  if (!/:score-mode="isScoreExchange"/.test(hostSrc)) { issues.push('调用点没传 :score-mode="isScoreExchange"'); }
  if (!/:score-value="scoreExchangeScore"/.test(hostSrc)) { issues.push('调用点没传 :score-value="scoreExchangeScore"'); }
  return issues;
}

/** E. 列表/汇总行：兑换分支存在、自带「积分」、且排在虚拟支付/现金分支之前 */
function rowIssues(src) {
  const tpl = stripHtmlComments(tplOf(src));
  const issues = [];
  if (!/isScoreExchange/.test(tpl)) { issues.push('模板没有 isScoreExchange 分支'); }
  const branch = (tpl.split('isScoreExchange')[1] || '').slice(0, 400);
  if (!/积分/.test(branch)) { issues.push('兑换分支里没有「积分」单位'); }
  const atScore = tpl.indexOf('isScoreExchange');
  const atVirtual = tpl.indexOf('isVirtualPay');
  if (atScore >= 0 && atVirtual >= 0 && atScore > atVirtual) {
    issues.push('兑换分支排在虚拟支付之后，永远走不到');
  }
  return issues;
}

/**
 * F①. 共用组件必须有积分这一支，并在价格块里按它分档
 *
 * 判据落在**模板的价格块**上（不是文件里出现过标记就算）：组件三只的价格块各不同，
 * 但都必须「积分档先出、现金档其次」。只声明 prop 不画 = 调用点传了也没用。
 */
function sharedComponentIssues(src, entry) {
  const issues = [];
  const tpl = stripHtmlComments(tplOf(src));
  if (entry.kind === 'field') {
    // 行字段档：组件吃 `list`，模板读 `item.score_mode`（行字段保持 snake_case，不转 camel）
    if (!new RegExp('v-if="item\\.' + entry.field + '"').test(tpl)) {
      issues.push('模板没有按 item.' + entry.field + ' 分出积分那一支');
    }
    if (!/积分/.test(tpl)) { issues.push('模板里没有「积分」单位'); }
    return issues;
  }
  // prop 档：组件自己是一张卡（`order` / `course`），模板读裸 `scoreMode`
  const camel = entry.prop.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
  if (!new RegExp(camel + '\\s*:\\s*\\{').test(src)) { issues.push('没有声明 ' + camel + ' 入参'); }
  if (!new RegExp('v-if="' + camel + '"').test(tpl)) {
    issues.push('模板没有按 ' + camel + ' 分出积分那一支');
  }
  if (!/积分/.test(tpl)) { issues.push('模板里没有「积分」单位'); }
  const atScore = tpl.indexOf(camel);
  const atCash = Math.max(tpl.indexOf('¥'), tpl.indexOf('金币'));
  if (atScore >= 0 && atCash >= 0 && atScore > atCash) {
    issues.push('积分分支排在现金价之后，永远走不到');
  }
  return issues;
}

/**
 * F②. 调用点必须真把这一枚传下去
 *
 * **按标签切块**再判（同一个文件里 `order` 与 `course` 各有一枚 `:score-mode`，
 * 整文件扫一次 `:` 就分不清是哪一个传了）：
 *  · `field` 档：调用点把标记映射进每一行（JS 里 `score_mode: ...`）；
 *  · `prop` 档：`<tag ... :score-mode="...">` 那一块里必须真出现这一枚绑定。
 */
function sharedCallIssues(src, entry, call) {
  const issues = [];
  if (entry.kind === 'field') {
    // 行字段档：调用点必须把这一枚映射进每一行（`score_mode: scoreMode ? 1 : 0`）
    if (!new RegExp(entry.field + '\\s*:').test(src)) {
      issues.push('调用点没有把 ' + entry.field + ' 映射进每一行');
    }
    return issues;
  }
  const tag = call && call.tag ? call.tag : '';
  const chunks = tag ? tagBlocks(src, tag) : [src];
  if (!chunks.length) {
    issues.push('没找到 <' + tag + '> 调用点');
    return issues;
  }
  const binding = ':' + entry.prop + '="';
  if (!chunks.some((chunk) => chunk.includes(binding))) {
    issues.push('<' + tag + '> 调用点没传 ' + binding.slice(0, -1));
  }
  return issues;
}

/**
 * 取某个自定义组件的每一段开标签（`<tag ...>` 到配对的 `>`）
 *
 * **不能拿 `[^>]*>` 切**：属性值里就有 `>`（`Number(item.score_amount) > 0` 这一档），
 * 正则会在表达式中间截断，于是「明明传了」被判成没传。按字符扫、跳过引号里的内容。
 */
function tagBlocks(src, tag) {
  const out = [];
  const needle = '<' + tag;
  let from = 0;
  while (true) {
    const start = src.indexOf(needle, from);
    if (start < 0) { break; }
    const after = src[start + needle.length];
    // 只认完整标签名（`<order` 不能吃掉 `<order-xxx`）
    if (after && /[A-Za-z0-9_-]/.test(after)) { from = start + needle.length; continue; }
    let i = start + needle.length;
    let quote = '';
    while (i < src.length) {
      const c = src[i];
      if (quote) { if (c === quote) { quote = ''; } } else if (c === '"' || c === "'") { quote = c; } else if (c === '>') { break; }
      i++;
    }
    out.push(src.slice(start, i + 1));
    from = i + 1;
  }
  return out;
}

/**
 * G. 中间页/订单页自己的价格格（三种形状各一套判据，见 SCORE_GATES 那段注释）
 */
function gateIssues(src, gate) {
  const tpl = stripHtmlComments(tplOf(src));
  const issues = [];
  const judge = gate.judge;

  if (gate.kind === 'cash-average-gated') {
    // 现金日均价那一行必须被兑换模式收掉：`v-if="!isScoreExchange"`（或等价取反）
    const hit = tpl.split('\n').filter((line) => line.includes('formatAveragePrice'));
    if (!hit.length) { issues.push('没找到现金日均价（formatAveragePrice）那一行'); }
    hit.forEach((line, i) => {
      // 日均价可能在 v-if 的上一行：取该行往上 3 行一起看
      const at = tpl.indexOf(line);
      const around = tpl.slice(Math.max(0, at - 300), at + 80);
      if (!new RegExp('v-if="!' + judge + '"').test(around)) {
        issues.push('现金日均价那一行没有按 !' + judge + ' 收起');
      }
    });
    return issues;
  }

  // 另外两种：兑换那一支必须存在、带「积分」，且排在**同一个价格块里**的现金分支之前
  // （整页扫第一个 `¥` 会撞上别的块 —— 订单详情上方还有子商品价、提交页上方还有商品卡，
  //  那样判「分支排在现金之后」是误报；取 judge 所在那个标签块当判据范围）
  if (!tpl.includes(judge)) { issues.push('模板没有 ' + judge + ' 分档'); return issues; }
  // `shape`：这一格自己的形状（「合计」那一枚 `.price` 必须自带 v-if）。
  // 少了它，判据只认「模板里有 score_amount」，会被同一页别的积分行（订单详情的「消耗积分」）
  // 骗过去 —— 把合计那一支删掉照样全绿。
  if (gate.shape && !gate.shape.test(tpl)) {
    issues.push('这一格没有按 ' + judge + ' 分出兑换档');
  }
  const at = tpl.indexOf(judge);
  // 往前找到包住它的那个开标签（`<div class="total-box">` 这一档），往后取 900 字符当这一块
  const open = tpl.lastIndexOf('<', at);
  const blockStart = tpl.lastIndexOf('>', open) + 1;
  const block = tpl.slice(Math.max(0, blockStart - 120), at + 900);
  if (!/积分/.test(block.slice(block.indexOf(judge), block.indexOf(judge) + 400))) {
    issues.push('兑换分支里没有「积分」单位');
  }
  const cashAt = block.search(/¥|金币/);
  if (cashAt >= 0 && cashAt < block.indexOf(judge)) {
    issues.push('兑换分支排在现金价之后，永远走不到');
  }
  return issues;
}

/* ---------------------------------------------------------------- 跑 */

function runAll() {
  const sources = {};
  for (const p of walk(path.join(ROOT, 'src'), [])) {
    sources[path.relative(ROOT, p).split(path.sep).join('/')] = fs.readFileSync(p, 'utf8');
  }

  const rows = [];
  const misses = censusMisses(sources);
  rows.push({ id: 'A 全集普查：带规格外壳的弹层都已登记', issues: misses.map((m) => '未登记 ' + m) });

  for (const panel of PANELS.filter((p) => p.price)) {
    rows.push({ id: 'B/C 弹层按 scoreMode 切价：' + panel.file, issues: panelIssues(sources[panel.file] || '', panel.style) });
    rows.push({ id: 'D 宿主调用点传参：' + panel.host, issues: hostIssues(sources[panel.host] || '') });
  }
  for (const row of SCORE_ROWS) {
    rows.push({ id: 'E ' + row.what + '：' + row.file, issues: rowIssues(sources[row.file] || '') });
  }
  for (const group of SCORE_SHARED) {
    rows.push({
      id: 'F① 共用组件分档：' + group.component,
      issues: sharedComponentIssues(sources[group.component] || '', group),
    });
    for (const call of group.calls) {
      rows.push({
        id: 'F② ' + call.what + '传参：' + call.file,
        issues: sharedCallIssues(sources[call.file] || '', group, call),
      });
    }
  }
  for (const gate of SCORE_GATES) {
    rows.push({ id: 'G ' + gate.what + '：' + gate.file, issues: gateIssues(sources[gate.file] || '', gate) });
  }
  return rows;
}

function report(rows, title) {
  let failed = 0;
  console.log('\n' + title);
  for (const r of rows) {
    if (!r.issues.length) { console.log('  [ok]   ' + r.id); }
    else { failed++; console.log('  [FAIL] ' + r.id + ' -> ' + r.issues.join('；')); }
  }
  return failed;
}

/* ---------------------------------------------------------------- 自检
 * 每类坏样件都必须真的让对应判据报红 —— 没亲眼见过红的门禁不算门禁。 */

function selftest() {
  const physical = read('src/pages/app/physical/components/sku-select-modal.vue');
  const physicalHost = read('src/pages/app/physical/detail/detail.vue');
  const pkg = read('src/pages/app/school/package/components/package-sku-select-modal.vue');
  const ticket = read('src/pages/app/activity/ticket/ticket.vue');

  const cases = [
    {
      name: '弹层删掉 scoreMode 入参（外壳档）',
      bad: panelIssues(physical.replace(/scoreMode\s*:\s*\{[\s\S]*?\},/, ''), 'shell').length > 0,
    },
    {
      name: '虚拟支付档回退成 isVirtualPay（外壳仍挂 ¥）',
      bad: panelIssues(physical.replace(/scoreMode\s*\?\s*true\s*:\s*this\.isVirtualPay/, 'this.isVirtualPay'), 'shell').length > 0,
    },
    {
      name: '教务套餐头部 ¥ 符号没按 scoreMode 收掉（inline 档）',
      bad: panelIssues(pkg.replace(/v-if="!scoreMode">¥/, '>¥'), 'inline').length > 0,
    },
    {
      name: '教务套餐数值没按 scoreMode 换积分（inline 档）',
      bad: panelIssues(pkg.replace(/\{\{\s*scoreMode\s*\?[\s\S]*?\}\}/, '{{ currentSku.price }}'), 'inline').length > 0,
    },
    {
      name: '宿主不传 :score-mode',
      bad: hostIssues(physicalHost.replace(/\s*:score-mode="isScoreExchange"/, '')).length > 0,
    },
    {
      name: '宿主不传 :score-value',
      bad: hostIssues(physicalHost.replace(/\s*:score-value="scoreExchangeScore"/, '')).length > 0,
    },
    {
      name: '票券行删掉兑换分支',
      bad: rowIssues(ticket.replace(/<template v-if="isScoreExchange">[\s\S]*?<\/template>/, '')).length > 0,
    },
    {
      name: '新弹层未登记',
      bad: censusMisses({ 'src/pages/app/demo/new-spec-popup.vue': '<template><tz-spec-popup-shell :show="show" /></template>' }).length > 0,
    },
    {
      name: '共用组件模板删掉积分那一支（course-mini）',
      bad: sharedComponentIssues(
        read('src/components/tz/course-mini.vue').replace(/<template v-if="item\.score_mode">[\s\S]*?<\/template>/, ''),
        SCORE_SHARED[0]
      ).length > 0,
    },
    {
      name: '共用组件模板删掉「积分」单位（course-mini）',
      bad: sharedComponentIssues(
        read('src/components/tz/course-mini.vue').replace(/<span class="coin-name">积分<\/span>/, ''),
        SCORE_SHARED[0]
      ).length > 0,
    },
    {
      name: '提交订单页商品卡不映射 score_mode',
      bad: sharedCallIssues(
        read('src/components/order/submit-order.vue').replace(/\s*score_mode: scoreMode \? 1 : 0,/, ''),
        SCORE_SHARED[0],
        SCORE_SHARED[0].calls[0]
      ).length > 0,
    },
    {
      name: '订单列表合计不传 :score-mode',
      bad: sharedCallIssues(
        read('src/pages/order/list/list.vue').replace(/\s*:score-mode="Number\(item\.score_amount\) > 0"/, ''),
        SCORE_SHARED[1],
        SCORE_SHARED[1].calls[0]
      ).length > 0,
    },
    {
      name: '订单详情合计删掉积分分支',
      bad: gateIssues(
        read('src/pages/order/detail/detail.vue').replace(/<span class="price" v-if="data\.score_amount">[\s\S]*?<\/span>/, ''),
        SCORE_GATES[1]
      ).length > 0,
    },
    {
      name: '会员卡规格卡不收起现金日均价',
      bad: gateIssues(
        read('src/pages/app/vip/center/center.vue').replace(/v-if="!isScoreExchange"/, ''),
        SCORE_GATES[2]
      ).length > 0,
    },
  ];

  let failed = 0;
  console.log('\n自检（每个坏样件都必须报红）');
  for (const c of cases) {
    if (c.bad) { console.log('  [ok]   ' + c.name + ' -> 判据红了'); }
    else { failed++; console.log('  [FAIL] ' + c.name + ' -> 判据没红（这类回归门禁看不见）'); }
  }
  return failed;
}

if (process.argv.includes('--selftest')) {
  const failed = selftest();
  console.log('\n自检结果：[FAIL]=' + failed);
  process.exit(failed ? 1 : 0);
}

const failed = report(runAll(), '积分兑换模式下的规格弹层/票券行价格');
console.log('\n[FAIL]=' + failed);
process.exit(failed ? 1 : 0);
