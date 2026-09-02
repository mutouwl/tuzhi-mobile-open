<template>
  <view class="circle-post-list">
    <view v-for="post in list" :key="post.id" :class="['post-card', { 'post-card-round': round, 'post-card-border': border }]" @tap="onCard(post)">
      <!-- 卡片头（共用组件：头像/昵称/标签插槽/元信息/更多，与动态详情一致）；头部不阻止冒泡，整卡点击进动态详情 -->
      <tz-circle-post-head :post="post" :meta="formatTime(post.createtime)" @more="openMore(post)">
        <template v-slot:tags>
          <text v-if="post.is_owner" class="tag tag-owner">圈主</text>
          <text v-if="post.is_essence" class="tag tag-essence">精选</text>
          <text v-if="post.is_top" class="tag tag-top">置顶</text>
          <text v-if="post.is_notice" class="tag tag-notice">圈公告</text>
          <text v-if="post.post_type == 'question'" :class="post.comment_count > 0 ? 'tag tag-answered' : 'tag tag-waiting'">{{ post.comment_count > 0 ? '已回答' : '待回答' }}</text>
        </template>
      </tz-circle-post-head>

      <!-- 问答卡片：提问卡片 + 回答内容（富文本） -->
      <template v-if="questionAnswer(post)">
        <view class="question-answer-card">
          <text class="question-answer-label">提问</text>
          <text class="question-answer-content">{{ post.content || '查看提问内容' }}</text>
        </view>
        <view class="post-content" :selectable="contentProtect != 1" :data-cid="post.id">
          <u-parse v-if="isHtml(questionAnswer(post).content)" :content="questionAnswer(post).content" :selectable="contentProtect != 1" class="post-richtext"></u-parse>
          <text v-else class="post-answer-text">{{ questionAnswer(post).content }}</text>
        </view>
        <view v-if="showMoreMap[post.id]" class="post-more" @tap.stop="onCard(post)">查看更多</view>
      </template>

      <!-- 文本 -->
      <view v-else-if="post.content" class="post-content" :selectable="contentProtect != 1" :data-cid="post.id">
        <u-parse v-if="isHtml(post.content)" :content="post.content" :selectable="contentProtect != 1" class="post-richtext"></u-parse>
        <template v-else>
          <text v-for="(part, pi) in formatContent(post.content)" :key="pi" :class="part.type">{{ part.text }}</text>
        </template>
      </view>
      <view v-if="post.content && showMoreMap[post.id]" class="post-more" @tap.stop="onCard(post)">查看更多</view>

      <!-- 图片/视频/音频九宫格（共用组件，与动态详情一致；音频格样式参考图片/视频占位格） -->
      <tz-circle-media-grid class="card-media-margin" v-if="mediaGridItems(post).length" :items="mediaGridItems(post)" :content-indent="true" @preview-image="previewImage" @preview-video="onPreviewVideo" @preview-audio="onPreviewAudio" />

      <!-- 文件列表（最多 3 个，共用组件，与动态详情一致） -->
      <view class="card-file-margin" v-if="fileList(post).length">
        <tz-circle-file-list :files="fileList(post)" @open="openFile" />
      </view>

      <!-- 课程/直播卡片：支持多课程数组 -->
      <view class="post-course-mini" v-if="post.post_type == 'course' && courseList(post).length" @tap.stop>
        <tz-course-mini :list="courseList(post)" :round="true" :border="true" :margin="8" />
      </view>

      <!-- 点赞人列表 -->
      <view class="like-users" v-if="post.like_users && post.like_users.length">
        <tz-icon name="like_fill" :size="14" color="#3478be" />
        <text class="like-users-text">{{ post.like_users.join('、') }} 等{{ post.like_count }}人觉得很赞</text>
      </view>

      <!-- 卡片脚 -->
      <view class="post-foot" v-if="mode == 'full'">
        <view class="foot-item" @tap.stop="onLike(post)">
          <tz-icon class="foot-icon" :name="post.liked == 1 ? 'like_fill' : 'like'" :size="18" :color="post.liked == 1 ? '#f53f3f' : '#86909c'" />
        </view>
        <view class="foot-item" @tap.stop="openComment(post)">
          <tz-icon class="foot-icon" name="pinglun" :size="18" color="#86909c" />
          <text class="foot-text">{{ post.comment_count || 0 }}</text>
        </view>
        <view class="foot-item" @tap.stop="sharePost(post)">
          <tz-icon class="foot-icon" name="share" :size="18" color="#86909c" />
        </view>
      </view>

      <!-- 评论预览 -->
      <view class="comment-preview" v-if="previewComments(post).length">
        <view v-for="c in previewComments(post)" :key="c.id" class="comment-item">
          <view class="comment-item-head">
            <text class="comment-user">{{ c.nickname }}</text>
            <text v-if="c.reply_nickname" class="comment-reply-tag"> 回复 {{ c.reply_nickname }}</text>
            <text class="comment-split">：</text>
            <text v-if="c.media && c.media.images && c.media.images.length" class="comment-media" @tap.stop="previewImage(c.media.images, 0)"><tz-icon name="picture" :size="12" color="#86909c" /> 图片</text>
          </view>
          <u-parse v-if="isHtml(c.content)" :content="c.content" class="comment-richtext"></u-parse>
          <text v-else class="comment-text">{{ c.content }}</text>
        </view>
        <view class="comment-more" v-if="post.comment_count > 2" @tap.stop="onCard(post)">查看更多 ></view>
      </view>
    </view>

    <share-modal :val="shareVal" type="circle_post" :visible="shareVisible" @close="shareVisible = false" />
    <!-- 附件预览（通用弹窗组件，支持图片/视频/音频/文档） -->
    <tz-file-preview :visible="previewVisible" :data="previewData" @close="previewVisible = false" />
    <!-- 评论弹窗（通用组件：评论列表 + 底部操作栏与详情页一致，点击入口弹出回复评论弹窗） -->
    <tz-circle-comment :visible="commentVisible" :post-id="commentPostId" @close="commentVisible = false" @posted="onPosted" @deleted="onDeleted" @like="onPopupLike" @share="sharePost" />
    <u-action-sheet :show="moreVisible" :actions="moreActions" cancelText="取消" :closeOnClickOverlay="true"
      @close="moreVisible = false" @select="onMoreAction" />
  </view>
