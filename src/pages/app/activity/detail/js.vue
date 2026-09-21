<script>
var that;
import shareModal from "@/components/modal/share-modal.vue";
import banner from '@/components/course/banner.vue';
import liveStartTimeBar from "@/components/course/live-start-time-bar.vue";
import couponGoodsBar from "@/components/coupon/coupon-goods-bar.vue";
export default {
  components: { shareModal, banner, liveStartTimeBar,couponGoodsBar },
  data() {
    return {
      loading: true,
      data: {},
      pageParams: {},
      bindCoutseList: []
    }
  },
  watch: {
  },
  methods: {
    isVirtualPay(goods) {
      return Number(goods && goods.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },

    hasPrice(price) {
      return price !== undefined && price !== null && price !== '';
    },

    formatPrice(price, goods) {
      return this.isVirtualPay(goods) ? (price || 0) + (this.$tools.systemConfig('coin_name') || '金币') : '¥' + price;
    },

    getData() {
      clearInterval(that.studyTime);
      that.loading = true;

      that.tabs = [];
      that.$api('app.activity.detail', {
        id: this.pageParams.id
      }).then(res => {
        uni.stopPullDownRefresh();
        if (res.code === 1) {

          that.data = res.data;

          // #ifdef H5
          this.$nav.share(res.data.name, '', res.data.cover);
          // #endif

          that.getBindCourse();


          that.loading = false;
        } else {
          uni.showModal({
            title: '提示',
            content: res.msg,
            complete: function (res) {
              that.$nav.back();
            }
          });
        }
      });

    },
    //刷新
    refresh() {
      this.getData();
    },

    apply() {
      that.$api('app.activity.course.check', {
        activity_id: that.pageParams.id
      }).then(ret => {
        if (ret.code === 1) {
          that.$nav.to('/pages/app/activity/ticket/ticket?id=' + that.pageParams.id);
        }else{
          uni.$u.toast(ret.msg);
        }
      });
      
    },


    /**
      * 获取课程所属的专栏
    */
    getBindCourse() {
      var that = this;
      that.$api('app.activity.course.list', {
        activity_id: that.pageParams.id
      }).then(ret => {
        if (ret.code === 1) {
          this.bindCoutseList = ret.data;
        }
      });
    }
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  onShow() {
    that.refresh();
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
