<template>
	<view class="container">
		<u-sticky :offsetTop="0" bgColor="#fff">
			<u-tabs :list="tabs" @click="tabsChange"></u-tabs>
		</u-sticky>

		<tz-box bgColor="none">
			<!-- 收藏课程列表走全站紧凑横排卡 `tz-course-mini`（封面 140×80、标题两行截断）；
			     骨架档由组件自己出，不再用整张大课卡 `tz-course`（2026-11-23 用户点名） -->
			<tz-course-mini :skeleton="loading && list.length === 0" :skeleton-count="4" :list="list"
				:round="true" :border="false" />
			<u-empty mode="favor" v-if="list.length == 0 && !loading" />
		</tz-box>

		<tz-footer/>
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
