<template>
	<view class="coupon-box" :style="{ opacity: disabled ? '0.5' : '1' }">
		<view class="coupon-inner">
			<!-- 左侧金额区 -->
			<view class="coupon-left">
				<view class="left-tag">{{ data.type_text || '优惠券' }}</view>
				<view class="left-price" :class="data.status == 'expired' || data.status == 'used' ? 'disabled-color' : 'price-color'">
					<template v-if="data.type === 'reduce' || data.type == 'reduce'">
						<text class="price-symbol">￥</text>
						<text class="price-value" :class="{ 'small': String(data.amount || data.amount || '').length >= 5, 'mini': String(data.amount || data.amount || '').length >= 7 }">{{ data.amount || data.amount || 0 }}</text>
					</template>
					<template v-if="data.type === 'discount' || data.type == 'discount'">
						<text class="price-value" :class="{ 'small': String(data.discount || data.discount || '').length >= 4, 'mini': String(data.discount || data.discount || '').length >= 6 }">{{ data.discount || data.discount || 0 }}</text>
						<text class="price-symbol">折</text>
					</template>
				</view>
				<view class="left-type" :class="data.status == 'expired' || data.status == 'used' ? 'disabled-color' : 'subtitle-color'">
					{{ (data.type === 'reduce' || data.type == 'reduce') ? '满' + (data.enough || 0) + '可用' : '优惠券' }}
				</view>
			</view>

			<!-- 中间虚线分隔 -->
			<view class="coupon-divider">
				<view class="divider-dot top"></view>
				<view class="divider-line"></view>
				<view class="divider-dot bottom"></view>
			</view>

			<!-- 右侧信息区 -->
			<view class="coupon-right">
				<view class="right-main">
					<view class="right-title" :class="data.status == 'expired' || data.status == 'used' ? 'disabled-color' : 'info-color'">
						{{ data.name || '-' }}
					</view>
					<view class="right-time" :class="data.status == 'expired' || data.status == 'used' ? 'disabled-color' : 'subtitle-color'">
						<view v-if="data.use_time_type == 'days'">
							领取{{ data.start_days == 0 ? '立即' : data.start_days + '天后' }}生效
						</view>
						<view v-else>
							<view>{{ data.use_start_time }}</view>
							<view>～{{ data.use_end_time }}</view>
						</view>
					</view>
					<view class="right-rule" v-if="data.description" :class="data.status == 'expired' || data.status == 'used' ? 'disabled-color' : 'subtitle-color'" @click="showRule">
						<text>{{ data.description }}</text>
						<text class="rule-arrow">></text>
					</view>
				</view>
				<view class="right-action">
					<!-- picker 选择模式 -->
					<view class="coupon-choose-box" v-if="picker" @click="change">
						<view
							:class="[
								'coupon-choose',
								{
									'coupon-choosed': checkedId == ucId,
									'coupon-unchoosed': checkedId != ucId,
								},
							]"
						></view>
					</view>
					<!-- 普通操作按钮 -->
					<view class="use-btn" v-else-if="!cantUseMsg && data.status != 'expired' && data.status != 'used'" @click="handleAction(data.id)">
						{{ btnText }}
					</view>
				</view>
			</view>
		</view>

		<!-- 不可使用原因提示 -->
		<view class="cant-use-msg-box" v-if="cantUseMsg">
			<view class="cant-use-msg">
				<tz-icon name="prompt" :size="14" color="#FF7820" />{{ cantUseMsg }}
			</view>
		</view>
	</view>
</template>

