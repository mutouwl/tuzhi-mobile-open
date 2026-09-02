<script>
import circleCourseDir from "@/components/tz/circle-course-dir.vue";
import circlePostFilter from "../components/circle-post-filter.vue";
import shareModal from "@/components/modal/share-modal.vue";
var that;

export default {
  components: { circleCourseDir, circlePostFilter, shareModal },
  data() {
    return {
      id: 0,
      loading: true,
      info: null,
      notFound: false,
      loadMsg: '',
      tabIndex: 0,
      sort: 'new',
      timeFilter: 'all', // 时间筛选：all/7/30/custom
      customRange: { start: '', end: '' }, // 自定义时间范围（YYYY-MM-DD）
      posts: [],
      page: 1,
      limit: 10,
      total: 0,
      loadingMore: false,
      loadStatus: 'loadmore',
      showcaseList: [],
      modal: { sortFilter: false, more: false },
      tabLoading: false,
      shareVisible: false,
      reqSeq: 0, // 请求序号：tab 切换/刷新时自增，用于丢弃上一个未完成请求的过期响应
    };
  },
  computed: {
    isMember() {
      return !!(this.info && this.info.my_member);
    },
    myMember() {
      return (this.info && this.info.my_member) || {};
    },
    navTabs() {
      const info = this.info || {};
      // 管理端「导航设置」配置（nav_config）：按 status 过滤 + sort 排序 + name 重命名；无配置回退默认
      const config = this.parseNavConfig(info.nav_config);
      if (config.length) {
        const tabs = config
          .filter(n => n.status == 1)
          .sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0))
          .map(n => this.toNavTab(n, info))
          .filter(Boolean)
          // 问答功能已隐藏：导航配置中残留的问答 tab 一并过滤
          .filter(t => t.type != 'question');
        // 课程 tab 不在导航设置范围，自动置入（跟在「全部」后）
        if (info.course_count > 0) {
          const allIdx = tabs.findIndex(t => t.type == 'all');
          tabs.splice(allIdx < 0 ? 0 : allIdx + 1, 0, { name: '课程', type: 'course' });
        }
        return tabs;
      }
      // 默认导航（与导航设置默认一致）：全部/课程(有条件)/精选/圈主(有条件)/橱窗(有条件)/全部标签（问答导航已隐藏）
      const tabs = [{ name: '全部', type: 'all' }];
      if (info.course_count > 0) {
        tabs.push({ name: '课程', type: 'course' });
      }
      tabs.push({ name: '精选', type: 'essence' });
      // 圈主tab：只有圈主发布过动态才显示
      if (info.owner_post_count > 0) {
        tabs.push({ name: '圈主', type: 'owner' });
      }
      if (info.showcase_count > 0) {
        tabs.push({ name: '橱窗', type: 'showcase' });
      }
      (info.tags || []).forEach(t => tabs.push({ name: t.name, type: 'tag', tag_id: t.id }));
      return tabs;
    },
    currentTab() {
      return this.navTabs[this.tabIndex] || { type: 'all' };
    },
    sortText() {
      const m = { new: '最新发布', like: '最多点赞', comment: '最多评论' };
      return m[this.sort] || '最新发布';
    },
    // 筛选条件是否已生效（非默认排序或非全部时间），驱动排序图标选中色
    filterActive() {
      return this.sort != 'new' || this.timeFilter != 'all';
    }
  },
  onLoad(options) {
    that = this;
    that.id = Number(options.id || 0);
    // 圈子插件未安装时兜底
    if (!that.$tools.systemConfig("app_isinstall_circle")) {
      uni.showToast({ title: "圈子功能未安装", icon: "none" });
      setTimeout(() => uni.navigateBack(), 1200);
      return;
    }
    if (!that.id) {
      that.loading = false;
      return;
    }
    that.loadCircle();
  },
  onPullDownRefresh() {
    that.loadCircle();
  },
  onShow() {
    if (that.info) {
      that.refresh();
    }
  },
  onReachBottom() {
    if (that.currentTab.type == 'showcase') return;
    if (that.posts.length >= that.total) {
      that.loadStatus = 'nomore';
      return;
    }
    that.loadPosts(true, that.reqSeq);
  },
  methods: {
    formatCount(value) {
      const count = Number(value) || 0;
      if (count < 10000) return String(count);
      return (count / 10000).toFixed(2).replace(/\.?0+$/, '') + 'w';
    },
    postTitle(content) {
      if (!content) return '查看置顶动态';
      return String(content)
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/\s+/g, ' ')
        .trim() || '查看置顶动态';
    },
    // 解析导航配置（api 已解析为数组，兼容字符串兜底）
    parseNavConfig(navConfig) {
      if (!navConfig) return [];
      if (typeof navConfig === 'string') {
        try { return JSON.parse(navConfig) || []; } catch (e) { return []; }
      }
      return Array.isArray(navConfig) ? navConfig : [];
    },
    // 配置项 → 导航 tab：system 用 key 作为类型；tag 需标签仍存在；showcase 固定
    toNavTab(n, info) {
      if (n.type == 'tag') {
        const t = (info.tags || []).find(x => String(x.id) == String(n.key));
        if (!t) return null;
        return { name: n.name || t.name, type: 'tag', tag_id: t.id };
      }
      if (n.type == 'showcase') {
        return { name: n.name || '橱窗', type: 'showcase' };
      }
      return { name: n.name, type: n.key || n.type };
    },
    async loadCircle() {
      that.loading = true;
      try {
        const res = await that.$api('circle.circle.detail', { id: that.id });
        if (res.code === 1) {
          that.info = res.data;
          that.notFound = false;
          that.tabIndex = 0;

          // #ifdef H5
          // 圈子主页分享：圈子名 + 圈子封面（与售前页一致，无封面由分享层回退系统 logo）
          this.$nav.share(that.info.name, '', that.info.cover);
          // #endif

          // 首屏数据准备完成后再一次性创建页面节点。微信基础库 3.17.0 在
          // initial creation 尚未结束时继续插入动态列表节点，偶发 descriptor 错序并白屏。
          await that.refresh();
          that.loading = false;
        } else {
          that.loading = false;
          // 圈子访问状态由后端 data.access 下发（not_member/expired/black），不再依赖 403 状态码
          const access = (res.data && res.data.access) || '';
          if (access === 'not_member' || access === 'expired' || res.code === 403 || (res.msg && res.msg.indexOf('成员') > -1)) {
            // 非成员/权限过期：弹窗引导跳售前页加入/续费（circle_id 优先取后端错误 data）
            that.info = null;
            uni.showModal({
              title: '提示',
              content: res.msg || '你还不是圈子成员，请先加入圈子',
              showCancel: false,
              success: () => {
                that.$nav.to('/pages/app/circle/presale/presale?id=' + ((res.data && res.data.circle_id) || that.id));
              }
            });
          } else if (access === 'black') {
            // 黑名单：展示空状态与封禁文案（不跳售前页，避免与售前页自动进入形成循环）
            that.info = null;
            that.notFound = true;
            that.loadMsg = res.msg || '你已被限制访问该圈子';
          } else {
            // 圈子不存在或状态异常：展示空状态
            that.info = null;
            that.notFound = true;
            that.loadMsg = res.msg || '圈子不存在或状态异常';
          }
        }
      } catch (e) {
        that.loading = false;
        that.info = null;
        that.notFound = true;
        that.loadMsg = (e && (e.msg || e.errMsg)) || '加载失败，请稍后重试';
      } finally {
        uni.stopPullDownRefresh();
      }
    },
    onTabChange(e) {
      that.tabIndex = e.index;
      that.refresh();
    },
    toggleSort() {
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
      that.total = 0;
      that.tabLoading = true;
      // 请求序号：tab 切换/刷新时自增，用于丢弃上一个未完成请求的过期响应
      const seq = ++that.reqSeq;
      let p;
      if (that.currentTab.type == 'showcase') {
        p = that.loadShowcase(seq);
      } else if (that.currentTab.type == 'course') {
        // 课程目录与专栏目录一致：切换到 tab 后由新挂载的子组件自行请求。
        that.tabLoading = false;
        return Promise.resolve();
      } else {
        p = that.loadPosts(false, seq);
      }
      return p.finally(() => {
        // 仅当仍是当前请求时结束加载态，避免被过期请求提前关闭
        if (seq === that.reqSeq) that.tabLoading = false;
      });
    },
    async loadPosts(more, seq) {
      // 分页加载防重入：上一个分页请求未完成则跳过；刷新加载（more=false）不受限，靠 seq 丢弃过期响应
      if (more && that.loadingMore) return;
      that.loadingMore = true;
      that.loadStatus = 'loading';
      try {
        // 时间筛选参数：近七天/近30天传开始时间戳；自定义传起止时间戳
        const timeParams = that.buildTimeParams();
        const params = {
          circle_id: that.id,
          tab: that.currentTab.type == 'tag' ? 'tag' : that.currentTab.type,
          tag_id: that.currentTab.tag_id || 0,
          sort: that.sort,
          page: that.page,
          limit: that.limit,
          start_time: timeParams.start_time,
          end_time: timeParams.end_time,
        };
        const res = await that.$api('circle.post.list', params);
        // 期间已切换 tab / 重新刷新：丢弃过期响应
        if (seq !== that.reqSeq) return;
        if (res.code === 1) {
          const rows = res.data.rows || [];
          that.total = res.data.total || 0;
          that.posts = more ? that.posts.concat(rows) : rows;
          that.page++;
          that.loadStatus = that.posts.length >= that.total ? 'nomore' : 'loadmore';
        } else {
          that.loadStatus = 'loadmore';
          // 访问状态异常（有效期在浏览中过期/被移出）：同 loadCircle 弹窗引导跳售前页续费/加入
          const access = (res.data && res.data.access) || '';
          if (access === 'expired' || access === 'not_member' || res.code === 403 || (res.msg && res.msg.indexOf('成员') > -1)) {
            uni.showModal({
              title: '提示',
              content: res.msg || '你还不是圈子成员，请先加入圈子',
              showCancel: false,
              success: () => {
                that.$nav.to('/pages/app/circle/presale/presale?id=' + ((res.data && res.data.circle_id) || that.id));
              }
            });
          }
        }
      } finally {
        that.loadingMore = false;
      }
    },
    async loadShowcase(seq) {
      const res = await that.$api('circle.circle.showcase', { circle_id: that.id });
      // 期间已切换 tab / 重新刷新：丢弃过期响应
      if (seq !== that.reqSeq) return;
      if (res.code === 1) {
        that.showcaseList = res.data || [];
      }
    },
    goTask() {
      if (!that.info || !that.info.today_task) return;
      that.$nav.to('/pages/course/detail/detail?id=' + that.info.today_task.course_id);
    },
    // 问答功能已隐藏：点击发布按钮直接进入发布动态页
    goPublish() {
      that.$nav.to('/pages/app/circle/post/publish?circle_id=' + that.id + '&type=text');
    },
    // 更多弹窗快捷导航（与 hover-btn 弹窗一致）
    moreNav(path, mode) {
      that.modal.more = false;
      that.$nav.to(path, 'local', mode || 'navigateTo');
    },
    goDetail(post) {
      that.$nav.to('/pages/app/circle/post/detail?id=' + post.id);
    },
    // 点击顶部封面/标题：进入圈子售前页（查看介绍、有效期与续费）
    goPresale() {
      that.$nav.to('/pages/app/circle/presale/presale?id=' + that.id);
    },
    // 跳转圈子动态搜索页（head 搜索图标）
    goSearch() {
      that.$nav.to('/pages/app/circle/search/search?circle_id=' + that.id);
    },
    // 头部分享按钮：弹出分享弹窗（海报/图文，分享圈子售前页）
    openShare() {
      that.shareVisible = true;
    },
    goGoods(g) {
      that.$nav.to('/pages/course/detail/detail?id=' + g.id);
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

      // 以服务端最终状态为准，避免本地状态与接口状态不一致。
      const liked = res.data && res.data.liked !== undefined
        ? Number(res.data.liked) === 1
        : !wasLiked;
      const nextLiked = liked ? 1 : 0;
      const nextPost = Object.assign({}, current);
      nextPost.liked = nextLiked;
      nextPost.like_count = Math.max(0, Number(current.like_count || 0) + (liked === wasLiked ? 0 : (liked ? 1 : -1)));

      // 同步点赞人列表，驱动点赞区（like-users）更新。
      const userInfo = uni.getStorageSync('user_info') || {};
      const nickname = userInfo.nickname || '我';
      const likeUsers = Array.isArray(current.like_users) ? current.like_users.slice() : [];
      const userIndex = likeUsers.indexOf(nickname);
      if (liked && userIndex === -1) likeUsers.unshift(nickname);
      if (!liked && userIndex > -1) likeUsers.splice(userIndex, 1);
      if (nextPost.like_count <= 0) likeUsers.length = 0;
      nextPost.like_users = likeUsers;

      // 替换数组项，确保微信小程序端重新渲染点赞图标颜色。
      that.$set(that.posts, postIndex, nextPost);
    }
  },
  onShareAppMessage() {
    // 第二参数为 desc，不能传路径；标题用圈子名，封面与预购页一致
    return this.$nav.share(that.info ? that.info.name : '', '', that.info ? that.info.cover : '');
  }
};
</script>
