<script>
var that;
export default {
  data() {
    return {
      pageParams:{
        id:0
      },
      data:{
        user:{},
        order:{}
      },
      // 首屏即为加载态：详情到达前整页铺骨架屏（M16），不用整页遮罩
      loading:true

    }
  },
  watch: {
  },
  methods: {

    getData() {
      
      // loading 只驱动首屏骨架屏：本次请求回音后撤掉；下拉刷新重取不置 true，
      // 免得已渲染的详情被占位块盖掉（与分销中心页同一口径）
      that.$api('app.agent.customer.getCustomerDetail', {
        user_id:that.pageParams.id
      }).then(res => {
        if (res.code === 1) {
          that.data = res.data;
        }else{
          setTimeout(function(){
            that.$nav.back(1);
          },1400)
        }
        // 取不到要退页，退之前这一秒不留一张占位页
        that.loading = false;
      }).catch(() => {
        // 请求失败也要撤掉骨架屏，否则页面一直停在占位态
        that.loading = false;
      });
      uni.stopPullDownRefresh();
    },

    //刷新
    refresh() {
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
  }
}
</script>