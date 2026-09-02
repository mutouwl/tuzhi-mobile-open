<script>
var that;
export default {
  data() {
    return {
      form: {
        limit: 15,
        page: 1,
        order: "desc",
        name: "",
      },
      list: [],
    };
  },
  watch: {},
  methods: {
    //调整排序
    changeOrder() {
      this.form.order = this.form.order == "desc" ? "asc" : "desc";
      this.refresh();
    },

    getData() {
      uni.showLoading({
        title: "请稍后",
      });
      //资产类型
      var form = JSON.parse(JSON.stringify(that.form));

      that.$api("app.channels.sharer.my", form).then((res) => {
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i]);
          }
          that.list = list;
        }

        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },

    //刷新
    refresh() {
      that.form.page = 1;
      that.list = [];
      that.getData();
    },

    unbind(id) {
      uni.showModal({
        title: "提示",
        content: "确定要取消该微信对视频号小店的绑定吗",
        success: function (res) {
          if (res.confirm) {
            uni.showLoading({
              title: "请稍后",
            });
            that
              .$api("app.channels.sharer.unbind", {
                id: id,
              })
              .then((res) => {
                uni.$u.toast(res.msg);
                if (res.code === 1) {
                  that.refresh();
                }
                that.loading = false;
                uni.hideLoading();
              });
          }
        },
      });
    },
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    this.getData();
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  //上划加载
  onReachBottom() {
    that.form.page++;
    // that.getData();
  },
};
</script>
