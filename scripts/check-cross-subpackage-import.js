/**
 * 跨分包组件引用扫描 —— 不构建、不开浏览器
 *
 * 微信的分包边界：**分包之间不能互相引用组件**，只有主包组件能被任意分包用。
 * uni-app 编译期不报这条（H5 端也一切正常），但产物里页面 json 的 `usingComponents`
 * 会写下另一个分包的路径 ⇒ mp-weixin 运行时 `Component is not found in path "..."`。
 * 丢的不是样式，是**该页自定义组件的实例化**，所以症状长得像 CSS 回归
 * （「卡片没间隔、圆角没了、弹窗停在骨架屏」），照着 CSS 查会白跑一轮 —— 2026-09-19 与 2026-09-28 各踩过一次
 * （后者是 `pages/course/detail` 引 `pages/app/form/components/custom-form.vue`，组件已挪 `src/components/tz/`）。
 *
 * 判 `@/` 绝对路径时必须先把前缀剥掉再判分包根：早先那版脚本把 `path.join(dir, ...)`
 * 也用在 `@/pages/...` 上，分包根判定成了引用方自己，**对最常见的 `@/` 写法整片漏报**（曾报「已清零」）。
 * 注释掉的 import 会误报，命中后按 [注释,可忽略] 与 [真跨分包] 分档看。
 *
 * 用法：node tuzi-mobile/scripts/check-cross-subpackage-import.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

/** 分包根从 pages.json 现读，不在脚本里抄一份（抄的那份会随配置漂移） */
function subpackageRoots() {
  const cfg = JSON.parse(fs.readFileSync(path.join(SRC, 'pages.json'), 'utf8'));
  return (cfg.subPackages || cfg.subpackages || []).map((sp) => sp.root.replace(/\/$/, ''));
}

const ROOTS = subpackageRoots();
const SCAN_DIRS = ['pages', 'components'];

function rootOf(rel) {
  for (const r of ROOTS) {
    if (rel === r || rel.startsWith(r + '/')) return r;
  }
  return 'MAIN';
}

function walk(dir, out) {
  if (!fs.existsSync(dir)) return out;
  fs.readdirSync(dir).forEach((name) => {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!/^(unpackage|dist|node_modules)$/.test(name)) walk(p, out);
    } else if (/\.vue$/.test(name)) {
      out.push(path.relative(SRC, p).split(path.sep).join('/'));
    }
  });
  return out;
}

const files = [];
SCAN_DIRS.forEach((d) => walk(path.join(SRC, d), files));

const IMPORT_RE = /(?:^|\n)\s*(\/\/\s*)?import\s+[\w{},*\s]+\s+from\s+["']([^"']+\.vue)["']/g;
let real = 0;
let commented = 0;

files.forEach((rel) => {
  const src = fs.readFileSync(path.join(SRC, rel), 'utf8');
  const dir = path.dirname(rel);
  let m;
  while ((m = IMPORT_RE.exec(src))) {
    const isComment = !!m[1];
    const spec = m[2];
    let target;
    if (spec.startsWith('@/')) target = spec.slice(2);
    else if (spec.startsWith('.')) target = path.normalize(path.join(dir, spec)).split(path.sep).join('/');
    else continue;
    const fromRoot = rootOf(rel);
    const toRoot = rootOf(target);
    if (fromRoot === toRoot || toRoot === 'MAIN' || fromRoot === 'MAIN') continue;
    if (isComment) {
      commented++;
      console.log('[注释,可忽略] ' + rel + '  ->  ' + target);
    } else {
      real++;
      console.log('[真跨分包] ' + rel + '  ->  ' + target);
    }
  }
});

if (real) {
  console.log('[FAIL] 跨分包组件引用 ' + real + ' 处 —— 把共用组件挪到主包（src/components/tz/）再改 import 路径');
  process.exit(1);
}
console.log('[OK] 跨分包组件引用 0 处（扫 ' + files.length + ' 个 .vue，分包根 ' + ROOTS.join(', ') + '）');
