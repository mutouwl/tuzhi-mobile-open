<script>
var that;
export default {
  data() {
    return {
      pageParams: {},
      level: {
        list: [],
        user: 0,
      },
      config: {},
      userInfo: {},
      current: 0,
      loading: false,
    };
  },
  watch: {},
  methods: {
    getData() {
      that.loading = true;
      that.getUserInfo();
      that.getConfig();
      that
        .$api("app.agent.level.getLevelList", that.form)
        .then((res) => {
          if (res.code === 1) {
            that.level = res.data;
            that.current = res.data.user;
          }
          that.loading = false;
        })
        .catch((err) => {
          that.loading = false;
          uni.stopPullDownRefresh();
        });
      uni.stopPullDownRefresh();
    },

    getConfig() {
      that.$api("app.agent.config.getConfig", that.form).then((res) => {
        if (res.code === 1) {
          that.config = res.data;
        }
      });
      uni.stopPullDownRefresh();
    },
    getUserInfo() {
      that.$api("user.info.index", {}).then((res) => {
        if (res.code === 1) {
          that.userInfo = res.data;
        }
      });
    },

    //刷新
    refresh() {
      that.form.page = 1;
      that.list = [];
      that.getData();
    },

    levelChange(event) {
      this.current = event.detail.current;
    },
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    this.getData();
  },
};
</script>
