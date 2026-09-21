<script>
var that;
export default {
  components:{},
  data() {
    return {
      status: 'success',
      title: '签到成功',
      subtitle: '若会场有签到入场要求，请在进入会场前，将此页面展示给工作人员入场',
      btnText: '我的票券',
      data:{}
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
    getTicketDetail() {
      that.loading = true;

      that.tabs = [];
      that.$api('app.activity.ticket.getDetail', {
        ticket_no: this.ticket_no
      }).then(res => {
        uni.stopPullDownRefresh();

        that.data = res.data;

        this.loading = false;
      });
    }

  },
  onLoad(pageParams) {
    that = this;
    this.ticket_no = pageParams.ticket_no;
      this.getTicketDetail();
  }
}
</script>