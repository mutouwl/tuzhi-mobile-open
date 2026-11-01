/**
 * 拼团订单状态「待成交」+ 实物商品行发货状态「待发货」（2026-10-28 用户点名）
 *
 * 用户原话：「注意拼团商品的订单状态要进行对应适配，如果仍在拼团中，则显示『待成交』，
 * 如果是实物商品，那么订单的子商品发货状态则为待发货」。
 *
 * 为什么单独落一条门禁：
 *  - 这两枚词都是**派生展示词**，底层 `tuzhi_order.status` / `order_item.send_status` 不动，
 *    所以接口返回码、`ui-audit`、`sfc-check` 都看不出「少接了一个出口」；
 *  - 判据只存两处（`GroupBuy::waitingOrderNos` / `Item::sendStatusText`），
 *    任何一个端自己再写一份中文，就是下一轮「两屏说法不一」的起点（硬约束 11）。
 *
 * 合同（每一条都钉「判据只存一处 + 三端都接线」）：
 *  ① 后端适配器：`待成交` / `待发货` 两枚常量 + `waitingOrderNos` / `sendStatusText` / `subSendStatusText`；
 *  ② api 出口：详情 `status_text` + 商品行/子商品 `send_status_text`，列表 `status_text`；
 *  ③ 管理端出口：列表与详情都吃 `waitingOrderNos`，前端两处优先 `status_text`、商品行显示发货状态；
 *  ④ 移动端：订单卡 `statusText` prop、列表传参、详情状态栏、i18n 兜底词条；
 *     **商品行/子商品行的「发货状态」小字 2026-10-29 由用户点名去掉**（状态栏已经说明，重复一遍），
 *     这一档改为钉「不再出现」，后端 `send_status_text` 仍下发（管理端与 AI 在用）。
 *  ⑤ AI：`order.get` / `order.list` 都下发 `status_text`，`order.get` 商品行下发 `send_status_text`。
 *
 * 用法：node tuzi-mobile/scripts/check-order-status.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const P = {
  groupBuy: path.join(ROOT, 'tuzhi-selfbuilt-backend/application/common/model/goods/GroupBuy.php'),
  item: path.join(ROOT, 'tuzhi-selfbuilt-backend/application/common/model/order/Item.php'),
  apiOrder: path.join(ROOT, 'tuzhi-selfbuilt-backend/application/api/controller/order/Order.php'),
  adminOrder: path.join(ROOT, 'tuzhi-selfbuilt-backend/application/admin/controller/order/Order.php'),
  aiGet: path.join(ROOT, 'tuzhi-selfbuilt-backend/application/common/library/app/aiopen/tools/OrderGet.php'),
  aiList: path.join(ROOT, 'tuzhi-selfbuilt-backend/application/common/library/app/aiopen/tools/OrderList.php'),
  orderCard: path.join(ROOT, 'tuzi-mobile/src/components/order/order.vue'),
  orderList: path.join(ROOT, 'tuzi-mobile/src/pages/order/list/list.vue'),
  statusBar: path.join(ROOT, 'tuzi-mobile/src/pages/order/components/status-bar.vue'),
  orderDetail: path.join(ROOT, 'tuzi-mobile/src/pages/order/detail/detail.vue'),
  orderDetailCss: path.join(ROOT, 'tuzi-mobile/src/pages/order/detail/css.css'),
  locale: path.join(ROOT, 'tuzi-mobile/src/components/language/zh-CN.js'),
  webList: path.join(ROOT, 'tuzi-web/src/views/order/compontents/order-list.vue'),
  webControl: path.join(ROOT, 'tuzi-web/src/views/order/compontents/order-control.vue'),
  webDetail: path.join(ROOT, 'tuzi-web/src/views/order/detail.vue'),
};

const read = (file) => fs.readFileSync(file, 'utf8');
const stripComments = (src) => src.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|\s)\/\/[^\n]*/g, '$1');

