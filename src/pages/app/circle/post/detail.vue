<template>
  <view class="post-detail">
    <!-- 加载骨架屏 -->
    <view v-if="loading" class="post-skeleton">
      <view class="sk-main">
        <view class="sk-head">
          <view class="sk-avatar"></view>
          <view class="sk-head-info">
            <view class="sk-line sk-w-40"></view>
            <view class="sk-line sk-w-20"></view>
          </view>
        </view>
        <view class="sk-line"></view>
        <view class="sk-line sk-w-80"></view>
        <view class="sk-line sk-w-60"></view>
        <view class="sk-grid">
          <view class="sk-grid-item" v-for="i in 6" :key="i"></view>
        </view>
      </view>
      <view class="sk-block">
        <view class="sk-line sk-w-60"></view>
      </view>
      <view class="sk-block">
        <view class="sk-line sk-w-30"></view>
        <view class="sk-comment" v-for="i in 3" :key="i">
          <view class="sk-avatar sk-avatar-sm"></view>
          <view class="sk-comment-body">
            <view class="sk-line sk-w-30"></view>
            <view class="sk-line"></view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="!loading && post">
      <!-- 动态主体 -->
      <view class="post-main">
        <!-- 动态头部（共用组件，与动态列表卡片一致）；meta 由 postMeta 组装：浏览量隐藏时仅显示时间 -->
        <tz-circle-post-head :post="post" :meta="postMeta" @more="showAction = true" @user="goUserHome">
          <template v-slot:tags>
            <text v-if="post.is_owner" class="tag-owner">圈主</text>
          </template>
        </tz-circle-post-head>
        <view v-if="post.post_type == 'question' && questionAnswer" class="question-answer-card" @tap="answerPopup = true">
          <text class="question-answer-label">提问</text>
          <text class="question-answer-content">{{ post.content || '查看提问内容' }}</text>
          <text class="question-answer-more">查看 ›</text>
        </view>
        <!-- 正文：HTML 内容走 u-parse；纯文本用 text 渲染保留换行（u-parse 会合并换行为空格） -->
        <u-parse v-if="contentIsHtml" class="post-content" :content="postContent" :selectable="post.content_protect != 1"></u-parse>
        <view v-else class="post-content" :selectable="post.content_protect != 1"><text>{{ postContent }}</text></view>
        <!-- 图片/视频九宫格（共用组件，与动态列表卡片一致） -->
        <tz-circle-media-grid class="detail-media-margin" v-if="mediaGrid.length" :items="mediaGrid" @preview-image="onPreviewMediaImages" @preview-video="openVideoPreview" @preview-audio="openAudioPreview" />
        <!-- 文件列表（共用组件，与动态列表卡片一致） -->
        <view class="detail-file-margin" v-if="mediaFiles.length">
          <tz-circle-file-list :files="mediaFiles" @open="openFilePreview" />
        </view>
        <!-- 课程/直播卡片：支持多课程数组 -->
        <view v-if="post.post_type == 'course' && courseList.length" class="post-course-mini" @tap.stop>
          <tz-course-mini :list="courseList" :round="true" :border="true" :margin="0" />
        </view>
      </view>

      <!-- 点赞区 -->
      <view class="like-section" v-if="post.like_users && post.like_users.length">
        <tz-icon name="like_fill" :size="16" color="#f53f3f" />
        <text class="like-text">{{ post.like_users.join('、') }} 等{{ post.like_count }}人觉得很赞</text>
      </view>

      <!-- 评论区（共用组件：排序/列表/空状态与评论弹窗完全一致；loading/loaded 控制排序切换时的骨架屏） -->
      <view class="comment-section">
        <tz-circle-comment-list :post="post" :loading="commentsLoading" :loaded="commentsLoaded" @sort-change="onSortChange" @reply="replyComment" @del="delComment" @like="toggleCommentLike" />
      </view>

      <!-- 底部操作栏（共用组件：评论入口 + 点赞 + 分享，与评论弹窗底部一致；点击入口弹出回复评论弹窗） -->
      <tz-circle-comment-bar :post="post" fixed @open="openReplyBar" @like="toggleLike" @share="openShare" />
    </view>

    <!-- 动态不存在/参数缺失空状态（避免白屏 + 避免 ?id=undefined 触发无意义请求） -->
    <view v-if="!loading && notFound" class="post-detail-empty">
      <u-empty :text="loadMsg || '动态不存在或已删除'" icon="/static/image/empty.png" width="70" height="70" margin-top="80"></u-empty>
    </view>

    <!-- 操作菜单 -->
    <u-action-sheet :show="showAction" :actions="actions" cancelText="取消" :closeOnClickOverlay="true" @select="onAction" @close="showAction = false"></u-action-sheet>

    <u-popup :show="answerPopup" mode="bottom" :round="16" :safeAreaInsetBottom="true" @close="answerPopup = false">
      <view class="answer-popup" v-if="questionAnswer">
        <view class="answer-popup-title">用户提问</view>
        <view class="answer-popup-user">{{ post.nickname }} · {{ post.createtime_text }}</view>
        <u-parse class="answer-popup-content" :content="post.content || ''" :selectable="true"></u-parse>
        <view class="comment-images" v-if="post.media && post.media.images && post.media.images.length">
          <template v-for="(img, i) in post.media.images">
            <image v-if="!answerImgErrors[i]" :key="i" :src="img" class="comment-image" mode="aspectFill" @tap="previewImage(i)" @error="onAnswerImgError(i)" />
            <view v-else :key="i" class="comment-image comment-image-error" @tap="previewImage(i)">
              <tz-icon name="tupian" :size="24" color="#c9cdd4" />
            </view>
          </template>
        </view>
      </view>
    </u-popup>

    <!-- 回复评论弹窗（共用组件，与评论弹窗打开方式一致：open(replyTo)；发送成功刷新详情） -->
    <tz-circle-reply-popup ref="replyPopup" :post="post" @posted="load" />

    <!-- 删除评论二次确认：必须用 u-modal 且放在 u-popup 之后（同为 z-index 10075，DOM 靠后层级在上）；
         不能再用 uni.showModal——H5 端 uni-modal z-index 仅 999，确认弹窗会被评论弹窗遮挡 -->
    <u-modal
      :show="delConfirmVisible"
      title="提示"
      content="确定删除该评论吗？"
      :showCancelButton="true"
      confirmText="删除"
      cancelText="取消"
      confirmColor="#f53f3f"
      @confirm="confirmDelComment"
      @cancel="cancelDelComment"
    />

    <share-modal :val="shareVal" type="circle_post" :visible="shareVisible" @close="shareVisible = false" />
    <!-- 附件预览（通用弹窗组件，支持图片/视频/音频/文档） -->
    <tz-file-preview :visible="filePreviewVisible" :data="previewData" @close="filePreviewVisible = false" />
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script>
import shareModal from '@/components/modal/share-modal.vue';

