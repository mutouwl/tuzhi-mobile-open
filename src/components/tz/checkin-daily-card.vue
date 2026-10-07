<template>
	<!--
	  打卡日签图弹层：架构与全局分享弹窗共用同一份（tz-share-poster 弹层壳 + tz-share-poster-body 海报本体）。
	  这一层只留打卡特有的三件事，其余都在共用组件里（M18）：
	    ① 金句库由后端随日记详情下发（props.quotes），弹层在本地轮播——「换一条」不等接口，quoteIndex 归这一层管；
	    ② 右下角那张码的落点是这条日记所属的打卡活动介绍页（checkinId，免登录可浏览），与下面那条复制链接同一个去处；
	    ③ 弹层里「分享」在普通浏览器 / App 上剩下的那一条路——复制这条活动的链接。
	       收在这一层而不是每个调用点各写一份：日记详情页与动态列表卡（本人那条的「更多→日签图」）
	       开的是同一只弹层，复制链接这条链（预取时机 + 同步复制 + 两句提示文案）只要两份就会分叉。
	  弹层版式（海报在上、选样式与保存/分享在下）、底图与自带渐变的回落、保存/分享在各端的落法，
	  都由共用组件给，两处不再各写一份。
	-->
	<tz-share-poster :show="show" layout="daily" :poster="poster" :share-bgs="shareBgs"
		code-type="checkin" :code-id="checkinId" subject="日签图" :show-recommend="false"
		@close="close" @share="copyLink" @next-quote="nextQuote" @copy-quote="copyQuote"></tz-share-poster>
</template>

<script>
/**
 * props: show, checkinId, checkinTitle, nickname, avatar, totalDays, quotes, shareBgs
 *        quotes   = 后端随日记详情下发的金句库（`[{text, from}]`，弹层在本地轮播，点「换一条」不等接口，
 *                   不在前端写死语录（frame.md 第 9 条）；2026-09-27 起后端恒下发
 *                   common/constant/checkin/Quote 那 10 条内置金句——管理端「打卡设置 → 金句管理」暂时下线，
 *                   商家那张表里的行不再参与取数）
 *        shareBgs = 后端随日记详情下发的分享背景图地址清单；有图就整排换成这些图当样式，
 *                   空清单则回落共用组件那几档弥散渐变（日签图不能开出来是空的）。
 *                   2026-09-27 起后端恒给空清单（管理端「打卡设置 → 日签图背景」暂时下线），
 *                   所以现在这一排就是自带的渐变档
 *        checkinId= 这条日记所属的打卡活动 ID：右下角那张码扫进去落的就是这个活动的介绍页（免登录可浏览，
 *                   活动主页要登录会把访客挡在分享链接的第一步），与「分享」要复制的那条链接同一个去处
 *                   （日记本身没有独立分享口径，非成员/仅管理员可见的日记扫过去是空态，
 *                   故不调 share 里那种带 record_id 的地址）
 * emits: close（「分享」不再上抛：小程序与微信内 H5 的分享在共用组件里按端分路，
 *        只有普通浏览器 / App 会 emit 给这一层，那一端复制链接是唯一能做的事，见 copyLink）
 */
