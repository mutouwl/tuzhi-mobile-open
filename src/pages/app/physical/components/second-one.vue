<template>
	<view>
		<view class="title-box tz-flex tz-col-center tz-row-center tz-p-b-30">
			<view class="title-line-left"></view>
			<view class="title-text tz-p-x-20">{{ data.children[activeMenu].name }}</view>
			<view class="title-line-right"></view>
		</view>
		<view class="goods-item-box tz-flex tz-flex-wrap tz-p-b-20">
			<view
				class="goods-item"
				v-for="item in data.children[activeMenu].children"
				:key="item.id"
				@tap="goList(item.id)"
			>
				<image class="goods-img" :src="item.image" mode="aspectFill"></image>
				<view class="tz-p-10">
					<view class="goods-title tz-line-1">{{ item.name }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
var that;

export default {
	props: {
		data: {
			type: Object,
			default: () => ({}),
		},
		activeMenu: [Number, String],
		pagination: Object,
	},
	methods: {
		goList(id) {
			uni.navigateTo({
				url: `/pages/app/physical/list/list?categoryId=${id}`,
			});
		}
	}
}
</script>

<style>
.tz-flex {
	display: flex;
}

.tz-col-center {
	align-items: center;
}

.tz-row-center {
	justify-content: center;
}

.tz-p-b-30 {
	padding-bottom: 15px;
}

.tz-p-x-20 {
	padding-left: 10px;
	padding-right: 10px;
}

.tz-flex-wrap {
	flex-wrap: wrap;
}

.tz-p-b-20 {
	padding-bottom: 10px;
}

.tz-p-10 {
	padding: 5px;
}

.title-box .title-line-left,
.title-box .title-line-right {
	width: 7.5px;
	height: 1px;
	background: #d2d2d2;
}

.title-box .title-text {
	font-size: 14px;
	font-weight: bold;
	color: #333;
}

.goods-item {
	width: calc((100% - 10px) / 3);
	margin-right: 5px;
	margin-bottom: 5px;
}

.goods-item:nth-of-type(3n) {
	margin-right: 0;
}

.goods-item .goods-img {
	width: 100px;
	height: 100px;
	border-radius: 8px;
}

.goods-item .goods-title {
	font-size: 13px;
	font-weight: bold;
	color: #333333;
	line-height: 20px;
	text-align: center;
}

.tz-line-1 {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
