<template>
	<!--
	  分享海报弹层（底部弹层档，M18）：海报在上、白色面板在下，整列一起上滑。
	  这一层只管「弹层 + 选样式 + 保存/分享 + 那张码 + 出图在各端的落法」，
	  海报里画什么由 tz-share-poster-body 按 layout 出两档版式（日签图 / 内容分享）。
	  那张码（H5 二维码 / 小程序小程序码）有取码超时兜底（CODE_TIMEOUT，5~10s 那一档），且**拿不到码就不出海报**：
	  接口回失败、网络异常、到点超时三条都走 failCode —— 弹一句原因并关掉弹层（2026-09-28 用户口径：
	  一张没有码的海报存出去扫不进任何页面）；取码期间弹层照样能关（见 close）。
	  安全区由本组件面板自己收（组件是 isolated 的，全局 .school-popup 档进不来，同一组数值写在这里一份，
	  参照 tz-nickname-modal）。
	-->
	<view class="sh-wrap">
	<u-popup v-if="!inline" :show="show" mode="bottom" bgColor="transparent" :round="12" :closeOnClickOverlay="true"
		:safeAreaInsetBottom="false" :zIndex="12010" :overlayStyle="{ zIndex: 12000 }" @close="close">
		<view class="sh">
			<!-- 海报舞台：占「面板顶到页面顶」那一段，海报在这一段里垂直居中（2026-09-26 用户口径）。
			     这一段是透明的，点它就该等于点遮罩关闭——但 u-popup 的内容节点自带 @tap.stop="noop"，
			     这一下会被内容区吃掉、传不到遮罩，所以这一段自己接 close；
			     海报本体那一下要 stop 住（点图不是点遮罩，不能一按图弹层就没了） -->
			<view class="sh-stage" :style="{ height: stageHeight + 'px' }" @tap="close">
				<view class="sh-poster" @tap.stop>
					<!-- 只在弹层开着时挂载海报本体（关闭后等收起动画跑完再卸载，见 active 的 watcher）。
					     为什么必须这样做：本体里那几张 <image>（封面/底图/头像）在弹层关着时也会把地址塞进加载队列，
					     而返回上一页时那次"晚到的 @load"会写到一个已经出栈的页面上（细则见 ui-baseline-mobile.md M26
					     与 src/main.js 的出口闸门注释）。
					     注意：`TypeError: Cannot read properties of null (reading '<站点二级域>')` 这一条**不是**出栈造成的，
					     海报这一例的真因是「地址当 data 键」被 setData 当成嵌套路径解析 —— 见 common/utils/mp-data-key；
					     闸门只是兜底，别把它当成这一族报错的解释。
					     代价只是"点开弹层那一下才开始取海报素材"，弹层自带的加载态盖住这一段。 -->
					<tz-share-poster-body v-if="posterBodyAlive" ref="body" :layout="layout" :style-options="styleOptions" :theme-index="themeIndex"
						:poster="poster" :code-src="codeSrc" :code-alt-src="codeAltSrc" :code-loading="codePending" :render-loading="renderPending" :render-failed="renderFailed" :code-caption="codeCaption" :rendered-src="renderedSrc"
						:scale="posterScale" :bg-sizes="bgSizes"
						@bg-error="onBgError" @bg-load="onBgLoad" @code-error="onCodeImgError" @next-quote="$emit('next-quote')" @copy-quote="$emit('copy-quote')" />
				</view>
			</view>
			<view class="sh-sheet">
				<view class="sh-close" @tap="close"><u-icon name="close" size="18" color="#909399"></u-icon></view>
				<!-- 样式条：整排可左右滑（底图多于屏幕宽度时不能折行，折行会把面板顶高、把海报挤出屏幕），
				     右侧固定一枚「推荐语」入口（2026-09-26 用户口径：放在样式预览选项右侧） -->
				<view class="sh-themes-row">
				<!-- enhanced + show-scrollbar 要成对给：微信的 scroll-view 只有开了 enhanced 才认 show-scrollbar
				     （不带 enhanced 时这个 prop 被静默忽略，样式条下面会留一条滚动条），H5 那一端靠下面的
				     ::-webkit-scrollbar 收（uni 的 H5 运行时没有 enhanced/show-scrollbar 这一档） -->
					<scroll-view scroll-x :enhanced="true" :show-scrollbar="false" class="sh-themes">
						<view v-for="(t, i) in styleOptions" :key="i"
							:class="['sh-theme', i === activeIndex ? 'sh-theme-active' : '']"
							:style="thumbStyleTexts[i]" @tap="themeIndex = i"></view>
					</scroll-view>
					<!-- 文案还在取的时候这一枚就在，只是整格换成骨架块（区域遮罩那档，M16）：
					     留着图标自己变灰会被读成「这枚按钮坏了」，整枚不出又读不出「还在取」；
					     点它要说清为什么还没得选（M13：禁用不等于可以静默）。
					     真取不到（首次就失败）时调用方不再传 showRecommend，那枚不留在这儿 -->
					<view class="sh-recommend" v-if="showRecommend" @tap="onRecommend">
						<u-skeleton v-if="recommendLoading" :loading="true" :animate="true" :title="false" :rows="2"
							rows-height="8" :rows-width="[28, 20]"></u-skeleton>
						<template v-else>
							<u-icon name="edit-pen" :size="24" color="#1d2129"></u-icon>
							<text class="sh-recommend-text">推荐语</text>
						</template>
					</view>
				</view>
				<view class="sh-btns">
					<tz-button class="sh-btn" size="normal" long text="保 存" @click="save"></tz-button>
					<!-- 分享按端分路（见 share）：小程序调微信的图片分享面板、H5 微信内提示右上角「···」，
					     只有拿不到分享入口也看不到右上角的端（普通浏览器）才交回调用方复制链接/文案 -->
					<tz-button class="sh-btn" size="normal" long type="primary" text="分 享" @click="share"></tz-button>
				</view>
			</view>
		</view>
	</u-popup>
		<!-- inline：只出海报那一张，不套弹层（PC 限制提示页那种：页面里直接摆一张海报，
		     没有样式条与保存/分享，也不按视口缩放；出图与取码这一条链照走，长按/右键存的就是这张） -->
		<view v-else class="sh-stage sh-stage--inline">
			<view class="sh-poster">
				<tz-share-poster-body ref="body" :layout="layout" :style-options="styleOptions" :theme-index="themeIndex"
					:poster="poster" :code-src="codeSrc" :code-alt-src="codeAltSrc" :code-loading="codePending" :render-loading="renderPending" :render-failed="renderFailed" :code-caption="codeCaption" :rendered-src="renderedSrc"
					:scale="1" :bg-sizes="bgSizes" @bg-error="onBgError" @bg-load="onBgLoad" @code-error="onCodeImgError"
					@next-quote="$emit('next-quote')" @copy-quote="$emit('copy-quote')" />
			</view>
			<!-- inline 档也要有失败出口：这一张海报上没了码就是张没用的图，得说清为什么（M13） -->
			<view class="sh-tip" v-if="codeFailed">{{ codeFailTip }}</view>
		</view>
	</view>
