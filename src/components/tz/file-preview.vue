<template>
	<u-popup :show="visible" @close="$emit('close')" :overlayStyle="{ zIndex }" :zIndex="zIndex" :overlay="true" :closeable="true" :round="10" title="预览">
		<div class="preview-box" v-if="data">
			<!-- 加载状态：文件加载完成（或超时兜底）后隐藏；音频组件自带加载提示，不覆盖 -->
			<view class="preview-loading" v-if="loading && data.filetype != 'audio'">
				<u-loading-icon mode="circle" :size="34"></u-loading-icon>
				<text class="preview-loading-text">加载中…</text>
			</view>
			<image v-if="data.filetype == 'image'" :src="data.fullurl" style="width: 100%;" mode="widthFix" @load="onPreviewLoad" @error="onPreviewLoad" />
			<!-- 视频预览：H5 用阿里云播放器（与发布页媒体编辑器/课程播放器一致），非 H5 用原生 video 兜底；
			     visible 参与 v-if，关闭弹窗即卸载停止播放（与音频一致） -->
			<!-- #ifdef H5 -->
			<video-h5 v-else-if="data.filetype == 'video' && visible" :source="data.playauth && data.vod_id ? data.vod_id : data.fullurl" :playauth="data.playauth || data.play_auth || ''" :dom-id="domId" :height="videoHeight" :autoplay="true" :styles="videoStyles" :prevent-page-reload-on-refresh="true" @ready="onPreviewLoad" @refresh="onVideoRefresh" @error="onPreviewLoad" />
			<!-- #endif -->
			<!-- #ifndef H5 -->
			<video v-else-if="data.filetype == 'video' && visible" class="preview-video" :src="data.fullurl" autoplay controls @loadedmetadata="onPreviewLoad" @canplay="onPreviewLoad" @error="onPreviewLoad"></video>
			<!-- #endif -->
			<!-- 音频预览统一使用课程详情的大播放器；组件位于主包，圈子和课程分包均可复用。 -->
			<audio-preview v-else-if="data.filetype == 'audio' && visible" :name="data.filename || '音频'" :path="data.fullurl" dom-id="preview-audio" @ready="onPreviewLoad" @play="onPreviewLoad" />
			<!-- #ifdef H5 -->
			<view v-if="data.filetype == 'document'">
				<iframe v-if="isPdf(data.fullurl)" class="preview-doc" :src="'https://a.data96.com/pdf?url=' + data.fullurl" frameborder="0" @load="onPreviewLoad"></iframe>
				<iframe v-else class="preview-doc" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(data.fullurl)" frameborder="0" @load="onPreviewLoad"></iframe>
			</view>
			<!-- #endif -->
		</div>
	</u-popup>
</template>

<script>
import audioPreview from '@/components/tz/course-audio.vue';
// #ifdef H5
import videoH5 from '@/components/video/video-h5.vue';
// #endif

export default {
	name: 'tz-file-preview',
	components: {
		audioPreview,
		// #ifdef H5
		videoH5,
		// #endif
	},
	props: {
		visible: {
			type: Boolean,
			default: false,
		},
		data: {
			type: Object,
			default: null,
		},
		zIndex: {
			type: Number,
			default: 10110,
		},
	},
	emits: ['close'],
	data() {
		return {
			loading: true,
			loadTimer: null,
			// 阿里云播放器按实例隔离：domId 唯一标识播放器容器，列表页多个预览弹窗实例不能复用同一 domId
			domId: '',
			// 播放器高度（px，阿里云播放器 height 仅接受数字）与容器样式
			videoHeight: 270,
			videoStyles: {},
		};
	},
	created() {
		this.domId = Math.random().toString(36).substr(2);
	},
	watch: {
		visible(val) {
			if (val) {
				this.resetLoading();
				this.calcVideoHeight();
			}
		},
		data() {
			this.resetLoading();
		},
	},
	methods: {
		isPdf(url) {
			return (url || '').indexOf('.pdf') > -1;
		},
		onPreviewLoad() {
			this.clearLoadTimer();
			this.loading = false;
		},
		onVideoRefresh() {
			// 刷新按钮只会重载播放器当前的视频，不触发整页刷新
			this.resetLoading();
		},
		// 弹窗打开时按窗口高度计算播放器高度：与原生 video 的 calc(70vh - 20px) 对齐，
		// 上限 480 避免大屏下播放区过高（阿里云播放器 height 仅接受数字 px）
		calcVideoHeight() {
			if (typeof window === 'undefined') return;
			const h = Math.round((window.innerHeight || 750) * 0.7) - 20;
			this.videoHeight = Math.max(180, Math.min(h, 480));
			this.videoStyles = { width: '100%', height: this.videoHeight + 'px' };
		},
		resetLoading() {
			this.loading = true;
			this.clearLoadTimer();
			// 兜底：部分场景（如音频需用户点击播放）没有加载完成事件，超时后自动隐藏加载状态
			this.loadTimer = setTimeout(() => {
				this.loading = false;
			}, 20000);
		},
		clearLoadTimer() {
			if (this.loadTimer) {
				clearTimeout(this.loadTimer);
				this.loadTimer = null;
			}
		},
	},
	beforeDestroy() {
		this.clearLoadTimer();
	},
};
</script>

<style scoped>
.preview-box {
	position: relative;
	width: 100%;
	/* 最小高度：参考音频播放器组件（audio-new）全尺寸 400px + 上下 padding 20px，保证音频播放器完整展示 */
	min-height: 420px;
	/* 最高高度：超出部分滚动 */
	max-height: 70vh;
	overflow-y: auto;
	padding: 10px;
	box-sizing: border-box;
}

/* 视频/文档预览：占满弹窗最高区域（与 .preview-box 的 max-height 70vh 对齐，扣除上下 padding），其余类型（图片/音频）自适应高度 */
.preview-video,
.preview-doc {
	width: 100%;
	height: calc(70vh - 20px);
}

.preview-loading {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #fff;
	z-index: 10;
	pointer-events: none;
}

.preview-loading-text {
	margin-top: 12px;
	font-size: 14px;
	color: #999;
}
</style>
