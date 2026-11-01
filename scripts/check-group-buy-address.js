#!/usr/bin/env node
/**
 * 拼团下单页的收货地址链路（2026-10-29 用户点名「拼团的组合商品居然不显示收货地址选择组件」）
 *
 * 那一屏三段同时缺，任何一段不补都还是走不通，所以本脚本按**三段各钉一遍**（不构建、不开浏览器）：
 *  ① 前端判据：确认页的地址卡 / 提交前校验 / 骨架屏三处**只读 `needShipping` 一处** computed，
 *     它只吃后端下发的那一枚（开团＝选中规格行的 `need_address`，参团＝团详情 activity 段的 `need_address`），
 *     不许退回按 `pageParams.type` / 商品大类猜（组合商品另一档可能全是虚拟）；
 *  ② 提交载荷：`submitGroupBuy` 把 `address_id` 同时放进 `team.join` 与 `team.open` 两支载荷，
 *     并在缺地址时**先拦**（别让后端建了团才拒）；
 *  ③ 后端链路：规格行贴 `need_address` → 活动规格行透传 → 控制器读 `address_id` → `TeamService`
 *     在建团/占名额前过 `Gate::assertAddress` → `OrderBridge` 交给 `OrderCreate`；
 *     成团补发那一支要按 `Payed::run()` 的口径把含实物子商品的组合单落 `unsend`。
 *
 * 用法：node scripts/check-group-buy-address.js [--selftest]
 *   --selftest：把每类判据的「坏样件」喂一遍，三条核心断言必须各自报红（全绿才算门禁本身有效）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.resolve(ROOT, '..', 'tuzhi-selfbuilt-backend');
const ORDER = path.join(ROOT, 'src/components/order/submit-order.vue');
const BACK = (p) => path.join(BACKEND, p);

const read = (f) => {
  if (!fs.existsSync(f)) { return ''; }
  return fs.readFileSync(f, 'utf8');
};
/** 去掉行注释与块注释：判据只看真代码（注释里写着「应该这样」不算实现） */
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

