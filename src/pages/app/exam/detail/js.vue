<script>
var that;
import exercisesControlModal from "../components/exercises-control-modal.vue";
import couponGoodsBar from "@/components/coupon/coupon-goods-bar.vue";
import bindCourseList from "@/components/course/bind-course-list.vue";
export default {
  components: {
    exercisesControlModal,
    couponGoodsBar,
    bindCourseList
  },
  data() {
    return {
      data: {
        course: false
      },
      modal: {
        exercisesControl: false
      },
      pageParams: {}
    }
  },
  watch: {
  },
  methods: {
    isVirtualPay(goods) {
      return Number(goods && goods.is_virtual_pay) === 1 && uni.getStorageSync("platform") === "wxMiniProgram";
    },


    /**
   * 订阅练习
   */
    subscription() {
      //判断购买方式、单独购买、购买专栏
      var goodsList = [
        {
          goodsId: that.data.id,
          goodsType: 'exercises',
          count: 1
        }
      ];
      that.$nav.to('/pages/order/submit/submit?type=exercises&goodsList=' + JSON.stringify(goodsList));
    },

    //获取练习详情
    getData() {
      uni.showLoading({
        title: '请稍后'
      });

      that.$api('app.exam.exercises.detail', {
        id: that.pageParams.id,
      }).then(res => {
        uni.hideLoading();
        if (res.code === 1) {
          that.data = res.data;

          // #ifdef H5
          this.$nav.share(that.data.name, '', that.data.cover);
          // #endif
        }
        
      });
      uni.stopPullDownRefresh();
    },


    /**
     * 加入练习
     * 用于未订阅的免费课程 或 绑定课程
     */
    subscribe() {
      uni.showLoading({
        title: '请稍后'
      });
      that.$api('app.exam.exercises.subscribe', {
        id: that.pageParams.id,
      }).then(res => {
        uni.hideLoading();
        if (res.code === 1) {
          that.getData();
          that.modal.exercisesControl = true;
        }
        that.$u.toast(res.msg);
      });
    }

  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    that.getData();
  },



  //下拉刷新
  onPullDownRefresh() {
    that.getData();
  },
  onShareAppMessage() {
    return this.$nav.share(that.data.name || '', '', that.data.cover || '');
  },
  onShareTimeline() {
    return this.$nav.share(that.data.name || '', '', that.data.cover || '');
  }
}
</script>
