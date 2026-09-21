/**
 * 教务模块：日期工具（学员端「我的课表」与「预约上课」共用）
 *
 * 统一「周一为一周起点」的口径：两页的日历、周范围查询、按天分组都依赖它，
 * 分散实现容易在一处写错导致日期错位（例如 getDay() 未做周一偏移）。
 */
const WEEK_MS = 7 * 86400000;

/**
 * 格式化为 YYYY-MM-DD（接受 Date 或时间戳）
 * @param {Date|Number} v
 * @returns {String}
 */
function fmtDate(v) {
	const d = v instanceof Date ? v : new Date(v);
	return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/**
 * 所在周的周一 0 点（周一为起点）
 * @param {Date|Number} v
 * @returns {Date}
 */
function mondayOf(v) {
	const d = v instanceof Date ? v : new Date(v);
	const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	// getDay(): 0=周日；先偏移成「周一=0」再回退，避免周日起点被算成上一周的周一
	s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
	return s;
}

/**
 * 当天 0 点时间戳
 * @param {Date|Number} v 缺省为现在
 * @returns {Number}
 */
function todayStart(v) {
	const d = v ? (v instanceof Date ? v : new Date(v)) : new Date();
	return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export { WEEK_MS, fmtDate, mondayOf, todayStart };

export default { WEEK_MS, fmtDate, mondayOf, todayStart };
