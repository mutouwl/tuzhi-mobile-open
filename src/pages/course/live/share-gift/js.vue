<script>
import activityList from './activity-list.vue';
import activityDetail from './activity-detail.vue';

/**
 * 分享有礼在直播间的挂载点：右侧悬浮入口 + 两层弹层（活动清单 / 活动详情）。
 *
 * 受邀人那一发助力仍然要上报（归因落 app_share_gift_assist），但**不再弹任何窗**：
 * 2026-10-06 用户点名「被邀请的用户进入直播间后，不要弹出来」——原先那一只「助力成功 /
 * 参与分享好礼」弹窗（assist-tip.vue）整层删掉，它唯一的另一个入口 joinByInvite（受邀人就地
 * 转为参与者）随之撤干净；受邀人自己要参与，走右侧那枚常驻入口 → 活动清单 → 详情 → 去邀请好友，
 * 那条链与主动进房的人完全同一条，不留第二套参与形态。
 *
 * 页面侧只挂这一只组件（`ref="shareGiftPopup"`），对外公开两个方法：
 *   openDetail(activityId)  讨论区卡片点击后直达某条活动的详情（页面 js 的 openShareGift 转发到这里）
 *   reload()               从别处退回直播间时由页面 onShow 调一次，重判入口显隐
 *
 * 这里不用模块级 that（M23：同一路由开两次时会把写入打到已销毁实例上），回调一律箭头函数吃 this。
 */
