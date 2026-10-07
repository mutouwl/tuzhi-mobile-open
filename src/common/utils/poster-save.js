/**
 * 海报「保存 / 分享」两条端路的唯一实现
 *
 * H5 没有 `uni.saveImageToPhotosAlbum`（uni-h5 把它列在 todo-api.js，调用只剩一句 console.error），
 * 这一端的保存只剩两条真路：能下载的内核走 `a[download]`（由调用方的 onDirect 补），
 * 微信内置浏览器与 iOS Safari 只能把图放大让用户长按。
 *
 * 2026-09-27 用户两次点名（先是证书弹层，再是日签图）：**点「保存」不许往服务器上传**。
 * 原先那一条「靠长按的端先把画布图走 `common/upload` 落成 http 地址再预览」（起因是 2026-09-26
 * 实机点名「长按 data: 图没反应」）整段删掉——这张图是这一次现算出来的，点一次保存就往商家服务器
 * 写一张没有收益的文件。出路是 `toSavableSrc`：**同一份像素，换成浏览器当普通图片资源看待的 blob 地址**
 * （`data:` 是文档内容、不是资源，长按它微信内 / iOS Safari 不弹「保存图片」；`blob:` 与一张真的图片
 * 一样可以长按保存），仍然一次网络请求都不发，也不需要后端出图给一条 http 地址。
 *
 * 调用点：tz-share-poster（日签图/全局分享/活动海报）、tz-cert-viewer（证书）、pages/public/banpc（PC 限制页）。
 */

/** 提示文案（各处弹层同一份，改一处就全部一起变） */
export const POSTER_TIP = {
	// 只能靠长按的内核：放大图片的同一刻给一句「怎么存」
	savable: '长按图片可保存至相册',
};

/** 画布出图在 H5 上就是这种地址（uni-h5 的 canvasToTempFilePath 走 toDataURL，见下） */
const DATA_URL = /^data:image\/[a-z0-9.+-]+;base64,/i;

/** 同一份 data: 只换一次：blob 地址随文档一起收走，不必每点一次保存都新建一个 */
const savableMap = {};

/**
 * 交给浏览器的地址：画布出的是 data: 就换成等价的 blob 地址，其余地址原样给出去
 *
 * 为什么（2026-09-28 用户点名 H5 端「不能长按图片保存」）：H5 上 `canvasToTempFilePath` 是
 * `toDataURL` 的结果，即一段文档内容而不是一张图片资源；微信内置浏览器与 iOS Safari 对它长按时
 * 不弹「保存图片到相册」。把同一份字节包成 Blob 换成 `blob:` 地址后，它就是浏览器眼里的图片资源，
 * 长按保存、另存、右键下载全都回到正常那条路上——**像素一模一样，零网络请求**（见文件头）。
 *
 * 用 `typeof` 逐个判浏览器那几样（小程序 / App 端根本不进来：小程序画布给的是 `wxfile://` 本地路径），
 * 换不出来就原样给出去：调用方那一侧什么都不用自己判。
 * @param {String} src 画布或接口出的地址（data: 会换，http/blob/wxfile 原样）
 * @returns {String} 浏览器能当图片资源对待的地址（换不出来时就是入参本身）
 */
export function toSavableSrc(src) {
	if (typeof src !== 'string' || !DATA_URL.test(src)) return src;
	if (savableMap[src]) return savableMap[src];
	try {
		if (typeof document === 'undefined' || typeof atob !== 'function' || typeof Blob !== 'function') return src;
		if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return src;
		const bin = atob(src.slice(src.indexOf(',') + 1));
		const bytes = new Uint8Array(bin.length);
		for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
		const blob = URL.createObjectURL(new Blob([bytes], { type: src.slice(5, src.indexOf(';')) }));
		savableMap[src] = blob;
		return blob;
	} catch (e) {
		// 换不出来不是故障：原样给出去（小程序端与接口给的地址本来就该原样走）
		return src;
	}
}

