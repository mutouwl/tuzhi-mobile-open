<script>
var that;
import bindData from "@/pages/course/components/bind-data.vue";
import audioPlay from "@/components/tz/course-audio.vue";
import videoPlay from "@/components/video/video.vue";
import banner from "@/components/course/banner.vue";
import columnDir from "@/pages/course/components/column-dir.vue";
import subscriptionTip from "@/pages/course/components/subscription-tip.vue";
import columnBelongs from "@/pages/course/components/column-belongs.vue";

import columnCourseModal from "@/pages/course/components/column-course-modal.vue";
import evaluate from "@/components/comment/evaluate.vue";

import commentInput from "@/components/comment/input.vue";
import commentList from "@/components/comment/list.vue";

import shareModal from "@/components/modal/share-modal.vue";
import interactionTab from "@/pages/course/components/interaction.vue";
import liveStartTimeBar from "@/components/course/live-start-time-bar.vue";

import couponGoodsBar from "@/components/coupon/coupon-goods-bar.vue";
// const courseLibrary = require("@/common/utils/course.js");
import courseLibrary from "@/common/utils/course.js";

import columnNextTipModal from "@/pages/course/components/column-next-tip-modal.vue";
import circleCourseModal from "@/components/modal/circle-course-modal.vue";
import customForm from "@/pages/app/form/components/custom-form.vue";

