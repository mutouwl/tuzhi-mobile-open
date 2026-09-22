<script>
import SkuSelectModal from '../components/sku-select-modal.vue';
import ServiceModal from '../components/service-modal.vue';
import GuaranteeModal from '../components/guarantee-modal.vue';
import ParamsModal from '../components/params-modal.vue';

var that;

export default {
  components: {
    SkuSelectModal,
    ServiceModal,
    GuaranteeModal,
    ParamsModal
  },
  data() {
    return {
      goodsId: 0,
      skeletonLoading: true,
      goodsInfo: null,
      showSelectSku: false,
      showServiceModal: false,
      showGuaranteeModal: false,
      showParamsModal: false,
      goodsSwiper: [],
      selectedSkuPrice: {},
      selectedSkus: {},
      goodsNum: 1,
      guaranteeList: [
        {
          icon: 'checkmark-circle-fill',
          title: '7天无理由退换',
          desc: '满足相应条件（吊牌缺失,洗涤后不支持）时，消费者可申请"7天无理由退换货"'
        },
        {
          icon: 'car-fill',
          title: '退货运费险',
          desc: '卖家投保退货运费险，负担一定金额退货运费'
        },
        {
          icon: 'clock-fill',
          title: '极速退款',
          desc: '卖家投保退货运费险，负担一定金额退货运费'
        }
      ],
      paramsList: [
        { name: '适用场所', value: '厨房' },
        { name: '材质', value: '棉' }
      ]
    }
  },
  computed: {
    hasMultipleSku() {
      return this.goodsInfo && this.goodsInfo.sku_prices && this.goodsInfo.sku_prices.length > 1;
    },
    getSkuCount() {
      if (!this.goodsInfo || !this.goodsInfo.sku_tree || this.goodsInfo.sku_tree.length === 0) return 0;
      let count = 0;
      this.goodsInfo.sku_tree.forEach(sku => {
        if (sku.children) {
          count += sku.children.length;
        }
      });
      return count;
    },
    serviceList() {
      if (!this.goodsInfo || !this.goodsInfo.service) return [];
      return this.goodsInfo.service.split(',').map(s => s.trim()).filter(s => s);
    },
    isVirtualPay() {
      return Number(this.goodsInfo && this.goodsInfo.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },
    // 分享封面取商品主图（后台「商品主图」用于列表与分享头图），主图缺失时回退首张轮播图
    shareCover() {
      if (!this.goodsInfo) return '';
      return this.goodsInfo.cover || this.goodsSwiper[0] || '';
    }
  },
  onLoad(options) {
    that = this;

    let id = options.id;

    if (!id) {
      // #ifdef MP-WEIXIN
      if (options.scene) {
        try {
          let scene = decodeURIComponent(options.scene);
          scene = decodeURIComponent(scene);

          const sceneParams = {};
          scene.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key && value !== undefined) {
              sceneParams[key] = value;
            }
          });

          if (sceneParams.id) {
            id = sceneParams.id;
          }
        } catch (e) {
          console.error('解析scene参数失败:', e);
        }
      }
      // #endif
    }

    if (!id) {
      that.goodsInfo = null;
      that.skeletonLoading = false;
      return;
    }

    that.goodsId = id;
    that.getGoodsDetail(that.goodsId);
  },
  onPullDownRefresh() {
    that.refresh();
  },
  methods: {
    previewImage(index) {
      uni.previewImage({
        current: index,
        urls: that.goodsSwiper
      });
    },
    refresh() {
      // 首屏（还没有内容）由骨架屏给反馈，不再叠加原生 loading；已有内容时保持可见，用「请稍后」提示
      if (that.goodsInfo) {
        uni.showLoading({
          title: '请稍后'
        });
      } else {
        that.skeletonLoading = true;
      }
      that.getGoodsDetail(that.goodsId);
    },
    onSelectSku(skuIndex, option) {
      that.$set(that.selectedSkus, skuIndex, option);
      that.updateSkuPrice();
    },
    updateSkuPrice() {
      if (!that.goodsInfo || !that.goodsInfo.sku_tree || !that.goodsInfo.sku_prices) return;
      
      const selectedNames = [];
      const skuTreeLength = that.goodsInfo.sku_tree ? that.goodsInfo.sku_tree.length : 0;
      
      for (let i = 0; i < skuTreeLength; i++) {
        if (that.selectedSkus[i]) {
          selectedNames.push(that.selectedSkus[i].name);
        } else if (that.goodsInfo.sku_tree[i] && that.goodsInfo.sku_tree[i].children && that.goodsInfo.sku_tree[i].children[0]) {
          selectedNames.push(that.goodsInfo.sku_tree[i].children[0].name);
        } else {
          selectedNames.push('');
        }
      }
      
      const skuText = selectedNames.join(',');
      
      const matchedSku = that.goodsInfo.sku_prices.find(sku => {
        return sku.goods_sku_text === skuText;
      });
      
      if (matchedSku) {
        that.selectedSkuPrice = matchedSku;
      } else {
        that.selectedSkuPrice = {
          ...that.selectedSkuPrice,
          goods_sku_text: skuText,
          price: that.goodsInfo.sku_prices[0] ? that.goodsInfo.sku_prices[0].price : 0
        };
      }
      
      if (that.goodsNum > Number(that.selectedSkuPrice.stock || 0)) {
        that.goodsNum = Number(that.selectedSkuPrice.stock || 0);
      }
    },
    changeNumber(delta) {
      const newNum = that.goodsNum + delta;
      const maxStock = Number(that.selectedSkuPrice.stock || 999);
      if (newNum >= 1 && newNum <= maxStock) {
        that.goodsNum = newNum;
      }
    },
    onAddCart() {
      uni.showToast({
        title: '已加入购物车',
        icon: 'success',
      });
      that.showSelectSku = false;
    },
    onBuy() {
      uni.showToast({
        title: '跳转到订单确认页',
        icon: 'none',
      });
    },
    onSkuConfirm(data) {
      that.goodsNum = data.goodsNum;
      that.showSelectSku = false;
      
      const singleLimit = Number(that.goodsInfo.single_limit || 0);
      const lifetimeLimit = Number(that.goodsInfo.lifetime_limit || 0);
      
      if (singleLimit > 0 && that.goodsNum > singleLimit) {
        uni.showToast({
          title: `单次限购${singleLimit}件`,
          icon: 'none'
        });
        return;
      }
      
      if (lifetimeLimit > 0 && that.goodsNum > lifetimeLimit) {
        uni.showToast({
          title: `终身限购${lifetimeLimit}件`,
          icon: 'none'
        });
        return;
      }
      
      const goodsList = [
        {
          goodsId: that.goodsId + '_' + (that.selectedSkuPrice.id || 0),
          goodsType: 'physical',
          count: that.goodsNum
        }
      ];
      
      that.$nav.to('/pages/order/submit/submit?type=physical&goodsList=' + JSON.stringify(goodsList));
    },
    getServiceDesc(service) {
      const descMap = {
        '不支持7天无理由退货': '该商品不支持7天无理由退货',
        '支持换货': '支持买家申请退换货',
        '支持退货': '支持买家申请退货',
        '包邮': '该商品享受包邮服务',
        '正品保证': '平台承诺正品保证',
        '极速发货': '商家承诺24小时内发货'
      };
      return descMap[service] || service;
    },
    buildSkuTree(skuPrices) {
      if (!skuPrices || skuPrices.length === 0) return [];
      
      const firstSku = skuPrices[0];
      if (!firstSku.goods_sku_text) return [];
      
      const skuTexts = firstSku.goods_sku_text.split(',');
      const skuTree = [];
      
      skuTexts.forEach((text, index) => {
        const skuName = `规格${index + 1}`;
        const children = [];
        
        const uniqueOptions = new Set();
        skuPrices.forEach(sku => {
          if (sku.goods_sku_text) {
            const parts = sku.goods_sku_text.split(',');
            if (parts[index]) {
              uniqueOptions.add(parts[index].trim());
            }
          }
        });
        
        uniqueOptions.forEach(option => {
          children.push({ name: option });
        });
        
        if (children.length > 0) {
          skuTree.push({
            name: skuName,
            children: children
          });
        }
      });
      
      return skuTree;
    },
    buildGuaranteeList(data) {
      const list = [];
      
      if (data.support_return === 1) {
        list.push({
          icon: 'checkmark-circle-fill',
          title: '7天无理由退货',
          desc: '满足相应条件时，消费者可申请"7天无理由退货"'
        });
      }
      
      if (data.support_exchange === 1) {
        list.push({
          icon: 'reload',
          title: '支持换货',
          desc: '买家可申请换货服务'
        });
      }
      
      if (data.delivery_time) {
        list.push({
          icon: 'clock-fill',
          title: '极速发货',
          desc: `商家承诺${data.delivery_time}天内发货`
        });
      }
      
      return list;
    },
    async getGoodsDetail(id) {
      try {
        const res = await that.$api('physical.physical.detail', {
          id: id,
        });

        if (res.code === 1) {
          const cleanedData = {
            ...res.data,
            cover: res.data.image || res.data.cover ? (res.data.image || res.data.cover).replace(/^`|`$/g, '').trim() : '',
            carousel: res.data.carousel ? res.data.carousel.map(item => item.replace(/^`|`$/g, '').trim()) : []
          };

          if (res.data.sku_tree && res.data.sku_tree.length > 0) {
            cleanedData.sku_tree = res.data.sku_tree;
          } else if (res.data.sku_prices && res.data.sku_prices.length > 0) {
            cleanedData.sku_tree = that.buildSkuTree(res.data.sku_prices);
          }

          if (res.data.sku_prices && res.data.sku_prices.length > 0) {
            const inStockSku = res.data.sku_prices.find(sku => Number(sku.stock) > 0);
            that.selectedSkuPrice = inStockSku || res.data.sku_prices[0];

            if (inStockSku && inStockSku.goods_sku_text) {
              const skuTexts = inStockSku.goods_sku_text.split(',');
              skuTexts.forEach((text, index) => {
                if (cleanedData.sku_tree && cleanedData.sku_tree[index]) {
                  const option = cleanedData.sku_tree[index].children.find(child => child.name === text);
                  if (option) {
                    that.$set(that.selectedSkus, index, option);
                  }
                }
              });
            }
          }

          that.goodsInfo = cleanedData;
          that.goodsSwiper = cleanedData.carousel && cleanedData.carousel.length > 0 ? cleanedData.carousel : [cleanedData.cover];

          that.guaranteeList = that.buildGuaranteeList(res.data);

          // 页面标题跟随商品标题（原标题为固定的「商品详情」），
          // H5 会同步浏览器/微信顶部标题，小程序同步导航栏标题
          if (res.data.name) {
            uni.setNavigationBarTitle({ title: res.data.name });
          }

          // #ifdef H5
          this.$nav.share(res.data.name, '', that.shareCover);
          // #endif

          if (res.data.params) {
            let paramsData = res.data.params;
            if (typeof paramsData === 'string') {
              try {
                paramsData = JSON.parse(paramsData);
              } catch (e) {
                paramsData = [];
              }
            }
            if (Array.isArray(paramsData) && paramsData.length > 0) {
              that.paramsList = paramsData;
            } else if (typeof paramsData === 'object' && Object.keys(paramsData).length > 0) {
              that.paramsList = Object.entries(paramsData).map(([name, value]) => ({ name, value }));
            }
          }
        } else {
          that.goodsInfo = null;
        }
      } catch (e) {
        // 网络异常/请求被取消（如未登录）：按「取不到商品」处理，不能停在骨架态
        that.goodsInfo = null;
      } finally {
        // 成功/失败/异常都要收起骨架，否则页面永远停在加载态
        that.skeletonLoading = false;
        uni.hideLoading();
        uni.stopPullDownRefresh();
      }
    }
  },
  onShareAppMessage() {
      return this.$nav.share((this.goodsInfo && this.goodsInfo.name) || '', '', this.shareCover);
    },
    onShareTimeline() {
      return this.$nav.share((this.goodsInfo && this.goodsInfo.name) || '', '', this.shareCover);
    }
}
</script>
