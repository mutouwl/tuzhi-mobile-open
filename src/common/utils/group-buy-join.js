/**
 * 拼团「加入别人的团」上下文（M-P1 受邀参团那条链）
 *
 * 团详情页点「立即加入」不再直接去提交订单页，而是带一组扁平 `gb_*` 参数跳到**商品自己的详情页**：
 * 多规格在那页先把规格说清、线下活动/教务套餐在那页/下单页补齐报名信息与校区学生，最后统一从
 * 提交订单页的拼团档（`team.join`）落单。参数只活在这一页实例上：用户退出后重新从别处进商品页、
 * 参数就没了 ⇒ 回到「自己开团」的正常链（2026-10-30 用户口径）。
 *
 * 为什么单独抽这一份：九个商品详情页与拼团区都要读同一组键，各写一遍就会出现
 * 「团详情拼的是 A 规格、商品页按 B 规格弹窗」那种分叉（硬约束 11）。
 */

/**
 * 从页面参数里读 join 上下文
 * @param {Object} options 页面 onLoad 的原始参数（含小程序 scene 解析后的那份也可）
 * @return {Object|null} 没有 `gb_team` 就是 null（正常进页 / 自己开团那一档）
 */
export function readGroupBuyJoin(options) {
    const q = options || {};
    const teamId = Number(q.gb_team) || 0;
    if (teamId <= 0) {
        return null;
    }
    return {
        teamId: teamId,
        // 团所属活动：商品页的拼团区拿它核一下「这一页读到的活动是不是这一场」，
        // 对不上就不进 join 态（活动结束、换了新活动那两档）
        activityId: Number(q.gb_activity) || 0,
        // 商品 id：会员卡页要按它选中目标卡（多张卡里只有参与了拼团的那张才出按钮）
        goodsId: Number(q.gb_goods_id) || 0,
        goodsType: String(q.gb_goods_type || ''),
        // 团上快照的规格 / 档位：规格弹窗按它预选并锁定（`team.join` 只认团上那一档）
        specId: Number(q.gb_spec) || 0,
        ladderId: Number(q.gb_ladder) || 0,
        // 团上快照的单价：规格弹窗头区显示它，别拿活动现价（商家改过价时两者可能不同）
        price: Number(q.gb_price) || 0,
    };
}

/**
 * 往一个已带 `?` 或不带 `?` 的页面地址后面追加参数
 * @param {String} url
 * @param {Object} params 空值（'' / null / undefined）不拼
 * @return {String}
 */
export function appendQuery(url, params) {
    const rows = [];
    Object.keys(params || {}).forEach((key) => {
        const v = params[key];
        if (v === '' || v === null || v === undefined) { return; }
        rows.push(key + '=' + encodeURIComponent(v));
    });
    if (!rows.length) { return url; }
    return url + (url.indexOf('?') > -1 ? '&' : '?') + rows.join('&');
}
