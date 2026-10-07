<template>
	<!--
	  活动规则详情弹层（叠在邀请达人榜榜单弹层之上）。
	  层级：榜单 10210 → 我的邀请 10230 → 本弹层 10330（同 redpacket 10210→10310 那一档显式递增）。

	  为什么是第二只 u-popup 而不是 u-modal：u-modal 内部那只 u-popup 没有传 zIndex
	  （components/uview-ui/components/u-modal/u-modal.vue 模板里没这一参），吃
	  libs/config/props/popup.js 的默认 10075，会被榜单弹层的 10210 整个压住；
	  而 u-popup 的 zIndex 是自己可控的，本模块「我的邀请」叠「榜单」已经是这一档写法（同一族）。
	  口径上也不冲突：M18 那句「弹层之上要弹框必须 u-modal」管的是**确认框**，
	  本屏是商家填的富文本详情（自定义内容），按 M18 该走 u-popup + .school-popup-title 那一档。

	  滚动区：M18⑨d 说「文案类弹层的内容块不套固定高度滚动区」，那一条管的是推荐语那种
	  两三句定长文案；活动规则上限 2000 字（PRD §三-6），不滚就看不完，所以这里按 M6 给确定高度，
	  并取 60vh 那一档——绝大多数规则一屏就读完，不需要先滑一下。

	  弹层内容（2026-10-05 用户点名后）：奖品档位面板在前、规则正文在后，与榜单那一屏同序；
	  那块面板不是本文件的第二份实现，是与 board-list.vue 共用的 prize-list（硬约束 11）。
	-->
	<u-popup
		:show="show"
		mode="bottom"
		bgColor="transparent"
		:round="12"
		:closeable="true"
		:safeAreaInsetBottom="false"
		:zIndex="10330"
		:overlayStyle="{ zIndex: 10320 }"
		@close="close"
	>
		<view class="irr">
			<view class="irr-title">活动规则</view>
			<tz-popup-list height="60vh" padding="0 0 12px" :refreshable="false">
				<!-- 奖品档位面板（第 1~N 名 / 第 N~2N 名 有什么奖励）：2026-10-05 用户点名
				     「查看活动规则弹窗中，也要显示这个第一到N名有什么奖励的这个面板」。
				     与榜单弹层（board-list.vue）共用同一枚 prize-list（硬约束 11：同一组字段两处出现
				     只留一份实现）——本弹层不抄档位行、不抄「查看更多 / 收起」、不抄判据与配色，
				     只递活动段与「自己此刻开着没有」；判据吃后端下发的 status + show_prize，
				     前端不自己算活动状态（M22）。本弹层现在在「进行中但没填规则」那一档也进得来
				     （入口改吃 run_state_key，见 board-list.vue 的 ruleEntryOn），所以这一格
				     与下面的正文空档都可能单独出现，两段各自带自己的空态。
				     摆位与榜单那一屏同序：奖品在前、规则正文在后，都在同一块确定高度的滚动画布里 -->
				<prize-list :activity="activity" :popup-show="show" />
				<tz-parse v-if="html" :content="html" />
				<!-- 正文空档：2026-10-05 用户点名「如果活动规则是空的，那么活动规则弹窗中可以显示空状态提醒」。
				     入口那枚原先吃 show_rule，没勾规则就整枚收掉，这一格成了永远读不到的死代码；改成吃
				     run_state_key 之后「进行中但没填规则」这一档进得来，就得在这里把话说出口。
				     内容交给 u-empty（图标 + 一句文案都是组件自己的，字号/颜色/居中不在这里再抄一遍，M6），
				     落位那一档照 share-gift/activity-detail.vue 的 .sgd-friend-none：u-empty 根节点自带
				     margin:100px !important，不补这档内衬它就贴在上方控件下面，读起来像「顶着一块空白」。
				     这一格是「正文没填」那一档；奖品档位那一格归 prize-list 自己（那边是另一句话），两段分开 -->
				<view class="irr-none" v-else>
					<u-empty
						icon="/static/image/empty.png"
						width="70"
						height="70"
						text="商家暂未填写活动规则"
					></u-empty>
				</view>
			</tz-popup-list>
		</view>
	</u-popup>
</template>

<script>
import prizeList from './prize-list.vue';

/**
 * 邀请达人榜「活动规则」详情弹层
 * props: activity = 后端 board 一并下发的活动段（Setting::forApi：rule_html + show_rule +
 *        show_prize + status + rewards）。收整段而不是只收 rule_html 一句，是为了与榜单弹层
 *        拿到同一份字段组——奖品面板吃的就是它（硬约束 11），本弹层不自建第二份
 */
export default {
	name: 'invite-rank-rule-modal',
	components: { prizeList },
	props: {
		show: { type: Boolean, default: false },
		activity: { type: Object, default: () => { return {}; } },
	},
	// 事件名避开原生名（M28）
	emits: ['close'],
	computed: {
		/** 规则正文：只吃后端那一串现成 html，前端不拼（prop 可能没给，取空串，不在读点抛异常） */
		html() {
			return (this.activity && this.activity.rule_html) || '';
		},
	},
	methods: {
		close() {
			this.$emit('close');
		},
	},
};
</script>

<style scoped>
/* 底部安全区只挂这一份（模板已关 u-popup 的 safeAreaInsetBottom，微信端按全站减半口径）；
   底部那一格内衬交给滚动画布自己给（tz-popup-list 的 padding="0 0 12px"）——
   面板不再写「20px + 安全区」：iPhone X 下那样叠成 20 + 34 = 54px，比同屏礼物/商品弹层
   （内容自己 10px + 安全区 34px = 44px）明显多一截，2026-10-01 用户点名
   「邀请达人榜、分享有礼模块相关的弹窗底部安全距离都太大了，参考其他的 popup 组件」 */
.irr {
	position: relative;
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	padding: 0 16px;
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
	display: flex;
	flex-direction: column;
}
/* 正文空档那一格：只给上下留白，内容与文案全归 u-empty（M6 禁自绘空态）。
   上下留白这一档照 share-gift/activity-detail.vue 的 .sgd-friend-none 逐值抄（40/48）——
   u-empty 根节点自带 margin:100px !important，不补这档它就贴在上方那块奖品面板下面，
   读起来像「顶着一块空白」。这是「正文没填」那一档，奖品那一档归 prize-list 自己，两句不合并 */
.irr-none {
	padding: 40px 0 48px;
}
/* 标题走 .school-popup-title 口径（16px/600 左对齐，不自造居中标题行，M18） */
.irr-title {
	padding: 15px 0 12px;
	font-size: 16px;
	font-weight: 600;
	line-height: 22px;
	color: #1d2129;
	text-align: left;
	flex: none;
}
</style>
