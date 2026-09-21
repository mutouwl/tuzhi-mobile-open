<script>
var that;
export default {
  data() {
    return {
      pageParams:{},
      data:{},
      config:{},
      status:0,
      userCondition:{
        pay_count:0,
        pay_price:0,
      }
    }
  },
  watch: {
  },
  methods: {
    getData() {
      that.getConfig();
      that.getStatus();
      that.getUserCondition();
    },

    getConfig() {
      that.$api('app.agent.config.getConfig', {}).then(res => {
        if (res.code === 1) {
          that.config = res.data;
        }
      });
      uni.stopPullDownRefresh();
    },

    getStatus() {
      that.$api('app.agent.recruit.getStatus', {}).then(res => {
        if (res.code === 1) {
          that.status = res.data;

          if(that.status== 1){
            that.$nav.to('/pages/app/agent/center/center','local','redirectTo');
          }
        }
      });
    },
    getUserCondition() {
      that.$api('app.agent.recruit.getUserCondition', {}).then(res => {
        if (res.code === 1) {
          that.userCondition = res.data;
        }
      });
    },
    
    apply(){
      that.$api('app.agent.recruit.apply', {}).then(res => {
        if (res.code === 1) {
          that.getData();
        }
        uni.$u.toast(res.msg);

      });
    }

  },
  //下拉刷新
  onPullDownRefresh() {
    this.getData();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    
    this.getData();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline(){
    return this.$nav.share();
  }
}
</script>