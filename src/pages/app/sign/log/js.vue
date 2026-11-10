<script>
var that;
export default {
  data() {
    return {
      form: {
        limit:15,
        page: 1
      },
      list: [],
      loading: true,
      pageParams:{
      }
    }
  },
  watch: {
  },
  methods: {




    getData() {
      that.loading = true;
      // 首屏（列表为空）由骨架屏给反馈，不再叠加原生 loading；上拉翻页时已有记录还在屏上，用「请稍后」提示
      var loadingTip = that.list.length > 0;
      if (loadingTip) {
        uni.showLoading({
          title: '请稍后'
        });
      }
      //资产类型
      var form = JSON.parse(JSON.stringify(that.form));

      that.$api('app.sign.log', form).then(res => {
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list;
        }

        if (loadingTip) {
          uni.hideLoading();
        }
        that.loading = false;
      }).catch(() => {
        if (loadingTip) {
          uni.hideLoading();
        }
        that.loading = false;
      });
      uni.stopPullDownRefresh();
    },

    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      that.getData();
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
    that.getData();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline(){
    return this.$nav.share();
  }
}
</script>
