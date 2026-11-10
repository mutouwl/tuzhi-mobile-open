<template>
	<view class="task-list">
		<view v-for="task in tasks" :key="task.key" class="task-row">
			<view class="task-main">
				<view class="task-name-row">
					<text class="task-name">{{ task.name }}</text>
					<text class="task-score" v-if="task.state === 'claimable'">+{{ task.pending_score }}</text>
					<text class="task-score" v-else>+{{ task.score }}</text>
				</view>
				<view class="task-sub">{{ subText(task) }}</view>
			</view>
			<view v-if="task.state === 'claimable'" class="task-action">
				<tz-button size="mini" type="primary" theme="score" :custom-style="actionBtnStyle" :text="'领取' + task.pending_score + '积分'" @click="onClaim(task)" />
			</view>
			<text v-else-if="task.state === 'done'" class="task-done">已完成</text>
			<view v-else class="task-action">
				<!-- 同一列右侧的动作入口一律实底琥珀（与领取那枚同档）：参照页三个任务行都是
					 实底彩钮，灰底「去完成」混在琥珀底色里会被读成另一档 -->
				<tz-button size="mini" type="primary" theme="score" :custom-style="actionBtnStyle" :text="actionText(task)" @click="onGo(task)" />
			</view>
		</view>
		<!-- 自定义积分规则先看规则再去逛（2026-11-10 用户点名）：弹窗底部「去逛逛」才落跳转，
		     跳转本身仍交给页面混入的 goTask，与其它任务同一出口 -->
		<consume-rule-popup :show="ruleVisible" :task="ruleTask" @close="closeRule" @confirm="confirmRule" />
	</view>
</template>

<script>
// 任务行（积分中心首页与「全部任务」页共用）：动作文字只由 state 决定，判据与状态由后端下发
import ConsumeRulePopup from './consume-rule-popup.vue';

const ACTION_TEXT = {
	sign: '去签到',
	bind_mobile: '去绑定',
	profile: '去完善',
	study_time: '去学习',
	study_course: '去学习',
	checkin: '去打卡',
	exam: '去考试',
	// 消费发放（基础规则与自定义活动）不在 score_task 里，但也走同一份任务行渲染
	consume: '去逛逛',
	consume_activity: '去逛逛',
};

export default {
	name: 'ScoreTaskList',
	components: { ConsumeRulePopup },
	props: {
		tasks: { type: Array, default() { return []; } },
	},
	emits: ['claim', 'go'],
	data() {
		return {
			// 自定义规则弹窗：点了才取任务那一行，关闭即复位
			ruleVisible: false,
			ruleTask: {},
			// 任务行动作钮（mini 档）上下内衬 2 → 6（热区 20 → 28），「领取 / 去签到 / 去逛逛」同列同档一起变。
			// 走 tz-button 的 customStyle 而不是本组件样式表：微信端组件默认样式隔离，`::v-deep` 只对 H5 生效，
			// 小程序端会退回 mini 档的 2px，与 H5 差一档（2026-11-09 用户点名「小程序端上下边距跟 H5 不一样」）。
			// 写字符串不写对象：MP 端 `:style` 绑对象不序列化，inline 样式会静默失效。
			actionBtnStyle: 'padding-top:6px;padding-bottom:6px',
		};
	},
	methods: {
		subText(task) {
			if (task.state === 'claimable') {
				return '有 ' + (task.pending_count || 0) + ' 笔奖励待领取';
			}
			if (task.progress && task.progress.text) {
				return task.progress.text;
			}
			if (task.progress && Number(task.progress.target) > 0) {
				return '今日已学 ' + Number(task.progress.current || 0) + '/' + Number(task.progress.target) + ' ' + (task.progress.unit || '分钟');
			}
			return task.tip || '';
		},
		actionText(task) {
			return ACTION_TEXT[task.key] || '去完成';
		},
		onClaim(task) {
			this.$emit('claim', task);
		},
		onGo(task) {
			// 自定义消费活动：右侧按钮先开规则弹窗（后端 consume.source=activity 才给规则明细），
			// 弹窗底部「去逛逛」再走同一出口；无明细（老回包/其它任务）维持原行为
			if (task.key === 'consume_activity' && task.consume && task.consume.source === 'activity') {
				this.ruleTask = task;
				this.ruleVisible = true;
				return;
			}
			this.$emit('go', task);
		},
		closeRule() {
			this.ruleVisible = false;
			this.ruleTask = {};
		},
		confirmRule() {
			const task = this.ruleTask;
			this.closeRule();
			if (task && task.key) {
				this.$emit('go', task);
			}
		},
	},
};
</script>

<style scoped>
.task-list {
	background: #fff;
}

.task-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 15px;
	border-bottom: 1px solid #f2f3f5;
}

.task-row:last-child {
	border-bottom: none;
}

.task-main {
	flex: 1;
	min-width: 0;
	padding-right: 12px;
}

.task-name-row {
	display: flex;
	align-items: center;
	gap: 8px;
}

.task-name {
	font-size: 15px;
	color: #1d2129;
	font-weight: 500;
}

.task-score {
	font-size: 12px;
	/* 2026-11-08 用户点名「每个任务加多少积分，这个数值也可以调整为对应的这个主题色，看起来会活动属性更强一些」。
	   取积分中心页顶部余额区那条琥珀渐变（`score/home` 的 `.score-head`：`#ef8531 → #f2a03a → #f8ca47`）
	   的深端 `#ef8531` 同色相（hue 26.8 / 86%）压到 L36% 得到 `#AA530D`：白底 5.31:1、页面底 `#fafafa` 上 5.09:1，
	   两档都过 4.5（硬约束 29①——十二px 小字压在白底上不能用渐变本体，那个只有 2.60:1） */
	color: #AA530D;
	font-weight: 600;
}

.task-sub {
	margin-top: 4px;
	font-size: 12px;
	color: #86909c;
}

.task-action {
	flex-shrink: 0;
}

/* 2026-11-09 用户点名「去逛逛按钮上下边距稍稍增大，4px 左右」→ 再点名「小程序端与 H5 不一致，对齐 H5」：
   上下内衬已改由 tz-button 的 customStyle 下发（见 data.actionBtnStyle），两端同一条路径；
   本组件样式表里不再写 `::v-deep .tuzi-btn`（小程序端穿不进组件、还会被读成「已经改过了」） */

.task-done {
	flex-shrink: 0;
	font-size: 12px;
	/* 「已完成」与右侧那枚按钮同一档琥珀字：同一个状态列的三种形态（实底钮 / 已完成 / 实底钮）
	   共用一套模块色，不再让中间那一枚退回全站冷灰（用户原话「包括已完成」） */
	color: #AA530D;
}
</style>