export default {
	name: 'tz-checkin-daily-card',
	props: {
		show: { type: Boolean, default: false },
		checkinId: { type: [Number, String], default: 0 },
		checkinTitle: { type: String, default: '' },
		nickname: { type: String, default: '' },
		avatar: { type: String, default: '' },
		totalDays: { type: Number, default: 1 },
		quotes: { type: Array, default: () => [] },
		shareBgs: { type: Array, default: () => [] },
	},
	data() {
		return {
			// 当前用的是库里第几句（「换一条」在这份清单里轮播；每次重开弹层随机起一句）
			quoteIndex: 0,
			// 这一条打卡活动的 H5 链接：打开弹层时就先取好放着，点「分享」时只读缓存（见 copyLink）
			shareLink: '',
		};
	},
	computed: {
		/**
		 * 金句与出处：取库里当前这一句（库里没有就是空串，海报上不写死一份兜底语录——那正是「前端写死选项」）
		 */
		activeQuote() {
			const rows = this.quotes || [];
			return rows[this.quoteIndex] || rows[0] || { text: '', from: '' };
		},
		poster() {
			return {
				nickname: this.nickname,
				avatar: this.avatar,
				name: this.checkinTitle,
				quote: this.activeQuote.text || '',
				quoteFrom: this.activeQuote.from || '',
				totalDays: this.totalDays,
			};
		},
	},
	watch: {
		// 每次打开弹层随机起一句（PRD 的「缺省随机语录库」）：连续两次打开不会停在同一句，
		// 「换一条」再从这个随机起点往后轮播；金句库还没到手时不跳（下标留在 0）。
		// 顺手把要复制的链接取回来：只在 H5/App 预取，小程序端点「分享」调的是微信图片分享面板
		// （共用组件内分路），这一端根本不会 emit share，那条链接没有消费方，不白要一次接口
		show(v) {
			if (!v) return;
			const n = (this.quotes || []).length;
			if (n) this.quoteIndex = Math.floor(Math.random() * n);
			// #ifndef MP-WEIXIN
			this.getShareLink();
			// #endif
		},
	},
	methods: {
		close() {
			this.$emit('close');
		},
		/**
		 * 「换一条」：在后端下发的金句库里往后走一格（不等接口，纯本地轮播）。
		 * 2026-09-26 用户点名「复制金句左侧再放一枚换一条按钮，只有一条也要显示」⇒ 这一枚不再按库里句数
		 * 隐藏（海报上有金句就与「复制金句」成对出，判据只看这一句金句在不在）。但只有一句时确实切不出
		 * 别的——金句一律以后端下发的清单为准，前端不顶一份内置库补数（那是「前端写死选项」），
		 * 所以点下去要把这句原因说出口（M13：禁用只换颜色不算提示，不留一枚点了没反应的按钮）。
		 */
		nextQuote() {
			const n = (this.quotes || []).length;
			if (n < 2) {
				uni.showToast({ title: '当前只有1条金句，暂无更多可换', icon: 'none' });
				return;
			}
			this.quoteIndex = (this.quoteIndex + 1) % n;
		},
		copyQuote() {
			uni.setClipboardData({
				data: this.activeQuote.text + '——' + (this.activeQuote.from || ''),
				success: () => uni.showToast({ title: '金句已复制', icon: 'none' }),
			});
		},
		/**
		 * 弹层「分享」在普通浏览器 / App 上的出口：复制这条活动的 H5 链接（用户可连同保存下来的海报一起发出去）
		 *
		 * 必须在点击回调这一层同步写剪贴板：H5 的 uni.setClipboardData 走 document.execCommand('copy')，
		 * 等 shareInfo 接口回来再复制时已经脱离用户手势，iOS / 微信内置浏览器里 execCommand 返回 false、
		 * success 不回调，而原写法又没有 fail 分支，症状就是「点了分享没反应」（2026-09-25 用户实机反馈）。
		 * 所以链接在打开弹层那一刻就先取好放缓存（见 watch.show → getShareLink），这里只读缓存；
		 * 缓存还是空也要说一句为什么并顺手再取一次（M13：静默 return = 点了没反应）。
		 */
		copyLink() {
			if (!this.shareLink) {
				uni.showToast({ title: '分享链接获取失败，请重新打开日签图再试', icon: 'none' });
				this.getShareLink();
				return;
			}
			uni.setClipboardData({
				data: this.shareLink,
				success: () => uni.showToast({ title: '链接已复制', icon: 'none' }),
				fail: () => uni.showToast({ title: '复制失败，请重试', icon: 'none' }),
			});
		},
		getShareLink() {
			if (this.shareLink || !this.checkinId) return;
			this.$api('checkin.checkin.shareInfo', { checkin_id: this.checkinId }).then((ret) => {
				// 失败不在这里说：这一刻用户还没点「分享」，说了也看不懂；空缓存留给 copyLink 给原因（M13）
				if (!ret || ret.code !== 1) return;
				this.shareLink = (ret.data && ret.data.h5_link) || '';
			});
		},
	},
};
</script>
