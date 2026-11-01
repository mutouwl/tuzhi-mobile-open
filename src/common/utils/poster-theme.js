/**
 * 分享海报的样式引擎（日签图弹层与全局分享弹层共用同一份数值源）
 *
 * 为什么单独抽一份：2026-09-26 全局分享弹窗改成与打卡日签图同一套架构（底部弹层 + 前端画布海报 +
 * 可左右滑的样式条），两档海报要能用同一排样式档。弥散渐变这一档在旧版里每档要写 `bg` + `stops` 两份、
 * 画布又不认 CSS 渐变串，改一处就分叉（见 .trae/rules/ui-baseline-mobile.md M18⑦）。这里只留一张表：
 * 预览的 CSS、样式条缩略图、画布那三处都由本模块现算，半径按档宽等比缩，两份才是同一个图形。
 *
 * 底图清单（后台「打卡设置 → 分享背景图」下发的 share_bgs）以后端为准：配了就整排只用底图、
 * 一档自带渐变都不掺，一条都没配才整排回落 POSTER_THEMES（见 buildStyleOptions）。
 * 2026-09-27 起那一项后台配置暂时下线（管理端「打卡设置」页签隐藏，后端恒下发空清单），
 * 所以现在日签图与内容分享用的都是本表这几档自带渐变。
 * 底色分浅、深两族（2026-10-28 用户口径：上一版 12 档全是压得很深的那种，蓝色之类的读起来老气；
 * 改成「浅色、深色并存」的渐变 / 弥散 / 扁平三件）。字色不再一律写死白字，
 * 而是由下面 POSTER_INK 按这一档的 tone 成组下发（压在底色上的每一档文字、标签、角标底、动作底都在表里）。
 * 两族各自的字色都要过 WCAG 对比度那条门禁（tuzi-mobile/scripts/check-daily-save-share.js 逐档逐区实测）。
 */

/**
 * 字色表：按**底色**的深浅分两套，`tone` 描述的是底色（light = 浅底配深字 / dark = 深底配白字）
 *
 * 为什么必须成组：海报上压在渐变上的每一档（日期角标三行、金句、出处、累计打卡、两枚金句动作、
 * 邀请头昵称与邀请语、码下面那句说明）原本都写死白字，浅底会把字吃掉——只换底色不换字色就是半成品
 * （硬约束 29：给块加有色底是成组交付物）。同屏的白底块（日签图底部用户区、内容分享那张白卡）
 * 不跟着换，仍吃深灰档。
 * 键位：
 *   text    主字（昵称 / 金句 / 累计打卡 / 邀请头昵称 / 码说明）
 *   sub     次字（邀请语 / 金句出处）
 *   mark    那枚装饰引号（纯装饰，不参与 4.5:1 那条）
 *   plate   日期角标的底（压在渐变上的一层薄片）
 *   chip    两枚金句动作的底；chipText 是它们上面的字与图标
 *   card    内容分享那张白卡（磨砂靠透明度）；cardText 是卡内标题
 *   avatar  头像占位块（圆头像还没 load 上来时的底）
 */
const POSTER_INK = {
	dark: {
		text: '#ffffff',
		sub: 'rgba(255,255,255,0.95)',
		mark: 'rgba(255,255,255,0.35)',
		plate: 'rgba(255,255,255,0.14)',
		chip: 'rgba(0,0,0,0.18)',
		chipText: '#ffffff',
		card: 'rgba(255,255,255,0.86)',
		cardText: '#1d2129',
		avatar: 'rgba(255,255,255,0.2)',
	},
	light: {
		text: '#1d2129',
		sub: 'rgba(29,33,41,0.82)',
		mark: 'rgba(29,33,41,0.26)',
		plate: 'rgba(255,255,255,0.62)',
		chip: 'rgba(255,255,255,0.72)',
		chipText: '#1d2129',
		card: 'rgba(255,255,255,0.92)',
		cardText: '#1d2129',
		avatar: 'rgba(29,33,41,0.08)',
	},
};

