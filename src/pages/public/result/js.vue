<script>
var that;
import courseList from "./components/course.vue"
export default {
  components:{courseList},
  data() {
    return {
      status: 'success',
      title: '成功支付',
      subtitle: '',
      btnText: '查看订单',
      order_no:'',
      orderDetail:{
        goodsList:[]
      }
    }
  },
  watch: {
  },
  methods: {
    handleBtnTap() {
      if (typeof this.btnClick === 'function') {
        this.btnClick();
      }
    },
    order(){
      uni.redirectTo({
        url:"/pages/order/detail/detail?order_no="+this.order_no
      })
    },
    getOrderDetail() {
      that.$api('order.detail', {
        order_no: that.order_no
      }).then(res => {
        if (res.code == 1) {
          that.orderDetail = res.data;
        }
      });
      uni.stopPullDownRefresh();
    },

  },
  onLoad(pageParams) {
    that = this;
    if (pageParams.status) {
      this.status = pageParams.status;
    }
    if (pageParams.order_no) {
      this.order_no = pageParams.order_no;
      this.getOrderDetail();
    }
  }
}
</script>