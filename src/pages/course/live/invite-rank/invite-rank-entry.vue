<template>
	<view class="ir-entry-wrap">
		<!-- 与分享有礼同一根悬浮栏。showEntry 是页面级闸门（清屏、商品/礼物等弹窗打开期间整枚收起），
		     与后端那枚 show_entry 无关；两层与在一起才是 entryOn。几何值与叠放步进都在
		     tz-live-side-entry 那一份里，层号由页面按此刻常驻显示着的几枚连续编号传进来
		     （写死会在缺席一枚时中间留一个空洞）。同栏那枚临时的「消息」入口不参与这拨发号、
		     单独追加在本栏最底下那枚之下，本入口不因它移位。本处只说「我这一枚显示不显示」。
		     图标：2026-10-05 用户第二次点名换新版素材，invite_rand.png 这一张是**透明底橙色奖杯字形图**
		     （素材原文件带一层不透明白底，装进 src 前已抠成透明底，否则压到黑 35% 圆底上是一块白方块），
		     归组件里「字形图内缩 20.25 躺在黑 35% 圆底里」那一档，与同栏红包同一型 ⇒ **不再带 badge**。
		     讨论区那张邀请达人榜卡用的是同一张图（message-list.vue 里同一份路径，卡内 20px 那一格） -->
		<tz-live-side-entry v-if="entryOn" :level="level"
			:center-y="centerY" :stack-count="stackCount" icon="/static/image/live/invite_rand.png"
			@open="openBoard" />

		<board-list :show="boardShow" :rows="rows" :top="top" :total="total" :loading="loading" :refreshing="refreshing"
			:error="error" :load-status="loadStatus" :me="me" :activity="activity"
			@close="boardShow = false" @refresh="refreshBoard" @load-more="loadMore"
			@my="openMy" @share="$emit('share')" />

		<my-invite :show="myShow" :rows="myRows" :loading="myLoading" :refreshing="myRefreshing"
			:error="myError" :load-status="myLoadStatus" :invite-num="me.invite_num"
			:avatar="myAvatar" :nickname="myNickname"
			@close="myShow = false" @refresh="refreshMy" @load-more="loadMyMore" />
	</view>
</template>

<script>
/**
 * 邀请达人榜在直播间的挂载点：右侧悬浮入口 + 两层弹层（榜单 / 我的邀请）。
 *
 * 页面侧只挂这一只组件（`ref="inviteRankPopup"`），对外公开两个方法：
 *   reload()   从别处退回直播间时由页面 onShow 调一次，重判入口显隐
 *   事件 share 榜单弹层的「立即分享」，由页面转去调底部工具条那一只 share-modal（不新造分享弹层）
 *
 * 入口显隐读后端 board 接口下发的 show_entry 一枚布尔（= 运营设置里那枚直播间开关 **与** 达人榜设置表单
 * 里的「状态」两枚都开；2026-10-04 用户点名「邀请达人榜开通的条件有两个」。**榜空也出**，
 * 进去是空态 + 「立即分享」（见 PRD §十二 2026-09-30 纠正——判据原先还要求「榜上至少有一行」，
 * 而榜上的行要靠这枚入口去分享才产生，等于自锁：新直播间开了开关永远等不到第一行，
 * 商家看到的就是「明明开了却没有按钮」），前端不自己 rows.length>0 数一遍（M22）。
 * 这里不用模块级 that（M23：同一路由开两次时会把写入打到已销毁实例上），回调一律箭头函数吃 this。
 */
import boardList from './board-list.vue';
import myInvite from './my-invite.vue';

