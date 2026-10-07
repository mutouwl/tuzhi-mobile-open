<template>
	<!-- 整卡可点（M19，2026-09-26 用户口径「点击任务列表即可跳转任务详情，不需要再限制单独点击去打卡」）：
	     点这一行任何位置都进任务详情，不再要求用户命中那枚「去打卡」按钮。
	     卡内没有与整卡互斥的动作——「去打卡」与整卡本来就是同一落点，点击冒泡到根节点只触发一次，
	     所以不给按钮另绑 @tap（两处都绑会双触发，退回来要连退两层），这一层也就不需要 .stop；
	     右上角那枚未打卡印章是装饰浮层，pointer-events:none 抢不走整卡的命中（M19 同条） -->
	<view class="ck-task-card" @tap="onGo">
		<view class="ck-task-body">
			<view class="ck-task-head">
				<text class="ck-task-level" v-if="task.level">第 {{ task.level }} 关</text>
				<view class="ck-task-title">{{ task.title }}</view>
				<!-- 右上角状态标签（未解锁/已打卡/未开始/已结束/未到时段/今日休息/次数已满）：文字由后端
				     check_text 一处下发（TaskGate::text），前端不另存一套判据 —— 按钮不再表状态，状态只有这一枚标签 -->
				<text class="ck-task-state" v-if="task.check_text">{{ task.check_text }}</text>
			</view>
			<!-- 打卡时间一行：闯关模式不显示（后端逐行 show_time 给判据，前端不自己比 checkin_mode，M22），
			     闯关任务的起止只是创建时铺下的宽窗口底座，与后台任务列表同一口径 -->
			<view class="ck-task-date" v-if="task.show_time != 0">{{ fmt(task.start_time) }} 至 {{ fmt(task.end_time) }}</view>
			<view class="ck-task-foot">
				<text class="ck-task-count">{{ task.user_count || 0 }}人已打卡</text>
				<!-- 这一枚只是行内的动作提示，点击由整卡接（M19）；不置灰。
				     能不能打卡、不能的话为什么，由任务详情页的吸底按钮按后端同一批字段
				     （can_check / check_msg）判并给原因（ui-baseline-mobile.md M22）。
				     文字取后端逐行下发的 can_makeup，前端不自己比日期、不数剩余次数（M22） -->
				<view class="ck-task-btn">{{ btnText }}</view>
			</view>
		</view>
		<view class="ck-task-stamp" v-if="task.day && task.day < todayStr && !task.done && task.locked != 1 && !task.check_text">未打卡</view>
	</view>
</template>

<script>
export default {
	name: 'tz-checkin-task-card',
	props: {
		task: { type: Object, default: function () { return {}; } },
	},
	data() {
		return { todayStr: this.fmtDate(new Date()) };
	},
	emits: ['go'],
	computed: {
		btnText() {
			return Number(this.task.can_makeup) === 1 ? '去补卡' : '去打卡';
		},
	},
	methods: {
		// 整卡点击上抛给页面决定落点（活动主页/任务日历都是进任务详情页），
		// 组件不判闸门、也不在模板表达式里 $emit 传参（微信小程序端表达式传参可能丢）
		onGo() {
			this.$emit('go', this.task);
		},
		pad(n) { return n < 10 ? '0' + n : '' + n; },
		fmt(ts) {
			if (!ts) return '--';
			const d = new Date(ts * 1000);
			return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate()) + ' ' + this.pad(d.getHours()) + ':' + this.pad(d.getMinutes()) + ':' + this.pad(d.getSeconds());
		},
		fmtDate(d) { return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate()); },
	},
};
</script>

<style scoped>
/* 关卡卡：直角通栏、无阴影、内衬 14、卡间距 10（教务列表条目卡档，同 .school-card / schedule/index 的 .day-group）；
   组件为自定义组件，app.wxss 的全局档进不来，故在组件内按同口径写死数值 */
