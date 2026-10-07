<script>
var that;
export default {
  data() {
    return {
      pageParams:{},
      data:{},
      config:{},
      status:0,
      // 首屏即为加载态：三个接口全部回音前整页铺骨架屏（M16），不用整页遮罩
      loading:true,
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
      // 骨架屏收口：配置 / 申请状态 / 达成条件三者都到手才撤，早撤会按空配置渲染成「分销功能已关闭」；
      // 下拉刷新与「重新申请」后再取不置 true，已渲染的内容不被占位块盖掉（同分销中心页口径）
      var jobs = [that.getConfig(), that.getStatus(), that.getUserCondition()];
      Promise.all(jobs.map(job => job.catch(() => null))).then(() => {
        that.loading = false;
        // 下拉刷新的那一圈要等请求结束才停，否则用户看不出刷新有没有结果（M4）
        uni.stopPullDownRefresh();
      });
    },

    getConfig() {
      return that.$api('app.agent.config.getConfig', {}).then(res => {
        if (res.code === 1) {
          that.config = res.data;
        }
      });
    },

    getStatus() {
      return that.$api('app.agent.recruit.getStatus', {}).then(res => {
        if (res.code === 1) {
          that.status = res.data;

          if(that.status== 1){
            that.$nav.to('/pages/app/agent/center/center','local','redirectTo');
          }
        }
      });
    },
    getUserCondition() {
      return that.$api('app.agent.recruit.getUserCondition', {}).then(res => {
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