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
      pageParams:{
      }
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
      var form = JSON.parse(JSON.stringify(that.form));

      that.$api('app.sign.log', form).then(res => {
        if (res.code === 1) {
          var list = that.list;
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