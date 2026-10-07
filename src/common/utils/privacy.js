/**
 * 学员端「公开展示」口径的脱敏函数，收在主包 utils 里（跨分包共用，`pages/course` 与 `pages/app` 都读它）。
 *
 * 规则真源是 `.trae/rules/ui-baseline-mobile.md` §1「昵称公开展示」那一行：
 *   昵称 = 保留首字符，其余 `***`；手机号 = 隐藏第 4-7 位。
 * 2026-10-03 用户点名邀请达人榜的昵称也要脱敏，于是本文件从「一个业务一份复制品」收口成单一真源。
 *
 * 为什么必须收口（2026-10-03）：本函数此前有两份**逐字相同**的实现——
 *   `common/utils/share-gift.js` 的 `maskNickname` 与 `pages/course/live/redpacket/js.vue` 的 `maskName`
 *   （都写成 `String(name).slice(0, 1) + '***'`，空值都写 `-`）。再加一份就是第三份，
 * 而这三处是同一条规则的三个落点：改口径时最容易漏掉的那一处恰好是别人家弹层里的昵称。
 * 门禁 `scripts/check-nickname-mask.js` 钉死「页面里不许自己 slice(0, 1)」。
 *
 * **为什么「我」的昵称也脱敏**（2026-10-03 决定）：不按「是不是自己」分档，
 * 因为分档要靠 `user_id` 相等来判「这是不是我」——那是前端算身份，撞 M22
 * （名次/人数/状态/身份全部后端算好下发，前端不许拿本地缓存或字段比对认人）。
 * 统一过一遍这一个函数，没有第二分支也没有第二处判据；
 * 「我」那一行另有「我」字样标记与「我的排名」文案，不靠名字认领（相邻档位：只脱敏别人，
 * 需比对 user_id，见 §12.12「相邻备选值」）。
 *
 * 只收这一条；手机号那一档按 §1 的原话是「隐藏第 4-7 位」，目前没有落点要用，没顺手加。
 *
 * @param {*} name 后端下发的昵称（null / undefined / 空串都兜住，调用点常把 prop 直接丢进来）
 * @returns {string} 首字符 + `***`；取不到昵称写 `-`（与既有两份实现一致，不留空档）
 */
export function maskNickname(name) {
	const n = name === null || name === undefined ? '' : String(name);
	if (!n) {
		return '-';
	}
	return n.slice(0, 1) + '***';
}

export default { maskNickname };