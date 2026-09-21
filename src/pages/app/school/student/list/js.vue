<script>
import schoolStudent from '@/common/utils/school-student';

export default {
        data() {
            // loading 首屏即加载态（避免先闪“暂无绑定学生”空态）；fetching 为请求进行中标记
            return { students: [], page: 1, hasMore: false, loading: true, fetching: false, loadStatus: 'loadmore', installed: true, studentTotal: 0, studentLimit: 5 };
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
        mounted() {
            // 新建学生页保存成功后：自动选中该学生（列表随 onShow 刷新）
            uni.$on('schoolStudentCreated', this.onStudentCreated);
        },
        beforeDestroy() {
            uni.$off('schoolStudentCreated', this.onStudentCreated);
        },
        onReachBottom() { this.loadStudents(false); },
        methods: {
            // 学生列表（分页：refresh 拉首页，否则加载下一页）
            loadStudents(refresh) {
                if (this.fetching) return;
                if (!refresh && !this.hasMore) return;
                const page = refresh ? 1 : this.page + 1;
                this.fetching = true;
                this.loading = true;
                this.loadStatus = 'loading';
                this.$api('school.user.students', { page, limit: 20 }).then((ret) => {
                    const list = ret.data.list || [];
                    this.students = refresh ? list : this.students.concat(list);
                    this.page = page;
                    this.hasMore = !!ret.data.has_more;
                    // 名下学生总数 + 创建上限（0 表示不限制），供新建入口超限提示
                    this.studentTotal = parseInt(ret.data.total) || 0;
                    const createLimit = parseInt(ret.data.student_limit);
                    this.studentLimit = isNaN(createLimit) ? 5 : createLimit;
                    this.loadStatus = this.hasMore ? 'loadmore' : 'nomore';
                    this.loading = false;
                    this.fetching = false;
                }).catch(() => {
                    this.loading = false;
                    this.fetching = false;
                    this.loadStatus = 'loadmore';
                });
            },
            onStudentCreated(stu) {
                if (stu && stu.id) {
                    schoolStudent.set(stu);
                }
            },
            goAdd() {
                // 达到创建上限（教务设置）时不再进入新建页，弹窗说明
                if (!schoolStudent.canCreate(this.studentTotal, this.studentLimit)) {
                    uni.showModal({ title: '提示', content: schoolStudent.createLimitMessage(this.studentLimit), showCancel: false });
                    return;
                }
                uni.navigateTo({ url: '/pages/app/school/student/edit/edit' });
            },
            // 编辑学生：跳转编辑页（编辑保存后列表随 onShow 刷新）
            goEdit(s) { uni.navigateTo({ url: '/pages/app/school/student/edit/edit?id=' + s.id }); },
        },
    };
</script>