</template>

<script>
/**
 * props: show, layout, poster, shareBgs, codeType, codeId, subject, showRecommend, recommendLoading, inline
 *        layout        = 'daily'（打卡日签图）| 'content'（内容分享海报），透传给 tz-share-poster-body
 *        poster        = 这一张海报要画的内容（见 tz-share-poster-body 的 props 注释）
 *        shareBgs      = 后端下发的分享背景图清单；配了就整排只用底图、一档自带渐变都不掺，
 *                        一条都没配才整排回落自带弥散渐变（M18⑦，不在前端写死商家样式）。
 *                        2026-09-27 起打卡侧恒下发空清单（管理端「打卡设置 → 日签图背景」暂时下线），
 *                        这一排实际就是自带的那几档渐变
 *        codeType      = 右下角那张码走 share.getQrcode 的 type（打卡日签图 = 'checkin'，内容分享 = 本页的分享 type）
 *        codeId        = 码扫进去的落点 ID / 路径（与本页底栏「分享」同一个去处）
 *        subject       = 这一张弹层叫什么（'日签图' / '分享海报'），失败与结果提示共用这一个词
 *        showRecommend = 出不出「推荐语」入口（调用方手上有文案、或文案正在取才出；
 *                        取不到又没在取就不出，不留点了没反应的按钮）
 *        recommendLoading = 那份文案正在取：入口整格换成骨架块（区域遮罩那档），点它说「正在获取」
 *        inline        = 只摆一张海报、不套弹层（PC 限制提示页那一处）：出图与取码这一条链照走
 * emits: close、recommend（点推荐语入口）、share（只在普通浏览器 / App 那条兜底路上才有意义）、
 *        next-quote、copy-quote（daily 档海报上那两枚金句动作，金句库在调用方手里）、
 *        rendered(src)（图出好了：inline 档调用方要拿这个地址做点击放大 / 长按保存）
 */
import { buildStyleOptions, clampIndex, thumbStyle as thumbCss, styleText } from '@/common/utils/poster-theme';
import { longPressOnly, previewSavablePoster, toSavableSrc } from '@/common/utils/poster-save';
import { mpKey } from '@/common/utils/mp-data-key';

// 底部面板那一块的高（色板 54 + 按钮 ~40 + 上下内衬 40/20 + 间距），用来把海报舞台算成
// 「面板顶到页面顶」那一段——段高按这个估算，宁可少算几像素（多算会让整列超出视口、把面板顶出屏）
const SHEET_H = 196;
// 舞台上下各留的呼吸（与 .sh-stage 的 padding 同一档）
const STAGE_PAD = 24;
// 等预览那一版把头像/底图/封面 load 到手：每 120ms 看一次，最多 10 次（≈1.2s）就不再等，
// 按当下拿到的素材先出一张（等不到的那张本来也画不上，见 body 的 assetsReady 与退档顺序）
const RENDER_RETRY = 10;
const RENDER_GAP = 120;
// 取右下角那张码的超时（2026-09-27 用户口径「限制在 5~10 秒」，取中间那一档 8s）：
// 接口一直不回来（后端取码卡住、小程序码要该页发布过才出得来、或这一端连响应都没有）时，
// **不能让弹层永远停在「加载中」**——到点就把这一次判成失败（见 onCodeTimeout）：
// 遮罩撤掉、码格让开、面板里说清是「获取超时」，这张海报照样能保存与分享。
// 下限 5s 是「慢网别误杀」，上限 10s 是「再等就被读成卡死了」。
const CODE_TIMEOUT = 8000;
// 出图这一条链的硬上限（与取码同一档 5~10s，取 8s）：画布 API 不回音、素材一张都取不到、
// 本体刚被 v-if 挂上/刚被卸载……任何一环卡住都不能让那块「加载中」永久盖着海报。
// 2026-09-27 用户第二次点名这一处：「即便小程序码已经加载出来了，分享弹窗还是一直显示加载状态」——
// 遮罩第一判据就是这一只 renderPending（见 body 的 shadeLoading ①），而它只在出图**收尾**时才被撤：
// 画布那条链没回音、或者本体在出图途中被销毁（body 的 finish/retryOrTell 会因为 gone() 直接吞掉 done()，
// 见 M26）时，这一只就永远是 true——底下那份海报（连码）其实已经画好了，用户看到的却一直是加载中。
// 到点按「这一次没画出图」收口（onRenderTimeout）：撤遮罩、露出底下那一版排版，海报还在、还能长按存。
// 2026-09-28 由 8s 收到 2.5s：微信小程序端那条画布链实测**永远不会回音**（ctx.draw 的回调不触发、
// canvasToTempFilePath 报 fail canvas is empty，屏外/屏内、弹层内/外四种摆法都一样，见
// ui-baseline-mobile.md §4 对应行），8s 就等于「每次打开都先黑着遮罩数八秒」，用户读出来正是
// 「分享弹窗一直显示加载中」。2.5s = 素材最多等 1.2s（RENDER_RETRY）+ 一次画布尝试，
// 到点先把已经排好版的海报露出来；画布真回来了（H5 / 能出图的那一端）照旧由 setRendered 换上那张图。
const RENDER_TIMEOUT = 2500;

