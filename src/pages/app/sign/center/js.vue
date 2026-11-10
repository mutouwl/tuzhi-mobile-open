<script>
export default {
	data() {
		return {
			days: [],
			cuntinueDays: 0,
			cur_year: 0, //当前选的年
			cur_month: 0, //当前选的月
			cur_day: 0, //当前选择的天
			today: parseInt(new Date().getDate()), //本日
			toMonth: parseInt(new Date().getMonth() + 1), //本月
			toYear: parseInt(new Date().getFullYear()), //本年
			weeks_ch: ['日', '一', '二', '三', '四', '五', '六'],
			isSign: false,
			loaded: false,
			signing: false,
			config: { status: 1 },
			pageParams: {}
		}
	},
	methods: {
		pad(n) {
			return String(Number(n) || 0).padStart(2, '0');
		},
		getData() {
			this.getSignList();
		},
		//刷新
		refresh() {
			this.getConfig();
			this.getData();
		},
		// 计算当月1号前空了几个格子
		calculateEmptyGrids() {
			const emptyDays = [];
			const firstDayOfWeek = new Date(Date.UTC(this.cur_year, this.cur_month - 1, 1)).getDay();
			for (let i = 0; i < firstDayOfWeek; i++) {
				emptyDays.push({ day: null, is_sign: false });
			}
			return emptyDays;
		},
		// 当前签到记录
		getSignList() {
			const month = `${this.cur_year}-${this.pad(this.cur_month)}`;
			const isCurrent = month === `${this.toYear}-${this.pad(this.toMonth)}`;
			this.$api('app.sign.index', { month }).then(res => {
				if (res.code == 1) {
					const data = res.data || {};
					const rows = Array.isArray(data.days) ? data.days : [];
					// 金币形态在 JS 里算好挂到行上：小程序模板的 :class 不支持方法调用
					this.days = [...this.calculateEmptyGrids(), ...rows.map(row => ({
						...row,
						coin_class: this.coinClass(row)
					}))];
					// 连签天数与今日状态只对当前月有意义；翻历史月时保留今天那份
					if (isCurrent) {
						this.cuntinueDays = Number(data.cuntinue_days) || 0;
						this.isSign = !!data.today_signed;
					}
				}
				this.loaded = true;
				uni.stopPullDownRefresh();
			}).catch(() => {
				this.loaded = true;
				uni.stopPullDownRefresh();
			});
		},
		//签到
		onSign() {
			if (this.signing || this.isSign) {
				return;
			}
			const month = `${this.cur_year}-${this.pad(this.cur_month)}`;
			this.signing = true;
			this.$api('app.sign.sign', { month }).then(res => {
				this.signing = false;
				if (res.code != 1) {
					uni.showToast({ title: (res && res.msg) || '签到失败，请稍后重试', icon: 'none' });
					return;
				}
				if (!res.data) {
					this.isSign = true;
					uni.showToast({ title: '今日已签到', icon: 'none' });
					return;
				}
				const score = Number(res.data.score) || 0;
				uni.showToast({
					title: score > 0 ? `签到成功 +${score}积分` : '签到成功',
					icon: 'none'
				});
				this.getSignList();
			}).catch(() => {
				this.signing = false;
			});
		},
		// 切换控制年月，上一个月，下一个月
		handleCalendar(type) {
			let year = parseInt(this.cur_year);
			let month = parseInt(this.cur_month);
			if (type === 0) {
				month -= 1;
				if (month < 1) {
					year -= 1;
					month = 12;
				}
			} else {
				month += 1;
				if (month > 12) {
					year += 1;
					month = 1;
				}
			}
			this.cur_year = year;
			this.cur_month = month;
			this.getSignList();
		},
		getConfig() {
			this.$api('app.sign.config', {}).then(res => {
				if (res.code === 1 && res.data) {
					this.config = res.data;
				}
			}).catch(() => {});
		},
		goRule() {
			this.$nav.to('/pages/app/score/rule/rule', 'local');
		},
		goLog() {
			this.$nav.to('/pages/app/sign/log/log', 'local');
		},
		// 日历金币形态：已签=实心；今天/未来=奖励金；过去未签=灰
		coinClass(item) {
			if (item.is_sign) {
				return 'coin-signed';
			}
			if (item.current === 'today' || item.current === 'after') {
				return item.reward_score > 0 ? 'coin-reward' : 'coin-future';
			}
			return 'coin-past';
		}
	},
	//下拉刷新
	onPullDownRefresh() {
		this.refresh();
	},
	onShow(pageParams) {
		this.pageParams = this.$nav.parsePageParams(pageParams);
		this.refresh();
	},
	onLoad() {
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
