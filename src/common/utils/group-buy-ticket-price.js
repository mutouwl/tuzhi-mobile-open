/**
 * 线下活动「票种 → 拼团价」映射（2026-10-31）
 *
 * 拼团提交链的两张中间页（选票页 `app/activity/ticket`、报名信息页 `app/activity/form`）
 * 都要把票种换成拼团单价；各写一遍就是下一次改口径只改一半（硬约束 11）。
 *
 * 价只从拼团活动本体读（`group_buy.activity.detail` 的回体）：
 *  - 普通型 / 邀新型：`specs[]` 里对应票种那一行（`spec_id` 认商品当前 id，也认活动里存的
 *    `legacy_spec_id`——商品重存会整批换规格 id）；
 *  - 阶梯型：再按 `ladder[]` 里 `ladderId` 那一档取价，对不上（活动改过档）落这一档规格的第一档
 *    （与拼团区 `initPick()` 同口径）。
 *
 * 本模块只做展示口径：实付仍由结算页 `team.open/join` 现算。
 */

/**
 * 这一张票的拼团价与划线原价
 * @param {Object} activity `group_buy.activity.detail` 回体（`specs` / `ladder` / `type`）
 * @param {Object} item 票券行（`id` = 票种 id）
 * @param {Number|String} ladderId URL 上的 `gb_ladder`（阶梯型那一档；缺省/对不上落第一档）
 * @return {Object|null} `{ price, origin }`；`null` = 这一档没有拼团价（调用点回落票券原价）。
 *   `origin` 取活动快照 `origin_price`，不比拼团价高时回 0（不摆假的优惠）
 */
export function gbTicketPrice(activity, item, ladderId) {
    if (!activity || !item) { return null; }
    const id = Number(item.id) || 0;
    const rows = activity.specs || [];
    const hit = rows.filter(function (r) {
        return Number(r.spec_id) === id || Number(r.legacy_spec_id) === id;
    })[0] || null;
    if (!hit) { return null; }

    let price = Number(hit.price) || 0;
    if (activity.type === 'ladder') {
        const tiers = (activity.ladder || []).filter(function (r) {
            return Number(r.spec_id) === Number(hit.spec_id);
        });
        const want = Number(ladderId) || 0;
        const row = tiers.filter(function (r) { return Number(r.id) === want; })[0] || tiers[0];
        if (row) { price = Number(row.price) || 0; }
    }

    const origin = Number(hit.origin_price) || 0;
    return { price: price, origin: origin > price ? origin : 0 };
}
