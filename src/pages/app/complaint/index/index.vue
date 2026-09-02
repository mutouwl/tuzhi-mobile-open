<template>
	<view class="complaint-page">
		<view class="complaint-title">{{ title }}</view>
		<view class="complaint-list">
			<t-cell
				v-for="item in list"
				:key="item.id"
				:title="item.title"
				:hover="true"
				:arrow="true"
				@click="selectItem(item)"
			>
				<template v-if="item.description" #description>{{ item.description }}</template>
			</t-cell>
		</view>
		<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="!loading && list.length == 0" />
		<tz-loading-page tip="加载中…" :loading="loading" />
	</view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
