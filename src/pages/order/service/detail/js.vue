<script>
import course from "@/components/order/course.vue";
import statusBar from '@/pages/order/components/status-bar.vue';

var that;

// #ifdef MP-TOUTIAO
import i18n from '@/components/language/index.js';
// #endif
export default {
  // #ifdef MP-TOUTIAO
  i18n,
  // #endif
  components: {
    course, statusBar
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
      statusCode: 0,
      reasonOption: [],
      statusTip: {

        '0': {
          title: '非售后状态',
          describe: '',
          img: ''
        },
        '1': {
          title: '申请中',
          describe: '售后正在处理，请耐心等待',
          img: 'unpaid'
        },
        '2': {
          title: '售后完成',
          describe: '资金将原路返还至支付账户，请耐心等待到账',
          img: 'paid'
        },
        '3': {
          title: '拒绝退款',
          describe: '商家拒绝退款，如有疑问请联系客服',
          img: 'cancel'
        }
      },
      service_detail: {}
    }
  },
  computed: {

  },

  methods: {
    //展示弹窗
    modelShow(type) {
      that.modal[type] = !that.modal[type];
    },
    getData() {

      this.error = true;
      that.$api('order.detail', {
        order_no: that.pageParams.order_no
      }).then(res => {
        if (res.code == 1) {
          that.data = res.data;
          that.error = false;

          if(res.data.service == 0){
            that.$nav.to('/pages/order/list/list','local','redirectTo');
            that.$u.toast("非售后订单");
            return false;
          }

          that.getRefundReason();
          that.getServiceDetail();
        } else {
          uni.showModal({
            title: '提示',
            content: res.msg,
            success: function (res) {
              uni.navigateBack({
                delta: 1
              })
            }
          });
        }

      });
      uni.stopPullDownRefresh();
    },

    getServiceDetail() {
      that.$api('order.service.detail', {
        order_no: that.pageParams.order_no
      }).then(res => {
        if (res.code == 1) {
          that.service_detail = res.data;
        }

      });
      uni.stopPullDownRefresh();
    },

    //刷新
    refresh() {
      that.getData();
    },
    //撤销售后申请
    cancel() {
      uni.showModal({
        title: '提示',
        content: '确定要撤销售后申请吗',
        success: function (res) {
          if (res.confirm) {
            that.$api('order.service.cancel', {
              order_no: that.pageParams.order_no
            }).then(res => {
              that.refresh();
              that.$u.toast(res.msg);
            });
          }
        }
      });
    },
    /**
     * 获取退款原因
     */
    getRefundReason() {
      var reasonOption = [];
      that.$api('order.service.reason', {}).then(res => {
        for (var i in res.data) {
          reasonOption.push({
            name: res.data[i],
            id: i
          })
        }

        this.reasonOption = reasonOption;
      });
      uni.stopPullDownRefresh();
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
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}

</script>