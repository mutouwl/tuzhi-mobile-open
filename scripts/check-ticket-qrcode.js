// 票券二维码的机器验法：把 src/common/utils/qrcode.js 编出来的矩阵真解一遍，比对原文
//
// 为什么要有这一只：编码器是 vendored 的第三方实现（qrcode-generator / MIT），改一行就可能
// 编出一张「看着像码、其实扫不出来」的图——这种缺陷肉眼完全看不出来，只能靠解码器验。
// 同时把渲染映射也验了：qrRowGradients 出来的每一行渐变，按硬停点还原成像素，必须与矩阵逐格一致
// （页面就是照这串渐变画的，映射错了屏幕上就是一张错码）。
//
// 跑法：node tuzi-mobile/scripts/check-ticket-qrcode.js
//      node tuzi-mobile/scripts/check-ticket-qrcode.js --selftest   # 打翻一格必须解不出来（证明验法是真的）
//
// 说明：票号由后端 `Random::numeric(14)` 生成，恒为 14 位 → 版本 1（21×21），这一档两个独立解码器
// （qrcode-reader 与 OpenCV）实测全部读得回来；比 14 位长的内容会升到版本 2，个别样本会被解码器的
// 检测环节挑食（换一个解码器又能读），所以下面用的版本 2 向量是两个解码器都通得过的那几个。
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src/common/utils/qrcode.js');

/** 把 ES module 的导出换成 CommonJS，供脚本直接加载（模块里只有纯函数，没有平台 API） */
function loadModule() {
  const src = fs.readFileSync(SRC, 'utf8')
    .replace(/^export function /gm, 'function ')
    .replace(/^export default \{[\s\S]*?\};?\s*$/m, '');
  const tail = [
    '\nmodule.exports = { qrMatrix: qrMatrix, qrRowGradients: qrRowGradients };'
  ].join('\n');
  const mod = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', src + tail)(mod, mod.exports);
  return mod.exports;
}

let QrCode = null;
try {
  QrCode = require(path.join(ROOT, 'node_modules/qrcode-reader'));
} catch (e) {
  console.log('[FAIL] 缺少 qrcode-reader 解码器：它是 package-lock.json 里的依赖，npm i 之后就有；'
    + '没有它这一只就证明不了「码真能扫」');
  process.exit(1);
}

const { qrMatrix, qrRowGradients } = loadModule();

/** 矩阵 → RGBA 原始像素（静区 4 模块，模块放大 scale 像素，黑白两色，与屏幕上的取色同一档） */
function rasterize(matrix, scale, quiet) {
  const q = quiet === undefined ? 4 : quiet;
  const n = matrix.size + q * 2;
  const w = n * scale;
  const h = w;
  const data = Buffer.alloc(w * h * 4, 255);
  for (let r = 0; r < matrix.size; r++) {
    for (let c = 0; c < matrix.size; c++) {
      if (!matrix.modules[r][c]) { continue; }
      const x0 = (c + q) * scale;
      const y0 = (r + q) * scale;
      for (let y = y0; y < y0 + scale; y++) {
        for (let x = x0; x < x0 + scale; x++) {
          const i = (y * w + x) * 4;
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
        }
      }
    }
  }
  return { width: w, height: h, data: data };
}

/** 解码一次；解不出来返回 null（不抛） */
function decode(matrix) {
  const img = rasterize(matrix, 6, 4);
  const qr = new QrCode();
  let out = null;
  qr.callback = (err, result) => { out = err ? null : result; };
  const res = qr.decode(img);
  const value = out === null ? res : out;
  if (!value) { return null; }
  if (typeof value === 'string') { return value; }
  return value.result === undefined ? null : value.result;
}