.ck-task-card {
	background: #fff;
	border-radius: 0;
	padding: 14px;
	margin-bottom: 10px;
	position: relative;
	overflow: hidden;
}
.ck-task-body {
	border-left: 3px solid #0968f6;
	padding-left: 10px;
}
.ck-task-head {
	display: flex;
	align-items: center;
}
.ck-task-level {
	flex: none;
	font-size: 12px;
	color: #0968f6;
	background: #eaf1fe;
	border-radius: 4px;
	padding: 2px 6px;
	margin-right: 6px;
}
.ck-task-title {
	flex: 1;
	min-width: 0;
	font-size: 16px;
	font-weight: bold;
	color: #1d2129;
}
/* 状态标签：与「第 N 关」同一档（12px / 圆角 4 / 内衬 2×6），灰字灰底表示这一档不是可操作状态 */
.ck-task-state {
	flex: none;
	font-size: 12px;
	color: #86909c;
	background: #f2f3f5;
	border-radius: 4px;
	padding: 2px 6px;
	margin-left: 6px;
}
.ck-task-date {
	font-size: 12px;
	color: #86909c;
	margin-top: 6px;
}
.ck-task-foot {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 10px;
}
.ck-task-count {
	font-size: 12px;
	color: #86909c;
}
.ck-task-btn {
	font-size: 13px;
	color: #0968f6;
	background: #eaf1fe;
	/* 卡内动作按钮：圆角 4px（教务按钮/标签同档），不做胶囊 */
	border-radius: 4px;
	padding: 6px 16px;
}
.ck-task-stamp {
	position: absolute;
	right: 6px;
	top: 10px;
	width: 64px;
	height: 64px;
	/* 居中走 flex，不用 line-height = 外径那一档：全局 `*{box-sizing:border-box}`，
	   圆外径 64 里含边框，环一粗过 2px 那份行高就把文字压到圆心下方，flex 与边框粗细无关 */
	display: flex;
	align-items: center;
	justify-content: center;
	/* 环线再宽一倍（3px → 6px，2026-09-26 用户口径），并做出「上深下浅」的渐变透明。
	   渐变只走「四条边各给一档 alpha」这一种写法：border-color 可以是四个值，但**不能是渐变**
	   （border-image 与 border-radius 互斥，圆环上不上色），而 mask / backdrop-filter 在小程序静默失效（§4），
	   内圈再补一个不透明白圆会压住底下的任务标题（这一枚是装饰浮层，中心必须是空的）——
	   四条边是唯一两端都吃、且中心保持透明的画法。
	   四档 alpha 由上到下 0.24 / 0.17 / 0.17 / 0.08：最上一档仍比改版前的 0.28 更淡（用户同一句里
	   要的「再透明一点」），与文字那枚 0.32 拉开，印章读起来是压在卡上的一层水气而不是一块实体。
	   外径 64 里含 6px 环 → 内径 52，「未打卡」14px×3 字转 -18° 后占宽约 43，仍在内径里。
	   相邻档：环 4px / 5px；上一版是 2px（0.35）与 3px（0.28），改 6px 是为了跟这档更淡的底色配平。 */
	border: 6px solid rgba(134, 144, 156, 0.17);
	border-top-color: rgba(134, 144, 156, 0.24);
	border-bottom-color: rgba(134, 144, 156, 0.08);
	border-radius: 50%;
	color: rgba(134, 144, 156, 0.32);
	font-size: 14px;
	/* 800 而非 bold：思源/苹方有这一档；只有常规+粗两档的字体（如雅黑）按 700 落，
	   字重读不出时由字号那一档（13→14px）承担「更粗」 */
	font-weight: 800;
	transform: rotate(-18deg);
	/* 纯装饰的未打卡印章：不参与命中测试，否则压住按钮上沿与卡片右侧空白，点了像没反应 */
	pointer-events: none;
}
</style>