/**
 * 这一端是不是「只能靠长按」保存
 *
 * H5 上 `a[download]` 在微信内会被忽略并跳走、在 iOS Safari 只会另开一个预览页，
 * 那两种内核除了长按没有别的保存入口；其余浏览器还能直接下载（见调用方的 downloadPoster）。
 * @param {Boolean} inWechat 是不是微信内置浏览器（调用方用 $wxsdk.isWechat() 判，组件自己算）
 */
export function longPressOnly(inWechat) {
	// #ifdef H5
	if (inWechat) return true;
	return /iphone|ipad/i.test((typeof navigator !== 'undefined' && navigator.userAgent) || '');
	// #endif
	return false;
}

/**
 * 放大海报并给一句「怎么存」（H5 端「保存」唯一的一条路）
 *
 * 一律按拿到手的那个地址放大，**不发任何上传请求**（见文件头）。同一刻弹一句 `POSTER_TIP.savable`，
 * 只有一种情况不弹：这一端不是只能靠长按、调用面又另有自己的保存出口（普通浏览器的 `a[download]`），
 * 那一条路自己会弹「已保存」，两句撞在一起读不出哪句算数。
 * @param {String}   src    画布或接口出的地址（**调用前先过一次 toSavableSrc**：data: 要换成 blob，
 *                           否则长按那一下在微信内 / iOS Safari 不弹「保存图片」——见 toSavableSrc）
 * @param {Object}   [opts] { inWechat: 是否微信内, onDirect: (url)=>void, extra: 透传给 previewImage 的其余参数 }
 */
export function previewSavablePoster(src, opts) {
	const o = opts || {};
	// extra：活动海报那一份要带小程序端的 longPressActions（长按菜单三项），H5 用不到就不传
	uni.previewImage(Object.assign({ current: 0, urls: [src] }, o.extra || {}));
	if (!longPressOnly(o.inWechat) && typeof o.onDirect === 'function') {
		o.onDirect(src);
		return;
	}
	uni.showToast({ title: POSTER_TIP.savable, icon: 'none' });
}

/**
 * 相册接口保存（小程序 / App 端路）
 *
 * H5 没有这个 API（uni-h5 把它列在 todo-api.js，调用只剩一句 console.error，既不回 success 也不回
 * fail ⇒ 「点了保存没反应」），所以调用面必须只在 `#ifndef H5` 里用本函数；H5 端的保存走上面的
 * previewSavablePoster（放大长按）。两条路都要有 success/fail 出口（M13）。
 * @param {String} src     canvasToTempFilePath 出的本地临时文件地址
 * @param {String} subject 这张图叫什么（'证书' / '日签图'），成功提示共用这一个词
 */
export function savePosterToAlbum(src, subject) {
	uni.saveImageToPhotosAlbum({
		filePath: src,
		success: () => uni.showToast({ title: subject + '已保存', icon: 'none' }),
		fail: () => uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' }),
	});
}

/** 分享面板调不起来时剩下的那一条路：小程序胶囊按钮与微信内浏览器右上角都有「发送给朋友」 */
export function hintTopRight() {
	uni.showToast({ title: '点击右上角「···」选择「发送给朋友」', icon: 'none' });
}

/**
 * 微信图片分享面板：分享出去的就是这张图本体（只有小程序编译产物里有 wx.*，H5 段被条件编译吃掉）
 *
 * 基础库 < 2.14.0 没有 showShareImageMenu（canIUse 探不到）→ 退右上角提示；uni-app 2.x 没把
 * showShareImageMenu 收进 uni 对象，只能直接使 wx.*。面板被用户取消不补提示，其余失败也退右上角（M13）。
 * @param {String}   src   本地临时文件地址（canvasToTempFilePath 的产物）
 * @param {Function} [onHint] 面板调不起来 / 失败时的出口，缺省 hintTopRight
 */
export function sharePosterToMenu(src, onHint) {
	// #ifdef MP-WEIXIN
	const hint = onHint || hintTopRight;
	if (!wx.canIUse('showShareImageMenu')) {
		hint();
		return;
	}
	wx.showShareImageMenu({
		path: src,
		fail: (e) => {
			if (e && /cancel/i.test(e.errMsg || '')) return;
			hint();
		},
	});
	// #endif
}
