<template>
  <view class="circle-publish">
    <u-loading-page :loading="loading" bg-color="#fff"></u-loading-page>
    <view class="form">
      <textarea
        class="content-input"
        v-model="content"
        placeholder="分享你的想法… 最多1000字"
        :maxlength="1000"
        :auto-height="true"
        :disabled="disabled"
      />

      <!-- 媒体编辑器（图片/视频/音频/文件，与回复弹窗共用组件） -->
      <tz-media-editor
        ref="mediaEditor"
        v-model="mediaForm"
        :max-images="uploadLimit.media_image_limit"
        :max-videos="uploadLimit.media_video_limit"
        :max-audio="uploadLimit.media_audio_limit"
        :max-files="uploadLimit.media_file_limit"
        :size-limits="uploadLimit"
        :file-types="uploadLimit.media_file_types"
        :media-enables="uploadLimit"
        :post-id="id"
        remote-delete
        :disabled="disabled"
        @uploading-change="onUploadingChange"
      />
    </view>

    <view class="footer-bar">
      <view class="media-toolbar">
        <view class="tool-item" :class="{ disabled: uploading }" v-if="uploadLimit.media_image_enable !== 0" @tap="!uploading && $refs.mediaEditor.chooseImage()">
          <tz-icon name="picture" :size="22" color="#4e5969" />
        </view>
        <view class="tool-item" :class="{ disabled: uploading }" v-if="uploadLimit.media_video_enable !== 0" @tap="!uploading && $refs.mediaEditor.chooseVideo()">
          <tz-icon name="video" :size="22" color="#4e5969" />
        </view>
        <view class="tool-item" :class="{ disabled: uploading }" v-if="uploadLimit.media_audio_enable !== 0" @tap="!uploading && $refs.mediaEditor.chooseAudio()">
          <tz-icon name="sound-on" :size="22" color="#4e5969" />
        </view>
        <view class="tool-item" :class="{ disabled: uploading }" v-if="uploadLimit.media_file_enable !== 0" @tap="!uploading && $refs.mediaEditor.chooseFile()">
          <tz-icon name="document" :size="22" color="#4e5969" />
        </view>
      </view>
      <view class="publish-btn" :class="{ disabled: !canSubmit || submitting || uploading }" @tap="submit">发布</view>
    </view>
  </view>
</template>

<script>
var that;

