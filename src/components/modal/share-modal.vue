<template>
	<!--
	  全局分享弹窗（课程/商品/圈子/打卡/活动/教务…各详情页共用这一只）。
	  2026-09-26 改为与打卡日签图同一套架构：海报在上、选样式与保存/分享在下的底部弹层
	  （tz-share-poster + tz-share-poster-body），海报由前端画布画，因此能带上这一条内容自己的封面与价格
	  （参照竞品：只有一张通用底图的海报扫出来认不出分享的是什么）。
	  原来那两栏「图文 / 海报」收成一处：图文的文案不再单独占一栏，改做底部样式条右侧的「推荐语」入口
	  （只取文案，图片不进推荐语——海报那一张已经有图了）。
	  两只弹层平级放（不套在可点容器里，见 M19）。
	-->
	<div>
		<!-- 底部样式条右侧那枚「分享链接」入口（2026-10-30 由「推荐语」改名）的判据收在 computed showRecommend：
		     微信小程序端整枚不出（2026-10-31 用户口径「不要显示分享链接按钮了」——这一端的分享走微信的图片
		     分享面板与海报上的小程序码，不摆复制链接这一档），其余端有文案才出、文案正在取也出（入口换成骨架块，
		     见 tz-share-poster 的 recommendLoading），首次就失败时两者都不成立 → 整枚不出，不留点了没反应的按钮 -->
		<tz-share-poster :show="show" layout="content" :poster="poster" :share-bgs="shareBgs"
			:code-type="type" :code-id="shareSrc" subject="分享海报" :show-recommend="showRecommend"
			:recommend-loading="articleLoading"
			@close="close" @share="copyArticle" @recommend="recommendVisible = true"></tz-share-poster>

		<!-- 分享链接：文案与「换一条」都走 share/getArticle（后端每次随机换一套），复制在点击的同步栈里做。
		     link 是后端新下发的纯链接（2026-10-30 用户口径「推荐语调整为分享链接」）：有它时弹窗标题与
		     复制内容都走链接那一档，没有时回落整段文案，老接口不下发也不会空屏 -->
		<tz-recommend-modal :show="recommendVisible" :text="article.text" :link="article.link || ''"
			:loading="articleLoading" @close="recommendVisible = false" @change="getArticle"></tz-recommend-modal>
	</div>
</template>

<script>
/**
 * props: visible, val, type, circleId + 这一条内容自己的信息（海报上要画，页面已经加载好了就传进来）
 *        visible  = 开关
 *        val      = 传给接口的 src（实体 ID 或页面路由）
 *        type     = 后端 app/common/library/share/Links 的分享口径分派键（goods/physical/course/coupon/
 *                   exercises/test/vipcard/activity/order/circle/circle_post/checkin/checkin_task/
 *                   school_booking/school_package/page…），右下角那张码也按它取
 *        circleId = 来源圈子 ID：从圈子课程列表进入课程详情后分享，链接需带该参数
 *        title    = 内容名称（与全站课程卡同一份口径，课程详情传 data.name）——海报内容卡上就画这一行字
 *        cover    = 内容封面（没传就退回 share/getArticle 给的那一张；两个都没有或都加载不出来，
 *                  由 tz-share-poster-body 依次填站点 logo 与全站默认商品图，见那里的 coverSrc / coverPaint
 *                  ——画布那一份也同一条兜底，所以这里不用再兜一层）
 *        inviteText = 邀请头那句（默认「邀请你一起学习」）
 *        shareBgs = 后台配置的分享底图清单；目前只有打卡模块有这一项配置（2026-09-27 起那项暂时下线，
 *                   后端恒下发空清单），内容分享本就暂无配置项，两种都是整排回落共用组件自带的弥散渐变档
 *        ⚠ 内容卡只画「封面 + 标题」（2026-09-26 用户点名简化）：类型标签、现价、划线原价、店铺名
 *          都不再上海报，本组件也就不接收这些入参——调用点别再把 price / pay_type / is_virtual_pay /
 *          price_marking / tag / subtitle 抄进来，那会是一份没人读的接口
 * emits: close、open（与改造前同一份对外契约，调用点不用改）
 */
