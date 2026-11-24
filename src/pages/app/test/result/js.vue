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

    /**
     * 正确答案：后端给的是库里的原始形态（多选 "0,1"、填空 json 数组串、其余下标），
     * report 版式要的是选项下标数组 / 逐空数组 / 下标数字 —— 在这里统一一次
     * （口径与刷题本做题页的 rightAnswerOf 相同）
     */
    reportAnswerOf(item) {
      const raw = item.answer;
      if (raw === undefined || raw === null || raw === "") return "";
      if (item.type === "multiple" || item.type === "indefinite") {
        if (Array.isArray(raw)) return raw.map(Number);
        return String(raw)
          .split(",")
          .filter((x) => x !== "")
          .map(Number);
      }
      if (item.type === "fillblank") {
        if (Array.isArray(raw)) return raw;
        try {
          const arr = JSON.parse(raw);
          return Array.isArray(arr) ? arr : [];
        } catch (e) {
          return [];
        }
      }
      if (item.type === "essay") return String(raw);
      return Number(raw);
    },

    /** 我的答案：后端 `user_answer` 已按题型给成数组 / 标量 / {text,images}，原样交给 report 版式 */
    userAnswerOf(item) {
      const map = this.data.user_answer || {};
      const value = map[item.id];
      return value === undefined || value === null ? "" : value;
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
