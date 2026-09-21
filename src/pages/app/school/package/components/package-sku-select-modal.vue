<template>
	<u-popup :show="show" mode="bottom" :round="10" :closeable="true" :safeAreaInsetBottom="false" @close="close">
		<view class="pkg-modal-content">
				<view class="pkg-header">
					<image class="pkg-image" :src="coverSrc" mode="aspectFill" @error="coverError = true" />
				<view class="pkg-info">
					<view class="pkg-price">
						<text class="price-symbol">¥</text>
						<text class="price-num">{{ currentSku.price || '0' }}</text>
						<text class="price-lessons" v-if="skus.length">/ {{ currentSkuLessons }}课时</text>
						<text class="price-lessons" v-if="currentSku.id">{{ currentSku.valid_type == 1 ? '长期有效' : currentSku.valid_days + '天内有效' }}</text>
					</view>
					<view class="pkg-text">{{ getSkuText() }}</view>
					<view class="pkg-balance" v-if="balanceText">{{ balanceText }}</view>
				</view>
			</view>

			<scroll-view class="pkg-body" scroll-y>
				<!-- 选择校区：置于选择套餐上方，确认报名页需展示校区 -->
				<view class="pkg-section" v-if="campusList.length">
					<view class="pkg-section-title">选择校区</view>
					<view class="pkg-options">
						<view
							class="pkg-option"
							:class="{ 'pkg-option-active': c.id == campus }"
							v-for="c in campusList"
							:key="c.id"
							@tap="selectCampus(c)"
						>
							<text class="option-name">{{ c.name }}</text>
						</view>
					</view>
				</view>

				<view class="pkg-section" v-if="skus.length">
					<view class="pkg-section-title">选择套餐</view>
					<view class="pkg-options">
						<view
							class="pkg-option"
							:class="{ 'pkg-option-active': index === localActive, 'pkg-option-disabled': isSkuDisabled(s) }"
							v-for="(s, index) in skus"
							:key="s.id"
							@tap="selectSku(index)"
						>
							<text class="option-name">{{ s.name }}</text>
							<text class="option-balance" v-if="s.sales_balance_enabled">
								{{ s.sales_balance > 0 ? '仅剩 ' + s.sales_balance + ' 份' : '已售罄' }}
							</text>
						</view>
					</view>
				</view>
				<u-empty
					v-else
					icon="/static/image/empty.png"
					width="70"
					height="70"
					text="暂无可选套餐"
				/>

				<view class="pkg-section" v-if="currentSku.courses && currentSku.courses.length">
					<view class="pkg-section-title">套餐包含课程</view>
					<!-- 课程行复用 tz-school-course（封面缺失/加载失败兜底 + 标题右侧类型标签 + 标题下简介），
					     行尾课时由 c.lessons 驱动（该字段只有套餐规格权益里有） -->
					<tz-school-course :list="currentSku.courses" />
				</view>
			</scroll-view>

			<view class="pkg-footer">
				<button class="pkg-confirm-btn" :class="{ 'pkg-confirm-disabled': !canConfirm }" @tap="onConfirm">确认报名</button>
			</view>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'PackageSkuSelectModal',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		packageInfo: {
			type: Object,
			default: () => null
		},
		// 当前选中规格索引（.sync 双向同步）
		value: {
			type: Number,
			default: 0
		},
		// 适用校区列表（套餐详情接口下发）
		campusList: {
			type: Array,
			default: () => []
		},
		// 当前选中校区 id（.sync 双向同步）
		campus: {
			type: [Number, String],
			default: 0
		}
	},
	data() {
		return {
			installed: true,
			localActive: this.value,
			// 封面加载失败占位（与订单商品封面默认图一致）；课程封面兜底由 tz-school-course 自带
			defaultCover: '/static/image/default-goods.jpg',
			coverError: false
		};
	},
	computed: {
		skus() {
			return (this.packageInfo && this.packageInfo.skus) || [];
		},
		currentSku() {
			return this.skus[this.localActive] || {};
		},
		currentSkuLessons() {
			return (this.currentSku.courses || []).reduce((sum, c) => sum + parseFloat(c.lessons || 0), 0);
		},
		coverSrc() {
			return (!this.coverError && this.packageInfo && this.packageInfo.cover) || this.defaultCover;
		},
		currentCampusName() {
			const hit = this.campusList.find((c) => c.id == this.campus);
			return hit ? hit.name : '';
		},
		// 套餐绑定校区时校区为必选（详情页已默认选中首个）
		canConfirm() {
			if (!this.currentSku.id) return false;
			if (this.isSkuDisabled(this.currentSku)) return false;
			return !this.campusList.length || !!this.campus;
		},
		// 商品卡余量文案：规格余量为 0 或 null 时不展示
		balanceText() {
			if (!this.currentSku.sales_balance_enabled) return '';
			return this.currentSku.sales_balance > 0
				? '仅剩 ' + this.currentSku.sales_balance + ' 份'
				: '已售罄';
		},
	},
	watch: {
		value(val) {
			this.localActive = val;
		},
		show(val) {
			if (val) {
				this.localActive = this.value;
				// 每次打开重置套餐封面失败记录，重新尝试加载（课程封面由 tz-school-course 自行重置）
				this.coverError = false;
			}
		}
	},
	methods: {
		getSkuText() {
			if (!this.currentSku.name) return '请选择套餐';
			return '已选：' + (this.currentCampusName ? this.currentCampusName + ' · ' : '') + this.currentSku.name;
		},
		selectCampus(c) {
			this.$emit('update:campus', c.id);
		},
		// 规格余量判定：后台开启销量余量展示且该规格余量为 0 时不可选择
		isSkuDisabled(s) {
			return !!(s && s.sales_balance_enabled && s.sales_balance <= 0);
		},
		selectSku(index) {
			if (this.isSkuDisabled(this.skus[index])) return;
			this.localActive = index;
			this.$emit('update:value', index);
		},
		onConfirm() {
			if (!this.currentSku.id) {
				uni.showToast({ title: '请选择套餐', icon: 'none' });
				return;
			}
			if (this.isSkuDisabled(this.currentSku)) {
				uni.showToast({ title: '该套餐已售罄', icon: 'none' });
				return;
			}
			if (!this.canConfirm) {
				uni.showToast({ title: '请选择校区', icon: 'none' });
				return;
			}
			this.$emit('confirm', {
				sku: this.currentSku,
			});
		},
		close() {
			this.$emit('close');
		}
	}
};
</script>