</template>

<script>
import shareModal from '@/components/modal/share-modal.vue';

export default {
  name: 'tz-circle-post',
  components: { shareModal },
  props: {
    list: { type: Array, default: () => [] },
    // full 可互动 / preview 仅预览
    mode: { type: String, default: 'full' },
    // preview 模式下是否允许点击卡片进详情（自定义页传 true，售前页保持只读不传）
    clickable: { type: Boolean, default: false },
    // 是否有圆角
    round: { type: Boolean, default: true },
    // 是否显示边框
    border: { type: Boolean, default: false },
    circleId: { type: [Number, String], default: 0 },
    contentProtect: { type: [Number, String], default: 0 },
  },
  data() {
    return {
      shareVisible: false,
      shareVal: '',
      moreVisible: false,
      currentPost: null,
      previewVisible: false,
      previewData: null,
      commentVisible: false,
      commentPostId: 0,
      // 记录各动态文本是否超出 4 行（超出显示「查看更多」）
      showMoreMap: {},
    };
  },
  computed: {
    moreActions() {
      return [{ name: '编辑' }, { name: '删除', color: '#f53f3f' }];
    },
  },
  watch: {
    list() {
      this.measureContent();
    },
  },
  mounted() {
    this.measureContent();
  },
  methods: {
    // 检测文本是否超出 4 行，超出则显示「查看更多」（按元素高度与 4 行高度阈值比较）
    measureContent() {
      const that = this;
      if (!this.list || !this.list.length) {
        this.showMoreMap = {};
        return;
      }
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(that);
        query.selectAll('.post-content').fields({ size: true, rect: true, dataset: true }, (res) => {
          if (!res || !res.length) return;
          const map = {};
          res.forEach((item) => {
            const cid = item.dataset && item.dataset.cid;
            if (!cid) return;
            // 4 行高度阈值：14.5px * 1.7 * 4 ≈ 98.6
            map[cid] = item.height >= 98.6;
          });
          that.showMoreMap = map;
        });
        query.exec();
      });
    },
    // 动态课程列表：兼容历史单课程对象与多课程数组；卡片最多展示 2 门，超出需进详情查看
    courseList(post) {
      const d = post && post.link_data;
      if (!d) return [];
      const list = Array.isArray(d) ? d : [d];
      return list.slice(0, 2);
    },
    formatTime(ts) {
      if (!ts) return '';
      const d = new Date(Number(ts) * 1000);
      const now = Date.now();
      const diff = Math.floor((now - d.getTime()) / 1000);
      if (diff < 3600) return Math.max(1, Math.floor(diff / 60)) + '分钟前';
      if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
      if (diff < 86400 * 30) return Math.floor(diff / 86400) + '天前';
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },
    formatContent(content) {
      if (!content) return [];
      const parts = [];
      const regex = /(#[^#\s]+#?)/g;
      let last = 0;
      content.replace(regex, (match, p1, offset) => {
        if (offset > last) parts.push({ type: 'text', text: content.slice(last, offset) });
        parts.push({ type: 'topic', text: p1 });
        last = offset + p1.length;
        return match;
      });
      if (last < content.length) parts.push({ type: 'text', text: content.slice(last) });
      if (!parts.length) parts.push({ type: 'text', text: content });
      return parts;
    },
    isHtml(content) {
      if (!content) return false;
      return /<[a-z][^>]*>/i.test(content);
    },
    previewImage(images, index) {
      uni.previewImage({ current: index, urls: images });
    },
    // 部分微信基础库会把自定义组件事件参数包在 detail 中，统一解包并过滤无效参数
    normalizeMediaPayload(payload) {
      let item = payload;
      if (Array.isArray(item)) item = item[0];
      if (item && item.detail) {
        item = item.detail.__args__ || item.detail;
        if (Array.isArray(item)) item = item[0];
      }
      return item && (item.url || item.fullurl) ? item : null;
    },
    // 附件直接预览：按扩展名区分视频/音频/图片/文档，走对应预览
    openFile(payload) {
      const file = this.normalizeMediaPayload(payload);
      if (!file) return;
      const filename = file.filename || file.name || '附件文件';
      const fullurl = file.fullurl || file.url;
      if (!fullurl) return;
      this.openPreview({
        id: file.id || 'file',
        filename: filename,
        filetype: file.filetype || this.$tools.getFilePreviewType(filename),
        fullurl: fullurl,
        filesize: file.filesize || 0,
      });
    },
    // 直接触发预览（与课程资料预览弹窗一致）
    openPreview(option) {
      if (!option || !option.fullurl) return;
      // #ifdef MP-WEIXIN
      if (option.filetype == 'document') {
        this.$tools.openDocument(option.fullurl);
        return;
      }
      // #endif
      this.previewData = option;
      this.previewVisible = true;
    },
    formatFileSize(size) {
      size = Number(size) || 0;
      if (size < 1024) return size + 'B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(1) + 'KB';
      return (size / 1024 / 1024).toFixed(1) + 'MB';
    },
    mediaGridItems(post) {
      const m = (post && post.media) || {};
      const items = [];
      if (m.images) {
        m.images.forEach(url => {
          if (items.length < 9) items.push({ type: 'image', url });
        });
      }
      // 多视频优先，兼容历史单视频/扁平结构
      if (m.videos) {
        m.videos.forEach(v => {
          if (items.length < 9) items.push({ type: 'video', url: v.url, video_id: v.video_id || '', name: v.name || '视频', size: v.size || 0, post_id: post.id });
        });
      }
      if (m.url && (post.post_type == 'video' || m.media_type == 'video') && !(m.videos && m.videos.length)) {
        if (items.length < 9) items.push({ type: 'video', url: m.url, video_id: m.video_id || '', name: m.name || '视频', size: m.size || 0, post_id: post.id });
      }
      // 音频：与图片/视频同在九宫格展示；优先嵌套 media.audio（视频+音频混合），兼容历史扁平结构（media_type=audio）
      const audio = (m.audio && m.audio.url) ? m.audio : (m.url && (post.post_type == 'audio' || m.media_type == 'audio') ? m : null);
      if (audio && audio.url && items.length < 9) {
        items.push({ type: 'audio', url: audio.url, name: audio.name || '语音', size: audio.size || 0, post_id: post.id });
      }
      return items;
    },
    // 点击视频：预览弹窗播放（与详情一致，共用 tz-file-preview）
    async onPreviewVideo(payload) {
      const item = this.normalizeMediaPayload(payload);
      const fullurl = item && (item.url || item.fullurl);
      if (!item || !fullurl) return;
      const post = this.list.find(x => Number(x.id) === Number(item.post_id));
      const m = (post && post.media) || {};
      const option = {
        id: 'video',
        filename: item.name || item.filename || m.name || '视频',
        filetype: 'video',
        fullurl: fullurl,
        filesize: item.size || m.size || 0,
      };
      const marker = item.video_id || '';
      // #ifdef H5
      // H5 阿里云播放器需要 playAuth；微信小程序使用接口已返回的 fullurl 交给原生 video，
      // 不应让一次额外的授权请求失败阻断弹窗打开。
      if (/^alivod:/i.test(marker)) {
        // 售前/首页预览接口免登录，不向未加入圈子的访客签发私有视频凭证。
        if (this.mode == 'preview') {
          uni.showToast({ title: '加入圈子后可播放该视频', icon: 'none' });
          return;
        }
        const playData = await this.fetchVodPlayAuth(post && post.id, marker);
        if (!playData) return;
        option.vod_id = playData.video_id;
        option.playauth = playData.play_auth;
      }
      // #endif
      this.openPreview(option);
    },
    async fetchVodPlayAuth(postId, marker) {
      uni.showLoading({ title: '准备播放', mask: true });
      try {
        const res = await this.$api('circle.post.playAuth', {
          post_id: Number(postId || 0),
          video_id: marker,
        });
        if (!res || res.code !== 1 || !res.data || !res.data.play_auth || !res.data.video_id) {
          uni.showToast({ title: (res && res.msg) || '视频播放凭证获取失败', icon: 'none' });
          return null;
        }
        return res.data;
      } catch (e) {
        uni.showToast({ title: (e && e.msg) || '视频播放凭证获取失败', icon: 'none' });
        return null;
      } finally {
        uni.hideLoading();
      }
    },
    // 点击音频：预览弹窗播放（与详情一致，共用 tz-file-preview）
    onPreviewAudio(payload) {
      const item = this.normalizeMediaPayload(payload);
      const fullurl = item && (item.url || item.fullurl);
      if (!item || !fullurl) return;
      this.openPreview({
        id: 'audio',
        filename: item.name || item.filename || '语音',
        filetype: 'audio',
        fullurl: fullurl,
        filesize: item.size || 0,
      });
    },
    fileList(post) {
      const files = [];
      const media = (post && post.media) || {};
      const mainUrl = media.fullurl || media.url;
      if (mainUrl && (post.post_type == 'file' || media.media_type == 'file')) {
        const filename = media.filename || media.name || '附件文件';
        files.push({ id: 'file', filename: filename, filetype: media.filetype || this.$tools.getFilePreviewType(filename), fullurl: mainUrl, filesize: media.filesize || media.size || 0 });
      }
      (media.files || []).forEach((f, i) => {
        if (files.length >= 3 || !f) return;
        const filename = f.filename || f.name || '附件文件';
        const fullurl = f.fullurl || f.url;
        if (!fullurl) return;
        files.push({ id: 'file-' + i, filename: filename, filetype: f.filetype || this.$tools.getFilePreviewType(filename), fullurl: fullurl, filesize: f.filesize || f.size || 0 });
      });
      return files;
    },
    // 问答卡片：圈主的回答评论（is_owner）
    questionAnswer(post) {
      if (!post || post.post_type !== 'question') return null;
      return (post.comments || []).find(c => c.is_owner == 1) || null;
    },
    // 评论预览：问答卡片的圈主回答不再出现在评论预览中
    previewComments(post) {
      if (post.post_type == 'question') {
        return (post.comments || []).filter(c => c.is_owner != 1);
      }
      return post.comments || [];
    },
    sharePost(post) {
      this.shareVal = post.id;
      this.shareVisible = true;
    },
    // 点击底部回复按钮：弹出评论弹窗（评论列表 + 回复框）
    openComment(post) {
      this.commentPostId = post.id;
      this.commentVisible = true;
    },
    // 评论数变化：只更新当前动态卡片的评论数，不刷新整个列表（弹窗内已自行加载该动态评论数据）
    onPosted() {
      const p = this.list.find(x => Number(x.id) === Number(this.commentPostId));
      if (p) p.comment_count = Number(p.comment_count || 0) + 1;
    },
    onDeleted() {
      const p = this.list.find(x => Number(x.id) === Number(this.commentPostId));
      if (p) p.comment_count = Math.max(0, Number(p.comment_count || 0) - 1);
    },
    openMore(post) {
      this.currentPost = post;
      this.moreVisible = true;
    },
    onMoreAction(action) {
      if (!this.currentPost) return;
      if (action.name === '编辑') {
        this.$nav.to('/pages/app/circle/post/publish?circle_id=' + this.currentPost.circle_id + '&type=' + this.currentPost.post_type + '&id=' + this.currentPost.id);
        return;
      }
      if (action.name === '删除') {
        uni.showModal({
          title: '提示', content: '确定删除这条动态吗？',
          success: async (res) => {
            if (!res.confirm) return;
            const ret = await this.$api('circle.post.del', { id: this.currentPost.id });
            if (ret.code === 1) {
              uni.showToast({ title: '删除成功', icon: 'success' });
              this.$emit('refresh');
            } else uni.showToast({ title: ret.msg || '删除失败', icon: 'none' });
          }
        });
      }
    },
    onCard(post) {
      // 兜底：列表中的异常条目（无 id）禁止进入详情页，避免 ?id=undefined 触发 动态不存在
      if (!post || !post.id) return;
      // 预览模式（售前页/自定义页展示）：默认不跳转；自定义页传 clickable 开启点击进详情（与 full 模式一致 emit comment）
      if (this.mode == 'preview') {
        if (this.clickable) this.$emit('comment', post);
        return;
      }
      this.$emit('comment', post);
    },
    // 卡片脚点赞：交由页面处理接口并更新列表项
    onLike(post) {
      if (!post || !post.id) return;
      this.$emit('like', post);
    },
    // 评论弹窗已完成接口调用，这里只同步弹窗与卡片列表的点赞状态，避免重复请求/反向取消点赞
    onPopupLike(post) {
      if (!post || !post.id) return;
      const p = this.list.find(x => Number(x.id) === Number(post.id));
      if (p) {
        p.liked = post.liked;
        p.like_count = post.like_count;
        p.like_users = (post.like_users || []).slice();
      }
    }
  }
};
</script>

