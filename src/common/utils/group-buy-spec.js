/**
 * 拼团规格与商品规格组件的桥（2026-10-29）
 *
 * 背景：拼团入口复用各商品自己的规格组件（实物 `sku-select-modal` / 组合 `spec-select-modal` /
 * 圈子 `tz-circle-spec-popup` / 教务 `package-sku-select-modal`），但那只组件原本只认「商品原价」。
 * 复用后发现「点开团看到的是单独购买的价、拼团特殊性没有了」（用户点名实物商品），
 * 所以给那几只组件加一枚加性入参 `gb`（活动本体）：有它时价格切到拼团价、按钮写「立即开团」。
 *
 * 这里只放**两边共用的那一条判据**：按 `spec_id` 从活动里取那一档拼团规格（阶梯型再按档位 id 取价）。
 * 各商品自己的字段名（`app_physical_sku_price.id` / `school_package_sku.id` / `app_circle_spec.id` /
 * `app_composite_spec.id` / 会员卡下标）在各自页面里映射成 `spec_id`，本文件不认商品大类
 * （硬约束 11：同一口径只存一处）。
 *
 * 2026-10-29 第二轮（用户点名「在这个选择商品规格弹窗里面，增加这个阶梯的选择。注意，不同阶梯
 * 对应的价格不同，要进行单独适配」）：阶梯型的价不在规格行上（`specs[].price` 恒 0，价在
 * `ladder[].price`）⇒ 规格弹窗里选完规格还要选人数档，价按「规格 + 档位」两轴取。
 * 因此本文件新增 `gbTiersOf` / `gbTierOf` / `gbTierId` / `gbPriceOf` / `gbPriceTextOf` 五枚，
 * **取价口径只此一份**——四只规格弹窗 + 会员卡页 + 拼团弹窗各写一遍就是下一次分叉。
 */

/**
 * 活动里某一档规格的拼团价行
 * @param {Object} activity 拼团区 @ready 上抛的活动本体（`specs[].spec_id/price/origin_price/...`）
 * @param {Number|String} specId 商品规格 id（会员卡是 sku 下标）
 * @return {Object|null} 没活动 / 活动没有这一档 ⇒ null
 */
export function gbSpecOf(activity, specId) {
	const rows = (activity && activity.specs) || [];
	const id = Number(specId) || 0;
	return rows.filter((row) => Number(row.spec_id) === id)[0] || null;
}

/**
 * 拼团价展示串（两位小数，与全站价格文本同形）
 * @param {Object|null} row `gbSpecOf()` 的返回
 * @return {String} 空串 = 没有这一档
 */
export function gbPriceText(row) {
	return row ? (Number(row.price) || 0).toFixed(2) : '';
}

/**
 * 「这一档规格下有哪些人数阶梯」（阶梯型才有）
 *
 * 后端 `activity.ladder` 按 `spec_id` 分组下发（`SpecLadder`），老活动整表 `spec_id=0`。
 * 与 `components/tz/group-buy-area.vue` 的 `tiers` 同一套回落：先按规格过滤，过滤不到就用整表
 * （老活动 / 只有一个规格时后端可能不带 spec_id）——**空数组 = 不是阶梯型或还没配档位**。
 * @param {Object} activity
 * @param {Number|String} specId
 * @return {Array} 按人数升序的档位行（`id` / `invite_num` / `price` / `spec_id`）
 */
export function gbTiersOf(activity, specId) {
	if (!activity || activity.type !== 'ladder') { return []; }
	const rows = activity.ladder || [];
	if (!rows.length) { return []; }
	const id = Number(specId) || 0;
	const specs = activity.specs || [];
	// 只有一个规格（或老活动没有规格行）时不按 spec_id 过滤：那一档可能落的是 0
	if (specs.length <= 1) { return rows.slice(0); }
	const hit = rows.filter((row) => Number(row.spec_id) === id);
	return hit.length ? hit : rows.slice(0);
}

/**
 * 选中的人数额（对不上 / 没选 ⇒ 第一档）
 * @param {Object} activity
 * @param {Number|String} specId
 * @param {Number|String} ladderId
 * @return {Object|null} 没有阶梯 ⇒ null
 */
export function gbTierOf(activity, specId, ladderId) {
	const rows = gbTiersOf(activity, specId);
	if (!rows.length) { return null; }
	const id = Number(ladderId) || 0;
	return rows.filter((row) => Number(row.id) === id)[0] || rows[0];
}

/**
 * 选中档位的 id（弹窗里点过就用点过的，没点过落第一档）
 * @return {Number} 0 = 没有阶梯
 */
export function gbTierId(activity, specId, ladderId) {
	const row = gbTierOf(activity, specId, ladderId);
	return row ? Number(row.id) || 0 : 0;
}

