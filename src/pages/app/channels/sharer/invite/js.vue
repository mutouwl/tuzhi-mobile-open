<script>
var that;
export default {
  components: {},
  data() {
    return {
      pageParams: {
        store_id:0,
        code:''
      },
      store: {
        logo: "",
        name: "",
      },
      qrcode: false,
      form: {
        username: "", //微信号
      },
      loading: false,
      qrcode: "",
      step: 1
    };
  },
  watch: {},
  methods: {
    next() {
      uni.showLoading({
        title: "请稍后",
      });
      that
        .$api("app.channels.sharer.invite", {
          username: that.form.username,
          share_code: that.pageParams.code,
          store_id:that.pageParams.store_id
        })
        .then((res) => {
          if (res.code === 1) {
            that.step = 2;
            that.qrcode = res.data;
          } else {
            that.qrcode = false;
          }
          that.loading = false;
          uni.hideLoading();
        });
    },
    check() {
      uni.showLoading({
        title: "请稍后",
      });
      that
        .$api("app.channels.sharer.check", {
          username: that.form.username,
          share_code: that.pageParams.code,
        })
        .then((res) => {
          uni.$u.toast(res.msg);
          if (res.code === 1) {
            uni.redirectTo({
              url: "/pages/app/channels/sharer/bind/bind",
            });
          }
          that.loading = false;
          uni.hideLoading();
        });
    },

    getAgentStatus() {
      that.loading = true;
      that.$api("app.agent.recruit.getStatus", {}).then((res) => {
        that.loading = false;
        if (res.data != 1) {
          //引导
          uni.showModal({
            title: "提示",
            content: "加入视频号分享员需先成为分销员，是否立即申请加入分销员？",
            confirmText:"立即加入",
            success: function (res) {
              if (res.confirm) {
                that.$nav.to(
                  "/pages/app/agent/member/recruit/recruit",
                  "local",
                  "redirectTo"
                );
              }else{
                that.$nav.back();
              }
            }
          });
        }
      });
    },
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    this.store.logo = this.$tools.systemConfig("logo");
    this.store.name = this.$tools.systemConfig("name");

    this.getAgentStatus();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>
