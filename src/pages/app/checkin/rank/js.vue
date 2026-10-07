<script>
import { listTitle, applyH5Share, mpCard } from "@/common/utils/checkin-share";
import { goOwnerRecord } from "@/common/utils/checkin-owner";
var that;
export default {
  data() {
    return {
      id: 0,
      loading: true,
      period: "total",
      // u-tabs 约定用 name 渲染，value 作为 period 参数值
      tabs: [
        { name: "总榜", value: "total" },
        { name: "本周", value: "week" },
        { name: "上周", value: "lastweek" },
        { name: "今日", value: "today" },
        { name: "昨日", value: "yesterday" },
      ],
      list: [],
      notFound: false,
      loadMsg: "",
      my: null,
      totalUsers: 0,
      // 所有人打卡次数：本榜期内全员的次数之和（后端 rank 接口的 total_records，与「我的打卡次数」同一张榜）
      totalRecords: 0,
      // 分享卡片用：活动名与封面由 rank 接口一并下发（见后端 shareMeta）
      title: "",
      cover: "",
      page: 1,
      limit: 20,
      hasMore: true,
      loadStatus: "loadmore",
    };
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
    that.getData();
  },
  // 模块级 that 停在最后 onLoad 的实例上；本页重新可见先收回绑定。
  // 同一路由在栈里出现两次（环跳）时，不收回就会把刷新/分页全改到已销毁的那一个上
  // （症状：退回后按钮整排点不动、骨架屏永不撤，而接口其实是成功的）
  onShow() {
    that = this;
  },
  computed: {
    // 微信分享卡片（列表页口径）：「活动名 · 排行榜」+ 活动封面；
    // 活动名要等 rank 接口回来，未回来时只用「排行榜」，不拼成「 · 排行榜」
    shareTitle() {
      return listTitle(this.title, "排行榜");
    },
    shareCover() {
      return this.cover || "";
    },
    tabIndex() {
      const hit = this.tabs.filter((t) => t.value === this.period)[0];
      return hit ? this.tabs.indexOf(hit) : 0;
    },
    // 「我的成绩」四格：一格只说一件事（排名与参与人数不再挤在同一格），标签与取值只存这一处，
    // 数值全吃接口下发（前端不自己数人、不自己加次数，切页签由接口重算）
    myStats() {
      const my = this.my || {};
      return [
        { label: "我的排名", value: my.rank || 0 },
        { label: "参与人数", value: this.totalUsers || 0 },
        { label: "我的打卡次数", value: my.num || 0 },
        { label: "所有人打卡次数", value: this.totalRecords || 0 },
      ];
    },
  },
  methods: {
    // 分享卡片口径见 common/utils/checkin-share：H5 走 JSSDK，小程序端走下面的 onShare* 钩子
    applyShare() {
      applyH5Share(this.$nav, this.shareTitle, this.shareCover);
    },
    onTabChange(e) {
      that.switchPeriod(that.tabs[e.index].value);
    },
    // 榜单行与「我的成绩」卡上的头像/昵称 → 那个学员在本活动内的打卡记录页
    // （入口与守卫只存 common/utils/checkin-owner 一处，与动态卡头部、成员卡同一个动作）
    goUserRecord(row) {
      goOwnerRecord(row, that.id);
    },
    getData(reset) {
      if (reset !== false) {
        that.page = 1;
        that.hasMore = true;
      }
      that.loading = !that.list.length;
      that.loadStatus = "loading";
      return that.$api("checkin.checkin.rank", { checkin_id: that.id, period: that.period, page: that.page, limit: that.limit })
        .then((ret) => {
          if (!ret || ret.code !== 1) {
            if (!that.list.length) {
              that.notFound = true;
              that.loadMsg = (ret && ret.msg) || "打卡活动不存在或已下架";
            }
            that.loading = false;
            that.loadStatus = "loadmore";
            return;
          }
          that.notFound = false;
          that.loadMsg = "";
          const rows = (ret.data && ret.data.rows) || [];
          that.list = that.page === 1 ? rows : that.list.concat(rows);
          that.my = (ret.data && ret.data.my) || null;
          that.totalUsers = (ret.data && ret.data.total_users) || 0;
          that.totalRecords = (ret.data && ret.data.total_records) || 0;
          that.title = ret.data.title || "";
          that.cover = ret.data.cover || "";
          that.hasMore = !!(ret.data && ret.data.has_more);
          that.loadStatus = that.hasMore ? "loadmore" : "nomore";
          that.loading = false;
          // 分享标题要带活动名，放在数据回调最后一步（H5 分享调用抛异常会中断前面的渲染）
          this.applyShare();
        })
        .catch(() => {
          if (!that.list.length) {
            that.notFound = true;
            that.loadMsg = "加载失败，请重试";
          }
          that.loading = false;
          that.loadStatus = "loadmore";
        });
    },
    switchPeriod(p) {
      that.period = p;
      that.list = [];
      that.notFound = false;
      that.getData();
    },
    loadMore() {
      if (!that.hasMore || that.loadStatus === "loading") return;
      that.page += 1;
      that.getData(false);
    },
    // 头像加载失败（坏链/文件被删）：就地兜底默认头像（我的卡与榜单行共用一个处理），不留破图
    onAvatarError(row) {
      if (row) this.$set(row, 'avatar', '/static/image/default-avatar.png');
    },
  },
  onReachBottom() {
    that.loadMore();
  },
  onPullDownRefresh() {
    that.getData().then(
      () => uni.stopPullDownRefresh(),
      () => uni.stopPullDownRefresh()
    );
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