/** 按页面的画法把一行渐变还原成像素（每格 s 像素），与矩阵比对 */
function gradientMatches(matrix, scale, rows) {
  const s = scale;
  const size = matrix.size;
  if (rows.length !== size) {
    return '行数 ' + rows.length + ' ≠ 模块行数 ' + size;
  }
  for (let r = 0; r < size; r++) {
    const row = rows[r] || '';
    const stops = [];
    const re = /(transparent|#[0-9A-Fa-f]{6})\s+(\d+)px/g;
    let m;
    while ((m = re.exec(row))) { stops.push({ dark: m[1] !== 'transparent', at: Number(m[2]) }); }
    if (!stops.length) { return '第 ' + r + ' 行没有停点'; }
    // 像素中心取样：第 c 格中心 = c*s + s/2，落在最后一个 at <= 它的停点颜色上
    let last = null;
    let idx = 0;
    for (let c = 0; c < size; c++) {
      const center = c * s + s / 2;
      while (idx < stops.length && stops[idx].at <= center) {
        last = stops[idx].dark;
        idx++;
      }
      if (last === null) { return '第 ' + r + ' 行第 ' + c + ' 格取不到颜色'; }
      if (last !== matrix.modules[r][c]) {
        return '第 ' + r + ' 行第 ' + c + ' 格渐变画的是 ' + (last ? '黑' : '白')
          + '，矩阵是 ' + (matrix.modules[r][c] ? '黑' : '白');
      }
    }
  }
  return null;
}

const CASES = [
  { text: '89771261455093', why: '库里真实票号（14 位）' },
  { text: '26769134938540', why: '库里真实票号（14 位）' },
  { text: '1', why: '最短：1 位' },
  { text: '1234567890123456', why: '16 位：跨到版本 2 的长度档（两个解码器都通得过的向量）' },
  { text: 'A1B2C3D4E5F6G7H8I9J0', why: '字母数字混合 20 位' },
  { text: '票号中文测试-2026', why: '非 ASCII：UTF-8 编码不能炸' }
];

function run(selftest) {
  let fail = 0;
  const ok = (pass, id, note) => {
    if (!pass) { fail++; }
    console.log((pass ? '[PASS] ' : '[FAIL] ') + id + (note ? ' ' + note : ''));
  };

  CASES.forEach((c, i) => {
    const matrix = qrMatrix(c.text, 'M');
    ok(!!matrix, 'C' + (i + 1) + ' 编码出矩阵（' + c.why + '）', c.text);
    if (!matrix) { return; }
    const size = matrix.size;
    ok((size - 17) % 4 === 0 && size >= 21 && size <= 177, 'C' + (i + 1) + ' 矩阵尺寸合法', size + '×' + size);

    let decoded = decode(matrix);
    if (selftest && i === 0 && matrix.size > 0) {
      // 自检：把中心 11×11 一片涂黑（≈27% 模块），超出 M 级纠错能力，解码必须与原文不一致。
      // 只翻一格是不行的：M 级能纠回 ~15% 的错误，翻一格照样解得出原文（本脚本第一版就是这么假绿的）。
      const half = 5;
      const mid = Math.floor(matrix.size / 2);
      const broken = {
        size: matrix.size,
        modules: matrix.modules.map((row, r) => row.map((v, c2) => (
          r >= mid - half && r <= mid + half && c2 >= mid - half && c2 <= mid + half ? true : v
        )))
      };
      decoded = decode(broken);
      ok(decoded !== c.text, 'S 自检：涂黑中心一片后不再解出原文', '（能红才说明解码这条路是真的）');
      return;
    }
    ok(decoded === c.text, 'C' + (i + 1) + ' 解码回原文', decoded === null ? '（解不出来）' : decoded);

    // 渲染映射：21×21 用 4px，25 用 3px，与页面同一档
    const scale = size <= 21 ? 4 : (size <= 25 ? 3 : 2);
    const rows = qrRowGradients(matrix, scale);
    const bad = gradientMatches(matrix, scale, rows);
    ok(bad === null, 'C' + (i + 1) + ' 渐变逐格还原＝矩阵（' + scale + 'px/模块）', bad || '');
  });

  // 空内容：不编码，返回 null（页面据此回条码，不留半张码）
  ok(qrMatrix('', 'M') === null, 'C7 空串不编码（返回 null）');
  ok(qrMatrix(null, 'M') === null, 'C7 null 不编码（返回 null）');

  console.log('\n共 ' + (CASES.length * 4 + 2) + ' 项断言，失败 ' + fail + ' 项');
  return fail;
}

const fail = run(process.argv.indexOf('--selftest') > -1);
process.exit(fail ? 1 : 0);
