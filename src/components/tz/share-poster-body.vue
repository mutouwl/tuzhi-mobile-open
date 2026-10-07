<template>
	<!--
	  分享海报本体：预览那一版排版 + 屏幕外那张画布，两份都在这一个文件里（M18③）。
	  为什么合在一处：日签图与全局分享弹层共用这只组件，而「预览看到的」与「存下来/分享出去的」
	  必须是同一张图——画布那一份的数值就是下面样式块那版排版的镜像，分两个文件写就会分叉
	  （打卡日签图历史上就分叉过一次：预览两行、存下来的图三行）。
	  两档版式按 layout 选：
	    daily   = 打卡日签图（日期角标 + 金句 + 累计打卡 + 用户区）
	    content = 课程/商品/圈子/打卡活动等内容分享（邀请头 + 内容封面卡 + 码），2026-09-26 参照竞品补的一档
	-->
	<view class="sp">
		<view class="sp-poster" :style="posterStyleText">
		<!-- 底图：后台配的那一份（aspectFill 就是居中裁切，@load 把原始宽高带回去给画布算同一刀） -->
		<image class="sp-bg" v-if="activeImage" :src="activeImage" mode="aspectFill"
			@load="onBgLoad(activeImage, $event)" @error="onBgError(activeImage)" />
		<view class="sp-layer">
			<!-- ============ daily：打卡日签图 ============
			     这一档每一块都按下面 computed 的 daily 那份数值绝对定位（预览 :style 与画布读同一个对象，M18③）：
			     原先金句与出处由 .sp-layer 的内衬 + margin 排、画布那一份自己另写了 24 / 22 一套数，
			     左右内衬两边不等（预览 18、画布 24），用户读出来就是「右侧的间距比左侧小」 -->
			<template v-if="layout === 'daily'">
				<view class="sp-datebox" :style="dailyText.badge">
					<text class="sp-time">{{ nowTime }}</text>
					<text class="sp-date">{{ nowMD }}</text>
					<text class="sp-week">{{ nowW }}</text>
				</view>
				<!-- 引号落在金句首字的左上角：原先它与首字同一个左内衬，看着就是正压在文字头上、
				     文字反而比引号更靠左（2026-09-26 用户点名「引号应该在文字的左上角」） -->
				<text class="sp-quote-mark" :style="dailyText.mark">“</text>
				<!-- 金句逐行排（行数是 wrapText 按同一份可用宽算出来的），不再交给 -webkit-line-clamp：
				     clamp 折了几行只有浏览器知道，画布那一份对不上，正是「预览两行、存下来三行」那类分叉 -->
				<view class="sp-quote" :style="dailyText.quote">
					<text class="sp-quote-line" v-for="(line, i) in daily.lines" :key="i">{{ line }}</text>
				</view>
				<!-- 出处没有就不摆这一行（只剩一个「——」挂在海报上是没人认领的空块，M16 同一条理由） -->
				<view class="sp-quote-from" v-if="quoteFrom" :style="dailyText.from">—— {{ quoteFrom }}</view>
				<!-- 换一条 / 复制金句这两枚不在这里：它们要压在「已经渲染出来的那张海报图」之上才点得到，
				     见下面 .sp-acts（同一枚类、同一个位置，只是挂在海报根节点这一层） -->
				<view class="sp-count" :style="dailyText.count">
					<text class="sp-count-label">累计打卡</text>
					<text class="sp-count-num">{{ totalDays }}</text>
					<text class="sp-count-unit">天</text>
				</view>
				<!-- 用户区（白底直角）：头像 + 昵称一行，下面一行是这条打卡的名称，右下角是进这一页的码。
				     三行的行高/行间距是画布那一份的镜像来源，改这里要一起改 drawPoster -->
				<view class="sp-foot" :style="dailyText.foot">
					<view class="sp-user" :style="{ width: daily.userW + 'px' }">
						<view class="sp-id">
							<image class="sp-avatar" :src="avatarSrc" mode="aspectFill" @load="onAvatarLoad" @error="onAvatarError" />
							<text class="sp-nickname">{{ nickname }}</text>
						</view>
						<text class="sp-activity">{{ name }}</text>
						<text class="sp-code-tip" v-if="codeSrc">{{ codeCaption }}</text>
					</view>
					<image class="sp-code" v-if="codeSrc" :src="codeSrc" mode="aspectFit" @error="onCodeError" />
				</view>
			</template>
			<!-- ============ content：内容（课程/商品/圈子/打卡…）分享海报 ============ -->
			<template v-else>
				<!-- 邀请头：谁在分享（头像 + 昵称 + 一句邀请语），与日签图共用 avatar 那一份兜底 -->
				<view class="sp-head" :style="{ top: contentColumn.headTop + 'px' }">
					<image class="sp-head-avatar" :src="avatarSrc" mode="aspectFill" @load="onAvatarLoad" @error="onAvatarError" />
					<view class="sp-head-text">
						<text class="sp-head-name">{{ nickname }}</text>
						<text class="sp-head-invite">{{ inviteText }}</text>
					</view>
				</view>
				<!-- 内容卡（圆角 + 半透明白）：封面在上、标题在下（2026-09-26 用户点名「图片与标题上下排列、
				     卡片要圆角、白底加一点磨砂透明」）。底色用 rgba(255,255,255,.86) 而不是 backdrop-filter——
				     后者在小程序不认（§4），靠透明度透出底下那一档渐变，就是这一张海报给得起的「磨砂」。
				     卡高由 contentColumn 现算：四边都是 GAP，标题只占一行（超出一档由 nameLines 截掉补省略号，
				     2026-09-27 用户口径），卡里因此不会剩下那一行下面白摊着的 19px（上一版预留两行的空，
				     正是用户点名的「内容区域上下间距不一致」）；封面取不到就退回没有封面的那一档 -->
				<view class="sp-card" v-if="hasCard" :style="{ top: contentColumn.cardTop + 'px', height: contentColumn.cardH + 'px' }">
					<image class="sp-cover" v-if="coverSrc" :src="coverSrc" mode="aspectFill" @load="onCoverLoad" @error="onCoverError" />
					<view class="sp-name" v-if="nameLines.length" :class="coverSrc ? 'sp-name--under' : ''">
						<text class="sp-name-line" v-for="(line, i) in nameLines" :key="i">{{ line }}</text>
					</view>
				</view>
				<!-- 码：与日签图同一张接口、同一档判据（没到手就不出这一格，也不写那句说明） -->
				<view class="sp-codebox" v-if="codeSrc" :style="{ top: contentColumn.qrTop + 'px' }">
					<image class="sp-qr" :src="codeSrc" mode="aspectFit" @error="onCodeError" />
				</view>
				<text class="sp-qr-tip" v-if="codeSrc" :style="{ top: contentColumn.tipTop + 'px' }">{{ codeCaption }}</text>
			</template>
		</view>
		<!-- 已经渲染出来的那一张海报图：弹层一显示就把画布出好的图盖在这里，长按这一张才存得下图
		     （底下那一版 DOM 是排版，长按它没有「保存图片」；画布没出来之前显示的就是那一版排版） -->
		<image class="sp-rendered" v-if="renderedSrc" :src="renderedSrc" mode="scaleToFill" show-menu-by-longpress />
		<!-- 换一条 / 复制金句挂在最上层：两枚同一行、同一档尺寸（一个容器 + 共用一枚 chip 类），
		     动作交回调用方（金句库在调用方手里）。
		     2026-09-26 用户口径：有金句就成对出这两枚，**库里只有一句时「换一条」也照样摆**——
		     点了切不动的那一句原因由调用方说出口（见 tz-checkin-daily-card 的 nextQuote，M13 不留静默），
		     原先「不足两句整枚不出」的判据随这一次点名下线；金句为空时两枚都不出（海报上没得复制也没得换）。
		     挂在海报根节点这一层是因为它要压在上面那张渲染图之上才点得到；位置与挂在 .sp-layer 里
		     完全一样（两个盒子同尺寸同原点） -->
		<view class="sp-acts" v-if="layout === 'daily'" :style="dailyText.acts">
			<view class="sp-act" v-if="quote" @tap="$emit('next-quote')">
				<u-icon class="sp-ic-mid" name="reload" :size="14" color="#fff"></u-icon>
				<text class="sp-act-text">换一条</text>
			</view>
			<view class="sp-act" v-if="quote" @tap="$emit('copy-quote')">
				<u-icon class="sp-ic-mid" name="file-text" :size="14" color="#fff"></u-icon>
				<text class="sp-act-text">复制金句</text>
			</view>
		</view>
		<!-- 素材还没取齐的加载遮罩（2026-09-26 用户口径：海报里零散的骨架块太丑，换成盖满整张海报的
		     一块黑底浅透明遮罩 + 白字「加载中…」，科技风：一道浅白扫描光带 + 旋转圆环）：
		     头像/底图/封面（assetsReady）或那张码（codeLoading）还有没到手的就盖着，全部到手撤掉。
		     挂在海报根节点最上层（排在渲染图与那两枚动作之后）——只是 DOM 一层，画布那份不读它，
		     存下来与分享出去的图上不会带这层黑；圆角与海报同档 8px（用户点名） -->
		<view class="sp-shade" v-if="shadeLoading">
			<view class="sp-shade-scan"></view>
			<view class="sp-shade-ring"></view>
			<view class="sp-shade-text">
				<text class="sp-shade-t">加载中</text>
				<text class="sp-shade-dot">.</text>
				<text class="sp-shade-dot sp-shade-dot2">.</text>
				<text class="sp-shade-dot sp-shade-dot3">.</text>
			</view>
		</view>
	</view>
		<!-- 画布放在海报那一层之外：.sp-poster 有 overflow:hidden 与 transform:scale()，
		     屏幕外那张画布压在里头会被变换后的祖先重新定位（fixed 变 absolute）甚至被裁掉——
		     改造前它就在海报外面，这里保持同一位置。
		     id 走 data 里那只唯一号，不写死：见 data.canvasId 的注释 -->
		<!-- #ifdef MP-WEIXIN -->
		<!-- 微信端只认 type="2d"：旧版 canvas-id 那条链在这一端永远不回音（draw 无回调、导出报 canvas is empty，
		     2026-09-28 实测），海报出不了图。2d 用的是 id + getContext('2d')，见 common/utils/canvas-2d.js -->
		<canvas type="2d" :id="canvasId" class="sp-canvas"></canvas>
		<!-- #endif -->
		<!-- #ifndef MP-WEIXIN -->
		<canvas :canvas-id="canvasId" :id="canvasId" class="sp-canvas"></canvas>
		<!-- #endif -->
	</view>
