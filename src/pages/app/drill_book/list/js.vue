<script>
// 接口行 → 紧凑商品卡 `tz-course-mini` 的字段契约：映射只在 common/utils/drill-book-card.js 一处
// （刷题本列表页 / 课程详情底栏弹窗 / 课程互动栏三处共用，硬约束 11）
import { drillBookCardRows } from '@/common/utils/drill-book-card.js';

export default {
	data() {
		return {
			skeletonLoading: true,
			keyword: '',
			rows: [],
			page: 1,
			limit: 15,
			total: 0,
			loadStatus: 'loadmore',
		};
	},
	computed: {
		// 卡片行：`type` / `pay_type` / `price` / `briefing` 四档由共享映射产出
		cardRows() {
			return drillBookCardRows(this.rows);
		},
	},
	methods: {
		finish() {
			this.skeletonLoading = false;
			uni.stopPullDownRefresh();
		},
		getData() {
			this.loadStatus = 'loading';
			this.$api('app.drill_book.index.list', {
				keyword: this.keyword, page: this.page, limit: this.limit,
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
				// 末页判据取「本页是否满页」：未登录/无权益的行后端会跳过，拿 total 比会一直差几条
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
			// 搜索是换一批内容：回骨架（灰卡由 tz-course 自己的骨架档出），避免中途闪空态
			this.skeletonLoading = true;
			this.getData();
		},
	},
	onLoad() {
		if (this.$tools.systemConfig('app_isinstall_drill_book') === false) {
			this.skeletonLoading = false;
			this.$u.toast('刷题本功能未安装');
			return;
		}
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
	// 列表页分享：走全站口径（H5 端由这一层设置 JSSDK 卡片，MP 端返回标题/路径）
	onShareAppMessage() {
		return this.$nav.share('我的刷题本');
	},
	onShareTimeline() {
		return this.$nav.share('我的刷题本');
	},
};
</script>
