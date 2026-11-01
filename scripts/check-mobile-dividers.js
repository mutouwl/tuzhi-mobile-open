// mobile「分隔条一律取页面底色」的机器验法（2026-10-28 全局收口，接 M58 / 硬约束 42）
//
// 口径：
//   ① `components/tz/divider.vue` 的默认底色 = App.vue 的页面底（`rgba(250,250,250,1)` = #fafafa）；
//   ② 页面/组件里的 `tz-divider` 一律显式给颜色，不再靠默认值（裸标签 = 又回到旧默认，必须报红）；
//   ③ 旧灰 `#f5f5f5` 不许再出现在任何 `tz-divider` 上（块间那几枚取 #fafafa，卡内取 #fff/none）；
//   ④ 自定义页面（`pages/index/index.vue`、`components/tz/custom-form.vue`）的颜色来自装修配置，
//      必须继续绑 `:bg-color="…config.bgColor"`，**不许**写死 #fafafa（改了就会覆盖商家已装修好的颜色）。
//   ⑤ 分隔线一律用 `tz-divider`，**不许自绘**：水平方向的 `repeating-linear-gradient`（竖条纹横向重复
//      = 一条横贯虚线）就是自绘分隔线的形状，颜色一取主色就成了一条抢眼的亮线（2026-10-31 票券详情页
//      `pages/app/activity/ticketdetail` 蓝色虚线用户点名）。这类写法常落在**页面的 css.css** 里，
//      所以本脚本除了 `.vue` 也要扫 `.css`（只扫 .vue 的那一版看不见它）。
//
// 跑法：node tuzi-mobile/scripts/check-mobile-dividers.js
//      node tuzi-mobile/scripts/check-mobile-dividers.js --selftest   # 每类坏样件必须各红一次
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APP = 'src/App.vue';
const COMPONENT = 'src/components/tz/divider.vue';
const CUSTOM_PAGES = ['src/pages/index/index.vue', 'src/components/tz/custom-form.vue'];
const LEGACY = 'src/user/'; // pages.json 未登记的旧目录，不参与门禁

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) { walk(p, out); }
    else if (/\.(vue|css)$/.test(p)) { out.push(p); }
  }
  return out;
}

function listFiles() {
  return walk(path.join(ROOT, 'src'), [])
    .map((p) => path.relative(ROOT, p).split(path.sep).join('/'))
    .filter((p) => p.indexOf(LEGACY) !== 0)
    .sort();
}

/** 去掉 <!-- --> 注释，避免把注释里的旧写法当成违规；同时保留行号所需的换行 */
function stripComments(src) {
  return src.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
}

/** 取出所有 tz-divider 标签（可跨行）及其之前的 tz-box 嵌套深度 */
function dividersOf(src) {
  const clean = stripComments(src);
  const rows = [];
  let depth = 0;
  const re = /<tz-divider\b[\s\S]*?\/?>/g;
  let last = 0;
  let m;
  while ((m = re.exec(clean))) {
    const before = clean.slice(last, m.index);
    depth += (before.match(/<tz-box\b/g) || []).length - (before.match(/<\/tz-box>/g) || []).length;
    if (depth < 0) { depth = 0; }
    rows.push({ tag: m[0], depth, line: clean.slice(0, m.index).split('\n').length });
    last = re.lastIndex;
  }
  return rows;
}