</template>

<script>
/**
 * props: layout, styleOptions, themeIndex, poster, codeSrc, codeLoading, renderLoading, codeCaption, scale, bgSizes
 *        layout       = 'daily'（打卡日签图）| 'content'（内容分享海报），两档共用同一张画布与同一套退档判据
 *        styleOptions = 调用方（tz-share-poster）用 poster-theme 的 buildStyleOptions 算出来的样式清单，
 *                       底图以后端下发为准，一条都没配才回落自带弥散渐变（M18⑦，禁止前端写死商家样式）
 *        themeIndex   = 选中第几档；清单异步变长时由 activeIndex 收在范围内
 *        poster       = 这一张海报要画的内容，两档共用一个对象：
 *                       共用：nickname 分享人昵称、avatar 头像、name（daily = 打卡名称 / content = 内容名称）
 *                       daily ：quote 金句、quoteFrom 出处、totalDays 累计天数
 *                               （海报上「换一条」「复制金句」这两枚只看 quote：有金句就成对出，
 *                                库里只有一句时点了切不动，那句原因由调用方说出口——见 M13）
 *                       content：inviteText 邀请语、cover 内容封面（2026-09-26 用户定：内容卡只画封面 + 标题，
 *                                类型 / 现价 / 划线原价 / 店铺名都不再上海报，故这些字段本组件不读）。
 *                                cover 没下发或加载失败时填系统 logo（见 coverSrc），logo 也取不到才不画那一格
 *        codeSrc      = 右下角那张码（H5 二维码 / 小程序码，按端取，见 tz-share-poster 的 loadCode）
	 *        codeLoading  = 那张码还在取（弹层已发请求、没回来也没失败）：这一格先按到位的那一档留好位置，
	 *                       整张海报盖加载遮罩（shadeLoading → .sp-shade），到手那一刻版式不跳、
	 *                       也不用用户对着一个空方块猜
 *        codeCaption  = 码下面那句说明（'长按识别' + 码名）
 *        renderedSrc  = 画布已经出好的那一张海报图（盖在 DOM 排版之上，长按存的就是它；空串时只有排版）
 *        renderLoading= 壳那一次重画还在路上（为真时整张盖遮罩、留着上一张，见 shadeLoading）
 *        renderFailed = 壳连退档都没画出一张图：遮罩撤掉露出排版那一张，不让素材缺一枚就永久停在「加载中」
 *        scale        = 预览缩放档（画布恒为 300×400，存下来的图不跟着视口分档）
 *        bgSizes      = 底图原始宽高表（key = 地址，由本组件 @load 报给调用方再传回来，画布按它居中裁切）
 * emits: bg-error(url)、bg-load(url,{width,height})、next-quote、copy-quote
 * 对外方法：drawPoster(done, level) —— 由 tz-share-poster 的「保存 / 分享」经 $refs 调（画布在本组件这一层）
 */
import { POSTER_THEMES, POSTER_W, POSTER_H, themeCss, drawTheme, roundRect, aspectFill, setFont, clampIndex, textWidth, fitText, wrapText, styleText } from '@/common/utils/poster-theme';
import { mpKey } from '@/common/utils/mp-data-key';
// H5 出图前先把这一批地址换成本机地址（小程序端那条 2d 链自己会加载图片对象，用不着）
import { resolvePosterImages } from '@/common/utils/poster-render';
// #ifdef MP-WEIXIN
import { get2dCanvas, load2dImages, wrap2d, export2d } from '@/common/utils/canvas-2d';
// #endif

// 头像兜底图（与日签图、各页用户卡同一张）：抽成一处，avatarSrc 与「它自己也取不到」那一判读同一个值
const DEFAULT_AVATAR = '/static/image/default-avatar.png';

// —— 两档版式的镜像数值：下面样式块里每一块的 top / 高度 / 字号 / 字重都在这张表里有一份，改视觉两处一起改 ——
//    content 这一档的顶边与高度不写死在 CSS 里，全部由 contentColumn 现算（标题几行、码在不在都影响版式），
//    预览的 :style 与画布读同一个对象——两份各算各的就是「预览两行、存下来三行」那类分叉的成因
const PAD = 18;            // 海报竖向内衬（两档共用）+ content 档的左右内衬
// daily 档的左右内衬：2026-09-26 用户点名「左右两侧的间距以左侧为基准，可以再放大 1/2」
// —— 改前预览是 18、画布那一份是 24（两边本来就不等，读出来就是「右侧比左侧小」），
// 现在两边同一份 27（= 左侧那一档 18 × 1.5），右锚的角标 / 出处 / 那张码一起收到 27。
// 相邻档：24（只把两边对齐、不放大）／36（再放大一档，两行金句会掉到 13 字一行）
const DAILY_X = 27;
const FOOT = 80;           // daily：.sp-foot 高度
const CODE = 64;           // daily：右下角码边长
const AVA = 26;            // daily：头像边长
// daily：白底用户区左列定宽 —— 左内衬加到 27 后可占宽就只剩 176（300 − 27×2 − 码 64 − 间隙 6），
// 码到手与没到手两态同一档，码 load 回来那一刻不会把字挤走
const USER_W = 176;
// daily：角标内衬「上下左右再扩大一倍」（2026-09-26 用户点名）——
// 上下 4 → 8；左右原先没有写内衬，盒子按最宽一行（日期 22px 那行 ≈55）估出来的留边就是 6.5，
// 那一档翻倍 = 13，于是角标宽由写死的 68 改成「最宽一行 + 左右内衬」现算（预览与画布读同一个值）
const DATE_PAD_Y = 8;
const DATE_PAD_X = 13;
const DATE_R = 4;          // daily：角标圆角走 §1 小元素档 4px —— 预览一直是 4，画布此前漏画，存下来的图就是方的
// daily：角标三行（时刻 / 日期 / 星期）的「字号 + 行高 + 字重」，与 .sp-time / .sp-date / .sp-week 逐值镜像
// （第三档就是 CSS 那两行 font-weight 的镜像：只有 .sp-date 写了 bold）
const DATE_LINES = [[12, 16, false], [22, 28, true], [11, 15, false]];
// daily：金句区。左内衬收到 27 后一行可用宽只剩 246，17px 那一档只能放 14 字（30 字上限会被截成 28），
// 字号退一档 16px 才保住「一行 15 字 × 两行 = 30 字」这条与后台 Quote::CONTENT_MAX 对得上的档
const QUOTE_SIZE = 16;
const QUOTE_LINE = 26;
const QUOTE_MAX_LINES = 2;
const QUOTE_TOP = 130;     // 金句首行顶边：必须仍在角标下沿（18 + 8×2 + 59 = 93）之外（M18④）
const QUOTE_FROM_GAP = 12; // 出处与金句最后一行的间距（与改前 .sp-quote-from 的 margin-top 同一档）
const FROM_SIZE = 12;      // 出处字号
const FROM_LINE = 20;      // 出处行高（画布基线 = 行顶 + 行高/2 + 字号×0.36，与预览同一个盒子）
// daily：那枚引号。原先与金句首字同一个左内衬（预览 18 / 画布 22），字形自带左间距 ⇒ 墨迹正好压在
// 首字上方且比首字更靠右，用户读出来是「文字比引号靠左、两枚叠在一起不协调」；
// 现按「引号在文字左上角」把它整体左移一档（2026-09-26 用户点名）
const MARK_X = DAILY_X - 14;
const MARK_TOP = QUOTE_TOP - 30;
const MARK_SIZE = 46;
const MARK_BASELINE = 50;  // 画布基线 = 预览那一格的 top + 这一档（改前 100 / 150 同一对差值）
const ACT_TOP = 214;       // 换一条 / 复制金句那一排
const COUNT_TOP = 246;     // 累计打卡那一块
const HEAD_AVATAR = 40;    // content：邀请头头像
const HEAD_H = 44;         // content：邀请头那一行的高（昵称 22 + 间距 4 + 邀请语 18，40 的头像在其中垂直居中）
const GAP = 12;            // content：列内唯一的留边档 —— 块与块之间、卡的四边都只存这一个值
const CARD_R = 8;          // content：卡的圆角（§1 封面/缩略图档 6–8；这块不贴海报边，圆了不会漏底图）
const CARD_BG = 'rgba(255,255,255,0.86)'; // content：磨砂白底（靠透明度，不用 backdrop-filter——小程序不认）
const COVER_W = 240;       // content：卡内封面（卡宽 264 − 左右内衬 12×2），标题与它同宽
const COVER_H = 124;
const COVER_R = 6;         // content：封面圆角（卡内再一档，比卡的 8 小）
const NAME_SIZE = 13;      // content：标题字号
const NAME_LINE = 19;      // content：标题行高（标题只占一行，卡高跟着这一行）
const QR = 84;             // content：码边长
const QR_TIP_GAP = 8;      // content：说明与码之间的间距（码和它那行说明是一组，比块间距 GAP 收一档）
const QR_TIP_H = 16;

