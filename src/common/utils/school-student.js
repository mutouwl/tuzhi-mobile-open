/**
 * 校区模块：跨页面记住上次选中的学生。
 * 在学生选择弹层确认时写入，各页面加载学生列表后优先恢复该学生；
 * 恢复前须校验其仍存在于当前学生列表中（防止已删除/其他账号的学生生效）。
 */
var KEY = 'school_selected_student';

export default {
	// 读取上次选中的学生（{ id, name, avatar, phone, class_names }），无记录或数据异常返回 null
	get() {
		try {
			var stu = uni.getStorageSync(KEY);
			return stu && stu.id ? stu : null;
		} catch (e) {
			return null;
		}
	},
	// 记录选中的学生；仅保留展示所需字段，避免缓存无限膨胀
	set(stu) {
		if (!stu || !stu.id) return;
		uni.setStorageSync(KEY, { id: stu.id, name: stu.name || '', avatar: stu.avatar || '', phone: stu.phone || '', class_names: stu.class_names || '' });
	},
	// 从学生列表中恢复默认选中：缓存学生在列表中则返回其 id，否则返回列表第一个
	resolve(students) {
		if (!students || !students.length) return 0;
		var cached = this.get();
		var hit = cached && students.find(function (x) { return x.id == cached.id; });
		return hit ? hit.id : students[0].id;
	},
	// 学员端创建开关：上限为 0 表示不允许自行创建（前端隐藏新建入口）；limit>0 时 total 达上限后不可再建
	canCreate(total, limit) {
		limit = parseInt(limit);
		if (!(limit > 0)) return false;
		return total < limit;
	},
	// 达到创建上限的提示文案（与后端 studentAdd 错误文案保持一致）
	createLimitMessage(limit) {
		return '最多可创建' + parseInt(limit) + '个学生，如需增加请联系机构';
	}
};