<style scoped>
.pkg-modal-content {
	background-color: #fff;
	border-radius: 12px 12px 0 0;
	/* 高度固定：切换套餐引起课程数变化时弹层高度不跳动，内容超出在 pkg-body 内滚动 */
	height: 80vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	/* 底部安全区改由弹层自身承担（模板已关 u-popup 的 safeAreaInsetBottom），微信端按教务口径减半 */
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}

.pkg-header {
	display: flex;
	flex-shrink: 0;
	padding: 13px 16px;
	border-bottom: 1px solid #f7f8fa;
}

.pkg-image {
	width: 60px;
	height: 60px;
	flex-shrink: 0;
	border-radius: 6px;
	background-color: #f7f8fa;
}

.pkg-info {
	flex: 1;
	margin-left: 8px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-width: 0;
}

.pkg-price {
	display: flex;
	align-items: baseline;
}

.price-symbol {
	font-size: 12px;
	font-weight: 700;
	color: #f53f3f;
}

.price-num {
	font-size: 16px;
	font-weight: 700;
	color: #f53f3f;
	margin-left: 2px;
}

.price-lessons {
	font-size: 12px;
	color: #86909c;
	margin-left: 6px;
}

.pkg-text {
	font-size: 12px;
	color: #666;
	margin-top: 6px;
}

.pkg-body {
	/* 真机兼容：scroll-view 内部依赖 height:100%，无法对 flex 撑高（height:0 + flex-grow）的父级解析，
	   内容区会塌陷到只显示头部；改用确定高度（165px = 头部 87px + 底部 78px），flex 仅作微调兜底 */
	height: calc(80vh - 165px);
	flex: 1 1 auto;
	min-height: 0;
	padding: 20px 16px;
	box-sizing: border-box;
}

.pkg-section {
	margin-bottom: 24px;
}

.pkg-section-title {
	font-size: 14px;
	color: #333;
	margin-bottom: 12px;
	font-weight: 500;
}

/* 选项横向排列：一行放不下自动换行（与实物商品规格弹窗一致） */
.pkg-options {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
}

.pkg-option {
	display: inline-flex;
	align-items: center;
	max-width: 100%;
	padding: 8px 16px;
	background-color: #f7f8fa;
	border-radius: 6px;
	border: 1px solid transparent;
	white-space: nowrap;
}

.pkg-option-active {
	background-color: #e8f4ff;
	border-color: #0968f6;
}

.option-name {
	min-width: 0;
	font-size: 14px;
	color: #1d2129;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.pkg-option-active .option-name {
	color: #0968f6;
}

.option-balance {
	margin-left: 4px;
	font-size: 11px;
	color: #ff7d00;
}

.pkg-option-disabled {
	opacity: 0.5;
}

.pkg-option-disabled .option-name {
	color: #86909c;
}

.pkg-balance {
	margin-top: 4px;
	font-size: 12px;
	color: #ff7d00;
}

.pkg-footer {
	flex-shrink: 0;
	padding: 16px;
	border-top: 1px solid #f7f8fa;
}

.pkg-confirm-btn {
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

.pkg-confirm-btn::after {
	border: none;
}

.pkg-confirm-disabled {
	background: #a9c8fb !important;
}
</style>