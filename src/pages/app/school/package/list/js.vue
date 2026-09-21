<script>
export default {
        data() {
            // loading 首屏即加载态（避免先闪“暂无课程套餐”空态）；fetching 为请求进行中标记
            return {
                keyword: '', cats: [{ id: 0, name: '全部' }], activeCat: 0, list: [], loading: true, fetching: false, installed: true, campusId: 0, teacherId: 0,
                // 分页状态：page 已加载到第几页、hasMore 是否还有下一页、loadStatus 供 u-loadmore 展示
                page: 1, hasMore: false, loadStatus: 'loadmore',
                // refresh 序号：快速切分类 / 改关键词时丢弃过期响应，防止旧数据回写覆盖新列表
                refreshSeq: 0,
                // 单页条数（接口上限 50，与教务其他列表页口径一致）
                PAGE_SIZE: 20,
            };
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
            // 支持按校区/讲师进入（校区详情、教师详情「更多」分别携带 campus_id / teacher_id）
            this.campusId = Number(options && options.campus_id) || 0;
            this.teacherId = Number(options && options.teacher_id) || 0;
        },
        computed: {
            activeCatIndex() {
                const index = this.cats.findIndex((c) => c.id == this.activeCat);
                return index > -1 ? index : 0;
            },
        },
        onShow() { if (this.installed) this.refresh(); },
        onPullDownRefresh() {
            // 刷新指示器要等数据回来再收：此前在 refresh() 后同步 stop，请求还没回来指示器就收了，
            // 用户看不出刷新有没有生效
            const done = () => uni.stopPullDownRefresh();
            this.refresh().then(done, done);
        },
        // 滚到底部加载下一页（已无下一页时不再请求）
        onReachBottom() {
            this.loadMore();
        },
        methods: {
            tabsHandle(option) {
                if (this.activeCat != option.id) {
                    this.activeCat = option.id;
                    // 切分类必须回到第 1 页重拉：沿用旧页码会拉到新分类的中间片段，列表出现缺页/重复
                    this.refresh();
                }
            },
            // 单页请求：统一收口失败并返回 null，由调用方决定怎么收尾。
            // 业务码必须校验：接口异常（500 会被 request 层 resolve 成原始响应体）、业务失败（code=0 只 toast 不 reject）
            // 都不会进 catch，不校验就会把失败渲染成「暂无课程套餐」
            fetchPage(page) {
                return this.$api('school.package.list', {
                    keyword: this.keyword,
                    category_id: this.activeCat,
                    campus_id: this.campusId,
                    teacher_id: this.teacherId,
                    page,
                    limit: this.PAGE_SIZE,
                }).then((ret) => (ret && ret.code === 1 ? ret.data || {} : null)).catch(() => null);
            },
            // 加载一页：refresh 为真从第一页替换列表，否则追加到列表尾部
            loadList(refresh) {
                // 翻页请求进行中忽略重复触发（滚到底部会连续触发）；首屏/筛选刷新不受此限制，过期响应由 refreshSeq 丢弃
                if (!refresh && this.fetching) return Promise.resolve();
                const page = refresh ? 1 : this.page + 1;
                const seq = refresh ? ++this.refreshSeq : this.refreshSeq;
                this.fetching = true;
                this.loading = refresh;
                this.loadStatus = 'loading';
                return this.fetchPage(page).then((data) => {
                    // 过期响应丢弃：筛选条件已变，旧响应不得回写覆盖新列表（也不能清掉在途标记）
                    if (seq !== this.refreshSeq) return;
                    this.fetching = false;
                    this.loading = false;
                    if (!data) {
                        // 失败保留已加载列表（旧数据好过空白），加载行按已确认的分页状态复位，便于再次上拉重试
                        this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
                        return;
                    }
                    const rows = data.list || [];
                    this.list = refresh ? rows : this.list.concat(rows);
                    this.page = page;
                    this.hasMore = !!data.has_more;
                    // 分类选项接口每页都会下发，用最新响应覆盖；未下发时保留原选项，避免页签闪空
                    if (data.categories) this.cats = [{ id: 0, name: '全部' }].concat(data.categories);
                    this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
                });
            },
            // 首页刷新（下拉刷新、搜索、分类切换、onShow 共用）：重置分页并从第一页重新拉取
            refresh() {
                this.page = 1;
                this.hasMore = false;
                return this.loadList(true);
            },
            // 上拉追加下一页（已无下一页时不再请求）
            loadMore() {
                if (!this.hasMore) return Promise.resolve();
                return this.loadList(false);
            },
        },
    };
</script>
