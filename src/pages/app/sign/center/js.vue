<script>
var that;
export default {
	data() {
		return {

			days: [],
			cuntinueDays: 0,
			score: '',
			cur_year: 0, //当前选的年
			cur_month: 0, //当前选的月
			cur_day: 0, //当前选择的天
			today: parseInt(new Date().getDate()), //本日
			toMonth: parseInt(new Date().getMonth() + 1), //本月
			toYear: parseInt(new Date().getFullYear()), //本年
			weeks_ch: ['日', '一', '二', '三', '四', '五', '六'],
			isPresentMonth: false,
			isSign: false,
			showSign: false,
			config: { status: 1 },
      pageParams:{}

		}
	},
	watch: {
	},
	methods: {
		getData() {
			that.getSignList();
		},

		//刷新
		refresh() {
			that.getConfig();
			that.getData();

		},

		// 计算当月1号前空了几个格子
		calculateEmptyGrids() {
			let that = this;
			let emptyDays = [];
			const firstDayOfWeek = new Date(Date.UTC(that.cur_year, that.cur_month - 1, 1)).getDay();
			if (firstDayOfWeek > 0) {
				for (let i = 0; i < firstDayOfWeek; i++) {
					var obj = {
						day: null,
						is_sign: false
					};
					emptyDays.push(obj);
				}
			}
			return emptyDays;
		},
		// 当前签到记录
		getSignList() {
			let that = this;
			let month = that.cur_month.toString().padStart(2, '0');
			let query = `${that.cur_year}-${month}`;
			that.$api('app.sign.index', {
				month: query
			}).then(res => {
				uni.stopPullDownRefresh();
				if (res.code == 1) {
					let emptyDays = that.calculateEmptyGrids();
					that.cuntinueDays = that.cuntinueDays === 0 ? res.data.cuntinue_days : that.cuntinueDays;
					that.days = [...emptyDays, ...res.data.days];
					that.selSign();
				}
			});
		},
		// 选择日期
		selSign() {
			let that = this;
			let selToday = `${that.toYear}-${that.toMonth.toString().padStart(2, '0')}-${that.today.toString().padStart(2, '0')}`;
			let newDay = `${that.cur_year}-${that.cur_month.toString().padStart(2, '0')}-${that.cur_day.toString().padStart(2, '0')}`;
			if (selToday === newDay) {
				let day = that.days.find(item => {
					return item.date === selToday;
				});
				that.isSign = day.is_sign;
			}
		},
		// 计算当月1号前空了几个格子
		calculateEmptyGrids() {
			let that = this;
			let emptyDays = [];
			const firstDayOfWeek = new Date(Date.UTC(that.cur_year, that.cur_month - 1, 1)).getDay();
			if (firstDayOfWeek > 0) {
				for (let i = 0; i < firstDayOfWeek; i++) {
					var obj = {
						day: null,
						is_sign: false
					};
					emptyDays.push(obj);
				}
			}
			return emptyDays;
		},
		//签到
		onSign() {
			let that = this;
			let month = that.cur_month.toString().padStart(2, '0');
			let query = `${that.cur_year}-${month}`;
			that.$api('app.sign.sign', {
				month: query
			}).then(res => {
				if (res.code == 1) {
					that.getSignList();
					that.showSign = true;
				}
			});
		},

		// 切换控制年月，上一个月，下一个月
		handleCalendar(type) {
			const cur_year = parseInt(this.cur_year);
			const cur_month = parseInt(this.cur_month);
			let newMonth = cur_month;
			let newYear = cur_year;
			if (type === 0) {
				//上个月
				newMonth = cur_month - 1;
				this.isPresentMonth = true;
				if (newMonth < 1) {
					newYear = cur_year - 1;
					newMonth = 12;
				}
				if (newYear < this.toYear || (newYear === this.toYear && newMonth <= this.toMonth)) {
					this.isPresentMonth = false;
				}
			} else {
				newMonth = cur_month + 1;
				if (newMonth > 12) {
					newYear = cur_year + 1;
					newMonth = 1;
				}

				if (newYear > this.toYear || (newYear === this.toYear && newMonth > this.toMonth)) {
					this.isPresentMonth = true;
				}
			}
			this.cur_year = newYear;
			this.cur_month = newMonth;
			this.getSignList();
		},
		getConfig() {
			that.$api('app.sign.config', that.form).then(res => {
				if (res.code === 1) {
					that.config = res.data;
				}
			});
		}

	},
	//下拉刷新
	onPullDownRefresh() {
		that.refresh();
	},
	onShow(pageParams) {
		that = this;
		that.pageParams = that.$nav.parsePageParams(pageParams);

		this.refresh();
	},
	onLoad() {
		that = this;

		this.cur_year = this.toYear;
		this.cur_month = this.toMonth;
		this.cur_day = this.today;
	},
	onShareAppMessage() {
		return this.$nav.share();
	},
	onShareTimeline() {
		return this.$nav.share();
	}
}
</script>