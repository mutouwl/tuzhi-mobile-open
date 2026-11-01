/**
 * 「购买课程前表单」下单页状态闸门 —— 不构建、不开浏览器
 *
 * 为什么单拉一个脚本（2026-10-16 用户点名）：
 *   「购买前需提交表单，那么提交之后返回这个页面，还是显示需要再提交表单，并没有刷新已提交状态。」
 *   现场数据（线上库）：课程/专栏 1536 绑了**三张** before_buy 表单（60/61/62，其中 61/62 同名），
 *   三张必须全填（`checkBeforeBuy` / `OrderCreate::calcCheck` / `Pay::handle` 三处同口径）；
 *   报障账号只填了 60、61 ⇒ `all_submitted=false`。而卡片只有「已填写/请先填写」两档汇总文案，
 *   **填完一张返回后整行一字不变** ⇒ 用户读作「没刷新」。刷新链路本身是好的（第二次点卡片进的是
 *   61 而不是重复 60，说明列表已重取）。
 *
 * 这条判据 `sfc-check`（只编译模板）、`ui-audit`（只查版式）、后端 curl（只验接口出口）三条都看不见，
 * 它是**跨文件接线 + 状态可见性**：宿主页 onShow 转发只覆盖提交订单页那一档，直播间下单弹窗
 * （同一组件的另一个宿主）没有这一路；且「表单页 $emit 的名字」与「组件 $on 的名字」两侧源码看着
 * 对称、名字不一致就永远收不到（硬约束 27③ 那一族）。
 *
 * 本脚本做四件事：
 *  A. 多张表单时**逐张列出**（表单名 + 已填写/待填写），填完一张返回后该行必须翻档（状态可见）；
 *  B. 刷新有**两路信号**（宿主页 onShow 转发 + 表单页提交后广播），且都走带 1s 去重的 refreshFormRequirement；
 *  C. 注销**按 handler**（不带 handler 的 $off 会把另一个宿主的监听一起摘掉）；
 *  D. **跨文件接线逐跳核**：表单页 `$emit('orderFormSubmitted')` ↔ 组件 `$on('orderFormSubmitted')`
 *     名字逐字相同，且 emit 落在 `from === 'order'` 分支里、排在 `navigateBack` 之前。
 *
 * 用法：node tuzi-mobile/scripts/check-order-form-requirement.js            # 验真件（[FAIL] 须为 0）
 *       node tuzi-mobile/scripts/check-order-form-requirement.js --selftest # 验这道门禁「能红」
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ORDER = path.join(ROOT, 'src/components/order/submit-order.vue');
const FORM = path.join(ROOT, 'src/pages/app/form/submit/js.vue');

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
  if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  return !!ok;
}
/** 注释不是界面/不是接线：判「有没有这一块」之前先剥干净（本脚本自己的头注释里就有反面教材） */
const stripComments = (s) => s
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

