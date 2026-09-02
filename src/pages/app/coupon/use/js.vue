<script>
var that;
import couponMy from "@/components/coupon/coupon-my.vue";
export default {
  components: { couponMy},
  data() {
    return {
      store:{
        logo:'',
        name:''
      },
      data:{}
    }
  },
  watch: {
  },
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
    //刷新
    refresh() {
      uni.showLoading({
        title: '请稍后'
      });
      that.getData();
    },
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  //上划加载
  onReachBottom() {
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    that.refresh();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>