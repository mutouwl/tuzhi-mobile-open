/**
 * 券使用页「立即使用」回店铺主页（2026-10-27 用户点名）
 *
 * 用户原话：「pages/app/coupon/use/use?id=18 点击立即使用，应该跳转到店铺主页」。
 * 旧写法：券使用页复用 coupon-my 且卡里那枚按钮也调 `use()` → 又跳回
 * `/pages/app/coupon/use/use?id=<券id>` —— 本页就是「使用」的落点，点了等于原地不动。
 *
 * 合并后的形态（2026-10-27 券页照参考图重做 + 另一台电脑推上来的 hero 版式）：
 *  ① 券卡传 `hide-action`，卡里不再摆第二枚入口（一屏一主操作，M17）；
 *  ② 页内唯一主操作「立即使用」（`data.can_use` 那一支）调 `use()`；
 *  ③ `use()` 走 `$nav.to('/pages/index/index', 'local', 'reLaunch')` 回店铺主页，
 *     跳法照 `tz-footer`「店铺主页」同一档（首页是站点根，reLaunch 清栈，不叠层）；
 *  ④ `coupon-my` 不留 `useHome` 死 prop（旧方案已由「页内主操作」取代，硬约束 31）。
 *
 * 用法：node tuzi-mobile/scripts/check-coupon-use-jump.js
 *       node tuzi-mobile/scripts/check-coupon-use-jump.js --selftest
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const FILES = {
  component: 'src/components/coupon/coupon-my.vue',
  usePage: 'src/pages/app/coupon/use/use.vue',
  useJs: 'src/pages/app/coupon/use/js.vue',
};

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/** 取方法体（按大括号配平，不依赖缩进） */
function bodyOf(code, signature) {
  const at = typeof signature === 'string' ? code.indexOf(signature) : code.search(signature);
  if (at < 0) return null;
  const open = code.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') {
      depth--;
      if (!depth) return code.slice(open + 1, i);
    }
  }
  return null;
}

function run(srcs) {
  const out = [];
  const ok = (name, cond, got) => out.push({ name, ok: !!cond, got });

  const useBody = bodyOf(srcs.useJs, /use\s*\(\s*\)\s*\{/);
  const couponUseBody = bodyOf(srcs.component, /use\s*\(\s*id\s*\)\s*\{/);
  const hintTag = (srcs.usePage.match(/<coupon-my\b[^>]*>/g) || []).join(' ');

  ok('① 券使用页的券卡收掉行内按钮（传 hide-action，一屏只留页内主操作）',
    /\bhide-action\b/.test(hintTag),
    hintTag || '(没找到 <coupon-my>)');

  ok('② 页内「立即使用」那一支调 use()',
    /data\.can_use/.test(srcs.usePage) && /@click="use\(\)"/.test(srcs.usePage));

  ok('③ use() 回店铺主页：$nav.to 首页 + reLaunch',
    !!useBody && /\$nav\.to\(\s*["']\/pages\/index\/index["']\s*,\s*["']local["']\s*,\s*["']reLaunch["']\s*\)/.test(useBody),
    useBody ? useBody.replace(/\s+/g, ' ').trim().slice(0, 80) : '(没找到 use())');

  ok('④ use() 不再跳回本页（原地打转）',
    !!useBody && !/coupon\/use\/use/.test(useBody),
    useBody ? 'contains coupon/use/use=' + /coupon\/use\/use/.test(useBody) : '(没找到 use())');

  ok('⑤ coupon-my 不留 useHome 死 prop',
    !/useHome/.test(srcs.component) && !/use-home/.test(srcs.component));

  ok('⑥ 其余调用点仍走默认档：card 的 use() 跳券使用页',
    !!couponUseBody && /\$nav\.to\(\s*["']\/pages\/app\/coupon\/use\/use\?id=["']\s*\+\s*id\s*\)/.test(couponUseBody),
    couponUseBody ? 'ok' : '(没找到 coupon-my 的 use(id))');

  return out;
}

function report(results) {
  let pass = 0;
  let fail = 0;
  for (const r of results) {
    if (r.ok) { pass++; console.log('[PASS] ' + r.name + (r.got === undefined ? '' : ' -> ' + r.got)); }
    else { fail++; console.log('[FAIL] ' + r.name + (r.got === undefined ? '' : ' -> ' + r.got)); }
  }
  return { pass, fail };
}

function loadSources() {
  return { component: read(FILES.component), usePage: read(FILES.usePage), useJs: read(FILES.useJs) };
}

function selftest() {
  const base = loadSources();
  const clone = () => ({ ...base });
  const cases = [
    ['use() 改回 toast', () => { const s = clone(); s.useJs = s.useJs.replace(/that\.\$nav\.to\(["']\/pages\/index\/index["'][\s\S]*?\);/,'uni.$u.toast("下单结算时选择本优惠券即可抵扣");'); return s; }],
    ['reLaunch 改成 navigateTo', () => { const s = clone(); s.useJs = s.useJs.replace('"local", "reLaunch"', '"local", "navigateTo"'); return s; }],
    ['use() 又跳回本页', () => { const s = clone(); s.useJs = s.useJs.replace('that.$nav.to("/pages/index/index", "local", "reLaunch");','that.$nav.to("/pages/app/coupon/use/use?id=" + 1);'); return s; }],
    ['券卡不传 hide-action', () => { const s = clone(); s.usePage = s.usePage.replace(/\s*hide-action(?=\s*\/?>)/, ''); return s; }],
    ['coupon-my 加回 useHome prop', () => { const s = clone(); s.component = s.component.replace(/hideAction\s*:\s*\{/, 'useHome: {\n\t\t\ttype: Boolean,\n\t\t\tdefault: false,\n\t\t},\n\t\thideAction: {'); return s; }],
  ];

  let bad = 0;
  console.log('==== 坏样件（每颗都必须报红） ====');
  for (const [name, mutate] of cases) {
    const res = run(mutate());
    const fails = res.filter((r) => !r.ok);
    if (fails.length) console.log('[OK]   ' + name + ' -> ' + fails.length + ' 条报红（' + fails.map((r) => r.name.slice(0, 2)).join(',') + '）');
    else { bad++; console.log('[BAD]  ' + name + ' -> 一条都没报红，判据失效'); }
  }
  const real = report(run(loadSources()));
  console.log('==== 真源码 ==== PASS ' + real.pass + ' / FAIL ' + real.fail);
  if (bad || real.fail) {
    console.log('结论：' + (bad ? bad + ' 颗坏样件没抓红 ' : '') + (real.fail ? real.fail + ' 条真源码判红' : ''));
    process.exit(1);
  }
  console.log('结论：坏样件全部抓红，真源码全绿');
}

if (process.argv.includes('--selftest')) {
  selftest();
} else {
  const results = run(loadSources());
  const { fail } = report(results);
  console.log('\n' + (fail ? 'FAIL ' + fail : 'PASS') + '（共 ' + results.length + ' 条）');
  process.exit(fail ? 1 : 0);
}
