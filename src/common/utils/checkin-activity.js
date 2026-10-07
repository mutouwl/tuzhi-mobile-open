/**
 * 打卡模块：打开「一条打卡活动」的唯一落点
 *
 * 三个入口做的是同一个动作——「我的打卡」列表（pages/app/checkin/index）、
 * 「可参与的打卡」列表（pages/app/checkin/discover）、课程详情页底栏的打卡弹窗
 * （pages/course/detail 的 tz 弹窗），地址与分流只存这一处
 * （同一动作出现在两个界面必须抽一份，见 .trae/rules/ui-baseline-mobile.md M15/M24）。
 *
 * 分流只有一条：已参与进活动主页，未参与先进介绍页（看介绍/价格/玩法 → 参与 → 主页）。
 * 判据取后端逐行下发的 is_member，前端不自己数成员行、也不按 join_type 猜（M22：
 * 「能不能/是什么」一律读后端那一列，两处各判一次就会说法不一）。
 */

/**
 * 一条活动行该去的那个页面的地址
 * @param {Object} row 接口原行（读 is_member 与 id）
 * @return {String} 页面地址
 */
export function activityUrl(row) {
	const page = row && Number(row.is_member) === 1 ? 'detail' : 'intro';
	return '/pages/app/checkin/' + page + '/' + page + '?id=' + ((row && Number(row.id)) || 0);
}

/**
 * 打开一条打卡活动
 * @param {Object} row 接口原行
 * @return {Boolean} true = 已负责这一跳；false = 这一行没有落点（缺 id），调用方可另安排动作
 */
export function goActivity(row) {
	if (!row || !Number(row.id)) return false;
	uni.navigateTo({ url: activityUrl(row) });
	return true;
}
