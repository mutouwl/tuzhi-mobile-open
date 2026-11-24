<script>

// 目录树可见行 + 导引线（与刷题本首页、收藏共用同一份）
import { buildCatalogRows } from '@/common/utils/drill-book-catalog.js';
// 目录层级树版式（缩进 / 导引线 / 折叠圆钮），三页同一只组件
import DrillCatalog from '../components/drill-catalog.vue';

export default {
	components: { DrillCatalog },
	data() {
		return {
			skeletonLoading: true,
			bookId: 0,
			// 两个页签（对齐参照产品错题本：刷题按目录树，试卷按每一次模拟测试）
			tabs: [
				{ name: '刷题', key: 'practice' },
				{ name: '试卷', key: 'paper' },
			],
			tabIndex: 0,
			// 刷题页签：目录树（后端已按错题数剪枝，count 含子目录）
			groups: [],
			totalCount: 0,
			catalogCollapsed: {},
			// 试卷页签：每一次已交卷的模拟测试（分页）
			paperGroups: [],
			paperPage: 1,
			paperLimit: 20,
			paperLoadStatus: 'loadmore',
			// 错题列表
			detailMode: false,
			// { mode: 'all' | 'catalog' | 'paper', catalog_id / log_id / paper_id, name }
			currentGroup: {},
			questions: [],
			page: 1,
			limit: 20,
			loadStatus: 'loadmore',
			keyword: '',
			// 管理模式（参照图4）：卡片左侧多选框 + 底部全选/删除
			managing: false,
			selectedIds: [],
		};
	},
	computed: {
		currentKey() {
			const t = this.tabs[this.tabIndex];
			return t ? t.key : 'practice';
		},
		/** 目录树可见行（折叠父目录时连它下面整棵子树一起收起；行数据与导引线见共用 util） */
		groupRows() {
			return buildCatalogRows(this.groups, this.catalogCollapsed);
		},
		groupEmpty() {
			if (this.currentKey === 'paper') return !this.paperGroups.length;
			return Number(this.totalCount || 0) <= 0;
		},
		emptyText() {
			if (this.detailMode) return this.keyword ? '没有匹配的错题' : '该范围暂无错题';
			if (this.currentKey === 'paper') return '暂无试卷错题';
			return '暂无错题';
		},
		allSelected() {
			return this.questions.length > 0 && this.selectedIds.length >= this.questions.length;
		},
		selectedCount() {
			return this.selectedIds.length;
		},
		/** 底部「全选」那枚 u-checkbox 的绑定值（u-checkbox 必须在 group 内，group 吃数组） */
		selectAllValue() {
			return this.allSelected ? ['all'] : [];
		},
	},
	methods: {
		finish() {
			this.skeletonLoading = false;
			uni.stopPullDownRefresh();
		},
		/** 分组取数：刷题拿目录树，试卷按页拿「每一次交卷」 */
		loadGroups() {
			this.detailMode = false;
			this.managing = false;
			this.selectedIds = [];
			this.keyword = '';
			this.questions = [];
			this.groups = [];
			this.totalCount = 0;
			this.paperGroups = [];
			this.paperPage = 1;
			this.paperLoadStatus = 'loadmore';
			this.skeletonLoading = true;
			if (this.currentKey === 'practice') {
				this.loadPracticeGroups();
			} else {
				this.loadPaperGroups();
			}
		},
		loadPracticeGroups() {
			this.$api('app.drill_book.wrong.groups', {
				id: this.bookId,
				source: 'practice',
			}).then(res => {
				if (res.code !== 1) {
					this.finish();
					this.$u.toast(res.msg || '获取失败');
					return;
				}
				const d = res.data || {};
				this.groups = d.rows || [];
				this.totalCount = Number(d.total || 0);
				this.finish();
			}).catch(err => {
				this.finish();
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
		loadPaperGroups() {
			this.paperLoadStatus = 'loading';
			this.$api('app.drill_book.wrong.groups', {
				id: this.bookId,
				source: 'paper',
				page: this.paperPage,
				limit: this.paperLimit,
			}).then(res => {
				if (res.code !== 1) {
					this.finish();
					this.paperLoadStatus = 'nomore';
					this.$u.toast(res.msg || '获取失败');
					return;
				}
				const d = res.data || {};
				const rows = d.rows || [];
				this.paperGroups = this.paperPage === 1 ? rows : this.paperGroups.concat(rows);
				// 末页判据取「本页是否满页」：后端会跳过取不到题干的明细
				this.paperLoadStatus = rows.length < this.paperLimit ? 'nomore' : 'loadmore';
				this.finish();
			}).catch(err => {
				this.finish();
				this.paperLoadStatus = 'nomore';
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
		onTab(item) {
			const index = typeof item === 'object' ? Number(item.index) : Number(item);
			if (index === this.tabIndex) return;
			this.tabIndex = index;
			this.loadGroups();
		},
		toggleGroup(node) {
			this.catalogCollapsed = Object.assign({}, this.catalogCollapsed, {
				[node.id]: !this.catalogCollapsed[node.id],
			});
		},
		openAll() {
			this.openDetail({ mode: 'all', name: '所有题目' });
		},
		openGroupRow(node) {
			this.openDetail({ mode: 'catalog', catalog_id: node.id, name: node.name });
		},
		openPaper(p) {
			this.openDetail({
				mode: 'paper',
				log_id: p.log_id,
				paper_id: p.paper_id,
				name: p.name,
			});
		},
		openDetail(group) {
			this.currentGroup = group || {};
			this.detailMode = true;
			this.skeletonLoading = true;
			this.keyword = '';
			this.managing = false;
			this.selectedIds = [];
			this.page = 1;
			this.questions = [];
			this.loadStatus = 'loadmore';
			this.loadQuestions();
		},
		backToGroups() {
			// 回到分组视图时重取一次：删除 / 重练回来后，目录与试卷的错题数要跟着变
			this.loadGroups();
		},
		/** 当前列表的范围参数（列表 / 重练共用，保证两边口径一致） */
		questionScope() {
			const g = this.currentGroup || {};
			const params = {
				id: this.bookId,
				page: this.page,
				limit: this.limit,
				keyword: this.keyword,
			};
			if (g.mode === 'paper') {
				params.source = 'paper';
				params.log_id = g.log_id || 0;
				params.paper_id = g.paper_id || 0;
			} else {
				params.source = 'practice';
				if (g.mode === 'all') {
					params.all = 1;
				} else {
					params.catalog_id = g.catalog_id || 0;
				}
			}
			return params;
		},
		loadQuestions() {
			this.loadStatus = 'loading';
			this.$api('app.drill_book.wrong.questions', this.questionScope()).then(res => {
				if (res.code !== 1) {
					this.loadStatus = 'nomore';
					this.finish();
					this.$u.toast(res.msg || '获取失败');
					return;
				}
				const d = res.data || {};
				const rows = d.rows || [];
				this.questions = this.page === 1 ? rows : this.questions.concat(rows);
				// 末页判据取「本页是否满页」：后端会跳过取不到题干的行，用 total 比会永远差几条
				this.loadStatus = rows.length < this.limit ? 'nomore' : 'loadmore';
				this.finish();
			}).catch(err => {
				this.loadStatus = 'nomore';
				this.finish();
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
		refreshQuestions() {
			this.page = 1;
			this.questions = [];
			this.selectedIds = [];
			this.loadStatus = 'loadmore';
			// 搜索 / 清空都是换一批内容：回骨架，避免中途闪一下「暂无错题」
			this.skeletonLoading = true;
			this.loadQuestions();
		},
		/** 普通态点卡片不跳转；管理模式点卡片 = 勾选/取消勾选（参照图4） */
		onQuestionTap(q) {
			if (!this.managing) return;
			this.toggleOne(q);
		},
		toggleOne(q) {
			const id = Number(q.id);
			const index = this.selectedIds.indexOf(id);
			if (index === -1) {
				this.selectedIds = this.selectedIds.concat([id]);
			} else {
				this.selectedIds = this.selectedIds.filter(x => x !== id);
			}
		},
		/** 底部「全选」：勾上=全选，取消=清空（u-checkbox-group 的 change 回调） */
		onSelectAllChange(values) {
			this.selectedIds = values && values.length ? this.questions.map(q => Number(q.id)) : [];
		},
		enterManage() {
			this.managing = true;
			this.selectedIds = [];
		},
		exitManage() {
			this.managing = false;
			this.selectedIds = [];
		},
		removeSelected() {
			if (!this.selectedIds.length) return;
			const ids = this.selectedIds.slice();
			const vm = this;
			uni.showModal({
				title: '提示',
				content: '确定从错题本删除选中的 ' + ids.length + ' 道题吗？',
				success: function (r) {
					if (!r.confirm) return;
					vm.$api('app.drill_book.wrong.remove', {
						id: vm.bookId,
						question_ids: ids.join(','),
					}).then(res => {
						if (res.code !== 1) {
							vm.$u.toast(res.msg || '删除失败');
							return;
						}
						vm.$u.toast(res.msg || '已删除');
						// 删除成功即退出管理态（底部回到「管理 / 错题练习」），再重拉第一页
						vm.managing = false;
						vm.page = 1;
						vm.questions = [];
						vm.selectedIds = [];
						vm.skeletonLoading = true;
						vm.loadQuestions();
					}).catch(err => {
						if (err && err.plugin) return;
						vm.$u.toast((err && err.msg) || '网络异常');
					});
				},
			});
		},
		retryCurrent() {
			if (!this.questions.length) {
				this.$u.toast('该范围暂无错题');
				return;
			}
			const params = this.questionScope();
			// 重练吃整个范围（目录/试卷），不吃列表上的搜索词与分页
			delete params.page;
			delete params.limit;
			delete params.keyword;
			this.$api('app.drill_book.wrong.retry', params).then(res => {
				if (res.code !== 1) {
					this.$u.toast(res.msg || '操作失败');
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
		// 兼容旧入口：tab=4 是改版前的「刷题本」页签，落到刷题这一档
		const tab = String(options.tab || '');
		this.tabIndex = tab === 'paper' || tab === '1' ? 1 : 0;
		this.loadGroups();
	},
	onReachBottom() {
		if (this.detailMode) {
			if (this.loadStatus !== 'loadmore') return;
			this.page++;
			this.loadQuestions();
			return;
		}
		if (this.currentKey === 'paper' && this.paperLoadStatus === 'loadmore') {
			this.paperPage++;
			this.loadPaperGroups();
		}
	},
	onPullDownRefresh() {
		// 收条交给请求的每一支退出口（finish 会 stopPullDownRefresh），
		// 立刻收条会让用户看不出刷新有没有结果（M4）
		if (this.detailMode) {
			this.page = 1;
			this.questions = [];
			this.selectedIds = [];
			this.loadQuestions();
			return;
		}
		this.loadGroups();
	},
	// 列表是页内二级视图：系统/浏览器返回先回目录，而不是直接退出错题本
	onBackPress() {
		if (!this.detailMode) return false;
		this.backToGroups();
		return true;
	},
	// 错题本分享（全站口径）：H5 端由 $nav.share 设置 JSSDK 卡片，MP 端返回标题/路径
	onShareAppMessage() {
		return this.$nav.share('错题本');
	},
	onShareTimeline() {
		return this.$nav.share('错题本');
	},
};
</script>
