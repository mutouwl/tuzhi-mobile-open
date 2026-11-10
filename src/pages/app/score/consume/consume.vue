<template>
	<view class="consume-page">
		<view class="consume-tip" v-if="loaded && list.length">购买以下商品可按积分规则获得积分</view>

		<!-- 首屏骨架（M16）：占位块逐块对齐真实商品卡（140 封面 + 两行标题 + 底部价格），
		     翻页追加不闪骨架 -->
		<view class="consume-list consume-sk" v-if="!loaded">
			<view class="consume-item" v-for="i in 4" :key="i">
				<view class="consume-item-cover consume-sk-block"></view>
				<view class="consume-item-info">
					<view class="consume-sk-line consume-sk-block sk-h-14 sk-w-100"></view>
					<view class="consume-sk-line consume-sk-block sk-h-14 sk-w-75"></view>
					<view class="consume-item-footer">
						<view class="consume-sk-line consume-sk-block sk-h-16 sk-w-30"></view>
					</view>
				</view>
			</view>
		</view>

		<view class="consume-list" v-else-if="list.length > 0">
			<view class="consume-item" v-for="item in list" :key="item.rowKey" @click="openItem(item)">
				<view class="consume-item-cover">
					<image class="consume-item-cover-img" :src="coverOf(item)" mode="scaleToFill" @error="onCoverError(item)" />
					<view class="consume-item-type" v-if="item.type_label">
						<text>{{ item.type_label }}</text>
					</view>
				</view>
				<view class="consume-item-info">
					<view class="consume-item-title two-line-hidden">{{ item.name }}</view>
					<view class="consume-item-footer">
						<text class="consume-item-price" :class="{ 'is-free': !(parseFloat(item.price) > 0) }">{{ priceText(item) }}</text>
					</view>
				</view>
			</view>
			<view class="consume-loadmore" v-if="loadStatus !== 'nomore'">
				<u-loadmore :status="loadStatus" />
			</view>
		</view>

		<u-empty
			v-else
			icon="/static/image/empty.png"
			width="70"
			height="70"
			:text="loadMsg || '暂无商品'"
		></u-empty>

		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style lang="scss" scoped>
@import "./css.css";
</style>
