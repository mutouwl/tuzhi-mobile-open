<template>
	<!-- 回复评论弹窗（共用组件：动态详情 / 评论弹窗底部入口点击弹出，内容与交互一致） -->
	<!-- 安全区由 u-popup 统一处理，底部发送栏只保留自身布局 padding，避免 iPhone X 叠加留白 -->
	<u-popup :show="show" mode="bottom" :round="16" :closeOnClickOverlay="true" :safeAreaInsetBottom="true" @close="close">
		<view class="comment-popup">
			<view class="comment-popup-title">{{ replyTo ? '回复 ' + replyTo.nickname : '发表评论' }}</view>
			<textarea v-model="commentText" class="comment-popup-input" :maxlength="500" :auto-height="true" :focus="inputFocus" placeholder="说点什么…" @blur="inputFocus = false" />
			<!-- 媒体编辑器（回复仅图片，与发布动态共用组件）；评论贴图数量按圈子设置 comment_image_limit，0 不限制 -->
			<!-- 评论图片与发布页共用后台上传策略：OSS client 直传，否则服务器中转 -->
			<!-- allowImage=false（打卡日记评论后端不收图片）时整块图片能力不渲染，只留文字与字数 -->
			<tz-media-editor v-if="allowImage" ref="replyEditor" v-model="replyMedia" :max-images="commentImageLimit" @uploading-change="onUploadingChange" />
			<view class="comment-popup-footer">
				<view v-if="allowImage" class="reply-upload" @tap="chooseReplyImage"><tz-icon name="picture" :size="25" color="#333" /></view>
				<!-- 图片计数紧跟上传按钮右侧；文字计数右对齐 -->
				<text v-if="allowImage" class="reply-img-count">{{ (replyMedia.images || []).length }}{{ commentImageLimit > 0 ? '/' + commentImageLimit : '' }}</text>
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
 *        api、idParams、replyKey、allowImage —— 让打卡日记等其它模块的评论复用同一个弹窗，
 *        全部留圈子原口径作默认值（不传就是原来的圈子动态评论），调用方只覆盖差异项
 * emits: posted（评论发送成功，父级刷新评论列表）
 */
export default {
	name: 'tz-circle-reply-popup',
	props: {
		post: { type: Object, default: null },
		// 提交接口名：默认圈子动态评论；打卡日记传 checkin.checkin.comment
		api: { type: String, default: 'circle.post.comment' },
		// 目标参数：不传时按圈子口径取 post_id；复用方显式传入（如打卡的 checkin_id + record_id）
		idParams: { type: Object, default: null },
		// 回复对象在提交参数里的键名：圈子 reply_id / 打卡日记 parent_id
		replyKey: { type: String, default: 'reply_id' },
		// 是否允许评论贴图：接口不收图片的模块（打卡日记评论）关掉，媒体编辑器与图片按钮一并隐掉
		allowImage: { type: Boolean, default: true },
	},
	data() {
		return {
			show: false,
			commentText: '',
			replyMedia: { images: [], videos: [], audio: {}, files: [] },
			replyTo: null,
			sending: false,
			// 打开弹窗即拉起键盘（textarea 的 focus 绑定）：点「取消/完成」收起键盘后不自动回焦，
			// 所以 blur 置 false，下次 open 再置 true 仍能触发
			inputFocus: false,
			// 图片上传中（媒体编辑器 uploading-change 事件驱动）：禁用发送，避免评论漏图
			uploading: false,
		};
	},
	computed: {
		canSend() {
			return !!(this.commentText.trim() || (this.allowImage && ((this.replyMedia || {}).images || []).length));
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
			// 自动聚焦输入框拉起键盘：弹窗内容节点在 u-transition 的 v-if 里，show 之后下一帧才存在，
			// 故要等 $nextTick；不能改用 setTimeout——过了本次点击的用户激活窗口，H5/iOS 就拉不起键盘
			this.$nextTick(() => {
				this.inputFocus = true;
			});
		},
		close() {
			this.show = false;
			this.commentText = '';
			this.replyMedia = { images: [], videos: [], audio: {}, files: [] };
			this.replyTo = null;
			this.uploading = false;
			this.inputFocus = false;
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
			// 目标参数：复用方（打卡日记）传 idParams；不传则按圈子口径取 post.id
			const target = this.idParams || (this.post && this.post.id ? { post_id: this.post.id } : null);
			if (!target) return;
			const content = this.commentText.trim();
			const images = (this.replyMedia || {}).images || [];
			if ((!content && !images.length) || this.sending || this.uploading) return;
			this.sending = true;
			uni.showLoading({ title: '发送中', mask: true });
			const params = Object.assign({}, target, { content });
			if (images.length) params.media = JSON.stringify({ images, media_type: 'image' });
			if (this.replyTo) params[this.replyKey] = this.replyTo.id;
			const res = await this.$api(this.api, params);
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
