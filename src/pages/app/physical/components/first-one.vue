<template>
	<view class="tz-flex-col">
		<view class="goods-box" v-for="item in pagination.data" :key="item.id" @tap="goDetail(item.id)">
			<image class="goods-image" :src="item.cover" mode="aspectFill" />
			<view class="goods-info">
				<view class="goods-title">{{ item.name }}</view>
				<view class="goods-price">{{ item.price }}</view>
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
		goDetail(id) {
			uni.navigateTo({
				url: `/pages/app/physical/detail/detail?id=${id}`,
			});
		}
	}
}
</script>

<style>
.tz-flex-col {
	display: flex;
	flex-direction: column;
}

.goods-box {
	width: 100%;
	padding: 5px 10px;
}

.goods-box .goods-image {
	width: 100%;
	height: 170px;
	border-radius: 5px;
}

.goods-box .goods-info {
	padding: 5px 0;
}

.goods-box .goods-info .goods-title {
	font-size: 13px;
	color: #333;
	line-height: 18px;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	margin-bottom: 5px;
}

.goods-box .goods-info .goods-price {
	font-size: 16px;
	color: #ff3000;
	font-weight: bold;
}

.goods-box .goods-info .goods-price::before {
	content: '￥';
	font-size: 12px;
}
</style>