/**
 * 自带弥散渐变档：每档 = 一个底色 + 几团柔和的高光，扁平（不描边、不加噪点、不用投影）
 *
 * 2026-10-28 按用户口径重排：**浅色六档在前、深色六档在后**（打开弹层先看到的是浅色那几档），
 * 默认档（下标 0）选**天青**那块淡蓝 —— 用户点名「第二个蓝色选项不错，可以放在第一个」，故它与薄荷对调；
 * 每档由 `tone` 声明底色深浅，字色与它成组（见 POSTER_INK）。上一版 12 档全是深底 + 白字
 * （深蓝 / 靛蓝 / 紫罗兰…），用户读出来是「都是比较深的那种，蓝色之类的很老气」。
 * 深色这一族保留给「要对比度」的内容（课程封面偏白时），但不再以冷蓝占多数。
 *
 * blobs 每一项 = [光心 x, 光心 y, 半径, 光色 RGB, 光色 alpha]：
 *   x/y 是占海报的比例（缩略图按同一比例落点），半径占**宽**的比例（300 宽 → 0.63 ≈ 189px，
 *   40 宽的色板 → 25px，两档才是同一个图形的等比缩小）；透明那一端由 RGB 补 alpha 0 推出，
 *   与 CSS 的 rgba(...,0) 同一色相，不会在边缘糊出一圈灰。
 * 浅色档的高光用「同色相再深一档」的彩头（白高光压在浅底上看不见），深色档仍用亮彩头。
 */
const POSTER_THEMES = [
	// —— 浅色六档：底色接近纸白、只带一档色相 ——
	{ tone: 'light', base: '#ecf3fd', blobs: [[0.16, 0.12, 0.62, '150,196,246', 0.68], [0.86, 0.84, 0.55, '199,224,252', 0.8]] }, // 天青
	{ tone: 'light', base: '#eaf7f3', blobs: [[0.16, 0.12, 0.62, '138,219,199', 0.72], [0.86, 0.84, 0.55, '190,238,226', 0.8]] }, // 薄荷
	{ tone: 'light', base: '#f2eefe', blobs: [[0.16, 0.12, 0.62, '181,166,247', 0.6], [0.86, 0.84, 0.55, '222,214,253', 0.8]] },  // 薰衣草
	{ tone: 'light', base: '#fdeef2', blobs: [[0.16, 0.12, 0.62, '247,178,199', 0.6], [0.86, 0.84, 0.55, '251,217,227', 0.8]] },  // 玫瑰
	{ tone: 'light', base: '#fff0e9', blobs: [[0.16, 0.12, 0.62, '250,190,160', 0.62], [0.86, 0.84, 0.55, '253,224,211', 0.8]] }, // 蜜桃
	{ tone: 'light', base: '#fdf6e6', blobs: [[0.16, 0.12, 0.62, '240,212,150', 0.62], [0.86, 0.84, 0.55, '250,240,213', 0.8]] }, // 米杏
	// —— 深色六档：压得够深才托得住白字，但不再以冷蓝为主 ——
	{ tone: 'dark', base: '#0f3b3a', blobs: [[0.18, 0.12, 0.63, '45,212,191', 0.44], [0.86, 0.8, 0.55, '15,118,110', 0.5]] },     // 墨青
	{ tone: 'dark', base: '#16301f', blobs: [[0.2, 0.14, 0.58, '74,222,128', 0.42], [0.86, 0.82, 0.5, '16,120,80', 0.5]] },        // 松林
	{ tone: 'dark', base: '#22252b', blobs: [[0.5, 0.1, 0.75, '120,132,150', 0.5]] },                                              // 石墨
	{ tone: 'dark', base: '#241835', blobs: [[0.82, 0.12, 0.58, '167,139,250', 0.5], [0.14, 0.86, 0.54, '190,24,93', 0.4]] },      // 夜紫
	{ tone: 'dark', base: '#3a1320', blobs: [[0.86, 0.2, 0.5, '251,113,133', 0.42], [0.12, 0.86, 0.54, '159,18,57', 0.5]] },        // 酒红
	{ tone: 'dark', base: '#33231a', blobs: [[0.86, 0.68, 0.58, '217,160,102', 0.5], [0.12, 0.16, 0.52, '120,72,40', 0.55]] },      // 咖啡
];

