<template>
	<!--
	  奖品档位面板（第 1~N 名 / 第 N~2N 名 分别有什么奖励）：**全模块只此一份实现**。
	  硬约束 11「同一组字段出现在两个界面必须抽一份字段组组件」——这一整组（档位行、空态句、
	  「查看更多 / 收起」那一枚、折叠档数、显隐判据、全部档位）现在摆在两处：
	    ① 榜单弹层 pages/course/live/invite-rank/board-list.vue（那一屏顶部）
	    ② 活动规则弹层 pages/course/live/invite-rank/rule-modal.vue（2026-10-05 用户点名
	       「查看活动规则弹窗中，也要显示这个第一到 N 名有什么奖励的这个面板」）
	  两处逐字一样 ⇒ 判据、折叠档数、文案、配色、间距全部只存这一份，调用点只把后端下发的
	  活动段原样递进来（另一处只抄面板不抄判据 / 不抄复位时机，就是这一族的分叉＝本项目记过的两次返工）。
	  类名 irp-（invite-rank-prize）＝这块归本组件所有，榜单与规则弹层都不再自带一份。
	-->
	<view class="irp-act" v-if="actOn">
		<!-- 档位清单可伸缩（2026-10-05 用户点名「第1~N 名、N~2N 名的奖品列表是可以伸缩的，
		     先展示前 3 行，后面如果有的话在下面展示一个查看更多按钮，点击之后再弹出来剩下的列表，
		     同样也可以折叠」）：折叠档只有 3 这一处常量（PRIZE_COLLAPSE_NUM），模板里不写死行数；
		     行本身仍吃后端下发的 rank_start / rank_end / prize_name，前端不拼档位区间（M22） -->
		<view class="irp-prize-row" v-for="(item, index) in prizeShown" :key="'prize-' + index">
			<text class="irp-prize-rank">第 {{ item.rank_start }}-{{ item.rank_end }} 名</text>
			<text class="irp-prize-name">{{ item.prize_name }}</text>
		</view>
		<view class="irp-prize-none" v-if="!prizeAll.length">商家暂未设置奖品</view>
		<!-- 同一枚按钮两态：折着时写「查看更多」并展开到全量，展开后写「收起」再折回前 3 行。
		     入口显隐只判「档位数超过折叠档」（不是「有 prizes 就出」），三行以内不多摆一枚。
		     纯本地状态，不发请求 -->
		<view class="irp-prize-more" v-if="prizeOverflow" @tap="togglePrizes">
			<text class="irp-prize-more-txt">{{ prizeExpanded ? '收起' : '查看更多' }}</text>
			<u-icon :name="prizeExpanded ? 'arrow-up' : 'arrow-down'" size="12" color="#0968f6"></u-icon>
		</view>
	</view>
</template>

<script>
/** 折着的档数：全模块只此一处常量，取行与判定都读它（改折叠档只改这一行，两个调用点都不用动） */
const PRIZE_COLLAPSE_NUM = 3;

export default {
	name: 'invite-rank-prize-list',
	props: {
		/** 后端 board 一并下发的活动段（app\common\library\app\invite_rank\Setting::forApi）：
		 *  显隐与档位只吃这一份（status / show_prize / rewards），前端不重算活动状态（M22） */
		activity: { type: Object, default: () => { return {}; } },
		/** 宿主弹层此刻是否开着：关掉时把展开态折回前 3 行（榜单弹层与规则弹层各传自己那一枚） */
		popupShow: { type: Boolean, default: false },
	},
	data() {
		return { prizeExpanded: false };
	},
	computed: {
		/**
		 * 这块面板要不要露：状态=0（未开启）时整块收掉；后端没勾「展示奖品」时不摆
		 * （否则满屏白面板上浮一条谁都不看的空灰条）。
		 * 显隐判据吃后端下发的两枚字段，前端不自己数有几档（M22）
		 */
		actOn() {
			const act = this.activity || {};
			if (Number(act.status) !== 1) {
				return false;
			}
			return act.show_prize == 1;
		},
		/** 全量档位：后端下发的 rewards 原样取回（prop 可能没给，取空数组，不在读点抛异常，硬约束 23 末条） */
		prizeAll() {
			return (this.activity && this.activity.rewards) || [];
		},
		/** 眼下列着哪几档：折着时只给前 PRIZE_COLLAPSE_NUM 行，展开后给全量。行本身仍是后端那一档，
		 *  前端不拼区间、不排序（M22） */
		prizeShown() {
			return this.prizeExpanded ? this.prizeAll : this.prizeAll.slice(0, PRIZE_COLLAPSE_NUM);
		},
		/** 「查看更多 / 收起」那一枚的显隐：只有档位数超过折叠档才出——三行以内多摆一枚就是空入口 */
		prizeOverflow() {
			return this.prizeAll.length > PRIZE_COLLAPSE_NUM;
		},
	},
	watch: {
		// 换一场直播 / 重取一次榜之后活动段换了一份：展开态复位，仍按前 3 行折着露
		activity() {
			this.prizeExpanded = false;
		},
		// 宿主弹层关掉时一并复位：留着会让下一次打开还是展开着的，用户读出来是「自己没点它就开了」
		popupShow(val) {
			if (!val) {
				this.prizeExpanded = false;
			}
		},
	},
	methods: {
		/** 展开 / 收起：同一枚按钮两态，只翻本地标志，不发请求（档位是同一份后端下发） */
		togglePrizes() {
			this.prizeExpanded = !this.prizeExpanded;
		},
	},
};
</script>

<style scoped>
/* 这块浅底是全站中性灰底分块那一档（M6 底色分块）：压在它上面的三档文字自己算过 WCAG ——
   档位区间 #86909c 6.7:1、奖品名 #1d2129 15.1:1、行内继承色 #4e5969 7.6:1，均 ≥4.5。
   加高亮底（业务色）那一族必须连这几档一起换，硬约束 29②③
   下边距 16（2026-10-06 用户点名「奖品展示框的下边距要大一些，跟下面的排名成员列表有一个间距」，
   原来 8px 与下面那张表贴在一处，读起来像奖品那几行也是列表的一部分）。
   这一格写在共用组件里、不写在调用点：榜单与规则弹层两处同序同距（硬约束 11） */
.irp-act {
	margin-bottom: 16px;
	padding: 10px 12px;
	border-radius: 6px;
	background: #f7f8fa;
}
.irp-prize-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 3px 0;
	font-size: 12px;
	line-height: 17px;
	color: #4e5969;
}
.irp-prize-rank {
	color: #86909c;
}
/* 奖品名那一档压在这块底上是全组最深的一档：12px 要能读出来，不跟着档位区间那一档灰 */
.irp-prize-name {
	font-weight: 500;
	color: #1d2129;
}
.irp-prize-none {
	font-size: 12px;
	color: #86909c;
}
/* 「查看更多 / 收起」那一枚（2026-10-05 点名，档位超过 3 档才出）：居中一行、文案 + 一枚箭头，
   照 u-read-more 那一档写法（text + arrow，展开时箭头朝上）。它是文字动作不是按钮：
   不套 tz-button、也不做胶囊/圆形（M17）；文字与图标都不自带 margin，间距由容器 gap 给。
   压在这块 #f7f8fa 上：#0968f6 实算 4.57:1（≥4.5，硬约束 29①） */
.irp-prize-more {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 2px;
	padding-top: 6px;
}
.irp-prize-more-txt {
	font-size: 12px;
	line-height: 17px;
	color: #0968f6;
}
</style>