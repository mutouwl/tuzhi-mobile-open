<script>

export default {
	data() {
		return {
			skeletonLoading: true,
			logId: 0,
			report: {},
			// 总用时那一格是否折到第二行（量真实渲染宽度后定，见 measureTimeCell）
			timeWrapped: false,
		};
	},
	computed: {
		/** 左「全部解析」：浅蓝底 + 蓝字（参照图那一枚）。
		    u-button 的 plain+color 只把字与描边染成主色，底色仍是白 —— 浅蓝底必须走 customStyle
		    （自定义样式在 baseColor 之后叠加，能盖住 plain 的白底） */
		btnAllStyle() {
			return {
				width: '100%',
				backgroundColor: '#ebf3fe',
				borderColor: '#ebf3fe',
			};
		},
		/** 右「错题解析」：实心主色（u-button 的 primary 自带，这里只钉宽度） */
		btnWrongStyle() {
			return { width: '100%' };
		},
		/** 总用时：秒 → 「326秒」/「5分26秒」（与参照图那一格同口径，纯数字 + 单位） */
		useTimeText() {
			const sec = Number(this.report.use_time || 0);
			if (sec <= 0) return 0;
			if (sec < 60) return sec;
			const m = Math.floor(sec / 60);
			const s = sec % 60;
			return m + '分' + (s ? s + '秒' : '');
		},
		/** 五格统计：值 / 单位 / 标签 / 颜色档（照参照图：一共=蓝、答对=绿、答错=红、未答与用时=正文色） */
		statCells() {
			const time = this.useTimeText;
			return [
				{ key: 'total', value: this.report.question_count || 0, unit: '题', label: '一共', cls: 'db-stat-blue' },
				{ key: 'right', value: this.report.true_count || 0, unit: '题', label: '答对', cls: 'db-stat-green' },
				{ key: 'error', value: this.report.error_count || 0, unit: '题', label: '答错', cls: 'db-stat-red' },
				{ key: 'blank', value: this.report.unanswered_count || 0, unit: '题', label: '未答题', cls: '' },
				{ key: 'time', value: time, unit: typeof time === 'number' ? '秒' : '', label: '总用时', cls: '' },
			];
		},
		/**
		 * 知识点情况的行（与刷题目录同构）
		 *
		 * 首选后端按目录树汇总的 `catalog_groups`（父行 level=0、子行 level>0，计数已逐级汇总）；
		 * 那一份为空（模拟测试的题不挂刷题本目录、目录全被删）时退回平铺的 `groups` —— 题库分组
		 * 只有一层，读不出父子关系，但至少还答得出「哪一块错得多」。
		 */
		groupRows() {
			const rows = this.report.catalog_groups || [];
			if (rows.length) {
				return rows.map(r => ({
					catalog_id: Number(r.catalog_id || 0),
					level: Number(r.level || 0),
					name: r.name || '未归类',
					total: Number(r.total || 0),
					right: Number(r.right || 0),
					accuracy: Number(r.accuracy || 0),
				}));
			}
			return (this.report.groups || []).map(g => ({
				catalog_id: 0,
				level: 0,
				name: g.group_name || '未分组',
				total: Number(g.total || 0),
				right: Number(g.right || 0),
				accuracy: Number(g.accuracy || 0),
			}));
		},
	},
	methods: {
		finish() {
			this.skeletonLoading = false;
			uni.stopPullDownRefresh();
		},
		/**
		 * 量「总用时」那一格要不要折行
		 *
		 * 判据是真实渲染宽度：数字（.db-stat-num-time，nowrap + inline-block，宽就是文本宽）
		 * 超过五等分列宽（行内容宽 / 5）才折到第二行。不铺字数阈值——各端字号（含微信字号放大）
		 * 与屏宽不同，按字数估会在小屏误判。
		 * 折行后整格占第一列（25%），数字与标签都居中 —— 与上一行的「一共」同一竖轴，
		 * 不再用 JS 算左内衬（算出来贴着行左缘，2026-11-23 用户点名「完全靠近最左侧」）。
		 */
		measureTimeCell() {
			if (this._isDestroyed) return;
			const query = uni.createSelectorQuery();
			query.select('.db-stat-row').boundingClientRect();
			query.select('.db-stat-num-time').boundingClientRect();
			query.exec(res => {
				if (this._isDestroyed || !res || !res[0] || !res[1]) return;
				const row = res[0];
				const timeNum = res[1];
				// 行内容宽 = 行宽 - 左右内衬 4×2（五等分的列宽是内容宽 / 5）
				if (!row.width) return;
				const contentW = row.width - 8;
				this.timeWrapped = timeNum.width > contentW / 5;
			});
		},
		getData() {
			this.skeletonLoading = true;
			this.$api('app.drill_book.work.report', { log_id: this.logId }).then(res => {
				if (res.code !== 1) {
					this.finish();
					this.$u.toast(res.msg || '获取失败');
					return;
				}
				this.report = res.data || {};
				this.timeWrapped = false;
				this.finish();
				// 骨架换真实版式之后再量（小程序的渲染晚于 nextTick 一档，再等一帧）
				this.$nextTick(() => {
					setTimeout(() => this.measureTimeCell(), 50);
				});
			}).catch(err => {
				this.finish();
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
		/**
		 * 全部解析 / 错题解析：落到共用做题页的解析态
		 *
		 * 解析不在这张结果页里再画一遍 —— 与练习/考试同一份 `question-box`
		 * 解析视图（正确答案 / 我的答案 / 解析正文），由做题页按 `scope` 圈定题集。
		 */
		goAnalysis(scope) {
			// 空题也算错题（与做题页「错题解析」的筛选同口径）：答错与未作答都为 0 才拦
			const wrongTotal = Number(this.report.error_count || 0) + Number(this.report.unanswered_count || 0);
			if (scope === 'wrong' && wrongTotal === 0) {
				this.$u.toast('本次没有错题');
				return;
			}
			this.$nav.to('/pages/app/drill_book/work/work?log_id=' + this.logId + '&scope=' + scope, 'local');
		},
	},
	onLoad(options) {
		this.logId = Number(options.log_id || 0);
		if (!this.logId) {
			this.skeletonLoading = false;
			return;
		}
		this.getData();
	},
	// 结果页分享（全站口径）：成绩单标题 + 刷题本封面；H5 端由 $nav.share 设置 JSSDK 卡片
	onShareAppMessage() {
		const book = this.report.drill_book || {};
		const title = (book.name ? (book.name + ' · 正确率 ' + (this.report.accuracy || 0) + '%') : '刷题结果');
		return this.$nav.share(title, '', book.cover || '');
	},
	onShareTimeline() {
		const book = this.report.drill_book || {};
		const title = (book.name ? (book.name + ' · 正确率 ' + (this.report.accuracy || 0) + '%') : '刷题结果');
		return this.$nav.share(title, '', book.cover || '');
	},
};
</script>
