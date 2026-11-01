<template>
	<!--
	  推荐语弹窗（2026-09-26 用户口径：参照竞品，入口在分享弹层底部样式预览那一排的右侧）。
	  只吃文案：内容就是这一页分享接口给的那条图文文案（含链接），图片不进这里——海报那一张已经有图了。
	  弹层档与 tz-share-poster 同一份（底部 Popup + 面板自带内衬与安全区），层级压在分享弹层之上，
	  弹层之上不再用 uni.showModal（会被 u-popup 的 z-index 压住，见 M18）。
	-->
	<u-popup :show="show" mode="bottom" bgColor="transparent" :round="12" :closeable="true" :closeOnClickOverlay="true"
		:safeAreaInsetBottom="false" :zIndex="12050" :overlayStyle="{ zIndex: 12040 }" @close="close">
		<view class="rc">
			<!-- 标题与关闭钮走 tz-nickname-modal 同一档：关闭用 u-popup 自带的 closeable（18 号 #909399 落右上角），
			     标题是面板第一个子节点、16px/600 左对齐、内衬 15/0/12 —— 不自造居中标题行、也不自己画一枚关闭（M18） -->
			<view class="rc-title">{{ link ? '分享链接' : '推荐语' }}</view>
			<view class="rc-desc">{{ link ? '复制后发给好友，对方点开就是这一页。' : '分享到好友/朋友圈，附上推荐语更有诚意。' }}</view>
			<!-- 加载态：骨架屏（M16，灰块尺寸与真实文案块一致，不给弹窗高度跳动）。
			     rows-width 必须带冒号绑成数组：写成静态属性就是一条字符串，u-skeleton 认不出数组，
			     三行会全部铺满宽度，「最后一行收一档」那一档白写 -->
			<view class="rc-box" v-if="loading">
				<u-skeleton :loading="true" :animate="true" :rows="3" rows-height="12"
					:rows-width="['100%', '92%', '56%']"></u-skeleton>
			</view>
			<!-- 文案整篇铺开、不套滚动区：推荐语就两三句 + 一条链接，要用户在里面滑动才看全等于没给看
			     （2026-09-26 用户点名「弹窗不够高，内容要滚动才能看全」）；行高与折行交给文字自己撑 -->
			<view class="rc-box" v-else>
				<text class="rc-text" v-if="link">{{ link }}</text>
				<text class="rc-text" v-else-if="text">{{ text }}</text>
				<text class="rc-empty" v-else>{{ link ? '分享链接获取失败，请稍后重试' : '推荐语获取失败，点下方「换一条」重试' }}</text>
			</view>
			<!-- 取文案中：加载态只出现在上面这个文案块里，下面两枚常驻但置灰禁用
			     （2026-09-26 用户口径：换一条刷新时不要把按钮收掉，禁用即可——收掉会让弹层高度跳一下，
			     用户也读不出「这一次没点上是因为还在取」）。
			     链接那一档不出「换一条」：链接是按这一页算出来的，换一条只会换文案、链接不变 -->
			<view class="rc-change" :class="loading ? 'rc-change--disabled' : ''" @tap="onChange" v-if="!link">
				<u-icon class="rc-ic" name="reload" :size="14" color="#1d2129"></u-icon>
				<text class="rc-change-text">换一条</text>
			</view>
			<!-- 手上还没有内容（首次就失败）时仍不出复制按钮，不留点了没反应又不说明原因的按钮 -->
			<tz-button class="rc-btn" size="normal" long type="primary" :text="link ? '复制链接' : '复制文案'" @click="copy"
				:disabled="loading" v-if="loading || text || link"></tz-button>
		</view>
	</u-popup>
</template>

<script>
/**
 * props: show, text, loading
 *        text    = 这一页的分享文案（后端 share/getArticle 的 data.text，含分享链接），由调用方取好传进来
 *        loading = 文案在取（组件自己不发请求，接口与 type/src 的口径留给调用方那一层）
 * emits: close、change（换一条：调用方重新取一条文案，后端每次随机换一套）
 */