/**
 * 这一档的字色（预览 CSS、色板、画布三处读同一份）
 * @param {Object} theme POSTER_THEMES 里的一档
 * @return {Object} POSTER_INK 里那一套（缺 tone 的老数据按深底白字回落）
 */
function inkOf(theme) {
	return POSTER_INK[(theme && theme.tone) === 'light' ? 'light' : 'dark'];
}

/** 海报本体的宽高（画布恒为这一档，预览在短屏上整体缩放，见 tz-share-poster 的 posterScale） */
const POSTER_W = 300;
const POSTER_H = 400;
/** 样式条缩略图的宽（与海报同 3:4 比例，只做「选哪一张底」的示意） */
const THUMB_W = 40;

/**
 * 一团弥散高光 → CSS 的 radial-gradient（半径按 boxW 等比缩，色板与海报才是同一个图形）
 * @param {Array} b     [光心 x, 光心 y, 半径占宽, RGB, alpha]
 * @param {Number} boxW 这一档画多宽（海报 300、色板 40）
 */
function blobCss(b, boxW) {
	return 'radial-gradient(circle ' + Math.round(b[2] * boxW) + 'px at ' + (b[0] * 100) + '% ' + (b[1] * 100) + '%, '
		+ 'rgba(' + b[3] + ',' + b[4] + ') 0%, rgba(' + b[3] + ',0) 100%)';
}

/**
 * 一档弥散渐变 → 预览用的 CSS 串
 * 多层 CSS 背景是「先列的压在上面」，画布是「后画的压在上面」→ drawTheme 里反序铺，两份才是同一个叠法
 * @param {Object} t    POSTER_THEMES 里的一档
 * @param {Number} boxW 这一档画多宽
 */
function themeCss(t, boxW) {
	if (!t) return '';
	const blobs = t.blobs || [];
	return blobs.map((b) => blobCss(b, boxW)).join(', ') + (blobs.length ? ', ' : '') + t.base;
}

/**
 * 一档弥散渐变 → 画布（与预览同一张表算出来，不另存一份数值）
 *
 * ⚠ 渐变构造器两端不同名：微信小程序是 createRadialGradient(x0,y0,r0,x1,y1,r1)，
 *   uni-h5 的画布上下文**没有这个名字**（只有 createLinearGradient / createCircularGradient，
 *   见 node_modules/@dcloudio/uni-h5/src/core/service/api/context/canvas.js:311-316），
 *   按小程序那套写就会在 H5 抛「ctx.createRadialGradient is not a function」，整张海报出不来图。
 *   这里优先用两端都有的 createCircularGradient（一团高光 = 一个圆心 + 一个半径，语义正好），
 *   再退到 createRadialGradient；两个都没有就只铺底色（宁可平一点，也不能让保存/分享没图，M13）。
 * @param {Object} ctx  uni.createCanvasContext 的上下文
 * @param {Object} t    POSTER_THEMES 里的一档
 * @param {Number} w    画布宽
 * @param {Number} h    画布高
 */
function drawTheme(ctx, t, w, h) {
	ctx.setFillStyle(t.base);
	ctx.fillRect(0, 0, w, h);
	const blobs = t.blobs || [];
	for (let i = blobs.length - 1; i >= 0; i--) {
		const b = blobs[i];
		const cx = b[0] * w;
		const cy = b[1] * h;
		const r = b[2] * w;
		const g = radial(ctx, cx, cy, r);
		if (!g) continue;
		g.addColorStop(0, 'rgba(' + b[3] + ',' + b[4] + ')');
		g.addColorStop(1, 'rgba(' + b[3] + ',0)');
		ctx.setFillStyle(g);
		ctx.fillRect(0, 0, w, h);
	}
}

