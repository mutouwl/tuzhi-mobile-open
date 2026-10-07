<template>
	<view>
		<u-popup mode="bottom" bgColor="transparent" :round="12" :safeAreaInsetBottom="false" :show="show"
			:closeOnClickOverlay="true" @close="close">
			<view class="certv-wrap">
				<view class="certv-stage" :style="{ height: stageHeight + 'px' }" @tap="close">
					<!-- 框的尺寸只按视口算（比例是后端画布的常数），加载态换不换都不重算这一格 -->
					<view class="certv-frame" :style="{ width: previewWidth + 'px', height: previewHeight + 'px' }">
						<image v-if="renderedSrc" class="certv-img" :src="renderedSrc" mode="aspectFit"
							:style="{ width: previewWidth + 'px', height: previewHeight + 'px' }" @tap.stop="enlarge"></image>
						<!-- 失败要说清一句并给出下一步，不能留一块什么都没有的白（M13） -->
						<view class="certv-failed" v-else-if="renderFailed" @tap.stop>
							<text class="certv-failed-text">证书图片生成失败，请重试</text>
							<tz-button type="primary" size="small" text="重新生成" @click="retry"></tz-button>
						</view>
						<!-- 海报本体的加载态＝盖满这一格的黑底浅透明遮罩，不用区域骨架（M18⑨g，
						     与 tz-share-poster-body 的 .sp-shade 同一档；这层只在预览上，不进画布） -->
						<view class="certv-shade" v-else>
							<view class="certv-shade-scan"></view>
							<view class="certv-shade-ring"></view>
							<view class="certv-shade-text">
								<text class="certv-shade-t">加载中</text>
								<text class="certv-shade-dot">.</text>
								<text class="certv-shade-dot certv-shade-dot2">.</text>
								<text class="certv-shade-dot certv-shade-dot3">.</text>
							</view>
						</view>
					</view>
				</view>
				<view class="certv-panel">
					<view class="certv-btns">
						<view class="certv-btn-item">
							<tz-button type="primary" size="normal" long :disabled="!renderedSrc" text="保存"
								@click="save"></tz-button>
						</view>
						<view class="certv-btn-item">
							<tz-button size="normal" long :disabled="!renderedSrc" text="分享" @click="share"></tz-button>
						</view>
					</view>
				</view>
			</view>
		</u-popup>

		<!-- 画布放弹层之外、屏外：760×1360 与后端画布同尺寸，导出即同分辨率
		     （position:fixed 屏外与 tz-share-poster-body 的 .sp-canvas 同一款，小程序端同用） -->
		<canvas :canvas-id="canvasId" :id="canvasId" class="certv-canvas"
			:style="{ width: canvasW + 'px', height: canvasH + 'px' }"></canvas>
	</view>
</template>

<script>
/**
 * 证书查看弹层（图卡弹层档，参照 tz-share-poster 的弹层架构与端路）
 *
 * 出图与旧海报不同：后端 cert/layout 把「画什么、画在哪、多大、什么颜色、怎么对齐」算成元素清单下发，
 * 本组件按 common/utils/cert-poster.js 映射成画布指令，不自己排版——
 * 与后端 PNG 消费同一份清单，比对脚本 scripts/check-cert-render.js。
 * 渲染/导出/降档走公共类 common/utils/poster-render.js 的 PosterCanvas，
 * 保存/分享端路走 common/utils/poster-save.js（与日签图/全局分享同一份），本组件不再各抄一段。
 */
import { drawCert, collectImageSrcs } from '@/common/utils/cert-poster.js';
import { previewSavablePoster, savePosterToAlbum, sharePosterToMenu, hintTopRight, toSavableSrc } from '@/common/utils/poster-save.js';
import { PosterCanvas, nextCanvasId, resolvePosterImages, releasePosterImages } from '@/common/utils/poster-render.js';
import { textWidth } from '@/common/utils/poster-theme.js';

// 后端 CertLayout::WIDTH/HEIGHT 的同值常数：预览框的比例钉在这里，
// 不能读 layout.width/height——那一格在清单到手前也要有尺寸，读它会让框在出图前后跳一下
// （2026-09-27 用户点名「一开始加载区域比较小，后面图片出来就变大了」）
const CERT_W = 760;
const CERT_H = 1360;
// 预览那一格再缩 1/5（2026-09-27 用户口径「把空间让出来给下方按钮条」）：
// 弹层里可摆的高度本来就紧，图占满时按钮那条会被挤到贴屏边
const CERT_SHRINK = 4 / 5;

