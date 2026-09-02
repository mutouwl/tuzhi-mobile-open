<script>
var that;
export default {
  components: {},
  data() {
    return {
      code: '',
      pageParams: {}
    }
  },
  watch: {
  },
  methods: {

    exchange() {

      uni.showLoading({
        title: '请稍后'
      });

      if (!that.code) {
        uni.$u.toast('请输入兑换码');
        return;
      }

      that.$api('app.exchange.exchange', {
        code: that.code
      }).then(res => {
        uni.hideLoading();
        if (res.code == 1) {
          that.code = '';
          uni.showModal({
            title: '提示',
            content: res.msg,
            confirmText: '查看订阅',
            success: function (res) {
              if (res.confirm) {
                that.$nav.to('/pages/user/subscription/subscription')
              }
            }
          });
        } else {
          uni.$u.toast(res.msg);
        }
        
      }, res => {
        uni.$u.toast(res.msg);
      });
    },


  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    if(that.pageParams.code){
      that.code = that.pageParams.code;
    }
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>