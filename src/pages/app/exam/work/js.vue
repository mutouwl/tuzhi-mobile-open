<script>
var that;
// #ifdef MP-TOUTIAO
import i18n from "@/components/language/index.js";
// #endif
import answerSheetModal from "@/pages/app/exam/components/answer-sheet-modal.vue";
import optionClick from "../components/option/click.vue";
import questionBox from "@/pages/app/exam/components/question-box.vue";

export default {
  // #ifdef MP-TOUTIAO
  i18n,
  // #endif
  components: { answerSheetModal, optionClick, questionBox },
  data() {
    return {
      autoSubmitTimer: null,
      modal: {
        answerSheet: false,
      },

      data: {
        question_list: [],
      },
      //答案
      answerList: {},

      //滑块的高度(单位px)
      swiperHeight: 0,
      //当前索引
      currentIndex: 0,
      pageParams: {
        jobtype: "exam",
      },
      loading: false,
    };
  },
  watch: {},
  methods: {
    exchange() {
      that.loading = true;
      uni.showLoading({
        title: "请稍后",
      });

      that
        .$api("app.exchange.exchange", {
          code: that.code,
        })
        .then((res) => {
          that.loading = false;
          if (res.code === 1) {
            that.code = "";
            uni.showModal({
              title: "提示",
              content: res.msg,
              confirmText: "查看订阅",
              success: function (res) {
                if (res.confirm) {
                  that.$nav.to("/pages/user/subscription/subscription");
                }
              },
            });
          } else {
            uni.$u.toast(res.msg);
          }

          uni.hideLoading();
        });
    },

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
      this.answerList[questionId] = option;

      //考试需要实时提交答案（问答和填空题不实时提交）
      if (this.pageParams.jobtype == "test" && ["essay", "fillblank"].indexOf(questionType) === -1) {
        that.$api("app.test.submitAnswer", {
          answer: option,
          id: that.pageParams.id,
          question_id: questionId,
        });
      }
    },

    //手动切换题目
    changeSwiper(e) {
      this.currentIndex = e.detail.current;
    },

    //动态设置swiper的高度
    setSwiperHeight() {
      uni.getSystemInfo({
        success: function (res) {
          that.swiperHeight = res.windowHeight - 110;
        },
      });
    },

    changeQuestion(type) {
      if (type == "next") {
        if (this.currentIndex >= that.data.question_list.length - 1) {
          return false;
        }
        this.currentIndex++;
      } else {
        if (this.currentIndex <= 0) {
          return false;
        }
        this.currentIndex--;
      }
    },

    //答题卡跳转
    jumpQuestion(index) {
      that.modal.answerSheet = false;
      that.currentIndex = index;
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
          if (res.code === 1) {
            that.data = res.data;
            if (res.data.user_answer) {
              that.answerList = that.normalizeAnswerObject(res.data.user_answer);
            }

            if (
              that.pageParams.jobtype == "test" &&
              res.data.test.test_duration_limit == 1
            ) {
              //自动交卷
              that.autoSubmitTimer = setTimeout(() => {
                that.submit();
              }, res.data.test.test_duration_val * 1000);
            }
          }
          that.loading = false;
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

    that.setSwiperHeight();

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
