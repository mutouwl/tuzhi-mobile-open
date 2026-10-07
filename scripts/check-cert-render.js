// 证书前端出图 × 后端元素清单 一致性比对（不构建、不开浏览器）：
//
//   后端 CertLayout::build 生成元素清单（坐标/字号/颜色/对齐档）──┬─→ 渲染器出后端 PNG
//                                                             └─→ cert/layout 接口下发给前端
//   前端 common/utils/cert-poster.js 的 drawCert 把清单逐条映射成画布指令。
//
// 本脚本把「后端导出的 fixture 清单」（scripts/cert-layout-fixture.json，由
// curl /test/CertLayoutTest/fixture 从同一份 CertLayout 生成，钉值由 CertLayoutTest 断言）
// 喂给前端的 drawCert，用记录式画布逐条核对绘制指令：元素顺序、落位、y、字号、颜色、
// 图片矩形/圆形裁剪、无背景时的白底，任何一条与清单推导不符即 FAIL。
//
// 比对的是「元素级一致」，不是「像素级一致」：字号/颜色/基线两端同值，水平落位按
// 对齐档 + 这一端实测占宽复位（后端 x 是按 DingTalk 量出的左缘，前端画布用系统字，
// 照抄左缘整行会视觉偏左——2026-09-27 用户点名，故居中的行必须走 a/ax）。
// 字形本身（笔画粗细、字面率）两端不同，本脚本管不了，也不许在脚本里假装一致。
//
// 用法：node tuzi-mobile/scripts/check-cert-render.js   （exit 0 = 逐条一致）
// fixture 过期时重导：curl "http://tuzhi.mutouweb.com/index.php?s=/test/CertLayoutTest/fixture" \
//   -o tuzi-mobile/scripts/cert-layout-fixture.json
const fs = require('fs');
const path = require('path');

const FIXTURE = path.resolve(__dirname, 'cert-layout-fixture.json');

// 加载 ESM 工具（export 转 CJS，同 check-diary-refresh.js 的桩化写法）
function loadUtil(file, names) {
  let src = fs.readFileSync(file, 'utf8');
  src = src.replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s*\{[\s\S]*?\}\s*;?\s*$/gm, '');
  src += `\nmodule.exports = {${names.join(', ')}};`;
  const m = { exports: {} };
  new Function('module', 'exports', src)(m, m.exports);
  return m.exports;
}

const UTIL = path.resolve(__dirname, '../src/common/utils/cert-poster.js');
const VIEWER = path.resolve(__dirname, '../src/components/tz/cert-viewer.vue');
const CERT_PAGE = path.resolve(__dirname, '../src/pages/app/cert/index/index.vue');
const CERT_PAGE_JS = path.resolve(__dirname, '../src/pages/app/cert/index/js.vue');
const THEME = path.resolve(__dirname, '../src/common/utils/poster-theme.js');
const util = loadUtil(UTIL, ['drawCert', 'collectImageSrcs']);
// 量宽用真源那一把（与 cert-viewer 传给画布适配器的同一个函数），脚本不另存一份估算
const textWidth = loadUtil(THEME, ['textWidth']).textWidth;

const ALIGN_LEFT = 1;
const ALIGN_CENTER = 2;
const ALIGN_RIGHT = 3;

/** 清单里一条文本在这一端该落的左缘：有对齐档就对锚点复位，没有才照后端给的左缘 */
function expectTextX(el) {
  const align = Number(el.a) || 0;
  const anchor = Number(el.ax);
  if (!align || align === ALIGN_LEFT || !isFinite(anchor)) return Number(el.x) || 0;
  const w = textWidth(String(el.text), Number(el.size) || 14);
  if (align === ALIGN_CENTER) return anchor - w / 2;
  if (align === ALIGN_RIGHT) return anchor - w;
  return Number(el.x) || 0;
}

