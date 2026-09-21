<script>
import CampusSelectPopup from '../../package/components/campus-select-popup.vue';
import CourseSelectPopup from '../../package/components/course-select-popup.vue';
import RenewPackagePopup from './components/renew-package-popup.vue';
import schoolStudent from '@/common/utils/school-student';

// 课时账户每页条数（账户随购课增长，按页下发；上限 50 由后端兜底）
const ACCOUNT_PAGE_SIZE = 20;
// 续费套餐每页条数（与账户明细分页口径一致；上限 100 由后端兜底）
const RENEW_PAGE_SIZE = 20;
export default {
        components: { CampusSelectPopup, CourseSelectPopup, RenewPackagePopup },
        data() {
            return {
                students: [], studentId: 0,
                coursePickerVisible: false, campusPickerVisible: false,
                studentPage: 1, studentHasMore: false, studentLoading: false, studentRefreshing: false, studentLoadStatus: 'loadmore',
                // loading 首屏即加载态（避免先闪“暂无课时账户”空态）
                balance: { accounts: [] }, loading: true, installed: true,
                // 账户明细分页（汇总与筛选选项始终是筛选后的全部口径，只有明细按页取）
                accountPage: 1, accountHasMore: false, accountFetching: false, accountLoadStatus: 'loadmore',
                courseId: 0, campusId: 0,
                // 续费套餐（课时不足的账户点「续费」时按该账户的课程拉取）：多套餐弹窗、单套餐直接进详情
                renewPopupVisible: false, renewCourseId: 0, renewCourseName: '',
                renewList: [], renewPage: 1, renewHasMore: false, renewLoading: false, renewLoaded: false, renewLoadStatus: 'loadmore', renewFetching: false,
            };
        },
        computed: {
            courseCount() { return this.balance.course_count || 0; },
            remain() { return this.balance.remain_lessons || 0; },
            used() { return this.balance.used_lessons || 0; },
            accounts() { return this.balance.accounts || []; },
            courseOptions() { return this.balance.course_options || [{ id: 0, name: '全部课程' }]; },
            campusOptions() { return this.balance.campus_options || [{ id: 0, name: '全部校区' }]; },
            courseName() {
                const o = this.courseOptions.find((x) => x.id == this.courseId);
                return o ? o.name : '全部课程';
            },
            campusName() {
                const o = this.campusOptions.find((x) => x.id == this.campusId);
                return o ? o.name : '全部校区';
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
        watch: {
            // 课程/校区筛选变化后刷新统计与账户明细。
            // 不能放在弹层的 select 回调里比对新旧值：选择弹窗先 emit input（v-model 已把新值写回）
            // 再 emit select，回调里比出来的永远相等，筛选就再也不会刷新（标签变了、列表不动）；
            // watch 只在值真正变化时触发，「重复选同一项不刷新」的意图由它保证
            courseId() { this.refresh(); },
            campusId() { this.refresh(); },
        },
        onShow() {
            if (!this.installed) return;
            this.loadStudents(true);
        },
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
                    const list = ret.data.list || [];
                    this.students = refresh ? list : this.students.concat(list);
                    this.studentPage = page;
                    this.studentHasMore = !!ret.data.has_more;
                    this.studentLoadStatus = this.studentHasMore ? 'loadmore' : 'nomore';
                    this.studentLoading = false;
                    this.studentRefreshing = false;
                    if (!this.studentId && this.students.length) this.studentId = schoolStudent.resolve(this.students);
                    if (refresh) this.refresh();
                }).catch(() => {
                    this.studentLoading = false;
                    this.studentRefreshing = false;
                    this.studentLoadStatus = 'loadmore';
                    // 学生加载失败：结束首屏加载态，避免全屏 loading 常驻
                    if (!this.students.length) this.loading = false;
                });
            },
            fmtDate(ts) {
                const d = new Date(parseInt(ts) * 1000);
                return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            },
            remainOf(a) { return Math.round((a.total_lessons - a.used_lessons) * 100) / 100; },
            // 账户失效：已停用（status 0）或已过有效期（与后台 BookingService/课时台账的判定口径一致）
            isExpired(a) {
                return a.status == 0 || (parseInt(a.expire_time) > 0 && parseInt(a.expire_time) < Math.floor(Date.now() / 1000));
            },
            // 可预约：账户有效、未过期且还有剩余课时
            canBook(a) {
                return !this.isExpired(a) && this.remainOf(a) > 0;
            },
            // 卡片右上角状态标签：只在异常状态出文案（正常可预约不打标），文案沿用后台课时台账口径
            accStatusText(a) {
                if (this.isExpired(a)) return '已过期';
                return this.remainOf(a) > 0 ? '' : '课时不足';
            },
            // 预约入口：剩余课时不足的账户不展示（状态标签已说明原因），有课时才给入口
            hasBookEntry(a) { return this.remainOf(a) > 0; },
            // 预约入口：跳到预约上课页并带上该课程与学生（课程作为筛选条件）
            goBook(a) {
                if (!this.canBook(a)) {
                    uni.showModal({ title: '提示', content: this.isExpired(a) ? '该课时账户已过期，请联系机构处理' : '该课程暂无可预约课时，请先购买课程套餐', showCancel: false });
                    return;
                }
                uni.navigateTo({
                    url: '/pages/app/school/booking/index/index?student_id=' + this.studentId + '&course_id=' + a.course_id,
                });
            },
            // 续费入口：剩余课时不足的账户可续费（买该课程的套餐给同一账户加课时，与后台开通同一套台账口径）。
            // 已停用（status 0）的账户台账直接拒绝加课时（LedgerService 抛「该课时账户已过期，无法操作」），不给入口
            needRenew(a) {
                return a.status != 0 && this.remainOf(a) <= 0;
            },
            // 点「续费」：先按该账户的课程拉套餐——只有 1 个可购买套餐时直接进套餐详情（少一层没意义的选择），
            // 多个时开弹窗列表；唯一的那个不可购买时也开弹窗（状态标在行上，能说明为什么不能买）
            goRenew(a) {
                if (this.renewFetching) return;
                this.renewFetching = true;
                this.renewCourseId = a.course_id;
                this.renewCourseName = a.course_name || '';
                this.renewLoaded = false;
                this.renewLoading = true;
                // 点按钮到出结果之间有请求：加载弹窗遮罩，兼作防连点
                uni.showLoading({ title: '加载中', mask: true });
                this.fetchRenew(1).then((res) => {
                    uni.hideLoading();
                    this.renewFetching = false;
                    this.renewLoading = false;
                    this.renewLoaded = true;
                    if (!res.ok) {
                        this.renewFail(res.msg);
                        return;
                    }
                    const data = res.data;
                    const list = data.list || [];
                    this.renewList = list;
                    this.renewPage = 1;
                    this.renewHasMore = !!data.has_more;
                    this.renewLoadStatus = this.renewHasMore ? 'loadmore' : 'nomore';
                    if (list.length === 1 && !this.renewHasMore && list[0].buyable) {
                        this.goRenewPackage(list[0]);
                        return;
                    }
                    this.renewPopupVisible = true;
                });
            },
            // 续费套餐拉取（首屏与翻页共用）。
            // 业务码必须校验：拦截器对 code=0 不 reject、异常会被 resolve 成原始响应体，不校验就把失败当空列表
            fetchRenew(page) {
                return this.$api('school.package.course', {
                    course_id: this.renewCourseId,
                    page,
                    limit: RENEW_PAGE_SIZE,
                }).then((ret) => {
                    if (ret && ret.code === 1) return { ok: true, data: ret.data || {} };
                    return { ok: false, msg: (ret && ret.msg) || '' };
                }).catch(() => ({ ok: false, msg: '' }));
            },
            // 续费/套餐加载失败：确认框完整展示原因（拦截器对 code=0 只弹 1 秒 toast，原因容易错过）
            renewFail(msg) {
                uni.showModal({ title: '提示', content: msg || '套餐加载失败，请重试', showCancel: false });
            },
            // 弹窗上拉到底续拉下一页：只接列表，已加载的套餐保留
            loadMoreRenew() {
                if (!this.renewHasMore || this.renewFetching || this.renewLoading) return;
                this.renewFetching = true;
                this.renewLoading = true;
                this.renewLoadStatus = 'loading';
                const page = this.renewPage + 1;
                this.fetchRenew(page).then((res) => {
                    this.renewFetching = false;
                    this.renewLoading = false;
                    if (!res.ok) {
                        // 失败保留已加载的套餐，状态复位让用户可再次上拉重试
                        this.renewLoadStatus = 'loadmore';
                        this.renewFail(res.msg);
                        return;
                    }
                    const data = res.data;
                    this.renewList = this.renewList.concat(data.list || []);
                    this.renewPage = page;
                    this.renewHasMore = !!data.has_more;
                    this.renewLoadStatus = this.renewHasMore ? 'loadmore' : 'nomore';
                });
            },
            // 点套餐行：可购买的直接进套餐详情（学生与校区在详情页/确认页选）；不可购买的说明原因并停在原地
            goRenewPackage(p) {
                if (!p.buyable) {
                    uni.showToast({ title: '该套餐' + (p.status_text || '暂不可购买'), icon: 'none' });
                    return;
                }
                this.renewPopupVisible = false;
                uni.navigateTo({ url: '/pages/app/school/package/detail/detail?id=' + p.id });
            },
            // 账户明细拉取（首屏与翻页共用同一套筛选参数）
            fetchAccounts(page) {
                return this.$api('school.user.balance', {
                    student_id: this.studentId,
                    course_id: this.courseId,
                    campus_id: this.campusId,
                    page,
                    limit: ACCOUNT_PAGE_SIZE,
                });
            },
            refresh() {
                // 未选中学生时没有可加载数据：结束首屏加载态，避免全屏 loading 常驻
                if (!this.studentId) { this.loading = false; return; }
                this.loading = true;
                this.accountPage = 1;
                this.accountLoadStatus = 'loading';
                this.fetchAccounts(1).then((ret) => {
                    this.balance = ret.data || {};
                    this.accountHasMore = !!this.balance.has_more;
                    this.accountLoadStatus = this.accountHasMore ? 'loadmore' : 'nomore';
                    this.loading = false;
                }).catch(() => {
                    this.loading = false;
                    this.accountLoadStatus = 'loadmore';
                });
            },
            // 滚动到底续拉下一页：只接明细，首屏的汇总与筛选选项保持不变
            loadMoreAccounts() {
                if (!this.accountHasMore || this.accountFetching || this.loading) return;
                this.accountFetching = true;
                this.accountLoadStatus = 'loading';
                const page = this.accountPage + 1;
                this.fetchAccounts(page).then((ret) => {
                    const data = ret.data || {};
                    this.balance = Object.assign({}, this.balance, data, {
                        accounts: (this.balance.accounts || []).concat(data.accounts || []),
                    });
                    this.accountPage = page;
                    this.accountHasMore = !!data.has_more;
                    this.accountLoadStatus = this.accountHasMore ? 'loadmore' : 'nomore';
                    this.accountFetching = false;
                }).catch(() => {
                    // 失败保留已加载的账户，状态复位让用户可再次上拉重试
                    this.accountFetching = false;
                    this.accountLoadStatus = 'loadmore';
                });
            },
            onReachBottom() { this.loadMoreAccounts(); },
        },
    };
</script>