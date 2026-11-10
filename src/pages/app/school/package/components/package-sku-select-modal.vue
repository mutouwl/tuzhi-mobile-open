<template>
	<u-popup :show="show" mode="bottom" :round="12" :closeable="true" :safeAreaInsetBottom="false" @close="close">
		<view class="pkg-modal-content" :class="{ 'pkg-modal-content--gb': gbMode }">
				<view class="pkg-header" :class="{ 'pkg-header--gb': gbMode }">
					<image class="pkg-image" :src="coverSrc" mode="aspectFill" @error="coverError = true" />
				<view class="pkg-info">
					<!-- 拼团那一趟（2026-10-29）：价格切到这一档的拼团价 + 原价划线 + 「拼团」标；课时/有效期照旧。
					     用户点名「给规格弹窗增加特殊的背景色 / 特殊的 Tag」⇒ 整块切拼团态（见 `gbMode`） -->
					<view class="gb-badge" v-if="gbMode">拼团专享</view>
					<view class="pkg-price" v-if="gbMode">
						<text class="gb-tag">拼团</text>
						<text class="price-symbol">¥</text>
						<text class="price-num">{{ gbPrice }}</text>
						<text class="price-origin">¥{{ currentSku.price || '0' }}</text>
						<text class="price-lessons" v-if="skus.length">/ {{ currentSkuLessons }}课时</text>
						<text class="gb-team" v-if="gbTeam">{{ gbTeam }}</text>
					</view>
					<!-- 积分兑换（2026-11-08 用户点名「点击立即兑换，弹出来的多规格选择弹窗，上面的这个价格
					     应该显示为积分」）：兑换价是整件商品一个数（后端 `app_score_goods.score`），不随规格变，
					     所以这里不画 ¥ 符号、也不算划线原价 —— 与实物那只规格弹窗同一档（`scoreMode`）。 -->
					<view class="pkg-price" v-else>
						<text class="price-symbol" v-if="!scoreMode">¥</text>
						<text class="price-num">{{ scoreMode ? (scoreValue || 0) : (currentSku.price || '0') }}</text>
						<text class="price-coin" v-if="scoreMode">积分</text>
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
							<text class="option-balance" v-if="skuBalanceText(s)">{{ skuBalanceText(s) }}</text>
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

				<!-- 阶梯拼团：人数档就在这一步选（2026-10-29 用户点名「在这个选择商品规格弹窗里面，
				     增加这个阶梯的选择。注意，不同阶梯对应的价格不同，要进行单独适配」） -->
				<tz-gb-ladder-picker v-if="gbMode && isLadder" :activity="gb" :spec-id="gbSpecId"
					:value="ladderId" @input="ladderId = $event" />

				<view class="pkg-section" v-if="currentSku.courses && currentSku.courses.length">
					<view class="pkg-section-title">套餐包含课程</view>
					<!-- 课程行复用 tz-school-course（封面缺失/加载失败兜底 + 标题右侧类型标签 + 标题下简介），
					     行尾课时由 c.lessons 驱动（该字段只有套餐规格权益里有） -->
					<tz-school-course :list="currentSku.courses" />
				</view>
			</scroll-view>

			<view class="pkg-footer">
				<!-- 参团中（`inTeam`）与不可确认同档：禁用 + 就地写原因，不留一枚点了能下原价单的入口 -->
				<button class="pkg-confirm-btn" :class="{ 'pkg-confirm-disabled': !canConfirm || inTeamBlocked, 'pkg-confirm-btn--gb': gbMode && !inTeamBlocked }" @tap="onConfirm">{{ confirmText }}</button>
			</view>
		</view>
	</u-popup>
</template>

