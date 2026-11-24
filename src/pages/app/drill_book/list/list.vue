<template>
	<div class="container db-list">
		<!-- 吸顶搜索栏（M5）：带里只放搜索框本身 -->
		<u-sticky bgColor="#fff" :offsetTop="0">
			<view class="db-list-search">
				<u-search v-model="keyword" placeholder="搜索刷题本" :showAction="false" bgColor="#f7f8fa" shape="square"
					@search="refresh" @clear="refresh" />
			</view>
		</u-sticky>

		<!-- 列表卡走全站紧凑商品卡 tz-course-mini（Course-item-mini）：封面与加载失败兜底、
		     型别标签、价格位、骨架档全在组件里，页面不再自绘一份卡片。
		     点卡去处由组件内部按 type='drill_book' 走 $nav.getPagePath（router.js 的 drill_book 档
		     ＝刷题本首页），页面不用再接 @click。
		     容器内衬显式传 12：与上面吸顶搜索栏同一档，不另起一套左右留边。 -->
		<tz-box bgColor="none" padding="10 12">
			<tz-course-mini :list="cardRows" :round="true" :border="false" :skeleton="skeletonLoading"
				:skeleton-count="4" />
			<u-empty v-if="!cardRows.length && !skeletonLoading" icon="/static/image/empty.png" width="70"
				height="70" :text="keyword ? '没有匹配的刷题本' : '暂无可用刷题本'" margin-top="60" />
			<view class="db-loadmore" v-if="cardRows.length && loadStatus !== 'nomore'">
				<u-loadmore :status="loadStatus" />
			</view>
		</tz-box>
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
