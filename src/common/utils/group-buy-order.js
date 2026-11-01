/**
 * 拼团下单上下文（扁平 `gb_*` 键）在「中间页」之间的搬运（2026-10-30）
 *
 * 背景：拼团的结算页是全站那一张 `pages/order/submit/submit`，而**下单才要的额外信息**
 * 在普通购买链里各有自己的中间页 —— 线下活动是报名信息页（`app/activity/form`）、
 * 教务套餐是确认报名页（`app/school/package/confirm`）。2026-10-28 把拼团接进这两类时，
 * 这两样被内联进了结算页（教务套餐那一档还是原生 `u-picker` 选校区）；2026-10-30 用户点名
 * 「拼团也要进中间页，不要在下单页另造一套选择器」⇒ 中间页之间要能把这组键原样带过去。
 *
 * 键名只列这一处（硬约束 11）。中间页各写一份就会漏键：漏 `gb_team` 变成自己开团、
 * 漏 `gb_spec` 变成「没选规格」、漏 `gb_spec_set` 把会员卡第 0 档读成没选。
 */
import { appendQuery } from './group-buy-join.js';

/**
 * 拼团下单上下文的全部键（结算页 `submit-order.vue` 读、中间页只负责原样搬运）
 *
 * - `gb_activity` / `gb_team` / `gb_ladder`：哪一场活动、哪一团、哪一档人数；
 * - `gb_spec` / `gb_spec_set`：哪一档规格（0 对会员卡是合法档位，故另有 `gb_spec_set`）；
 * - `gb_count`：份数（1 不带，后端缺省 1）；
 * - `gb_campus` / `gb_student`：教务套餐的上课校区与上课学生（中间页确认后回填）；
 * - `gb_form`：线下活动的报名信息 id（2026-10-31：拼团也走「选票页 → 报名信息页」两页，
 *   报名在中间页收完，结算页只交出这一枚给 `team.open/join`）；
 * - `gb_price`：中间页展示用的拼团价（不是结算依据，实付以 `team.open/join` 回体为准）；
 * - `gb_goods_type` / `gb_goods_id`：商品大类与商品 id（结算页拿它去问 `activity.detail` / `team.detail`）。
 */
export const GB_ORDER_KEYS = [
    'gb_activity',
    'gb_team',
    'gb_ladder',
    'gb_spec',
    'gb_spec_set',
    'gb_count',
    'gb_campus',
    'gb_student',
    'gb_form',
    'gb_price',
    'gb_goods_type',
    'gb_goods_id',
];

/**
 * 从页面参数里挑出拼团下单上下文（没有 `gb_activity` 就是空对象 = 不是拼团单）
 * @param {Object} params 页面 `onLoad` 的原始参数（或 `parsePageParams` 之后那一份）
 * @return {Object} 只含本单真正带了的键，值保持原样（数字字符串原样，由结算页自己转）
 */
export function readGroupBuyOrder(params) {
    const q = params || {};
    const out = {};
    GB_ORDER_KEYS.forEach((key) => {
        const value = q[key];
        if (value === '' || value === null || value === undefined) { return; }
        out[key] = value;
    });
    return out;
}

/**
 * 把拼团下单上下文原样追加到一个页面地址上（空值不拼，与 `appendQuery` 同一档）
 * @param {String} url 目标页地址（带不带 `?` 都行）
 * @param {Object} params 拼团下单上下文（`readGroupBuyOrder()` 的返回，或 `gbCtx()` 拼出来的那一份）
 * @return {String}
 */
export function withGroupBuyOrder(url, params) {
    const q = params || {};
    const out = {};
    GB_ORDER_KEYS.forEach((key) => {
        const value = q[key];
        if (value === '' || value === null || value === undefined) { return; }
        out[key] = value;
    });
    return appendQuery(url, out);
}

/**
 * 拼团那一单去「教务套餐确认报名页」的地址
 *
 * 两处调用：① 教务套餐商详 `onGbOrder`（拼团区上抛上下文后第一次进确认页）；
 * ② 结算页的兜底（老链接 / 历史栈没带 `gb_student`、或名单里那一处已失效）——
 * 拼团结算页不再摆校区/学生选择器，缺了只能回确认页补选。
 *
 * 路径与三枚普通参数（`id` / `sku` / `campus`，确认页按它们取套餐、规格下标与校区）
 * 只写这一处：两处各拼一遍就会出现「商详带的 sku 下标、兜底带的 spec id」那种分叉。
 * @param {Object} params
 * @param {Number|String} params.packageId 套餐 id
 * @param {Number|String} params.skuIndex 套餐规格下标（确认页按 `form.skus` 的下标取档）
 * @param {Number|String} params.campusId 已选校区（0 = 让确认页自己选）
 * @param {Object} params.gb 拼团下单上下文（`gb_*` 键，见 `GB_ORDER_KEYS`）
 * @return {String}
 */
export function groupBuyConfirmUrl(params) {
    const p = params || {};
    const url = '/pages/app/school/package/confirm/confirm'
        + '?id=' + (Number(p.packageId) || 0)
        + '&sku=' + (Number(p.skuIndex) || 0)
        + '&campus=' + (Number(p.campusId) || 0);
    return withGroupBuyOrder(url, p.gb || {});
}