<style scoped>
.circle-post-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.post-card {
  background: #fff;
  padding: 12px;
}
.post-card-round {
  border-radius: 4px;
}
.post-card-border {
  border: 1px solid #f0f3f5;
}
.tag {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
}
.tag-owner {
  color: #fff;
  background: #ff7d00;
}
.tag-essence {
  color: #fff;
  background: #f53f3f;
}
.tag-top {
  color: #fff;
  background: #0968f6;
}
.post-content {
  margin-top: 8px;
  font-size: 14px;
  color: #1d2129;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
.post-content .topic {
  color: #576b95;
}
.post-media {
  margin-top: 8px;
}
.post-video {
  width: 100%;
  height: 180px;
  border-radius: 4px;
}
.post-course-mini {
  margin-top: 8px;
}
.like-users {
  margin-top: 8px;
  background: #f7f8fa;
  border-radius: 4px;
  padding: 6px 8px;
}
.like-users-text {
  font-size: 11px;
  color: #4e5969;
}
.post-foot {
  margin-top: 12px;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f2f3f5;
  padding-top: 10px;
}
.foot-item {
  display: flex;
  align-items: center;
  min-height: 18px;
  line-height: 18px;
  gap: 4px;
}
.foot-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  line-height: 18px;
  flex: none;
}
.foot-text {
  font-size: 13px;
  display: flex;
  align-items: center;
  height: 18px;
  line-height: 18px;
  color: #86909c;
}
.comment-preview {
  margin-top: 8px;
  background: #f7f8fa;
  border-radius: 6px;
  padding: 8px;
}
.comment-item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 4px;
}
/* 评论头部与正文尽量同一行展示（flex + wrap 内联流，纯空白文本节点不渲染为 flex item），超出自然换行 */
.comment-item-head {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
}
.comment-user {
  color: #576b95;
}
.comment-text {
  color: #1d2129;
}
.comment-more {
  font-size: 14px;
  color: #0968f6;
  margin-top: 2px;
}

