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
import checkinCourseModal from "@/pages/course/components/checkin-course-modal.vue";
import { goActivity } from "@/common/utils/checkin-activity";
import { rememberInviter, resolveInviter, inviterFromParams } from "@/common/utils/live-inviter";
// 拼团「加入别人的团」上下文（URL 上的 gb_team 那一组，只活在本页实例上）
import { readGroupBuyJoin } from "@/common/utils/group-buy-join.js";
import customForm from "@/components/tz/custom-form.vue";

/**
 * 「回本页要不要重取」的时间窗（判据②的兜底那一半，2026-10-09 刷新分层）
 * 只有三条写路径没有可广播的事件源——商家在后台改价/下架、订阅按时间自然到期、
 * 用户在另一台设备买过——所以超窗才补一次静默回收；窗内只有付过款才回收。
 */
const STALE_MS = 5 * 60 * 1000;
/**
 * 播流地址的保鲜期（保源那一条的年龄闸门，H5 与微信小程序同一档）
 * 后端签发的阿里云播流地址有效期是 6 小时（`addons/alivod/library/Alivod.php:18`
 * `PLAY_URL_AUTH_TIMEOUT = 21600`），回收档保住旧地址不能没有上限——H5 那一页挂着过夜、
 * 小程序端实例活到第二天，回来点播放就是一发过期地址。留 2 小时余量取 4 小时：
 * 超龄那一次让 `refreshState` 吃新地址（换源会重建播放器，但那一趟 `ready → study.media.progress`
 * 会把进度接回来，比「点了没画面」轻）。
 */
const MEDIA_MAX_AGE = 4 * 60 * 60 * 1000;
/**
 * 播放凭证的重取上限（不含首次那一发）
 * 阿里云的 PlayAuth 本身是短命的（默认 100 秒），过期后要的是「再取一枚」而不是重试很多次；
 * 这里限次只为挡住一条坏链上的无限循环（@error / @onM3u8Retry / @refresh 三枚来源会互相顶着发），
 * 到上限就回落地址档，比停在「一直转圈」对用户有用。
 */
const VOD_AUTH_MAX_RETRY = 2;
/**
 * 支付成功的统一广播名（发送方 common/utils/pay.js 的 goOrder，只有各端支付成功那一条链会进那里）
 */
