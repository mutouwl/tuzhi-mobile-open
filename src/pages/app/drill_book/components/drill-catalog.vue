<template>
	<view class="db-catalog-tree">
		<view v-for="node in rows" :key="node.id" class="db-cat-node"
			:class="{ 'db-cat-node-compact': !showProgress }"
			:style="{ paddingLeft: (node.level * 20) + 'px' }" @click="$emit('node-click', node)">
			<!-- 祖先导引线：最后一条子级只画到圆钮中心，其余贯通整行 -->
			<view v-for="(g, gi) in node.guides" :key="'g' + gi" class="db-cat-guide"
				:class="{ 'db-cat-guide-half': g.half }" :style="{ left: g.left + 'px' }"></view>
			<!-- 本行展开且下面还有子级：从圆钮**下沿**往下接一条竖线，不许盖进圆钮里 -->
			<view v-if="node.showBranch" class="db-cat-guide db-cat-guide-branch"
				:style="{ left: (node.level * 20 + 10) + 'px' }"></view>
			<!-- 子行接到父级竖线的短横线 -->
			<view v-if="node.level > 0" class="db-cat-elbow"
				:style="{ left: ((node.level - 1) * 20 + 10) + 'px' }"></view>
			<view class="db-cat-main">
				<view class="db-cat-head">
					<!-- 有子级：可折叠圆钮（父级实心、子级空心）；叶子：同尺寸灰点占位 -->
					<view v-if="node.hasChildren" class="db-cat-toggle"
						:class="node.level > 0 ? 'db-cat-toggle-child' : 'db-cat-toggle-parent'"
						@click.stop="$emit('toggle', node)">
						<view class="db-cat-chevron" :class="{ 'db-cat-chevron-up': node.collapsed }"></view>
					</view>
					<view v-else class="db-cat-leaf-dot">
						<view class="db-cat-leaf-dot-inner"></view>
					</view>
					<view class="db-cat-name" :class="{ 'db-cat-name-bold': nameBold }">{{ node.name }}</view>
				</view>
				<!-- 首页档：名称行下面再挂一行 5 段进度；错题本/收藏是单行版，不渲染这一段 -->
				<view v-if="showProgress" class="db-cat-progress">
					<view class="db-cat-segs">
						<view class="db-cat-seg" v-for="i in 5" :key="i">
							<view class="db-cat-seg-fill" :style="{ width: node.seg_widths[i - 1] }"></view>
						</view>
					</view>
					<text class="db-cat-count">{{ node.answered_count || 0 }}/{{ node.question_count || 0 }}</text>
				</view>
			</view>
			<!-- 右侧那一格按页适配：首页「做题/继续」，错题本/收藏「N题 ›」（插槽由页面提供） -->
			<view class="db-cat-right">
				<slot name="right" :node="node"></slot>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * 刷题本目录层级树（首页 / 错题本 / 收藏共用）
 *
 * 行数据来自 `common/utils/drill-book-catalog.js` 的 `buildCatalogRows`；本组件只负责
 * 缩进、导引线、折叠圆钮与名称这一套版式，右侧那一格走 `right` 插槽由页面自己摆。
 *
 * 几何口径（2026-11-22 用户点名「竖线插进圆钮」后固定，两个变体都从圆钮**下沿**起画）：
 *   两行版（首页，show-progress）：行上留白 12 + 名称行 22 内圆钮居中 1 + 圆钮 20 = 分支线起于 33px
 *   单行版（错题本/收藏）：行最小高 52 + 上下留白 10 → 内容区 32，圆钮居中起于 16、止于 36，
 *                          分支线起于 36px（早前抄的 26px 正好落在圆钮中间，所以插进去了）
 */
export default {
	name: 'drill-catalog',
	props: {
		/** 可见行（buildCatalogRows 的返回值） */
		rows: {
			type: Array,
			default: () => [],
		},
		/** 是否在名称行下面挂分段进度行（首页档）；错题本/收藏为单行版，保持 false */
		showProgress: {
			type: Boolean,
			default: false,
		},
		/** 名称行是否加粗（错题本/收藏与「所有题目」汇总行同为 16px / 600；首页目录行保持常规字重） */
		nameBold: {
			type: Boolean,
			default: false,
		},
	},
};
</script>

