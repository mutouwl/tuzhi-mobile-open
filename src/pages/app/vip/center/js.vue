<script>
var that;
import shareModal from "@/components/modal/share-modal.vue";
export default {
  components: { shareModal },
  data() {
    return {
      detail: [],
      checkCardIndex: 0,
      skuIndex: 0,
      userInfo: {},
      vipUserInfo: false,
      config: {},
      pageParams:{},
      loading:false,
      swiperHeight:0,
      cardMeasured:false,
      current:0
    }
  },
  watch: {
  },
  computed: {
    //当前卡是否存在会员介绍内容
    hasCardIntro() {
      const card = this.detail[this.checkCardIndex];
      return !!(card && card.detail && card.detail != '<p><br></p>');
    },
    //会员介绍为空时隐藏「会员介绍」tab，仅保留「权益课程」
    tabs() {
      const list = [];
      if (this.hasCardIntro) {
        list.push({ name: '会员介绍', type: 'detail' });
      }
      list.push({ name: '权益课程', type: 'goods' });
      return list;
    },
    //当前展示中的 tab 类型
    currentTabType() {
      const tab = this.tabs[this.current];
      return tab ? tab.type : 'goods';
    }
  },
  methods: {
    isVirtualPay(goods) {
      return Number(goods && goods.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },

    isVirtualPaySku(sku, card) {
      return this.isVirtualPay(sku) || this.isVirtualPay(card);
    },

    formatAveragePrice(sku, card) {
      const price = Number(sku && sku.price ? sku.price : 0);
      const time = Number(sku && sku.time ? sku.time : 1);
      const avgPrice = (price / time).toFixed(2);
      return this.isVirtualPaySku(sku, card) ? '约' + avgPrice + (this.$tools.systemConfig('coin_name') || '金币') + '/天' : '约¥' + avgPrice + '/天';
    },

    //状态被切换
    tabChange(tab, index) {
      that.current = tab.index;
    },

    /**
     * 切换会员卡Œ
     * @param {*} e 
     */
    changeCard(e) {
      //记住切换前正在浏览的类型，切卡后尽量停留在同类 tab；新卡无介绍 tab 时落到第一个
      const prevType = that.currentTabType;
      that.checkCardIndex = e.detail.current;
      this.skuIndex = 0;
      const keepIndex = that.tabs.findIndex(tab => tab.type == prevType);
      that.current = keepIndex >= 0 ? keepIndex : 0;
    },

    /**
     * 切换会员卡规格
     * @param {*} index
     */
    changeSku(index) {
      this.skuIndex = index;
    },

    /**
     * 统一 swiper 内会员卡高度：先让卡片按内容自适应测出各自高度，
     * 再以最高的卡片为基准设置 swiper 高度，让所有卡片撑满同高
     */
    measureCardHeight() {
      that.cardMeasured = false;
      that.swiperHeight = 0;
      that.$nextTick(() => {
        setTimeout(() => {
          uni.createSelectorQuery().in(that).selectAll('.vip-card').boundingClientRect().exec(res => {
            const rects = res && res[0];
            if (!rects || !rects.length) return;
            let maxHeight = 0;
            rects.forEach(rect => {
              if (rect && rect.height > maxHeight) maxHeight = rect.height;
            });
            if (maxHeight > 0) {
              that.swiperHeight = Math.ceil(maxHeight);
              that.cardMeasured = true;
            }
          });
        }, 30);
      });
    },


    /**
     * 获取付费会员卡列表
     */
    getData() {
      uni.stopPullDownRefresh();
      that.loading = true;
      that.getConfig();
      that.getUserInfo();
      that.getVipUser();
      that.$api('app.vip.detail', that.form).then(res => {
        that.loading = false;
        if (res.code === 1) {
          that.detail = res.data;
          that.measureCardHeight();
        }
      });

    },

    getUserInfo() {
      that.$api('user.info.index', {}).then(res => {
        if (res.code === 1) {
          that.userInfo = res.data;
        }
      });
    },

    getVipUser() {
      that.$api('app.vip.user', {}).then(res => {
        if (res.code === 1) {
          that.vipUserInfo = res.data;
        }
      });
    },

    getConfig() {
      that.$api('app.vip.config', {}).then(res => {
        if (res.code === 1) {
          that.config = res.data;
          //会员卡列表受 config.status 控制显示，配置晚于列表返回时需补一次测量
          that.measureCardHeight();
        }
      });
    },



    /**
     * 购买会员卡
     */
    buy() {

      if (!that.detail[that.checkCardIndex]) {
        that.$u.toast('获取购买信息失败,请刷新重试');
        return false;
      }

      if (!that.detail[that.checkCardIndex].sku[that.skuIndex]) {
        that.$u.toast('会员卡规格信息获取失败，请刷新重试');
        return false;
      }

      //判断购买方式、单独购买、购买专栏
      var goodsList = [
        {
          goodsId: that.detail[that.checkCardIndex].id + '_' + that.skuIndex,
          goodsType: 'vipcard',
          count: 1
        }
      ];
      that.$nav.to('/pages/order/submit/submit?type=vipcard&goodsList=' + JSON.stringify(goodsList));
    },


    //刷新
    refresh() {
      this.getData();
    },
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  onShow() {
    // that.refresh();
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
