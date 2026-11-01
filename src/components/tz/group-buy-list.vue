<template>
	<!--
		拼团-DIY 拼团商品组件（自定义页面用）

		数据由后端随装修接口下发（`common/library/app/group_buy/DecorPage`），这里只负责渲染：
		来源（最新 / 手动选择）、显示数量、两个隐藏开关都在服务端生效，端上不重判（M22）。
		无数据时整块不占位（与打卡 / 教务那几个 DIY 组件同一口径）。

		三档排列（用户 2026-10-28 给的三张图）：
		  list   列表：封面在左 112，右侧 标签+名称 / 距结束 / 价条（含「去拼团」）；
		         封面高度跟着右侧文字走（最低 80），两边恒等高（2026-10-29 用户点名「左侧图片与右侧文字高度不一致」）
		  single 单列大图：封面通栏 196，价条两行（拼团价 + 单买价）+「去拼团」
		  double 双列：两列并排，封面 96，价条一行、不放按钮（卡窄，按钮会挤掉价格），整卡可点；
		         同排卡片恒等高：标题/倒计时固定行高 + 价条贴底（2026-10-29 用户点名「双列高度不一致」）

		配色只有一处来源：拼团业务色 `#ff4b2b → #ff8f2b`（与 `group-buy-banner` / `group-buy-btn` 同一档），
		小字档用它的深一档 `#cf350e`（白底 5.04:1、压在 `#fff0ee` 价条上 4.55:1，都过 4.5），
		价条上的原价与「拼团价/单买价」标签用暖灰 `#8a5a4d`（压在价条上 5.19:1——
		冷灰 `#86909c` 压在有色底上只有 2.92:1，硬约束 29①）。

		角标两枚：「拼团」是白字压在业务色渐变上——2026-10-29 用户点名「左上角的拼团 tag 没有渐变，
		要参考 web 自定义页面中的拼团预览组件」，故逐值照抄 `tuzi-web/.../components/group-buy.vue` 的
		`.gb-badge-team`（`linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)`；渐变浅端白字只有 2.28:1，
		低于 4.5，但用户点名的参照页优先，不再为了对比度改成纯色 `#cf350e`）；
		商品类型角标压在封面图上，用 55% 黑底兜住对比度。
	-->
	<!-- 双列：每一张卡都给同样的 margin（包括最后一张），根节点再用等量负 margin 抵掉多出来的那一格。
	     不能只把最后一张的 margin 归零：flex 的 stretch 拉平的是**margin box**，最后一张少 10px margin
	     就会比同排另一张高 10px（2026-10-29 用户第二次点名「同一列的高度还是不一致」） -->
	<!-- 小程序端 `:style` 只认字符串：三元里带对象字面量时 uni 不会把它序列化成串，产物把
	     一整个对象写进 style（读出来就是 margin 不生效）。值语义不变，只把这一格拼成 style 串。 -->
	<view class="tz-group-buy-list" :class="type"
		:style="type === 'double' ? 'margin-bottom:-' + margin + 'px' : ''"
		v-if="list && list.length">
		<view v-for="(item, index) in list" :key="item.id" class="gbc-card"
			:class="[type, { 'gbc-card-round': round, 'gbc-card-border': border }]"
			:style="{ 'margin-bottom': (type === 'double' || index !== list.length - 1) ? margin + 'px' : '0px' }" @tap="goGoods(item)">
			<view class="gbc-cover">
				<image v-if="coverOf(item) && !imgErrors[item.id]" class="gbc-cover-img" :src="coverOf(item)"
					mode="aspectFill" @error="onCoverError(item.id)" />
				<!-- 封面为空/加载失败占位：浅灰底 + 居中图标（与打卡/圈子/课程卡兜底一致） -->
				<view v-else class="gbc-cover-img gbc-cover-error">
					<tz-icon name="picture" :size="24" color="#c9cdd4" />
				</view>
				<text class="gbc-badge-team">拼团</text>
				<text class="gbc-badge-type" v-if="showType && item.goods_type_text">{{ item.goods_type_text }}</text>
			</view>
			<view class="gbc-info">
				<view class="gbc-title-row">
					<text class="gbc-tag" v-if="item.tag_text">{{ item.tag_text }}</text>
					<text class="gbc-name">{{ item.goods_name }}</text>
				</view>
				<!-- 倒计时/状态：文案口径见 countdownText()；它每秒跳一次（一个组件一只定时器）。
				     这一行**恒渲染**（不再 v-if）：没有可倒数的行时也要占住同一行高，
				     否则同一排里那一张卡会矮一截（2026-10-29 双列高度不一致） -->
				<text class="gbc-countdown">{{ countdownText(item) }}</text>
				<view class="gbc-price-bar">
					<!-- 第一行恒是「拼团价 + 起 + （单列档跟「拼团价」标签 / 其余跟划线原价）」；
						 单列档的第二行（原价 + 单买价）另起一行 —— 列方向只切行，不把这一行拆成三行 -->
					<view class="gbc-price-col">
						<view class="gbc-price-line">
							<text class="gbc-price">¥{{ priceText(item.price) }}</text>
							<text class="gbc-price-from" v-if="Number(item.price_from) === 1">起</text>
							<text class="gbc-price-label" v-if="type === 'single'">拼团价</text>
							<text class="gbc-origin" v-else>¥{{ priceText(item.origin_price) }}</text>
						</view>
						<view class="gbc-price-line" v-if="type === 'single'">
							<text class="gbc-origin gbc-origin--row2">¥{{ priceText(item.origin_price) }}</text>
							<text class="gbc-price-label">单买价</text>
						</view>
					</view>
					<!-- 「去拼团」按内容收缩、12px 圆角：逐值照抄装修预览的 .gb-btn（参照页优先于 M17 的 4px 按钮通则）。
					     双列那一档不出这枚（卡窄），整卡点击同一条去路 -->
					<text class="gbc-btn" v-if="type !== 'double'" @tap.stop="goGoods(item)">去拼团</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * 卡片的「去拼团」落到**商品详情页**（拼团区与底栏开团入口都在那一页，
 * 与 `group-buy-area` 的宿主页同一处）：拼团详情页要的是团 id（`?team_id=`），
 * 活动 id 进不去，先把学员送到商品页而不是造一个没有团的分支。
 * 路径映射复用全站 `$nav.getPagePath()`（course / physical / composite / circle / checkin 都在里面），
 * 端上不各写一份路径表。
 */
