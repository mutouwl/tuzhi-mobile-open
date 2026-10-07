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
      // 首屏骨架屏（M16，替代原来的 uni.showLoading 黑底转圈 toast）：券卡走 coupon-my 的 skeleton 档，
      // 「推荐商品」那一段按 recommend_goods_status 判，加载中不预留
      loading: true,
      // 取数失败的原因（空串=没失败）：失败说失败原因，不渲染成一张空券卡（M13）
      failMsg: '',
      data:{}
    }
  },
  watch: {
  },
  methods: {

    getData() {
      that.loading = true;
      that.failMsg = '';

      //资产类型
      return that
        .$api("app.coupon.detail", {
          id: that.pageParams.id,
          ucid:that.pageParams.ucid
        })
        .then((res) => {
          that.loading = false;
          // 业务失败与网络异常都要把骨架撤下来，只写成功那一支会永远停在灰块上（M16）
          if (!res || res.code !== 1) {
            that.failMsg = (res && res.msg) || '加载失败，请重试';
            return;
          }
          that.data = res.data;
        })
        .catch(() => {
          that.loading = false;
          that.failMsg = '加载失败，请重试';
        });
    },
    //刷新
    refresh() {
      return that.getData();
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
