<template>
	<view class="checkin-calendar">
		<view class="cc-head">
			<view class="cc-arrow" @tap="changeMonth(-1)"><tz-icon name="return" :size="16" color="#4E5969" /></view>
			<view class="cc-title">
				<text>{{ year }}年{{ month }}月</text>
				<text class="cc-today-btn" @tap="goToday">回今日</text>
			</view>
			<view class="cc-arrow" @tap="changeMonth(1)"><tz-icon name="enter" :size="16" color="#4E5969" /></view>
		</view>
		<view class="cc-week">
			<text v-for="w in weekNames" :key="w">{{ w }}</text>
		</view>
		<view class="cc-grid">
			<view v-for="(cell, i) in cells" :key="i"
				:class="['cc-cell', cell.out ? 'cc-cell-out' : '', cell.isToday && !cell.active ? 'cc-cell-today' : '', cell.active ? 'cc-cell-active' : '']"
				@tap="tapDay(cell)">
				<text class="cc-day">{{ cell.day }}</text>
				<view class="cc-dot" v-if="cell.mark"></view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'tz-checkin-calendar',
	props: {
		// 标记日期映射：{'yyyy-mm-dd': 任意真值}（记录高亮或任务红点由父级决定传法）
		marks: { type: Object, default: function () { return {}; } },
		// 选中日期 yyyy-mm-dd
		selected: { type: String, default: '' },
	},
	data() {
		return {
			year: new Date().getFullYear(),
			month: new Date().getMonth() + 1,
			weekNames: ['日', '一', '二', '三', '四', '五', '六'],
		};
	},
	computed: {
		cells() {
			const first = new Date(this.year, this.month - 1, 1);
			const startWeekday = first.getDay();
			const daysInMonth = new Date(this.year, this.month, 0).getDate();
			const prevDays = new Date(this.year, this.month - 1, 0).getDate();
			const todayStr = this.fmtDate(new Date());
			const cells = [];
			for (let i = startWeekday - 1; i >= 0; i--) {
				cells.push({ day: prevDays - i, out: true });
			}
			for (let d = 1; d <= daysInMonth; d++) {
				const ds = this.year + '-' + this.pad(this.month) + '-' + this.pad(d);
				cells.push({
					day: d,
					date: ds,
					out: false,
					isToday: ds === todayStr,
					mark: !!this.marks[ds],
					active: ds === this.selected,
				});
			}
			const tail = (7 - (cells.length % 7)) % 7;
			for (let d = 1; d <= tail; d++) {
				cells.push({ day: d, out: true });
			}
			return cells;
		},
	},
	methods: {
		pad(n) { return n < 10 ? '0' + n : '' + n; },
		fmtDate(d) { return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate()); },
		changeMonth(step) {
			let m = this.month + step;
			let y = this.year;
			if (m < 1) { m = 12; y--; }
			if (m > 12) { m = 1; y++; }
			this.year = y;
			this.month = m;
			this.$emit('month-change', { year: y, month: m });
		},
		goToday() {
			const now = new Date();
			this.year = now.getFullYear();
			this.month = now.getMonth() + 1;
			this.$emit('month-change', { year: this.year, month: this.month });
		},
		tapDay(cell) {
			if (cell.out || !cell.date) return;
			this.$emit('day-click', cell.date);
		},
	},
};
</script>

<style scoped>
/* 日历卡：直角通栏、无阴影（与 tz-school-calendar 的 .cal-card 同口径，教务全局档）；
   卡间距 10 由调用页的 .school-cards 列表节奏给，组件内部不再自造圆角与阴影 */
.checkin-calendar {
	background: #fff;
	border-radius: 0;
	padding: 12px 8px;
	margin-bottom: 10px;
}
.cc-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 8px 8px;
}
.cc-title {
	font-size: 16px;
	font-weight: bold;
	color: #1d2129;
	display: flex;
	align-items: center;
}
.cc-today-btn {
	font-size: 12px;
	color: #0968f6;
	font-weight: normal;
	margin-left: 10px;
	border: 1px solid #0968f6;
	/* 小元素档：描边按钮圆角 4px（教务 .status / 按钮同档），不做胶囊 */
	border-radius: 4px;
	padding: 1px 8px;
}
/* 月份切换箭头：容器不给 flex 居中，图标就按内联排版坐在容器基线上、被行盒的下伸部顶高约 1px，
   与同行「xxxx年x月」不在一条中心线上（return/enter 字形从基线向上画，本就与中文同高，不必再补光学下沉） */
.cc-arrow {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 4px 10px;
}
.cc-week {
	display: flex;
	padding: 4px 0;
}
.cc-week text {
	flex: 1;
	text-align: center;
	font-size: 12px;
	color: #86909c;
}
.cc-grid {
	display: flex;
	flex-wrap: wrap;
}
.cc-cell {
	width: 14.285%;
	height: 44px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
}
.cc-day {
	font-size: 14px;
	color: #1d2129;
	width: 30px;
	height: 30px;
	line-height: 30px;
	text-align: center;
	border-radius: 50%;
}
.cc-cell-out .cc-day {
	color: #c9cdd4;
}
/* 「今天」只给蓝字，不加底色：实心蓝底是「选中」那一档独占的（与 tz-school-calendar 的
   .cal-panel-day.today / .selected 同一口径，模板里两枚类名互斥）。
   先前今天也铺蓝底，选了别的日期后今天看着仍像被选中 */
.cc-cell-today .cc-day {
	color: #0968f6;
	font-weight: 600;
}
.cc-cell-active .cc-day {
	background: #0968f6;
	color: #fff;
	font-weight: 600;
}
.cc-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: #f53f3f;
	position: absolute;
	bottom: 2px;
}
</style>