export default {
	name: 'tz-recommend-modal',
	props: {
		show: { type: Boolean, default: false },
		text: { type: String, default: '' },
		/** 后端 share/getArticle 新下发的纯分享链接（2026-10-30「推荐语调整为分享链接」）：
		 *  有它时整只弹窗走链接档（标题「分享链接」、正文只放链接、按钮「复制链接」、不出「换一条」）；
		 *  老接口不下发时回落整段文案那一档，行为与改造前一致 */
		link: { type: String, default: '' },
		loading: { type: Boolean, default: false },
	},
	methods: {
		close() {
			this.$emit('close');
		},
		/**
		 * 「换一条」：正在取的时候这枚是禁用态，点它要给一句为什么（M13：禁用了不等于可以静默）——
		 * 禁用只把颜色置灰，小程序上原生 view 的点击照样会打进来，所以判据留在这里而不是只写样式
		 */
		onChange() {
			if (this.loading) {
				uni.showToast({ title: '推荐语正在获取，请稍候', icon: 'none' });
				return;
			}
			this.$emit('change');
		},
		/**
		 * 复制文案：H5 的 setClipboardData 是同步的 document.execCommand('copy')，必须在点击这一层
		 * 同步调用（等接口回来再复制已脱离用户手势，iOS/微信里返回 false、success 不回调），
		 * 所以文案由调用方在打开弹层前就取好；这一刻还没有文案，要说清为什么（M13）。
		 */
		copy() {
			// 链接档优先：这一档复制的是链接本身（用户口径「推荐语调整为分享链接」）
			var payload = this.link || this.text;
			if (!payload) {
				uni.showToast({ title: this.link ? '分享链接还没取到，请稍后重试' : '推荐语还没取到，请先换一条', icon: 'none' });
				return;
			}
			uni.setClipboardData({
				data: payload,
				success: () => uni.showToast({ title: this.link ? '链接已复制' : '文案已复制', icon: 'none' }),
			});
		},
	},
};
</script>

<style scoped>
/* 面板：白底 + 顶部圆角 12，左右 16、底部 20 + 安全区 —— 与 tz-nickname-modal 的 .tz-nickname-popup
   同一组数值（组件 isolated，全局 .school-popup 档进不来，自带一份）；关闭钮由 u-popup 的 closeable 给，
   所以顶部不再留 40px 那一段（那是「面板自己画一枚关闭」的写法） */
.rc {
	position: relative;
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	padding: 0 16px 20px;
	padding-bottom: calc(20px + constant(safe-area-inset-bottom));
	padding-bottom: calc(20px + env(safe-area-inset-bottom));
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(20px + constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(20px + env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}
/* 标题走 .school-popup-title 口径：16px/600 左对齐、内衬 15/0/12（与 tz-nickname-modal 逐值一致） */
.rc-title {
	padding: 15px 0 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}
.rc-desc {
	font-size: 12px;
	line-height: 16px;
	color: #86909c;
}
/* 文案块：灰底圆角 4，高度随内容且至少 220px（2026-09-26 用户口径「还是过低，再加 100px」——
   原先那格固定 96px 要滑动才看全，去掉滚动后按内容撑开约 120px，这一档把弹层整体抬到能一眼读完；
   骨架屏与真实文案同一块同一高度，切换时弹层不跳） */
.rc-box {
	background: #f7f8fa;
	border-radius: 4px;
	padding: 15px;
	margin-top: 12px;
	min-height: 220px;
	box-sizing: border-box;
}
.rc-text {
	font-size: 14px;
	line-height: 22px;
	color: #1d2129;
	word-break: break-all;
}
.rc-empty {
	font-size: 12px;
	line-height: 18px;
	color: #86909c;
}
/* 换一条：图标 + 文字同一行（横排图标型按钮取反档——文字 14、图标墨迹 12 ⇒ uview reload :size 14） */
.rc-change {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 14px;
}
/* 取文案中的禁用档：整枚置灰（与 tz-button 的 disabled 同一观感），点击在 onChange 里被拦并说原因 */
.rc-change--disabled {
	opacity: 0.45;
}
.rc-change-text {
	font-size: 14px;
	line-height: 20px;
	color: #1d2129;
	margin-left: 4px;
}
/* 与文字配对的行内图标光学垂直居中（uview reload 实测墨迹中心≈自身行盒中心，14px 中文低约 0.5px ⇒ 补 0.5px） */
.rc-ic {
	transform: translateY(0.5px);
}
.rc-btn {
	margin-top: 18px;
}
</style>
