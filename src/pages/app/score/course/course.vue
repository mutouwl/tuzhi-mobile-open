<template>
	<view class="task-course-page">
		<view class="container">
			<!-- 首屏骨架（M16）：灰卡由课程卡自己的骨架档出，与真实卡同一只组件；上拉翻页保留旧列表不闪 -->
			<tz-course
				:round="true"
				:border="false"
				:skeleton="true"
				:skeleton-count="4"
				v-if="!loaded"
			></tz-course>
			<template v-else>
				<tz-course :round="true" :border="false" :list="list" v-if="list.length > 0"></tz-course>
				<view class="tc-loadmore" v-if="list.length && loadStatus !== 'nomore'">
					<u-loadmore :status="loadStatus" />
				</view>
				<u-empty
					v-if="!list.length"
					icon="/static/image/empty.png"
					width="70"
					height="70"
					:text="loadMsg || '暂无课程'"
				></u-empty>
			</template>
		</view>

		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style lang="scss" scoped>
@import "./css.css";
</style>