export default {
	props: {
		show: { type: Boolean, default: false },
		// 元素清单还在接口路上（清单到手前弹层就已经开着，等的那一段由海报本体那层遮罩顶着，
		// 调用点的触发按钮不再自己挂 loading —— M18⑨g）
		pending: { type: Boolean, default: false },
		// 后端 cert/layout 的返回：{ width, height, elements }
		layout: { type: Object, default: () => ({}) },
		subject: { type: String, default: '证书' },
	},
	data() {
		return {
			canvasId: nextCanvasId('certv'),
			renderedSrc: '',
			rendering: false,
			renderFailed: false,
			// 每次出图换一个 seq：连开两张证书时只认最后一次的结果，别让旧的那一张盖回来
			renderSeq: 0,
			// 图片地址 → 可绘地址（小程序端 base64 落临时文件、网络图走 getImageInfo 本地路径，
			// H5 换成同源 blob 地址：跨域直画会把画布污染掉，toDataURL 从此永久抛错且洗不回来）
			imageMap: {},
			viewportH: 800,
			viewportW: 375,
		};
	},
	computed: {
		inWechat() {
			return !!(this.$wxsdk && this.$wxsdk.isWechat());
		},
		canvasW() {
			return Number(this.layout.width) || CERT_W;
		},
		canvasH() {
			return Number(this.layout.height) || CERT_H;
		},
		// 底部面板高（按钮行 + 安全区），与 tz-share-poster 的 SHEET_H 同口径估算
		panelHeight() {
			// #ifdef H5
			return 120;
			// #endif
			// #ifndef H5
			return 140;
			// #endif
		},
		// 预览宽：按「面板顶到页面顶」的可用高反推，最宽收到视口留边那一档
		previewWidth() {
			const availH = this.viewportH - this.panelHeight - 24;
			const byHeight = availH * (CERT_W / CERT_H);
			// 整格再缩 1/5：弹层里可摆的高度本来就紧，图占满时下面那条按钮会被挤到贴屏边
			return Math.round(Math.max(140, Math.min(byHeight, this.viewportW - 24)) * CERT_SHRINK);
		},
		previewHeight() {
			return Math.round(this.previewWidth * (CERT_H / CERT_W));
		},
		/**
		 * 舞台高＝「面板顶到页面顶」那一段，海报在这一段里垂直居中（M18⑨c，与 tz-share-poster 同一档；
		 * 2026-09-27 用户口径「证书要放在页面中间，也就是 certv-panel 顶部与页面顶部的中间」——
		 * 原先按 previewHeight + 24 给，海报就贴着面板顶往上排，空出来的一段全堆在页面上方）；
		 * 视口比海报还矮时按海报本身收着给，不留一段没人认领的假空、也不把面板顶出屏
		 */
		stageHeight() {
			const need = this.previewHeight + 24;
			if (!this.viewportH) return need;
			const avail = this.viewportH - this.panelHeight;
			return avail > need ? avail : need;
		},
		/**
		 * 交给出图链的那一份清单：只有「弹层开着 + 清单已到手」才给，其余时刻是 null（＝还在取，或已经关掉）。
		 * show / pending / layout 三个来源收在这一个 computed 上，watcher 因此一帧只回调一次 prepare——
		 * 挂两个 watcher 时开弹层那一帧会连跑两遍，第二遍把上一批 blob 地址回收掉，而那一批正被第一遍的画布用着
		 */
		activeLayout() {
			return this.show && !this.pending ? this.layout : null;
		},
	},
	watch: {
		activeLayout() {
			this.prepare();
		},
	},
	created() {
		try {
			const info = uni.getSystemInfoSync();
			this.viewportH = info.windowHeight || 800;
			this.viewportW = info.windowWidth || 375;
		} catch (e) { }
	},
	beforeDestroy() {
		releasePosterImages(this.imageMap);
	},
	methods: {
		close() {
			this.$emit('close');
		},
		// 重新生成：先放开上一次留下的闸门。出图是一条串行走私（渲染中直接 return），
		// 那次卡住过就永远进不来，用户症状是「点了重新生成没反应」
		retry() {
			this.renderFailed = false;
			this.renderedSrc = '';
			this.rendering = false;
			this.prepare();
		},
		prepare() {
			this.renderedSrc = '';
			this.renderFailed = false;
			this.rendering = false;
			// 清单还在接口路上（或弹层已关）：这一格由海报本体那层遮罩顶着，不判失败（M18⑨g）
			const layout = this.activeLayout;
			if (!layout) return;
			if (!Array.isArray(layout.elements) || !layout.elements.length) {
				this.renderFailed = true;
				return;
			}
			// 小程序端 base64 落临时文件、网络图换本地路径（画布只认本地路径）；
			// H5 端把跨域图取成 blob 同源地址（见 poster-render 的注释），取不到的地址按空处理，画的时候丢那张图
			const prev = this.imageMap;
			resolvePosterImages(collectImageSrcs(layout.elements)).then((map) => {
				this.imageMap = map;
				releasePosterImages(prev);
				this.render();
			});
		},
		// 降档判据：level 1 丢背景图（最大的那张）、level 2 丢全部远程图（data: 的码与文字永保），
		// 导出失败多半是外域图把画布污染了，只丢可疑的图重画，文字不能丢
		remoteSrcDropped(src, level) {
			if (!src || !/^http/i.test(src)) return false;
			if (level >= 2) return true;
			if (level >= 1) {
				const bg = (this.layout.elements || []).find((el) => el.t === 'bg');
				return !!bg && bg.src === src;
			}
			return false;
		},
		render() {
			if (this.rendering) return;
			this.rendering = true;
			const seq = ++this.renderSeq;

			const canvas = new PosterCanvas({
				canvasId: this.canvasId,
				scope: this,
				width: this.canvasW,
				height: this.canvasH,
			});
			canvas.renderWithDegrade({
				paint: (lv, ctx) => {
					// 地址解析失败的图直接丢（画布上画不出还占着元素位），其余按解析结果画
					const elements = (this.layout.elements || [])
						.filter((el) => !(el.src && !this.imageMap[el.src]))
						.filter((el) => !(el.src && this.remoteSrcDropped(el.src, lv)))
						.map((el) => (el.src ? Object.assign({}, el, { src: this.imageMap[el.src] }) : el));
					drawCert(
						{
							fillWhite: () => {
								ctx.setFillStyle('#ffffff');
								ctx.fillRect(0, 0, this.canvasW, this.canvasH);
							},
							backgroundImage: (src) => {
								ctx.drawImage(src, 0, 0, this.canvasW, this.canvasH);
							},
							image: (src, x, y, w, h) => {
								ctx.drawImage(src, x, y, w, h);
							},
							avatar: (src, x, y, w, h) => {
								// 圆形裁剪贴入（与后端 drawAvatar 的圆遮罩同档）
								ctx.save();
								ctx.beginPath();
								ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI);
								ctx.setFillStyle('#ffffff');
								ctx.fill();
								ctx.clip();
								ctx.drawImage(src, x, y, w, h);
								ctx.restore();
							},
							text: (str, x, y, size, color) => {
								ctx.setFillStyle(color || '#000000');
								ctx.setFontSize(Number(size) || 14);
								ctx.fillText(String(str), x, y);
							},
							// 居中的行要按这一端自己的占宽对中（后端那个左缘是按 DingTalk 量出来的，
							// 系统字更窄，照抄就偏左）；估算函数与日签图/全局分享同一把
							measureText: (str, size) => textWidth(str, size),
						},
						elements
					);
				},
				nextLevel: (lv) => (lv < 2 ? lv + 1 : lv),
			}).then((src) => {
				if (seq !== this.renderSeq) return;
				this.rendering = false;
				if (!src) {
					this.renderFailed = true;
					return;
				}
				// H5 上画布出的是 data:，长按它微信内 / iOS Safari 不弹「保存图片」（用户 2026-09-28 点名）：
				// 换同一份字节的 blob 地址再挂到弹层里那张 <img> 上，弹层里长按与点保存放大都拿得到能存的那一份
				this.renderedSrc = toSavableSrc(src);
			}).catch(() => {
				if (seq !== this.renderSeq) return;
				this.rendering = false;
				this.renderFailed = true;
			});
		},
		/** 点开看大图：证书本体是一张 760×1360 的图，缩在弹层里读不清数据项，
		    旧后端出图那版就是直接 uni.previewImage 全屏看，改前端出图后这一档不能丢 */
		enlarge() {
			const src = this.renderedSrc;
			if (!src) return;
			uni.previewImage({ urls: [src], current: 0 });
		},
		/**
		 * 保存 = H5 放大预览 + 一句「长按图片可保存至相册」/ 小程序·App 调相册接口存到手机
		 *
		 * H5 这一枚**不上传中转**（2026-09-27 用户口径，同日又点名日签图同一处）：证书是用户自己的一张图，
		 * 点一次保存就往服务器写一张没有收益。放大、端判断与提示文案仍只存 poster-save 那一处。
		 */
		save() {
			const src = this.renderedSrc;
			if (!src) {
				uni.showToast({ title: this.subject + '生成失败，请重试', icon: 'none' });
				return;
			}
			// #ifdef H5
			previewSavablePoster(src);
			// #endif
			// #ifndef H5
			savePosterToAlbum(src, this.subject);
			// #endif
		},
		/** 分享端路：小程序面板 → 微信内指右上角 → 其余端复制当前页链接（同步栈复制，M18⑧） */
		share() {
			const src = this.renderedSrc;
			if (!src) {
				uni.showToast({ title: this.subject + '生成失败，请重试', icon: 'none' });
				return;
			}
			let handled = false;
			// #ifdef MP-WEIXIN
			handled = true;
			sharePosterToMenu(src, hintTopRight);
			// #endif
			// #ifdef H5
			if (this.inWechat) {
				handled = true;
				hintTopRight();
			}
			// #endif
			if (!handled) this.copyLink();
		},
		/** 复制当前证书页链接（H5 的 setClipboardData 是同步 execCommand，必须留在点击栈里） */
		copyLink() {
			// #ifdef H5
			uni.setClipboardData({
				data: window.location.href,
				success: () => uni.showToast({ title: '链接已复制，可发给朋友', icon: 'none' }),
				fail: () => uni.showToast({ title: '复制失败，请重试', icon: 'none' }),
			});
			// #endif
			// #ifndef H5
			uni.showToast({ title: '当前环境暂不支持复制链接', icon: 'none' });
			// #endif
		},
	},
};
</script>

