<template>
	<!-- 展示/编辑共用：editable 时媒体 90% 居中 + 圆角放媒体本身（删除按钮溢出容器）+ 显示删除按钮与视频文件名 -->
	<view class="post-media-grid" :class="{ 'is-editable': editable, 'is-content-indented': contentIndent && !editable }">
		<view v-for="(item, i) in items" :key="i" class="post-media-item" @tap.stop="previewItem(i)">
			<!-- 图片点击由外层 post-media-item 统一处理，避免微信小程序点击覆盖层时事件丢失 -->
			<image v-if="item.type == 'image' && !imgErrors[item.url]" :src="item.url" mode="aspectFill" class="post-media-img" @error="onImgError(item.url)" />
			<!-- 图片加载失败占位：浅灰底 + 居中图标（与评论列表 comment-image-error 一致） -->
			<view v-else-if="item.type == 'image'" class="post-media-img post-media-image-error">
				<tz-icon name="tupian" :size="24" color="#c9cdd4" />
			</view>
			<!-- 音频：无封面，样式与视频占位格完全一致（仅图标替换为音频），点击整格弹出预览弹窗播放 -->
			<view v-else-if="item.type == 'audio'" class="post-media-img post-video-placeholder"><tz-icon name="sound-on" :size="30" color="#c9cdd4" /></view>
			<!-- 视频：有封面（编辑器临时封面）显示封面，无封面显示占位图；点击弹出预览弹窗播放 -->
			<template v-else>
				<image v-if="item.cover" :src="item.cover" mode="aspectFill" class="post-media-img" />
				<view v-else-if="item.url" class="post-media-img post-video-placeholder"><tz-icon name="video" :size="30" color="#c9cdd4" /></view>
				<view v-else class="post-media-img post-media-processing"><text>视频处理中</text></view>
			</template>
			<!-- 播放按钮不再单独拦截事件，由外层媒体格统一转发预览 -->
			<view v-if="item.type == 'audio' && item.url" class="post-media-play"><tz-icon name="play_fill" :size="24" color="#fff" /></view>
			<view v-else-if="item.type == 'video' && item.url" class="post-media-play"><tz-icon name="play_fill" :size="24" color="#fff" /></view>
			<!-- 视频文件名（编辑模式叠加在封面底部，与发布页原样式一致） -->
			<text v-if="editable && item.type == 'video' && item.name" class="media-video-name">{{ item.name }}</text>
			<!-- 微信小程序中 tz-icon 属于自定义组件，原生 tap 不一定能跨组件边界冒泡；
			     用顶层原生 view 统一承接整格点击，确保图片/视频/音频都能触发预览。 -->
			<view class="post-media-click-mask" @tap.stop="previewItem(i)"></view>
			<!-- 删除按钮（编辑模式）：z-index 最高，避免被封面/占位图遮挡；禁用态（上传中/加载中）置灰且不可点击 -->
			<view v-if="editable" class="media-del" :class="{ 'is-disabled': disabled }" @tap.stop="!disabled && $emit('remove', item, i)"><tz-icon name="close" :size="10" color="#fff" /></view>
		</view>
	</view>
</template>

<script>
/**
 * 圈子动态媒体九宫格（通用组件：动态卡片/动态详情展示 + 发布页/回复弹窗媒体编辑器共用）
 * props: items（[{ type: 'image'|'video'|'audio', url, index, name, cover }]，cover 为编辑器视频临时封面）、
 *        editable（编辑模式：媒体 90% 居中 + 圆角放媒体本身 + 删除按钮 + 视频文件名叠加，默认 false 展示模式）
 * emits: preview-image(images, index)（点击图片，images 为全部图片地址）、preview-video(item)、
 *        preview-audio(item)（点击音频）、remove(item, index)（编辑模式点击删除）
 */
