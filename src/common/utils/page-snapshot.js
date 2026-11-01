/**
 * 会话内页面快照 —— 底部导航（`tz/tab-bar.vue`）切 tab 走 `redirectTo`，**页面实例会被销毁**，
 * 所以「已加载的页面要保存」只能存在模块作用域，不能只记在页面 data 上。
 *
 * 用户 2026-10-28 点名五处「每次切换页面或 tabbar 都会触发重新加载、加载速度较慢」：
 * 自定义页/首页、课程分类、课程分组、实物商品列表、个人中心。口径同一条：
 *   ① 页面初始化时 / 下拉刷新时才会加载；
 *   ② 已加载的页面要保存，切页 / 切 tab 回来直接复原，不再请求。
 *
 * 约定（调用点照这四条做，别各写一份）：
 *   ① 只存本会话内存、不落 storage：跨会话复用会把后台改过的内容顶着不更新；
 *   ② **下拉刷新是唯一失效口**：各页 `refresh()` 重新取数成功后再覆盖快照；
 *   ③ 值是调用点现组的一个普通对象，这里**入库时 JSON 克隆**——页面之后 `push`/`concat`/
 *      改选中项都不会污染已经存下的那一份（否则「快照」会跟着页面一起变，等于没存）；
 *   ④ key 由各页自己定，但必须把「这一屏看得见的内容由什么决定」全带上：
 *      自定义页 id、分类 id、搜索词、分组 id、登录 token……少带一项就会把 A 的内容摆给 B 看。
 */
const snapshots = {};

/**
 * 取一份快照；没有就返回 null（调用点据此决定要不要发请求）。
 * @param {String} key
 * @return {Object|null}
 */
export function readPageSnapshot(key) {
	if (!key || !snapshots[key]) {
		return null;
	}
	// 读也克隆一份：调用点会把它直接摊到页面 data 上（随后还会 push/concat），
	// 不克隆就等于把「存进去的那一份」交给页面随便改，下一次复原拿到的是改过的
	try {
		return JSON.parse(JSON.stringify(snapshots[key]));
	} catch (err) {
		return null;
	}
}

/**
 * 存一份快照（JSON 克隆，避免存成页面上那些还会变的引用）。
 * @param {String} key
 * @param {Object} snapshot 纯数据对象（页面 data 里那几个字段拼一份）
 */
export function writePageSnapshot(key, snapshot) {
	if (!key || !snapshot) {
		return;
	}
	let stored;
	try {
		stored = JSON.parse(JSON.stringify(snapshot));
	} catch (err) {
		// 数据里出现不可序列化的东西（函数/循环引用）时不存：宁可下次重取，也不写一份坏快照
		return;
	}
	snapshots[key] = stored;
}