// 记录式画布适配器：drawCert 发出的每条指令原样记账
function makeRecorder() {
  const cmds = [];
  return {
    cmds,
    fillWhite: () => cmds.push(['fillWhite']),
    backgroundImage: (src) => cmds.push(['bg', src, 0, 0, null, null]),
    image: (src, x, y, w, h) => cmds.push(['image', src, x, y, w, h]),
    avatar: (src, x, y, w, h) => cmds.push(['avatar', src, x, y, w, h]),
    text: (str, x, y, size, color) => cmds.push(['text', str, x, y, size, color]),
    measureText: (str, size) => textWidth(str, size),
  };
}

// 从清单推导「应当发出的指令序列」——绘制指令必须与后端元素一一对应
function expectCommands(layout) {
  const out = [];
  const hasBg = layout.elements.some((el) => el.t === 'bg');
  if (!hasBg) out.push(['fillWhite']);
  layout.elements.forEach((el) => {
    if (el.t === 'bg') out.push(['bg', el.src, 0, 0, null, null]);
    else if (el.t === 'image') out.push(['image', el.src, el.x, el.y, el.w, el.h]);
    else if (el.t === 'avatar') out.push(['avatar', el.src, el.x, el.y, el.w, el.h]);
    else if (el.t === 'text') out.push(['text', el.text, expectTextX(el), el.y, el.size, el.color]);
  });
  return out;
}

// 数值按 Number 比较（JSON 往返 0.5 这类小数是精确的，但仍按数值比稳妥）
function sameCmd(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const va = a[i];
    const vb = b[i];
    if (typeof va === 'number' || typeof vb === 'number') {
      if (Number(va) !== Number(vb)) return false;
    } else if (va !== vb) {
      return false;
    }
  }
  return true;
}

let failed = 0;
function check(name, cond, detail) {
  console.log((cond ? '[PASS] ' : '[FAIL] ') + name + (cond ? '' : ' :: ' + JSON.stringify(detail)));
  if (!cond) failed++;
}

const layout = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));

check('fixture 形状：width/height/elements 齐全',
  layout.width === 760 && layout.height === 1360 && Array.isArray(layout.elements) && layout.elements.length > 0,
  { width: layout.width, height: layout.height, n: layout.elements && layout.elements.length });

// 1) 指令序列与清单逐条一致（元素大小/位置/颜色/顺序的比对本体）
const rec = makeRecorder();
const issued = util.drawCert(rec, layout.elements);
const expect = expectCommands(layout);
check('指令条数与清单推导一致', issued.length === expect.length, { issued: issued.length, expect: expect.length });
let firstBad = null;
for (let i = 0; i < Math.max(issued.length, expect.length); i++) {
  if (!sameCmd(issued[i], expect[i])) {
    firstBad = { index: i, issued: issued[i] || null, expect: expect[i] || null };
    break;
  }
}
check('每条绘制指令与后端元素一致（顺序/x/y/size/color/图片矩形）', !firstBad, firstBad);
check('记录式画布与返回的指令清单一致', rec.cmds.length === issued.length, { rec: rec.cmds.length, ret: issued.length });

// 2) 图片地址收集：去重保序，供小程序端预解析
const srcs = util.collectImageSrcs(layout.elements);
const uniq = srcs.filter((s, i) => srcs.indexOf(s) === i);
check('collectImageSrcs 去重保序', srcs.length === uniq.length && JSON.stringify(srcs) === JSON.stringify(uniq), { srcs });

