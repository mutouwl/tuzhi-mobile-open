<template>
	<div>
		<u-sticky :offsetTop="0" bgColor="#fff">
			<!-- 搜索栏与页签留在骨架屏之外（M16）：首屏取数时依然可见可点 -->
			<div class="search-box" :style="showTabs ? 'padding:6px 10px 0px' : 'padding:6px 10px 6px'">
				<tz-search inputBgColor="#f5f5f5"></tz-search>
			</div>
			<u-tabs v-if="showTabs" :list="tabsList" @click="tabsHandle"></u-tabs>
		</u-sticky>
		<view class="container">
			<!-- 首屏骨架屏（替代整页转圈）：卡套在真实卡同一只组件里出灰块，尺寸由 tz-course 给一份；
			     判据 loading && !list.length —— 上拉翻页时旧列表先留着，由下方 u-loadmore 给反馈，不闪骨架 -->
			<tz-course :round="true" :border="false" :skeleton="true" :skeleton-count="4" v-if="loading && !list.length"></tz-course>
			<template v-else>
				<tz-course :round="true" :border="false" :list="list" v-if="list.length > 0"></tz-course>

				<view class="gl-loadmore" v-if="list.length && loadStatus !== 'nomore'">
					<u-loadmore :status="loadStatus" />
				</view>

				<u-empty v-if="!list.length" icon="/static/image/empty.png" width="70" height="70" :text="loadFailed ? '加载失败，请下拉重试' : '暂无课程'"></u-empty>
			</template>
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
