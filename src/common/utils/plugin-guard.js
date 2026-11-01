/**
 * 付费插件（拼团 `group_buy` / 送好友 `send_friend`）安装态闸门 —— 移动端只收这一处。
 *
 * **为什么需要这么一层**（用户 2026-10-27 点名「拼团、送好友是付费插件，如果没有安装插件前端
 * 请求对应的初始化接口会报错。要做好适配」）：
 *   付费插件是「代码即插件」（`paid-plugins.md` §1.2）：没装时后端 `application/api/controller/app/{tag}/`
 *   整个目录都不在盘上，任何一发 `app/group_buy/…` / `app/send_friend/…` 都只会得到
 *   404 / `Class not found` / 一句「XX功能未安装」。前端的入口与请求闸门都吃
 *   `api/common/init` 下发的 `app_isinstall_{tag}`，但这一枚 flag 有两条会读错的缝：
 *     ① **首屏竞态**：`App.onLaunch` 里 `common.init` 是异步的，活动页/商详页可能比它先挂载。
 *        那时 storage 要么是空的（把「还不知道」误读成「未安装」⇒ 入口永远不出），
 *        要么是**上一次会话的旧值**（把「已经卸掉」误读成「已安装」⇒ 发出必然失败的请求）。
 *     ② **version 在、代码不在**：`app.php` 里那行版本号还在、插件目录被排除清单删了
 *        （`paid-plugins.md` §1.4 点名的「最危险的组合」）。这时 init 也回 `true`，
 *        前端无法预判，只能等**后端那一发自己说「未安装」**再就地收口。
 *
 * 三条口径（本文件是唯一实现，页面/组件不许各写一份）：
 *   ① **三态**：`pluginState(tag)` = `true` 已装 / `false` 未装 / `null` 本会话 init 还没回包。
 *      `null` **不许当成未安装**（入口会永远不补回来），也**不许当成已装**（会发请求）；
 *      调用方拿到 `null` 就挂 `onSystemConfigReady()` 等下一次重判。
 *      `ready` 是**本会话**的标志（App.vue 在 `common.init` 成功落库后置真）——
 *      不许只看 storage 有没有值：那是跨会话的，正是旧值误判的来源。
 *   ② **被后端判定未装 ⇒ 本会话就地收口**：`markPluginMissing(tag)` 把那一枚 flag 在
 *      `systemConfig` 里翻成 `false`（后续所有读 flag 的调用点一起静默，不用逐个改），
 *      并在本模块记一笔 `missing`，请求层据此**不再发网络请求**。
 *   ③ **请求层先问一次**：`request/index.js` 对所有 `app/{tag}/` 地址在发出前过 `canRequestPlugin()`；
 *      后端回「未安装」时免掉那句全局 toast（付费插件没装是「功能不存在」，不是用户操作失败）。
 */
/** 插件标识 → init 下发的那一枚 flag（唯一映射，页面/组件不许自己拼键名） */
export const PLUGIN_FLAGS = {
	group_buy: 'app_isinstall_group_buy',
	send_friend: 'app_isinstall_send_friend',
};

/** init 回包落库后广播的事件名（App.vue 发，等待中的页面/组件收） */
const READY_EVENT = 'systemConfigReady';

/** 本会话 init 是否已经回包落库（**不是**「storage 里有没有 config」） */
let sessionReady = false;
/** 本会话被后端判定为「未安装」的插件：{ group_buy: true, ... } */
const missing = {};

/**
 * App.vue 在 `common.init` 成功并写进 storage 之后调一次。
 * 只置本会话标志 + 广播：等待中的调用点会重判一次。
 */
export function markSystemConfigReady() {
	if (sessionReady) { return; }
	sessionReady = true;
	uni.$emit(READY_EVENT);
}

/** 本会话 init 是否已回包（测试/调试用；业务判据一律走 `pluginState`） */
export function isSystemConfigReady() {
	return sessionReady;
}

/**
 * 订阅「init 已回包」。已经回包就直接同步调一次（调用点不用自己判两次）。
 * @param {Function} cb
 * @return {Function} 取消订阅
 */
export function onSystemConfigReady(cb) {
	if (typeof cb !== 'function') { return function () {}; }
	if (sessionReady) { cb(); return function () {}; }
	uni.$on(READY_EVENT, cb);
	return function () { uni.$off(READY_EVENT, cb); };
}