import { priceText } from '@/common/utils/group-buy-share';

export default {
	name: 'tz-group-buy-list',
	props: {
		// 拼团活动卡片（后端 DecorPage 下发，见文件头注释的字段口径）
		list: { type: Array, default: () => [] },
		// list 列表 / single 单列大图 / double 双列
		type: { type: String, default: 'single' },
		// 商品类型角标（装修端「商品类型 显示/隐藏」）
		showGoodsType: { type: [Boolean, Number, String], default: 1 },
		// 圆角/边框（装修端配置下发 1/0，缺省按圆角显示、边框隐藏，与其余 DIY 组件同档）
		round: { type: [Boolean, Number], default: true },
		border: { type: [Boolean, Number], default: false },
		// 卡片间距
		margin: { type: [Number, String], default: 10 },
	},
	data() {
		return {
			// 封面加载失败标记：key = 活动 id（数字，不含点，M27 安全）
			imgErrors: {},
			// 倒计时的「此刻」：一只定时器喂整块卡片（每秒一跳，销毁即清，硬约束 23）
			now: Date.now(),
			timer: null,
		};
	},
	computed: {
		showType() {
			return String(this.showGoodsType) === '1' || this.showGoodsType === true;
		},
		/** 有没有哪一行在倒数（没在倒数就不起定时器） */
		hasCountdown() {
			return (this.list || []).some((item) => {
				const state = Number(item.state);
				if (state === 2 || state === 3) {
					return false;
				}
				const at = state === 0 ? Number(item.start_time) : Number(item.end_time);
				return at > 0;
			});
		},
	},
	watch: {
		/** 数据换了一批（下拉刷新 / 换页）时把此刻与定时器一起对上 */
		list() {
			this.now = Date.now();
			this.startTimer();
		},
	},
	created() {
		this.startTimer();
	},
	beforeDestroy() {
		this.clearTimer();
	},
	beforeUnmount() {
		this.clearTimer();
	},
	methods: {
		priceText,
		coverOf(item) {
			return (item && item.goods_cover) || '';
		},
		onCoverError(id) {
			this.$set(this.imgErrors, id, true);
		},
		/**
		 * 倒计时那一行：进行中倒数到结束、未开始倒数到开始、已结束/已失效直接写状态词
		 * （状态词与状态码都由后端下发，端上不造枚举，M22）
		 * 文案与用户给的设计稿同形：`距结束2天 13:31:26`，不足一天只写时分秒
		 */
		countdownText(item) {
			const state = Number(item.state);
			if (state === 2 || state === 3) {
				return item.state_label || '';
			}
			const at = state === 0 ? Number(item.start_time) : Number(item.end_time);
			if (!(at > 0)) {
				return '';
			}
			const left = Math.max(0, at * 1000 - this.now);
			if (left <= 0) {
				// 到点了但后端还没重算：按当前这一档的终态说，不显示「距结束00:00:00」
				return state === 0 ? '即将开始' : '已结束';
			}
			const total = Math.floor(left / 1000);
			const days = Math.floor(total / 86400);
			const hh = pad2(Math.floor((total % 86400) / 3600));
			const mm = pad2(Math.floor((total % 3600) / 60));
			const ss = pad2(total % 60);
			const prefix = state === 0 ? '距开始' : '距结束';
			return days > 0 ? prefix + days + '天 ' + hh + ':' + mm + ':' + ss : prefix + ' ' + hh + ':' + mm + ':' + ss;
		},
		/**
		 * 去商品详情页（拼团区与开团入口在那一页）
		 *
		 * **要防连点**：整卡 `@tap` 与「去拼团」按钮是同一条去路，小程序里组件的那一发会
		 * 顺着 DOM 冒泡到卡片上，两处各调一次就会 push 两层详情页（用户读出来是
		 * 「点一下进了两页、返回要按两次」）。600ms 窗口合并成一次。
		 */
		goGoods(item) {
			if (!item || !item.goods_id) {
				return;
			}
			const now = Date.now();
			if (this._navAt && now - this._navAt < 600) {
				return;
			}
			this._navAt = now;
			this.$nav.to(this.$nav.getPagePath(item.goods_id, item.goods_type));
		},
		/** 倒计时自续跑：每一跳都过已销毁闸门，没有可倒数的行就停 */
		startTimer() {
			const that = this;
			this.clearTimer();
			if (!this.hasCountdown) {
				return;
			}
			this.timer = setInterval(function tick() {
				if (that._isDestroyed) {
					that.clearTimer();
					return;
				}
				that.now = Date.now();
				if (!that.hasCountdown) {
					that.clearTimer();
				}
			}, 1000);
		},
		clearTimer() {
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
		},
	},
};