var that;

export default {
  components: { shareModal },
  data() {
    return {
      id: 0,
      loading: true,
      notFound: false,
      loadMsg: '',
      post: null,
      showAction: false,
      actions: [{ name: '编辑' }, { name: '删除', color: '#f53f3f' }],
      // 评论区排序（默认/最新/最早）：切换时调用独立评论列表接口（commentList）
      commentSort: 'default',
      // 评论区加载状态：初载评论随详情一起返回，无需骨架屏；切换排序请求 commentList 时置 loading 显示骨架屏
      commentsLoading: false,
      commentsLoaded: true,
      answerPopup: false,
      // 问答弹窗图片加载失败标记：按图片下标记录，失败用图标占位
      answerImgErrors: [],
      delConfirmVisible: false,
      delCommentTarget: null,
      shareVisible: false,
      shareVal: '',
      filePreviewVisible: false,
      previewData: null,
    };
  },
  onLoad(options) {
    that = this;
    that.id = Number(options.id || 0);
    // 参数缺失兜底：大概率是点头像/卡片时连带产生的多余跳转（?id=undefined 会请求 id=0 报 动态不存在），
    // 有上一页时直接返回，不闪跳、不发请求、不报错；无历史（如失效分享链接）则展示空状态
    if (!that.id) {
      that.loading = false;
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack();
      } else {
        that.notFound = true;
        that.loadMsg = '动态不存在或已删除';
      }
      return;
    }
    // 圈子插件未安装时兜底
    if (!that.$tools.systemConfig("app_isinstall_circle")) {
      uni.showToast({ title: "圈子功能未安装", icon: "none" });
      setTimeout(() => uni.navigateBack(), 1200);
      return;
    }
    that.load();
  },
  onUnload() {},
  // 下拉刷新：重新加载动态全文与评论（复用 load，失败时保留已加载内容）
  onPullDownRefresh() {
    that.load();
  },
  computed: {
    // 动态头部元信息：时间 + 阅读数；浏览量展示关闭（show_view_count=0）时仅显示时间
    postMeta() {
      const d = that.post;
      if (!d) return '';
      let meta = d.createtime_text || '';
      if (d.show_view_count) {
        meta += (meta ? ' · ' : '') + '阅读 ' + (d.view_count || 0);
      }
      return meta;
    },
    // 动态课程列表：兼容历史单课程对象与多课程数组
    courseList() {
      const d = that.post && that.post.link_data;
      if (!d) return [];
      return Array.isArray(d) ? d : [d];
    },
    mediaGrid() {
      if (!that.post || !that.post.media) return [];
      const list = [];
      const m = that.post.media;
      (m.images || []).forEach((url, i) => { list.push({ type: 'image', url, index: i }); });
      // 多视频优先，兼容历史单视频/扁平结构
      (m.videos || []).forEach(v => {
        if (list.length < 9) list.push({ type: 'video', url: v.url, video_id: v.video_id || '', name: v.name || '视频', size: v.size || 0 });
      });
      if (m.url && (that.post.post_type == 'video' || m.media_type == 'video') && !(m.videos && m.videos.length)) {
        list.push({ type: 'video', url: m.url, video_id: m.video_id || '', name: m.name || '视频', size: m.size || 0 });
      }
      // 音频：与图片/视频同在媒体九宫格展示；优先嵌套 media.audio（视频+音频混合），兼容历史扁平结构（media_type=audio）
      const audio = (m.audio && m.audio.url) ? m.audio : (m.url && (that.post.post_type == 'audio' || m.media_type == 'audio') ? m : null);
      if (audio && audio.url) {
        list.push({ type: 'audio', url: audio.url, name: audio.name || '语音', size: audio.size || 0 });
      }
      return list;
    },
    mediaFiles() {
      if (!that.post || !that.post.media) return [];
      const list = [];
      const m = that.post.media;
      if (m.url && (that.post.post_type == 'file' || m.media_type == 'file')) {
        list.push({ id: 'file', filename: m.name || '附件文件', filetype: that.$tools.getFilePreviewType(m.name), fullurl: m.url, filesize: m.size || 0 });
      }
      (m.files || []).forEach((f, i) => {
        list.push({ id: 'file-' + i, filename: f.name || '附件文件', filetype: that.$tools.getFilePreviewType(f.name), fullurl: f.url, filesize: f.size || 0 });
      });
      return list;
    },
    // 问答动态：圈主回答在动态正文中展示，不重复出现在评论列表（评论区列表逻辑在共用组件 circle-comment-list 内）
    questionAnswer() {
      if (!that.post || that.post.post_type !== 'question') return null;
      return (that.post.comments || []).find(comment => comment.is_owner == 1) || null;
    },
    // 正文内容（问答动态展示圈主回答）
    postContent() {
      const qa = that.questionAnswer;
      return (qa ? qa.content : (that.post && that.post.content)) || '';
    },
    // 正文是否为富文本（与列表卡片一致：含标签按 HTML 渲染，否则按纯文本保留换行）
    contentIsHtml() {
      const c = that.postContent;
      return /<[a-z][^>]*>/i.test(c);
    },
  },
  methods: {
    // 评论区排序切换：记录所选排序并调用独立评论列表接口（只拉评论，避免重拉详情导致浏览量 +1）
    onSortChange(sort) {
      that.commentSort = sort;
      that.loadComments();
    },
    async loadComments() {
      // 请求期间展示评论区骨架屏（与评论弹窗排序切换一致）
      that.commentsLoading = true;
      that.commentsLoaded = false;
      let res;
      try {
        res = await that.$api('circle.post.commentList', { post_id: that.id, sort: that.commentSort });
      } catch (e) {
        // 请求异常：恢复旧列表展示（不清空），避免骨架屏卡死
        that.commentsLoading = false;
        that.commentsLoaded = !!that.post;
        uni.showToast({ title: '加载失败，请重试', icon: 'none' });
        return;
      }
      that.commentsLoading = false;
      that.commentsLoaded = true;
      if (res.code === 1 && that.post) {
        that.post.comments = res.data || [];
      }
    },
    goUserHome(post) {
      if (!post || !post.user_id) return;
      that.$nav.to('/pages/app/circle/user/home?circle_id=' + post.circle_id + '&user_id=' + post.user_id);
    },
    async load() {
      const res = await that.$api('circle.post.detail', { id: that.id });
      if (res.code === 1) {
        const d = res.data;
        d.createtime_text = that.formatTime(d.createtime);
        (d.comments || []).forEach(c => { c.createtime_text = that.formatTime(c.createtime); });
        that.post = d;
        // 问答弹窗图片加载失败标记随动态重置（避免换动态后旧下标残留占位）
        that.answerImgErrors = [];
        that.loading = false;

        // #ifdef H5
        // 圈子动态分享：内容摘要为标题、首图为封面（无图由分享层回退系统 logo）
        let shareText = '';
        if (d.content) {
          shareText = String(d.content).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 30);
        }
        let shareCover = (d.media && d.media.images && d.media.images[0]) || '';
        this.$nav.share(shareText, '', shareCover);
        // #endif
      } else {
        // 圈子访问状态由后端 data.access 下发（not_member/expired/black），不再依赖 403 状态码
        const access = (res.data && res.data.access) || '';
        if (access === 'not_member' || access === 'expired' || res.code === 403 || (res.msg && res.msg.indexOf('成员') > -1)) {
          // 非成员/权限过期：弹窗引导跳转售前页（circle_id 由后端错误 data 返回）
          that.notFound = false;
          that.loading = false;
          const circleId = (res.data && res.data.circle_id) || '';
          uni.showModal({
            title: '提示',
            content: res.msg || '你还不是圈子成员，请先加入圈子',
            showCancel: false,
            success: () => {
              if (circleId) {
                that.$nav.to('/pages/app/circle/presale/presale?id=' + circleId);
              } else {
                uni.navigateBack();
              }
            }
          });
        } else if (access === 'black') {
          // 黑名单：展示空状态与封禁文案（不跳售前页，避免与售前页自动进入形成循环）
          that.notFound = true;
          that.loading = false;
          that.loadMsg = res.msg || '你已被限制访问该动态';
        } else {
          // 下拉刷新失败：已加载内容保留；仅初始加载失败才展示空状态
          if (!that.post) {
            that.notFound = true;
            that.loadMsg = res.msg || '动态不存在或已删除';
          }
          uni.showToast({ title: res.msg || '动态不存在', icon: 'none' });
          that.loading = false;
        }
      }
      uni.stopPullDownRefresh();
    },
    formatTime(ts) {
      if (!ts) return '';
      const d = new Date(Number(ts) * 1000);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    },
    previewImage(index) {
      uni.previewImage({ current: index, urls: that.post.media.images });
    },
    // 问答弹窗图片加载失败：记录失败标记，用图标占位替代
    onAnswerImgError(index) {
      that.$set(that.answerImgErrors, index, true);
    },
    // 图片九宫格点击（共用组件 circle-media-grid 事件）：按格内图片列表预览
    onPreviewMediaImages(images, index) {
      uni.previewImage({ current: index, urls: images });
    },
    // 兼容微信基础库将自定义组件事件参数放在 detail 中的情况
    normalizeMediaPayload(payload) {
      let item = payload;
      if (Array.isArray(item)) item = item[0];
      if (item && item.detail) {
        item = item.detail.__args__ || item.detail;
        if (Array.isArray(item)) item = item[0];
      }
      return item && (item.url || item.fullurl) ? item : null;
    },
    // 视频走预览弹窗播放（与动态列表/附件预览共用 tz-file-preview）
    async openVideoPreview(payload) {
      const item = that.normalizeMediaPayload(payload);
      const fullurl = item && (item.url || item.fullurl);
      if (!item || !fullurl) return;
      const m = (that.post && that.post.media) || {};
      const option = {
        id: 'video',
        filename: item.name || item.filename || m.name || '视频',
        filetype: 'video',
        fullurl: fullurl,
        filesize: item.size || m.size || 0,
      };
      const marker = item.video_id || '';
      // #ifdef H5
      // 只有 H5 阿里云播放器消费 playAuth；小程序原生 video 直接播放 fullurl。
      if (/^alivod:/i.test(marker)) {
        uni.showLoading({ title: '准备播放', mask: true });
        try {
          const res = await that.$api('circle.post.playAuth', {
            post_id: Number(that.id || 0),
            video_id: marker,
          });
          if (!res || res.code !== 1 || !res.data || !res.data.play_auth || !res.data.video_id) {
            uni.showToast({ title: (res && res.msg) || '视频播放凭证获取失败', icon: 'none' });
            return;
          }
          option.vod_id = res.data.video_id;
          option.playauth = res.data.play_auth;
        } catch (e) {
          uni.showToast({ title: (e && e.msg) || '视频播放凭证获取失败', icon: 'none' });
          return;
        } finally {
          uni.hideLoading();
        }
      }
      // #endif
      that.previewData = option;
      that.filePreviewVisible = true;
    },
    // 音频走预览弹窗播放（与视频/附件预览共用 tz-file-preview）
    openAudioPreview(payload) {
      const item = that.normalizeMediaPayload(payload);
      const fullurl = item && (item.url || item.fullurl);
      if (!item || !fullurl) return;
      that.previewData = {
        id: 'audio',
        filename: item.name || item.filename || '语音',
        filetype: 'audio',
        fullurl: fullurl,
        filesize: item.size || 0,
      };
      that.filePreviewVisible = true;
    },
    // 附件直接预览（与动态列表一致）：小程序文档直接打开，其余走预览弹窗
    openFilePreview(payload) {
      const item = that.normalizeMediaPayload(payload);
      const fullurl = item && (item.fullurl || item.url);
      if (!item || !fullurl) return;
      // #ifdef MP-WEIXIN
      if (item.filetype == 'document') {
        that.$tools.openDocument(fullurl);
        return;
      }
      // #endif
      that.previewData = Object.assign({}, item, { fullurl: fullurl });
      that.filePreviewVisible = true;
    },
    // 点击底部评论入口：清空回复对象，弹出回复评论弹窗（共用组件，与评论弹窗一致）
    openReplyBar() {
      that.$refs.replyPopup.open(null);
    },
    // 点击评论条目/回复按钮：设置回复对象并弹出回复评论弹窗
    replyComment(c) {
      that.$refs.replyPopup.open({ id: c.id, user_id: c.user_id, nickname: c.nickname });
    },
    openShare() {
      that.shareVal = that.post.id;
      that.shareVisible = true;
    },
    async toggleCommentLike(c) {
      const api = c.liked == 1 ? 'circle.post.unlike' : 'circle.post.like';
      const res = await that.$api(api, { target_type: 'comment', target_id: c.id });
      if (res.code === 1) {
        c.liked = c.liked == 1 ? 0 : 1;
        c.like_count = Math.max(0, Number(c.like_count || 0) + (c.liked == 1 ? 1 : -1));
      } else {
        uni.showToast({ title: res.msg || '操作失败', icon: 'none' });
      }
    },
    delComment(c) {
      that.delCommentTarget = c;
      that.delConfirmVisible = true;
    },
    cancelDelComment() {
      that.delCommentTarget = null;
      that.delConfirmVisible = false;
    },
    async confirmDelComment() {
      const c = that.delCommentTarget;
      that.cancelDelComment();
      if (!c) return;
      uni.showLoading({ title: '删除中', mask: true });
      const res = await that.$api('circle.post.delComment', { id: c.id });
      uni.hideLoading();
      if (res.code === 1) {
        that.load();
      } else {
        uni.showToast({ title: res.msg, icon: 'none' });
      }
    },
    async toggleLike() {
      const api = that.post.liked == 1 ? 'circle.post.unlike' : 'circle.post.like';
      const res = await that.$api(api, { target_type: 'post', target_id: that.id });
      if (res.code === 1) {
        const isLiked = that.post.liked == 1 ? 0 : 1;
        const userInfo = uni.getStorageSync('user_info') || {};
        const nickname = userInfo.nickname || '我';
        that.post.liked = isLiked;
        that.post.like_count = Math.max(0, Number(that.post.like_count || 0) + (isLiked == 1 ? 1 : -1));
        if (!that.post.like_users) that.post.like_users = [];
        const idx = that.post.like_users.indexOf(nickname);
        if (isLiked == 1 && idx === -1) {
          that.post.like_users.unshift(nickname);
        } else if (isLiked == 0) {
          if (idx > -1) {
            that.post.like_users.splice(idx, 1);
          }
          // 兜底：本地昵称与后端昵称不一致导致未移除时，数量归零则清空点赞人列表，避免"等0人"
          if (that.post.like_count <= 0) {
            that.post.like_users = [];
          }
        }
      } else {
        uni.showToast({ title: res.msg, icon: 'none' });
      }
    },
    onAction(e) {
      if (e.name == '编辑') {
        that.showAction = false;
        that.$nav.to('/pages/app/circle/post/publish?circle_id=' + that.post.circle_id + '&type=' + that.post.post_type + '&id=' + that.id);
        return;
      }
      if (e.name == '删除') {
        uni.showModal({
          title: '提示',
          content: '确定删除该动态吗？',
          success: async (r) => {
            if (!r.confirm) return;
            uni.showLoading({ title: '删除中', mask: true });
            const res = await that.$api('circle.post.del', { id: that.id });
            uni.hideLoading();
            if (res.code === 1) {
              uni.showToast({ title: '删除成功', icon: 'success' });
              setTimeout(() => uni.navigateBack(), 600);
            } else {
              uni.showToast({ title: res.msg, icon: 'none' });
            }
          }
        });
      }
    }
  },
  onShareAppMessage() {
    let text = '';
    if (that.post && that.post.content) {
      text = that.post.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 30);
    }
    // 第二参数为 desc 不能传路径；封面取动态首图，无图时分享层自动回退系统 logo
    const cover = (that.post && that.post.media && that.post.media.images && that.post.media.images[0]) || '';
    return this.$nav.share(text, '', cover);
  }
};
</script>

