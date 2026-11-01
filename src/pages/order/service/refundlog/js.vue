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



    //加载态走首屏骨架屏（M16，见 refundlog.vue 的 .rfl-sk-*），不再挂 uni.showLoading 的黑底转圈；
    //成功 / 业务失败 / 网络异常三条出口都要把 loading 收回去，否则骨架永久停着
    getData() {
      that.loading = true;

      var form = JSON.parse(JSON.stringify(that.form));
      form.order_no = that.pageParams.order_no;
      that.$api('order.service.refundLog', form).then(res => {
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list;
        }

        that.loading = false;
        //下拉刷新要等这一趟有回音才收条（M23），不在触发那一刻收
        uni.stopPullDownRefresh();
      }).catch(() => {
        that.loading = false;
        uni.stopPullDownRefresh();
      });
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