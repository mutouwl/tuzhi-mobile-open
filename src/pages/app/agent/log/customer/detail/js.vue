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
      loading:true

    }
  },
  watch: {
  },
  methods: {

    getData() {
      
      that.loading = true;
      uni.showLoading({
        title: '请稍后'
      });
      that.$api('app.agent.customer.getCustomerDetail', {
        user_id:that.pageParams.id
      }).then(res => {
        if (res.code === 1) {
          that.data = res.data;
          that.loading = false;
        }else{
          setTimeout(function(){
            that.$nav.back(1);
          },1400)
        }
        
        uni.hideLoading();
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