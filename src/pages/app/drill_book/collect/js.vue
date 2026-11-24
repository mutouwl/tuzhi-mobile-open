<script>

import questionBox from "@/pages/app/exam/components/question-box.vue";
// 目录树可见行 + 导引线（与刷题本首页、错题本共用同一份）
import { buildCatalogRows } from '@/common/utils/drill-book-catalog.js';
// 目录层级树版式（缩进 / 导引线 / 折叠圆钮），三页同一只组件
import DrillCatalog from '../components/drill-catalog.vue';

export default {
	components: { questionBox, DrillCatalog },
	data() {
		return {
			skeletonLoading: true,
			bookId: 0,
			keyword: '',
			// 已生效的搜索词：只有点搜索/清空才切换视图（边打字边切会让树与结果打架）
			appliedKeyword: '',
			// 搜索结果（按题面平铺）
			rows: [],
			page: 1,
			limit: 20,
			total: 0,
			loadStatus: 'loadmore',
			// 取数序号：搜索/下拉可以连发，晚到的旧响应不许盖掉新结果
			reqSeq: 0,
			// 目录视图（照错题本 db-wrong-card）
			groups: [],
			groupTotal: 0,
			collapsed: {},
			// 点目录开练习期间挡重复点击
			starting: false,
			firstShow: true,
		};
	},
	computed: {
		groupEmpty() {
			return Number(this.groupTotal || 0) <= 0;
		},
		/** 目录树可见行（折叠父目录时连它下面整棵子树一起收起；行数据与导引线见共用 util） */
		groupRows() {
			return buildCatalogRows(this.groups, this.collapsed);
		},
	},
	methods: {
		finish() {
			this.skeletonLoading = false;
			uni.stopPullDownRefresh();
		},
		/** 目录视图取数：只摆有收藏的目录，计数含子目录（后端已剪枝） */
		loadGroups(showSkeleton = true) {
			if (showSkeleton) this.skeletonLoading = true;
			this.$api('app.drill_book.mine.collectGroups', { id: this.bookId }).then(res => {
				if (res.code !== 1) {
					this.finish();
					this.$u.toast(res.msg || '获取失败');
					return;
				}
				const d = res.data || {};
				this.groups = d.rows || [];
				this.groupTotal = Number(d.total || 0);
				this.finish();
			}).catch(err => {
				this.finish();
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
		/** 搜索结果取数（题面关键字，分页） */
		getData() {
			const seq = ++this.reqSeq;
			this.loadStatus = 'loading';
			this.$api('app.drill_book.mine.collects', {
				id: this.bookId, keyword: this.appliedKeyword, page: this.page, limit: this.limit,
			}).then(res => {
				if (seq !== this.reqSeq) return;
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
				// 末页判据：本页不满一页即到底（后端会跳过取不到题目的行，用 total 比会永远差几条）
				this.loadStatus = rows.length < this.limit ? 'nomore' : 'loadmore';
				this.finish();
			}).catch(err => {
				if (seq !== this.reqSeq) return;
				this.finish();
				this.loadStatus = 'nomore';
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
		/** 搜索/清空/下拉都走这里：清空回目录视图，有关键字按题面平铺 */
		refresh() {
			this.appliedKeyword = String(this.keyword || '').trim();
			this.page = 1;
			this.rows = [];
			this.loadStatus = 'loadmore';
			this.skeletonLoading = true;
			if (this.appliedKeyword) {
				this.getData();
			} else {
				this.loadGroups();
			}
		},
		toggleGroup(node) {
			this.collapsed = Object.assign({}, this.collapsed, {
				[node.id]: !this.collapsed[node.id],
			});
		},
		openAll() {
			this.startPractice({ all: 1 });
		},
		openGroupRow(node) {
			this.startPractice({ catalog_id: node.id });
		},
		/**
		 * 按所选范围做题：后端把这一范围的收藏题目开成一次练习记录，直接进做题页。
		 * 题集为空时后端回「该范围暂无收藏题目」，这里只负责把提示透出来。
		 */
		startPractice(params) {
			if (this.starting) return;
			this.starting = true;
			this.$api('app.drill_book.mine.collectPractice', Object.assign({ id: this.bookId }, params)).then(res => {
				this.starting = false;
				if (res.code !== 1) {
					this.$u.toast(res.msg || '操作失败');
					return;
				}
				const logId = (res.data && res.data.log_id) || 0;
				if (!logId) {
					this.$u.toast('该范围暂无收藏题目');
					return;
				}
				this.$nav.to('/pages/app/drill_book/work/work?log_id=' + logId, 'local');
			}).catch(err => {
				this.starting = false;
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
		uncollect(q) {
			const vm = this;
			uni.showModal({
				title: '提示',
				content: '确定取消收藏该题目吗？',
				success: function (r) {
					if (!r.confirm) return;
					// modal 回调里 this 不是 vm（普通 function），必须走闭包，否则 this.$api 直接抛错
					vm.$api('app.drill_book.mine.uncollect', {
						id: vm.bookId, question_id: q.id,
					}).then(res => {
						if (res.code !== 1) return;
						vm.rows = vm.rows.filter(x => Number(x.id) !== Number(q.id));
						vm.total = Math.max(0, vm.total - 1);
						vm.$u.toast(res.msg);
					});
				},
			});
		},
	},
	onLoad(options) {
		this.bookId = Number(options.id || 0);
		this.loadGroups();
	},
	// 从做题页 / 取消收藏回来重取一次：目录计数与「所有题目」都要跟着变
	onShow() {
		if (this.firstShow) {
			this.firstShow = false;
			return;
		}
		if (this.appliedKeyword) {
			this.refresh();
		} else {
			// 静默重取，不把已经显示着的目录树先换成骨架
			this.loadGroups(false);
		}
	},
	onReachBottom() {
		if (!this.appliedKeyword || this.loadStatus !== 'loadmore') return;
		this.page++;
		this.getData();
	},
	onPullDownRefresh() {
		this.refresh();
	},
	// 列表页分享：走全站口径（H5 由这一层设 JSSDK 卡片，MP 返回标题/路径）
	onShareAppMessage() {
		return this.$nav.share('我的收藏');
	},
	onShareTimeline() {
		return this.$nav.share('我的收藏');
	},
};
</script>