const PAY_EVENT = "orderPaid";

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
    ,checkinCourseModal
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
        checkin: false,
      },

      columnNextCourse:{},
      circleCourseList: [],
      circleCourseContext: false,

      tabsChecked: "",
      //页签集合是 computed（tabs）：由课程数据 + 商家配置 + 下面两份「展示类数据到手情况」算出来，
      //不再由各取数方法各自 push——订阅态翻转时要整份重算（专栏已订阅要把「目录」提到最前），
      //push 出来的那一份没法回退
      //圈子插件装了且这门课绑了圈子才出「圈子」那一枚
      circleTabVisible: false,
      //推荐位有货才出「推荐」那一枚
      recommendTabVisible: false,
      //圈子tab数据（课程关联的圈子卡片列表，一个课程可绑定多个圈子）
      circleList: [],
      //圈子插件是否安装（未安装时隐藏圈子相关 UI）
      circleInstalled: false,

      //底栏「打卡」那一枚与它弹出的列表：本课程（含所属专栏）关联的打卡活动，一次取到喂两处
      checkinList: [],
      //枚举文案（参与条件/打卡状态/打卡模式）由接口下发，前端不写死
      checkinAttr: { join_type: {}, run_state: {}, checkin_mode: {} },
      checkinPage: 1,
      checkinLimit: 20,
      checkinHasMore: false,
      checkinLoadStatus: "loadmore",

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

      //---- 刷新分层的四枚账（2026-10-09，判据全在 onShow 一处）----
      //首屏取数是否已落地。没落地（首进 / 首取失败）时 onShow 走完整首取，落地后 onShow 不再整页重取
      loaded: false,
      //上一次成功取数的时刻，超窗才补一次静默回收（STALE_MS）
      loadedAt: 0,
      //页面上这一份播流地址是哪一刻到手的（保源的年龄闸门，见 MEDIA_MAX_AGE）
      mediaAt: 0,

      /**
       * 阿里云点播的播放凭证（只有 H5 用得上，小程序端留空、继续吃播流地址）
       * 这一组是「起播前现取、过期再取」的一次性资格，不进 data（课程详情那份响应）：
       * 详情发回来的 fullurl 是一条 6 小时有效期的签名地址，播放器内置重试会给它拼 `_t=<毫秒>`
       * 当场把签名弄废，所以「刷新一下才正常」在过去只能靠整页重载重新签一条（2026-10-26 收口的
       * 那一条链）。凭证档把这件事变成「再要一枚凭证」，页面不用重载。
       */
      vodAuth: {
        // 这一枚凭证属于哪门课的哪一格（video / try_watch），换课换格都要先清
        field: "",
        vid: "",
        play_auth: "",
      },
      // 播放器要不要等凭证落地再挂：初值 true ⇒ 图文/直播/音频/小程序端一律不受影响
      vodReady: true,
      // 凭证重取次数（含首次）；超上限就退回地址档，不把用户卡在「一直转圈」
      vodAuthTries: 0,
      // 在途标记：@error / @onM3u8Retry / @refresh 三个来源可能同拍触发，只发一发
      vodAuthPending: false,
      //「别处改过用户态」的账：支付成功广播与本页发起的购买链都标这一枚，回本页收一次就清
      stateDirty: false,

      //拼团区经 @ready 上抛的活动摘要（{ text: '立即开团', activity } / null）：
      //`text` 喂底栏那枚拼团按钮的显隐与文案，`activity` 喂课程信息卡价格格里的拼团横幅（2026-10-27）。
      //两条都只在拼团区组件里取一次，本页只做一枚转发（不给这一页另开第二条拼团取数链）
      gbEntry: null,
      // 受邀参团的上下文（2026-10-30）：团详情「立即加入」带 gb_team 一组参数进本页时才有。
      // 只活在本页实例上，不写 storage —— 退出后从别处重进就是正常的自己开团链。
      // `gbJoinMode` 初值按 URL 先置真（底栏的单独购买立刻收起，不给一个早期可点的窗口），
      // 拼团区取到活动后由 `@ready.join` 校准（活动结束/不是那一场会被抛成 false）。
      gbJoinCtx: null,
      gbJoinMode: false,
      // 购买弹幕素材（2026-10-29 用户点名「gba-danmu 应该放在这个页面的左上角」）：
      // 来自拼团区 @ready 上抛的活动本体，只喂封面左上角那一枚
      // `tz-group-buy-danmu`；活动到期抛 null 时一并清空。WXML 侧读 data，不读 computed。
      gbBuyers: [],
      //控制栏那枚「送好友」这一拍到底摆不摆得出来（吃组件 `visible` 事件）：控制栏是 flex 均分，
      //这一枚收掉时剩下几枚要按实际枚数重新均分（4 枚 → 3 枚），不许按固定 4 格排版
      //（2026-10-29 用户追问「下面的按钮不一定是固定 4 个，这个送好友它是动态显示的」）。
      //**初值给 true**：给 false 就永远挂不上组件、也永远收不到 `visible`（硬约束 31② 的自锁）；
      //乐观初值期间那一格是空的，init/entry 回包判出「不该出」后组件抛 false ⇒ 宿主挂 `.sf-control-slot--off`
      sfEntryShown: true,

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
  computed: {
    /**
     * 宿主价格行显不显示（2026-10-30 第五轮，用户第二次点名「拼团价要复制覆盖原来的价格」）：
     * 拼团进行中（拼团区 `@ready` 上抛的 `gbEntry.activity` 非空）⇒ 本页价格行收起，
     * 价格只由拼团卡第一行的横幅给 —— 一屏只有一个价；没有活动 / 活动结束抛 null ⇒ 照常显示。
     * 判据只此一处（与底栏那枚拼团按钮、封面弹幕同一份 `gbEntry`）。
     */
    gbPriceShown() {
      return !(this.gbEntry && this.gbEntry.activity);
    },
    /**
     * 积分兑换页（`pageParams.type === 'score'`，积分商城的商品卡跳进来时带的那枚参数）。
     *
     * 这一页比普通商详少三块（2026-10-29 用户点名「如果是积分商品，应该在页面中屏蔽送好友、拼团、优惠券」）：
     * 送好友（信息卡长条 + 已订阅控制栏那一枚）、拼团（拼团区 + 底栏拼团按钮）、优惠券（领券条）。
     * 三处收口都写在模板的 `v-if` 上，**组件不挂载 ⇒ 它们各自那几条请求也不发**；本计算属性是唯一判据，
     * 模板里不许再各写一遍 `pageParams.type == 'score'`（会分叉）。价格格同理：「兑换积分」占掉原价位，
     * 拼团横幅不再接管那一格。
     */
    isScorePage() {
      return !!(this.pageParams.type && this.pageParams.type == "score");
    },
    /**
     * 页签集合：课程数据 + 商家配置 + 两份展示类数据的到手情况，纯函数算出来
     * 口径与老写法逐条一致（详情/目录的先后、评论入口开关、互动恒在、圈子与推荐按到手才出），
     * 改成的这一份只为让「订阅态翻转」能整份重算：专栏已订阅要把「目录」提到最前、
     * 未订阅且正文为空要收掉「详情」那一枚——老写法是各方法往数组里 push，翻转时没法回退。
     * 数据没到手时返回空数组（模板那一句 v-if="tabs.length > 0" 靠它把整段页签区藏到首屏之后）
     */
    tabs() {
      const d = this.data;
      if (!d.id) {
        return [];
      }
      const tabs = [];
      if (!d.subscription || (d.detail && d.detail != "<p><br></p>")) {
        tabs.push({ name: "详情", type: "detail" });
      }
      if (d.type == "column") {
        if (d.subscription) {
          tabs.unshift({ name: "目录", type: "dir" });
        } else {
          tabs.push({ name: "目录", type: "dir" });
        }
      }
      // 评论入口关闭时不显示评论tab
      if (this.$tools.systemConfig("comment_entry_status") != "close") {
        tabs.push({ name: "评论", type: "comment" });
      }
      tabs.push({ name: "互动", type: "interaction" });
      // 下面两枚属「商家配的展示数据」（组 1）：只在首屏/下拉那一次取，回本页不重取
      if (this.circleTabVisible) {
        tabs.push({ name: "圈子", type: "circle" });
      }
      if (this.recommendTabVisible) {
        tabs.push({ name: "推荐", type: "recommend" });
      }
      return tabs;
    },
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
        that.loading = false; // 兜底分支也要撤骨架：这一页只弹一句 toast 就留在灰块上，看着像「一直加载中」
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
        // 邀请人 id 必须跟着进直播间：达人榜归因与分享有礼助力都在直播间那一页发，
        // 上一版只搬 id 与 column_id，share 在这一跳丢掉 ⇒ 两张表一行都不落（2026-10-04 现场）
        var liveInviter = resolveInviter(that.pageParams.id);
        if (liveInviter) {
          livePathUrl += "&share=" + encodeURIComponent(liveInviter);
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

    /**
     * 付费插件安装状态（三态：true=已装 / false=未装 / null=本地系统配置还没到手）
     * 判到 null 不能当成「未安装」：init 接口还没回时把插件入口判没，就再没有第二次机会补回来（M14）
     */
    getPluginInstallState(key) {
      const raw = uni.getStorageSync('systemConfig');
      if (!raw) return null;
      try {
        const config = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!config || !Object.prototype.hasOwnProperty.call(config, key)) return null;
        return config[key] === true || config[key] === 1 || config[key] === '1';
      } catch (e) {
        return null;
      }
    },
    getCircleInstallState() {
      return this.getPluginInstallState("app_isinstall_circle");
    },
    isVirtualPay(goods) {
      return Number(goods && goods.is_virtual_pay) === 1 && uni.getStorageSync("platform") === "wxMiniProgram";
    },
    /**
     * 底栏主按钮文字：只渲染后端下发的 join_gate 档位
     * 判据不在前端算、原因句不在前端另存一份（M13/M22）——原先这里按 pay_type 复刻了一份「是否免费」，
     * 结果价格位写着「该课程暂不支持单独订阅」、按钮却写着「加入学习」，点下去才被后端拒绝。
     * 未登录 / 积分兑换 / 指定学员这三档由页面自身状态决定；btn_text 为空是付费购买那一档，回落「立即订阅」。
     */
    joinBtnText() {
      if (!this.isLogin) return '立即登录查看';
      if (this.pageParams.type && this.pageParams.type == 'score') return '立即兑换';
      if (this.data.pay_type == 'student') return '仅指定学员可用';
      const gate = this.data.join_gate || {};
      return gate.btn_text || '立即订阅';
    },
    formatVirtualPrice(price) {
      return (price || 0) + (that.$tools.systemConfig('coin_name') || '金币');
    },
    formatPrice(price, goods) {
      return this.isVirtualPay(goods) ? this.formatVirtualPrice(price) : "¥" + price;
    },
    buyTypesSelect() {},

    /**
     * 邀请达人榜归因上报（无界面，2026-10-05 从 `pages/course/live/js.vue` 整体迁来）
     *
     * **为什么必须落在本页、且必须排在下面的 `course.detail` 之前发**：
     * 用户点名「被邀请要排除被邀请的人已经进过直播间，不要重复触发邀请成功」。后端判「进来过没有」
     * 只有一条可靠的判据——`tuzhi_live_user` 里有没有 (受邀人, 这间直播间) 这一行
     * （进房落地时 `admin\model\live\User::joinLive` 建它，之后再进只查不插，`createtime` 也不再变）。
     * 而这一行**恰好是本页下一次 `course.detail` 建的**：后端 `application/api/controller/course/Course.php`
     * 的 `detail()` 在 `if($row['subscription'])` 里调 `joinLive`。
     *   - 先报：行还不存在 ⇒ 他是第一次到这一间 ⇒ 计入（这才是被邀请链接带来的人）；
     *   - 后报：行刚被本次请求建好 ⇒ 判据恒为「进过」⇒ 一个人都算不进。
     * 改按时间差判（`now - createtime` 在多少秒内算新客）不可用：详情页停留时长没有上界，
     * 窗口开短了会把认真看完详情才点进去的人误判成老用户（真丢单），开长了又放重复触发进来。
     * ⇒ 判据必须是「这张行在不在」，而前提是**先后**：`getData` 里已把两次请求串成一条链，
     *   `check-live-inviter-chain.js` 第 ⑬ 组断言本方法排在 `$api('course.detail')` 之前。
     *
     * 邀请人 id 的来源仍走 live-inviter（链接直达吃 URL 上的 `share`，中转进来取按课程记下的那一份）。
     * 只报一次：同一场里 onShow / 下拉刷新都会再进 getData，换一场才重报；失败后撤标记，下次进页补报，
     * 不把一次网络抖动固化成永久丢单。**未登录这一档不许发**（PRD §12.3-2），它同样不能算「已报」。
     * 失败一律不在受邀人界面上弹一句「归因失败」（PRD §十-20），出声只进 console——
     * 静默吞掉会让下一次复现变成瞎子摸象（硬约束 23 同族）。
     *
     * 永远返回 Promise：getData 要 await 它再发 `course.detail`，任何提前 return 的档位也必须 resolve，
     * 否则整个取数链会被这次不上报拖住。插件未安装时同样直接 resolve（插件接口与类都不存在，
     * paid-plugins §一：代码即插件）。
     *
     * @returns {Promise}
     */
    reportInviteRank() {
      // 未安装插件时不发这一条：接口与后端类都不存在（paid-plugins §1.2）
      if (!this.$tools.systemConfig('app_isinstall_invite_rank')) {
        return Promise.resolve();
      }
      const courseId = this.pageParams.id;
      const inviterId = resolveInviter(courseId);
      if (!inviterId || !courseId) {
        // 这一道原先是**全静默 return**——而它恰恰是 2026-10-05 查了八轮的那一道：
        // 「没记住邀请人」与「请求发出去了没落库」在库里长得一模一样（两张空表），
        // 指纹上 `rank/report` 一次都不出现，可这一次出现本身也不能证明是谁没发。
        // 出声只进 console，不碰受邀人界面（PRD §十-20）；同一场只喊一次，别刷屏。
        if (!this._inviteRankNoInviterWarned) {
          this._inviteRankNoInviterWarned = true;
          console.warn(
            '[invite_rank] 本场没有邀请人，归因请求不会发出。' +
              '链接上没带 share（后端 `Share::getArticle` 未登录时会把 userId 置 0，出链就整个不带邀请人）' +
              '，或详情页那一跳没把 share 带进来。请把本页地址栏里的链接整条贴出来 —— 它带没带 share= 就是这两种情形的判据。'
          );
        }
        return Promise.resolve();
      }
      // PRD §12.3-2：未登录**不发**请求。后端 report 对未登录回的是 code=1 / counted=false，
      // 与「已上报」在前端完全不可区分 —— 照发等于把「已上报」这一标记烧掉，
      // 登录之后这一场再也不会补报，症状正是「点过好友链接、榜上却还是没有」（2026-10-04 当晚复查）。
      // 不发就不会烧：登录后由下一次 getData / onShow 这一条路补上（页面实例被 reLaunch 换掉时同理）。
      if (!uni.getStorageSync('user_token')) {
        if (!this._inviteRankNoLogin) {
          this._inviteRankNoLogin = true;
          console.warn('[invite_rank] 未登录，暂不发归因请求（登录后下一次取数补报）');
        }
        return Promise.resolve();
      }
      const key = courseId + '-' + inviterId;
      if (this._inviteRankReported === key) {
        return Promise.resolve();
      }
      this._inviteRankReported = key;
      return this.$api('invite_rank.rank.report', {
        course_id: courseId,
        share: inviterId,
      }).then((ret) => {
        if (!ret || ret.code !== 1) {
          this._inviteRankReported = '';
          console.warn('[invite_rank] 归因上报未成功：', (ret && ret.msg) || (ret && ret.code));
        }
      }).catch(() => {
        this._inviteRankReported = '';
        console.warn('[invite_rank] 归因上报请求失败');
      });
    },

    /**
     * 分享有礼助力上报（无界面，2026-10-05 用户点名「只有邀请达人榜正确的显示了邀请记录，
     * 但是分享有礼的邀请，并没有生效」之后在本页补上这一发）
     *
     * **原来的问题**：两条上报落在两页——达人榜在本页（`reportInviteRank`），助力在直播间页
     * `share-gift-popup` 的 `tryAssist`。于是「受邀人点开分享链接、落在这一个详情页」这个事实，
     * 只有达人榜认，分享有礼要等他**再点一次「进入直播间」**、且 `share` 在
     * `detail → live` 那一跳被带过去，才会落 `app_share_gift_assist`。少点一次、或那一跳没带参数，
     * 两张表就是「一张有、一张空」——这正是 2026-10-05 现场的形状：
     * `app_invite_rank_visit` 有 (27 → 486, course 4776) 一行，`app_share_gift_assist` 整场 0 行。
     *
     * **为什么「进入」以本页为准**：PRD（`文档/功能/分享有礼/PRD.md` 附录数据源那一段）自己认的
     * 「进入直播间」事实就是 `admin\model\live\User::joinLive` 写的那张 `tuzhi_live_user` 行，
     * 而这一行**是本页下一次 `course.detail` 建的**（`api/controller/course/Course.php::detail()`）。
     * 达人榜已经按这一格判「第一次到这一间」，分享有礼跟着它同一次事实记账，两个插件才对得上。
     *
     * **与直播间页那一发不冲突**：`Assist::join` 对「同一活动同一受邀人」是幂等的
     * （`uk_activity_assist(activity_id, assist_user_id)`，重复进回既有行），
     * 所以本页先记、直播间页再记一次。**两发都静默**（2026-10-06 用户点名「被邀请的用户进入直播间后
     * 不要弹出来」，直播间那一发原先驱动的 `assist-tip`「助力成功」弹窗整层已删）：
     * 成功不弹、失败只在 console 出声。
     *
     * **不发这一发的档位与达人榜同款**：插件未安装（代码即插件）／没有邀请人／未登录（PRD §12.3-2），
     * 一律不发而不是发一记注定失败的请求；同一 (course, inviter) 只发一次，失败撤标记等下一次进页补发。
     * 插件没装或没活动时后端回的是一句「本直播当前没有进行中的分享有礼活动」，
     * 不是丢单——不占标记，撤掉即可，下次 `getData` 自然补。
     *
     * **顺序**：排在 `reportInviteRank()` 之后、`course.detail` 之前。
     * 达人榜那条的判据是「`tuzhi_live_user` 这行在不在」，本页这一发**不碰那张表**
     * （不去调 joinLive），所以两者的先后不会互相破坏；排在后面只是为了让两条归属一次到齐。
     *
     * 永远返回 Promise，理由同 `reportInviteRank`（不许把整条取数链带崩）。
     *
     * @returns {Promise}
     */
    reportShareGiftAssist() {
      // 未安装插件时不发这一条：接口与后端类都不存在（付费插件 §1.2，代码即插件）
      if (!this.$tools.systemConfig('app_isinstall_share_gift')) {
        return Promise.resolve();
      }
      const courseId = this.pageParams.id;
      const inviterId = resolveInviter(courseId);
      if (!inviterId || !courseId) {
        return Promise.resolve();
      }
      // 未登录不发：后端对未登录回的是 code!=0，前端与「已上报」不可区分，照发等于把标记烧掉
      if (!uni.getStorageSync('user_token')) {
        return Promise.resolve();
      }
      const key = 'sg-' + courseId + '-' + inviterId;
      if (this._shareGiftAssistReported === key) {
        return Promise.resolve();
      }
      this._shareGiftAssistReported = key;
      return this.$api('share_gift.gift.assist', {
        course_id: courseId,
        inviter_id: inviterId,
        // 本场没有进行中的活动时后端回 code=0 + 一句 msg，请求层会自己弹那一句黑 toast；
        // 这一发是进页自动发的归因上报，不是用户点出来的，按静默请求发（口径同 M42）
      }, { custom: { noToast: true } }).then((ret) => {
        if (!ret || ret.code !== 1) {
          this._shareGiftAssistReported = '';
          console.warn('[share_gift] 助力未成功：', (ret && ret.msg) || (ret && ret.code));
        }
      }).catch(() => {
        this._shareGiftAssistReported = '';
        console.warn('[share_gift] 助力请求失败');
      });
    },

    /**
     * 会打到 course.detail 的请求只有这一个出口（2026-10-09 刷新分层时抽出）
     *
     * 达人榜归因**必须排在 course.detail 之前**发出：后端 `Course::detail()` 会在里面调 joinLive
     * 建 tuzhi_live_user 行，而 Report 的「已经进过直播间」判据就是这张行在不在
     * （先报＝第一次到这一间，计入；后报＝被本次请求自己刚建的行挡掉，一个人都算不进）。
     * 顺序是判据成立的前提，不是偏好——改这一段顺序等于把整条排除规则作废，
     * 验法 tuzi-mobile/scripts/check-live-inviter-chain.js 第 ⑬ 组。
     * ⇒ 以后再加取详情的路径（回收档、其它触发点）一律从这里走，不许另开一份不打归因的 detail。
     * @param bool addViews 是否计入浏览量（只有首进那一次算，见 onShow 判据①）
     * @returns {Promise}
     */
    fetchDetail(addViews) {
      return Promise.resolve()
        .then(() => {
          // 归因这一段不许把整条取数链带崩：它发起时是同步调用，抛异常会让下面的 course.detail 根本不发，
          // 症状变成「为了报一次归因，受邀人连课程详情页都打不开」——那比丢一次归因严重得多。
          try {
            return that.reportInviteRank();
          } catch (e) {
            console.warn('[invite_rank] 归因上报发起失败：', e);
            return Promise.resolve();
          }
        })
        .then(() => {
          // 分享有礼助力同拍补发（静默，无界面）。排在达人榜之后、`course.detail` 之前：
          // 同一个「受邀人点开分享链接落到本页」的事实，两个插件一起记账，
          // 不再一个认这一跳、另一个要等下一跳（2026-10-05 用户点名「分享有礼的邀请，并没有生效」）。
          // 这一发不碰 tuzhi_live_user，所以不会反过来吃掉达人榜那条判据。
          try {
            return that.reportShareGiftAssist();
          } catch (e) {
            console.warn('[share_gift] 助力上报发起失败：', e);
            return Promise.resolve();
          }
        })
        .then(() => {
          return that.$api("course.detail", {
            id: that.pageParams.id,
            add_views: addViews ? 1 : 0,
          });
        });
    },

    /**
     * 完整取数：首进、下拉刷新、以及本页自己完成订阅之后走这一条
     * @param bool addViews 只首进那一次传 true。老写法把它挂在 onShow 上，
     *        于是浏览器切一次标签页、微信把页面丢进小窗再还原，`views` 就 +1
     *        （后端 setInc 没有幂等），浏览数被读成虚高——2026-10-09 起一次页面实例只加一次
     */
    getData(addViews = false) {
      // 骨架屏只服务首进（M23②）：下拉刷新顶部已有原生转圈，再把整页换成灰块等于闪第二次
      if (!that.loaded) {
        that.loading = true;
        // 骨架屏兜底：请求挂起（无响应/不 settle）或成功回调内分支遗漏/异常时，
        // loading 都可能不被复位，必须由定时器无条件兜底释放——
        // 带 token 条件会漏掉「早退后新请求也随之失效」的场景，页面会一直停在骨架屏
        clearTimeout(that._loadingWatchdog);
        that._loadingWatchdog = setTimeout(function () {
          that.loading = false;
        }, 8000);
      }

      // 弱网下 首进/下拉刷新/订阅刷新 可能并发触发多次请求，请求按完成顺序回填
      // 会让展示数据被旧响应覆盖。用递增 token 只采纳最后一次请求的结果。
      const token = (that._getDataToken || 0) + 1;
      that._getDataToken = token;
      // 「圈子」「推荐」两枚页签先收掉，等这一趟的响应重新点亮
      // （下拉刷新后商家把推荐位清空了，页签就该跟着没有）
      that.circleTabVisible = false;
      that.recommendTabVisible = false;

      if (this.pageParams.type && this.pageParams.type == "score") {
        that.getScoreDetail();
      }

      that
        .fetchDetail(addViews)
        .then((res) => {
          uni.stopPullDownRefresh();

          // 过期响应直接丢弃，避免旧响应覆盖新数据
          if (token !== that._getDataToken) {
            return;
          }
          // 不在此处撤销骨架屏兜底定时器：响应被采纳不等于 loading 一定被复位
          // （成功回调内分支或异步链路中断时），保留 8s 定时器做最终兜底
          // （直播中转场景由 _liveLoadingTimer 与 runLearnChain 内的显式复位共同接管）

          if (res.code !== 1) {
            that.detailUnavailable(res.msg);
            return;
          }

          that.applyCourseData(res.data);
          // 组 1：商家配的展示数据，只挂在这一条完整取数链上，回到本页不再重取
          that.loadCourseExtras(token);

          if (!that.loaded) {
            that.applyDefaultTab();
          }
          that.loaded = true;
          that.loadedAt = Date.now();
          that.stateDirty = false;
        })
        .catch((res) => {
          clearTimeout(that._loadingWatchdog);
          that.loading = false;
          // 收条要等这一趟有回音才收（失败也是回音），否则下拉转圈停不下来
          uni.stopPullDownRefresh();
          console.warn("[course.detail] 取数失败：", res);
        });
    },

    /**
     * 详情落到页面上：播放器约束 → 页面数据 → 标题与分享 → 随用户态变的那几份 → 学习链
     * 完整取数与「订阅态翻转」共用这一份，两处不许各写一份
     */
    applyCourseData(d) {
      if (d.type == "audio" || d.type == "video") {
        courseLibrary.banScreenRecordStart();
      }
      // #ifdef MP-WEIXIN
      //检查PC端是否能学习
      courseLibrary.checkBanPc(d.type, d.id);
      // #endif

      // #ifdef H5
      // 阿里云点播的课先拿凭证再挂播放器：拿凭证这一发只有一两百毫秒，而地址档那一条在桌面
      // 浏览器上是必失败的一条（私有加密 m3u8 交给 MSE 解不出密钥 ⇒ 4400），让它先挂上去
      // 再换凭证，用户会先看到一句「播放出错啦」才开始播。正文、价格、页签都不等这一发。
      that.prepareVodAuth(d);
      // #endif

      that.data = d;
      // 这一份媒体字段是刚签出来的（完整取数与订阅态翻转两支都会走到这里）
      that.mediaAt = Date.now();

      // 页面标题跟随课程名称（原标题为固定的「课程详情」，直播课程即对应直播的标题）：
      // H5 端同步浏览器/微信顶部标题，小程序端同步导航栏标题
      if (d.name) {
        uni.setNavigationBarTitle({ title: d.name });
      }

      // 分享卡片描述取课程简介，简介为空时由 $nav.share 回退为「打开查看详情」
      // #ifdef H5
      this.$nav.share(d.name, d.briefing || "", d.cover);
      // #endif

      that.getIsCollect();
      that.getGoodsVipPrivilege();
      that.loadCheckin();
      // 骨架屏的落点在 runLearnChain 里（只有直播中转那一档要保持加载态）
      that.runLearnChain();
    },

    /**
     * 这一份详情该播哪一格阿里云点播素材（正片 / 试看），素材行里必须带后端发的 vid
     * 判据与模板那两条 v-if 一致：已订阅吃正片，未订阅只有开了试看才有试看片；
     * 没有 vid（本地存储、直播课、图文课）就没有凭证可取，端上照旧走地址档
     */
    vodMediaOf(d) {
      if (!d || d.type != "video") {
        return null;
      }
      if (d.subscription) {
        return d.video_path && d.video_path.vid
          ? { field: "video", vid: d.video_path.vid, row: d.video_path }
          : null;
      }
      if (d.try_watch_status && d.try_watch_content && d.try_watch_content.vid) {
        return { field: "try_watch", vid: d.try_watch_content.vid, row: d.try_watch_content };
      }
      return null;
    },

    /**
     * 起播前取一枚播放凭证（H5）：换课、换格都先把旧凭证清掉再取，
     * 否则新挂上来的播放器会拿上一格的凭证重建一次、白报一次错
     */
    prepareVodAuth(d) {
      const media = that.vodMediaOf(d);
      if (!media) {
        that.resetVodAuth();
        return;
      }
      if (that.vodAuth.field === media.field && that.vodAuth.vid === media.vid && that.vodAuth.play_auth) {
        // 同一格、凭证还在手上（静默回收那一支不会重取媒体字段）⇒ 不再发这一发
        that.vodReady = true;
        return;
      }
      that.resetVodAuth();
      that.vodReady = false;
      that.requestVodAuth(media, false);
    },

    /**
     * 清掉凭证与计数：把播放器放回地址档。
     * vodReady 必须跟着放回 true —— 「等凭证」不能变成「这一页没有播放器」
     */
    resetVodAuth() {
      that.vodAuth = { field: "", vid: "", play_auth: "" };
      that.vodAuthTries = 0;
      that.vodReady = true;
    },

    /**
     * 取凭证的一发
     * @param object media  vodMediaOf 出来的 {field, vid, row}
     * @param bool   retry  是不是失败后的重取（重取限次数；首次失败直接放它回地址档）
     */
    requestVodAuth(media, retry) {
      if (!media || that.vodAuthPending) {
        return;
      }
      if (retry && that.vodAuthTries >= VOD_AUTH_MAX_RETRY) {
        // 取不到凭证就把这一格交回地址档：宁可维持今天这条手机端能播的路，
        // 也不要为了修电脑端把画面整个赔进去
        console.warn("[course.playAuth] 取凭证已试 " + that.vodAuthTries + " 次，回落地址档");
        that.vodAuth = { field: "", vid: "", play_auth: "" };
        that.vodReady = true;
        return;
      }
      that.vodAuthTries++;
      that.vodAuthPending = true;

      // 首次那一发要有退出口：请求挂起（无响应、被 cancel）时 vodReady 会一直是 false，
      // 页面就等于没有播放器——比「退回地址档」严重得多（硬约束 22：进入加载态要把退出分支一次写全）
      if (!retry) {
        clearTimeout(that._vodAuthWatchdog);
        that._vodAuthWatchdog = setTimeout(function () {
          if (that._isDestroyed) {
            return;
          }
          if (!that.vodAuth.play_auth && !that.vodReady) {
            console.warn("[course.playAuth] 取凭证超时，先按地址档把播放器挂上");
            that.vodAuthPending = false;
            that.vodReady = true;
          }
        }, 4000);
      }

      that
        .$api(
          "course.playAuth",
          { course_id: that.pageParams.id, field: media.field },
          { custom: { noToast: true } }
        )
        .then((res) => {
          clearTimeout(that._vodAuthWatchdog);
          if (that._isDestroyed) {
            return;
          }
          that.vodAuthPending = false;
          const data = (res && res.data) || {};
          if (!res || res.code != 1 || !data.play_auth || !data.video_id) {
            // 运维那一句原因（AccessKey 被禁用这类）只进控制台：这一页后面还有地址档那条路，
            // 真放不出画面时播放器自己的报错板才带得出出路，这里再压一句 toast 只会盖住它
            console.warn("[course.playAuth] 未取得凭证：", res && res.msg, data && data.reason);
            if (!retry) {
              that.vodReady = true;
            }
            return;
          }
          that.vodAuth = {
            field: media.field,
            vid: data.video_id,
            play_auth: data.play_auth,
          };
          that.vodReady = true;
        })
        .catch((err) => {
          clearTimeout(that._vodAuthWatchdog);
          if (that._isDestroyed) {
            return;
          }
          that.vodAuthPending = false;
          console.warn("[course.playAuth] 请求失败：", err);
          if (!retry) {
            that.vodReady = true;
          }
        });
    },

    /**
     * 播放器报错 / 内置重试 / 错误板上那枚刷新：一律当作「手上这枚凭证不灵了」，重取一枚。
     * 三枚来源同拍只发一发（vodAuthPending 拦），到上限回落地址档，不许在这里无限循环——
     * 「要刷新页面才能播」这一条从此由这一发接手，页面不用再重载
     * @param string from 触发来源，只进日志
     */
    renewVodAuth(from) {
      // #ifdef H5
      const media = that.vodMediaOf(that.data);
      if (!media) {
        return;
      }
      console.warn("[course.playAuth] 由 " + from + " 触发重取凭证");
      that.requestVodAuth(media, true);
      // #endif
    },

    /**
     * 当前这一格该发给播放器的地址：凭证到手就不该再把播流地址发过去。
     * Aliplayer 的判据是 `vid && !source`（vendored 2.15.2 构造里那句 `if(t.vid&&!t.source)`），
     * 两个都给等于回到地址档、这枚凭证白取
     */
    vodSourceOf(row) {
      if (!row || !row.fullurl) {
        return "";
      }
      const media = that.vodMediaOf(that.data);
      if (media && row.vid && media.vid === row.vid && that.vodAuth.play_auth) {
        return "";
      }
      return row.fullurl;
    },

    /**
     * 详情到手之后的学习链：已订阅 → 表单闸门 → 心跳/完课/直播中转；未订阅 → 只记一次进入
     * 完整取数与「订阅态翻转」都从这里出结论，所以 loading 的落点也在这一处
     */
    runLearnChain() {
      // 小程序学习闸门：本端被商家拦下时不开学习链。
      // 播放器/正文都不渲染，开了只会把学习时长空转上去、图文还会直接 finish 成「已学完」。
      // 判据只认后端下发的 mp_study（配置/课程类型/端都在后端折好），前端不自己比类型
      if (that.data.subscription && Number(that.data.mp_study) === 1) {
        that.loading = false;
        return;
      }

      // 直播课程的直播源不适配课程播放器（跳转会提示播放异常），详情页只作跳转直播页的中转：
      // 保持骨架屏直到跳转完成，由 startLearning 跳转或下面被拦截的分支释放
      var liveRedirect = that.data.type == "live" && !!that.data.subscription;

      // 直播中转兜底：跳转链路（表单检查回调 → startLearning → redirectTo）任一环节卡住时
      // 也必须释放骨架屏。定时器在此处挂载而不是只放在 startLearning 内——
      // 表单插件已安装时 startLearning 需等 app.form.checkBeforeLearn 回调，
      // 该请求不回调时既不会跳转、也不会启动定时器，页面会永久停在加载态
      if (liveRedirect) {
        that.loading = true;
        clearTimeout(that._liveLoadingTimer);
        that._liveLoadingTimer = setTimeout(function () {
          if (that.isPageActive) {
            that.loading = false;
          }
        }, 3000);
      }

      if (that.data.subscription) {
        // 学习前表单拦截：绑定 before_learn 表单未填写时拦住学习，不产生学习行为
        that.checkLearnForm((blocked) => {
          if (blocked) {
            // 被拦截时不跳转直播页，先释放骨架屏，避免拦截层被加载态盖住。
            // 这里只出居中那一层引导卡，不再自动开底部填写弹窗（2026-09-27 用户口径「两个弹窗
            // 只保留中间那个引导弹窗」：两层同屏时引导卡压在填写弹窗背后等于白弹一层）；
            // 填写弹窗由引导卡上的「去填写」点开
            that.loading = false;
            return;
          }
          that.startLearning();
        });
      } else {
        courseLibrary.setStudyLog(that.pageParams.id, that.pageParams.column_id);
        // 订阅失效等场景下清除学习前表单拦截状态
        that.learnForm = {
          blocking: false,
          forms: [],
        };
      }

      // 直播中转才保持骨架屏（跳转完成前不露出详情页，由跳转/拦截分支/_liveLoadingTimer 释放）；
      // 其余课程数据已到即渲染页面，取反会让页面在响应到达的同一刻重新挂上加载态
      that.loading = liveRedirect;
    },

    /**
     * 组 2：用户态回收（2026-10-09 刷新分层的另一条链，只在 onShow 判据② 命中时发）
     *
     * 静默、不闪骨架、不动组 1，且订阅态没翻就不换播流地址——所以它不会打断正在播的音视频。
     * 「购买后返回本页」「订阅专栏后返回」「开通会员后返回」都落在这一条上：
     * 订阅态翻那一支等价于重新进过一次这门课，直接走完整回填（含学习链与直播中转）。
     */
    refreshState() {
      if (that._stateFetching) {
        return;
      }
      that._stateFetching = true;
      const before = !!that.data.subscription;

      that
        .fetchDetail(false)
        .then((res) => {
          that._stateFetching = false;
          if (res.code !== 1) {
            // 详情取不到只有「课程不存在」与「直播被拉黑」两支，与完整取数同一份处理
            that.detailUnavailable(res.msg);
            return;
          }
          const after = !!res.data.subscription;
          that.loadedAt = Date.now();
          that.stateDirty = false;

          if (after === before) {
            // 保不保源由地址年龄决定（超龄那一趟吃新地址，见 MEDIA_MAX_AGE）
            if (!that.keepRenderingSource(res.data)) {
              that.mediaAt = Date.now();
            }
            that.data = res.data;
            // 没翻就只回收随登录/会员态变的那三份（权益条、收藏、积分商品），学习链一律不重跑：
            // 重跑会再上一格完课、再发一次心跳首枪，直播课还会把人再跳一次
            that.getIsCollect();
            that.getGoodsVipPrivilege();
            if (that.pageParams.type && that.pageParams.type == "score") {
              that.getScoreDetail();
            }
            return;
          }

          // 翻转：页签集合要整份重算（专栏已订阅把「目录」提到最前、正文到手才出「详情」），
          // 当前停着的那一枚可能已经不在了
          that.applyCourseData(res.data);
          that.syncTabChecked();
        })
        .catch((res) => {
          // 网络抖动不等于「状态没变」：账不清，下一次回本页再收一次，
          // 不把一次抖动固化成「买了却一直没显示」
          that._stateFetching = false;
          console.warn("[course.detail] 用户态回收失败，下一次回本页再试：", res);
        });
    },

    /**
     * 订阅态没翻时，把「正在页面上播着/渲染着」的那几份媒体字段留在旧值上
     * 为什么必须留：后端每次 course.detail 都给阿里云点播重签一次播流地址
     * （`api/controller/course/Course.php` 的 courseDataLimit → `Alivod::parseAliovdTag`，
     *  签名有效期常量 6 小时），同一个视频每次回来的 fullurl 都不相同。换源在两端都是破坏性的：
     *  - H5：`components/video/video-h5.vue` 的 `watch: source` 是「换源即 dispose 重建播放器」，
     *    重建后 `@ready → mediaReady → study.media.progress` 把进度回灌成服务端记录那一格；
     *  - 微信小程序：`components/video/video-mp.vue` 把 `:src="source"` 直接绑在原生 `<video>` 上，
     *    属性换值即从头播，且它的 `watch: source` 还顺手 `playVideo()` 自动播起来
     *    ⇒ 「微信来了信息、点开小窗回复再返回，视频从头开始播放」（2026-10-09 用户点名这一条）
     *    在小程序端比 H5 更直接，一次 onShow 就是一次重播；
     *  - 音频：`components/tz/course-audio.vue` 的 `watch: path` 把 currentTime 归零。
     * 6 小时内地址不会过期，换源的必要时机只有订阅态翻转（试看片 ⇄ 正片），那一支不走这里。
     * 万一小程序真把页面回收了（挂在后台被系统杀掉），回来是重建实例、走首屏取数，
     * 那一趟靠 `onHide` 的 `setStudyLog(..., pause=1)` 已经落库的 media_progress 续播
     * （后端 `user/study/getMediaProgress` 取的就是这条），不会从头。
     */
    keepRenderingSource(d) {
      // 地址挂过头就放它换新的：保源的目的是不打断正在播的这一条，不是把旧地址钉死到过期
      if (Date.now() - that.mediaAt > MEDIA_MAX_AGE) {
        return false;
      }
      const fields = [
        "video_path",
        "audio_path",
        "try_watch_content",
        "try_listen_content",
        "detail",
        "try_read_content",
      ];
      fields.forEach((field) => {
        // 旧值取到过才留：未订阅那一档后端把 detail/audio_path 清空过，
        // 拿一份空旧值去盖新值等于把「翻转那一支才该管的清场」提前做了
        if (that.data[field]) {
          d[field] = that.data[field];
        }
      });
      return true;
    },

    /**
     * 组 1：商家配的展示数据（推荐商品 / 课程关联圈子 / 推荐评价 / 圈子课程目录导航）
     * 这一组与登录态、订阅态都无关，只随「这门课」走 ⇒ 只在首屏与下拉刷新取；
     * 切标签页、微信小窗还原、从评论/收藏一类的子页退回，一概不重取（2026-10-09 用户点名）
     */
    loadCourseExtras(token) {
      // 加载课程关联的展示圈子（圈子插件）
      that.loadCircle(token);
      // 推荐评价（评价入口的「共 N 条评价」与两条预览）
      that.getCourseRecommendList();
      // 推荐商品（全站推荐位，与本课程无关，更与用户态无关）
      that.getRecommendGoods(token);
      // 从圈子课程目录进入时的前后课程导航
      that.loadCircleCourseNav();
    },

    /**
     * 首进取到详情后选默认页签：专栏已订阅落「目录」，其次「详情」，都没有才回首枚
     * （口径与改动前逐条一致）
     */
    applyDefaultTab() {
      const tabs = that.tabs;
      if (that.data.type == "column" && that.data.subscription) {
        that.tabsChecked = "dir";
        return;
      }
      if (tabs.some((item) => item.type === "detail")) {
        that.tabsChecked = "detail";
        return;
      }
      that.tabsChecked = tabs.length > 0 ? tabs[0].type : "";
    },

    /**
     * 页签集合变过之后校对当前页签：还在就继续停着（用户正看着的那一屏不许被回收动作跳走），
     * 不在了才退回首枚
     */
    syncTabChecked() {
      const tabs = that.tabs;
      if (tabs.length === 0) {
        that.tabsChecked = "";
        return;
      }
      if (!tabs.some((item) => item.type === that.tabsChecked)) {
        that.tabsChecked = tabs[0].type;
      }
    },

    /**
     * 详情取不到的那一支（课程不存在 / 直播被拉黑）：完整取数与静默回收同一份处理
     */
    detailUnavailable(msg) {
      that.loading = false;
      uni.showModal({
        title: "提示",
        content: msg,
        success: function () {
          // 记录不存在（如失效分享链接）时无上一页可退，direct 打开时
          // navigateBack 会退化成页面刷新再次提示，直接返回首页
          uni.reLaunch({
            url: "/pages/index/index",
          });
        },
      });
    },

    /**
     * 回到本页立刻接上的三件本地事（一件请求都不发）
     *
     * 学习心跳这一段是这次改动必须补的：老写法的定时器是「onShow → getData → 表单闸门回调 →
     * startLearning」这条链的末端顺手重起的，去掉全量刷新后不接上就变成「切标签页回来学习时长不涨」，
     * 而 onHide 那一刻已经把这一段桶结算掉了（course.js 的 flushBucket）。
     * 防录屏与「禁止 PC 端学习」同理：onHide 里 banScreenRecordCancel 撤掉了，回来要重新上。
     */
    reactivate() {
      if (that.data.subscription && !that.learnForm.blocking) {
        that.setStudyLog();
      }
      if (that.data.type == "audio" || that.data.type == "video") {
        courseLibrary.banScreenRecordStart();
      }
      // #ifdef MP-WEIXIN
      courseLibrary.checkBanPc(that.data.type, that.data.id);
      // #endif
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
     * 获取推荐商品（组 1：全站推荐位，与本课程、与登录态都无关，只在完整取数这一条链上发）
     */
    getRecommendGoods(token) {
      that.$api("app.recommend.getRecommendGoods", {}).then((res) => {
        // 过期 getData 触发的异步回填丢弃，避免 推荐 tab 重复
        if (token !== that._getDataToken) {
          return;
        }
        if (res.code == 1 && res.data) {
          that.recommendTabVisible = true;
          that.recommendGoodsList = res.data;
        }
      });
    },

    // 积分商品详情
    getScoreDetail() {
      that
        .$api("app.score.detail", {
          id: that.pageParams.id,
          score_goods_id: that.pageParams.score_goods_id || 0,
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

    //加载课程关联的展示圈子（圈子插件，未安装或无绑定时静默跳过；组 1，只随完整取数发）
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
        that.circleTabVisible = true;
      }
    },

    /**
     * 取本课程（含所属专栏）关联的打卡活动：底栏要不要出「打卡」那一枚，就看这一次请求的结果
     *
     * 两道守卫缺一不可（paid-plugins.md §4.1：插件的类文件只有装了才存在，未安装连接口都不该打）：
     * ① 打卡插件未装（含本地系统配置还没到手的 null 态）不发插件接口；
     * ② 只有已加入学习才发——「打卡」挂在已订阅态那条底栏（control 档）上，未订阅那个位置是「立即订阅」。
     * 列表同时喂底栏按钮与弹窗，不让弹窗自己再取一遍（两处各取就会出现「按钮出了、弹窗是空的」）。
     *
     * 调用点只有 applyCourseData 一处，所以订阅态翻转（购买后回本页那一支）也会跟着再取一次；
     * 两道守卫没过时把列表清干净，别让上一档订阅态的残留撑出底栏那一枚。
     */
    loadCheckin() {
      if (
        that.getPluginInstallState("app_isinstall_checkin") !== true ||
        !that.data.subscription
      ) {
        that.checkinList = [];
        that.checkinHasMore = false;
        return;
      }
      that.fetchCheckin(1);
    },

    /** 弹窗列表上拉加载（滚动到底由 tz-popup-list emit lower） */
    loadMoreCheckin() {
      if (!that.checkinHasMore || that.checkinLoadStatus === "loading") return;
      that.fetchCheckin(that.checkinPage + 1);
    },

    /**
     * 取一页并回填：page=1 整张换掉，page>1 追加
     * @param {Number} page 页码
     * @param {Number} token 首屏才传（弱网下 getData 并发多次，过期响应直接丢弃）
     */
    fetchCheckin(page, token) {
      if (page > 1) that.checkinLoadStatus = "loading";
      return that
        .$api("checkin.course.courseCheckin", {
          course_id: that.pageParams.id,
          column_id: that.pageParams.column_id || 0,
          page: page,
          limit: that.checkinLimit,
        })
        .then((ret) => {
          if (token && token !== that._getDataToken) return;
          if (!ret || ret.code !== 1) {
            // 失败要有读得出来的出口（M13）：翻页失败当场把后端那句原因说出口，已取到的那些条留着、可再拉一次；
            // 首屏失败只是底栏那一枚整枚收起（留一枚点了没东西的按钮更糟），不把故障说成「这门课没关联打卡」
            if (page > 1) {
              uni.showToast({ title: (ret && ret.msg) || "打卡活动加载失败，请稍后重试", icon: "none" });
            }
            that.checkinHasMore = page > 1;
            that.checkinLoadStatus = "loadmore";
            return;
          }
          const data = ret.data || {};
          const rows = data.rows || [];
          if (page > 1) {
            that.checkinList = that.checkinList.concat(rows);
          } else {
            that.checkinList = rows;
            // 枚举文案（参与条件/打卡状态/打卡模式）整页只有一份，随首屏取回来给卡片
            that.checkinAttr = data.attr || that.checkinAttr;
          }
          that.checkinPage = page;
          that.checkinHasMore = Number(data.has_more) === 1;
          that.checkinLoadStatus = that.checkinHasMore ? "loadmore" : "nomore";
        })
        .catch(() => {
          if (page > 1) {
            uni.showToast({ title: "打卡活动加载失败，请稍后重试", icon: "none" });
          }
          that.checkinHasMore = page > 1;
          that.checkinLoadStatus = "loadmore";
        });
    },

    // 点弹窗里的一条活动：已参与进打卡主页、未参与进介绍页，落点判据在 common/utils/checkin-activity 一处存
    goCheckin(item) {
      goActivity(item);
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
        // 带上积分商品行 id：服务端按行定位，不再只按课程 goods_id 猜
        goodsList[0].score_goods_id = Number(that.scoreGoodsDetail.score_goods_id || 0);
        that.leaveToPay(
          "/pages/order/submit/submit?type=score&goodsList=" + JSON.stringify(goodsList)
        );
        return false;
      }

      //「加入学习」这一条路由后端逐行判（detail 下发的 join_gate）：能走才发订阅请求，
      //被门槛拦下时把后端那句原因说出口并给出下一步（有专栏可买就把人带到那一专栏），不在前端另存一套文案（M13/M22）
      const gate = that.data.join_gate || {};
      if (gate.can_join) {
        that.freeSubscription();
        return false;
      }
      if (gate.text) {
        if (gate.column_id) {
          uni.showModal({
            title: "提示",
            content: gate.text,
            confirmText: "立即订阅",
            success: function (res) {
              if (res.confirm) {
                that.leaveToPay(gate.column_id, "column");
              }
            },
          });
        } else {
          uni.$u.toast(gate.text);
        }
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
              if (res.confirm) {
                that.leaveToPay(that.pageParams.column_id, "column");
              }
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

      that.leaveToPay("/pages/order/submit/submit?goodsList=" + JSON.stringify(goodsList));
    },

    /**
     * 离开本页去下单 / 订阅专栏 / 积分兑换：先把「用户态可能要变」记在账上，再跳
     *
     * 支付成功那一条链本来就有全站事件（PAY_EVENT，发在 common/utils/pay.js 的 goOrder）兜着，
     * 这一枚是它的同级备份：H5 WAP 与支付宝那一族是整页跳走再回跳，不一定经过那一条收口；
     * 下单页也可能被用户直接关掉。回本页时宁可多回收一次（一条静默请求、不动播放器），
     * 也不能出现「付了钱回来页面还写着立即订阅」——那是这次去掉 onShow 全量刷新唯一的真实风险面。
     * @param {String|Number} dest 地址或课程/专栏 id
     * @param {String} type 路由类型，同 $nav.to
     */
    leaveToPay(dest, type) {
      that.stateDirty = true;
      that.$nav.to(dest, type);
    },

    /**
     * 拼团区（`components/tz/group-buy-area.vue`）要把人带去下单：
     * 导航由组件自己发（它得先挂上 `extend.group_buy` 那一枚上下文，页面这边不知道选了哪一档），
     * 本页只补这一枚「用户态可能要变」的账 —— 与 leaveToPay 同一件事、同一个判据，
     * 付完款退回来由 onShow 判据② 走静默回收（不闪骨架、不动正在播的那一份源）。
     * 用 `this` 不用模块级 `that`：这一枚是模板上的事件处理器，`this` 就是渲染出这一页的实例。
     */
    gbGoPay() {
      this.stateDirty = true;
    },

    /**
     * 拼团区 @ready：活动摘要（有活动给 { text, inTeam, activity }，没有给 null）收在本地。
     * `text` 喂底栏那枚拼团按钮；`inTeam` 喂底栏的 `hideMain`（我正在这一场拼团中 ⇒ 主购买按钮收起，
     * 2026-10-27 用户点名「当前正在拼团不能再购买」）；`activity.buyers` 喂封面左上角那枚弹幕
     * （2026-10-29）。**横幅与本页无关了**（2026-10-30 用户点名「拼团连成一个整体」）：
     * 拼团价横幅回拼团区那张卡的第一行；拼团进行中本页价格格收起（`gbPriceShown`），本页不做二次加工、也不在这里另发请求。
     */
    gbReady(entry) {
      this.gbEntry = entry;
      // join 态校准：活动不在/不是团上那一场时拼团区抛 `join:false`（或 null）⇒ 底栏单独购买放回来
      this.gbJoinMode = !!(entry && entry.join);
      this.gbBuyers = (entry && entry.activity && entry.activity.buyers) || [];
    },

    /**
     * 底栏「¥xx 拼团」按钮：打开拼团区那只凑团弹层（壳就挂在拼团区组件里，
     * `activity` / `teams` 只在那一份里取过一次）。不走页面导航，弹层由那里就地开。
     */
    openGb() {
      if (this.$refs.gbArea) { this.$refs.gbArea.openPopup(); }
    },

    /**
     * 送好友区（`components/tz/send-friend-area.vue`，M-P1）要把人带去送礼下单页：
     * 与 gbGoPay 同一件事、同一个判据 —— 导航由组件自己发，本页只补这一枚「用户态可能要变」的账，
     * 付完款退回来由 onShow 判据② 走静默回收（不闪骨架、不动正在播的那一份源）。
     * **不许在这里整页重取，也不许给这一枚入口另加一条 onShow 取数**（硬约束 16 例外二：
     * 那三档判据是这一页保住播放进度的前提，被送礼入口翻掉就是「切一次标签页重播一遍」复发）。
     * 用 `this` 不用模块级 `that`：这一枚是模板上的事件处理器，`this` 就是渲染出这一页的实例。
     */
    sfGoPay() {
      this.stateDirty = true;
    },

    /**
     * 会员权益条点进会员中心：开完会员回来同样要吃一次回收，口径同 leaveToPay
     */
    goVipCenter() {
      that.leaveToPay("/pages/app/vip/center/center");
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
    clearTimeout(this._vodAuthWatchdog);
    courseLibrary.banScreenRecordCancel();
  },
  onUnload() {
    this.isPageActive = false;
    courseLibrary.setStudyLog(this.data.id, this.pageParams.column_id, this.getCurrentTime(this.data.type), 1);
    // courseLibrary.stopStudyLog();
    clearInterval(this.studyTimer);
    clearTimeout(this._liveLoadingTimer);
    clearTimeout(this._loadingWatchdog);
    clearTimeout(this._vodAuthWatchdog);
    courseLibrary.banScreenRecordCancel();
    // 全站支付成功的监听要按 handler 注销：uni.$off(name) 不带 handler 会把别的页面那一份一起摘掉
    if (this._onPaySuccess) {
      uni.$off(PAY_EVENT, this._onPaySuccess);
      this._onPaySuccess = null;
    }
  },
  /**
   * 回本页要不要取数，判据只有这三条（2026-10-09 用户点名「onShow 方法中存在刷新方法，
   * 导致每次页面刷新、标签页切换都会触发页面刷新，并且在播放视频、音频直播时会因为刷新导致
   * 播放中断，甚至播放一半时还会因为刷新重置播放进度。在微信中，将页面切换到小窗再还原也会导致该问题」）
   *
   * 为什么切一次标签页就整页重取：uni-app H5 把 `document.visibilitychange` 直接发成
   * 当前页的 onShow（`node_modules/@dcloudio/uni-h5/src/core/service/bridge/on.js` 的
   * onAppEnterForeground → callCurrentPageHook('onShow')，监听器在 dist 里），
   * 微信小窗还原走的是同一条，所以「看不见的那一段时间」两端都报成一次 onShow。
   *
   * 换来的是：老写法每次 onShow 都 `getData(true)` ⇒ ① 骨架屏重挂一次（整页换版），
   * ② 后端每次都给阿里云点播重签播流地址、`watch: source` 换源即重建播放器（进度退回
   * 服务端记录那一格），③ 每切一次标签页 `views` +1，④ 一轮 9 条接口。
   */
  onShow() {
    // M23 硬要求：用了模块级 that 的页面，onShow 的第一条语句必须把它收回当前实例
    that = this;
    that.isPageActive = true;
    courseLibrary.stopStudyLog();
    clearInterval(that.studyTimer);
    courseLibrary.banScreenRecordCancel();

    // 判据①：首屏还没落地（首进，或首取失败留下的空页）→ 完整取数。
    // 浏览数只在第一次那一趟加，重试趟不加（否则网络抖几下 views 就涨几格）
    if (!that.loaded) {
      const firstAttempt = !that._firstFetchTried;
      that._firstFetchTried = true;
      that.getData(firstAttempt);
      return;
    }

    // 判据③：其余一律不取数（切标签页、小窗还原、从评论/收藏/日记一类的子页退回）。
    // 不取数不等于什么都不做——心跳计时与防录屏这两件在 onHide 时被撤掉了，必须在这里接上，
    // 否则「学习时间日志」会跟着全量刷新一起断掉（老写法是靠 getData 末端顺手重起定时器的）
    that.reactivate();

    // 判据②：只有「用户态可能变了」才回收，且走静默回收那一条（不闪骨架、不动正在播的那一份源）：
    // 付过款（全站支付成功事件，或本页发起过下单/订阅专栏/开会员）标过脏，
    // 或这一次取数已经超过 STALE_MS（商家改价、订阅自然到期、其他设备购买这三条没有事件源，靠它兜）
    if (that.stateDirty || Date.now() - that.loadedAt > STALE_MS) {
      that.refreshState();
    }
  },
  //下拉刷新
  onPullDownRefresh() {
    // courseLibrary.stopStudyLog();
    clearInterval(this.studyTimer);
    courseLibrary.banScreenRecordCancel();
    this.getData();
    // 下拉是这一页唯一的「强制重载」出口，拼团区跟着重取一次（它自己那两条，不借整页取数）
    if (this.$refs.gbArea) { this.$refs.gbArea.reload(); }
    // 送好友区同理：它自己那一口 `send_friend.gift.entry`（商家刚改完开关/勾选项，只有下拉看得到）。
    // 未订阅那一枚是信息卡里的长条（`ref="sfCard"`）、已订阅那一枚在控制栏（`ref="sfArea"`）：
    // 两档互斥、两枚 ref 各调各的，不许合并成一枚再猜是哪个实例
    if (this.$refs.sfCard) { this.$refs.sfCard.reload(); }
    if (this.$refs.sfArea) { this.$refs.sfArea.reload(); }
  },

  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    // 受邀参团：只认 URL 上那一组 gb_*；积分商品页不收（那一档整页没有拼团区）
    that.gbJoinCtx = readGroupBuyJoin(that.pageParams);
    that.gbJoinMode = !!that.gbJoinCtx && !that.isScorePage;
    // 直播课的分享链接落点就是本页（Links.php 出 `/pages/course/detail/detail?id=..&share=<邀请人>`），
    // 而付费课「详情 → 下单 → 支付结果页 → 返回直播」那三跳链接参数早没了：
    // 进页先把「这一间直播间由谁请进来」按课程记下来（live-inviter），跳转那几跳都靠它续上。
    // **达人榜归因已在本页就地发**（reportInviteRank，排在 course.detail 之前），
    // 记下的这一份是它的唯一取数入口，也是付费课那一头「先自己买了、后被归因」能判的前提。
    // 参数名一律走 live-inviter 的 inviterFromParams（线上那一个是 `share`，`share_id` 只是后端的取值键）
    rememberInviter(that.pageParams.id, inviterFromParams(that.pageParams));
    clearInterval(this.studyTimer);
    courseLibrary.banScreenRecordCancel();

    this.isLogin = uni.getStorageSync("user_token") ? true : false;

    // 首屏取数不在这里发，由 onShow 判据① 发（H5 端 onLoad 紧接着就 onShow，两处都发会撞成
    // 两条并发请求，弱网下靠 token 丢一条等于白跑一趟）

    // 「别处改了用户态」的账：下单页、会员页、别的课那一头付过款都要回到本页回收一次
    // （2026-10-09 去掉 onShow 全量刷新后，购买态的显示改由这一枚账 + refreshState 静默回收承担）。
    // handler 里不许碰模块级 that——同路由在栈里出现两次时（订阅专栏那一跳就是同一路由新实例），
    // that 停在后创建的那一个，账会标到别人身上；用闭包捕获本页实例
    const vm = this;
    vm._onPaySuccess = function () {
      vm.stateDirty = true;
      // 拼团区随支付成功重取自己的那两条（开团付完款回来，凑团名单里要有自己那一行；
      // 活动结束整段要收掉）。**只在拼团区已挂载时才发**，且不改 onShow 那三条判据、
      // 不动正在播的那一份源（硬约束 16 例外二）；ref 取不到就是没挂（已订阅/未装插件/无活动）
      if (vm.$refs.gbArea) { vm.$refs.gbArea.reload(); }
      // 送好友区同一档：付完送礼款回来，这一屏的入口要从「买一份送好友」换成「查看赠送记录」，
      // 礼单已经落库。口径与上面拼团区那一条逐字相同（只在已挂载时发、不动正在播的那一份源、
      // 不退回「每次 onShow 全取」，硬约束 16 例外二）；ref 取不到就是没挂（未装插件/商家没开）。
      // 两枚 ref 对应两档互斥的摆法：信息卡长条 `sfCard`（未订阅）/ 控制栏 `sfArea`（已订阅）
      if (vm.$refs.sfCard) { vm.$refs.sfCard.reload(); }
      if (vm.$refs.sfArea) { vm.$refs.sfArea.reload(); }
    };
    uni.$on(PAY_EVENT, vm._onPaySuccess);
  },

  onShareAppMessage() {
    return this.$nav.share(this.data.name, this.data.briefing || '', this.data.cover);
  },
  onShareTimeline() {
    return this.$nav.share(this.data.name, this.data.briefing || '', this.data.cover);
  },
};
</script>
