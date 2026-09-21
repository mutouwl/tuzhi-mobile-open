<template>
	<view>
		<view class="tz-flex flex-wrap">
			<view class="goods-box" v-for="item in pagination.data" :key="item.id" @tap="goDetail(item.id)">
				<view class="goods-img">
					<image class="goods-img" :src="item.cover" mode="aspectFit"></image>
				</view>
				<view class="goods-content">
					<view class="goods-title tz-line-1 tz-m-b-28">{{ item.name }}</view>
					<view class="goods-price">{{ item.price }}</view>
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
		goDetail(id) {
			uni.navigateTo({
				url: `/pages/app/physical/detail/detail?id=${id}`,
			});
		}
	}
}
</script>

<style>
.tz-flex {
	display: flex;
}

.flex-wrap {
	flex-wrap: wrap;
}

.goods-box {
	width: calc((100% - 10px) / 2);
	margin-bottom: 10px;
}

.goods-box .goods-img {
	width: 100%;
	height: 123px;
	border-radius: 5px 5px 0px 0px;
}

.goods-box .goods-content {
	width: 100%;
	background: #ffffff;
	box-shadow: 0px 0px 10px 2px rgba(199, 199, 199, 0.22);
	padding: 10px 0 16px 8px;
	box-sizing: border-box;
	border-radius: 0 0 5px 5px;
}

.goods-box .goods-content .goods-title {
	font-size: 13px;
	font-weight: bold;
	color: #333333;
}

.goods-box .goods-content .goods-price {
	font-size: 12px;
	font-family: OPPOSANS;
	font-weight: 500;
	color: #e1212b;
}

.goods-box:nth-child(2n + 1) {
	margin-right: 10px;
}

.tz-line-1 {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.tz-m-b-28 {
	margin-bottom: 14px;
}
</style>
