/**
 * 刷题本「目录层级树」可见行 + 导引线的唯一实现（端上只此一份）
 *
 * 刷题本首页（index）、错题本（wrong）、我的收藏（collect）摆的是同一棵树：
 * 缩进 + 祖先竖线 + 折叠圆钮 + 名称（首页多一行分段进度）。早前三页各抄一份 walk/guides，
 * 改一页忘两页——2026-11-22 collect 页竖线又插进圆钮，就是首页修好、另两页没跟。
 *
 * 现在行数据只由本文件产出、版式只由 `pages/app/drill_book/components/drill-catalog.vue` 给出；
 * 各页只决定右侧那一格（首页「做题/继续」按钮，错题本/收藏是「N题 ›」）。
 */

/** 每级缩进（px）与圆钮中心相对行左沿的偏移（px）；几何与 drill-catalog.vue 的样式同源 */
export const CATALOG_INDENT = 20;
export const CATALOG_TOGGLE_CENTER = 10;

/** 分段进度：5 段各代表 20%，返回每一段的填充宽度（0%～100%） */
function segWidths(p) {
	return [0, 1, 2, 3, 4].map(k => {
		const inSeg = Math.max(0, Math.min(20, Number(p) - k * 20));
		return inSeg * 5 + '%';
	});
}

/**
 * 目录树 → 可见行（任一目录折叠时收起它下面整棵子树）
 *
 * @param {Array} nodes 后端目录树（children 嵌套，最多 5 级）
 * @param {Object} collapsed 折叠态表：{ [目录id]: true }
 * @return {Array} 每行带 guides（祖先竖线清单）与 showBranch（本行往下接的竖线）
 */
export function buildCatalogRows(nodes, collapsed = {}) {
	const rows = [];
	const walk = (list, level, parentId) => {
		(list || []).forEach(n => {
			const id = Number(n.id);
			// 首页给 question_count / answered_count；错题本、收藏给 count（含子目录）
			const total = Number(n.question_count != null ? n.question_count : (n.count || 0));
			const answered = Number(n.answered_count || 0);
			const children = n.children || [];
			const hasChildren = children.length > 0;
			const isCollapsed = hasChildren && !!collapsed[id];
			const progress = total > 0 ? Math.min(100, Math.round(answered * 100 / total)) : 0;
			rows.push({
				id,
				name: n.name,
				level,
				parent: parentId,
				count: Number(n.count != null ? n.count : total),
				question_count: total,
				answered_count: answered,
				progress,
				seg_widths: segWidths(progress),
				hasChildren,
				collapsed: isCollapsed,
				// 叶子目录且有题目：整行可去答题（首页右侧再给「做题/继续」钮）
				canPractice: !hasChildren && total > 0,
				actionText: answered > 0 ? '继续' : '做题',
			});
			if (hasChildren && !isCollapsed) {
				walk(children, level + 1, id);
			}
		});
	};
	walk(nodes, 0, 0);

	// 层级导引线：每条可见行带一份「祖先竖线」清单。
	// 直接父级那条线，最后一条子级只画到圆钮中心（半截），其余贯通整行；
	// 更上层祖先只有「后面还有同级兄弟」时才继续往下画，避免线悬在半空。
	const lastChild = rows.map((row, idx) => {
		for (let j = idx + 1; j < rows.length; j++) {
			if (rows[j].level < row.level) return true;
			if (rows[j].level === row.level) return false;
		}
		return true;
	});
	rows.forEach((row, idx) => {
		const guides = [];
		const parentLevel = row.level - 1;
		if (parentLevel >= 0) {
			guides.push({ left: parentLevel * CATALOG_INDENT + CATALOG_TOGGLE_CENTER, half: lastChild[idx] });
		}
		for (let a = 0; a < parentLevel; a++) {
			let laterSibling = false;
			for (let j = idx + 1; j < rows.length; j++) {
				if (rows[j].level <= a) {
					laterSibling = rows[j].level === a;
					break;
				}
			}
			if (laterSibling) guides.push({ left: a * CATALOG_INDENT + CATALOG_TOGGLE_CENTER, half: false });
		}
		row.guides = guides;
		row.showBranch = !!(row.hasChildren && !row.collapsed
			&& rows[idx + 1] && rows[idx + 1].level > row.level);
	});
	return rows;
}
