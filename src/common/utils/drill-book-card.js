/**
 * 刷题本接口行 → 全站紧凑商品卡 `tz-course-mini` 的字段契约（前端只此一份）
 *
 * `sales_type` → `pay_type` 的映射与后端 `common/model/goods/Source.php` 商品总表里刷题本那一档
 * **逐字同源**（`CASE sales_type WHEN 1 THEN 'free' WHEN 2 THEN 'pay' WHEN 3 THEN 'bind_course' END`）：
 * 全站商品卡认的就是这三个值，端上不另造第四档。
 *
 * 为什么抽出来：同一组字段现在有两个界面在用（刷题本列表页 `/pages/app/drill_book/list/list` 与
 * 课程详情底栏「刷题本」弹窗 `pages/course/components/drill-book-course-modal.vue`），
 * 各写一份就会出现「列表页角标写着关联课程、弹窗里写着付费」这种两处说法不一（硬约束 11）。
 */

/**
 * 单行映射
 * @param {Object} b 刷题本接口行（id / name / cover / brief / sales_type / pay_price）
 * @return {Object} tz-course-mini 认的卡片行
 */
export function drillBookCardRow(b) {
	const row = b || {};
	const sales = Number(row.sales_type);
	let payType = 'free';
	if (sales === 2) payType = 'pay';
	else if (sales === 3) payType = 'bind_course';
	return {
		id: row.id,
		name: row.name,
		cover: row.cover,
		// 卡上灰字副标题读 `briefing`（接口字段叫 brief）
		briefing: row.brief,
		// 角标文案走 i18n 的 drill_book 档（components/language/zh-CN.js）
		type: 'drill_book',
		pay_type: payType,
		// 微信小程序虚拟支付：后端已按「细分档 drill_book」把 pay_price 换成代币展示价，
		// 这里只把标记透给 tz-course-mini（卡片的币种单位与 ¥ 切换吃这一枚）
		is_virtual_pay: Number(row.is_virtual_pay) === 1 ? 1 : 0,
		price: Number(row.pay_price || 0).toFixed(2),
	};
}

/**
 * 列表映射
 * @param {Array} list
 * @return {Array}
 */
export function drillBookCardRows(list) {
	return (list || []).map(drillBookCardRow);
}
