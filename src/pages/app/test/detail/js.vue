<script>
var that;
import bindCourseList from "@/components/course/bind-course-list.vue";
export default {
  components: {
    bindCourseList,
  },
  data() {
    return {
      data: {
        testpaper: {},
        button: {},
      },
      modal: {
        exercisesControl: false,
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

      that
        .$api("app.test.detail", {
          id: that.pageParams.id,
        })
        .then((res) => {
          uni.hideLoading();
          that.loading = false;
          if (res.code === 1) {
            that.data = res.data;

            // #ifdef H5
            this.$nav.share(that.data.name || '', '', that.data.cover || '');
            // #endif
          }
        })
        .catch((res) => {
          that.loading = false;
          uni.hideLoading();
          that.$u.toast(res.msg);
        });
      uni.stopPullDownRefresh();
    },

    /**
     * 加入练习
     * 用于未订阅的免费课程 或 绑定课程
     */
    subscribe() {
      that
        .$api("app.exam.exercises.subscribe", {
          id: that.pageParams.id,
        })
        .then((res) => {
          if (res.code === 1) {
            that.getData();
          }
          that.$u.toast(res.msg);
        })
        .catch((res) => {
          uni.hideLoading();
        });
    },
    result() {
      that.$nav.to("/pages/app/test/result/result?id=" + that.data.last_worklog);
    },
    handle() {
      //创建练习
      uni.showLoading({
        title: "请稍后",
      });
      that
        .$api("app.test.buildLog", {
          id: that.pageParams.id,
        })
        .then((res) => {
          uni.hideLoading();
          if (res.code === 1) {
            this.$nav.to(
              "/pages/app/exam/work/work?id=" + res.data + "&jobtype=test",
              "local"
            );
          }
        })
        .catch((res) => {
          uni.hideLoading();
        });
      // break;

      //要先创建考试记录，然后根据记录去获取题目
      // that.$nav.to('/pages/app/exam/work/work?id='+that.pageParams.id+'&type=test');
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
    return this.$nav.share(that.data.name || '', '', that.data.cover || '');
  },
  onShareTimeline() {
    return this.$nav.share(that.data.name || '', '', that.data.cover || '');
  },
};
</script>
