<script>
/**
 * 送礼页（M-P9，2026-10-28）—— 购买人从「赠送记录」点【赠送】进来的那一屏
 *
 * P1 参考页（小鹅通「赠送好友」）的口径 + 用户这一轮五条点名：
 *  ① 三步条复用提交订单页那一根（`components/tz/sf-steps.vue`，本页 `:active="2"`）；
 *  ② **不做「写下专属寄语」**：参考页那块输入区整块不落，页面只留「礼物 + 去分享」两段；
 *     参考页里那句「礼物已备好 给Ta送心意」与商品卡在剩余空间里**垂直居中**；
 *  ③ 【自己使用】的显隐只吃后端一枚 `self_usable`：购买人本人 ∧ 礼单待赠送 ∧ 还没永久拥有这份权益；
 *     点它**先弹一次确认**（不可逆动作，2026-10-28 用户点名「避免误触」，见 `useSelf` / M63），
 *     确认后才走 `gift/selfUse`（与领取同一条结算链，只跳过「不能领自己」那一条），成功后**关页并跳详情**；
 *  ④ 「去分享送礼」把公共分享弹窗搬到这里（M-P5 的弹窗实现不动，只换挂载点）：
 *     打开弹窗那一刻记 `shared_at`，**不推进礼单状态**（2026-10-20 用户口径）；
 *  ⑤ **H5「···」分享卡片适配送好友**（2026-10-28 用户点名「在微信 H5 中发起分享，那么分享的卡片
 *     应该适配送好友相关的文案呀」）：标题/描述/封面读 `common/utils/send-friend-share.js` 一处真源，
 *     落地链接吃后端 `gift/info` 的 `receive_url`（本页只有购买人能看，转给好友必须落领取页；
 *     端上不拼地址，硬约束 33）。小程序转发/朋友圈与 H5 读同一句标题。
 *
 * 四条纪律：
 *  · 未装 / 未登录 / 不是购买人三档都不发那条必然失败的请求（M14/M13），并各给一句原因；
 *  · 异步回调写响应式数据前过「已销毁」闸门 + 取数序号丢旧回音（M26/M3①），不用模块级 `that`；
 *  · 页面文案只从后端 `gift/info` 取（`goods_name` / `cover` / `status_label` / `self_usable`），
 *    端上不写第二份状态机（M22/M44）；
 *  · 尺寸/颜色只写在本页 `css.css`，W 值与 M 值不散进模板（M10/M11）。
 */
// 付费插件安装态闸门（三态）：入口来自站内列表、首屏可能撞上 init 未回包 —— 先等一次再判，
// 未装就一句话退回、一条请求都不发（paid-plugins.md 4.1-7）
import { pluginState, onSystemConfigReady } from '@/common/utils/plugin-guard.js';
import sfShare from '@/common/utils/send-friend-share.js';
import tzButton from '@/components/tz/button.vue';
import tzCourseMini from '@/components/tz/course-mini.vue';
import shareModal from '@/components/modal/share-modal.vue';