export default {
  data() {
    return {
      id: 0,
      loading: false,
      circleId: 0,
      content: '',
      mediaForm: { images: [], videos: [], audio: {}, files: [] },
      // 圈子上传设置（数量/大小/文件类型/开关），后端接口返回，未加载时用默认值
      uploadLimit: {
        media_image_limit: 9,
        media_audio_limit: 9,
        media_video_limit: 1,
        media_file_limit: 9,
        media_image_size: 0,
        media_audio_size: 0,
        media_video_size: 0,
        media_file_size: 0,
        media_file_types: 'doc,docx,xls,xlsx,pdf',
        media_image_enable: 1,
        media_video_enable: 1,
        media_audio_enable: 1,
        media_file_enable: 1,
      },
      submitting: false,
      // 有文件上传中时禁用 footer-bar 交互，避免提交不完整媒体或重复触发上传（由媒体编辑器 uploading-change 事件驱动）
      uploading: false,
    };
  },
  computed: {
    // 必须输入文字内容才能发布
    canSubmit() {
      return !!this.content.trim();
    },
    // 文件上传中或页面加载中：编辑框与九宫格删除按钮不可点击，避免上传中误改内容或误删媒体
    disabled() {
      return this.uploading || this.loading;
    },
  },
  onLoad(options) {
    that = this;
    that.circleId = Number(options.circle_id || 0);
    that.id = Number(options.id || 0);
    // 圈子插件未安装时兜底
    if (!that.$tools.systemConfig("app_isinstall_circle")) {
      uni.showToast({ title: "圈子功能未安装", icon: "none" });
      setTimeout(() => uni.navigateBack(), 1200);
      return;
    }
    if (that.id) {
      uni.setNavigationBarTitle({ title: '编辑动态' });
      that.loadEdit(that.id);
    } else {
      uni.setNavigationBarTitle({ title: '发布动态' });
    }
    // 拉取圈子上传设置（数量/大小/文件类型限制）
    if (that.circleId) {
      that.loadUploadConfig(that.circleId);
    }
  },
  methods: {
    // 媒体编辑器上传状态变化：上传中禁用 footer-bar 操作，避免上传中误发布
    onUploadingChange(uploading) {
      that.uploading = !!uploading;
    },
    // 拉取圈子上传设置，失败时保持默认值不影响发布
    async loadUploadConfig(circleId) {
      const res = await that.$api('circle.circle.publishConfig', { circle_id: circleId });
      if (res.code !== 1 || !res.data) return;
      const d = res.data;
      that.uploadLimit = {
        media_image_limit: d.media_image_limit !== undefined ? Number(d.media_image_limit) : 9,
        media_audio_limit: d.media_audio_limit !== undefined ? Number(d.media_audio_limit) : 9,
        media_video_limit: d.media_video_limit !== undefined ? Number(d.media_video_limit) : 1,
        media_file_limit: d.media_file_limit !== undefined ? Number(d.media_file_limit) : 9,
        media_image_size: d.media_image_size !== undefined ? Number(d.media_image_size) : 0,
        media_audio_size: d.media_audio_size !== undefined ? Number(d.media_audio_size) : 0,
        media_video_size: d.media_video_size !== undefined ? Number(d.media_video_size) : 0,
        media_file_size: d.media_file_size !== undefined ? Number(d.media_file_size) : 0,
        media_file_types: d.media_file_types || 'doc,docx,xls,xlsx,pdf',
        media_image_enable: d.media_image_enable !== undefined ? Number(d.media_image_enable) : 1,
        media_video_enable: d.media_video_enable !== undefined ? Number(d.media_video_enable) : 1,
        media_audio_enable: d.media_audio_enable !== undefined ? Number(d.media_audio_enable) : 1,
        media_file_enable: d.media_file_enable !== undefined ? Number(d.media_file_enable) : 1,
      };
    },
    // 编辑模式：加载动态内容到表单
    async loadEdit(id) {
      that.loading = true;
      let res;
      try {
        res = await that.$api('circle.post.detail', { id });
      } catch (e) {
        // 请求异常（网络错误等）：恢复加载态，避免整页 loading 卡死
        that.loading = false;
        uni.showToast({ title: '加载失败，请重试', icon: 'none' });
        return;
      }
      if (res.code !== 1) {
        that.loading = false;
        uni.showToast({ title: res.msg || '加载失败', icon: 'none' });
        return;
      }
      const d = res.data;
      that.content = d.content || '';
      const m = d.media || {};
      const mediaForm = { images: [], videos: [], audio: {}, files: [] };
      if (m.images && m.images.length) {
        mediaForm.images = m.images.slice();
      }
      // 多视频优先，兼容历史单视频/扁平结构
      if (m.videos && m.videos.length) {
        m.videos.forEach(v => {
          if (mediaForm.videos.length < 9) {
            mediaForm.videos.push({ url: v.url, name: v.name || '视频', size: v.size || 0, video_id: v.video_id || '', cover: v.cover || '' });
          }
        });
      } else if (m.url && (m.media_type == 'video' || d.post_type == 'video')) {
        // video_id 为后端回传的 alivod:{videoId} 直传标记，编辑重提交时用于还原原始标记
        mediaForm.videos.push({ url: m.url, name: m.name || '视频', size: m.size || 0, video_id: m.video_id || '' });
      }
      // 音频：优先嵌套 media.audio（视频+音频混合），兼容历史扁平结构
      if (m.audio && m.audio.url) {
        mediaForm.audio = { url: m.audio.url, name: m.audio.name || '语音', size: m.audio.size || 0 };
      } else if (m.url && (m.media_type == 'audio' || d.post_type == 'audio')) {
        mediaForm.audio = { url: m.url, name: m.name || '语音', size: m.size || 0 };
      } else if (m.url && (m.media_type == 'file' || d.post_type == 'file')) {
        mediaForm.files.push({ url: m.url, name: m.name || '附件文件', size: m.size || 0 });
      }
      if (m.files && m.files.length) {
        (m.files || []).forEach(f => {
          if (mediaForm.files.length < 9) {
            mediaForm.files.push({ url: f.url, name: f.name || '附件文件', size: f.size || 0 });
          }
        });
      }
      that.mediaForm = mediaForm;
      that.loading = false;
    },
    async submit() {
      if (!that.canSubmit || that.submitting || that.uploading) return;
      that.submitting = true;
      // 发布/保存期间显示加载弹窗（与详情页删除等提交类操作一致用 uni.showLoading，避免全屏 loading 页在请求快时无感知）
      uni.showLoading({ title: that.id ? '保存中' : '发布中', mask: true });
      const m = that.mediaForm || {};
      let media = {};
      if (m.images && m.images.length) media.images = m.images;
      if (m.files && m.files.length) media.files = m.files;
      // 音频：无论主类型是什么都随媒体保存（后端按 media.audio 校验），避免混合媒体提交后音频丢失
      if (m.audio && m.audio.url) {
        media.audio = { url: m.audio.url, name: m.audio.name, size: m.audio.size };
      }
      // 问答功能已隐藏：发布页固定发布动态，媒体类型决定动态类型（视频 > 音频 > 图片 > 文件）
      let postType = 'text';
      if (m.videos && m.videos.length) {
        postType = 'video';
        media.media_type = 'video';
        // 直传视频：提交原始 alivod: 标记（避免播放地址回写覆盖 videoId）；普通上传仍提交 URL
        media.videos = m.videos.map(v => ({
          url: v.video_id || v.url,
          video_id: v.video_id || '',
          name: v.name,
          size: v.size,
        }));
      } else if (m.audio && m.audio.url) {
        postType = 'audio';
        media.media_type = 'audio';
      } else if (m.images && m.images.length) {
        postType = 'image';
        media.media_type = 'image';
      } else if (m.files && m.files.length) {
        postType = 'file';
        media.media_type = 'file';
      }
      if (!Object.keys(media).length) media = null;
      const api = that.id ? 'circle.post.edit' : 'circle.post.publish';
      const params = {
        circle_id: that.circleId,
        content: that.content.trim(),
        post_type: postType,
        media: media ? JSON.stringify(media) : '',
      };
      if (that.id) params.id = that.id;
      let res;
      try {
        res = await that.$api(api, params);
      } catch (e) {
        // 请求异常（网络错误/未登录拦截等）：恢复提交状态并完整展示错误，避免 loading 卡死、按钮无响应
        that.submitting = false;
        uni.hideLoading();
        // 未登录场景已由请求层弹登录提示，这里不再重复弹窗
        if (e && e.errMsg && String(e.errMsg).indexOf('未登录') !== -1) return;
        uni.showModal({
          title: '保存失败',
          content: (e && (e.msg || e.errMsg)) || '网络异常，请稍后重试',
          showCancel: false,
        });
        return;
      }
      that.submitting = false;
      uni.hideLoading();
      if (res.code === 1) {
        if (that.id) {
          uni.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => uni.navigateBack(), 600);
        } else {
          uni.showToast({ title: '发布成功', icon: 'success' });
          // 发布成功跳转圈子列表
          setTimeout(() => {
            uni.redirectTo({ url: '/pages/app/circle/index/index?id=' + that.circleId });
          }, 600);
        }
      } else {
        uni.showToast({ title: res.msg || '保存失败', icon: 'none' });
      }
    },
  },
};
</script>

<style>
.circle-publish {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 70px;
}
.form {
  padding: 12px;
}
.content-input {
  width: 100%;
  min-height: 100px;
  font-size: 14px;
  color: #1d2129;
}
.footer-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* #ifndef MP-WEIXIN */
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  /* #endif */
  /* 微信小程序端：安全区按设计减半（iPhone X 约 17px），与 tab bar 一致 */
  /* #ifdef MP-WEIXIN */
  padding: 8px 12px calc(8px + constant(safe-area-inset-bottom) / 2);
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom) / 2);
  /* #endif */
  box-shadow: 0 -1px 6px rgba(0,0,0,0.05);
}
.media-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
}
.tool-item {
  padding: 6px;
}
.tool-item.disabled {
  opacity: 0.4;
}
.publish-btn {
  height: 36px;
  line-height: 36px;
  padding: 0 24px;
  text-align: center;
  background: #0968f6;
  color: #fff;
  font-size: 14px;
  border-radius: 4px;
}
.publish-btn.disabled {
  background: #c9cdd4;
}
</style>
