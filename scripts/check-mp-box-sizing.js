// 小程序端 box-sizing 自检（不构建、不开浏览器）
//
// 为什么要钉这一条：App.vue 里那条全局 `*{box-sizing:border-box}` 在小程序编译期被整条丢掉
// （产物 dist/build/mp-weixin 的 app.wxss / common/main.wxss 里 grep 不到任何 `*{`），
// 而 WXSS 官方选择器列表也没有通配符 —— 于是小程序端每个 <view> 都退回 content-box，
// H5 端却仍然是 border-box。凡「按百分比并排的格子 + 自己带横向内衬/描边」就会算出比容器更宽的一排：
// flex-wrap 的换行判定发生在收缩之前（按 outer hypothetical main size 算），第二枚直接被挤到下一行。
// 实际事故：分销员中心底部「推广商品 / 推广海报」两枚入口（width:calc(50% - 5px) + padding:10px）
// 在微信小程序里换行、H5 看不出 —— 2026-09-28 用户点名。
//
// 口径：这类并排格子必须自己显式写 box-sizing:border-box（参照 components/tz/circle-media-grid.vue
// 的 .post-media-add，那里早就为同一个病补过这一句）。
//
// 用法：node tuzi-mobile/scripts/check-mp-box-sizing.js
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '../src');

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', 'unpackage'].includes(name)) continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(css|scss|vue)$/.test(name)) out.push(p);
  }
  return out;
}

/** 一个 CSS 声明块是否「按百分比并排 + 自带横向内衬/描边 + 没写 box-sizing」 */
function risky(body) {
  if (/\/\*/.test(body)) return null; // 整块里带注释的行（多为被注释掉的旧值）不作判据，避免误报
  const w = body.match(/(?:^|[;{\s])(?:width|flex-basis)\s*:\s*([^;]+)/);
  if (!w) return null;
  const value = w[1].trim();
  const pcts = [...value.matchAll(/(\d+(?:\.\d+)?)%/g)].map((x) => parseFloat(x[1]));
  if (!pcts.length) return null;
  if (pcts.some((v) => v >= 100)) return null; // 整行的格子（100%）不换行，不属本档
  if (Math.max(...pcts) < 40) return null; // 一排多于两枚的小格子由别的口径管
  const horiz = /(?:^|[;{\s])(?:padding|padding-left|padding-right|border|border-left|border-right|border-width)\s*:/.test(body);
  if (!horiz) return null;
  if (/box-sizing\s*:/.test(body)) return null;
  return value;
}

const hits = [];
for (const file of walk(SRC, [])) {
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  if (!/flex-wrap\s*:\s*wrap/.test(text)) continue; // 只盯会换行的那一排
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(text))) {
    const decl = risky(m[2]);
    if (!decl) continue;
    hits.push({
      file: path.relative(path.resolve(__dirname, '../..'), file).split(path.sep).join('/'),
      line: text.slice(0, m.index).split('\n').length,
      sel: m[1].trim().split('\n').pop().trim(),
      decl,
    });
  }
}

console.log(`扫描 ${SRC.replace(/\\/g, '/')} —— 并排百分比格子缺 box-sizing 的落点：${hits.length}`);
for (const h of hits) {
  console.log(`  FAIL ${h.file}:${h.line}  ${h.sel}  {${h.decl}}`);
}
if (hits.length) {
  console.log('修法：在该声明块里补 box-sizing:border-box（小程序不吃 App.vue 的全局 `*`）。');
  process.exit(1);
}
console.log('PASS 没有「并排百分比格子 + 横向内衬却不吃 border-box」的落点');
