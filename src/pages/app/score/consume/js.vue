<script>
/**
 * 消费发放任务「指定商品」清单（积分任务「去逛逛」的落点）
 *
 * 范围由后端按规则的 goods_scope/goods 归一后下发（基础规则与自定义活动同一份
 * GoodsScope），本页只负责分页渲染九类商品卡；卡片只读展示 + 点击进商详，
 * 不在这里另算件数或奖励（判据在后端）。
 */
export default {
	data() {
		return {
			list: [],
			// 首屏骨架只在第一份回包落地前铺，翻页不闪
			loaded: false,
			loading: false,
			hasMore: true,
			loadStatus: 'loadmore',
			loadMsg: '',
			source: 'base',
			activityId: 0,
			form: {
				page: 1,
				limit: 10
			}
		};
	},
	onLoad(options) {
		const opt = options || {};
		this.source = opt.source === 'activity' ? 'activity' : 'base';
		this.activityId = Number(opt.activity_id) || 0;
		this.refresh();
	},
	onUnload() {
		this._isDestroyed = true;
	},
	onPullDownRefresh() {
		// 上一发还在飞时不叠加请求，但下拉圈必须收掉
		if (this.loading) {
			uni.stopPullDownRefresh();
			return;
		}
		this.refresh();
	},
	onReachBottom() {
		if (this.loading || !this.hasMore) {
			return;
		}
		this.fetch(false);
	},
	methods: {
		refresh() {
			this.fetch(true);
		},
		/**
		 * @param {Boolean} reset true = 第一页整份替换（下拉/首进）；false = 接着上一页追加
		 */
		fetch(reset) {
			if (reset) {
				// 请求序号：刷新后迟到的旧响应不许拼进新一屏、也不许收 loading
				this._seq = (this._seq || 0) + 1;
			}
			const seq = this._seq || 1;
			const page = reset ? 1 : this.form.page + 1;
			this.loading = true;
			if (reset) {
				this.loadMsg = '';
			} else {
				this.loadStatus = 'loading';
			}
			this.$api('app.score.consumeGoods', {
				source: this.source,
				activity_id: this.activityId,
				page: page,
				limit: this.form.limit
			}).then((res) => {
				if (this._isDestroyed || seq !== this._seq) {
					return;
				}
				if (res.code === 1) {
					const rows = (res.data || []).map((row) => Object.assign({}, row, { rowKey: row.type + '_' + row.id }));
					this.list = reset ? rows : this.list.concat(rows);
					this.form.page = page;
					// 回包不满一页就是最后一页（列表接口不回 total）
					this.hasMore = rows.length >= this.form.limit;
					this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
				} else {
					this.loadMsg = res.msg || '商品列表加载失败';
					if (!this.list.length) {
						this.hasMore = false;
					}
					this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
				}
				this.loaded = true;
				this.loading = false;
				uni.stopPullDownRefresh();
			}).catch(() => {
				if (this._isDestroyed || seq !== this._seq) {
					return;
				}
				this.loadMsg = '商品列表加载失败，请下拉重试';
				if (!this.list.length) {
					this.hasMore = false;
				}
				this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
				this.loaded = true;
				this.loading = false;
				uni.stopPullDownRefresh();
			});
		},
		coverOf(item) {
			return item.cover || '/static/image/default-goods.jpg';
		},
		onCoverError(item) {
			// 取不到封面就换全站默认商品图，避免那一格永远空白（M65）
			item.cover = '/static/image/default-goods.jpg';
		},
		/** 价格位：有价出「¥xx」，0 元/免费档出「免费」（与课程卡 no-price 同口径，不空着） */
		priceText(item) {
			const price = parseFloat(item.price);
			if (!(price > 0)) {
				return '免费';
			}
			return '¥' + price;
		},
		openItem(item) {
			// 九类商品 → 详情页的映射只走 $nav 的 type switch，不在这里另拼路径
			this.$nav.to(item.id, item.type);
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