/** 判据表：文件 + 正则 + 一句话说明 */
function rules() {
  const order = strip(read(ORDER));
  const orderTpl = strip((read(ORDER).match(/<template>([\s\S]*)<\/template>/) || [])[1] || '');
  const compositeSpec = strip(read(BACK('application/common/library/app/group_buy/spec/CompositeSpec.php')));
  const activitySpec = strip(read(BACK('application/common/library/app/group_buy/ActivitySpec.php')));
  const teamCtl = strip(read(BACK('application/api/controller/app/group_buy/Team.php')));
  const teamSvc = strip(read(BACK('application/common/library/app/group_buy/TeamService.php')));
  // 2026-10-29 用券：订单上下文（含 address_id）从 TeamService 拆到 OrderContext::of() 一处
  const orderCtx = strip(read(BACK('application/common/library/app/group_buy/OrderContext.php')));
  const gate = strip(read(BACK('application/common/library/app/group_buy/Gate.php')));
  const bridge = strip(read(BACK('application/common/library/app/group_buy/OrderBridge.php')));
  const delivery = strip(read(BACK('application/common/library/app/group_buy/Delivery.php')));

  return [
    // ① 前端判据
    ['①a `needShipping` 是地址这一族的唯一判据',
      /needShipping\s*\(\s*\)\s*\{[\s\S]{0,160}?pageParams\.type === 'physical'[\s\S]{0,80}?this\.needAddress/.test(order)],
    ['①b 拼团档的 needAddress 只读 `gbNeedAddress`（不拿商品类型猜）',
      /needAddress\s*\(\s*\)\s*\{[\s\S]{0,200}?this\.isGroupBuy[\s\S]{0,120}?this\.gbNeedAddress/.test(order)],
    ['①c 地址卡 `v-if="needShipping"`（不再是 pageParams.type === \'physical\' || needAddress）',
      /class="address-card"\s+v-if="needShipping"/.test(orderTpl)],
    ['①d 骨架屏那一格也读 needShipping（加载态与内容同结构）',
      /class="sk-address"\s+v-if="needShipping"/.test(orderTpl)],
    ['①e 普通单提交前校验读 needShipping',
      /if \(that\.needShipping\) \{[\s\S]{0,200}?请选择收货地址/.test(order)],
    ['①f 开团档按「选中/唯一那一档规格行」的 need_address 取值',
      /specHit[\s\S]{0,160}?specHit\.need_address[\s\S]{0,200}?specRows\.length === 1/.test(order)],
    ['①g 参团档按团详情 activity 段的 need_address 取值',
      /isJoin[\s\S]{0,160}?Number\(g\.need_address\) === 1/.test(order)],
    ['①h 要地址时先取默认地址（能自动推导的不让人再点）',
      /gb\.goods_type === 'physical' \|\| gbNeedAddress === 1[\s\S]{0,120}?getDefaultAddress/.test(order)],

    // ② 提交载荷
    ['②a 缺地址先拦（后端建团前会拦同一句，这里是别白建团）',
      /that\.needShipping && !that\.address[\s\S]{0,200}?请选择收货地址/.test(order)],
    ['②b `address_id` 同时进 join 与 open 两支载荷',
      (order.match(/address_id: addressId/g) || []).length >= 2],
    ['②c 地址只在这一档要时才带（虚拟单不塞 0 以外的脏值）',
      /const addressId = that\.needShipping \? Number\(that\.address\.id\) \|\| 0 : 0;/.test(order)],

    // ③ 后端链路
    ['③a 组合商品规格行贴 need_address（按规格，不按商品）',
      /need_address'\] = isset\(\$physical\[intval\(\$row\['id'\]\)\]\) \? 1 : 0/.test(compositeSpec)],
    ['③b 活动规格行透传 need_address（含老活动合成行）',
      /need_address'\s*=>\s*!empty\(\$current\['need_address'\]\)/.test(activitySpec)],
    ['③c 控制器 open/join 都从请求里读 address_id',
      (teamCtl.match(/param\('address_id'/g) || []).length >= 2],
    ['③d TeamService 在建团/占名额前过闸门，且地址进 ctx（ctx 形状在 OrderContext::of 一处）',
      /Gate::assertAddress\(/.test(teamSvc) && /'address_id'\s+=>\s+intval\(\$addressId\)/.test(orderCtx)],
    ['③e 闸门只认 GoodsSpec::needsAddress 一处判据',
      /GoodsSpec::needsAddress\(/.test(gate) && /请选择收货地址/.test(gate)],
    ['③f OrderBridge 把 address_id 交给 OrderCreate',
      /'address_id'\s*=>\s*intval\(isset\(\$ctx\['address_id'\]\)/.test(bridge)],
    ['③g 成团补发：组合含实物落 unsend（与 Payed::run 同口径）',
      /order_type === 'composite'[\s\S]{0,260}?STATUS_UNSEND/.test(delivery)],
  ];
}

const list = rules();
list.forEach(([name, ok]) => assert(name, ok));
console.log('\n共 ' + list.length + ' 条，失败 ' + fail + ' 条');

/** 坏样件自检：把关键几处改坏，必须各自报红（门禁本身没长眼时这里会全绿） */
if (process.argv.includes('--selftest')) {
  const orderSrc = read(ORDER);
  const cases = [
    ['地址卡退回按入口参数判', (s) => s.replace('class="address-card" v-if="needShipping"', 'class="address-card" v-if="pageParams.type === \'physical\'"'),
      (s) => !/class="address-card"\s+v-if="needShipping"/.test(s)],
    ['开团那档删掉 specHit.need_address', (s) => s.replace(/specHit\.need_address/g, '0'),
      (s) => !/specHit\.need_address/.test(s)],
    ['join 载荷少一枚 address_id', (s) => s.replace(/address_id: addressId,\n(\s+)form_user_id: that\.gbExtra\.formUserId \|\| 0,\n(\s+)student_id: Number\(that\.gbExtra\.studentId\) \|\| 0,\n(\s+)campus_id: Number\(that\.gbExtra\.campusId\) \|\| 0,\n(\s+)\}\n(\s+): \{/, '{'),
      (s) => (s.match(/address_id: addressId/g) || []).length < 2],
  ];
  let selfPass = 0;
  let selfFail = 0;
  console.log('\n--- 坏样件自检 ---');
  cases.forEach(([name, mutate, isRed]) => {
    const broken = mutate(orderSrc);
    const red = isRed(broken);
    if (red) { selfPass++; console.log('[PASS] 坏样件报红：' + name); }
    else { selfFail++; console.log('[FAIL] 坏样件没报红：' + name); }
  });
  console.log('自检 ' + cases.length + ' 条，报红 ' + selfPass + ' 条');
  if (selfFail > 0) { process.exit(1); }
}

process.exit(fail > 0 ? 1 : 0);
