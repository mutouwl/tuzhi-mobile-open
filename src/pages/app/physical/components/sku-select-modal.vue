<template>
	<u-popup :show="show" @close="close" @open="open" mode="bottom" :closeable="true" :round="10" :safeAreaInsetBottom="true">
		<view class="sku-modal-content">
			<view class="sku-header">
				<image class="sku-image" :src="selectedSkuPrice.image || (goodsInfo && goodsInfo.cover)" mode="aspectFill" />
				<view class="sku-info">
					<view class="sku-price">
						<text class="price-symbol" v-if="!isVirtualPay">¥</text>
						<text class="price-num">{{ selectedSkuPrice.price || (goodsInfo && goodsInfo.price) || 0 }}</text>
						<text class="price-symbol" v-if="isVirtualPay">{{ $tools.systemConfig('coin_name') || '金币' }}</text>
					</view>
					<view class="sku-text">{{ getSkuText() }}</view>
				</view>
			</view>

			<scroll-view class="sku-body" scroll-y>
				<view class="sku-section" v-for="(sku, skuIndex) in (goodsInfo && goodsInfo.sku_tree || [])" :key="skuIndex">
					<view class="sku-section-title">{{ sku.name }}</view>
					<view class="sku-options">
						<view
							class="sku-option"
							v-for="(option, optIndex) in sku.children"
							:key="optIndex"
							:class="[{
								'sku-option-active': isOptionSelected(skuIndex, option),
								'sku-option-disabled': isOptionDisabled(skuIndex, option)
							}]"
							@tap="!isOptionDisabled(skuIndex, option) && selectSku(skuIndex, option)"
						>
							{{ option.name }}
						</view>
					</view>
				</view>

				<view class="sku-section sku-section-row">
					<view class="sku-section-title">数量</view>
					<view class="sku-number">
						<view class="number-btn" @tap="changeNumber(-1)">-</view>
						<input class="number-input" v-model="localGoodsNum" type="number" @blur="onInputBlur" />
						<view class="number-btn" @tap="changeNumber(1)">+</view>
					</view>
				</view>
				<view class="limit-hint" v-if="getLimitText()">
					{{ getLimitText() }}
				</view>
			</scroll-view>

			<view class="sku-footer">
				<button class="sku-confirm-btn" @tap="onConfirm">确定</button>
			</view>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'SkuSelectModal',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		goodsInfo: {
			type: Object,
			default: () => null
		},
		selectedSkuPrice: {
			type: Object,
			default: () => ({})
		},
		selectedSkus: {
			type: Object,
			default: () => ({})
		},
		goodsNum: {
			type: Number,
			default: 1
		},
		isVirtualPay: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			localGoodsNum: this.goodsNum
		}
	},
	computed: {
		hasSelectedAllSkus() {
			if (!this.goodsInfo || !this.goodsInfo.sku_tree || this.goodsInfo.sku_tree.length === 0) return true;
			
			const skuTreeLength = this.goodsInfo.sku_tree.length;
			for (let i = 0; i < skuTreeLength; i++) {
				if (!this.selectedSkus[i]) {
					return false;
				}
			}
			return true;
		},

		maxBuyCount() {
			const stock = Number(this.selectedSkuPrice.stock || 999);
			const singleLimit = this.goodsInfo ? Number(this.goodsInfo.single_limit || 0) : 0;
			const lifetimeLimit = this.goodsInfo ? Number(this.goodsInfo.lifetime_limit || 0) : 0;
			
			let max = stock;
			if (singleLimit > 0) {
				max = Math.min(max, singleLimit);
			}
			if (lifetimeLimit > 0) {
				max = Math.min(max, lifetimeLimit);
			}
			return max;
		}
	},
	watch: {
		goodsNum(val) {
			this.localGoodsNum = val;
		}
	},
	methods: {
		isOptionSelected(skuIndex, option) {
			return this.selectedSkus[skuIndex] && this.selectedSkus[skuIndex].name === option.name;
		},

		isOptionDisabled(skuIndex, option) {
			if (!this.goodsInfo || !this.goodsInfo.sku_tree || !this.goodsInfo.sku_prices) return false;
			
			const selectedNames = [];
			const skuTreeLength = this.goodsInfo.sku_tree.length;

			for (let i = 0; i < skuTreeLength; i++) {
				if (i === skuIndex) {
					selectedNames.push(option.name);
				} else if (this.selectedSkus[i]) {
					selectedNames.push(this.selectedSkus[i].name);
				} else if (this.goodsInfo.sku_tree[i] && this.goodsInfo.sku_tree[i].children && this.goodsInfo.sku_tree[i].children[0]) {
					selectedNames.push(this.goodsInfo.sku_tree[i].children[0].name);
				} else {
					selectedNames.push('');
				}
			}

			const skuText = selectedNames.join(',');

			const matchedSku = this.goodsInfo.sku_prices.find(sku => {
				return sku.goods_sku_text === skuText;
			});

			return !matchedSku || Number(matchedSku.stock || 0) <= 0;
		},

		selectSku(skuIndex, option) {
			this.$emit('selectSku', skuIndex, option);
		},

		changeNumber(delta) {
			const newNum = parseInt(this.localGoodsNum) + delta;
			const maxCount = this.maxBuyCount;
			if (newNum >= 1 && newNum <= maxCount) {
				this.localGoodsNum = newNum;
				this.$emit('update:goodsNum', this.localGoodsNum);
			}
		},

		onInputBlur() {
			let num = parseInt(this.localGoodsNum);
			const maxCount = this.maxBuyCount;
			if (isNaN(num) || num < 1) {
				num = 1;
			} else if (num > maxCount) {
				num = maxCount;
			}
			this.localGoodsNum = num;
			this.$emit('update:goodsNum', this.localGoodsNum);
		},

		getLimitText() {
			if (!this.goodsInfo) return '';
			
			const singleLimit = Number(this.goodsInfo.single_limit || 0);
			const lifetimeLimit = Number(this.goodsInfo.lifetime_limit || 0);
			const texts = [];
			
			if (singleLimit > 0) {
				texts.push(`单次限购${singleLimit}件`);
			}
			if (lifetimeLimit > 0) {
				texts.push(`终身限购${lifetimeLimit}件`);
			}
			
			return texts.length > 0 ? texts.join('，') : '';
		},

		getSkuText() {
			if (!this.goodsInfo || !this.goodsInfo.sku_tree || this.goodsInfo.sku_tree.length === 0) {
				return '数量：' + this.localGoodsNum;
			}
			
			if (this.hasSelectedAllSkus && this.selectedSkuPrice.goods_sku_text) {
				return '已选：' + this.selectedSkuPrice.goods_sku_text;
			}
			return '请选择规格';
		},

		onConfirm() {
			if (!this.goodsInfo || !this.goodsInfo.sku_tree || this.goodsInfo.sku_tree.length === 0) {
				this.$emit('confirm', {
					skuPrice: this.selectedSkuPrice,
					goodsNum: this.localGoodsNum
				});
				return;
			}
			
			for (let i = 0; i < this.goodsInfo.sku_tree.length; i++) {
				if (!this.selectedSkus[i]) {
					uni.showToast({
						title: '请选择商品规格',
						icon: 'none'
					});
					return;
				}
			}
			
			this.$emit('confirm', {
				skuPrice: this.selectedSkuPrice,
				goodsNum: this.localGoodsNum
			});
		},

		close() {
			this.$emit('close');
		},

		open() {
			this.$emit('open');
		}
	}
}
</script>

