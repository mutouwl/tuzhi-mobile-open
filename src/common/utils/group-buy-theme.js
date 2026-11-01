/**
 * 拼团业务主题色（2026-10-31 用户点名「拼团的提交页面：选择票券、填写表单，都要对拼团进行主题色调整」）
 *
 * 拼团提交链上的两张中间页（选票 / 报名信息）在拼团那一趟要换成拼团业务色 —— 与商详横幅、
 * 底栏「立即开团」、拼团详情页同一档，不取平台主色蓝。色值真源沿用那几处注释里记下的两档：
 *  - 渐变（按钮 / 横条）：`linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)`
 *    （`group-buy-banner` / `group-buy-btn` / `tz-button theme="group-buy"` 逐字同值）
 *  - 白底文字（价格 / 小字）：`#cf350e`（白底 5.04:1，见 `pages/app/group_buy/detail` 头注释）
 *
 * 页面只 import 这两枚：模板读不到模块级 import，要绑到 computed 再由模板用；
 * 别处再写一份字面量，下一次调业务色就只会改到一半。
 */
export const GB_GRADIENT = 'linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)';

export const GB_TEXT = '#cf350e';
