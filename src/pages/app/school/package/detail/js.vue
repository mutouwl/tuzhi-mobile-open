<script>
import PackageSkuSelectModal from '../components/package-sku-select-modal.vue';
export default {
        components: { PackageSkuSelectModal },
        data() {
            return { id: 0, form: { banners: [], campus_list: [], skus: [], tags: [], teachers: [] }, activeCampus: 0, activeSku: 0, skuPopup: false, teacherPopup: false, skeletonLoading: true, installed: true, missing: false, loadError: false };
        },
        computed: {
            courseIntroduction() {
                return [this.form.detail, this.form.intro].find((content) => {
                    if (typeof content !== 'string') return false;
                    const html = content.replace(/<!--[\s\S]*?-->/g, '');
                    if (/<(?:img|video|audio|iframe|embed|object)\b/i.test(html)) return true;
                    return html.replace(/<[^>]*>/g, '')
                        .replace(/&(?:nbsp|#0*160|#x0*a0);/gi, '')
                        .replace(/[\s\u200b\ufeff]/g, '').length > 0;
                }) || '';
            },
            emptyText() { return this.loadError ? '加载失败，请重试' : '套餐不存在或已下架'; },
            minPrice() {
                const prices = (this.form.skus || []).map((s) => parseFloat(s.price));
                return prices.length ? Math.min.apply(null, prices) : 0;
            },
            totalLessons() {
                const sku = (this.form.skus || [])[this.activeSku];
                if (!sku) return 0;
                return (sku.courses || []).reduce((sum, c) => sum + parseFloat(c.lessons || 0), 0);
            },
            currentSku() {
                return (this.form.skus || [])[this.activeSku] || { name: '', courses: [] };
            },
            salesBalanceTag() {
                // 详情页标题下方销量余量：仅当后台开启且存在有限量规格时展示，余量为聚合各规格余量之和
                return this.form.sales_balance_enabled ? '仅剩 ' + this.form.sales_balance + ' 份' : '';
            },
            // 分享封面取套餐封面，封面缺失时回退轮播首图（与商品详情页 shareCover 同口径）
            shareCover() {
                const banner = (this.form.banners || [])[0];
                return this.form.cover || (banner && (banner.url || banner)) || '';
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
            this.id = this.$nav.parsePageParams(options).id;
        },
        onShow() { if (this.installed) this.getData(); },
        onPullDownRefresh() { this.getData(); uni.stopPullDownRefresh(); },
        methods: {
            getData() {
                this.$api('school.package.detail', { id: this.id }).then((ret) => {
                    // 全局拦截器对 code=0 只 toast 不 reject，须校验业务码；套餐不存在/已下架落空态
                    if (ret && ret.code === 1 && ret.data) {
                        this.form = ret.data;
                        this.activeCampus = (ret.data.campus_list || [])[0] ? ret.data.campus_list[0].id : 0;
                        // 页面标题跟随套餐名称（原为固定的「课程详情」）：H5 同步浏览器/微信顶部标题，小程序同步导航栏标题
                        // 分享卡片同步用套餐名称 + 套餐封面（与商品、课程详情页同口径）
                        if (ret.data.name) {
                            uni.setNavigationBarTitle({ title: ret.data.name });
                            // #ifdef H5
                            this.$nav.share(ret.data.name, '', this.shareCover);
                            // #endif
                        }
                    } else {
                        this.missing = true;
                    }
                    this.skeletonLoading = false;
                }).catch(() => {
                    this.loadError = true;
                    this.skeletonLoading = false;
                });
            },
            buy() { this.skuPopup = true; },
            // 跳转校区详情页
            goCampus(c) {
                this.$nav.to('/pages/app/school/campus/detail/detail?id=' + c.id);
            },
            // 确认报名 → 进入确认报名页（校区/套餐在弹层内选定，学生与金额在确认页核对）
            confirmSku() {
                this.skuPopup = false;
                this.$nav.to('/pages/app/school/package/confirm/confirm?id=' + this.id + '&sku=' + this.activeSku + '&campus=' + this.activeCampus);
            },
        },
        // 小程序转发卡片：标题取套餐名称、封面取套餐封面（H5 的微信分享由上面 onShow 数据回来后 $nav.share 走 JSSDK 设置）
        onShareAppMessage() { return this.$nav.share(this.form.name, '', this.shareCover); },
        onShareTimeline() { return this.$nav.share(this.form.name, '', this.shareCover); },
    };
</script>
