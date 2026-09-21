<script>
import schoolStudent from '@/common/utils/school-student';
import { fmtDate, todayStart } from '@/common/utils/school-date';
import TCalendar from '@tdesign/uniapp/calendar/calendar.vue';
import CourseSelectPopup from '../../package/components/course-select-popup.vue';

const PAGE_SIZE = 20;
// 课次时间范围：默认跨度 30 天（与旧版硬编码的「今天 ~ 30 天后」一致），可选上限 180 天（与 tz-school-calendar 口径一致）
const RANGE_DAYS = 30;
const RANGE_MAX_DAYS = 180;
export default {
        components: { TCalendar, CourseSelectPopup },
        data() {
            const today = new Date();
            return {
                students: [], studentId: 0,
                studentPage: 1, studentHasMore: false, studentLoading: false, studentRefreshing: false, studentLoadStatus: 'loadmore',
                sessions: [], selectedSessions: [], sessionLoading: false,
                // 骨架屏行数与每条文字条宽度（3 行不等宽，避免整屏一样的死板占位）
                sessionSkRows: ['68%', '82%', '55%'],
                // 课次请求序号：筛选条件连续变化会并发多个首屏请求，只认最后一次响应，过期响应直接丢弃
                sessionReqSeq: 0,
                sessionPage: 1, sessionHasMore: false, sessionRefreshing: false, sessionLoadStatus: 'loadmore',
                // 课次筛选：课程（0＝全部课程）+ 时间范围（YYYY-MM-DD，默认今天 ~ 30 天后）。
                // 课程选项首项「全部课程」恒可用（对齐课时余额页的兜底口径），取到接口选项后整体覆盖
                courseId: 0, courseOptions: [{ id: 0, name: '全部课程' }],
                rangeStart: fmtDate(today), rangeEnd: fmtDate(new Date(today.getTime() + RANGE_DAYS * 86400000)), rangeVisible: false,
                type: 1, types: { 1: '事假', 2: '病假', 3: '其他' },
                reason: '', mediaForm: { images: [], videos: [], audio: {}, files: [] },
                // 图片上传中（tz-media-editor uploading-change 驱动）：禁用添加与提交，避免提交不完整图片
                uploading: false,
                pickSessionVisible: false, pickTypeVisible: false, pickCourseVisible: false,
                submitting: false,
                installed: true,
            };
        },
        computed: {
            selectedSessionIds() {
                return this.selectedSessions.map((s) => s.id);
            },
            currentStudentName() {
                const s = this.students.find((x) => x.id == this.studentId);
                return s ? s.name : '';
            },
            currentSessionText() {
                if (!this.selectedSessions.length) return '';
                if (this.selectedSessions.length === 1) {
                    const s = this.selectedSessions[0];
                    return (s.class_name || '') + ' ' + s.start_time + '-' + s.end_time;
                }
                return '已选' + this.selectedSessions.length + '个课次';
            },
            typeName() { return this.types[this.type]; },
            // 课程筛选回显：选项由后端随课次列表下发（首项 id=0 为「全部课程」），未取到选项时兜底「全部课程」
            courseName() {
                const o = this.courseOptions.find((x) => x.id == this.courseId);
                return o ? o.name : '全部课程';
            },
            // 时间范围展示文案（日期范围用「至」连接）
            rangeText() { return this.rangeStart && this.rangeEnd ? this.rangeStart + ' 至 ' + this.rangeEnd : '请选择'; },
            // 日历受控值：起止日期当天 0 点时间戳（TDesign 区间日历 value 只认时间戳，不接受日期字符串）
            rangeValue() {
                if (!this.rangeStart || !this.rangeEnd) return [];
                return [new Date(this.rangeStart + ' 00:00:00').getTime(), new Date(this.rangeEnd + ' 00:00:00').getTime()];
            },
            // 日历可选范围：今天 ~ 180 天后（已过课次的 can_leave 恒为 false，不放进可选范围）
            rangeMinDate() { return todayStart(); },
            rangeMaxDate() { return todayStart() + RANGE_MAX_DAYS * 86400000; },
        },
        watch: {
            // 课程筛选变化：剔除已选中其它课程的课次后回第一页重拉。
            // 挂在 courseId（值本身）而非弹层的 select 回调上：选择弹窗先 emit input 把新值写回页面、
            // 再 emit select，回调里比对新旧值恒相等（课时余额页的课程/校区筛选因此失效过）；
            // watch 只在值真正变化时触发，重复选中同一门课程不会白拉一次
            courseId() {
                this.reloadByFilter();
            },
        },
        onLoad(query) {
            if (!this.$tools.systemConfig('app_isinstall_school')) {
                this.installed = false;
                uni.showToast({ title: '该功能未开通', icon: 'none' });
                setTimeout(() => {
                    if (getCurrentPages().length > 1) { uni.navigateBack(); } else { uni.reLaunch({ url: '/pages/index/index' }); }
                }, 800);
                return;
            }
            // 课表跳转进入时预填学生与课次
            query = query || {};
            if (query.student_id) this.studentId = parseInt(query.student_id) || 0;
            if (query.lesson) {
                try {
                    const lesson = JSON.parse(decodeURIComponent(query.lesson));
                    if (lesson && lesson.id) this.selectedSessions = [lesson];
                } catch (e) {}
            }
            // 带入的课次若已提交过请假，直接进请假详情，不留在表单里（见 redirectIfLessonLeave）
            this.redirectIfLessonLeave();
        },
        onShow() {
            if (!this.installed) return;
            this.loadStudents(true);
            if (this.studentId) this.loadSessions(true);
        },
        methods: {
            // 带入的课次已有请假单时直接跳请假详情：留在表单里既能改又能提交，但提交必被后端拦下
            // （重复请假），不如把已经提交过的那张单子摆给用户；查不到或没有请假单时保持原样进表单。
            // 用 redirectTo 替掉本页——返回时回到课表/教务中心，而不是又退回这张已无意义的表单
            redirectIfLessonLeave() {
                if (!this.studentId || this.selectedSessions.length !== 1) return;
                const scheduleStudentId = parseInt(this.selectedSessions[0].id) || 0;
                if (!scheduleStudentId) return;
                this.$api('school.user.lessonLeave', {
                    student_id: this.studentId,
                    schedule_student_ids: [scheduleStudentId],
                }).then((ret) => {
                    if (!ret || ret.code !== 1) return;
                    const hit = (ret.data && ret.data.list && ret.data.list[0]) || null;
                    if (!hit || !hit.leave_id) return;
                    uni.showToast({ title: '该课次已有' + (hit.status_text || '') + '的请假申请', icon: 'none' });
                    uni.redirectTo({ url: '/pages/app/school/leave/detail/detail?id=' + hit.leave_id });
                }).catch(() => {});
            },
            // 学生列表（分页：refresh 拉首页，否则加载下一页）
            loadStudents(refresh) {
                if (this.studentLoading) return;
                if (!refresh && !this.studentHasMore) return;
                const page = refresh ? 1 : this.studentPage + 1;
                this.studentLoading = true;
                if (refresh) this.studentRefreshing = true;
                this.studentLoadStatus = 'loading';
                this.$api('school.user.students', { page, limit: PAGE_SIZE }).then((ret) => {
                    const list = ret.data.list || [];
                    this.students = refresh ? list : this.students.concat(list);
                    this.studentPage = page;
                    this.studentHasMore = !!ret.data.has_more;
                    this.studentLoadStatus = this.studentHasMore ? 'loadmore' : 'nomore';
                    this.studentLoading = false;
                    this.studentRefreshing = false;
                    // 未携带预选学生时恢复上次选择（无缓存则默认第一个），并加载其可请假课次
                    if (!this.studentId && this.students.length) {
                        this.studentId = schoolStudent.resolve(this.students);
                        this.loadSessions(true);
                    }
                }).catch(() => {
                    this.studentLoading = false;
                    this.studentRefreshing = false;
                    this.studentLoadStatus = 'loadmore';
                });
            },
            // 课次列表（分页）
            loadSessions(refresh) {
                if (!this.studentId) return;
                // 翻页不并发；刷新（切换筛选/下拉）允许抢占进行中的请求，被抢占的那次响应由序号丢弃
                if (this.sessionLoading && !refresh) return;
                if (!refresh && !this.sessionHasMore) return;
                const page = refresh ? 1 : this.sessionPage + 1;
                const seq = ++this.sessionReqSeq;
                this.sessionLoading = true;
                if (refresh) this.sessionRefreshing = true;
                this.sessionLoadStatus = 'loading';
                this.$api('school.user.schedule', {
                    student_id: this.studentId,
                    course_id: this.courseId,
                    start_date: this.rangeStart,
                    end_date: this.rangeEnd,
                    // 可请假课次由后端按同一套口径（开关/未核销/未过结束时间/停止请假线）在 SQL 里过滤：
                    // 取回后再前端过滤会让 total/has_more 与实际可选项脱节，翻到某页可能被筛空又加载不到后面
                    can_leave: 1,
                    page, limit: PAGE_SIZE,
                }).then((ret) => {
                    if (seq !== this.sessionReqSeq) return;
                    const list = ret.data.list || [];
                    this.sessions = refresh ? list : this.sessions.concat(list);
                    // 课程筛选选项随列表下发（后端保证不随筛选裁剪，用户可随时切回「全部课程」）；
                    // 只在首屏刷新时覆盖，翻页响应不必重复赋值，接口未下发时保留「全部课程」兜底
                    const options = ret.data.course_options || [];
                    if (refresh && options.length) this.courseOptions = options;
                    this.sessionPage = page;
                    this.sessionHasMore = !!ret.data.has_more;
                    this.sessionLoadStatus = this.sessionHasMore ? 'loadmore' : 'nomore';
                    this.sessionLoading = false;
                    this.sessionRefreshing = false;
                }).catch(() => {
                    if (seq !== this.sessionReqSeq) return;
                    this.sessionLoading = false;
                    this.sessionRefreshing = false;
                    this.sessionLoadStatus = 'loadmore';
                });
            },
            toggleSession(s) {
                const idx = this.selectedSessions.findIndex((x) => x.id == s.id);
                if (idx > -1) this.selectedSessions.splice(idx, 1);
                else this.selectedSessions.push(s);
            },
            confirmSessions() {
                if (!this.selectedSessions.length) {
                    uni.showToast({ title: '请选择课次', icon: 'none' });
                    return;
                }
                this.pickSessionVisible = false;
            },
            onRangeVisible(e) { this.rangeVisible = e; },
            onRangeClose() { this.rangeVisible = false; },
            // 时间范围确认：应用新范围后回第一页重新拉取课次；范围外的已选课次同时剔除
            onRangeConfirm(e) {
                const list = (e && e.value) || [];
                this.rangeVisible = false;
                if (list.length < 2) return;
                this.rangeStart = fmtDate(list[0]);
                this.rangeEnd = fmtDate(list[1]);
                this.reloadByFilter();
            },
            // 筛选条件（课程 / 时间范围）变化后重拉：旧课次属于上一个条件，先清空让骨架屏接管列表区，
            // 否则请求返回前列表仍摆在原位——既显示着旧条件的数据、又能被点到选中
            reloadByFilter() {
                this.dropOutOfScopeSessions();
                this.sessions = [];
                this.sessionPage = 1;
                this.sessionHasMore = false;
                this.sessionLoadStatus = 'loadmore';
                this.loadSessions(true);
            },
            // 剔除不在当前筛选（课程 / 时间范围）内的已选课次——
            // 否则选中项留在列表外既看不见、在弹层里也取消不掉（提交时却仍会带上）
            dropOutOfScopeSessions() {
                const start = Math.floor(new Date(this.rangeStart + ' 00:00:00').getTime() / 1000);
                const end = Math.floor(new Date(this.rangeEnd + ' 23:59:59').getTime() / 1000);
                const kept = this.selectedSessions.filter((s) => {
                    // 课表页跳转带入的课次只带 id/班级/时间，无 course_id 与 lesson_date；
                    // 字段缺失时无法判断，保留，避免误删用户已选
                    const cid = parseInt(s.course_id) || 0;
                    if (this.courseId > 0 && cid > 0 && cid !== this.courseId) return false;
                    // lesson_date 为后端下发的当天 0 点秒级时间戳
                    const ts = parseInt(s.lesson_date) || 0;
                    return !ts || (ts >= start && ts <= end);
                });
                if (kept.length === this.selectedSessions.length) return;
                this.selectedSessions = kept;
                uni.showToast({ title: '已移除当前筛选外的已选课次', icon: 'none' });
            },
            // 九宫格添加格（tz-media-editor 的 add 事件）→ 选图：展示/删除/预览/真实上传均由编辑器处理
            chooseImage() {
                if (this.uploading) return;
                this.$refs.mediaEditor.chooseImage();
            },
            // 上传状态变化：上传中禁用添加格与提交
            onUploadingChange(uploading) {
                this.uploading = !!uploading;
            },
            submit() {
                if (this.submitting) return;
                if (this.uploading) { uni.showToast({ title: '图片上传中，请稍候', icon: 'none' }); return; }
                if (!this.studentId) { uni.showToast({ title: '请先在教务中心选择学生', icon: 'none' }); return; }
                if (!this.selectedSessions.length) { uni.showToast({ title: '请选择课次', icon: 'none' }); return; }
                // 与后端校验文案一致（LeaveService::checkParams）
                if (!this.reason.trim()) { uni.showToast({ title: '请填写请假原因', icon: 'none' }); return; }
                this.submitting = true;
                // 加载弹窗：mask 同时挡住重复点击与误触（提交要等后端逐课次校验，耗时肉眼可见）
                uni.showLoading({ title: '提交中', mask: true });
                this.$api('school.user.leaveSubmit', {
                    student_id: this.studentId,
                    schedule_student_ids: this.selectedSessionIds,
                    type: this.type, reason: this.reason, images: this.mediaForm.images,
                }).then((ret) => {
                    this.submitting = false;
                    uni.hideLoading();
                    // 全局拦截器对 code=0 只弹 1 秒 toast（且不 reject），故必须校验业务码再走成功分支，
                    // 否则「该课次已有待审核的请假申请」这类拦截也会提示提交成功并跳进列表
                    if (!ret || ret.code !== 1) {
                        // 失败原因一律用确认框完整展示：toast 1 秒就消失，用户看不到到底为什么被拦（401 由拦截器弹登录框）
                        if (ret && ret.code !== 401) {
                            uni.showModal({ title: '提示', content: ret.msg || '提交失败', showCancel: false });
                        }
                        return;
                    }
                    uni.showToast({ title: '提交成功', icon: 'success' });
                    // 提交成功后先关掉本页再进「我的请假」：直接 navigateTo 会把已提交的这张表单留在页面栈里，
                    // 从列表返回时又回到表单上（还得再退一次才能离开）
                    setTimeout(() => this.closeToLeaveList(), 800);
                }).catch((ret) => {
                    this.submitting = false;
                    uni.hideLoading();
                    // 网络异常/超时同样把服务端或框架给出的原因摆出来，不吞成笼统的「提交失败」
                    uni.showModal({ title: '提示', content: (ret && ret.msg) || '提交失败', showCancel: false });
                });
            },
            // 关掉本页并进入「我的请假」：上一页就是请假列表时（从列表页「发起请假」进来）直接回退复用该页，
            // 避免列表重复入栈；其余入口（教务中心、我的课表/课次详情）用 redirectTo 关掉本页再打开列表
            closeToLeaveList() {
                const target = '/pages/app/school/leave/list/list';
                const pages = getCurrentPages();
                const prev = pages.length > 1 ? pages[pages.length - 2] : null;
                const prevRoute = prev && prev.route ? '/' + String(prev.route).replace(/^\//, '') : '';
                if (prevRoute === target) {
                    uni.navigateBack();
                    return;
                }
                uni.redirectTo({ url: target });
            },
        },
    };
</script>