<script lang="ts">
export default {
	components: {},
	data() {
		return {
			stateMap: {
				0: "立即领取",
				1: "去使用",
				'unused': '使用',
				'used': '已使用',
				'expired': '已过期',
			}
		}
	},
	computed: {
		btnText() {
			if (this.picker) return '';
			if (this.disabled) return '已过期';
			if (this.data.get_status === 'can_get') {
				return this.data.received ? '继续领' : '使用';
			}
			return this.stateMap[this.data.status] || '使用';
		}
	},

	props: {
		data: {
			type: [Object, Array],
			default: () => {
				return {};
			},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		type: {
			type: String,
			default: "coupon",
		},
		picker: {
			type: Boolean,
			default: false,
		},
		checkedId: {
			type: [Number, String],
			default: "",
		},
		ucId: {
			type: [Number, String],
			default: "",
		},
		cantUseMsg: {
			type: String,
			default: "",
		},
	},
	methods: {
		use(id) {
			if (this.disabled) return;
			this.$nav.to("/pages/app/coupon/use/use?id=" + id);
		},
		receive(id) {
			uni.showLoading({
				title: "请稍后",
			});
			this.$api("app.coupon.receive", {
				id: id || this.data.id,
			}).then((res) => {
				uni.hideLoading();
				if (res.code == 1) {
					this.$emit("refresh", false);
				}
				uni.showToast({
					title: res.msg,
					icon: 'none',
					duration: 2000
				});
			});
			uni.stopPullDownRefresh();
		},
		change() {
			this.$emit("change", this.ucId);
		},
		handleAction(id) {
			if (this.disabled) return;
			if (this.data.get_status === 'can_get') {
				this.receive(id);
			} else {
				this.use(id);
			}
		},
		showRule() {
			uni.showToast({
				title: this.data.description,
				icon: 'none',
				duration: 2000
			});
		}
	},
	watch: {}
};
</script>

<style scoped>
.coupon-box {
	margin: 10px;
	background-color: #fff6f0;
	border-radius: 12px;
	overflow: hidden;
}

.coupon-inner {
	display: flex;
	flex-direction: row;
	align-items: stretch;
	min-height: 100px;
}

/* 左侧金额区 */
.coupon-left {
	width: 110px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 12px 0;
	flex-shrink: 0;
}

.left-tag {
	font-size: 12px;
	color: #ff6000;
	margin-bottom: 4px;
	font-weight: 500;
}

.left-price {
	display: flex;
	align-items: baseline;
	justify-content: center;
	margin-bottom: 4px;
	max-width: 100%;
	padding: 0 4px;
}

.price-symbol {
	font-size: 14px;
	font-weight: 600;
	flex-shrink: 0;
}

.price-value {
	font-size: 32px;
	font-weight: 700;
	line-height: 1;
	font-family: OPPOSANS;
	word-break: break-all;
}

.price-value.small {
	font-size: 24px;
}

.price-value.mini {
	font-size: 18px;
}

.left-type {
	font-size: 12px;
	font-weight: 400;
}

/* 中间虚线分隔 */
.coupon-divider {
	width: 12px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
	flex-shrink: 0;
}

.divider-dot {
	width: 12px;
	height: 12px;
	background-color: #F7F8FA;
	border-radius: 50%;
	position: absolute;
	left: 0;
}

.divider-dot.top {
	top: -6px;
}

.divider-dot.bottom {
	bottom: -6px;
}

.divider-line {
	width: 1px;
	height: 100%;
	border-left: 1px dashed #ffbcad;
}

/* 右侧信息区 */
.coupon-right {
	flex: 1;
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 12px 12px 12px 4px;
	min-width: 0;
}

.right-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-width: 0;
	padding-right: 8px;
}

.right-title {
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 6px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.right-time {
	font-size: 12px;
	margin-bottom: 4px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.right-rule {
	font-size: 12px;
	display: flex;
	align-items: center;
}

.rule-arrow {
	margin-left: 2px;
	font-size: 12px;
}

.right-action {
	flex-shrink: 0;
}

.use-btn {
	background: linear-gradient(90deg, #ff6000, rgba(255, 96, 0, .8));
	color: #fff;
	font-size: 12px;
	padding: 4px 12px;
	border-radius: 16px;
	font-weight: 500;
	white-space: nowrap;
}

.disabled-btn {
	background: #ccc;
}

/* picker 选择框 */
.coupon-choose-box {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 100%;
}

.coupon-choose {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	box-sizing: border-box;
	background: url(/static/image/coupon-radio-checked.png);
	background-size: 100% 100%;
}

.coupon-choose-box .coupon-unchoosed {
	border: 1px solid #ccc !important;
	background: none !important;
}

/* 不可使用原因 */
.cant-use-msg-box {
	padding: 10px 14px;
	background-color: #fafafa;
	border-top: 1px dashed #ffbcad;
}

.cant-use-msg {
	font-size: 12px;
	color: #505050;
	display: flex;
	align-items: center;
}

/* 颜色定义 */
.price-color {
	color: #ff6000;
}

.info-color {
	color: #333;
}

.subtitle-color {
	color: #666;
}

.disabled-color {
	color: #999;
}
</style>
