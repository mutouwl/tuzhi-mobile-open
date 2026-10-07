/**
 * 证书前端出图：消费后端 cert/layout 下发的元素清单，逐条转成画布指令。
 *
 * 元素清单由后端 CertLayout 生成（后端 PNG 渲染器消费的是同一份），字号/颜色/基线 y 全部来自后端，
 * 前端不自己排版；只有水平落位要按这一端实测的占宽对锚点复位（见下面「文本的水平落位」）——
 * 两端一致的是「对中/对端」与元素大小、颜色，不是后端按自己字形量出的那个左缘。
 * 比对由 tuzi-mobile/scripts/check-cert-render.js（本文件 × 后端 fixture 逐条）保证。
 *
 * 元素类型（与后端约定一致）：
 *   bg     背景图（铺满画布；清单里没有 bg 元素时铺白底）
 *   text   文本（x 为基线左缘，y 为基线；与 imagettftext 同口径）
 *   image  图片（按给定矩形缩放贴入）
 *   avatar 圆形头像（圆形裁剪后贴入）
 *
 * 文本的水平落位有两种口径，清单里同时给：
 *   x            —— 后端按 DingTalk 字体度量算出的左缘，只有后端那只 GD 渲染器能用；
 *   a + ax       —— 对齐档（1 左 / 2 中 / 3 右）与锚点（画布中线、组中心、右距端点），与字形无关。
 * 前端画布吃的是系统字，同一字号量出来比 DingTalk 窄约 1/4，照 x 画就等于把「别人的中线」
 * 当成自己的左缘，用户读出来是「居中偏左」（2026-09-27 用户点名）。所以带 a 的行一律按
 * ctx.measureText() 实测的自身宽度对锚点复位，a 缺省（左对齐）时才直接用 x。
 *
 * 适配器 ctx 约定（调用方按端实现；scripts/check-cert-render.js 用记录式适配器做比对）：
 *   fillWhite()                       铺白底
 *   backgroundImage(src)              背景图铺满画布
 *   image(src, x, y, w, h)            矩形贴图
 *   avatar(src, x, y, w, h)           圆形贴图
 *   text(str, x, y, size, color)      基线绘制文本
 *   measureText(str, size)            该行在这一端的实际占宽（居中的行要用它对中，
 *                                     调用方给 common/utils/poster-theme.js 的 textWidth，三端同一估算）
 *
 * 字体口径：不引用后端字体文件（前端引不到），用系统默认 sans-serif、regular 字重，
 * 字号与后端钉值一致——粗细大小保持一致，字形随端。字形不同带来的偏左由上面的 a/ax 复位掉，
 * 笔画粗细与字面率的差别两端不强行对齐。
 */

/** 对齐档（与后端 CertLayoutText::ALIGN_* 同值） */
const ALIGN_LEFT = 1;
const ALIGN_CENTER = 2;
const ALIGN_RIGHT = 3;

/**
 * 一行文本在这一端应该落的左缘：有对齐档就对锚点复位，没有就照后端给的左缘
 * @param {Object} ctx 画布适配器
 * @param {Object} el 文本元素
 * @returns {Number} 左缘 x
 */
function textLeftX(ctx, el) {
  const anchor = Number(el.ax);
  const align = Number(el.a) || 0;
  if (!align || align === ALIGN_LEFT || !isFinite(anchor)) {
    return Number(el.x) || 0;
  }
  const measure = typeof ctx.measureText === 'function' ? ctx.measureText : null;
  if (!measure) {
    return Number(el.x) || 0;
  }
  const w = Number(measure(String(el.text == null ? '' : el.text), Number(el.size) || 14)) || 0;
  if (align === ALIGN_CENTER) {
    return anchor - w / 2;
  }
  if (align === ALIGN_RIGHT) {
    return anchor - w;
  }
  return Number(el.x) || 0;
}

/**
 * 把元素清单按序转成画布指令
 * @param {Object} ctx 画布适配器（见文件头约定）
 * @param {Array} elements 后端下发的元素数组（src 可为 http/data: 地址，调用方按端解析成可绘地址）
 * @returns {Array} 指令清单（与元素一一对应的镜像，测试与调试用）
 */
export function drawCert(ctx, elements) {
  const hasBackground = Array.isArray(elements) && elements.some((el) => el && el.t === 'bg');
  if (!hasBackground) {
    ctx.fillWhite();
  }

  const issued = [];
  (elements || []).forEach((el) => {
    switch (el.t) {
      case 'bg':
        ctx.backgroundImage(el.src);
        issued.push(['bg', el.src, 0, 0, null, null]);
        break;
      case 'image':
        ctx.image(el.src, el.x, el.y, el.w, el.h);
        issued.push(['image', el.src, el.x, el.y, el.w, el.h]);
        break;
      case 'avatar':
        ctx.avatar(el.src, el.x, el.y, el.w, el.h);
        issued.push(['avatar', el.src, el.x, el.y, el.w, el.h]);
        break;
      case 'text': {
        const x = textLeftX(ctx, el);
        ctx.text(el.text, x, el.y, el.size, el.color);
        issued.push(['text', el.text, x, el.y, el.size, el.color]);
        break;
      }
    }
  });
  return issued;
}

/**
 * 从元素清单里取全部图片地址（去重保序），供调用方按端预解析成本地可绘地址
 * @param {Array} elements
 * @returns {Array<string>}
 */
export function collectImageSrcs(elements) {
  const srcs = [];
  (elements || []).forEach((el) => {
    if (el && el.src && srcs.indexOf(el.src) < 0) {
      srcs.push(el.src);
    }
  });
  return srcs;
}