export default {
  components: {
    interactionTab,
    liveStartTimeBar,
    bindData,
    columnDir,
    audioPlay,
    videoPlay,
    banner,
    subscriptionTip,
    columnBelongs,
    columnCourseModal,
    evaluate,
    commentInput,
    commentList,
    shareModal,
    couponGoodsBar,
    columnNextTipModal
    ,circleCourseModal
    ,customForm
  },
  data() {
    return {
      buyTypes: [],
      payChecked: 0,

      form: {
        limit: 10,
        page: 1,
      },
      data: {
        bind_data: [],
        sales_type: [],
      },
      pageParams: {
        id: "",
        column_id: "",
        circle_id: "",
      },

      modal: {
        password_pay: false,
        buy_type: false,
        columnCourse: false,
        comment: false,
        share: false,
        columnNextTip:false,
        circleCourse: false,
      },

      columnNextCourse:{},
      circleCourseList: [],
      circleCourseContext: false,

      tabsChecked: "",
      tabs: [],
      //圈子tab数据（课程关联的圈子卡片列表，一个课程可绑定多个圈子）
      circleList: [],
      //圈子插件是否安装（未安装时隐藏圈子相关 UI）
      circleInstalled: false,

      //推荐评价
      evaluate: {
        count: 0,
        list: [],
      },

      //相关资料弹窗
      bindDataShow: false,
      //专栏目录
      columnDir: [],
      //专栏课程
      columnCourse: [[]],

      //专栏目录排序
      dirSort: "asc",

      //兑换码
      password: "",
      //学习记录定时器
      studyTimer: null, //学习记录定时器
      isPageActive: true, //页面是否活跃（离开页面后不再启动/停止学习记录定时器）
      iscollect: false,
      courseBindColumn: [],

      loading: true,

      //回复的评论ID
      commentReplyId: 0,
      commentSort: "time",

      //推荐商品列表
      recommendGoodsList: [],

      scoreGoodsDetail: {},

      //商品对应会员优惠信息
      goodsVipPrivilege: {
        goodsVipInfo: false,
        isNowGoodsVip: false,
      },

      mediaProgress: 0,
      isLogin:true,//是否登录
      //加入学习/兑换订阅请求进行中（防重复提交 + 加载态）
      subscribing: false,

      //学习前表单拦截（form 插件 before_learn 绑定：未填写绑定表单时阻止学习）
      learnForm: {
        blocking: false,
        forms: [],
      },
      //学习前表单填写弹窗（底部弹窗内直接填写提交）
      learnFormPopup: {
        show: false,
        name: "",
        components: [],
        loading: false,
        value: {},
        key: 0,
        currentFormId: 0,
        submitting: false,
      },
    };
  },
  watch: {},
  methods: {
    /**
     * 学习前表单检查：绑定"加入学习前"表单且未填写时拦截学习（form 插件）
     * 仅在已订阅课程时调用；接口异常时不阻塞学习流程
     * @param function callback 回调参数 true=已拦截（需先填写表单）
     */
    checkLearnForm(callback) {
      var done = function (blocking) {
        callback && callback(blocking);
      };
      // 未安装表单插件时直接放行
      if (!that.$tools.systemConfig('app_isinstall_form')) {
        that.learnForm = {
          blocking: false,
          forms: [],
        };
        done(false);
        return;
      }
      that
        .$api("app.form.checkBeforeLearn", {
          course_id: that.pageParams.id,
          column_id: that.pageParams.column_id || 0,
        })
        .then((res) => {
          if (res.code == 1 && res.data && res.data.has_form && !res.data.all_submitted) {
            that.learnForm = {
              blocking: true,
              forms: res.data.forms || [],
            };
            done(true);
          } else {
            that.learnForm = {
              blocking: false,
              forms: [],
            };
            done(false);
          }
        })
        .catch(() => {
          that.learnForm = {
            blocking: false,
            forms: [],
          };
          done(false);
        });
    },

    /**
     * 打开学习前表单填写弹窗：加载第一张未提交的表单（底部弹窗内直接填写）
     */
    openLearnFormPopup() {
      var forms = that.learnForm.forms || [];
      var target = forms.find(function (item) {
        return !item.is_submitted && item.form_id;
      });
      if (!target) {
        return;
      }
      that.loadLearnFormDetail(target.form_id);
    },

    /**
     * 加载表单详情到填写弹窗
     * @param int formId 表单ID
     */
    loadLearnFormDetail(formId) {
      that.learnFormPopup.loading = true;
      that.learnFormPopup.show = true;
      that
        .$api("app.form.detail", {
          id: formId,
        })
        .then((res) => {
          that.learnFormPopup.loading = false;
          if (res.code != 1 || !res.data || !res.data.form) {
            uni.$u.toast(res.msg || "表单加载失败");
            that.learnFormPopup.show = false;
            return;
          }

          var statusInfo = res.data.status_info || {};

          //表单已结束（满额/过期/停用）：移出待填清单并尝试下一张
          if (statusInfo.is_end) {
            that.learnForm.forms = that.learnForm.forms.filter(function (item) {
              return item.form_id != formId;
            });
            var next = that.learnForm.forms.find(function (item) {
              return !item.is_submitted && item.form_id;
            });
            if (next) {
              that.loadLearnFormDetail(next.form_id);
            } else {
              //待填表单已处理完：重新检查是否放行
              that.learnFormPopup.show = false;
              that.checkLearnForm(function (blocked) {
                if (!blocked) {
                  that.startLearning();
                }
              });
            }
            return;
          }

          //无填写权限（订阅失效等）：留在拦截层
          if (!statusInfo.is_auth) {
            uni.$u.toast("请订阅关联课程后再提交");
            that.learnFormPopup.show = false;
            return;
          }

          that.learnFormPopup.currentFormId = formId;
          that.learnFormPopup.name = res.data.form.name || "";
          that.learnFormPopup.components = res.data.form.components || [];
          that.learnFormPopup.value = {};
          //递增 key 强制重建表单组件，避免上一张表单的输入状态残留
          that.learnFormPopup.key += 1;
        })
        .catch(() => {
          that.learnFormPopup.loading = false;
          that.learnFormPopup.show = false;
        });
    },

    /**
     * 弹窗内提交学习前表单
     */
    submitLearnForm() {
      if (that.learnFormPopup.submitting || !that.learnFormPopup.currentFormId) {
        return;
      }
      var validateResult = that.validateRequiredFields(
        that.learnFormPopup.components,
        that.learnFormPopup.value
      );
      if (validateResult !== true) {
        uni.$u.toast(validateResult);
        return;
      }
      that.learnFormPopup.submitting = true;
      that
        .$api("app.form.submit", {
          form_id: that.learnFormPopup.currentFormId,
          log_id: 0,
          row: that.learnFormPopup.value,
        })
        .then((res) => {
          that.learnFormPopup.submitting = false;
          if (res.code != 1) {
            uni.$u.toast(res.msg);
            return;
          }
          uni.showToast({
            title: "提交成功",
            icon: "success",
          });

          //标记当前表单已提交，检查是否还有待填表单
          that.learnForm.forms.forEach(function (item) {
            if (item.form_id == that.learnFormPopup.currentFormId) {
              item.is_submitted = true;
            }
          });
          var next = that.learnForm.forms.find(function (item) {
            return !item.is_submitted && item.form_id;
          });
          if (next) {
            //弹窗内切换下一张待填表单
            that.loadLearnFormDetail(next.form_id);
          } else {
            //全部提交完成：以服务端复检结果为准恢复学习
            that.learnFormPopup.show = false;
            that.checkLearnForm(function (blocked) {
              if (!blocked) {
                that.startLearning();
              }
            });
          }
        })
        .catch(() => {
          that.learnFormPopup.submitting = false;
          uni.$u.toast("网络异常");
        });
    },

    /**
     * 验证必填字段（与表单填写页 submit/js.vue 同一套规则与文案）
     * @param components
     * @param values
     * @return bool|string
     */
    validateRequiredFields(components, values) {
      // 需要忽略验证的表单类型
      const IGNORE_TYPES = ["image", "parse", "divider"];

      for (const component of components || []) {
        const { config, type } = component;

        // 跳过忽略的类型
        if (IGNORE_TYPES.includes(type)) {
          continue;
        }

        // 只检查必填字段
        if (config.required === 1) {
          const fieldId = config.id;
          const fieldValue = values[fieldId];

          // 检查字段是否存在
          if (fieldValue === undefined) {
            return `"${config.title}"是必填项，但未提供值`;
          }

          // 根据不同类型检查是否为空
          switch (component.type) {
            case "checkbox":
              // 复选框应该是一个数组，且至少有一个选项
              if (!Array.isArray(fieldValue) || fieldValue.length === 0) {
                return `"${config.title}"是必填项，请至少选择一个选项`;
              }
              break;

            case "radio":
            case "select":
              // 单选应该是一个非空字符串
              if (typeof fieldValue !== "string" || fieldValue.trim() === "") {
                return `"${config.title}"是必填项，请选择一个选项`;
              }
              break;

            case "input":
            case "textarea":
              // 文本输入应该是一个非空字符串
              if (typeof fieldValue !== "string" || fieldValue.trim() === "") {
                return `"${config.title}"是必填项，请输入内容`;
              }
              break;

            case "upload":
              // 上传字段应该是一个非空数组
              if (!Array.isArray(fieldValue) || fieldValue.length === 0) {
                return `"${config.title}"是必填项，请上传文件`;
              }
              break;

            case "date":
            case "time":
              // 日期时间应该是一个非空字符串
              if (typeof fieldValue !== "string" || fieldValue.trim() === "") {
                return `"${config.title}"是必填项，请选择日期/时间`;
              }
              break;

            default:
              // 默认检查是否有值
              if (fieldValue === null || fieldValue === "") {
                return `"${config.title}"是必填项`;
              }
          }
        }
      }

      return true;
    },

    /**
     * 学习行为（学习前表单检查通过后执行）：学习记录上报/完课/直播跳转
     */
    startLearning() {
      courseLibrary.setStudyLog(that.pageParams.id,that.pageParams.column_id);

      // 页面已隐藏/卸载时不再启动学习记录定时器，避免异步响应晚于 onHide/onUnload 触发导致定时器泄漏、日志接口持续上报
      if (that.isPageActive) {
        that.setStudyLog();
      }

      if (that.data.type == "live") {
        that.finish();
        var livePathUrl = "/pages/course/live/live?id=" + that.pageParams.id;
        if(that.pageParams.column_id){
          livePathUrl += "&column_id="+that.pageParams.column_id
        }
        //进入直播详情页
        that.$nav.to(
          livePathUrl,
          "local",
          "redirectTo"
        );

        // 跳转兜底：跳转未生效（页面没有隐藏/卸载）时释放骨架屏，避免详情页一直停在加载态
        clearTimeout(that._liveLoadingTimer);
        that._liveLoadingTimer = setTimeout(function () {
          if (that.isPageActive) {
            that.loading = false;
          }
        }, 3000);
      }

      if(that.data.type == 'article'){
        //文章直接完成
        that.finish();
      }

      that.playHandle();
    },

    getCircleInstallState() {
      const raw = uni.getStorageSync('systemConfig');
      if (!raw) return null;
      try {
        const config = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!config || !Object.prototype.hasOwnProperty.call(config, 'app_isinstall_circle')) return null;
        return config.app_isinstall_circle === true || config.app_isinstall_circle === 1 || config.app_isinstall_circle === '1';
      } catch (e) {
        return null;
      }
    },
    isVirtualPay(goods) {
      return Number(goods && goods.is_virtual_pay) === 1 && uni.getStorageSync("platform") === "wxMiniProgram";
    },
    /**
     * 是否为免费课程（与后端 Subscription::isFreeCourse 保持一致）
     * pay_type=free 或 pay_type=pay 且 price=0 视为免费
     */
    isFreeCourse(goods) {
      if (!goods) return false;
      if (goods.pay_type === 'free') return true;
      if (goods.pay_type === 'pay' && Number(goods.price) === 0) return true;
      return false;
    },
    formatVirtualPrice(price) {
      return (price || 0) + (that.$tools.systemConfig('coin_name') || '金币');
    },
    formatPrice(price, goods) {
      return this.isVirtualPay(goods) ? this.formatVirtualPrice(price) : "¥" + price;
    },
    buyTypesSelect() {},
    getData(addViews=false) {
      that.loading = true;

      // 弱网下 onShow/下拉刷新/订阅刷新 可能并发触发多次请求，请求按完成顺序回填
      // 会导致 tabs 重复、旧响应覆盖新数据。用递增 token 只采纳最后一次请求的结果。
      const token = (that._getDataToken || 0) + 1;
      that._getDataToken = token;

      // 骨架屏兜底：请求挂起（无响应/不 settle）或成功回调内分支遗漏/异常时，
      // loading 都可能不被复位，必须由定时器无条件兜底释放——
      // 带 token 条件会漏掉「早退后新请求也随之失效」的场景，页面会一直停在骨架屏
      clearTimeout(that._loadingWatchdog);
      that._loadingWatchdog = setTimeout(function () {
        that.loading = false;
      }, 8000);

      if (this.pageParams.type && this.pageParams.type == "score") {
        that.getScoreDetail();
      }

      that.tabs = [];
      that
        .$api("course.detail", {
          id: this.pageParams.id,
          add_views:addViews
        })
        .then((res) => {
          uni.stopPullDownRefresh();

          // 过期响应直接丢弃，避免重复 push tabs / 旧响应覆盖新数据
          if (token !== that._getDataToken) {
            return;
          }
          // 不在此处撤销骨架屏兜底定时器：响应被采纳不等于 loading 一定被复位
          // （成功回调内分支或异步链路中断时），保留 8s 定时器做最终兜底
          // （直播中转场景由 _liveLoadingTimer 与下方显式复位共同接管）

          if (res.code === 1) {
            if (res.data.type == "audio" || res.data.type == "video") {
              // that.getMediaProgress();
              courseLibrary.banScreenRecordStart();
            }
            // #ifdef MP-WEIXIN
            //检查PC端是否能学习
            courseLibrary.checkBanPc(res.data.type, res.data.id);
            // #endif

            that.data = res.data;

            // 页面标题跟随课程名称（原标题为固定的「课程详情」，直播课程即对应直播的标题）：
            // H5 端同步浏览器/微信顶部标题，小程序端同步导航栏标题
            if (res.data.name) {
              uni.setNavigationBarTitle({ title: res.data.name });
            }

            that.loadCircleCourseNav();

            // 分享卡片描述取课程简介，简介为空时由 $nav.share 回退为「打开查看详情」
            // #ifdef H5
            this.$nav.share(res.data.name, res.data.briefing || '', res.data.cover);
            // #endif

            if (
              !res.data.subscription ||
              (res.data.detail && res.data.detail != "<p><br></p>")
            ) {
              that.tabs.push({
                name: "详情",
                type: "detail",
              });
              that.tabsChecked = "detail";
            }

            if (res.data.type == "column") {
              if (res.data.subscription) {
                //放到第一个
                that.tabs.unshift({
                  name: "目录",
                  type: "dir",
                });
                that.tabsChecked = "dir";
              }else{
                that.tabs.push({
                  name: "目录",
                  type: "dir",
                });
              }              
              if (that.tabsChecked == "") {
                that.tabsChecked = "dir";
              }
            }

            // 评论入口关闭时不显示评论tab
            if (that.$tools.systemConfig("comment_entry_status") != "close") {
              that.tabs.push({
                name: "评论",
                type: "comment",
              });
            }

            that.tabs.push({
              name: "互动",
              type: "interaction",
            });

            // 加载课程关联的展示圈子（圈子插件）
            that.loadCircle(token);

            if (that.tabsChecked == "" && that.tabs.length > 0) {
              that.tabsChecked = that.tabs[0].type;
            }

            // 直播课程的直播源不适配课程播放器（跳转会提示播放异常），详情页只作跳转直播页的中转：
            // 保持骨架屏直到跳转完成，由 startLearning 跳转或下面被拦截的分支释放
            var liveRedirect = res.data.type == "live" && !!res.data.subscription;

            // 直播中转兜底：跳转链路（表单检查回调 → startLearning → redirectTo）任一环节卡住时
            // 也必须释放骨架屏。定时器在此处挂载而不是只放在 startLearning 内——
            // 表单插件已安装时 startLearning 需等 app.form.checkBeforeLearn 回调，
            // 该请求不回调时既不会跳转、也不会启动定时器，页面会永久停在加载态
            if (liveRedirect) {
              clearTimeout(that._liveLoadingTimer);
              that._liveLoadingTimer = setTimeout(function () {
                if (that.isPageActive) {
                  that.loading = false;
                }
              }, 3000);
            }

            if (res.data.subscription) {

              // 学习前表单拦截：绑定 before_learn 表单未填写时弹窗收集，不产生学习行为
              that.checkLearnForm((blocked) => {
                if (blocked) {
                  // 被拦截时不跳转直播页，先释放骨架屏，避免拦截层与填写弹窗被加载态盖住
                  that.loading = false;
                  // 弹窗已打开时不重新加载，避免清空用户正在填写的内容
                  if (!that.learnFormPopup.show) {
                    that.openLearnFormPopup();
                  }
                  return;
                }
                that.startLearning();
              });
            } else {
              courseLibrary.setStudyLog(that.pageParams.id,that.pageParams.column_id);
              // 订阅失效等场景下清除学习前表单拦截状态
              that.learnForm = {
                blocking: false,
                forms: [],
              };
            }
            that.getIsCollect();
            that.getCourseRecommendList();
            that.getRecommendGoods(token);

            that.getGoodsVipPrivilege();
            // 直播中转才保持骨架屏（跳转完成前不露出详情页，由跳转/拦截分支/_liveLoadingTimer 释放）；
            // 其余课程数据已到即渲染页面，取反会让页面在响应到达的同一刻重新挂上加载态
            that.loading = liveRedirect;
          } else {
            that.loading = false;
            uni.showModal({
              title: "提示",
              content: res.msg,
              success: function () {
                // 记录不存在（如失效分享链接）时无上一页可退，direct 打开时
                // navigateBack 会退化成页面刷新再次提示，直接返回首页
                uni.reLaunch({
                  url: "/pages/index/index",
                });
              },
            });
          }
        })
        .catch((res) => {
          clearTimeout(that._loadingWatchdog);
          that.loading = false;
          console.log("errorres", res);
        });
    },

    /**
     * 暂停播放
     */
    pausedHandle() {
      // courseLibrary.stopStudyLog();
      clearInterval(this.studyTimer);
    },
    /**
     * 播放结束
     */
    playEnd(){
      this.finish();
      clearInterval(this.studyTimer);
      //判断是否需要自动跳转下一节课
      if(this.pageParams.column_id){
        this.getColumnNextCourse();
        //调用columnCourseModel中的函数 
        // this.$refs.columnCourseModel.getNextCourse();
        // 
      }
    },

    getColumnNextCourse(){
      that
        .$api("course.columnnext", {
          course_id: that.pageParams.id,
          column_id: that.pageParams.column_id
        }) 
        .then((res) => {
          if (res.code == 1 && res.data) {
            this.columnNextCourse = res.data;
            this.modal.columnNextTip = true;
          }
        });
    },

    /**
     * 完成课程
     */
    finish(){
      var params = {
        course_id: that.pageParams.id
      };

      if(that.pageParams.column_id){
        params.column_id = that.pageParams.column_id;
      }

      that.$api("study.finish", params).then((res) => {});
    },

    // 开始播放
    playHandle() {
    },

    setStudyLog(){
      clearInterval(this.studyTimer);
      this.studyTimer = null;
      this.studyTimer = setInterval(function () {
        // 页面已隐藏/卸载时自动停止，防止日志接口持续上报
        if (!that.isPageActive) {
          clearInterval(that.studyTimer);
          that.studyTimer = null;
          return;
        }
        courseLibrary.setStudyLog(that.data.id,that.pageParams.column_id, that.getCurrentTime(that.data.type));
      }, 5000);
    },

    /**
     * 音视频资源加载完成
     */
    mediaReady() {
      this.getMediaProgress();
      // console.log("that.mediaProgress", that.mediaProgress);
    },

    /**
     * 获取媒体播放时间
     */
    getMediaProgress() {
      if (that.data.type == 'audio' && that.$refs.audioPlayer && that.$refs.audioPlayer.isCurrentBackgroundAudio && that.$refs.audioPlayer.isCurrentBackgroundAudio()) {
        return;
      }
      that
        .$api("study.media.progress", {
          course_id: that.pageParams.id,
        })
        .then((res) => {
          if (res.code == 1 && res.data) {
            if (res.data > 0) {
              if (that.data.type == "audio") {
                that.$refs.audioPlayer.setCurrentTime(parseInt(res.data));
              } else {
                that.$refs.videoPlayer.setCurrentTime(parseInt(res.data));
              }
            }
          }
        });
    },

    /**
     * 获取推荐商品
     */
    getRecommendGoods(token) {
      that.$api("app.recommend.getRecommendGoods", {}).then((res) => {
        // 过期 getData 触发的异步回填丢弃，避免 推荐 tab 重复
        if (token !== that._getDataToken) {
          return;
        }
        if (res.code == 1 && res.data) {
          that.tabs.push({
            name: "推荐",
            type: "recommend",
          });
          that.recommendGoodsList = res.data;
        }
      });
    },

    // 积分商品详情
    getScoreDetail() {
      that
        .$api("app.score.detail", {
          id: that.pageParams.id,
        })
        .then((res) => {
          if (res.code === 1) {
            this.scoreGoodsDetail = res.data;
          } else {
            uni.showModal({
              title: "提示",
              content: res.msg,
              success: function (res) {
                uni.navigateBack({
                  delta: 1,
                });
              },
            });
          }
        });
    },

    //相关资料弹窗关闭
    bindDataClose() {
      that.bindDataShow = false;
    },

    //tabs切换事件
    tabsChange(option) {
      this.tabsChecked = option.type;
    },

    //加载课程关联的展示圈子（圈子插件，未安装或无绑定时静默跳过）
    async loadCircle(token) {
      if (that.getCircleInstallState() !== true) {
        return;
      }
      that.circleInstalled = true;
      const res = await that.$api("circle.circle.courseCircle", {
        course_id: that.pageParams.id,
      });
      // 过期 getData 触发的异步回填丢弃，避免 圈子 tab 重复
      if (token !== that._getDataToken) {
        return;
      }
      if (res.code === 1 && res.data && res.data.has_circle == 1) {
        that.circleList = res.data.list || [];
        that.tabs.push({
          name: "圈子",
          type: "circle",
        });
      }
    },

    // 圈子课程按圈子目录的排序展示，用于详情页底部前后课程导航。
    async loadCircleCourseNav() {
      if (!that.pageParams.circle_id) return;
      that.circleCourseContext = false;
      that.circleCourseList = [];
      try {
        const res = await that.$api('circle.circle.courseDir', { circle_id: that.pageParams.circle_id });
        if (res.code === 1) {
          // URL 中的 circle_id 与接口返回共同确认圈子上下文，不依赖可能陈旧的本地插件配置。
          that.circleCourseList = (res.data || [])
            .filter(item => Number(item.type) === 1 && item.bindcourse)
            .map(item => item.bindcourse);
          that.circleCourseContext = that.circleCourseList.some(course => Number(course.id) === Number(that.pageParams.id));
        }
      } catch (e) {
        that.circleCourseContext = false;
        that.circleCourseList = [];
      }
    },
    openCircleDirectory() {
      that.modal.circleCourse = true;
    },
    switchCircleCourse(step) {
      const currentIndex = that.circleCourseList.findIndex(course => Number(course.id) === Number(that.pageParams.id));
      const nextCourse = that.circleCourseList[currentIndex + step];
      if (!nextCourse) {
        uni.showToast({ title: step < 0 ? '已经是第一门课程' : '已经是最后一门课程', icon: 'none' });
        return;
      }
      that.$nav.to('/pages/course/detail/detail?id=' + nextCourse.id + '&circle_id=' + that.pageParams.circle_id, 'local', 'redirectTo');
    },

    /**
     * 切换弹窗展示 隐藏状态
     * @param {*} type
     */
    changeModalShow(type) {
      that.modal[type] = !that.modal[type];
    },

    /**
     * 打开分享弹窗
     */
    share() {
      that.modal.share = true;
    },

    //刷新
    refresh() {
      that.form.page = 1;
      that.list = [];
      that.getData();
    },

    //获取专栏目录
    getColumnDir() {
      that
        .$api("course.columndir", {
          id: that.pageParams.id,
        })
        .then((res) => {
          if (res.code === 1) {
            this.columnDir = res.data;
          }
        });
    },

    //获取商品对应会员卡优惠
    getGoodsVipPrivilege() {
      that
        .$api("app.vip.goods_privilege", {
          id: that.pageParams.id,
        })
        .then((res) => {
          if (res.code === 1) {
            that.goodsVipPrivilege = res.data;
          }
        });
    },

    //获取专栏目录
    getCourseRecommendList() {
      that
        .$api("order.evaluate.getCourseRecommendList", {
          id: that.pageParams.id,
        })
        .then((res) => {
          if (res.code === 1) {
            that.evaluate = res.data;
          }
        });
    },

    //课程绑定目录
    courseBindDir(course) {
      var data = [[]];
      for (var j in course) {
        if (course[j].dir.id) {
          var dirId = course[j].dir.id;
          if (data.indexOf(dirId) == -1) {
            data[dirId] = [];
          }
          data[dirId].push(course[j].course);
        } else {
          data[0].push(course[j].course);
        }
      }
      return data;
    },

    /**
     * 密码订阅
     */
    passwordPaySubscription() {
      if (!that.password) {
        uni.$u.toast("请输入正确的兑换码");
        return false;
      }

      // 请求期间显示加载态并防重复提交，接口返回后才恢复
      if (that.subscribing) {
        return;
      }
      that.subscribing = true;
      uni.showLoading({
        title: "兑换中",
        mask: true,
      });

      that
        .$api("order.subscription.password", {
          password: that.password,
          course_id: that.data.id,
        })
        .then((res) => {
          uni.hideLoading();
          that.subscribing = false;
          if (res.code === 1) {
            that.changeModalShow("password_pay");
            uni.$u.toast(res.msg || "加入学习成功");
            that.getData();
          } else {
            uni.$u.toast(res.msg);
          }
        })
        .catch(() => {
          uni.hideLoading();
          that.subscribing = false;
          uni.$u.toast("网络异常");
        });
    },

    /**
     * 免费订阅
     */
    freeSubscription() {
      // 请求期间显示加载态并防重复提交，接口返回后才恢复
      if (that.subscribing) {
        return;
      }
      that.subscribing = true;
      uni.showLoading({
        title: "加入学习中",
        mask: true,
      });

      that
        .$api("order.subscription.free", {
          course_id: that.data.id,
        })
        .then((res) => {
          uni.hideLoading();
          that.subscribing = false;
          if (res.code === 1) {
            uni.$u.toast(res.msg || "加入学习成功");
            // 无需二次确认，直接刷新课程状态，直播课等场景会自动跳转对应页面
            that.getData();
          } else {
            uni.$u.toast(res.msg);
          }
        })
        .catch(() => {
          uni.hideLoading();
          that.subscribing = false;
          uni.$u.toast("网络异常");
        });
    },

    /**
     * 获取媒体播放进度
     */
    getCurrentTime(type) {
      if (type == "audio") {
        if (!this.$refs.audioPlayer) {
          return 0;
        }
        return this.$refs.audioPlayer.getCurrentTime();
      }

      if (type == "video") {
        if (!this.$refs.videoPlayer) {
          return 0;
        }
        return this.$refs.videoPlayer.getCurrentTime();
      }

      return 0;
    },
    buyCheck(){
      // 购买入口只依赖本地登录态；原实现额外请求 user.info，弱网或接口异常时
      // 没有失败分支，真机表现为点击毫无反应。
      if (!uni.getStorageSync('user_token')) {
        that.$api('user.info.index', {}).catch(() => {});
        return;
      }
      that.buy();
    },
    //立即购买
    buy() {

      //判断购买方式、单独购买、购买专栏
      var goodsList = [
        {
          goodsId: that.data.id,
          count: 1,
          goodsType: "course",
        },
      ];

      //积分商品走独立兑换流程（优先于免费判断）
      if (this.pageParams.type && this.pageParams.type == "score") {
        that.$nav.to(
          "/pages/order/submit/submit?type=score&goodsList=" + JSON.stringify(goodsList)
        );
        return false;
      }

      //免费课程（pay_type=free 或 pay_type=pay 价格为 0）与会员免费权益命中时，
      //直接走【加入学习】免费订阅；圈内课程（未开启单独售卖）对非圈子成员由后端 free 接口拦截
      if (that.isFreeCourse(that.data) || that.data.vip_free_access) {
        that.freeSubscription();
        return false;
      }

      if (!that.data.sales_type || that.data.sales_type.length == 0) {
        uni.$u.toast("该课程暂不支持订阅");
        return false;
      }

      if (that.data.type != "column" && !that.data.sales_type.includes("alone")) {
        if (this.pageParams.column_id) {
          uni.showModal({
            title: "提示",
            content: "请订阅该课程所属专栏",
            confirmText: "立即订阅",
            success: function (res) {
              that.$nav.to(that.pageParams.column_id, "column");
            },
          });
        } else {
          uni.$u.toast("请订阅该课程所属专栏");
        }
        return false;
      }

      if (that.data.type == "column" && !that.data.sales_type.includes("alone")) {
        uni.$u.toast("该专栏暂不支持单独订阅");
        return false;
      }

      if (that.data.pay_type == "password") {
        that.changeModalShow("password_pay");
        return false;
      }

      that.$nav.to("/pages/order/submit/submit?goodsList=" + JSON.stringify(goodsList));
    },

    /**
     * 获取是否收藏
     */
    getIsCollect() {
      that
        .$api("user.collect.getIsCollect", {
          item_id: that.data.id,
          type: "course",
        })
        .then((res) => {
          that.iscollect = res.data;
        });
    },

    /**
     * 收藏课程
     */
    collect() {
      uni.showLoading({
        title: "请稍后",
      });
      that
        .$api("user.collect.setCollect", {
          item_id: that.data.id,
          type: "course",
        })
        .then((res) => {
          uni.hideLoading();
          // uni.$u.toast(res.msg);
          that.getIsCollect();
        })
        .catch(() => {
          // 请求失败必须收起全局 loading 遮罩，否则遮罩会一直挂在整个页面上
          uni.hideLoading();
          uni.$u.toast("网络异常");
        });
    },

    /**
     * 获取课程所属的专栏
     */
    getCourseBelongsColumn() {
      var that = this;
      that
        .$api("course.getBelongsColumn", {
          course_id: that.data.id,
        })
        .then((ret) => {
          if (ret.code === 1) {
            this.courseBindColumn = ret.data;
          }
        });
    },

    /**
     * 添加评论
     * @param {*} content 评论内容
     * @param {*} replyId 回复的评论ID
     */
    addComment(content) {
      uni.showLoading({
        title: "请稍后",
      });
      that
        .$api("course.comment.add", {
          course_id: that.data.id,
          content: content,
          reply_comment_id: that.commentReplyId,
        })
        .then((ret) => {
          uni.hideLoading();

          uni.$u.toast(ret.msg);
          if (ret.code == 1) {
            that.modal.comment = false;
            if (that.$refs["comment"]) {
              that.$refs["comment"].refresh();
            }
          }
        })
        .catch(() => {
          // 请求失败必须收起全局 loading 遮罩，否则遮罩会一直挂在整个页面上
          uni.hideLoading();
          uni.$u.toast("网络异常");
        });
    },
    /**
     * 回复评论
     * @param {*} commentId
     */
    replyComment(commentId) {
      that.commentReplyId = commentId;
      that.modal.comment = true;
    },
  },

  onHide() {
    this.isPageActive = false;
    courseLibrary.setStudyLog(this.data.id, this.pageParams.column_id, this.getCurrentTime(this.data.type), 1);
    // courseLibrary.stopStudyLog();
    clearInterval(this.studyTimer);
    clearTimeout(this._liveLoadingTimer);
    clearTimeout(this._loadingWatchdog);
    courseLibrary.banScreenRecordCancel();
  },
  onUnload() {
    this.isPageActive = false;
    courseLibrary.setStudyLog(this.data.id, this.pageParams.column_id, this.getCurrentTime(this.data.type), 1);
    // courseLibrary.stopStudyLog();
    clearInterval(this.studyTimer);
    clearTimeout(this._liveLoadingTimer);
    clearTimeout(this._loadingWatchdog);
    courseLibrary.banScreenRecordCancel();
  },
  onShow() {
    that = this;
    that.isPageActive = true;
    courseLibrary.stopStudyLog();
    clearInterval(this.studyTimer);
    courseLibrary.banScreenRecordCancel();
    this.getData(true);
  },
  //下拉刷新
  onPullDownRefresh() {
    // courseLibrary.stopStudyLog();
    clearInterval(this.studyTimer);
    courseLibrary.banScreenRecordCancel();
    this.getData();
  },

  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    clearInterval(this.studyTimer);
    courseLibrary.banScreenRecordCancel();

    this.isLogin = uni.getStorageSync("user_token") ? true : false;


    // clearInterval(this.studyTimer);
    // courseLibrary.banScreenRecordCancel();
    // this.getData();

    // this.getData();
    // this.getColumnDir();
    // this.getColumnCourse();
  },

  onShareAppMessage() {
    return this.$nav.share(this.data.name, this.data.briefing || '', this.data.cover);
  },
  onShareTimeline() {
    return this.$nav.share(this.data.name, this.data.briefing || '', this.data.cover);
  },
};
</script>
