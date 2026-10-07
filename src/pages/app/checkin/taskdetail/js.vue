<script>
import shareModal from "@/components/modal/share-modal.vue";
import { listTitle, applyH5Share, mpCard } from "@/common/utils/checkin-share";
var that;
export default {
  components: { shareModal },
  data() {
    return {
      taskId: 0,
      loading: true,
      task: null,
      notFound: false,
      loadMsg: "",
      feed: [],
      feedPage: 1,
      feedLimit: 10,
      feedOrder: "desc",
      feedOnlyFeatured: false,
      feedTimeFilter: "all",
      feedCustomRange: { start: "", end: "" },
      feedLoadStatus: "loadmore",
      feedHasMore: true,
      // 局部刷新：切精选/排序/筛选只铺这块列表的骨架屏，任务头卡与介绍不动
      feedLoading: false,
      feedError: "",
      filterVisible: false,
      shareVisible: false,
      // 当前要评论的日记 id（点卡片评论图标时写入，供共用的评论弹窗定位目标与接口参数）
      commentRecordId: 0,
      commentVisible: false,
      reqSeq: 0,
      // 提交页收尾要本页打开的那条日记 id：由提交页写在退栈路径上的本实例（与活动主页同一口径），
      // 在 onShow（退栈已落定）里由 openPendingDiary 消费
      pendingDiaryId: 0,
    };
  },
  computed: {
    // 微信分享卡片（活动内子页口径）：「活动名 · 任务名」+ 活动封面。
    // 只写任务名分享出去认不出是哪个活动（任务名常是「锻炼」「Day2」这类无主语词）
    shareTitle() {
      const t = this.task || {};
      return listTitle(t.checkin_title, t.title || "打卡任务");
    },
    shareCover() {
      return (this.task && this.task.checkin_cover) || "";
    },
    // 评论弹窗/回复弹窗的目标参数：打卡评论接口按 checkin_id + record_id 定位，
    // checkin_id 由 taskDetail 反推回来（分享链接进来时 URL 上只有 task_id）
    commentTarget() {
      return {
        checkin_id: this.task ? this.task.checkin_id : 0,
        record_id: this.commentRecordId,
      };
    },
    // 弹窗底栏要显示这条日记的点赞态，直接取列表里那条原对象（onLike 乐观更新改的就是它，弹窗跟着变）
    commentRecord() {
      return (this.feed || []).find((x) => Number(x.id) === Number(this.commentRecordId)) || null;
    },
    // 打卡的点赞字段叫 is_liked，共用底栏按圈子口径读 liked / like_count，这里映射过去
    commentEntity() {
      const r = this.commentRecord;
      if (!r) return null;
      return { id: r.id, liked: r.is_liked, like_count: Number(r.like_count) || 0, allow_user_comment: r.allow_user_comment };
    },
    // 打不了卡的那句原因（后端逐条下发，本页不拼文案，M22）：这一句常驻写在吸底栏里、按钮行的上面
    // （2026-09-27 用户口径：点灰按钮不再弹确认框）。非空即按钮判灰，两根判据同一处给，不分叉。
    // can_submit 是成员态闸门（未参与/已暂停）、can_check 是这条任务的闸门（TaskGate 与提交校验同一份），
    // 前端不自己数关卡、比时间（M22）；未参与的人这一枚是「参与活动」，有下一步可走，不给拦挡原因
    blockReason() {
      const t = this.task || {};
      if (Number(t.is_member) !== 1) return "";
      if (t.can_submit != 1) return Number(t.member_status) === 2 ? "打卡已暂停，请联系主办方" : "请先参与打卡";
      return t.can_check == 0 ? t.check_msg || "当前不能打卡" : "";
    },
    // 吸底主按钮只表「动作」，状态（未解锁/已打卡/已结束/未到时段…）归头卡右上角那枚 check_text 标签——
    // 一根元素只表达一件事，不再把状态塞进按钮文案里（列表卡的按钮已经固定是「去打卡」，两屏同一档）。
    // 未参与的人从分享链接落到本页，按钮是「参与活动」而不是一个点了必被后端拒掉的打卡按钮
    mainBtnText() {
      const t = this.task || {};
      if (Number(t.is_member) !== 1) return "参与活动";
      if (Number(t.can_makeup) === 1) return "去补卡";
      return "立即打卡";
    },
    // 打卡的「禁用」只落在这里（学员端任务列表的「去打卡」恒可点、不置灰）：判据就是上面那句原因在不在
    mainBtnDisabled() {
      return this.blockReason !== "";
    },
    // 「今日已完成该任务」是唯一一枚按住的拦挡：这条任务今天已经打过卡，提交必被 SubmitService 拒
    // （后端 check_state=done 与 check_msg「今日已完成该任务」同源），2026-09-26 用户口径：不能再发动态，
    // 按钮不能点击。其余拦挡（未到时段/未解锁/次数已满/已截止）仍只置灰不按住，但那句原因自 2026-09-27
    // 起不再靠点击弹框说，而是常驻写在吸底栏里按钮的上面一行（blockReason）——点灰按钮不再有任何动作。
    // 判据取后端逐条下发的 done（与卡片那枚「已打卡」标签同源，M22），且只在按钮确实是打卡动作时按得住：
    // 未参与的人这一枚是「参与活动」，把他按回活动主页参与，不能锁成死按钮
    mainBtnLocked() {
      const t = this.task || {};
      return Number(t.is_member) === 1 && Number(t.done) === 1;
    },
    // 灰档沿用任务卡那一档（#f2f3f5 底 + #c9cdd4 字），走 u-button 的 customStyle prop 改内部样式（M12：
    // 禁止 ::v-deep 打组件内部，宿主 class 与组件 props 才是两端一致的写法）
    mainBtnStyle() {
      return this.mainBtnDisabled ? { backgroundColor: "#f2f3f5", color: "#c9cdd4" } : {};
    },
    // 这两个只表达「时间范围」一件事：tz-filter-popup 里没有精选项，把 feedOnlyFeatured 算进来会让
    // 左侧「精选」chip 与右侧筛选按钮同时显示精选（点了精选却像是筛选按钮生效了，弹窗内还取消不掉）
    filterActive() {
      return this.feedTimeFilter !== "all";
    },
    feedFilterLabel() {
      const labels = { 7: "近七天", 30: "近30天", custom: "自定义" };
      return labels[this.feedTimeFilter] || "全部";
    },
    // 任务正文（富文本）判空：与打卡介绍页的「活动介绍」同一份口径 —— 空标签/占位内容不渲染富文本，落「暂无」
    introHtml() {
      const content = this.task && this.task.content;
      if (typeof content !== "string") return "";
      const html = content.replace(/<!--[\s\S]*?-->/g, "");
      if (/<(?:img|video|audio|iframe|embed|object)\b/i.test(html)) return content;
      return html
        .replace(/<[^>]*>/g, "")
        .replace(/&(?:nbsp|#0*160|#x0*a0);/gi, "")
        .replace(/[\s\u200b\ufeff]/g, "").length > 0
        ? content
        : "";
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
    // 只认 task_id：列表进来与分享链接进来是同一个 URL 形状，活动由后端按任务行反推，
    // 少一个参数就少一种「id 与 task_id 对不上」的坏链
    that.taskId = Number(options.task_id || 0);
    if (!that.taskId) {
      that.notFound = true;
      that.loadMsg = "任务不存在或已隐藏";
      that.loading = false;
      return;
    }
    that.getData();
  },
  onShow() {
    // 模块级 that 停在最后 onLoad 的实例上；本页重新可见先收回绑定（同路由多实例时交互会改到销毁的实例上）
    that = this;
    // 从提交页返回：任务打卡态（已打卡/剩余补卡）与本页动态都要重取，静默刷新不闪骨架
    if (that && that.taskId && !that.loading) that.getData();
    // 提交页收尾：退栈落定后由本页打开这条新日记（与活动主页 openPendingDiary 同一口径）
    this.openPendingDiary();
  },
  onPullDownRefresh() {
    that.getData().then(
      () => uni.stopPullDownRefresh(),
      () => uni.stopPullDownRefresh()
    );
  },
  onReachBottom() {
    that.loadFeedMore();
  },
  methods: {
    // 分享卡片口径见 common/utils/checkin-share：H5 走 JSSDK，小程序端走下面的 onShare* 钩子
    applyShare() {
      applyH5Share(this.$nav, this.shareTitle, this.shareCover);
    },
    pad(n) { return n < 10 ? "0" + n : "" + n; },
    fmt(ts) {
      if (!ts) return "--";
      const d = new Date(ts * 1000);
      return d.getFullYear() + "-" + this.pad(d.getMonth() + 1) + "-" + this.pad(d.getDate()) + " " + this.pad(d.getHours()) + ":" + this.pad(d.getMinutes()) + ":" + this.pad(d.getSeconds());
    },
    getData() {
      const seq = ++that.reqSeq;
      that.loading = !that.task;
      return that.$api("checkin.checkin.taskDetail", { task_id: that.taskId })
        .then((ret) => {
          if (seq !== that.reqSeq) { that.loading = false; return; } // 过期响应只丢数据，不撤骨架
          if (!ret || ret.code !== 1) {
            // 任务被隐藏/活动未上架：拦截器只 toast 一秒就消失，页面必须留下后端给的原因，否则只剩白屏
            if (!that.task) {
              that.notFound = true;
              that.loadMsg = (ret && ret.msg) || "任务不存在或已隐藏";
            }
            that.loading = false;
            return;
          }
          that.task = ret.data;
          that.notFound = false;
          that.loadMsg = "";
          that.loading = false;
          that.loadFeed();
          // 分享卡片放在数据回调最后一步：H5 分享调用一旦抛异常会中断后面的渲染逻辑
          this.applyShare();
        })
        .catch(() => {
          if (!that.task) {
            that.notFound = true;
            that.loadMsg = "加载失败，请重试";
          }
          that.loading = false;
        });
    },
    buildFeedParams() {
      const t = that.task || {};
      const p = {
        checkin_id: t.checkin_id,
        // 本页的动态栏只要这条任务的动态（后端 feed 的 task_id 过滤，与可见范围判据同一条查询）
        task_id: t.id,
        page: that.feedPage,
        limit: that.feedLimit,
        order: that.feedOrder,
      };
      if (that.feedOnlyFeatured) p.featured = 1;
      const now = Math.floor(Date.now() / 1000);
      if (that.feedTimeFilter === "7") {
        p.day_end = that.dayStr(now);
        p.day_start = that.dayStr(now - 6 * 86400);
      } else if (that.feedTimeFilter === "30") {
        p.day_end = that.dayStr(now);
        p.day_start = that.dayStr(now - 29 * 86400);
      } else if (that.feedTimeFilter === "custom" && that.feedCustomRange.start && that.feedCustomRange.end) {
        p.day_start = that.feedCustomRange.start;
        p.day_end = that.feedCustomRange.end;
      }
      return p;
    },
    dayStr(ts) {
      const d = new Date(ts * 1000);
      const pad = (n) => (n < 10 ? "0" + n : "" + n);
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    },
    loadFeed(reset, skeleton) {
      if (reset !== false) {
        that.feedPage = 1;
        that.feedHasMore = true;
        // 换条件重拉才铺骨架：先把上一次的结果清空，不清的症状是「上一次筛选的结果挂在新条件下」；
        // onShow/下拉刷新不传 skeleton，保持原来的静默口径（不闪骨架）
        if (skeleton === true) {
          that.feed = [];
          that.feedError = "";
          that.feedLoading = true;
        }
      }
      that.feedLoadStatus = "loading";
      return that.$api("checkin.checkin.feed", that.buildFeedParams())
        .then((ret) => {
          that.feedLoading = false;
          if (!ret || ret.code !== 1) {
            that.feedLoadStatus = "loadmore";
            that.feedError = (ret && ret.msg) || "加载失败，请重试";
            return;
          }
          const rows = (ret.data && ret.data.rows) || [];
          that.feed = that.feedPage === 1 ? rows : that.feed.concat(rows);
          that.feedHasMore = that.feed.length < (ret.data.total || 0);
          that.feedLoadStatus = that.feedHasMore ? "loadmore" : "nomore";
          that.feedError = "";
        })
        .catch(() => {
          that.feedLoading = false;
          that.feedLoadStatus = "loadmore";
          that.feedError = "加载失败，请重试";
        });
    },
    loadFeedMore() {
      if (!that.feedHasMore || that.feedLoadStatus === "loading") return;
      that.feedPage += 1;
      that.loadFeed(false);
    },
    onFilterConfirm(e) {
      that.feedOrder = e.sort || that.feedOrder;
      that.feedTimeFilter = e.timeFilter || "all";
      that.feedCustomRange = e.customRange || { start: "", end: "" };
      that.loadFeed(true, true);
    },
    // 「全部 / 精选」两个 chip 各自直接给值（与活动主页动态栏同一口径），换条件要重拉第一页
    setFeedFeatured(v) {
      that.feedOnlyFeatured = v;
      that.loadFeed(true, true);
    },
    toggleFeedOrder() {
      that.feedOrder = that.feedOrder === "asc" ? "desc" : "asc";
      that.loadFeed(true, true);
    },
    // 主按钮：未参与 → 去活动主页参与（本页不复制一份参与表单）；被拦住的分支直接 return ——
    // 为什么打不了卡已经常驻写在吸底栏里那一行（blockReason → u-alert），不再弹框重复说一遍
    // （2026-09-27 用户口径，M22）；闸门放行才进提交页
    onMainAction() {
      const t = that.task || {};
      if (Number(t.is_member) !== 1) {
        that.goActivity();
        return;
      }
      if (that.blockReason !== "") return;
      uni.navigateTo({
        url: "/pages/app/checkin/submit/submit?id=" + t.checkin_id + "&task_id=" + t.id + (t.can_makeup == 1 ? "&makeup=1" : ""),
      });
    },
    goActivity() {
      const t = that.task || {};
      if (!t.checkin_id) return;
      uni.navigateTo({ url: "/pages/app/checkin/detail/detail?id=" + t.checkin_id });
    },
    // 提交成功收尾的最后一跳（与活动主页 openPendingDiary 同一口径）：本页 onShow 触发时退栈已落定，
    // 这时再 push 才安全；带 daily=1 让日记详情取到数据后自动弹日签图。用 this 不用模块里的 that——
    // 本页可能有多个实例，提交页写的是栈里特定那一层的 vm
    openPendingDiary() {
      const recordId = Number(this.pendingDiaryId) || 0;
      if (!recordId) return;
      this.pendingDiaryId = 0;
      const checkinId = (this.task || {}).checkin_id;
      // 放到本轮渲染之后：避免与刚完成的退栈挤在同一个 tick
      setTimeout(() => {
        uni.navigateTo({ url: "/pages/app/checkin/diary/diary?id=" + recordId + "&checkin_id=" + checkinId + "&daily=1" });
      }, 0);
    },
    goDiary(record) {
      const t = that.task || {};
      uni.navigateTo({ url: "/pages/app/checkin/diary/diary?id=" + record.id + "&checkin_id=" + t.checkin_id });
    },
    // 卡片评论图标：先弹共用的评论弹窗（评论列表 + 底栏「写下你的评论吧」→ 再弹回复框），
    // 与活动主页动态栏、圈子动态卡片同一处实现，不在本页直接弹输入框、也不跳日记详情页
    openComment(record) {
      if (!record || !record.id) return;
      that.commentRecordId = record.id;
      that.commentVisible = true;
    },
    // 弹窗底栏点赞：组件只上抛（打卡点赞接口在本页），转给列表里那条记录走同一套乐观更新与回滚
    onPopupLike() {
      const r = that.commentRecord;
      if (r) that.onLike(r);
    },
    // 弹窗发送成功：只把这条动态的评论数 +1，列表不重拉（重拉会丢翻页位置）
    onCommentPosted() {
      const r = that.commentRecord;
      if (r) r.comment_count = (Number(r.comment_count) || 0) + 1;
    },
    // 小程序端子组件 $emit 上抛的是它那份 props 拷贝，直接改上抛对象回不到本页的 feed
    // （H5 两端共用同一对象所以看着正常），症状就是「点了心形和数字一动不动」
    // ⇒ 先按 id 回到本页列表里那一行再改（与 circle/index、checkin/search 的 onLike 同一口径）
    onLike(emitRecord) {
      const record = (that.feed || []).find((x) => Number(x.id) === Number(emitRecord && emitRecord.id));
      if (!record) return;
      const t = that.task || {};
      const old = record.is_liked;
      const oldCount = record.like_count;
      record.is_liked = old ? 0 : 1;
      record.like_count = oldCount + (old ? -1 : 1);
      that.$api("checkin.checkin.like", { checkin_id: t.checkin_id, record_id: record.id })
        .then((ret) => {
          if (!ret || ret.code !== 1) {
            record.is_liked = old;
            record.like_count = oldCount;
            // 回滚只是让心形变回去，还得说一句为什么（M13：失败分支必须有可读出口）
            uni.showToast({ title: (ret && ret.msg) || "点赞失败，请重试", icon: "none" });
          }
        })
        .catch(() => {
          record.is_liked = old;
          record.like_count = oldCount;
        });
    },
  },
  // 小程序转发/朋友圈卡片：标题「活动名 · 任务名」、封面取活动封面（H5 的分享由 getData 里
  // applyShare 走 JSSDK 设置；朋友圈卡片只认 query，回传 path 会丢页面参数）
  onShareAppMessage() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover);
  },
  onShareTimeline() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover, true);
  },
};
</script>
