<script>
import SpecSelectModal from '../components/spec-select-modal.vue';
import SubGoodsPopup from '../components/sub-goods-popup.vue';
// 规格「这一档还能不能买」的唯一一份判据（与拼团规格弹窗、商详规格弹窗同读）
import { specBuyable } from '@/common/utils/spec-stock.js';
// 拼团「加入别人的团」上下文（团详情「立即加入」带 gb_team 一组参数进本页）
import { readGroupBuyJoin } from '@/common/utils/group-buy-join.js';
import scoreExchange from '@/common/mixins/score-exchange.js';

var that;

export default {
  mixins: [scoreExchange],
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
      // 未裁剪的规格清单（取数时的原样）：兑换模式的裁剪每次都从这一份重算
      rawSpecs: [],
      // 「这一次打开规格弹窗是为了拼团」（2026-10-29）：确认时把规格交回拼团区，不走普通购买；
      // 关弹窗 / 走普通购买时复位，避免下一次购买被当成拼团
      gbPicking: false,
      // 拼团区「这一趟是被送去下单的」那本账：回本页时只静默重取拼团区那两条，
      // 不在 onShow 里顺手重取商品本体（这一页商品本体只随 onLoad 与下拉刷新取，动它是另一件事）
      // 拼团活动本体（拼团区 @ready 上抛）：规格弹窗按它出拼团价与档位，2026-10-30 起横幅不在价格格
      gbActivity: null,
      gbBuyers: [],
      gbPending: false,
      // 拼团区经 @ready 上抛的活动摘要（{ text } / null）：底栏那枚拼团按钮的显隐与文案吃它
      gbEntry: null,
      // 「我在这一场拼团里已有进行中的团」：底栏那枚「立即购买」收不收吃它（PRD 2026-10-27）。
      // 判据只认拼团区 @ready 上抛的 inTeam（后端 GoodsArea::myTeam），页面不读 my_team 自己拼
      gbInTeam: false,
      // 受邀参团（2026-10-30）：URL 带 gb_team 时进 join 态，底栏只留「加入拼团」；
      // 页内「选择」那一行改开拼团那只有锁定规格的弹窗。退出本页就没了（不落 storage）
      gbJoinCtx: null,
      gbJoinMode: false,
    };
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
    isVirtualPay() {
      return Number(this.goodsInfo && this.goodsInfo.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },
    coinName() {
      return this.$tools.systemConfig('coin_name') || '金币';
    }
  },
  onLoad(options) {
    that = this;
    this.initScoreExchange(options);
    // 受邀参团：URL 上那一组 gb_* 只活在本页实例上；初值先置真（单独购买立刻收起），
    // 拼团区取到活动后由 `@ready.join` 校准
    that.gbJoinCtx = readGroupBuyJoin(options);
    that.gbJoinMode = !!that.gbJoinCtx;
    // 付费插件未装时整页不进入（2026-10-29 用户点名「付费插件需要安装才有对应的后端代码，要做适配」）：
    // 组合商品接口在未装态不存在，深链 / 分享进来会是一条必然 404 的空页 —— 与教务套餐、圈子售前同一档，
    // 就地说一句并退回上一页（没有上一页时回首页）。`app_isinstall_composite` 由 common.init 下发。
    if (!that.$tools.systemConfig('app_isinstall_composite')) {
      uni.showToast({ title: '该功能未开通', icon: 'none' });
      setTimeout(function () {
        if (getCurrentPages().length > 1) { uni.navigateBack(); } else { uni.reLaunch({ url: '/pages/index/index' }); }
      }, 800);
      that.loading = false;
      return;
    }
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
    // 下拉是本块唯一的强制重载出口：拼团区跟着重取它自己那两条（活动结束就把整段收掉）
    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
  },
  /**
   * 从拼团区去下单/支付那几跳退回来：只有「这一趟是被拼团区送出去的」才静默重取拼团区
   * （硬约束 16 的正半句「退回哪一页，就由那一页自己在 onShow 重取」，取的是那一块、不是整页）。
   * 开团/参团付完款要看见自己那一行，活动结束或名额满了要把那一段收掉，都只靠拼团区自己那两条；
   * 商品本体、已选规格一律不动 —— 那两样在这一页只随 onLoad 与下拉刷新取。
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
     * 积分商品详情到手（mixins 回调）：把规格清单裁成「商家勾过的那几档」
     *
     * 组合商品的规格 id 就是 `app_composite_spec.id`，下单仍在 `extend` 里带
     * `规格id_价格`（`Composite::getPayDetail()` 按 `_` 拆第一段），所以裁剪只动展示，
     * 不需要下标映射。
     */
    onScoreExchangeReady() {
      if (!that.isScoreExchange) { return; }
      if (that.scoreExchangeError) {
        that.goodsInfo = null;
        that.loading = false;
        uni.showToast({ title: that.scoreExchangeError, icon: 'none' });
        return;
      }
      that.applyScoreSpecScope();
    },
    /** 按 `rawSpecs`（取数时的原清单）重裁一次，幂等 */
    applyScoreSpecScope() {
      if (!that.goodsInfo) { return; }
      const base = Array.isArray(that.rawSpecs) ? that.rawSpecs : (that.goodsInfo.specs || []);
      const list = that.scoreHasSpec
        ? that.scoreSpecOptions(base).map((row) => row.item)
        : base;
      that.goodsInfo.specs = list;
      if (!list.length) {
        that.selectedSpec = null;
        return;
      }
      const keep = that.selectedSpec
        ? list.find((spec) => Number(spec.id) === Number(that.selectedSpec.id))
        : null;
      that.selectedSpec = keep || list[0];
    },
    /**
     * 拼团区（`components/tz/group-buy-area.vue`）要把人带去下单：
     * 导航由组件自己发（它才知道选了哪一档、凑的是哪一个团），本页只记这一枚「去过了」的账，
     * 回来由 onShow 兑。用 `this` 不用模块级 `that`：这一枚是模板上的事件处理器。
     */
    gbGoPay() {
      this.gbPending = true;
    },
    /** 拼团区 @ready：活动摘要收下来喂给底栏那枚拼团按钮（摘要字符串由组件算好，本页不加工） */
    gbReady(entry) {
      this.gbEntry = entry;
      this.gbInTeam = !!(entry && entry.inTeam);
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
      uni.previewImage({ current: index, urls: that.goodsSwiper });
    },
    onSpecSelect(spec) {
      that.selectedSpec = spec;
    },
    /** 拼团入口点的「立即开团」：规格交给本页这只 `spec-select-modal` 选（内含商品那一节也跟着它） */
    openGbSpec() {
      that.gbPicking = true;
      that.showSpecModal = true;
    },
    /**
     * 页内「选择」那一行：join 态改开拼团那只有锁定规格的弹窗（否则同一屏还有一枚可单独下原价单的入口）
     */
    openSpecPicker() {
      if (that.gbJoinMode) {
        that.openGb();
        return;
      }
      that.showSpecModal = true;
    },
    /** 规格弹层关闭：拼团标记复位（取消之后下一次「立即购买」仍走普通购买） */
    closeSpecPicker() {
      that.showSpecModal = false;
      that.gbPicking = false;
    },
    onSpecConfirm(spec, ladderId) {
      that.selectedSpec = spec;
      that.showSpecModal = false;
      // 拼团那一趟：规格（与阶梯型的人数额）收完直接交回拼团区，不落普通下单链；
      // 人数额由规格弹层第二个参数带出（普通购买不收，逐字不变）
      if (that.gbPicking) {
        that.gbPicking = false;
        that.$refs.gbArea.afterSpec({ specId: spec && spec.id, ladderId: ladderId || 0 });
        return;
      }
      // 构建 goodsList 参数跳转到下单页
      const goodsList = [
        that.withScoreGoods({
          goodsId: that.goodsId,
          goodsType: 'composite',
          count: 1,
          extend: spec.id + '_' + spec.price
        })
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
      // 选中那一档已经卖完（下拉刷新后规格变了 / 别人买走了最后几件）：重开弹窗让它落到能买的那一档，
      // 别把用户直接送去提交页再吃一句「商品库存不足」（2026-10-29 用户点名）
      if (!specBuyable(that.selectedSpec)) {
        that.showSpecModal = true;
        return;
      }
      that.onSpecConfirm(that.selectedSpec);
    },
    openService() {
      uni.showToast({ title: '客服功能待完善', icon: 'none' });
    },
    /**
     * 商品本体取数。
     * 加载态一律走骨架屏（M16）：`u-loading-page` 与 `uni.showLoading` 那两枚都已下线，
     * 进度由 `loading` 驱动的灰块表达。
     * ① **首屏还没有内容时才铺骨架**：下拉刷新（`goodsInfo` 已有）保持旧内容可见，
     *    不整屏换灰块再换回来（M16「静默重取」那一档）；只有「取过一次没拿到，再下拉重试」
     *    这种没有内容可留的场合才重新铺一次，否则那一次重试没有任何反馈。
     * ② **成功 / 业务失败 / 网络异常三条退出分支都要撤骨架**（M16）：只写成功那一支，
     *    请求被拒或断网时灰块会永久停在页面上，用户读出来就是「一直加载中」。
     * ③ 业务失败保留已渲染的旧内容（下拉刷新失败不清屏），首屏失败则停在空页并给一句 toast。
     */
    async getGoodsDetail(id) {
      if (!that.goodsInfo) { that.loading = true; }
      try {
        const res = await that.$api('composite.composite.detail', { id: id });
        if (res.code === 1) {
          const data = res.data;
          data.cover = data.cover || (data.images && data.images.length ? data.images[0] : '');
          data.carousel = data.images || [];
          // 未裁剪的规格清单先留一份：兑换模式的裁剪与「积分商品晚到」那一次都读它
          that.rawSpecs = Array.isArray(data.specs) ? data.specs.slice() : [];
          that.goodsInfo = data;
          that.goodsSwiper = data.carousel && data.carousel.length ? data.carousel : [data.cover];
          // 兑换模式：首帧就只摆可兑换的那几档（积分商品详情晚到时由回调再重裁一次）
          if (that.isScoreExchange) {
            that.applyScoreSpecScope();
          }
          // 受邀参团：页面上「选择」那一行先落到团上那一档（点加入拼的是另一档就自相矛盾）
          if (that.gbJoinCtx && data.specs) {
            const joinSpec = data.specs.find((s) => Number(s.id) === Number(that.gbJoinCtx.specId));
            if (joinSpec) { that.selectedSpec = joinSpec; }
          }

          // #ifdef H5
          this.$nav.share(data.name, '', data.cover);
          // #endif
        }
      } catch (e) {
        // 网络异常 / HTTP 非 200：按「取不到商品」处理，不能停在骨架态
        // （接口 `auth: false`，不会被未登录那条 cancel 分支打到这里，故这句提示不会与登录引导重复）
        if (!that.goodsInfo) {
          uni.showToast({ title: '加载失败，请稍后重试', icon: 'none' });
        }
      } finally {
        // 三条退出分支共用这一处收尾：撤骨架 + 收下拉那一圈
        that.loading = false;
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