<script>
import { gbSpecOf, gbPriceTextOf, gbTeamText, gbTierId, IN_TEAM_BLOCK_TEXT } from '@/common/utils/group-buy-spec.js';
import { specBuyable } from '@/common/utils/spec-stock.js';
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
		// 拼团活动本体（2026-10-29 加性）：有它 ⇒ 头部切拼团价、按钮写「立即开团」
		gb: { type: Object, default: null },
		/**
		 * 我在这一场拼团里已有进行中的团（2026-10-30 加性）：宿主传页面那一枚 `gbInTeam`。
		 * 底栏那枚「立即报名」已经收起，但「选择套餐」那一行是**第二条购买入口**——只收底栏等于只把
		 * 入口藏起来，从套餐弹层照样能下原价单（用户点名「这应该是一个逻辑漏洞」）。
		 * 弹层照开（套餐权益 / 校区只有这里看得见），只把确认按钮换成禁用态。
		 */
		inTeam: { type: Boolean, default: false },
		/**
		 * 积分兑换模式（2026-11-08 加性入参）：宿主传页面那一枚 `isScoreExchange`。
		 * 兑换走积分、不走现金价 ⇒ 头区价格换成积分、不画 ¥ 与划线原价；
		 * 缺省 false 时本弹层与改造前逐字相同（普通报名链不受影响）。
		 */
		scoreMode: { type: Boolean, default: false },
		/** 兑换所需积分（后端 `app_score_goods.score`，与商详价格区同一个数） */
		scoreValue: { type: [String, Number], default: 0 },
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
			coverError: false,
			// 选中的拼团人数额（阶梯型；0 = 还没选，按这一档套餐规格的第一档算）
			ladderId: 0
		};
	},
	computed: {
		skus() {
			return (this.packageInfo && this.packageInfo.skus) || [];
		},
		currentSku() {
			return this.skus[this.localActive] || {};
		},
		/** 当前套餐规格 id（`school_package_sku.id` 就是拼团 `spec_id`） */
		gbSpecId() {
			return Number(this.currentSku && this.currentSku.id) || 0;
		},
		/** 这一档在拼团活动里的价行 */
		gbRow() {
			return gbSpecOf(this.gb, this.gbSpecId);
		},
		/** 是不是阶梯拼团（只有它才在弹窗里摆人数档） */
		isLadder() {
			return !!(this.gb && this.gb.type === 'ladder');
		},
		/** 实际生效的档位 id：点过就用点过的，没点过落这一档规格的第一档 */
		effectiveLadderId() {
			return gbTierId(this.gb, this.gbSpecId, this.ladderId);
		},
		/** 头区拼团价：阶梯型取「规格 + 档位」两轴的价 */
		gbPrice() {
			return gbPriceTextOf(this.gb, this.gbSpecId, this.effectiveLadderId);
		},
		gbTeam() {
			return gbTeamText(this.gb, this.gbSpecId, this.effectiveLadderId);
		},
		/** 拼团态的整块视觉开关：这一档在活动里有拼团价才切主题，普通报名逐字不变 */
		gbMode() {
			return !!this.gbRow;
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
		// 套餐绑定校区时校区为必选（详情页已默认选中首个）；
		// campusList 为空 = 适用校区全部失效（后台把绑定校区删了或禁用了），订单交付不到任何校区，
		// 确认按钮一律置灰（后端 OrderService::createOrder 同样会拦「该套餐不支持所选校区」）
		canConfirm() {
			if (!this.currentSku.id) return false;
			if (!this.campusList.length) return false;
			if (this.isSkuDisabled(this.currentSku)) return false;
			// 拼团那一趟：这一档在活动里卖完 / 限购用尽也不放行（判据同拼团弹窗 `specBuyable`）
			if (this.gbRow && !this.isGbbuyable) return false;
			return !!this.campus;
		},
		/** 拼团那一趟这一档还能不能买（没有活动时恒 true，不影响普通报名） */
		isGbbuyable() {
			return !this.gbRow || specBuyable(this.gbRow);
		},
		/** 参团中 ⇒ 这一枚不许下单（文案与判据在 `utils/group-buy-spec.js` 一处，四只规格弹窗同读） */
		inTeamBlocked() {
			return !!this.inTeam;
		},
		/** 确认按钮文案（参团中优先于拼团那一档，先说清为什么点不了） */
		confirmText() {
			if (this.inTeamBlocked) { return IN_TEAM_BLOCK_TEXT; }
			return this.gbMode ? '立即开团' : '确认报名';
		},
		// 商品卡状态文案：套餐级原因（无可上课校区）优先，其次是规格权益失效，最后才是余量文案
		balanceText() {
			if (!this.campusList.length) return '该套餐暂无可用校区';
			return this.skuBalanceText(this.currentSku);
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
		// 规格禁用判定：① 课程权益全失效——课程被后台删除或禁用后，套餐详情接口已把这类课程
		// 从 courses 里过滤掉（后端只下发仍有效的权益），courses 为空说明该规格交付不了课时，
		// 付了钱也只会「该规格未配置课程权益」；② 后台开启销量余量展示且该规格余量已为 0
		isSkuDisabled(s) {
			if (!s) return false;
			if (!(s.courses || []).length) return true;
			return !!(s.sales_balance_enabled && s.sales_balance <= 0);
		},
		// 规格状态文案（规格选项角标与商品卡共用）：失效原因优先，其次余量文案
		skuBalanceText(s) {
			if (!s || !s.id) return '';
			if (!(s.courses || []).length) return '暂不可购买';
			if (!s.sales_balance_enabled) return '';
			return s.sales_balance > 0 ? '仅剩 ' + s.sales_balance + ' 份' : '已售罄';
		},
		selectSku(index) {
			if (this.isSkuDisabled(this.skus[index])) return;
			this.localActive = index;
			this.$emit('update:value', index);
		},
		onConfirm() {
			// 参团中：按钮已是禁用态，这里兜异步那一拍（活动在弹层打开后才回包 / 历史栈）
			if (this.inTeamBlocked) {
				uni.showToast({ title: IN_TEAM_BLOCK_TEXT, icon: 'none' });
				return;
			}
			if (!this.currentSku.id) {
				uni.showToast({ title: '请选择套餐', icon: 'none' });
				return;
			}
			if (this.isSkuDisabled(this.currentSku)) {
				// 原因按实际口径给：权益失效不能报「已售罄」
				uni.showToast({ title: '该套餐' + (this.skuBalanceText(this.currentSku) || '不可选择'), icon: 'none' });
				return;
			}
			if (!this.canConfirm) {
				uni.showToast({ title: '请选择校区', icon: 'none' });
				return;
			}
			this.$emit('confirm', {
				sku: this.currentSku,
				// 阶梯型选中的人数额（普通报名不收，逐字不变）
				ladderId: this.effectiveLadderId,
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

/* 顶格也自带上圆角（2026-10-30 与实物/组合/圈子那三只同批）：本容器有 `overflow: hidden` 会裁剪，
   已经能圆；顶格自己也带上同一档，任一处被改动都不会退回直角。弹层（12）/ 内容（12）/ 顶格（12）同值。 */
.pkg-header {
	display: flex;
	flex-shrink: 0;
	padding: 13px 16px;
	border-bottom: 1px solid #f7f8fa;
	border-radius: 12px 12px 0 0;
}

/* 拼团态：标题区一层极浅暖红、渐隐到白；正文仍是白底，套餐/校区选项的对比度不变 */
.pkg-header--gb {
	background: linear-gradient(180deg, #fff3ee 0%, #ffffff 100%);
	border-bottom-color: #ffece8;
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

/* 拼团那一趟：价格行前的「拼团」标、划线原价、N人团（2026-10-29 补齐）。
   本页原先没有这三条规则，模板里的 gb-tag / price-origin / gb-team 全吃浏览器默认黑字，
   只有价格是红的 ⇒ 用户点名「教育培训这个拼团黑色字体，价格红色字体，然后又是黑色字体
   显示的原价，特别特别丑」。配色与实物/组合/圈子三只规格弹窗同一份，字号按本页 16px 价收一档。 */
.gb-tag {
	margin-right: 6px;
	padding: 0 5px;
	border-radius: 3px;
	background: #ffece8;
	color: #f53f3f;
	font-size: 10px;
	line-height: 16px;
	align-self: center;
}

/* 「拼团专享」小标：红橙渐变底 + 白字，与商详拼团按钮同一条渐变 */
.gb-badge {
	align-self: flex-start;
	margin-bottom: 4px;
	padding: 0 6px;
	border-radius: 3px;
	background: linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%);
	color: #fff;
	font-size: 10px;
	font-weight: 500;
	line-height: 17px;
	letter-spacing: .2px;
}

.price-origin {
	margin-left: 6px;
	font-size: 12px;
	color: #86909c;
	text-decoration: line-through;
}

.gb-team {
	margin-left: 6px;
	font-size: 12px;
	color: #f53f3f;
}

.price-lessons {
	font-size: 12px;
	color: #86909c;
	margin-left: 6px;
}

/* 积分单位（兑换模式）：与价格同色同档，不当灰字说明读 —— 与 `.price-num` 同行 baseline 对齐 */
.price-coin {
	font-size: 12px;
	font-weight: 700;
	color: #f53f3f;
	margin-left: 2px;
}

.pkg-text {
	font-size: 12px;
	color: #666;
	margin-top: 6px;
}

.pkg-body {
	/* 真机兼容：scroll-view 内部依赖 height:100%，无法对 flex 撑高（height:0 + flex-grow）的父级解析，
	   内容区会塌陷到只显示头部；改用确定高度（165px = 头部 87px + 底部 78px），flex 仅作微调兜底。
	   拼团态头部多一行「拼团专享」标（约 20px），由本区的 flex-shrink 扣回，不改这个常量
	   （改了普通报名态会空出一截） */
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

/* 拼团态：选中的套餐 / 校区切红系（与 group-buy-config-popup 的 `.gbc-chip--on` 同值） */
.pkg-modal-content--gb .pkg-option-active {
	background-color: #fff7f7;
	border-color: #f53f3f;
}

.pkg-modal-content--gb .pkg-option-active .option-name {
	color: #f53f3f;
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

/* 拼团态的确认按钮：与商详「立即开团」同一条红橙渐变（禁用档由 `.pkg-confirm-disabled` 盖回） */
.pkg-confirm-btn--gb {
	background: linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%);
}

.pkg-confirm-disabled {
	background: #a9c8fb !important;
}
</style>