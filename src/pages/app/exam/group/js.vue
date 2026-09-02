<script>
var that;

export default {
	data() {
		return {
			loading: false,
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
			uni.showLoading({ title: '请稍后' });
			that.getList();
		},

		async getList() {
			that.loading = true;
			const res = await that.$api('app.exam.exercises.groupTree', {});
			that.loading = false;
			uni.hideLoading();
			uni.stopPullDownRefresh();
			if (res.code === 1) {
				that.categoryList = res.data || [];
				that.activeMenu = 0;
				that.activeSecondMenu = 0;
				that.updateSecondCategory();
				that.reloadGoodsList();
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

		// 重置并加载当前选中分类的练习列表
		reloadGoodsList() {
			that.goodsList = [];
			that.goodsForm.page = 1;
			that.hasMore = true;
			that.loadStatus = 'loadmore';
			if (that.currentGroupId) {
				that.loadGoodsList(that.currentGroupId);
			}
		},

		async loadGoodsList(groupId) {
			if (!groupId) return;
			that.goodsLoading = true;
			that.goodsForm.group_id = groupId;
			const res = await that.$api('app.exam.exercises.getGoodsList', that.goodsForm);
			that.goodsLoading = false;
			uni.hideLoading();
			if (res.code === 1) {
				const newList = res.data || [];
				if (that.goodsForm.page === 1) {
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
