<script>
/**
 * 课程列表（积分任务「学完指定课程」的落点）
 *
 * 清单范围（指定课程）由后端按 `score_task.study_course.course_ids` 判，前端只负责分页渲染；
 * 卡片与点击落点全部由 `tz-course` 给（与课程广场同一份版式与详情跳转），本页不另写。
 */
export default {
	data() {
		return {
			list: [],
			// 首屏骨架：只在第一份回包（成功或失败）落地前铺，翻页不闪
			loaded: false,
			loading: false,
			hasMore: true,
			loadStatus: 'loadmore',
			loadMsg: '',
			form: {
				page: 1,
				limit: 10
			}
		};
	},
	onLoad() {
		this.refresh();
	},
	onPullDownRefresh() {
		// 上一发还在飞时不叠加请求，但下拉圈必须收掉，否则一直转
		if (this.loading) {
			uni.stopPullDownRefresh();
			return;
		}
		this.refresh();
	},
	onReachBottom() {
		if (this.loading || !this.hasMore) {
			return;
		}
		this.fetch(false);
	},
	methods: {
		refresh() {
			this.fetch(true);
		},
		/**
		 * @param {Boolean} reset true = 第一页整份替换（下拉/首进）；false = 接着上一页追加
		 */
		fetch(reset) {
			if (reset) {
				// 请求序号：刷新后迟到的旧响应不许拼进新一屏、也不许收 loading
				this._seq = (this._seq || 0) + 1;
			}
			const seq = this._seq || 1;
			const page = reset ? 1 : this.form.page + 1;
			this.loading = true;
			if (reset) {
				this.loadMsg = '';
			} else {
				this.loadStatus = 'loading';
			}
			this.$api('course.designated', { page: page, limit: this.form.limit })
				.then((res) => {
					if (this._isDestroyed || seq !== this._seq) {
						return;
					}
					if (res.code === 1) {
						const rows = res.data || [];
						this.list = reset ? rows : this.list.concat(rows);
						this.form.page = page;
						// 回包不满一页就是最后一页（列表接口不回 total，靠这一条收口）
						this.hasMore = rows.length >= this.form.limit;
						this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
					} else {
						this.loadMsg = res.msg || '课程列表加载失败';
						// 列表还在时不动分页状态：旧内容留着，上拉/下拉都能再试
						if (!this.list.length) {
							this.hasMore = false;
						}
						this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
					}
					this.loaded = true;
					this.loading = false;
					uni.stopPullDownRefresh();
				})
				.catch(() => {
					if (this._isDestroyed || seq !== this._seq) {
						return;
					}
					this.loadMsg = '课程列表加载失败，请下拉重试';
					if (!this.list.length) {
						this.hasMore = false;
					}
					this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
					this.loaded = true;
					this.loading = false;
					uni.stopPullDownRefresh();
				});
		}
	},
	onShareAppMessage() {
		return this.$nav.share();
	},
	onShareTimeline() {
		return this.$nav.share();
	}
};
</script>
