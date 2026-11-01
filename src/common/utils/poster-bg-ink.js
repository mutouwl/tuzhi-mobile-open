/**
 * 底图档的字色探测器：商家自己上传的那张海报底图（`share_bgs`）是深是浅，由本模块判。
 *
 * 为什么需要：渐变档的明暗写在那张表里（`POSTER_THEMES` 的 `tone`），字色跟着一档走就够了；
 * 而底图档是商家上传的图，深浅不可知 —— 原先一律白字，浅底图（白底、浅色产品图）压上去就看不见，
 * 2026-10-28 用户点名「如果图片是空白的，还是没有默认填充」之后又补了这一刀：
 * **能判就按图的明暗切字色，判不出来按改造前的白字收口**（宁可维持现状，也不猜错）。
 *
 * 判法：把这张图缩成 24×24 的一小块，逐点算相对亮度（与 WCAG 那条对比度同一套算式），取平均；
 * 透明像素按「底下垫着的那层渐变底色」合成（海报在底图下面本来就铺着一层渐变，见 share-poster-body
 * 的 posterStyle），所以 PNG 的透明区域不会被误当成白底。
 *
 * 三条纪律（与 ui-baseline-mobile.md M18⑦ 同一口径）：
 *   ① 判不出来一律回 ''（调用方按白字收口），不许抛错、不许挡住海报；
 *   ② 整条探测有硬上限（PROBE_TIMEOUT），到点按「判不出来」收口；
 *   ③ 只在底图档跑（渐变档的 tone 是已知的），也不在每次重画时反复读像素。
 */
import { resolvePosterImages } from '@/common/utils/poster-render';
import { POSTER_THEMES } from '@/common/utils/poster-theme';

/** 平均相对亮度 ≥ 这一档算「浅底」（配深字），低于它算「深底」（配白字） */
const LIGHT_LUMINANCE = 0.62;
/** 取样边长：24×24 = 576 个点，判明暗够用，低端机也不会卡一下 */
const SAMPLE_SIZE = 24;
/** 整条探测的硬上限：到点按「判不出来」收口（白字），绝不能让海报等它 */
const PROBE_TIMEOUT = 1200;

/**
 * 平均亮度 → 该用哪一套字色
 * @param {Number} lum 平均相对亮度（0~1）
 * @return {String} 'light'（浅底配深字）| 'dark'（深底配白字）
 */
function inkForLuminance(lum) {
	return Number(lum) >= LIGHT_LUMINANCE ? 'light' : 'dark';
}

/** '#rrggbb' / 'rgb(a)(…)' → [r,g,b]（解析不出来按白底） */
function parseColor(c) {
	const s = String(c || '').trim();
	if (s.charAt(0) === '#') {
		const hex = s.length === 4
			? s.slice(1).split('').map((x) => x + x).join('')
			: s.slice(1, 7);
		if (hex.length !== 6) return [255, 255, 255];
		return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
	}
	const m = s.match(/rgba?\(([^)]+)\)/);
	if (!m) return [255, 255, 255];
	const n = m[1].split(',').map((x) => parseFloat(x));
	return [n[0] || 0, n[1] || 0, n[2] || 0];
}

