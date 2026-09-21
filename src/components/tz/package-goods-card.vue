<template>
	<view class="pkg-goods-card" :class="{ 'pkg-goods-square': !round }" @tap="onCardTap">
		<image class="pkg-goods-cover" :src="coverSrc" mode="aspectFill" @error="coverError = true" />
		<view class="pkg-goods-info">
			<view class="pkg-goods-name">{{ name || '-' }}</view>
			<view class="pkg-goods-sku" v-if="skuName">已选：{{ skuName }}</view>
			<view class="pkg-goods-price">
				<view class="pkg-goods-price-main">
					<text class="rmb">¥</text><text class="num">{{ price || 0 }}</text>
					<text class="lessons" v-if="lessons">/ {{ lessons }}课时</text>
				</view>
				<text class="pkg-goods-valid" v-if="validText">{{ validText }}</text>
			</view>
		</view>
		<view class="pkg-goods-arrow" v-if="arrow">
			<tz-icon name="enter" color="#86909C" :size="13" />
		</view>
	</view>
</template>

<script>
export default {
	name: 'PackageGoodsCard',
	props: {
		// 封面（空或加载失败时兜底默认商品图）
		cover: {
			type: String,
			default: ''
		},
		// 套餐名称
		name: {
			type: String,
			default: ''
		},
		// 已选规格名（空时整行不展示）
		skuName: {
			type: String,
			default: ''
		},
		price: {
			type: [Number, String],
			default: 0
		},
		// 课时数（0/空时不展示课时）
		lessons: {
			type: [Number, String],
			default: 0
		},
		// 有效期文案（确认页按 valid_type 计算，订单详情按接口 valid_text 下发）
		validText: {
			type: String,
			default: ''
		},
		// 右侧跳转箭头（可点击跳转时展示）
		arrow: {
			type: Boolean,
			default: false
		},
		// 圆角卡（默认）；整页流程页（确认报名）走通栏口径时传 false
		round: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			coverError: false,
			defaultCover: '/static/image/default-goods.jpg'
		};
	},
	computed: {
		coverSrc() {
			return (!this.coverError && this.cover) || this.defaultCover;
		}
	},
	watch: {
		cover() {
			this.coverError = false;
		}
	},
	methods: {
		onCardTap() {
			this.$emit('card-click');
		}
	}
};
</script>

<style scoped>
/* 套餐商品卡（确认报名页与订单详情报名信息弹窗共用）；外边距由使用方控制 */
.pkg-goods-card {
	display: flex;
	align-items: center;
	background: #fff;
	border-radius: 10px;
	padding: 14px 16px;
}

/* 通栏口径（确认报名页）：与同页 cell 卡一致，不做圆角 */
.pkg-goods-card.pkg-goods-square {
	border-radius: 0;
}

.pkg-goods-cover {
	width: 90px;
	height: 90px;
	flex-shrink: 0;
	border-radius: 8px;
	background: #e5e6eb;
}

.pkg-goods-info {
	flex: 1;
	min-width: 0;
	margin-left: 12px;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.pkg-goods-name {
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	line-height: 22px;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.pkg-goods-sku {
	margin-top: 6px;
	font-size: 13px;
	color: #4e5969;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.pkg-goods-price {
	margin-top: 8px;
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	color: #f53f3f;
}

.pkg-goods-price-main {
	display: flex;
	align-items: baseline;
	min-width: 0;
}

.pkg-goods-price .rmb {
	font-size: 13px;
	font-weight: 700;
	margin-right: 1px;
}

.pkg-goods-price .num {
	font-size: 22px;
	font-weight: 700;
}

.pkg-goods-price .lessons {
	margin-left: 6px;
	font-size: 12px;
	color: #86909c;
}

.pkg-goods-valid {
	flex-shrink: 0;
	margin-left: 8px;
	font-size: 12px;
	color: #86909c;
}

.pkg-goods-arrow {
	flex-shrink: 0;
	margin-left: 8px;
}
</style>
