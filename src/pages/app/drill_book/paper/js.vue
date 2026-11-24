<script>

export default {
	data() {
		return {
			skeletonLoading: true,
			bookId: 0,
			keyword: '',
			rows: [],
			page: 1,
			limit: 20,
			total: 0,
			loadStatus: 'loadmore',
		};
	},
	methods: {
		finish() {
			this.skeletonLoading = false;
			uni.stopPullDownRefresh();
		},
		getData() {
			this.loadStatus = 'loading';
			this.$api('app.drill_book.practice.papers', {
				id: this.bookId, keyword: this.keyword, page: this.page, limit: this.limit,
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
				// 末页判据取「本页是否满页」，不用 total 比（后端过滤会让两者永远差几条）
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
			// 搜索是换一批内容，骨架只在首屏 / 搜索时铺；给回实体高度否则整屏塌一下再长回来
			this.skeletonLoading = true;
			this.getData();
		},
		startPaper(p) {
			this.$api('app.drill_book.practice.startPaper', {
				id: this.bookId, paper_id: p.id,
			}).then(res => {
				if (res.code !== 1) {
					this.$u.toast(res.msg || '开始失败');
					return;
				}
				const logId = (res.data && res.data.log_id) || 0;
				this.$nav.to('/pages/app/drill_book/work/work?log_id=' + logId, 'local');
			}).catch(err => {
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
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
		return this.$nav.share('模拟测试');
	},
	onShareTimeline() {
		return this.$nav.share('模拟测试');
	},
};
</script>