/* 列表卡片样式：独立卡片、九宫格媒体、文件列表、评论回复 */
.circle-post-list { gap: 0; }
.post-card {
  background: #fff;
  padding: 12px 14px 13px;
  margin-bottom: 8px;
  border-bottom: 0;
}
.tag { flex: none; font-size: 10px; line-height: 13px; padding: 0 3px; border-radius: 2px; font-weight: 500; }
.tag-owner { color: #3478be; border: 0.5px solid #78a9d4; background: #f4f9fd; }
.tag-essence { color: #ef963d; background: #fff7ee; }
.tag-top { color: #d86a64; background: #fff1f0; }
.tag-notice { color: #ff7d00; background: #fff7e8; }
.tag-answered { color: #00b42a; background: #e8ffea; }
.tag-waiting { color: #ff7d00; background: #fff7e8; }
.post-content { margin: 9px 0 0 42px; font-size: 14.5px; color: #313943; line-height: 1.7; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; overflow: hidden; white-space: normal; }
/* 文本超出 4 行时的「查看更多」按钮 */
.post-more { margin: 4px 0 0 42px; font-size: 14px; color: #0968f6; }
.post-content .topic { color: #576b95; }
/* 动态内 rich-text 默认 14px（与详情页正文一致） */
.post-richtext { font-size: 14px; }

/* 问答卡片：提问卡片 */
.question-answer-card {
  margin: 9px 0 0 42px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 9px 10px;
  border-radius: 6px;
  background: #f6f8fb;
}
.question-answer-label {
  flex: none;
  color: #0968f6;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}
.question-answer-content {
  flex: 1;
  min-width: 0;
  color: #505963;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
}
.post-answer-text {
  color: #313943;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 九宫格媒体（图片+视频+音频） */
/* 共用组件在卡片内的缩进：媒体九宫格由内部 .post-media-grid 负责 42px 左缩进，文件列表由外层负责；上间距统一 10px */
.card-media-margin { margin-top: 10px; }
.card-file-margin { margin: 10px 0 0 42px; }

/* 文件列表（最多 3 个） */

.post-course-mini {
  margin: 8px 0 0 42px;
}
.like-users { margin: 10px 0 0 42px; display: flex; align-items: center; gap: 4px; padding: 0; background: transparent; }
.like-users-text { flex: 1; font-size: 13.5px; color: #4d77a6; line-height: 1.45; }
.post-foot { margin: 10px 0 0 42px; justify-content: flex-start; gap: 36px; border-top: 0; padding-top: 0; }
.foot-text { font-size: 13.5px; }
.comment-preview { margin: 9px 0 0 42px; padding: 0; background: transparent; }
.comment-item { font-size: 14px; line-height: 1.65; margin-bottom: 1px; }
.comment-user { color: #4c78a7; font-weight: 500; }
.comment-reply-tag { color: #4a4f57; }
.comment-split { color: #4a4f57; }
.comment-media { color: #86909c; margin-right: 3px; }
.comment-text { color: #4a4f57; min-width: 0; word-break: break-all; }
.comment-richtext { color: #4a4f57; font-size: 14px; line-height: 1.65; word-break: break-all; min-width: 0; }
.comment-more { margin-top: 3px; font-size: 14px; color: #4c78a7; }
</style>
