<template>
	<u-popup
		:show="show"
		mode="bottom"
		:round="10"
		:closeable="true"
		:safeAreaInsetBottom="false"
		:zIndex="zIndex"
		:overlayStyle="overlayStyle"
		@close="close"
	>
		<view class="course-popup">
			<view class="course-popup-title">{{ title }}</view>
			<!-- 高度与同模块的选择校区弹窗同档（组件默认的确定高度 60vh）：门数少时下方留白，
			     但整块都是可拖动/可滚动的活动区，不会塌成一小条 -->
			<tz-popup-list padding="0 16px" :refreshable="false">
				<!-- 课程行与套餐规格弹窗「套餐包含课程」共用 tz-school-course（封面 + 类型标签 + 简介），此处只加单选标识 -->
				<tz-school-course :list="list" selectable :value="value" @click="pickOption" />
				<u-empty
					v-if="!list.length"
					icon="/static/image/empty.png"
					width="70"
					height="70"
					:text="emptyText"
				/>
			</tz-popup-list>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'CourseSelectPopup',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		// 弹层标题，如「选择课程」
		title: {
			type: String,
			default: '选择课程'
		},
		// 课程选项列表：[{ id, name, cover, intro, type_text }]，首项「全部课程」只有 id/name
		list: {
			type: Array,
			default: () => []
		},
		// 当前选中项 id
		value: {
			type: [Number, String],
			default: 0
		},
		// 空列表提示文案
		emptyText: {
			type: String,
			default: '暂无可选课程'
		},
		// 弹层层级（u-popup 默认 10075）。嵌套在其它底部弹层内部打开时必须传更高值，
		// 否则与下层弹层同级、能否盖住取决于 DOM 顺序
		zIndex: {
			type: [Number, String],
			default: 10075
		},
		// 遮罩自定义样式（同上，嵌套时随 zIndex 一并抬高；默认沿用 u-overlay 自身层级）
		overlayStyle: {
			type: [Object, String],
			default: null
		}
	},
	methods: {
		// emit 顺序与 option-select-popup 一致（先写回 v-model 再上报），页面据此用 courseId watch 刷新
		pickOption(c) {
			this.$emit('input', c.id);
			this.$emit('select', c);
			this.close();
		},
		close() {
			this.$emit('close');
		}
	}
};
</script>

<style scoped>
.course-popup {
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	/* 底部安全区改由弹层自身承担（模板已关 u-popup 的 safeAreaInsetBottom），微信端按教务口径减半 */
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}

.course-popup-title {
	padding: 15px 16px 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}
</style>