export default {
	name: 'tz-share-poster',
	props: {
		show: { type: Boolean, default: false },
		layout: { type: String, default: 'content' },
		poster: { type: Object, default: () => ({}) },
		shareBgs: { type: Array, default: () => [] },
		codeType: { type: String, default: '' },
		codeId: { type: [Number, String], default: '' },
		subject: { type: String, default: '分享海报' },
		showRecommend: { type: Boolean, default: false },
		// 推荐语那头的文案还在取：入口照出，但整格换成骨架块，点它说原因（见 onRecommend）
		recommendLoading: { type: Boolean, default: false },
		// 只摆一张海报、不套弹层（PC 限制提示页那一处用）：出图与取码这一条链照走
		inline: { type: Boolean, default: false },
	},
	data() {
		return {
			themeIndex: 0,
			// 海报本体是否挂载：只在弹层开着时挂（关闭后延迟卸载），避免弹层关着时封面/底图也去加载
			// —— 那些"晚到的 @load"写到已出栈页面上会连带废掉整条 setData 通道（见模板上的说明）
			posterBodyAlive: false,
			// 底图：加载失败的地址（从样式条里摘掉）与 load 到手的原始宽高（画布按它算居中裁切）
			bgErrors: {},
			bgSizes: {},
			// 右下角那张码：base64 地址（H5）或临时文件路径（小程序），没到手就是空串
			codeSrc: '',
			// 同一张码的备选地址（小程序端：写盘那条路成功时它就是接口原样的 base64）。
			// 两枚都由预览的 <image> 与画布那一条链共用：**一处加载不出来就换另一枚**——
			// 本地文件路径与 data 地址在「能不能被 image 组件 / 画布图片对象认」这件事上不是等价的
			// （2026-09-28 用户点名「后端已经生成好了、海报里却不显示」）
			codeAltSrc: '',
			codeFailed: false,
			// 这一次是「等超时」而不是接口明确回失败（网络慢 / 后端卡住）：面板那句说明按它换词（见 codeFailTip）
			codeTimeout: false,
			// 已经为哪个「落点 + 端」取过码了：换实体或换端要重取
			codeKey: '',
			// 取码超时那一只表（到点把这一次判成失败，见 onCodeTimeout）：关闭弹层/重开都会重排一次
			codeTimer: 0,
			// 第几次取码：超时与「关掉重开」都会推进它，晚到的旧响应据此丢弃，不许改这一轮的状态（见 loadCode）
			codeSeq: 0,
			// 可视高度，用来在短屏上把整张海报收一档（见 posterScale）
			viewportH: 0,
			// 已经渲染出来的那一张海报图地址（盖在排版之上，长按存的就是它）；空串时显示的是那一版排版
			renderedSrc: '',
			// 这一次重画还在路上（换样式档 / 换金句 / 码到手都会排一次）：为真时海报盖遮罩、留着上一张
			renderPending: false,
			// 连退档都没画出一张图（画布被污染、素材全取不到）：遮罩撤掉露出排版那一张，别永久卡在「加载中」
			renderFailed: false,
			// renderCache（「样式档 + 内容 + 素材」→ 已出好的图）不放这儿：它的 key 是含地址的长串，
			// 进 data 就会被 setData 当成嵌套路径解析而抛错（见 common/utils/mp-data-key），
			// 而它只在 JS 里读、模板一眼都不吃 —— 放 created 里的普通实例字段，既不推送也不必转键
			renderTimer: 0,
			renderSeq: 0,
			// 出图那一轮的硬上限表（到点强制撤「加载中」，见 onRenderTimeout）：一轮收尾就收掉它
			renderGuard: 0,
		};
	},
	computed: {
		/** 这一张海报此刻是不是「在场」：inline 档一挂出来就在场，弹层档要看 show */
		active() {
			return this.inline || this.show;
		},
		// #ifdef H5
		/** 微信内置浏览器：右上角有「···」（JSSDK 分享卡片也配在这一端），保存与分享两条路都按它分流 */
		inWechat() {
			return !!(this.$wxsdk && this.$wxsdk.isWechat());
		},
		/** 这一端是不是只能靠「图放大 → 长按」保存（判断收在 common/utils/poster-save，与活动海报同一份） */
		saveByLongPress() {
			return longPressOnly(this.inWechat);
		},
		// #endif
	styleOptions() {
		// bgErrors 进 data 的那一份键是 mpKey(地址)（不转就会被 setData 当成嵌套路径解析后抛错，
		// 见 common/utils/mp-data-key）；样式引擎那一层按「key = 地址原样」查，所以在这儿现算一份
		// 临时表换回原地址 —— 它不进 data，转键这一步只留在真正要推给视图层的那一张表上
		const failed = {};
		(this.shareBgs || []).forEach((u) => {
			if (u && this.bgErrors[mpKey(u)]) failed[u] = true;
		});
		return buildStyleOptions(this.shareBgs, failed);
	},
	/**
	 * 样式缩略图的样式串（按下标与 styleOptions 对齐）
	 *
	 * 小程序端 :style 里不能调函数（编译期直接报「:style 不支持 thumbStyle(t) 语法」，2026-09-27
	 * 首次跑 mp-weixin 编译暴露），wxml 的 style 属性也只吃字符串（对象会渲染成 [object Object]），
	 * 所以在这里预算成字符串数组；thumbStyle 方法保留给断言脚本与 H5 复用。
	 */
	thumbStyleTexts() {
		return this.styleOptions.map((t) => styleText(thumbCss(t)));
	},
		/** 底图清单是接口回来才变长的，选中下标要收在范围内（打开弹层时停在 0，不会跳到别的档） */
		activeIndex() {
			return clampIndex(this.themeIndex, this.styleOptions.length);
		},
		/**
		 * 短屏收档：海报可用高 = 视口高 − 底部面板 − 舞台上下留白。整张按可用高缩放，
		 * 画布那份恒为 300×400（存下来与分享出去的图不跟着分档）。
		 * 下限 0.72 是「再小金句就看不清」的档，收在这个档里宁可让面板占满也不缩图。
		 */
		posterScale() {
			if (!this.viewportH) return 1;
			const k = (this.viewportH - SHEET_H - STAGE_PAD) / 400;
			return k >= 1 ? 1 : Math.max(0.72, k);
		},
		/**
		 * 舞台高 = 「面板顶到页面顶」那一段，海报在这一段里垂直居中（2026-09-26 用户口径）；
		 * 视口比海报还高时就把整段都用上（居中），不够高时按海报本身收着给（不留一段假空）
		 */
		stageHeight() {
			const need = Math.round(400 * this.posterScale + STAGE_PAD);
			if (!this.viewportH) return need;
			const avail = this.viewportH - SHEET_H;
			return avail > need ? avail : need;
		},
		/**
		 * 什么时候要重新出一张图：换样式档、换金句、码到手 / 码让开、内容字段变了
		 * （底图/头像 load 到手这件事不进 key —— 那两张由 renderNow 等 assetsReady，见下面）
		 *
		 * `codeFailed` 也要进 key：码没到手（接口回失败、或到点被超时收口）时版式要切到「没有码」那一档
		 * （码格让开、中间那一段让到海报底，见 body 的 codePlanned）。不重出一张的话，盖在上面那张画布图
		 * 还留着码位，而点「保存」时现画的又是让开后的那一版 —— 预览与存下来的图就不是同一版（M18④ 的镜像）。
		 */
		renderKey() {
			const p = this.poster || {};
			return [this.layout, this.activeIndex, this.codeSrc, this.codeFailed, p.nickname, p.avatar, p.name, p.quote,
				p.quoteFrom, p.totalDays, p.cover, p.inviteText].join('|');
		},
		/** 码的叫法按端分：小程序端出的是微信「小程序码」，其余端是普通二维码（同一张海报不能两头都写错名字） */
		codeName() {
			// #ifdef MP-WEIXIN
			return '小程序码';
			// #endif
			return '二维码';
		},
		/** 海报上那行说明按中文习惯说全称，不把「识别」拆到名称后面 */
		codeCaption() {
			return '长按识别' + this.codeName;
		},
		/**
		 * 那张码是不是「已经发起、还没回来」：这一格要按码到手那一档排版，并在它上面盖区域遮罩
		 * （落点都没给的这一次不发请求，也就没有要等的东西 —— 海报上不空留一格，也不盖一块灰）
		 */
		codePending() {
			return !!(this.codeType && this.codeId && !this.codeSrc && !this.codeFailed);
		},
		/**
		 * inline 档（PC 限制提示页那种）那句「码没到手」的说明
		 *
		 * 弹层档不再走这里：拿不到码就直接弹错误提示并关掉弹层（见 failCode），
		 * 而 inline 档没有「重新打开」这一步，所以那句改说刷新页面。
		 */
		codeFailTip() {
			return this.codeName + (this.codeTimeout ? '获取超时' : '获取失败') + '，刷新页面可重试';
		},
		/** 取码要的平台参数：与 codeName 同一档判断，后端 share/getQrcode 按它分 mkMpCode / mkQrcode 两条路 */
		codePlatform() {
			// #ifdef MP-WEIXIN
			return 'miniprogram';
			// #endif
			return 'h5';
		},
	},
	watch: {
		// 每次在场都试着取一次码（小程序码要小程序已发布该页才出得来，前一次失败不代表这一次），
		// 并且立刻出一张图：长按保存要的是那一张真图片，不能等用户点「保存」才画（M18③ 的镜像在这一刻被用到）。
		// 判据取 active 不取 show：inline 档（PC 提示页那一处）没有开合，挂出来就该出图。
		// immediate 是给「页面挂出来时弹层就已经是开的」那一档：那种情况下值不会变化，
		// 只挂普通 watcher 就永远不取码也不出图（M13）
		active: {
			handler(v) {
				if (v) {
					// 先挂海报本体（v-if 在下一拍生效），再取码/出图；见模板上 v-if="posterBodyAlive" 的说明
					clearTimeout(this.bodyAliveTimer);
					this.posterBodyAlive = true;
					this.loadCode();
					this.scheduleRender();
				} else {
					// 收起：等面板滑下去的动画跑完再卸载本体，避免收起过程中海报先空一块
					clearTimeout(this.bodyAliveTimer);
					this.bodyAliveTimer = setTimeout(() => {
						this.posterBodyAlive = false;
					}, 400);
				}
			},
			immediate: true,
		},
		// 换样式档 / 换金句 / 码到手 / 内容变了：重出一张。**不清空 renderedSrc**——新图没回来之前留着上一张
		// 整张不动，而不是退回底下那一版 DOM 排版：两套渲染器交替出现，用户读出来就是「头像、昵称上下跳」
		// （2026-09-27 用户点名，M18③ 的镜像除数值之外还差字体度量那一档，本地量不准，只能不让两帧同屏交替）
		renderKey() {
			this.scheduleRender();
		},
	},
	created() {
		// 只取一次：转屏不在这一档弹层里发生（弹层是竖屏看图），拿不到就按不缩放处理
		try {
			this.viewportH = uni.getSystemInfoSync().windowHeight || 0;
		} catch (e) {
			this.viewportH = 0;
		}
	},
	beforeDestroy() {
		clearTimeout(this.renderTimer);
		clearTimeout(this.bodyAliveTimer);
		// 取码那一只超时表也要收（M26③）：它到点会写 codeFailed，晚到的写入正是「整条 setData 通道被废」的入口
		clearTimeout(this.codeTimer);
		// 出图那一只硬上限表同理：到点会写 renderPending/renderFailed
		clearTimeout(this.renderGuard);
	},
	methods: {
		/**
		 * 出图结果缓存表（同一次会话内「样式档 + 内容 + 素材」只画一次）。
		 * 懒初始化：`active` 那只 watcher 带 immediate，它在 initState 就跑（早于 created），
		 * 这一拍就要读这张表。
		 * @return {Object} key = renderKey，value = 已出好的图地址
		 */
		cache() {
			if (!this.renderCache) this.renderCache = {};
			return this.renderCache;
		},
		thumbStyle(t) {
			return thumbCss(t);
		},
		/**
		 * 关弹层（2026-09-27 用户口径：**码/素材还在加载中也可以关**）
		 *
		 * 三条关闭路径都只走这一句、都不读取码与出图那几枚状态：面板右上角那枚关闭钮、海报上方那段
		 * 空白（.sh-stage 自己接，见 M18⑨b）、以及 u-popup 的遮罩（closeOnClickOverlay）。
		 * 加载态是海报本体里的一层黑遮罩（不铺到面板与空白段上），所以「还在取」这件事不占任何关闭手势。
		 * 关掉之后那一次请求不用中止（$api 没有中止这一档）：晚到的响应按 codeSeq 丢弃，
		 * 重开一次会带着新的 seq 再取（见 loadCode），不会把上一次的状态写到这一轮上。
		 */
		close() {
			this.$emit('close');
		},
		/**
		 * 点「推荐语」入口：文案还在取的时候这一枚是禁用态（整格被骨架块盖住），点它要给一句为什么
		 * （M13：禁用只换颜色，小程序上原生 view 的点击照样打进来），与推荐语弹窗里「换一条」同一句话
		 */
		onRecommend() {
			if (this.recommendLoading) {
				uni.showToast({ title: '推荐语正在获取，请稍候', icon: 'none' });
				return;
			}
			this.$emit('recommend');
		},
		/**
		 * 本组件/所在页面是否已销毁（正在销毁）：异步回调写响应式数据之前必须先问这一句。
		 * 详情与后果见 tz-share-poster-body 的 gone()：返回上一页时这一层还在等底图/码的异步结果，
		 * 结果回来那一刻页面已经没了，这一次推送落进死页面（main.js 的出口闸门替整站拦掉它）。
		 * 但报错里那句 `Cannot read properties of null (reading '<站点二级域>')` 不是这一族，
		 * 它是「地址当 data 键」被 setData 当路径解析，见 common/utils/mp-data-key。
		 */
		gone() {
			return this._isDestroyed === true || this._isBeingDestroyed === true;
		},
		// 底图取不到：记下这一张，样式条里摘掉它、海报退回渐变档（画布那一份跟着走同一判据）。
		// 键过 mpKey：这里是「地址作 data 键」，不转就等着 setData 把它当路径解析后抛错（见该工具注释）
		onBgError(url) {
			if (this.gone()) return;
			if (url) this.$set(this.bgErrors, mpKey(url), true);
		},
		// 底图 load 到手：记下原始宽高，画布按它算居中裁切（与 mode="aspectFill" 同一个结果）
		onBgLoad(e) {
			if (this.gone()) return;
			if (!e || !e.url || !e.width || !e.height) return;
			this.$set(this.bgSizes, mpKey(e.url), { w: e.width, h: e.height });
		},
		/**
		 * 打开弹层时取右下角那张码（H5 = 二维码、小程序 = 小程序码，见 codePlatform）
		 *
		 * 落点是 codeType + codeId 指的那一页，与所在页面底栏「分享」、复制链接同一个去处。
		 * 取到之前海报上不摆码（不留一个没人认领的方块），取失败在面板里说一句为什么（M13）。
		 * 这一条链**必须有超时**（CODE_TIMEOUT，5~10s 那一档）：接口一直不回来时 request 层不会自己回，
		 * 没有超时的话 codePending 永远为真 ⇒ 海报上「在取」那层遮罩与码格永远不撤，
		 * 用户看到的就是「分享弹窗一直停在加载中」（2026-09-27 用户实机点名）。
		 */
		loadCode() {
			const id = this.codeId;
			const type = this.codeType;
			// 调用点没给落点（打卡活动 ID 为 0、page 档拿不到路由）：这一次不发请求，海报不出码
			// （面板里也不报失败——没什么可失败的）
			if (!type || !id) return;
			const key = type + '|' + id + '|' + this.codePlatform;
			if (this.codeSrc && this.codeKey === key) return;
			this.codeKey = key;
			this.codeFailed = false;
			this.codeTimeout = false;
			this.codeSrc = '';
			this.codeAltSrc = '';
			// 每一次取码开一个新号：超时与「关掉重开」都会推进它，晚到的旧响应据此丢弃（见 onCodeTimeout）
			const seq = ++this.codeSeq;
			// 超时兜底：这一只表一直管到「码真写上」为止（小程序中间还有一段异步写盘，见 setCode 的 apply），
			// 到点由 onCodeTimeout 收口——接口一直不回来时弹层才不会永远停在「加载中」
			clearTimeout(this.codeTimer);
			this.codeTimer = setTimeout(() => this.onCodeTimeout(seq), CODE_TIMEOUT);
			this.$api('share.getQrcode', { type: type, id: id, platform: this.codePlatform }).then((ret) => {
				if (this.gone() || seq !== this.codeSeq) return;
				if (!ret || ret.code !== 1 || !ret.data) {
					clearTimeout(this.codeTimer);
					this.failCode((ret && ret.msg) || this.codeName + '获取失败，请刷新重试');
					return;
				}
				// 晚到的响应也算数：超时那一刻已经先判过失败，码真回来照样收下——
				// 「收下」这件事（连同把那句「获取超时 / 获取失败」收掉）都在 setCode 的 apply 里一处做，
				// 这里不再提前翻 codeFailed：写盘那一段还没落定，提前翻会让版式先跳一次
				this.setCode(ret.data, seq);
			}).catch(() => {
				if (this.gone() || seq !== this.codeSeq) return;
				clearTimeout(this.codeTimer);
				this.failCode(this.codeName + '获取失败，请检查网络后重试');
			});
		},
		/**
		 * 这一次拿不到码（接口回失败 / 网络异常 / 到点超时）的同一个出口
		 *
		 * 2026-09-28 用户口径：「如果生成二维码失败，可以直接弹出错误提示，并且取消生成海报（关闭生成弹窗）」——
		 * 右下角没有那张码的海报就只是一张没人认领的图，存出去也扫不进任何页面；
		 * 原先留一张缺码的海报 + 面板一行灰字，用户读出来就是「海报坏了」。
		 * inline 档（PC 限制提示页那种）没有弹层可关，那一张就是这一页的内容本身，
		 * 仍按「没有码」收口并在下面说一句为什么（M13：失败要有可读出口）。
		 * @param {String} msg 弹给用户的那句原因（接口回了 msg 就用后端那句，与全站同一口径）
		 */
		failCode(msg) {
			this.codeFailed = true;
			if (this.inline) return;
			uni.showToast({ title: msg, icon: 'none', duration: 2000 });
			this.close();
		},
		/**
		 * 取码超时到点（CODE_TIMEOUT 那一档）：接口一直不回来也不能把弹层永远停在「加载中」
		 *
		 * 与接口回失败同一个出口（failCode：弹一句「获取超时」并关掉弹层），只是成因那句要分开说。
		 * 判据两条：① 只认当前这一次——用户关掉重开过（codeSeq 变了）时旧的那一次不许再写状态；
		 * ② 响应其实已经回来、正落在写盘那一小段里（codeSrc 还没写上）时不抢着判失败，交给 setCode 收尾。
		 * 弹层已经在销毁（gone）时同样不写：这一刻 setData 打到已出栈页面上会废掉整条通道（M26）。
		 */
		onCodeTimeout(seq) {
			if (this.gone() || seq !== this.codeSeq) return;
			if (this.codeSrc) return;
			clearTimeout(this.codeTimer);
			this.codeTimeout = true;
			this.failCode(this.codeName + '获取超时，请刷新重试');
		},
		/**
		 * 接口回的 base64 图落成这一端能用的地址
		 *
		 * 小程序端先把接口回的 base64 落成用户目录下的一张临时图，**并且把原样的 base64 一起留着当备选**：
		 * 「地址到手」不等于「这一端认它」——同一个地址在 `<image>` 与 `canvas.createImage` 两处的可加载性
		 * 并不等价（画布只认 createImage 造出来并 onload 过的对象），只留一枚就会出现「后端已经生成好码、
		 * 海报里却不显示」（2026-09-28 用户点名，见 onCodeImgError）。
		 * 写盘失败退回 base64（至少预览有图），H5 直接用 data 地址（同源、不污染画布）。
		 * @param {String}   src 接口回的地址
		 * @param {Number}   seq 这是第几次取码（见 loadCode）：写盘回调回来时用户可能已经重开过一次，
		 *                       那一次的状态不许写到这一轮上；顺手把超时表与「失败/超时」那两枚一起收掉
		 */
		setCode(src, seq) {
			// 落地址只走这一处：四件事一次做完（判 stale、收超时表、收掉失败说明、备选地址一起登记），
			// 两条端路不再各写一遍
			const apply = (val, alt) => {
				if (this.gone() || seq !== this.codeSeq) return;
				clearTimeout(this.codeTimer);
				this.codeFailed = false;
				this.codeTimeout = false;
				this.codeSrc = val;
				this.codeAltSrc = alt && alt !== val ? alt : '';
			};
			// #ifdef MP-WEIXIN
			const filePath = wx.env.USER_DATA_PATH + '/share-poster-code.png';
			try {
				wx.getFileSystemManager().writeFile({
					filePath: filePath,
					data: String(src).replace(/^data:image\/\w+;base64,/, ''),
					encoding: 'base64',
					// 写盘也是异步的：回调回来时弹层/页面可能已经关掉了，同样要先问 gone()
					// 备选那一枚（接口原样的 base64）一起留着：这条本地路径在部分基础库/机型上
					// 既喂不进 <image> 也造不出画布图片对象，两枚互为备胎（见 onCodeImgError）
					success: () => apply(filePath, src),
					fail: () => apply(src, ''),
				});
				return;
			} catch (e) {
				// 老基础库没有 USER_DATA_PATH / 写盘能力：退回 base64，不因为一张码把海报卡住
			}
			// #endif
			apply(src, '');
		},
		/**
		 * 预览里那张码没加载出来（<image> 的 @error）：换成备选地址再试一次
		 *
		 * 2026-09-28 用户点名的那一条：后端明明已经把码生成好了，海报里却不显示。成因是「地址到手 ≠ 这一端认它」——
		 * 小程序端主地址是写盘下来的一个本地文件路径，H5 端是 data 地址，而这两枚在
		 * `<image>` 与画布图片对象（canvas.createImage）两处的可加载性并不等价。
		 * 主地址这一枚万一两处都认不了，就整张海报缺一块，所以两枚都留着、失败就换另一枚。
		 *
		 * 只换一次（换完把备选清空）：两枚互为备胎而不是互相踢——新的那一枚再失败就到此为止，
		 * 由出图那条链（body 判「码该画而没到手」）与 inline 档那句说明收口，不做无限重试。
		 */
		onCodeImgError() {
			if (this.gone() || !this.codeAltSrc) return;
			const alt = this.codeAltSrc;
			this.codeAltSrc = '';
			this.codeSrc = alt;
		},
		/**
		 * 出图：画布那一版在 tz-share-poster-body 里（预览与画布同一份排版），这一层只管把结果交出去
		 * @param {Function} done 收到图片地址（H5 为 base64、小程序为临时文件路径），拿不到回 ''
		 */
		drawPoster(done) {
			const body = this.$refs.body;
			if (!body || !body.drawPoster) {
				// 兜底自愈：本体是按需挂载的（见模板 v-if="posterBodyAlive"），
				// 这一刻没挂上就立刻挂出来、下一拍再画，绝不允许「弹层开了却出不了图」
				if (!this.posterBodyAlive) this.posterBodyAlive = true;
				this.$nextTick(() => {
					const b = this.$refs.body;
					if (b && b.drawPoster) b.drawPoster(done);
					else done('');
				});
				return;
			}
			body.drawPoster(done);
		},
		/**
		 * 排一次「把海报渲染成图片」：合并同一拍里的多次变化（换档 + 码到手常常同一轮回来），
		 * 也要给预览那几张图一点 load 时间（画布只画 load 成功过的那张，见 body 的 assetsReady）。
		 * 看过的这一档直接从缓存换上——不重画，也不闪一下遮罩；只有真要重画的那一次才置 renderPending，
		 * 同时排上 RENDER_TIMEOUT 那只硬上限表（见 onRenderTimeout：出图这条链没回音时也要有出口）
		 */
		scheduleRender() {
			clearTimeout(this.renderTimer);
			clearTimeout(this.renderGuard);
			const cached = this.cache()[this.renderKey];
			if (cached) {
				this.renderPending = false;
				this.renderedSrc = cached;
				return;
			}
			this.renderPending = true;
			this.renderFailed = false;
			this.renderGuard = setTimeout(() => this.onRenderTimeout(), RENDER_TIMEOUT);
			this.renderTimer = setTimeout(() => this.renderNow(0), RENDER_GAP);
		},
		/**
		 * 出图超时到点（RENDER_TIMEOUT）：这一条链任何一环没回音都要有确定的出口
		 *
		 * 与 renderNow 的失败分支同一个落点（renderFailed + 清掉可能已过期的那张图 ⇒ body 的遮罩撤掉、
		 * 露出底下那一版排版，海报还在、还能长按保存）。**只认「这一刻还在等」的那一轮**：
		 * 已经出好图（renderPending 为 false）时这是兜底表的迟到回调，什么都不动。
		 */
		onRenderTimeout() {
			if (this.gone()) return;
			clearTimeout(this.renderGuard);
			if (!this.renderPending) return;
			// 留一条开发侧痕迹：这一档是「出图这条链没回音」的兜底，界面上与「出图成功」不同、
			// 与「出图失败」一样（都是撤遮罩露排版），设备上分不出是哪一档。真机再报「一直加载中」时，
			// 先看 Console 有没有这一行：有 = 出图链卡住（画布回调 / 素材 / 本体卸载）；没有 = 另找一处
			console.warn('[tz-share-poster] 出图超时(' + RENDER_TIMEOUT + 'ms)，按「这一次没画出图」收口');
			this.renderPending = false;
			// 与出图失败同一口径：不清掉的话，换档之后超时会把上一档样式的旧图一直挂在选中的这一档上
			this.renderedSrc = '';
			this.renderFailed = true;
		},
		/**
		 * 渲染那一张海报图（弹层一显示就跑，用户长按存的就是这一张）
		 *
		 * 只用画布自己出的地址（H5 是 data:、小程序是本地临时文件），**不发上传请求**
		 * （2026-09-26 用户点名：弹层一开就打 api/common/upload，既多一次服务器写入、又会抛错）。
		 * 点「保存」那一条路同样不上传（2026-09-27 用户第二次点名，见 common/utils/poster-save 文件头）：
		 * H5 一律把这一张原地址放大，靠长按的端补一句提示，普通浏览器再多下一次 a[download]。
		 * @param {Number} attempt 内部重试用：素材还没 load 到手时按 RENDER_RETRY 上限等几拍
		 */
		renderNow(attempt) {
			if (!this.active) {
				clearTimeout(this.renderGuard);
				this.renderPending = false;
				return;
			}
			const body = this.$refs.body;
			// 刚打开那一拍：本体才刚被 v-if 挂上（下一拍才进 $refs），等一拍再画，
			// 不要当成「素材还没到手」直接走失败分支；本体还没挂就先挂上（按需挂载的兜底）
			if (!body) {
				if (!this.posterBodyAlive) this.posterBodyAlive = true;
				if (attempt === 0) {
					this.renderTimer = setTimeout(() => this.renderNow(attempt + 1), RENDER_GAP);
					return;
				}
			}
			if (body && !body.assetsReady && attempt < RENDER_RETRY) {
				this.renderTimer = setTimeout(() => this.renderNow(attempt + 1), RENDER_GAP);
				return;
			}
			const key = this.renderKey;
			if (this.cache()[key]) {
				clearTimeout(this.renderGuard);
				this.renderPending = false;
				this.renderedSrc = this.cache()[key];
				return;
			}
			// 每一次出图换一个 seq：换档连点时只认最后一次的结果，别让旧的那一张盖回来
			const seq = ++this.renderSeq;
			this.drawPoster((src) => {
				// 更新的那一次还在路上，遮罩由它自己撤
				if (seq !== this.renderSeq) return;
				clearTimeout(this.renderGuard);
				this.renderPending = false;
				// 只有出图失败才退回底下那一版排版（至少海报还在、也还能长按）；
				// 成功就整张一次换过来，中途不露排版那一帧 ⇒ 头像与昵称没有两帧可交替，跳不起来
				if (!src) {
					this.renderedSrc = '';
					// 连退档都画不出图：让开遮罩露出底下那一版排版（海报还在、还能长按），
					// 不撤就是「整张永久停在加载中」——素材里有一张取不到时正是这个症状
					this.renderFailed = true;
					return;
				}
				this.setRendered(key, src);
			});
		},
		/** 出好的图进缓存并显示（同一份「样式 + 内容」只画一次）；顺手报给调用方，inline 档要拿它做放大预览 */
		setRendered(key, src) {
			clearTimeout(this.renderGuard);
			this.renderPending = false;
			// 收口成功：超时那只兜底表若已经先开过枪（renderFailed 被置起），这一刻要把话说回来
			this.renderFailed = false;
			// 存与发的都是「浏览器能长按保存的那一份」（H5 画布出的是 data:，长按它微信内 / iOS Safari
			// 不弹「保存图片」——用户 2026-09-28 点名的就是弹层里这张图；同像素换成 blob 地址，零请求。
			// 小程序端原样（画布给的是 wxfile:// 本地路径，toSavableSrc 直接放行）
			const savable = toSavableSrc(src);
			this.cache()[key] = savable;
			this.renderedSrc = savable;
			this.$emit('rendered', savable);
		},
		/**
		 * 「分享」按端分路（2026-09-25 用户定口径：小程序触发分享 API，H5 提示右上角分享）
		 *
		 * - 微信小程序：调起官方图片分享面板，分享出去的就是这张海报本体（基础库 < 2.14.0 没有这个面板，
		 *   回退右上角提示；uni-app 2.x 没把 showShareImageMenu 收进 uni 对象，只能直接使 wx.*）。
		 * - H5 微信内：网页侧没有可编程调起的分享入口（JSSDK 只配得了右上角那张卡片的标题封面），
		 *   这一刻只能引导用户去点右上角「···」。
		 * - 其余端（H5 普通浏览器、App）：没有右上角可指，交回调用方复制链接/文案（见调用点的 @share）。
		 */
		share() {
			let handled = false;
			// #ifdef MP-WEIXIN
			handled = true;
			if (!wx.canIUse('showShareImageMenu')) {
				this.hintTopRight();
				return;
			}
			this.drawPoster((src) => this.sharePoster(src));
			// #endif
			// #ifdef H5
			if (this.inWechat) {
				handled = true;
				this.hintTopRight();
			}
			// #endif
			if (!handled) this.$emit('share');
		},
		// #ifdef MP-WEIXIN
		/**
		 * 微信图片分享面板（点「分享」的第二步）：面板被取消不补提示，其余失败要有出口（M13）
		 * @param {String} src canvasToTempFilePath 出的图片临时路径
		 */
		sharePoster(src) {
			if (!src) {
				uni.showToast({ title: this.subject + '生成失败，请重试', icon: 'none' });
				return;
			}
			wx.showShareImageMenu({
				path: src,
				fail: (e) => {
					if (e && /cancel/i.test(e.errMsg || '')) return;
					this.hintTopRight();
				},
			});
		},
		// #endif
		/** 分享面板调不起来时剩下的那一条路：小程序胶囊按钮与微信内浏览器右上角都有「发送给朋友」 */
		hintTopRight() {
			uni.showToast({ title: '点击右上角「···」选择「发送给朋友」', icon: 'none' });
		},
		/** 保存 = 出图后交给系统或浏览器落地（端路见 exportPoster） */
		save() {
			this.drawPoster((src) => this.exportPoster(src));
		},
		/**
		 * 把画出来的海报交给系统保存（点「保存」的第二步）
		 *
		 * H5 端没有 uni.saveImageToPhotosAlbum（uni-h5 把它列在 todo-api.js，调用只剩一句 console.error，
		 * 既不回 success 也不回 fail ⇒ 症状就是「点了保存没反应」）。这一端先把图放大预览——长按是这一端
		 * 每个内核都给的保存入口（2026-09-26 用户口径），并在同一刻弹一句提示；能下载的内核（非微信、非 iOS）
		 * 在放大之外再多下一次。小程序/App 走相册接口，任何一条路都要有 success/fail 出口（M13）。
		 * @param {String} src canvasToTempFilePath 出的图片地址（H5 为 base64，出图那一步已换过一份，
		 *                         这里再过一次：换过的地址原样放行，直调 exportPoster 的调用方也拿得到长按可存的那一份）
		 */
		exportPoster(src) {
			if (!src) {
				uni.showToast({ title: this.subject + '生成失败，请重试', icon: 'none' });
				return;
			}
			// #ifdef H5
			this.previewPosterH5(toSavableSrc(src));
			// #endif
			// #ifndef H5
			uni.saveImageToPhotosAlbum({
				filePath: src,
				success: () => uni.showToast({ title: this.subject + '已保存', icon: 'none' }),
				fail: () => uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' }),
			});
			// #endif
		},
		// #ifdef H5
		/**
		 * H5 端「保存」= 把图放大 + 给一句怎么存（2026-09-26 用户口径：常驻说明删掉，改在点保存这一刻弹）
		 *
		 * 端判断与那一句提示都收在 common/utils/poster-save（与证书弹层同一份），这一处只补普通浏览器
		 * 多出来的一条路：能直接下载的内核在放大之外再下一次 a[download]。
		 * **不发上传**（2026-09-27 用户点名）：画布这张图点一次保存就往服务器写一张，没有收益。
		 * @param {String} src canvasToTempFilePath 出的地址（H5 为 base64，已过 toSavableSrc）
		 */
		previewPosterH5(src) {
			previewSavablePoster(src, {
				inWechat: this.inWechat,
				onDirect: (url) => this.downloadPoster(url),
			});
		},
		/**
		 * 浏览器下载海报：地址交给 a[download]
		 *
		 * base64（data:）地址在 iOS Safari 上会被直接忽略，换地址那一份已经收在 poster-save.toSavableSrc
		 * （预览、下载、弹层里那张长按存的三条路共用同一份，不再各换一次）。
		 */
		downloadPoster(src) {
			const href = toSavableSrc(src);
			const link = document.createElement('a');
			link.href = href;
			link.download = this.subject + '.png';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			uni.showToast({ title: this.subject + '已保存', icon: 'none' });
		},
		// #endif
	},
};
</script>

