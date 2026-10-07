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
      // 首屏即为加载态：列表与汇总区先铺骨架屏（M16），撤骨架屏等本页这次要的数据全部回音
      loading: true,
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

      //资产类型
      var form = JSON.parse(JSON.stringify(that.form));

      form.uid = that.pageParams.uid;
      form.time = Math.round(that.form.time/1000);

      // 骨架屏收口：本页同时发列表 / 汇总 /（按客户查看时）详情，三者全部回音才撤骨架屏，
      // 早撤会在汇总还是空对象时露出 '-'（与分销中心页同一口径）；单路失败不拖住其余
      var jobs = [
        that.$api('app.agent.order.getOrderList', form).then(res => {
          if (res.code === 1) {
            var list = that.list;
            for (var i in res.data) {
              list.push(res.data[i])
            }
            that.list = list
          }
        }),
        that.getTotal()
      ];
      if (that.pageParams.uid) {
        jobs.push(that.getCustomerDetail());
      }
      Promise.all(jobs.map(job => job.catch(() => null))).then(() => {
        that.loading = false;
      });
      uni.stopPullDownRefresh();
    },

    getTotal() {


      return that.$api('app.agent.order.getTotal', {
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
      
      return that.$api('app.agent.customer.getCustomerDetail', {
        user_id:that.pageParams.uid
      }).then(res => {
        if (res.code === 1) {
          that.customerDetail = res.data
        }
      });
    },

    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      // 切页签/状态/时间会清空列表，loading 置回 true 才不换成一帧空态（M16）
      that.loading = true;
      that.getData();
    },

  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);;

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