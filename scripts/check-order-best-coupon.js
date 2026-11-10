#!/usr/bin/env node
/**
 * 下单页「默认选中一张最优券」（2026-10-29 用户点名「优惠券可以默认选中一个最优的」）
 *
 * 口径：**核算档**（`order.calculate` / 拼团 `team.calc`）在用户没指定券时带 `auto_coupon=1`，
 * 由后端在「本单可用券」里挑 `coupon_money` 最大的一张并回 `coupon_id`，端上回填券行；
 * 「最优」只按本单真实抵扣额比（折扣券的抵扣额随商品金额变），不按面额猜。
 *
 * 这条链上任何一处掉了都还是「能用但没默认选」或者更糟「金额按券算了、提交却没带券」：
 *   ① 下单页首屏发 `auto_coupon`，回体把 `coupon_id` 回填到 `form`；
 *   ② 用户自己选过（含「不使用优惠券」）之后不许再自动改回来；
 *   ③ 换商品/换拼团活动要重新挑（上一单的券未必适用新商品），改份数不重挑；
 *   ④ 拼团档走 `team.calc` 自动档，骨架留到券算完；
 *   ⑤ 缺取价必需项（线下活动报名信息 / 教务套餐校区学生）时先不挑，填完再补；
 *   ⑥ 券弹窗打开时回显外部选中态（否则「券行有抵扣、弹窗里没勾」）；
 *   ⑦ 后端只在核算档自动、虚拟支付不挑、建单档永不自动，且四个触点都读到了 `auto_coupon`。
 *
 * 用法：node scripts/check-order-best-coupon.js [--selftest]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.resolve(ROOT, '..', 'tuzhi-selfbuilt-backend');
const ORDER = path.join(ROOT, 'src/components/order/submit-order.vue');
const PICKER = path.join(ROOT, 'src/components/coupon/coupon-picker-modal.vue');
const BACK = (p) => path.join(BACKEND, p);

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
  const picker = strip(src.picker);
  const orderCreate = strip(src.orderCreate !== undefined ? src.orderCreate : read(BACK('application/common/library/order/OrderCreate.php')));
  const bridge = strip(src.bridge !== undefined ? src.bridge : read(BACK('application/common/library/app/group_buy/OrderBridge.php')));
  const orderCtl = strip(src.orderCtl !== undefined ? src.orderCtl : read(BACK('application/api/controller/order/Order.php')));
  const teamCtl = strip(src.teamCtl !== undefined ? src.teamCtl : read(BACK('application/api/controller/app/group_buy/Team.php')));

  // 「这一屏该用哪张券」的指纹只该由商品/拼团身份与类型决定，份数不进（改份数不重挑）
  const sigBody = (order.match(/couponCtxSig\s*\(\)\s*\{([\s\S]*?)\n\s{12}\}/) || [])[1] || '';
  const calcAuto = (order.match(/calcGroupBuyAmount\s*\(\s*auto[^)]*\)\s*\{([\s\S]*?)\n\s{12}\}/) || [])[1] || '';

  return [
    // ① 下单页首屏 + 回填
    ['①a 首屏核算只在「没选过券」时带 auto_coupon',
      /const autoCoupon = !silent && !this\.couponAutoTried && !\(Number\(this\.form\.coupon_id\) > 0\)/.test(order)
      && /if \(autoCoupon\) \{\s*form\.auto_coupon = 1;/.test(order)],
    ['①b 回体 coupon_id 回填到 form，并记下「已经自动挑过」',
      /that\.couponAutoTried = true;[\s\S]{0,200}?Number\(\(res\.data \|\| \{\}\)\.coupon_id\)[\s\S]{0,120}?that\.form\.coupon_id = picked;/.test(order)],

    // ② 用户选过不再自动
    ['②a 用户选券/「不使用」之后不许再被自动改回',
      /couponChange\(id\)\s*\{[\s\S]{0,160}?this\.couponAutoTried = true;/.test(order)],

    // ③ 换商品重挑、改份数不重挑
    ['③a 换商品/换活动重置自动选券（清券 + 允许重挑）',
      /resetCouponForCtx\(\)\s*\{[\s\S]{0,420}?this\.couponAutoTried = false;[\s\S]{0,120}?this\.form\.coupon_id = '';/.test(order)],
    ['③b watch 与 mounted 两条入口都复位',
      (order.match(/resetCouponForCtx\(\);/g) || []).length >= 2],
    ['③c 券上下文指纹里不含份数（改份数不该重挑）',
      sigBody.length > 0 && !/\bcount\b\s*:/.test(sigBody) && !/gbCtx\.count/.test(sigBody)],

    // ④ 拼团自动档 + 骨架收口
    ['④a 拼团试算自动档带 auto_coupon，并回填 d.coupon_id',
      /if \(auto\) \{\s*params\.auto_coupon = 1;/.test(calcAuto)
      && /if \(auto\) \{[\s\S]{0,200}?Number\(d\.coupon_id\)[\s\S]{0,120}?that\.form\.coupon_id = picked;/.test(calcAuto)],
    ['④b 拼团首屏骨架留到券算完（done 回调撤 loading）',
      /calcGroupBuyAmount\(true, function \(\) \{ that\.loading = false; \}\)/.test(order)
      && /finish\(\)/.test(calcAuto)],
    ['④c 拼团缺取价必需项时先不挑（报名信息 / 校区学生）',
      /canAutoPickCoupon\(\)\s*\{[\s\S]{0,400}?gbExtra\.kind === 'activity' && !this\.gbExtra\.formUserId/.test(order)
      && /canAutoPickCoupon\(\)\s*\{[\s\S]{0,520}?gbExtra\.kind === 'school' && \(!this\.gbExtra\.campusId \|\| !this\.gbExtra\.studentId\)/.test(order)],
    ['④d 补齐必需项后补挑一次（tryAutoCouponGb 有调用点）',
      /tryAutoCouponGb\(\)\s*\{[\s\S]{0,260}?calcGroupBuyAmount\(true\)/.test(order)
      && (order.match(/(?:this|that)\.tryAutoCouponGb\(\);/g) || []).length >= 3],

    // ⑤ 券弹窗回显
    ['⑤ 券弹窗打开时把外部选中态带进来',
      /if \(this\.visible\) \{[\s\S]{0,260}?this\.couponCheckedId = this\.checkedId;[\s\S]{0,160}?this\.refresh\(\)/.test(picker)],

    // ⑥ 后端：只在核算档、跳过虚拟支付、按真实抵扣额取最大、回体带 coupon_id
    ['⑥a 自动选券只在核算档（建单档永不自动）',
      /elseif \(\$this->calc_type !== 'create' && \$this->autoPickCoupon\(\)\)/.test(orderCreate)],
    ['⑥b 虚拟支付不自动挑券',
      /function autoPickCoupon\(\)[\s\S]{0,600}?\$this->isUseVirtualPay\(\)/.test(orderCreate)],
    ['⑥c 排序取 checkCoupon 算出来的 coupon_money 最大值',
      /foreach \(\$list\['can_use'\] as \$coupon\) \{[\s\S]{0,220}?floatval\(\$coupon->coupon_money\)[\s\S]{0,160}?\$bestMoney/.test(orderCreate)],
    ['⑥d 核算回体带 coupon_id（端上回填的唯一来源）',
      /'coupon_id' => \$this->couponIdOfResult\(\)/.test(orderCreate)],
    ['⑥e 扫券不重算金额（scanCoupons 与 getCoupons 共用一份）',
      /private function scanCoupons\(\)/.test(orderCreate)
      && /return \$this->scanCoupons\(\);/.test(orderCreate)],
    ['⑥f 0 元单不自动选券（券抵不到钱，挑上等于白核销一张）',
      /function autoPickCoupon\(\)[\s\S]{0,800}?orderData\['goods_total_price'\]\) <= 0/.test(orderCreate)],

    // ⑦ 四个触点都读到了 auto_coupon
    ['⑦a order.calculate 读 auto_coupon',
      /post\('auto_coupon'/.test(orderCtl) && /'auto_coupon'=>\$autoCoupon/.test(orderCtl.replace(/\s/g, ''))],
    ['⑦b 拼团试算读 auto_coupon',
      /param\('auto_coupon'/.test(teamCtl)],
    ['⑦c OrderBridge 透传 auto_coupon',
      /'auto_coupon' => intval\(isset\(\$ctx\['auto_coupon'\]\)/.test(bridge)],

    // ⑧ 券行没抵扣时的文案分档（2026-10-30 用户点名「如果当前没有可用的优惠券，那么就显示
    //    暂无可用优惠券，不要显示请选择优惠券了」）：端上分不出两档，判据由后端 `coupon_can_use` 答
    ['⑧a 后端核算回体带本单可用券张数（含无副作用计数方法）',
      /'coupon_can_use' => \$this->availableCouponCount\(\)/.test(orderCreate)
      && /function availableCouponCount\(\)/.test(orderCreate)
      && /scanCoupons\(\)[\s\S]{0,120}?orderData\['coupon'\] = \$saved;/.test(orderCreate)],
    ['⑧b 券行两档：有券没选「请选择优惠券」/ 一张都没有「暂无可用优惠券」',
      /couponEmptyText\(\)\s*\{[\s\S]{0,700}?coupon_can_use[\s\S]{0,260}?'暂无可用优惠券'/.test(order)
      && /'请选择优惠券'/.test(order)],
    ['⑧c 拼团档单独回填 coupon_can_use（拼团不吃 order.calculate）',
      /that\.\$set\(that\.data, 'coupon_can_use'/.test(order)],
    ['⑧d 券弹窗空态按页签：可用档说「暂无可用优惠券」',
      /'暂无可用优惠券'/.test(picker)],

    // ⑨ 选了券却没生效时不许静默（2026-11-02 客户反馈「实物商品选券后价格不变、也没有选中提示」）：
    //    核算档不报错（code 仍为 1），原因只在 `data.msg`；原先只有拼团分支读它，普通下单连实物单
    //    都是「价格不动、券行还是请选择优惠券、一句话也没有」，且无效券一直挂在 form 上带到建单
    ['⑨a 券没生效时清掉 form.coupon_id 并把 data.msg 说给用户',
      /const askedCoupon = Number\(form\.coupon_id\) \|\| 0;[\s\S]{0,200}?const usedCoupon = Number\(\(res\.data \|\| \{\}\)\.coupon_id\) \|\| 0;/.test(order)
      && /else if \(askedCoupon > 0 && usedCoupon !== askedCoupon\) \{[\s\S]{0,320}?that\.form\.coupon_id = 0;[\s\S]{0,320}?res\.data && res\.data\.msg/.test(order)],
    ['⑨b 券被拒时透出 checkCoupon 的具体原因（记录 + 使用两处都在）',
      /protected \$couponRejectReason/.test(orderCreate)
      && /couponRejectReason = !empty\(\$result\['cannot_use_msg'\]\)/.test(orderCreate)
      && /\$this->exception\(\$this->couponRejectReason \?: '优惠券不可用'\)/.test(orderCreate)],
    // 抵 0 元的券不许核销（2026-11-02 线上实测抓到「券挂进订单、金额一分不减、券被用掉」）。
    // 判据必须落在 `checkCoupon()`：券列表（scanCoupons）与试算（calcCoupon）读同一处，
    // 否则又会出现「列表说可用、选了不抵钱」——用户原话「既然显示在可用里就该能用」。
    ['⑨c 抵 0 元的券在 checkCoupon 就判不可用（列表与试算同源）+ 建单兜底',
      /if \(\s*floatval\(\$coupon->coupon_money\) <= 0\) \{[\s\S]{0,160}?\$can_use = false;[\s\S]{0,160}?该优惠券在本单可抵扣金额为 0/.test(orderCreate)
      && /floatval\(\$this->orderData\['coupon'\]->coupon_money\) <= 0\) \{[\s\S]{0,260}?\$this->orderData\['coupon'\] = null;/.test(orderCreate)],
  ];
}

const src = {
  order: read(ORDER),
  picker: read(PICKER),
  orderCreate: read(BACK('application/common/library/order/OrderCreate.php')),
  bridge: read(BACK('application/common/library/app/group_buy/OrderBridge.php')),
  orderCtl: read(BACK('application/api/controller/order/Order.php')),
  teamCtl: read(BACK('application/api/controller/app/group_buy/Team.php')),
};

const list = rules(src);
list.forEach(([name, ok]) => assert(name, ok));
console.log('\n共 ' + list.length + ' 条，失败 ' + fail + ' 条');

/** 坏样件自检：核心几处改坏必须各自报红（全绿说明门禁没长眼） */
if (process.argv.includes('--selftest')) {
  const red = (caseName, mutate, rulePrefix, target = 'order') => {
    const broken = mutate(src[target]);
    const hit = rules({ ...src, [target]: broken }).find(([n]) => n.indexOf(rulePrefix) === 0);
    const ok = broken !== src[target] && hit && hit[1] === false;
    if (ok) { console.log('[PASS] 反例能红：' + caseName); }
    else { console.log('[FAIL] 反例没红（门禁判据失效）：' + caseName); fail++; }
  };
  console.log('\n--- 坏样件自检 ---');
  red('首屏不带 auto_coupon', (s) => s.replace('form.auto_coupon = 1;', 'form.auto_coupon = 0;'), '①a');
  red('回体不回填 coupon_id', (s) => s.replace('that.form.coupon_id = picked;', 'that.form.coupon_id = 0;'), '①b');
  red('用户选过仍被自动改回', (s) => s.replace(/(couponChange\(id\) \{[\s\S]{0,260}?)this\.couponAutoTried = true;/, '$1'), '②a');
  red('拼团自动档不带 auto_coupon', (s) => s.replace('params.auto_coupon = 1;', 'params.auto_coupon = 0;'), '④a');
  red('券弹窗不回显外部选中态', (s) => s.split('this.couponCheckedId = this.checkedId;').join(''), '⑤', 'picker');
  red('建单档也自动选券', (s) => s.replace("$this->calc_type !== 'create' && $this->autoPickCoupon()", '$this->autoPickCoupon()'), '⑥a', 'orderCreate');
  red('虚拟支付也挑券', (s) => s.replace(/if \(\$this->isUseVirtualPay\(\)\) \{\s*return 0;\s*\}/, ''), '⑥b', 'orderCreate');
  red('0 元单也挑券', (s) => s.replace(/if \(floatval\(\$this->orderData\['goods_total_price'\]\) <= 0\) \{\s*return 0;\s*\}/, ''), '⑥f', 'orderCreate');
  red('核算回体不吐可用券张数', (s) => s.replace("'coupon_can_use' => $this->availableCouponCount(),", ''), '⑧a', 'orderCreate');
  red('券行没券时退回「请选择优惠券」', (s) => s.replace("'暂无可用优惠券'", "'请选择优惠券'"), '⑧b');
  red('选券没生效仍静默（不清券、不提示）',
    (s) => s.replace(/that\.form\.coupon_id = 0;\s*uni\.showToast\(\{/, 'uni.showToast({'), '⑨a');
  red('券被拒原因被笼统化', (s) => s.replace("$this->couponRejectReason ?: '优惠券不可用'", "'优惠券不可用'"), '⑨b', 'orderCreate');
  red('抵 0 元的券照样核销', (s) => s.replace("floatval($this->orderData['coupon']->coupon_money) <= 0", "floatval($this->orderData['coupon']->coupon_money) < 0"), '⑨c', 'orderCreate');
  console.log('自检失败 ' + fail + ' 条');
  if (fail > 0) { process.exit(1); }
}

process.exit(fail ? 1 : 0);
