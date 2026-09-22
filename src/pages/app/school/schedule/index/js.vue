<script>
import schoolStudent from '@/common/utils/school-student';
import { fmtDate, mondayOf, todayStart } from '@/common/utils/school-date';

export default {
        data() {
            return {
                students: [], studentId: 0,
                studentPage: 1, studentHasMore: false, studentLoading: false, studentRefreshing: false, studentLoadStatus: 'loadmore',
                // 选中日期（当天 0 点时间戳）：日历组件 v-model 回传，周范围由它派生
                selectedTs: todayStart(),
                // 按天分组：[{ date, date_text, list }]
                groups: [],
                pageLoading: true,
                listLoading: false,
                // 日历卡首屏加载态（传给 tz-school-calendar 的 loading）：从进页到「首个课表数据落地」
                // （含前面拉学生信息那段）为 true，日历上盖一层与「选择日期」弹窗同款的加载蒙版。
                // 此前这段只有列表区是骨架屏，日历角标却先渲染成一排「0节」，看着像这天没课；
                // 只用于首屏不用于切天/翻周：那时列表自己有骨架屏，日历盖住反而点不动（快速连点是允许的，
                // refreshSeq 就是为它准备的）
                calendarLoading: true,
                // 学生列表首次加载状态：loaded=成功过一次；error=最近一次加载失败且当前无学生。
                // 此前学生为空/加载失败时页面渲染成"看似正常"的死页面（日历打开/刷新均静默 return），
                // 表现为点年月弹窗不显示、切日期不触发加载，故这里显式记录状态供页面给出空态与重试
                studentsLoaded: false,
                studentsError: false,
                // 课表拉取失败且当前无数据时置位：列表区显示失败空态+重试，避免误显示"当天暂无课程"
                refreshError: false,
                // refresh 序号：快速切天/翻周时丢弃过期响应，防止旧数据回写覆盖新数据
                refreshSeq: 0,
                installed: true,
                // 教务设置开关（schedule 接口下发）：允许学生请假 / 学生签到
                allowLeave: true,
                studentSign: true,
            };
        },
        computed: {
            currentStudent() {
                return this.students.find((x) => x.id == this.studentId) || {};
            },
            // 本周每日课数，传给日历组件作周内角标（取自已加载数据，不额外请求）
            dayCountMap() {
                const m = {};
                this.groups.forEach((g) => { m[g.date] = g.list.length; });
                return m;
            },
            // 列表以天为单位：仅展示选中日期当天的课程（数据来自已加载的整周）
            dayGroups() {
                const date = fmtDate(this.selectedTs);
                return this.groups.filter((g) => g.date === date);
            },
            // 角标配色表（以状态文案为键）：已完成绿 / 请假、请假中、未到橙 / 未签到走默认色。
            // 小程序端 :class 不支持方法调用，故模板直接查这张表，statusClass 同源复用给时间轴圆点
            statusClassMap() {
                return { '已消课': 'done', '已签到': 'done', '请假': 'warn', '请假中': 'warn', '未到': 'warn' };
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
        onShow() { if (this.installed) this.loadStudents(true); },
        onPullDownRefresh() { this.loadStudents(true); uni.stopPullDownRefresh(); },
        methods: {
            // 学生列表（分页：refresh 拉首页，否则加载下一页）
            loadStudents(refresh) {
                if (this.studentLoading) return;
                if (!refresh && !this.studentHasMore) return;
                const page = refresh ? 1 : this.studentPage + 1;
                this.studentLoading = true;
                if (refresh) this.studentRefreshing = true;
                this.studentLoadStatus = 'loading';
                this.$api('school.user.students', { page, limit: 20 }).then((ret) => {
                    const list = (ret.data && ret.data.list) || [];
                    this.students = refresh ? list : this.students.concat(list);
                    this.studentPage = page;
                    this.studentHasMore = !!ret.data.has_more;
                    this.studentLoadStatus = this.studentHasMore ? 'loadmore' : 'nomore';
                    this.studentLoading = false;
                    this.studentRefreshing = false;
                    this.pageLoading = false;
                    this.studentsLoaded = true;
                    this.studentsError = false;
                    if (!this.studentId && this.students.length) this.studentId = schoolStudent.resolve(this.students);
                    if (refresh) this.refresh();
                }).catch(() => {
                    this.studentLoading = false;
                    this.studentRefreshing = false;
                    this.studentLoadStatus = 'loadmore';
                    this.pageLoading = false;
                    // 无学生数据时标记失败：列表区显示"学生加载失败"+重试，不再静默
                    if (!this.students.length) this.studentsError = true;
                    // 学生列表失败不会触发课表请求（只有成功分支才 refresh），日历的蒙版必须在这里撤掉，
                    // 否则会一直盖着（日历卡是首屏的固定结构，蒙版撤不掉比空白角标更糟）
                    this.calendarLoading = false;
                });
            },
            // 拉取当前周（周一至周日）数据并按天分组；列表展示选中日期当天。
            // 周范围由选中日期派生（日历组件 v-model 回传选中日），翻周/切天都由 @change 触发本方法
            refresh() {
                // 学生未就绪（无学生/选择失败）：本次不会打课表接口，日历的蒙版不能一直盖着
                if (!this.studentId) { this.calendarLoading = false; return; }
                const weekStart = mondayOf(this.selectedTs);
                const startDate = fmtDate(weekStart);
                const endDate = fmtDate(weekStart.getTime() + 6 * 86400000);
                const seq = ++this.refreshSeq;
                this.listLoading = true;
                this.$api('school.user.schedule', {
                    student_id: this.studentId,
                    start_date: startDate,
                    end_date: endDate,
                }).then((ret) => {
                    // 过期响应丢弃：快速切天/翻周时后发的请求先回，旧响应不得覆盖新数据
                    if (seq !== this.refreshSeq) return;
                    // 首个课表数据已落地（成功或失败都算「初始化结束」），撤掉日历卡的加载蒙版
                    this.calendarLoading = false;
                    this.allowLeave = ret.data.allow_leave !== false;
                    this.studentSign = ret.data.student_sign !== false;
                    this.refreshError = false;
                    const rows = ((ret.data && ret.data.list) || []).map((s) => {
                        s.status_tag = this.statusTag(s);
                        return s;
                    });
                    // 按天分组（后端已按日期升序），组内按开始时间从早到晚排序
                    const groups = [];
                    const map = {};
                    rows.forEach((s) => {
                        const date = (s.date_text || '').split(' ')[0];
                        if (!map[date]) { map[date] = { date, date_text: s.date_text, list: [] }; groups.push(map[date]); }
                        map[date].list.push(s);
                    });
                    groups.forEach((g) => g.list.sort((a, b) => (a.start_time < b.start_time ? -1 : 1)));
                    this.groups = groups;
                    this.listLoading = false;
                }).catch(() => {
                    // 拉取失败且当前无任何数据：标记失败态，列表区显示"课表加载失败"+重试（不再静默）
                    if (seq === this.refreshSeq) {
                        this.listLoading = false;
                        this.calendarLoading = false;
                        if (!this.groups.length) this.refreshError = true;
                    }
                });
            },
            // 时间轴状态圆点配色（传给共用组件 tz-school-timeline 的 dot-color，组件只认 blue/green/orange）：
            // 与卡片角标同一口径派生——已完成（已消课/已签到）绿 / 请假未到橙 / 未签到蓝
            dotClass(s) {
                const cls = this.statusClass(s.status_tag);
                if (cls === 'done') return 'green';
                if (cls === 'warn') return 'orange';
                return 'blue';
            },
            // 状态标签（卡片右上角）：优先用后端下发的 list_status_text（口径唯一，避免两端各写一套翻译），
            // 旧版后端未下发时按同一判据本地兜底：先点名结果（请假/未到/请假中），
            // 其余按「已消课 > 已签到 > 未签到」——已签到且已消课＝已消课，已签到未消课＝已签到，未签到未消课＝未签到。
            // 需要分清「签没签」与「课时扣没扣」的地方（课次详情、上课记录）仍看两维文本，不用本标签
            statusTag(s) {
                if (s.list_status_text) return s.list_status_text;
                if (s.verify_status == 3) return '请假';
                if (s.verify_status == 4) return '未到';
                if (s.leave_id) return '请假中';
                if (s.verify_status == 1) return '已消课';
                return s.sign_time > 0 ? '已签到' : '未签到';
            },
            // 角标配色（.card-badge 的类名）：取自 statusClassMap，未命中为默认色
            statusClass(tag) {
                return this.statusClassMap[tag] || '';
            },
            // 签到成功后就地更新该课次（局部刷新）：只改这一条的状态字段，不整周重拉
            // （refresh 会把 listLoading 置位，整块列表闪回骨架屏并丢失当前位置）
            markSigned(id, verified) {
                this.groups.forEach((g) => {
                    const s = g.list.find((x) => x.id == id);
                    if (!s) return;
                    this.$set(s, 'sign_time', Math.floor(Date.now() / 1000));
                    if (verified) this.$set(s, 'verify_status', 1);
                    // 接口下发的合并角标在本地改动后已过期（statusTag 优先用后端文案），先清空再按同口径本地推导
                    this.$set(s, 'list_status_text', '');
                    this.$set(s, 'status_tag', this.statusTag(s));
                    // 签到后既不可再签也不可再请（与后端 can_sign / can_leave 口径一致：sign_time>0 时两者均为 false）
                    this.$set(s, 'can_sign', false);
                    this.$set(s, 'can_leave', false);
                });
            },
            // 签到按钮显隐：已签到或无需签到（已核销/请假/未到）后不再显示；未到时间等暂不可签场景仍置灰展示
            showSignBtn(s) {
                return !(s.sign_time > 0 || s.verify_status == 1 || s.verify_status == 3 || s.verify_status == 4);
            },
            // 请假按钮显隐：机构关闭学生请假（allow_leave）或该课次已不可请假（can_leave=false，如已签到/已核销/已过停止
            // 请假线）时直接不显示，不留点不动的置灰按钮（与课次详情页同口径）；已有请假单时仍显示为「请假详情」
            showLeaveBtn(s) {
                return this.allowLeave && !!(s.can_leave || s.leave_id);
            },
            // 签到按钮点击：可签先弹确认框防误触，确认后签到；置灰（不可签）时弹窗说明原因
            onSignTap(s) {
                if (!s.can_sign) {
                    uni.showModal({ title: '提示', content: this.signTip(s), showCancel: false });
                    return;
                }
                uni.showModal({
                    title: '签到确认',
                    content: '确认为「' + (s.course_name || '该课次') + '」签到吗？',
                    success: (res) => {
                        if (res.confirm) this.doSign(s);
                    },
                });
            },
            // 不可签到原因（与后端 sign() 校验口径、文案一致）
            signTip(s) {
                if (!this.studentSign) return '当前机构未开启学生签到';
                if (s.verify_status == 1) return '课程已签到，无需签到';
                if (s.verify_status == 3) return '请假已通过的课次无需签到';
                if (s.verify_status == 4) return '课次已标记未到，请联系机构处理';
                if (s.sign_time > 0) return '已签到，无需重复操作';
                const parts = (s.date_text || '').split(' ');
                const lessonDate = parts[0] || '';
                const today = fmtDate(new Date());
                if (lessonDate && lessonDate > today) return '尚未到签到时间，请在 ' + lessonDate + (parts[1] ? '（' + parts[1] + '）' : '') + '签到';
                if (lessonDate && lessonDate < today) return '已超过签到时间，该课次已结束';
                return '当前时间不在签到时间内';
            },
            doSign(s) {
                this.$api('school.user.sign', { schedule_student_id: s.id })
                    .then((ret) => {
                        // 全局拦截器对 code=0 只 toast 不 reject，须校验业务码，避免把失败提示成"签到成功"
                        if (!ret || ret.code !== 1) {
                            // code=0 全局拦截器已 toast 具体原因，401 已走登录弹窗，其余异常码此处兜底提示
                            if (ret && ret.code !== 0 && ret.code !== 401) {
                                uni.showModal({ title: '提示', content: ret.msg || '签到失败', showCancel: false });
                            }
                            return;
                        }
                        // 标签文案沿用本地推导（局部刷新不重拉列表）；关闭「签到自动消课」时说清课时待机构确认
                        const verified = !!(ret.data && ret.data.verified);
                        uni.showToast({ title: verified ? '签到成功，已消课' : '签到成功，课时待机构确认', icon: verified ? 'success' : 'none' });
                        this.markSigned(s.id, verified);
                    })
                    .catch((ret) => uni.showModal({ title: '提示', content: (ret && ret.errMsg) || '签到失败', showCancel: false }));
            },
            // 点击课程卡片进入课程详情（携带学生与课次定位参数，详情页按日期拉课表定位课次）
            goDetail(s) {
                const date = (s.date_text || '').split(' ')[0];
                uni.navigateTo({
                    url: '/pages/app/school/schedule/detail/detail?student_id=' + this.studentId + '&id=' + s.id + '&date=' + encodeURIComponent(date),
                });
            },
            goLeave(s) {
                // 课次已有请假单（待审核/已通过）：进请假详情查看与撤回，不再进申请表单
                if (s.leave_id) {
                    uni.navigateTo({ url: '/pages/app/school/leave/detail/detail?id=' + s.leave_id });
                    return;
                }
                // 携带课次数据，请假表单自动填充
                const lesson = { id: s.id, class_name: s.class_name, start_time: s.start_time, end_time: s.end_time };
                uni.navigateTo({
                    url: '/pages/app/school/leave/apply/apply?student_id=' + this.studentId + '&lesson=' + encodeURIComponent(JSON.stringify(lesson)),
                });
            },
        },
    };
</script>
