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
      // 首屏即为加载态：列表区先铺骨架屏（M16），撤骨架屏只在这次请求回音之后
      loading: true,
    }
  },
  watch: {
  },
  methods: {


    getData() {
      that.$api('user.message.list', this.form).then(res => {
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list
        }

        that.loading = false;
      }).catch(() => {
        that.loading = false;
      });
      uni.stopPullDownRefresh();
    },

    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      // 清空列表后把 loading 置回 true，否则骨架屏与真实列表之间会闪一帧空态（M16）
      that.loading = true;
      that.getData();
    },

  },
  mounted() {
    that = this;
    
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