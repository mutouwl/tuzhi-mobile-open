#!/usr/bin/env node
/**
 * 下单页券类型 Tag（2026-10-30 用户点名「如果选择了优惠券，能不能在这个减多少钱左侧增加一个Tag
 * 显示当前优惠券的类型，比如满多少减多少、满多少打几折这种」）
 *
 * 这条链只有两半，任何一半掉了读出来都是「选了券但没有 Tag」或「Tag 文案与券对不上」：
 *   ① 后端核算回体带 `coupon_info.tag_text`（只有真的用上券时才给，文案由 `Coupon::tagText()` 一处出）；
 *   ② 端上把那一枚渲染在券值左侧，**不拿 `type` 自己拼「满X减Y」**（M22），
 *      拼团档不走 `order.calculate`，`calcGroupBuyAmount` 要单独把这一格写回 `data`。
 *
 * 用法：node scripts/check-coupon-type-tag.js [--selftest]
 *   --selftest：喂坏样件，六条核心断言必须各自报红（全绿说明门禁没长眼）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.resolve(ROOT, '..', 'tuzhi-selfbuilt-backend');
const ORDER = path.join(ROOT, 'src/components/order/submit-order.vue');
const COUPON = path.join(BACKEND, 'application/admin/model/app/coupon/Coupon.php');
const ORDER_CREATE = path.join(BACKEND, 'application/common/library/order/OrderCreate.php');
const TAG_TEST = path.join(BACKEND, 'application/test/controller/OrderCouponTagTest.php');

const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
/** 去掉注释：判据只看真代码（注释里写着「应该这样」不算实现） */
const strip = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/(^|\s)\/\/[^\n]*/g, '$1');

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
  if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  return !!ok;
}