/**
 * 插件安装态三态：`true` 已装 / `false` 未装 / `null` 还不知道（init 未回包或这一枚键缺失）。
 * **本会话 init 没回包时一律回 `null`**：上一轮存下来的 flag 不能拿来判这一轮（见头注释①）。
 * @param {String} tag 插件标识（`group_buy` / `send_friend`）
 * @return {Boolean|null}
 */
export function pluginState(tag) {
	if (missing[tag]) { return false; }
	if (!sessionReady) { return null; }
	const flag = PLUGIN_FLAGS[tag];
	if (!flag) { return null; }
	const raw = uni.getStorageSync('systemConfig');
	if (!raw) { return null; }
	let config = raw;
	if (typeof raw === 'string') {
		try { config = JSON.parse(raw); } catch (e) { return null; }
	}
	if (!config || !Object.prototype.hasOwnProperty.call(config, flag)) { return null; }
	return config[flag] === true || config[flag] === 1 || config[flag] === '1';
}

/** 插件是否已装（只要布尔：`null` 与 `false` 都当「不能发请求/不能出入口」） */
export function pluginInstalled(tag) {
	return pluginState(tag) === true;
}

/**
 * 后端已经说了「未安装」⇒ 本会话收口：
 *   ① 记一笔 `missing`（`pluginState` 从此恒 `false`，请求层不再发网络请求）；
 *   ② 把 `systemConfig` 里那一枚 flag 就地翻成 `false`，让所有仍在读 `systemConfig` 的旧调用点
 *      一起静默（不必挨个改成读本模块——那是「改一处、漏一处」的种子）。
 * 只由请求层（后端回「未安装」）或插件页/组件（拿到明确的缺少事实）调用；
 * 网络抖动、500、超时**不许**调（那会把一次服务异常扩大成「插件不存在」）。
 * @param {String} tag
 */
export function markPluginMissing(tag) {
	if (!PLUGIN_FLAGS[tag]) { return; }
	missing[tag] = true;
	const raw = uni.getStorageSync('systemConfig');
	if (!raw) { return; }
	let config = raw;
	if (typeof raw === 'string') {
		try { config = JSON.parse(raw); } catch (e) { return; }
	}
	if (!config || typeof config !== 'object') { return; }
	config[PLUGIN_FLAGS[tag]] = false;
	try { uni.setStorageSync('systemConfig', JSON.stringify(config)); } catch (e) { /* 写不进 storage 也不影响本会话的 missing 判据 */ }
}

/** 本会话已知未装（不看 flag，只看后端说过没有） */
export function pluginMissing(tag) {
	return missing[tag] === true;
}

/**
 * 从接口地址认插件：`app/group_buy/...` / `app/send_friend/...`。
 * 只认这两族（本轮点名的付费插件）；其余接口一律回空串，不受本闸门影响。
 * @param {String} url api_list 里登记的那条地址
 * @return {String} '' / 'group_buy' / 'send_friend'
 */
export function pluginOfUrl(url) {
	const path = String(url || '').replace(/^\/+/, '');
	if (path.indexOf('app/group_buy/') === 0) { return 'group_buy'; }
	if (path.indexOf('app/send_friend/') === 0) { return 'send_friend'; }
	return '';
}

/**
 * 请求层用：这一发能不能发出去。
 *   · 非插件地址 → 放行；
 *   · 插件地址 → **只有 `pluginState === true` 才放行**。
 *     未装（`false`）不能发；**init 还没回包（`null`）同样不能发** ——
 *     这一档无法判断插件在不在盘上，发出去就是在赌上一轮存下来的旧 flag；
 *     调用方（商详组件 / 插件页 / 下单页）都挂了 `onSystemConfigReady`，回包后会自己重来一次。
 * @param {String} url
 * @return {Boolean}
 */
export function canRequestPlugin(url) {
	const tag = pluginOfUrl(url);
	if (!tag) { return true; }
	return pluginState(tag) === true;
}

/** 给调用方读一下 flag 键（测试与埋点用，业务判据不直接读它） */
export function pluginFlagOf(tag) {
	return PLUGIN_FLAGS[tag] || '';
}

export default {
	PLUGIN_FLAGS,
	markSystemConfigReady,
	isSystemConfigReady,
	onSystemConfigReady,
	pluginState,
	pluginInstalled,
	markPluginMissing,
	pluginMissing,
	pluginOfUrl,
	canRequestPlugin,
	pluginFlagOf,
};
