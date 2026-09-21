<template>
	<!--
		教务-课程列表卡片（模块共用）
		左侧正方形封面（缺封面/加载失败走默认商品图）+ 右侧标题（标题右侧类型标签、下方简介）。
		使用方：课时余额页「选择课程」弹窗（selectable 单选）、套餐规格弹窗「套餐包含课程」（行尾显示课时）。
		列表字段：[{ id, name, cover, intro, type_text, is_one_to_one, lessons? }]，首项「全部课程」(id=0) 是聚合项、只渲染名称。
	-->
	<view class="tz-school-course" v-if="list && list.length">
		<!-- 行高由内容撑开：课程行是封面（coverSize）+ 上下内衬，无封面的聚合项（「全部课程」）只剩名称一行，
		     按纯文字行的档位自然收拢，不再跟着封面撑高 -->
		<view
			class="tz-school-course-item"
			v-for="c in list"
			:key="c.id"
			@tap="onTap(c)"
		>
			<image
				class="tz-school-course-cover"
				v-if="isCourse(c)"
				:style="{ width: coverSize, height: coverSize }"
				:src="showCover(c) ? c.cover : defaultCover"
				mode="aspectFill"
				@error="onCoverError(c)"
			/>
			<view class="tz-school-course-info">
				<view class="tz-school-course-head">
					<text class="tz-school-course-name" :class="{ on: selectable && value == c.id }">{{ c.name }}</text>
					<!-- 类型标签：文案由后端下发（一对多 / 一对一），配色按 is_one_to_one 分档，与 web 端课程类型标签同档 -->
					<text class="tz-school-course-type" :class="{ one: c.is_one_to_one == 1 }" v-if="c.type_text">{{ c.type_text }}</text>
				</view>
				<view class="tz-school-course-intro" v-if="c.intro">{{ c.intro }}</view>
			</view>
			<text class="tz-school-course-lessons" v-if="c.lessons > 0">{{ c.lessons }}课时</text>
			<view class="tz-school-course-radio" :class="{ on: value == c.id }" v-if="selectable" />
		</view>
	</view>
</template>

<script>
export default {
	name: 'TzSchoolCourse',
	props: {
		// 课程列表（字段见模板注释；cover/intro/type_text 由接口下发，缺失即不占行）
		list: {
			type: Array,
			default: () => []
		},
		// 封面边长（固定正方形；选择课程弹窗 60px，需要更小的场景自行传入）
		coverSize: {
			type: String,
			default: '60px'
		},
		// 选择场景：卡片右侧展示单选框（如选择课程弹窗）
		selectable: {
			type: Boolean,
			default: false
		},
		// 当前选中项 id（selectable 时生效，选中项标题转主色）
		value: {
			type: [Number, String],
			default: 0
		}
	},
	data() {
		return {
			// 封面加载失败记录（按封面地址记录，不用数组下标：列表刷新后下标会串到别的课程上）
			coverErrors: {},
			// 封面缺失或加载失败的兜底图（与套餐卡、校区卡同一张默认商品图）
			defaultCover: '/static/image/default-goods.jpg'
		};
	},
	watch: {
		// 列表换数据（重新拉取、换规格）时重置失败记录，重新尝试加载
		list() {
			this.coverErrors = {};
		}
	},
	methods: {
		// 聚合项（「全部课程」id=0）没有课程实体：不渲染封面，也就不会铺一张误导人的默认图
		isCourse(c) {
			return parseInt(c.id, 10) > 0;
		},
		showCover(c) {
			return !!c.cover && !this.coverErrors[c.cover];
		},
		onCoverError(c) {
			if (c.cover) {
				this.$set(this.coverErrors, c.cover, true);
			}
		},
		onTap(c) {
			this.$emit('click', c);
		}
	}
};
</script>

<style scoped>
/* 行版式取本模块选择弹窗口径：白底 + 相邻行 1px `#f2f3f5` 分隔（末行无线），不额外做卡片描边。
   行高全部由内容撑开（课程行=封面边长、聚合行=名称行高），行上没有 min-height，
   因此也不受 App.vue `* { box-sizing: border-box }` 影响 */
.tz-school-course-item {
	display: flex;
	align-items: center;
	padding: 12px 0;
}

.tz-school-course-item + .tz-school-course-item {
	border-top: 1px solid #f2f3f5;
}

.tz-school-course-cover {
	flex-shrink: 0;
	border-radius: 6px;
	background: #f7f8fa;
}

.tz-school-course-info {
	flex: 1;
	min-width: 0;
	margin-left: 10px;
}

.tz-school-course-head {
	display: flex;
	align-items: center;
}

/* 标题不占满整行（不用 flex:1）：宽度随文字，超长才收缩省略，
   这样类型标签始终紧跟在标题右侧，而不是被推到行末与标题之间空一大段 */
.tz-school-course-name {
	min-width: 0;
	font-size: 14px;
	color: #1d2129;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* 选中项名称转主色（与模块其余选择弹窗一致） */
.tz-school-course-name.on {
	color: #0968f6;
}

/* 类型标签（紧跟标题右侧）：一对多取灰（同套餐卡「已下架」标），一对一转主色蓝（同套餐列表 tags） */
.tz-school-course-type {
	flex-shrink: 0;
	margin-left: 6px;
	padding: 1px 6px;
	font-size: 11px;
	line-height: 16px;
	color: #86909c;
	background: #f2f3f5;
	border-radius: 3px;
}

.tz-school-course-type.one {
	color: #0968f6;
	background: #e8f4ff;
}

/* 简介（标题下方辅助文案）：单行截断，字号颜色同套餐/续费弹窗的 meta 行 */
.tz-school-course-intro {
	margin-top: 4px;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.tz-school-course-lessons {
	flex-shrink: 0;
	margin-left: 8px;
	font-size: 12px;
	color: #86909c;
}

.tz-school-course-radio {
	width: 18px;
	height: 18px;
	flex-shrink: 0;
	margin-left: 8px;
	border: 2px solid #c9cdd4;
	border-radius: 50%;
	box-sizing: border-box;
}

.tz-school-course-radio.on {
	border-color: #0968f6;
	background: #0968f6;
	box-shadow: inset 0 0 0 4px #fff;
}
</style>
