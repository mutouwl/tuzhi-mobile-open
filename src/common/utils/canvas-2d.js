/**
 * 微信小程序 `type="2d"` 画布的适配层
 *
 * 为什么非要有这一层（2026-09-28 实测）：微信端旧版画布（`uni.createCanvasContext` + `ctx.draw(cb)`）
 * 在本项目里**永远不回音**——`draw` 的回调不触发、`canvasToTempFilePath` 报 `fail canvas is empty`，
 * 而上下文上 `nodeId` 有值（节点找得到）、`canvas-id` 与 `id` 都对；把画布从屏外搬进屏内、
 * 从弹层里搬到弹层外，四种摆法都一样。后果是海报出不了图：遮罩只能靠出图超时撤，
 * 「保存 / 分享」两条也永远拿不到那张图。只有 `type="2d"` 这一条路能出图。
 *
 * 2d 与旧接口有三处不一样，都在这里抹平：
 *  ① 名字：旧的是 `setFillStyle()/setFontSize()/createCircularGradient()/draw()`，
 *     2d 是标准 `CanvasRenderingContext2D`（`fillStyle` 是属性、没有 `draw()`、渐变只有 `createRadialGradient`）；
 *  ② 图片：旧接口 `drawImage('路径', ...)` 直接吃地址，2d **只吃 `canvas.createImage()` 造出来的图片对象**，
 *     所以开画之前要先把手上那几个地址加载成图片对象（每一张都有超时、可给备选地址；真的都没到手的那些
 *     交给调用方决定退档还是重试，不能让整张卡住，M13）；
 *  ③ 尺寸：2d 的画布像素 = `canvas.width/height`，要自己按 dpr 放大再 `ctx.scale(dpr, dpr)`，
 *     否则存下来的图是糊的。
 *
 * H5 / App 不走这里：那一端 `uni.createCanvasContext` 落到 DOM canvas，一直是好的。
 */

/** 取 2d 画布的节点与上下文，并按 dpr 把画布像素尺寸铺好
 * @param {Object} vm 组件实例（选择器要限定在它的作用域里）
 * @param {String} id 画布节点的 id
 * @param {Number} w 逻辑宽（CSS px）
 * @param {Number} h 逻辑高（CSS px）
 * @return {Promise<{canvas:Object,ctx:Object,dpr:Number}>}
 */
function get2dCanvas(vm, id, w, h) {
	return new Promise((resolve, reject) => {
		let dpr = 2;
		try {
			dpr = (uni.getSystemInfoSync().pixelRatio || 2);
		} catch (e) {
			dpr = 2;
		}
		uni.createSelectorQuery().in(vm).select('#' + id).fields({ node: true, size: true }).exec((res) => {
			const node = res && res[0] && res[0].node;
			if (!node) {
				reject(new Error('canvas-2d-node-missing'));
				return;
			}
			node.width = Math.round(w * dpr);
			node.height = Math.round(h * dpr);
			const ctx = node.getContext('2d');
			if (!ctx) {
				reject(new Error('canvas-2d-no-context'));
				return;
			}
			// 之后所有绘制都按 CSS px 下笔，与旧接口、与预览那一版排版同一套坐标
			ctx.scale(dpr, dpr);
			resolve({ canvas: node, ctx: ctx, dpr: dpr });
		});
	});
}

/**
 * 单张图等多久算「这一张没到手」
 *
 * 正常路径（本地临时文件、已经在 <image> 里加载过的网络图）都是毫秒级回来，这个上限只兜
 * 「回调根本不触发」那种静默失败——没有它，一张不回音的图会把整条出图链陪着挂住（M13）。
 */
const IMG_TIMEOUT = 1500;

/**
 * 把手上的图片地址加载成 2d 能画的图片对象
 *
 * 只认这一端造出来的对象：`canvas.createImage()` 之后要等 `onload`。两个坑都在这儿收口：
 *  ① 回调可能**永远不回来**（地址不可加载时既不出 onload 也不出 onerror）：每一张都配 IMG_TIMEOUT，
 *     到点就当这一张没到手，不能让整条出图链陪着挂住；
 *  ② 同一张图可能有**不止一个可用地址**：小程序端那张码的主地址是写盘下来的本地文件路径，
 *     备选是接口原样的 base64（2026-09-28 用户点名「后端已经生成好了、海报里却不显示」——
 *     本地路径在部分基础库/机型上加载不出图片对象，而少了这一张的图照样能导出去盖住预览）。
 *     `alts` 给备选清单，按序试、谁先到手用谁，结果**按主地址登记**（画的时候调用方用的还是主地址）。
 * @param {Object} canvas 2d 画布节点
 * @param {Array} srcs 图片地址（本地临时文件 / 已在 downloadFile 白名单里的网络地址）
 * @param {Object} alts 可选：{ 主地址: [备选地址, ...] }
 * @return {Promise<Object>} key = **主地址**，value = 加载好的图片对象；
 *                            一张都没到手的那些**不在清单里**（调用方据此判「这一层这次能不能画」）
 */
