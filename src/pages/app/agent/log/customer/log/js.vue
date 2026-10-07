<script>
var that;
export default {
  data() {
    return {
      form: {
        limit:15,
        page: 1,
        order:'desc',
        name:''
      },
      list: [],
      // 首屏即为加载态：列表区先铺骨架屏（M16），撤骨架屏只在本次请求回音之后
      loading: true,
      pageParams:{
        type:'money'
      },
    }
  },
  watch: {
  },
  methods: {


    //调整排序
    changeOrder(){
      this.form.order = this.form.order == 'desc' ? 'asc' : 'desc';
      this.refresh();
    },

    getData() {
      
      //资产类型
      var form = JSON.parse(JSON.stringify(that.form));
      form.type = that.pageParams.type;

      that.$api('app.agent.customer.getCustomerList', form).then(res => {
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list
        }
        that.loading = false;
      }).catch(() => {
        // 请求失败也要撤掉骨架屏，否则页面一直停在占位态（与分销中心页同一口径）
        that.loading = false;
      });
      uni.stopPullDownRefresh();
    },

    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      // 搜索/排序/下拉刷新会清空列表，loading 置回 true 才不换成一帧空态（M16）
      that.loading = true;
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
    // that.getData();
  },
}
</script>