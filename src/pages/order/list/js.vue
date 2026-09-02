<script>
var that;
import order from '@/components/order/order.vue';
import course from "@/components/order/course.vue";
import evaluateItems from '../components/evaluate-items.vue';
import orderStatus from '@/common/order/status.js'
import { handleOrder } from '@/common/order/handle.js'
export default {
  components: { order, course, evaluateItems },
  data() {
    return {
      current: 0,
      tabs: [
        {
          name: '全部',
          type: ''
        },
        {
          name: '待付款',
          type: 'unpaid'
        },
        {
          name: '待发货',
          type: 'unsend'
        },
        {
          name: '待收货',
          type: 'unreceive'
        }, {
          name: '待评价',
          type: 'unevaluate'
        },
        {
          name: '售后',
          type: 'service'
        }
      ],
      form: {
        limit: 10,
        page: 1,
        status: '',
        search: '',
        search_field: 'order_no'
      },
      modal: {
        searchField: false,
        evaluate: false,
        pay: false
      },
      list: [],
      pageParams: {},

      //评价选择商品组件绑定订单Id数据
      evaluateOrderNo: '',
      //待支付的订单号
      payOrderNo: '',
      payMoney: 0,
      payIsVirtualPay: false,


      searchFieldChecked: 0,
      searchFields: [
        {
          name: '订单号',
          key: 0,
          type: 'order_no'
        },
        {
          name: '商品名称',
          type: 'item_name',
          key: 1
        }
      ]
    }
  },
  watch: {
  },
  methods: {
    //类型被切换
    searchFieldSelect(option) {
      this.searchFieldChecked = option.key;
      this.form.search_field = option.type;
      this.refresh();
    },
    getData() {
      uni.showLoading({
        title: '加载中…'
      })
      
      that.$api('order.list', that.form).then(res => {
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list
        }
        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },

    //状态被切换
    tabChange(tab, index) {
      that.current = tab.index;
      that.form.status = tab.type;
      that.refresh();
    },

    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      that.getData();
    },

    //展示弹窗
    showModal(type) {
      console.log("type", that.modal[type])
      that.modal[type] = !that.modal[type];
    },
    //评价
    orderHandle(orderIndex, type, orderNo) {
      handleOrder({
        type,
        orderNo,
        orderIndex,
        realPrice: that.list[orderIndex]?.real_price,
        context: that,
        callback: (result) => {
          switch (result.type) {
            case 'evaluate':
              that.evaluateOrderNo = result.orderNo;
              that.showModal('evaluate');
              break;
            case 'cancel':
              that.list[orderIndex].status = 'cancel';
              that.list[orderIndex].controll['cancel'] = false;
              break;
            case 'delete':
              that.list.splice(orderIndex, 1);
              break;
            case 'pay':
              that.payOrderNo = result.orderNo;
              that.payMoney = result.realPrice;
              that.payIsVirtualPay = that.list[orderIndex]?.is_virtual_pay == 1;
              that.showModal('pay');
              break;
            case 'surereceive':
              that.refresh();
              break;
          }
        }
      });
    }
  },
  onShow() {
    // that.refresh();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    //评价入口关闭时不显示"待评价"菜单
    if (that.$tools.systemConfig('evaluate_entry_status') == 'close') {
      that.tabs = that.tabs.filter((tab) => tab.type != 'unevaluate');
    }

    if (pageParams.status) {
      var tab = that.tabs[pageParams.status];
      if (tab) {
        this.current = pageParams.status;
        that.form.status = tab.type;
      }
    }

    // #ifdef H5
    this.$nav.share("订单列表");
      // #endif

    that.refresh();
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  //上划加载
  onReachBottom() {
    that.form.page++;
    that.getData();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>