/** 单通道 sRGB → 线性（WCAG 相对亮度那一套） */
function linear(v) {
	const c = v / 255;
	return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * 一块 RGBA 像素的平均相对亮度（透明处按 under 合成）
 * @param {Uint8ClampedArray|Array} data RGBA 序列
 * @param {Array} under 垫在底下的那层底色 [r,g,b]
 * @return {Number} 0~1；没有像素时回 -1（调用方据此按「判不出来」收口）
 */
function luminanceOfPixels(data, under) {
	if (!data || !data.length) return -1;
	const bg = under && under.length === 3 ? under : [255, 255, 255];
	let sum = 0;
	let n = 0;
	for (let i = 0; i + 3 < data.length; i += 4) {
		const a = data[i + 3] / 255;
		const r = data[i] * a + bg[0] * (1 - a);
		const g = data[i + 1] * a + bg[1] * (1 - a);
		const b = data[i + 2] * a + bg[2] * (1 - a);
		sum += 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
		n += 1;
	}
	return n ? sum / n : -1;
}

/**
 * 把一张图缩到 SAMPLE_SIZE 见方，读像素算平均亮度
 * @param {Object} ctx   2d 上下文（H5 的 <canvas> 或小程序离屏画布，两端都认这一组方法）
 * @param {Object} img   已经 load 完的图片对象（H5 的 Image / 小程序 createImage 造的那只）
 * @param {Array}  under 垫在底下的那层底色
 * @return {String} 'light' | 'dark' | ''（读不到像素：画布被污染 / 端不支持）
 */
function sampleInk(ctx, img, under) {
	try {
		ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
		const pixels = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
		const lum = luminanceOfPixels(pixels && pixels.data, under);
		return lum < 0 ? '' : inkForLuminance(lum);
	} catch (e) {
		// 跨域图没给 CORS 头时 getImageData 会抛 SecurityError；小程序离屏画布不支持时也会抛。
		// 两种都按「判不出来」收口，不往控制台刷一屏红字（用户看到的是海报照常出、只是白字）
		return '';
	}
}

/**
 * H5 / App-vue 那一端：先把地址换成本机可读的那一份，再画进一张临时画布读像素
 * （同源校验、blob 换来由都在 poster-render 里，换不到就回 ''）
 */
function probeOnCanvas(src, under) {
	return resolvePosterImages([src]).then((map) => {
		const url = (map && map[src]) || '';
		if (!url) return '';
		if (typeof document === 'undefined' || typeof Image === 'undefined') return '';
		return new Promise((resolve) => {
			let settled = false;
			const fin = (v) => { if (!settled) { settled = true; resolve(v); } };
			const img = new Image();
			img.onload = () => {
				let c = null;
				try {
					c = document.createElement('canvas');
					c.width = SAMPLE_SIZE;
					c.height = SAMPLE_SIZE;
				} catch (e) {
					c = null;
				}
				const ctx = c && c.getContext ? c.getContext('2d') : null;
				if (!ctx) return fin('');
				fin(sampleInk(ctx, img, under));
			};
			img.onerror = () => fin('');
			img.src = url;
		});
	}).catch(() => '');
}

/**
 * 小程序端：离屏画布（`wx.createOffscreenCanvas`，基础库 2.16.1+）读像素
 * 端上不支持 / 图片造不出来 / 读不到像素，一律回 ''（调用方按白字收口）
 */
function probeOnMp(src, under) {
	return resolvePosterImages([src]).then((map) => {
		const url = (map && map[src]) || '';
		if (!url || typeof wx === 'undefined' || typeof wx.createOffscreenCanvas !== 'function') return '';
		let canvas = null;
		let ctx = null;
		try {
			canvas = wx.createOffscreenCanvas({ type: '2d', width: SAMPLE_SIZE, height: SAMPLE_SIZE });
			ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
		} catch (e) {
			return '';
		}
		if (!ctx || typeof canvas.createImage !== 'function') return '';
		return new Promise((resolve) => {
			let settled = false;
			const fin = (v) => { if (!settled) { settled = true; resolve(v); } };
			let img = null;
			try {
				img = canvas.createImage();
			} catch (e) {
				img = null;
			}
			if (!img) return fin('');
			img.onload = () => fin(sampleInk(ctx, img, under));
			img.onerror = () => fin('');
			img.src = url;
		});
	}).catch(() => '');
}

/**
 * 这一张底图该配哪一套字色（预览与画布随后都读同一个结果）
 *
 * 返回空串 = 判不出来（端不支持 / 跨域污染 / 超时）：调用方按**改造前的白字口径**收口，
 * 不许当成「深底」以外的任何含义用（那会让浅底图又变回看不见）。
 * @param {String} src  底图地址（商家上传的那一张）
 * @param {Object} [opts] { under: 垫在透明区域底下的颜色，默认第一档渐变的底色 }
 * @return {Promise<String>} 'light' | 'dark' | ''
 */
function probePosterInk(src, opts) {
	const under = parseColor((opts && opts.under) || (POSTER_THEMES[0] || {}).base || '#ffffff');
	if (!src) return Promise.resolve('');
	const isMp = typeof wx !== 'undefined' && typeof wx.createOffscreenCanvas === 'function';
	// 探测本身也不许抛（端上没有所需对象、或换地址那一步同步抛错）：一律当成「判不出来」
	let work = null;
	try {
		work = isMp ? probeOnMp(src, under) : probeOnCanvas(src, under);
	} catch (e) {
		work = '';
	}
	return new Promise((resolve) => {
		let settled = false;
		const fin = (v) => { if (!settled) { settled = true; resolve(v); } };
		const timer = setTimeout(() => fin(''), PROBE_TIMEOUT);
		Promise.resolve(work)
			.then((v) => { clearTimeout(timer); fin(v || ''); })
			.catch(() => { clearTimeout(timer); fin(''); });
	});
}

export {
	LIGHT_LUMINANCE,
	SAMPLE_SIZE,
	PROBE_TIMEOUT,
	inkForLuminance,
	luminanceOfPixels,
	probePosterInk,
};
