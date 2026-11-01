/**
 * 拼团团详情（M-P6）分享卡片文案：H5 公众号与小程序两端的**唯一口径**
 *
 * 设计稿（2026-10-28 用户给的 304×130 截图）是一张微信「发送给朋友」链接卡片：
 *   标题：还差 xx 人成团！拼团课程“XXX”
 *   描述：好课别错过，原价 x 元，x 元拼到手~
 *
 * 两端能显示的字段并不一样，**只差「描述行」这一档**（同日用户选定）：
 *   - H5 链接卡片：标题 + 描述 + 缩略图 ⇒ 标题照设计稿首句，价格句落在描述里（`$nav.share` 第二参）；
 *   - 小程序转发 / 小程序朋友圈卡片：微信只给标题 + 图，**没有描述行**（`onShareAppMessage` 只认
 *     title / path / imageUrl）⇒ 价格句折进标题，取短版「还差 N 人成团！X 元拼“课程名”」。
 *     不把整句描述原样接在标题后面：两行标题放不下，末尾的价格句恰好先被截掉，
 *     而截断位置还随课程名长短漂——最不该丢的信息最先丢。
 *
 * **一处口径只存这一份**：页面只读 `title` / `desc` / `mpTitle` / `cover`，不各写一句。
 * 数字与商品名的取数口径与页面一致：还差人数 = `target_num − used_num`（含未支付占位，与后端
 * `TeamPage::teams` 的 need_num 同一份）、价格取本团 `detail.price`、原价取 `activity.origin_price`。
 * 价格去掉 `.00` / `.x0` 的尾巴（与拼团横幅 `priceText` 同一档），文案里只写「元」不叠 `¥`。
 *
 * 状态口径（分享菜单在任一团状态下都点得到，文案不能只会说「还差 N 人」）：
 *   - 拼团中且还差人 → 「还差 N 人成团！」；
 *   - 已成团 → 「拼团成功！」；
 *   - 已失败 / 已停止 / 已满员 → 只说商品（不编一句「还差 0 人成团」）。
 */

/** 商品类型 → 标题里的品类词（设计稿那五个字；实物 / 组合一档，圈子 / 打卡 / 题库各归各的） */
const GOODS_LABELS = {
	course: '拼团课程',
	physical: '拼团商品',
	composite: '拼团商品',
	circle: '拼团圈子',
	checkin: '拼团活动',
	exercises: '拼团题库',
};

/** 没有商品名可拼时的兜底标题（转发卡片标题不能为空） */
const FALLBACK_TITLE = '一起来拼团';

function num(v) {
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
}

function activityOf(detail) {
	return (detail && detail.activity) || {};
}

function typeOf(detail) {
	return String(activityOf(detail).goods_type || '');
}

/** 商品名（后端已按这一条团下发的快照，端上不再回查商品表） */
function nameOf(detail) {
	return String(activityOf(detail).goods_name || '').trim();
}

/** 标题里的品类词：未登记的类型统一说「拼团商品」，不空着 */
function labelOf(detail) {
	return GOODS_LABELS[typeOf(detail)] || '拼团商品';
}

/** 还差几人成团：与页面 `needNum`、后端 `need_num` 同一口径（目标名额 − 已占名额，含未支付） */
function needNum(detail) {
	const d = detail || {};
	return Math.max(0, num(d.target_num) - num(d.used_num));
}

/** 价格文案：199 / 99.9 / 99.99（去掉无意义的零，保留真实小数） */
function priceText(p) {
	const n = num(p);
	return String(n.toFixed(2)).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}

/**
 * 标题前半句（按团状态给，不与后半句的品类词粘连）
 * @returns {String} 带叹号的那半句；结果态 / 满员时为空串
 */
function headline(detail) {
	const s = num((detail || {}).status);
	if (s === 1) return '拼团成功！';
	const need = needNum(detail);
	return s === 0 && need > 0 ? '还差' + need + '人成团！' : '';
}

/**
 * H5「发送给朋友」卡片标题：`还差 N 人成团！拼团课程“课程名”`
 * @param {Object} detail `group_buy.team.detail` 回体
 */
function title(detail) {
	const name = nameOf(detail);
	if (!name) return FALLBACK_TITLE;
	return headline(detail) + labelOf(detail) + '“' + name + '”';
}

/**
 * H5 链接卡片描述（只有 H5 用得上）：`好课别错过，原价 x 元，x 元拼到手~`
 *
 * 原价不高于拼团价时不说「原价」（否则同一屏出现两个同价数字，与商品卡不摆同价划线同一判据）；
 * 价格还没到手时不编具体数字，换成一句不含数字的邀请。
 * @param {Object} detail `group_buy.team.detail` 回体
 */
function desc(detail) {
	if (!nameOf(detail)) return '好价别错过，一起来拼团~';
	const lead = typeOf(detail) === 'course' ? '好课别错过' : '好物别错过';
	const price = num((detail || {}).price);
	if (price <= 0) return lead + '，一起来拼团~';
	const origin = num(activityOf(detail).origin_price);
	const got = priceText(price) + '元拼到手~';
	return origin > price ? lead + '，原价' + priceText(origin) + '元，' + got : lead + '，' + got;
}

/**
 * 小程序转发 / 小程序朋友圈卡片标题（微信没有描述行，价格句折进标题）：
 * `还差 N 人成团！x 元拼“课程名”`
 *
 * 标题放不下时状态句 / 价格 / 商品名的取舍：先丢状态句（已成团、已结束那几档本来就没有），
 * 再丢价格（价格未到手时），最后只剩 H5 那一句标题——任何一档都不出现「还差 0 人」。
 * @param {Object} detail `group_buy.team.detail` 回体
 */
function mpTitle(detail) {
	const name = nameOf(detail);
	const head = headline(detail);
	const price = num((detail || {}).price);
	if (!name || !head || price <= 0) return title(detail);
	return head + priceText(price) + '元拼“' + name + '”';
}

/** 分享封面：本团商品的封面（空串时由 `$nav.share` / 小程序卡片自己回退，端上不补假图） */
function cover(detail) {
	return activityOf(detail).goods_cover || '';
}

export {
	GOODS_LABELS,
	FALLBACK_TITLE,
	needNum,
	priceText,
	title,
	desc,
	mpTitle,
	cover,
};

export default {
	GOODS_LABELS,
	FALLBACK_TITLE,
	needNum,
	priceText,
	title,
	desc,
	mpTitle,
	cover,
};
