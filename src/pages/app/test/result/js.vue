<script>
var that;
import questionBox from "@/pages/app/exam/components/question-box.vue";
export default {
  components: { questionBox },
  data() {
    return {
      data: {
        test: {},
        button: {},
      },
      pageParams: {},
      loading: false,
    };
  },
  watch: {},
  methods: {
    //获取练习详情
    getData() {
      that.loading = true;
      uni.showLoading({
        title: "请稍后",
      });

      that
        .$api("app.test.result", {
          id: that.pageParams.id,
        })
        .then((res) => {
          that.loading = false;
          if (res.code === 1) {
            that.data = res.data;
          } else {
          }
          uni.hideLoading();
          uni.stopPullDownRefresh();
        })
        .catch((res) => {
          that.loading = false;
          uni.hideLoading();
          uni.stopPullDownRefresh();
        });
    },

    analysis() {
      that.$nav.to(
        "/pages/app/exam/work/work?id=" + that.pageParams.id + "&jobtype=test",
        "local",
        "redirectTo"
      );
    },

    buildWork() {
      //创建练习
      uni.showLoading({
        title: "请稍后",
      });
      that
        .$api("app.test.buildLog", {
          id: that.data.test_id,
        })
        .then((res) => {
          uni.hideLoading();
          if (res.code === 1) {
            that.$nav.to(
              "/pages/app/exam/work/work?id=" + res.data + "&jobtype=test",
              "local",
              "redirectTo"
            );
          }
        })
        .catch((res) => {
          uni.hideLoading();
        });
    },

    gohome() {
      that.$nav.to("/pages/index/index", "local");
    },
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    that.getData();
  },
  //下拉刷新
  onPullDownRefresh() {
    that.getData();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>