function main() {
  const src = {};
  for (const key of Object.keys(P)) src[key] = read(P[key]);
  const pass = [];
  const fail = [];
  const ok = (name, cond) => (cond ? pass.push(name) : fail.push(name));
  const has = (key, needle) => stripComments(src[key]).indexOf(needle) >= 0;

  /* ① 后端判据只存两处 */
  ok('① GroupBuy 定义「待成交」常量', /const\s+ORDER_STATUS_WAIT_DEAL\s*=\s*'待成交'/.test(src.groupBuy));
  ok('① GroupBuy 有整批 waitingOrderNos（吃 orderStates 的 state=1）',
    has('groupBuy', 'function waitingOrderNos') && has('groupBuy', 'state') && has('groupBuy', '=== 1'));
  ok('① Item 定义「待发货/已发货」两枚常量',
    /const\s+SEND_TEXT_UNSEND\s*=\s*'待发货'/.test(src.item) && /const\s+SEND_TEXT_SENT\s*=\s*'已发货'/.test(src.item));
  ok('① Item 有 sendStatusText / subSendStatusText / isPhysicalItem',
    has('item', 'function sendStatusText') && has('item', 'function subSendStatusText') && has('item', 'function isPhysicalItem'));

  /* ② api 出口 */
  ok('② api 详情下发 status_text', has('apiOrder', "'status_text'"));
  ok('② api 详情商品行/子商品下发 send_status_text',
    has('apiOrder', "'send_status_text'") && has('apiOrder', 'subSendStatusText'));
  ok('② api 列表下发 status_text', has('apiOrder', "$list[$key]['status_text']"));

  /* ③ 管理端出口 */
  ok('③ 管理端列表/详情都吃 waitingOrderNos',
    (stripComments(src.adminOrder).match(/waitingOrderNos/g) || []).length >= 2);
  ok('③ 管理端列表/详情都下发 status_text',
    (stripComments(src.adminOrder).match(/\['status_text'\]/g) || []).length >= 2);
  ok('③ 管理端商品行下发 send_status_text', has('adminOrder', "'send_status_text'"));
  ok('③ 管理端列表状态列优先 status_text', has('webList', 'record.status_text'));
  ok('③ 管理端列表商品行显示发货状态', has('webList', 'item.send_status_text'));
  ok('③ 管理端详情头优先 status_text', has('webControl', 'this.orderData.status_text'));
  ok('③ 管理端详情商品行（含子商品）显示发货状态',
    has('webDetail', 'record.send_status_text') && has('webDetail', 'record._childData.send_status_text'));

  /* ④ 移动端 */
  ok('④ 订单卡有 statusText prop 且优先读它',
    has('orderCard', 'statusText') && has('orderCard', "statusText || $t('status.'+ status)"));
  ok('④ 订单列表把 status_text 传给订单卡', has('orderList', ':status-text="item.status_text'));
  ok('④ 详情状态栏有 statusText prop 且优先读它',
    has('statusBar', 'statusText') && has('statusBar', "statusText || $t('status.'+ status)"));
  ok('④ 订单详情把 status_text 传给状态栏', has('orderDetail', ':status-text="data.status_text'));
  ok('④ 移动端订单详情不再显示商品行发货状态（2026-10-29 用户点名去掉）',
    !has('orderDetail', 'send_status_text') && !has('orderDetail', 'goods-send-status'));
  ok('④ 移动端组合子商品行不再显示发货状态（同上）', !has('orderDetail', 'sub-goods-send'));
  ok('④ 发货状态那几档样式已删净（留空样式＝还会被接回来）',
    !/\.goods-send-status|\.goods-send-label|\.goods-send-text|\.sub-goods-send/.test(src.orderDetailCss));
  ok('④ 学员端 locale 有 status.wait_deal 兜底词条', has('locale', 'status.wait_deal'));

  /* ⑤ AI 出口 */
  ok('⑤ order.get 下发 status_text 与商品行 send_status_text',
    has('aiGet', "'status_text'") && has('aiGet', "'send_status_text'"));
  ok('⑤ order.list 下发 status_text', has('aiList', "'status_text'"));

  const total = pass.length + fail.length;
  pass.forEach((name) => console.log('[PASS] ' + name));
  fail.forEach((name) => console.log('[FAIL] ' + name));
  console.log('\n结果：' + (fail.length ? '失败 ' + fail.length : '全部符合预期')
    + '（通过 ' + pass.length + ' 项 / 共 ' + total + ' 项）');
  process.exit(fail.length ? 1 : 0);
}

main();