export default {
	name: 'SendFriendSend',
	components: { tzButton, tzCourseMini, shareModal },
	data() {
		return {
			// ① 只在 onLoad 读一次（硬约束 16：onShow 不重读路由参数）
			code: '',
			// gift/info 回体（商品、状态、self_usable 都由它给）
			info: {},
			loading: true,
			// 未装 / 未登录两档：闸门立在取数之前，退场在即不再白发一发
			blocked: false,
			gateWait: false,
			needLogin: false,
			// 整页那一句 + 重试（取数失败才给重试，业务拒只因没路可走）
			notice: '',
			noticeRetry: false,
			// 公共分享弹窗与「记送出时刻」的序号（关掉再开另一条时旧回音不写新一轮）
			shareVisible: false,
			shareSeq: 0,
			// 自己使用在途 / 已完成（成功那一拍就关页，标志位只为挡连点）
			using: false,
			selfDone: false,
			// 取数序号：下拉重试撞上在途请求时，晚到的旧回音不许盖新结果（M3①）
			seq: 0,
			// 在途标志：onShow 静默重取与首屏取数不许并发打同一条口
			fetching: false,
		};
	},
	computed: {
		goodsName() {
			return String((this.info || {}).goods_name || '');
		},
		cover() {
			return String((this.info || {}).cover || '');
		},
		/** 礼单状态：0 待赠送是唯一还能分享/自用的档；2/3 只留一句状态 */
		status() {
			return Number((this.info || {}).status);
		},
		/** 是不是购买人本人（后端 `is_giver`）；不是本人时整页只给一句原因，不摆动作 */
		isGiver() {
			return Number((this.info || {}).is_giver || 0) === 1;
		},
		/** 主操作那一枚：待赠送 ∧ 本人 ∧ 还没自用 */
		canShare() {
			return !this.notice && !this.selfDone && this.isGiver && this.status === 0;
		},
		/** 【自己使用】只吃后端这一枚（M22）：本人 ∧ 待赠送 ∧ 未永久拥有 */
		selfUsable() {
			if (this.notice || this.selfDone || this.using) { return false; }
			return Number((this.info || {}).self_usable || 0) === 1;
		},
		/** 不给按钮时那一句：状态词吃后端 `status_label`（三端同一份，硬约束 9） */
		stateText() {
			const d = this.info || {};
			if (Number(d.status) === 0) { return '这份礼物暂不可赠送'; }
			return String(d.status_label || '这份礼物暂不可赠送');
		},
		/** 终局那一档的页首大标题：「礼物」+ 后端状态词（已领取 / 已失效），端上不另写枚举 */
		resultTitle() {
			const label = String((this.info || {}).status_label || '');
			return label !== '' ? '礼物' + label : '';
		},
		/** 领取人（只由后端给购买人本人；好友那一侧恒空，卡片也只在 status=2 时渲染） */
		receiverName() {
			return String((this.info || {}).receiver_name || '');
		},
		receiverAvatar() {
			return String((this.info || {}).receiver_avatar || '');
		},
		/** 领取日期：后端已按 `Y-m-d` 格式化好（`claimed_at_date`），端上不拿 Unix 秒自己拼 */
		claimedAtDate() {
			return String((this.info || {}).claimed_at_date || '');
		},
		/** 已失效那一档的原因：`void_reason` 优先，缺了才用后端已经拼好的 block_reason */
		voidText() {
			const d = this.info || {};
			return String(d.void_reason || d.block_reason || '这份礼物已失效');
		},
		/** 领取链接：后端 `gift/info` 的 `receive_url`（本人 ∧ 待赠送才下发；端上不拼地址） */
		receiveUrl() {
			return sfShare.receiveUrl(this.info);
		},
		/** 分享卡片标题（H5 链接卡片与小程序卡片共用这一句，见 `common/utils/send-friend-share.js`） */
		shareTitle() {
			return sfShare.title(this.info);
		},
		/** H5 链接卡片的描述行（小程序端无此字段）：有效期那句由后端派生 */
		shareDesc() {
			return sfShare.desc(this.info);
		},
		/** 商品卡那一份字段：只给 `tz-course-mini` 认识的几枚；礼单卡片给 `qty`、不摆购买价。
		 *  `id`/`type` 是这张卡跳商品详情那一条链要的两枚（`tz-course-mini.detail()` →
		 *  `$nav.getPagePath(id, type)`）：课程五型取 `course_type`（缺失回落 `course`），
		 *  圈子/练习/会员取 `gift_type`；缺 id（老包/脏数据）时卡片自己会静默 return，
		 *  不给一条点了没反应的路（硬约束 27②）。 */
		courseCard() {
			const d = this.info || {};
			const giftType = String(d.gift_type || '');
			const courseType = String(d.course_type || '');
			return [{
				id: Number(d.goods_id) || '',
				name: this.goodsName,
				cover: this.cover,
				type: courseType || giftType || '',
				qty: 1,
			}];
		},
	},
	onLoad(options) {
		this.code = String((options || {}).code || '').trim();
		if (!this.code) {
			this.loading = false;
			this.notice = '送礼链接不完整，请回赠送记录重试';
			return;
		}
		// 登录态交给 start() 一并判（它要在插件三态之后才判，且 onLoad 这一层提前 return
		// 会把 `onSystemConfigReady` 的注册一起跳过 —— 登录回来就没有第二次放行）
		this.start();
		this._offInstallReady = onSystemConfigReady(() => this.start());
	},
	onUnload() {
		if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
		if (this._detailTimer) { clearTimeout(this._detailTimer); this._detailTimer = null; }
	},
	/**
	 * 退回本页静默重取（M23/硬约束 16）：从微信分享面板回来、或好友已领取时，
	 * 状态/按钮要跟后端对齐；不把 loading 翻回 true，避免同一张卡闪一次骨架。
	 * 首屏那一次由 onLoad 负责，`shownOnce` 挡掉「onShow 紧跟在 onLoad 后面」的双发。
	 */
	onShow() {
		if (this.blocked || !this._started) { return; }
		if (!this.shownOnce) { this.shownOnce = true; return; }
		if (!this.fetching) { this.getData(true); }
	},
	onShareAppMessage() {
		// 小程序右上角菜单转发也是「送出」：与弹窗那条路同一发（幂等，只记 shared_at）
		this.markShared();
		return this.shareCard();
	},
	onShareTimeline() {
		this.markShared();
		const card = this.shareCard();
		return { title: card.title, query: 'code=' + this.code, imageUrl: card.imageUrl };
	},
	methods: {
		gone() {
			return this._isDestroyed === true || this._isBeingDestroyed === true;
		},
		/**
		 * 安装态闸门 + 首屏取数（onLoad 与 init 回包两条到达路径共用）
		 *  · `null`  → 等 init 回包（撤骨架、挂起取数，不发请求）
		 *  · `false` → 一句话退回（本页从赠送记录进来，有页可退）
		 *  · `true`  → 取这一条礼单
		 */
		start() {
			if (this._started || this.blocked) { return; }
			const state = pluginState('send_friend');
			if (state === null) {
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
			if (!uni.getStorageSync('user_token')) {
				this.loading = false;
				this.blocked = true;
				this.needLogin = true;
				this.notice = '登录后可赠送礼物';
				return;
			}
			this.getData();
		},
		/**
		 * 取这一条礼单（免登录口，但未登录时只回商品名/封面 ⇒ 本页必须先有登录态）
		 * @param {Boolean} silent 真 = 静默档：不铺骨架（onShow 重取与失败后的对齐都走这一档，M23）
		 */
		getData(silent) {
			if (this.gateWait || this.blocked) { return Promise.resolve(); }
			const seq = ++this.seq;
			this.fetching = true;
			if (!silent) { this.loading = true; }
			this.notice = '';
			this.noticeRetry = false;
			return this.$api('send_friend.gift.info', { code: this.code }).then((ret) => {
				if (this.gone() || seq !== this.seq) { return; }
				this.fetching = false;
				this.loading = false;
				if (!ret || ret.code !== 1) {
					if (ret && ret.code === 401) {
						this.blocked = true;
						this.needLogin = true;
						this.notice = '登录后可赠送礼物';
						return;
					}
					this.noticeRetry = true;
					this.notice = (ret && ret.msg) || '礼物信息没有取到，请稍后重试';
					return;
				}
				const d = ret.data || {};
				if (Number(d.need_login || 0) === 1) {
					this.needLogin = true;
					this.notice = '登录后可赠送礼物';
					return;
				}
				if (Number(d.is_giver || 0) !== 1) {
					this.notice = '这份礼物不是你购买的，不能在这里赠送';
					return;
				}
				this.info = d;
				// 数据到手才配 H5 分享卡片（标题/描述/封面/落地链接都来自这一份）
				this.applyShare();
			}).catch(() => {
				if (this.gone() || seq !== this.seq) { return; }
				this.fetching = false;
				this.loading = false;
				this.noticeRetry = true;
				this.notice = '网络异常，礼物信息没有取到，请稍后重试';
			});
		},
		/** 未登录那一档：请求层会拉起登录（与领取页同一档）；回来后直接取数
		 *  （`start()` 已被 `_started` 挡过，不能再拿它当第二次入口） */
		goLogin() {
			this.$api('user.info.index', {}).then(() => {
				this.blocked = false;
				this.needLogin = false;
				this.notice = '';
				this.getData();
			}).catch(() => {});
		},
		/**
		 * H5 公众号端把本页配成「送你一份礼物」卡片（2026-10-28 用户点名「分享的卡片应该适配送好友
		 * 相关的文案」）：标题/描述/封面读 `common/utils/send-friend-share.js` 一处真源，
		 * 落地链接吃后端 `receive_url`（本页只有购买人能看，转给好友必须落领取页）。
		 * 只在「本人 ∧ 待赠送」那一档配（终局态没有领取链接，也不该再让人点进来领）；
		 * 带标题调 `$nav.share` 会打上 `__shareCustomized`，之后 onShow 的兜底分享不会把卡片冲成站点名。
		 */
		applyShare() {
			// #ifdef H5
			if (!this.receiveUrl || !this.canShare) { return; }
			this.$nav.share(this.shareTitle, this.shareDesc, this.cover, 'app_message', this.receiveUrl);
			// #endif
		},
		/** 打开公共分享弹窗，并把「送出时刻」记上（失败只 toast，不挡海报，M-P5） */
		openShare() {
			if (!this.code) {
				uni.showToast({ title: '这条礼物信息不完整，请回赠送记录重试', icon: 'none' });
				return;
			}
			this.shareVisible = true;
			this.markShared();
		},
		markShared() {
			const seq = ++this.shareSeq;
			this.$api('send_friend.gift.share', { code: this.code }).then((ret) => {
				if (this.gone() || seq !== this.shareSeq) { return; }
				if (ret && ret.code === 1) { return; }
				uni.showToast({
					title: (ret && ret.msg) || '送出记录没记上，不影响这次分享',
					icon: 'none',
					duration: 2000,
				});
			}).catch(() => {
				if (this.gone() || seq !== this.shareSeq) { return; }
				uni.showToast({ title: '送出记录没记上，不影响这次分享', icon: 'none', duration: 2000 });
			});
		},
		/**
		 * 【自己使用】第一步：先确认（2026-10-28 用户点名「送礼物自己使用的时候最好有个确认框，
		 * 避免误触」）。这一下是**不可逆**的——礼单一经自用就归自己，好友再也领不到、也分享不出去，
		 * 因此照 M63：不可逆动作点下去先弹一次原生确认（`uni.showModal`，M18 的「样式是原生的」口径），
		 * 取消那一档**什么都不做**（不置 `using`、不发请求、不 toast）。文案把后果说清，按钮只留
		 * 「确认使用 / 取消」两个词（小程序端 `confirmText` 上限 4 个汉字）。
		 */
		useSelf() {
			if (this.using || !this.selfUsable) { return; }
			uni.showModal({
				title: '提示',
				content: '确认自己使用这份礼物吗？使用后礼物会归你所有，好友将无法再领取。',
				confirmText: '确认使用',
				cancelText: '取消',
				confirmColor: '#0968f6',
				success: (res) => {
					if (!res.confirm) { return; }
					this.doSelfUse();
				},
			});
		},
		/**
		 * 【自己使用】第二步（确认之后才走到这里）：购买人把这一份礼单用在自己身上
		 * （与领取同一条 0 元结算链）。
		 * 成功 → 先关掉当前页、再打开商品详情（`redirectTo` 一步同时完成「关闭」与「跳转」，
		 * 从微信深链进来时页面栈里本来就没有上一页，`navigateBack` 会把人留在空白里）。
		 */
		doSelfUse() {
			if (this.using || !this.selfUsable) { return; }
			this.using = true;
			uni.showLoading({ title: '正在使用' });
			this.$api('send_friend.gift.selfUse', { code: this.code }).then((ret) => {
				if (this.gone()) { this.using = false; return; }
				uni.hideLoading();
				this.using = false;
				if (!ret || ret.code !== 1) {
					if (ret && ret.code === 401) { return; }
					uni.showToast({
						title: (ret && ret.msg) || '这份礼物暂时不能自己使用，请稍后重试',
						icon: 'none',
						duration: 2500,
					});
					// 失败那一档把状态与按钮拉回后端现态（可能刚被别人领走 / 已失效）；
					// 静默档：这一屏已经在，不翻回骨架
					this.getData(true);
					return;
				}
				const d = ret.data || {};
				this.selfDone = true;
				uni.showToast({ title: d.tip || '已放进你的已购', icon: 'none' });
				this.goDetail(d.detail_id, d.detail_type);
			}).catch(() => {
				if (this.gone()) { return; }
				uni.hideLoading();
				this.using = false;
				uni.showToast({ title: '网络异常，这份礼物还没有使用，请稍后再试', icon: 'none' });
			});
		},
		/**
		 * 关掉本页、跳到商品详情（`detail_type` / `detail_id` 由后端 `claimedPayload` 一处算好）。
		 * 路由型别映射仍走全站唯一的 `$nav.getPagePath`，本页不另抄一份。
		 */
		goDetail(id, type) {
			const target = (id && type) ? this.$nav.getPagePath(id, type) : '';
			if (!target) {
				setTimeout(() => {
					if (this.gone()) { return; }
					uni.navigateBack();
				}, 600);
				return;
			}
			// 留 600ms 让成功那句 toast 看得见；页面已经关掉后不再跳（用户可能连点返回）
			this._detailTimer = setTimeout(() => {
				this._detailTimer = null;
				if (this.gone()) { return; }
				this.$nav.to(target, 'local', 'redirectTo');
			}, 600);
		},
		/** 小程序转发/朋友圈卡片：落到领取页，标题与 H5 链接卡片同一句（`send-friend-share.js`） */
		shareCard() {
			return {
				title: this.shareTitle,
				path: '/pages/app/send_friend/receive/receive?code=' + this.code,
				imageUrl: this.cover,
			};
		},
	},
};
</script>
