<script>
import SpecSelectModal from '../components/spec-select-modal.vue';
import SubGoodsPopup from '../components/sub-goods-popup.vue';

var that;

export default {
  components: {
    SpecSelectModal,
    SubGoodsPopup
  },
  data() {
    return {
      goodsId: 0,
      loading: true,
      goodsInfo: null,
      showSpecModal: false,
      showSubGoodsPopup: false,
      goodsSwiper: [],
      selectedSpec: null,
    };
  },
  computed: {
    isVirtualPay() {
      return Number(this.goodsInfo && this.goodsInfo.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },
    coinName() {
      return this.$tools.systemConfig('coin_name') || '金币';
    }
  },
  onLoad(options) {
    that = this;
    let id = options.id;
    // #ifdef MP-WEIXIN
    if (!id && options.scene) {
      try {
        let scene = decodeURIComponent(options.scene);
        scene = decodeURIComponent(scene);
        const sceneParams = {};
        scene.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key && value !== undefined) sceneParams[key] = value;
        });
        if (sceneParams.id) id = sceneParams.id;
      } catch (e) {}
    }
    // #endif
    if (!id) {
      that.loading = false;
      return;
    }
    that.goodsId = id;
    that.getGoodsDetail(id);
  },
  onPullDownRefresh() {
    that.getGoodsDetail(that.goodsId);
  },
  methods: {
    previewImage(index) {
      uni.previewImage({ current: index, urls: that.goodsSwiper });
    },
    onSpecSelect(spec) {
      that.selectedSpec = spec;
    },
    onSpecConfirm(spec) {
      that.selectedSpec = spec;
      that.showSpecModal = false;
      // 构建 goodsList 参数跳转到下单页
      const goodsList = [
        {
          goodsId: that.goodsId,
          goodsType: 'composite',
          count: 1,
          extend: spec.id + '_' + spec.price
        }
      ];
      that.$nav.to('/pages/order/submit/submit?type=composite&goodsList=' + JSON.stringify(goodsList));
    },
    handleBuy() {
      if (!that.goodsInfo || !that.goodsInfo.specs || !that.goodsInfo.specs.length) {
        uni.showToast({ title: '暂无可用规格', icon: 'none' });
        return;
      }
      if (!that.selectedSpec) {
        that.showSpecModal = true;
        return;
      }
      that.onSpecConfirm(that.selectedSpec);
    },
    openService() {
      uni.showToast({ title: '客服功能待完善', icon: 'none' });
    },
    async getGoodsDetail(id) {
      uni.showLoading({ title: '加载中…' });
      const res = await that.$api('composite.composite.detail', { id: id });
      if (res.code === 1) {
        const data = res.data;
        data.cover = data.cover || (data.images && data.images.length ? data.images[0] : '');
        data.carousel = data.images || [];
        that.goodsInfo = data;
        that.goodsSwiper = data.carousel && data.carousel.length ? data.carousel : [data.cover];

        // #ifdef H5
        this.$nav.share(data.name, '', data.cover);
        // #endif
        that.loading = false;
        uni.hideLoading();
        uni.stopPullDownRefresh();
      } else {
        that.loading = false;
        uni.hideLoading();
        uni.stopPullDownRefresh();
      }
    }
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
};
</script>