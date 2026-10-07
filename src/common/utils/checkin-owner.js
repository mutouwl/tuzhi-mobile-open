import tools from '@/common/utils/tools';

/**
 * 打卡模块：跳「某个学员的打卡记录页」的唯一入口
 *
 * 动态卡的头像/昵称（components/tz/checkin-record-card 的 .ck-rc-head）、日记详情的作者行、
 * 排行榜行、成员卡、评论行的头像/昵称（components/tz/circle-comment-list，由复用方传
 * ownerRecordId 打开这一档）五处是同一个动作，地址与守卫只存这一处
 * （同一组字段/同一动作出现在两个界面必须抽一份，见 .trae/rules/ui-baseline-mobile.md M15）。
 *
 * 权限全在后端判（api checkin.checkin/calendar 与 dayDetail → CheckinBase::viewTarget）：
 * 对方未参与 / 已移除 → 「该学员未参与本打卡活动」；分组隔离下**跨组** → 「该学员与你不在同一分组，打卡记录不可见」（未分组不受分组限制，可看任何人）；
 * 动态设为「仅管理员可见」→ 不进他的统计、日历红点与某日列表（单条判据在 VisibilityService）。
 * 前端不重复判一遍（两处各判一次就会分叉，且前端拿不到分组与可见范围这些事实），
 * 只管两件本地就知道的事：
 * 1) 官方动态（user_id=0，管理员后台发布）不绑定学员，没有记录页可去 ⇒ 不跳（调用方据此退回整卡动作，
 *    不留「点了没反应」的死区）；
 * 2) 已经站在同一个记录页上就不叠第二张（返回要按两次）。
 */

/** 这一行是不是「有打卡记录页可去」的学员行（官方动态与缺 id 的异常行都不是） */
export function isOwnerBrowable(row) {
	if (!row) return false;
	const uid = Number(row.user_id) || 0;
	return uid > 0 && !Number(row.is_official || 0);
}

/** 某个学员在本活动内的打卡记录页地址 */
export function ownerRecordUrl(checkinId, userId) {
	return '/pages/app/checkin/record/record?id=' + (Number(checkinId) || 0) + '&user_id=' + (Number(userId) || 0);
}

/**
 * 栈顶是不是「同一个活动的同一个人的记录页」
 *
 * 本人页的 URL 不带 user_id（从「我的打卡记录」进来），所以比对值要先把缺省补成当前登录用户，
 * 否则在自己的记录页上点自己的头像会再开一层同样内容的页面。
 * 探栈写法与判据口径见 M20③（路由 + 实体 id 双重比对），这一步在跳转之前、本页还在栈顶，两端都够得对页
 */
function isOwnerRecordOnTop(checkinId, userId) {
	const pages = getCurrentPages() || [];
	const top = pages[pages.length - 1];
	if (!top) return false;
	const route = String(top.route || (top.$page && top.$page.route) || '');
	if (route.indexOf('checkin/record/record') === -1) return false;
	const opt = (top.$page && top.$page.options) || top.options || {};
	const mine = Number(opt.user_id) || Number((tools.cachedUser() || {}).id) || 0;
	return Number(opt.id) === Number(checkinId) && mine === Number(userId);
}

/**
 * 跳到某个学员的打卡记录页（五处调用点共用，见文件头）
 * @param {Object} row 带 user_id 的学员行（动态卡传 record、排行榜传 item、成员卡传 m、评论行传 c）
 * @param {Number|String} checkinId 本活动 id
 * @return {Boolean} true = 这一跳已由本函数负责（含「已经在这一页、不必再跳」）；
 *                   false = 这一行没有记录页可去，调用方可另安排动作（如退回整卡点击）
 */
export function goOwnerRecord(row, checkinId) {
	if (!isOwnerBrowable(row)) return false;
	if (!isOwnerRecordOnTop(checkinId, row.user_id)) {
		uni.navigateTo({ url: ownerRecordUrl(checkinId, row.user_id) });
	}
	return true;
}