/** 逐条判据（源码字符串进、结论出）——selftest 拿同一批函数跑改造前的形状，必须报红 */
function checks(orderSrc, formSrc) {
  const order = stripComments(orderSrc);
  const form = stripComments(formSrc);
  const out = {};

  // A. 多张表单逐张列出 + 每行状态随 is_submitted 翻档
  out.rowList = /<view class="form-requirement-item"[\s\S]{0,400}?v-for=/.test(order);
  out.rowStatus = /item\.is_submitted\s*\?\s*'已填写'\s*:\s*'待填写'/.test(order);
  out.multiGate = /formRequirement\.forms\.length\s*>\s*1/.test(order);
  // 汇总行仍保留（点它填第一张未提交的）
  out.headerRow = /class="form-requirement-content"\s*@click="goFillForm\(\)"/.test(order);

  // B. 行点击带参（点哪一行填哪一张）
  out.goFillFormArg = /goFillForm\s*\(\s*form\s*\)/.test(order) && /form\s*&&\s*form\.form_id/.test(order);
  out.rowTapPassesItem = /@click="goFillForm\(item\)"/.test(order);

  // C. 两路刷新信号 + 去重
  out.listenHostShow = /uni\.\$on\(\s*'orderFormPageShow'/.test(order);
  out.listenSubmitted = /uni\.\$on\(\s*'orderFormSubmitted'/.test(order);
  out.refreshCalls = (order.match(/refreshFormRequirement\(\)/g) || []).length >= 2;
  out.dedupe = /refreshFormRequirement\s*\(\s*\)\s*\{[\s\S]{0,400}?_formCheckedAt/.test(order);

  // D. 注销按 handler（裸 $off(事件名) 会连另一个宿主的监听一起摘掉）
  out.offHostShow = /uni\.\$off\(\s*'orderFormPageShow'\s*,/.test(order);
  out.offSubmitted = /uni\.\$off\(\s*'orderFormSubmitted'\s*,/.test(order);
  out.noBareOff = !/uni\.\$off\(\s*'(?:orderFormPageShow|orderFormSubmitted)'\s*\)/.test(order);

  // E. 表单页那一侧：emit 落在 from==='order' 分支、排在 navigateBack 之前
  const emitAt = form.indexOf("uni.$emit('orderFormSubmitted'");
  const branchAt = form.indexOf("from === 'order'");
  const backAt = form.indexOf('uni.navigateBack()', emitAt < 0 ? 0 : emitAt);
  out.formEmits = emitAt >= 0;
  out.emitInBranch = emitAt >= 0 && branchAt >= 0 && branchAt < emitAt;
  out.emitBeforeBack = emitAt >= 0 && backAt > emitAt;

  // F. 跨文件接线：两侧事件名逐字相同（硬约束 27③ 的机器化验法）
  const emitted = (form.match(/uni\.\$emit\(\s*'([^']+)'/) || [])[1] || '';
  const listened = (order.match(/uni\.\$on\(\s*'orderFormSubmitted'/) || [])[0] ? 'orderFormSubmitted' : '';
  out.wireName = emitted === 'orderFormSubmitted' && listened === 'orderFormSubmitted';

  return out;
}

function run(orderSrc, formSrc, tag) {
  const r = checks(orderSrc, formSrc);
  const pairs = [
    ['多张表单逐张列出（form-requirement-item + v-for）', r.rowList],
    ['每行状态随 is_submitted 翻档（已填写/待填写）', r.rowStatus],
    ['只在多张表单时才铺行（forms.length > 1）', r.multiGate],
    ['汇总行保留（点击填第一张未提交的）', r.headerRow],
    ['goFillForm 收表单参数并优先用它', r.goFillFormArg],
    ['行点击把该行表单传进去（goFillForm(item)）', r.rowTapPassesItem],
    ['监听宿主页 onShow 转发（orderFormPageShow）', r.listenHostShow],
    ['监听表单页提交广播（orderFormSubmitted）', r.listenSubmitted],
    ['两路信号都走 refreshFormRequirement', r.refreshCalls],
    ['刷新带 1s 去重（_formCheckedAt）', r.dedupe],
    ['注销 orderFormPageShow 按 handler', r.offHostShow],
    ['注销 orderFormSubmitted 按 handler', r.offSubmitted],
    ['不许出现裸 $off(事件名)', r.noBareOff],
    ['表单页 emit orderFormSubmitted', r.formEmits],
    ['emit 落在 from === \'order\' 分支里', r.emitInBranch],
    ['emit 排在 navigateBack 之前', r.emitBeforeBack],
    ['跨文件接线：emit 名 === 组件监听名', r.wireName],
  ];
  pairs.forEach(([name, ok]) => assert(tag + name, ok));
  return pairs.filter(([, ok]) => !ok).length;
}

if (process.argv.includes('--selftest')) {
  console.log('=== selftest：改造前的形状必须报红（门禁不能恒真） ===');
  const order = fs.readFileSync(ORDER, 'utf8');
  const form = fs.readFileSync(FORM, 'utf8');

  // ① 拆掉「逐张列出」那一块（回到只有汇总行：填完一张看不出变化）
  const noRows = order.replace(
    /<template v-if="formRequirement\.forms\.length > 1">[\s\S]*?<\/template>\s*<\/view>/,
    '</view>'
  );
  const bad1 = run(noRows, form, '[① 只有汇总行] ');
  assert('① 该红：只有汇总行时判据报红', bad1 > 0, bad1 + ' 条红');

  // ② 拆掉表单页的提交广播（宿主页 onShow 转发覆盖不到直播间弹窗那一档）
  const noEmit = form.replace(/uni\.\$emit\('orderFormSubmitted'[\s\S]*?\}\);/, '');
  const bad2 = run(order, noEmit, '[② 表单页不广播] ');
  assert('② 该红：表单页不广播时判据报红', bad2 > 0, bad2 + ' 条红');

  // ③ 广播事件名写错一个字（两侧看着对称、实跑永远收不到）
  const typo = form.replace("uni.$emit('orderFormSubmitted'", "uni.$emit('orderFormSubmited'");
  const bad3 = run(order, typo, '[③ 事件名拼错] ');
  assert('③ 该红：事件名拼错时判据报红', bad3 > 0, bad3 + ' 条红');

  // ④ 注销退回裸 $off（另一个宿主的监听会被一起摘掉）
  const bareOff = order.replace("uni.$off('orderFormSubmitted', this.onFormSubmitted);", "uni.$off('orderFormSubmitted');");
  const bad4 = run(bareOff, form, '[④ 裸 $off] ');
  assert('④ 该红：裸 $off 时判据报红', bad4 > 0, bad4 + ' 条红');

  console.log('\nselftest 汇总: 四档改造前形状各自报红 = ' + [bad1, bad2, bad3, bad4].map((n) => n > 0).join(', '));
  process.exit(bad1 > 0 && bad2 > 0 && bad3 > 0 && bad4 > 0 ? 0 : 1);
}

console.log('=== 验真件 ===');
run(fs.readFileSync(ORDER, 'utf8'), fs.readFileSync(FORM, 'utf8'), '');
console.log('\n' + pass + '/' + (pass + fail) + ' PASS' + (fail ? '（[FAIL]=' + fail + '）' : ''));
process.exit(fail ? 1 : 0);
