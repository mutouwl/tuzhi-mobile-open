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
    };
  },
  watch: {},
  methods: {
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

          courseLibrary.setStudyLog(that.pageParams.id,that.pageParams.column_id);

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
            that.loadCircleCourseNav();

            // #ifdef H5
            this.$nav.share(res.data.name, '', res.data.cover);
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

            if (res.data.subscription) {

              // 页面已隐藏/卸载时不再启动学习记录定时器，避免异步响应晚于 onHide/onUnload 触发导致定时器泄漏、日志接口持续上报
              if (that.isPageActive) {
                that.setStudyLog();
              }

              if (res.data.type == "live") {
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
              }

              if(res.data.type == 'article'){
                //文章直接完成
                that.finish();
              }

              that.playHandle();
            }
            that.getIsCollect();
            that.getCourseRecommendList();
            that.getRecommendGoods(token);

            that.getGoodsVipPrivilege();
            that.loading = false;
          } else {
            that.loading = false;
            uni.showModal({
              title: "提示",
              content: res.msg,
              success: function (res) {
                that.$nav.back();
              },
            });
          }
        })
        .catch((res) => {
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
    courseLibrary.banScreenRecordCancel();
  },
  onUnload() {
    this.isPageActive = false;
    courseLibrary.setStudyLog(this.data.id, this.pageParams.column_id, this.getCurrentTime(this.data.type), 1);
    // courseLibrary.stopStudyLog();
    clearInterval(this.studyTimer);
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
    return this.$nav.share(this.data.name, '', this.data.cover);
  },
  onShareTimeline() {
    return this.$nav.share(this.data.name, '', this.data.cover);
  },
};
</script>
