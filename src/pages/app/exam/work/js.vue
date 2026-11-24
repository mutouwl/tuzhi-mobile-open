<script>
var that;
// #ifdef MP-TOUTIAO
import i18n from "@/components/language/index.js";
// #endif
import questionWorkShell from "@/pages/app/exam/components/question-work-shell.vue";

export default {
  // #ifdef MP-TOUTIAO
  i18n,
  // #endif
  components: { questionWorkShell },
  data() {
    return {
      autoSubmitTimer: null,

      data: {
        question_list: [],
      },
      //答案
      answerList: {},

      //当前索引
      currentIndex: 0,
      pageParams: {
        jobtype: "exam",
      },
      // 首帧即骨架（M16），接口回来前不许先白一帧
      loading: true,
    };
  },
  watch: {},
  computed: {
    /**
     * 交给通用做题外壳的逐题数组（外壳只负责版式，数据与判据仍在本页）
     *
     * 外壳按这一份既排题面又排答题卡，所以 `id` 必须带上；其余键原样绑给 report 版式的 question-box。
     * 用普通对象数组而不是函数：小程序端 props 必须可序列化。练习 / 错题本交卷后 status=1，整份转只读解析态。
     */
    workQuestions() {
      var status = this.data.status;
      var reply = this.answerList;
      return (this.data.question_list || []).map(function (item) {
        return {
          id: item.id,
          marked: item.marked,
          edit: status != 1,
          type: item.type,
          question: item.question,
          option: item.option,
          user_answer: reply[item.id],
          analysis: item.analysis,
          answer: item.answer,
          score: item.score,
        };
      });
    },
  },
  methods: {
    /**
     * 选中选项
     * @param {*} e
     */
    changeOption(option) {
      var questionId = that.data.question_list[that.currentIndex].id;
      var questionType = that.data.question_list[that.currentIndex].type;

      // 不定项与多选按选项索引排序；填空题保持用户输入顺序不排序
      if (
        option &&
        typeof option == "object" &&
        ["multiple", "indefinite"].indexOf(questionType) !== -1
      ) {
        option.sort(function (a, b) {
          return a - b;
        });
      }
      // $set：answerList 的新键要能驱动答题卡「已答」与题干回显（Vue 2 新增键不响应）
      this.$set(this.answerList, questionId, option);

      //考试需要实时提交答案（问答和填空题不实时提交）
      if (this.pageParams.jobtype == "test" && ["essay", "fillblank"].indexOf(questionType) === -1) {
        that.$api("app.test.submitAnswer", {
          answer: option,
          id: that.pageParams.id,
          question_id: questionId,
        });
      }
    },

    /**
     * 回上一步：已交卷 / 解析态在最后一题有出口
     * 栈只有一层（深链 / 分享落地）时回记录列表，练习与考试各归各的页
     */
    backPrev() {
      var pages = getCurrentPages();
      if (pages && pages.length > 1) {
        uni.navigateBack({ delta: 1 });
        return;
      }
      var logPage =
        that.pageParams.jobtype == "test"
          ? "/pages/app/test/log/log"
          : "/pages/app/exam/log/log";
      that.$nav.to(logPage, "local", "redirectTo");
    },

    /**
     * 获取练习详情
     */
    getData() {
      //创建练习
      that.loading = true;
      var url = "app.exam.exercises.getLog";
      if (this.pageParams.jobtype == "test") {
        var url = "app.test.getLog";
        uni.setNavigationBarTitle({
          title: "考试",
        });
      }
      that
        .$api(url, {
          id: that.pageParams.id,
        })
        .then((res) => {
          that.loading = false;
          if (res.code === 1) {
            that.data = res.data;
            if (res.data.user_answer) {
              that.answerList = that.normalizeAnswerObject(res.data.user_answer);
            }

            if (
              that.pageParams.jobtype == "test" &&
              res.data.test &&
              res.data.test.test_duration_limit == 1
            ) {
              //自动交卷
              that.autoSubmitTimer = setTimeout(() => {
                that.submit();
              }, res.data.test.test_duration_val * 1000);
            }
          }
        })
        .catch((err) => {
          // 骨架的三个出口必须收齐（硬约束 22）：成功 / 业务失败 / 请求异常
          that.loading = false;
          if (err && err.plugin) return;
          that.$u.toast((err && err.msg) || "网络异常");
        });
    },

    /**
     * 获取错题本
     */
    getErrorQuestion() {
      that.loading = true;
      that
        .$api("app.exam.exercises.getErrorQuestion", {
          id: that.pageParams.id,
        })
        .then((res) => {
          that.loading = false;
          if (res.code === 1) {
            that.data = res.data;
            if (res.data.user_answer) {
              that.answerList = that.normalizeAnswerObject(res.data.user_answer);
            }
          }
        })
        .catch((err) => {
          that.loading = false;
          if (err && err.plugin) return;
          that.$u.toast((err && err.msg) || "网络异常");
        });
    },

    /**
     * 解析答案
     * 将序号变为字母
     * @param {*} val
     */
    parseAnswer(val) {
      if (typeof val == "object") {
        var abc = [];
        for (var i in val) {
          abc.push(String.fromCharCode(65 + parseInt(val[i])));
        }
        return abc.join(" ");
      } else {
        return String.fromCharCode(65 + parseInt(val));
      }
    },
    /**
     * 交卷确认
     */
    submitConfirm() {
      uni.showModal({
        title: "提示",
        content: "确定要交卷吗",
        success: function (res) {
          if (res.confirm) {
            that.submit();
          }
        },
      });
    },

    /**
     * 将答案数据统一转为对象，键为字符串题目ID
     * 避免后端返回数组或以题目ID作为数组下标导致序列化膨胀
     */
    normalizeAnswerObject(answer) {
      if (!answer) {
        return {};
      }
      var result = {};
      if (Array.isArray(answer)) {
        answer.forEach(function (value, index) {
          if (value !== null && value !== undefined) {
            result[String(index)] = value;
          }
        });
      } else {
        for (var key in answer) {
          if (answer.hasOwnProperty(key)) {
            result[String(key)] = answer[key];
          }
        }
      }
      return result;
    },

    /**
     * 获取当前考试题目范围内的答案
     * 防止 answerList 中混入非当前考试的题目答案
     */
    getSubmitAnswer() {
      if (!that.data.question_list || that.data.question_list.length === 0) {
        return {};
      }
      var validQuestionIds = {};
      that.data.question_list.forEach(function (item) {
        validQuestionIds[item.id] = true;
      });
      var filteredAnswer = {};
      for (var questionId in that.answerList) {
        if (that.answerList.hasOwnProperty(questionId) && validQuestionIds[parseInt(questionId)]) {
          filteredAnswer[questionId] = that.answerList[questionId];
        }
      }
      return filteredAnswer;
    },

    /**
     * 交卷
     */
    submit() {
      uni.showLoading({
        title: "正在交卷",
      });
      var url = "app.exam.exercises.submit";
      if (that.pageParams.jobtype == "test") {
        var url = "app.test.submitTest";
      }
      that
        .$api(url, {
          answer: that.getSubmitAnswer(),
          id: that.pageParams.id,
        })
        .then((res) => {
          uni.hideLoading();
          if (res.code === 1) {
            var resultPagePath = "/pages/app/exam/result/result";
            if (that.pageParams.jobtype == "test") {
              resultPagePath = "/pages/app/test/result/result";
            }
            that.$nav.to(
              resultPagePath + "?id=" + that.pageParams.id,
              "local",
              "redirectTo"
            );
          }
        });
    },
    /**
     * 移除错题
     */
    delError() {
      var questionId = that.data.question_list[that.currentIndex].id;
      uni.showModal({
        title: "提示",
        content: "确定要移除该问题吗",
        success: function (res) {
          if (res.confirm) {
            //创建练习
            that
              .$api("app.exam.exercises.delErrorQuestion", {
                id: that.pageParams.id,
                question_id: questionId,
              })
              .then((res) => {
                if (res.code === 1) {
                  that.data.question_list.splice(that.currentIndex, 1);
                  if (that.data.question_list.length == 0) {
                    that.currentIndex = 0;
                  } else if (that.currentIndex > that.data.question_list.length - 1) {
                    that.currentIndex--;
                  }

                  // delete that.data.question_list[that.currentIndex];
                  // that.$nav.to('/pages/app/exam/result/result?id=' + that.pageParams.id, 'local', 'redirectTo')
                  // that.data = res.data;
                }
                that.$u.toast(res.msg);
              });
          }
        },
      });
    },
  },
  onHide() {
    clearTimeout(this.autoSubmitTimer);
  },
  onUnload() {
    clearTimeout(this.autoSubmitTimer);
  },
  onShow() {
    clearTimeout(this.autoSubmitTimer);
  },
  onLoad(pageParams) {
    that = this;
    clearTimeout(this.autoSubmitTimer);
    that.pageParams = that.$nav.parsePageParams(pageParams);

    if (that.pageParams.type && that.pageParams.type == "error") {
      that.getErrorQuestion();
    } else {
      that.getData();
    }
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>
