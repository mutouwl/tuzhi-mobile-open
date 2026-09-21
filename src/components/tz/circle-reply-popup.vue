<template>
	<!-- 回复评论弹窗（共用组件：动态详情 / 评论弹窗底部入口点击弹出，内容与交互一致） -->
	<!-- 安全区由 u-popup 统一处理，底部发送栏只保留自身布局 padding，避免 iPhone X 叠加留白 -->
	<u-popup :show="show" mode="bottom" :round="16" :closeOnClickOverlay="true" :safeAreaInsetBottom="true" @close="close">
		<view class="comment-popup">
			<view class="comment-popup-title">{{ replyTo ? '回复 ' + replyTo.nickname : '发表评论' }}</view>
			<textarea v-model="commentText" class="comment-popup-input" :maxlength="500" :auto-height="true" placeholder="说点什么…" />
			<!-- 媒体编辑器（回复仅图片，与发布动态共用组件）；评论贴图数量按圈子设置 comment_image_limit，0 不限制 -->
			<!-- 评论图片与发布页共用后台上传策略：OSS client 直传，否则服务器中转 -->
			<tz-media-editor ref="replyEditor" v-model="replyMedia" :max-images="commentImageLimit" @uploading-change="onUploadingChange" />
			<view class="comment-popup-footer">
				<view class="reply-upload" @tap="chooseReplyImage"><tz-icon name="picture" :size="25" color="#333" /></view>
				<!-- 图片计数紧跟上传按钮右侧；文字计数右对齐 -->
				<text class="reply-img-count">{{ (replyMedia.images || []).length }}{{ commentImageLimit > 0 ? '/' + commentImageLimit : '' }}</text>
				<text class="reply-count">{{ commentText.length }}/500</text>
				<view class="reply-send" :class="{ disabled: !canSend || sending || uploading }" @tap="send">发送</view>
			</view>
		</view>
	</u-popup>
</template>

<script>
/**
 * 圈子动态回复评论弹窗（共用组件：动态详情 / 评论弹窗复用，打开方式一致：open(replyTo)）
 * props: post（动态对象：id / comment_image_limit）
 * emits: posted（评论发送成功，父级刷新评论列表）
 */
export default {
	name: 'tz-circle-reply-popup',
	props: {
		post: { type: Object, default: null },
	},
	data() {
		return {
			show: false,
			commentText: '',
			replyMedia: { images: [], videos: [], audio: {}, files: [] },
			replyTo: null,
			sending: false,
			// 图片上传中（媒体编辑器 uploading-change 事件驱动）：禁用发送，避免评论漏图
			uploading: false,
		};
	},
	computed: {
		canSend() {
			return !!(this.commentText.trim() || ((this.replyMedia || {}).images || []).length);
		},
		// 评论贴图数量上限（0 不限制，默认 9），来自动态详情接口下发的圈子配置 comment_image_limit
		commentImageLimit() {
			const v = this.post ? this.post.comment_image_limit : undefined;
			return v !== undefined && v !== null ? Number(v) : 9;
		},
	},
	methods: {
		// 打开回复弹窗：replyTo 为空为新评论，否则回复指定评论（评论列表回复按钮传入）
		open(replyTo) {
			this.replyTo = replyTo || null;
			this.show = true;
			// 重置上传态，避免上次弹窗关闭时上传未结束导致发送被一直禁用
			this.uploading = false;
		},
		close() {
			this.show = false;
			this.commentText = '';
			this.replyMedia = { images: [], videos: [], audio: {}, files: [] };
			this.replyTo = null;
			this.uploading = false;
		},
		// 媒体编辑器上传状态变化：上传中禁用发送，避免评论漏图
		onUploadingChange(uploading) {
			this.uploading = !!uploading;
		},
		// 底部图片按钮：调用共用媒体编辑器选择图片
		chooseReplyImage() {
			const editor = this.$refs.replyEditor;
			if (editor && editor.chooseImage) editor.chooseImage();
		},
		async send() {
			const post = this.post;
			if (!post || !post.id) return;
			const content = this.commentText.trim();
			const images = (this.replyMedia || {}).images || [];
			if ((!content && !images.length) || this.sending || this.uploading) return;
			this.sending = true;
			uni.showLoading({ title: '发送中', mask: true });
			const params = { post_id: post.id, content };
			if (images.length) params.media = JSON.stringify({ images, media_type: 'image' });
			if (this.replyTo) params.reply_id = this.replyTo.id;
			const res = await this.$api('circle.post.comment', params);
			this.sending = false;
			uni.hideLoading();
			if (res.code === 1) {
				this.close();
				this.$emit('posted');
			} else {
				uni.showToast({ title: res.msg || '评论失败', icon: 'none' });
			}
		},
	},
};
</script>

<style scoped>
.comment-popup { min-height: 170px; padding: 15px 14px 0; background: #fff; border-top-left-radius: 8px; border-top-right-radius: 8px; overflow: hidden; }
.comment-popup-title { color: #1d2129; font-size: 14px; font-weight: 600; }
.comment-popup-input { width: 100%; min-height: 80px; margin-top: 10px; color: #252a31; font-size: 14.5px; line-height: 1.6; }
.comment-popup-footer { display: flex; align-items: center; height: 48px; margin: 0 -14px; padding: 0 14px; border-top: 0.5px solid #edf0f3; }
.reply-upload { padding: 6px 8px 6px 0; }
.reply-img-count { font-size: 11px; color: #b4bac2; margin-left: 2px; }
.reply-count { flex: 1; color: #b4bac2; font-size: 12px; text-align: right; }
.reply-send { margin-left: 11px; padding: 7px 17px; border-radius: 8px; background: #0968f6; color: #fff; font-size: 14px; font-weight: 600; }
.reply-send.disabled { background: #cdd2d8; }
</style>
