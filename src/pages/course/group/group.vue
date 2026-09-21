<template>
	<div>
		<u-sticky :offsetTop="0" bgColor="#fff">
			<!-- <tz-box :style="showTabs ? 'padding:6px 10px 0px' : 'padding:6px 10px 6px'"></tz-box> -->
			<div class="search-box" :style="showTabs ? 'padding:6px 10px 0px' : 'padding:6px 10px 6px'">
				<tz-search inputBgColor="#f5f5f5"></tz-search>
			</div>
			<u-tabs v-if="showTabs" :list="tabsList" @click="tabsHandle"></u-tabs>
		</u-sticky>
		<view class="container">
			<tz-course :round="true" :border="false" :list="list" v-if="list.length > 0 "></tz-course>

			<u-empty icon="/static/image/empty.png" width="70" height="70"  v-if="list.length == 0 && !loading"/>

			<!-- 上拉加载动画 -->
			<view class="load-more-box" v-if="loading">
				<u-loading-icon mode="circle" size="20"></u-loading-icon>
				<text class="load-more-text">加载中...</text>
			</view>
		</view> 

		<tz-tab-bar />

		<tz-footer/>
	</div>
</template>

<script src="./js.vue">
 
</script>

<style lang="scss">
@import "./css.css";
</style>