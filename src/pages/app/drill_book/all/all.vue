<template>
	<div class="container db-list">
		<!-- 吸顶搜索栏（与「我的刷题本」同一档）：带里只放搜索框本身 -->
		<u-sticky bgColor="#fff" :offsetTop="0">
			<view class="db-list-search">
				<u-search v-model="keyword" placeholder="搜索刷题本" :showAction="false" bgColor="#f7f8fa" shape="square"
					@search="refresh" @clear="refresh" />
			</view>
		</u-sticky>

		<!-- 列表卡走全站紧凑商品卡 tz-course-mini，与「我的刷题本」同一份映射
		     （common/utils/drill-book-card.js）。本页只换取数口径：全部上架刷题本，
		     不按订阅/购买过滤；点卡去处由组件内部按 type='drill_book' 走 router.js。 -->
		<tz-box bgColor="none" padding="10 12">
			<tz-course-mini :list="cardRows" :round="true" :border="false" :skeleton="skeletonLoading"
				:skeleton-count="4" />
			<u-empty v-if="!cardRows.length && !skeletonLoading" icon="/static/image/empty.png" width="70"
				height="70" :text="keyword ? '没有匹配的刷题本' : '暂无刷题本'" margin-top="60" />
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
