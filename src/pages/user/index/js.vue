<script>
var that;
import serviceModal from "@/components/modal/service-modal.vue";
import vipCard from "@/pages/user/components/vip-card.vue";
import userinfoEditModal from "@/components/modal/userinfo-edit-modal.vue";

export default {
  components: { serviceModal, vipCard,userinfoEditModal },
  data() {
    return {
      modal: {
        service: false,
        bindMobile: false,
        userinfoEdit:false
      },
      serviceConfig: false,

      userInfo: {},

      // 首屏用户信息（头像/用户名）加载中：只做首屏占位，onShow 再次拉取时不重置，
      // 否则从子页面返回/切回本页会闪一下骨架屏
      loading: true,

      pageParams: {},

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
      },
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
        {
          name: "学习中心",
          icon: "barrage",
          path: "/pages/user/study/study",
        },
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
  methods: {
    getData() {
      that.modal.userinfoEdit = false;
      that.$api("user.info.index", {}).then((res) => {
        // 先收起骨架屏再判断业务码：401（未登录）/500 也走 resolve 分支，
        // 若只在 code===1 时收起，头像处会一直停在占位块
        that.loading = false;
        if (res.code === 1) {
          that.userInfo = res.data;
          that.assetsNav.money.value = res.data.money;
          that.assetsNav.coupon.value = res.data.coupon_num;
          that.assetsNav.score.value = res.data.score;

          uni.setStorageSync("user_token", res.data.token);

          if(res.data.update_info_modal == 1){
            that.modal.userinfoEdit = true;
          }
        }
      }).catch(() => {
        // 网络异常/非 200 会 reject，同样要收起骨架屏，回落为「-」与空头像
        that.loading = false;
      });

      that.getServiceConfig();
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
      } else {
        that.$nav.to("/pages/user/assets/assets?type=" + type);
      }
    },

    //刷新
    refresh() {
      that.form.page = 1;
      that.list = [];
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
  },
  onShow(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    this.getData();
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
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
};
</script>
