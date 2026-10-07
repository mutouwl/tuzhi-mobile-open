/**
 * 直播红包的类型、状态与金额文案。
 * 信封（redpacket-modal）与记录清单（records-modal）两处都要把后端下发的枚举翻成中文，
 * 同一个枚举只在这一处翻译（一份写两处必分叉）；状态本身仍逐行吃后端字段，这里只做翻译。
 */
const TYPE_TEXT = { lucky: '手气红包', equal: '等分红包' };
const STATUS_TEXT = { pending: '待领取', finished: '已抢完', expired: '已过期', revoked: '已撤回' };

export function typeText(type) {
  return TYPE_TEXT[type] || TYPE_TEXT.lucky;
}

export function statusText(status) {
  return STATUS_TEXT[status] || '';
}

/** 去掉小数尾巴的零：88.00 → 88、20.50 → 20.5 */
export function amountText(value) {
  var s = String(value === undefined || value === null ? '' : value);
  if (s.indexOf('.') !== -1) {
    s = s.replace(/0+$/, '').replace(/\.$/, '');
  }
  return s;
}
