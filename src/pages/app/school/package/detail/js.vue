<script>
import PackageSkuSelectModal from '../components/package-sku-select-modal.vue';
// 拼团「加入别人的团」上下文（团详情「立即加入」带 gb_team 一组参数进本页）
import { readGroupBuyJoin } from '@/common/utils/group-buy-join.js';
// 拼团下单上下文（扁平 gb_* 键）在「确认报名页 → 结算页」之间的搬运：键名与确认页地址只存那一处
import { groupBuyConfirmUrl } from '@/common/utils/group-buy-order.js';
// 拼团价（规格 + 档位两轴）：确认报名页头区要显示与规格弹窗同一个数
import { gbPriceOf } from '@/common/utils/group-buy-spec.js';
export default {
        components: { PackageSkuSelectModal },
        data() {
            return { id: 0, form: { banners: [], campus_list: [], skus: [], tags: [], teachers: [] }, activeCampus: 0, activeSku: 0, skuPopup: false, teacherPopup: false, skeletonLoading: true, installed: true, missing: false, loadError: false,
                // 拼团区（2026-10-28）：从下单页退回来只重取那一块（本页不用模块级 that，直接用 this）
                gbPending: false, gbEntry: null,
                // 拼团活动本体（拼团区 @ready 上抛的 `entry.activity` 镜像）：规格弹窗按它出拼团价与档位
                gbActivity: null,
                gbBuyers: [],
                // 「这一次开「选套餐」弹窗是为了拼团」（2026-10-29）：确认时把套餐规格 + 校区交回拼团区，
                // 不落普通报名链；关弹窗复位，下一次「立即报名」不受影响
                gbPicking: false,
                // 「我在这一场拼团里已有进行中的团」：底栏那枚「立即报名」收不收吃它（PRD 2026-10-27）。
                // 判据只认拼团区 @ready 上抛的 inTeam（后端 GoodsArea::myTeam），页面不读 my_team 自己拼
                gbInTeam: false,
                // 受邀参团（2026-10-30）：URL 带 gb_team 时进 join 态，底栏只留「加入拼团」；
                // 「选择套餐」那一行改开拼团那只有锁定规格的弹窗。退出本页就没了（不落 storage）
                gbJoinCtx: null,
                gbJoinMode: false };
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
            // 受邀参团：URL 上那一组 gb_* 只活在本页实例上；初值先置真，拼团区取到活动后由 `@ready.join` 校准
            this.gbJoinCtx = readGroupBuyJoin(this.$nav.parsePageParams(options));
            this.gbJoinMode = !!this.gbJoinCtx;
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
        onShow() {
            // 从下单/支付退回来：只重取拼团区（整页重取会把已经选好的校区/规格打回去）
            if (this.gbPending) {
                this.gbPending = false;
                if (this.$refs.gbArea) { this.$refs.gbArea.reload(); }
                return;
            }
            if (this.installed) this.getData();
        },
        onPullDownRefresh() {
            this.getData();
            // 下拉刷新是这一块的唯一强制重载出口（活动结束/名额满了都靠它把整段收掉）
            if (this.$refs.gbArea) { this.$refs.gbArea.reload(); }
            uni.stopPullDownRefresh();
        },
        methods: {
            /** 拼团区把人送去下单：本页只记这一枚账，回来由 onShow 兑 */
            gbGoPay() { this.gbPending = true; },
            /** 拼团区 @ready：摘要收下来喂底栏那枚拼团按钮 */
            gbReady(entry) {
                this.gbEntry = entry;
                this.gbInTeam = !!(entry && entry.inTeam);
                this.gbJoinMode = !!(entry && entry.join);
                // 原价行与横幅共用这一枚：活动到期/失败时拼团区抛 null ⇒ 原价行自动回来
                this.gbActivity = (entry && entry.activity) || null;
                this.gbBuyers = (entry && entry.activity && entry.activity.buyers) || [];
            },
            /** 底栏「立即开团」：就地开拼团区那只凑团弹层 */
            openGb() { if (this.$refs.gbArea) { this.$refs.gbArea.openPopup(); } },
            getData() {
                this.$api('school.package.detail', { id: this.id }).then((ret) => {
                    // 全局拦截器对 code=0 只 toast 不 reject，须校验业务码；套餐不存在/已下架落空态
                    if (ret && ret.code === 1 && ret.data) {
                        this.form = ret.data;
                        this.activeCampus = (ret.data.campus_list || [])[0] ? ret.data.campus_list[0].id : 0;
                        // 受邀参团：页面上「选择套餐」先落到团上那一档（点加入拼的是另一档就自相矛盾）
                        if (this.gbJoinCtx && (ret.data.skus || []).length) {
                            const joinIdx = ret.data.skus.findIndex((s) => Number(s.id) === Number(this.gbJoinCtx.specId));
                            if (joinIdx >= 0) { this.activeSku = joinIdx; }
                        }
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
            buy() { this.openSkuPicker(); },
            /**
             * 页内「选择套餐」/ 底栏报名：join 态改开拼团那只有锁定规格的弹窗
             * （否则同一屏还有一枚可单独下原价单的入口）
             */
            openSkuPicker() {
                if (this.gbJoinMode) {
                    this.openGb();
                    return;
                }
                this.skuPopup = true;
            },
            // 跳转校区详情页
            goCampus(c) {
                this.$nav.to('/pages/app/school/campus/detail/detail?id=' + c.id);
            },
            // 确认报名 → 进入确认报名页（校区/套餐在弹层内选定，学生与金额在确认页核对）
            /** 拼团入口点的「立即开团」：规格/校区交给本页自己的「选套餐」弹窗（校区、套餐权益那一套都在里面） */
            openGbSpec() {
                this.gbPicking = true;
                this.skuPopup = true;
            },
            /** 选套餐弹窗关闭：拼团标记复位（取消之后下一次「立即报名」仍走普通报名） */
            closeSkuPopup() {
                this.skuPopup = false;
                this.gbPicking = false;
            },
            confirmSku(payload) {
                this.skuPopup = false;
                // 拼团那一趟：套餐规格 id（= 拼团 spec_id）、校区与阶梯型人数额一起交回拼团区；
                // 拼团区在 `host-order` 下不导航，把它那份上下文经 `@order` 抛回本页（见 `onGbOrder`）
                if (this.gbPicking) {
                    this.gbPicking = false;
                    const sku = (payload && payload.sku) || (this.form.skus || [])[this.activeSku] || {};
                    this.$refs.gbArea.afterSpec({ specId: sku.id, campusId: this.activeCampus, ladderId: (payload && payload.ladderId) || 0 });
                    return;
                }
                // 普通报名：确认报名页地址与拼团那一趟共用 `groupBuyConfirmUrl()`（路径只存那一处），
                // 这一趟没有拼团上下文 ⇒ `gb` 省略
                this.$nav.to(groupBuyConfirmUrl({
                    packageId: this.id,
                    skuIndex: this.activeSku,
                    campusId: this.activeCampus,
                }));
            },
            /**
             * 拼团下单入口（2026-10-30 用户点名：校区课程套餐点「拼团」也要先到**确认报名页**去确认
             * 上课校区与上课学生，不要在下单页里另造一套原生选择器）
             *
             * 本页是拼团区（`host-order`）的宿主：收到它上抛的拼团上下文后，把「套餐 + 规格下标 +
             * 校区」与同一组 `gb_*` 键一起带去确认报名页；那一页确认完（可换校区、选学生）再带着
             * 同一组键进结算页，结算页那条拼团档因此不再需要任何校区/学生选择器。
             *
             * 规格下标：确认页按 `form.skus` 的下标取档（普通购买链的老口径），而拼团上下文里是
             * `spec_id` ⇒ 这里翻译一次；翻译不到（商家刚删了那一档）落页面当前选中那一档。
             * @param {Object} ctx 拼团区 `gbCtx()`：{ activity_id, team_id?, ladder_id?, spec_id?, campus_id?, count? }
             */
            onGbOrder(ctx) {
                const c = ctx || {};
                const skus = this.form.skus || [];
                let skuIndex = skus.findIndex((s) => Number(s.id) === Number(c.spec_id));
                if (skuIndex < 0) { skuIndex = Number(this.activeSku) || 0; }
                const campusId = Number(c.campus_id) || Number(this.activeCampus) || 0;
                // 展示价：参团且没换规格 ⇒ 团快照价（`team.detail` 报的就是它）；其余按「规格 + 档位」现价。
                // 两处取价口不同（团快照 vs 活动现价），商家改过价时本来就该不一样
                const joinCtx = this.gbJoinCtx || {};
                const teamPrice = Number(joinCtx.price) || 0;
                const keepTeamSpec = Number(c.team_id) > 0 && teamPrice > 0
                    && Number(c.spec_id) === Number(joinCtx.specId);
                const price = keepTeamSpec ? teamPrice : gbPriceOf(this.gbActivity, c.spec_id, c.ladder_id);
                this.$nav.to(groupBuyConfirmUrl({
                    packageId: this.form.id,
                    skuIndex: skuIndex,
                    campusId: campusId,
                    gb: {
                        gb_activity: c.activity_id,
                        gb_team: c.team_id,
                        gb_ladder: c.ladder_id,
                        gb_spec: c.spec_id,
                        // 规格 id > 0 就是显式选了（教务套餐没有会员卡那种 0 档），与拼团区 goBuy 那条同口径
                        gb_spec_set: Number(c.spec_id) > 0 ? 1 : '',
                        // 1 份不带（与拼团区 goBuy 同口径：后端缺省就是 1）
                        gb_count: Number(c.count) > 1 ? Number(c.count) : '',
                        gb_campus: campusId,
                        gb_goods_type: 'school_package',
                        gb_goods_id: this.form.id,
                        // 确认页头区显示拼团价（不是原价）：与规格弹窗里那个数是同一个取价口
                        gb_price: price.toFixed(2),
                    },
                }));
            },
        },
        // 小程序转发卡片：标题取套餐名称、封面取套餐封面（H5 的微信分享由上面 onShow 数据回来后 $nav.share 走 JSSDK 设置）
        onShareAppMessage() { return this.$nav.share(this.form.name, '', this.shareCover); },
        onShareTimeline() { return this.$nav.share(this.form.name, '', this.shareCover); },
    };
</script>
