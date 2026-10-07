<script>
import { listTitle, applyH5Share, mpCard } from "@/common/utils/checkin-share";
import { goOwnerRecord } from "@/common/utils/checkin-owner";
var that;
export default {
  data() {
    return {
      id: 0,
      loading: true,
      keyword: "",
      order: "desc",
      list: [],
      notFound: false,
      loadMsg: "",
      // 分享卡片用：活动名与封面由 memberList 接口一并下发（见后端 shareMeta）
      title: "",
      cover: "",
      page: 1,
      limit: 20,
      hasMore: true,
      loadStatus: "loadmore",
      filterVisible: false,
      sortOptions: [
        { name: "按加入时间倒序", value: "desc" },
        { name: "按加入时间正序", value: "asc" },
      ],
    };
  },
  computed: {
    // 微信分享卡片（列表页口径）：「活动名 · 成员」+ 活动封面，只写「成员」分享出去认不出是哪个活动
    shareTitle() {
      return listTitle(this.title, "成员");
    },
    shareCover() {
      return this.cover || "";
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
    that.getData();
  },
  // 模块级 that 停在最后 onLoad 的实例上；本页重新可见先收回绑定。
  // 同一路由在栈里出现两次（环跳）时，不收回就会把刷新/点赞/分页全改到已销毁的那一个上
  // （症状：退回后按钮整排点不动、骨架屏永不撤，而接口其实是成功的）
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
    if (!that.hasMore || that.loadStatus === "loading") return;
    that.page += 1;
    that.getData();
  },
  methods: {
    // 分享卡片口径见 common/utils/checkin-share：H5 走 JSSDK，小程序端走下面的 onShare* 钩子
    applyShare() {
      applyH5Share(this.$nav, this.shareTitle, this.shareCover);
    },
    refresh() {
      that.page = 1;
      that.list = [];
      that.hasMore = true;
      // 列表已清空，必须回到骨架屏，否则搜索/筛选期间会闪一下「暂无成员」空态
      that.loading = true;
      return that.getData();
    },
    onKeywordChange(e) {
      that.keyword = (e && e.value !== undefined) ? e.value : (e || "");
    },
    // 成员卡 → 该学员在本活动内的打卡记录页（与动态卡头部、排行榜行、日记作者行同一个入口，
    // 守卫与地址只存 common/utils/checkin-owner 一处；能不能看、看到哪些条由后端判）
    goUserRecord(row) {
      goOwnerRecord(row, that.id);
    },
    // 头像加载失败（坏链/文件被删）：就地兜底默认头像，成员卡不再留破图
    onAvatarError(row) {
      if (row) this.$set(row, 'avatar', '/static/image/default-avatar.png');
    },
    onFilterConfirm(e) {
      that.order = e.sort || that.order;
      that.refresh();
    },
    getData() {
      that.loadStatus = "loading";
      return that.$api("checkin.checkin.memberList", { checkin_id: that.id, page: that.page, limit: that.limit, keyword: that.keyword, order: that.order })
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
          that.title = ret.data.title || "";
          that.cover = ret.data.cover || "";
          that.hasMore = that.list.length < (ret.data.total || 0);
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