/**
 * 一团「中心有色 → 边缘透明」的高光渐变，按这一端画布支持的那个名字取
 * @param {Object} ctx 画布上下文
 * @param {Number} cx 光心 x
 * @param {Number} cy 光心 y
 * @param {Number} r  半径
 * @return {Object|null} 可以 addColorStop 的渐变对象；这一端两个名字都没有时回 null
 */
function radial(ctx, cx, cy, r) {
	try {
		if (typeof ctx.createCircularGradient === 'function') return ctx.createCircularGradient(cx, cy, r);
		if (typeof ctx.createRadialGradient === 'function') return ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
	} catch (e) {
		// 老基础库上这两个名字可能直接抛：铺底色就够了，不值得为一点高光把整张海报卡住
	}
	return null;
}

/**
 * 样式条的清单：后台配了底图就整排用底图、**不再混进自带色档**（有图就不显示默认颜色，2026-09-26 用户定），
 * 一条都没配才整排用自带的弥散渐变；混排会让用户分不清「哪些是机构自己传的」。
 * 加载失败的地址由调用点摘掉（不留一个点上去是白的的色板）。
 * @param {Array}  shareBgs 后端下发的分享背景图地址清单
 * @param {Object} bgErrors 已加载失败的地址表（key = 地址原样）。调用点在组件 data 里存的是
 *                          mpKey(地址)（地址原样作 data 键会被 setData 当成嵌套路径，见 common/utils/mp-data-key），
 *                          交给本函数前先在调用点换回原地址 —— 本模块不依赖那个转键工具，
 *                          check-cert-render / check-daily-save-share 都是按「key = 地址」直接喂的
 * @return {Array} [{kind:'image',url}|{kind:'gradient',theme}]
 */
function buildStyleOptions(shareBgs, bgErrors) {
	const errors = bgErrors || {};
	const bgs = (shareBgs || [])
		.filter((u) => !!u && !errors[u])
		.map((u) => ({ kind: 'image', url: u }));
	return bgs.length ? bgs : POSTER_THEMES.map((t) => ({ kind: 'gradient', theme: t }));
}

/**
 * 底图清单是接口回来才变长的，选中的下标要收在范围内（打开弹层时停在 0，不会跳到别的档）
 * @param {Number} index 当前选中的下标
 * @param {Number} count 清单长度
 */
function clampIndex(index, count) {
	return count ? Math.min(Math.max(index || 0, 0), count - 1) : 0;
}

/**
 * 样式对象 → 行内样式串
 *
 * ⚠ 小程序端 `:style` 只吃字符串：绑一个变量（computed 返回的对象）会原样进 setData，
 *   wxml 的 style 属性把它 toString 成 `[object Object]` ⇒ 背景渐变与绝对定位整批静默丢掉
 *   （2026-09-28 连海报弹层时开发者工具视图层实测 `style="[object Object]"`，H5 看不出）。
 *   模板里 `:style="{ width: x + 'px' }"` 那种字面量由编译器拼成串，不受影响。
 * @param {Object} style 驼峰键的样式对象
 * @return {String} 'font-size:16px;line-height:26px' 这一档
 */
function styleText(style) {
	return Object.keys(style || {})
		.map((k) => k.replace(/([A-Z])/g, '-$1').toLowerCase() + ':' + style[k])
		.join(';');
}

/**
 * 样式条缩略图：底图档与弥散档走同一个 background 值位（小程序端 background-image 认网络地址）
 * @param {Object} option buildStyleOptions 出来的一项
 */
function thumbStyle(option) {
	if (!option) return {};
	if (option.kind === 'image') {
		return { backgroundImage: 'url(' + option.url + ')', backgroundSize: 'cover', backgroundPosition: 'center' };
	}
	return { background: themeCss(option.theme, THUMB_W) };
}

/** 画布与预览同一字体族：uni 的画布默认就是 sans-serif，写进简写里才拼得出按序完整的那一串 */
const POSTER_FONT_FAMILY = 'sans-serif';

