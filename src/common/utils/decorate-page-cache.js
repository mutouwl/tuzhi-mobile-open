/**
 * 自定义页（DIY 装修页，含首页）已加载数据缓存 —— 移动端只收这一处。
 *
 * 用户 2026-10-28 点名：「自定义页面（特别是首页），每次切换页面或 tabbar 都会触发重新加载，
 * 并且加载速度较慢，调整刷新逻辑：① 页面初始化时 / 下拉刷新时才会加载；② 已加载的页面要保存，
 * 不要在每次切换页面或 tabbar 触发刷新。」
 *
 * 为什么缓存必须留在**模块作用域**、不能只记在页面 data 上：底部导航是自定义的 `tz/tab-bar.vue`，
 * 切 tab 时 `onChange` 给 `$nav.to()` 传的是 `redirectTo`（`common/utils/router.js` 的 `jump`），
 * 当前页实例会被销毁；再进首页是一个**新实例**，data 上那枚「已加载」标记跟着一起没了。
 * 页面 `pages/index/js.vue` 的模块作用域在一次 App 会话里只求值一次，所以按页面 id 存在这里。
 *
 * 只存本会话内存、不落 uni storage：
 *   ① 装修配置里带课程/商品/价格，跨会话复用会把后台改过的内容顶着不更新；
 *   ② 用户口径就是「本次打开后不再重复加载」，失效口只有三个：下拉刷新、首取失败重试、
 *      登录态变化（见下段）——前两个在 `pages/index/js.vue` 的 `refresh()` / `onShow`
 *      （硬约束 16 例外三）。
 * 页面主体（轮播/图文/课程/商品）与登录态无关，但**券那几段不是**：后端 `Decorate::parseData`
 * 的 coupon 分支走 `user_info()`、随行带 `userCoupons`，所以每份缓存都记下「取数时那枚 token」，
 * 页面 `getData()` 拿它和当前 token 比对——登录 / 换号 / 退出后上一份自动作废、重新取一次，
 * 不能把上一个人的「继续领 / 点击领取」摆给下一个人看。
 *
 * 代价（用户 2026-10-28 自己选的取舍，别当缺陷改回去）：页面里嵌的音频/视频走 alivod 签名地址
 * （`addons/alivod/library/Alivod.php` 的 `PLAY_URL_AUTH_TIMEOUT`，6 小时有效），本会话挂机超过
 * 这个窗口后那一枚地址会过期——下拉刷新一次即重新签名。要改成「超窗自动重取」先问用户，
 * 他点名的口径是「页面初始化时 / 下拉刷新时才会加载」。
 */
const pages = {};

/**
 * 页面 id 归一化：默认首页没有 id（H5 是 `#/`，路由改写后是 `/pages/index/index`），
 * 与带 id 的具体自定义页分开存——空串一律落到 `default` 那一格；
 * 数字 `0` 与字符串 `'0'` 是同一个页面 id，归一成同一格。
 * @param {String|Number} id
 * @return {String}
 */
export function decoratePageKey(id) {
	if (id === undefined || id === null || String(id) === '') {
		return 'default';
	}
	return String(id);
}

/**
 * 取一份已加载的装修页。
 * @param {String|Number} id 页面 id（默认首页传空）
 * @return {Object|null} `{ data, circleList, circlePostList, circleLoaded, token }`
 */
export function readDecoratePage(id) {
	return pages[decoratePageKey(id)] || null;
}

/**
 * 存一份装修页。页面本体先落一次（`circleLoaded=false`），圈子那两段补到之后再覆盖一次。
 * @param {String|Number} id 页面 id（默认首页传空）
 * @param {Object} payload `{ data, circleList, circlePostList, circleLoaded, token }`
 */
export function writeDecoratePage(id, payload) {
	if (!payload || !payload.data) {
		return;
	}
	pages[decoratePageKey(id)] = payload;
}
