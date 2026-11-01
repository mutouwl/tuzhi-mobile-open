/**
 * 自定义页领券只刷新那一枚券（2026-10-20 用户点名）
 *
 * 用户原话：「自定义页面中领取优惠券会触发整个页面刷新，要改为局部」。
 * 旧写法是子组件 `$emit('refresh')` → 首页 `refresh()` → `getData()` 整页重取，
 * 券是领到了，但整页组件（含图片、轮播、课程列表）全部重排一次。
 *
 * 钉四件事：
 *  ① 领取成功那一支不再发 `refresh`，宿主页也不再把 `@refresh` 接到整页 `refresh()`；
 *  ② 子组件就地更新那一枚券：`received` / 用户券表 / 库存 / 领取次数上限；
 *  ③ 上限判据与后端 `Coupon::getGetStatusAttr` 同形（limit_status=1 ⇒ 10000 次，其余按 limit_num）；
 *  ④ 领到最后一个库存 ⇒ `get_over`；领满次数 ⇒ `cannot_get`；否则仍 `can_get`（「继续领」那一档）。
 *
 * 用法：node tuzi-mobile/scripts/check-home-coupon-refresh.js
 *       node tuzi-mobile/scripts/check-home-coupon-refresh.js --selftest
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COUPON = path.join(ROOT, 'src/components/tz/coupon.vue');
const INDEX = path.join(ROOT, 'src/pages/index/index.vue');
const read = (f) => fs.readFileSync(f, 'utf8');
const scriptOf = (f) => (read(f).match(/<script[^>]*>([\s\S]*?)<\/script>/) || [])[1] || '';

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
  if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  return !!ok;
}

function bodyOf(code, signature) {
  const at = code.search(signature);
  if (at < 0) return null;
  const open = code.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') { depth--; if (!depth) return code.slice(open + 1, i); }
  }
  throw new Error(String(signature) + ' 的大括号没配平');
}

function makeVm(items) {
  return {
    coupon: items,
    $set(obj, key, value) { obj[key] = value; },
  };
}

function runApply(body, vm, id, userCoupon) {
  // eslint-disable-next-line no-new-func
  const fn = new Function('id', 'userCoupon', body);
  fn.call(vm, id, userCoupon);
}

function check() {
  const src = scriptOf(COUPON);
  const tpl = read(COUPON);
  const index = read(INDEX);
  const body = bodyOf(src, /applyReceived\s*\([^)]*\)\s*\{/);
  const receiveBody = bodyOf(src, /receive\s*\([^)]*\)\s*\{/);

  assert('① 领取成功仍走 applyReceived，不再发 refresh 事件',
    !!body && !!receiveBody && /applyReceived\s*\(\s*id\s*,\s*res\.data\s*\)/.test(receiveBody)
    && !/\$emit\s*\(\s*["']refresh["']/.test(receiveBody),
    'applyReceived=' + !!body + '，receive 里 refresh 事件=' + /\$emit\s*\(\s*["']refresh["']/.test(receiveBody));

  assert('① 首页不再把 tz-coupon 的 refresh 接到整页 refresh()',
    !/@refresh\s*=\s*["']refresh\s*\(\s*\)["']/.test(index),
    'index 里 @refresh="refresh()"=' + /@refresh\s*=\s*["']refresh\s*\(\s*\)["']/.test(index));

  assert('② applyReceived 写回 received / 用户券表 / 库存 / 领取数',
    !!body && /item\.received\s*=\s*true/.test(body)
    && /user_coupons\.push/.test(body)
    && /item\.stock\s*=\s*Math\.max/.test(body)
    && /item\.get_num\s*=/.test(body));

  assert('② 组件模板用 get_status 决定按钮，不改第二份状态字段',
    /item\.get_status\s*==\s*['"]can_get['"]/.test(tpl));

  // ③ 行为：未领过、不限次、库存充足 ⇒ 继续领
  let item = { id: 7, limit_status: 1, limit_num: 0, stock: 10, get_num: 1, received: false, user_coupons: [], get_status: 'can_get' };
  let vm = makeVm([item]);
  runApply(body, vm, 7, { id: 99, coupon_id: 7 });
  assert('③ 不限次领一张 ⇒ received=true、仍 can_get、库存 -1、用户券 +1',
    item.received === true && item.get_status === 'can_get'
    && item.stock === 9 && item.get_num === 2 && item.user_coupons.length === 1,
    { received: item.received, status: item.get_status, stock: item.stock, count: item.user_coupons.length });

  // ③ 行为：每人限领 1 次 ⇒ 领完即 cannot_get
  item = { id: 8, limit_status: 2, limit_num: 1, stock: 10, get_num: 0, received: false, user_coupons: [], get_status: 'can_get' };
  vm = makeVm([item]);
  runApply(body, vm, 8, { id: 100, coupon_id: 8 });
  assert('③ 限领 1 次领走后 ⇒ cannot_get（后端同一句，不留在「继续领」）',
    item.get_status === 'cannot_get', item.get_status);

  // ③ 行为：限领 2 次、已有一张 ⇒ 再领一张才满
  item = { id: 9, limit_status: 2, limit_num: 2, stock: 10, get_num: 0, received: true, user_coupons: [{ id: 1 }], get_status: 'can_get' };
  vm = makeVm([item]);
  runApply(body, vm, 9, { id: 101, coupon_id: 9 });
  assert('③ 限领 2 次、已有一张 ⇒ 这是第二张，cannot_get',
    item.user_coupons.length === 2 && item.get_status === 'cannot_get',
    { count: item.user_coupons.length, status: item.get_status });

  // ④ 行为：领走最后一张库存 ⇒ get_over
  item = { id: 10, limit_status: 1, limit_num: 0, stock: 1, get_num: 0, received: false, user_coupons: [], get_status: 'can_get' };
  vm = makeVm([item]);
  runApply(body, vm, 10, { id: 102, coupon_id: 10 });
  assert('④ 领走最后一张库存 ⇒ get_over（按钮显示已领完）',
    item.stock === 0 && item.get_status === 'get_over', { stock: item.stock, status: item.get_status });

  // ④ 行为：不存在的券 id 不抛错（宿主页数据被并发替换时的兜底）
  let threw = '';
  try {
    runApply(body, makeVm([]), 404, {});
  } catch (e) { threw = e.message; }
  assert('④ 找不到那一枚券时静默返回（不把已经成功的领取报成异常）', threw === '', threw);

  console.log('\n结果：' + (fail ? '有 ' + fail + ' 项不符合预期' : '全部符合预期') + '（通过 ' + pass + ' 项 / 违反 ' + fail + ' 项）');
  return fail === 0;
}

if (process.argv.includes('--selftest')) {
  // 坏样件：把关键判据换回旧写法，必须各自报红。不写文件，只在内存里改。
  const origRead = fs.readFileSync;
  const badCoupon = read(COUPON)
    .replace(/that\.applyReceived\(id, res\.data\);/, 'that.$emit("refresh", false);')
    .replace(/item\.get_status = "cannot_get";/, 'item.get_status = "can_get";');
  const badIndex = read(INDEX).replace(/<tz-coupon :max_show_num=/, '<tz-coupon @refresh="refresh()" :max_show_num=');
  fs.readFileSync = function (file) {
    if (path.resolve(file) === path.resolve(COUPON)) return badCoupon;
    if (path.resolve(file) === path.resolve(INDEX)) return badIndex;
    return origRead.apply(fs, arguments);
  };
  const ok = check();
  fs.readFileSync = origRead;
  process.exit(ok ? 1 : 0);
}

process.exit(check() ? 0 : 1);
