/**
 * 奖品能力（标准版核心）学员端共用口径
 *
 * 2026-10-03 自 `common/utils/share-gift.js` 拆出来：奖品已升入标准版（可领数、我的奖品列表、
 * 领奖链都不再只属于分享有礼），带着 share-gift 的名字放在插件的 utils 里，下一个接奖品的功能
 * 要 import 一个「分享有礼」文件才说得通。
 *
 * 收在主包 utils 里，因为「直播间详情弹窗」（pages/course 分包）与「我的奖品页」（pages/user 分包）
 * 要读同一份判据，而分包之间不许互相引用组件/页面文件（§4 跨分包引组件是运行时报错）。
 *
 * `share-gift.js` 仍从本文件同名转发，两个旧调用点的 import 不用改，但全站只有这一份实现
 * （与 `maskNickname` 上移到 privacy.js 是同一种做法）。
 */

/** 后端 target → 站内页面；contact 没有页面可去（由调用方弹「兑奖方式」窗），空串＝没有落点 */
const TARGET_PAGE = {
	course: '/pages/user/subscription/subscription',
	order: '/pages/order/list/list',
	coupon: '/pages/app/coupon/my/my',
	score: '/pages/app/score/center/center',
	balance: '/pages/user/balance/index',
};

/**
 * 「去查看」按后端 target 分流（target 为空串时按钮整枚不出，调用方自己判）
 * @param {Object} nav $nav
 * @param {Object} row 奖品行（读 row.target）
 * @returns {Boolean} 是否真的跳走了（false＝这一枚没有页面落点，调用方要自己接住，别留静默）
 */
export function goPrizeTarget(nav, row) {
	const target = String((row && row.target) || '');
	const page = TARGET_PAGE[target];
	if (!page) {
		return false;
	}
	nav.to(page);
	return true;
}

/**
 * 现金 / 积分这两型的「去查看」落点（奖品详情弹窗底部那一枚，用户 2026-10-04 点名改的）
 *
 * 与上面那张 TARGET_PAGE 不是同一件事，别混：那张按后端 `target` 分流（哪一类权益的列表页），
 * 这张按 `detail.kind` 分流（这笔钱/这些积分落在学员资产的哪一页），两者给的页也可能不同
 * （target=score 给的是积分商城，这一型给的是资产管理页）。
 *
 * 数值格这一型没有自己的详情页，弹窗里那一笔金额就是全部信息 ⇒ 动作只能去资产页看落点。
 * @param {String} kind 后端逐行下发的 detail.kind（只认 cash / score，其余返回空串）
 * @returns {String} 页面路径，空串＝这一型没有资产页落点
 */
const ASSET_PAGE = {
	cash: '/pages/user/balance/index',
	score: '/pages/user/assets/assets?type=score',
};

export function prizeAssetPage(kind) {
	return ASSET_PAGE[String(kind || '')] || '';
}

/**
 * 实物那一笔的 0 元订单详情页（用户 2026-10-04 点名：「点击奖品订单号可以跳转到订单详情」）
 *
 * 与 TARGET_PAGE 里的 `order` 也不是同一件事：那条给的是**订单列表**（那一笔在列表里找），
 * 这条给的是**这一笔的详情**——落在后端逐行下发的 `detail.order_no` 上（就是实物卡上印的那个号，
 * 领取那一刻建的 0 元单的订单号，与发货台、订单详情页读的是同一个）。
 * 订单详情页吃的是 `?order_no=` 这个参数名（`pages/order/detail/js.vue:135` 直接把它交给接口），
 * 全站十来处跳转都是这个写法，别自己换成 `id`。
 * @param {String} orderNo 后端逐行下发的 detail.order_no
 * @returns {String} 页面路径，空串＝这一笔还没有订单号（未领取那一档）
 */
export function prizeOrderPage(orderNo) {
	const no = String(orderNo || '').trim();
	return no ? '/pages/order/detail/detail?order_no=' + no : '';
}

/**
 * 奖品图：接口下发的是奖品表里那一张的原样值（商家上传给的多数是绝对地址，
 * 个别历史数据是 /uploads 开头的相对路径），相对档要按站点根补全，否则小程序端取不到图。
 * 空值返回空串，调用方按空串收起那一格（不留一块没人认领的方块）。
 */
export function prizeImage(cover, tools) {
	const src = String(cover || '');
	if (!src || /^(https?:|data:|\/\/)/.test(src)) {
		return src;
	}
	const apiUrl = String((tools && tools.systemConfig('apiUrl')) || '');
	const host = apiUrl.split('/index.php')[0];
	if (!host) {
		return src;
	}
	return host + (src.charAt(0) === '/' ? '' : '/') + src;
}

export default { goPrizeTarget, prizeAssetPage, prizeOrderPage, prizeImage };