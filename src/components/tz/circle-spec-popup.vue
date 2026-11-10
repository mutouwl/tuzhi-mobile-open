<template>
	<!--
	  圈子「选择有效期」弹层（2026-10-28 从圈子售前页抽出来）
	  两个宿主共用同一份：售前页（未加入/续费）与成员端圈子首页（入圈后送好友）。
	  **不许某个宿主自己再写一只**：这两页的差别只有「续费提示那一句」与「确认后去哪」，
	  都在宿主那一侧，弹层本身逐字相同（见 `.trae/rules/frame.md` 硬约束 11）。

	  外壳（面板 / 头区 / 底部确认按钮）2026-10-30 收进 `components/tz/spec-popup-shell.vue`：
	  实物、组合、圈子、拼团档位四只规格弹层同一份视觉（用户点名「样式要统一，最好能够做到复用」），
	  正文（有效期 chips / 人数档 / 续费提示）仍是本组件自己的（硬约束 11）。
	  **最低高度 50vh**（2026-10-30 用户点名「它的高度，最低高度还是再提高一些，最好可以占屏幕的一半」；
	  尺寸史见 `ui-baseline-mobile.md` M71：300px → 50vh，增量不是总量）。

	  props 全是有值给值的档：`renewTip` 空串 = 售前页非续费态 / 成员端首页（没有这一句）。
	  确认只上抛事件（`confirm` 带选中的那一档），落页 URL 由宿主用 `submitUrlFor()` 拼，弹层不碰导航。

	  头区封面（2026-10-31 用户实报）：这一格以前写死 `:cover="null"` = 不摆封面，微信小程序端
	  `null` 过属性通道已经不是 `null` ⇒ 渲染出一块 90px 的浅灰空格、默认图也补不上
	  （「商品图片没有加载出来，也没有默认填充，只显示灰色背景」）。口径改成与其余三只规格弹层
	  同一档：**封面必摆**，地址由宿主给（`pages/app/circle/presale` 传圈子自己的 `info.cover`），
	  空串/取图失败落全站默认商品图。
	-->
	<tz-spec-popup-shell :show="show" :gb-mode="!!(gbPrice && !isVirtualPay)" :cover="cover" :gb-price="gbPrice"
		:price="shellPrice" :origin-price="originPrice" :marking-price="shellMarking" :team-text="gbTeam"
		:is-virtual-pay="shellVirtualPay" :coin-name="shellCoinName" :confirm-text="confirmText"
		:confirm-disabled="inTeamBlocked" min-height="50vh" max-height="70vh" :body-style="bodyStyle"
		@close="onClose" @confirm="onConfirm">
		<!-- 正文外层：拼团态的选中色挂在这一层（外壳的 `gb-mode` 不在本组件作用域里，
		     插槽内容由本组件渲染 ⇒ 自己的 scoped 样式只认自己的类，见 M12） -->
		<view class="spec-body-inner" :class="{ 'spec-body-inner--gb': gbPrice && !isVirtualPay }">
			<view class="spec-label">{{ label }}</view>
			<view class="spec-list">
				<view
					v-for="s in specs"
					:key="s.id"
					class="spec-item"
					:class="{ active: current && current.id == s.id }"
					@tap="pick(s)"
				>{{ s.name }}</view>
			</view>
			<!-- 阶梯拼团：人数档就在这一步选（2026-10-29 用户点名「在这个选择商品规格弹窗里面，
			     增加这个阶梯的选择。注意，不同阶梯对应的价格不同，要进行单独适配」） -->
			<tz-gb-ladder-picker v-if="gbPrice && !isVirtualPay && isLadder" :activity="gb"
				:spec-id="current ? current.id : 0" :value="ladderId" @input="onLadder" />
			<view class="spec-renew-tip" v-if="renewTip">{{ renewTip }}</view>
		</view>
	</tz-spec-popup-shell>
</template>

