<script>
var that;
export default {
  components: { },
  data() {
    return {
      form: {
        limit: 15,
        page: 1,
        search: '',
        order: '',
        sort: 'desc',
        id:0
      },
      list: [],
    
      pageParams:{}
    } 
  },
  watch: {
  },
  methods: {

    getData() {
      uni.showLoading({
        title: '请稍后'
      });

      //资产类型

      that.$api('app.test.worklog', that.form).then(res => {
        if (res.code === 1) {
          var list = that.list;

          if (that.form.page == 1) {
            list = [];
          }
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list;
        }

        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },
    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
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
    that.form.page++;
    that.getData();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    that.form.id = that.pageParams.id;
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