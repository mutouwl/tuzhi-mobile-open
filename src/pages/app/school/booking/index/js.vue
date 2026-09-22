<script>
import { fmtDate, mondayOf, todayStart } from '@/common/utils/school-date';

// 本人已在该场次的状态（后端 bookable 下发的 reason）：按钮与名额位共用同一份口径，
// 区分「已预约（自己约的）/ 已加入（机构排课）/ 已安排（机构补课）/ 已上课」，都不再笼统显示「已约满」
const OWN_STATES = ['待确认', '已预约', '已上课', '已加入', '已安排'];

// 每页场次数：一天可能有上百个可约场次，按天分页拉取，滚到底部再取下一页
const PAGE_SIZE = 10;

export default {
    data() {
        return {
            // 学生由教务中心选择后经 URL 带入（withStudent），本页不提供切换入口
            studentId: 0,
            // 从课时余额页进入时带课程，作为可约场次筛选条件（0 为全部课程）
            courseId: 0,
            // 选中日期（当天 0 点时间戳）：日历组件 v-model 回传，周范围由它派生
            selectedTs: todayStart(),
            // 选中日期的可约场次（分页累积：首屏第一页，滚到底部追加下一页）
            dayList: [],
            // 当前周每日场次数 { 'YYYY-MM-DD': n }（= 当天列表条数，含置灰的不可约行），供日历周条角标。
            // 列表改为按天分页后前端已拿不到整周场次，改由可约列表接口按同一套筛选条件下发
            weekCounts: {},
            pageLoading: true,
            listLoading: false,
            // 日历卡首屏加载态（传给 tz-school-calendar 的 loading）：从进页到「首屏可约场次回包」为 true
            // （学生由 URL 带入、无需拉取，所以初始化的等待就在这一次请求上），日历上盖一层与
            // 「选择日期」弹窗同款的加载蒙版。此前这段只有列表区是骨架屏，日历角标却先渲染成一排「0场」；
            // 只用于首屏不用于切天/翻周：那时列表自己有骨架屏，日历盖住反而点不动（快速连点是允许的，
            // refreshSeq 就是为它准备的）
            calendarLoading: true,
            // 分页状态：page 已加载到第几页、hasMore 是否还有下一页、loadStatus 供 u-loadmore 展示
            page: 1,
            hasMore: false,
            loadStatus: 'loadmore',
            // 请求进行中：防止翻页重复发起
            fetching: false,
            // 拉取失败且当前无数据：列表区显示失败态+重试，避免误显示"当天暂无可约课程"
            refreshError: false,
            // 该学生已报名的课程数（可约列表接口一并下发）：0 = 一门都没报名，此时列表必然为空。
            // null = 还没取到值（首屏请求前/旧后端没有该字段），不能按「没报名」处理
            enrolledCourseCount: null,
            // refresh 序号：快速切天/翻周时丢弃过期响应，防止旧数据回写覆盖新数据
            refreshSeq: 0,
            // 预约提交中：防重复点击
            booking: false,
            installed: true,
        };
    },
    computed: {
        // 空列表文案：候选课次已由后端收窄到「该学生报名的课程」，一门没报名时列表必然为空，
        // 这时说「当天暂无可约课程」会让学生以为机构压根没排课，故按报名课程数换成引导文案
        emptyText() {
            return this.enrolledCourseCount === 0 ? '暂无已报名课程，请先选购课程套餐' : '当天暂无可约课程';
        },
        // 卡头名额标签配色：小程序端 :class 不支持方法调用，按场次 ID 预查 stateClass 的结果，
        // 与时间轴圆点仍是同一份判定
        seatClassMap() {
            const m = {};
            this.dayList.forEach((s) => { m[s.id] = this.stateClass(s); });
            return m;
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
        this.studentId = (options && options.student_id) || 0;
        // 取整数：入口链接的课程参数为空（?course_id=）或非数字时一律按「全部课程」处理，
        // 不把空串当筛选条件发给接口
        this.courseId = parseInt(options && options.course_id, 10) || 0;
    },
    onShow() {
        if (!this.installed) return;
        this.pageLoading = false;
        this.refresh();
    },
    onPullDownRefresh() {
        this.refresh();
        uni.stopPullDownRefresh();
    },
    // 滚到底部加载下一页（已无下一页时不再请求）
    onReachBottom() {
        if (this.listLoading || !this.hasMore) return;
        this.loadList(false);
    },
    methods: {
        // 日历选中日期变化：按新的一天重新拉取可约场次
        onDateChange() {
            this.refresh();
        },
        // 场次状态配色：可约蓝 / 已上课绿 / 待确认橙 / 其余不可约（已约满、课时不足等）灰。
        // 时间轴圆点与卡头名额标签共用同一套判定，色名口径与共用组件 tz-school-timeline 的 dot-color 一致
        stateClass(s) {
            if (s.can_book) return 'blue';
            if (s.reason === '已上课') return 'green';
            if (s.reason === '待确认') return 'orange';
            return 'gray';
        },
        // 名额文案：本人已在该场次的显示本人状态（与按钮同口径，避免学生自己在场次里却显示「已约满」）；
        // 其余按名额口径：不限名额 / 剩余N个名额 / 已约满（可约名额 0 为不限，与后台口径一致）
        seatText(s) {
            if (OWN_STATES.indexOf(s.reason) > -1) return s.reason;
            if (s.unlimited_seat) return '不限名额';
            return s.remain_seat > 0 ? '剩余' + s.remain_seat + '个名额' : '已约满';
        },
        // 可约场次请求参数：列表只取选中当天并按页下发（一天可能上百个场次），
        // 角标仍按整周统计，与列表用同一套筛选条件（含课程筛选）
        bookableParams(page) {
            const weekStart = mondayOf(this.selectedTs);
            const date = fmtDate(this.selectedTs);
            return {
                student_id: this.studentId,
                start_date: date,
                end_date: date,
                counts_start_date: fmtDate(weekStart),
                counts_end_date: fmtDate(weekStart.getTime() + 6 * 86400000),
                page,
                limit: PAGE_SIZE,
                course_id: this.courseId || 0,
            };
        },
        // 单页请求：统一收口失败并返回 null，由调用方决定怎么收尾。
        // 业务码必须校验：接口异常（500 会被 request 层 resolve 成原始响应体）、业务失败（code=0 只 toast 不 reject）
        // 都不会进 catch，不校验就会把失败渲染成「当天暂无可约课程」，让学生误以为机构没排课
        fetchPage(page) {
            return this.$api('school.user.bookable', this.bookableParams(page))
                .then((ret) => (ret && ret.code === 1 ? ret.data || {} : null))
                .catch(() => null);
        },
        // 拉取选中日期的可约场次：refresh=true 从第一页重来（切天/翻周/下拉刷新/失败重试），
        // 否则续拉下一页
        loadList(refresh) {
            if (!this.studentId) {
                this.pageLoading = false;
                // 没带学生进来就一个接口都不会发：日历的蒙版必须撤掉，否则一直盖着
                this.calendarLoading = false;
                return;
            }
            // 翻页请求进行中忽略重复触发；首屏刷新不设此限制，切天要能立即生效（过期响应由 refreshSeq 丢弃）
            if (!refresh && this.fetching) return;
            const page = refresh ? 1 : this.page + 1;
            const seq = refresh ? ++this.refreshSeq : this.refreshSeq;
            this.fetching = true;
            if (refresh) {
                this.listLoading = true;
                // 先清空再拉：切天后请求失败时，上一天的场次不能留在新日期下被当成当天的场次
                this.dayList = [];
                this.page = 1;
                this.hasMore = false;
            }
            this.loadStatus = 'loading';
            this.fetchPage(page).then((data) => {
                // 过期响应丢弃：快速切天/翻周时后发的请求先回，旧响应不得覆盖新数据。
                // 序号判定要在改状态之前——被丢弃的旧响应不能把「请求进行中」标记清掉，
                // 否则它的在途分页会与预约后的就地重拉（reloadInPlace）各拉各的
                if (seq !== this.refreshSeq) return;
                this.fetching = false;
                // 首屏场次已回包（成功或失败都算「初始化结束」）：撤掉日历卡的加载蒙版。
                // fetchPage 内部已吞掉异常并回 null，这里没有第二条出口，一处即可覆盖成功/失败两态
                this.calendarLoading = false;
                if (!data) {
                    this.listLoading = false;
                    this.loadStatus = 'loadmore';
                    if (!this.dayList.length) this.refreshError = true;
                    return;
                }
                const rows = data.list || [];
                this.refreshError = false;
                this.enrolledCourseCount = data.enrolled_course_count == null ? null : data.enrolled_course_count;
                // 首屏替换、翻页追加（后端已按日期与开始时间升序，追加后即当天时间顺序）
                this.dayList = refresh ? rows : this.dayList.concat(rows);
                this.page = page;
                this.hasMore = !!data.has_more;
                this.weekCounts = data.day_counts || {};
                this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
                this.listLoading = false;
            });
        },
        // 预约成功后局部刷新：静默重拉已加载的页（1..page）就地替换列表——不跳「我的预约」、
        // 不回第一页、不显示骨架屏、不改变滚动位置，学生可接着预约其他场次。
        // 不能只改被预约的那一行：预约还会改变同一周期（日/周/月）其他场次的「已达预约上限」判定与名额占用，
        // 只改一行会让学生点到另一个场次时才报「已达预约上限」
        reloadInPlace() {
            if (!this.studentId) return;
            const pages = Math.max(1, this.page);
            const seq = ++this.refreshSeq;
            const rows = [];
            this.fetching = true;
            // 逐页串行拉取（接口 limit 上限 50，页数不定，不能一次取回）
            const step = (p) => {
                this.fetchPage(p).then((data) => {
                    // 期间切天/翻周/下拉刷新：整轮丢弃，新请求已接管列表
                    if (seq !== this.refreshSeq) return;
                    if (!data) {
                        // 重拉失败：保留当前列表（旧数据也比重建成空列表好），仅提示，不打断继续预约
                        this.fetching = false;
                        uni.showToast({ title: '场次刷新失败，可下拉重试', icon: 'none' });
                        return;
                    }
                    rows.push.apply(rows, data.list || []);
                    this.enrolledCourseCount = data.enrolled_course_count == null ? null : data.enrolled_course_count;
                    if (p < pages && data.has_more) {
                        step(p + 1);
                        return;
                    }
                    this.dayList = rows;
                    this.page = p;
                    this.hasMore = !!data.has_more;
                    this.weekCounts = data.day_counts || this.weekCounts;
                    this.refreshError = false;
                    this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
                    this.fetching = false;
                });
            };
            step(1);
        },
        // 重新加载选中日期的第一页（切天、翻周、下拉刷新、失败重试共用）
        refresh() {
            this.loadList(true);
        },
        // 未报名课程时的出路：去套餐列表选购报名（与教务中心「全部套餐」同一页面）
        goPackages() {
            uni.navigateTo({ url: '/pages/app/school/package/list/list' });
        },
        // 按钮文案：可约显示「预约」，其余展示不可约原因（本人预约状态/机构安排状态/剩余课时不足等）
        btnText(s) {
            return s.can_book ? '预约' : (s.reason || '不可预约');
        },
        // 有无可查看的课次：后端下发本人在该场次的课次记录 id（0 = 本人不在该场次，如可约场次、他人已约满的场次）
        hasLessonRecord(s) {
            return parseInt(s.schedule_student_id) > 0;
        },
        // 课次详情：与「我的课表」「我的预约」同一页面同参数口径（id = 课次记录 id，date = 课次日期 Y-m-d，
        // 详情页按这一天拉课表再定位课次）
        goLesson(s) {
            const date = (s.date_text || '').split(' ')[0];
            uni.navigateTo({
                url: '/pages/app/school/schedule/detail/detail?student_id=' + this.studentId + '&id=' + s.schedule_student_id + '&date=' + encodeURIComponent(date),
            });
        },
        // 卡片点击：本人在场次里已有课次记录（已预约/已上课/已加入/已安排）的记录直达课次详情，与「我的课表」卡片点击同口径；
        // 其余行没有可查看的课次（可约行由按钮发起预约、待确认行课次尚未落定），与按钮同一口径弹窗说明原因
        onCardTap(s) {
            if (this.hasLessonRecord(s)) {
                this.goLesson(s);
                return;
            }
            if (!s.can_book) uni.showModal({ title: '提示', content: this.bookTip(s), showCancel: false });
        },
        // 预约点击：已在场次里的记录直接进课次详情（看签到/请假/消课状态），不再只弹窗指路；
        // 可约先二次确认防误触；其余不可约时弹窗说明原因
        onBookTap(s) {
            if (!s.can_book) {
                if (this.hasLessonRecord(s)) {
                    this.goLesson(s);
                    return;
                }
                uni.showModal({ title: '提示', content: this.bookTip(s), showCancel: false });
                return;
            }
            // 二次确认带上场次关键信息（课程 + 课次时间 + 本场次消耗课时），避免误约后白扣课时；
            // 时间范围用「至」连接（文案规范：范围用「至」，不用「-」）
            uni.showModal({
                title: '预约确认',
                content: '确定预约「' + (s.course_name || '该课程') + '」' + s.date_text + ' ' + s.start_time + ' 至 ' + s.end_time + ' 的课程吗？本场次消耗课时 ' + s.lessons + ' 节。',
                success: (res) => {
                    if (res.confirm) this.doBook(s);
                },
            });
        },
        // 不可约原因（与后端 bookable 下发的 reason 口径一致，补齐说明性文案）
        bookTip(s) {
            const tips = {
                '已预约': '该场次你已预约，可在「我的预约」查看进度',
                '待确认': '该场次已提交预约，等待机构确认',
                '已上课': '该场次你已上过课，可在「上课记录」查看',
                // 机构安排（无预约单）：排课页直接加入 / 补课插班；与「已预约」区分，也不再笼统显示「已约满」
                '已加入': '该场次机构已为你排课，可在「我的课表」查看',
                '已安排': '该场次是机构为你安排的补课，可在「我的课表」查看',
                '已约满': '该场次名额已约满，请选择其他时间',
                '暂无该课程课时': '你还没有该课程的课时，请先购买课程套餐',
                '课时账户已过期': '该课程课时已过期，请联系机构处理',
                '剩余课时不足': '剩余课时不足以预约该场次，请联系机构补充课时',
                '已开始': '该场次已开始，无法预约',
                // 预约规则（教务设置·店铺统一规则 / 日程独立配置）相关提示
                '超出可预约时间': '该场次还未到可预约时间，请留意机构的可提前预约天数设置',
                '已停止预约': '该场次已停止预约，请联系机构安排其他时间',
                '已达每日预约上限': '你今日的预约已达上限，请选择其他日期',
                '已达每周预约上限': '你本周的预约已达上限，请选择下周时间',
                '已达每月预约上限': '你本月的预约已达上限，请下月再约',
            };
            return tips[s.reason] || '该场次暂不可预约';
        },
        doBook(s) {
            if (this.booking) return;
            this.booking = true;
            this.$api('school.user.book', { student_id: this.studentId, schedule_id: s.id })
                .then((ret) => {
                    this.booking = false;
                    // 全局拦截器对 code=0 只 toast 不 reject，须校验业务码
                    if (!ret || ret.code !== 1) {
                        if (ret && ret.code !== 0 && ret.code !== 401) {
                            uni.showModal({ title: '提示', content: ret.msg || '预约失败', showCancel: false });
                        }
                        return;
                    }
                    const needConfirm = ret.data && ret.data.need_confirm;
                    // 本人已占住该场次：先就地置为不可再约，防止连点在途时重复提交同一场次；
                    // 状态口径与后端 bookable 下发的 reason 一致，随后由局部刷新按接口数据校正
                    s.can_book = false;
                    s.reason = needConfirm ? '待确认' : '已预约';
                    if (needConfirm) {
                        uni.showModal({
                            title: '提示',
                            content: '预约已提交，等待机构确认。可在「我的预约」查看进度',
                            showCancel: false,
                        });
                    } else {
                        uni.showToast({ title: '预约成功', icon: 'success' });
                    }
                    // 不跳「我的预约」：就地刷新已加载的场次，学生可接着预约其他课程
                    this.reloadInPlace();
                })
                .catch((ret) => {
                    this.booking = false;
                    uni.showModal({ title: '提示', content: (ret && ret.errMsg) || '预约失败', showCancel: false });
                });
        },
    },
};
</script>
