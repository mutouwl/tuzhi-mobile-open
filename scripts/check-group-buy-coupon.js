#!/usr/bin/env node
/**
 * 拼团用券接线（2026-10-29 用户点名「拼团商品应该允许使用优惠券」）
 *
 * 改造前拼团单整条链都不吃券：`OrderCreate::calcCoupon()` 对拼团单直接跳过、
 * `OrderBridge` 硬写 `coupon_id => ''`、移动端券段 `v-if="!isVirtualPay && !isGroupBuy"` 整段不渲染。
 * 现在四处必须同时成立，缺一处就是「界面能选券、提交不抵扣」或「金额对不上」：
 *
 *  ① 移动端券段：拼团档也摆（只被虚拟支付关掉），券弹窗换 `group_buy.team.coupons` 口，
 *     选中后走 `group_buy.team.calc` 现算，提交载荷两支都带 `coupon_id`；
 *  ② 券弹窗：`apiKey/apiParams` 两个 opt-in prop（其余下单流逐字不变），
 *     且必须用 `this.$api`（模块级 `that` 在多宿主场景会被后挂载的实例顶掉）；
 *  ③ 后端链路：控制器读 `coupon_id` → `TeamService::context*`（与建单同一份形状）→
 *     `OrderBridge` 透传 → `OrderCreate::calcCoupon` 不再跳过；
 *  ④ 退款：团失败退款把券退回去（券在建单那一刻就核销了）。
 *
 * 用法：node scripts/check-group-buy-coupon.js [--selftest]
 *   --selftest：喂坏样件，四条核心断言必须各自报红（全绿说明门禁没长眼）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.resolve(ROOT, '..', 'tuzhi-selfbuilt-backend');
const ORDER = path.join(ROOT, 'src/components/order/submit-order.vue');
const PICKER = path.join(ROOT, 'src/components/coupon/coupon-picker-modal.vue');
const API = path.join(ROOT, 'src/common/request/api_list.js');
const BACK = (p) => path.join(BACKEND, p);

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
  const orderTpl = strip((src.order.match(/<template>([\s\S]*)<\/template>/) || [])[1] || '');
  const picker = strip(src.picker);
  const api = strip(src.api);
  const orderCreate = strip(read(BACK('application/common/library/order/OrderCreate.php')));
  const adapter = strip(read(BACK('application/common/model/goods/GroupBuy.php')));
  const bridge = strip(read(BACK('application/common/library/app/group_buy/OrderBridge.php')));
  const teamSvc = strip(read(BACK('application/common/library/app/group_buy/TeamService.php')));
  const orderCtx = strip(read(BACK('application/common/library/app/group_buy/OrderContext.php')));
  const teamCtl = strip(read(BACK('application/api/controller/app/group_buy/Team.php')));
  const refund = strip(read(BACK('application/common/library/app/group_buy/RefundService.php')));
  const refundItem = strip(read(BACK('application/common/library/app/group_buy/RefundItem.php')));

  return [
    // ① 移动端下单页
    ['①a 券段不再被拼团关掉（只保留虚拟支付那一道）',
      /<template v-if="!isVirtualPay">[\s\S]{0,240}?优惠券/.test(orderTpl)
      && !/!isVirtualPay && !isGroupBuy/.test(orderTpl)],
    ['①b 拼团券口 / 试算入参只存 `gbCouponParams` 一处',
      /gbCouponParams\s*\(\s*\)\s*\{[\s\S]{0,900}?gb\.team_id[\s\S]{0,500}?params\.activity_id/.test(order)],
    ['①b2 券/试算参数带上取价必需的订单上下文（报名信息 / 校区学生）',
      /gbCouponParams\s*\(\s*\)\s*\{[\s\S]{0,900}?form_user_id:[\s\S]{0,200}?student_id:[\s\S]{0,200}?campus_id:/.test(order)],
    ['①b3 券行点击走 `openCouponPicker`，缺必需项先拦（不让弹窗空着说「暂无优惠券」）',
      /@click="openCouponPicker"/.test(orderTpl)
      && /openCouponPicker\(\)\s*\{[\s\S]{0,600}?请先填写报名信息[\s\S]{0,400}?请先选择上课校区与上课学生/.test(order)],
    ['①c 券弹窗在拼团档换 `group_buy.team.coupons` 口并带 apiParams',
      /:api-key="isGroupBuy \? 'group_buy\.team\.coupons' : ''"/.test(order)
      && /:api-params="isGroupBuy \? gbCouponParams : null"/.test(order)],
    ['①d 选券后拼团档走 calcGroupBuyAmount（不误走 order.calculate）',
      /couponChange\(id\)\s*\{[\s\S]{0,260}?this\.isGroupBuy[\s\S]{0,120}?this\.calcGroupBuyAmount\(\)/.test(order)],
    // 2026-10-30：这一支多了「清 coupon_info（券类型 Tag 那一格）」一行，间距放宽到 260
    ['①e 试算走 `group_buy.team.calc`，且券失效那一档带 `d.msg` 回落',
      /group_buy\.team\.calc/.test(order)
      && /if \(d\.msg\)[\s\S]{0,260}?form\.coupon_id = 0[\s\S]{0,260}?calcGroupBuyAmount\(\)/.test(order)],
    ['①f 提交载荷两支都带 coupon_id（join 与 open）',
      (order.match(/coupon_id: couponId/g) || []).length >= 2
      && /const couponId = that\.isVirtualPay \? 0 : \(Number\(that\.form\.coupon_id\) \|\| 0\);/.test(order)],

    // ② 券弹窗（opt-in，其余下单流逐字不变）
    ['②a 券弹窗新增 apiKey/apiParams 两个 prop',
      /apiKey:\s*\{\s*type: String/.test(picker) && /apiParams:\s*\{\s*type: Object/.test(picker)],
    ['②b 取券口按 apiKey 分流，且用 `this.$api`（不读模块级 that）',
      /const req = this\.apiKey\s*\? this\.\$api\(this\.apiKey, this\.apiParams \|\| \{\}\)/.test(picker)
      && /this\.\$api\("app\.coupon\.use"/.test(picker)],
    ['②c 取券失败要撤骨架（硬约束 22）',
      /\.catch\(\(\) => \{[\s\S]{0,220}?this\.loading = false/.test(picker)],
    // 2026-10-29 用户点名「不要使用这个 Loading 弹窗了，要使用一个骨架屏放在这个优惠券弹窗里面」：
    // 加载态换成弹窗内的券卡骨架（coupon-my 的 skeleton 档），那枚 uni.showLoading 黑底转圈必须撤净
    ['②d 券弹窗加载态走弹窗内骨架屏，不再用 showLoading 遮罩（M16）',
      !/uni\.showLoading/.test(picker) && /<coupon-my :skeleton="true"/.test(picker)],
    // 2026-10-29 用户跟进「优惠券加载的时候，底下的这两个按钮也应该做一个骨架屏加载呀」：
    // 两枚动作也进加载态（真按钮收到 v-else 支），灰块高度按 `tz-button size="normal" long` 的 40 给
    ['②e 加载中底部两枚动作也铺骨架（灰块 40 高、宽度沿用两格）',
      /<template v-if="loading">[\s\S]{0,260}?cpn-sk-btn[\s\S]{0,160}?cpn-sk-btn[\s\S]{0,160}?<template v-else>[\s\S]{0,260}?text="不使用优惠券"/.test(picker)
      && /\.cpn-sk-btn \{[\s\S]{0,140}?height: 40px;/.test(picker)],

    // ③ api_list 登记
    ['③a `group_buy.team.calc` 已登记（POST + auth）',
      /calc:\s*\{\s*url: 'app\/group_buy\/team\/calc',\s*auth: true,\s*method: 'POST'/.test(api)],
    ['③b `group_buy.team.coupons` 已登记（POST + auth）',
      /coupons:\s*\{\s*url: 'app\/group_buy\/team\/coupons',\s*auth: true,\s*method: 'POST'/.test(api)],

    // ④ 后端链路
    ['④a `calcCoupon` 不再有拼团跳过那一支',
      !/skipCoupon/.test(orderCreate) && /function calcCoupon\(\)/.test(orderCreate)],
    ['④b 核心适配器已撤 `skipCoupon`（不留第二道分叉）',
      !/function skipCoupon/.test(adapter)],
    ['④c OrderBridge 把 ctx 里的 coupon_id 透传给 OrderCreate',
      /'coupon_id'\s*=>\s*intval\(isset\(\$ctx\['coupon_id'\]\) \? \$ctx\['coupon_id'\] : 0\)/.test(bridge)],
    ['④d OrderBridge 有券清单口（与 calc/create 同一份 params）',
      /public static function coupons\(array \$activity, array \$ctx\)[\s\S]{0,240}?self::params\(/.test(bridge)],
    ['④e OrderContext 有 of/open/join（四条链共用一份形状）',
      /public static function of\(/.test(orderCtx)
      && /public static function open\(/.test(orderCtx)
      && /public static function join\(/.test(orderCtx)
      && /OrderContext::of\(/.test(teamSvc)],
    ['④f 控制器 open/join/quoteContext 都读 coupon_id，且 calc/coupons 两个口都在',
      (teamCtl.match(/param\('coupon_id'/g) || []).length >= 3
      && /function calc\(/.test(teamCtl) && /function coupons\(/.test(teamCtl)
      && /OrderBridge::calc\(/.test(teamCtl) && /OrderBridge::coupons\(/.test(teamCtl)],
    ['④g 团失败退款退券（RefundItem::backCoupon 在退款成功之后被调）',
      /public static function backCoupon\(/.test(refundItem)
      && /Refund::refund\([\s\S]{0,700}?RefundItem::backCoupon\(/.test(refund)],
  ];
}

const src = {
  order: read(ORDER),
  picker: read(PICKER),
  api: read(API),
};

const list = rules(src);
list.forEach(([name, ok]) => assert(name, ok));
console.log('\n共 ' + list.length + ' 条，失败 ' + fail + ' 条');

/** 坏样件自检：把关键几处改坏，必须各自报红 */
if (process.argv.includes('--selftest')) {
  // [名称, 改哪一份（order / picker）, 改坏的动作, 该判据必须转红]
  const cases = [
    ['券段退回「拼团不摆券」', 'order', (s) => s.replace('<template v-if="!isVirtualPay">', '<template v-if="!isVirtualPay && !isGroupBuy">'),
      (s) => !rules({ ...s, api: src.api }).find(([n]) => n.indexOf('①a') === 0)[1]],
    ['券弹窗退回全站券口', 'order', (s) => s.replace(/:api-key="isGroupBuy \? 'group_buy\.team\.coupons' : ''"/, ':api-key=""'),
      (s) => !rules({ ...s, api: src.api }).find(([n]) => n.indexOf('①c') === 0)[1]],
    ['join 载荷少一枚 coupon_id', 'order', (s) => s.replace(/coupon_id: couponId,\n(\s+)form_user_id/, 'form_user_id'),
      (s) => !rules({ ...s, api: src.api }).find(([n]) => n.indexOf('①f') === 0)[1]],
    ['券失效那一档不再清券', 'order', (s) => s.replace(/if \(d\.msg\) \{/, 'if (false) {'),
      (s) => !rules({ ...s, api: src.api }).find(([n]) => n.indexOf('①e') === 0)[1]],
    // ②c / ②d / ②e 三枚判据落在券弹窗这一份文件上，坏样件也改这一份
    ['券弹窗退回 showLoading 黑底转圈（M16）', 'picker',
      (s) => s.replace('const seq = ++this.seq;', 'const seq = ++this.seq;\n      uni.showLoading({ title: "请稍后" });'),
      (s) => !rules({ ...s, order: src.order, api: src.api }).find(([n]) => n.indexOf('②d') === 0)[1]],
    ['券弹窗失败分支不再撤骨架', 'picker',
      (s) => s.replace(/if \(seq !== this\.seq\) return;\s*this\.loading = false;\s*this\.failMsg/, 'if (seq !== this.seq) return;\n          this.failMsg'),
      (s) => !rules({ ...s, order: src.order, api: src.api }).find(([n]) => n.indexOf('②c') === 0)[1]],
    ['加载中底部两枚按钮不给骨架（只剩一枚灰块）', 'picker',
      (s) => s.replace('<div class="sure-use-btn"><view class="cpn-sk-btn"></view></div>', '<div class="sure-use-btn"></div>'),
      (s) => !rules({ ...s, order: src.order, api: src.api }).find(([n]) => n.indexOf('②e') === 0)[1]],
  ];
  let selfPass = 0;
  let selfFail = 0;
  console.log('\n--- 坏样件自检 ---');
  cases.forEach(([name, target, mutate, isRed]) => {
    const base = target === 'picker' ? src.picker : src.order;
    const broken = mutate(base);
    const src2 = { order: target === 'order' ? broken : src.order, picker: target === 'picker' ? broken : src.picker, api: src.api };
    const red = broken !== base && isRed(src2);
    if (red) { selfPass++; console.log('[PASS] 反例能红：' + name); }
    else { selfFail++; console.log('[FAIL] 反例没红（门禁判据失效）：' + name); }
  });
  console.log('自检：' + selfPass + '/' + (selfPass + selfFail) + ' 条反例报红');
  if (selfFail > 0) { process.exit(1); }
}

process.exit(fail ? 1 : 0);
