<template>
	<view class="school-page">
		<!-- 列表容器与条目卡与「我的打卡 / 可参与的打卡」同一档：.school-cards--divided +
		     tz-checkin-activity-card（卡内直接复用课程卡的分隔线档），本页不另抄版式 -->
		<view class="school-cards school-cards--divided">
			<!-- 首屏骨架：由卡片组件的 loading 态渲染，与真实卡逐块对齐；上拉翻页保留已加载列表 -->
			<block v-if="!loaded">
				<tz-checkin-activity-card v-for="i in 3" :key="i" :loading="true" />
			</block>
			<block v-else>
				<tz-checkin-activity-card
					v-for="item in list"
					:key="item.id"
					:item="item"
					:attr="attr"
					@open="goActivity"
				/>
				<u-empty
					icon="/static/image/empty.png"
					width="70"
					height="70"
					v-if="!list.length"
					:text="loadMsg || '暂无打卡'"
				/>
				<u-loadmore v-if="list.length && loadStatus !== 'nomore'" :status="loadStatus"></u-loadmore>
			</block>
		</view>

		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
