#!/usr/bin/env node
/**
 * 分销模块（src/pages/app/agent/**）加载态骨架屏验收
 *
 * 依据：.trae/rules/ui-baseline-mobile.md M16（加载态一律骨架屏）
 * 用法：node tuzi-mobile/scripts/check-agent-skeleton.js      （exit 0 = 全部通过）
 *
 * 为什么要单独一只脚本：`node tools/ui-audit.js --pattern loading-not-skeleton` 只抓
 * u-loading-page / tz-loading-page 两种整页遮罩，抓不到 `uni.showLoading({title:'请稍后'})`
 * 那一枚黑底转圈 toast —— 分销模块 12 页里有 7 页当年就是这么写的，审计一路没拦过。
 * 这里把本模块的六条判据钉住，改回去会当场失败。
 */
const fs = require('fs');
const path = require('path');

const AGENT = path.resolve(__dirname, '..', 'src', 'pages', 'app', 'agent');

/**
 * 每页的期望档：
 *   tpl      = 模板文件（页面同名 .vue）
 *   skPrefix = 骨架类名前缀（M11：新增加载行类名一律带页面前缀）
 *   refreshReload = 该页 refresh()/筛选会清空列表 ⇒ loading 要置回 true，否则闪一帧空态（M16）
 *   center 特例：分销中心页刻意不在 onShow / 下拉刷新时重铺骨架屏（已渲染内容不被盖掉），故不查 refreshReload
 */
const PAGES = [
  { dir: 'center', name: 'center', skPrefix: 'agent-sk', refreshReload: false },
  { dir: 'log/customer/log', name: 'log', skPrefix: 'cus-sk', refreshReload: true },
  { dir: 'log/customer/detail', name: 'detail', skPrefix: 'cud-sk', refreshReload: false },
  { dir: 'log/earnings/log', name: 'log', skPrefix: 'ern-sk', refreshReload: true },
  { dir: 'member/level', name: 'level', skPrefix: 'lvl-sk', refreshReload: false },
  { dir: 'member/recruit', name: 'recruit', skPrefix: 'rct-sk', refreshReload: false },
  { dir: 'recommend/goods', name: 'goods', skPrefix: 'gd-sk', refreshReload: true },
  { dir: 'wallet/detail', name: 'detail', skPrefix: 'wdt-sk', refreshReload: true },
  { dir: 'wallet/withdrawlog', name: 'withdrawlog', skPrefix: 'wlg-sk', refreshReload: true },
  { dir: 'wallet/settle', name: 'settle', skPrefix: 'stl-sk', refreshReload: false },
  { dir: 'wallet/withdraw', name: 'withdraw', skPrefix: 'wtd-sk', refreshReload: false },
  { dir: 'wallet/bank', name: 'bank', skPrefix: 'bnk-sk', refreshReload: false },
];

let failed = 0;
const ok = (file, msg) => console.log(`  [ok]   ${file} :: ${msg}`);
const bad = (file, msg) => {
  failed++;
  console.log(`  [FAIL] ${file} :: ${msg}`);
};

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);

PAGES.forEach((page) => {
  const dir = path.join(AGENT, page.dir);
  const tplFile = `${page.name}.vue`;
  const tplPath = path.join(dir, tplFile);
  const jsPath = path.join(dir, 'js.vue');
  const cssPath = path.join(dir, 'css.css');
  const label = page.dir;

  const tpl = read(tplPath);
  const js = read(jsPath);
  const css = read(cssPath);
  if (tpl === null) return bad(label, `模板缺失：${tplFile}`);
  if (js === null) return bad(label, '逻辑文件缺失：js.vue');

  console.log(`\n${label}`);

  // 1. 禁整页加载遮罩与转圈 toast（M16）
  const banned = [
    [/<u-loading-page/, 'u-loading-page 整页遮罩'],
    [/<tz-loading-page/, 'tz-loading-page 整页遮罩'],
    [/uni\.(show|hide)Loading/, 'uni.showLoading / hideLoading 转圈 toast'],
    [/>加载中</, '「加载中」文字块'],
  ];
  banned.forEach(([re, what]) => {
    const hit = [tpl, js].some((src) => re.test(src));
    hit ? bad(label, `仍在使用 ${what}`) : ok(label, `无 ${what}`);
  });

  // 2. 模板要有 loading 驱动的骨架块，且类名带页面前缀（M11）
  if (!/v-if="loading/.test(tpl)) bad(label, '模板没有 v-if="loading" 的骨架屏分支');
  else ok(label, '模板有 loading 骨架分支');
  if (!tpl.includes(page.skPrefix)) bad(label, `骨架类名未带页面前缀 ${page.skPrefix}`);
  else ok(label, `骨架类名前缀 ${page.skPrefix}`);

  // 3. 真实内容要在 !loading / v-else 分支里，不能与骨架屏同屏
  if (!/v-else|v-if="!loading/.test(tpl)) bad(label, '真实内容没有 !loading / v-else 分支（会与骨架屏同屏）');
  else ok(label, '真实内容在 !loading 分支');

  // 4. loading 首屏即为 true（初值 false 会先渲染一帧空态再切骨架屏）
  if (!/loading:\s*true/.test(js) || /loading:\s*false/.test(js)) {
    bad(label, 'data 里 loading 初值不是 true（首帧会闪空态）');
  } else ok(label, 'loading 初值 true');

  // 5. 撤骨架屏要有出口：请求失败也得撤（否则整页停在占位态）
  const clears = (js.match(/loading\s*=\s*false/g) || []).length;
  if (!clears) bad(label, '没有任何 loading = false ⇒ 骨架屏撤不掉');
  else if (!/\.catch\(/.test(js)) bad(label, '撤骨架屏只写在成功分支，请求失败会一直停在占位态');
  else ok(label, `撤骨架屏 ${clears} 处且带 catch 出口`);

  // 6. 筛选/刷新会清空列表的页，loading 要置回 true（M16「搜索/筛选触发时要把 loading 置回 true」）
  if (page.refreshReload) {
    const refresh = js.match(/refresh\(\)\s*\{[\s\S]*?\n\s{4}\}/);
    if (!refresh || !/loading\s*=\s*true/.test(refresh[0])) {
      bad(label, 'refresh() 清空列表后未把 loading 置回 true（换筛选条件会闪一帧空态）');
    } else ok(label, 'refresh() 里 loading 置回 true');
  }

  // 7. 骨架样式自包含（小程序端页面 wxss 不进别的页面的样式），且与全站同一档流光
  if (css === null) return bad(label, '样式文件缺失：css.css');
  if (!new RegExp(`\\.${page.skPrefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`).test(css)) {
    bad(label, `css.css 里没有 ${page.skPrefix} 的骨架样式`);
  } else ok(label, '骨架样式随页自带');
  if (!/linear-gradient\(90deg/.test(css) || !/1\.8s/.test(css)) {
    bad(label, '骨架流光不是全站同一档（90deg / 1.8s）');
  } else ok(label, '流光与全站同档');
});

console.log(`\n${failed === 0 ? '全部通过' : '存在失败项'}：分销模块 ${PAGES.length} 页，[FAIL]=${failed}`);
process.exit(failed ? 1 : 0);
