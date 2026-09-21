<script>
var that;
export default {
  data() {
    return {
      form: {
        limit: 15,
        page: 1,
        time: Number(new Date()),
        status: 0,
        type: 'commission'
      },
      list: [],
      pageParams: {
        uid: 0
      },
      modal:{
        time:false
      },
      typeList: [
        {
          name: '商品佣金',
          type: 'commission'
        },
        {
          name: '邀请人奖励',
          type: 'subordinate'
        }
      ],
      checkTab: 'article',

      total:{},

      customerDetail:{
        user:''
      },
      statusList: ['全部', '待结算', '已结算', '无效']
    }
  },
  watch: {
  },
  methods: {



    //时间
    confirmTime(time){
      
      that.showModel('time')

      if(time != that.form.time){
        that.form.time = time.value;
        that.refresh();
      }
      
    },

    showModel(type){
      this.modal[type] = !this.modal[type]
    },

    typeChange(value) {
      this.form.status = 0;
      this.form.type = value.type;
      this.refresh();
    },

    statusChange(value) {
      this.form.status = value;
      this.refresh();
    },


    getData() {

      uni.showLoading({
        title: '请稍后'
      });
      that.getTotal();
      //资产类型
      var form = JSON.parse(JSON.stringify(that.form));

      form.uid = that.pageParams.uid;
      form.time = Math.round(that.form.time/1000);

      
      that.$api('app.agent.order.getOrderList', form).then(res => {
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

    getTotal() {


      that.$api('app.agent.order.getTotal', {
        type:that.form.type
      }).then(res => {
        if (res.code === 1) {
          that.total = res.data;
        }
      });
    },


    /**
     * 获取下级详情
     */
    getCustomerDetail() {
      
      uni.showLoading({
        title: '请稍后'
      });
      that.$api('app.agent.customer.getCustomerDetail', {
        user_id:that.pageParams.uid
      }).then(res => {
        if (res.code === 1) {
          that.customerDetail = res.data
        }
        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },

    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      that.getData();
    },

  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);;

    if(that.pageParams.uid){
      that.getCustomerDetail()
    }

    this.getData();
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
}
</script>