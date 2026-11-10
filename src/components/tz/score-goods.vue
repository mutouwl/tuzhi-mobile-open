<template>
	<view v-if="rows.length > 0" class="tz-score-goods">
		<!-- 复用积分商城的同一只卡片组件：DIY 组件只是「取数换来源」，版式不再抄一份（硬约束 11） -->
		<score-goods-card v-for="(item, index) in rows" :key="item.score_goods_id || index" :round="round == 1"
			:border="border == 1" :itemId="item.goods_id" :name="item.name" :type="item.type"
			:typeLabel="item.type_label" :cover="item.cover" :score="item.score" :priceMarking="item.price_marking"
			:redeemed="item.redeemed" :showRedeemed="redeemedVisible" :goodsType="item.goods_type"
			:subType="item.goods_sub_type" :scoreGoodsId="item.score_goods_id" :margin="margin" />
	</view>
</template>

<script>
// 卡片本体必须留在主包：本组件在主包里，引 `pages/app/**`（分包）会打断小程序整棵初始创建
// （渲染层 FLOW_MINIPULATE_CHILD / webviewScriptError，整页组件不渲染）
import scoreGoodsCard from '@/components/tz/score-goods-card.vue';

/**
 * 自定义页（DIY 装修）的「积分商品」组件
 *
 * 数据由装修接口按配置取好下发（`score\DecorPage::components()`：指定积分商品 / 最新 / 指定分组
 * 三档），端上只按配置渲染单列卡片，不再发请求 —— 装修页的取数口径只有后端那一份。
 * 列数只有单列，所以没有 `type` 入参。
 *
 * 空数组时整块不出（`v-if`）：装修摆了一个没配商品的积分组件，不该在页面上留一条空白。
 */
export default {
	components: { scoreGoodsCard },
	props: {
		list: {
			type: [Object, Array],
			default: () => []
		},
		round: {
			type: [Boolean, Number],
			default: 1
		},
		border: {
			type: [Boolean, Number],
			default: 0
		},
		margin: {
			type: Number,
			default: 10
		},
		// 「展示兑换量」开关（/marketing/score 设置）：由装修页读配置后下发
		showRedeemed: {
			type: [Boolean, Number, String],
			default: true
		}
	},
	computed: {
		rows() {
			return Array.isArray(this.list) ? this.list : [];
		},
		// 开关值来自 `app.score.config`（1 / 0 数字），不能拿 `=== true` 比：
		// 数字 1 与 true 严格不等，会把「已兑换 N」整格永久藏掉（隐藏占位看不出开关是开是关）。
		// 与积分商城两页同一档归一：缺省显示，其余按 Number 判 1
		redeemedVisible() {
			const value = this.showRedeemed;
			return value === undefined || value === null ? true : Number(value) === 1;
		}
	}
}
</script>

<style scoped>
/* 列表容器不吃底色：底色由上游 DIY 的 tz-box（config.boxbgColor）与页面底决定，
   卡与卡之间的间隙必须透出那一层（与 tz-course 的 .course-list-box 同口径——它容器无底、
   白只落在每张卡的 .course-item-box 上）。
   2026-11-09 用户点名自定义页 id=74：积分商品列表「明明没设置背景却显示白色」，
   成因就是这里写死了 background:#fff，整条列表（含间隙）被刷成一条白带。 */
.tz-score-goods {
	background: transparent;
}
</style>
