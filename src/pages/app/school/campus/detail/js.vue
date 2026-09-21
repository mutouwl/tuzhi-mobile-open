<script>
export default {
  data() {
    return {
      id: 0,
      form: { info: {}, packages: [], teachers: [] },
      teacherPopup: false,
      contactPopup: false,
      contactType: 'phone',
      skeletonLoading: true,
      installed: true,
      loadError: false,
    };
  },
  computed: {
    // 空态文案：校区不存在（停用）/加载失败（异常）两种口径
    emptyText() { return this.loadError ? '加载失败，请重试' : '校区不存在或已停用'; },
    // 环境图为轮播图来源；未上传环境图时回退校区 LOGO，均无则渲染占位
    banners() {
      const env = this.form.info.environment || [];
      if (env.length) return env.map((i) => (i && i.url) || i);
      return this.form.info.logo ? [this.form.info.logo] : [];
    },
    // 分享卡片封面：环境图首图（未上传环境图时 banners 已回退校区 LOGO，均无则由 $nav.share 回退站点 logo）
    shareCover() { return this.banners[0] || ''; },
    // 联系电话 11 位按 3 4 4 展示，座机等原样展示
    phoneText() { return this.$tools.formatPhone(this.form.info.contact_phone); },
    // 操作弹窗标题（电话与地址共用一个弹窗，仅标题与主操作不同）
    contactPopupTitle() { return this.contactType === 'phone' ? '联系电话' : '校区地址'; },
    // 校区定位（gcj02），后台未设置定位时交给弹窗组件判定为无效坐标、走退化方案
    campusLocation() {
      const info = this.form.info;
      return {
        latitude: Number(info.lat),
        longitude: Number(info.lng),
        name: info.name || '',
        address: info.address || '',
      };
    },
  },
  onLoad(options) {
    if (!this.$tools.systemConfig('app_isinstall_school')) {
      this.installed = false;
      uni.showToast({ title: '该功能未开通', icon: 'none' });
      setTimeout(() => {
        if (getCurrentPages().length > 1) { uni.navigateBack(); } else { uni.reLaunch({ url: '/pages/index/index' }); }
      }, 800);
      return;
    }
    this.id = options.id;
  },
  onShow() { if (this.installed) this.getData(); },
  onPullDownRefresh() { this.getData(); uni.stopPullDownRefresh(); },
  methods: {
    getData() {
      this.$api('school.campus.detail', { id: this.id }).then((ret) => {
        // 全局拦截器对 code=0 只 toast 不 reject，须校验业务码；失败落到空态
        if (ret && ret.code === 1 && ret.data) {
          this.form = { info: ret.data.info || {}, packages: ret.data.packages || [], teachers: ret.data.teachers || [] };
          // 页面标题跟随校区名称（原为固定的「校区详情」），H5 同步浏览器/微信顶部标题，小程序同步导航栏标题；
          // 微信分享卡片标题取校区名称、封面取环境图、副标题取校区地址（地址为空时由 $nav.share 兜底「打开查看详情」）
          if (this.form.info.name) {
            uni.setNavigationBarTitle({ title: this.form.info.name });
            // #ifdef H5
            this.$nav.share(this.form.info.name, this.form.info.address || '', this.shareCover);
            // #endif
          }
        }
        this.skeletonLoading = false;
      }).catch(() => {
        this.loadError = true;
        this.skeletonLoading = false;
      });
    },
    // 课程套餐超出三个，跳转课程套餐列表并按校区筛选
    morePackages() {
      this.$nav.to('/pages/app/school/package/list/list?campus_id=' + this.id);
    },
    // 打开联系电话/地址操作弹窗：号码（地址）为空时直接返回，不弹空弹窗
    openContact(type) {
      if (type === 'phone' && !this.form.info.contact_phone) return;
      if (type === 'address' && !this.form.info.address) return;
      this.contactType = type;
      this.contactPopup = true;
    },
    // 环境图全屏预览（同实物商品详情）
    previewImage(index) {
      uni.previewImage({ urls: this.banners, current: index });
    },
  },
  // 小程序转发卡片：标题取校区名称、封面取环境图（H5 的微信分享由 getData 里 $nav.share 走 JSSDK 设置；
  // 朋友圈卡片用 time_line 口径回传 query 而非 path，否则带 id 的页面参数会丢）
  onShareAppMessage() {
    return { ...this.$nav.share(this.form.info.name, '', this.shareCover), imageUrl: this.shareCover };
  },
  onShareTimeline() {
    return { ...this.$nav.share(this.form.info.name, '', this.shareCover, 'time_line'), imageUrl: this.shareCover };
  },
};
</script>
