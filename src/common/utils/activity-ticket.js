// 线下活动票券：状态文案 / 状态色 / 活动时间格式化
// 票券列表（pages/app/activity/user）与票券详情（pages/app/activity/ticketdetail）共读这一份，
// 避免同一套判定在两页各写一遍（硬约束 11）：状态判据、时间口径只在这里改。

const WEEK_TEXT = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}

/**
 * 票券状态文案：签到优先（已签到），否则按票券状态（待使用 / 待审核 / 作废）
 * @param {Object} item 票券行（sign / status）
 * @return {String}
 */
export function ticketStatusText(item) {
  const row = item || {};
  const sign = Number(row.sign || 0);
  const status = Number(row.status || 0);
  if (sign === 1) return '已签到';
  if (status === 1) return '待使用';
  if (status === 0) return '待审核';
  return '作废';
}

/**
 * 状态色名：时间轴圆点（tz-school-timeline 的 dot-color）与状态标签共用
 * @param {Object} item 票券行
 * @return {String} blue / green / orange / gray
 */
export function ticketStatusClass(item) {
  const row = item || {};
  const sign = Number(row.sign || 0);
  const status = Number(row.status || 0);
  if (sign === 1) return 'green';
  if (status === 1) return 'blue';
  if (status === 0) return 'orange';
  return 'gray';
}

/** 时间戳（秒）→ Date；0 / 空返回 null */
export function ticketStartDate(ts) {
  const value = Number(ts || 0);
  return value > 0 ? new Date(value * 1000) : null;
}

/**
 * 活动开始时间文案：2026.10.25 周日 19:30
 * @param {Number|String} ts 秒级时间戳
 * @return {String}
 */
export function ticketStartText(ts) {
  const d = ticketStartDate(ts);
  if (!d) return '活动时间待定';
  return d.getFullYear() + '.' + pad2(d.getMonth() + 1) + '.' + pad2(d.getDate()) + ' ' +
    WEEK_TEXT[d.getDay()] + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}

/**
 * 时间轴左列日期锚点：月-日（左列 44px 放不下带年份的完整日期，完整时间在卡内）
 * @param {Number|String} ts 秒级时间戳
 * @return {String}
 */
export function ticketShortDate(ts) {
  const d = ticketStartDate(ts);
  return d ? pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) : '';
}
