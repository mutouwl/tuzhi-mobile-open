<template>
	<!-- 加载态：骨架块由课程列表卡自己的骨架档给（tz-course 的 :skeleton），灰块套在真实卡同一只外壳类里，
	     改卡版式时不会出现「真实卡变了、骨架还是老尺寸」（M16，同教务套餐列表 pl-sk-item 档） -->
	<tz-course v-if="loading" :skeleton="true" :skeleton-count="1" :divider="true" :margin="10" />
	<!-- 真实卡：不重抄版式，直接复用课程列表卡 tz-course 的分隔线档（:divider）——封面（圆角 8、右下角磨砂标签）、
	     名称、灰字元信息、底行（进度行或左下角价格位）四处落点全部由课程卡给一份，本组件只做打卡行的字段映射。
	     navigate=false：打卡的落点要按「是否已参与」分流（已参与进打卡主页、未参与进介绍页），
	     课程卡自带的 $nav.getPagePath 只认商品详情，跳转由调用页在 open 里决定 -->
	<tz-course v-else :list="[card]" :divider="true" :last="last" :margin="10" :navigate="false" @click="onOpen" />
</template>

<script>
/**
 * 打卡活动条目卡（「我的打卡」列表与「可参与的打卡」列表共用）
 *
 * 版式来自课程列表卡 tz-course 的分隔线档（本组件是它的打卡适配器），不另存一份卡片样式；
 * 卡内字段口径只存这一处，两个列表页共用，禁止在第二个页面重抄一遍只抄控件不抄字段。
 *
 * 卡内四个落点装一条打卡活动的五个值（元信息行与底行按「是否已参与」二选一）：
 *   封面右下角磨砂标签 ← attr.checkin_mode[checkin_mode]（日历打卡 / 闯关打卡）
 *   名称              ← title
 *   灰字元信息        ← 日期区间 · 已打卡 N 天（已参与）/ 日期区间 · 打卡状态（未参与）
 *   底行              ← 已参与：进度行（图标 + 进度条 + 「状态 已打卡数/总天数」）；
 *                        未参与：参与条件与价格（钱已付过，已参与再摆 ¥ 会被读成待支付）
 * 三处文案一律取接口下发的 attr，前端不写死；状态从封面标签挪到元信息行，是为了把封面那枚位置
 * 让给「这是什么打卡」（与参考图同一落位），未参与行仍要看得见未开始/进行中/已结束。
 * 参与条件五值（free/pay/password/student/course）与课程卡 pay_type 同一套语义、同一份文案，
 * 只有「绑定课程」两边走的键名不同（打卡 join_type=course，课程 pay_type=bind_course），在下面的表里换名。
 * emits: open（点击整卡，回传接口的原始行，不是映射后的课程卡字段）
 */

// 打卡参与条件 → 课程卡 pay_type（键名不同、语义与卡内文案相同；表外的值一律不出价格位）
var JOIN_TYPE_TO_PAY_TYPE = {
	free: 'free',
	pay: 'pay',
	password: 'password',
	student: 'student',
	course: 'bind_course',
};

export default {
	name: 'tz-checkin-activity-card',
	props: {
		item: { type: Object, default: function () { return {}; } },
		// 接口 attr：{ join_type: {值: 文字}, run_state: {值: 文字}, checkin_mode: {值: 文字} }，标签文案唯一来源
		attr: { type: Object, default: function () { return {}; } },
		// 加载态：渲染与真实卡同一只外壳给的骨架，不另起一张骨架卡
		loading: { type: Boolean, default: false },
		// 列表末位：白底容器（如课程详情的打卡活动弹窗）里末条下方不留悬空发丝线，转给课程卡的 divider 档
		last: { type: Boolean, default: false },
	},
	emits: ['open'],
	computed: {
		// 是否已参与只看后端逐行下发的 is_member（我的列表置 1、可参与列表置 0），不由调用页传口径
		isMember() {
			return Number(this.item.is_member) === 1;
		},
		// 课程卡字段：一次映射，卡内四个落点要什么就给什么，不在模板里再算一遍
		card() {
			const card = {
				id: this.item.id,
				name: this.item.title,
				cover: this.item.cover,
				type: this.modeText,
				briefing: this.metaText,
			};
			if (this.isMember) {
				card.progress = this.progress;
			} else {
				card.pay_type = JOIN_TYPE_TO_PAY_TYPE[this.item.join_type] || '';
				card.price = this.item.price;
				// 虚拟支付（代币）时这一格前面不摆 ¥：判据取后端逐行下发的 is_virtual_pay，
				// 怎么画由课程卡自己那一档 price/coin-name 落位给（M22，适配器不再算一遍）
				card.is_virtual_pay = this.item.is_virtual_pay;
			}
			return card;
		},
		modeText() {
			return (this.attr.checkin_mode || {})[this.item.checkin_mode] || '';
		},
		stateText() {
			return (this.attr.run_state || {})[this.item.run_state] || '';
		},
		// 元信息行：一条只放一个事实，日期区间在前、打卡数或状态在后（卡内信息列在 375 屏只有 ≈165px，超出即截断）
		metaText() {
			if (this.isMember) {
				return this.dateText + ' · 已打卡 ' + (Number(this.item.day_count) || 0) + ' 天';
			}
			return this.stateText ? this.dateText + ' · ' + this.stateText : this.dateText;
		},
		// 底行进度：分母是活动总天数（打卡进度按天不按次，同日多条只计一天）
		progress() {
			const day = Number(this.item.day_count) || 0;
			const total = Number(this.item.total_days) || 0;
			// total_days=0 是「结束不限」：没有分母就不画进度条与分数，只把状态说出口
			if (total <= 0) return { percent: null, text: this.stateText };
			return {
				percent: Math.min(100, Math.round((day * 100) / total)),
				text: this.stateText + ' ' + day + '/' + total,
			};
		},
		// 日期区间：固定天数活动每个学员各有自己的窗口，已参与就按成员行上的 own_start/own_end 报，
		// 取不到（未参与没有个人窗口）才退成「每人打卡 N 天」；固定起止两态共用活动起止日
		dateText() {
			if (this.item.time_type == 2) {
				const own = this.isMember ? [this.item.own_start, this.item.own_end] : [];
				if (own[0] && own[1]) return own[0] + ' 至 ' + own[1];
				return '每人打卡 ' + this.item.total_days + ' 天';
			}
			return (this.item.start_date || '') + ' 至 ' + (this.item.end_date || '不限');
		},
	},
	methods: {
		// tz-course 回传的是映射后的卡字段，这里统一换回接口原行再往上报（调用页要读 is_member/cover 等原字段）
		onOpen() {
			this.$emit('open', this.item);
		},
	},
};
</script>
