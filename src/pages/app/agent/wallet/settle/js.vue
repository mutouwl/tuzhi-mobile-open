<script>
var that;
export default {
  data() {
    return {
      pageParams:{},
      data:{},
      // 首屏即为加载态：金额那一格先铺骨架屏（M16）；onShow 重取不置回 true，已渲染的数字不被盖掉
      loading:true
    }
  },
  watch: {
  },
  methods: {
    getData() {
      that.$api('app.agent.member.getMember', {}).then(res => {
        if (res.code === 1) {
          that.data = res.data;
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
      that.getData();
    },

  },
  onShow(){
    this.getData();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    
    this.getData();
  }
}
</script>