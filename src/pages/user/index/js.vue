<script>
var that;
import serviceModal from "@/components/modal/service-modal.vue";
import vipCard from "@/pages/user/components/vip-card.vue";
import userinfoEditModal from "@/components/modal/userinfo-edit-modal.vue";
import { buildDecorate, vipEntryOpen } from "./decorate.js";

export default {
  components: { serviceModal, vipCard,userinfoEditModal },
  data() {
    // 「学习中心」这一个去处只存一份定义：资产管理下方那张卡与「常用功能」清单的第一项共用同一对象
    const studyCenter = {
      name: "学习中心",
      icon: "barrage",
      path: "/pages/user/study/study",
    };
    return {
      modal: {
        service: false,
        bindMobile: false,
        userinfoEdit:false
      },
      serviceConfig: false,

      userInfo: {},

      // 首屏用户信息（头像/用户名）加载中：只做首屏占位，后续重取（登录成功那次 / 下拉刷新）不重置，
      // 否则重取会把已经显示着的头像换成占位块、闪一下骨架屏
      loading: true,

      // 本页「取过没有」与「上一次取数时用的是哪一枚 token」。
      // 2026-10-05 起本页不再每次 onShow 都重取（用户点名「也不用每次切换我的页面都要触发刷新」），
      // 只有三种情况才取：① 页面实例第一次进来 ② 身份变了（登录成功 / 换号 / 退出后重登）
      // ③ 用户下拉刷新。子页退回、页签来回切都直接显示手上已有的数据。
      // 判据用 token 而不是单纯的布尔：user/info 每次返回都带一枚新 token 并写回本地，
      // 这里记的就是写回的那一枚——同一个人再进来两枚相等（不取），换了人就不同（立刻取）。
      // 取失败不记（见 getData 的 catch）：首屏那一趟失败下一次进来还会重试，不会卡在空骨架上
      fetched: false,
      fetchedToken: "",

      pageParams: {},

      // 个人中心装修（后台「店铺装修 > 个人中心」）：接口未返回或商家没装修时，
      // 下面全部保持默认值，页面即走本文件里写死的老结构
      decorateLoading: true,
      showAssets: true,
      showFunctions: true,
      vipEntryInHeader: true,
      functionStyle: "grid",

      // 资产管理下方的「学习中心」卡（显隐由后台「店铺装修 > 个人中心」下发，未装修时默认显示）
      showStudyCenter: true,
      studyCenter: studyCenter,
      // 累计学习分钟数：null＝还没到手（在取或已失败），到手后即使是 0 也照实显示
      studyMinutes: null,
      studyLoading: true,

      assetsNav: {
        money: {
          name: "余额",
          type: "money",
          icon: "people",
          value: "0",
        },
        score: {
          name: "积分",
          type: "score",
          icon: "people",
          value: "0",
        },
        coupon: {
          name: "优惠券",
          type: "coupon",
          icon: "people",
          value: "0",
        },
        // 「我的奖品」（2026-10-03）：奖品能力已升入标准版，跨业务发来的奖都进这一格，
        // 不再受分享有礼安装态管辖，所以直接进初始表（原先是 onLoad 里按 isInstall 装进来的，
        // 骨架屏那一格也才要单独算个数）。数值随 user/info 的 prize_num 同一包到
        // （2026-10-05 加速这一格），不再另发一次请求；字段不在才走 getPrizeCount 兜底补取。
        prize: {
          name: "我的奖品",
          type: "prize",
          value: "0",
        },
      },

      // prizeSk＝奖品数还在取，那一格盖灰块；取失败/没有数据落成 0，不摆「-」
      // （这枚数随 user/info 同一包到，灰块与其余三格一起撤；prizeLoading 只给兜底补取那一路）
      prizeSk: true,
      prizeLoading: false,

      orderNav: [
        {
          name: "待付款",
          icon: "daifukuan",
          path: "/pages/order/list/list?status=1",
        },
        {
          name: "待发货",
          icon: "daifahuo",
          path: "/pages/order/list/list?status=2",
        },
        {
          name: "待收货",
          icon: "daishouhuo",
          path: "/pages/order/list/list?status=3",
        },
        {
          name: "待评价",
          icon: "dianzan",
          path: "/pages/order/list/list?status=4",
        },
        {
          name: "售后",
          icon: "shouhou",
          path: "/pages/order/list/list?status=5",
        },
      ],
      controllNav: [
        studyCenter,
        {
          name: "我的订阅",
          icon: "task",
          path: "/pages/user/subscription/subscription",
        },
        {
          name: "我的收藏",
          icon: "like",
          path: "/pages/user/collect/collect",
        },
        // #ifndef MP-TOUTIAO
        {
          name: "分销中心",
          icon: "jiagoufenxiao",
          path: "/pages/app/agent/center/center",
        },
        // #endif
        {
          name: "兑换码",
          icon: "flashlight",
          path: "/pages/app/exchange/center/center",
        },
        {
          name: "每日签到",
          icon: "flag",
          path: "/pages/app/sign/center/center",
        },
        {
          name: "积分商城",
          icon: "service",
          path: "/pages/app/score/center/center",
        },
        {
          name: "练习",
          icon: "brush",
          path: "/pages/app/exam/center/center",
        },
        {
          name: "活动票券",
          icon: "qrcode",
          path: "/pages/app/activity/user/user",
        },

        {
          name: "联系客服",
          icon: "customerservice",
          path: "service",
        },
        {
          name: "收货地址",
          icon: "coordinates",
          path: "/pages/user/address/list/list",
        },
        {
          name: "设置",
          icon: "shezhi",
          path: "/pages/user/setting/setting",
        },
      ],
    };
  },
  watch: {},
  computed: {
    // 资产项被隐藏后 col 要跟着缩，否则剩余项会被三等分挤出空档
    assetCol() {
      var count = Object.keys(this.assetsNav).length;
      return count > 0 ? count : 1;
    },
    assetCount() {
      return Object.keys(this.assetsNav).length;
    },
    /**
     * 首屏骨架屏摆几格
     *
     * 装饰配置要收掉几枚得等接口回来才知道，而骨架屏得先把位置占住，所以按**装修配置里可能有的
     * 最多那一档**摆——多摆的那几格会被随后到达的真实行接管，加载完不跳格也不留空档。
     * 2026-10-03：「我的奖品」进了初始表（不再是插件项），这一档从 3/4 二选一变回恒定 4。
     */
    assetSkCount() {
      return 4;
    },
    /**
     * 抖音小程序下 u-grid 要 display:block 才能正常换行。
     * 条件编译放在这里，模板里同一枚 <u-grid> 就能服务三端 —— 原先在模板里为两个分支各写一个
     * 开标签、共用一个闭标签，Vue 解析器直接报「Element is missing end tag」。
     *
     * 必须返回对象，不能返回空串：u-grid 内部是 uni.$u.deepMerge(style, uni.$u.addStyle(customStyle))，
     * 而 deepMerge 的 source 是字符串时直接返回 false，:style 拿到 false 等于不生效 ——
     * 组件样式表里 .u-grid 的 justify-content:center 就会盖掉 align 默认的 flex-start，
     * 「常用功能」不满 5 项的末行会被整组居中（看着像水平分布）。
     */
    gridCustomStyle() {
      // #ifdef MP-TOUTIAO
      return { display: "block", justifyContent: "flex-start" };
      // #endif
      // #ifndef MP-TOUTIAO
      return { justifyContent: "flex-start" };
      // #endif
    },
    /**
     * 学习中心卡上那一句时长（接口只回分钟，喂给共用的 $tools.formatStudyTime 前换回秒）
     *
     * 几百分钟读「387 分钟」不直观，交出去就是「6 小时 27 分钟」；不足一小时仍回「45 分钟」，
     * 口径与学习数据页的「学习用时」同一份。
     */
    studyTimeText() {
      if (this.studyMinutes === null) {
        return "";
      }
      return this.$tools.formatStudyTime(this.studyMinutes * 60);
    },
  },
  methods: {
    getData() {
      that.modal.userinfoEdit = false;
      that.$api("user.info.index", {}).then((res) => {
        // 先收起骨架屏再判断业务码：401（未登录）/500 也走 resolve 分支，
        // 若只在 code===1 时收起，头像处会一直停在占位块
        that.loading = false;
        if (res.code === 1) {
          that.userInfo = res.data;
          // 资产项可能被装修配置隐藏，逐项判存在再回填
          if (that.assetsNav.money) that.assetsNav.money.value = res.data.money;
          if (that.assetsNav.coupon) that.assetsNav.coupon.value = res.data.coupon_num;
          if (that.assetsNav.score) that.assetsNav.score.value = res.data.score;
          // 「我的奖品」同一包里到（2026-10-05 加速这一格）。原先它自己另发一次
          // prize/prize/prizeCount，四格里它必然晚一整个往返，骨架灰块要比其余三格晚一拍才撤；
          // 现在四格同一拍落。字段不在（后端比本端安装包旧）才补发那一次，见 getPrizeCount。
          if (that.assetsNav.prize) {
            if (res.data.prize_num === undefined || res.data.prize_num === null) {
              that.getPrizeCount();
            } else {
              that.prizeSk = false;
              that.assetsNav.prize.value = res.data.prize_num;
            }
          }

          uni.setStorageSync("user_token", res.data.token);
          // 记下「手上这批数据是拿哪一枚 token 取的」，onShow 靠它判身份有没有变（见 data 里的注释）。
          // 记的就是写回本地的那一枚，所以同一个人下一次进来相等、不会再取一次
          that.fetched = true;
          that.fetchedToken = res.data.token;

          if(res.data.update_info_modal == 1){
            that.modal.userinfoEdit = true;
          }
        }
        // 下拉刷新的收条等这一趟有回音（M4），否则用户看不出刷新有没有结果。
        // 401/500 也走到这一行：失败同样要收起转圈，否则拉不下去
        uni.stopPullDownRefresh();
      }).catch(() => {
        // 网络异常/非 200 会 reject，同样要收起骨架屏，回落为「-」与空头像
        that.loading = false;
        // 取失败不记 fetched/fetchedToken：首屏那一趟要是失败，页面还停在空骨架上，
        // 下一次 onShow 还会重试，不会卡在骨架屏里出不来（已经取过一次之后失败不算，
        // 手上那批数据还摆着，用户下拉能再来一次，不必每次切页签都对着一挂掉的接口重试）
        // 这一格也是：不摆「-」，落 0，并收掉它自己的灰块
        that.prizeSk = false;
        if (that.assetsNav.prize) {
          that.assetsNav.prize.value = 0;
        }
        uni.stopPullDownRefresh();
      });

      that.getServiceConfig();
      // 卡片被装修关掉时不必再去取那一句分钟数
      if (that.showStudyCenter) {
        that.getStudyTime();
      }
    },

    /**
     * 可领奖品数的兜底补取（只在 user/info 没带 prize_num 这枚字段时才发）
     *
     * 正常路径不走这里：奖品数随 user/info 一起回来（2026-10-05 加速这一格）。
     * 留着这一只为「新客户端配旧后端」——已发布的老安装包调的还是 prize/prize/prizeCount，
     * 那个口后端一直保留着，两种形态各调一处但取的是同一个后端口径。
     *
     * 口径＝未领取且未过期，领一枚少一枚。失败/没有数据落成 0，不摆「-」。
     */
    getPrizeCount() {
      // 同一时刻只飞一只；这一格被装饰配置收起时（assetsNav 里已经没有它）整件事不发生
      if (that.prizeLoading || !that.assetsNav.prize) {
        return;
      }
      that.prizeLoading = true;
      that.$api("prize.prize.count", {}).then((res) => {
        that.prizeLoading = false;
        // 装饰配置可能在这一格在飞的时候把这一项收掉，写之前判一次存在
        if (!that.assetsNav.prize) {
          return;
        }
        if (res && res.code === 1 && res.data) {
          that.prizeSk = false;
          that.assetsNav.prize.value = res.data.total || 0;
        } else {
          that.prizeSk = false;
          that.assetsNav.prize.value = 0;
        }
      }).catch(() => {
        that.prizeLoading = false;
        that.prizeSk = false;
        if (that.assetsNav.prize) {
          that.assetsNav.prize.value = 0;
        }
      });
    },

    /**
     * 获取累计学习分钟数（学习中心卡上那一句说明）
     *
     * 失败或没有这一项数据时整句收掉，不把没给到的数摆成 0；入口本身常驻，
     * 点进去仍是学习数据页，所以不弹提示打扰（M13 的出口由这一行的缺席给）。
     */
    getStudyTime() {
      that.$api("study.getStudyTime", {}).then((res) => {
        that.studyLoading = false;
        if (!res || res.code !== 1 || !res.data) {
          return;
        }
        that.studyMinutes = res.data.study_minutes;
      }).catch(() => {
        that.studyLoading = false;
      });
    },

    /**
     * 获取客服信息
     */
    getServiceConfig() {
      that.$api("config.service", {}).then((res) => {
        if (res.code === 1) {
          that.serviceConfig = res.data;
        }
      });
    },

    /**
     * 获取个人中心装修配置
     *
     * 商家没装修（config 为 null）与请求失败都走同一件事：保持本文件里写死的老结构。
     * 这里不弹提示——没装修是正常状态，天天报错反而扰民。
     */
    getDecorate() {
      const vm = this;
      vm.$api("page.userCenter.getConfig", {})
        .then((res) => {
          vm.decorateLoading = false;
          if (!res || res.code !== 1 || !res.data || !res.data.config) {
            return;
          }
          const patch = buildDecorate(
            res.data.config,
            res.data.options,
            vm.assetsNav,
            (key) => vm.$tools.systemConfig(key)
          );
          Object.assign(vm, patch);
        })
        .catch(() => {
          vm.decorateLoading = false;
        });
    },

    toAssets(type) {
      if (type == "coupon") {
        that.$nav.to("/pages/app/coupon/my/my");
      } else if (type == "money") {
        // #ifdef MP-WEIXIN
        that.$nav.to("/pages/user/assets/assets?type=money");
        // #endif
        // #ifndef MP-WEIXIN
        that.$nav.to("/pages/user/balance/index");
        // #endif
      } else if (type == "prize") {
        // 奖品页是标准版页面（pages/user 分包），插件未装也在——奖品能力本身不是某个插件的私有物
        that.$nav.to("/pages/user/prize/index");
      } else {
        that.$nav.to("/pages/user/assets/assets?type=" + type);
      }
    },

    //刷新（下拉刷新 onPullDownRefresh 走这一条）
    // 这一屏没有分页列表，直接重取一次即可。原来还照着列表页写了 `that.form.page = 1`
    // 与 `that.list = []`，但本页 data() 里根本没有 form / list 两个字段——它从落地起就没被调用过，
    // 一接上下拉刷新就会在第一行抛 undefined.page，接线前先删掉这两行
    refresh() {
      that.getData();
    },

    nav(path) {
      if (path == "service") {
        //客服弹窗
        this.modal.service = true;
      } else {
        uni.navigateTo({
          url: path,
        });
      }
    },

    /**
     * 列表版式的功能入口图标字号
     *
     * 清单里带 size 的项是满幅字形（同字号下墨迹比其余图标大一圈，如「教务中心」peixun 墨迹 1024/1024，
     * 见后端 UserCenterMenu 注释），其 size 是按宫格档 28px 实测墨迹给的；
     * 列表档整体缩到 18px，这些项要按同一比例缩放，否则列表里会凸出一枚明显偏大的图标。
     */
    listIconSize(item) {
      const listSize = 18;
      const gridSize = 28;
      return item && item.size ? Math.round((item.size * listSize) / gridSize) : listSize;
    },
  },
  onShow(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    // 只在这两种情况下取：页面实例第一次进来（首屏）、身份变了（登录成功 / 换号 / 退出后重登）。
    // 从子页面退回、页签来回切都直接显示手上已有的数据，不再每次 onShow 都发一轮请求
    // （2026-10-05 用户点名「也不用每次切换我的页面都要触发刷新」）。
    // 想拿最新的余额/奖品/优惠券，用户下拉刷新——onPullDownRefresh 那一支。
    // 代价要说明白：从奖品页领完奖退回、设置里改完头像退回，这一屏要下拉才更新。
    const token = uni.getStorageSync("user_token") || "";
    if (!that.fetched || that.fetchedToken !== token) {
      that.getData();
    }
  },
  onPullDownRefresh() {
    // 下拉刷新的收条由 getData 里那两句 uni.stopPullDownRefresh 收（等有回音再收，M4）
    that.refresh();
  },
  onLoad() {
    var that = this;

    //评价入口关闭时不显示"待评价"入口
    if (that.$tools.systemConfig("evaluate_entry_status") == "close") {
      that.orderNav = that.orderNav.filter((item) => item.name != "待评价");
    }

    if (that.$tools.systemConfig("app_isinstall_test")) {
      that.controllNav.splice(8, 0, {
        name: "考试",
        icon: "document",
        path: "/pages/app/test/log/log",
      });
    }

    if (that.$tools.systemConfig("app_isinstall_cert")) {
      that.controllNav.splice(10, 0, {
        name: "我的证书",
        icon: "headlines",
        path: "/pages/app/cert/index/index",
      });
    }

    // 「我的奖品」落个人中心的「资产管理」（形态同余额/积分/优惠券），不落「常用功能」：
    // 常用功能是纯入口清单，这一项要带一个会变的数值，属于「资产管理」那一档。
    // 2026-10-03 起它**不再是分享有礼的私有项**：奖品能力已升入标准版，跨业务发来的奖都在这一格里，
    // 所以装进初始表、不再看 app_isinstall_share_gift（没装分享有礼也照样显示 0）。
    // 数值随 user/info 的 prize_num 一并下发（2026-10-05 加速这一格），不再另发一次请求。
    that.assetsNav.prize = {
      name: "我的奖品",
      type: "prize",
      value: "0",
    };

    if (that.$tools.systemConfig("app_isinstall_form")) {
      that.controllNav.splice(10, 0, {
          name: "表单",
          icon: "activity",
          path: "/pages/app/form/log/log",
        });
    }

    if (that.$tools.systemConfig("app_isinstall_circle")) {
      that.controllNav.splice(1, 0, {
        name: "我的圈子",
        icon: "group",
        path: "/pages/app/circle/my/index",
      });
    }

    if (that.$tools.systemConfig("app_isinstall_checkin")) {
      that.controllNav.splice(2, 0, {
        name: "我的打卡",
        icon: "task",
        path: "/pages/app/checkin/index/index",
      });
    }

    if (that.$tools.systemConfig("app_isinstall_school")) {
      // 教务模块在个人中心只保留一个聚合入口，内部功能进入"教务中心"聚合页
      // icon 用 peixun（日历）：与教务中心页「我的课表」同一字形，两处入口视觉统一；
      // 教务专用字形（jiaowu/xuexiao/kebiao/banjiguanli）在 css 里有规则但 ttf 缺字形会渲染空白；
      // size 是按墨迹实测给的——本网格其余入口在 28px 字号下墨迹 19~23px，而满幅字形（peixun 墨迹 1024/1024）
      // 同字号会到 28px，明显大一圈，故取 21px 字号（墨迹 21.0px，正中网格中位）
      that.controllNav.splice(1, 0, {
        name: "教务中心",
        icon: "peixun",
        size: 21,
        path: "/pages/app/school/index/index",
      });
    }

    // 未开通会员功能的店铺看不到这一项（与 vip-card 组件同一判据）
    if (vipEntryOpen((key) => that.$tools.systemConfig(key))) {
      that.controllNav.splice(1, 0, {
        key: "vip",
        name: "会员中心",
        icon: "huiyuan",
        path: "/pages/app/vip/center/center",
      });
    }

    that.getDecorate();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
};
</script>
