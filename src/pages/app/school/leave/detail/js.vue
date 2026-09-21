<script>
export default {
        data() {
            return { id: 0, detail: {}, installed: true, skeletonLoading: true, missing: false, loadError: false };
        },
        computed: {
            emptyText() { return this.loadError ? '加载失败，请重试' : '请假单不存在或已被撤销'; },
            statusText() { return { 0: '待审核', 1: '已通过', 2: '已拒绝', 3: '已取消' }[this.detail.status] || ''; },
            statusIcon() { return { 0: 'unpaid', 1: 'success', 2: 'close', 3: 'cancel' }[this.detail.status] || ''; },
            typeName() { return { 1: '事假', 2: '病假', 3: '其他' }[this.detail.type] || '-'; },
            campusName() { return this.detail.campus_name || '-'; },
            sessionText() {
                const d = this.detail;
                if (!d.lesson_date_text) return '-';
                const t = [d.start_time, d.end_time].filter(Boolean).join('-');
                return t ? d.lesson_date_text + ' ' + t : d.lesson_date_text;
            },
            auditTimeText() { return this.detail.audit_time > 0 ? this.fmt(this.detail.audit_time) : '-'; },
            cancelTimeText() { return this.detail.status == 3 && this.detail.updatetime > 0 ? this.fmt(this.detail.updatetime) : '-'; },
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
            this.id = options.id;
        },
        onShow() {
            if (!this.installed) return;
            this.getData();
        },
        onPullDownRefresh() { this.getData(); uni.stopPullDownRefresh(); },
        methods: {
            // 加载详情：首次与下拉刷新共用；异常/不存在落空态
            getData() {
                this.$api('school.user.leaveDetail', { id: this.id }).then((ret) => {
                    // 全局拦截器对 code=0 只 toast 不 reject，须校验业务码；请假单不存在/无权查看落空态
                    if (ret && ret.code === 1 && ret.data) {
                        this.detail = ret.data;
                        this.detail.createtime_text = this.fmt(ret.data.createtime) + ' ' + (ret.data.audit_time > 0 ? '' : '');
                    } else {
                        this.missing = true;
                    }
                    this.skeletonLoading = false;
                }).catch(() => {
                    this.loadError = true;
                    this.skeletonLoading = false;
                });
            },
            // 校区详情页：接口未下发 campus_id（课次已被删除）时不响应，行尾箭头同样不出现
            goCampus() {
                if (!this.detail.campus_id) return;
                uni.navigateTo({ url: '/pages/app/school/campus/detail/detail?id=' + this.detail.campus_id });
            },
            fmt(ts) {
                const d = new Date(parseInt(ts) * 1000);
                return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
            },
            cancelLeave() {
                uni.showModal({
                    title: '提示', content: '确定撤回该请假申请吗',
                    success: (res) => {
                        if (!res.confirm) return;
                        this.$api('school.user.leaveCancel', { id: this.id })
                            .then(() => {
                                uni.showToast({ title: '撤回成功', icon: 'success' });
                                setTimeout(() => uni.navigateBack(), 800);
                            })
                            .catch((ret) => uni.showModal({ title: '提示', content: ret.msg || '撤回失败', showCancel: false }));
                    },
                });
            },
        },
    };
</script>