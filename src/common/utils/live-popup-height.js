/**
 * 直播间三个底部弹层的**面板总高**：邀请达人榜榜单（参照页） ⇄ 分享有礼活动列表 ⇄ 分享有礼活动详情。
 *
 * 为什么要单独一份（硬约束 11/28：一个几何常量只存一处，调用点各抄一个数必然对不齐）：
 * 2026-10-02 用户点名「分享有礼弹窗可与邀请达人榜弹窗等高」，第一版照抄成 `calc(60vh - 141px)`
 * ——把参照页列表**下方**那两段固定条从列表区**减**掉了，于是分享有礼面板比达人榜**矮 141px**，
 * 与「等高」正好相反（同一屏两个面板总高不等，肉眼一眼就看出来）。
 * 2026-10-06 用户第二次点名「分享有礼的弹窗高度，包括分享有礼的详情，可以跟这个邀请达人榜弹窗高度对齐」。
 *
 * 正确的算法是**加不是减**：面板总高 = 标题行 + 列表区高 + 该面板自己的下方固定条。
 * 达人榜面板 = 标题行 + 列表区 60vh + 下方两段固定条 141；分享有礼这一侧没有那两段，
 * 就把同样的 141 **加进自己的列表区**，面板总高才与达人榜相等。
 *
 * 下面每个数字都照各自文件里的样式逐字抄，改了任一档三只弹层一起重算（改档后跑
 * `node tuzi-mobile/scripts/check-live-popup-height.js` 看三只面板总高是否仍相等）。
 */

/** tz-button normal 档渲染高：上下内衬 10+10 + 14px 文字行盒 ≈17 */
export const BTN_H = 37;
/** 标题行：上下内衬 15 + 12 + 16px/600 标题行盒 22（`.irb-head` 与 `.sgl-title` 逐值相同；
     榜单那枚状态标签、右侧几枚动作都矮于这枚 16px 行盒，不撑高） */
export const HEAD_H = 49;
/** 达人榜 `.irb-me-bar` 我的排名条：上距 12 + 上下内衬各 10 + 头像 44 */
export const RANK_ME_BAR_H = 76;
/** 达人榜 `.irb-foot` 底栏：上距 16 + tz-button normal 档 + 下内衬 12 */
export const RANK_FOOT_H = 65;
/** 达人榜列表下方那两段固定条合计 */
export const RANK_BOTTOM_H = RANK_ME_BAR_H + RANK_FOOT_H;
/** 详情 `.sgd-head`：上内衬 15 + `.sgd-title` 显式 line-height 22（骨架那一档 `.sgd-sk-title`
     16 + 上下外衬各 3 = 22，头行等高，数据到手不跳）；右内衬 36 只避关闭图标，不进高度 */
export const DETAIL_HEAD_H = 37;
/** 详情 `.sgd-sub` 条件说明：上距 4 + 12px/17 行盒 + 下内衬 12（**按数据有无才出现**，见下） */
export const DETAIL_SUB_H = 33;
/** 详情 `.sgd-foot` 底栏：上距 14 + 同一枚 tz-button normal 档 + 下内衬 12 */
export const DETAIL_FOOT_H = 63;

/** 三只弹层共同的面板总高：49 + 60vh + 141 */
export const PANEL_TOTAL_H = HEAD_H + RANK_BOTTOM_H;

/** 列表区高统一走这一条拼法：calc() 的 '+' 两侧各留一个空格
 *  （紧凑写法整条 height 在小程序端被判非法、整条作废 ⇒ 退回 tz-popup-list 的默认值 60vh，
 *   症状是「怎么高度没生效」；硬约束 28 第 ③ 条那一族） */
function calc60(px) {
  return 'calc(60vh + ' + px + 'px)';
}

/** 达人榜榜单（参照页）列表区高：vh 定档的那一档，它自己不动 */
export const RANK_LIST_H = '60vh';
/** 分享有礼活动列表：下方那两段它没有，141 要**加进**列表区（原来错写成 `60vh - 141px`） */
export const SHARE_GIFT_LIST_H = calc60(RANK_BOTTOM_H);

/**
 * 分享有礼活动详情：它自己下方有一枚按钮底栏，取失败那一档还会把底栏整块收掉（`v-if="!error"`），
 * 另有一行按数据有无才出现的条件说明。这两处的差值都从列表区扣回去，
 * 于是四帧（首帧骨架 / 有条件说明 / 无条件说明 / 取失败）面板总高都不动（M18⑨d：面板从首帧就占住这一档）：
 *   无条件说明 + 有底栏（首帧骨架那一档就是它）：37 + 列表区 + 63 ⇒ 列表区 60vh + 90
 *   有条件说明：                            70 + 列表区 + 63 ⇒ 列表区 60vh + 57
 *   取失败（活动连头都没有，条件说明与底栏都不出）：37 + 列表区      ⇒ 列表区 60vh + 153
 * @param {Boolean} hasCondition 活动是否带了 condition_text（那一行才出）
 * @param {Boolean} noFoot 底栏是否整块收掉（取失败那一档）
 * @return {String} 列表区高度（tz-popup-list 的 height，要确定高度，不许写 min/max）
 */
export function detailListHeight(hasCondition, noFoot) {
  const head = DETAIL_HEAD_H + (hasCondition ? DETAIL_SUB_H : 0);
  const foot = noFoot ? 0 : DETAIL_FOOT_H;
  return calc60(PANEL_TOTAL_H - head - foot);
}