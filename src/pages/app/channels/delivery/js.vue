<script>
var that;
import deliveryQrcodeModal from "@/pages/app/channels/components/delivery-qrcode-modal.vue";
export default {
  components: {
    deliveryQrcodeModal
  },
  data() {
    return {
      pageParams: {},
      store:{
        logo:'',
        name:''
      },
      goods:{

      },
      order:"",
      loading:false,
      modal:{
        qrcode:false
      },
      qrcode:''
    };
  },
  watch: {},
  methods: {
    getData() {
      uni.showLoading({
        title: "请稍后",
      });
      that.loading = true;

      //资产类型
      that
        .$api("app.channels.delivery.detail", {
          code: that.pageParams.code,
          order:that.pageParams.order
        })
        .then((res) => {
          if (res.code === 1) {
            that.goods = res.data.goods_info
            that.qrcode = res.data.qrcode
            that.order = res.data.order
          }else{
            that.goods = false;
          }
          that.loading = false;
          uni.hideLoading();
        });
      uni.stopPullDownRefresh();
    },
    //刷新
    refresh() {
      uni.showLoading({
        title: "请稍后",
      });
      that.getData();
    },
    copy(){
      //复制到剪贴板
      uni.setClipboardData({
        data: that.order,
        success: function () {
          uni.showToast({
            title: "复制成功",
            icon: "none",
          });
        },
      });
    }
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    that.refresh();

    this.store.logo = this.$tools.systemConfig('logo');
    this.store.name = this.$tools.systemConfig('name');
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>