<script>
var that;
export default {
  data() {
    return {
      pageParams:{},
      data:{}
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