export default {
	name: 'invite-rank-entry',
	components: { boardList, myInvite },
	props: {
		courseId: { type: [String, Number], default: 0 },
		/** 页面级闸门：清屏或任意弹层打开期间由页面置 false，入口整枚收起（不动后端那枚 show_entry 判据） */
		showEntry: { type: Boolean, default: true },
		/**
		 * 这一枚在右侧那根栏里的层号，由页面按「此刻常驻显示着的几枚」连续编号后传进来
		 * （缺席一枚时中间不留空洞，见 live.vue 的 sideEntryLevels；同栏临时的消息入口不参与发号）
		 */
		level: { type: [Number, String], default: 0 },
		/**
		 * 讨论区垂直中心线（px）与参与居中的常驻枚数，页面实测后传下来，原样透给 tz-live-side-entry
		 * （2026-10-05 用户点名「y 轴下移到讨论区高度垂直居中的位置」，原先那一栏锚在写死的 38% 上）。
		 * 这一对只决定整根栏的基准线，本组件不参与任何几何计算，也不另存一份
		 */
		centerY: { type: [Number, String], default: 0 },
		stackCount: { type: [Number, String], default: 0 },
	},
	emits: ['share', 'entry-state'],
	data() {
		return {
			entryVisible: false,
			boardShow: false,
			myShow: false,
			rows: [],
			// 后端 board 一起下发的最多三条前三名的行（领奖台那一档吃它，与 list 同源同请求）
			top: [],
			// 榜上共有几位参与用户（后端 board 的 total，已按 APP_RANK_MAX 截好）：
			// 2026-10-06 用户点名「参与用户只有 3 个就不要用领奖台，直接列表」⇒ 前三名那一档摆不摆
			// 由它判，前端不拿 rows.length 自己数（M22；翻页时 rows 只有当前这一页，数出来会变小）。
			// 这一枚原先接口就下发、只是界面没消费（硬约束 32②：返回体里的 total 必须有一处消费）
			total: 0,
			// 底部那条吃后端 board 下发的 me：名次 / 邀请人数 / 是否上榜 + 身份两件（nickname/avatar），
			// 未上榜那一档显示的是「我的头像 + 昵称 + 邀请人数」，不写「暂未上榜」
			me: { rank: 0, invite_num: 0, on_board: false, nickname: '', avatar: '' },
			activity: {},
			page: 1,
			hasMore: false,
			loading: false,
			refreshing: false,
			error: '',
			myRows: [],
			myPage: 1,
			myHasMore: false,
			myLoading: false,
			myRefreshing: false,
			myError: '',
		};
	},
	computed: {
		entryOn() {
			return !!(this.entryVisible && this.showEntry);
		},
		loadStatus() {
			if (this.loading) { return 'loading'; }
			return this.hasMore ? 'loadmore' : 'nomore';
		},
		myLoadStatus() {
			if (this.myLoading) { return 'loading'; }
			return this.myHasMore ? 'loadmore' : 'nomore';
		},
		/** 顶部身份行吃页面已缓存的登录用户，不为这一行再发一次用户接口 */
		meUser() {
			return this.$tools.cachedUser() || {};
		},
		myAvatar() {
			return this.meUser.avatar || '';
		},
		myNickname() {
			return this.meUser.nickname || '';
		},
	},
	watch: {
		// 直播间的 course_id 来自 course.detail，进页面那一刻还是空的：等这一路补上再取
		courseId(val) {
			if (val) { this.loadBoard(); }
		},
		// 入口显隐上抛页面：右侧那根栏按实际显示着的几枚连续编号（缺席一枚中间不留空洞）
		entryVisible() { this.$emit('entry-state', this.entryOn); },
		showEntry() { this.$emit('entry-state', this.entryOn); },
	},
	mounted() {
		this.loadBoard();
	},
	methods: {
		/** 页面正在卸载时晚到的回音不再写 data（M26：给已出栈页面 setData 会打断整条推送调度） */
		gone() {
			return this._isDestroyed === true || this._isBeingDestroyed === true;
		},
		/** 由页面 onShow 调用（退回直播间重判一次入口；首屏那一次由 mounted 自己发，不重复请求） */
		reload() {
			this.loadBoard();
		},
		openBoard() {
			this.boardShow = true;
			// 打开时静默补一次，保证看到的是此刻的榜；在途不加转圈（M18⑨g：等待只写在内容那一格）
			this.loadBoard();
		},
		/**
		 * 榜单取数（page=1 整份覆盖，page>1 追加）
		 * 游客也发这一条（board 是 auth:false + 后端 $noNeedLogin）：入口显隐只由商家那两枚开关决定，
		 * 不给游客藏入口；「我的名次」那一段后端按 user_id=0 回未上榜，
		 * 要身份的「我的邀请」仍在请求层吃 401 走全站既有登录引导（PRD M-P1 交互闭环）
		 */
		loadBoard(page) {
			if (!this.courseId) {
				this.entryVisible = false;
				return;
			}
			const target = Math.max(1, Number(page) || 1);
			if (target > 1 && this.loading) { return; }
			this.loading = true;
			this.error = '';
			this.$api('invite_rank.rank.board', { course_id: this.courseId, page: target }).then((ret) => {
				this.loading = false;
				this.refreshing = false;
				if (this.gone()) { return; }
				if (!ret || ret.code !== 1) {
					this.entryVisible = false;
					if (target === 1) {
						this.rows = [];
						this.top = [];
						// 总数跟着清一次：留着上一场的数会让领奖台那一档在「其实取不到榜」时仍然摆着
						this.total = 0;
						this.error = (ret && ret.msg) || '榜单获取失败，请下拉刷新重试';
					}
					return;
				}
				const data = ret.data || {};
				this.entryVisible = !!data.show_entry;
				this.me = data.me || this.me;
				this.activity = data.activity || {};
				this.hasMore = !!data.has_more;
				this.page = target;
				// 参与用户总数：每一页回的都是同一个数，直接覆盖（前三名那一档摆不摆由它判，见 board-list）
				this.total = Number(data.total) || 0;
				this.rows = target === 1 ? (data.list || []) : this.rows.concat(data.list || []);
				// 前三名只在第一页那一次覆盖：翻页时后端仍按 top 回同一批人，跟着 concat 会摆出两排领奖台
				if (target === 1) {
					this.top = data.top || [];
				}
			}).catch(() => {
				this.loading = false;
				this.refreshing = false;
				if (this.gone()) { return; }
				this.entryVisible = false;
				if (target === 1) {
					this.rows = [];
					this.top = [];
					this.total = 0;
					this.error = '榜单获取失败，请下拉刷新重试';
				}
			});
		},
		loadMore() {
			if (!this.hasMore || this.loading) { return; }
			this.loadBoard(this.page + 1);
		},
		refreshBoard() {
			this.refreshing = true;
			this.loadBoard(1);
		},
		openMy() {
			this.myShow = true;
			this.loadMy(1);
		},
		loadMy(page) {
			if (!this.courseId) { return; }
			const target = Math.max(1, Number(page) || 1);
			if (target > 1 && this.myLoading) { return; }
			// 没登录时这一条根本发不出去（请求层按 auth:true 直接 cancel 并弹登录引导），
			// 所以空态要说「登录后可看」，不能写「获取失败，请下拉刷新重试」——
			// 下拉刷新永远等不来结果，把「没身份」说成「服务坏了」是 M13 明令分开的那两种成因。
			// 入口与榜单本身对游客照常可见（show_entry 只认商家那两枚开关，见 PRD §12.5 第 2 条），
			// 收掉的只有这一屏的数据，不是入口。
			if (!uni.getStorageSync('user_token')) {
				this.myRows = [];
				this.myHasMore = false;
				this.myLoading = false;
				this.myRefreshing = false;
				this.myError = '登录后可查看你邀请的好友明细';
				return;
			}
			this.myLoading = true;
			this.myError = '';
			this.$api('invite_rank.rank.my', { course_id: this.courseId, page: target }).then((ret) => {
				this.myLoading = false;
				this.myRefreshing = false;
				if (this.gone()) { return; }
				if (!ret || ret.code !== 1) {
					if (target === 1) {
						this.myRows = [];
						this.myError = (ret && ret.msg) || '邀请明细获取失败，请下拉刷新重试';
					}
					return;
				}
				const data = ret.data || {};
				this.myHasMore = !!data.has_more;
				this.myPage = target;
				this.myRows = target === 1 ? (data.rows || []) : this.myRows.concat(data.rows || []);
			}).catch(() => {
				this.myLoading = false;
				this.myRefreshing = false;
				if (this.gone()) { return; }
				if (target === 1) {
					this.myRows = [];
					this.myError = '邀请明细获取失败，请下拉刷新重试';
				}
			});
		},
		loadMyMore() {
			if (!this.myHasMore || this.myLoading) { return; }
			this.loadMy(this.myPage + 1);
		},
		refreshMy() {
			this.myRefreshing = true;
			this.loadMy(1);
		},
	},
};
</script>

<style scoped>
/* 入口的几何与叠放在共用组件里，这一层只是两个弹层的宿主，不参与定位 */
.ir-entry-wrap {
	display: block;
}
</style>