<style scoped>
.sh {
	width: 100%;
}
/* 海报那一档：占「面板顶到页面顶」那一段，海报在其中垂直居中（2026-09-26 用户口径）；
   高度由 stageHeight 给（视口不够高时退化成海报本身那一档，不留一段假空） */
.sh-stage {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 14px 0 10px;
}
/* inline 档：页面里直接摆这一张，段高交给海报本身（不按视口居中，也没有可点的遮罩） */
.sh-stage--inline {
	height: auto;
	padding: 0;
}
/* 海报宿主节点：flex item 不能被压扁（海报本体是 300×400 定死的一张），点它不等于点遮罩 */
.sh-poster {
	flex-shrink: 0;
}
/* 底部面板：白底 + 顶部圆角 12（弹层档），左右内衬 16；
   底部安全区只挂这一份（微信端减半，与 .school-popup、tz-tab-bar 同一口径），
   那一格内衬交给内容最后一块自己给（.sh-btns 的 padding-bottom）——
   不再写「20px + 安全区」：iPhone X 下那样叠成 20 + 34 = 54px，比同屏礼物/商品弹层
   （内容自己 10px + 安全区 34px = 44px）明显多一截，2026-10-01 用户点名
   「邀请达人榜、分享有礼模块相关的弹窗底部安全距离都太大了」——达人榜的「立即分享」
   与分享有礼的分享链路落的就是这一只弹层 */
