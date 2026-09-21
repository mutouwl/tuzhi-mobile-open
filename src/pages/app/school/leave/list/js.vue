<script>
export default {
        data() {
            return { status: -1, tabs: [
                { value: -1, name: '全部' },
                { value: 0, name: '审核中' },
                { value: 1, name: '已通过' },
                { value: 2, name: '已拒绝' },
                { value: 3, name: '已取消' },
            // loading 首屏即加载态（避免先闪“暂无请假记录”空态）；fetching 为请求进行中标记
            // current 为 u-tabs 所需的下标（滑块位置），status 才是筛选值
            ], current: 0, list: [], loading: true, fetching: false, installed: true, allowLeave: true,
            // 分页状态：page 已加载到第几页、hasMore 是否还有下一页、loadStatus 供 u-loadmore 展示
            page: 1, hasMore: false, loadStatus: 'loadmore',
            // status 页签在服务端过滤（前端再 filter 会出现「某页被筛空却还有下一页」的假空态）；
            // refreshSeq 丢弃过期响应，防止快速切页签时旧页签数据回写覆盖新列表
            refreshSeq: 0, PAGE_SIZE: 20 };
        },
        computed: {
            // 请假类型文案表：小程序端 WXML 不能解析插值里的内联对象取值（会报 unexpected token 并中断整包编译），
            // 故把文案表收在 computed 里按下标取，与请假详情页同一口径
            typeTextMap() {
                return { 1: '事假', 2: '病假', 3: '其他' };
            },
        },
        onLoad() {
            if (!this.$tools.systemConfig('app_isinstall_school')) {
                this.installed = false;
                uni.showToast({ title: '该功能未开通', icon: 'none' });
                setTimeout(() => {
                    if (getCurrentPages().length > 1) { uni.navigateBack(); } else { uni.reLaunch({ url: '/pages/index/index' }); }
                }, 800);
                return;
            }
        },
        onShow() { if (this.installed) this.refresh(); },
        onPullDownRefresh() { this.refresh(); uni.stopPullDownRefresh(); },
        // 滚到底部加载下一页（已无下一页时 loadMore 内部直接返回，不再请求）
        onReachBottom() { this.loadMore(); },
        methods: {
            // 页签切换：u-tabs 回传 { ...item, index }，下标同步给组件（滑块），筛选用页签自带的 value。
            // 换了查询条件必须清空旧列表并回第 1 页重拉，
            // 否则旧页签数据会残留在新页签下，分页页码也会串（续拉会拿到新页签的第 2 页）
            tabChange(tab) {
                if (this.status == tab.value) return;
                this.current = tab.index;
                this.status = tab.value;
                this.list = [];
                this.refresh();
            },
            // 单页请求：统一收口失败并返回 null，由调用方决定怎么收尾。
            // 业务码必须校验：接口异常（500 会被 request 层 resolve 成原始响应体）、业务失败（code=0 只 toast 不 reject）
            // 都不会进 catch，不校验就会把失败渲染成「暂无请假记录」，让学生以为没有记录
            fetchPage(page) {
                return this.$api('school.user.leaveList', {
                    status: this.status,
                    page,
                    limit: this.PAGE_SIZE,
                }).then((ret) => (ret && ret.code === 1 ? ret.data || {} : null)).catch(() => null);
            },
            // 加载一页：refresh 为真从第一页替换列表，否则追加到列表尾部
            loadList(refresh) {
                // 翻页请求进行中忽略重复触发（滚到底部会连续触发）；刷新不受此限制，过期响应由 refreshSeq 丢弃
                if (!refresh && this.fetching) return Promise.resolve();
                const page = refresh ? 1 : this.page + 1;
                const seq = refresh ? ++this.refreshSeq : this.refreshSeq;
                this.fetching = true;
                this.loading = refresh;
                this.loadStatus = 'loading';
                return this.fetchPage(page).then((data) => {
                    // 过期响应丢弃：页签已切换，旧响应不得回写覆盖新列表（也不能清掉在途标记）
                    if (seq !== this.refreshSeq) return;
                    this.fetching = false;
                    this.loading = false;
                    if (!data) {
                        // 失败保留已加载记录（旧数据好过空白），加载行按已确认的分页状态复位，便于再次上拉重试
                        this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
                        return;
                    }
                    const rows = data.list || [];
                    this.list = refresh ? rows : this.list.concat(rows);
                    this.page = page;
                    this.hasMore = !!data.has_more;
                    this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
                    // allow_leave 每次响应都返回（含翻页），按最新值同步；字段缺失时保留旧值，
                    // 避免误判为 false 后把「发起请假」入口隐藏掉
                    if (data.allow_leave !== undefined) this.allowLeave = data.allow_leave == 1;
                });
            },
            // 首页刷新（下拉刷新、页签切换、onShow 共用）：重置分页并从第一页重拉
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
            goDetail(id) { uni.navigateTo({ url: '/pages/app/school/leave/detail/detail?id=' + id }); },
            goApply() { uni.navigateTo({ url: '/pages/app/school/leave/apply/apply' }); },
            // 课次文案：与请假详情页同一口径（上课日期 + 起止时间），课次已不存在时兜底 '-'
            sessionText(l) {
                if (!l.lesson_date_text) return '-';
                const t = [l.start_time, l.end_time].filter(Boolean).join('-');
                return t ? l.lesson_date_text + ' ' + t : l.lesson_date_text;
            },
        },
    };
</script>
