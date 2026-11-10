<script>
import SkuSelectModal from '../components/sku-select-modal.vue';
import ServiceModal from '../components/service-modal.vue';
import GuaranteeModal from '../components/guarantee-modal.vue';
import ParamsModal from '../components/params-modal.vue';
// 多属性分维的唯一一份判据（`规格1` / `规格2` 那两节）：拼团规格弹窗读的是同一份，
// 两处各拆一次就会出现「商详两节、拼团一排组合文案」那种分叉（2026-10-29 用户点名）
import { specGroupsOf } from '@/common/utils/spec-stock.js';
// 拼团「加入别人的团」上下文（团详情「立即加入」带 gb_team 一组参数进本页）
import { readGroupBuyJoin } from '@/common/utils/group-buy-join.js';
import scoreExchange from '@/common/mixins/score-exchange.js';

var that;

export default {
  mixins: [scoreExchange],
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
      // 未裁剪的规格清单（取数时的原样）：兑换模式的规格裁剪每次都从这一份重算，
      // 不拿 `goodsInfo.sku_prices`（已裁过）再裁，否则「积分商品晚到」那一次会越裁越少
      rawSkuPrices: [],
      // 「这一次打开规格弹窗是为了拼团」（2026-10-29）：确认时把选中的规格交给拼团区，
      // 而不是走普通购买；关弹窗/走普通购买时复位，避免下一次购买被当成拼团
      gbPicking: false,
      // 拼团区「这一趟是被送去下单的」那本账：回本页时只静默重取拼团区那两条，
      // 不在 onShow 里顺手重取商品本体（这一页商品本体只随 onLoad 与下拉刷新取，动它是另一件事）
      // 拼团活动本体（拼团区 @ready 上抛）：规格弹窗按它出拼团价与档位，2026-10-30 起横幅不在价格格
      gbActivity: null,
      gbBuyers: [],
      gbPending: false,
      // 拼团区经 @ready 上抛的活动摘要（{ text } / null）：底栏那枚拼团按钮的显隐与文案吃它
      gbEntry: null,
      // 受邀参团（2026-10-30）：URL 带 gb_team 时进 join 态 —— 底栏只留「加入拼团」，
      // 规格入口也改开拼团那只有锁定规格的弹窗；退出本页就没了（不落 storage）
      gbJoinCtx: null,
      gbJoinMode: false,
      // 「我在这一场拼团里已有进行中的团」：底栏那枚「立即购买」收不收吃它（PRD 2026-10-27）。
      // 判据只认拼团区 @ready 上抛的 inTeam（后端 GoodsArea::myTeam），页面不读 my_team 自己拼
      gbInTeam: false,
      // 受邀链接上的 `share`（邀请人 id）：拼团区访客埋点用它区分「分享访客数」
      share: 0,
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
    /**
     * 宿主价格行显不显示（2026-10-30 第五轮，用户第二次点名「拼团价要复制覆盖原来的价格」）：
     * 拼团进行中（拼团区 `@ready` 上抛的 `gbEntry.activity` 非空）⇒ 本页价格行收起，
     * 价格只由拼团卡第一行的横幅给 —— 一屏只有一个价；没有活动 / 活动结束抛 null ⇒ 照常显示。
     * 判据只此一处（与底栏那枚拼团按钮、封面弹幕同一份 `gbEntry`）。
     */
    gbPriceShown() {
      return !(this.gbEntry && this.gbEntry.activity);
    },
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
    this.initScoreExchange(options);

    let id = options.id;
    // 受邀链接上的邀请人（`?share=<userId>`）：只用于拼团访客埋点，不参与商品取数
    this.share = Number(options.share) || 0;
    // 受邀参团：URL 上那一组 gb_* 只活在本页实例上；初值先置真（底栏单独购买立刻收起），
    // 拼团区取到活动后由 `@ready.join` 校准
    this.gbJoinCtx = readGroupBuyJoin(options);
    this.gbJoinMode = !!this.gbJoinCtx;

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
  /**
   * 从下单页退回来：只有「这一趟是被拼团区送出去的」才静默重取拼团区（硬约束 16 的正半句
   * 「退回哪一页，就由那一页自己在 onShow 重取」，取的是那一块、不是整页）。
   * 开团/参团付完款要看见自己那一行，活动结束或名额满了要把那一段收掉，都只靠拼团区自己那两条；
   * 商品本体、已选规格、数量一律不动 —— 那三样在这一页只随 onLoad 与下拉刷新取。
   */
  onShow() {
    // M23 硬要求：用了模块级 that 的页面，onShow 的第一条语句必须把它收回当前实例
    that = this;
    if (!that.gbPending) { return; }
    that.gbPending = false;
    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
  },
  methods: {
    /**
     * 积分商品详情到手（mixins 回调）：规格裁剪要重跑一次
     *
     * 商品详情与积分商品详情是两条并行的请求：商品先到那一拍还不知道「允许哪几档」，
     * 于是整份规格树都摆了出来。这里按同一份 `rawSkuPrices` 重裁一次（原始清单存在页面里，
     * 不在 `goodsInfo.sku_prices` 上 —— 那一份已经裁过，再裁会越裁越少）。
     */
    onScoreExchangeReady() {
      if (!that.isScoreExchange) { return; }
      if (that.scoreExchangeError) {
        // 积分商品被拒（下架 / 勾过的档全失效）：整页按不可兑收口
        that.goodsInfo = null;
        that.skeletonLoading = false;
        uni.showToast({ title: that.scoreExchangeError, icon: 'none' });
        return;
      }
      if (!that.rawSkuPrices || !that.rawSkuPrices.length) { return; }
      that.applyScoreSpecScope();
    },
    /**
     * 把 `goodsInfo.sku_prices` 裁成「允许兑换的那几档」，`sku_tree` 跟着重算，选中档一起校正
     *
     * 幂等：每次都从 `rawSkuPrices`（第一次取数时的原清单）重算，不拿裁过的再裁。
     */
    applyScoreSpecScope() {
      if (!that.goodsInfo) { return; }
      const base = that.rawSkuPrices || [];
      const list = that.scoreHasSpec
        ? that.scoreSpecOptions(base).map((row) => row.item)
        : base;
      that.goodsInfo.sku_prices = list;
      that.goodsInfo.sku_tree = that.buildSkuTree(list);
      if (!list.length) {
        // 勾过的档全下架/售罄：界面停在「暂无可用规格」，不给一个点了必报错的按钮
        that.selectedSkuPrice = {};
        that.selectedSkus = {};
        return;
      }
      // 已选那一档若被裁掉，回落到第一档能买的（与取数落地那一拍同口径）
      const keep = list.find((sku) => Number(sku.id) === Number(that.selectedSkuPrice && that.selectedSkuPrice.id));
      const pickRow = keep || list.find((sku) => Number(sku.stock) > 0) || list[0];
      that.selectedSkuPrice = pickRow;
      that.selectedSkus = {};
      if (pickRow && pickRow.goods_sku_text) {
        pickRow.goods_sku_text.split(',').forEach((text, index) => {
          if (that.goodsInfo.sku_tree[index]) {
            const option = that.goodsInfo.sku_tree[index].children.find((child) => child.name === text);
            if (option) { that.$set(that.selectedSkus, index, option); }
          }
        });
      }
    },
    /**
     * 拼团区（`components/tz/group-buy-area.vue`）要把人带去下单：
     * 导航由组件自己发（它才知道选了哪一档、凑的是哪一个团，`extend.group_buy` 挂在它那一行上），
     * 本页只记这一枚「去过了」的账，回来由 onShow 兑。
     */
    gbGoPay() {
      this.gbPending = true;
    },
    /** 拼团区 @ready：活动摘要收下来喂给底栏那枚拼团按钮（摘要字符串由组件算好，本页不加工） */
    gbReady(entry) {
      this.gbEntry = entry;
      this.gbInTeam = !!(entry && entry.inTeam);
      // join 态校准：活动不在/不是团上那一场时放回单独购买入口
      this.gbJoinMode = !!(entry && entry.join);
      // 原价行与横幅共用这一枚：活动到期/失败时拼团区抛 null ⇒ 原价行自动回来
      this.gbActivity = (entry && entry.activity) || null;
      this.gbBuyers = (entry && entry.activity && entry.activity.buyers) || [];
    },
    /** 底栏「¥xx 拼团」按钮：就地开拼团区那只凑团弹层（壳挂在拼团区组件里，不走页面导航） */
    openGb() {
      if (this.$refs.gbArea) { this.$refs.gbArea.openPopup(); }
    },
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
      // 下拉是本块唯一的强制重载出口：拼团区跟着重取它自己那两条（活动结束就把整段收掉）
      if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
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
    /** 拼团入口点的「立即开团」：规格交给本页这只 `sku-select-modal` 选（复用实物自己的规格树/数量） */
    openGbSpec() {
      that.gbPicking = true;
      that.showSelectSku = true;
    },
    /**
     * 页内「选择」那一行 / 底栏单独购买：join 态一律改开拼团那只有锁定规格的弹窗。
     * 不这样改就是同一屏上的第二个购买入口（用户 2026-10-30 点名「规格弹窗里面也可以单独购买」那一族）。
     */
    openSkuPicker() {
      if (that.gbJoinMode) {
        that.openGb();
        return;
      }
      that.showSelectSku = true;
    },
    /** 规格弹窗关闭：不管是取消还是确认，那一枚拼团标记都复位（下一次「立即购买」不会被当成拼团） */
    closeSkuPicker() {
      that.showSelectSku = false;
      that.gbPicking = false;
    },
    onSkuConfirm(data) {
      // 拼团那一趟：规格/份数收完直接交回拼团区（阶梯档与份数上限由它那一层接着问），不落普通下单链
      if (that.gbPicking) {
        that.gbPicking = false;
        that.showSelectSku = false;
        const spec = (data && data.skuPrice) || {};
        // 阶梯型的人数额也在规格弹窗里选掉了（2026-10-29）：一并交回拼团区，不再开第二步弹窗
        that.$refs.gbArea.afterSpec({ specId: spec.id, count: (data && data.goodsNum) || 1, ladderId: (data && data.ladderId) || 0 });
        return;
      }
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
        that.withScoreGoods({
          goodsId: that.goodsId + '_' + (that.selectedSkuPrice.id || 0),
          goodsType: 'physical',
          count: that.goodsNum
        })
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
    /**
     * 规格树（`[{ name:'规格1', children:[{name:'红色'},…] }, …]`）
     *
     * **不再在本页拆一份**（2026-10-29）：分维判据收进 `common/utils/spec-stock.js` 的
     * `specGroupsOf()` 一处，拼团规格弹窗（`components/tz/group-buy-config-popup.vue`）读同一份 ——
     * 用户点名的正是「拼团弹窗把组合文案平铺一排，商详却是分节」这种分叉。
     * 读点传 `goods_sku_text`：实物 SKU 价行那一列（`红色,大`），与后端 `PhysicalSpec::rows()` 同源。
     */
    buildSkuTree(skuPrices) {
      return specGroupsOf(skuPrices, (row) => row && row.goods_sku_text);
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

          // 积分兑换（2026-11-08 用户点名「仅显示可积分兑换的规格选项…新增的规格未添加到积分商品
          // 的规格中，那么不要在积分兑换时规格中显示对应的选项」）：
          // 未裁剪的原清单先存一份（`rawSkuPrices`），裁剪与「积分商品晚到」那一次重裁都读它；
          // 首次裁剪在下面统一走 `applyScoreSpecScope()`，不在这里写第二套。
          that.rawSkuPrices = Array.isArray(res.data.sku_prices) ? res.data.sku_prices.slice() : [];

          if (cleanedData.sku_prices && cleanedData.sku_prices.length > 0) {
            const inStockSku = cleanedData.sku_prices.find(sku => Number(sku.stock) > 0);
            // 受邀参团：页面上「选择」那一行先落到团上那一档（不然进来看的是第一档、点加入却拼另一档）
            const joinSku = that.gbJoinCtx
              ? cleanedData.sku_prices.find(sku => Number(sku.id) === Number(that.gbJoinCtx.specId))
              : null;
            that.selectedSkuPrice = joinSku || inStockSku || cleanedData.sku_prices[0];

            const pickedSku = joinSku || inStockSku;
            if (pickedSku && pickedSku.goods_sku_text) {
              const skuTexts = pickedSku.goods_sku_text.split(',');
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

          // 兑换模式：首帧就把规格裁成「可兑换的那几档」（规格树与选中档一并校正）。
          // 积分商品详情若还没回来（并行请求），`onScoreExchangeReady()` 会再重裁一次。
          if (that.isScoreExchange) {
            that.applyScoreSpecScope();
          }

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