function load2dImages(canvas, srcs, alts) {
	const list = (srcs || []).filter((s) => !!s);
	const altMap = alts || {};
	const loadOne = (src) => new Promise((resolve) => {
		let img = null;
		try {
			img = canvas.createImage();
		} catch (e) {
			resolve(null);
			return;
		}
		let settled = false;
		let timer = null;
		const settle = (r) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			img.onload = null;
			img.onerror = null;
			resolve(r);
		};
		timer = setTimeout(() => settle(null), IMG_TIMEOUT);
		img.onload = () => settle(img);
		img.onerror = () => settle(null);
		img.src = src;
	});
	// 一个主地址的候选清单：主地址先试，不成再逐个试备选，全试完还没有就是这一层这次画不了
	const loadBySrc = (src) => {
		const cands = [src].concat(altMap[src] || []);
		let i = 0;
		const next = () => {
			if (i >= cands.length) return Promise.resolve(null);
			const cand = cands[i++];
			return loadOne(cand).then((img) => (img ? { src: src, img: img } : next()));
		};
		return next();
	};
	return Promise.all(list.map(loadBySrc)).then((rows) => {
		const map = {};
		const missing = [];
		rows.forEach((r, i) => {
			if (r) map[r.src] = r.img;
			else missing.push(list[i]);
		});
		// 静默缺失正是「海报上少一块」最难查的一类：这里必须留一声（调用方据此决定退档还是重试）
		if (missing.length) console.warn('[canvas-2d] 这些图没能加载成画布图片对象（含备选都没成的）：', missing);
		return map;
	});
}

/**
 * 把 2d 上下文包成旧接口的那套名字，好让海报那一份绘制代码两端共用
 *
 * 绘制代码只用到 setFillStyle / setFontSize + font / fillRect / fillText / drawImage /
 * beginPath / moveTo / lineTo / arc / closePath / fill / clip / save / restore /
 * createCircularGradient / draw 这一批，其余属性（fillStyle、font、textAlign…）直接透传。
 * @param {Object} ctx 2d 上下文
 * @param {Object} canvas 画布节点（drawImage 的图片对象由它造出来）
 * @param {Object} images 地址 → 图片对象（load2dImages 的产物）
 * @return {Object} 旧接口形状的上下文
 */
function wrap2d(ctx, canvas, images) {
	const miss = [];
	const shim = {
		setFillStyle(v) { ctx.fillStyle = v; },
		setStrokeStyle(v) { ctx.strokeStyle = v; },
		// 旧接口只给字号时不改字重；这里补一份与 setFont 同款的按序完整简写，
		// 万一调用方只调 setFontSize，也不会掉回画布默认的 10px
		setFontSize(size) { ctx.font = 'normal normal ' + size + 'px sans-serif'; },
		createCircularGradient(x, y, r) { return ctx.createRadialGradient(x, y, 0, x, y, r); },
		createRadialGradient(x0, y0, r0, x1, y1, r1) { return ctx.createRadialGradient(x0, y0, r0, x1, y1, r1); },
		// 2d 是即时模式：命令下去就画完了，没有旧接口那一层「draw 之后才回音」
		draw(reserve, cb) {
			if (typeof reserve === 'function') { reserve(); return; }
			if (typeof cb === 'function') cb();
		},
		miss,
	};
	return new Proxy(shim, {
		get(target, key) {
			if (key in target) return target[key];
			const v = ctx[key];
			if (typeof v === 'function') {
				const bound = function (...args) {
					if (key === 'drawImage') {
						const src = args[0];
						const img = typeof src === 'string' ? images[src] : src;
						if (!img) {
							// 这一层没到手就整层跳过：旧接口那边对应「图取不到 → 退档」
							miss.push(String(src));
							return undefined;
						}
						return v.apply(ctx, [img].concat(args.slice(1)));
					}
					return v.apply(ctx, args);
				};
				target[key] = bound;
				return bound;
			}
			return v;
		},
		set(target, key, value) {
			ctx[key] = value;
			return true;
		},
	});
}

/** 导出成这一端能用的图片地址（2d 要把画布节点交给接口，而不是 canvasId）
 * @param {Object} canvas 2d 画布节点
 * @param {Object} vm 组件实例
 * @return {Promise<String>} 临时文件路径；失败时 reject
 */
function export2d(canvas, vm) {
	return new Promise((resolve, reject) => {
		uni.canvasToTempFilePath({
			canvas: canvas,
			success: (res) => resolve(res && res.tempFilePath),
			fail: (e) => reject(e || new Error('canvas-2d-export-fail')),
		}, vm);
	});
}

export { get2dCanvas, load2dImages, wrap2d, export2d };
