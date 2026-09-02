<script>
var that;
import courseItem from '@/pages/app/score/compoents/course.vue';
export default {
	components: { courseItem },
	data() {
		return {
			tabsList: [
				{
					name: '全部',
					id: 0
				}
			],
			form: {
				limit: 15,
				page: 1,
				group: 0,
				search: '',
				order: '',
				sort: ''
			},
			list: [],
			pageParams: {
			},
			modal: {
				sort: false
			},
			sortChecked: 0,
			sortTypes: [
				{
					name: '默认排序',
					sort: 'desc',
					order: '',
					index: 0
				},
				{
					name: '积分高到低',
					index: 1,
					sort: 'desc',
					order: 'score',
				},
				{
					name: '积分低到高',
					index: 2,
					sort: 'asc',
					order: 'score',
				},
				{
					name: '浏览量高到低',
					index: 3,
					sort: 'desc',
					order: 'views',
				},
				{
					name: '浏览量低到高',
					index: 4,
					sort: 'asc',
					order: 'views',
				},
				{
					name: '商品原价高到低',
					index: 5,
					sort: 'desc',
					order: 'price',
				},
				{
					name: '商品原价低到高',
					index: 6,
					sort: 'asc',
					order: 'price',
				}
			],
			config: {
				status: 1
			}
		}
	},
	watch: {
	},
	methods: {

		//类型被切换
		sortSelect(option) {
			this.form.sort = option.sort;
			this.form.order = option.order;
			this.sortChecked = option.index;
			this.refresh();
		},
		groupChange(option) {
			if (this.form.group != option.id) {
				this.form.group = option.id;
				that.refresh();
			}
		},
		getData() {
			uni.showLoading({
        title: '请稍后'
      });

			that.getConfig();
			//资产类型

			that.$api('app.score.list', that.form).then(res => {
				if (res.code === 1) {
					var list = that.list;

					if (that.form.page == 1) {
						list = [];
					}
					for (var i in res.data) {
						list.push(res.data[i])
					}
					that.list = list;
				}

				uni.hideLoading();
			});
			uni.stopPullDownRefresh();
		},
		getGroup() {
			that.tabsList = [
				{
					name: '全部',
					id: 0
				}
			];
			that.$api('app.score.goodsgroup', {}).then(res => {
				if (res.code === 1) {
					that.tabsList = that.tabsList.concat(res.data)
				}
			});
		},
		//刷新
		refresh() {
			that.form.page = 1
			that.list = [];
			uni.showLoading({
        title: '请稍后'
      });
			that.getData();
		},
		getConfig() {
			that.$api('app.score.config', that.form).then(res => {
				if (res.code === 1) {
					that.config = res.data;
				}
			});
		}
	},
	//下拉刷新
	onPullDownRefresh() {
		that.refresh();
	},
	//上划加载
	onReachBottom() {
		that.form.page++;
		that.getData();
	},
	onShow(pageParams) {
		that = this;
		that.pageParams = that.$nav.parsePageParams(pageParams);
		this.getGroup();
		this.refresh();
	},
	onLoad() {
		that = this;

	},
	onShareAppMessage() {
		return this.$nav.share();
	},
	onShareTimeline() {
		return this.$nav.share();
	}
}
</script>