/**
 * 画布上设「字号 + 字重」：预览 CSS 里写了 font-weight 的每一行，画布都要走同一档（M18③ 的镜像项）
 *
 * 只给字号不给字重，就是分享弹层里「切换预览那一档时，昵称等文字先变粗再变细」的成因：
 * 弹层一开显示的是本组件那一版 DOM 排版（昵称 bold），画布出的那一张图盖上去之后同一行是常规字重，
 * 两份不同重 → 每换一次样式档（renderedSrc 先清再回）就看一次跳变。
 *
 * ⚠ 这一串必须按 CSS 简写的顺序把 font-style 一起写全（style → weight → size → family）：
 *   - 微信小程序真机只认按序书写的完整简写，`ctx.font = 'bold 20px 微软雅黑'` 那种省掉 style 的写法
 *     在真机上会静默不加粗（模拟器看着是好的）；
 *   - uni-h5 的 `set font` 解析（node_modules/@dcloudio/uni-h5/src/core/service/api/context/canvas.js:518-574）
 *     在只剩一个 token 时自己再补一条 `setFontWeight normal`，拼给浏览器的串就成了 `bold normal 13px sans-serif`；
 *     两个 token 都显式给出时才是 `normal bold 13px sans-serif` 这一串合法的。
 *   H5 这一端只能靠这条简写：uni-h5 的上下文方法表里没有 setFontWeight 这个名字
 *   （即便调到了，落到渲染端也只是给 c2d 挂一个无意义的 fontWeight 属性）。
 *   小程序那一端 font 是 CanvasContext 的既有属性，但函数体里仍先调一次 setFontSize 兜底：
 *   这个名字两端都认，万一某档基础库不吃 font 简写，退化的只有字重而不是整行字号。
 *   ⚠ 真机上字重到底吃没吃进去只能看图验：验不过就把预览 CSS 那几处 font-weight 一起删掉，
 *   「两处都常规」同样是不跳变，绝不允许留一份粗细不一致的镜像。
 * @param {Object} ctx  uni.createCanvasContext 的上下文
 * @param {Number} size 字号
 * @param {Boolean} bold 要不要加粗，与预览那一行的 font-weight 同一判据
 */
function setFont(ctx, size, bold) {
	// 先走 setFontSize（两端都认这个名字），再补一次完整的 font 简写带上字重：
	// 万一某一端不认 font 这一档，退化的只是字重，不会连字号一起掉回画布默认的 10px
	ctx.setFontSize(size);
	ctx.font = 'normal ' + (bold ? 'bold' : 'normal') + ' ' + size + 'px ' + POSTER_FONT_FAMILY;
}

/**
 * 画布那一侧的文字宽度估算（只用来判截断与把文字收到某一侧，与预览的 ellipsis / text-align 对上）
 *
 * 中日韩字符与全角标点按整宽、其余（空格/西文/数字/破折号 U+2014）按半宽累加；
 * 不走 canvas.measureText：小程序与 H5 的返回结构不一样，估算是三端同一结果的唯一写法。
 * @param {String} str  要量的文字
 * @param {Number} size 字号
 * @return {Number} 估算宽度（px）
 */
function textWidth(str, size) {
	let width = 0;
	String(str || '').split('').forEach((ch) => {
		width += /[　-〿一-鿿＀-￯]/.test(ch) ? size : size / 2;
	});
	return width;
}

/**
 * 画布上的单行省略：预览那一侧是 CSS ellipsis，画布不会自己截，昵称/内容名一长就会压到旁边的块上
 * @param {String} text     原文
 * @param {Number} size     字号
 * @param {Number} maxWidth 可用宽度
 */
function fitText(text, size, maxWidth) {
	const t = String(text || '');
	if (!t || textWidth(t, size) <= maxWidth) return t;
	let s = t;
	while (s.length > 1 && textWidth(s + '…', size) > maxWidth) s = s.slice(0, -1);
	return s + '…';
}

/**
 * 按字号把文字折成画布上的多行（与预览那条 -webkit-line-clamp 同一算法：一行放几个字由可用宽算出来）
 * @param {String} text   原文
 * @param {Number} size   字号
 * @param {Number} maxW   一行的可用宽度
 * @param {Number} maxLines 最多几行（超出的行丢掉，与预览 clamp 同一结果）
 * @return {Array} 每行一个字符串
 */
