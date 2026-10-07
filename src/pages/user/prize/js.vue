<script>
import { mpKey } from '@/common/utils/mp-data-key';
import { prizeImage } from '@/common/utils/prize';

/**
 * 我的奖品（标准版奖品能力）：**跨所有发奖业务**里中的奖，分页 + 上拉加载（M3）。
 *
 * 2026-10-03 自 `pages/app/share-gift/prize/` 搬到这里：奖品已升入标准版，
 * 这一页不再是分享有礼的插件页（插件未装时插件文件根本不存在），所以：
 *   · 安装守卫整段删掉——没有插件可判，页面恒定存在；
 *   · 接口从 share_gift.prize.* 改指核心的 prize.prize.*（旧口在插件里留作老版本兼容，见后端 share_gift/Prize.php）。
 *
 * 不用模块级 that（M23：同一路由在页面栈里出现两次时，写入会打到已销毁的那个实例上，
 * 症状是按钮点不动、骨架屏永不撤、而接口其实成功），回调一律箭头函数吃 this。
 */
export default {
	data() {
		return {
			list: [],
			// 初值 true：首帧就铺骨架屏，不闪一帧空态（M16）
			loading: true,
			fetching: false,
			// 取失败那一句：空态吃它，不把接口故障说成「暂无奖品」（M13）
			errorText: '',
			// 领取期提示那一句由接口下发（前端不自己写「15 天」）
			deadlineTip: '',
			page: 1,
			hasMore: false,
			loadStatus: 'loadmore',
			PAGE_SIZE: 20,
			// 在途那一次的 promise：下拉刷新撞上翻页请求时挂在同一趟上，指示器不能在数据回来之前就收（M4）
			inflight: null,
			// 首屏那一次取数由 onLoad 发起；第一次 onShow 与它属同一次进页，不能再叠一次
			shownOnce: false,
			// 奖品图加载失败的记录（按 mpKey(地址) 记，不用下标：翻页后下标会串到别的奖品上）。
			// 地址原样作 data 的键会被 setData 当嵌套路径解析后抛错，见 common/utils/mp-data-key
			coverErrors: {},
			// 没配图 / 加载失败时的兜底图（与套餐卡、校区卡同一张默认商品图）
			defaultCover: '/static/image/default-goods.jpg',
		};
	},
	watch: {
		// 换一批奖品时把失败记录复位（重新取数可能是另一批图了，也可能是同一张图已经恢复了）
		list() {
			this.coverErrors = {};
		},
	},
	methods: {
		cover(src) {
			return prizeImage(src, this.$tools);
		},
		/**
		 * 封面该走真实图还是兜底图：没配图、或这张图已经加载失败过一次，都落兜底。
		 * 判据是「后端给的 cover」而不是自己按 type 猜有没有图（M22）。
		 */
		showCover(item) {
			return !!this.cover(item.cover) && !this.coverErrors[mpKey(item.cover)];
		},
		onCoverError(item) {
			if (item.cover) {
				this.$set(this.coverErrors, mpKey(item.cover), true);
			}
		},
		/**
		 * 一行只讲一件事：来源活动与中奖日期各一段，两段都没有就整行收起，
		 * 不留一句没人认领的「来自 」
		 */
		fromLine(item) {
			const parts = [];
			if (item.from_title) {
				parts.push('来自 ' + item.from_title);
			}
			if (item.win_time_text) {
				parts.push(item.win_time_text);
			}
			return parts.join(' · ');
		},
		fetchPage(page) {
			return this.$api('prize.prize.myPrizes', { page, limit: this.PAGE_SIZE })
				.then((ret) => (ret && ret.code === 1 ? ret.data || {} : null))
				.catch(() => null);
		},
		/**
		 * 取一页。refresh 为真回到第一页；silent 为真时不铺骨架屏（退回本页那一次重取，
		 * 看的是同一张列表，闪骨架算偏离 —— M23）
		 */
		loadList(refresh, silent) {
			if (this.fetching) {
				return this.inflight || Promise.resolve();
			}
			// 这一页只有登录用户才有数据（myPrizes 按 auth->id 过滤），但直播间那一枚入口是免登录接口
			// 顶出来的：活动详情主按钮「查看我的奖品」（gift/detail 免登录，达标那一档才出这一枚），
			// 加上个人中心的「我的奖品」那一格。
			// 请求层对 auth:true 且无 token 是直接 cancel 的，不拦就会落到下面那句
			// 「奖品获取失败，请重试」——把「没登录」说成「服务坏了」，重试永远等不来结果（M13）。
			if (!uni.getStorageSync('user_token')) {
				this.loading = false;
				this.loadStatus = 'nomore';
				this.errorText = '登录后可查看你中的奖品';
				return Promise.resolve();
			}
			const page = refresh ? 1 : this.page + 1;
			this.fetching = true;
			if (refresh && !silent) {
				this.loading = true;
			}
			this.loadStatus = 'loading';
			this.inflight = this.fetchPage(page).then((data) => {
				this.fetching = false;
				this.loading = false;
				this.inflight = null;
				if (!data) {
					// 失败保留已加载的列表（旧数据好过空白），加载行按已确认的分页状态复位，便于再次上拉重试
					this.errorText = '奖品获取失败，请重试';
					this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
					return;
				}
				const rows = data.rows || [];
				this.list = refresh ? rows : this.list.concat(rows);
				this.page = page;
				this.hasMore = !!data.has_more;
				this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
				this.errorText = '';
				this.deadlineTip = data.deadline_tip || this.deadlineTip;
			});
			return this.inflight;
		},
		refresh() {
			return this.loadList(true, false);
		},
		loadMore() {
			if (!this.hasMore) {
				return Promise.resolve();
			}
			return this.loadList(false, false);
		},
		claim(item) {
			this.$refs.claim.open(item);
		},
		/**
		 * 整卡可点：点卡片任意一处都弹详情窗（M19，2026-10-03 用户点名「点击这个列表卡片
		 * 就应该弹出来详情弹窗，并不一定非得点击这个按钮才弹出」）。
		 *
		 * 三态都弹得出来，**包括已过期那一档**：
		 *   · 自定义奖品：详情就是「兑奖方式」（微信号 + 二维码，兑奖方式是发奖那一刻的快照，
		 *     过没过期都还在行上），走领取链那一只窗；
		 *   · 其余五型：弹奖品详情窗。那张卡按 detail.kind 换形态，缺的那几格由组件自己收起
		 *     （未领取的券还没有券可查、实物还没生成订单号），不弹一个空窗；
		 *   · 后端没给落点（target 为空）不再拦：target 是「已领取之后能去哪」，
		 *     与「能不能看详情」是两件事，拿它当闸门等于把已过期那几行整枚点不动。
		 */
		view(item) {
			// 自定义奖品没有「详情卡」那一份东西，它的内容就是兑奖方式（微信号 + 二维码），
			// 所以这一型一律走兑奖窗。
			// 判据按 type 而不是只按 target === 'contact'：后端只在**已领取**那一态给 target，
			// 待领取/已过期的自定义奖品 target 是空串，只认 target 会把这两档送进奖品详情窗，
			// 而那一只窗没有 custom 的卡（自定义奖品压根没有实体与面值）⇒ 弹一个只有标题的空面板。
			// 兑奖方式是发奖那一刻的快照，过没过期都还在行上，所以过期那一档照样弹得出来。
			if (item.type === 'custom' || item.target === 'contact') {
				this.$refs.claim.showContact(item);
				return;
			}
			this.$refs.claim.showDetail(item);
		},
		/**
		 * 领取成功后由领取链回调：把那一行**就地**换成新形态，不整页重取。
		 *
		 * 不整页刷的原因：领取成功那一刻详情窗就弹出来了，底下那一屏正在被人看着，
		 * 整页重取会让骨架屏闪一下、滚动位置也跳回去（读起来是「刚领的东西自己跑了」）。
		 * 后端回执与列表行逐字同形，所以直接换掉那一项即可（硬约束 11）。
		 *
		 * 这一行不在当前页（比如它是直播间活动详情弹窗里那一枚）时不做任何事——
		 * 那边的列表由那边的调用方自己管，两处不互相伸手。
		 */
		onClaimed(row) {
			if (!row || !row.prize_log_id) {
				return;
			}
			const idx = this.list.findIndex((it) => it.prize_log_id === row.prize_log_id);
			if (idx < 0) {
				return;
			}
			const next = this.list.slice();
			next.splice(idx, 1, row);
			this.list = next;
		},
	},
	onLoad() {
		// 标准版能力，页面恒定存在：不再有插件安装守卫（M14 那条只对插件页成立）
		this.loadList(true, false);
	},
	// 从地址编辑页/其它页退回本页时由本页自己静默重取（M23：禁止离开的子页跨页替上级取数）
	onShow() {
		if (!this.shownOnce) {
			this.shownOnce = true;
			return;
		}
		this.loadList(true, true);
	},
	onPullDownRefresh() {
		// 下拉刷新的收条要等这一趟有回音（M4），否则用户看不出刷新有没有结果
		const done = () => uni.stopPullDownRefresh();
		this.loadList(true, true).then(done, done);
	},
	onReachBottom() {
		this.loadMore();
	},
	onShareAppMessage() {
		return this.$nav.share();
	},
	onShareTimeline() {
		return this.$nav.share();
	},
};
</script>
