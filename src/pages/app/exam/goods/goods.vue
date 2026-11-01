<template>
	<div>
		<!-- 顶部只保留必需的两种标识：从分类页带 name 进来时给「当前分类名」；
		     无 group_id 时给一级分类页签。原来的「分类」入口与「全部练习」标题
		     与下方页签表达的是同一件事（2026-10-28 用户点名冗余，已去掉）。 -->
		<u-sticky :offsetTop="0" bgColor="#fff">
			<view class="top-bar" v-if="pageParams.name">
				<view class="top-bar-title">{{ pageParams.name }}</view>
			</view>
			<u-tabs v-if="!pageParams.group_id" :list="tabsList" @click="tabsHandle"></u-tabs>
		</u-sticky>

		<view class="container">
			<tz-course :round="true" :border="false" :list="list" v-if="list.length > 0"></tz-course>
			<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="list.length == 0 && !loading" />
		</view>

		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
	@import "./css.css";
</style>
