<script>
import shareModal from "@/components/modal/share-modal.vue";
import { detailTitle, applyH5Share, mpCard } from "@/common/utils/checkin-share";
var that;
export default {
  components: { shareModal },
  data() {
    return {
      id: 0,
      loading: true,
      info: null,
      notFound: false,
      loadMsg: "",
      tabIndex: 0,
      taskFilter: "pending",
      taskOrder: "asc",
      feed: [],
      feedPage: 1,
      feedLimit: 10,
      feedOrder: "desc",
      feedOnlyFeatured: false,
      feedTimeFilter: "all",
      feedCustomRange: { start: "", end: "" },
      feedLoadStatus: "loadmore",
      feedHasMore: true,
      // 局部刷新：切页签/排序/筛选只铺这一块列表的骨架屏，页头与吸顶页签不动
      feedLoading: false,
      feedError: "",
      taskLoading: false,
      filterVisible: false,
      // 任务栏提示图标点开的「规则说明」半屏
      ruleVisible: false,
      // 悬浮「更多」的快捷导航弹窗（页头工具行已改为直达「成员」，不再有操作菜单）
      moreNavVisible: false,
      pwdVisible: false,
      password: "",
      shareVisible: false,
      // 当前要评论的日记 id（点卡片评论图标时写入，供共用的评论弹窗定位目标与接口参数）
      commentRecordId: 0,
      commentVisible: false,
      reqSeq: 0,
      // 提交页收尾要本页打开的那条日记 id：退栈这一支由提交页写在本实例上（pendingDiaryId），
      // 深链这一支走 ?open_record=（openRecordId），两者都在 onShow 落定后由 openPendingDiary 消费
      pendingDiaryId: 0,
      openRecordId: 0,
      // 未参与自动跳介绍页的「只跳一次」闸：onShow/下拉都会再走 getData，没有闸会连发两次 redirectTo
      introRedirected: false,
    };
  },
  computed: {
    // 微信分享卡片（详情页口径）：标题取活动名称、封面取活动封面，与教务校区/教师详情同口径；
    // 活动名要等 detail 接口回来，未回来时用「打卡」占位，不能让卡片标题空着
    shareTitle() {
      return detailTitle(this.info && this.info.title, "打卡");
    },
    shareCover() {
      return (this.info && this.info.cover) || "";
    },
    // 评论弹窗/回复弹窗的目标参数：打卡评论接口按 checkin_id + record_id 定位
    commentTarget() {
      return { checkin_id: this.id, record_id: this.commentRecordId };
    },
    // 兜底参与栏那一格的参与价按代币显示（判据与介绍页同一份，取后端 detail 下发的 is_virtual_pay）
    isVirtualPay() {
      return Number(this.info && this.info.is_virtual_pay) === 1 && uni.getStorageSync("platform") === "wxMiniProgram";
    },
    // 弹窗底栏要显示这条日记的点赞态，直接取列表里那条原对象（onLike 乐观更新改的就是它，弹窗跟着变）
    commentRecord() {
      return (this.feed || []).find((x) => Number(x.id) === Number(this.commentRecordId)) || null;
    },
    // 打卡的点赞字段叫 is_liked，共用底栏按圈子口径读 liked / like_count，这里映射过去（与日记页 barPost 同一口径）
    commentEntity() {
      const r = this.commentRecord;
      if (!r) return null;
      return { id: r.id, liked: r.is_liked, like_count: Number(r.like_count) || 0, allow_user_comment: r.allow_user_comment };
    },
    pendingCount() {
      return this.info ? this.info.pending_count || 0 : 0;
    },
    /**
     * 任务栏「待完成 / 全部任务」两档取的哪几行
     *
     * 判据不在这儿：后端 detail 整表下发任务行，并逐行给出 pending（日历模式＝今天打得了这一张或可补卡、
     * 已放量、未打卡；闯关模式＝已解锁未打卡），本页只按这一个标记筛（M22 —— 前端不自己比日期、不自己数关卡）。
     * 「全部任务」列整表：chip 上的计数取的就是 task_total，只列今日那几行的症状就是
     * 「全部任务(6) 点开是空的」（2026-09-26 用户实机点名 628 那期）。
     */
    shownTasks() {
      const tasks = this.info && this.info.tasks ? this.info.tasks.slice() : [];
      const list = this.taskFilter === "pending" ? tasks.filter((t) => Number(t.pending) === 1) : tasks;
      // 闯关模式顺序由后端按 sort、id 下发（关卡序列，前端不再按开始时间重排）；
      // 未解锁的关留在「全部任务」里带「未解锁」标签展示
      if (this.isLevel) return list;
      list.sort((a, b) => (this.taskOrder === "asc" ? a.start_time - b.start_time : b.start_time - a.start_time));
      return list;
    },
    /**
     * 任务栏按章节分组（结构照抄专栏课程目录 pages/course/components/column-dir.vue：
     * 章节标题行 + 其下条目行，未分章的条目平铺在章块之后）
     *
     * 章节清单与顺序由后端 detail 下发（chapters 走 Chapter::listWithCount，按 sort、id 升序），
     * 任务行上的 chapter_id 是真实列，这里只按「这行属于哪一章」分桶——能不能打卡仍读后端的
     * can_check / check_msg（M22），前端不自己判。没建过章节的活动只出一个无名分组，
     * 渲染结果与分组前逐字一致（不给老活动凭空多出标题行）。
     *
     * 闯关模式不分桶：关卡链的顺序就是后端下发的 sort 序（第 N 关那枚标签按它标），按章节重排会把
     * 挂着旧章节归属的关整体提到前面，症状是「第 1 关排在第 3 关下面」（628 那期，2026-09-27 用户点名）。
     * 后台章节功能已暂时下线（商家看不到、也改不了这份归属），更没有让学员端替它重排的理由。
     */
    taskGroups() {
      const rows = this.shownTasks;
      const chapters = this.info && Array.isArray(this.info.chapters) ? this.info.chapters : [];
      if (this.isLevel || !chapters.length) {
        return [{ key: "none", title: "", tasks: rows }];
      }
      const groups = {};
      chapters.forEach((c) => {
        groups[Number(c.id)] = { key: "c" + Number(c.id), title: c.title, tasks: [] };
      });
      const loose = { key: "none", title: "", tasks: [] };
      rows.forEach((task) => {
        const group = groups[Number(task.chapter_id) || 0];
        (group ? group : loose).tasks.push(task);
      });
      // 章内没有可见行就不出标题行：日历模式的任务栏只有「今日 + 可补卡」那几条，
      // 把全部章节都冠一个空标题会变成一屏没人认领的章名
      const list = chapters.map((c) => groups[Number(c.id)]).filter((g) => g.tasks.length);
      return loose.tasks.length ? list.concat([loose]) : list;
    },
    isLevel() {
      return this.info ? Number(this.info.checkin_mode) === 2 : false;
    },
    /**
     * 「规则说明」半屏里逐条列出的那几行（任务栏排序按钮左侧那枚提示图标的唯一数据源）
     *
     * 玩法一句在本页拼（关卡顺序是 checkin_mode 的既有口径，与头部 dateText 那行同一判据）；
     * 频率那句仍取后端 detail 下发的 per_day_tip，不在前端重写一遍「每日最多完成 N 项任务」。
     * 剩余补卡次数不在这儿——它是当下余额、不是规则，仍留在任务栏行内。
     */
    ruleTips() {
      const tips = [];
      if (this.isLevel) tips.push("按关卡顺序打卡，完成上一关后即可解锁下一关");
      if (this.info && this.info.per_day_tip) tips.push(this.info.per_day_tip);
      return tips;
    },
    modeText() {
      const info = this.info || {};
      return ((info.attr || {}).checkin_mode || {})[info.checkin_mode] || "";
    },
    // 吸底参与栏只在「未参与」时出现：已参与的发布入口改成了右侧悬浮按钮（见模板 .cd-publish-btn），
    // 同屏只出一个主操作；页面根的底部留白档跟着这一判据走，没有吸底栏时不叠 90px 空档
    showFooterBar() {
      return !!this.info && !this.info.is_member;
    },
    /**
     * 管理端「打卡设置 → 发布设置 → 允许用户发布动态」：关闭后悬浮发布钮置灰、点击给原因
     *
     * 与动态模块（pages/app/circle/index 的 canPublish）同一档形态：入口不藏、按钮置灰、点了说原因，
     * 那句原因取后端逐行下发的 check_gate.msg（M22 判据不在前端重算），字段缺失按允许处理。
     */
    canPublish() {
      return !this.info || Number(this.info.allow_user_post) !== 0;
    },
    // 这两个只表达「时间范围」一件事：tz-filter-popup 里没有精选项，把 feedOnlyFeatured 算进来会让
    // 左侧「精选」chip 与右侧筛选按钮同时显示精选（点了精选却像是筛按钮生效了，且弹窗内取消不掉）
    filterActive() {
      return this.feedTimeFilter !== "all";
    },
    feedFilterLabel() {
      const labels = { 7: "近七天", 30: "近30天", custom: "自定义" };
      return labels[this.feedTimeFilter] || "全部";
    },
    dateText() {
      const info = this.info || {};
      const base = info.time_type == 2
        ? "每人打卡 " + info.total_days + " 天"
        : (info.start_date || "") + " 至 " + (info.end_date || "不限");
      // 闯关打卡的玩法写在头部（关卡按顺序解锁，不看日期看不出差别）；文案取后端 attr，不在前端另存
      return this.isLevel ? this.modeText + " · " + base : base;
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
    // 提交页深链直达时页面栈里没有本页，它用 redirectTo 带 tab=feed 跳过来，要落在动态栏
    if (options.tab === "feed") that.tabIndex = 1;
    // 同一条链还把「提交成功那条日记」的 id 带进来（?open_record=），取完数据后在 onShow 里打开它的详情
    that.openRecordId = Number(options.open_record || 0);
    that.getData();
  },
  onShow() {
    // 模块级 that 停在最后 onLoad 的实例上；本页重新可见先收回绑定（同路由多实例环跳时点赞/回复会改到销毁的实例上）
    that = this;
    if (that && that.id && !that.loading) that.getData();
    // 提交页收尾：退栈/替换落定后再打开它要我们打开的那条日记详情（用 this，不是模块里的 that——
    // 调用方拿的是栈里特定那一层的 vm）
    this.openPendingDiary();
  },
  onPullDownRefresh() {
    that.getData().then(
      () => uni.stopPullDownRefresh(),
      () => uni.stopPullDownRefresh()
    );
  },
  onReachBottom() {
    if (that.tabIndex === 1) that.loadFeedMore();
  },
  methods: {
    // 分享卡片口径见 common/utils/checkin-share：H5 走 JSSDK，小程序端走下面的 onShare* 钩子
    applyShare() {
      applyH5Share(this.$nav, this.shareTitle, this.shareCover);
    },
    getData() {
      const seq = ++that.reqSeq;
      that.loading = !that.info;
      return that.$api("checkin.checkin.detail", { checkin_id: that.id })
        .then((ret) => {
          // 过期响应只丢数据，不撤骨架：更新那一发若是静默重取就不会再关 loading（规则22 的每一支都要有出口）
          if (seq !== that.reqSeq) { that.loading = false; return; }
          if (!ret || ret.code !== 1) {
            // 活动未上架/不存在等：拦截器只 toast 一秒就消失，页面必须留下后端给的原因，否则只剩白屏
            if (!that.info) {
              that.notFound = true;
              that.loadMsg = (ret && ret.msg) || "打卡活动不存在或已下架";
            }
            that.loading = false;
            return;
          }
          that.info = ret.data;
          that.notFound = false;
          that.loadMsg = "";
          // 未参与（未获取）打卡不留在主页：自动替换到介绍页——活动介绍与参与/购买/密码/购课入口都在那边，
          // 介绍页参与成功后 goHome(true) 会替换回本页。骨架屏保持到替换落定（不往下走 loading/loadFeed），
          // 不闪一帧「免费参与」吸底栏；替换失败再退回本页旧口径兜底（下方 school-footer 那条栏）
          if (Number(that.info.is_member) !== 1) {
            that.redirectToIntro();
            return;
          }
          that.loading = false;
          that.loadFeed();
          // 分享卡片放在数据回调最后一步：H5 分享调用一旦抛异常会中断后面的渲染逻辑
          // （微信H5分享优化文档三轮事故：share 里丢了 var 声明，课程详情整页 tabs 没了）
          this.applyShare();
        })
        .catch(() => {
          if (!that.info) {
            that.notFound = true;
            that.loadMsg = "加载失败，请重试";
          }
          that.loading = false;
        });
    },
    buildFeedParams() {
      const p = { checkin_id: that.id, page: that.feedPage, limit: that.feedLimit, order: that.feedOrder };
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
    // 切页签也要重新拉数：原来只是本地切 v-if，用户看到的是进来那一刻的旧数据。
    // 只刷当前这一侧的列表并铺它的骨架屏，页头与吸顶页签不动（局部刷新，不整页闪）
    switchTab(i) {
      that.tabIndex = i;
      if (i === 1) that.loadFeed(true, true);
      else that.refreshTasks();
    },
    // 任务侧局部刷新：详情接口带任务/统计，不动动态列表（列表不在请求范围就不发这次请求）
    refreshTasks() {
      if (that.taskLoading) return;
      that.taskLoading = true;
      const seq = ++that.reqSeq;
      return that.$api("checkin.checkin.detail", { checkin_id: that.id })
        .then((ret) => {
          // 先收骨架再看 seq：过期响应直接 return 会把 taskLoading 永远留在 true（骨架屏卡死）
          that.taskLoading = false;
          if (seq !== that.reqSeq) return;
          if (!ret || ret.code !== 1) {
            // 失败保留旧任务列表，但必须给一句可读原因，不能静默停在旧数据上
            uni.showToast({ title: (ret && ret.msg) || "加载失败，请重试", icon: "none" });
            return;
          }
          that.info = ret.data;
        })
        .catch(() => {
          that.taskLoading = false;
          uni.showToast({ title: "加载失败，请重试", icon: "none" });
        });
    },
    setTaskFilter(v) {
      that.taskFilter = v;
      that.refreshTasks();
    },
    toggleTaskOrder() {
      that.taskOrder = that.taskOrder === "asc" ? "desc" : "asc";
      that.refreshTasks();
    },
    // 动态排序原来是纯本地赋值（feedOrder 变了不发请求），表现为「点了正序倒序没反应」；
    // 排序口径由后端 feed 接口下发，改完必须重新拉第一页
    toggleFeedOrder() {
      that.feedOrder = that.feedOrder === "asc" ? "desc" : "asc";
      that.loadFeed(true, true);
    },
    // 提交页关掉日签图时跨页调用：把本页切到动态栏，用户回来就看到刚发的那条。
    // 这里用 this 不用模块里的 that——本页可能有多个实例，调用方拿的是栈里特定那一层的 vm；
    // 数据不在这儿取，返回时 onShow 已经 getData → loadFeed 重拉第一页
    showFeedTab() {
      this.tabIndex = 1;
    },
    // 提交成功收尾的最后一跳：打开这条新日记的详情（带 daily=1，详情页取到数据后自动弹日签图）。
    // 之所以由本页来开、而不是提交页在 navigateBack/redirectTo 的 success 里直接 navigateTo——
    // H5 端这两个 API 的 success 是同步立即回调的（后退/替换的历史遍历还没执行），在 success 里再
    // push 会和未落定的跳转互踩，落点会跑偏（实测会停在打卡列表或退回提交页）。本页 onShow 触发时
    // 退栈/替换已经落定，这时再 push 才是安全的。id=0（老后端没回 record_id）只切到动态栏、不开详情
    openPendingDiary() {
      const recordId = Number(this.pendingDiaryId || this.openRecordId) || 0;
      if (!recordId) return;
      this.pendingDiaryId = 0;
      this.openRecordId = 0;
      this.tabIndex = 1;
      // 放到本轮渲染之后：push 要等本页 onShow 这轮落定，避免与刚完成的退栈/替换挤在同一个 tick
      setTimeout(() => {
        uni.navigateTo({ url: "/pages/app/checkin/diary/diary?id=" + recordId + "&checkin_id=" + this.id + "&daily=1" });
      }, 0);
    },
    onFilterConfirm(e) {
      that.feedOrder = e.sort || that.feedOrder;
      that.feedTimeFilter = e.timeFilter || "all";
      that.feedCustomRange = e.customRange || { start: "", end: "" };
      that.loadFeed(true, true);
    },
    // 「全部 / 精选」两个 chip 各自直接给值（与任务栏 setTaskFilter 同一口径），换条件要重拉第一页
    setFeedFeatured(v) {
      that.feedOnlyFeatured = v;
      that.loadFeed(true, true);
    },
    goSubmit(task) {
      // 选了任务的入口（本页任务卡、任务日历）一律先进任务详情页，列表这一层不再拦点击：
      // 「去打卡」恒可点，能不能打卡、不能的话为什么，由详情页吸底按钮按后端同一批字段（can_check/check_msg）
      // 判并给原因（M22 —— 判据只在后端一处，出口只留一个，两个入口不能一个进详情一个吃 toast）。
      // 提交页的 ?id=&task_id= 深链仍保留（分享链接与「编辑动态」回填态走那条路）
      if (task) {
        uni.navigateTo({ url: "/pages/app/checkin/taskdetail/taskdetail?task_id=" + task.id });
        return;
      }
      // 悬浮发布按钮是不选任务的普通动态提交，直达提交页，所以活动级闸门必须在这一层拦住
      //（M13：守卫分支不能静默 return）；文案与后端 Checkin::assertJoinable 同口径，
      // member_status=0 为未参与、2 为已暂停
      const info = that.info || {};
      if (info.can_submit != 1) {
        that.showGuard(Number(info.member_status) === 2 ? "打卡已暂停，请联系主办方" : "还没有参与打卡，参与后即可提交日记");
        return;
      }
      // 按活动级闸门判（休息日/时段/当日次数同样拦它）
      if (info.check_gate && info.check_gate.allowed == 0) {
        that.showGuard(info.check_gate.msg);
        return;
      }
      uni.navigateTo({ url: "/pages/app/checkin/submit/submit?id=" + that.id });
    },
    // 拦挡提示用原生确认弹窗（只给「知道了」，2026-09-26 用户口径：样式用 uni.showModal 本体，
    // 不自造弹层）：这一句要人读进去并记住时间，一秒的 toast 来不及看；
    // 原因文案仍取后端逐条下发那句，本页不拼（M22）
    showGuard(msg) {
      uni.showModal({
        title: "暂时不能打卡",
        content: msg || "当前不能打卡",
        showCancel: false,
        confirmText: "知道了",
        confirmColor: "#0968f6",
      });
    },
    goDiary(record) {
      uni.navigateTo({ url: "/pages/app/checkin/diary/diary?id=" + record.id + "&checkin_id=" + that.id });
    },
    // 封面加载失败（坏链/文件被删）：兜底默认图（与封面为空时同一张），页头不留破图
    onCoverError() {
      if (this.info) this.$set(this.info, 'cover', '/static/image/empty.png');
    },
    // 卡片评论图标：先弹共用的评论弹窗（评论列表 + 底栏「写下你的评论吧」→ 再弹回复框），
    // 与圈子动态卡片同一处实现、同一层级，不在本页直接弹输入框、也不跳日记详情页
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
      const old = record.is_liked;
      const oldCount = record.like_count;
      record.is_liked = old ? 0 : 1;
      record.like_count = oldCount + (old ? -1 : 1);
      that.$api("checkin.checkin.like", { checkin_id: that.id, record_id: record.id })
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
    goRank() {
      uni.navigateTo({ url: "/pages/app/checkin/rank/rank?id=" + that.id });
    },
    goRecord() {
      uni.navigateTo({ url: "/pages/app/checkin/record/record?id=" + that.id });
    },
    goTaskCalendar() {
      uni.navigateTo({ url: "/pages/app/checkin/taskcalendar/taskcalendar?id=" + that.id });
    },
    goMember() {
      uni.navigateTo({ url: "/pages/app/checkin/member/member?id=" + that.id });
    },
    // 头卡信息区进打卡介绍页（基本信息 + 活动介绍），已参与时介绍页吸底栏给「进入打卡」
    goIntro() {
      uni.navigateTo({ url: "/pages/app/checkin/intro/intro?id=" + that.id });
    },
    // 头卡右上角的搜索入口 → 本活动的动态搜索页（版式参照动态模块 pages/app/circle/search）
    goFeedSearch() {
      uni.navigateTo({ url: "/pages/app/checkin/search/search?id=" + that.id });
    },
    // 未参与自动跳介绍页（与 goIntro 的方向相反：这里是 replace，把本页从栈里替掉）——
    // 替换落定后返回键直接回上一页，不会弹回一张已参与态的主页；只跳一次，介绍页只有
    // is_member=1 才亮「进入打卡」，两边不会来回打转。这一条分支故意把骨架屏留在屏上，
    // 所以替换没落地时必须自己撤回来（见下方 stay()）
    redirectToIntro() {
      if (that.introRedirected) return;
      that.introRedirected = true;
      // 替换没落地就得自己撤骨架屏（规则22：进了加载态要把每个退出分支走完）：小程序在页面正在切换时
      // 会把这一次 redirectTo 静默丢掉——既不 success 也不 fail，只挂 fail 就没人关 loading，
      // 症状正是「接口数据已经回来了、页面永久停在灰块上、控制台还不报错」。
      // 在 complete 之后隔一帧再按「栈顶还是不是本页」判（400ms ≈ 一次页面切换动画）：替换成功时本页
      // 已出栈，不会提前把「免费参与」吸底栏闪出来一帧（那才是当初把 loading 留在 true 的理由），M13
      let fellBack = false;
      const stay = () => {
        const pages = getCurrentPages();
        const top = pages[pages.length - 1];
        if (fellBack || (top && top.$vm && top.$vm !== that)) return;
        fellBack = true;
        that.loading = false;
        that.loadFeed();
        that.applyShare();
      };
      uni.redirectTo({
        url: "/pages/app/checkin/intro/intro?id=" + that.id,
        complete: () => setTimeout(stay, 400),
      });
    },
    // 悬浮「更多」弹窗的快捷导航（与动态模块 pages/app/circle/index 同一份实现）
    moreNav(path, mode) {
      that.moreNavVisible = false;
      that.$nav.to(path, "local", mode || "navigateTo");
    },
    doJoin() {
      that.$api("checkin.checkin.join", { checkin_id: that.id }).then((ret) => {
        if (!ret || ret.code !== 1) return;
        uni.showToast({ title: "参与成功", icon: "none" });
        that.getData();
      });
    },
    doPasswordJoin() {
      if (!that.password) {
        uni.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      that.$api("checkin.checkin.passwordPay", { checkin_id: that.id, password: that.password }).then((ret) => {
        if (!ret || ret.code !== 1) return;
        that.pwdVisible = false;
        uni.showToast({ title: "兑换成功", icon: "none" });
        that.getData();
      });
    },
    goBuy() {
      const goodsList = [{
        goodsId: that.id,
        goodsType: 'checkin',
        count: 1,
        extend: '',
      }];
      that.$nav.to('/pages/order/submit/submit?type=checkin&goodsList=' + JSON.stringify(goodsList));
    },
    goCourse() {
      if (that.info && that.info.course_id) {
        uni.navigateTo({ url: "/pages/course/detail/detail?id=" + that.info.course_id });
      }
    },
  },
  // 小程序转发/朋友圈卡片：标题取活动名、封面取活动封面（H5 的分享由上面 getData 里 applyShare 走 JSSDK 设置；
  // 朋友圈卡片只认 query，回传 path 会丢页面参数）
  onShareAppMessage() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover);
  },
  onShareTimeline() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover, true);
  },
};
</script>
