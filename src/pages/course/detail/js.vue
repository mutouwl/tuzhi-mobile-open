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
import customForm from "@/components/tz/custom-form.vue";

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
      tabs: [],
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
      // 达人榜归因**必须排在 course.detail 之前**发出：后端 Course::detail() 会在里面调 joinLive
      // 建 tuzhi_live_user 行，而 Report 的「已经进过直播间」判据就是这张行在不在
      // （先报＝第一次到这一间，计入；后报＝被本次请求自己刚建的行挡掉，一个人都算不进）。
      // 顺序是判据成立的前提，不是偏好——改这一段顺序等于把整条排除规则作废，
      // 验法 tuzi-mobile/scripts/check-live-inviter-chain.js 第 ⑬ 组。
      Promise.resolve()
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
            add_views: addViews,
          });
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

            // 加载课程（含所属专栏）关联的打卡活动（打卡插件），决定底栏「打卡」那一枚出不出现
            that.loadCheckin(token);

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

    /**
     * 取本课程（含所属专栏）关联的打卡活动：底栏要不要出「打卡」那一枚，就看这一次请求的结果
     *
     * 两道守卫缺一不可（paid-plugins.md §4.1：插件的类文件只有装了才存在，未安装连接口都不该打）：
     * ① 打卡插件未装（含本地系统配置还没到手的 null 态）不发插件接口；
     * ② 只有已加入学习才发——「打卡」挂在已订阅态那条底栏（control 档）上，未订阅那个位置是「立即订阅」。
     * 列表同时喂底栏按钮与弹窗，不让弹窗自己再取一遍（两处各取就会出现「按钮出了、弹窗是空的」）。
     */
    loadCheckin(token) {
      if (that.getPluginInstallState("app_isinstall_checkin") !== true) return;
      if (!that.data.subscription) return;
      that.fetchCheckin(1, token);
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
        that.$nav.to(
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
                that.$nav.to(gate.column_id, "column");
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
                that.$nav.to(that.pageParams.column_id, "column");
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
