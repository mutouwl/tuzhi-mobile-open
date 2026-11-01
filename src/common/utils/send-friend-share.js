/**
 * 送礼页（M-P9）分享卡片文案：微信 H5「···」链接卡片与小程序转发/朋友圈的**唯一口径**
 *
 * 2026-10-28 用户点名：「在这个页面，在微信 H5 中发起分享，那么分享的卡片应该适配送好友相关的文案呀。」
 * 改前这一页只在 `onShareAppMessage` 里给了卡片（小程序端），H5 走全站兜底分享 ⇒ 卡片上是站点名 +
 * 站点 logo，且链接落回**送礼页本身**（那一页只有购买人能看，好友点开被「不是你购买的」挡在门外）。
 *
 * 两端能显示的字段不一样，只差「描述行」这一档（与拼团 `group-buy-share.js` 同一份口径）：
 *   - H5 链接卡片：标题 + 描述 + 缩略图 ⇒ 标题说「送你一份礼物：商品名」，描述吃后端
 *     `expire_text`（「请在 x 前领取」这类有效期句，送礼最要紧的一条事实）；
 *   - 小程序转发 / 朋友圈：微信只给标题 + 图，没有描述行 ⇒ 直接用同一句标题。
 *
 * 落地链接（H5）一律吃后端下发：`gift/info` 的 `receive_url`（拼法只存 `Link::receiveUrl` 一处），
 * 端上不拼域名、不拼路由（PRD §2.3-6、硬约束 33）。
 */

const FALLBACK_TITLE = '送你一份礼物';
const FALLBACK_DESC = '礼物已备好，点开领取';

function nameOf(info) {
	return String((info || {}).goods_name || '').trim();
}

/** 卡片标题：`送你一份礼物：商品名`（没有商品名时只留前半句，标题不能为空） */
function title(info) {
	const name = nameOf(info);
	return name ? FALLBACK_TITLE + '：' + name : FALLBACK_TITLE;
}

/** 描述行（只有 H5 链接卡片用得上）：有效期那句由后端按礼单派生，缺了给一句不含日期的邀请 */
function desc(info) {
	const text = String((info || {}).expire_text || '').trim();
	return text || FALLBACK_DESC;
}

/** 封面 = 礼单商品封面（空串由 `$nav.share` / 小程序卡片回退，端上不补假图） */
function cover(info) {
	return String((info || {}).cover || '').trim();
}

/** 领取链接（后端 `gift/info` 的 `receive_url`；空串＝这一档不该分享，调用方自己判） */
function receiveUrl(info) {
	return String((info || {}).receive_url || '').trim();
}

export { FALLBACK_TITLE, FALLBACK_DESC, title, desc, cover, receiveUrl };
export default { FALLBACK_TITLE, FALLBACK_DESC, title, desc, cover, receiveUrl };
