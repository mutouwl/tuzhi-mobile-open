/**
 * 前端海报出图公共类：canvas 渲染 → 导出图片 → 失败降档，外加「图片地址按端预解析」。
 *
 * 为什么要有这一只类：前端出图的面不止一个（打卡日签图 / 全局分享 / 活动海报 / 证书），
 * 画布渲染、canvasToTempFilePath、超时兜底、外域图污染后的降档重画、小程序端 base64 落临时文件——
 * 这套机制每个面都要一遍，各写一份必分叉（证书面首版就是从 share-poster 抄出来的，2026-09-27 收进本类）。
 *
 * 两代实现的关系：
 *   - tz-share-poster / tz-share-poster-body 是第一代（300×400 两档版式），它的 drawPoster 循环被
 *     scripts/check-daily-save-share.js 的断言与 ui-baseline-mobile.md M18 逐行钉住，保持原状；
 *   - 本类是第二代公共实现，**新的海报面一律用它**（证书 tz-cert-viewer 即此）；两链路的合并
 *     待那只断言脚本重构时一并收口，在此之前不要往 share-poster 里加第三档版式。
 *
 * 端路（保存 / 分享 / 提示）不在这里：它们收在 common/utils/poster-save.js（长按链路那一套的同一份）。
 */

const DATA_URL = /^data:image\/[a-z+]+;base64,/i;
const BLOB_URL = /^(blob|file):/i;

// 一张图最多等这么久：uni-h5 画布那套内部预加载只挂 onload、没有 onerror，
// 地址取不到就一直不回音，画布从此卡在 actionsWaiting（后续每一次重画都被塞进死队列），
// 用户症状是「海报出来是空白的、点重新生成也没反应」。所以地址必须先在本类这里验完再交给画布。
const RESOLVE_TIMEOUT = 5000;

// 画布 id 按实例唯一：uni-h5 的 createCanvasContext(id, this) 里 this 只用来取页面 id，
// 同页两只同名 canvas-id 会画到第一张上（ui-baseline-mobile.md §4，share-poster-body 同款自增）
let canvasSeq = 0;
// 小程序临时图文件名也按次唯一，避免两只海报互相同名覆盖
let fileSeq = 0;
// 本类在 H5 造出来的 blob 地址，释放由调用面走 releasePosterImages
const createdBlobs = [];

/** 下一个唯一的 canvas-id（前缀按调用面给，如 'certv' / 'sp'） */
export function nextCanvasId(prefix) {
	return prefix + '-canvas-' + (++canvasSeq);
}

/** 地址与页面同源吗（与 uni-h5 自己的判法同款：挂个 a 让浏览器解析） */
function isSameOrigin(src) {
	if (typeof document === 'undefined') return true;
	try {
		const a = document.createElement('a');
		a.href = src;
		return a.origin === window.location.origin;
	} catch (e) {
		return true;
	}
}

/**
 * 把一张图真正解码一遍：onload 才算可用，onerror/超时算取不到
 * 画布那边的 drawImage 只认「地址」，不等它回音，所以这一步必须在本类里先做完
 */
function decodeImage(src) {
	return new Promise((resolve) => {
		if (typeof Image === 'undefined') {
			resolve(true);
			return;
		}
		let settled = false;
		const done = (ok) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve(ok);
		};
		const timer = setTimeout(() => done(false), RESOLVE_TIMEOUT);
		const img = new Image();
		img.onload = () => done(true);
		img.onerror = () => done(false);
		img.src = src;
	});
}

/**
 * 把一张图片地址解析成这一端画布/预览都能用的地址
 *
 * 小程序画布只认本地路径：base64 要先写一张用户目录下的临时图（写盘失败回 ''），
 * 网络图走 getImageInfo 拿本地路径（同时完成下载，fail 回 ''）；两条都带超时兜底，
 * 平台不回音就按取不到处理，不能让一张图把整条出图路卡死（M13 的反面：宁缺不堵）。
 *
 * H5：内联（data:）与同源地址先解码一遍再交原址；**跨域 http 图先按 CORS 取成同源 blob 地址**——
 * 直接把跨域原址交给画布会污染整张画布，toDataURL 从此永久抛错，而且污染在同一只画布上洗不回来，
 * 降档重画也救不回来（uni-h5 自己那套转 blob 的兜底挂在 XHR 上，失败只会回退成原址）。
 * 图床不给 CORS 头时这一层只能丢（画出来就等于整张导出失败），线上前后端同源不受影响。
 * 任何失败都 resolve('')，由调用面决定丢这张图还是整个失败。
 * @param {String} src 原始地址（http / data:base64）
 * @returns {Promise<String>} 可绘地址，取不到为 ''
 */
