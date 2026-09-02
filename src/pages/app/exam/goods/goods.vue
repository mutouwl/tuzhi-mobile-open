<template>
	<div>
		<u-sticky :offsetTop="0" bgColor="#fff">
			<view class="top-bar">
				<view class="category-entry" @tap="goCategory">
					<text class="category-entry-text">分类</text>
					<tz-icon name="list" :size="14" color="#0968f6"></tz-icon>
				</view>
				<view class="top-bar-title" v-if="pageParams.name">{{ pageParams.name }}</view>
				<view class="top-bar-title" v-else-if="!pageParams.group_id">全部练习</view>
			</view>
			<u-tabs v-if="!pageParams.group_id" :list="tabsList" @click="tabsHandle"></u-tabs>
		</u-sticky>

		<view class="container">
			<tz-course :round="true" :border="false" :list="list" v-if="list.length > 0"></tz-course>
			<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="list.length == 0" />
		</view>

		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
	@import "./css.css";
</style>