<style lang="scss" scoped>
.certv-wrap {
	display: flex;
	flex-direction: column;
}

.certv-stage {
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 海报那一格：尺寸只由视口算出来，遮罩与图都铺满它，出图前后这一格不动 */
.certv-frame {
	position: relative;
	border-radius: 8px;
	background: #fff;
	overflow: hidden;
}

.certv-img {
	display: block;
}

.certv-failed {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0 20px;
}

.certv-failed-text {
	font-size: 14px;
	color: #86909c;
	margin-bottom: 12px;
}

/* 加载遮罩：与 tz-share-poster-body 的 .sp-shade 同一档（盖满海报的黑底浅透明 + 圆环 + 「加载中」
   + 一道扫描光带）。磨砂只能靠透明度（背景滤镜小程序静默失效 §4），圆角与海报同档 8px */
.certv-shade {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	border-radius: 8px;
	background: rgba(0, 0, 0, 0.55);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.certv-shade-scan {
	position: absolute;
	left: 0;
	top: -88px;
	width: 100%;
	height: 88px;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.09) 55%, rgba(255, 255, 255, 0) 100%);
	animation: certv-shade-scan 2.6s linear infinite;
}

.certv-shade-ring {
	width: 30px;
	height: 30px;
	border-radius: 50%;
	border: 2px solid rgba(255, 255, 255, 0.22);
	border-top-color: rgba(255, 255, 255, 0.92);
	animation: certv-shade-spin 0.9s linear infinite;
}