<style scoped>
.db-cat-node {
	position: relative;
	padding: 12px 0;
	display: flex;
	align-items: center;
}
/* 单行版：行高与名称行同一档（52px），右侧只摆「N题 ›」 */
.db-cat-node-compact {
	min-height: 52px;
	padding: 10px 0;
	box-sizing: border-box;
}
/* 层级导引线：每条可见行按祖先层级画竖线；最后一条子级只画到圆钮中心（半截）。
   子行再用一段短横线接到父级那条竖线上，展开后能一眼看出归属 */
.db-cat-guide {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 2px;
	border-radius: 1px;
	background: #eef0f7;
}
.db-cat-guide-half {
	bottom: auto;
	height: 23px;
}
/* 分支竖线：从本行圆钮的**下沿**起画，不许盖进圆钮里（用户点名的现象）。
   两行版下沿 = 12 + 1 + 20 = 33；单行版下沿 = 10 + 6 + 20 = 36 */
.db-cat-guide-branch {
	top: 33px;
}
.db-cat-node-compact .db-cat-guide-half {
	height: 26px;
}
.db-cat-node-compact .db-cat-guide-branch {
	top: 36px;
}
.db-cat-elbow {
	position: absolute;
	top: 22px;
	width: 10px;
	height: 2px;
	background: #eef0f7;
}
.db-cat-node-compact .db-cat-elbow {
	top: 25px;
}
.db-cat-main {
	flex: 1;
	min-width: 0;
}
.db-cat-head {
	display: flex;
	align-items: center;
	min-height: 22px;
}
/* 折叠圆钮：20px，全站目录同一尺寸；折角箭头展开朝下、折叠朝上 */
.db-cat-toggle {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	margin-right: 8px;
	flex: 0 0 20px;
	box-sizing: border-box;
}
.db-cat-toggle-parent {
	background: #0968f6;
}
.db-cat-toggle-child {
	background: #fff;
	border: 1px solid #0968f6;
}
.db-cat-chevron {
	width: 7px;
	height: 7px;
	border-right: 1.5px solid #fff;
	border-bottom: 1.5px solid #fff;
	box-sizing: border-box;
	transform: translateY(-2px) rotate(45deg);
}
.db-cat-toggle-child .db-cat-chevron {
	border-color: #0968f6;
}
.db-cat-chevron-up {
	transform: translateY(2px) rotate(-135deg);
}
/* 叶子目录的占位点：与折叠钮同尺寸，保证名称对齐；不可点，也不暗示可折叠 */
.db-cat-leaf-dot {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	margin-right: 8px;
	flex: 0 0 20px;
}
.db-cat-leaf-dot-inner {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: #c9cdd4;
}
.db-cat-name {
	flex: 1;
	min-width: 0;
	font-size: 16px;
	line-height: 22px;
	color: #1d2129;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.db-cat-name-bold {
	font-weight: 600;
}
.db-cat-right {
	display: flex;
	align-items: center;
	flex: none;
}
/* 进度行：缩进到名称文字下面；5 段各代表 20% */
.db-cat-progress {
	display: flex;
	align-items: center;
	margin: 8px 0 0 28px;
}
.db-cat-segs {
	display: flex;
	flex: 1;
	max-width: 106px;
	min-width: 0;
	margin-right: 8px;
}
.db-cat-seg {
	flex: 1;
	height: 7px;
	border-radius: 2px;
	background: #dbe8fe;
	overflow: hidden;
}
.db-cat-seg + .db-cat-seg {
	margin-left: 4px;
}
.db-cat-seg-fill {
	height: 100%;
	border-radius: 2px;
	background: #0968f6;
}
.db-cat-count {
	font-size: 12px;
	color: #86909c;
	flex: none;
}
</style>
