<script>
// 拼团「加入别人的团」上下文（团详情「立即加入」带 gb_team 一组参数进本页）
import { readGroupBuyJoin } from '@/common/utils/group-buy-join.js';
var that;
// 模块级的取数轮次：同一路由在页面栈里出现两次时，旧实例在飞的响应不会撞上新实例的轮次
// （若按实例计数，两边都从 1 开始，旧响应会被新实例当成自己的回体，M23）
var loadSeq = 0;
export default {
  data() {
    return {
      detail: [],
      checkCardIndex: 0,
      skuIndex: 0,
      // 拼团区（2026-10-28）：从下单页退回来只重取那一块；换卡时也重取（商品 id 变了）
      // 拼团活动本体（拼团区 @ready 上抛）：这一排时长卡切到该档拼团价并划线原价
      gbActivity: null,
      gbBuyers: [],
      gbPending: false,
      gbEntry: null,
      // 「我在这一场拼团里已有进行中的团」：底栏那枚「立即开通」收不收吃它（PRD 2026-10-27）。
      // 判据只认拼团区 @ready 上抛的 inTeam（后端 GoodsArea::myTeam），页面不读 my_team 自己拼
      gbInTeam: false,
      // 受邀参团（2026-10-30）：URL 带 gb_team 时进 join 态。
      // 会员卡一页多张卡：按 `gb_goods_id` 选中团上那张卡、`gb_spec` 选中那一档时长，
      // 只有那张卡底部才出「加入拼团」；换卡/换时长在 join 态被拦（换了就加入不到同一个团）。
      gbJoinCtx: null,
      gbJoinMode: false,
      // 团上那张卡在 `detail` 里的下标（-1 = 没找到，join 态作废）
      gbJoinCardIndex: -1,
      userInfo: {},
      vipUserInfo: false,
      config: {},
      pageParams:{},
      // 首屏骨架屏：初值 true，四路请求（卡列表 / 配置 / 用户 / 会员身份）全部落定才撤。
      // 撤早了就是「配置还没到 ⇒ 先闪一屏『会员卡功能暂不可用』再变正文」（M16 / 硬约束 22）
      loading:true,
      pendingLegs:0,
      loadRound:0,
      loadMsg:'',
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
    },
    //空态文案：取数失败那一档说后端那句（M13），其余按配置 / 卡列表给原因
    emptyText() {
      if (this.loadMsg) { return this.loadMsg; }
      return this.config.status != 1 ? '会员卡功能暂不可用' : '暂无可用会员卡';
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
      // 受邀参团：只认团上那张卡，滑到别的卡就拉回来（换了卡就加入不到同一个团）
      if (that.gbJoinMode) {
        const current = Number(e && e.detail && e.detail.current);
        if (current !== Number(that.gbJoinCardIndex)) {
          that.checkCardIndex = that.gbJoinCardIndex >= 0 ? that.gbJoinCardIndex : 0;
          uni.showToast({ title: '当前正在加入这张会员卡的拼团', icon: 'none' });
          return;
        }
        // 到位这一拍**不许把 skuIndex 打回 0**：那是团上快照的时长，join 只认它；
        // tab 仍按当前浏览类型收口（新卡没有「会员介绍」时落回权益课程）
        that.checkCardIndex = current;
        const keepIndex = that.tabs.findIndex((tab) => tab.type === that.currentTabType);
        that.current = keepIndex >= 0 ? keepIndex : 0;
        return;
      }
      //记住切换前正在浏览的类型，切卡后尽量停留在同类 tab；新卡无介绍 tab 时落到第一个
      const prevType = that.currentTabType;
      that.checkCardIndex = e.detail.current;
      this.skuIndex = 0;
      const keepIndex = that.tabs.findIndex(tab => tab.type == prevType);
      that.current = keepIndex >= 0 ? keepIndex : 0;
      // 换卡 = 换拼团商品：拼团区不会跟着 :goods-id 变，必须显式重取（否则还摆着上一张卡的活动）
      that.$nextTick(function () {
        if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
      });
    },

    /**
     * 切换会员卡规格
     * @param {*} index
     */
    changeSku(index) {
      // 2026-10-30：团绑定商品、不绑定规格 —— 参团时也可以换时长（后端按所选时长取价）；
      // 阶梯人数档仍由拼团区保持团上那一档（`pickSpecId` 在 join 态不重置人数档）
      this.skuIndex = index;
      // 拼团区跟着换规格（2026-10-29）：阶梯型的人数额按规格分组，不通知它就会摆着上一档的档位
      if (this.$refs.gbArea) { this.$refs.gbArea.pickSpecId(index); }
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
     * 首屏四路请求的统一收口：每一路（成功 / 业务码非 1 / 异常）都必须调一次，
     * 全部落定才撤骨架屏；下拉刷新那枚圈也等这里收，别在发请求时就停（M4）
     */
    legDone(round) {
      if (round !== that.loadRound) { return; }
      if (that.pendingLegs <= 0) { return; }
      that.pendingLegs = that.pendingLegs - 1;
      if (that.pendingLegs > 0) { return; }
      that.loading = false;
      uni.stopPullDownRefresh();
      // 真实卡片在骨架屏撤下之后才进 DOM，卡片等高只能在这一拍量
      that.$nextTick(function () {
        if (that.config.status == 1 && that.detail.length) { that.measureCardHeight(); }
      });
    },

    //取数失败的可读出口（M13）：重取失败不覆盖已经渲染好的页面，只让首屏说明原因
    failMsg(res) {
      if (that.detail.length) { return; }
      that.loadMsg = (res && res.msg) || '加载失败，请重试';
    },

    /**
     * 获取付费会员卡列表
     */
    getData() {
      var round = ++loadSeq;
      that.loadRound = round;
      that.pendingLegs = 4;
      that.loadMsg = '';
      // 骨架屏只给首屏：下拉刷新 / 重进时保留已渲染内容，静默重取（硬约束 16）
      if (!that.detail.length) {
        that.loading = true;
      }
      that.getConfig(round);
      that.getUserInfo(round);
      that.getVipUser(round);
      that.$api('app.vip.detail', that.form).then(res => {
        if (round !== that.loadRound) { return; }
        if (res && res.code === 1) {
          that.detail = res.data || [];
          // 受邀参团：把目标卡与目标时长选中（多张卡里只有团上那张卡该出「加入拼团」）
          if (that.gbJoinCtx) {
            const target = that.detail.findIndex((c) => Number(c.id) === Number(that.gbJoinCtx.goodsId));
            if (target >= 0) {
              that.gbJoinCardIndex = target;
              that.checkCardIndex = target;
              const skus = (that.detail[target] && that.detail[target].sku) || [];
              const want = Number(that.gbJoinCtx.specId) || 0;
              that.skuIndex = want >= 0 && want < skus.length ? want : 0;
            } else {
              // 团上那张卡已下架/被删：退回正常购买链（不把整页钉在一个不存在的商品上）
              that.gbJoinCtx = null;
              that.gbJoinMode = false;
              that.gbJoinCardIndex = -1;
              // 拼团区的 `joinMode` 跟着 props 变了：重取一次把 `@ready` 的文案/载荷换成正常开团那一档
              that.$nextTick(function () {
                if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
              });
            }
          }
          // 静默重取回来卡变少了（商家下架）：落在越界的选中项上会渲染成空态，回退到第一张
          if (that.checkCardIndex >= that.detail.length) {
            that.checkCardIndex = 0;
            that.skuIndex = 0;
          }
        } else {
          that.failMsg(res);
        }
        that.legDone(round);
      }).catch(() => {
        if (round !== that.loadRound) { return; }
        that.failMsg(null);
        that.legDone(round);
      });

    },

    getUserInfo(round) {
      that.$api('user.info.index', {}).then(res => {
        if (round !== that.loadRound) { return; }
        if (res && res.code === 1) {
          that.userInfo = res.data || {};
        }
        that.legDone(round);
      }).catch(() => {
        if (round === that.loadRound) { that.legDone(round); }
      });
    },

    getVipUser(round) {
      that.$api('app.vip.user', {}).then(res => {
        if (round !== that.loadRound) { return; }
        if (res && res.code === 1) {
          that.vipUserInfo = res.data || false;
        }
        that.legDone(round);
      }).catch(() => {
        if (round === that.loadRound) { that.legDone(round); }
      });
    },

    getConfig(round) {
      that.$api('app.vip.config', {}).then(res => {
        if (round !== that.loadRound) { return; }
        if (res && res.code === 1) {
          // 模板与空态文案都要读 config.status，null 会在渲染期直接抛（M23）
          that.config = res.data || {};
        } else {
          // 配置这一路决定整页能不能显示，失败要说原因，不能落成「会员卡功能暂不可用」
          that.loadMsg = (res && res.msg) || '加载失败，请重试';
        }
        that.legDone(round);
      }).catch(() => {
        if (round !== that.loadRound) { return; }
        that.loadMsg = '加载失败，请重试';
        that.legDone(round);
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


    /** 拼团区把人送去下单：本页只记这一枚账，回来由 onShow 兑 */
    gbGoPay() { this.gbPending = true; },
    /** 拼团区 @ready：摘要收下来喂底栏那枚拼团按钮 */
    gbReady(entry) {
      this.gbEntry = entry;
      this.gbInTeam = !!(entry && entry.inTeam);
      this.gbJoinMode = !!(entry && entry.join);
      // 价格卡那一排切到拼团价（2026-10-29 统一口径）：`spec_id` 就是 sku 下标
      this.gbActivity = (entry && entry.activity) || null;
      this.gbBuyers = (entry && entry.activity && entry.activity.buyers) || [];
    },
    /** 这一档（sku 下标）在拼团里的价；没有活动 / 这一档没配拼团价 ⇒ 空串，卡面回落原价。
     *  参团（2026-10-30）：团长那一档仍显示团快照价（后端 `Gate::joinUnit()` 同源），
     *  换到别的时长按该档现价 —— 页面上每一档都是「你自己选它会付多少」。 */
    gbSkuPrice(index) {
      const act = this.gbActivity;
      const rows = (act && act.specs) || [];
      const hit = rows.filter((r) => Number(r.spec_id) === Number(index))[0];
      if (this.gbJoinCtx && Number(this.gbJoinCtx.specId) === Number(index)
        && Number(this.gbJoinCtx.price) > 0) {
        return this.gbJoinCtx.price;
      }
      // 阶梯型：参团人数档由团快照定死，换时长要按「该时长在这一档人数下的价」显示
      if (this.gbJoinCtx && act && act.type === 'ladder' && Number(this.gbJoinCtx.ladderId) > 0) {
        const tier = (act.ladder || []).filter((l) => Number(l.id) === Number(this.gbJoinCtx.ladderId)
          && Number(l.spec_id) === Number(index))[0];
        if (tier) { return tier.price; }
      }
      return hit ? hit.price : '';
    },
    /** 底栏「立即开团」：就地开拼团区那只凑团弹层 */
    openGb() { if (this.$refs.gbArea) { this.$refs.gbArea.openPopup(); } },
    /**
     * 拼团入口点的「立即开团」（`host-spec`）：会员卡页上那排「N天 / ¥x」选项卡就是它自己的规格组件
     * （`changeSku`），所以直接用当前选中那一档 —— `skuIndex` 就是拼团 spec_id（后端 `VipcardSpec`
     * 按下标取档，与 `卡ID_下标` 同一份口径），不再让拼团弹窗重复摆一排时长。
     */
    openGbSpec() {
      if (!this.$refs.gbArea) { return; }
      // 规格（`skuIndex` 就是拼团 spec_id）与页面上选中的人数额一并交回（2026-10-29）：
      // 会员卡的规格卡没有弹窗，档位块就摆在拼团区页面上，选中项只存拼团区一处
      this.$refs.gbArea.afterSpec({ specId: this.skuIndex, ladderId: this.$refs.gbArea.currentPick().ladderId });
    },

    //刷新
    refresh() {
      this.getData();
      // 下拉刷新是这一块的唯一强制重载出口（活动结束/名额满了都靠它把整段收掉）
      if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
    },
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  onShow() {
    that = this;
    // 从下单/支付退回来：只重取拼团区（整页重取会把人滑到的卡与已选规格打回去）
    if (!that.gbPending) { return; }
    that.gbPending = false;
    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    // 受邀参团：URL 上那一组 gb_* 只活在本页实例上；初值先置真，拼团区取到活动后由 `@ready.join` 校准
    that.gbJoinCtx = readGroupBuyJoin(that.pageParams);
    that.gbJoinMode = !!that.gbJoinCtx;
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
