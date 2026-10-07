<script>
var that;

export default {
  data() {
    return {
      id: 0,
      keyword: "",
      // 关键词上限，与后端 FeedPage::sanitizeKeyword 的截断长度一致（超长关键词会拖垮 LIKE 查询）
      MAX_KEYWORD_LEN: 30,
      // 进入页面自动聚焦搜索框，拉起输入键盘（与动态模块搜索页同一档）
      searchFocus: false,
      loading: false,
      list: [],
      page: 1,
      limit: 10,
      total: 0,
      hasMore: true,
      loadStatus: "loadmore",
      // 空态文案：未搜索 / 搜无结果 / 接口给的原因，三种都从这一处出（M13：失败分支必须有可读出口）
      loadMsg: "请输入搜索内容",
      order: "desc",
      timeFilter: "all",
      customRange: { start: "", end: "" },
      filterVisible: false,
      // 排序只列动态流接口当下真能改的两档（与活动主页动态栏那排 chip 同一份选项），
      // 不把圈子搜索页的「评论最多/获赞最多」搬过来当假选项
      sortOptions: [
        { name: "正序", value: "asc" },
        { name: "倒序", value: "desc" },
      ],
    };
  },
  computed: {
    // 筛选条件是否已生效（非默认倒序，或选了发表日期范围），驱动搜索栏右侧筛选按钮转主题色
    filterActive() {
      return this.order != "desc" || this.timeFilter != "all";
    },
  },
  onLoad(options) {
    that = this;
    // 打卡是付费插件，未安装时本页连接口都没有（M14）
    if (!that.$tools.systemConfig("app_isinstall_checkin")) {
      uni.showToast({ title: "打卡功能未安装", icon: "none" });
      setTimeout(() => uni.navigateBack(), 800);
      return;
    }
    that.id = Number(options.id || 0);
    if (!that.id) {
      uni.showToast({ title: "页面参数错误", icon: "none" });
      setTimeout(() => uni.navigateBack(), 800);
      return;
    }
    setTimeout(() => {
      that.searchFocus = true;
    }, 300);
  },
  // 模块级 that 停在最后 onLoad 的实例上；本页重新可见先收回绑定
  // （同一路由在栈里出现两次时，搜索/分页会改到已销毁的那一个上）
  onShow() {
    that = this;
  },
  onPullDownRefresh() {
    that.refresh().then(
      () => uni.stopPullDownRefresh(),
      () => uni.stopPullDownRefresh()
    );
  },
  onReachBottom() {
    that.loadMore();
  },
  methods: {
    // t-search 在 Vue2 下不支持 v-model：显式把输入值同步回 keyword
    onKeywordChange(e) {
      that.keyword = (e && e.value) || "";
    },
    // 导航栏标题跟着搜索内容走（过长截断加省略号，避免导航栏溢出），与动态模块搜索页同一档
    formatTitle(keyword) {
      const text = (keyword || "").trim();
      if (!text) return "搜索日记";
      if (text.length <= 15) return text;
      return text.slice(0, 15) + "…";
    },
    // 键盘「搜索」键提交：空关键词不说「暂无结果」，只提示要输入内容
    onSearch(e) {
      let keyword = ((e && e.value) || that.keyword || "").trim();
      if (!keyword) {
        uni.showToast({ title: "请输入搜索内容", icon: "none" });
        return;
      }
      // 兜底截断：防粘贴等绕过输入框 maxlength 的超长关键词（后端也截，两处口径同一个数）
      if (keyword.length > that.MAX_KEYWORD_LEN) {
        keyword = keyword.slice(0, that.MAX_KEYWORD_LEN);
      }
      that.keyword = keyword;
      uni.setNavigationBarTitle({ title: that.formatTitle(keyword) });
      that.refresh();
    },
    onFilterConfirm(e) {
      that.order = e.sort || that.order;
      that.timeFilter = e.timeFilter || "all";
      that.customRange = e.customRange || { start: "", end: "" };
      that.refresh();
    },
    /**
     * 时间筛选 → 接口参数
     *
     * 打卡动态流按「发表日期」这根轴筛（record.day 列，YYYY-MM-DD），不像圈子那样传秒级时间戳：
     * 「近七天」是含今天的七天，与活动主页动态栏那个筛选按钮给的条件逐字同一份换算。
     */
    buildTimeParams() {
      const now = Math.floor(Date.now() / 1000);
      if (that.timeFilter == "7" || that.timeFilter == "30") {
        const days = that.timeFilter == "7" ? 6 : 29;
        return { day_start: that.dayStr(now - days * 86400), day_end: that.dayStr(now) };
      }
      if (that.timeFilter == "custom" && that.customRange.start && that.customRange.end) {
        return { day_start: that.customRange.start, day_end: that.customRange.end };
      }
      return {};
    },
    dayStr(ts) {
      const d = new Date(ts * 1000);
      const pad = (n) => (n < 10 ? "0" + n : "" + n);
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    },
    buildParams() {
      const p = { checkin_id: that.id, keyword: that.keyword, page: that.page, limit: that.limit, order: that.order };
      const time = that.buildTimeParams();
      if (time.day_start) p.day_start = time.day_start;
      if (time.day_end) p.day_end = time.day_end;
      return p;
    },
    // 换条件（提交搜索 / 改筛选 / 下拉刷新 / 卡片删除后重取）都回到第一页并铺骨架屏
    refresh() {
      that.page = 1;
      that.list = [];
      that.hasMore = true;
      that.loadStatus = "loadmore";
      // 没关键词就没有结果可列：不发请求，直接回到「请输入搜索内容」那一档空态
      if (!that.keyword || !that.keyword.trim()) {
        that.loading = false;
        that.total = 0;
        that.loadMsg = "请输入搜索内容";
        return Promise.resolve();
      }
      that.loading = true;
      return that.getData();
    },
    loadMore() {
      if (!that.hasMore || that.loadStatus === "loading" || that.loading) return;
      // 页码在取成功之后自增（失败那一次不翻页码，否则上拉会跳过一页不发请求）
      that.getData();
    },
    getData() {
      const first = that.page === 1;
      that.loadStatus = "loading";
      return that.$api("checkin.checkin.feed", that.buildParams())
        .then((ret) => {
          that.loading = false;
          if (!ret || ret.code !== 1) {
            that.loadStatus = "loadmore";
            // 失败要说得出原因（活动下架/被移出分组等后端给的话），不能静默停在「暂无数据」上（M13）
            if (!that.list.length) that.loadMsg = (ret && ret.msg) || "加载失败，请重试";
            return;
          }
          const rows = (ret.data && ret.data.rows) || [];
          that.list = first ? rows : that.list.concat(rows);
          that.page += 1;
          that.total = Number(ret.data.total) || 0;
          that.hasMore = that.list.length < that.total;
          that.loadStatus = that.hasMore ? "loadmore" : "nomore";
          that.loadMsg = that.total ? "" : "没有找到相关日记";
        })
        .catch(() => {
          that.loading = false;
          that.loadStatus = "loadmore";
          if (!that.list.length) that.loadMsg = "加载失败，请重试";
        });
    },
    // 点整卡 / 点卡片评论图标 → 这条动态详情（打卡的评论与分享都在详情页那一层）
    goDiary(record) {
      if (!record || !record.id) return;
      uni.navigateTo({ url: "/pages/app/checkin/diary/diary?id=" + record.id + "&checkin_id=" + that.id });
    },
    // 点赞：乐观改心形与计数，接口失败原样回滚并说一句为什么（与活动主页动态栏同一份写法）
    onLike(record) {
      const index = that.list.findIndex((x) => Number(x.id) === Number(record.id));
      if (index < 0) return;
      const item = that.list[index];
      const old = item.is_liked;
      const oldCount = item.like_count;
      item.is_liked = old ? 0 : 1;
      item.like_count = oldCount + (old ? -1 : 1);
      that.$api("checkin.checkin.like", { checkin_id: that.id, record_id: item.id }).then((ret) => {
        if (!ret || ret.code !== 1) {
          item.is_liked = old;
          item.like_count = oldCount;
          uni.showToast({ title: (ret && ret.msg) || "点赞失败，请重试", icon: "none" });
        }
      }).catch(() => {
        item.is_liked = old;
        item.like_count = oldCount;
      });
    },
  },
};
</script>