.sh-sheet {
	position: relative;
	background: #fff;
	border-radius: 12px 12px 0 0;
	padding: 40px 16px;
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	/* 微信端底部安全区减半（iPhone X 全量 34 → 约 17），与 .school-popup、tz-tab-bar 同一口径 */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}
/* 关闭：面板右上角，图标与色取全站 u-popup closeable 那一档（18 号 #909399），热区靠 padding 撑到 32px */
.sh-close {
	position: absolute;
	right: 12px;
	top: 10px;
	padding: 7px;
	line-height: 0;
}
/* 样式条一行：左边整排可左右滑，右边固定一枚「推荐语」入口（2026-09-26 用户口径）。
   这一排里两块的垂直居中靠「行自己吃下方留边」：那 8px 从 scroll-view 挪到这里，
   行内两个盒子才是各自的内容高（54 与 56），align-items:center 才落在同一根中线上
   ——挂在 scroll-view 自己身上时它比色板高 8px，入口就会被顶低 4px（用户点名的「与左侧样式选项垂直居中对齐」） */
.sh-themes-row {
	display: flex;
	align-items: center;
	padding-bottom: 8px;
}
.sh-themes {
	flex: 1;
	min-width: 0;
	white-space: nowrap;
	/* 色板是 inline-block：留着默认行高会在它下面多撑出一条文字行盒的空，这一块的高就不再是 54 */
	line-height: 0;
}
/*  #ifdef  H5  */
/* uni 这一版 scroll-view 运行时不认 show-scrollbar（口径同打卡日记页的 .cdy-tags），
   宽窗口 / 安卓 WebView 下会在样式条下面露出一条横向滚动条，压在白色面板下沿很脏 */
