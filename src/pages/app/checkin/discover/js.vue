<script>
import { applyH5Share, mpCard } from '@/common/utils/checkin-share';
import { goActivity } from '@/common/utils/checkin-activity';
export default {
  data() {
    return {
      loading: true,
      list: [],
      loadFailed: false,
      page: 1,
      limit: 20,
      hasMore: true,
      loadStatus: 'loadmore',
      // 枚举文案由接口下发（attr），前端不再自存一份
      attr: { join_type: {}, run_state: {}, checkin_mode: {} },
      // onShow 重取要跳过 onLoad 之后的那一次（onLoad 已经拉过首屏，否则同一时刻发两次请求）
      inited: false,
    };
  },
  computed: {
    // 微信分享卡片：与「我的打卡」同档，本页不挂在具体活动下，直接用页面名（列表页无内容封面，
    // H5 由 $nav.share 回退站点 logo，小程序端不传 imageUrl，走页面自动截图）
    shareTitle() {
      return '可参与的打卡';
    },
    shareCover() {
      return '';
    },
  },
  onLoad() {
    if (!this.$tools.systemConfig('app_isinstall_checkin')) {
      uni.showToast({ title: '打卡功能未安装', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 800);
      this.loading = false; // 兜底分支也要撤骨架：这一页只弹一句 toast 就留在灰块上，看着像「一直加载中」
      return;
    }
    this.refresh();
  },
  onShow() {
    // 标题不依赖接口，每次显示都按本页口径设一次（main.js 的全局兜底是无标题的站点名）
    this.applyShare();
    if (!this.inited) {
      this.inited = true;
      return;
    }
    // 从介绍页参与成功后退回来，这条已经不在「可参与」口径里了，重取首页免得留一张点了进不去参与的介绍页
    this.refresh();
  },
  onPullDownRefresh() {
    const done = () => uni.stopPullDownRefresh();
    this.refresh().then(done, done);
  },
  onReachBottom() {
    this.loadMore();
  },
  methods: {
    // 分享卡片口径见 common/utils/checkin-share（H5 走 JSSDK，小程序端走 onShare* 钩子）
    applyShare() {
      applyH5Share(this.$nav, this.shareTitle, this.shareCover);
    },
    refresh() {
      this.page = 1;
      this.list = [];
      this.hasMore = true;
      this.loadStatus = 'loadmore';
      this.loadFailed = false;
      return this.getData();
    },
    getData() {
      this.loading = this.page === 1;
      this.loadStatus = 'loading';
      return this.$api('checkin.checkin.discoverList', { page: this.page, limit: this.limit })
        .then((ret) => {
          if (!ret || ret.code !== 1) {
            // 拉取失败不能报成「暂无可参与的打卡」，那会把故障说成空数据
            if (!this.list.length) this.loadFailed = true;
            this.loadStatus = 'loadmore';
            this.loading = false;
            return;
          }
          this.loadFailed = false;
          const rows = (ret.data && ret.data.rows) || [];
          this.list = this.page === 1 ? rows : this.list.concat(rows);
          if (this.page === 1) {
            this.attr = (ret.data && ret.data.attr) || this.attr;
          }
          this.hasMore = !!(ret.data && Number(ret.data.has_more) === 1);
          this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
          this.loading = false;
        })
        .catch(() => {
          if (!this.list.length) this.loadFailed = true;
          this.loading = false;
          this.loadStatus = 'loadmore';
        });
    },
    loadMore() {
      if (!this.hasMore || this.loadStatus === 'loading') return;
      this.page += 1;
      this.getData();
    },
    // 本页每一条都是未参与的活动（后端 discoverList 口径已排除已参与），一律先进介绍页看介绍/价格/玩法再参与，
    // 与「我的打卡」列表里未参与条目的落点同一页；地址与分流在 common/utils/checkin-activity 一处存
    goIntro(item) {
      goActivity(item);
    },
  },
  // 小程序转发/朋友圈卡片：无封面时不传 imageUrl，让卡片走页面自动截图（口径见 common/utils/checkin-share）
  onShareAppMessage() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover);
  },
  onShareTimeline() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover, true);
  },
};
</script>
