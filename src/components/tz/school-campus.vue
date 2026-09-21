<template>
	<!--
		教务-DIY 校区组件（自定义页面用）
		卡片直接复用校区列表组件 tz-campus（点击进入校区详情），本组件只做空数据隐藏，
		版式与「校区列表」页、套餐详情「可上课校区」等模块内校区卡片完全一致。
	-->
	<view class="tz-school-campus" v-if="list && list.length">
		<tz-campus :list="list" :round="round" :margin="margin" @click="goDetail" />
	</view>
</template>

<script>
export default {
	name: 'TzSchoolCampus',
	props: {
		// 校区列表（装修端取数：手动选择指定校区 / 最新启用校区）
		list: {
			type: Array,
			default: () => []
		},
		// 卡片圆角（1 显示 0 隐藏）
		round: {
			type: [Boolean, Number],
			default: 1
		},
		// 卡片间距
		margin: {
			type: Number,
			default: 10
		}
	},
	methods: {
		// 与校区列表页同一跳转口径
		goDetail(c) {
			if (!c || !c.id) return;
			this.$nav.to('/pages/app/school/campus/detail/detail?id=' + c.id);
		}
	}
};
</script>

<style scoped>
.tz-school-campus {
	width: 100%;
}
</style>
