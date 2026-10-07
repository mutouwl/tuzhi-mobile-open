/**
 * 「地址当 data 键」这一族的钉子 —— 不构建、不开浏览器
 *
 * 为什么单拉一个脚本：微信的 setData 把带点的键当**嵌套路径**解析（`a.b[0].c` 那一档语法），
 * 而 uni-app 推给视图层的差量数据，键正是把嵌套路径用点拼出来的
 * （node_modules/@dcloudio/vue-cli-plugin-uni/packages/mp-vue/dist/mp.runtime.esm.js 的 `_diff`：
 * `(path == '' ? '' : path + ".") + key`）。于是「以图片地址作 key」的响应式表
 * （加载失败标记、原图宽高表）一写进 data 就等着炸：`bgErrors.https://img.x.com/a.png`
 * 被拆成 `bgErrors` → `https://img` → `x` → …，中间那一段在视图层不存在 ⇒
 * 运行时抛 `TypeError: Cannot read properties of null (reading '<站点二级域>')`，
 * 这一次推送整个丢掉，而 uni 写在 setData 回调里的在途标志 `__next_tick_pending` 还不复位
 * ⇒ 这一页后续全部停更。报错里的属性名永远是站点二级域，所以它长期被误判成
 * 「对已出栈页面 setData」（那是另一族，闸门见 check-setdata-guard.js）。
 * 2026-09-28 分享海报出图报错定位到这一处，细则见 ui-baseline-mobile.md M26b。
 *
 * 钉两件事：
 *  ① mpKey 的契约：转完之后键里不许再有任何 `.` `[` `]`；同址稳定；只差标点的两个地址不许撞键；
 *     并且拿真 `_diff` 的拼法验一次 —— 转过的键当 path 拆只能拆出一段。
 *  ② 全站扫描：`*Errors` / `*Sizes` 这类响应式表的读写一律走 mpKey（写点漏 = 抛错，
 *     读点漏 = 兜底图永远不生效，两种都算违规）。下标、`x.id`、字面量这三类键天然不含点，
 *     在豁免名单里（数字 ID 不必转，转了反而对不上后端下发的那个键）。
 *
 * 用法：node tuzi-mobile/scripts/check-url-data-key.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
/** 第三方组件库与打包产物不参与本仓规则（uview / tdesign / 播放器的键由它们自己定） */
const SKIP = /[\\/]node_modules[\\/]|[\\/]uview-ui[\\/]|[\\/]tdesign|-min\.js$|[\\/]assets[\\/]/;

let fail = 0;
const bad = (msg) => {
  console.log('[FAIL] ' + msg);
  fail++;
};

/** 从 src/common/utils/mp-data-key.js 抠出真函数体上机跑（不 import，避开 ESM 与构建） */
function loadMpKey() {
  const file = path.join(SRC, 'common', 'utils', 'mp-data-key.js');
  const src = fs.readFileSync(file, 'utf8');
  const start = src.indexOf('function mpKey(');
  if (start === -1) throw new Error('抠不到 mpKey：' + file);
  let depth = 0;
  let end = -1;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) {
      end = i + 1;
      break;
    }
  }
  const body = src.slice(start, end);
  // eslint-disable-next-line no-new-func
  return new Function(body + '\nreturn mpKey;')();
}

const mpKey = loadMpKey();

/** uni-app `_diff` 拼键的那一句（照抄，不简化）：子键前面加点 */
function diffPath(parentPath, key) {
  return (parentPath === '' ? '' : parentPath + '.') + key;
}

/** 微信 setData 的路径拆法：按 `.` 拆，`[n]` 当数组下标 —— 段数比「父键 + 本键」还多就说明被拆了 */
function mpPathSegments(key) {
  return key.split('.').filter((s) => s.length > 0);
}