.sh-themes ::-webkit-scrollbar {
	display: none;
}
/*  #endif  */
/* 样式缩略图与海报同一比例（300×400 = 3:4），只做「选哪一张底」的示意，不必占高 */
.sh-theme {
	display: inline-block;
	vertical-align: top;
	width: 40px;
	height: 54px;
	border-radius: 4px;
	margin-right: 8px;
	background-repeat: no-repeat;
}
.sh-theme-active {
	border: 2px solid #0968f6;
}
/* 推荐语入口：图标 20 墨迹（uview edit-pen 实测 0.849 ⇒ :size 24）+ 11px 文字，落在样式条右侧固定不跟着滑。
   2026-09-26 用户点名要「有边框阴影」，随后三轮调这一档：圆角 4→5→15、投影 0 2px 8px/.08 → 0 1px 4px/.05
   → 0 2px 8px/.04（阴影范围放到当前一倍、颜色再浅一档）。它是这一排里唯一一枚动作，不描边会被读成色板的一部分；
   投影是 M21「卡片不给投影」之外由用户点名的例外，已登记进 ui-audit 基线 */
.sh-recommend {
	flex-shrink: 0;
	width: 56px;
	height: 56px;
	margin-left: 8px;
	box-sizing: border-box;
	background: #fff;
	border: 1px solid #e5e6eb;
	border-radius: 15px;
	box-shadow: 0 2px 8px rgba(29, 33, 41, 0.04);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.sh-recommend-text {
	font-size: 11px;
	line-height: 14px;
	color: #1d2129;
	margin-top: 2px;
}
/* 面板最后一块：底部 12px 内衬由它自己带（面板只挂安全区那一份） */
.sh-btns {
	display: flex;
	justify-content: space-between;
	margin-top: 4px;
	padding-bottom: 12px;
}
/* 按钮本体走登记组件 tz-button（size=normal、圆角 4px 都在组件里），宿主只给占比与间距（M17）；
   必须带 long——组件根节点是 width: fit-content，小程序端宿主撑开了而里面那层不撑，
   底色会缩成文字那么宽（H5 宿主与根节点是同一个元素，看不出这个差） */
.sh-btn {
	flex: 1;
	margin: 0 6px;
}
/* 面板里那句灰字说明（只剩「码没到手」这一条；长按提示改在点保存放大图片那一刻弹）：
   12px 辅助灰、居中、无句号，与活动海报同一档 */
.sh-tip {
	width: 100%;
	text-align: center;
	font-size: 12px;
	color: #86909c;
	margin-top: 10px;
}
</style>
