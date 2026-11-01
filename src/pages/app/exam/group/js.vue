<script>
var that;

export default {
	data() {
		return {
			// 首屏取分类树（骨架屏档，M16）：初值给 true，避免首帧先闪空态再跳骨架
			loading: true,
			// 一级分类列表
			categoryList: [],
			activeMenu: 0,
			// 二级分类 tab 数据
			secondCategoryList: [],
			activeSecondMenu: 0,
			// 当前选中分类（一级或二级）的子分类
			currentChildren: [],
			// 练习列表
			goodsList: [],
			goodsLoading: false,
			goodsForm: {
				limit: 10,
				page: 1,
				group_id: 0
			},
			hasMore: true,
			loadStatus: 'loadmore',
			pageParams: {}
		};
	},
	onLoad(options) {
		that = this;
		that.pageParams = options || {};
		that.getList();
	},
	onPullDownRefresh() {
		that.refresh();
	},
	computed: {
		// 当前应直接加载练习列表的分类 ID；为 null 时展示分类导航
		currentGroupId() {
			const first = this.categoryList[this.activeMenu];
			if (!first) return null;
			// 二级 tabs 存在
			if (this.secondCategoryList.length > 0) {
				const second = first.children && first.children[this.activeSecondMenu];
				if (!second) return null;
				// 二级是叶子，直接展示练习
				if (!second.children || second.children.length === 0) {
					return second.id;
				}
				// 二级有子分类（三/四级），展示分类导航
				return null;
			}
			// 一级是叶子，直接展示练习
			if (!first.children || first.children.length === 0) {
				return first.id;
			}
			// 一级有子分类，展示分类导航
			return null;
		}
	},
	methods: {
		refresh() {
			that.goodsList = [];
			that.goodsForm.page = 1;
			that.hasMore = true;
			that.loadStatus = 'loadmore';
			// 加载反馈由骨架屏给（M16）：分类树已落地时只换右栏，不重铺左栏；
			// 右栏先立起骨架，避免「清空列表 → 等分类树回来」那段闪一下「暂无练习」
			that.goodsLoading = !!that.currentGroupId;
			that.getList();
		},

		async getList() {
			const vm = that;
			// 首屏与「树还没落地」才铺骨架；已有树（下拉刷新）保留菜单，只换右栏
			that.loading = !that.categoryList.length;
			try {
				const res = await that.$api('app.exam.exercises.groupTree', {});
				if (that !== vm) return;
				if (res.code === 1) {
					that.categoryList = res.data || [];
					that.activeMenu = 0;
					that.activeSecondMenu = 0;
					that.updateSecondCategory();
					that.reloadGoodsList();
				} else {
					that.goodsLoading = false;
				}
			} catch (err) {
				// 网络异常：两条加载链都收起，落到可下拉重试的空态
				// （老写法没有 catch，骨架会一直铺着、页面永远停在加载态）
				that.goodsLoading = false;
			} finally {
				if (that === vm) {
					that.loading = false;
				}
				uni.stopPullDownRefresh();
			}
		},

		updateSecondCategory() {
			const first = that.categoryList[that.activeMenu];
			if (first && first.children && first.children.length > 0) {
				that.secondCategoryList = first.children.map(item => ({
					name: item.name,
					id: item.id
				}));
				that.activeSecondMenu = 0;
			} else {
				that.secondCategoryList = [];
			}
			that.updateCurrentChildren();
		},

		updateCurrentChildren() {
			const first = that.categoryList[that.activeMenu];
			if (!first) {
				that.currentChildren = [];
				return;
			}
			// 二级 tabs 存在时，取当前二级的子分类
			if (that.secondCategoryList.length > 0) {
				const second = first.children && first.children[that.activeSecondMenu];
				that.currentChildren = (second && second.children) || [];
			} else {
				// 否则取一级的子分类
				that.currentChildren = (first && first.children) || [];
			}
		},

		onMenu(val) {
			that.activeMenu = val;
			that.activeSecondMenu = 0;
			that.updateSecondCategory();
			that.reloadGoodsList();
		},

		onSecondMenu(option) {
			that.activeSecondMenu = option.index;
			that.updateCurrentChildren();
			that.reloadGoodsList();
		},

		// 重置并加载当前选中分类的练习列表（导航模式下不发请求，但要让在途响应作废）
		reloadGoodsList() {
			// 请求序号：切分类/页签后，上一发迟到的响应不许把列表拼进新这一屏、也不许收 loading
			that._goodsSeq = (that._goodsSeq || 0) + 1;
			that.goodsList = [];
			that.goodsForm.page = 1;
			that.hasMore = true;
			that.loadStatus = 'loadmore';
			if (that.currentGroupId) {
				that.loadGoodsList(that.currentGroupId);
			} else {
				that.goodsLoading = false;
			}
		},

		async loadGoodsList(groupId) {
			if (!groupId) return;
			const vm = that;
			// 这一发属于哪一页：返回期间 page 可能已被上拉改掉，判「覆盖/追加」用这一份
			const page = that.goodsForm.page;
			const seq = (that._goodsSeq || 0) + 1;
			that._goodsSeq = seq;

			that.goodsLoading = true;
			that.goodsForm.group_id = groupId;

			try {
				const res = await that.$api('app.exam.exercises.getGoodsList', that.goodsForm);
				if (that !== vm || seq !== that._goodsSeq) return;
				if (res.code === 1) {
					const newList = res.data || [];
					if (page === 1) {
						that.goodsList = newList;
					} else {
						that.goodsList = that.goodsList.concat(newList);
					}
					if (newList.length < that.goodsForm.limit) {
						that.hasMore = false;
						that.loadStatus = 'nomore';
					} else {
						that.loadStatus = 'loadmore';
					}
				} else {
					that.loadStatus = 'loadmore';
				}
			} catch (err) {
				if (that === vm && seq === that._goodsSeq) {
					that.loadStatus = 'loadmore';
				}
			} finally {
				// 旧的迟到响应不许把新那一发的加载态收掉（新的可能还在飞）
				if (that === vm && seq === that._goodsSeq) {
					that.goodsLoading = false;
				}
			}
		},

		onScrollToLower() {
			if (!that.currentGroupId) return;
			if (that.goodsLoading || !that.hasMore) return;
			that.loadStatus = 'loading';
			that.goodsForm.page++;
			that.loadGoodsList(that.goodsForm.group_id);
		},

		// 点击子分类卡片，跳转练习列表页（带 group_id）
		goGoodsList(groupId, groupName, hasChildren) {
			const encodedName = encodeURIComponent(groupName);
			uni.navigateTo({
				url: `/pages/app/exam/goods/goods?group_id=${groupId}&name=${encodedName}`
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
