/**
 * 打卡模块：微信分享卡片标题与封面口径（模块内各列表页/详情页共用）
 *
 * 小程序端走 onShareAppMessage / onShareTimeline，H5 公众号端走 $nav.share → JSSDK，
 * 两端取的是同一份标题与封面，不能各写一套（同一页面两端分享出的卡片不一致最难查）。
 * 口径参照教务模块详情页（校区/教师详情：标题取实体名、封面取实体图，缺失时由 $nav.share 回退站点 logo）：
 * - 活动主页（M-P2）、日记详情（M-P5）是详情页 → 标题与封面解析自内容本身；
 * - 活动内子页（打卡记录/排行榜/成员/任务日历/发表日记）是列表页 → 「活动名 · 页面名」，
 *   只写「排行榜」这类无主语标题，分享出去认不出是哪个活动；
 * - 我的打卡（M-P1）与可参与的打卡列表不挂在具体活动下，直接用页面名。
 */

const SEP = ' · ';
const EXCERPT_MAX = 30;

/**
 * 活动内子页分享标题：「活动名 · 页面名」
 *
 * 活动名要等接口回来才有，未取到时只用页面名，不能拼出「 · 排行榜」这种半截标题。
 * @param {String} checkinTitle 活动名称（接口下发的 title）
 * @param {String} pageName 页面名（与导航栏标题一致）
 */
function listTitle(checkinTitle, pageName) {
	const name = String(checkinTitle || '').trim();
	return name ? name + SEP + pageName : pageName;
}

/**
 * 详情页分享标题：取内容名，内容未加载/无名称时回退页面名（转发卡片标题不能为空）
 * @param {String} contentTitle 内容名称（活动标题）
 * @param {String} fallback 回退标题
 */
function detailTitle(contentTitle, fallback) {
	const name = String(contentTitle || '').trim();
	return name || fallback;
}

/**
 * 正文摘要：去掉换行与连续空白，超长截断加省略号（微信卡片标题只展示一行左右）
 * @param {String} text 原文
 * @param {Number} max 字数上限，缺省 30
 */
function excerpt(text, max) {
	const t = String(text || '').replace(/\s+/g, ' ').trim();
	const limit = max || EXCERPT_MAX;
	if (!t) return '';
	return t.length > limit ? t.slice(0, limit) + '…' : t;
}

/**
 * 打卡动态详情（M-P5）分享标题：正文摘要优先；纯图/纯语音的动态没有正文，
 * 回退「昵称 的打卡动态」，再回退活动名，最后回退页面名。
 * @param {Object} detail checkin.checkin.diaryDetail 返回
 * @param {String} pageName 页面名
 */
function diaryTitle(detail, pageName) {
	const d = detail || {};
	const text = excerpt(d.content);
	if (text) return text;
	const nick = String(d.nickname || '').trim();
	if (nick) return nick + ' 的打卡日记';
	return detailTitle(d.checkin_title, pageName);
}

/**
 * 日记详情（M-P5）分享封面：日记首图（视频地址不能作微信封面，故只看图片）
 * → 活动封面 → 空串（由 $nav.share 回退站点 logo）
 * @param {Object} detail checkin.checkin.diaryDetail 返回
 */
function diaryCover(detail) {
	const d = detail || {};
	const images = d.images || [];
	if (images.length) return images[0];
	return d.checkin_cover || '';
}

/**
 * H5 公众号端设置本页面分享卡片（右上角「···」→ 发送给朋友 / 朋友圈）
 *
 * 只在 H5 编译：非微信环境 sdk.js 内部再判一次并直接 return，签名按站点地址缓存，
 * 页面数据回来后重复调用零额外请求。小程序端不调这里，由 mpCard 回传卡片参数。
 * @param {Object} nav Vue.prototype.$nav
 * @param {String} title 分享标题
 * @param {String} cover 分享封面，空串时 $nav.share 回退站点 logo
 */
function applyH5Share(nav, title, cover) {
	// #ifdef H5
	nav.share(title, '', cover || '');
	// #endif
}

/**
 * 小程序端转发/朋友圈卡片参数
 *
 * $nav.share 只回 title + path（或朋友圈的 query），卡片封面要在这里补 imageUrl；
 * 没有封面时不能传空串——空串会让卡片变成无图，而不是回退小程序的页面自动截图。
 * @param {Object} nav Vue.prototype.$nav
 * @param {String} title 分享标题
 * @param {String} cover 分享封面
 * @param {Boolean} timeLine 是否朋友圈卡片（朋友圈只认 query，带 path 会丢页面参数）
 */
function mpCard(nav, title, cover, timeLine) {
	const params = nav.share(title, '', cover || '', timeLine ? 'time_line' : 'app_message') || {};
	if (cover) {
		params.imageUrl = cover;
	}
	return params;
}

export { listTitle, detailTitle, excerpt, diaryTitle, diaryCover, applyH5Share, mpCard };

export default { listTitle, detailTitle, excerpt, diaryTitle, diaryCover, applyH5Share, mpCard };
