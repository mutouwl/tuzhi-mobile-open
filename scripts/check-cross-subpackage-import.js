/**
 * 跨分包组件引用扫描 —— 不构建、不开浏览器
 *
 * 微信的分包边界，两头都算违规：
 *  · **分包 → 另一个分包**：不能互相引用组件；
 *  · **主包 → 分包**：主包组件被任意分包引用时，那个分包未必已下载 ⇒ 同样不合法
 *    （微信只保证「分包能用主包的组件」，反向不成立）。
 * uni-app 编译期不报这条（H5 端也一切正常），但产物里页面 json 的 `usingComponents`
 * 会写下另一个分包的路径 ⇒ mp-weixin 运行时
 * `Component is not found in path "..." (using by "...")`。
 * 丢的不是样式，是**该页自定义组件的实例化**：轻则「卡片没间隔、圆角没了、弹窗停在骨架屏」，
 * 重则**在冷分包首帧把整棵初始创建流程打断**（`Framework inner error (expect FLOW_INITIAL_CREATION
 * end but get FLOW_CREATE_NODE)` + `webviewScriptError`，整页白屏）—— 2026-09-19 / 2026-09-28 /
 * 2026-10-31 共踩过三次：
 *  · 前两次是「分包 → 分包」（`pages/course/detail` 引 `pages/app/form/components/custom-form.vue`）；
 *  · 2026-10-31 是**主包 → 分包**（`components/order/submit-order.vue` 引
 *    `pages/app/activity/components/form-modal.vue`）：下单页冷启白屏，automation 复现 4/5 次；
 *    组件已挪 `src/components/tz/form-modal.vue`。**旧版脚本对 `from === MAIN` 直接 continue，
 *    对这条最常见的「主包组件引分包组件」整片漏报**，这就是它第三次漏过的原因。
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
    // 同包、或「分包 → 主包」都合法（主包资源一定先于分包就绪）；
    // **「主包 → 分包」不合法**——主包组件被任意分包页面引用时，那个分包未必已下载（见文件头 2026-10-31 那条）
    if (fromRoot === toRoot || toRoot === 'MAIN') continue;
    const kind = fromRoot === 'MAIN' ? '主包→分包' : '分包→分包';
    if (isComment) {
      commented++;
      console.log('[注释,可忽略][' + kind + '] ' + rel + '  ->  ' + target);
    } else {
      real++;
      console.log('[真跨分包][' + kind + '] ' + rel + '  ->  ' + target);
    }
  }
});

if (real) {
  console.log('[FAIL] 跨分包组件引用 ' + real + ' 处 —— 把共用组件挪到主包（src/components/tz/）再改 import 路径');
  process.exit(1);
}
console.log('[OK] 跨分包组件引用 0 处（扫 ' + files.length + ' 个 .vue，分包根 ' + ROOTS.join(', ') + '）');
