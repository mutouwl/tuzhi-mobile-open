// 课程详情页「块与块之间的间隔条取页面底色」的机器验法（M58 第二次被点名的收口，2026-10-27）
//
// 为什么必须落在页面脚本、而不是 `ui-audit` 的一条 pattern：
//   `tz-divider` 的默认值 `#f5f5f5` 在**卡内分隔**上是合法的（跟着白卡），只有**块与块之间**那几枚
//   才必须等于页面底色；「这一枚是在卡片里还是卡片外」是 DOM 嵌套关系，正则判不出来。全站 42 处
//   裸 `<tz-divider />` 里两种都有，通用 pattern 只能全报或全放。所以按页判：
//   用 `tz-box` 的嵌套深度分档——深度 0 = 块间（页面底 `#fafafa`），深度 ≥1 = 卡内（`none`/`#fff`）。
//
// 跑法：node tuzi-mobile/scripts/check-course-detail-dividers.js
//      node tuzi-mobile/scripts/check-course-detail-dividers.js --selftest   # 逐条喂坏样件，必须各红一次
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');

const PAGE = 'src/pages/course/detail/detail.vue';
const COLUMN = 'src/pages/course/components/column-belongs.vue';
const CSS = 'src/pages/course/detail/css.css';
const APP = 'src/App.vue';

/** 取 `tz-box` 的嵌套深度：返回 [{ tag, depth }]，depth 是这一行 tag 出现时的盒内层数 */
function dividersOf(src) {
  const rows = [];
  let depth = 0;
  src.split('\n').forEach((ln) => {
    const open = (ln.match(/<tz-box\b/g) || []).length;
    const close = (ln.match(/<\/tz-box>/g) || []).length;
    if (/<tz-divider\b/.test(ln)) {
      const tag = (ln.match(/<tz-divider\b[^>]*>/) || [''])[0];
      rows.push({ tag, depth });
    }
    depth += open - close;
    if (depth < 0) { depth = 0; }
  });
  return rows;
}
const has = (tag, color) => new RegExp('bgColor="' + color + '"').test(tag);

function runCase(src) {
  const page = src.page, column = src.column, app = src.app;
  // 注释里会出现成对的 { }（说明文字里引了 page 规则），量块之前先剥掉，否则 [^}]* 会提前收口
  const css = src.css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rows = dividersOf(page);
  const block = rows.filter((r) => r.depth === 0);
  const inCard = rows.filter((r) => r.depth > 0);
  const out = [];
  const ok = (id, pass, note) => out.push({ id, pass: !!pass, note: note || '' });

  ok('A1 页面上没有裸 `<tz-divider>`（默认 #f5f5f5 比页面底深一档，10px 读成「浅灰条」）',
    rows.length > 0 && rows.every((r) => /bgColor=/.test(r.tag)),
    '裸标签 ' + rows.filter((r) => !/bgColor=/.test(r.tag)).length + ' 枚 / 共 ' + rows.length);

  ok('A2 块与块之间（tz-box 之外）的间隔条一律 bgColor="#fafafa"＝页面底色',
    block.length > 0 && block.every((r) => has(r.tag, '#fafafa')),
    block.map((r) => r.tag.trim()).join(' | ') || '一枚都没找到');

  ok('A3 卡内（tz-box 之内）的间隔条跟白卡走（none/#fff），不许写成页面底',
    inCard.length > 0 && inCard.every((r) => has(r.tag, 'none') || has(r.tag, '#fff')),
    inCard.map((r) => r.tag.trim()).join(' | ') || '一枚都没找到');

  ok('A4 共用子组件 column-belongs 的块间条同档 #fafafa（它只被课程详情/直播两页引用，两页底色相同）',
    /<tz-divider\b[^>]*bgColor="#fafafa"[^>]*\/>/.test(column) && !/<tz-divider\s*\/>/.test(column),
    (column.match(/<tz-divider\b[^>]*>/) || [''])[0]);

  ok('A5 颜色有依据：页面底色源是 App.vue 的 rgba(250,250,250,1)，骨架屏底取同值（M58③，加载完不跳色）',
    /page\s*\{[^}]*background:\s*rgba\(250,\s*250,\s*250,\s*1\)/.test(app)
      && /\.course-detail-skeleton\s*\{[^}]*background-color:\s*#fafafa/.test(css),
    'App.vue 页面底=' + (/rgba\(250,\s*250,\s*250,\s*1\)/.test(app) ? '#fafafa' : '没读到')
      + ' / 骨架底=' + (/background-color:\s*#fafafa/.test(css) ? '#fafafa' : '不是 #fafafa'));

  return out;
}

const base = { page: read(PAGE), column: read(COLUMN), css: read(CSS), app: read(APP) };

if (process.argv.indexOf('--selftest') > -1) {
  const cases = [
    { name: '块间那枚摘掉 bgColor（退回默认灰）', patch: ['page', 'bgColor="#fafafa"', ''] },
    { name: '卡内那枚改成页面底', patch: ['page', 'bgColor="none"', 'bgColor="#fafafa"'] },
    { name: '共用子组件那枚退回默认灰', patch: ['column', 'bgColor="#fafafa"', ''] },
    { name: '骨架屏底退回旧灰 #F7F8FA', patch: ['css', 'background-color: #fafafa;', 'background-color: #F7F8FA;'] },
    { name: '页面底色源改值（#fafafa 不再等于页面底）', patch: ['app', 'background: rgba(250, 250, 250, 1);', 'background: rgba(247, 248, 250, 1);'] },
  ];
  let red = 0;
  cases.forEach((c) => {
    const [key, from, to] = c.patch;
    const src = Object.assign({}, base);
    if (src[key].indexOf(from) < 0) { console.log('[SKIP] 样件没落点：' + c.name); return; }
    src[key] = src[key].replace(from, to);
    const failed = runCase(src).filter((r) => !r.pass);
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
