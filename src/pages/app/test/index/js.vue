<script>
/**
 * 考试列表（积分任务「参加考试」的落点）
 *
 * 清单范围（指定考试）由后端按 `score_task.exam.exam_ids` 判，前端只负责分页渲染；
 * 首屏加载态是骨架屏（M16），下拉刷新是唯一的强制重载出口。
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
			// 未装插件那一档整页不再发请求（下拉/上拉都从这里收口）
			enabled: true,
			form: {
				page: 1,
				limit: 10
			}
		};
	},
	onLoad() {
		// 考试是付费插件（代码即插件）：init 明确回 false 时这一页没有接口可打。
		// 只认 false —— `''` 表示本会话 init 还没回包，不能读成「未安装」（M37③）。
		if (this.$tools.systemConfig('app_isinstall_test') === false) {
			uni.showToast({ title: '考试功能未安装', icon: 'none' });
			setTimeout(() => uni.navigateBack(), 800);
			this.enabled = false;
			this.loaded = true; // 兜底分支也要撤骨架，别停在灰块上
			return;
		}
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
			if (!this.enabled) {
				return;
			}
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
			this.$api('app.test.examList', { page: page, limit: this.form.limit })
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
						this.loadMsg = res.msg || '考试列表加载失败';
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
					this.loadMsg = '考试列表加载失败，请下拉重试';
					if (!this.list.length) {
						this.hasMore = false;
					}
					this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
					this.loaded = true;
					this.loading = false;
					uni.stopPullDownRefresh();
				});
		},
		/** 考试时间：未设置时间限制时说「不限」，否则给起止（后端已格式化到分） */
		timeText(item) {
			if (Number(item.test_time_limit) !== 1) {
				return '不限';
			}
			return (item.test_time_start_text || '-') + ' 至 ' + (item.test_time_end_text || '-');
		},
		/** 题量 · 总分 · 时长（取不到的档不摆空标签） */
		metaText(item) {
			const parts = [];
			if (Number(item.question_amount) > 0) {
				parts.push(Number(item.question_amount) + ' 题');
			}
			if (Number(item.score_amount) > 0) {
				parts.push('总分 ' + Number(item.score_amount));
			}
			parts.push(Number(item.test_duration_limit) === 1 && Number(item.test_duration_val) > 0
				? '时长 ' + Number(item.test_duration_val) + ' 分'
				: '时长不限');
			return parts.join(' · ');
		},
		goDetail(item) {
			this.$nav.to('/pages/app/test/detail/detail?id=' + item.id, 'local');
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