const colorOf = (tag) => {
  const m = tag.match(/(?::bg-color|bgColor)="([^"]*)"/);
  return m ? m[1] : null;
};
const isCustomBinding = (tag) => /:bg-color="[^"]*(config\.bgColor)[^"]*"/.test(tag);

/** 自绘的「横贯分隔线」：水平方向的 `repeating-linear-gradient`（竖条纹横向重复 = 一条横贯虚线）。
 *  斜角/多色的装饰条（如提交订单页地址卡那条 -45deg 彩条）不是分隔线，不在此列。
 *  注释先抹成空白，行号不丢。 */
function handDrawnSeparatorsOf(src) {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const re = /repeating-linear-gradient\(\s*([^,]+),/g;
  const rows = [];
  let m;
  while ((m = re.exec(clean))) {
    const dir = m[1].trim().toLowerCase().replace(/\s+/g, ' ');
    if (/^(90deg|270deg|-90deg|to right|to left)$/.test(dir)) {
      rows.push(clean.slice(0, m.index).split('\n').length);
    }
  }
  return rows;
}

function runCase(files) {
  const out = [];
  const ok = (id, pass, note) => out.push({ id, pass: !!pass, note: note || '' });

  const component = files[COMPONENT] || '';
  const app = files[APP] || '';
  const appPageBg = (app.match(/page\s*\{[^}]*background:\s*rgba\(250,\s*250,\s*250,\s*1\)/) || [])[0];
  ok('A1 页面底色唯一真源是 App.vue 的 page{rgba(250,250,250,1)}（= #fafafa）', !!appPageBg,
    appPageBg ? 'page 规则命中' : 'App.vue 的 page 背景不是 rgba(250,250,250,1)');

  const def = (component.match(/bgColor\s*:\s*\{[\s\S]*?default\s*:\s*'([^']*)'/) || [])[1];
  ok('A2 tz-divider 默认底色 = 页面底色 #fafafa', def === '#fafafa',
    '当前默认 ' + (def || '没读到'));

  const bare = [];
  const oldGray = [];
  const blockNotPage = [];
  for (const f of Object.keys(files)) {
    if (f.indexOf('src/') !== 0) { continue; }
    for (const r of dividersOf(files[f])) {
      const color = colorOf(r.tag);
      if (color === null) { bare.push(f + ':' + r.line); }
      if (color === '#f5f5f5') { oldGray.push(f + ':' + r.line); }
      if (r.depth === 0 && color !== null && color !== '#fafafa' && color !== 'none') {
        blockNotPage.push(f + ':' + r.line + '=' + color);
      }
    }
  }
  ok('A3 全站没有裸 `<tz-divider>`（颜色必须显式，不靠默认值）', bare.length === 0, bare.join(' | ') || '裸标签 0 枚');
  ok('A4 全站没有 `#f5f5f5` 的 tz-divider（旧默认灰一律退场）', oldGray.length === 0, oldGray.join(' | ') || '#f5f5f5 0 枚');
  ok('A5 块间（tz-box 之外）的条取页面底色 #fafafa 或 transparent（none）', blockNotPage.length === 0,
    blockNotPage.join(' | ') || '块间条全部合规');

  const customBad = [];
  for (const f of CUSTOM_PAGES) {
    const src = files[f] || '';
    const rows = dividersOf(src);
    const allBound = rows.length > 0 && rows.every((r) => isCustomBinding(r.tag));
    if (!allBound) { customBad.push(f + '（divider 未绑 config.bgColor，或写死了颜色）'); }
  }
  ok('A6 自定义页面的 tz-divider 仍逐枚绑装修配置 config.bgColor（改默认色不影响已装修页面）',
    customBad.length === 0, customBad.join(' | ') || '两处均绑配置');

  const handDrawn = [];
  for (const f of Object.keys(files)) {
    if (f.indexOf('src/') !== 0) { continue; }
    for (const line of handDrawnSeparatorsOf(files[f])) { handDrawn.push(f + ':' + line); }
  }
  ok('A7 分隔线一律用 tz-divider —— 全站 0 处自绘的横贯虚线（.vue 与 .css 一起扫）',
    handDrawn.length === 0, handDrawn.join(' | ') || '自绘分隔线 0 处');

  return out;
}

function load() {
  const files = {};
  for (const rel of listFiles()) { files[rel] = fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n'); }
  return files;
}

const base = load();

if (process.argv.indexOf('--selftest') > -1) {
  const cases = [
    { name: '组件默认退回旧灰 #f5f5f5', patch: [COMPONENT, "default:'#fafafa'", "default:'#f5f5f5'"] },
    { name: 'App.vue 页面底改值', patch: [APP, 'background: rgba(250, 250, 250, 1);', 'background: rgba(247, 248, 250, 1);'] },
    { name: '页面里出现裸 tz-divider', patch: ['src/pages/user/setting/setting.vue', '<tz-divider bgColor="#fafafa" />', '<tz-divider />'] },
    { name: '块间条写回旧灰', patch: ['src/pages/user/merge/merge.vue', '<tz-divider bgColor="#fafafa" />', '<tz-divider bgColor="#f5f5f5" />'] },
    { name: '自定义页面写死页面底色', patch: ['src/pages/index/index.vue', ':bg-color="data.compontents[index].config.bgColor"', 'bgColor="#fafafa"'] },
    { name: '页面 css 里自绘横贯虚线（票券详情那条蓝线）', patch: ['src/pages/app/activity/ticketdetail/css.css', '.tkd-page{', '.tkd-dash{ background-image: repeating-linear-gradient(90deg, #0968F6 0, #0968F6 10px, transparent 10px, transparent 18px); }\n.tkd-page{'] },
  ];
  let red = 0;
  cases.forEach((c) => {
    const [key, from, to] = c.patch;
    if ((base[key] || '').indexOf(from) < 0) { console.log('[SKIP] 样件没落点：' + c.name); return; }
    const files = Object.assign({}, base);
    files[key] = files[key].replace(from, to);
    const failed = runCase(files).filter((r) => !r.pass);
    if (failed.length) { red++; console.log('[RED] ' + c.name + ' → ' + failed.map((r) => r.id).join(',')); }
    else { console.log('[恒绿] ' + c.name + ' 没让任何判据变红'); }
  });
  console.log('\n能红 ' + red + ' / ' + cases.length);
  process.exit(red === cases.length ? 0 : 1);
}

const results = runCase(base);
let fail = 0;
results.forEach((r) => {
  if (!r.pass) { fail++; }
  console.log((r.pass ? '[PASS] ' : '[FAIL] ') + r.id + ' ' + r.note);
});
console.log('\n共 ' + results.length + ' 条，失败 ' + fail + ' 条');
process.exit(fail ? 1 : 0);
