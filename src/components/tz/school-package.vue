<template>
	<!--
		教务-DIY 课程套餐组件（自定义页面用）
		卡片直接复用课程套餐列表组件 tz-package（点击进入套餐详情），本组件只做空数据隐藏，
		版式与「课程列表」页、套餐详情「可上课校区」等模块内套餐卡片完全一致。
	-->
	<view class="tz-school-package" v-if="list && list.length">
		<tz-package :list="list" :type="type" :border="border" :round="round" :margin="margin" />
	</view>
</template>

<script>
export default {
	name: 'TzSchoolPackage',
	props: {
		// 套餐列表（装修端取数：手动选择指定套餐 / 最新上架套餐）
		list: {
			type: Array,
			default: () => []
		},
		// 单列 single / 双列 diallel
		type: {
			type: String,
			default: 'single'
		},
		// 边框、圆角（1 显示 0 隐藏）
		border: {
			type: [Boolean, Number],
			default: 0
		},
		round: {
			type: [Boolean, Number],
			default: 1
		},
		// 卡片间距
		margin: {
			type: Number,
			default: 10
		}
	}
};
</script>

<style scoped>
.tz-school-package {
	width: 100%;
}
</style>
