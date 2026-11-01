/**
 * 规格「这一档还能不能买」的唯一一份判据（2026-10-29 用户点名）
 *
 * 用户原话：「为什么提交订单才提示库存不足，库存不足是在规格选择中直接禁用啊」——
 * 病根是规格弹窗只看「价格 / 名字」，把库存留到提交那一刻由后端拒。
 *
 * 三处调用点读同一份，不许各写一遍（各写一遍必然分叉：一处禁用、另一处还能点）：
 *  ① 拼团规格弹窗 `components/tz/group-buy-config-popup.vue`（规格 chips / 「确定」）；
 *  ② 拼团区 `components/tz/group-buy-area.vue`（默认选中那一档要跳过售罄的）；
 *  ③ 组合商品商详的规格弹窗 `pages/app/composite/components/spec-select-modal.vue`。
 *
 * 2026-10-29 同一份文件里再收一件「同一张表只拆一次」的事：**多属性规格的分维**
 * （`specParts` / `specGroupsOf`，见文件末尾）——实物商详 `buildSkuTree()` 与拼团规格弹窗
 * 要的是同一张 `[{name:'规格1',children:[…]}, …]`，两处各拆一份就会出现
 * 「商详两节、拼团一排」那种分叉（用户 2026-10-29 点名的正是这个症状）。
 *
 * 字段口径（都由后端下发，前端不自己算库存）：
 *  - `stock`：`-1` = 不限（不含实物的档 / 老接口没这一根）、`0` = 已售罄、`>0` = 剩余件数；
 *  - `count_max`：份数上限，`0` = 不可买（售罄或限购用尽），`>=1` = 可买（拼团 `Quantity` 那一份算的）。
 *
 * 只认「不能买」这一件事：缺键 / 老接口没下发 ⇒ 一律放行（宁可让后端在提交时兜，
 * 也不要把老接口的商品整片误判成售罄）。
 */

/**
 * 这一档为什么不能买（空串 = 能买）
 * @param {object} row 规格行（`stock` / `count_max`；两者都缺时视为能买）
 * @return {string} '售罄' | '限购' | ''
 */
export function specBlockText(row) {
	if (!row) {
		return '';
	}
	const stock = Number(row.stock);
	if (isFinite(stock) && stock === 0) {
		return '售罄';
	}
	const max = Number(row.count_max);
	if (isFinite(max) && max === 0) {
		return '限购';
	}
	return '';
}

/**
 * 这一档能不能买（chips 的 `@tap` 闸门、默认选中档、底部按钮的 disabled 都读它）
 * @param {object} row
 * @return {boolean}
 */
export function specBuyable(row) {
	return specBlockText(row) === '';
}

/**
 * 从一组规格里挑「默认该选哪一档」：保留用户已选的那一档（还能买才保留），
 * 否则落到第一档能买的；全都不能买时回第一档（界面据此显示「售罄」并禁用按钮，
 * 而不是凭空把规格列表收掉 —— 用户要知道为什么点不了）。
 *
 * @param {Array} rows 规格行
 * @param {number|string} keepId 已选的 spec_id（0 = 没选过）
 * @return {object|null}
 */
export function pickSpecRow(rows, keepId) {
	const list = Array.isArray(rows) ? rows : [];
	if (!list.length) {
		return null;
	}
	const keep = list.find((r) => Number(r.spec_id) === Number(keepId));
	if (keep && specBuyable(keep)) {
		return keep;
	}
	return list.find(specBuyable) || keep || list[0];
}

/**
 * 规格文案拆维：实物多属性的一行 = **一个组合**，各维的值以英文逗号并列
 * （`app_physical_sku_price.goods_sku_text` = `红色,大`）
 *
 * @param {string} text
 * @return {string[]} 逐维的值（去首尾空格；空文案回 `['']`，调用点自己判长度）
 */
export function specParts(text) {
	const raw = String(text === null || text === undefined ? '' : text);
	return raw.split(',').map((one) => one.trim());
}

/**
 * 多属性规格的**分维表**：把「一行 = 一个组合」的清单还原成
 * `[{ name: '规格1', children: [{ name: '红色' }, …] }, …]`（与实物商详的 `sku_tree` 同形）
 *
 * 为什么收在这一份里（2026-10-29 用户点名 `#/pages/app/physical/detail/detail?id=2`
 * 「如果是实物商品拼团的话，那么拼团的规格选弹窗应该跟这个实物商品中的各个选项一样。
 * 比方说，规格一子选项、规格二子选项，这样分开，而不是放在一起」）：实物商详
 * `pages/app/physical/detail/js.vue` 的 `buildSkuTree()` 与拼团规格弹窗要的是**同一张分维表**，
 * 两处各写一份必然分叉（一处两节、另一处一排组合文案，正是用户读出来的那个症状）。
 *
 * 判据两条：
 *  - **只有每一行都能拆出同一维数、且维数 >= 2** 才算多属性；一维（`标准版` / `票种A` / `默认`）
 *    回 `[]`，调用点按平铺 chips 摆（票种 / 时长 / 套餐规格 / 圈子有效期都属于这一档）；
 *  - 某一维一个值都收不到 ⇒ 这串文案不是「按逗号分维」的那种（值里自带逗号的单维规格），
 *    回 `[]`，不硬拆出一节空标题 + 一排错位的值。
 *
 * 顺序：维序 = 第一行的逗号序，维内选项序 = 各行首次出现的顺序（与商品后台、商详同一份）。
 *
 * @param {Array} rows 规格行（默认读 `spec_text`，再退 `text`；实物 SKU 价行由调用点传读点）
 * @param {Function} [textOf] 取文案的函数
 * @return {Array} 空数组 = 不是多属性（或数据异常），调用点退回平铺
 */
export function specGroupsOf(rows, textOf) {
	const list = Array.isArray(rows) ? rows : [];
	if (!list.length) {
		return [];
	}
	const read = typeof textOf === 'function'
		? textOf
		: (row) => (row && (row.spec_text || row.text)) || '';
	const parts = list.map((row) => specParts(read(row)));
	const dims = parts[0].length;
	if (dims < 2) {
		return [];
	}
	// 逐行维数必须一致：某一行多/少一维 ⇒ 这张清单不是「按逗号分维」的那种（值里自带逗号，
	// 或手工改过库）。这时候硬拆会把那一档变成永远选不到的死档 ⇒ 退回平铺（文案原样摆，不会错位）
	for (let i = 1; i < parts.length; i++) {
		if (parts[i].length !== dims) {
			return [];
		}
	}
	const groups = [];
	for (let d = 0; d < dims; d++) {
		const children = [];
		for (let i = 0; i < parts.length; i++) {
			const name = parts[i][d] || '';
			if (name && !children.some((child) => child.name === name)) {
				children.push({ name: name });
			}
		}
		if (!children.length) {
			return [];
		}
		groups.push({ name: '规格' + (d + 1), children: children });
	}
	return groups;
}