/**
 * 「规格 + 档位」两轴的拼团价（**唯一取价口**，端上任何地方都不许自己拿 ladder[].price 再算一遍）
 * @param {Object} activity
 * @param {Number|String} specId
 * @param {Number|String} ladderId
 * @return {Number} 阶梯型 = 该档价；其余 = 该规格价；都没有 ⇒ 0
 */
export function gbPriceOf(activity, specId, ladderId) {
	if (activity && activity.type === 'ladder') {
		const tier = gbTierOf(activity, specId, ladderId);
		return tier ? Number(tier.price) || 0 : 0;
	}
	const row = gbSpecOf(activity, specId);
	return row ? Number(row.price) || 0 : 0;
}

/**
 * 同上，两位小数文本（弹窗头区那一格）
 * @return {String} 没有这一档 ⇒ '0.00'（与全站价格文本同形，不留空）
 */
export function gbPriceTextOf(activity, specId, ladderId) {
	// 没有活动 ⇒ 空串（**不是 '0.00'**）：四只规格弹窗的「拼团态」闸门写的是 `v-if="gbPrice && ..."`，
	// 返回 '0.00' 会让普通购买/送好友那一趟画出「拼团 ¥0.00」的头部（circle 那只就是这一族）
	if (!activity) { return ''; }
	return gbPriceOf(activity, specId, ladderId).toFixed(2);
}

/**
 * 档位 chip 上的价文本（阶梯型）：同一人数档在各规格下价不同 ⇒ 带「起」，否则给准确价
 *
 * 2026-10-30 从 `group-buy-config-popup.vue` 的 `tierPriceText()` 收进这里：拼团档位弹窗改成
 * 复用 `components/tz/gb-ladder-picker.vue` 之后，两只弹层读同一份口径（硬约束 11）。
 * @param {Object} activity
 * @param {Object} row 档位行（`invite_num` / `price` / `spec_id`）
 * @return {String} 两位小数（必要时带「起」）
 */
export function gbTierPriceText(activity, row) {
	const n = Number(row && row.invite_num) || 0;
	const rows = (activity && activity.ladder) || [];
	const specs = (activity && activity.specs) || [];
	const hit = specs
		.map((s) => rows.find((l) => Number(l.spec_id) === Number(s.spec_id) && Number(l.invite_num) === n))
		.filter((l) => l);
	const own = (Number(row && row.price) || 0).toFixed(2);
	// 只有一个规格 / 各规格同价 ⇒ 不写「起」（单规格不需要，用户读「起」会以为还有别的档）
	if (hit.length <= 1) { return own; }
	const prices = hit.map((l) => Number(l.price) || 0);
	const min = Math.min.apply(null, prices);
	const max = Math.max.apply(null, prices);
	return own + (min === max ? '' : '起');
}

/**
 * 「N人团」那一格：普通/邀新型取活动的 `team_num`；阶梯型取**选中那一档**的 `invite_num`
 * @param {Object|null} activity
 * @param {Number|String} specId 阶梯型必给（档位按规格分组，拿错规格会读成别的档）
 * @param {Number|String} ladderId 阶梯型必给（没选时传 0，落第一档）
 * @return {String}
 */
export function gbTeamText(activity, specId, ladderId) {
	if (!activity) { return ''; }
	if (activity.type === 'ladder') {
		const tier = gbTierOf(activity, specId, ladderId);
		return tier ? Number(tier.invite_num) + '人团' : '';
	}
	const n = Number(activity.team_num) || 0;
	return n > 0 ? n + '人团' : '';
}

/**
 * 「我在这一场有进行中的团 ⇒ 不能再次购买」在**规格弹窗**这一层的收口文案（PRD 2026-10-27 / 2026-10-30）
 *
 * 底栏那枚原价购买按钮已在九类商详页按 `gbInTeam` 收起，但规格弹窗是**第二条购买入口**：
 * 页面上「选择 / 选择套餐 / 圈子有效期」那一行照样点得开，弹窗里的确认按钮照样送原价单
 * （2026-10-30 用户点名：「下面这个立即购买…按钮没有了。但是我点击这个规格选择，它会弹出来
 * 单独购买的规格选择弹窗，并且规格弹窗里面也是可以点击立即购买按钮进行单独购买的。啊，
 * 这应该是一个逻辑漏洞，给补上」）。
 *
 * 口径：弹窗本身**不收**（内含商品 / 套餐权益这些信息只有它里面看得见），只把「确认购买」
 * 这一枚换成禁用态并写这一句。四只规格弹窗（实物 / 组合 / 圈子 / 教务套餐）同读这一份，
 * 宿主只传布尔 `in-team`（判据仍是页面那一枚 `gbInTeam`，只由拼团区 `@ready` 的 `inTeam` 写）。
 */
export const IN_TEAM_BLOCK_TEXT = '参团中不可单独购买';
