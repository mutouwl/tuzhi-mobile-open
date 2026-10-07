import tools from '@/common/utils/tools';

/**
 * 明细直传阿里云日志服务（SLS）
 *
 * 只做传输，不做聚合 —— 聚合在各自的业务模块里：
 *   学习心跳的汇总桶在 common/utils/course.js
 *   页面访问 PV 不聚合（进出几次就是几条）
 *
 * 这里不需要 AccessKey：端上只用到 project / host / logstore 三个非敏感值，
 * 由后台「数据统计」下发。
 *
 * ⚠ **这三个值刻意没有内置缺省**：本项目是标准化产品，商家各自部署、各自的日志服务账号都不一样。
 * 写死任何一组具体值都会（a）让拿到前端包的人读到发布方的账号结构
 * （b）让忘配的商家直接把数据写进发布方的 logstore，由发布方替他付流量、替他存数据。
 * 所以取不到就不发 —— 宁可少一条明细，也不写错地方。
 *
 * 发送走 WebTracking 的**匿名 GET 表单**：`/logstores/{logstore}/track?APIVersion=0.6.0&字段=值`，
 * 一条一次、不批量，参数全在 query 上，所以不需要任何自定义请求头，也就不会触发 CORS 预检。
 * POST 那套表单要带 x-log-apiversion / x-log-bodyrawsize 两个头和 JSON body，浏览器跨源加自定义头
 * 就要先过预检，这里没必要绕。
 */

const API_VERSION = '0.6.0';

/** 可选汇总粒度，配置里存的值不在表内就回落 60 */
const GRANULARITY = [15, 30, 60, 120, 300];
const DEFAULT_GRANULARITY = 60;

/** 单次心跳间隔的兜底上限：标签页合盖后下一次心跳可能隔几小时，照实累加会把时长记飞 */
const MAX_DELTA = 60;

/** 访客标识：PV 走浏览器直连后，回流任务拿不到客户端 IP，UV 得有个替代口径 */
const VISITOR_KEY = 'log_sls_visitor_id';

/**
 * 取（本机首次访问时生成的）访客标识
 * @return {string}
 */
export function visitorId() {
	try {
		let id = uni.getStorageSync(VISITOR_KEY);
		if (!id) {
			id = newLogId();
			uni.setStorageSync(VISITOR_KEY, id);
		}
		return id;
	} catch (e) {
		return '';
	}
}

function newLogId() {
	const rand = Math.random().toString(36).slice(2, 10);
	return Date.now().toString(36) + '-' + rand;
}

export { newLogId };

/**
 * 是否走 SLS 通道
 * 判据必须写死等于 aliyun_sls：老版本 App 的 storage 里没有这个键，
 * systemConfig() 会返回空串，写 !== 'local' 会让存量版本全部误判成 SLS 档
 *
 * 地址三件套不齐时也按本地档走：商家把通道拨到 SLS 却漏填地址时，
 * 端上不该把明细静默丢掉，打后端这条腿本来就在（Record::log 为此特意不早退）。
 * @return {boolean}
 */
export function isSlsMode() {
	return tools.systemConfig('app_statistics_log_service') === 'aliyun_sls' && hasEndpoint();
}

/** 上报地址是否齐了；缺任一项就不算配好直连 */
function hasEndpoint() {
	return !!setting('app_statistics_sls_project')
		&& !!setting('app_statistics_sls_host')
		&& !!setting('app_statistics_sls_logstore');
}

/**
 * 取汇总粒度（秒），非法值一律回落 60
 * @return {number}
 */
export function granularity() {
	const g = Number(tools.systemConfig('app_statistics_heartbeat_seconds'));
	return GRANULARITY.indexOf(g) >= 0 ? g : DEFAULT_GRANULARITY;
}

/**
 * 心跳单次间隔的兜底上限
 * @return {number}
 */
export function maxDelta() {
	return MAX_DELTA;
}

/**
 * 发一条明细
 * @param {object} record 字段集合，必须自带 biz_type；一条一次，不批量
 */
export function send(record) {
	if (!record || !isSlsMode()) {
		return false;
	}

	const url = buildUrl(record);
	if (!url) {
		return false;
	}

	// 端上不留痕：这些对象直接走传输，不进 data，避免把图片地址之类的串当 data 键
	return dispatch(url);
}

/**
 * 投递一条 GET 明细
 *
 * 顺序：fetch(keepalive) → Image → uni.request。
 * ⚠ 这里不能用 navigator.sendBeacon：它只会 POST，而本模块的参数全挂在 query 上，
 * 阿里云收到的就是一个空 body 的 POST —— 字段一个都读不到，日志根本不会入库。
 * 更要命的是 sendBeacon 只要「入队成功」就返回 true，下面那两档兜底永远跑不到，
 * 表现出来就是「埋点在发、后台却一条都查不到」。
 */
function dispatch(url) {
	if (typeof fetch === 'function') {
		try {
			// no-cors：本来就不读响应；keepalive 让页面卸载时这一条还能发出去
			fetch(url, { method: 'GET', mode: 'no-cors', keepalive: true });
			return true;
		} catch (e) {
			// 落到下一档
		}
	}
	if (typeof Image === 'function') {
		try {
			// 连 fetch 都没有的环境（个别 webview）：跟踪像素同样是一次匿名 GET
			new Image().src = url;
			return true;
		} catch (e) {
			// 落到下一档
		}
	}
	return sendByUniRequest(url);
}

function buildUrl(record) {
	const parts = ['APIVersion=' + API_VERSION];
	Object.keys(record).forEach(key => {
		const value = record[key];
		if (value === undefined || value === null || value === '') {
			return;
		}
		parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value)));
	});
	if (parts.length <= 1) {
		return '';
	}
	// 三项缺一就不发：拼不出地址时宁可不发，也不要把明细写去一个猜出来的 logstore
	const project = setting('app_statistics_sls_project');
	const host = setting('app_statistics_sls_host');
	const logstore = setting('app_statistics_sls_logstore');
	if (!project || !host || !logstore) {
		return '';
	}
	return 'https://' + project + '.' + host + '/logstores/' + logstore + '/track?' + parts.join('&');
}

/** 读后台下发的配置，取不到就是空串 —— 这三个值刻意没有内置缺省 */
function setting(key) {
	const value = tools.systemConfig(key);
	return value ? value : '';
}

function sendByUniRequest(url) {
	// 小程序端没有 fetch/Image，走 uni.request；该域名要在小程序后台加进 request 合法域名白名单
	try {
		uni.request({ url, method: 'GET', dataType: 'text', fail() {} });
		return true;
	} catch (e) {
		return false;
	}
}

export default {
	isSlsMode,
	granularity,
	maxDelta,
	send,
	visitorId,
	newLogId
};