export default {
	name: 'share-modal',
	data() {
		return {
			show: false,
			articleLoading: false,
			articleRequestId: 0,
			article: { text: '' },
			recommendVisible: false,
		};
	},
	props: {
		visible: {
			type: [Boolean, Number],
			default: false
		},
		val: {
			type: [String, Number],
			default: ''
		},
		type: {
			type: String,
			default: 'goods'
		},
		//来源圈子 ID：从圈子课程列表进入课程详情后分享，分享链接需携带该参数
		circleId: {
			type: [String, Number],
			default: ''
		},
		title: { type: String, default: '' },
		cover: { type: String, default: '' },
		inviteText: { type: String, default: '邀请你一起学习' },
		shareBgs: { type: Array, default: () => [] },
	},
	computed: {
		/**
		 * 传给接口的 src：type=page 且调用点没给路径时落在当前这一页
		 * （判据与改造前一致，只是不再把算出来的路由回写进 prop——改 prop 在小程序端会告警）
		 */
		shareSrc() {
			if (this.val !== '' && this.val !== null && this.val !== undefined) return this.val;
			if (this.type !== 'page') return '';
			const pages = getCurrentPages();
			const cur = pages[pages.length - 1];
			return cur ? cur.route : '';
		},
		/** 分享人 = 当前登录用户（未登录时与后端 getArticle 同一份兜底：'用户'） */
		sharer() {
			const user = (this.$tools && this.$tools.cachedUser()) || {};
			return { nickname: user.nickname || '用户', avatar: user.avatar || '' };
		},
		/**
		 * 海报要画的那一张内容卡的数据：只有封面 + 标题（2026-09-26 用户点名「简化内容卡片，仅显示封面+标题」）
		 *
		 * 原先还往下画类型标签、现价、划线原价、店铺名四行——两行标题之下空着一截，卡内四边留边就不均了。
		 * 价格也不再上海报：这一张的职责是「扫进去看这一条」，价格落在详情页说，前端也就不再要
		 * price / pay_type / is_virtual_pay 这几个入参（金币计价不该写 ¥ 那类判断随之一起消失）。
		 */
		poster() {
			return {
				nickname: this.sharer.nickname,
				avatar: this.sharer.avatar,
				inviteText: this.inviteText,
				name: this.title,
				cover: this.cover || this.articleCover,
			};
		},
		/** 调用点没传封面时，退回分享图文接口带的那一张（goods/circle/checkin/checkin_task 后端会给 cover） */
		articleCover() {
			const rows = this.article.poster;
			return rows && rows.length ? rows[0] : '';
		},
		/**
		 * 出不出底部样式条右侧那枚「分享链接」入口（2026-10-30 由「推荐语」改名）
		 *
		 * 微信小程序端整枚不出（2026-10-31 用户口径「不要显示分享链接按钮了」）：这一端的分享走微信的
		 * 图片分享面板与海报上的小程序码，不摆复制链接这一档；其余端照旧——有文案才出、文案正在取也出
		 * （入口换成骨架块），首次就失败时整枚不出。
		 */
		showRecommend() {
			// #ifdef MP-WEIXIN
			return false;
			// #endif
			return !!this.article.text || this.articleLoading;
		},
	},
	watch: {
		visible() {
			this.show = this.visible;
			if (this.show) {
				// 每次重开都重新取一条文案（后端每次随机换一套），并收掉推荐语弹窗
				this.recommendVisible = false;
				this.getArticle();
			}
		},
	},
	methods: {
		close() {
			this.$emit('close', false);
		},
		open() {
			this.$emit('open', false);
		},
		/**
		 * 取这一页的分享文案（推荐语与「普通浏览器点分享」两条路共用这一份缓存）
		 *
		 * 打开弹层就取，不等用户点推荐语：H5 的 setClipboardData 是同步的 document.execCommand('copy')，
		 * 脱离用户手势再复制在 iOS / 微信里就不生效了，所以点击这一刻只能读缓存（M13：缓存为空要说原因）。
		 */
		getArticle() {
			var that = this;
			// 防重复请求：加载中再次触发（如反复点「换一条」）直接忽略
			if (that.articleLoading) return;
			var requestId = ++that.articleRequestId;
			that.articleLoading = true;
			that.$api('share.getArticle', {
				type: that.type,
				src: that.shareSrc,
				circle_id: that.circleId
			}).then(res => {
				if (requestId !== that.articleRequestId) return;
				that.articleLoading = false;
				if (res && res.code === 1 && res.data) {
					that.article = res.data;
					return;
				}
				// 失败要有出口（M13）：文案取不到时推荐语里说「获取失败，点换一条重试」，不留一块空白
				that.article = { text: '', poster: that.article.poster };
			}).catch(() => {
				if (requestId === that.articleRequestId) {
					that.articleLoading = false;
				}
			});
		},
		/**
		 * 普通浏览器 / App 点「分享」：这一端既没有可编程调起的分享面板、也看不到右上角「···」，
		 * 剩下的一条路就是把这条内容的分享文案（含链接）复制走（见 tz-share-poster 的 share 分路）。
		 */
		copyArticle() {
			var that = this;
			if (!that.article.text) {
				uni.showToast({ title: '分享文案还没取到，请稍后重试', icon: 'none' });
				that.getArticle();
				return;
			}
			uni.setClipboardData({
				data: that.article.text,
				success: function () {
					uni.showToast({ title: '文案已复制', icon: 'none' });
				}
			});
		},
	},
	mounted() {
		this.show = this.visible;
		if (this.show) this.getArticle();
	}
}

</script>