function wrapText(text, size, maxW, maxLines) {
	const t = String(text || '');
	const lines = [];
	let cur = '';
	for (let i = 0; i < t.length; i++) {
		const next = cur + t.charAt(i);
		if (cur && textWidth(next, size) > maxW) {
			lines.push(cur);
			cur = t.charAt(i);
		} else {
			cur = next;
		}
	}
	if (cur) lines.push(cur);
	return lines.slice(0, maxLines || lines.length);
}

/**
 * `aspectFill` 那一刀的落点：预览 `<image mode="aspectFill">` 与画布 `drawImage` 必须是同一结果
 *
 * 方框不是原图比例时（头像是圆框、封面是 240×124），预览那一版居中裁掉多出来的两边，
 * 而画布直接 `drawImage(src, x, y, 框宽, 框高)` 是把**整张图压进框里**——两份不是同一刀，
 * 弹层里 DOM 排版与画布图交替出现那一刻，人就读成「头像里的人像上下跳/被压扁」
 * （2026-09-27 用户点名「头像、昵称还是会上下跳动」）。
 * @param {Object|null} size 原图宽高 {w,h}（预览 @load 的 e.detail 报回来）；没到手时退回整框
 * @param {Number} boxW 画框宽
 * @param {Number} [boxH] 画框高（不给时按正方形）
 * @return {Object} {x,y,w,h} 相对画框左上角的落点（x/y 会是负数，那正是被裁掉的那一头）
 */
function aspectFill(size, boxW, boxH) {
	const h = boxH === undefined ? boxW : boxH;
	if (!size || !size.w || !size.h) return { x: 0, y: 0, w: boxW, h: h };
	const k = Math.max(boxW / size.w, h / size.h);
	const dw = size.w * k;
	const dh = size.h * k;
	return { x: (boxW - dw) / 2, y: (h - dh) / 2, w: dw, h: dh };
}

/**
 * 圆角矩形路径：画布那一侧要画圆角的信息卡、也要按圆角裁封面，两份都得与预览的 border-radius 对上
 *
 * ⚠ 不能用微信小程序那个 ctx.drawRoundedRect —— uni-h5 的画布上下文没有这个方法
 *   （同一份上下文也没有 createRadialGradient，见 ui-baseline-mobile.md §4 那一行），
 *   只能自己用 arc + lineTo 拼；moveTo / lineTo / arc / closePath / fill / clip 这一组两端都有。
 *   调用方拿到路径后自己 fill（画卡）或 clip（裁图）。
 * @param {Object} ctx 画布上下文
 * @param {Number} x 左上角 x
 * @param {Number} y 左上角 y
 * @param {Number} w 宽
 * @param {Number} h 高
 * @param {Number} r 圆角半径（超过短边一半时按一半收，避免画出自交）
 */
function roundRect(ctx, x, y, w, h, r) {
	const rad = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rad, y);
	ctx.lineTo(x + w - rad, y);
	ctx.arc(x + w - rad, y + rad, rad, Math.PI * 1.5, Math.PI * 2, false);
	ctx.lineTo(x + w, y + h - rad);
	ctx.arc(x + w - rad, y + h - rad, rad, 0, Math.PI * 0.5, false);
	ctx.lineTo(x + rad, y + h);
	ctx.arc(x + rad, y + h - rad, rad, Math.PI * 0.5, Math.PI, false);
	ctx.lineTo(x, y + rad);
	ctx.arc(x + rad, y + rad, rad, Math.PI, Math.PI * 1.5, false);
	ctx.closePath();
}

export {
	POSTER_THEMES,
	POSTER_INK,
	inkOf,
	POSTER_W,
	POSTER_H,
	THUMB_W,
	blobCss,
	themeCss,
	drawTheme,
	radial,
	roundRect,
	aspectFill,
	setFont,
	buildStyleOptions,
	clampIndex,
	thumbStyle,
	styleText,
	textWidth,
	fitText,
	wrapText,
};
