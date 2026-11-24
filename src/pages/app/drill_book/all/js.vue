<script>
// 接口行 → 紧凑商品卡 `tz-course-mini` 的字段契约：映射只在 common/utils/drill-book-card.js 一处
// （与「我的刷题本」共用，硬约束 11）
import { drillBookCardRows } from '@/common/utils/drill-book-card.js';

/**
 * 刷题本列表（全部上架刷题本）
 *
 * 与「我的刷题本」`drill_book/list/list` 的唯一差别是取数口径：本页走 `allList`，
 * 不按订阅/购买过滤，凡状态正常、未隐藏、已上架的刷题本都摆出来；
 * 点卡进刷题本首页后再按权益显示「购买 / 去学习 / 已拥有」。
 * 版式与卡片映射与「我的刷题本」逐项一致，不另起一套列表形态。
 */
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
			this.$api('app.drill_book.index.allList', {
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
				// 末页判据取「本页是否满页」：与「我的刷题本」同口径，避免 total 与本页行数打架
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
			// 搜索是换一批内容：回骨架（灰卡由 tz-course-mini 自己的骨架档出），避免中途闪空态
			this.skeletonLoading = true;
			this.getData();
		},
	},
	onLoad() {
		// 刷题本是付费插件：未安装时页面代码本不该在盘上，这里只是兜底（与「我的刷题本」同一判据）
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
	onShareAppMessage() {
		return this.$nav.share('刷题本列表');
	},
	onShareTimeline() {
		return this.$nav.share('刷题本列表');
	},
};
</script>
