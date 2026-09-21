<script>
var that;
export default {
  data() {
    return {
      form: {
        limit:10,
        page: 1
      },
      list: [],
      pageParams:{}
    }
  },
  watch: {
  },
  methods: {
    getData() {
      // that.$api('course.course', that.form).then(res => {
      //   if (res.code === 1) {
      //     var list = that.list;
      //     for (var i in res.data) {
      //       list.push(res.data[i])
      //     }
      //     that.list = list
      //   }
      // });
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
}
</script>