<script>
/**
 * 赠送记录（M-P4）：我送出去的每一份礼单
 *
 * 六条要点：
 *  ① **入口显隐与这一屏无关**：这一页能不能进、在哪里进，都由「装没装 + 个人中心那一格」决定，
 *     判据绝不挂在「有没有礼单」上（硬约束 27②：新礼单永远等不到第一行）。本页只兜未装态。
 *  ② **未装闸门立在 `onLoad` 头里**（M14）：插件不在盘上时后端每一发都回失败，
 *     先把话说一句再退回去，不把骨架铺满等一条永远失败的请求；兜底那一条分支照样撤骨架、照样收下拉收条。
 *  ③ **`onShow` 静默重取、不把 loading 翻回 true**（M23/硬约束 16）：这一页是被返回的目标页
 *     （从送礼页、从订单详情退回来都落在这一屏），退回时看的是同一张列表，闪骨架算偏离；
 *     禁止离开的子页在 `onUnload` 里跨页替上级取数。
 *  ④ **`total` 必须在界面上有一处消费**（硬约束 32②）：上拉加载的收口吃它
 *     （`has_more` 缺失时按 `rows.length < total` 兜底），只取 rows 不看 total 就是
 *     「静默截断没人发现」那一族的入口。
 *  ⑤ 取数走 `common/request/api_list.js` 登记过的键（`send_friend.gift.list`）：
 *     `$api` 是那一层的默认导出**函数**，没有 `.post` 这一档，写成 `$api.post(...)` 会在 onLoad
 *     那一刻抛 `is not a function`，整页停在骨架屏而接口一条都不发（api_list.js:1021-1027 那条教训）。
 *  ⑥ 异步回调写响应式数据前过「已销毁」闸门（M26）+ 取数序号丢旧回音（M3①：
 *     下拉刷新撞上在途的翻页请求时，晚到的那一页不许拼到刷新后的结果后面）。
 *     不用模块级 `that`（M23 那一族的成因就是它）。
 */
// 付费插件安装态闸门（三态）：init 未回包时先等一次再判，未装就一句话退回、一条请求都不发
import { pluginState, onSystemConfigReady } from '@/common/utils/plugin-guard.js';
// 头像地址这类外部串作 data 的键必过 mpKey（M27/硬约束 25）：只改写点 = 兜底头像静默失效
import { mpKey } from '@/common/utils/mp-data-key.js';
import tzTabs from '@/components/tz/tabs.vue';
import tzButton from '@/components/tz/button.vue';
// 条目卡复用紧凑档课程卡（2026-10-20 用户点名 course-item mini；口径同「我的拼团」那一页）
import tzCourseMini from '@/components/tz/course-mini.vue';

const LIMIT = 10;

