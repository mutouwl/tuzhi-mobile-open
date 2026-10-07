<template>
	<!-- 动态所属任务的标签：文字取接口下发的 task_title，点一下进任务详情页。
	     做成组件而不是在卡片与日记详情各写一份，是因为「同一实体的同一组展示字段分两处」正是被点过名的
	     分叉写法；版式与可点判据只存这一处。
	     @tap.stop 是必需的：这一枚挂在整卡可点的卡片里（tz-checkin-record-card 的 .ck-record-card）与日记详情
	     正文卡里，不 .stop 的话点标签会连带冒泡成「进动态详情」（两层页面叠着 push）；换调用点也不把这条丢掉。
	     行内三段「左侧图标 + 文字 + 右侧指示箭头」，与同行左侧的打卡名称 chip 同一落位——两枚都是
	     「点进去看那个实体」，只有一枚挂箭头会被读成只有一枚可点，只有一枚带图会被读成不是一类东西
	     （2026-09-26 用户口径，两样都补齐）。
	     左侧图标字号走 ui-baseline-mobile §1「行内图标」的 16px 墨迹档：uview `list` 实测墨迹 0.848 ⇒
	     16 ÷ 0.848 ≈ 18.9 ⇒ 19 号，与同行 `calendar` 的 19 号同一档；该字形墨迹中心已在自身行盒下方 0.90px
	     （`icon-text-baseline.py 19 19 … 0xE650`，≥0.4px 阈值），与同行中文同向 ⇒ 不补 translateY。
	     右侧 arrow-right 也不补（2026-09-26 用户点名它偏下，去掉了原先那 0.5px 下沉，理由见样式块末尾）-->
	<view class="ck-task-tag" v-if="show" @tap.stop="go">
		<u-icon name="list" size="19" color="#0968f6"></u-icon>
		<text class="ck-task-tag__text">{{ title }}</text>
		<u-icon name="arrow-right" size="15" color="#86909c"></u-icon>
	</view>
</template>

<script>
/**
 * 打卡动态的「所属任务」标签（可点 → 任务详情页 M-P8）
 * props: taskId —— 动态挂的任务 id，0 = 普通动态打卡（没有任务可去，标签不出，
 *                避免一枚「看着能点、点了没反应」的死标签；那条文案留在元信息灰字里）
 *        title —— 标签文字，一律用接口下发的 task_title，前端不另存一套说法
 * 落位只有一档：动态卡/日记详情页卡底的「关联实体」chip 行，与同行左侧的打卡名称 chip 同一几何同一配色
 * （12px 文字 / 内容高 20 / 圆角 4 / 内衬 5×12 + 1px 描边 #f2f3f5 / 文字 #1d2129 / 左侧图标主色，
 *  数值口径见 ui-baseline-mobile §1 的「关联 chip」行，与同行的活动 chip（tz-checkin-activity-tag）逐值相同）。
 * 原先还有一档 'tag'（昵称行 #tags 插槽里的纯文字小标签，靠 shape prop 二选一）：2026-09-26 用户口径
 * 「动态列表里的任务标签应该像日记详情页那样显示在动态卡的下方并可以点击」后，两个调用点都落到卡底，
 * 那一档随之下线——同一字段在两处两种形态正是 M15④ 要结束的分叉
 */
export default {
	name: 'tz-checkin-task-tag',
	props: {
		taskId: { type: [Number, String], default: 0 },
		title: { type: String, default: '' },
	},
	computed: {
		show() {
			return Number(this.taskId) > 0 && !!this.title;
		},
	},
	methods: {
		go() {
			if (!this.show) return;
			uni.navigateTo({ url: '/pages/app/checkin/taskdetail/taskdetail?task_id=' + this.taskId });
		},
	},
};
</script>

<style scoped>
/* 卡底 chip 那一档：几何与配色都向同行左侧的打卡名称 chip 看齐（逐值见上面注释与 §1「关联 chip」行）。
   2026-09-26 用户口径「任务标签去掉背景色、增加边框，与左侧的打卡标签一致」——浅蓝 tint 那档描边与底色
   整份换回中性描边，同一行两枚 chip 从此只差图标（日历 = 所属活动 / 清单 = 所属任务）。
   1px 实边是必需的（不是 0.5px）：两枚 chip 都没有写死 height，auto 高度下边框实打实占 2px，
   左边那枚按「5px 内衬 + 1px 描边」算外高 32，本枚必须同一份数值才对得齐，内衬不能再写 6。
   line-height 给确定值 20 同理是必需的：内部是「图标 + 文字 + 图标」横排，写 normal 时会被 19 号图标
   撑到 ≈22，与同行左侧那枚明显一高一矮。
   display:flex 只加在这一档：这一枚要在横排里把两枚图标与文字夹在中间，纯行内标签夹不住；
   宿主节点上的 inline-flex/vertical-align 由调用点给（组件是 isolated 的，M12/M21） */
.ck-task-tag {
	display: flex;
	align-items: center;
	font-size: 12px;
	line-height: 20px;
	padding: 5px 12px;
	border: 1px solid #f2f3f5;
	border-radius: 4px;
	color: #1d2129;
	/* 长任务名不折行：放不下时整行横向滑动（滚动容器由调用点给），折成两行就读不出这是一枚标签 */
	white-space: nowrap;
}
/* 文字与左右两枚图标的间隙各 4：与活动 chip 的 `.ck-activity-tag__text` 同一档（那一枚也是两头各一枚图标） */
.ck-task-tag__text {
	margin: 0 4px;
}
/* 指示箭头照抄打卡名称 chip 右侧那一枚（size 15 / #86909c）：12px 文字 ⇒ uview arrow-right 墨迹 0.787，
   12 ÷ 0.787 ≈ 15.2 ⇒ 15 号。
   2026-09-26 用户点名「箭头 Icon 要和文字垂直方向居中对齐（往上看，现在偏下）」⇒ 去掉原先那 0.5px 光学下沉，
   回到 flex 的几何居中：uview arrow-right 实测墨迹中心本就压在自身行盒中心（相对行盒 −0.03px，
   `python tools/icon-text-baseline.py 15 15 src/components/uview-ui/components/u-icon/fonts/uicon-iconfont.ttf 0xe605`），
   而下沉量是按 12px 中文（低 0.48px）补的——两档取中要的是亚像素位移，在 DPR1 的桌面上会被字形栅格化成
   整像素，用户读出来就是「偏下」。同一档的行尾箭头（活动 chip 的 `.ck-activity-tag` 那一枚）一起改掉，不留一处补一处不补。
   下一档如果还看着不正，是整枚上移 0.5px（translateY(-0.5px)），不要再回到往下。 */
</style>