// 画布 id 的唯一号（模块级自增）：uni-h5 的 createCanvasContext(id, this) 里那个 `this` 只用来取
// **页面 id**（@dcloudio/uni-h5/src/core/service/api/context/canvas.js:788-791 → context.$page.id），
// 并不按自定义组件作用域找节点。打卡日记页同时挂着「全局分享弹窗」和「日签图弹层」两只
// tz-share-poster-body，写死同一个 canvas-id 就会在同页出现两个同名 id —— getElementById 只拿第一个，
// 症状是第二只弹层画到第一张画布上、导出的也是错的那一张（小程序侧 createCanvasContext 认组件实例，
// 但 id 唯一化对两端都无害，故统一加号）
let uidSeq = 0;

export default {
	name: 'tz-share-poster-body',
	props: {
		layout: { type: String, default: 'content' },
		styleOptions: { type: Array, default: () => [] },
		themeIndex: { type: Number, default: 0 },
		poster: { type: Object, default: () => ({}) },
		codeSrc: { type: String, default: '' },
		// 同一张码的备选地址（见 tz-share-poster 的 onCodeImgError）：预览这一张加载不出来时换它，
		// 画布那一条链也把它当备选一起加载——两枚在 <image> 与画布图片对象两处的可加载性不等价
		codeAltSrc: { type: String, default: '' },
		codeLoading: { type: Boolean, default: false },
		// 壳那一次重画还在路上（换新图之前先留着上一张 + 盖遮罩，见 shadeLoading）
		renderLoading: { type: Boolean, default: false },
		// 壳那一次出图失败了（连退档都没画出图）：遮罩要撤，让人看到底下那一版排版
		renderFailed: { type: Boolean, default: false },
		codeCaption: { type: String, default: '' },
		// 已经渲染出来的那一张海报图地址（画布出的图，靠长按保存的端由弹层壳换成 http 地址后再传进来）；
		// 空串时显示的是本组件那一版 DOM 排版（也是画布出图之前的第一帧）
		renderedSrc: { type: String, default: '' },
		scale: { type: Number, default: 1 },
		bgSizes: { type: Object, default: () => ({}) },
	},
	data() {
		return {
			// 这一只实例的画布 id（为什么不能写死，见文件顶部 uidSeq 那段注释）
			canvasId: 'spPosterCanvas-' + (++uidSeq),
			// 头像加载失败标记：key = mpKey(头像地址)（与 tz-circle-media-grid 同口径，换人时不必手动重置；
			// 地址原样作 key 会被 setData 当成嵌套路径，见 common/utils/mp-data-key）
			avatarErrors: {},
			// 预览里真正 load 成功过的那张头像地址：画布只画这一张（没成功的地址交给画布去等就没有回音）
			avatarLoaded: '',
			// 头像原图宽高表（key = mpKey(地址)）：画布按它做与预览 mode="aspectFill" 同一刀的居中裁切
			// （不裁就是整张压进 26×26，DOM 那一版与画布那一版换着看就是「头像里的人像上下跳」）
			avatarSizes: {},
			// 内容封面加载失败标记：key = mpKey(封面地址)（与 avatarErrors 同一口径，换内容时不必手动重置；
			// 地址原样作 key 会被 setData 当成嵌套路径解析，见 common/utils/mp-data-key）。
			// **用表不用布尔位**：封面取不到要退回系统 logo，而 logo 自己取不到才算真没有封面（见 coverSrc），
			// 两者要分别记住是谁失败了，一只 coverFailed 分不出这三态
			coverErrors: {},
			// 封面原始宽高表（key = mpKey(地址)）：画布按它与预览 mode="aspectFill" 做同一刀居中裁切。
			// 按地址存而不是只留一份：这一格会在内容封面与系统 logo 之间换一枚（见 coverSrc），
			// 共用一份尺寸会把 logo 按上一张的比例裁掉
			coverSizes: {},
		};
	},
	computed: {
		nickname() { return (this.poster || {}).nickname || ''; },
		name() { return (this.poster || {}).name || ''; },
		avatar() { return (this.poster || {}).avatar || ''; },
		/** 头像：未下发或加载失败都兜底默认头像（与日签图、各页用户卡同一张图） */
		avatarSrc() {
			// 兜底图自己也取不到时不再摆它：assetsReady 只等「这一格真摆了图」，
			// 留着一张不回音的兜底图，整张海报就永远盖着「加载中」
			if (!this.avatar || this.avatarErrors[mpKey(this.avatar)]) {
				return this.avatarErrors[mpKey(DEFAULT_AVATAR)] ? '' : DEFAULT_AVATAR;
			}
			return this.avatar;
		},
		activeIndex() { return clampIndex(this.themeIndex, this.styleOptions.length); },
		activeOption() { return this.styleOptions[this.activeIndex] || null; },
		activeImage() {
			const o = this.activeOption;
			return o && o.kind === 'image' ? o.url : '';
		},
		/** 当前这一档弥散渐变；选中底图时它是垫在图下面那一层（图没铺满时露一眼），取第一档即可 */
		activeTheme() {
			const o = this.activeOption;
			if (o && o.kind === 'gradient') return o.theme;
			const first = this.styleOptions[0];
			return first && first.theme ? first.theme : POSTER_THEMES[0];
		},
		posterStyle() {
			return { background: themeCss(this.activeTheme, POSTER_W), transform: 'scale(' + this.scale + ')' };
		},
		/**
		 * 上面那两份样式给模板用的字符串档（posterStyle / daily 的每一个子块）
		 *
		 * ⚠ 小程序端 `:style` 绑变量（computed 返回的对象）会原样进 setData，wxml 把 style 属性
		 *   toString 成 `style="[object Object]"` ⇒ 弥散渐变背景与 daily 档全部绝对定位整批静默丢掉，
		 *   用户读出来就是「海报没有背景、是一块灰透明的东西」（2026-09-28 微信小程序视图层实测，H5 看不出）。
		 *   数值那一份（posterStyle / daily）必须留着给画布读，两份是同一个来源：这里只做序列化。
		 */
		posterStyleText() {
			return styleText(this.posterStyle);
		},
		dailyText() {
			const d = this.daily;
			return {
				badge: styleText(d.badge),
				mark: styleText(d.mark),
				quote: styleText(d.quote),
				from: styleText(d.from),
				count: styleText(d.count),
				foot: styleText(d.foot),
				acts: styleText(d.acts),
			};
		},
		// —— daily 档 ——
		quote() { return (this.poster || {}).quote || ''; },
		quoteFrom() { return (this.poster || {}).quoteFrom || ''; },
		totalDays() { return (this.poster || {}).totalDays || 1; },
		/**
		 * daily 档那一版排版的唯一数值源：预览每一块的 :style 与画布 drawDaily 读的都是这一个对象
		 *
		 * 改前金句 / 出处是「跟着 .sp-layer 的内衬 + margin 排」，画布自己另写了一套 x（24 / 22），
		 * 两份不同步正是用户读出的「右侧间距比左侧小、引号压在文字头上」；现在两块都不再各算一遍。
		 * 金句行数由 wrapText 按同一份可用宽算出来（一行 16px × 15 字 = 240 ≤ 246），
		 * 出处顶边跟着实际行数走 —— 不用 -webkit-line-clamp，折几行只有浏览器知道就算分叉。
		 */
		daily() {
			const w = POSTER_W - DAILY_X * 2;
			const lines = wrapText(this.quote, QUOTE_SIZE, w, QUOTE_MAX_LINES);
			// 角标宽 = 最宽那一行的实测墨迹 + 左右内衬各一档（预览 text-align:center 与画布取中同一个结果）
			const widest = Math.max(
				textWidth(this.nowTime, DATE_LINES[0][0]),
				textWidth(this.nowMD, DATE_LINES[1][0]),
				textWidth(this.nowW, DATE_LINES[2][0])
			);
			const badgeW = Math.ceil(widest) + DATE_PAD_X * 2;
			return {
				x: DAILY_X,
				w: w,
				lines: lines,
				userW: USER_W,
				badgeW: badgeW,
				badgeH: DATE_PAD_Y * 2 + DATE_LINES.reduce((s, l) => s + l[1], 0),
				badge: { left: POSTER_W - DAILY_X - badgeW + 'px', top: PAD + 'px', width: badgeW + 'px' },
				mark: { left: MARK_X + 'px', top: MARK_TOP + 'px', fontSize: MARK_SIZE + 'px' },
				quote: { left: DAILY_X + 'px', top: QUOTE_TOP + 'px', width: w + 'px', fontSize: QUOTE_SIZE + 'px', lineHeight: QUOTE_LINE + 'px' },
				from: { left: DAILY_X + 'px', top: QUOTE_TOP + lines.length * QUOTE_LINE + QUOTE_FROM_GAP + 'px', width: w + 'px', lineHeight: FROM_LINE + 'px' },
				acts: { right: DAILY_X + 'px', top: ACT_TOP + 'px' },
				count: { left: DAILY_X + 'px', top: COUNT_TOP + 'px' },
				foot: { height: FOOT + 'px', paddingLeft: DAILY_X + 'px', paddingRight: DAILY_X + 'px' },
			};
		},
		/** content 档 —— 卡片只有封面与标题两样，其余字段一概不画 */
		inviteText() { return (this.poster || {}).inviteText || '邀请你一起学习'; },
		/**
		 * 系统 logo（站点配置里那一张，全站分享卡片缺封面时的同一份兜底，见 router.share / wechat sdk）
		 *
		 * 取不到（站点没配 / 组件没挂到 Vue 原型上）当空串：下面那一步会因此退回「没有封面」的版式，
		 * 与改造前的行为一致，不会因为兜底本身出问题而让海报画不出来。
		 */
		siteLogo() {
			try {
				return ((this.$tools && this.$tools.systemConfig('logo')) || '').trim();
			} catch (e) {
				return '';
			}
		},
		/**
		 * 卡内那一格封面：内容自己的封面 → 取不到就填系统 logo → logo 自己也取不到才不画（不留一块白）
		 *
		 * 2026-10-05 用户口径（直播间分享弹窗）：「如果图片加载失败或没有，可以使用系统 logo 填充」。
		 * 与头像那一档同一套三态（见 avatarSrc）：内容封面没下发、或地址加载失败（coverErrors 记着）
		 * 都落到系统 logo 这一枚；logo 自己加载失败时不再摆它 —— assetsReady 只等「这一格真摆了图」，
		 * 留一张永不回音的图会把整张海报永久盖在「加载中」（那是这一族最典型的症状）。
		 * 三态按 mpKey(地址) 分别记，换一条内容时不必手动重置（旧的一枚只影响它自己）。
		 *
		 * poster 由调用点下发（日签图弹层关闭时可能是 null，父级数据未到时也会短暂为 null）：
		 * 这里直接取属性会抛 `Cannot read properties of null (reading 'cover')`，
		 * 而渲染期的异常会让这一页的 patch 整轮被跳过 —— 症状正是「视图层不更新、点什么都没反应」
		 * （2026-09-27 与 setData 出栈写入同一天实测到，见 ui-baseline-mobile.md M26 与 main.js 的闸门注释）
		 */
		coverSrc() {
			// daily（打卡日签图）那一档压根没有内容卡，也没有封面这一格：logo 只填 content 档的卡内封面，
			// 不然 assetsReady 会去等一枚日签图上根本不画的图，整张海报被盖在「加载中」（见 assetsReady）
			if (this.layout !== 'content') return '';
			const p = this.poster || {};
			const own = p.cover || '';
			if (own && !this.coverErrors[mpKey(own)]) return own;
			const logo = this.siteLogo;
			if (logo && logo !== own && !this.coverErrors[mpKey(logo)]) return logo;
			return '';
		},
		/**
		 * 这一块内容卡出不出
		 *
		 * 判据看**内容自己有没有东西**（封面或标题），不看 coverSrc：系统 logo 是所有内容共用的
		 * 那一枚兜底，拿它当「这一条有内容」的证据，等于连名称都没有的一条也摆出一张只有 logo 的空卡
		 * ——那正是 2026-09-26 用户点名要避免的「半张空卡」。logo 只在卡已经因为内容而出时填封面那一格。
		 */
		hasCard() {
			const p = this.poster || {};
			return !!((p.cover && !this.coverErrors[mpKey(p.cover)]) || this.name);
		},
		/**
		 * 标题那一行（预览逐行渲染、画布逐行 fillText，两份读同一个数组）
		 *
		 * 只占一行，超出部分由 fitText 截掉并补省略号（2026-09-27 用户口径）；数组形态保留，
		 * 为的是卡高仍走 contentColumn 那一条「有几行就占几个 NAME_LINE」的算式，预览与画布读同一份。
		 * 不交给 CSS 的 -webkit-line-clamp 去折：那一版折出几行只有浏览器知道，卡高就得写死两行的空，
		 * 一行标题的内容卡下面因此空着一截（2026-09-26 用户点名「内容区域上下间距不一致」），
		 * 而存下来的那张图与预览也不是同一版。
		 */
		nameLines() {
			return this.name ? [fitText(this.name, NAME_SIZE, COVER_W)] : [];
		},
		/** 这一张海报最后会不会有码（在取的要按有的那一档排版，到手才不会跳） */
		codePlanned() {
			return !!(this.codeSrc || this.codeLoading);
		},
		/**
		 * content 档那一列的版式：邀请头钉在海报顶部、那张码钉在底部，内容卡在中间那一段里垂直居中
		 *
		 * 2026-09-26 用户点名「二维码的位置应该固定在底部，不要跟随内容的高度变化而改变；
		 * 个人信息（头像、昵称、邀你一起学习）的位置也是固定的」。
		 * 改前整列垂直居中：标题是一行还是两行、封面取没取到，都会把邀请头与码一起上下推，
		 * 用户读出来就是「换一条内容，头像和码的位置又变了」。
		 * 现在跟着内容长短走的只有中间那一格：卡高仍按 nameLines 现算（不预留两行的空，M18⑧），
		 * 两个锚点到海报边缘的距离恒定（各一档 PAD），卡在这段里居中且不与两头相压。
		 */
		contentColumn() {
			const lines = this.nameLines.length;
			const hasCover = !!this.coverSrc;
			const cardH = this.hasCard
				? GAP * 2 + (hasCover ? COVER_H + (lines ? GAP : 0) : 0) + lines * NAME_LINE
				: 0;
			const col = { headTop: PAD, cardTop: 0, cardH: cardH, coverTop: 0, nameTop: 0, qrTop: 0, tipTop: 0 };
			// 底部那一组：说明的下沿收在海报下内衬，码在它上面一档 QR_TIP_GAP
			col.tipTop = POSTER_H - PAD - QR_TIP_H;
			col.qrTop = col.tipTop - QR_TIP_GAP - QR;
			const bandTop = col.headTop + HEAD_H + GAP;
			// 没有码（落点没给、或取失败）时中间那一段一直让到海报底，卡跟着这一段的中心走，
			// 不会因为少了一块就整列往上贴
			const bandBottom = (this.codePlanned ? col.qrTop : POSTER_H - PAD) - GAP;
			if (cardH) {
				col.cardTop = Math.max(bandTop, Math.round((bandTop + bandBottom - cardH) / 2));
				col.coverTop = col.cardTop + GAP;
				col.nameTop = col.coverTop + (hasCover ? COVER_H + GAP : 0);
			}
			return col;
		},
		/**
		 * 整张海报的加载遮罩（2026-09-26 用户口径：零散骨架块太丑，换成盖满海报的一块黑底浅透明遮罩）：
		 * 预览那几张素材（头像/底图/封面，assetsReady）或那张码（codeLoading，壳里 codePending 判好）
		 * 还有没到手的就盖着，全部到手撤掉；码那一格仍按到手那一档排版（codePlanned，版式不跳）。
		 * 换样式档那一次重画也盖着（renderLoading，壳里给的）：新图没回来之前留着上一张整张不动，
		 * 而不是退回底下那一版 DOM 排版——两套渲染器交替出现，就是 2026-09-27 点名的「头像、昵称上下跳」。
		 * **素材那一判只在「还没出过图」时说话**：壳出图最多等 RENDER_RETRY 那几拍，等不到就按到手
		 * 那一档先画一张（宁可少画一层也不卡住），出好之后这张图就是用户看到的、要长按保存的那一张；
		 * 遮罩若继续按素材到手判，一张取不到的图会把整张海报永久盖在「加载中」——保存与分享看着都像坏了。
		 * 出图失败（renderFailed）同样撤：退回底下那一版排版，海报还在。
		 * 只是 DOM 一层——画布那份不读它，存下来与分享出去的图上不会带这层黑
		 */
		shadeLoading() {
			if (this.renderLoading === true) return true;
			// 码这一条腿还在飞 ⇒ 遮罩不许撤（2026-09-28 用户点名 H5 分享弹窗「加载中先关掉、二维码还没出来，
			// 过一会儿又变成加载中，码到手才关」）。旧顺序把「已经出过一张」放在这一档前面，于是
			// 素材先齐、码还没到手的那一拍会先出一张**没有码**的海报并撤遮罩；码到手又重排一次出图、
			// 遮罩再盖上 —— 中间就断了这一次。整条链（素材 + 码 + 出图）都收尾之前不撤，
			// 上限仍由壳那两只兜底表给：取码 CODE_TIMEOUT、出图 RENDER_TIMEOUT，到点都各有确定出口。
			if (this.codeLoading) return true;
			if (this.renderedSrc || this.renderFailed) return false;
			return !this.assetsReady;
		},
		/**
		 * 预览那一版的三张外部图（头像 / 底图 / 内容封面）是不是都到手了
		 *
		 * 画布只画预览里 @load 成功过的那张（外域图没给 CORS 头会污染画布、地址取不到时画布那一队
		 * 只挂 onload 永远没有回音，见 drawPoster），所以弹层壳要「渲染成图片」之前先等这一条为真，
		 * 否则第一次出图会少一张图还被缓存下来。等不到也有上限（RENDER_RETRY），宁可少画一层也不卡住。
		 */
		assetsReady() {
			if (this.avatarSrc && this.avatarLoaded !== this.avatarSrc) return false;
			if (this.activeImage && !this.bgSizes[mpKey(this.activeImage)]) return false;
			if (this.coverSrc && !this.coverSizes[mpKey(this.coverSrc)]) return false;
			return true;
		},
		/**
		 * 退档顺序：外域图把出图路卡住时，一层一层丢掉再重画（M13：宁可少一张图，不能让保存整个出不来图）。
		 * 表里从前往后 = 先丢头像（它最小、丢了海报还成立）、content 再丢内容封面、最后丢底图（丢了退回渐变档）。
		 * daily 档没有封面这一层，顺序与改造前逐字一致。
		 */
		degradeChain() {
			return this.layout === 'daily' ? ['avatar', 'bg'] : ['avatar', 'cover', 'bg'];
		},
		nowTime() { return this.fmtTime(); },
		nowMD() {
			const d = new Date();
			return this.pad(d.getMonth() + 1) + '.' + this.pad(d.getDate());
		},
		nowW() {
			const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
			return names[new Date().getDay()];
		},
	},
	methods: {
		pad(n) { return n < 10 ? '0' + n : '' + n; },
		/**
		 * 本组件（乃至它所在的页面）是不是已经销毁/正在销毁。
		 *
		 * 为什么每个异步回调开头都要问这一句（2026-09-27 线上实测堆栈）：
		 * 返回上一页时页面开始卸载，而海报里那张封面图恰好这一刻 `@load` 回来，
		 * 回调照旧写 `coverSize` ⇒ Vue 响应式 notify ⇒ `__patch__` ⇒ 对一个已经销毁的页面调 `setData`
		 * ⇒ WeChat 运行时 `updateValues` 里抛 `TypeError: Cannot read properties of null`
		 * ⇒ **此后整个运行时的 setData 通道全废**：所有页面都停在首屏（骨架屏永不撤）、所有点击都像失灵，
		 * 而接口全是 200、控制台除了这一条之外没有任何业务报错——症状与「请求没有回调」一模一样，极易误判到请求层。
		 * 判据用 Vue 自己的 `_isDestroyed` / `_isBeingDestroyed`，不另存状态位（少一处可能忘清的地方）。
		 */
		gone() {
			return this._isDestroyed === true || this._isBeingDestroyed === true;
		},
		fmtTime() {
			const d = new Date();
			return this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
		},
		onAvatarError() {
			if (this.gone()) return;
			// 记「此刻摆在海报上的那一张」：账号没头像时报错的是那张兜底图，只记 this.avatar（空串）
			// 等于什么都没记，assetsReady 会一直等一张不回音的图
			const bad = this.avatarSrc;
			if (bad) this.$set(this.avatarErrors, mpKey(bad), true);
		},
		/** 头像 load 到手：记下「哪一张 load 成功」与它的原始宽高（画布按同一张地址、同一刀裁切画） */
		onAvatarLoad(e) {
			if (this.gone()) return;
			this.avatarLoaded = this.avatarSrc;
			const w = e && e.detail && e.detail.width;
			const h = e && e.detail && e.detail.height;
			if (w && h) this.$set(this.avatarSizes, mpKey(this.avatarSrc), { w: w, h: h });
		},
		onBgError(url) {
			if (this.gone()) return;
			this.$emit('bg-error', url);
		},
		onBgLoad(url, e) {
			if (this.gone()) return;
			this.$emit('bg-load', { url: url, width: e && e.detail && e.detail.width, height: e && e.detail && e.detail.height });
		},
		onCoverError() {
			if (this.gone()) return;
			// 记「此刻摆在海报上的那一张」（可能是内容自己的封面、也可能是刚退回的系统 logo，
			// 见 coverSrc）：只记 poster.cover 的话，退回 logo 之后它再失败就没人记，
			// coverSrc 会永远停在这一枚加载不出来的地址上、assetsReady 也永远等不到那一格（见 avatarError 同款理由）
			const bad = this.coverSrc;
			if (bad) this.$set(this.coverErrors, mpKey(bad), true);
		},
		/**
		 * 预览里那张码加载不出来：交回壳去换备选地址（见 tz-share-poster 的 onCodeImgError）
		 *
		 * 这里不改任何本地状态：码这一格「在不在」只由 codeSrc 决定（壳管的），
		 * 换地址是壳的事——两枚地址互为备胎，换完再失败就由出图那条链与 inline 档那句说明收口。
		 */
		onCodeError() {
			if (this.gone()) return;
			console.warn('[tz-share-poster-body] 预览里那张码没加载出来，换备选地址重试：', this.codeSrc);
			this.$emit('code-error');
		},
		onCoverLoad(e) {
			if (this.gone()) return;
			const w = e && e.detail && e.detail.width;
			const h = e && e.detail && e.detail.height;
			// 按地址存（与 avatarSizes 同一份判据）：这一格可能在内容封面与系统 logo 之间换过一枚
			// （见 coverSrc），拿上一枚的宽高裁这一张，画布上就是「logo 被按课程封面的比例裁掉一块」
			if (w && h) this.$set(this.coverSizes, mpKey(this.coverSrc), { w: w, h: h });
		},
		/** 这一层此刻画不画（lv 还没走到它被丢掉的那一档，且它确实有东西可画） */
		keepLayer(lv, name) {
			const i = this.degradeChain.indexOf(name);
			return i >= lv;
		},
		/**
		 * 下一档退到哪：只往「真画过东西」的那一层退，没有可退的就到此为止（不再白画一遍）
		 * @param {Number} lv 当前档
		 */
		degradeLevel(lv) {
			const chain = this.degradeChain;
			for (let i = lv; i < chain.length; i++) {
				const name = chain[i];
				if (name === 'avatar') return i + 1;
				if (name === 'cover' && this.coverSrc) return i + 1;
				if (name === 'bg' && this.activeImage) return i + 1;
			}
			return lv;
		},
		/**
		 * 这一档这一轮要交给画布的地址里，还有哪些没换过（本机地址）——H5 出图前先换再画（见 drawPoster）
		 *
		 * 判据与 2d 那条链收集图片的地方同一份（degradeChain 的 keep + 头像要 load 成功过才画），
		 * 只是把「已经换过的」剔掉：换过一次就长期有效，不随档位失效，也不用每次出图都重换一遍。
		 * @param {Function} keep 这一档这一层画不画（degradeChain 的判据，与 2d 那一条同一份）
		 * @returns {Array<String>} 待换的原始地址（码排第一：它换不到就直接按失败收口）
		 */
		pendingDrawSrc(keep) {
			const srcs = [];
			if (keep('avatar') && this.avatarSrc && this.avatarLoaded === this.avatarSrc) srcs.push(this.avatarSrc);
			if (keep('bg') && this.activeImage) srcs.push(this.activeImage);
			if (keep('cover') && this.coverSrc) srcs.push(this.coverSrc);
			if (this.codeSrc) srcs.push(this.codeSrc);
			const map = this.imgDraw;
			return srcs.filter((s) => !map || map[s] === undefined);
		},
		/**
		 * 取这一张画给画布的地址：换过就给换过的，换不到给 ''（这一层这一次不画，调用点按缺件跳过）
		 *
		 * 没有这张换地址表（小程序 2d 那条链自己会加载图片对象）时原样给出去，那一条链一个字都不受影响。
		 * @param {String} url 原始地址（取尺寸表用的也一直是它，换过的地址只喂 drawImage）
		 * @returns {String} 可绘地址，换不到为 ''
		 */
		drawSrc(url) {
			if (!url) return '';
			const map = this.imgDraw;
			if (!map) return url;
			return map[url] || '';
		},
		/**
		 * 按当前样式把这一张海报画到屏幕外的 canvas 上，出图后交给调用方
		 *
		 * 「保存」与「分享」用的是同一张图，画布与排版只存这一处，两条路只在拿到图之后分岔。
		 * ⚠ 下面的数值是本文件样式块那一版排版的镜像（几何 + 字号 + 字重；画布 300×400 = .sp-poster 的宽高，
		 * daily：日期角标 top 18 / 金句首行 130 / 累计打卡 246 / 用户区 FOOT；content：整列的顶边与
		 * 高度全取 contentColumn，即预览 :style 读的那一份），改视觉只改一处会让「预览的图」和「存下来的图」长得不一样。
		 * 字重这一项每一行都要走 setFont(ctx, 字号, bold)：只给字号时画布那一份永远是常规体，
		 * 预览里 bold 的那几行会在画布图盖上来那一刻细一档（2026-09-27 用户点名「切换预览选项时昵称先变粗再变细」）。
		 * @param {Function} done  收到图片地址（H5 为 base64、小程序为临时文件路径）
		 * @param {Number}   level 内部重试用：0 = 全画，往后每一档丢一层（见 degradeChain）
		 */
		drawPoster(done, level) {
			const lv = level || 0;
			const keep = (name) => this.keepLayer(lv, name);
			let settled = false;
			let timer = 0;
			const finish = (src) => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				// 组件/页面已销毁就不要再回值：调用方拿到 tempFilePath 会写响应式数据（renderedSrc / renderPending），
				// 那一刻 setData 打到已销毁的页面上就是整条通道崩溃的入口（见 gone 的说明）
				if (this.gone()) return;
				done(src);
			};
			/**
			 * 外域图把整条出图路卡住的两种情况，都退一步重画一次（M13）：
			 * ① 图没给 CORS 头 → 画布被污染，canvasToTempFilePath 里 toDataURL 抛错，只回 fail；
			 * ② 画布那张图的加载队列只挂 onload，地址换了而这一张恰好取不到时就永远没有回音——
			 *    那正是「点了保存没反应」。退的顺序见 degradeChain。
			 */
			const retryOrTell = () => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				if (this.gone()) return;
				const next = this.degradeLevel(lv);
				if (next > lv) { this.drawPoster(done, next); return; }
				done('');
			};
			timer = setTimeout(retryOrTell, 4000);
			// #ifdef MP-WEIXIN
			this.drawPoster2d(keep, finish, retryOrTell);
			// #endif
			// #ifndef MP-WEIXIN
			const self = this;
			// 交给画布的每一张外域图先在本层换成本机地址再画（poster-render 的那一只「交给画布之前先验完」）：
			// ① 跨域图直接喂给旧画布接口会污染画布，canvasToTempFilePath 里的 toDataURL 永远抛错 ⇒ 这一档导出必失败；
			// ② 画布内部那套预加载只挂 onload、没有 onerror，地址取不到就没有回音 ⇒ ctx.draw 的回调永远不来。
			// 两者在 H5 上的症状都是「保存海报生成失败，请重试」（那一句来自壳里 exportPoster 收到空地址）。
			// 换好的地址按原地址记在 imgDraw（普通实例字段、不进 data：key 是地址，走 mpKey 那一族，见 M27），
			// 换样式档时同一张图不必再换一次，壳里那只 RENDER_TIMEOUT 兜底表也就够用。
			const paint = () => {
				const ctx = uni.createCanvasContext(this.canvasId, this);
				this.paintPoster(ctx, keep);
				// 右下角那张码两档都要，位置各档自己给
				ctx.draw(true, () => {
					uni.canvasToTempFilePath({
						canvasId: self.canvasId,
						success: (res) => finish(res && res.tempFilePath),
						fail: retryOrTell,
					}, self);
				});
			};
			const todo = this.pendingDrawSrc(keep);
			if (!todo.length) {
				paint();
				return;
			}
			resolvePosterImages(todo)
				.then((map) => {
					if (this.gone()) return false;
					if (!this.imgDraw) this.imgDraw = {};
					Object.assign(this.imgDraw, map);
					// 码该画而换不到本机地址：这一档不许就这么导出（与 2d 那条链同一口径）
					if (this.codeSrc && !this.drawSrc(this.codeSrc)) throw new Error('poster-code-image-missing');
					return true;
				})
				.then((ok) => {
					if (ok) paint();
				})
				.catch((e) => {
					console.warn('[tz-share-poster-body] 这一档没画成，按降档重画：', (e && e.message) || e);
					retryOrTell();
				});
			// #endif
		},
		// #ifdef MP-WEIXIN
		/**
		 * 微信端那一版出图：2d 画布节点 → 先把图加载成图片对象 → 画同一份排版 → 导出
		 *
		 * 与旧接口那条链的三点差别都在 common/utils/canvas-2d.js 里抹平了（方法名、drawImage 只吃
		 * createImage() 的对象、画布像素要按 dpr 放大）。取不到节点、图加载不来、导出失败
		 * 都退回同一份 retryOrTell（按 degradeChain 降档，最后 done('') 让壳撤遮罩露排版，M13）。
		 * @param {Function} keep 这一档这一层画不画（degradeChain 的判据，与旧版那一条同一份）
		 * @param {Function} finish 出图成功收尾（内部已判 settled 与 gone()）
		 * @param {Function} retryOrTell 出图失败收尾：降一档重画，没得降就回空
		 */
		drawPoster2d(keep, finish, retryOrTell) {
			const self = this;
			get2dCanvas(this, this.canvasId, POSTER_W, POSTER_H).then((c) => {
				const srcs = [];
				if (keep('avatar') && self.avatarSrc && self.avatarLoaded === self.avatarSrc) srcs.push(self.avatarSrc);
				if (keep('bg') && self.activeImage) srcs.push(self.activeImage);
				if (keep('cover') && self.coverSrc) srcs.push(self.coverSrc);
				const alts = {};
				if (self.codeSrc) {
					srcs.push(self.codeSrc);
					// 主地址（小程序端是写盘下来的本地文件路径）造不出画布图片对象时换它：
					// 备选是接口原样的 base64，两枚在 <image> 与 canvas.createImage 两处的可加载性不等价
					if (self.codeAltSrc) alts[self.codeSrc] = [self.codeAltSrc];
				}
				return load2dImages(c.canvas, srcs, alts).then((images) => {
					// 码该画而没到手：这一次不许就这么导出——缺码的那张图会盖住底下有码的排版，
					// 用户看到的就是「二维码后端已经生成好了，海报里却不显示」（2026-09-28 用户点名）。
					// 判据只给码这一层：海报没有码就是一张扫不进任何页面的图（与壳里 failCode 同一口径），
					// 底图/封面/头像缺了还能退档（degradeChain 那几层是装饰，少一层仍是可用的海报）。
					if (self.codeSrc && !images[self.codeSrc]) {
						throw new Error('poster-code-image-missing:' + self.codeSrc.slice(0, 24));
					}
					return { c: c, images: images };
				});
			}).then((r) => {
				self.paintPoster(wrap2d(r.c.ctx, r.c.canvas, r.images), keep);
				return export2d(r.c.canvas, self);
			}).then((src) => finish(src)).catch((e) => {
				console.warn('[tz-share-poster-body] 2d 出图这一档没成，按降档重画：', (e && e.message) || e);
				retryOrTell();
			});
		},
		// #endif
		/**
		 * 把这一张海报画到给定上下文上：两端（旧版 CanvasContext 与 2d）共用这一份绘制代码
		 *
		 * ⚠ 下面的数值是本文件样式块那一版排版的镜像（几何 + 字号 + 字重；画布 300×400 = .sp-poster 的宽高，
		 * daily：日期角标 top 18 / 金句首行 130 / 累计打卡 246 / 用户区 FOOT；content：整列的顶边与
		 * 高度全取 contentColumn，即预览 :style 读的那一份），改视觉只改一处会让「预览的图」和「存下来的图」长得不一样。
		 * 字重这一项每一行都要走 setFont(ctx, 字号, bold)：只给字号时画布那一份永远是常规体，
		 * 预览里 bold 的那几行会在画布图盖上来那一刻细一档（2026-09-27 用户点名「切换预览选项时昵称先变粗再变细」）。
		 * @param {Object} ctx  旧版上下文或 wrap2d 包出来的那一份
		 * @param {Function} keep 这一档这一层画不画
		 */
		paintPoster(ctx, keep) {
			const w = POSTER_W;
			const h = POSTER_H;
			// 底：当前这一档弥散渐变（与预览、色板同一张表算出来）
			drawTheme(ctx, this.activeTheme, w, h);
			// 底图：按 aspectFill 的算法居中裁切（等比放大到盖满 300×400，多出来的两边均分切掉），
			// 原始宽高还没到手（图没 load 完就点了保存）时整张铺满——建议尺寸本就是 3:4，几乎无差
			if (keep('bg') && this.activeImage) {
				// 尺寸表按原始地址取（换过的地址只喂 drawImage），换不到可绘地址就这一层不画
				const bgSrc = this.drawSrc(this.activeImage);
				const size = this.bgSizes[mpKey(this.activeImage)];
				if (!bgSrc) {
					console.warn('[tz-share-poster-body] 底图没换到本机地址，这一层不画');
				} else if (size && size.w && size.h) {
					const k = Math.max(w / size.w, h / size.h);
					const dw = size.w * k;
					const dh = size.h * k;
					ctx.drawImage(bgSrc, (w - dw) / 2, (h - dh) / 2, dw, dh);
				} else {
					ctx.drawImage(bgSrc, 0, 0, w, h);
				}
			}
			if (this.layout === 'daily') this.drawDaily(ctx, w, h, keep);
			else this.drawContent(ctx, w, h, keep);
		},
		/** daily 档画布：每一块的左边/顶边都读 this.daily（预览那些 :style 用的同一个对象），两处不许各算一遍 */
		drawDaily(ctx, w, h, keep) {
			const d = this.daily;
			const x = d.x;
			const footTop = h - FOOT;
			// 左列三行（头像行 26 + 打卡名称 16 + 识别说明 12，含 6/4 行距）= 64；没有码时第三行不出 = 48
			const userH = this.codeSrc ? 64 : 48;
			const userTop = footTop + (FOOT - userH) / 2;
			// 右上角日期角标：盒子与三行全部由 daily 那一份算出来（宽 = 最宽一行实测墨迹 + 左右内衬各一档，
			// 高 = 三行行高 + 上下内衬各一档）。水平按 textWidth 取中，基线 = 行顶 + 行高/2 + 字号×0.36
			// （与 drawContent 同一推法）。
			// 2026-09-26 用户点名「日期背景现在是一个方形的、没有圆角」——预览那一版一直是 4px，
			// 漏的是这一份画布：它用的还是 fillRect，圆角要自己拼路径（H5 画布没有 drawRoundedRect）
			ctx.setFillStyle('rgba(255,255,255,0.16)');
			roundRect(ctx, w - x - d.badgeW, PAD, d.badgeW, d.badgeH, DATE_R);
			ctx.fill();
			ctx.setFillStyle('#ffffff');
			const dateLines = [this.nowTime, this.nowMD, this.nowW];
			let dateLineTop = PAD + DATE_PAD_Y;
			dateLines.forEach((txt, i) => {
				const fs = DATE_LINES[i][0];
				setFont(ctx, fs, DATE_LINES[i][2]);
				ctx.fillText(txt, w - x - d.badgeW + (d.badgeW - textWidth(txt, fs)) / 2, dateLineTop + DATE_LINES[i][1] / 2 + fs * 0.36);
				dateLineTop += DATE_LINES[i][1];
			});
			// 引号：落在金句首字的左上角（x 比正文左内衬再往左一档），不再与首字同一头对齐成「压在文字上」
			setFont(ctx, MARK_SIZE, false);
			ctx.setFillStyle('rgba(255,255,255,0.35)');
			ctx.fillText('“', MARK_X, MARK_TOP + MARK_BASELINE);
			// 金句：折几行由 daily 那一份 wrapText 决定（预览把同一个数组一行一个 <text> 排出来），
			// 基线 = 行顶 + 行高/2 + 字号×0.36，与角标 / 出处同一推法；
			// 上一版这里按「一行 15 字」自己切、预览交给 -webkit-line-clamp，两份只要字号或内衬一动就会分叉
			setFont(ctx, QUOTE_SIZE, false);
			ctx.setFillStyle('#ffffff');
			d.lines.forEach((l, idx) => ctx.fillText(l, x, QUOTE_TOP + idx * QUOTE_LINE + QUOTE_LINE / 2 + QUOTE_SIZE * 0.36));
			// 出处跟着实际行数走，并与预览同一侧对齐（预览 text-align: right → 画布收到右内衬那一头）；
			// 出处为空时这一行两份都不画（与模板上那句 v-if 同一判据，画布不会自己留出预览上没有的一行）
			if (this.quoteFrom) {
				setFont(ctx, FROM_SIZE, false);
				const fromText = '—— ' + this.quoteFrom;
				const fromTop = QUOTE_TOP + d.lines.length * QUOTE_LINE + QUOTE_FROM_GAP;
				ctx.fillText(fromText, Math.max(x, w - x - textWidth(fromText, FROM_SIZE)), fromTop + FROM_LINE / 2 + FROM_SIZE * 0.36);
			}
			setFont(ctx, 13, false);
			ctx.fillText('累计打卡', x, COUNT_TOP + 22);
			// 天数与 .sp-count-num 同一档 bold
			setFont(ctx, 34, true);
			ctx.fillText(String(this.totalDays), x, COUNT_TOP + 58);
			setFont(ctx, 12, false);
			ctx.fillText('天', x + String(this.totalDays).length * 20 + 6, COUNT_TOP + 58);
			// 白底用户区（预览里这一块是直角：圆角会漏出底下的渐变，看着像样式错乱）
			ctx.setFillStyle('#ffffff');
			ctx.fillRect(0, footTop, w, FOOT);
			ctx.save();
			ctx.beginPath();
			ctx.arc(x + AVA / 2, userTop + AVA / 2, AVA / 2, 0, Math.PI * 2, true);
			ctx.clip();
			ctx.setFillStyle('#f2f3f5');
			ctx.fillRect(x, userTop, AVA, AVA);
			// 只画预览里已经 load 成功过的那张地址（见 data.avatarLoaded 与 drawPoster 的退档注释），
			// 并按 aspectFill 那一刀居中裁（与预览 <image mode="aspectFill"> 同一结果，见 aspectFill）
			if (keep('avatar') && this.avatarSrc && this.avatarLoaded === this.avatarSrc) {
				const f = aspectFill(this.avatarSizes[mpKey(this.avatarSrc)], AVA);
				const avaSrc = this.drawSrc(this.avatarSrc);
				// 换不到可绘地址就留那一块底色（宁可少一枚头像，不让整张海报在这一档失败）
				if (avaSrc) ctx.drawImage(avaSrc, x + f.x, userTop + f.y, f.w, f.h);
			}
			ctx.restore();
			ctx.setFillStyle('#1d2129');
			// 昵称与 .sp-nickname 同一档 bold（13）
			setFont(ctx, 13, true);
			ctx.fillText(fitText(this.nickname, 13, d.userW - AVA - 8), x + AVA + 8, userTop + 18);
			ctx.setFillStyle('#86909c');
			setFont(ctx, 12, false);
			ctx.fillText(fitText(this.name, 12, d.userW), x, userTop + 44);
			if (this.codeSrc) {
				ctx.setFillStyle('#c9cdd4');
				setFont(ctx, 10, false);
				ctx.fillText(this.codeCaption, x, userTop + 61);
				// 码换不到可绘地址说明这张海报不能认：这一档由 drawPoster 那句守卫收口（不画一张没码的出去）
				const codeImg = this.drawSrc(this.codeSrc);
				if (codeImg) ctx.drawImage(codeImg, w - x - CODE, footTop + (FOOT - CODE) / 2, CODE, CODE);
			}
		},
		/**
		 * content 档画布：邀请头 + 白底内容卡（封面 / 标题）+ 居中的码
		 *
		 * 每一块的顶边与高度都取自 contentColumn（预览的 :style 读同一个对象），行内基线按
		 * 「块顶 + 行高/2 + 字号×0.36」推——改任何一行的高度、行距、字号只改那一处常量，两份一起动。
		 */
		drawContent(ctx, w, h, keep) {
			const col = this.contentColumn;
			// 邀请头：头像 40 圆（在 44 高那一行里垂直居中，比行顶低 2）+ 右边两行（昵称 15 加粗、邀请语 12），
			// 基线 = 行顶 +17 / +39
			// 头像顶边此前钉在行顶，与预览差的那 2px 在换帧那一刻就是「头像又跳一下」
			const avaTop = col.headTop + (HEAD_H - HEAD_AVATAR) / 2;
			if (keep('avatar')) {
				ctx.save();
				ctx.beginPath();
				ctx.arc(PAD + HEAD_AVATAR / 2, avaTop + HEAD_AVATAR / 2, HEAD_AVATAR / 2, 0, Math.PI * 2, true);
				ctx.clip();
				ctx.setFillStyle('rgba(255,255,255,0.2)');
				ctx.fillRect(PAD, avaTop, HEAD_AVATAR, HEAD_AVATAR);
				if (this.avatarSrc && this.avatarLoaded === this.avatarSrc) {
					const f = aspectFill(this.avatarSizes[mpKey(this.avatarSrc)], HEAD_AVATAR);
					const avaSrc = this.drawSrc(this.avatarSrc);
					if (avaSrc) ctx.drawImage(avaSrc, PAD + f.x, avaTop + f.y, f.w, f.h);
				}
				ctx.restore();
			}
			ctx.setFillStyle('#ffffff');
			// 昵称与 .sp-head-name 同一档 bold（15）
			setFont(ctx, 15, true);
			ctx.fillText(fitText(this.nickname, 15, w - PAD * 2 - HEAD_AVATAR - 10), PAD + HEAD_AVATAR + 10, col.headTop + 17);
			setFont(ctx, 12, false);
			ctx.setFillStyle('rgba(255,255,255,0.85)');
			ctx.fillText(this.inviteText, PAD + HEAD_AVATAR + 10, col.headTop + 39);
			// 内容卡（圆角 + 磨砂白底，封面在上、标题在下）：与预览 .sp-card 同一个 contentColumn
			if (this.hasCard) {
				// 圆角要自己拼路径（H5 画布没有 drawRoundedRect），底色用半透明白——
				// 小程序不认 backdrop-filter，这一档磨砂只能靠透明度透出底下那层渐变
				ctx.setFillStyle(CARD_BG);
				roundRect(ctx, PAD, col.cardTop, w - PAD * 2, col.cardH, CARD_R);
				ctx.fill();
				if (keep('cover') && this.coverSrc) {
					const cx = PAD + GAP;
					const cy = col.coverTop;
					// 尺寸按「此刻摆着的那一枚」取（内容封面或系统 logo，见 coverSrc），
					// 不按 poster.cover 取：退到 logo 那一档时拿着的是内容封面的宽高
					const size = this.coverSizes[mpKey(this.coverSrc)];
					// 封面换不到可绘地址就只留那块圆角底（少画一层照样导出成功，见 pendingDrawSrc）
					const coverSrc = this.drawSrc(this.coverSrc);
					if (coverSrc) {
						ctx.save();
						roundRect(ctx, cx, cy, COVER_W, COVER_H, COVER_R);
						ctx.clip();
						if (size && size.w && size.h) {
							// 与预览 mode="aspectFill" 同一刀：等比放大到盖满画框，多出来的两边均分切掉
							const k = Math.max(COVER_W / size.w, COVER_H / size.h);
							const dw = size.w * k;
							const dh = size.h * k;
							ctx.drawImage(coverSrc, cx + (COVER_W - dw) / 2, cy + (COVER_H - dh) / 2, dw, dh);
						} else {
							ctx.drawImage(coverSrc, cx, cy, COVER_W, COVER_H);
						}
						ctx.restore();
					}
				}
				ctx.setFillStyle('#1d2129');
				// 标题与 .sp-name 同一档 bold
				setFont(ctx, NAME_SIZE, true);
				// 逐行画 nameLines：预览那一份就是把这一个数组一行一个 <text> 排出来的，两份必然同字同位
				this.nameLines.forEach((l, idx) => ctx.fillText(l, PAD + GAP, col.nameTop + idx * NAME_LINE + 14));
			}
			// 码 + 说明：整块水平居中，位置由那一列的算式给（还在取的时候这块空着，遮罩在根节点那一层）
			if (this.codeSrc) {
				// 码换不到可绘地址说明这张海报不能认：这一档由 drawPoster 那句守卫收口（不画一张没码的出去）
				const codeImg = this.drawSrc(this.codeSrc);
				if (codeImg) {
					ctx.drawImage(codeImg, (w - QR) / 2, col.qrTop, QR, QR);
					ctx.setFillStyle('#ffffff');
					setFont(ctx, 12, false);
					// 预览里说明那一行顶边 = 码底 + QR_TIP_GAP（.sp-qr-tip 的 top 同一档），12px 字的基线再往下 12
					const tipText = this.codeCaption;
					ctx.fillText(tipText, (w - textWidth(tipText, 12)) / 2, col.tipTop + 12);
				}
			}
		},
	},
};
</script>