const URLS = [
  'https://img.mutouweb.com/upload/a.b.png',
  'https://img.mutouweb.com/upload/a-b.png',
  'https://img.mutouweb.com/upload/ab.png',
  'https://img.mutouweb.com/x[0].png',
  '/static/image/default-avatar.png',
];

/* ── ① mpKey 契约 ─────────────────────────────────────────────── */
URLS.forEach((u) => {
  const k = mpKey(u);
  if (/[.[\]]/.test(k)) bad('mpKey 转完仍含路径字符：' + k);
  if (mpPathSegments(diffPath('bgErrors', k)).length !== 2) {
    bad('转过的键进 _diff 仍会被拆成两段以上的路径（微信会当 a.b 解析）：' + k);
  }
  if (mpKey(k) !== k) bad('mpKey 不幂等（读写两头各调一次就会对不上）：' + u);
});
// 对照组：不转的话这些地址会被拆成好几段 —— 拆不出来就说明上面那两条断言再也挡不住回归
if (URLS.some((u) => mpPathSegments(diffPath('bgErrors', u)).length < 3)) {
  bad('对照组失效：样例地址不含点，断言等于没验，换真实业务地址');
}
if (mpKey(URLS[1]) === mpKey(URLS[2])) bad('只差标点的两个地址撞进同一键：' + URLS[1] + ' / ' + URLS[2]);
if (mpKey('a') !== 'a') bad('不含路径字符的键被改动了（下标、数字 ID 不该受影响）');
if (mpKey('') !== '' || mpKey(null) !== '') bad('空值键没收成空串：' + JSON.stringify([mpKey(''), mpKey(null)]));

/* ── ② 全站扫描：地址作键的表必须走 mpKey ───────────────────────── */
const TABLE = /\b(this\.)?[a-zA-Z_$][\w$]*(Errors|Sizes)\b\s*\[([^\]]*)\]/g;
const SETTER = /\$set\(\s*(?:this\.)?[a-zA-Z_$][\w$]*(Errors|Sizes)\s*,\s*([^,]+),/g;
/** 天然不含点的键：数组下标、实体 ID（后端下发的数字主键）、字面量 —— 这些不必转，转了反而对不上 */
const DOT_FREE_KEY = /^(?:i|idx|index|id|[a-zA-Z_$][\w$]*Index|[a-zA-Z_$][\w$]*\.id|-?\d+|'[^']*'|"[^"]*")$/;

function keyIsSafe(key) {
  const k = key.trim();
  return /^mpKey\(/.test(k) || DOT_FREE_KEY.test(k);
}

function walk(dir, out) {
  fs.readdirSync(dir).forEach((name) => {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (!/^(unpackage|dist|node_modules)$/.test(name)) walk(p, out);
    } else if (/\.(vue|js)$/.test(name) && !SKIP.test(p)) out.push(p);
  });
  return out;
}

const files = walk(SRC, []);
let hits = 0;
files.forEach((file) => {
  const rel = path.relative(ROOT, file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    const at = rel + ':' + (i + 1);
    let m;
    TABLE.lastIndex = 0;
    while ((m = TABLE.exec(line))) {
      const key = m[3].trim();
      if (keyIsSafe(key)) continue;
      bad('读点没转键（兜底图/尺寸会静默失效）：' + at + '  ' + m[0].trim());
    }
    SETTER.lastIndex = 0;
    while ((m = SETTER.exec(line))) {
      hits++;
      const key = m[2].trim();
      if (!keyIsSafe(key)) {
        bad('写点没转键（这一次 setData 会整个抛掉）：' + at + '  ' + m[0].trim());
      }
    }
  });
});

if (!hits) bad('一处 $set(*Errors|*Sizes, …) 都没扫到 —— 扫描规则失效了，先确认正则还吃得住当前写法');

console.log(fail ? '[FAIL] 合计 ' + fail + ' 条' : '[OK] mpKey 契约与全站读写点扫描通过（' + files.length + ' 个文件）');
process.exit(fail ? 1 : 0);