export function resolvePosterImage(src) {
	return new Promise((outerResolve) => {
		const s = String(src || '');
		if (!s) {
			outerResolve('');
			return;
		}
		let settled = false;
		const resolve = (v) => {
			if (settled) return;
			settled = true;
			clearTimeout(guard);
			outerResolve(v);
		};
		const guard = setTimeout(() => resolve(''), RESOLVE_TIMEOUT + 1000);

		// #ifdef MP-WEIXIN
		if (DATA_URL.test(s)) {
			const filePath = wx.env.USER_DATA_PATH + '/poster-img-' + (++fileSeq) + '.png';
			try {
				wx.getFileSystemManager().writeFile({
					filePath: filePath,
					data: s.replace(DATA_URL, ''),
					encoding: 'base64',
					success: () => resolve(filePath),
					fail: () => resolve(''),
				});
				return;
			} catch (e) {
				// 老基础库没有 USER_DATA_PATH / 写盘能力
				resolve('');
				return;
			}
		}
		uni.getImageInfo({
			src: s,
			success: (res) => resolve((res && res.path) || ''),
			fail: () => resolve(''),
		});
		return;
		// #endif

		// #ifndef MP-WEIXIN
		// 非浏览器宿主（Node 侧的比对桩）没有 Image/document，原样给出
		if (typeof window === 'undefined' || typeof document === 'undefined') {
			resolve(s);
			return;
		}
		if (DATA_URL.test(s) || BLOB_URL.test(s) || isSameOrigin(s)) {
			decodeImage(s).then((ok) => resolve(ok ? s : ''));
			return;
		}
		if (typeof fetch !== 'function' || typeof URL === 'undefined' || !URL.createObjectURL) {
			resolve('');
			return;
		}
		fetch(s, { mode: 'cors', credentials: 'omit' })
			.then((r) => {
				if (!r || !r.ok) throw new Error('poster img http ' + (r && r.status));
				return r.blob();
			})
			.then((blob) => {
				const url = URL.createObjectURL(blob);
				createdBlobs.push(url);
				return url;
			})
			.then((url) => decodeImage(url).then((ok) => {
				if (ok) { resolve(url); return; }
				// 解不开就当场回收，别留一只没人用的 blob
				releasePosterImages({ [s]: url });
				resolve('');
			}))
			.catch(() => resolve(''));
		return;
		// #endif
	});
}

/**
 * 一批地址按序解析成 { 原地址: 可绘地址 } 映射（去重，同一张图只解析一次）
 * @param {Array<String>} srcs
 * @returns {Promise<Object>}
 */
export function resolvePosterImages(srcs) {
	const uniq = [];
	(srcs || []).forEach((s) => {
		if (s && uniq.indexOf(s) < 0) uniq.push(s);
	});
	const tasks = uniq.map((s) => resolvePosterImage(s));
	return Promise.all(tasks).then((list) => {
		const map = {};
		uniq.forEach((s, i) => { map[s] = list[i]; });
		return map;
	});
}

/**
 * 回收这一批解析结果里本类造出来的 blob 地址（换一张海报前传**上一批**、组件销毁时传当前这批）
 *
 * 只撤传进来的这些，不做「其余全撤」：同页可能同时挂着两只海报（分享弹层与证书弹层），
 * 另一只正在用的地址不在这一批里，全撤会把它的图画成空白。
 * @param {Object} map resolvePosterImages 的返回
 */
export function releasePosterImages(map) {
	if (typeof URL === 'undefined' || !URL.revokeObjectURL) return;
	Object.keys(map || {}).forEach((key) => {
		const url = map[key];
		const at = createdBlobs.indexOf(url);
		if (at < 0) return;
		createdBlobs.splice(at, 1);
		try { URL.revokeObjectURL(url); } catch (e) { /* 已经撤过 */ }
	});
}