<style scoped>
/* 弹层舞台里的那一个 flex item：海报本体在它里面，屏幕外那张画布是同级（见模板尾部注释） */
.sp {
	flex-shrink: 0;
}
/* 海报 = 一张 3:4 的图卡：圆角走 §1 封面/缩略图档（8px）+ overflow 收口，
   图内贴底那块白色信息卡保持直角（再写圆角就从圆角外漏出它下面那层底图，看着像图裂了一角） */
.sp-poster {
	position: relative;
	flex-shrink: 0;
	width: 300px;
	height: 400px;
	border-radius: 8px;
	overflow: hidden;
	transform-origin: top center;
}
.sp-bg {
	position: absolute;
	left: 0;
	top: 0;
	width: 300px;
	height: 400px;
}
/* 渲染出来的那一张海报图：与海报本体同一格（画布恒 300×400，scaleToFill 就是 1:1 不拉伸），
   盖在那版排版之上；DOM 那一版继续留在底下给 @load 记头像/底图的尺寸，也保证画布没出来时不空白 */
.sp-rendered {
	position: absolute;
	left: 0;
	top: 0;
	width: 300px;
	height: 400px;
}
/* 内容层单独一层：绝对定位铺满，压在底图之上（底图若是同级兄弟节点，绝对定位会盖住非定位的文字）。
   这一层的内衬只给 content 档那一版用（它的每一块自己写 left:18，与 PAD 同一档）；
   daily 档的每一块一律走 :style 绑 daily 那一份数值（左右 27 那一档），不再借这里的 padding */
