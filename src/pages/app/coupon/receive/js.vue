<script>
var that;
// import exercisesControlModal from "../components/exercises-control-modal.vue";
import couponMy from "@/components/coupon/coupon-my.vue";
export default {
  components: { couponMy },
  data() {
    return {
      store: {
        logo: "",
        name: "",
      },
      form: {},
      pageParams:{},
      data: {},
    };
  },
  watch: {},
  methods: {
    getData() {
      uni.showLoading({
        title: "请稍后",
      });

      //资产类型

      that
        .$api("app.coupon.detail", {
          id: that.pageParams.id,
          ucid:that.pageParams.ucid
        })
        .then((res) => {
          if (res.code === 1) {
            that.data = res.data;
          }

          uni.hideLoading();
        });
      uni.stopPullDownRefresh();
    },

    /**
     * 领取优惠券
     */
    receive() {
      uni.showLoading({
        title: "请稍后",
      });

      //资产类型
      that
        .$api("app.coupon.receive", {
          id: that.pageParams.id,
        })
        .then((res) => {
          uni.hideLoading();
          
          if (res.code == 1) {
            that.pageParams.ucid = res.data.id
            that.getData();
          }
          
          uni.$u.toast(res.msg);
        });
      uni.stopPullDownRefresh();
    },

    use(){
      that.$nav.to("/pages/app/coupon/use/use?id=" + that.pageParams.id);
    }
  },
  //下拉刷新
  onPullDownRefresh() {
    that.getData();
  },
  //上划加载
  onReachBottom() {
    // that.form.page++;
    // that.getData();
  },
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
