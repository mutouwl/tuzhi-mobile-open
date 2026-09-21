<script>
import schoolStudent from '@/common/utils/school-student';
import TeacherInfoPopup from '../../package/components/teacher-info-popup.vue';

export default {
    components: { TeacherInfoPopup },
    data() {
        return {
            // 学生由教务中心选择后经 URL 带入（withStudent），本页不提供切换入口；
            // 从预约通知/分享直接进入时 URL 不带 student_id，按学生列表兜底恢复（见 loadStudents）
            studentId: 0,
            students: [],
            studentLoading: false,
            status: -1,
            // 页签 current 为 u-tabs 所需的下标，status 仍是筛选值（后端按 status 过滤）
            current: 0,
            // 学生的全部预约记录：待确认 / 待上课 / 已上课 / 已取消。
            // 已取消同样下发——机构没通过的预约在库里就是 status=3（状态文案为「未通过」），
            // 挡在列表外学生只能看到预约凭空消失，故单列「已取消」页签（含机构取消与自行取消）
            tabs: [
                { name: '全部', type: -1 },
                { name: '待确认', type: 0 },
                { name: '待上课', type: 1 },
                { name: '已上课', type: 2 },
                { name: '已取消', type: 3 },
            ],
            list: [],
            // loading 首屏即加载态（避免先闪"暂无预约记录"空态）；fetching 为请求进行中标记
            loading: true,
            fetching: false,
            // 分页状态：page 已加载到第几页、hasMore 是否还有下一页、loadStatus 供 u-loadmore 展示
            page: 1,
            hasMore: false,
            loadStatus: 'loadmore',
            // refresh 序号：切页签/取消后快速重拉时丢弃过期响应，防止旧数据回写覆盖新列表
            refreshSeq: 0,
            // 每页条数（后端 limit 默认 20、上限 50）
            PAGE_SIZE: 20,
            // 取消预约提交中：防重复点击
            cancelling: false,
            // 时间范围筛选：all/7/30/custom + 自定义起止日期（YYYY-MM-DD），与圈子搜索页/上课记录页同口径
            timeFilter: 'all',
            customRange: { start: '', end: '' },
            modal: { filter: false },
            // 预约详情弹层：detail 为接口返回的详情，detailRow 为触发弹层的那条列表记录（取消判定用）
            detailVisible: false,
            detail: null,
            detailRow: null,
            // 弹层内点「上课老师」且该课次有多位主讲时，再开一层授课老师名单弹层
            teacherPopupShow: false,
            installed: true,
        };
    },
    computed: {
        // 时间筛选是否已生效（非全部时间），驱动筛选按钮选中色（同搜索筛选栏口径）
        filterActive() {
            return this.timeFilter != 'all';
        },
        // 空状态文案：筛选后无结果与本来就没有预约要分开说，否则学生会以为自己的预约没了
        emptyText() {
            return this.filterActive ? '没有找到相关预约' : '暂无预约记录';
        },
        // 状态配色表（以状态值为键）：待确认橙 / 待上课蓝 / 已上课绿 / 已取消灰（与后台列表口径一致）。
        // 小程序端 :class 不支持方法调用，故模板直接查这张表，statusClass 同源复用给时间轴圆点
        statusClassMap() {
            return { 0: 'orange', 1: 'blue', 2: 'green', 3: 'gray' };
        },
        // 详情信息行：与卡片同版式（label + value），取消原因/签到时间按状态与数据补齐。
        // 带 action 的行可点跳转（上课地点→校区详情、上课老师→教师详情/名单），取不到跳转 ID 时 action 留空、不出箭头
        detailRows() {
            const d = this.detail || {};
            const rows = [
                { label: '课程名称', value: d.course_name || '-' },
                { label: '课次', value: (d.date_text || '-') + ' ' + (d.start_time || '') + '-' + (d.end_time || '') },
                { label: '上课地点', value: (d.campus_name || '-') + (d.classroom_name ? ' ' + d.classroom_name : ''), action: d.campus_id ? 'campus' : '' },
                { label: '上课老师', value: d.main_teacher || '-', action: this.teacherRowAction },
                { label: '消耗课时', value: d.lessons },
                { label: '预约状态', value: d.status_text || '-' },
                { label: '预约来源', value: d.source_text || '-' },
            ];
            if (d.status == 3 && d.cancel_reason) rows.push({ label: '取消原因', value: d.cancel_reason });
            if (d.sign_time_text) rows.push({ label: '签到时间', value: d.sign_time_text });
            return rows;
        },
        // 详情里的授课老师（接口 teachers 元素带 id 才可跳转，也才可进名单弹层）
        detailTeachers() {
            return ((this.detail && this.detail.teachers) || []).filter((t) => t && t.id);
        },
        // 「上课老师」行展示的是主讲，跳转也按主讲判定：一位直进其详情，多位先列名单
        mainTeachers() {
            return this.detailTeachers.filter((t) => t.role == 1);
        },
        teacherRowAction() {
            if (this.mainTeachers.length > 1) return 'teachers';
            return this.mainTeachers.length ? 'teacher' : '';
        },
        // 弹层内是否给取消入口：与卡片同一判定（待确认 / 待上课）
        popupCancelable() {
            const b = this.detailRow;
            return !!b && (b.status == 0 || b.status == 1);
        },
        // 弹层内是否给课程详情入口：预约已落定进学生课表才有课次可看。
        // schedule_student_id 即课次详情要的课次 ID；待确认时它还是 0，已取消时课次行已被删（预约单只留痕），
        // 这两种情况跳过去只会是「课程不存在或已被删除」，故不出入口
        canViewLesson() {
            const d = this.detail || {};
            return parseInt(d.schedule_student_id) > 0 && d.status != 3;
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
        // 未带学生时先回退上次选中的学生，避免通知进入时列表空着等接口
        if (!this.studentId) {
            const stu = schoolStudent.get();
            if (stu) this.studentId = stu.id;
        }
    },
    onShow() { if (this.installed) this.loadStudents(); },
    onPullDownRefresh() { this.loadStudents(); uni.stopPullDownRefresh(); },
    // 滚到底部加载下一页（已无下一页时不再请求）
    onReachBottom() { this.loadMore(); },
    methods: {
        // 学生列表：本页是「预约上课」唯一入口（预约通知也跳本页），
        // 与我的课表/我的课时同口径——URL 未带 student_id 时按上次选中优先、列表兜底恢复
        loadStudents() {
            if (this.studentLoading) return;
            this.studentLoading = true;
            this.$api('school.user.students', { page: 1, limit: 20 }).then((ret) => {
                this.students = (ret.data && ret.data.list) || [];
                this.studentLoading = false;
                this.applyStudent();
                this.refresh();
            }).catch(() => {
                this.studentLoading = false;
                this.refresh();
            });
        },
        // 未选定学生时按缓存优先、列表首个兜底恢复（与我的课表同口径；URL 已带学生则直接沿用）
        applyStudent() {
            if (this.studentId || !this.students.length) return;
            this.studentId = schoolStudent.resolve(this.students);
        },
        // 状态页签切换：u-tabs 回传 { ...item, index }
        tabChange(tab) {
            if (this.current === tab.index) return;
            this.current = tab.index;
            this.status = tab.type;
            // 先清空再拉：页签决定数据身份，加载中若留着上一个状态的记录，学生会把旧状态当成新页签的结果
            this.list = [];
            this.refresh();
        },
        // 状态配色：取自 statusClassMap，未命中为灰
        statusClass(status) {
            return this.statusClassMap[status] || 'gray';
        },
        // 时间轴左列文案：课次日期（月-日）。后端 date_text 为 Y-m-d（若带上「周X」亦不影响），
        // 取第 5~10 位即「月-日」——左列 44px 放不下带年份的完整日期，完整日期与时间段留在卡内「课次」行
        shortDate(b) {
            return ((b && b.date_text) || '').slice(5, 10);
        },
        // 可取消：待确认与待上课，且服务端判定可取消
        // （取消规则为「不允许取消」或已过「上课前 N 小时」时服务端下发 cancel_allowed=false，
        //   前端只据此置灰并说明原因，避免同一套取消规则在前端再实现一遍）
        canCancel(b) {
            if (b.status != 0 && b.status != 1) return false;
            return b.cancel_allowed !== false;
        },
        // 不可取消原因：与后端 cancel() 的拦截口径一致
        cancelTip(b) {
            if (b.status == 2) return '该预约已上课，无法取消';
            if (b.status == 3) return '该预约已取消';
            return '当前课程的取消规则不允许取消，请联系机构处理';
        },
        // 打开时间筛选弹窗
        toggleFilter() {
            this.modal.filter = true;
        },
        // 筛选弹窗确认：应用时间范围并回第 1 页重拉
        onFilterConfirm(e) {
            this.timeFilter = e.timeFilter;
            this.customRange = e.customRange;
            this.refresh();
        },
        // 时间筛选转接口参数（int 时间戳，秒；0 表示不限制该边界）
        // 后端按课次上课日期过滤，故起止取所选日期的当天首/末秒
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
        // 都不会进 catch，不校验就会把失败渲染成「暂无预约记录」，让学生以为没有预约
        fetchPage(page) {
            const timeParams = this.buildTimeParams();
            return this.$api('school.user.bookingList', {
                student_id: this.studentId,
                status: this.status,
                start_time: timeParams.start_time,
                end_time: timeParams.end_time,
                page,
                limit: this.PAGE_SIZE,
            }).then((ret) => (ret && ret.code === 1 ? ret.data || {} : null)).catch(() => null);
        },
        // 加载一页：refresh 为真从第 1 页替换列表，否则追加到列表尾部
        loadList(refresh) {
            // 未选定学生时没有可加载数据：结束首屏加载态，避免骨架屏常驻
            if (!this.studentId) { this.loading = false; return Promise.resolve(); }
            // 翻页请求进行中忽略重复触发（滚到底部会连续触发）；切页签/取消后的重拉不受此限制，过期响应由 refreshSeq 丢弃
            if (!refresh && this.fetching) return Promise.resolve();
            const page = refresh ? 1 : this.page + 1;
            const seq = refresh ? ++this.refreshSeq : this.refreshSeq;
            this.fetching = true;
            this.loading = refresh;
            this.loadStatus = 'loading';
            return this.fetchPage(page).then((data) => {
                // 过期响应丢弃：页签/学生已变，旧响应不得回写覆盖新列表（也不能清掉在途标记）
                if (seq !== this.refreshSeq) return;
                this.fetching = false;
                this.loading = false;
                if (!data) {
                    // 失败保留已加载记录（旧数据好过空白），加载行按已确认的分页状态复位，便于再次上拉重试
                    this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
                    return;
                }
                // 后端分页字段为 list（旧版是 rows），取错会整页空列表
                const rows = data.list || [];
                this.list = refresh ? rows : this.list.concat(rows);
                this.page = page;
                this.hasMore = !!data.has_more;
                this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
            });
        },
        // 回第 1 页刷新（页签切换、取消成功后、onShow、下拉刷新共用）：重置分页并把列表整段替换
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
        // 预约详情：先取详情再开弹层（列表记录留存，弹层内取消沿用同一条记录的取消判定）
        openDetail(b) {
            this.$api('school.user.bookingDetail', { id: b.id }).then((ret) => {
                if (!ret || ret.code !== 1) return;
                this.detail = ret.data || {};
                this.detailRow = b;
                this.detailVisible = true;
            });
        },
        // 详情弹层信息行点击：只处理带 action 的行，其余行（课程名称/课次/消耗课时等）点击无副作用
        onRowTap(r) {
            if (!r || !r.action) return;
            if (r.action == 'campus') this.goCampus();
            else if (r.action == 'teachers') this.openTeachers();
            else if (r.action == 'teacher') this.goTeacher(this.mainTeachers[0]);
        },
        // 校区详情：与课次详情「校区」行、校区列表卡片同目标页同参数口径（详情接口已下发 campus_id）
        goCampus() {
            const d = this.detail || {};
            if (!d.campus_id) return;
            uni.navigateTo({ url: '/pages/app/school/campus/detail/detail?id=' + d.campus_id });
        },
        // 教师详情：单个主讲老师直达（与课次详情「老师」行同口径）
        goTeacher(t) {
            if (!t || !t.id) return;
            uni.navigateTo({ url: '/pages/app/school/teacher/detail/detail?id=' + t.id });
        },
        // 多位主讲：先收起详情弹层再开授课老师名单（本页弹层层级 10075/遮罩 10070，同层级再叠一层会被压住，
        // 与 showModalAboveDetail 同一处理），名单里每位老师仍可各自点进详情
        openTeachers() {
            this.detailVisible = false;
            // u-popup 关闭动画约 300ms，等遮罩退场后再开，避免两层弹层互相压
            setTimeout(() => { this.teacherPopupShow = true; }, 300);
        },
        // 名单弹层关闭：回到预约详情弹层，用户看的东西没变（详情数据仍在 detail 里）
        onTeacherPopupClose() {
            this.teacherPopupShow = false;
            this.detailVisible = true;
        },
        // 取消预约：不可取消（取消规则限制）时弹窗说明原因，可取消则二次确认后提交
        onCancelTap(b) {
            if (!this.canCancel(b)) {
                this.showModalAboveDetail('提示', this.cancelTip(b), false);
                return;
            }
            this.showModalAboveDetail(
                '取消预约',
                '确定取消「' + (b.course_name || '该课程') + '」' + (b.date_text || '') + ' ' + (b.start_time || '') + ' 的预约吗？',
                true,
                () => this.doCancel(b)
            );
        },
        // 弹模态框（层级兜底）：H5 下 uni 原生模态框的层级固定（uni-modal 为 999），
        // 与自定义弹层（本页 10075/遮罩 10070）不在同一套 z-index 体系内，改不动，
        // 结果就是详情弹层里的确认框被压在弹层遮罩下——看得见点不到。
        // 故在详情弹层内弹模态框前先收起弹层（等关闭动画退场），用户未确认时再恢复弹层，避免上下文丢失。
        showModalAboveDetail(title, content, showCancel, onConfirm) {
            const fromDetail = this.detailVisible;
            const restore = () => { if (fromDetail) this.detailVisible = true; };
            const open = () => {
                uni.showModal({
                    title,
                    content,
                    showCancel,
                    success: (res) => {
                        if (res.confirm && onConfirm) { onConfirm(); return; }
                        restore();
                    },
                    fail: restore,
                });
            };
            if (!fromDetail) { open(); return; }
            this.detailVisible = false;
            // u-popup 关闭动画约 300ms，等遮罩退场后再弹，避免模态框被退场中的遮罩挡一帧
            setTimeout(open, 300);
        },
        doCancel(b) {
            if (this.cancelling) return;
            this.cancelling = true;
            this.$api('school.user.bookCancel', { id: b.id }).then((ret) => {
                this.cancelling = false;
                // 全局拦截器对 code=0 只 toast 不 reject，须校验业务码
                if (!ret || ret.code !== 1) {
                    if (ret && ret.code !== 0 && ret.code !== 401) {
                        uni.showModal({ title: '提示', content: ret.msg || '取消失败', showCancel: false });
                    }
                    return;
                }
                uni.showToast({ title: '取消成功', icon: 'success' });
                // 取消成功后详情弹层里的状态已过期，直接关闭；列表回第 1 页重拉——
                // 当前页签是待确认/待上课时这条记录会随状态转成已取消移出该页签（「全部」「已取消」里仍在）
                this.detailVisible = false;
                this.refresh();
            }).catch((ret) => {
                this.cancelling = false;
                uni.showModal({ title: '提示', content: (ret && ret.errMsg) || '取消失败', showCancel: false });
            });
        },
        // 课程详情：跳该预约落定的课次详情（与「我的课表」goDetail 同页面同参数口径，
        // date 取课次日期 Y-m-d，详情页按这一天拉课表再定位课次）
        goLesson() {
            const d = this.detail || {};
            const date = (d.date_text || '').split(' ')[0];
            uni.navigateTo({
                url: '/pages/app/school/schedule/detail/detail?student_id=' + this.studentId + '&id=' + d.schedule_student_id + '&date=' + encodeURIComponent(date),
            });
        },
        goBook() {
            uni.navigateTo({ url: '/pages/app/school/booking/index/index?student_id=' + this.studentId });
        },
    },
};
</script>