.sp-layer {
	position: absolute;
	left: 0;
	top: 0;
	width: 300px;
	height: 400px;
	padding: 18px;
	box-sizing: border-box;
}
/* —— daily 档（打卡日签图）——
   下面每一块的位置与尺寸都不写在 CSS 里了：由模板上绑的 daily 那一份给，画布 drawDaily 读同一份
   （2026-09-26 用户点名「右侧的间距比左侧小」「引号压在文字上方」「日期背景是方的」三条都出在
   这两份各写一遍：预览 left:18、画布 fillText x=24/22） */
/* 日期角标：上下内衬 8、左右内衬 13（各自翻倍），三行的行高写死（16/28/15）与 DATE_LINES 逐值镜像，
   宽由「最宽一行 + 左右内衬」现算 —— 原先是写死 68 + 只有上下内衬，用户读出来就是「底部边距与上方不同」 */
.sp-datebox {
	position: absolute;
	background: rgba(255, 255, 255, 0.16);
	border-radius: 4px;
	text-align: center;
	padding: 8px 0;
}
.sp-time { display: block; font-size: 12px; line-height: 16px; color: #fff; }
.sp-date { display: block; font-size: 22px; line-height: 28px; color: #fff; font-weight: bold; }
.sp-week { display: block; font-size: 11px; line-height: 15px; color: #fff; }
.sp-quote-mark {
	position: absolute;
	color: rgba(255, 255, 255, 0.35);
}
/* 金句：一行 16px × 15 字 = 240 ≤ 可用宽 246（左右各收到 27 之后剩下的那一档），
   两行 = 30 字，与后台 Quote::CONTENT_MAX 那根上限逐字对得上（字号一动这一档就要重算） */
.sp-quote {
	position: absolute;
	color: #fff;
}
/* 一行一个块：折行由 wrapText 算，行高继承容器那一档 26，与画布的「行顶 + 行高/2 + 字号×0.36」同一盒 */
.sp-quote-line {
	display: block;
	overflow: hidden;
	white-space: nowrap;
}
.sp-quote-from {
	position: absolute;
	text-align: right;
	font-size: 12px;
	color: #fff;
}
/* 换一条 / 复制金句：同一行、同一档尺寸（一个容器 + 共用一枚 chip 类，字号/内衬/圆角只存这一处） */
.sp-acts {
	position: absolute;
	display: flex;
	align-items: center;
}
.sp-act {
	background: rgba(0, 0, 0, 0.18);
	border-radius: 4px;
	padding: 3px 8px;
	display: flex;
	align-items: center;
}
.sp-act + .sp-act {
	margin-left: 6px;
}
.sp-act-text {
	font-size: 12px;
	line-height: 16px;
	color: #fff;
	margin-left: 4px;
}
/* 与文字配对的行内图标光学垂直居中（uview file-text 实测墨迹中心在其行盒中心，12px 中文低约 0.44px ⇒ 补 0.5px） */
.sp-ic-mid {
	transform: translateY(0.5px);
}
.sp-count {
	position: absolute;
	display: flex;
	align-items: baseline;
}
.sp-count-label { font-size: 13px; color: #fff; }
.sp-count-num { font-size: 34px; color: #fff; font-weight: bold; margin: 0 4px; }
.sp-count-unit { font-size: 12px; color: #fff; }
/* 白底用户区：左三行（头像+昵称 / 打卡名称 / 长按识别说明），右下角是那张码。
   80 高 = 三行的 64 + 上下各 8，与画布那一份的 FOOT/userTop 同一组数值；
   左右内衬由 :style 绑 daily.foot（与金句那几块同一档 27），不在这儿写死 */
.sp-foot {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fff;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
	border-radius: 0;
}
/* 左列定宽由 daily.userW 给（码到手与没到手两态下昵称与活动名的可占宽度都一样，
   码 load 回来那一刻不会把字挤走） */
.sp-user {
	display: flex;
	flex-direction: column;
}
.sp-id {
	display: flex;
	align-items: center;
	height: 26px;
}
.sp-avatar {
	width: 26px;
	height: 26px;
	border-radius: 50%;
	background: #f2f3f5;
	margin-right: 8px;
	flex-shrink: 0;
}
.sp-nickname {
	font-size: 13px;
	line-height: 18px;
	color: #1d2129;
	font-weight: bold;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.sp-activity {
	font-size: 12px;
	line-height: 16px;
	color: #86909c;
	margin-top: 6px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.sp-code-tip {
	font-size: 10px;
	line-height: 12px;
	color: #c9cdd4;
	margin-top: 4px;
}
/* 码：64×64 落在右下角，白底上不需要描边（小程序码本身是圆的，四周本就留白） */
.sp-code {
	width: 64px;
	height: 64px;
	flex-shrink: 0;
}
/* —— content 档（内容分享海报：邀请头 + 内容卡 + 码），顶边与高度全由 contentColumn 给，
   CSS 里只留不随内容变的几何（宽、内衬、圆角、字号行高）—— */
.sp-head {
	position: absolute;
	left: 18px;
	display: flex;
	align-items: center;
}
.sp-head-avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	margin-right: 10px;
	flex-shrink: 0;
}
.sp-head-text {
	display: flex;
	flex-direction: column;
}
.sp-head-name {
	font-size: 15px;
	line-height: 22px;
	color: #fff;
	font-weight: bold;
	max-width: 200px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.sp-head-invite {
	font-size: 12px;
	line-height: 18px;
	color: rgba(255, 255, 255, 0.85);
	margin-top: 4px;
}
/* 内容卡：圆角 8 + 半透明白（磨砂），竖排——封面在上、标题在下。
   顶边与高度由 contentColumn 现算（内衬 12 一档、标题几行就占几行），卡里因此不会剩下某一头的空档
   （2026-09-26 用户两轮点名：先「卡里下方空着一截、四周不均」，再「内容区域上下间距不一致」——
   上一版把两行的位置预留死了，一行标题的内容下面因此白摊着 19px） */
.sp-card {
	position: absolute;
	left: 18px;
	width: 264px;
	background: rgba(255, 255, 255, 0.86);
	border-radius: 8px;
	padding: 12px;
	box-sizing: border-box;
}
/* 封面与卡之间再收一档圆角（6 < 卡的 8），内外两层圆角才不像贴上去的 */
.sp-cover {
	width: 240px;
	height: 124px;
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.5);
	display: block;
}
/* 标题：行高 19 与 contentColumn 里的 NAME_LINE 同一档，几行就是几个 19 */
.sp-name {
	font-size: 13px;
	line-height: 19px;
	color: #1d2129;
	font-weight: bold;
}
/* 紧跟在封面下面才有这一档间距（没有封面时它就是卡里的第一块，靠卡的内衬就够） */
.sp-name--under {
	margin-top: 12px;
}
/* 一行一个 <text>：那一行由 nameLines 那一份算好（含截断与省略号），画布画的是同一个数组，
   所以这里不再要 -webkit-line-clamp（那一版只有浏览器知道折了几行，两份就会分叉）。
   text-overflow 只是宽度估算偏小时的兜底，与 .sp-nickname / .sp-activity 同一档写法 */
.sp-name-line {
	display: block;
	height: 19px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
/* 素材加载遮罩：盖满海报的一块（2026-09-26 用户口径「骨架屏太丑，给整个图片区域加半透明遮罩，
   圆角与图片一致」）。黑底浅透明——磨砂只能靠透明度（背景滤镜小程序静默失效，§4）；
   内容居中：旋转圆环 + 白字「加载中…」，科技风的一道浅白扫描光带自上而下反复扫过。
   挂在海报根节点、不进画布，所以存下来与分享出去的那张图上不会带上这层黑 */
.sp-shade {
	position: absolute;
	left: 0;
	top: 0;
	width: 300px;
	height: 400px;
	border-radius: 8px;
	background: rgba(0, 0, 0, 0.55);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.sp-shade-scan {
	position: absolute;
	left: 0;
	top: 0;
	width: 300px;
	height: 88px;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.09) 55%, rgba(255, 255, 255, 0) 100%);
	animation: sp-shade-scan 2.6s linear infinite;
}
.sp-shade-ring {
	width: 30px;
	height: 30px;
	border-radius: 50%;
	border: 2px solid rgba(255, 255, 255, 0.22);
	border-top-color: rgba(255, 255, 255, 0.92);
	animation: sp-shade-spin 0.9s linear infinite;
}
.sp-shade-text {
	display: flex;
	align-items: center;
	margin-top: 14px;
}
.sp-shade-t {
	font-size: 13px;
	line-height: 18px;
	color: rgba(255, 255, 255, 0.9);
	letter-spacing: 2px;
}
.sp-shade-dot {
	font-size: 13px;
	line-height: 18px;
	color: rgba(255, 255, 255, 0.9);
	animation: sp-shade-blink 1.2s ease infinite;
}
.sp-shade-dot2 { animation-delay: 0.2s; }
.sp-shade-dot3 { animation-delay: 0.4s; }
@keyframes sp-shade-scan {
	from { transform: translateY(-88px); }
	to { transform: translateY(400px); }
}
@keyframes sp-shade-spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}
@keyframes sp-shade-blink {
	0% { opacity: 0.15; }
	50% { opacity: 1; }
	100% { opacity: 0.15; }
}
/* 码：整块水平居中，贴在内容卡下面（顶边由那一列的算式给） */
.sp-codebox {
	position: absolute;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
}
.sp-qr {
	width: 84px;
	height: 84px;
	flex-shrink: 0;
}
.sp-qr-tip {
	position: absolute;
	left: 0;
	right: 0;
	text-align: center;
	font-size: 12px;
	line-height: 16px;
	color: #fff;
}
/* 画布恒为 300×400：预览在短屏上整体缩放，存下来与分享出去的图不跟着分档 */
.sp-canvas {
	width: 300px;
	height: 400px;
	position: fixed;
	left: -9999px;
	top: 0;
}
</style>