// 3) 抽查钉值元素：标题 28 档 y=156、数据区首值 38 档 y=650 黑、名称行 16 档 y=712 灰
//    字号写「设计稿档」再按 SCALE 换算（与后端 CertLayoutText::SCALE 同一档，
//    那一边有 CertLayoutTest 的 SCALE 断言钉着，这里跟着换算而不是写死换算后的数）
const SCALE = 1.3;
const px = (n) => Math.round(n * SCALE);
const el = layout.elements;
const title = el.find((e) => e.t === 'text' && e.size === px(28));
const value = el.find((e) => e.t === 'text' && e.size === px(38));
const label = el.find((e) => e.t === 'text' && e.size === px(16));
check('标题钉值 ' + px(28) + 'px/y156/居中黑', !!title && title.y === 156 && title.color === '#000000', title);
check('数据区数值钉值 ' + px(38) + 'px/y650/黑', !!value && value.y === 650 && value.color === '#000000', value);
check('数据区标签钉值 ' + px(16) + 'px/y712/灰', !!label && label.y === 712 && label.color === '#646464', label);
// 整张图是按 760×1360 的印刷档排、在 ~350px 宽的弹层里看（0.46×），所以尺寸统一放大一档；
// 这里核的是「下发到的确实是放大后的档」，不是原设计稿数值
check('清单字号已是放大档（不是设计稿原值）',
  !!title && title.size === px(28) && title.size !== 28, { size: title && title.size, expect: px(28) });

// 3c) 放大一档后仍在画布内：图片是围绕自己的中心长的，越界就是被裁掉一块；
//     居中的行也要核两端都在画布内、同行各项互不压字（数据区四组改成 2×2 摆就是为这个）
const outside = layout.elements.filter((e) => (e.t === 'image' || e.t === 'avatar')
  && (Number(e.x) < 0 || Number(e.y) < 0 || Number(e.x) + Number(e.w) > layout.width || Number(e.y) + Number(e.h) > layout.height));
check('图片元素放大后不越出画布', outside.length === 0, outside.map((e) => String(e.src).slice(-18)));
const centeredRows = {};
el.filter((e) => e.t === 'text' && Number(e.a) === ALIGN_CENTER).forEach((e) => {
  const row = centeredRows[e.y] || (centeredRows[e.y] = []);
  row.push({ left: expectTextX(e), right: expectTextX(e) + textWidth(String(e.text), Number(e.size)) });
});
const rowBad = Object.keys(centeredRows).filter((y) => {
  const rs = centeredRows[y].sort((a, b) => a.left - b.left);
  if (rs.some((r) => r.left < 0 || r.right > layout.width)) return true;
  for (let i = 1; i < rs.length; i++) { if (rs[i].left < rs[i - 1].right) return true; }
  return false;
});
check('同一行的居中项互不压字、且不越出画布', rowBad.length === 0, rowBad);

// 3b) 对齐复位：居中的行必须对 ax 取中、右对齐的行必须收在 ax 那一头
//     （后端 x 是按 DingTalk 量的左缘，前端系统字更窄，照抄左缘 = 用户看到的「居中偏左」）
const centered = el.filter((e) => e.t === 'text' && Number(e.a) === ALIGN_CENTER);
const righted = el.filter((e) => e.t === 'text' && Number(e.a) === ALIGN_RIGHT);
check('居中/右对齐的元素都带 ax 锚点（漏发前端只能照 x 画）',
  centered.concat(righted).every((e) => isFinite(Number(e.ax))),
  centered.concat(righted).filter((e) => !isFinite(Number(e.ax))).map((e) => e.text));
const centerBad = centered.filter((e) => {
  const w = textWidth(String(e.text), Number(e.size));
  return Math.abs(expectTextX(e) + w / 2 - Number(e.ax)) > 0.01;
});
check('居中的行画出来中线 = ax（对的是中，不是后端那个左缘）', centerBad.length === 0, centerBad.map((e) => e.text));
const rightBad = righted.filter((e) => {
  const w = textWidth(String(e.text), Number(e.size));
  return Math.abs(expectTextX(e) + w - Number(e.ax)) > 0.01;
});
check('右对齐的行画出来右缘 = ax（收在右距端点）', rightBad.length === 0, rightBad.map((e) => e.text));
// 反向对照：复位必须真的动了笔，否则这一档是摆设（后端字形比系统字宽，居中行必然要往右挪）
const moved = centered.filter((e) => Math.abs(expectTextX(e) - Number(e.x)) > 0.5);
check('按 ax 复位与照 x 直画确有差异（这条档不是摆设）', moved.length >= 3, { moved: moved.length, centered: centered.length });
check('左对齐的元素不下发 a（前端按 x 直画即为正解）',
  el.filter((e) => e.t === 'text' && (!e.a || Number(e.a) === ALIGN_LEFT)).every((e) => expectTextX(e) === Number(e.x)),
  el.filter((e) => e.t === 'text' && !e.a).map((e) => e.text));

