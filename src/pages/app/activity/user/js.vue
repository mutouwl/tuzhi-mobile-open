<script>
var that;
export default {
  components: {},
  data() {
    return {
      form: {
        limit: 15,
        page: 1,
        group: 0,
        search: '',
        order: '',
        status:'',
        sort: ''
      },
      current: 0,
      tabs: [
        {
          name: '全部',
          type: ''
        },
        {
          name: '待使用',
          type: 1
        },
        {
          name: '已签到',
          type: 2
        },
        {
          name: '待审核',
          type: 3
        },
        {
          name: '作废',
          type: 4
        }
      ],
      list: [],
      modal: {
        info: false
      },
      otherIndex: ''
    }
  },
  watch: {
  },
  methods: {

    isVirtualPay(item) {
      return Number(item && item.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },

    //状态被切换
    tabChange(tab) {
      that.current = tab.index;
      that.form.status = tab.type;
      that.refresh();
    },

    getData() {
      uni.showLoading({
        title: '请稍后'
      });
      //资产类型

      that.$api('app.activity.ticket.getUserTicket', that.form).then(res => {
        if (res.code === 1) {
          var list = that.list;

          if (that.form.page == 1) {
            list = [];
          }
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list;
        }

        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },
    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      uni.showLoading({
        title: '请稍后'
      });
      that.getData();
    }
  },
  onLoad(pageParams) {
    that = this;
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