/**
 * 分享有礼（直播拉新插件）学员端共用口径
 *
 * 收在主包 utils 里，因为「直播间详情弹窗」（pages/course 分包）与「我的奖品页」（pages/user 分包）
 * 要读同一份判据，而分包之间不许互相引用组件/页面文件（§4 跨分包引组件是运行时报错）。
 *
 * **本文件现在只剩分享有礼自己那两件事**（昵称脱敏的转发口、邀请链接）：
 *   1) 受邀人昵称脱敏——**实现已上移到 `common/utils/privacy.js`**：
 *      那一档是全站口径（2026-10-03 用户点名邀请达人榜也要脱敏），此处只保留同名转发，
 *      调用点（`share-gift/activity-detail.vue`）的 import 不用改，但全站只有一份实现；
 *   2) 邀请链接（分享出去的直播间地址带邀请人 id，受邀人进直播间才报得了助力）。
 *
 * 另两件（奖品落点 goPrizeTarget、奖品图 prizeImage）已于 2026-10-03 随奖品能力升入标准版
 * 移到 `common/utils/prize.js`，此处保留同名转发：既有两个调用点的 import 不用一行不改，
 * 而下一个接奖品的功能不必 import 一个叫「分享有礼」的文件。
 */

import { maskNickname } from './privacy';
import { goPrizeTarget, prizeImage } from './prize';

/**
 * 奖品落点与奖品图的转发口（口径在 `common/utils/prize.js`，2026-10-03 随奖品升标准版上移）：
 * 保留这两个导出是为了不改既有调用点的 import，功能上没有第二份实现。
 */
export { goPrizeTarget, prizeImage };

/**
 * 昵称脱敏的转发口（口径在 `common/utils/privacy.js`，2026-10-03 上移）：
 * 保留这个导出是为了不改既有调用点的 import，功能上没有第二份实现。
 */
export { maskNickname };

/**
 * 直播间邀请链接：参数沿用全站既有分享口径 —— 邀请人 = share（router.js 会把它暂存进 storage，
 * 未登录先点链接、登录后仍取得到；达人榜的归因上报在 pages/course/detail/js.vue 的
 * reportInviteRank()，也只认 pageParams.share，
 * 自造 inviter_id 会让同一次邀请在两个插件里各算各的），活动定位 = gift（只作来源记录，
 * 助力落哪条活动由后端按「此刻生效的那一条」判，不接受前端把 id 当依据）
 * @returns {String} H5 = 可外发的绝对地址；其余端 = 页面路径（转发卡片由 onShareAppMessage 用）
 */
export function buildInviteLink(courseId, activityId, inviterId) {
	const query = ['id=' + encodeURIComponent(courseId || '')];
	if (inviterId) {
		query.push('share=' + encodeURIComponent(inviterId));
	}
	if (activityId) {
		query.push('gift=' + encodeURIComponent(activityId));
	}
	const path = '/pages/course/live/live?' + query.join('&');
	// #ifdef H5
	const url = window.location.href;
	const idx = url.indexOf('#/');
	const baseUrl = idx > 0 ? url.substring(0, idx) : url.split('#')[0];
	return baseUrl + '#' + path;
	// #endif
	return path;
}

export default { goPrizeTarget, maskNickname, buildInviteLink, prizeImage };

