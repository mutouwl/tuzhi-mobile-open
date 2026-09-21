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
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
};
</script>