// 4) 弹层组件确实消费这份 util 与后端接口（防「脚本绿了、组件没用它」的脱节），
//    并钉住出图链路走公共类 PosterCanvas（poster-render）——证书面不得再自抄一段渲染/导出/降档
const viewerSrc = fs.readFileSync(VIEWER, 'utf8');
check('cert-viewer 引用 cert-poster 的 drawCert', /drawCert/.test(viewerSrc) && /cert-poster/.test(viewerSrc), null);
check('cert-viewer 保存链路走 poster-save util', /poster-save/.test(viewerSrc), null);
check('cert-viewer 出图走公共类 PosterCanvas（poster-render）', /poster-render/.test(viewerSrc) && /PosterCanvas|renderWithDegrade/.test(viewerSrc), null);
// 对齐档必须真的接到画布适配器上：util 认 a/ax，但量宽由调用面给，
// 漏传 measureText 就等于前端又回到「照后端左缘画」（居中偏左），这条防「util 改了、组件没接」
check('cert-viewer 给画布适配器接上 measureText（居中的行按本端占宽对中）',
  /measureText\s*:/.test(viewerSrc) && /textWidth/.test(viewerSrc), null);
// 海报本体的加载态是盖满那一格的黑遮罩，不是区域骨架（M18⑨g），出图前后那一格尺寸不重算
const pwBody = (viewerSrc.match(/previewWidth\(\)\s*\{[\s\S]*?\n\t\t\}/) || [''])[0];
check('cert-viewer 加载态走盖满那一格的黑遮罩、不预留骨架', /certv-shade/.test(viewerSrc) && !/u-skeleton/.test(viewerSrc), null);
check('cert-viewer 预览框尺寸只钉在后端画布常数上（读 layout 就会在出图前后跳一下）',
  /CERT_W/.test(pwBody) && !/this\.layout/.test(pwBody), pwBody);
// 预览整格再缩 1/5 让位给下方按钮条（2026-09-27 用户口径），缩一档只改这一处常数
check('cert-viewer 预览按 CERT_SHRINK 缩一档（不写死像素，也不散在多处）', /CERT_SHRINK/.test(pwBody), pwBody);
// 等待只写在海报那一格（2026-09-27 用户点名「不要给查看按钮增加加载中效果」，M18⑨g）：
// 入口按钮不带 loading、点击即开弹层，组件靠 pending prop 认「清单还在路上」这一段
const certBtns = (fs.readFileSync(CERT_PAGE, 'utf8').match(/<u-button[\s\S]*?>/g) || []).filter((b) => /查看/.test(b));
const certJsSrc = fs.readFileSync(CERT_PAGE_JS, 'utf8');
check('证书列表「查看」按钮不带 loading（u-button 上没有 loading 相关 prop）',
  certBtns.length === 1 && !/loading/.test(certBtns[0]), certBtns);
