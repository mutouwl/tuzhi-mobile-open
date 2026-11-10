<script>
// 拼团「加入别人的团」上下文（团详情「立即加入」带 gb_team 一组参数进本页）
import { readGroupBuyJoin } from '@/common/utils/group-buy-join.js';
import scoreExchange from '@/common/mixins/score-exchange.js';
var that;

export default {
  mixins: [scoreExchange],
  data() {
    return {
      id: 0,
      loading: true,
      info: null,
      loadMsg: '',
      currentSpec: null,
      // 未裁剪的规格清单（取数时的原样）：兑换模式的裁剪每次都从这一份重算
      rawSpecs: [],
      showSpec: false,
      // 「这一次开规格弹层是为了拼团」（2026-10-29）：确认时把有效期那一档交回拼团区
      gbPicking: false,
      tabs: [{ name: '详情' }, { name: '动态预览' }],
      tab: 0,
      // 模板可读状态：uni-app Vue2 小程序端 WXML 无法读取 computed（渲染函数不会把
      // computed 写入页面数据模型，绑定解析为 undefined），必须用 data 承载并在加载后写入
      joinStatus: 'none',
      isBanned: false,
      isFull: false,
      minPrice: '0.00',
      coinName: '',
      isVirtualPay: false,
      // tabbar 页面（圈子为导航 tab 时）tabbar 实际高度与 H5 位移，用于底部操作栏避让
      tabbarVisible: false,
      tabbarHeight: 0,
      tabbarOffset: 0,
      // 拼团区「这一趟是被送去下单的」那本账：回本页时只静默重取拼团区那两条，
      // 不在 onShow 里顺手重取圈子本体（这一页 info 只随 onLoad 与下拉刷新取，动它是另一件事）
      // 拼团活动本体（拼团区 @ready 上抛）：规格弹窗按它出拼团价与档位，2026-10-30 起横幅不在价格格
      gbActivity: null,
      gbBuyers: [],
      gbPending: false,
      // 拼团区经 @ready 上抛的活动摘要（{ text } / null）：底栏那枚拼团按钮的显隐与文案吃它
      gbEntry: null,
      // 同一份摘要里的 `inTeam`（我正在这一场有进行中的团）：底栏「立即购买 / 续费 / 立即续费」
      // 三支共用这一枚标记收起，抵掉「一场团在飞还能再买一次」（2026-10-27 PRD）。本页此前三支
      // 都没判，且拼团入口只挂在「未加入」那一支 —— 2026-10-29 用户点名「拼团商品没有下单按钮」
      gbInTeam: false,
      // 受邀参团（2026-10-30）：URL 带 gb_team 时进 join 态，底栏只留「加入拼团」；
      // 页内规格入口在 join 态改开拼团那只有锁定规格的弹窗。退出本页就没了（不落 storage）
      gbJoinCtx: null,
      gbJoinMode: false,
      // 送好友（2026-10-28）：本页那枚入口是 `manual` 模式，点它先选有效期再走送礼下单页；
      // 这一枚标记「当前这次规格弹层是送礼用的」，确认后走 `sf=1` 那一支，不污染立即购买
      giftMode: false,
      // 入口那一次下发的份数上限：确认规格时可能正在按新规格重取 flag，先把它收下来兜住
      giftMax: 0,
      // 规格弹层里那行续费提示（老成员续费打折）：WXML 读不到 computed，落成 data 由 `applyInfo` 写
      renewTip: '',
    };
  },
  onLoad(options) {
    that = this;
    this.initScoreExchange(options);
    // 受邀参团：URL 上那一组 gb_* 只活在本页实例上；初值先置真，拼团区取到活动后由 `@ready.join` 校准
    that.gbJoinCtx = readGroupBuyJoin(options);
    that.gbJoinMode = !!that.gbJoinCtx;
    // tabbar 可见状态订阅（全局总线，与组件事件桥接无关，小程序端必达）
    uni.$on('tabBarVisibleChange', that.onTabbarVisible);
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
      that.loadMsg = '圈子不存在';
      return;
    }
    that.id = id;
    // 圈子插件未安装时兜底
    if (!that.$tools.systemConfig("app_isinstall_circle")) {
      uni.showToast({ title: "圈子功能未安装", icon: "none" });
      setTimeout(() => uni.navigateBack(), 1200);
      that.loading = false; // 兜底分支也要撤骨架：这一页只弹一句 toast 就留在灰块上，看着像「一直加载中」
      return;
    }
    that.load();
  },
  onPullDownRefresh() {
    that.load();
    // 下拉是本块唯一的强制重载出口：拼团区跟着重取它自己那两条（活动结束就把整段收掉）
    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
  },
  /**
   * 从拼团区去下单/支付那几跳退回来：只有「这一趟是被拼团区送出去的」才静默重取拼团区
   * （硬约束 16 的正半句「退回哪一页，就由那一页自己在 onShow 重取」，取的是那一块、不是整页）。
   * 开团/参团付完款要看见自己那一行，活动结束或名额满了要把那一段收掉，都只靠拼团区自己那两条；
   * 圈子本体（info/规格/加入状态）一律不动 —— 那一样在这一页只随 onLoad 与下拉刷新取。
   */
  onShow() {
    // M23 硬要求：用了模块级 that 的页面，onShow 的第一条语句必须把它收回当前实例
    that = this;
    if (!that.gbPending) { return; }
    that.gbPending = false;
    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
  },
  onReady() {
    // 首次进入也做一次页面级实测（不依赖事件）
    that.detectTabBar();
  },
  onUnload() {
    uni.$off('tabBarVisibleChange', that.onTabbarVisible);
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
    }
  },
  methods: {
    /**
     * 拼团区（`components/tz/group-buy-area.vue`）要把人带去下单：
     * 导航由组件自己发（它才知道选了哪一档、凑的是哪一个团），本页只记这一枚「去过了」的账，
     * 回来由 onShow 兑。用 `this` 不用模块级 `that`：这一枚是模板上的事件处理器。
     */
    gbGoPay() {
      this.gbPending = true;
    },
    /**
     * 拼团区 @ready：活动摘要收下来喂给底栏那枚拼团按钮（摘要字符串由组件算好，本页不加工）。
     * 第二枚 `inTeam` 单独落一格 data：模板里三支购买按钮（立即购买 / 续费 / 立即续费）共用它，
     * 收起判据只存这一处（本页不读 `my_team`、也不按团状态自己拼）。
     */
    gbReady(entry) {
      this.gbEntry = entry;
      this.gbInTeam = !!(entry && entry.inTeam);
      this.gbJoinMode = !!(entry && entry.join);
      this.gbActivity = (entry && entry.activity) || null;
      this.gbBuyers = (entry && entry.activity && entry.activity.buyers) || [];
    },
    /** 底栏「¥xx 拼团」按钮：就地开拼团区那只凑团弹层（壳挂在拼团区组件里，不走页面导航） */
    openGb() {
      if (this.$refs.gbArea) { this.$refs.gbArea.openPopup(); }
    },
    /**
     * 将圈子状态写入模板可读的 data 字段：
     * uni-app Vue2 小程序端 WXML 读不到 computed（渲染函数不注入 computed），
     * 页面模板与逻辑统一从这里取状态，保证 H5 与小程序行为一致
     */
    applyInfo(info) {
      if (!info) return;
      this.joinStatus = info.join_status || 'none';
      this.isBanned = Number(info.is_banned) === 1;
      this.isFull = Number(info.is_full) === 1 && this.joinStatus === 'none';
      const prices = (info.specs || []).map(s => Number(s.price));
      this.minPrice = prices.length ? Math.min.apply(null, prices).toFixed(2) : '0.00';
      this.coinName = this.$tools.systemConfig('coin_name') || '金币';
      this.isVirtualPay = Number(info.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
      // 规格弹层那行续费提示：只在「已过期 + 付费圈 + 商家配了续费折扣」这一档出现（判据与改造前同一条）
      const discount = Number(info.renew_discount) || 0;
      this.renewTip = (this.joinStatus === 'expired' && Number(info.sell_type) === 2 && discount > 0)
        ? ('老成员续费享 ' + info.renew_discount + ' 折') : '';
    },
    /**
     * 积分商品详情到手（mixins 回调）：规格清单裁成「商家勾过的那几档」
     *
     * 圈子的规格 id 就是 `app_circle_spec.id`，下单在 `extend` 里带 `规格id_价格`
     * （`goods\Circle::getPayDetail()` 按 `_` 拆），裁剪只动展示，不需要下标映射。
     */
    onScoreExchangeReady() {
      if (!that.isScoreExchange) { return; }
      if (that.scoreExchangeError) {
        that.info = null;
        that.loading = false;
        that.loadMsg = that.scoreExchangeError;
        uni.showToast({ title: that.scoreExchangeError, icon: 'none' });
        return;
      }
      that.applyScoreSpecScope();
    },
    /** 按 `rawSpecs` 重裁一次（幂等：每次从原清单算） */
    applyScoreSpecScope() {
      if (!that.info) { return; }
      const base = Array.isArray(that.rawSpecs) ? that.rawSpecs : (that.info.specs || []);
      const list = that.scoreHasSpec
        ? that.scoreSpecOptions(base).map((row) => row.item)
        : base;
      that.info.specs = list;
      // 最低价跟着裁过的清单走（不裁则仍按整个规格表算，展示价会低于实际可兑价）
      const prices = list.map((row) => Number(row.price));
      that.minPrice = prices.length ? Math.min.apply(null, prices).toFixed(2) : '0.00';
      if (!list.length) {
        that.currentSpec = null;
        return;
      }
      const keep = that.currentSpec
        ? list.find((spec) => Number(spec.id) === Number(that.currentSpec.id))
        : null;
      that.currentSpec = keep || list[0];
    },
    async load() {
      try {
        const res = await that.$api('circle.circle.presale', { id: that.id });
        uni.stopPullDownRefresh();
        if (res && res.code === 1) {
          that.info = res.data;
          // 未裁剪的规格清单留一份（兑换模式的裁剪每次都从它重算，不拿裁过的再裁）
          that.rawSpecs = Array.isArray(that.info.specs) ? that.info.specs.slice() : [];
          that.applyInfo(res.data);
          // 兑换模式：只摆商家勾过的那几档（判据在后端 `spec_ids`，前端不重判）
          if (that.isScoreExchange) {
            that.applyScoreSpecScope();
          }
          if (that.info.specs && that.info.specs.length) {
            // 受邀参团：页面上那档有效期先落到团上那一档（点加入拼的是另一档就自相矛盾）
            const joinSpec = that.gbJoinCtx
              ? that.info.specs.find((s) => Number(s.id) === Number(that.gbJoinCtx.specId))
              : null;
            that.currentSpec = joinSpec || that.info.specs[0];
          }
          // #ifdef H5
          this.$nav.share(that.info.name, '', that.info.cover);
          // #endif
          that.loadMsg = '';
          that.loading = false;
        } else {
          // 圈子不存在/已下架等状态异常：空状态展示对应说明（文案以后端返回为准）
          that.loading = false;
          that.loadMsg = (res && res.msg) || '圈子不存在';
          uni.showToast({ title: that.loadMsg, icon: 'none' });
        }
      } catch (e) {
        // 网络异常兜底：避免加载态卡死，空状态可下拉重试
        uni.stopPullDownRefresh();
        that.loading = false;
        that.loadMsg = (e && (e.msg || e.errMsg)) || '网络异常，请下拉重试';
        uni.showToast({ title: that.loadMsg, icon: 'none' });
      }
    },
    previewQr(url) {
      uni.previewImage({ urls: [url] });
    },
    onTabbarVisible(e) {
      // #ifdef MP-WEIXIN
      console.log('[presale] onTabbarVisible', e);
      // #endif
      this.tabbarVisible = e.visible;
      this.tabbarHeight = e.height || 0;
      this.tabbarOffset = e.offset || 0;
      // 事件证实 tabbar 已渲染：立即用页面级实测高度校正（组件作用域查询无法穿透
      // 子孙自定义组件，只能从页面测；实测高度在 DevTools/真机间自适应）
      that.detectTabBar();
    },
    /**
     * 页面级实测 tabbar 高度：retry 直到命中，命中后覆盖 tabbarHeight。
     * 仅上补（upsert），不做复位，避免把事件通道写入的状态踩掉。
     */
    detectTabBar() {
      this._tabBarDetectTimes = 0;
      this._detectTabBarOnce();
    },
    _detectTabBarOnce() {
      const query = uni.createSelectorQuery().in(this);
      query.select('.t-tab-bar').boundingClientRect(rect => {
        if (rect && rect.height) {
          this.tabbarVisible = true;
          this.tabbarHeight = rect.height;
          // #ifdef MP-WEIXIN
          console.log('[presale] detectTabBar height', rect.height);
          // #endif
          return;
        }
        if (this._tabBarDetectTimes < 8) {
          this._tabBarDetectTimes++;
          setTimeout(() => this._detectTabBarOnce(), 120);
        }
      }).exec();
    },
    goHome() {
      // 项目无原生 tabBar（自定义 t-tab-bar），switchTab 跳非 tab 页会静默失败；统一用 reLaunch
      that.$nav.to('/pages/index/index', 'local', 'reLaunch');
    },
    goCoupons() {
      // 优惠券功能预留
      uni.showToast({ title: '优惠券功能即将上线', icon: 'none' });
    },
    goIndex() {
      that.$nav.to('/pages/app/circle/index/index?id=' + that.id);
    },
    onFull() {
      uni.showToast({ title: '该圈子已满员，暂无法加入', icon: 'none' });
    },
    onBanned() {
      uni.showToast({ title: (that.info && that.info.ban_text) || '你已被封禁，无法加入该圈子', icon: 'none' });
    },
    async freeJoin() {
      if (that.isBanned) {
        that.onBanned();
        return;
      }
      if (that.isFull) {
        that.onFull();
        return;
      }
      const res = await that.$api('circle.circle.join', { id: that.id });
      if (res.code === 1) {
        uni.showToast({ title: '加入成功', icon: 'success' });
        setTimeout(() => that.goIndex(), 600);
      } else {
        uni.showToast({ title: res.msg || '加入失败', icon: 'none' });
      }
    },
    /**
     * 送好友入口点击（`send-friend-area` 的 `@open`，manual 模式：导航还没发）
     *
     * 圈子是按有效期卖规格的：送礼也要选同一档有效期，所以复用本页那只规格弹层，
     * `giftMode` 只是把「确认」那一支切到 `sf=1` 的送礼下单页。
     * **几档都要弹**：「立即购买」无论几档都先选有效期，送礼少这一拍就会读成
     * 「送好友不走规格」（2026-10-28 用户实报：单档圈的送礼直接跳下单页、没有选择弹窗）。
     */
    onGiftOpen(payload) {
      if (that.isBanned) {
        that.onBanned();
        return;
      }
      that.giftMax = Number((payload && payload.max_per_order) || 0) || 0;
      const specs = (that.info && that.info.specs) || [];
      if (!specs.length) {
        uni.showToast({ title: '暂无可用规格', icon: 'none' });
        return;
      }
      that.giftMode = true;
      that.showSpec = true;
    },
    /** 规格弹层里点了一档：选中态仍存在页面这一份 `currentSpec`（价格区与两处确认共用） */
    onSpecPick(spec) {
      if (spec) { that.currentSpec = spec; }
    },
    /** 送礼下单页：落页只认组件拼的那一条（`sf=1` + `extend` + `sf_max`） */
    goGift() {
      const spec = that.currentSpec || ((that.info && that.info.specs && that.info.specs[0]) || null);
      if (!spec) {
        uni.showToast({ title: '请选择有效期', icon: 'none' });
        return;
      }
      that.giftMode = false;
      that.showSpec = false;
      const area = that.$refs.sfCard;
      if (!area || typeof area.submitUrlFor !== 'function') { return; }
      that.$nav.to(area.submitUrlFor(spec.id + '_' + spec.price, that.giftMax), 'local');
    },
    /** 规格弹层关闭：送礼那一支的标记跟着复位，下一次「立即购买」不会被当成送礼 */
    closeSpec() {
      that.showSpec = false;
      that.giftMode = false;
      that.gbPicking = false;
    },
    handleBuy() {
      that.giftMode = false;
      if (that.isBanned) {
        that.onBanned();
        return;
      }
      if (that.isFull) {
        that.onFull();
        return;
      }
      if (!that.info.specs || !that.info.specs.length) {
        uni.showToast({ title: '暂无可用规格', icon: 'none' });
        return;
      }
      that.showSpec = true;
    },
    handleRenew() {
      that.giftMode = false;
      if (that.isBanned) {
        that.onBanned();
        return;
      }
      that.showSpec = true;
    },
    /** 拼团入口点的「立即开团」：规格（有效期）交给本页这只 `tz-circle-spec-popup` 选 */
    openGbSpec() {
      that.gbPicking = true;
      that.showSpec = true;
    },
    confirmSpec(spec, ladderId) {
      if (that.isBanned) {
        that.onBanned();
        return;
      }
      if (!that.currentSpec) {
        uni.showToast({ title: '请选择有效期', icon: 'none' });
        return;
      }
      // 拼团那一趟：规格（与阶梯型的人数额）收完直接交回拼团区，不落普通购买；
      // 人数额由规格弹层第二个参数带出（送礼 / 普通购买不收，逐字不变）
      if (that.gbPicking) {
        that.gbPicking = false;
        that.showSpec = false;
        that.$refs.gbArea.afterSpec({ specId: that.currentSpec.id, ladderId: ladderId || 0 });
        return;
      }
      // 送礼那一支：规格选完直接走送礼下单页（`sf=1`），不落普通购买
      if (that.giftMode) {
        that.goGift();
        return;
      }
      that.showSpec = false;
      const goodsList = [that.withScoreGoods({
        goodsId: that.id,
        goodsType: 'circle',
        count: 1,
        extend: that.currentSpec.id + '_' + that.currentSpec.price
      })];
      that.$nav.to('/pages/order/submit/submit?type=circle&goodsList=' + JSON.stringify(goodsList));
    }
  },
  onShareAppMessage() {
    return this.$nav.share(that.info ? that.info.name : '', '', that.info ? that.info.cover : '');
  }
};
</script>
