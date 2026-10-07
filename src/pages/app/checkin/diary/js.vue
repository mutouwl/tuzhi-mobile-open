<script>
import { diaryTitle, diaryCover, applyH5Share, mpCard } from "@/common/utils/checkin-share";
import { goOwnerRecord } from "@/common/utils/checkin-owner";
import shareModal from "@/components/modal/share-modal.vue";
var that;
export default {
  components: { shareModal },
  data() {
    return {
      id: 0,
      checkinId: 0,
      loading: true,
      detail: {},
      loadMsg: "",
      comments: [],
      // 评论列表加载失败的原因：空态要把「加载失败」和「还没有评论」分开说，不能都报成没评论（M13）
      commentsMsg: "",
      // 共用评论列表组件的加载态：拉取中显示组件自带的骨架屏，拉完才显示列表或空态（M16）
      commentsLoading: true,
      commentsLoaded: false,
      // 评论区排序（default/latest/earliest）：组件内部记住选中态并 emit sort-change，本页带着它重取列表，
      // 排序由 commentList 接口落 SQL（与动态详情同一口径，前端不在本地重排）
      commentSort: "default",
      checkinTitle: "",
      daySeq: 0,
      dailyShow: false,
      // 「日签图」要等这条日记的详情（金句库/底图/累计天数）到手才弹，链接的预取在弹层自己（tz-checkin-daily-card）
      autoDaily: false,
      moreVisible: false,
      // 底栏「分享」的分享弹窗开关（分享这个打卡活动，与打卡主页/打卡记录页同一份 share-modal）
      shareVisible: false,
      // 媒体预览弹窗（视频/语音点击后播放，与动态详情共用 tz-file-preview；图片走系统 previewImage，不经弹窗）
      previewVisible: false,
      previewData: null,
    };
  },
  computed: {
    // 微信分享卡片（详情页口径）：日记本身没有标题，标题取正文摘要、封面取日记首图，
    // 无正文/无图时逐级回退（昵称的打卡日记 → 活动名 → 「打卡日记」；日记封面 → 活动封面 → 站点 logo）
    shareTitle() {
      return diaryTitle(this.detail, "打卡日记");
    },
    shareCover() {
      return diaryCover(this.detail);
    },
    headPost() {
      // is_mine 一起传过去：右上角「更多」入口的显示判据在 tz-circle-post-head 里就是 post.is_mine
      // （圈子口径），本页不自造第二道判据
      return { avatar: this.detail.avatar || '/static/image/default-avatar.png', nickname: this.detail.nickname, is_mine: this.detail.is_mine };
    },
    // 底部栏复用圈子底栏组件：它按动态口径读 liked / like_count，这里把日记字段映射过去
    barPost() {
      return { id: this.detail.id, liked: this.detail.is_liked, like_count: this.detail.like_count || 0 };
    },
    // 回复弹窗的目标参数：打卡日记评论接口按 checkin_id + record_id 定位
    commentTarget() {
      return { checkin_id: this.checkinId, record_id: this.id };
    },
    // 共用评论列表按动态口径从 post.comments 取行：评论是独立接口拉的，这里把本页 comments 挂成
    // 同形状的主体传过去，组件不必为打卡另开一条取数路径
    commentSubject() {
      return { comments: this.comments };
    },
    // 底栏点赞位带具体赞数（复用组件前这里就是「心形 + 数字」，不因为换组件把数丢掉）
    likeText() {
      const n = Number(this.detail.like_count) || 0;
      return n ? '点赞 ' + n : '点赞';
    },
    /**
     * 管理端「打卡设置 → 发布设置 → 允许用户发布评论」：关闭后底栏评论入口置灰、点击给原因
     * （判据取 diaryDetail 下发的这一枚，字段缺失按允许；与详情弹窗、动态栏评论弹窗同一份后端值）
     */
    canComment() {
      return !this.detail || Number(this.detail.allow_user_comment) !== 0;
    },
    // 更多菜单三项全是「本人对自己这条动态」的动作：日签图画的是本人这一条打卡记录的天数、头像与昵称，
    // 挂在别人的动态上等于拿他的记录生成一张海报（2026-09-26 用户口径：日签图仅自己可见）。
    // 于是别人的动态这一档菜单是空的，入口随之不出（见模板的 show-more 与组件的 post.is_mine 判据），
    // 不留一枚点开只剩「取消」的更多按钮。
    // 菜单项不叫「分享」：分享弹窗在底栏（share-modal），这里只出日签图，两项各叫各的名。
    moreActions() {
      if (this.detail.is_official || !this.detail.is_mine) return [];
      // 顺序照圈子动态详情的「编辑 / 删除」，与后端 editOwn/deleteOwn 的归属校验一致
      return [{ name: "日签图" }, { name: "编辑" }, { name: "删除", color: "#f53f3f" }];
    },
    // 动态类型标签：官方动态（is_official）在昵称行出标签，文字取后端 task_title（官方行下发「官方动态」），
    // 与动态卡的 typeTag 同一取舍（同一个字段两处各写一份文案是先前被点名的分叉）
    typeTag() {
      return this.detail.is_official ? this.detail.task_title : "";
    },
    authorMeta() {
      // 官方动态没有「第 N 天打卡 / 任务」的学员语义（day_seq 恒为 0），类型已由 typeTag 的标签表达，元信息留空
      if (this.detail.is_official) return "";
      const seq = this.detail.day_seq || this.daySeq;
      // 与动态卡 subText 同一取舍（同一个字段两处各写一份是先前被点名的分叉）：挂了任务的动态，
      // 任务名只有一个落点——卡底那行关联 chip（tz-checkin-task-tag，本页与动态卡同一份组件同一档），
      // 元信息这里不再重复；普通动态没有任务可去（chip 自己不出），那句说明留在灰字里
      if (Number(this.detail.task_id) > 0) return '第' + seq + '天打卡';
      return '第' + seq + '天打卡' + (this.detail.task_title ? ' · ' + this.detail.task_title : '');
    },
    // 媒体九宫格（与动态详情、点评组件同一份结构）：图片/视频/语音一并入格（三列横向排布），
    // 图片点击放大预览、视频/语音点击开预览弹窗；语音不再单独摆条、也不在页内自播
    mediaList() {
      const list = [];
      (this.detail.images || []).forEach((url, i) => list.push({ type: "image", url: url, name: "图片" + (i + 1) }));
      (this.detail.videos || []).forEach((url, i) => list.push({ type: "video", url: url, name: "视频" + (i + 1) }));
      (this.detail.audios || []).forEach((url, i) => list.push({ type: "audio", url: url, name: "语音" + (i + 1) }));
      return list;
    },
    // 课程卡片清单：官方动态在后台挂的课（link_data 由后端按关联表现拼），
    // 单课程对象与数组都兼容；详情页不截断，卡片那边只列 2 门
    courseList() {
      const d = this.detail.link_data;
      if (!d) return [];
      return Array.isArray(d) ? d : [d];
    },
  },
  onLoad(options) {
    that = this;
    if (!that.$tools.systemConfig("app_isinstall_checkin")) {
      uni.showToast({ title: "打卡功能未安装", icon: "none" });
      setTimeout(() => uni.navigateBack(), 800);
      that.loading = false; // 兜底分支也要撤骨架：这一页只弹一句 toast 就留在灰块上，看着像「一直加载中」
      return;
    }
    that.id = Number(options.id || 0);
    that.checkinId = Number(options.checkin_id || 0);
    // 提交打卡成功跳进本页时带 daily=1：日签图（分享海报）要自动弹出（竞品口径「学员提交打卡后日签图自动弹出」，
    // 未保存也能用「更多→日签图」回看）。等 getData 落地再弹，否则海报上的活动名/打卡昵称/累计天数全是空的；
    // 取不到日记（接口失败/已删除）就不弹，别弹一张空海报。
    // daily=1 是 URL 参数，别人那条动态的链接上也能带：日签图只给自己看，故判 is_mine（与「更多」菜单同一口径）
    that.autoDaily = options.daily == 1;
    that.getData().then(() => {
      if (that.autoDaily && that.detail && that.detail.id && that.detail.is_mine) {
        that.autoDaily = false;
        that.openDaily();
      }
    });
    that.getComments();
  },
  // 回到本页就重取这条日记（与活动主页 detail、任务详情页 taskdetail 的 onShow 同一口径）：
  // 「更多→编辑」进提交页改完正文/媒体退回来时，本页实例还活着（H5 走 keep-alive、小程序页面栈也留着），
  // 不重取就一直挂着改前的内容。刷新只由「被返回的这一页」自己做，不让提交页跨页来调（见 submit 的说明）。
  // 首进不重复取：H5 在 created 里连着触发 onLoad→onShow，那一刻 getData 还在路上（loading 仍为 true）；
  // 之后从编辑页退回、小程序/H5 切回前台都会再走一次 onShow，静默重取（loading 不再翻 true，正文不闪骨架）
  onShow() {
    // 模块级 that 停在最后 onLoad 的实例上；本页重新可见先收回绑定（同路由多实例时点赞/回复会改到销毁的实例上）
    that = this;
    if (that && that.id && !that.loading) that.getData();
  },
  // 下拉刷新（pages.json 已开 enablePullDownRefresh）：日记全文与评论一起重取，
  // 已加载内容在失败时保留（getData/getComments 各自带 catch，不会拒绝）；两个请求都落地才收动画
  onPullDownRefresh() {
    Promise.all([that.getData(), that.getComments()]).then(
      () => uni.stopPullDownRefresh(),
      () => uni.stopPullDownRefresh()
    );
  },
  methods: {
    // 作者头像/昵称（.cdy-head 整块）→ 他在这个活动内的打卡记录页。
    // 入口与守卫只存 common/utils/checkin-owner 一处（与动态卡头部、排行榜行、成员卡同一个动作）；
    // 官方动态（user_id=0）没有这个人可去，util 直接判掉，本页不自造第二套判断
    goAuthorRecord() {
      goOwnerRecord(that.detail, that.checkinId);
    },
    // 分享卡片口径见 common/utils/checkin-share：H5 走 JSSDK，小程序端走下面的 onShare* 钩子
    applyShare() {
      applyH5Share(this.$nav, this.shareTitle, this.shareCover);
    },
    pad(n) { return n < 10 ? "0" + n : "" + n; },
    fmt(ts) {
      if (!ts) return "";
      const d = new Date(ts * 1000);
      return d.getFullYear() + "-" + this.pad(d.getMonth() + 1) + "-" + this.pad(d.getDate()) + " " + this.pad(d.getHours()) + ":" + this.pad(d.getMinutes()) + ":" + this.pad(d.getSeconds());
    },
    getData() {
      return that.$api("checkin.checkin.diaryDetail", { checkin_id: that.checkinId, record_id: that.id })
        .then((ret) => {
          if (!ret || ret.code !== 1) {
            if (!that.detail.id) that.loadMsg = (ret && ret.msg) || "日记不存在或已删除";
            that.loading = false;
            return;
          }
          that.detail = ret.data || {};
          that.loadMsg = "";
          that.checkinTitle = (ret.data && ret.data.checkin_title) || "";
          that.daySeq = (ret.data && ret.data.day_seq) || 0;
          that.loading = false;
          // 摘要与首图都来自日记本身，放在数据回调最后一步（H5 分享调用抛异常会中断前面的渲染）
          this.applyShare();
        })
        .catch(() => {
          if (!that.detail.id) that.loadMsg = "加载失败，请重试";
          that.loading = false;
        });
    },
    getComments() {
      that.commentsLoading = true;
      that.commentsLoaded = false;
      that.$api("checkin.checkin.commentList", { checkin_id: that.checkinId, record_id: that.id, page: 1, limit: 50, sort: that.commentSort }).then((ret) => {
        that.commentsLoading = false;
        that.commentsLoaded = true;
        // 失败分支要有可读出口：只 return 会把「加载失败」渲染成「还没有评论」（M13）
        if (!ret || ret.code !== 1) {
          that.commentsMsg = (ret && ret.msg) || "加载失败，请重试";
          return;
        }
        that.commentsMsg = "";
        that.comments = (ret.data && ret.data.rows) || [];
      }).catch(() => {
        that.commentsLoading = false;
        that.commentsLoaded = true;
        that.commentsMsg = "加载失败，请重试";
      });
    },
    // 点击底栏评论入口：弹出共用的回复评论弹窗（与动态详情同一处实现）
    // 关闭评论时这一句与后端 checkin.checkin/comment 被拒时逐字一致（M13：守卫分支要说出口）
    openReply() {
      if (!that.canComment) {
        uni.showToast({ title: '该打卡活动已关闭评论', icon: 'none' });
        return;
      }
      that.$refs.replyPopup.open(null);
    },
    // 点击评论条目/回复：把这条评论作为回复对象弹同一个弹窗，提交时按 reply-key=parent_id 带给打卡接口
    replyComment(c) {
      if (!that.canComment) {
        uni.showToast({ title: '该打卡活动已关闭评论', icon: 'none' });
        return;
      }
      that.$refs.replyPopup.open({ id: c.id, nickname: c.nickname });
    },
    // 切换评论排序：组件已记住选中态，本页只换 sort 条件重取列表（排序在 commentList 接口落 SQL，前端不本地重排）
    onCommentSort(sort) {
      that.commentSort = sort;
      that.getComments();
    },
    // 评论点赞：接口回权威的 liked / like_count 落进行对象，与评论弹窗走同一条接口、同一口径
    // 小程序端组件上抛的是它自己那份 props 拷贝，直接改上抛对象落不回本页 comments（下一次重绘就翻回去）
    // ⇒ 按 id 回到本页数组里那一行再写（与 circle/index 的 onLike 同一口径）
    onCommentLike(emitComment) {
      const c = (that.comments || []).find((x) => Number(x.id) === Number(emitComment && emitComment.id));
      if (!c) return;
      that.$api("checkin.checkin.commentLike", { checkin_id: that.checkinId, record_id: that.id, comment_id: c.id }).then((ret) => {
        if (!ret || ret.code !== 1) {
          uni.showToast({ title: (ret && ret.msg) || "操作失败，请重试", icon: "none" });
          return;
        }
        c.liked = Number(ret.data.liked) ? 1 : 0;
        c.like_count = Number(ret.data.like_count) || 0;
      });
    },
    // 弹窗发送成功：重拉评论列表，评论数本地 +1（不重拉详情，避免浏览量等字段被刷）
    onCommentPosted() {
      that.getComments();
      if (that.detail) that.detail.comment_count = (Number(that.detail.comment_count) || 0) + 1;
    },
    // 更多菜单选中：先关菜单再执行动作（与动态详情一致）
    onMoreSelect(item) {
      that.moreVisible = false;
      if (!item) return;
      // 「日签图」弹的是分享海报（海报里才是保存/复制金句的回看口径），顺带把要复制的链接先取好
      if (item.name === "日签图") that.openDaily();
      else if (item.name === "编辑") that.goEdit();
      else if (item.name === "删除") that.removeOwn();
    },
    // 编辑自己的这条日记：进提交页的编辑态（带 record_id 即回填当前内容，按钮变「保存修改」）。
    // 保存后退回本页由上面的 onShow 重取，日记正文与媒体就地刷新
    goEdit() {
      uni.navigateTo({ url: "/pages/app/checkin/submit/submit?id=" + that.checkinId + "&record_id=" + that.id });
    },
    onLike() {
      const old = that.detail.is_liked;
      const oldCount = that.detail.like_count || 0;
      that.detail.is_liked = old ? 0 : 1;
      that.detail.like_count = oldCount + (old ? -1 : 1);
      that.$api("checkin.checkin.like", { checkin_id: that.checkinId, record_id: that.id }).then((ret) => {
        if (!ret || ret.code !== 1) {
          that.detail.is_liked = old;
          that.detail.like_count = oldCount;
          // 回滚只是让心形变回去，还得说一句为什么（M13：失败分支必须有可读出口）
          uni.showToast({ title: (ret && ret.msg) || "点赞失败，请重试", icon: "none" });
        }
      });
    },
    // 媒体格点击（共用九宫格组件事件，与动态详情同一套接法）：
    // 图片放大预览走系统预览（可双指缩放/左右滑），视频与语音开共用预览弹窗播放
    previewImage(images, index) {
      uni.previewImage({ current: index, urls: images });
    },
    previewVideo(item) {
      that.openMediaPreview(item, "video");
    },
    previewAudio(item) {
      that.openMediaPreview(item, "audio");
    },
    openMediaPreview(item, filetype) {
      if (!item || !item.url) return;
      that.previewData = {
        id: filetype,
        filename: item.name || (filetype === "video" ? "视频" : "语音"),
        filetype: filetype,
        fullurl: item.url,
        filesize: item.size || 0,
      };
      that.previewVisible = true;
    },
    // 日签图弹层「分享」那条复制链接已经收进弹层自己（tz-checkin-daily-card 的 copyLink / getShareLink）：
    // 日记详情页与动态列表卡开的是同一只弹层，预取时机与两句提示文案只留那一处，本页不再各存一份。
    // 底栏「分享」走的是另一只弹窗（share-modal），与这里无关。
    openDaily() {
      that.dailyShow = true;
    },
    removeOwn() {
      uni.showModal({
        title: "提示",
        content: "删除后该打卡记录不可恢复，确定要删除吗？",
        success: (res) => {
          if (!res.confirm) return;
          that.$api("checkin.checkin.deleteOwn", { checkin_id: that.checkinId, record_id: that.id }).then((ret) => {
            if (!ret || ret.code !== 1) return;
            uni.showToast({ title: "删除成功", icon: "none" });
            setTimeout(() => uni.navigateBack(), 800);
          });
        },
      });
    },
  },
  // 小程序转发/朋友圈卡片：与 H5 同一份标题封面（口径见 common/utils/checkin-share）
  onShareAppMessage() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover);
  },
  onShareTimeline() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover, true);
  },
};
</script>
