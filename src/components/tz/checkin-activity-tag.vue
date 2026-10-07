<template>
	<!-- 动态所属打卡活动的标签：文字取接口下发的 checkin_title，点一下进活动主页。
	     做成组件而不是在动态卡与日记详情各写一份，是因为「同一实体的同一组展示字段分两处」正是被点过名的
	     分叉写法（M15/M24）；版式与可点判据只存这一处，与右侧任务 chip 逐值相同、只差行首那枚图标
	     （calendar = 所属活动 / list = 所属任务）。
	     @tap.stop 是必需的：这一枚挂在整卡可点的卡片里（tz-checkin-record-card 的 .ck-record-card），
	     不 .stop 的话点标签会连带冒泡成「进动态详情」（两层页面叠着 push）；换调用点也不把这条丢掉。
	     行内三段「左侧图标 + 文字 + 右侧指示箭头」，与同行任务 chip 同一落位——两枚都是
	     「点进去看那个实体」，只有一枚挂箭头会被读成只有一枚可点，只有一枚带图会被读成不是一类东西
	     （2026-09-26 用户口径，两样都补齐）。
	     左侧图标字号走 ui-baseline-mobile §1「行内图标」的 16px 墨迹档：uview `calendar` 实测墨迹 0.848
	     ⇒ 16 ÷ 0.848 ≈ 18.9 ⇒ 19 号，与同行 `list` 的 19 号同一档；该字形墨迹中心已低 ≈0.02em（与中文同向）
	     ⇒ 不补 translateY。右侧 arrow-right 也不补（2026-09-26 用户点名它偏下，理由见任务 chip 那个组件）-->
	<view class="ck-activity-tag" v-if="show" @tap.stop="go">
		<u-icon name="calendar" size="19" color="#0968f6"></u-icon>
		<text class="ck-activity-tag__text">{{ title }}</text>
		<u-icon name="arrow-right" size="15" color="#86909c"></u-icon>
	</view>
</template>

<script>
/**
 * 打卡动态的「所属活动」标签（可点 → 活动主页）
 * props: checkinId —— 动态所属打卡活动 id，0 = 取不到活动（没有可去的地方，标签不出，
 *                    避免一枚「看着能点、点了没反应」的死标签）
 *        title —— 标签文字，一律用接口下发的 checkin_title，前端不另存一套说法
 *        replace —— 跳转方式：日记详情页是「动态流 → 日记 → 活动主页」的中转站，
 *                   那一页原先就是 redirectTo（返回键直接落回上一级，不在栈里再叠一层活动主页），
 *                   本组件把这一档保留成 prop，其余调用点（动态卡）走默认的 navigateTo
 * 落位只有一档：动态卡/日记详情页卡底的「关联实体」chip 行，与同行右侧的任务 chip 同一几何同一配色
 * （12px 文字 / 内容高 20 / 圆角 4 / 内衬 5×12 + 1px 描边 #f2f3f5 / 文字 #1d2129 / 左侧图标主色，
 *  数值口径见 ui-baseline-mobile §1 的「关联 chip」行）。
 * 两枚 chip 的间距 8px 由**行首这一枚**的 margin-right 给（写在调用点，组件是 isolated 的）：
 * 挂在「第二枚」上会让它在第一枚收起时带着偏移（同一行只剩一枚时不再贴左缘）
 */
export default {
	name: 'tz-checkin-activity-tag',
	props: {
		checkinId: { type: [Number, String], default: 0 },
		title: { type: String, default: '' },
		replace: { type: Boolean, default: false },
	},
	computed: {
		show() {
			return Number(this.checkinId) > 0 && !!this.title;
		},
	},
	methods: {
		go() {
			if (!this.show) return;
			const url = '/pages/app/checkin/detail/detail?id=' + this.checkinId;
			if (this.replace) uni.redirectTo({ url: url });
			else uni.navigateTo({ url: url });
		},
	},
};
</script>

<style scoped>
/* 卡底 chip 那一档：几何与配色都向同行右侧的任务 chip 看齐（逐值见上面注释与 §1「关联 chip」行）。
   1px 实边是必需的（不是 0.5px）：两枚 chip 都没有写死 height，auto 高度下边框实打实占 2px，
   两边必须同一份数值才对得齐，内衬不能再写 6。
   line-height 给确定值 20 同理是必需的：内部是「图标 + 文字 + 图标」横排，写 normal 时会被 19 号图标
   撑到 ≈22，与同行另一枚明显一高一矮。
   display:flex 只加在这一档：这一枚要在横排里把两枚图标与文字夹在中间，纯行内标签夹不住；
   宿主节点上的 inline-flex/vertical-align 由调用点给（组件是 isolated 的，M12/M21） */
.ck-activity-tag {
	display: flex;
	align-items: center;
	font-size: 12px;
	line-height: 20px;
	padding: 5px 12px;
	border: 1px solid #f2f3f5;
	border-radius: 4px;
	color: #1d2129;
	/* 长活动名不折行：放不下时整行横向滑动（滚动容器由调用点给），折成两行就读不出这是一枚标签 */
	white-space: nowrap;
}
/* 文字与左右两枚图标的间隙各 4：与 .ck-task-tag__text 同一档（那一枚也是两头各一枚图标） */
.ck-activity-tag__text {
	margin: 0 4px;
}
</style>
