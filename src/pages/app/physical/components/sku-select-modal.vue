<template>
	<!--
	  外壳（面板 / 头区 / 底部确认按钮）2026-10-30 收进 `components/tz/spec-popup-shell.vue`：
	  实物、组合、圈子、拼团档位四只规格弹层同一份视觉（用户点名「样式要统一，最好能够做到复用」），
	  正文（规格树 / 人数档 / 数量 / 限购说明）仍是本组件自己的（硬约束 11）。
	  拼团那一趟的价格 / 原价划线 / 「拼团」标 / 「拼团专享」标 / N人团 / 红橙按钮都由外壳按
	  `gb-mode` 一处判，本组件只把这一档的值算好递进去（取价口径仍只存 `common/utils/group-buy-spec.js`）。
	-->
	<tz-spec-popup-shell :show="show" :gb-mode="gbMode" :cover="coverSrc" :gb-price="gbPrice" :price="priceText"
		:origin-price="priceText" :team-text="gbTeam" :is-virtual-pay="isVirtualPay" :coin-name="coinName"
		:sub-text="getSkuText()" :confirm-text="confirmText" :confirm-disabled="confirmDisabled"
		max-height="70vh" :body-scroll="true" :body-style="bodyStyle" @close="close" @confirm="onConfirm">
		<!-- 正文外层：拼团态的选中色挂在这一层（外壳的 `gb-mode` 不在本组件作用域里，
		     插槽内容由本组件渲染 ⇒ 自己的 scoped 样式只认自己的类，见 M12） -->
		<view class="sku-body-inner" :class="{ 'sku-body-inner--gb': gbMode }">
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

		<!-- 阶梯拼团：人数档就在这一步选（2026-10-29 用户点名「在这个选择商品规格弹窗里面，
		     增加这个阶梯的选择。注意，不同阶梯对应的价格不同，要进行单独适配」）——
		     选完规格再选人数档，头部的拼团价按「规格 + 档位」两轴取（口径见 gb-ladder-picker） -->
		<tz-gb-ladder-picker v-if="gbMode && isLadder" :activity="gb" :spec-id="specId"
			:value="ladderId" @input="ladderId = $event" />

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
		</view>
	</tz-spec-popup-shell>
</template>

