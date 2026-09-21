<script>
import schoolStudent from '@/common/utils/school-student';

export default {
        data() {
            return {
                students: [],
                studentId: 0,
                list: [],
                // 首屏即为加载态：此前 loading 初始 false，首帧会先渲染“暂无上课记录”空态再切骨架屏
                loading: true,
                // 请求进行中标记：loading 兼作首屏骨架屏态后不能再当防重入守卫（否则首次请求被拦截）
                fetching: false,
                // 分页状态：page 已加载到第几页、hasMore 是否还有下一页、loadStatus 供 u-loadmore 展示
                page: 1,
                hasMore: false,
                loadStatus: 'loadmore',
                // refresh 序号：快速改关键词/时间筛选时丢弃过期响应，防止旧数据回写覆盖新列表
                refreshSeq: 0,
                PAGE_SIZE: 20,
                installed: true,
                keyword: '',
                // 搜索关键词最大长度（与后端截断长度一致，防超长关键词拖垮 LIKE 搜索）
                MAX_KEYWORD_LEN: 30,
                timeFilter: 'all', // 时间筛选：all/7/30/custom
                customRange: { start: '', end: '' }, // 自定义时间范围（YYYY-MM-DD）
                modal: { filter: false },
            };
        },
        computed: {
            currentStudentName() {
                const s = this.students.find((x) => x.id == this.studentId);
                return s ? s.name : '请选择';
            },
            // 时间筛选是否已生效（非全部时间），驱动筛选按钮选中色
            filterActive() {
                return this.timeFilter != 'all';
            },
            // 空状态文案：默认/筛选后无结果两种
            emptyText() {
                return (this.keyword && this.keyword.trim()) || this.timeFilter != 'all' ? '没有找到相关记录' : '暂无上课记录';
            },
            // 角标配色（本页三档：已完成绿 / 未签到红 / 请假、请假中、未到橙）——沿用本页既有色板；
            // 小程序端 :class 不支持方法调用，故配色以状态文案为键做成查表，未命中即兜底橙
            statusClassMap() {
                return { '已消课': 'green', '已签到': 'green', '未签到': 'red' };
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
        onShow() {
            if (!this.installed) return;
            this.$api('school.user.students').then((ret) => {
                this.students = ret.data.list;
                if (!this.studentId && this.students.length) this.studentId = schoolStudent.resolve(this.students);
                this.refresh();
            }).catch(() => {
                // 学生加载失败：结束首屏加载态，避免骨架屏常驻
                if (!this.students.length) this.loading = false;
            });
        },
        onPullDownRefresh() {
            // 刷新指示器要等数据回来再收：此前在 refresh() 后同步 stop，请求还没回来指示器就收了，
            // 学生看不出刷新有没有生效
            const done = () => uni.stopPullDownRefresh();
            this.refresh().then(done, done);
        },
        // 滚到底部加载下一页（已无下一页时不再请求）
        onReachBottom() {
            this.loadMore();
        },
        methods: {
            fmtDate(ts) {
                const d = new Date(parseInt(ts) * 1000);
                return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            },
            // 搜索栏输入变化：组件在 Vue2 下不支持 v-model，显式同步 value
            onKeywordChange(e) {
                this.keyword = (e && e.value) || '';
            },
            // 搜索栏提交（键盘搜索键）：以当前关键词重新查询；空关键词 = 查看全部
            onSearch(e) {
                let keyword = ((e && e.value) || this.keyword || '').trim();
                // 兜底截断：防粘贴等绕过输入框 maxlength 的超长关键词
                if (keyword.length > this.MAX_KEYWORD_LEN) {
                    keyword = keyword.slice(0, this.MAX_KEYWORD_LEN);
                }
                this.keyword = keyword;
                this.refresh();
            },
            // 打开筛选弹窗
            toggleFilter() {
                this.modal.filter = true;
            },
            // 筛选弹窗确认：应用筛选并刷新列表
            onFilterConfirm(e) {
                this.timeFilter = e.timeFilter;
                this.customRange = e.customRange;
                this.refresh();
            },
            // 时间筛选转接口参数（int 时间戳，秒）
            buildTimeParams() {
                const now = Math.floor(Date.now() / 1000);
                if (this.timeFilter == '7' || this.timeFilter == '30') {
                    return { start_time: now - Number(this.timeFilter) * 86400, end_time: 0 };
                }
                if (this.timeFilter == 'custom' && this.customRange.start && this.customRange.end) {
                    return {
                        start_time: Math.floor(new Date(this.customRange.start + ' 00:00:00').getTime() / 1000),
                        end_time: Math.floor(new Date(this.customRange.end + ' 23:59:59').getTime() / 1000),
                    };
                }
                return { start_time: 0, end_time: 0 };
            },
            // 单页请求：统一收口失败并返回 null，由调用方决定怎么收尾。
            // 业务码必须校验：接口异常（500 会被 request 层 resolve 成原始响应体）、业务失败（code=0 只 toast 不 reject）
            // 都不会进 catch，不校验就会把失败渲染成「暂无上课记录」，让学生以为没有记录
            fetchPage(page) {
                const timeParams = this.buildTimeParams();
                return this.$api('school.user.records', {
                    student_id: this.studentId,
                    keyword: (this.keyword || '').trim(),
                    start_time: timeParams.start_time,
                    end_time: timeParams.end_time,
                    page,
                    limit: this.PAGE_SIZE,
                }).then((ret) => (ret && ret.code === 1 ? ret.data || {} : null)).catch(() => null);
            },
            // 加载一页：refresh 为真从第一页替换列表，否则追加到列表尾部
            loadList(refresh) {
                // 未选中学生时没有可加载数据：结束首屏加载态，避免骨架屏常驻
                if (!this.studentId) { this.loading = false; return Promise.resolve(); }
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
                        // 失败保留已加载记录（旧数据好过空白），加载行按已确认的分页状态复位，便于再次上拉重试
                        this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
                        return;
                    }
                    const rows = (data.list || []).map((s) => {
                        s.status_tag = this.statusTag(s);
                        return s;
                    });
                    this.list = refresh ? rows : this.list.concat(rows);
                    this.page = page;
                    this.hasMore = !!data.has_more;
                    this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
                });
            },
            // 首页刷新（下拉刷新、搜索、筛选、onShow 共用）：重置分页并从第一页重拉
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
            // 状态标签（卡片右上角）：优先用后端下发的 list_status_text（口径唯一，与课表页同一份），
            // 旧版后端未下发时按同一判据本地兜底：先点名结果（请假/未到/请假中），
            // 其余按「已消课 > 已签到 > 未签到」（后端 VerifyService::listStatusText）
            statusTag(s) {
                if (s.list_status_text) return s.list_status_text;
                if (s.verify_status == 3) return '请假';
                if (s.verify_status == 4) return '未到';
                if (s.leave_id) return '请假中';
                if (s.verify_status == 1) return '已消课';
                return s.sign_time > 0 ? '已签到' : '未签到';
            },
        },
    };
</script>
