<script>
export default {
  data() {
    return {
      id: 0,
      form: { info: {}, packages: [], campuses: [] },
      contactPopup: false,
      skeletonLoading: true,
      installed: true,
      loadError: false,
      avatarError: false,
    };
  },
  computed: {
    // 空态文案：教师不存在（停用）/加载失败（异常）两种口径
    emptyText() { return this.loadError ? '加载失败，请重试' : '教师不存在或已停用'; },
    // 分享卡片封面：老师头像（老师表只有头像一张图，缺失时由 $nav.share 回退站点 logo）
    shareCover() { return this.form.info.avatar || ''; },
    // 联系电话 11 位按 3 4 4 展示，座机等原样展示
    phoneText() { return this.$tools.formatPhone(this.form.info.phone); },
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
      this.$api('school.teacher.detail', { id: this.id }).then((ret) => {
        // 全局拦截器对 code=0 只 toast 不 reject，须校验业务码；失败落到空态
        if (ret && ret.code === 1 && ret.data) {
          this.form = {
            info: ret.data.info || {},
            // 授课课程套餐：后端由排课关联课程反查对应课程套餐（含价格/标签）
            packages: ret.data.packages || [],
            campuses: ret.data.campuses || [],
          };
          // 页面标题跟随老师姓名（原为固定的「教师详情」），H5 同步浏览器/微信顶部标题，小程序同步导航栏标题；
          // 微信分享卡片标题取老师姓名、封面取老师头像
          if (this.form.info.name) {
            uni.setNavigationBarTitle({ title: this.form.info.name });
            // #ifdef H5
            this.$nav.share(this.form.info.name, '', this.shareCover);
            // #endif
          }
          // 重新拉取后允许头像再次尝试加载
          this.avatarError = false;
        }
        this.skeletonLoading = false;
      }).catch(() => {
        this.loadError = true;
        this.skeletonLoading = false;
      });
    },
    // 头像加载失败：切图片图标占位（对齐校区 LOGO 兜底）
    onAvatarError() {
      this.avatarError = true;
    },
    // 授课课程「更多」：跳课程套餐列表页并按讲师筛选（同校区详情按 campus_id 进入）
    morePackages() {
      this.$nav.to('/pages/app/school/package/list/list?teacher_id=' + this.id);
    },
    // 跳转校区详情页
    goCampus(c) {
      this.$nav.to('/pages/app/school/campus/detail/detail?id=' + c.id);
    },
    // 打开联系电话操作弹窗（复制 / 拨打）：号码为空时直接返回，不弹空弹窗
    openContact() {
      if (!this.form.info.phone) return;
      this.contactPopup = true;
    },
  },
  // 小程序转发卡片：标题取老师姓名、封面取老师头像（H5 的微信分享由 getData 里 $nav.share 走 JSSDK 设置；
  // 朋友圈卡片用 time_line 口径回传 query 而非 path，否则带 id 的页面参数会丢）
  onShareAppMessage() {
    return { ...this.$nav.share(this.form.info.name, '', this.shareCover), imageUrl: this.shareCover };
  },
  onShareTimeline() {
    return { ...this.$nav.share(this.form.info.name, '', this.shareCover, 'time_line'), imageUrl: this.shareCover };
  },
};
</script>