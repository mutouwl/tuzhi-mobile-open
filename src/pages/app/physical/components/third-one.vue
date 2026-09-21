<template>
	<view v-if="data && data.children && data.children.length">
		<view v-for="secondItem in data.children" :key="secondItem.id">
			<!-- 二级分类作为标题 -->
			<view class="title-box tz-flex tz-col-center tz-row-between tz-p-b-30">
				<view class="title-text">{{ secondItem.name }}</view>
				<button class="tz-reset-button more-btn" @tap="goList(secondItem.id)">
					查看更多
					<tz-icon name="enter" :size="16" />
				</button>
			</view>
			<!-- 三级分类作为item -->
			<view class="goods-item-box tz-flex tz-flex-wrap tz-p-b-20" v-if="secondItem.children && secondItem.children.length">
				<view class="goods-item" v-for="thirdItem in secondItem.children" :key="thirdItem.id" @tap="goList(thirdItem.id)">
					<image class="goods-img" :src="thirdItem.image" mode="aspectFill"></image>
					<view class="tz-p-10">
						<view class="goods-title tz-line-1">{{ thirdItem.name }}</view>
					</view>
				</view>
			</view>
			<!-- 二级分类没有三级分类时的空状态 -->
			<view class="empty-subcategory" v-else>
				<u-empty icon="/static/image/empty.png" width="50" height="50" text="暂无子分类"></u-empty>
			</view>
		</view>
	</view>
	<!-- 一级分类没有二级分类时的空状态 -->
	<view class="empty-category" v-else-if="data && (!data.children || !data.children.length)">
		<u-empty icon="/static/image/empty.png" width="70" height="70" text="暂无分类"></u-empty>
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

.tz-row-between {
	justify-content: space-between;
}

.tz-p-b-30 {
	padding-bottom: 15px;
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

.tz-reset-button {
	background: none;
	border: none;
	padding: 0;
	margin: 0;
}

.tz-reset-button::after {
	border: none;
}

.title-box .title-text {
	font-size: 14px;
	font-weight: bold;
	color: #333333;
}

.title-box .more-btn {
	font-size: 13px;
	font-weight: 400;
	color: #999999;
}

.title-box .more-btn .cicon-forward {
	font-size: 12px;
}

.goods-item {
	width: calc((100% - 20px) / 3);
	margin-right: 10px;
	margin-bottom: 10px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.goods-item:nth-child(3n) {
	margin-right: 0;
}

.goods-item .goods-img {
	width: 60px;
	height: 60px;
	border-radius: 5px;
	background-color: #f5f5f5;
}

.goods-item .goods-title {
	font-size: 12px;
	color: #333;
	text-align: center;
	margin-top: 5px;
}

.empty-category {
	padding: 30px 0;
}

.empty-subcategory {
	padding: 8px 0;
}
</style>