.certv-shade-text {
	display: flex;
	align-items: center;
	margin-top: 14px;
}

.certv-shade-t {
	font-size: 13px;
	line-height: 18px;
	color: rgba(255, 255, 255, 0.9);
	letter-spacing: 2px;
}

.certv-shade-dot {
	font-size: 13px;
	line-height: 18px;
	color: rgba(255, 255, 255, 0.9);
	animation: certv-shade-blink 1.2s ease infinite;
}

.certv-shade-dot2 {
	animation-delay: 0.2s;
}

.certv-shade-dot3 {
	animation-delay: 0.4s;
}

@keyframes certv-shade-scan {
	from {
		top: -88px;
	}

	to {
		top: 100%;
	}
}

@keyframes certv-shade-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

@keyframes certv-shade-blink {
	0% {
		opacity: 0.15;
	}

	50% {
		opacity: 1;
	}

	100% {
		opacity: 0.15;
	}
}

/* 面板：白底 + 顶部圆角 12（弹层档），安全区双写 constant()/env()（老基础库只认 constant），
   小程序端底部安全区减半，与 tz-share-poster 的 .sh-sheet、.school-popup 同一口径 */
.certv-panel {
	position: relative;
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	padding: 16px 15px 16px;
	padding-bottom: calc(16px + constant(safe-area-inset-bottom));
	padding-bottom: calc(16px + env(safe-area-inset-bottom));
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(16px + constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(16px + env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}

/* 面板里那一行按钮：项与项的间距只由容器 gap 给，某一项按档收起时剩下的仍与左边对齐（W41②） */
.certv-btns {
	display: flex;
	align-items: center;
	gap: 12px;
}

.certv-btn-item {
	flex: 1;
}

.certv-canvas {
	position: fixed;
	left: -9999px;
	top: 0;
}
</style>
