<script>
var that;
import courseItem from '@/components/tz/score-goods-card.vue';
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
				// 商品大类（'' = 全部；取值域由 app.score.types 下发，后端按 goods_type 过滤）
				type: '',
				order: '',
				sort: ''
			},
			list: [],
			// 请求序号：切页签/切筛选/下拉刷新时自增，用于丢弃上一个未完成请求的过期响应
			// （否则「书籍」那次晚到的回包会把「全部」的 18 条冲成 1 条）
			reqSeq: 0,
			// 首屏骨架屏：只在「还没有任何流水」时占位，上拉翻页不闪
			loading: false,
			pageParams: {
			},
			// 商品筛选项里的「类型」组：选项由后端下发（TypeGate::available 只给此刻能用的大类），
			// 取不到就留空数组——弹窗自动隐藏类型组，不摆一排必然为空的假选项（M7）
			typeOptions: [],
			modal: {
				filter: false
			},
			sortChecked: 0,
			sortTypes: [
				{
					name: '默认排序',
					value: 'default',
					sort: 'desc',
					order: '',
					index: 0
				},
				{
					name: '积分高到低',
					value: 'score_desc',
					index: 1,
					sort: 'desc',
					order: 'score',
				},
				{
					name: '积分低到高',
					value: 'score_asc',
					index: 2,
					sort: 'asc',
					order: 'score',
				},
				{
					name: '浏览量高到低',
					value: 'views_desc',
					index: 3,
					sort: 'desc',
					order: 'views',
				},
				{
					name: '浏览量低到高',
					value: 'views_asc',
					index: 4,
					sort: 'asc',
					order: 'views',
				},
				{
					name: '商品原价高到低',
					value: 'price_desc',
					index: 5,
					sort: 'desc',
					order: 'price',
				},
				{
					name: '商品原价低到高',
					value: 'price_asc',
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
	computed: {
		// 「展示兑换量」开关（/marketing/score 设置）：缺省 1 = 显示；判据在后端，
		// 端上只读 `app.score.config` 下发的值，不自己判（硬约束 11）
		showRedeemed() {
			const value = this.config && this.config.show_redeemed;
			return value === undefined ? true : Number(value) === 1;
		},
		// 筛选弹窗的排序选项：只取 name/value，请求参数仍只在 sortTypes 一处（硬约束 11）
		sortOptions() {
			return this.sortTypes.map(item => ({ name: item.name, value: item.value }));
		},
		// 当前生效排序：弹窗打开时以它作为待选项
		sortValue() {
			return this.sortTypes[this.sortChecked].value;
		},
		// 筛选入口选中态：非默认排序或选了商品类型即生效（M7 图标转主色）
		filterActive() {
			return this.sortChecked !== 0 || this.form.type !== '';
		}
	},
	methods: {

		//筛选弹窗确认：类型与排序一起落回 form 再统一重取（排序参数与索引仍只由 sortTypes 一处给）
		onFilterConfirm(option) {
			const sortType = this.sortTypes.filter(item => item.value === ((option && option.sort) || 'default'))[0];
			const type = (option && option.type) || '';
			const sortChanged = !!sortType && sortType.index !== this.sortChecked;
			const typeChanged = type !== this.form.type;
			if (!sortChanged && !typeChanged) {
				return;
			}
			if (sortChanged) {
				this.form.sort = sortType.sort;
				this.form.order = sortType.order;
				this.sortChecked = sortType.index;
			}
			this.form.type = type;
			this.refresh();
		},
		groupChange(option) {
			if (this.form.group != option.id) {
				this.form.group = option.id;
				that.refresh();
			}
		},
		getData() {
			that.loading = that.list.length === 0;
			that.getConfig();
			//资产类型
			// 本次请求的「辈分」与页码都在发车前定死：回包时若辈分已变（用户又切了页签/筛选），
			// 这一份是过期响应，不许再写 list / loading —— 否则「书籍」那 1 条的晚到回包
			// 会把「全部」的整页结果盖掉（用户点名「点全部只剩一个商品」）。
			// form 也传快照：request 层会往 data 上塞 token，传引用等于把页面状态交给它改。
			const seq = that.reqSeq;
			const page = that.form.page;
			const form = Object.assign({}, that.form);

			that.$api('app.score.list', form).then(res => {
				if (seq !== that.reqSeq) {
					return;
				}
				if (res.code === 1) {
					const rows = res.data || [];
					// page 用发车时那一份：刷新后 form.page 可能已被上拉改成 2，
					// 拿它判「是不是第一页」会把第一页的结果追加到旧列表上
					that.list = page === 1 ? rows.slice() : that.list.concat(rows);
				}

				that.loading = false;
				uni.stopPullDownRefresh();
			}).catch(() => {
				if (seq !== that.reqSeq) {
					return;
				}
				that.loading = false;
				uni.stopPullDownRefresh();
			});
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
		//筛选弹窗的「类型」选项：与列表同一个后端出口（只给此刻能用的大类），前端不写死
		getTypes() {
			that.$api('app.score.types', {}).then(res => {
				if (res.code === 1) {
					that.typeOptions = res.data || [];
				}
			});
		},
		//刷新（下拉/切筛选/切分组：清空列表 + 自增序号，让在途旧请求作废、骨架屏接管首屏）
		//列表必须清空：切到「全部」时若还留着上一个分组的那几条，一旦新回包晚到/失败，
		//页签已经停在「全部」、屏幕上却是分组的内容（用户点名「全部的列表丢失了」）
		refresh() {
			that.reqSeq++;
			that.form.page = 1
			that.list = [];
			that.loading = true;
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
		this.getTypes();
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