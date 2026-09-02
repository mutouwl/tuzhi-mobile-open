<script>
var that;

export default {
  data() {
    return {
      id: 0,
      loading: true,
      info: null,
      loadMsg: '',
      currentSpec: null,
      showSpec: false,
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
    };
  },
  onLoad(options) {
    that = this;
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
      return;
    }
    that.load();
  },
  onPullDownRefresh() {
    that.load();
  },
  onReady() {
    // 首次进入也做一次页面级实测（不依赖事件）
    that.detectTabBar();
  },
  onUnload() {
    uni.$off('tabBarVisibleChange', that.onTabbarVisible);
  },
  methods: {
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
    },
    async load() {
      uni.showLoading({ title: '加载中…' });
      try {
        const res = await that.$api('circle.circle.presale', { id: that.id });
        uni.hideLoading();
        uni.stopPullDownRefresh();
        if (res.code === 1) {
          that.info = res.data;
          that.applyInfo(res.data);
          if (that.info.specs && that.info.specs.length) {
            that.currentSpec = that.info.specs[0];
          }
          // #ifdef H5
          this.$nav.share(that.info.name, '', that.info.cover);
          // #endif
          that.loading = false;
        } else {
          // 圈子不存在/已下架等状态异常：空状态展示对应说明（文案以后端返回为准）
          that.loading = false;
          that.loadMsg = res.msg || '圈子不存在';
          uni.showToast({ title: that.loadMsg, icon: 'none' });
        }
      } catch (e) {
        // 网络异常兜底：避免加载态卡死，空状态可下拉重试
        uni.hideLoading();
        uni.stopPullDownRefresh();
        that.loading = false;
        that.loadMsg = '网络异常，请下拉重试';
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
    handleBuy() {
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
      if (that.isBanned) {
        that.onBanned();
        return;
      }
      that.showSpec = true;
    },
    confirmSpec() {
      if (that.isBanned) {
        that.onBanned();
        return;
      }
      if (!that.currentSpec) {
        uni.showToast({ title: '请选择有效期', icon: 'none' });
        return;
      }
      that.showSpec = false;
      const goodsList = [{
        goodsId: that.id,
        goodsType: 'circle',
        count: 1,
        extend: that.currentSpec.id + '_' + that.currentSpec.price
      }];
      that.$nav.to('/pages/order/submit/submit?type=circle&goodsList=' + JSON.stringify(goodsList));
    }
  },
  onShareAppMessage() {
    return this.$nav.share(that.info ? that.info.name : '', '', that.info ? that.info.cover : '');
  }
};
</script>
