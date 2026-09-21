<script>
var that;
import shareModal from "@/components/modal/share-modal.vue";
import banner from '@/components/course/banner.vue';
import liveStartTimeBar from "@/components/course/live-start-time-bar.vue";
export default {
  components: { shareModal, banner, liveStartTimeBar },
  data() {
    return {
      loading: true,
      ticketList: [],
      ticketSelected: {},
      price: 0,
      ticketCount:0,
      pageParams:{}
    }
  },
  watch: {
  },
  methods: {

    isVirtualPay(goods) {
      return Number(goods && goods.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },

    formatPrice(price, goods) {
      return this.isVirtualPay(goods) ? (price || 0) + (this.$tools.systemConfig('coin_name') || '金币') : '¥' + price;
    },

    getDetail() {
      that.loading = true;
      that.$api('app.activity.detail', {
        id: that.pageParams.id
      }).then(res => {
        uni.stopPullDownRefresh();
        if (res.code === 1) {

          that.detail = res.data;

          that.loading = false;
        }
      });
    },
    getTicket() {
      that.loading = true;

      that.tabs = [];
      that.$api('app.activity.ticket.getTicket', {
        id: this.pageParams.id
      }).then(res => {
        uni.stopPullDownRefresh();
        if (res.code === 1) {
          that.ticketList = res.data;
          that.loading = false;
        }

        this.loading = false;
      });
    },

    //刷新
    refresh() {
    },
    form() {
      that.$nav.to('/pages/app/activity/form/form?id=' + that.pageParams.id + '&ticket=' + JSON.stringify(this.ticketSelected));
    },
    numberChange(option) {
      var count = 0;
      this.ticketSelected[option.name] = option.value;
      var price = 0;
      for (var i in this.ticketSelected) {
        if (!this.ticketSelected[i]) {
          delete this.ticketSelected[i];
          continue;
        }
        for (var j in this.ticketList) {
          if (this.ticketList[j].id == i) {
            price += this.ticketList[j].price * this.ticketSelected[i]
          }
        }

        count += this.ticketSelected[i]
      }
      this.ticketCount = count;
      this.price = price;
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
    that.getDetail();
    that.getTicket();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>