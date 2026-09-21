<script>
export default {
  data() {
    // loading 首屏即加载态（避免先闪“暂无校区”空态）；fetching 为请求进行中标记
    return {
      keyword: '',
      list: [],
      loading: true,
      fetching: false,
      // 分页状态：page 已加载到第几页、hasMore 是否还有下一页、loadStatus 供 u-loadmore 展示
      page: 1,
      hasMore: false,
      loadStatus: 'loadmore',
      // refresh 序号：搜索关键词变化时丢弃过期响应，防止旧数据回写覆盖新列表
      refreshSeq: 0,
      PAGE_SIZE: 20,
      installed: true,
    };
  },
  onLoad() {
    if (!this.$tools.systemConfig('app_isinstall_school')) {
      this.installed = false;
      uni.showToast({ title: '该功能未开通', icon: 'none' });
      setTimeout(() => {
        if (getCurrentPages().length > 1) { uni.navigateBack(); } else { uni.reLaunch({ url: '/pages/index/index' }); }
      }, 800);
      return;
    }
  },
  onShow() { if (this.installed) this.refresh(); },
  onPullDownRefresh() {
    // 刷新指示器要等数据回来再收：此前在 refresh() 后同步 stop，请求还没回来指示器就收了，用户看不出刷新有没有生效
    const done = () => uni.stopPullDownRefresh();
    this.refresh().then(done, done);
  },
  // 滚到底部加载下一页（已无下一页时不再请求）
  onReachBottom() { this.loadMore(); },
  methods: {
    // 单页请求：统一收口失败并返回 null，由调用方决定怎么收尾。
    // 业务码必须校验：接口异常（500 会被 request 层 resolve 成原始响应体）、业务失败（code=0 只 toast 不 reject）
    // 都不会进 catch，不校验就会把失败渲染成「暂无校区」，让用户以为没有校区
    fetchPage(page) {
      return this.$api('school.campus.list', { keyword: this.keyword, page, limit: this.PAGE_SIZE })
        .then((ret) => (ret && ret.code === 1 ? ret.data || {} : null)).catch(() => null);
    },
    // 加载一页：refresh 为真从第一页替换列表，否则追加到列表尾部
    loadList(refresh) {
      // 翻页请求进行中忽略重复触发（滚到底部会连续触发）；首屏/搜索刷新不受此限制，过期响应由 refreshSeq 丢弃
      if (!refresh && this.fetching) return Promise.resolve();
      const page = refresh ? 1 : this.page + 1;
      const seq = refresh ? ++this.refreshSeq : this.refreshSeq;
      this.fetching = true;
      this.loading = refresh;
      this.loadStatus = 'loading';
      return this.fetchPage(page).then((data) => {
        // 过期响应丢弃：关键词已变，旧响应不得回写覆盖新列表（也不能清掉在途标记）
        if (seq !== this.refreshSeq) return;
        this.fetching = false;
        this.loading = false;
        if (!data) {
          // 失败保留已加载列表（旧数据好过空白），加载行按已确认的分页状态复位，便于再次上拉重试
          this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
          return;
        }
        const rows = data.list || [];
        this.list = refresh ? rows : this.list.concat(rows);
        this.page = page;
        this.hasMore = !!data.has_more;
        this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
      });
    },
    // 首页刷新（下拉刷新、搜索提交、清空、onShow 共用）：重置分页并从第一页重拉
    refresh() {
      this.page = 1;
      this.hasMore = false;
      return this.loadList(true);
    },
    // 上拉追加下一页（已无下一页时不再请求）
    loadMore() {
      if (!this.hasMore) return Promise.resolve();
      return this.loadList(false);
    },
    goDetail(c) {
      this.$nav.to('/pages/app/school/campus/detail/detail?id=' + c.id);
    },
  },
};
</script>
