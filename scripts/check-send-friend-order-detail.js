/**
 * 订单详情里的「送礼记录」入口与进度（2026-10-20 用户点名）
 *
 * 用户原话：「订单详情也未对送礼物订单适配，像拼团那样显示送礼记录入口和进度」。
 * 这一条是**跨文件接线**（后端下发键 / 详情页那一块 / 记录页收窄参数），
 * `sfc-check` 只编译模板、`ui-audit` 只按正则查版式、后端 curl 只验接口出口，
 * 三道都看不见「少挂一处」——所以按 M46 与 M44 落一份脚本：
 *
 *  ① 详情页那一块是独立 `tz-box`（`:marginTop="10"`，位置在订单信息卡上方），
 *     判据是后端 `data.send_friend.label`，普通单 / 未装整段不出；
 *  ② 行 title「送礼记录」+ `isLink`，点击调 `toSendFriendGifts`，
 *     端上不写第二份进度文案（「待赠送/已领取」只能由后端给）；
 *  ③ 跳赠送记录页时带 `order_no`，记录页在 `onLoad` 只读一次并把它下推到 list 参数；
 *  ④ 后端 `api/controller/order/Order.php` 真挂 `SendFriend::orderProgress` 并写回
 *     `send_friend`；`Gift::list` 真读 `order_no` 并交给 `Query::filter`。
 *
 * 用法：node tuzi-mobile/scripts/check-send-friend-order-detail.js
 *       node tuzi-mobile/scripts/check-send-friend-order-detail.js --selftest
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const MOBILE = path.join(ROOT, 'tuzi-mobile/src');
const BACKEND = path.join(ROOT, 'tuzhi-selfbuilt-backend/application');
const DETAIL = path.join(MOBILE, 'pages/order/detail/detail.vue');
const DETAIL_JS = path.join(MOBILE, 'pages/order/detail/js.vue');
const GIFT_JS = path.join(MOBILE, 'pages/app/send_friend/gift/js.vue');
const ORDER = path.join(BACKEND, 'api/controller/order/Order.php');
const GIFT = path.join(BACKEND, 'api/controller/app/send_friend/Gift.php');

const read = (f) => fs.readFileSync(f, 'utf8');
const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
  if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  return !!ok;
}

function check() {
  const tpl = stripComments(read(DETAIL));
  const detailJs = stripComments(read(DETAIL_JS));
  const giftJs = read(GIFT_JS);
  const giftCode = stripComments(giftJs);
  const orderSrc = stripComments(read(ORDER));
  const giftSrc = stripComments(read(GIFT));

  // 2026-10-22 起 v-if 前面多了一枚前端开关（featureSendFriend，订单礼单段随开关隐藏），两种形态都认
  const SF_VIF = /v-if="(?:featureSendFriend && )?data\.send_friend && data\.send_friend\.label"/;
  const blockAt = tpl.indexOf('data.send_friend && data.send_friend.label');
  const infoAt = tpl.indexOf('title="订单号"');
  assert('① 详情页送礼块吃后端 label（普通单 / 领取单 / 未装都是空对象，整段不出）',
    blockAt >= 0 && SF_VIF.test(tpl),
    'send_friend.label 判据=' + (blockAt >= 0));
  // 2026-10-28 用户点名「去掉box圆角」⇒ 详情页所有卡片 tz-box 都不再传 round（卡级直角，M21），
  // 这一块仍是独立白卡（自己一只 tz-box、上下各 10px），只把 round 那一档从合同里撤掉。
  // 仍然钉住「不许又长出 round」——否则下一次改版会把被点名撤掉的圆角悄悄带回来。
  const sfBox = (tpl.match(/<tz-box\s+v-if="(?:featureSendFriend && )?data\.send_friend && data\.send_friend\.label"[^>]*>/) || [''])[0];
  assert('① 送礼块是独立白卡、上下各 10px、卡级直角，且压在订单信息卡上方（M46）',
    blockAt >= 0 && infoAt > blockAt
    && /:marginTop="10"/.test(sfBox) && !/\bround\b/.test(sfBox),
    { blockAt: blockAt, infoAt: infoAt, box: sfBox });
  assert('② 行 title=赠送记录、isLink、value 位色标、点击走 toSendFriendGifts',
    /<u-cell[^>]*title="赠送记录"[^>]*:isLink="true"[^>]*@click="toSendFriendGifts"/.test(tpl)
    && /class="order-sf-tag"/.test(tpl));
  assert('② 端上不写第二份进度文案（待赠送/已领取只由后端 label 给）',
    !/待赠送\s*\d|已领取\s*\d|已全部领取|已失效/.test(tpl),
    '详情页模板里出现端上拼的进度文案=' + /待赠送\s*\d|已领取\s*\d|已全部领取|已失效/.test(tpl));

  assert('③ 点入口带 order_no 进赠送记录页',
    /toSendFriendGifts\s*\(\)/.test(detailJs)
    && /'\/pages\/app\/send_friend\/gift\/gift\?order_no='\s*\+\s*orderNo/.test(detailJs));
  assert('③ 记录页 onLoad 只读一次 order_no（onShow 不重读路由参数）',
    /onLoad\(options\)[\s\S]{0,220}order_no/.test(giftCode)
    && !/onShow\([\s\S]{0,200}order_no/.test(giftCode));
  assert('③ 记录页把 order_no 下推到 list 参数（不是只在界面上显示一下）',
    /if \(this\.orderNo !== ''\) \{ params\.order_no = this\.orderNo; \}/.test(giftCode));

  const detailAt = orderSrc.indexOf('function getDetail');
  const listAt = orderSrc.indexOf('function getOrderList');
  const detailBody = detailAt >= 0 && listAt > detailAt ? orderSrc.slice(detailAt, listAt) : '';
  assert('④ 后端 getDetail 真挂 SendFriend::orderProgress 并写回 send_friend',
    /SendFriend::orderProgress/.test(detailBody) && /\['send_friend'\]/.test(detailBody),
    { progress: /SendFriend::orderProgress/.test(detailBody), key: /\['send_friend'\]/.test(detailBody) });
  assert('④ 后端 Gift::list 真读 order_no 并交给 Query::filter',
    /request->param\('order_no'/.test(giftSrc)
    && /Query::filter\(\['status' => \$status, 'order_no' => \$orderNo\]\)/.test(giftSrc));

  console.log('\n结果：' + (fail ? '有 ' + fail + ' 项不符合预期' : '全部符合预期') + '（通过 ' + pass + ' 项 / 违反 ' + fail + ' 项）');
  return fail === 0;
}

if (process.argv.includes('--selftest')) {
  const orig = fs.readFileSync;
  const badDetail = read(DETAIL)
    .replace(/v-if="(?:featureSendFriend && )?data\.send_friend && data\.send_friend\.label"/, 'v-if="true"')
    .replace(/title="赠送记录"/, 'title="记录"');
  const badDetailJs = read(DETAIL_JS).replace(/\?order_no=' \+ orderNo/, '');
  const badGiftJs = read(GIFT_JS).replace(/if \(this\.orderNo !== ''\) \{ params\.order_no = this\.orderNo; \}/, '');
  fs.readFileSync = function (file) {
    const f = path.resolve(file);
    if (f === path.resolve(DETAIL)) return badDetail;
    if (f === path.resolve(DETAIL_JS)) return badDetailJs;
    if (f === path.resolve(GIFT_JS)) return badGiftJs;
    return orig.apply(fs, arguments);
  };
  const ok = check();
  fs.readFileSync = orig;
  process.exit(ok ? 1 : 0);
}

process.exit(check() ? 0 : 1);
