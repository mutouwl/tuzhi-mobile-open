<script>
import course from '@/components/order/course.vue';
import statusBar from '../components/status-bar.vue';
import evaluateItems from '../components/evaluate-items.vue';
import PackageGoodsCard from '@/components/tz/package-goods-card.vue';
import orderStatus from '@/common/order/status.js'
import { handleOrder } from '@/common/order/handle.js'
var that;
// #ifdef MP-TOUTIAO
import i18n from '@/components/language/index.js';
// #endif
export default {
  // #ifdef MP-TOUTIAO
  i18n,
  // #endif
  components: {
    course, statusBar, evaluateItems, PackageGoodsCard
  },
  data() {
    return {
      labelWidth: 70,
      labelStyle: {
        'text-align': 'right'
      },
      showSex: false,
      form: {
        limit: 2,
        page: 1
      },
      list: [],
      pageParams: {},

      data: {},
      modal: {
        evaluate: false,
        pay: false,
        enroll: false
      },
      enrollInfo: {},
      enrollLoading: false,
      error: true,
      pageParams: {},
      showRefundLogBtn:false,
      loading:true
    }
  },
  computed: {
    isVirtualPay() {
      return Number(this.data && this.data.is_virtual_pay) === 1;
    },
    //教务（课程套餐）订单显示报名信息入口
    isSchoolOrder() {
      return this.data && this.data.order_type === 'school_package';
    },
    //底部操作卡是否有可展示的按钮：报名信息（教务订单）/ 退款记录 / 订单状态操作（评价、取消、支付、物流等）。
    //一个都没有时整张卡片不渲染，避免详情页底部出现空白卡片
    hasOrderAction() {
      if (this.isSchoolOrder || this.showRefundLogBtn) return true;
      const controll = (this.data && this.data.controll) || {};
      return Object.keys(controll).some(key => !!controll[key]);
    },
    //报名信息弹窗商品卡是否可跳转套餐详情（后台开课无套餐，未安装教务插件不可跳）
    canGoPackage() {
      return Number(this.enrollInfo && this.enrollInfo.package_id) > 0 && this.$tools.systemConfig('app_isinstall_school');
    }
  },

  methods: {
    subGoodsTypeName(type) {
      const map = { course: '视频', audio: '音频', article: '图文', live: '直播', vipcard: '会员卡', exercises: '练习', column: '专栏', physical: '实物商品' };
      return map[type] || type;
    },
    subGoodsValidity(item) {
      const v = item.validity_type, val = item.validity_value;
      if (v == 2) return '长期有效';
      if (v == 3) return '购买后' + (val || 30) + '天有效';
      if (v == 4) return '至' + (val || '');
      return '';
    },
    formatDiscountPrice(price) {
      return this.isVirtualPay ? '-' + (price || 0) + (that.$tools.systemConfig('coin_name') || '金币') : '-¥' + (price || 0);
    },
    //展示弹窗
    modelShow(type) {
      that.modal[type] = !that.modal[type];
    },

    //查看报名信息（教务订单）
    openEnroll() {
      that.enrollInfo = {};
      that.enrollLoading = true;
      that.modal.enroll = true;
      that.$api('school.order.detail', {
        order_no: that.data.order_no
      }).then(res => {
        that.enrollLoading = false;
        if (res.code == 1) {
          that.enrollInfo = res.data || {};
        } else if (res.code != 401) {
          //失败时拦截器已提示，仅关闭弹层
          that.modal.enroll = false;
        }
      }).catch(() => {
        that.enrollLoading = false;
        that.modal.enroll = false;
      });
    },

    //报名信息弹窗商品卡片 → 套餐详情页（与订单商品卡片同口径，未安装教务插件时不跳转）
    goPackage() {
      if (!that.canGoPackage) return;
      that.$nav.to('/pages/app/school/package/detail/detail?id=' + that.enrollInfo.package_id, 'local');
    },

    //报名信息弹窗校区行 → 校区详情页（同请假详情/课次详情「校区」行口径；校区已删除时 campus_id=0 不跳转）
    goCampus() {
      if (!that.enrollInfo.campus_id) return;
      that.$nav.to('/pages/app/school/campus/detail/detail?id=' + that.enrollInfo.campus_id, 'local');
    },

    //报名信息弹窗 → 教务中心聚合页（先关弹层，避免返回时仍停留在报名信息弹窗上）
    goSchoolCenter() {
      that.modal.enroll = false;
      that.$nav.to('/pages/app/school/index/index', 'local');
    },

    getData() {
      that.getRefundLog();
      this.loading = true;
      // 首次加载（还没有订单数据）才回到骨架/空态；onShow、支付回调后的刷新静默更新已有内容，不再闪骨架
      if (!that.data || !that.data.order_no) {
        this.error = true;
      }
      that.$api('order.detail', {
        order_no: that.pageParams.order_no
      }).then(res => {
        this.loading = false;
        if (res.code == 1) {
          that.data = res.data;
          this.error = false;
        } else if (res.code == 401) {
          this.error = false;
        } else {
          uni.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false,
            success: function () {
              that.$nav.to('/pages/order/list/list', 'local', 'redirectTo');
            }
          });
        }

      }).catch(() => {
        // 接口异常/未登录被拦截时释放骨架屏，避免首次进入永久停在占位态
        this.loading = false;
      });
      uni.stopPullDownRefresh();
    },

    payHandle(payType, result) {
      if (payType == 'balance' && result.code == 1) {
        that.refresh();
      }
    },

    /**
     * 获取退款记录
     */
    getRefundLog() {
      that.$api('order.service.refundLog', {
        order_no: that.pageParams.order_no,
        limit:1
      }).then(res => {
        if (res.code === 1) {
          if(res.data.length > 0){
            that.showRefundLogBtn = true;
          }
        }

        uni.hideLoading();
      });
    },


    //刷新
    refresh() {
      that.getData();
    },

    //评价
    orderHandle(type) {
      handleOrder({
        type,
        orderNo: that.data.order_no,
        context: that,
        callback: (result) => {
          switch (result.type) {
            case 'evaluate':
              that.evaluateOrderNo = result.orderNo;
              that.modelShow('evaluate');
              break;
            case 'cancel':
              that.getData();
              break;
            case 'delete':
              uni.navigateBack({
                delta: 1
              });
              break;
            case 'pay':
              that.payOrderNo = result.orderNo;
              that.modelShow('pay');
              break;
            case 'surereceive':
              that.getData();
              break;
          }
        }
      });
    }
  },
  onShow() {
    that.getData()
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    // this.getData();
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>
