<script>
var that;
import couponMy from "@/components/coupon/coupon-my.vue";
import shareModal from "@/components/modal/share-modal.vue";
export default {
  components: { couponMy, shareModal },
  data() {
    return {
      store: {
        logo: "",
        name: "",
      },
      // 路由参数（id / ucid）要在 data 里声明：模板里 :val="pageParams.id" 吃的是响应式这一份
      pageParams: {},
      // 首屏骨架屏（M16，替代原来的 uni.showLoading 黑底转圈 toast）：券卡走 coupon-my 的 skeleton 档，
      // 余量进度与操作按钮是 v-if 才出的那一段，加载中不预留
      loading: true,
      // 取数失败的原因（空串=没失败）：失败说失败原因，不渲染成一张空券卡（M13）
      failMsg: "",
      data: {},
      // 「分享给好友」入口开的全站分享弹窗
      shareVisible: false,
      // 领取进行中：挡住连点（领券不是幂等的，连点会多领一张）
      receiving: false,
    };
  },
  watch: {},
  methods: {
    getData() {
      that.loading = true;
      that.failMsg = "";

      //资产类型
      return that
        .$api("app.coupon.detail", {
          id: that.pageParams.id,
          ucid: that.pageParams.ucid,
        })
        .then((res) => {
          that.loading = false;
          // 业务失败与网络异常都要把骨架撤下来，只写成功那一支会永远停在灰块上（M16）
          if (!res || res.code !== 1) {
            that.failMsg = (res && res.msg) || "加载失败，请重试";
            return;
          }
          that.data = res.data;
        })
        .catch(() => {
          that.loading = false;
          that.failMsg = "加载失败，请重试";
        });
    },
    //刷新
    refresh() {
      return that.getData();
    },

    /**
     * 领取优惠券：成功后把 ucid 换成新领到的这一张再重取，主操作随之变成「立即使用」
     */
    receive() {
      if (that.loading || that.receiving) return;
      that.receiving = true;
      uni.showLoading({
        title: "领取中",
      });
      return that
        .$api("app.coupon.receive", {
          id: that.pageParams.id,
        })
        .then((res) => {
          uni.hideLoading();
          that.receiving = false;
          if (res && res.code == 1 && res.data) {
            // 新领到的这一张顶上去，重取后主操作随之变「立即使用」
            that.pageParams.ucid = res.data.id;
            that.getData();
            uni.$u.toast(res.msg);
            return;
          }
          // 业务失败那一档由请求拦截器统一说原因（code=0 会弹一次），这里不再叠一句
        })
        .catch(() => {
          // 网络异常也要收掉进度条与在途标记，否则按钮永久点不动（M22 同族）
          uni.hideLoading();
          that.receiving = false;
          uni.$u.toast("领取失败，请重试");
        });
    },

    /**
     * 立即使用（2026-10-27 用户点名「点击立即使用，应该跳转到店铺主页」）：
     * 本页就是「使用」的落点，再跳回本页等于原地不动；这里回店铺主页挑可用商品，
     * 跳法照 `tz-footer`「店铺主页」同一档 —— 首页是站点根，用 reLaunch 清栈，
     * 不在页面栈上再叠一层首页（否则反复点会一直加页）
     */
    use() {
      that.$nav.to("/pages/index/index", "local", "reLaunch");
    },

    openShare() {
      that.shareVisible = true;
    },
  },
  onShow() {
    // 模块级 that 停在最后 onLoad 的实例上，本页重新可见先收回绑定（M23）
    that = this;
  },
  //下拉刷新
  onPullDownRefresh() {
    // 下拉的圈等请求落地再收（M4），失败也收
    const done = () => uni.stopPullDownRefresh();
    that.refresh().then(done, done);
  },
  //上划加载
  onReachBottom() {},
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    this.store.logo = this.$tools.systemConfig("logo");
    this.store.name = this.$tools.systemConfig("name");
    that.getData();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>
