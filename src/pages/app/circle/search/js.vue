<script>
import circlePostFilter from "../components/circle-post-filter.vue";
import TSearch from '@tdesign/uniapp/search/search.vue';
var that;

export default {
  components: { circlePostFilter, TSearch },
  data() {
    return {
      id: 0,
      keyword: '',
      // 搜索关键词最大长度（与后端截断长度一致，防超长关键词拖垮 LIKE 搜索）
      MAX_KEYWORD_LEN: 30,
      // 搜索框自动聚焦（进入页面后延迟置 true，拉起输入键盘）
      searchFocus: false,
      loading: true,
      // 空状态文案：未搜索/搜索无结果两种
      loadMsg: '请输入搜索内容',
      sort: 'new',
      timeFilter: 'all', // 时间筛选：all/7/30/custom
      customRange: { start: '', end: '' }, // 自定义时间范围（YYYY-MM-DD）
      posts: [],
      page: 1,
      limit: 10,
      total: 0,
      tabLoading: false,
      loadingMore: false,
      loadStatus: 'loadmore',
      modal: { sortFilter: false },
      contentProtect: 0,
    };
  },
  computed: {
    // 筛选条件是否已生效（非默认排序或非全部时间），驱动筛选图标选中色
    filterActive() {
      return this.sort != 'new' || this.timeFilter != 'all';
    }
  },
  onLoad(options) {
    that = this;
    that.id = Number(options.circle_id || 0);
    that.keyword = options.keyword || '';
    // 圈子插件未安装时兜底
    if (!that.$tools.systemConfig("app_isinstall_circle")) {
      uni.showToast({ title: "圈子功能未安装", icon: "none" });
      setTimeout(() => uni.navigateBack(), 1200);
      return;
    }
    if (!that.id) {
      that.loading = false;
      uni.showToast({ title: '页面参数错误', icon: 'none' });
      return;
    }
    // 页面标题展示搜索内容（过长截断加省略号）
    uni.setNavigationBarTitle({ title: that.formatTitle(that.keyword) });
    // 进入页面自动聚焦搜索框，拉起输入键盘
    setTimeout(() => {
      that.searchFocus = true;
    }, 300);
    if (that.keyword) {
      that.loadCircle();
    } else {
      // 尚未搜索：不加载列表，展示「请输入搜索内容」空状态
      that.loading = false;
    }
  },
  onPullDownRefresh() {
    if (!that.keyword) {
      uni.stopPullDownRefresh();
      return;
    }
    that.refresh();
  },
  onReachBottom() {
    if (that.posts.length < that.total) {
      that.loadPosts(true);
    }
  },
  methods: {
    // 圈子详情：取内容保护开关（失败不影响搜索列表）
    async loadCircle() {
      const res = await that.$api('circle.circle.detail', { id: that.id });
      if (res.code === 1) {
        that.contentProtect = res.data.content_protect || 0;
      }
      that.loading = false;
      await that.refresh();
      uni.stopPullDownRefresh();
    },
    // t-search 输入变化：组件在 Vue2 下不支持 v-model，显式同步 value
    onKeywordChange(e) {
      that.keyword = (e && e.value) || '';
    },
    // 导航栏标题：搜索内容过长截断加省略号，避免导航栏溢出
    formatTitle(keyword) {
      const text = (keyword || '').trim();
      if (!text) return '搜索动态';
      if (text.length <= 15) return text;
      return text.slice(0, 15) + '…';
    },
    // 搜索栏提交（键盘搜索键）：以当前关键词重新搜索
    onSearch(e) {
      let keyword = ((e && e.value) || that.keyword || '').trim();
      if (!keyword) {
        uni.showToast({ title: '请输入搜索内容', icon: 'none' });
        return;
      }
      // 兜底截断：防粘贴等绕过输入框 maxlength 的超长关键词
      if (keyword.length > that.MAX_KEYWORD_LEN) {
        keyword = keyword.slice(0, that.MAX_KEYWORD_LEN);
      }
      that.keyword = keyword;
      uni.setNavigationBarTitle({ title: that.formatTitle(keyword) });
      that.refresh();
    },
    // 打开筛选弹窗
    toggleFilter() {
      that.modal.sortFilter = true;
    },
    // 筛选弹窗确认：应用筛选并刷新列表
    onFilterConfirm(e) {
      that.sort = e.sort;
      that.timeFilter = e.timeFilter;
      that.customRange = e.customRange;
      that.refresh();
    },
    // 时间筛选转接口参数（int 时间戳，秒）
    buildTimeParams() {
      const now = Math.floor(Date.now() / 1000);
      if (that.timeFilter == '7' || that.timeFilter == '30') {
        return { start_time: now - Number(that.timeFilter) * 86400, end_time: 0 };
      }
      if (that.timeFilter == 'custom' && that.customRange.start && that.customRange.end) {
        return {
          start_time: Math.floor(new Date(that.customRange.start + ' 00:00:00').getTime() / 1000),
          end_time: Math.floor(new Date(that.customRange.end + ' 23:59:59').getTime() / 1000),
        };
      }
      return { start_time: 0, end_time: 0 };
    },
    refresh() {
      that.page = 1;
      that.posts = [];
      that.tabLoading = true;
      return that.loadPosts(false).finally(() => {
        that.tabLoading = false;
        // 停止下拉刷新动画：refresh 被 onPullDownRefresh 直接调用（不走 loadCircle），
        // 不在此停止会导致数据已加载完成但原生下拉加载图标一直转
        uni.stopPullDownRefresh();
      });
    },
    async loadPosts(more) {
      if (that.loadingMore) return;
      that.loadingMore = true;
      that.loadStatus = 'loading';
      // 无搜索内容时不返回搜索结果，直接清空并展示空状态
      if (!that.keyword || !that.keyword.trim()) {
        that.loadingMore = false;
        that.posts = [];
        that.total = 0;
        that.loadStatus = 'nomore';
        that.loadMsg = '请输入搜索内容';
        return;
      }
      // 时间筛选参数：近七天/近30天传开始时间戳；自定义传起止时间戳
      const timeParams = that.buildTimeParams();
      const params = {
        circle_id: that.id,
        tab: 'all',
        keyword: that.keyword,
        sort: that.sort,
        page: that.page,
        limit: that.limit,
        start_time: timeParams.start_time,
        end_time: timeParams.end_time,
      };
      const res = await that.$api('circle.post.list', params);
      that.loadingMore = false;
      if (res.code === 1) {
        const rows = res.data.rows || [];
        that.total = res.data.total || 0;
        that.posts = more ? that.posts.concat(rows) : rows;
        that.page++;
        that.loadStatus = that.posts.length >= that.total ? 'nomore' : 'loadmore';
        // 首次搜索（非加载更多）无结果时展示搜索无结果提示
        if (!more && rows.length === 0) {
          that.loadMsg = '没有找到相关动态';
        }
      } else {
        that.loadStatus = 'loadmore';
        if (!more) {
          // 非成员/异常：展示接口提示
          that.loadMsg = res.msg || '没有找到相关动态';
        }
      }
    },
    goDetail(post) {
      that.$nav.to('/pages/app/circle/post/detail?id=' + post.id);
    },
    async onLike(post) {
      if (!post || !post.id) return;
      const postIndex = that.posts.findIndex(item => Number(item.id) === Number(post.id));
      if (postIndex < 0) return;

      const current = that.posts[postIndex];
      const wasLiked = Number(current.liked) === 1;
      const api = wasLiked ? 'circle.post.unlike' : 'circle.post.like';
      let res;
      try {
        res = await that.$api(api, { target_type: 'post', target_id: current.id });
      } catch (e) {
        uni.showToast({ title: (e && e.msg) || '操作失败', icon: 'none' });
        return;
      }
      if (!res || Number(res.code) !== 1) {
        uni.showToast({ title: (res && res.msg) || '操作失败', icon: 'none' });
        return;
      }

      const liked = res.data && res.data.liked !== undefined
        ? Number(res.data.liked) === 1
        : !wasLiked;
      const nextPost = Object.assign({}, current);
      nextPost.liked = liked ? 1 : 0;
      nextPost.like_count = Math.max(0, Number(current.like_count || 0) + (liked === wasLiked ? 0 : (liked ? 1 : -1)));

      const userInfo = uni.getStorageSync('user_info') || {};
      const nickname = userInfo.nickname || '我';
      const likeUsers = Array.isArray(current.like_users) ? current.like_users.slice() : [];
      const userIndex = likeUsers.indexOf(nickname);
      if (liked && userIndex === -1) likeUsers.unshift(nickname);
      if (!liked && userIndex > -1) likeUsers.splice(userIndex, 1);
      if (nextPost.like_count <= 0) likeUsers.length = 0;
      nextPost.like_users = likeUsers;
      that.$set(that.posts, postIndex, nextPost);
    }
  }
};
</script>