<style>
.post-detail {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}
.post-detail-empty {
  min-height: 70vh;
  background: #f7f8fa;
}
/* 加载骨架屏 */
.post-skeleton {
  background: #f7f8fa;
  min-height: 100vh;
}
.sk-main {
  background: #fff;
  padding: 12px 14px;
}
.sk-head {
  display: flex;
  align-items: center;
}
.sk-avatar {
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f1f2f4 25%, #e6e6e6 37%, #f1f2f4 50%);
  background-size: 400% 100%;
  animation: sk-animate 1.8s ease infinite;
}
.sk-avatar-sm {
  width: 28px;
  height: 28px;
}
.sk-head-info {
  flex: 1;
  min-width: 0;
  margin-left: 8px;
}
.sk-line {
  height: 15px;
  border-radius: 3px;
  margin-top: 10px;
  background: linear-gradient(90deg, #f1f2f4 25%, #e6e6e6 37%, #f1f2f4 50%);
  background-size: 400% 100%;
  animation: sk-animate 1.8s ease infinite;
}
.sk-w-80 { width: 80%; }
.sk-w-60 { width: 60%; }
.sk-w-40 { width: 40%; }
.sk-w-30 { width: 30%; }
.sk-w-20 { width: 20%; }
.sk-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 12px;
}
.sk-grid-item {
  width: calc((100% - 8px) / 3);
  height: 0;
  padding-bottom: calc((100% - 8px) / 3);
  border-radius: 4px;
  background: linear-gradient(90deg, #f1f2f4 25%, #e6e6e6 37%, #f1f2f4 50%);
  background-size: 400% 100%;
  animation: sk-animate 1.8s ease infinite;
}
.sk-block {
  background: #fff;
  margin-top: 8px;
  padding: 12px 14px;
}
.sk-comment {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 14px;
}
.sk-comment-body {
  flex: 1;
  min-width: 0;
}
@keyframes sk-animate {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
.post-main {
  background: #fff;
  padding: 12px;
}
.tag-owner {
  font-size: 10px;
  color: #fff;
  background: #ff7d00;
  padding: 1px 5px;
  border-radius: 4px;
}
.post-content {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: #1d2129;
  white-space: pre-wrap;
  word-break: break-all;
}
/* 共用组件在详情页的间距：媒体九宫格/文件列表（样式本体在 circle-media-grid / circle-file-list 内） */
.detail-media-margin { margin-top: 10px; }
.detail-file-margin { margin-top: 10px; }
.like-section {
  background: #fff;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.like-text {
  font-size: 12px;
  color: #4e5969;
}
.comment-section {
  background: #fff;
  margin-top: 8px;
  padding: 12px;
}
.sort-toggle {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #86909c;
  padding: 2px 6px;
}
.sort-arrow {
  font-size: 11px;
}

/* 问答弹窗图片（评论列表/底部操作栏样式已抽到共用组件 circle-comment-list / circle-comment-bar / circle-reply-popup） */
.comment-images { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.comment-image { width: 90px; height: 90px; border-radius: 5px; }
/* 图片加载失败占位：浅灰底 + 居中图标（与评论列表 comment-image-error 一致） */
.comment-image-error { display: flex; align-items: center; justify-content: center; background: #f2f3f5; }
.question-answer-card { display: flex; align-items: center; gap: 7px; margin-top: 12px; padding: 10px; border-radius: 6px; background: #f6f8fb; }
.question-answer-label { flex: none; color: #0968f6; font-size: 12px; font-weight: 600; }
.question-answer-content { flex: 1; overflow: hidden; color: #505963; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.question-answer-more { flex: none; color: #8b949e; font-size: 11.5px; }
.answer-popup { min-height: 150px; padding: 16px 14px; }
.answer-popup-title { color: #1d2129; font-size: 14px; font-weight: 600; }
.answer-popup-user { margin-top: 7px; color: #929aa4; font-size: 11.5px; }
.answer-popup-content { margin-top: 14px; color: #363d45; font-size: 14.5px; line-height: 1.7; white-space: pre-wrap; }
.post-course-mini { margin-top: 8px; }
</style>
