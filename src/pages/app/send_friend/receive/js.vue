<script>
/**
 * 好友领取页（M-P6）；领取成功不再停成功屏（M-P7，2026-10-28 改判）
 *
 * 七条要点：
 *  ① **`?code=` 只在 `onLoad` 读一次**（蓝本 `pages/app/exchange/center/js.vue:56-57`，硬约束 16）：
 *     `onShow` 里重读等于把用户刚改过的那一屏按旧地址重刷一遍。
 *  ② **未装闸门**（M14/硬约束 3）：这一页是好友从微信里点开的**深链**，页面栈里常常没有上一页可退，
 *     `navigateBack` 会把人留在空白里 ⇒ 未装那一档改成立刻撤骨架、整页给一句原因（与 M-P4 那一页不同，
 *     那一页是自己人从个人中心进来的，有页可退）。也不发那条永远失败的请求。
 *  ③ **未登录只出商品名与封面 + 一枚「登录后领取」**（§2.3-4 防枚举探测）：这一档连权益说明那一句、
 *     送出人那一行都不渲染 —— 后端本来就只回那两样，界面这一层不许自己凑出一份「看着完整」的空壳。
 *     商品卡那一份字段由 `courseCard` 一处裁（拿不到型别/价格就不给，见 ⑦）。
 *  ④ 三态各一句、句子来自后端那一档（可领 / 已被领取 / 已失效 + 原因），
 *     **不许都落一句「服务处理失败，请稍后重试」**（硬约束 39②：报错要自带出路）。
 *  ⑤ 商品区复用紧凑档课程卡 `tz-course-mini`（2026-10-27 用户点名「课程也没有使用 course-item-mini」）：
 *     卡高/封面宽/型别标签/标语档只有那一份，本页不再自建封面兜底表与卡片几何。
 *  ⑥ **领取成功 → 关掉本页、打开商品详情**（2026-10-28 用户点名）：后端 `gift/receive` 回体带
 *     `detail_type` / `detail_id`，`goDetail()` 用 `redirectTo` 一步完成「关闭 + 跳转」；
 *     旧的 M-P7 成功卡（看课程 / 去赠送记录 / 还有 N 份）整块下线 —— 那一屏的存在理由就是
 *     「领完不知道去哪」，而本轮给了明确去处。
 *  ⑦ **异步回调写响应式数据前过「已销毁」闸门**（M26/硬约束 23）：好友领完常顺手退回去，
 *     那一刻还在等的回音写进已出栈的页面会把整条 setData 通道拖死。取数序号丢旧回音（M3①）。
 *     不用模块级 `that`。
 */
// 付费插件安装态闸门（三态）：这是一条深链，首屏常与 common.init 并行 ——
// init 未回包时既不判「未装」（整页误给一句「还没开通」），也不发那条必然失败的请求
import { pluginState, onSystemConfigReady } from '@/common/utils/plugin-guard.js';
import tzButton from '@/components/tz/button.vue';