function rules(src) {
  const order = strip(src.order);
  const tpl = (order.match(/<template>([\s\S]*)<\/template>/) || [])[1] || '';
  const coupon = strip(src.coupon);
  const orderCreate = strip(src.orderCreate);
  const tagTest = strip(src.tagTest);

  // 券行那一格：从券行的 `<u-form-item ... @click="openCouponPicker">` 到它的收口
  // （同页前面还有几个 `.input-item`——报名信息/校区/学生——不能按「第一个 input-item」取）
  const row = (tpl.match(/<u-form-item[^>]*@click="openCouponPicker"[\s\S]*?<\/u-form-item>/) || [])[0] || '';
  // 那一枚 Tag 的 v-if 条件
  const tagIf = (row.match(/<text\s+v-if="([^"]+)"\s+class="coupon-type-tag"/) || [])[1] || '';
  // `.coupon-type-tag` 的样式块
  const tagStyle = (order.match(/\.coupon-type-tag\s*\{([\s\S]*?)\}/) || [])[1] || '';

  return [
    // ① 端上渲染
    ['①a 券行渲染后端下发的 `coupon_info.tag_text`（不写死文案）',
      /\{\{\s*data\.coupon_info\.tag_text\s*\}\}/.test(row)],

    ['①b Tag 在券值左侧（同一格里，Tag 节点排在 formatDiscountPrice 之前）',
      row.length > 0
      && row.indexOf('coupon-type-tag') >= 0
      && row.indexOf('coupon-type-tag') < row.indexOf('formatDiscountPrice(data.coupon_discount_fee)')],

    ['①c Tag 只在「真抵到钱」时出（与券值同一枚判据，零元券不摆空口）',
      /data\.coupon_discount_fee > 0/.test(tagIf)
      && /data\.coupon_info/.test(tagIf)
      && /tag_text/.test(tagIf)],

    ['①d 端上不拿 type 自己拼「满X减Y」（两档判据只存后端）',
      !/['"]满['"]\s*\+/.test(order)
      && !/type\s*===?\s*['"](reduce|discount)['"]/.test(order)],

    ['①e 拼团试算把 `d.coupon_info` 写回 data（不走 order.calculate 的那一档）',
      /that\.\$set\(that\.data, 'coupon_info',\s*d\.coupon_info \|\| null\)/.test(order)],

    ['①f 券失效回落那一支清掉 coupon_info（不留旧 Tag）',
      /that\.\$set\(that\.data, 'coupon_info',\s*null\)/.test(order)],

    ['①g Tag 几何/配色照订单详情那枚（11px / 行盒 16 / 圆角 4 / 底 #fff3e8 / 字 #b95000）',
      /font-size:\s*11px/.test(tagStyle)
      && /line-height:\s*16px/.test(tagStyle)
      && /border-radius:\s*4px/.test(tagStyle)
      && /background:\s*#fff3e8/i.test(tagStyle)
      && /color:\s*#b95000/i.test(tagStyle)],

    // ② 后端
    ['②a 核算回体带 `coupon_info`',
      /'coupon_info'\s*=>\s*\$this->couponInfoOfResult\(\)/.test(orderCreate)],

    ['②b `couponInfoOfResult` 的文案来自 `Coupon::tagText()`，没券时回 null',
      /private function couponInfoOfResult\(\)[\s\S]{0,900}?if \(!is_object\(\$coupon\) \|\| !\$coupon->coupon\)\s*\{\s*return null;/.test(orderCreate)
      && /private function couponInfoOfResult\(\)[\s\S]{0,900}?'tag_text'\s*=>\s*\$model->tagText\(\)/.test(orderCreate)],

    ['②c `tagText()` 三支齐（满减 / 折扣 / 无门槛），且金额去尾零',
      /public function tagText\(\)[\s\S]{0,1000}?无门槛[\s\S]{0,500}?'打'[\s\S]{0,300}?'减'/.test(coupon)
      && /rtrim\(rtrim\(number_format/.test(coupon)],

    ['②d 单测 `OrderCouponTagTest` 在盘（满减 / 折扣 / 无门槛 / 拼团四档）',
      /testReduceTag/.test(tagTest) && /testDiscountTag/.test(tagTest)
      && /testNoThresholdTag/.test(tagTest) && /testGroupBuyTag/.test(tagTest)],
  ];
}

const src = {
  order: read(ORDER),
  coupon: read(COUPON),
  orderCreate: read(ORDER_CREATE),
  tagTest: read(TAG_TEST),
};

const list = rules(src);
list.forEach(([name, ok]) => assert(name, ok));
console.log('\n共 ' + list.length + ' 条，失败 ' + fail + ' 条');

/** 坏样件自检：核心几处改坏必须各自报红 */
if (process.argv.includes('--selftest')) {
  const cases = [
    ['Tag 文案写死在前端', 'order', (s) => s.replace('{{ data.coupon_info.tag_text }}', '{{ \'满100减10\' }}'), '①a'],
    ['Tag 挪到券值右侧', 'order', (s) => {
      const m = s.match(/<text\s+v-if="([^"]+)"\s+class="coupon-type-tag">\{\{ data\.coupon_info\.tag_text \}\}<\/text>/);
      if (!m) { return s; }
      return s.replace(m[0], '').replace(/(<text class="coupon-discount-value">[\s\S]*?<\/text>)/, '$1' + m[0]);
    }, '①b'],
    ['Tag 不看「真抵到钱」，选过就出', 'order', (s) => s.replace(/<text\s+v-if="data\.coupon_discount_fee > 0 && data\.coupon_info && data\.coupon_info\.tag_text"/, '<text v-if="data.coupon_info && data.coupon_info.tag_text"'), '①c'],
    ['端上自己按 type 拼文案', 'order', (s) => s.replace('data.coupon_info.tag_text', "data.coupon_info.type === 'reduce' ? '满' + '100' : ''"), '①d'],
    ['拼团档不回填 coupon_info', 'order', (s) => s.replace(/that\.\$set\(that\.data, 'coupon_info',\s*d\.coupon_info \|\| null\);/, ''), '①e'],
    ['后端核算不带 coupon_info', 'orderCreate', (s) => s.replace(/'coupon_info'\s*=>\s*\$this->couponInfoOfResult\(\),/, ''), '②a'],
    ['tagText 只写满减一支', 'coupon', (s) => s.replace(/if \(\$type === 'discount'\) \{[\s\S]*?\n        \}/, ''), '②c'],
  ];
  let selfPass = 0;
  let selfFail = 0;
  console.log('\n--- 坏样件自检 ---');
  cases.forEach(([name, target, mutate, prefix]) => {
    const base = src[target];
    const broken = mutate(base);
    const hit = rules({ ...src, [target]: broken }).find(([n]) => n.indexOf(prefix) === 0);
    const red = broken !== base && hit && hit[1] === false;
    if (red) { selfPass++; console.log('[PASS] 反例能红：' + name); }
    else { selfFail++; console.log('[FAIL] 反例没红（门禁判据失效）：' + name); }
  });
  console.log('自检：' + selfPass + '/' + (selfPass + selfFail) + ' 条反例报红');
  if (selfFail > 0) { process.exit(1); }
}

process.exit(fail ? 1 : 0);
