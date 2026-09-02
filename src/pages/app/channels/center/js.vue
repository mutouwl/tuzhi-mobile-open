<script>
var that;
export default {
  components: {},
  data() {
    return {
      pageParams: {},
      loading: false,
      list: [],
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
      that.$api("app.channels.sharer.store", {}).then((res) => {
        that.list = res.data;
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

    copy(nickname) {
      this.$tools.copy(nickname);
      uni.$u.toast("已复制小店名称，快去分享吧");
    },

    join(id) {
      that.$nav.to('/pages/app/channels/sharer/invite/invite?store_id='+id);
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
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>
