<script>
import { applyH5Share, mpCard } from '@/common/utils/checkin-share';
import { goActivity as goCheckinActivity } from '@/common/utils/checkin-activity';

/**
 * 打卡列表（积分任务「关联打卡」的落点）
 *
 * 清单范围（指定打卡）由后端按 `score_task.checkin.activity_ids` 判，前端只负责分页渲染；
 * 已参与/未参与由接口逐行下发 `is_member`，卡片据此走进度行或价格位（与「我的打卡 / 可参与的打卡」同一只卡）。
 */
export default {
	data() {
		return {
			list: [],
			attr: { join_type: {}, run_state: {}, checkin_mode: {} },
			// 首屏骨架：只在第一份回包（成功或失败）落地前铺，翻页不闪
			loaded: false,
			loading: false,
			hasMore: true,
			loadStatus: 'loadmore',
			loadMsg: '',
			page: 1,
			limit: 20,
			// 未装插件那一档整页不再发请求（onShow / 下拉 / 上拉都从这里收口）
			enabled: true,
			// onShow 重取要跳过 onLoad 之后那一次（同 discover 页的 inited 口径）
			inited: false
		};
	},
	computed: {
		shareTitle() {
			return '打卡列表';
		},
		shareCover() {
			return '';
		}
	},
	onLoad() {
		// 打卡是付费插件（代码即插件）：init 明确回 false 时这一页没有接口可打。
		// 只认 false —— `''` 表示本会话 init 还没回包，不能读成「未安装」（M37③）。
		if (this.$tools.systemConfig('app_isinstall_checkin') === false) {
			uni.showToast({ title: '打卡功能未安装', icon: 'none' });
			setTimeout(() => uni.navigateBack(), 800);
			this.enabled = false;
			this.loaded = true; // 兜底分支也要撤骨架
			return;
		}
		this.refresh();
	},
	onShow() {
		if (!this.enabled) {
			return;
		}
		this.applyShare();
		if (!this.inited) {
			this.inited = true;
			return;
		}
		// 从介绍页/打卡主页退回来：参与态与打卡天数可能变了，静默重取首页（不清列表、不铺骨架）
		if (this.loaded) {
			this.fetch(true, true);
		}
	},
	onPullDownRefresh() {
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
		applyShare() {
			applyH5Share(this.$nav, this.shareTitle, this.shareCover);
		},
		refresh() {
			return this.fetch(true);
		},
		/**
		 * @param {Boolean} reset true = 第一页整份替换；false = 接着上一页追加
		 * @param {Boolean} silent true = onShow 的静默重取（保留已加载内容、失败不改成空态）
		 */
		fetch(reset, silent) {
			if (!this.enabled) {
				return Promise.resolve();
			}
			if (reset) {
				this._seq = (this._seq || 0) + 1;
			}
			const seq = this._seq || 1;
			const page = reset ? 1 : this.page + 1;
			this.loading = true;
			if (reset && !silent) {
				// 只清失败提示，不清列表：下拉刷新等新一页回包整份替换，避免中途闪一下「暂无打卡」
				this.loadMsg = '';
			}
			this.loadStatus = 'loading';
			return this.$api('checkin.checkin.designated', { page: page, limit: this.limit })
				.then((res) => {
					if (this._isDestroyed || seq !== this._seq) {
						return;
					}
					if (res.code === 1) {
						const rows = (res.data && res.data.rows) || [];
						this.list = reset ? rows : this.list.concat(rows);
						this.page = page;
						if (reset) {
							this.attr = (res.data && res.data.attr) || this.attr;
						}
						this.hasMore = !!(res.data && Number(res.data.has_more) === 1);
						this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
					} else {
						this.loadMsg = res.msg || '打卡列表加载失败';
						// 静默重取失败不动分页状态：列表还在、还能继续上拉（下拉可重试）
						if (!silent) {
							this.hasMore = false;
						}
						this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
					}
					this.loaded = true;
					this.loading = false;
					uni.stopPullDownRefresh();
				})
				.catch(() => {
					if (this._isDestroyed || seq !== this._seq) {
						return;
					}
					this.loadMsg = '打卡列表加载失败，请下拉重试';
					if (!silent) {
						this.hasMore = false;
					}
					this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
					this.loaded = true;
					this.loading = false;
					uni.stopPullDownRefresh();
				});
		},
		// 未参与进介绍页、已参与进打卡主页（地址与分流的唯一实现见 common/utils/checkin-activity）
		goActivity(item) {
			goCheckinActivity(item);
		}
	},
	onShareAppMessage() {
		return mpCard(this.$nav, this.shareTitle, this.shareCover);
	},
	onShareTimeline() {
		return mpCard(this.$nav, this.shareTitle, this.shareCover, true);
	}
};
</script>