<script>
import { gbSpecOf, gbPriceTextOf, gbTeamText, gbTierId, IN_TEAM_BLOCK_TEXT } from '@/common/utils/group-buy-spec.js';
import { specBuyable, specBlockText } from '@/common/utils/spec-stock.js';
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
		},
		/**
		 * 拼团活动本体（2026-10-29 加性入参）：由宿主页在「立即开团」那一趟传进来。
		 * 有它 ⇒ 头部价格切到这一档的拼团价、按钮写「立即开团」；没有（立即购买）⇒ 与改造前逐字相同。
		 */
		gb: {
			type: Object,
			default: null
		},
		/**
		 * 我在这一场拼团里已有进行中的团（2026-10-30 加性入参）：宿主传页面那一枚 `gbInTeam`。
		 * 底栏那枚「立即购买」已经收起，但「选择」那一行是**第二条购买入口**——只收底栏等于只把
		 * 入口藏起来，从规格行照样能下原价单（用户点名「这应该是一个逻辑漏洞」）。
		 * 弹窗照开（规格树 / 数量只有这里看得见），只把确认按钮换成禁用态。
		 */
		inTeam: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			localGoodsNum: this.goodsNum,
			// 选中的拼团人数额（阶梯型；0 = 还没选，按这一档规格的第一档算，见 `effectiveLadderId`）
			ladderId: 0
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

		/** 这一档规格的拼团 id（该页 `spec_id` 就是 `app_physical_sku_price.id`） */
		specId() {
			return Number(this.selectedSkuPrice && this.selectedSkuPrice.id) || 0;
		},
		/** 头区封面：这一档规格图 → 商品封面 → 空串（灰底占位，失败档由外壳落默认商品图） */
		coverSrc() {
			return this.selectedSkuPrice.image || (this.goodsInfo && this.goodsInfo.cover) || '';
		},
		/** 普通态那一格价格（拼团态由外壳按 `gb-mode` 切到 `gbPrice`，这一格不参与） */
		priceText() {
			return this.selectedSkuPrice.price || (this.goodsInfo && this.goodsInfo.price) || 0;
		},
		/** 虚拟支付那一趟的币名（外壳拼在价格后面，与圈子/组合同一档） */
		coinName() {
			return this.$tools.systemConfig('coin_name') || '金币';
		},
		/** 正文几何：与收进外壳前逐值相同（20px 左右内衬 + 40vh 上限，超出在 scroll-view 内滚动） */
		bodyStyle() {
			return 'padding: 20px 16px; max-height: 40vh; overflow-x: hidden;';
		},
		/** 这一档在拼团活动里的价行（按 `spec_id` 取） */
		gbRow() {
			return gbSpecOf(this.gb, this.specId);
		},
		/** 是不是阶梯拼团（只有它才在弹窗里摆人数档） */
		isLadder() {
			return !!(this.gb && this.gb.type === 'ladder');
		},
		/** 实际生效的档位 id：点过就用点过的，没点过落这一档规格的第一档（对齐 `gb-ladder-picker`） */
		effectiveLadderId() {
			return gbTierId(this.gb, this.specId, this.ladderId);
		},
		/** 头区拼团价：阶梯型取「规格 + 档位」两轴的价，其余取该档规格价 */
		gbPrice() {
			return gbPriceTextOf(this.gb, this.specId, this.effectiveLadderId);
		},
		/** 「N人团」：阶梯型写选中那一档的人数 */
		gbTeam() {
			return gbTeamText(this.gb, this.specId, this.effectiveLadderId);
		},
		/**
		 * 拼团态的整块视觉开关：只在这一趟真按拼团价成交时打开。
		 * 虚拟支付那一趟拼团价换算还没接（价格仍走原价那一支）⇒ 不切主题，避免「拼团专享」标配原价。
		 */
		gbMode() {
			return !!this.gbRow && !this.isVirtualPay;
		},
		/** 这一档在拼团里是不是已售罄 / 限购用尽（判据同拼团弹窗：`specBuyable` 一份） */
		gbBlocked() {
			return !!this.gbRow && !specBuyable(this.gbRow);
		},
		gbBlockText() {
			return this.gbRow ? specBlockText(this.gbRow) : '';
		},
		/** 参团中 ⇒ 这一枚不许下单（文案与判据在 `utils/group-buy-spec.js` 一处，四只规格弹窗同读） */
		inTeamBlocked() {
			return !!this.inTeam;
		},
		/** 确认按钮禁用态：这一档在活动里买不了 ∨ 参团中 */
		confirmDisabled() {
			return this.gbBlocked || this.inTeamBlocked;
		},
		/** 确认按钮文案（参团中优先于售罄 / 拼团两档，先说清为什么点不了） */
		confirmText() {
			if (this.inTeamBlocked) { return IN_TEAM_BLOCK_TEXT; }
			if (this.gbBlocked) { return this.gbBlockText || '已售罄'; }
			return this.gbMode ? '立即开团' : '确定';
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
			// 拼团那一趟还要受这一档的拼团份数上限约束（后端 `Quantity` 算好的 `count_max`）：
			// 此处不夹，选多了要到提交订单页才被拒
			const gbCap = this.gbRow ? Number(this.gbRow.count_max) : 0;
			if (gbCap > 0) {
				max = Math.min(max, gbCap);
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
			// 参团中：按钮已是禁用态，这里兜异步那一拍（活动在弹窗打开后才回包 / 历史栈）
			if (this.inTeamBlocked) {
				uni.showToast({ title: IN_TEAM_BLOCK_TEXT, icon: 'none' });
				return;
			}
			// 拼团那一趟：这一档在活动里已售罄 / 限购用尽就不放行（按钮已是禁用态，这里兜异步那一拍）
			if (this.gbBlocked) { return; }
			if (!this.goodsInfo || !this.goodsInfo.sku_tree || this.goodsInfo.sku_tree.length === 0) {
				this.$emit('confirm', {
					skuPrice: this.selectedSkuPrice,
					goodsNum: this.localGoodsNum,
					ladderId: this.effectiveLadderId
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
				goodsNum: this.localGoodsNum,
				ladderId: this.effectiveLadderId
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
/* 面板 / 头区（封面 + 拼团专享标 + 拼团标 + 价格 + 划线原价 + N人团 + 已选）/ 底部确认按钮
   2026-10-30 收进 `components/tz/spec-popup-shell.vue`（四只规格弹层同一份，用户点名「样式要统一」）：
   这里只留**本商品自己的正文**——规格树分节、chips、数量步进器、限购说明。 */
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

/* 拼团态：选中的规格也切到拼团红系（与 group-buy-config-popup 的 `.gbc-chip--on` 同值），
   不再出现「红橙按钮 + 蓝色选中项」两套主色 */
.sku-body-inner--gb .sku-option-active {
	background-color: #fff7f7;
	color: #f53f3f;
	border-color: #f53f3f;
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
</style>