export default {
	name: 'share-gift-popup',
	components: {
		activityList,
		activityDetail,
	},
	props: {
		courseId: {
			type: [String, Number],
			default: 0,
		},
		// 受邀人从分享链接带进来的邀请人 id（本系统分享口径：pageParams.share 存的就是分享者 id）
		inviterId: {
			type: [String, Number],
			default: 0,
		},
		/** 页面级闸门：清屏或任意弹层打开期间由页面置 false，入口整枚收起（不动后端 has_record 那枚判据） */
		showEntry: {
			type: Boolean,
			default: true,
		},
		/**
		 * 这一枚在右侧那根栏里的层号，由页面按「此刻实际显示着的几枚」连续编号后传进来
		 * （缺席一枚时中间会留空洞，见 live.vue 的 sideEntryLevels）
		 */
		level: {
			type: [Number, String],
			default: 0,
		},
		/**
		 * 讨论区垂直中心线（px）与参与居中的常驻枚数，页面实测后传下来，原样透给 tz-live-side-entry
		 * （2026-10-05 用户点名「y 轴下移到讨论区高度垂直居中的位置」，原先那一栏锚在写死的 38% 上）。
		 * 这一对只决定整根栏的基准线，本组件不参与任何几何计算，也不另存一份
		 */
		centerY: {
			type: [Number, String],
			default: 0,
		},
		stackCount: {
			type: [Number, String],
			default: 0,
		},
	},
	// share = 详情弹窗主按钮要外发邀请，由页面转去调底部工具条那一只分享弹层（不新造分享弹层，M18⑧）
	// entry-state = 入口此刻显示与否，上抛给页面算层号（事件名不与原生事件同名，M28）
	emits: ['share', 'entry-state'],
	data() {
		return {
			entryVisible: false,
			listShow: false,
			detailShow: false,
			activityId: 0,
			// 一次进直播间只报一次助力（onShow 重判入口时不能再报第二次）
			assistHandled: false,
			rows: [],
			listLoading: false,
			listError: '',
		};
	},
	watch: {
		// 入口显隐上抛页面：右侧那根栏按实际显示着的几枚连续编号（缺席一枚中间不留空洞）
		entryVisible() {
			this.$emit('entry-state', this.entryOn);
		},
		showEntry() {
			this.$emit('entry-state', this.entryOn);
		},
		courseId(val) {
			if (val) {
				// 直播间的 course_id 来自 course.detail，进页面那一刻还是空的：
				// 挂载时取不到就等这一路补上再取，否则入口与助力两条链都不会发
				this.boot();
			}
		},
		// 分享链接带进来的邀请人 id 也可能晚于挂载才落到 props 上，同一趟 boot 里补报一次
		inviterId(val) {
			if (val && this.courseId) {
				this.tryAssist();
			}
		},
	},
	computed: {
		/**
		 * 入口此刻显示与否 = 后端那一枚判据（entryVisible）× 页面级闸门（showEntry）
		 * 模板与上抛共用这一份，页面拿它算层号
		 */
		entryOn() {
			return !!(this.entryVisible && this.showEntry);
		},
	},
	mounted() {
		this.boot();
	},
	methods: {
		/**
		 * 取到 course_id 才启动的两件事：入口显隐判定、受邀人助力上报
		 */
		boot() {
			if (!this.courseId) {
				return;
			}
			this.loadEntry();
			this.tryAssist();
		},
		/**
		 * 页面正在卸载时晚到的回音不再写 data（M26：给已出栈页面 setData 会打断整条推送调度）
		 */
		gone() {
			return this._isDestroyed === true || this._isBeingDestroyed === true;
		},
/**
			 * 入口显隐 + 活动清单：判据只读后端下发的 has_record 那一枚，前端不自己数活动、不比时间
			 */
			loadEntry() {
			if (!this.courseId) {
				this.entryVisible = false;
				return Promise.resolve();
			}
			this.listLoading = true;
			this.listError = '';
			return this.$api('share_gift.gift.list', { course_id: this.courseId }).then((ret) => {
				if (this.gone()) {
					this.listLoading = false;
					return;
				}
				this.listLoading = false;
				if (!ret || ret.code !== 1) {
					this.entryVisible = false;
					this.rows = [];
					// 失败要说得出原因：列表弹层打开时吃这一句，不留一张「暂无活动」的空壳
					this.listError = (ret && ret.msg) || '活动获取失败，请重试';
					return;
				}
				const data = ret.data || {};
				this.rows = data.rows || [];
				// 入口判据就是后端这一枚 has_record（=这一场**添加过**活动，进行中 + 已结束 + 已失效都算），
				// 前端不再 ∧ 别的东西：用户 2026-10-04 点名「只要有添加活动记录，就应该显示这个按钮」。
				// 原先还要 ∧ 直播间开关 room_open，而中控台那一档根本读不到开关、照样能建活动 ⇒
				// 商家建完活动、状态写着「进行中」，学员端却永远不出入口（2026-10-04 现场就是这一档）。
				// 老后端没下发这一枚时才退回 has_active。
				this.entryVisible = data.has_record !== undefined ? !!data.has_record : !!data.has_active;
			}).catch(() => {
				if (this.gone()) {
					this.listLoading = false;
					return;
				}
				this.listLoading = false;
				this.entryVisible = false;
				this.rows = [];
				this.listError = '活动获取失败，请重试';
			});
		},
		/**
		 * 由页面 onShow 调用（退回直播间重判一次入口；首屏那一次由 mounted 自己发，不重复请求）
		 * 登录之后也要顺带补一次助力：未登录那一趟 tryAssist 是直接 return 的（不弹登录墙，
		 * 进直播间的人先看得到直播），而 assistHandled 并没有被占掉 —— 页面上补这一次才接得上
		 */
		reload() {
			this.loadEntry();
			this.tryAssist();
		},
		openList() {
			this.listShow = true;
			// 打开列表时数据可能还是上一次入口判定那一批，静默补一次，保证看到的是此刻的活动
			this.loadEntry();
		},
		openDetail(activityId) {
			const id = Number(activityId || 0);
			if (!id) {
				uni.showToast({ title: '这条分享有礼活动已经打不开了', icon: 'none' });
				return;
			}
			this.activityId = id;
			this.listShow = false;
			this.detailShow = true;
		},
		/**
		 * 受邀人助力：链接带 inviter_id（或本系统分享口径的 share）才报，
		 * 未登录不自动弹登录墙（进直播间的人先看得到直播，助力由他点开入口时那一步再要登录），
		 * 自己分享给自己的那一种（邀请人就是本人）不报
		 *
		 * **报完不弹任何东西**（2026-10-06 用户点名「被邀请的用户进入直播间后，不要弹出来」）：
		 * 助力这一发只是替邀请人记一笔归因，界面一律交给右侧那枚常驻入口 → 清单 → 详情那一条链说；
		 * 失败同样静默（只进 console）——这一发不是用户点出来的，凭空弹一句「助力未成功」
		 * 等于在他刚进房那一刻塞一层提示。与同族那一条 invite_rank.rank.report 同一口径
		 * （PRD §十-20：归因上报失败一律静默，不打扰受邀人）。
		 */
		tryAssist() {
			if (this.assistHandled) {
				return;
			}
			const token = uni.getStorageSync('user_token');
			const me = this.$tools.cachedUser() || {};
			const selfInvite = !!(me.id && String(me.id) === String(this.inviterId));
			// 这一道原先也是**全静默 return**，与达人榜那一条同族：
			// `share_gift/gift/assist` 全程不出现在日志里时，分不清是「没邀请人」「没登录」还是「自己请自己」。
			// 每一档各喊一次并说清是哪一档，只进 console 不碰界面（PRD §十-20）。
			const why = !this.inviterId
				? '没有邀请人（链接上没带 share，或详情页那一跳没带进来）'
				: !this.courseId
					? '没有直播间 id'
					: !token
						? '未登录（助力与达人榜一样，未登录不发）'
						: selfInvite
							? '是本人请自己'
							: '';
			if (why && !this._assistSkipWarned) {
				this._assistSkipWarned = true;
				console.warn('[share_gift] 本场不发起助力请求：', why);
			}
			if (!this.inviterId || !this.courseId || !token || selfInvite) {
				return;
			}
			this.assistHandled = true;
			// 第三参 custom.noToast：这一发注定失败的几档（本场没有进行中的活动、活动已结束）
			// 后端回的是 code=0 + 一句 msg，请求层原本会自己弹那一句黑 toast（1 秒 + mask）——
			// 那就是「进入直播间弹出来」的东西，与本轮要求直接冲突，所以这一发按静默请求发（M42）
			this.$api('share_gift.gift.assist', {
				course_id: this.courseId,
				inviter_id: this.inviterId,
			}, { custom: { noToast: true } }).then((ret) => {
				if (this.gone()) {
					return;
				}
				if (!ret || ret.code !== 1) {
					// 界面不喊，但账要能查：把后端那一句原因落到 console；
					// 同时撤掉「已报过」标记，下一次进直播间还能补报，不把失败固化成永久静默
					console.warn('[share_gift] 助力上报未成功：', (ret && ret.msg) || '接口没有给出原因');
					this.assistHandled = false;
					return;
				}
			}).catch(() => {
				if (this.gone()) {
					return;
				}
				console.warn('[share_gift] 助力上报请求失败（网络）');
				this.assistHandled = false;
			});
		},
	},
};
</script>