export default {
	name: 'SendFriendGiftList',
	components: { tzTabs, tzButton, tzCourseMini },
	data() {
		return {
			// 页签档位 = 礼单状态机那三档 + 全部。**状态值与中文一律由后端给**（硬约束 9：
			// 前端选项以后端接口返回为准；这里写死一份就是第二份会分叉的枚举），
			// 所以这一份只留「三档的状态值」这一根轴，名称吃同一次回体的 `attr.statusList`
			// （见 computed.tabs）；「全部」那一档不发 status 这一参，后端按未筛处理。
			// 2026-10-20 用户点名取消「1 待领取」：0 待赠送 / 2 已领取 / 3 已失效。
			statusKeys: ['', '0', '2', '3'],
			statusList: {},
			active: 0,
			status: '',
			// 订单详情那一枚入口带进来的购买单号：有值时全屏只列这一单的礼单（M-P8）；
			// 个人中心那个常驻入口不带它，整屏仍是「我的礼单」
			orderNo: '',
			rows: [],
			total: 0,
			page: 1,
			limit: LIMIT,
			hasMore: false,
			// 首帧就铺骨架（M16/W45①b）
			loading: true,
			// init 还没回包：闸门未放行（取数一律不发，等 `onSystemConfigReady` 重跑 start）
			gateWait: false,
			fetching: false,
			seq: 0,
			// 未装闸门 / 未登录那两档：闸门立在取数这一条链上，退场在即不再白发一发必然失败的请求
			blocked: false,
			notice: '还没有送出礼物',
			loadStatus: 'loadmore',
			// 领取人头像加载失败标记（键 = mpKey(地址)）：失败那一档换成默认头像，
			// 与同族领取页 `giverAvatar || defaultAvatar` 同一张
			avatarErrors: {},
		};
	},
	computed: {
		/** 页签整份：名称只从后端 `attr.statusList` 取（硬约束 9 —— 端上写死一份枚举就是第二份会分叉的清单），
		 *  「全部」是本页自己的概念、不是后端枚举的一档；一份都没到手时先只出「全部」，
		 *  首屏之后 `getData` 把 `attr.statusList` 落进 `statusList` 就补齐三档 */
		tabs() {
			const list = this.statusList || {};
			const out = [{ name: '全部', key: 0, status: '' }];
			this.statusKeys.forEach((key, idx) => {
				if (key === '') { return; }
				const name = list[key] || list[Number(key)];
				if (name) { out.push({ name, key: idx + 1, status: key }); }
			});
			return out;
		},
		/** 骨架那几行：不在加载、或第一屏已经有行 → 空数组（那一档 v-if 不成立，列表一条灰块都不铺） */
		skRows() {
			return this.loading && !this.rows.length ? [1, 2, 3] : [];
		},
	},
	onLoad(options) {
		// 订单详情那一枚「送礼记录」带 order_no 进来：这一屏收窄到那一张购买单。
		// 只从 onLoad 读一次（M16/M23：onShow 不重读路由参数）
		this.orderNo = String((options || {}).order_no || '');
		// ②未装闸门排在一切取数之前（M14）；三态：init 未回包先等一次，回包后重跑同一个入口
		this.start();
		this._offInstallReady = onSystemConfigReady(() => this.start());
	},	onUnload() {
		if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
	},
	/** ③退回本页那一次由本页自己静默重取：不把 loading 翻回 true，也就不闪骨架 */
	onShow() {
		if (this.blocked) { return; }
		if (!this.shownOnce) {
			this.shownOnce = true;
			return;
		}
		if (!this.fetching) { this.getData(true, true); }
	},
	onPullDownRefresh() {
		const done = () => uni.stopPullDownRefresh();
		if (this.blocked) { done(); return; }
		this.getData(true).then(done, done);
	},
	onReachBottom() {
		if (this.blocked || !this.hasMore || this.fetching) { return; }
		this.getData(false);
	},
	onShareAppMessage() {
		return this.$nav.share();
	},
	onShareTimeline() {
		return this.$nav.share();
	},
	methods: {

		/**
		 * 安装态闸门 + 首屏取数（`onLoad` 与 init 回包两条到达路径共用）：
		 *   · `null`  → 等 init 回包（撤骨架、不判死、不发请求）；
		 *   · `false` → 一句话退回（本页有页可退）；
		 *   · `true`  → 再判登录态，取礼单。
		 */
		start() {
			if (this._started || this.blocked) { return; }
			const state = pluginState('send_friend');
			if (state === null) {
				// 还不知道：撤骨架、挂起取数（`gateWait`），回包后由 onSystemConfigReady 重跑 start
				this.gateWait = true;
				this.loading = false;
				return;
			}
			if (state === false) {
				uni.showToast({ title: '送好友功能未安装', icon: 'none' });
				setTimeout(() => uni.navigateBack(), 800);
				this.loading = false;
				this.blocked = true;
				this.notice = '送好友功能未安装';
				return;
			}
			if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
			this._started = true;
			this.gateWait = false;
			// 这一页整屏都是「本人的礼单」（list 要登录态）：没登录时请求层是 cancel 而不是发出去，
			// 不拦就会落到「取数失败」那一句，把「没登录」说成「服务坏了」（M13）
			if (!uni.getStorageSync('user_token')) {
				this.loading = false;
				this.blocked = true;
				this.loadStatus = 'nomore';
				this.notice = '登录后可查看你送出的礼物';
				return;
			}
			this.getData(true);
		},

		gone() {
			return this._isDestroyed === true || this._isBeingDestroyed === true;
		},
		/** 条目卡那一份字段：只给 `components/tz/course-mini.vue` 声明过的那几枚。
		 *  `type` 走课程五型（`course_type`），非课程类（圈子/练习/会员）回落各自的键——
		 *  卡片右下角那枚标签与点卡片的跳转都读它，不给一个错型别（口径同「我的拼团」那只适配器）。
		 *  封面/名称交给卡片自己渲染：这一页不再自建封面兜底表（M24：条目卡复用 tz-course） */
		courseCard(row) {
			const goodsType = String((row || {}).goods_type || 'goods');
			return [{
				id: row.goods_id,
				name: row.goods_name || '',
				cover: row.cover || '',
				type: row.course_type || (goodsType === 'goods' ? 'course' : String(row.gift_type || 'course')),
				pay_type: 'pay',
				price: row.price_paid,
			}];
		},
		/** 还能赠送：只认后端 `can_give`（0 待赠送），端上不按 status 重判（M22） */
		canGive(row) {
			const r = row || {};
			return Number(r.can_give) === 1 || r.can_give === true;
		},
		/** 已领取 / 已失效：送礼页有终局态（领取人白卡 / 失效原因），给一枚【查看】；
		 *  只认后端 `status` 的 2/3 两档，其余（含脏值）整枚不出 */
		canView(row) {
			const r = row || {};
			const status = Number(r.status);
			return (status === 2 || status === 3) && !!r.gift_no;
		},
		/** 领取人那一格：只吃后端算好的 `receiver_name`（没领取时是 '-'），端上不碰 `receiver` 那枚对象 */
		hasReceiver(row) {
			const name = String((row || {}).receiver_name || '');
			return name !== '' && name !== '-';
		},
		/** 状态标配色：0 待赠送（主色蓝）/ 2 已领取（绿）/ 3 已失效（灰）。
		 *  词条吃后端 `status_label`，这里只管色档（同一档只在这一处定义，硬约束 11/35） */
		tagClass(status) {
			return {
				0: 'sfg-tag--pending',
				2: 'sfg-tag--claimed',
				3: 'sfg-tag--void',
			}[Number(status)] || 'sfg-tag--void';
		},
		/** 领取人头像：优先吃后端 `receiver_avatar`（`GiftRead` 已按 cdnurl/首字兜底拼好），
		 *  老后端没这一枚时回落 `receiver.avatar`；未领取时整格不出（不画一个空圆） */
		receiverAvatar(row) {
			const r = row || {};
			if (r.receiver_avatar) { return String(r.receiver_avatar); }
			return String((r.receiver || {}).avatar || '');
		},
		/** 头像真正摆出去的那一张：`receiverAvatar` 取不到时换全站默认头像
		 *  `/static/image/default-avatar.png`（同族领取页、打卡族、达人榜都是这一张）。
		 *  2026-10-29 用户点名「列表中的图片如果加载失败要有默认填充的图片」：
		 *  此前 `<image>` 没有 `@error`，地址失效时那一格是个空圆（底下一层 #f2f3f5），
		 *  读起来像「这个人没有头像」而不是「这张图没取到」。
		 *  表按 mpKey(地址) 查（模板看不到模块级 import，所以走方法，M27） */
		avatarSrc(row) {
			const url = this.receiverAvatar(row);
			if (!url) { return ''; }
			return this.avatarErrors[mpKey(url)] ? '/static/image/default-avatar.png' : url;
		},
		/** 头像加载失败：记下这一张（写点同样过 mpKey）。图片 `@error` 可能晚于页面卸载才到，
		 *  写响应式数据之前先过「已销毁」闸门（M26②） */
		onAvatarError(row) {
			if (this.gone()) { return; }
			const url = this.receiverAvatar(row);
			if (url) { this.$set(this.avatarErrors, mpKey(url), true); }
		},
		/** 份数刻度：同一张购买单买了几份、这是第几份（2026-10-26 用户点名「参考拼团优化方式」）。
		 *  只有一份时是噪音，整句不出；`seq` 与 `goods_count` 都吃后端快照，端上不自算 */
		seqText(row) {
			const r = row || {};
			const seq = Number(r.seq) || 0;
			const total = Number(r.goods_count) || 0;
			if (seq <= 0 || total <= 1) { return ''; }
			return '第 ' + seq + '/' + total + ' 份';
		},
		onTab(item) {
			// tz-tabs 重发的是 u-tabs 那一包 `{...这一项, index}`，页签上的 status 原样带回来
			this.active = item.key;
			this.status = item.status;
			this.getData(true);
		},
		/**
		 * 取一屏。
		 * @param {Boolean} refresh 真 = 回到第一屏整段替换；假 = 往后拼一页
		 * @param {Boolean} silent 真 = 静默档：不铺骨架（首屏以外的一切重取都是这一档，M23）
		 * @returns {Promise}
		 */
		getData(refresh, silent) {
			// 未装 / init 还没回包：闸门还没放行，不发请求（收条由调用点照常收）
			if (this.gateWait || this.blocked) { return Promise.resolve(); }
			const seq = ++this.seq;
			// **翻页参数是 `page` 不是 `offset`**（后端 `Gift::list($status, $page, $limit)`，
			// 它按 `($page - 1) * $limit` 换算；2026-10-16 学员端接线核出来的这一跳）：
			// 发 `offset` 时后端两个读点都落回缺省 `page=1` ⇒ 上拉加载永远把第 1 页重新拼到列表尾巴上，
			// 第 11 份礼单永远看不到，而接口一路 200、静态门禁全绿（「页面上有数、数还是错的」那一族）
			const page = refresh ? 1 : Math.floor(this.rows.length / this.limit) + 1;
			this.fetching = true;
			if (refresh && !silent) { this.loading = true; }
			this.loadStatus = 'loading';
			const params = { page, limit: this.limit };
			// 「全部」那一档不发这一参（后端 `param('status','')` 那一句按未筛处理）
			if (this.status !== '') { params.status = this.status; }
			// 订单详情入口带来的收窄条件（后端再与 giver_user_id 取「与」，别人的单号查不到一行）
			if (this.orderNo !== '') { params.order_no = this.orderNo; }
			return this.$api('send_friend.gift.list', params).then((ret) => {
				if (this.gone() || seq !== this.seq) { return; }
				this.fetching = false;
				this.loading = false;
				if (!ret || ret.code !== 1) {
					// 401 由请求层弹登录，这一页不跟着改判据；其余把失败那一句交给空态（M13）
					if (ret && ret.code === 401) { return; }
					this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
					this.notice = (ret && ret.msg) || '赠送记录没有取到，请下拉刷新重试';
					// 首屏/下拉失败才撤旧行；静默档（onShow 重取）失败时保留现有列表，不因一次抖动清屏
					if (refresh && !silent) { this.rows = []; this.total = 0; this.hasMore = false; }
					return;
				}
				const data = ret.data || {};
				const rows = data.rows || [];
				this.rows = refresh ? rows : this.rows.concat(rows);
				this.total = Number(data.total) || 0;
				this.page = Number(data.page) || page;
				// 页签名称的唯一来源（硬约束 9）；后端没给就保持上一份
				if (data.attr && data.attr.statusList) { this.statusList = data.attr.statusList; }
				// 收口判据优先吃后端给的 has_more；后端没给才由 total 与已取到的条数推（不拿本页行数当总数）
				this.hasMore = data.has_more === undefined ? this.rows.length < this.total : !!data.has_more;
				this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
				this.notice = this.status === '' ? '还没有送出礼物' : '这一档里还没有礼物';
			}).catch(() => {
				if (this.gone() || seq !== this.seq) { return; }
				this.fetching = false;
				this.loading = false;
				this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
				this.notice = '网络异常，赠送记录没有取到，请下拉刷新重试';
				if (refresh && !silent) { this.rows = []; this.total = 0; this.hasMore = false; }
			});
		},
		/**
		 * 行上那一句时间：一行只说一件事（状态归状态标、时间归这一行）。
		 * 三档口径（2026-10-20）：已领取看领取时间；待赠送看送出时间（分享过才有）或领取有效期；
		 * 已失效不再补时间（终局那一档的事实由状态标说）。
		 * ⚠ **只吃后端格式化好的那几枚 `*_text`**（`GiftRead::decorate()`）：
		 *   库里 `shared_at/claimed_at/expire_time` 是 Unix 秒，直接摆到界面上就是
		 *   「领取时间 1760000000」那一档；端上也不许再拼一次日期（三端同一句归后端一处存，§四-26）。
		 * 后端没给任何一枚就整行不出（不留一句没人认领的「送出 -」，§四-20）
		 */
		timeLine(row) {
			const r = row || {};
			const s = Number(r.status);
			if (s === 2 && r.claimed_at_text) { return { label: '领取时间', value: r.claimed_at_text }; }
			if (s === 0 && r.shared_at_text) { return { label: '送出时间', value: r.shared_at_text }; }
			if (s === 0 && r.expire_time_text) { return { label: '领取有效期', value: r.expire_time_text }; }
			if (s !== 3 && r.shared_at_text) { return { label: '送出时间', value: r.shared_at_text }; }
			return null;
		},
		/**
		 * 行内【赠送】→ 送礼页（M-P9，2026-10-28 用户点名 P1）。
		 *
		 * 2026-10-20 那一版是「点赠送直接开公共分享弹窗」；本轮参考页把这一跳做成了一整屏
		 * （三步条 + 礼物已备好 + 去分享送礼 + 自己使用），所以分享弹窗与「记送出时刻」都搬到
		 * `pages/app/send_friend/send/send` 那一页 —— 本页只负责带着礼单凭据过去。
		 * 端上不在这里先发 `gift/share`：那一发由送礼页在「打开分享面板」时发，口径与原来一致
		 * （只记 `shared_at`、不推进状态），两处都发就会让「打开列表」也算一次送出。
		 */
		goSend(row) {
			if (!row || !row.gift_no) {
				uni.showToast({ title: '这条礼物信息不完整，请下拉刷新后重试', icon: 'none' });
				return;
			}
			this.$nav.to('/pages/app/send_friend/send/send?code=' + encodeURIComponent(row.gift_no));
		},
	},
};
</script>