export default {
	name: 'SendFriendReceive',
	components: { tzButton },
	data() {
		return {
			// 首帧就铺骨架（M16/W45①b）
			loading: true,
			blocked: false,
			// ①只在 onLoad 读一次
			code: '',
			// gift/info 那一档回体（三态判据、句子、商品与送出人都由它给）
			info: {},
			receiving: false,
			seq: 0,
			// 取数失败 / 未装 / 链接不对那一句：整页给出去，不留在骨架上（M13）
			notice: '',
			// 这一句是「取数失败」才给一枚「重新加载」（未装/链接不对重来一次也没用，整枚不出）
			noticeRetry: false,
			// 领取被拒之后、后端那一档句子盖在这里一句（界面上那枚按钮同时收掉）
			stateOverride: '',
			defaultAvatar: '/static/image/default-avatar.png',
		};
	},
	computed: {
		/** 未登录那一档：后端回 need_login=1（或这一发没登录态） */
		needLogin() {
			return Number(this.info.need_login || 0) === 1 || !uni.getStorageSync('user_token');
		},
		/** 可领那一档：判据只吃后端下发的 `claimable`（`Gift::info()` 逐档算好给出），前端不重算状态机（M22）。
		 *  上一版这里读 `can_claim` —— 后端从不发这一枚键（那是列表行的 `can_claim`），
		 *  于是永远落到本地兜底 `status===0||1`：给「还没送出的礼单」与「已到期但定时任务还没翻成 3 的礼单」
		 *  摆出一枚主按钮，点下去才被后端拒 —— 后端已经把「为什么不能领」算成 `block_reason` 了，读它就行 */
		canClaim() {
			if (this.notice || this.stateOverride) { return false; }
			const d = this.info || {};
			return Number(d.claimable) === 1 || d.claimable === true;
		},
		status() {
			return Number((this.info || {}).status);
		},
		goodsName() {
			const d = this.info || {};
			return d.goods_name || d.name || '';
		},
		goodsDesc() {
			const d = this.info || {};
			return d.goods_desc || d.desc || '';
		},
		/** 商品卡那一份字段：只给 `components/tz/course-mini.vue` 认识的那几枚（id/name/cover/type/qty）。
		 *  **id / 型别与价格在未登录那一档一律不给**（§2.3-4 只放行商品名与封面）；
		 *  `qty` 是「一份礼」的固定刻度（P2 参考页卡片右下角那个 ×1）——礼单就是一份，
		 *  不随是否登录变化，也不摆购买价（价格是购买单那一侧的事实）。
		 *  2026-10-28 用户点名「收礼详情页点击商品要能跳转」：登录后有 id，卡片才可点。 */
		courseCard() {
			const d = this.info || {};
			const item = {
				name: this.goodsName,
				cover: String(d.cover || ''),
				qty: 1,
			};
			if (!this.needLogin) {
				item.id = Number(d.goods_id) || '';
				item.type = String(d.course_type || d.gift_type || '');
				item.pay_type = String(d.pay_type || '');
				item.price = d.price || '';
			}
			return [item];
		},
		/** 商品卡能否点进详情：`tz-course-mini` 走 `$nav.getPagePath(id, type)`，两枚缺一个都拼不出地址；
		 *  未登录那一档后端只回商品名/封面（§2.3-4），没有 id 就不给一条点了没反应的路（硬约束 27②）。 */
		canOpenGoods() {
			const d = this.courseCard[0] || {};
			return !!d.id && !!d.type;
		},
		/** 卡下那一栏（送出人 + 权益说明）整体出不出的判据：未登录那一档两样都不许出，也不留一条空发丝线 */
		showMeta() {
			if (this.needLogin) { return false; }
			return !!(this.giverName || this.goodsDesc);
		},
		/** 送出人只出昵称与头像（不出手机号，§2.3-4 与合规那一条）。
		 *  键名以 `Gift::info()` 为准：`giver_name` / `giver_avatar`（上一版读 `giver_nickname`，
		 *  后端从不发 ⇒ 「送出人」那一格永不出现，好友不知道这份礼是谁送的） */
		giverName() {
			const d = this.info || {};
			return d.giver_name || (d.giver && d.giver.nickname) || '';
		},
		giverAvatar() {
			const d = this.info || {};
			return d.giver_avatar || (d.giver && d.giver.avatar) || '';
		},
		/** 可领 / 已领取两档切礼盒视觉（2026-10-28）：蓝面板 + 白卡（底色走全站默认）；其余状态保持原白卡版式 */
		giftPage() {
			// 2026-10-28 用户第二次点名「统一下样式」：除整页取不到（notice）那一档外，
			// 骨架 / 未登录 / 待赠送 / 已领取 / 已失效全部走礼盒视觉，不再有一支退回旧白卡。
			return !this.notice;
		},
		/** 已领取那一档的页首大标题：「礼物」+ 后端 status_label（已领取），端上不另写枚举 */
		resultTitle() {
			const label = String((this.info || {}).status_label || '');
			return label !== '' ? '礼物' + label : '礼物已领取';
		},
		/** 白卡标题：状态词吃后端 `status_label`（同一份，不写第二份「已领取」） */
		claimedLabel() {
			return String((this.info || {}).status_label || '已领取');
		},
		/** 领取人 / 日期：只由后端给（购买人或领取人本人视角），缺了就按「好友」与不显示日期处理 */
		receiverName() {
			return String((this.info || {}).receiver_name || '');
		},
		receiverAvatar() {
			return String((this.info || {}).receiver_avatar || '');
		},
		claimedAtDate() {
			return String((this.info || {}).claimed_at_date || '');
		},
		/** 白卡那一行的动词：购买人看「谁领取了你的赠送」，领取人自己回看则是「已领取这份礼物」 */
		claimActionText() {
			const d = this.info || {};
			return Number(d.is_giver) === 1 ? '领取了你的赠送' : '已领取这份礼物';
		},
		/** 主按钮文案：后端给就用后端那句（按钮文案也归后端一处存，§3.4 那三处判同一份） */
		receiveBtnText() {
			return (this.info || {}).button_text || '领取赠送';
		},
		/** ④三态各一句：**句子第一顺位吃后端 `block_reason`**（`GiftModel::claimBlockReason()` 把
		 *  「还没送出 / 已被领取 / 已失效（到期 / 退款 / 商家作废）」各配一句自带出话），
		 *  端上那几句只是后端没给时的兜底（上一版读 `state_text`/`status_text` —— 两枚后端从不发，
		 *  于是后端那句现成的原因永远不显示，退化成一句写死的「这份礼物现在不能领取。」= 没有出路，硬约束 39②）
		 *  「整页都取不到」那一档走模板里的 notice 分支，不进这一句 */
		stateText() {
			if (this.stateOverride) { return this.stateOverride; }
			const d = this.info || {};
			if (this.needLogin) { return '登录后就能把这份礼物放进你的已购。'; }
			if (!this.canClaim && d.block_reason) { return d.block_reason; }
			// 可领那一句：这一屏并没有「可以点开的礼物」那一枚，下面只有一枚「领取赠送」按钮 ——
			// 原句「点开下面这一枚就归你」既指不到实物、又绕（2026-10-27 用户点名「太拗口」）。
			// 改成两句短话：礼还没人领 + 点一下（下面那枚按钮）就归你；15 字（≈210px @14px），
			// 320 宽的机器上文字格还有 223px，一行放得下 —— 居中后一旦折行会落一个孤儿「。」，
			// 所以这句的字数上限就是「15 字」这一档，再长要重写而不是让它折
			if (this.canClaim) { return '礼物还没人领取，点一下就归你。'; }
			if (d.status_label) { return d.status_label; }
			if (this.status === 2) { return '这份礼物已经被领走了，一份只送一位好友。'; }
			if (this.status === 3) { return '这份礼物已失效，不再支持领取。'; }
			return '这份礼物现在不能领取。';
		},
		/** 有效期那一句（后端 `expire_text` 一处派生，三端同一句，§四-26）。
		 *  失效那一档的原因不再另读 `void_reason`：后端从不发这一枚键，原因已经在 `block_reason` 那一句里 */
		stateSub() {
			const d = this.info || {};
			if (this.stateOverride) { return ''; }
			if (!this.needLogin && d.expire_text) { return d.expire_text; }
			return '';
		},
		/** 提示块的色调：可领 / 未登录 = 主色蓝（这一屏的正事就在下面那枚按钮上）；
		 *  不可领（已被领取 / 已失效 / 还没送出）= 中性灰；领取被拒（stateOverride）= 灰色块 + 警示红图标。
		 *  色调只在这一处判，图标名/字号/色值都由它派生（同一件事只存一处，硬约束 11） */
		tipTone() {
			return this.stateOverride || !(this.needLogin || this.canClaim) ? 'sfr-tip--muted' : 'sfr-tip--info';
		},
		/** 提示块图标：领取被拒 = 警示、可领 = 礼物、其余 = 提示（三枚都有字形，墨迹实测见 `tools/icon-ink-normalize.py`） */
		tipIcon() {
			if (this.stateOverride) { return 'jingshi'; }
			return this.canClaim ? 'lipin' : 'tishi';
		},
		/** 字号按实测墨迹归一到 ≈16px：`lipin` 墨迹 0.938 ⇒ 17；`tishi`/`jingshi` 墨迹 1.002 ⇒ 16 */
		tipIconSize() {
			return this.canClaim ? 17 : 16;
		},
		tipIconColor() {
			if (this.stateOverride) { return '#f53f3f'; }
			if (this.needLogin || this.canClaim) { return '#0968f6'; }
			return '#86909c';
		},
	},
	onLoad(pageParams) {
		const params = this.$nav.parsePageParams(pageParams || {});
		// ①读一次
		this.code = String(params.code || params.gift_no || '').trim();
		// ②未装闸门（三态，见头注释 / plugin-guard.js）：init 未回包就先等一次，回包后重跑同一个入口
		this.start();
		this._offInstallReady = onSystemConfigReady(() => this.start());
	},
	onUnload() {
		if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
		// 关页跳详情那 600ms 的计时器：页面先被关掉时别再拿一个已出栈的实例去 navigate
		if (this._detailTimer) { clearTimeout(this._detailTimer); this._detailTimer = null; }
	},
	methods: {
		/**
		 * 安装态闸门 + 首屏取数（`onLoad` 与 init 回包两条到达路径共用）。
		 * ⚠ **必须写在 `methods` 里**：Vue 2 的 `initMethods` 只遍历 `opts.methods`，
		 * 摆在 options 根上的自定义函数不会挂到实例上，`onLoad` 里那句 `this.start()` 就是
		 * `TypeError: this.start is not a function`（首屏永远停在骨架、接口一条都没发）。
		 * 探针 `check-send-friend-receive.js` 第 ① 条按真 Vue 的绑定规则建实例，这一档会当场报红。
		 *   · `null`  → 骨架照铺、等 init 回包（**不**判成「没开通」，那会把一次竞态写成一整屏错话）；
		 *   · `false` → 整页一句，不发请求，也不 navigateBack（深链常常没有上一页可退）；
		 *   · `true`  → 再判凭据，取这一条礼物。
		 */
		start() {
			if (this._started || this.blocked) { return; }
			const state = pluginState('send_friend');
			if (state === null) {
				this.loading = true;
				return;
			}
			if (state === false) {
				this.loading = false;
				this.blocked = true;
				this.notice = '这家店铺还没有开通送好友，请让送出人在店铺后台安装后再来。';
				return;
			}
			if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
			this._started = true;
			if (!this.code) {
				this.loading = false;
				this.blocked = true;
				this.notice = '这条链接没有带上礼物凭据，请让送出人重新发一条。';
				return;
			}
			this.getData();
		},
		gone() {
			return this._isDestroyed === true || this._isBeingDestroyed === true;
		},
		/** 取这一条礼物的三态（未登录也取：后端对未登录只回商品名与封面 + need_login） */
		getData() {
			// 未装 / init 还没回包：闸门还没放行，不发请求
			if (!this._started || this.blocked) { return Promise.resolve(); }
			const seq = ++this.seq;
			this.loading = true;
			this.noticeRetry = false;
			return this.$api('send_friend.gift.info', { code: this.code }).then((ret) => {
				if (this.gone() || seq !== this.seq) { return; }
				this.loading = false;
				if (!ret || ret.code !== 1) {
					// 401 那一档请求层已经把登录弹出来了，这一页不改口；其余把后端那一句给出去（M13）
					if (ret && ret.code === 401) { return; }
					this.notice = (ret && ret.msg) || '这份礼物没有取到，请让送出人重新发一条链接。';
					// 业务失败（链接失效 / 礼物不存在）重来一次也是同一句，不给「重新加载」
					this.noticeRetry = false;
					return;
				}
				this.notice = '';
				this.info = ret.data || {};
			}).catch(() => {
				if (this.gone() || seq !== this.seq) { return; }
				this.loading = false;
				this.notice = '网络异常，这份礼物没有取到，请稍后再进来一次。';
				// 网络那一档才给「重新加载」（报错要自带出路，硬约束 39②）
				this.noticeRetry = true;
			});
		},
		/** 未登录那一档的去向：把请求层那一句「请登录后继续操作」弹出来（口径同拼团区 goBuy） */
		goLogin() {
			this.$api('user.info.index', {}).catch(() => {});
		},
		receive() {
			if (this.receiving) { return; }
			if (!this.code) { return; }
			if (!uni.getStorageSync('user_token')) { this.goLogin(); return; }
			this.receiving = true;
			uni.showLoading({ title: '正在领取' });
			this.$api('send_friend.gift.receive', { code: this.code }).then((ret) => {
				if (this.gone()) { this.receiving = false; return; }
				uni.hideLoading();
				this.receiving = false;
				if (!ret || ret.code !== 1) {
					if (ret && ret.code === 401) { return; }
					// 失败按后端那一档文案出对应态（已被领取 / 已失效 / 不能领自己送出的那份），
					// 并把这一档盖进界面、把按钮收掉；顺手静默重取一次让状态与后端对齐
					this.stateOverride = (ret && ret.msg) || '这份礼物现在不能领取，请让送出人重新发一条链接。';
					this.getData();
					return;
				}
				const d = ret.data || {};
				// 2026-10-28 用户点名「领取成功关闭当前页面跳转到课程详情」：不再切成功屏，
				// 成功那一拍直接关页跳详情；`detail_type` / `detail_id` 由后端 `ClaimService::payload()` 一处算好，
				// 路由映射仍走全站唯一的 `$nav.getPagePath`（本页不抄第二份型别表）
				uni.showToast({ title: d.tip || '领取成功，已放进你的已购', icon: 'none' });
				this.goDetail(d.detail_id, d.detail_type);
			}).catch(() => {
				if (this.gone()) { return; }
				uni.hideLoading();
				this.receiving = false;
				this.stateOverride = '网络异常，这份礼物还没有领到，请稍后再点一次。';
			});
		},
		/**
		 * 关掉领取页、打开商品详情（`redirectTo` 一步同时完成「关闭」与「跳转」）。
		 *
		 * 从微信分享链接点进来时页面栈里只有这一页，`navigateBack` 会把人留在空白里；
		 * 即使有上一页（从站内点进来），用户要的也是「领完直接看内容」，不是退回上一屏再自己找。
		 * 后端没给详情两枚键（老包/脏数据）时只关页并说一句，不跳到空地址（硬约束 27②）。
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
			// 留 600ms 让成功那句 toast 看得见
			this._detailTimer = setTimeout(() => {
				this._detailTimer = null;
				if (this.gone()) { return; }
				this.$nav.to(target, 'local', 'redirectTo');
			}, 600);
		},
	},
};
</script>