function pad2(n) {
	return n < 10 ? '0' + n : String(n);
}
</script>

<style scoped>
.tz-group-buy-list.double {
	display: flex;
	flex-wrap: wrap;
	align-items: stretch;
	justify-content: space-between;
}

.gbc-card {
	background: #fff;
	overflow: hidden;
	position: relative;
	box-sizing: border-box;
}
/* 圆角只由 gbc-card-round 承担：基类再写一次会盖掉「圆角=隐藏」那一档 */
.gbc-card-round {
	border-radius: 10px;
}
.gbc-card-border {
	border: 1px solid #efefef;
}

/* ── 封面 ── */
.gbc-cover {
	position: relative;
	overflow: hidden;
	flex-shrink: 0;
	background-color: #f2f3f5;
}
.gbc-cover-img {
	width: 100%;
	height: 100%;
	display: block;
}
.gbc-cover-error {
	display: flex;
	align-items: center;
	justify-content: center;
}
.gbc-badge-team {
	position: absolute;
	left: 0;
	top: 0;
	padding: 2px 8px;
	border-radius: 0 0 8px 0;
	background: linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%);
	color: #fff;
	font-size: 11px;
	font-weight: 600;
	line-height: 16px;
}
.gbc-badge-type {
	position: absolute;
	right: 6px;
	bottom: 6px;
	padding: 0 6px;
	border-radius: 4px;
	background-color: rgba(0, 0, 0, 0.55);
	color: #fff;
	font-size: 11px;
	line-height: 18px;
}