<script>
import { gbSpecOf, gbPriceTextOf, gbTeamText, gbTierId, IN_TEAM_BLOCK_TEXT } from '@/common/utils/group-buy-spec.js';
export default {
	name: 'CircleSpecPopup',
	props: {
		/** 弹层显隐（宿主 `:show="showSpec"` + `@update:show` 收回） */
		show: { type: Boolean, default: false },
		/** 在售规格行（后端 `paySpecs()` 下发：id / name / price / marking_price / virtual_price） */
		specs: { type: Array, default: () => [] },
		/** 当前选中那一档的 id；缺省或对不上时落第一档（与宿主 `currentSpec` 同源） */
		specId: { type: [Number, String], default: 0 },
		/** 规格区标题（圈子这一档就是「圈子有效期」） */
		label: { type: String, default: '圈子有效期' },
		/** 头区封面：圈子自己的 `cover`（空串 ⇒ 外壳落全站默认商品图，不摆灰底空格） */
		cover: { type: String, default: '' },
		isVirtualPay: { type: Boolean, default: false },
		coinName: { type: String, default: '金币' },
		/** 续费折扣那一句；空串 = 这一档不摆（成员端首页没有这一句） */
		renewTip: { type: String, default: '' },
		/**
		 * 拼团活动本体（2026-10-29 加性）：有它 ⇒ 头部切这一档的拼团价 + 「拼团」标、按钮写「立即开团」；
		 * 缺省 null ⇒ 送好友与普通购买两档都与改造前逐字相同。
		 */
		gb: { type: Object, default: null },
		/**
		 * 我在这一场拼团里已有进行中的团（2026-10-30 加性）：售前页底栏的「立即购买 / 续费」已经收起，
		 * 但页面上「选择圈子有效期」那一行是**第二条购买入口**——只收底栏等于只把入口藏起来，
		 * 从这一行照样能下原价单（用户点名「这应该是一个逻辑漏洞」）。
		 * 弹层照开（时长档与续费折扣只有这里看得见），只把确认按钮换成禁用态；
		 * 送好友那一趟（`giftMode`）由宿主不传这一枚，不受影响。
		 */
		inTeam: { type: Boolean, default: false },
		/**
		 * 积分兑换模式（2026-11-08 加性入参）：宿主传页面那一枚 `isScoreExchange`。
		 * 兑换走积分 ⇒ 头区价格换成积分、不画 ¥ 与续费折扣划线价（积分价是整件商品一个数，不随时长档变）；
		 * 缺省 false 时本弹层与改造前逐字相同。
		 */
		scoreMode: { type: Boolean, default: false },
		/** 兑换所需积分（后端 `app_score_goods.score`，与商详价格区同一个数） */
		scoreValue: { type: [String, Number], default: 0 },
	},
	emits: ['update:show', 'pick', 'confirm', 'close'],
	computed: {
		/** 阶梯型选中的人数额：点过就用点过的，没点过落这一档规格的第一档（`gbTiersOf` 的回落同拼团区） */
		effectiveLadderId() {
			return gbTierId(this.gb, this.current ? this.current.id : 0, this.ladderId);
		},
		/** 是不是阶梯拼团（只有它才在弹窗里摆人数档） */
		isLadder() {
			return !!(this.gb && this.gb.type === 'ladder');
		},
		/** 参团中 ⇒ 这一枚不许下单（文案与判据在 `utils/group-buy-spec.js` 一处，四只规格弹窗同读） */
		inTeamBlocked() {
			return !!this.inTeam;
		},
		/** 普通态那一格价格（虚拟支付取虚拟价；拼团态由外壳按 `gb-mode` 切到 `gbPrice`） */
		priceText() {
			if (!this.current) { return this.minPrice; }
			return this.isVirtualPay ? (this.current.virtual_price || this.current.price) : this.current.price;
		},
		/** 外壳头区价格：兑换模式只显示积分（不随时长档变，口径同实物那只规格弹窗） */
		shellPrice() {
			return this.scoreMode ? this.scoreValue : this.priceText;
		},
		/** 外壳虚拟支付档：兑换模式按「价格 + 单位」那一支画（不挂 ¥） */
		shellVirtualPay() {
			return this.scoreMode ? true : this.isVirtualPay;
		},
		shellCoinName() {
			return this.scoreMode ? '积分' : this.coinName;
		},
		/** 划线原价：拼团态那一行用（当前这一档的原价） */
		originPrice() {
			return this.current ? this.current.price : this.minPrice;
		},
		/** 普通态的划线价（续费折扣那一档，只有标记价高于售价时才摆）；兑换模式不摆（现金价不是这一单的口径） */
		markingPrice() {
			const row = this.current;
			if (!row || !row.marking_price) { return ''; }
			return Number(row.marking_price) > Number(row.price) ? row.marking_price : '';
		},
		shellMarking() {
			return this.scoreMode ? '' : this.markingPrice;
		},
		/** 正文几何：flex:1 吃掉 50vh 下限之下的剩余高度，内容超出在块内滚动 */
		bodyStyle() {
			return 'flex: 1; min-height: 0; overflow-y: auto; padding: 20px 16px;';
		},
		/** 确认按钮文案（参团中优先于拼团那一档，先说清为什么点不了） */
		confirmText() {
			if (this.inTeamBlocked) { return IN_TEAM_BLOCK_TEXT; }
			return this.gbPrice && !this.isVirtualPay ? '立即开团' : '确认';
		},
	},
	/**
	 * 选中档与兜底价**落 data 不落 computed**：小程序端模板是 WXML、绑定读的是 data 模型
	 * （页面级 computed 更是明确读不到，见 `pages/app/circle/presale/js.vue` 头注释），
	 * 这一格是「跨端一定得显示」的价格，按最稳的那一档写：props 变 ⇒ `sync()` 重算。
	 */
	data() {
		return {
			current: null,
			minPrice: '0.00',
			// 拼团那一趟的价格与人数（落 data，理由同上面那段注释：WXML 只认 data 模型）
			gbPrice: '',
			gbTeam: '',
			// 阶梯型选中的人数额（0 = 还没选，`sync()` 按这一档规格的第一档算）
			ladderId: 0,
		};
	},
	watch: {
		specs() { this.sync(); },
		specId() { this.sync(); },
		gb() { this.sync(); },
	},
	created() {
		this.sync();
	},
	methods: {
		/** 选中那一档：对得上就用那一档，对不上/首帧落第一档（不让价格头部落空） */
		sync() {
			const rows = this.specs || [];
			const hit = rows.filter((s) => String(s.id) === String(this.specId))[0];
			this.current = hit || rows[0] || null;
			const prices = rows.map((s) => Number(s.price)).filter((n) => !isNaN(n));
			this.minPrice = prices.length ? Math.min.apply(null, prices).toFixed(2) : '0.00';
			// 这一档在拼团活动里的价：阶梯型按「规格 + 人数档」两轴取（`spec_id` 就是 `app_circle_spec.id`）。
			// **活动里没有这一档**（后端 `specs` 没有它）⇒ 空串，不画「拼团 ¥0.00」的头部
			const specId = this.current ? this.current.id : 0;
			const tierId = this.effectiveLadderId;
			const inActivity = !!gbSpecOf(this.gb, specId);
			this.gbPrice = inActivity ? gbPriceTextOf(this.gb, specId, tierId) : '';
			this.gbTeam = inActivity ? gbTeamText(this.gb, specId, tierId) : '';
		},
		/** 点一档：选中态由宿主写回 `specId`（本组件不自己存第二份选中态） */
		pick(spec) {
			this.$emit('pick', spec);
		},
		/** 人数档变更：先把选中档落进 data（`sync()` 重算价格头），再通知宿主 */
		onLadder(id) {
			this.ladderId = Number(id) || 0;
			this.sync();
		},
		onConfirm() {
			// 参团中：按钮已是禁用态，这里兜异步那一拍（活动在弹层打开后才回包 / 历史栈）
			if (this.inTeamBlocked) {
				uni.showToast({ title: IN_TEAM_BLOCK_TEXT, icon: 'none' });
				return;
			}
			if (!this.current) { return; }
			// 第二个参数是阶梯型选中的人数额（普通购买 / 送好友不收，逐字不变）
			this.$emit('confirm', this.current, this.effectiveLadderId);
		},
		onClose() {
			this.$emit('update:show', false);
			this.$emit('close');
		},
	},
};
</script>