export default {
	name: 'tz-circle-media-grid',
	props: {
		items: { type: Array, default: () => [] },
		editable: { type: Boolean, default: false },
		// 动态卡片展示模式下与正文保持相同的 42px 内容缩进；编辑器/详情页不启用
		contentIndent: { type: Boolean, default: false },
		// 禁用删除操作（上传中/页面加载中）：删除按钮置灰且不可点击
		disabled: { type: Boolean, default: false },
	},
	emits: ['preview-image', 'preview-video', 'preview-audio', 'remove'],
	data() {
		return {
			// 图片加载失败标记：key = 图片 url，值为 true 时该图用图标占位（与评论列表 comment-image-error 一致）
			// 用 url 作 key：父级每次渲染都会生成新的 items 数组引用，若按下标标记需监听重置，会因父级重渲染触发闪烁
			imgErrors: {},
		};
	},
	methods: {
		// 媒体格统一点击入口：保证点击图片、视频、音频或覆盖层都能触发预览
		previewItem(index) {
			// 小程序模板不要把 v-for 中的整个 item 作为事件参数传递：旧版 uni-app 会
			// 通过动态 key 路径回取对象，key 含表达式时参数可能变成 undefined。
			const item = this.items[index];
			if (!item) return;
			if (item.type == 'image') {
				this.previewImage(index);
				return;
			}
			if (item.type == 'audio') {
				this.previewAudio(item);
				return;
			}
			if (item.type == 'video') {
				if (item.url) this.previewVideo(item);
				else this.onProcessingClick();
			}
		},
		previewImage(index) {
			const images = this.items.filter(i => i.type == 'image').map(i => i.url);
			const current = this.items.slice(0, index + 1).filter(i => i.type == 'image').length - 1;
			if (images.length) this.$emit('preview-image', images, Math.max(0, current));
		},
		// 微信小程序端不要在模板表达式里直接 $emit，显式转发可以确保自定义事件参数不丢失
		previewVideo(item) {
			if (item) this.$emit('preview-video', item);
		},
		previewAudio(item) {
			if (item) this.$emit('preview-audio', item);
		},
		// 视频转码中（无播放地址）：点击不跳动态详情，提示稍后再查看
		onProcessingClick() {
			uni.showToast({ title: '视频加载中，稍后再查看即可', icon: 'none' });
		},
		onImgError(url) {
			// 必须用 $set：Vue2 对 reactive 对象新增 key 不触发更新，直接赋值占位不会渲染
			this.$set(this.imgErrors, url, true);
		},
	},
};
</script>

<style scoped>
.post-media-grid { display: flex; flex-wrap: wrap; gap: 8px; }
/* 动态卡片中每行首个媒体项与 .post-content 对齐，同时保持三列布局 */
.post-media-grid.is-content-indented { margin-left: 0; }
.post-media-grid.is-content-indented .post-media-item { width: calc((100% - 58px) / 3); padding-bottom: calc((100% - 58px) / 3); }
.post-media-grid.is-content-indented .post-media-item:nth-child(3n + 1) { margin-left: 42px; }
.post-media-item { width: calc((100% - 16px) / 3); height: 0; padding-bottom: calc((100% - 16px) / 3); border-radius: 6px; overflow: hidden; position: relative; background: #f2f3f5; }
.post-media-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
/* 图片加载失败占位：浅灰底 + 居中图标（与评论列表 comment-image-error 一致） */
.post-media-image-error { display: flex; align-items: center; justify-content: center; background: #f2f3f5; }
.post-media-processing { display: flex; align-items: center; justify-content: center; background: #f2f3f5; font-size: 12px; color: #86909c; }
.post-video-placeholder { display: flex; align-items: center; justify-content: center; background: #f2f3f5; }
.post-media-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; pointer-events: none; }
/* 覆盖媒体格的原生点击层：避免点击内部自定义图标时，小程序事件无法冒泡到 post-media-item。 */
.post-media-click-mask { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 2; }

/* 编辑模式（媒体编辑器）：容器不裁剪（删除按钮溢出），圆角放媒体本身，媒体 90% 居中留边距 */
.post-media-grid.is-editable .post-media-item { border-radius: 0; overflow: visible; background: transparent; }
.post-media-grid.is-editable .post-media-img { top: 5%; left: 5%; width: 90%; height: 90%; border-radius: 6px; }
/* 编辑模式：视频文件名叠加封面底部（半透明黑底白字） */
.media-video-name { position: absolute; left: 5%; right: 5%; bottom: 5%; text-align: center; font-size: 14px; line-height: 16px; color: #fff; background: rgba(0,0,0,0.35); border-radius: 4px; padding: 1px 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; z-index: 1; }
/* 编辑模式：删除按钮（z-index 3 最高，避免被点击层/封面/占位图遮挡） */
.media-del { position: absolute; top: -6px; right: -6px; width: 16px; height: 16px; border-radius: 50%; background: rgba(31,35,41,0.68); display: flex; align-items: center; justify-content: center; z-index: 3; }
/* 禁用态（上传中/加载中）：删除按钮置灰，不可点击 */
.media-del.is-disabled { opacity: 0.5; }
</style>