/* ── 信息区 ── */
.gbc-info {
	min-width: 0;
	flex: 1;
}
.gbc-title-row {
	display: flex;
	align-items: center;
	/* 标题行高度写死：左侧有标签、右侧没有时也占同一行高（双列等高的一半） */
	height: 22px;
}
.gbc-tag {
	flex-shrink: 0;
	margin-right: 6px;
	padding: 0 4px;
	border: 1px solid #cf350e;
	border-radius: 4px;
	color: #cf350e;
	font-size: 11px;
	line-height: 15px;
	/* 标签自身不许折行：折一行就把整张卡顶高（双列会出现一高一矮） */
	white-space: nowrap;
}
.gbc-name {
	/* display:block 才让 nowrap + ellipsis 在所有端都真正生效；
	   同时把行高与高度钉死，名称再长也只占一行（2026-10-29 双列等高 / 列表图片与文字等高） */
	display: block;
	flex: 1;
	min-width: 0;
	height: 22px;
	line-height: 22px;
	color: #1d2129;
	font-size: 16px;
	font-weight: 600;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.gbc-countdown {
	display: block;
	/* 恒渲染 + 固定行高：没有倒数文案的那一行不会把卡片变矮 */
	height: 18px;
	line-height: 18px;
	margin-top: 8px;
	color: #cf350e;
	font-size: 13px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* ── 价条 ── */
.gbc-price-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 8px;
	padding: 0 8px;
	border-radius: 8px;
	background-color: #fff0ee;
	box-sizing: border-box;
}
.gbc-price-col {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	min-width: 0;
}
.gbc-price-line {
	display: flex;
	align-items: baseline;
	min-width: 0;
}
.gbc-price {
	color: #cf350e;
	font-size: 18px;
	font-weight: 700;
}
.gbc-price-from {
	margin-left: 2px;
	color: #cf350e;
	font-size: 12px;
	font-weight: 400;
}
.gbc-price-label {
	margin-left: 4px;
	color: #8a5a4d;
	font-size: 11px;
}
.gbc-origin {
	margin-left: 8px;
	color: #8a5a4d;
	font-size: 12px;
	text-decoration: line-through;
}
/* 第二行（单列档）的原价是行首，不吃第一行那 8px 左距 */
.gbc-origin--row2 {
	margin-left: 0;
}

/* 「去拼团」：逐值照抄装修预览的 .gb-btn（按内容收缩、12px 圆角，flex-shrink 兜住价条挤压）。
   参照页优先于 M17 的 4px 按钮通则；改这里要同步 web 装修预览 */
.gbc-btn {
	flex-shrink: 0;
	height: 24px;
	line-height: 24px;
	padding: 0 12px;
	border-radius: 12px;
	background: linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%);
	color: #fff;
	font-size: 12px;
	font-weight: 600;
}

/* ── 列表档：封面在左 112，高度跟随右侧文字（最低 80），两边恒等高 ── */
.gbc-card.list {
	display: flex;
	align-items: stretch;
	padding: 12px;
}
.gbc-card.list .gbc-cover {
	width: 112px;
	/* 不给死高：align-self:stretch 让封面吃满右侧文字那一行的高度，低于 80 时由 min-height 兜住
	   （2026-10-29 用户点名「左侧的图片与右侧的文字高度不一致」） */
	height: auto;
	min-height: 80px;
	align-self: stretch;
	border-radius: 8px;
}
/* 封面图绝对铺满：父盒高度是 flex 拉伸出来的，百分比高度在部分端解析不到就露灰底 */
.gbc-card.list .gbc-cover-img {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
}
.gbc-card.list .gbc-info {
	min-height: 80px;
	padding-left: 10px;
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.gbc-card.list .gbc-price-bar {
	height: 36px;
	margin-top: 6px;
}

/* ── 单列大图档：封面通栏 196，价条两行 ── */
.gbc-card.single .gbc-cover {
	width: 100%;
	height: 196px;
}
.gbc-card.single .gbc-info {
	padding: 12px;
}
/* 单列档价条两行（18px 价 + 12px 单买价）：高度只能给下限 —— 写死 50 会把这 40px
   两行加 12px 内衬（52）压掉 2px，第二行贴住下沿 */
.gbc-card.single .gbc-price-bar {
	min-height: 50px;
	padding: 6px 8px;
}

/* ── 双列档：两列并排（间距 10），封面 96，价条一行且不放按钮。
   同排等高四件：卡纵轴 flex / 信息区 flex:1 / 标题与倒计时固定行高 / 价条贴底
   （2026-10-29 用户点名「双列会出现高度不一致」） ── */
.gbc-card.double {
	display: flex;
	flex-direction: column;
	width: calc(50% - 5px);
}
.gbc-card.double .gbc-cover {
	width: 100%;
	height: 96px;
}
.gbc-card.double .gbc-info {
	display: flex;
	flex-direction: column;
	flex: 1;
	padding: 10px;
}
.gbc-card.double .gbc-title-row {
	height: 20px;
}
.gbc-card.double .gbc-name {
	height: 20px;
	line-height: 20px;
	font-size: 14px;
}
.gbc-card.double .gbc-countdown {
	height: 17px;
	line-height: 17px;
	margin-top: 6px;
	/* 价条用 margin-top:auto 贴底，两者之间这 6px 离开倒数这一格给 */
	margin-bottom: 6px;
	font-size: 12px;
}
.gbc-card.double .gbc-price-bar {
	height: 28px;
	margin-top: auto;
	padding: 0 6px;
}
.gbc-card.double .gbc-price {
	font-size: 15px;
}
</style>