<style scoped>
/* 面板 / 头区（封面 + 拼团专享标 + 拼团标 + 价格 + 划线原价 + N人团）/ 底部确认按钮
   2026-10-30 收进 `components/tz/spec-popup-shell.vue`（四只规格弹层同一份，用户点名「样式要统一」）：
   这里只留**本弹层自己的正文**——有效期 chips、人数档、续费提示。
   label 沿用圈子筛选弹窗规范 13px/600/#1d2129，间距逻辑对齐 sku-section-title（标题上、选项下）。 */
.spec-label {
	color: #1d2129;
	font-size: 13px;
	font-weight: 600;
	margin-bottom: 12px;
}
.spec-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}
.spec-item {
	padding: 7px 18px;
	background: #f2f3f5;
	border-radius: 4px;
	font-size: 13px;
	color: #1d2129;
	border: 1px solid transparent;
}
.spec-item.active {
	background: #e8f1ff;
	border-color: #0968f6;
	color: #0968f6;
}
/* 拼团态：选中档切红系（与 group-buy-config-popup 的 `.gbc-chip--on` 同值） */
.spec-body-inner--gb .spec-item.active {
	background: #fff7f7;
	border-color: #f53f3f;
	color: #f53f3f;
}
.spec-renew-tip {
	margin-top: 8px;
	font-size: 12px;
	color: #ff7d00;
}
</style>
