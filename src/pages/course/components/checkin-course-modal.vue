<template>
	<u-popup :show="show" mode="bottom" :round="10" :closeable="true" :safeAreaInsetBottom="false" @close="close">
		<view class="course-checkin-popup">
			<view class="course-checkin-popup-title">打卡活动</view>
			<!-- 列表区高度走 tz-popup-list 的确定高度档（默认 60vh，M6：写 min/max 在小程序端会「下方空白滑不动」） -->
			<tz-popup-list padding="0 16px 12px" :refreshable="false" @lower="$emit('lower')">
				<block v-if="list.length">
					<!-- 条目卡复用打卡模块那一只（内部即课程列表卡的分隔线档），跳转落点由调用页按 is_member 决定；
					     末条传 last 收掉下沿发丝线——弹窗整片白底，末条下面留一根线会悬空 -->
					<tz-checkin-activity-card v-for="(item, index) in list" :key="item.id" :item="item" :attr="attr"
						:last="index === list.length - 1" @open="$emit('open', item)" />
					<u-loadmore :status="loadStatus" v-if="loadStatus !== 'nomore'"></u-loadmore>
				</block>
				<u-empty v-else icon="/static/image/empty.png" width="70" height="70" text="暂无打卡活动" />
			</tz-popup-list>
		</view>
	</u-popup>
</template>

<script>
/**
 * 课程详情页底栏「打卡」弹窗：列出这门课（或其所属专栏）关联的打卡活动
 *
 * 组件不自己发请求——底栏那枚按钮要不要出，取决于「有没有关联活动」，这个事实由课程详情页
 * 一次取到后同时喂给按钮和本弹窗（取两次就会出现「按钮出了、列表是空的」）。
 * 版式参照教务套餐的校区选择弹窗（pages/app/school/package/components/campus-select-popup.vue）：
 * 组件是 isolated 的、App.vue 的 .school-popup 全局档进不来，故内衬与安全区按同一口径在本组件里写死一份。
 */
export default {
	name: 'CheckinCourseModal',
	props: {
		show: { type: Boolean, default: false },
		// 接口下发的活动行（原样传入，卡片按 is_member 自己分流）
		list: { type: Array, default: function () { return []; } },
		// 枚举文案（join_type / run_state / checkin_mode），前端不写死
		attr: { type: Object, default: function () { return {}; } },
		// 上拉加载状态（nomore 时不再出提示）
		loadStatus: { type: String, default: 'loadmore' },
	},
	emits: ['close', 'lower', 'open'],
	methods: {
		close() {
			this.$emit('close');
		},
	},
};
</script>

<style scoped>
.course-checkin-popup {
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	/* 底部安全区由弹层自身承担（模板已关 u-popup 的 safeAreaInsetBottom），微信端按教务口径减半 */
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}

.course-checkin-popup-title {
	padding: 15px 16px 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}
</style>
