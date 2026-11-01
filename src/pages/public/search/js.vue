<script>
var that;
export default {
  data() {
    return {
      form: {
        limit: 10,
        page: 1,
        sort: 'time',
        type: ''
      },
      list: [],
      pageParams: {
        content: ''
      },
      modal: {
        filter: false
      },
      // 类型选项：弹窗里按 4 列换行渲染（与排序同放在 tz-filter-popup 内）
      typeOptions: [
        { name: '全部', value: '' },
        { name: '图文', value: 'article' },
        { name: '视频', value: 'video' },
        { name: '音频', value: 'audio' },
        { name: '专栏', value: 'column' },
        { name: '活动', value: 'activity' },
        { name: '练习', value: 'exercises' },
        { name: '会员卡', value: 'vipcard' },
        { name: '实物商品', value: 'physical' }
      ],
      // 排序选项：接口只认 time（最新）/ view（最热）两档
      sortOptions: [
        { name: '最近', value: 'time' },
        { name: '热门', value: 'view' }
      ],
      // 搜索框自动聚焦（进入页面后延迟置 true，拉起输入键盘）
      searchFocus: false,
      loading: true,
      tabLoading: false,
      loadingMore: false,
      loadStatus: 'loadmore',
      hasMore: true,
      // 空态文案：无结果 / 请求失败分开说（接口故障不写成「没有找到相关内容」）
      loadMsg: '暂无相关内容',
      // 请求序号：连点搜索/换筛选时自增，丢弃过期响应
      reqSeq: 0
    }
  },
  computed: {
    // 列表加载态（M16）：首屏与搜索/换筛选两支都驱动骨架，且要「列表为空」才成立（翻页追加不闪）
    listLoading() {
      return (this.loading || this.tabLoading) && !this.list.length;
    },
    // 筛选条件是否已生效（非默认排序或选了类型），驱动搜索栏右侧筛选按钮转主题色
    filterActive() {
      return this.form.type !== '' || this.form.sort !== 'time';
    }
  },
  methods: {
    // 搜索框输入变化：t-search 在 Vue2 下不支持 v-model，显式同步 value
    onKeywordChange(e) {
      that.pageParams.content = (e && e.value) || '';
    },
    search(e) {
      const value = e && e.value !== undefined ? e.value : that.pageParams.content;
      that.pageParams.content = (value || '').trim();
      that.refresh();
    },
    // 筛选弹窗确认：类型与排序一起应用并刷新
    onFilterConfirm(e) {
      that.form.type = e && e.type !== undefined ? e.type : '';
      that.form.sort = (e && e.sort) || 'time';
      that.refresh();
    },
    // 取列表：more = 翻页追加；seq 在发起时捕获，响应回来时对不上即丢弃
    async getData(more) {
      const seq = that.reqSeq;
      that.loadingMore = !!more;
      that.loadStatus = 'loading';

      let res;
      try {
        res = await that.$api('goods.list', Object.assign({}, that.form, {
          searchKey: (that.pageParams.content || '').trim()
        }));
      } catch (err) {
        that.loadingMore = false;
        if (seq !== that.reqSeq) return;
        if (more) that.form.page = Math.max(1, that.form.page - 1);
        that.hasMore = false;
        that.loadStatus = 'loadmore';
        that.loadMsg = (err && (err.msg || err.errMsg)) || '加载失败，请重试';
        that.endLoading(seq);
        return;
      }

      that.loadingMore = false;
      // 期间已改搜索词/换筛选：丢弃过期响应
      if (seq !== that.reqSeq) return;

      if (res && res.code === 1) {
        const rows = Array.isArray(res.data) ? res.data : [];
        that.list = more ? that.list.concat(rows) : rows;
        that.hasMore = rows.length >= that.form.limit;
        that.loadStatus = that.hasMore ? 'loadmore' : 'nomore';
        that.loadMsg = !rows.length && (that.pageParams.content || '').trim()
          ? '没有找到相关内容'
          : '暂无相关内容';
      } else {
        // 业务失败：翻页这一档把页码退回去，用户再滑到底还能重试
        if (more) that.form.page = Math.max(1, that.form.page - 1);
        that.hasMore = false;
        that.loadStatus = 'loadmore';
        that.loadMsg = (res && res.msg) || '加载失败，请重试';
      }
      that.endLoading(seq);
    },
    // 收尾：只有最新那次请求能撤骨架与下拉动画（过期的早回来一次不能把新请求的加载态关掉）
    endLoading(seq) {
      if (seq !== that.reqSeq) return;
      that.loading = false;
      that.tabLoading = false;
      that.loadingMore = false;
      uni.stopPullDownRefresh();
    },
    refresh() {
      that.form.page = 1;
      that.list = [];
      that.hasMore = true;
      that.loadingMore = false;
      that.loadStatus = 'loadmore';
      that.reqSeq += 1;
      that.tabLoading = true;
      return that.getData(false);
    }
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    if (!that.pageParams.content) that.pageParams.content = '';
    // 进入页面自动聚焦搜索框，拉起输入键盘
    setTimeout(() => {
      that.searchFocus = true;
    }, 300);
    that.refresh();
  },
  // 模块级 that 停在最后一次 onLoad 的实例上；本页重新可见先收回绑定
  // （同一路由在栈里出现两次时，搜索/翻页会改到另一份实例的数据上）
  onShow() {
    that = this;
  },
  onPullDownRefresh() {
    that.refresh();
  },
  onReachBottom() {
    if (that.loading || that.tabLoading || that.loadingMore || !that.hasMore) return;
    that.form.page++;
    that.getData(true);
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline(){
    return this.$nav.share();
  }
}
</script>