<style scoped>
.sku-modal-content {
	background-color: #fff;
	border-radius: 12px 12px 0 0;
	max-height: 70vh;
}

.sku-header {
	display: flex;
	padding: 20px 16px;
	border-bottom: 1px solid #F7F8FA;
}

.sku-image {
	width: 90px;
	height: 90px;
	border-radius: 8px;
	background-color: #F7F8FA;
}

.sku-info {
	flex: 1;
	margin-left: 12px;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.sku-price {
	display: flex;
	align-items: baseline;
}

.price-symbol {
	font-size: 12px;
	font-weight: 700;
	color: #F53F3F;
}

.price-num {
	font-size: 24px;
	font-weight: 700;
	color: #F53F3F;
	margin-left: 2px;
}

.sku-text {
	font-size: 13px;
	color: #666;
	margin-top: 8px;
}

.sku-body {
	padding: 20px 16px;
	max-height: 40vh;
	overflow-x: hidden;
}

.sku-section {
	margin-bottom: 24px;
}

.sku-section-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 4px;
	width: 100%;
	box-sizing: border-box;
}

.sku-section-row .sku-section-title {
	margin-bottom: 0;
	flex-shrink: 0;
	margin-right: 10px;
}

.sku-section-title {
	font-size: 14px;
	color: #333;
	margin-bottom: 12px;
	font-weight: 500;
}

.sku-options {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
}

.sku-option {
	padding: 8px 16px;
	background-color: #F7F8FA;
	border-radius: 6px;
	font-size: 14px;
	color: #333;
	border: 1px solid transparent;
}

.sku-option-active {
	background-color: #E8F4FF;
	color: #0968f6;
	border-color: #0968f6;
}

.sku-option-disabled {
	background-color: #F7F8FA;
	color: #ccc;
	cursor: not-allowed;
	opacity: 0.6;
}

.sku-number {
	display: flex;
	align-items: center;
	flex-shrink: 0;
}

/* #ifdef MP-WEIXIN */
.sku-number {
	margin-right: 20px;
}
/* #endif */

.number-btn {
	width: 28px;
	height: 28px;
	line-height: 28px;
	text-align: center;
	background-color: transparent;
	font-size: 18px;
	color: #999;
	padding: 0;
	margin: 0;
	flex-shrink: 0;
}

.number-input {
	width: 50px;
	height: 32px;
	text-align: center;
	background-color: #F7F8FA;
	border-radius: 4px;
	font-size: 14px;
	color: #333;
	margin: 0 8px;
	flex-shrink: 0;
}

.limit-hint {
	font-size: 12px;
	color: #999;
	text-align: right;
}

.sku-footer {
	padding: 16px;
	border-top: 1px solid #F7F8FA;
}

.sku-confirm-btn {
	width: 100%;
	height: 46px;
	line-height: 46px;
	font-weight: 500;
	font-size: 16px;
	background: #0968f6;
	color: #fff;
	border: none;
	padding: 0;
	margin: 0;
}

.sku-confirm-btn::after {
	border: none;
}
</style>
