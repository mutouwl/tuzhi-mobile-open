<script>

export default {
	data() {
		return {
			skeletonLoading: true,
			bookId: 0,
			tabs: [{ name: '练习' }, { name: '试卷' }],
			tabIndex: 0,
			rows: [],
			page: 1,
			limit: 15,
			total: 0,
			loadStatus: 'loadmore',
		};
	},
	computed: {
		source() {
			return this.tabIndex === 0 ? 'practice' : 'paper';
		},
	},
	methods: {
		finish() {
			this.skeletonLoading = false;
			uni.stopPullDownRefresh();
		},
		getData() {
			this.loadStatus = 'loading';
			this.$api('app.drill_book.mine.history', {
				id: this.bookId,
				source: this.source,
				page: this.page,
				limit: this.limit,
			}).then(res => {
				if (res.code !== 1) {
					this.finish();
					this.loadStatus = 'nomore';
					this.$u.toast(res.msg || '获取失败');
					return;
				}
				const d = res.data || {};
				const rows = d.rows || [];
				this.rows = this.page === 1 ? rows : this.rows.concat(rows);
				this.total = Number(d.total || 0);
				// 末页判据取「本页是否满页」：total 与实际行数在过滤后可能脱节，会一直「加载中」
				this.loadStatus = rows.length < this.limit ? 'nomore' : 'loadmore';
				this.finish();
			}).catch(err => {
				this.finish();
				this.loadStatus = 'nomore';
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
		refresh() {
			this.page = 1;
			this.rows = [];
			// 搜索 / 切页签都是换一批内容：回骨架（版式同真实卡），避免闪空态
			this.skeletonLoading = true;
			this.getData();
		},
		onTab(item) {
			const index = typeof item === 'object' ? Number(item.index) : Number(item);
			if (index === this.tabIndex) return;
			this.tabIndex = index;
			this.refresh();
		},
		/** 已交卷 → 结果报告；未完成 → 接着答 */
		openItem(item) {
			if (Number(item.status) === 1) {
				this.$nav.to('/pages/app/drill_book/result/result?log_id=' + item.log_id, 'local');
			} else {
				this.$nav.to('/pages/app/drill_book/work/work?log_id=' + item.log_id, 'local');
			}
		},
	},
	onLoad(options) {
		this.bookId = Number(options.id || 0);
		this.getData();
	},
	onReachBottom() {
		if (this.loadStatus !== 'loadmore') return;
		this.page++;
		this.getData();
	},
	onPullDownRefresh() {
		this.refresh();
	},
	// 列表页分享：走全站口径（H5 由这一层设 JSSDK 卡片，MP 返回标题/路径）
	onShareAppMessage() {
		return this.$nav.share('练习历史');
	},
	onShareTimeline() {
		return this.$nav.share('练习历史');
	},
};
</script>
