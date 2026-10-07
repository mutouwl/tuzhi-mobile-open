/**
 * 视图层数据键：把「带点的字符串」（图片地址、含地址的长串）转成能安全放进 data 的键。
 *
 * 为什么必须转（2026-09-28 定位，海报出图报错的根因）：uni-app 推给微信运行时的差量数据，
 * 键是把嵌套路径用点拼出来的（@dcloudio/vue-cli-plugin-uni/packages/mp-vue/dist/mp.runtime.esm.js
 * 的 `_diff`：`(path == '' ? '' : path + ".") + key`），而微信 setData 把带点的键当**路径**解析
 * （`a.b[0].c` 那一档语法）。于是「以图片地址作 key」的那几张表（加载失败标记、原图宽高表）
 * 一写进 data 就出事：`bgErrors.https://img.mutouweb.com/a.png` 被拆成
 * `bgErrors` → `https://img` → `mutouweb` → …，中间那一段在视图层根本不存在
 * ⇒ 微信运行时抛 `TypeError: Cannot read properties of null (reading 'mutouweb')`
 * （那个 null 来自同一文件 `syncKeys` 的 `current[key] = null`）。
 *
 * 这一抛发生在 setData 内部，代价不是「这一次没更新」而是两件：这一次推送整体丢掉（视图停在旧帧），
 * 而 uni 写在 setData 回调里的「在途标志」`__next_tick_pending` 永远等不到复位 ⇒ 这一页后续全部停更。
 * 海报那一处两件事同时中：预览 load 到手就写 `bgSizes`/`avatarSizes`，正是要出图的那一拍，
 * 于是画布那一份永远拿不到素材尺寸、遮罩撤不掉，界面上读出来就是「生成海报一直报错 + 永远加载中」。
 * 报错里那个属性名永远是站点二级域，这也是它长期被误判成「对已出栈页面 setData」的原因。
 *
 * 只转路径用的三个字符（`.` `[` `]`），其余原样保留，键仍然是可读的地址；
 * 转过之后补一位 FNV-1a 哈希 —— 不然「只差标点」的两个地址会撞进同一键，
 * 一张坏图会连带把另一张好图判成坏（宽高表撞键则画布按错的尺寸裁切）。
 *
 * 只在「地址（或含地址的长串）作响应式表的 key」时使用。下标、数字 ID 这类本来不含点的键不必转。
 */
function mpKey(key) {
	const s = key === null || key === undefined ? '' : String(key);
	if (!/[.[\]]/.test(s)) return s;
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		// 乘一个大质数（FNV-1a）；>>> 0 把它按 32 位无符号截断，避免溢出成浮点
		h = Math.imul(h, 16777619) >>> 0;
	}
	return s.replace(/[.[\]]/g, '_') + '~' + h.toString(36);
}

export { mpKey };
export default { mpKey };
