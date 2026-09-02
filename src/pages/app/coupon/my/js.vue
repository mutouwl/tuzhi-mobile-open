<script>
var that;
import couponMy from "@/components/coupon/coupon-my.vue";
// import exercisesControlModal from "../components/exercises-control-modal.vue";
export default {
  components: { couponMy },
  data() {
    return {
      current: 0,
      tabs: [
        {
          name: '待使用',
          type: 'can_use'
        },
        {
          name: '已使用',
          type: 'used' 
        },
        {
          name: '已失效',
          type: 'expired'
        }
      ],
      list:[],
      form: {
        limit: 15,
        page: 1,
        order: "",
        sort: "",
        type:'can_use'
      }
    }
  },
  watch: {
  },
  methods: {

    //状态被切换
    tabChange(index) {
      that.current = index;
      that.form.type = this.tabs[index].type;
      that.refresh();
    },

    getData() {
      uni.showLoading({
        title: '加载中'
      });

      //资产类型

      that.$api('app.coupon.my', that.form).then(res => {
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
    },
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
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
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