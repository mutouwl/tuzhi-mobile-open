#!/usr/bin/env node
/**
 * 0 元单直接支付成功（2026-10-30 用户点名「提交订单时候，如果订单的金额是 0 元，那么应该直接显示
 * 支付成功，不要再显示选择支付方式弹窗了」）
 *
 * 这条链每一跳都得在，少一跳就是「0 元还要我选支付方式」或者更糟「界面说成功、订单仍待支付」：
 *   ① 普通单：后端 `api/controller/order/Order.php` 本来就有 `real_price == 0` 直接 paySuccess；
 *      前端按 `status != unpaid` 跳结果页（本次不改，但判据要钉住，防止后人把它摘掉）；
 *   ② 拼团：`TeamService::openTeam/joinTeam` 在 `insertMember()` **之后**调 `settleFreeOrder()`
 *      （早一步 pay_success 的挂起闸门找不到成员行），回体带 `paid`；
 *   ③ 送好友购买单：`send_friend\OrderBridge::createGiverOrder()` 对 0 元当场 paySuccess，回体带 `paid`，
 *      `Gift::create` 原样转发；
 *   ④ 前端只认后端那一枚 `paid`（不拿价格自己判——价格是券后价，收尾是后端行为）。
 *
 * 用法：node scripts/check-zero-pay.js [--selftest]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.resolve(ROOT, '..', 'tuzhi-selfbuilt-backend');
const ORDER_VUE = path.join(ROOT, 'src/components/order/submit-order.vue');
const TEAM_SERVICE = path.join(BACKEND, 'application/common/library/app/group_buy/TeamService.php');
const SF_BRIDGE = path.join(BACKEND, 'application/common/library/app/send_friend/OrderBridge.php');
const SF_GIFT = path.join(BACKEND, 'application/api/controller/app/send_friend/Gift.php');
const ORDER_CTL = path.join(BACKEND, 'application/api/controller/order/Order.php');

const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
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
  const team = strip(src.team);
  const sf = strip(src.sf);
  const gift = strip(src.gift);
  const ctl = strip(src.ctl);

  // 开团 / 参团：insertMember 之后才收尾（顺序不许反）
  const openBlock = (team.match(/public static function openTeam[\s\S]*?\n    \}/) || [''])[0];
  const joinBlock = (team.match(/public static function joinTeam[\s\S]*?\n    \}/) || [''])[0];
  const afterMember = (block) => {
    const idxMember = block.indexOf('self::insertMember(');
    const idxSettle = block.indexOf('self::settleFreeOrder(');
    return idxMember >= 0 && idxSettle > idxMember;
  };
  const paidField = (block) => /'paid'\s*=>\s*\$paid\s*\?\s*1\s*:\s*0/.test(block);

  const settleFn = (team.match(/protected static function settleFreeOrder\([\s\S]*?\n    \}/) || [''])[0];

  return [
    // ① 普通单口径仍在（0 元直接 paySuccess + 回体翻成功）
    ['①a 普通单仍对 real_price == 0 直接 paySuccess',
      /if\s*\(\s*\$order\['real_price'\]\s*==\s*0\s*\)/.test(ctl)
      && /Order::paySuccess\(/.test(ctl) && /STATUS_SUCCESS/.test(ctl)],
    // ② 拼团
    ['②a 开团：insertMember 之后才调 settleFreeOrder',
      afterMember(openBlock), openBlock ? 'member=' + openBlock.indexOf('self::insertMember(') + ' settle=' + openBlock.indexOf('self::settleFreeOrder(') : 'block=missing'],
    ['②b 参团：insertMember 之后才调 settleFreeOrder', afterMember(joinBlock)],
    ['②c 返回体带 paid（0/1）', paidField(openBlock) && paidField(joinBlock)],
    ['②d settleFreeOrder 真的走 paySuccess，且有价单先返回 false',
      /floatval\(\$order\['price'\]\)\s*>\s*0/.test(settleFn) && /return false;/.test(settleFn)
      && /OrderModel::paySuccess\(/.test(settleFn)],
    // ③ 送好友购买单
    ['③a createGiverOrder 对 0 元（非虚拟支付）当场 paySuccess',
      /\$realPrice\s*<=\s*0\s*&&\s*\$isVirtualPay\s*===\s*0/.test(sf)
      && /OrderModel::paySuccess\(/.test(sf)],
    ['③b createGiverOrder 返回体带 paid', /'paid'\s*=>\s*\$paid\s*\?\s*1\s*:\s*0/.test(sf)],
    ['③c gift/create 原样转发 paid', /'paid'\s*=>\s*intval\(isset\(\$order\['paid'\]\)/.test(gift)],
    // ④ 前端
    ['④a 拼团分支认后端 paid 并跳支付成功页（不弹支付面板）',
      /const d = \(res && res\.code === 1 && res\.data\) \|\| null;/.test(order)
      && /if \(Number\(d\.paid\) === 1\) \{[\s\S]{0,200}?\/pages\/public\/result\/result\?order_no=/.test(order)
      && order.indexOf('Number(d.paid) === 1') < order.indexOf("that.showModal('pay')")],
    ['④b 普通/送好友分支：0 元单跳结果页，不弹支付面板',
      /const zeroPaid = Number\(res\.data\.paid\) === 1;/.test(order)
      && /if \(!zeroPaid && \(that\.isSendFriend \|\| res\.data\.status == "unpaid"\)\)/.test(order)],
  ];
}

const FILES = {
  order: () => read(ORDER_VUE),
  team: () => read(TEAM_SERVICE),
  sf: () => read(SF_BRIDGE),
  gift: () => read(SF_GIFT),
  ctl: () => read(ORDER_CTL),
};

if (process.argv.includes('--selftest')) {
  const base = {};
  for (const k of Object.keys(FILES)) base[k] = FILES[k]();
  let fired = 0;
  let bad = 0;
  const expectFire = (name, src) => {
    const r = rules(src);
    const reds = r.filter((x) => !x[1]).length;
    if (reds > 0) { fired++; console.log('[SELFTEST-FIRE] ' + name + ' 已报红（' + reds + ' 条）'); }
    else { bad++; console.log('[SELFTEST-FAIL] ' + name + ' 没被抓红'); }
  };
  // 样件 1：开团先收尾后写成员行（顺序反了 ⇒ pay_success 找不到人）
  expectFire('样件1：settleFreeOrder 提到 insertMember 之前', Object.assign({}, base, {
    team: base.team.replace(/(\n\s*self::insertMember\([^\n]*\n)(\s*\/\/[^\n]*\n)?(\s*\$paid = self::settleFreeOrder\(\$order\);)/,
      '$3\n$1'),
  }));
  // 样件 2：前端不再认 paid（退回无条件弹支付面板）
  expectFire('样件2：拼团分支删掉 paid 判断', Object.assign({}, base, {
    order: base.order.replace(/\/\/ 0 元单（含券后 0 元）[\s\S]*?that\.showModal\('pay'\);/, "that.showModal('pay');"),
  }));
  // 样件 3：送好友桥不再收尾
  expectFire('样件3：createGiverOrder 0 元收尾被摘', Object.assign({}, base, {
    sf: base.sf.replace(/\$realPrice <= 0 && \$isVirtualPay === 0/, 'false'),
  }));
  console.log('\n[SELFTEST] 坏样件 ' + fired + ' 条被抓红（要求 ≥3），未抓红 ' + bad + ' 条');
  process.exitCode = bad === 0 && fired >= 3 ? 0 : 1;
} else {
  const src = {};
  for (const k of Object.keys(FILES)) src[k] = FILES[k]();
  for (const [name, ok, got] of rules(src)) assert(name, ok, got);
  console.log('\n共 ' + (pass + fail) + ' 条，失败 ' + fail + ' 条');
  process.exitCode = fail === 0 ? 0 : 1;
}