/**
 * 海报画布：一只画布对应一次「按指令画 → 导出图」的完整链路
 *
 * 用法（证书面）：
 *   const canvas = new PosterCanvas({ canvasId, scope: this, width: 760, height: 1360 });
 *   const src = await canvas.renderWithDegrade({
 *     paint: (lv, ctx) => { ...按 lv 丢层画... },
 *     nextLevel: (lv) => (lv < 2 ? lv + 1 : lv),
 *   });  // 出图失败且无可退档时 reject，由调用面给失败出口（M13）
 *
 * 渲染结果：H5 为 data: 地址、小程序为本地临时文件（canvasToTempFilePath 的产物），
 * 调用面不要在渲染这一刻做上传（上传只发生在用户明确点「保存」那条路，见 poster-save）。
 */
export class PosterCanvas {
	/**
	 * @param {Object}   o { canvasId, scope, width, height, timeoutMs }
	 * @param {String}   o.canvasId  唯一画布 id（nextCanvasId 生成）
	 * @param {Object}   o.scope     组件实例（createCanvasContext 第二参，小程序端按它找组件内节点）
	 * @param {Number}   o.width     画布宽（与绘制坐标同单位，即画布元素的 CSS 宽）
	 * @param {Number}   o.height    画布高
	 * @param {Number}   [o.timeoutMs=6000] 单次导出的超时兜底：画布那张图取不到回音时永远没有回调，
	 *                   没有它「点了保存没反应」（share-poster-body 用 4000，证书面图大给 6000）
	 */
	constructor(o) {
		this.canvasId = o.canvasId;
		this.scope = o.scope;
		this.width = o.width;
		this.height = o.height;
		this.timeoutMs = o.timeoutMs || 6000;
	}

	/**
	 * 画一次并导出
	 * @param {Function} paint    (ctx) => void，同步把这一版画完（不含 ctx.draw）
	 * @param {Object}   [opts]   { reserve }: ctx.draw 的第一参——
	 *                    true = 保留上一帧（share-poster-body 那种「每次全量重画但留底」的历史口径），
	 *                    false = 先清空再画（证书面：白底要自己铺，不能叠上一张）
	 * @returns {Promise<String>} 图片地址；导出失败 / 超时 reject
	 */
	render(paint, opts) {
		const reserve = !!(opts && opts.reserve);
		return new Promise((resolve, reject) => {
			const ctx = uni.createCanvasContext(this.canvasId, this.scope);
			paint(ctx);
			let settled = false;
			const timer = setTimeout(() => {
				// 外域图把导出卡死的第二种形态：画布的图片加载队列只挂 onload，取不到就永远没有回音
				if (settled) return;
				settled = true;
				reject(new Error('poster export timeout'));
			}, this.timeoutMs);
			ctx.draw(reserve, () => {
				uni.canvasToTempFilePath({
					canvasId: this.canvasId,
					success: (res) => {
						if (settled) return;
						const path = (res && res.tempFilePath) || '';
						if (!path) {
							// 空地址也算失败：调用面按「没有可退的档」处理，别把它当出图成功交给用户
							// （留一张什么都没有的白图，用户读出来就是「生成的证书是空白的」）
							settled = true;
							clearTimeout(timer);
							reject(new Error('poster export empty'));
							return;
						}
						settled = true;
						clearTimeout(timer);
						resolve(path);
					},
					fail: (e) => {
						if (settled) return;
						settled = true;
						clearTimeout(timer);
						// 外域图污染画布：toDataURL 抛错只回 fail（第一种形态）
						reject(e || new Error('poster export fail'));
					},
				}, this.scope);
			});
		});
	}

	/**
	 * 带降档的出图：第 0 档全画，导出失败（污染 / 超时）时退到 nextLevel 给的下一档重画，
	 * 没有更下一档就 reject。退档判据在调用面（哪张图可疑只有它知道），本类只管循环与收敛。
	 * @param {Object}   o { paint, nextLevel, startLevel }
	 * @param {Function} o.paint     (level, ctx) => void，按档画（level 越大丢得越多）
	 * @param {Function} o.nextLevel (level) => level，给下一档；返回同值 = 没有可退的档，到此为止
	 * @param {Number}   [o.startLevel=0] 起始档（重试链从调用面给的档继续退）
	 * @returns {Promise<String>} 图片地址
	 */
	renderWithDegrade(o) {
		const paint = o.paint;
		const nextLevel = o.nextLevel;
		let lv = o.startLevel || 0;
		const attempt = () => this.render((ctx) => paint(lv, ctx), { reserve: false }).catch((e) => {
			const next = nextLevel(lv);
			if (!(next > lv)) throw e;
			lv = next;
			return attempt();
		});
		return attempt();
	}
}