check('证书列表点击即开弹层（先 viewerShow 再请求清单，两件事不同时等）',
  /that\.viewerShow = true;[\s\S]{0,200}\$api\("app\.cert\.layout"/.test(certJsSrc), null);
check('cert-viewer 认 pending（清单未到手只盖遮罩、不判失败），prepare 由单个 watcher 驱动',
  /pending:\s*\{\s*type: Boolean/.test(viewerSrc) &&
    /watch:\s*\{\s*activeLayout\(\)/.test(viewerSrc) &&
    /if \(this\.pending\) return;|const layout = this\.activeLayout;/.test(viewerSrc),
  null);
// 面板右上角不放关闭图标（点遮罩与点图区空白都能收），留出自带的安全区内衬给按钮
check('cert-viewer 不摆右上角关闭图标，且仍保留点遮罩/点图区收起',
  !/certv-close/.test(viewerSrc) && /closeOnClickOverlay/.test(viewerSrc) && /@tap="close"/.test(viewerSrc), null);
// tz-button 只渲染 text prop（组件里没有 slot），文案写在标签中间就是哑按钮
check('cert-viewer 的按钮文案走 text prop',
  !/<tz-button[^>]*>[^<]*[\u4e00-\u9fa5]/.test(viewerSrc) && /<tz-button[^{]*text="/.test(viewerSrc), null);
check('公共类 poster-render 存在渲染/降档/地址解析三件套',
  (() => {
    const src = fs.readFileSync(path.resolve(__dirname, '../src/common/utils/poster-render.js'), 'utf8');
    return /export class PosterCanvas/.test(src) && /renderWithDegrade/.test(src) && /export function resolvePosterImage/.test(src);
  })(), null);
check('端路收在 poster-save：相册保存/分享面板/右上角提示三把函数在',
  (() => {
    const src = fs.readFileSync(path.resolve(__dirname, '../src/common/utils/poster-save.js'), 'utf8');
    return /export function savePosterToAlbum/.test(src) && /export function sharePosterToMenu/.test(src) && /export function hintTopRight/.test(src);
  })(), null);
check('cert-viewer 取数走 app.cert.layout 接口', /app\.cert\.layout/.test(viewerSrc) || /cert\.layout/.test(fs.readFileSync(path.resolve(__dirname, '../src/pages/app/cert/index/js.vue'), 'utf8')), null);

// 5) 保存端路（2026-09-27 用户两次点名：先是证书、再是日签图）：点保存**一律不触发上传**，
//    H5 放大 + 一句长按提示，小程序调相册接口。poster-save 里那条「长按两端先传成 http 图再预览」已整段删掉
check('cert-viewer 保存不走上传（组件与 util 里都不出现 uploadImage）',
  /previewSavablePoster\(\s*src\s*\)/.test(viewerSrc) && !/uploadImage/.test(viewerSrc), null);
check('cert-viewer 小程序/App 那一档仍调相册接口（#ifndef H5 段里是 savePosterToAlbum）',
  /#ifndef H5[\s\S]{0,120}savePosterToAlbum\(\s*src\s*,\s*this\.subject\s*\)/.test(viewerSrc), null);
// 真把 util 跑一遍：它自己不许碰任何上传接口，放大的是原地址、同一刻弹 util 里那份文案
(() => {
  const save = loadUtil(path.resolve(__dirname, '../src/common/utils/poster-save.js'), ['previewSavablePoster', 'POSTER_TIP']);
  const log = [];
  global.uni = {
    previewImage: (o) => log.push('previewImage:' + (o && o.urls && o.urls[0])),
    showToast: (o) => log.push('toast:' + (o && o.title)),
  };
  const src = 'data:image/png;base64,CERT';
  save.previewSavablePoster(src);
  delete global.uni;
  check('util：不上传、放大原地址、同一刻弹「长按图片可保存至相册」（文案与端路只存 util 一份）',
    JSON.stringify(log) === JSON.stringify(['previewImage:' + src, 'toast:' + save.POSTER_TIP.savable]), log);
})();

console.log(failed === 0 ? '\n前端绘制指令与后端元素清单逐条一致' : '\n存在不一致，见上方 FAIL 项');
process.exit(failed === 0 ? 0 : 1);
