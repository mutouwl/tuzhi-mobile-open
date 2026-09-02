<script>
import course from '@/components/order/course.vue';
import statusBar from '../components/status-bar.vue';
import evaluateItems from '../components/evaluate-items.vue';
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
    course, statusBar, evaluateItems
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
        pay: false
      },
      error: true,
      pageParams: {},
      showRefundLogBtn:false,
      loading:false
    }
  },
  computed: {
    isVirtualPay() {
      return Number(this.data && this.data.is_virtual_pay) === 1;
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
    getData() {
      that.getRefundLog();
      this.loading = true;
      this.error = true;
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
