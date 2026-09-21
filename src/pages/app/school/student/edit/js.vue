<script>
import schoolStudent from '@/common/utils/school-student';

export default {
        data() {
            return {
                form: { avatar: '', name: '', phone: '', gender: 1, birthday: '' },
                studentId: 0,
                pageLoading: false,
                detailError: false,
                detailErrorMsg: '学生不存在或已被删除',
                // 编辑模式骨架屏行配置：与表单行同构（标签条 + 右侧值条/头像块），row-col 支持自定义宽高与形状
                skeletonRows: [
                    [{ width: '70px', height: '16px', type: 'text' }, { width: '56px', height: '56px', type: 'rect' }],
                    [{ width: '70px', height: '16px', type: 'text' }, { width: '40%', height: '16px', type: 'text' }],
                    [{ width: '70px', height: '16px', type: 'text' }, { width: '40%', height: '16px', type: 'text' }],
                    [{ width: '70px', height: '16px', type: 'text' }, { width: '120px', height: '18px', type: 'rect' }],
                    [{ width: '70px', height: '16px', type: 'text' }, { width: '40%', height: '16px', type: 'text' }],
                ],
                today: '',
                birthdayValue: '',
                // 日期边界为毫秒时间戳
                minBirthdayTs: new Date(1900, 0, 1).getTime(),
                maxBirthdayTs: 0,
                birthdayVisible: false,
                submitting: false,
                installed: true,
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
            const d = new Date();
            this.today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            this.maxBirthdayTs = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            // 带学生 id 为编辑模式：回显详情；否则为新建模式
            const id = options && options.id ? parseInt(options.id) : 0;
            if (id > 0) {
                this.studentId = id;
                uni.setNavigationBarTitle({ title: '编辑学生' });
                this.pageLoading = true;
                this.loadDetail();
            }
        },
        methods: {
            // 头像：选图后走通用上传，保存 full_url
            chooseAvatar() {
                uni.chooseImage({
                    count: 1,
                    sizeType: ['compressed'],
                    success: (res) => {
                        const path = res.tempFilePaths && res.tempFilePaths[0];
                        if (!path) return;
                        this.$tools.uploadImage('common/upload', path).then((ret) => {
                            this.form.avatar = ret.full_url;
                        });
                    },
                });
            },
            // 编辑模式：拉取学生详情回显（birthday 接口已转 Y-m-d 文本）；学生不存在时展示空态
            loadDetail() {
                this.$api('school.user.studentDetail', { id: this.studentId }).then((ret) => {
                    // code=0 时拦截器已 toast 错误信息（如学生不存在）
                    if (!ret || ret.code !== 1) {
                        this.detailError = true;
                        this.detailErrorMsg = (ret && ret.msg) || this.detailErrorMsg;
                        this.pageLoading = false;
                        return;
                    }
                    const stu = ret.data || {};
                    this.detailError = false;
                    this.form.avatar = stu.avatar || '';
                    this.form.name = stu.name || '';
                    this.form.phone = stu.phone || '';
                    this.form.gender = stu.gender || 1;
                    this.form.birthday = stu.birthday || '';
                    this.pageLoading = false;
                }).catch(() => {
                    this.detailError = true;
                    this.pageLoading = false;
                });
            },
            // 空态点击新建：切回新建模式（清空表单与错误态）
            resetToCreate() {
                this.studentId = 0;
                this.detailError = false;
                this.form = { avatar: '', name: '', phone: '', gender: 1, birthday: '' };
                uni.setNavigationBarTitle({ title: '新建学生' });
            },
            openBirthday() {
                this.birthdayValue = this.form.birthday || this.today;
                this.birthdayVisible = true;
            },
            onBirthdayPick(e) {
                if (e && e.value) this.birthdayValue = e.value;
            },
            confirmBirthday() {
                this.form.birthday = this.birthdayValue;
                this.birthdayVisible = false;
            },
            save() {
                if (this.submitting) return;
                const name = this.form.name.trim();
                if (!name) { uni.showToast({ title: '请填写学生姓名', icon: 'none' }); return; }
                if (!/^1[3-9]\d{9}$/.test(this.form.phone)) { uni.showToast({ title: '请填写正确的手机号码', icon: 'none' }); return; }
                this.submitting = true;
                const params = {
                    avatar: this.form.avatar,
                    name: name,
                    phone: this.form.phone,
                    gender: this.form.gender,
                    birthday: this.form.birthday,
                };
                const isEdit = this.studentId > 0;
                if (isEdit) params.id = this.studentId;
                this.$api(isEdit ? 'school.user.studentEdit' : 'school.user.studentAdd', params).then((ret) => {
                    if (!ret || ret.code !== 1) {
                        // code=0 业务错误拦截器已 toast；非 JSON/HTTP 500 等异常响应无提示，这里兜底用确认框
                        if (!ret || typeof ret !== 'object' || ret.code === undefined) {
                            uni.showModal({ title: '提示', content: (ret && ret.msg) || '保存失败，请重试', showCancel: false });
                        }
                        this.submitting = false;
                        return;
                    }
                    this.submitting = false;
                    if (isEdit) {
                        // 编辑的是当前选中/缓存学生时，同步更新缓存，避免其他页面显示旧资料
                        const current = schoolStudent.get();
                        if (current && current.id == this.studentId) {
                            schoolStudent.set({ id: this.studentId, name: name, avatar: this.form.avatar, phone: this.form.phone });
                        }
                        uni.showToast({ title: '保存成功', icon: 'success' });
                    } else {
                        // 通知选择学生弹窗刷新并选中新学生
                        uni.$emit('schoolStudentCreated', { id: ret.data ? ret.data.id : 0, name: name });
                        uni.showToast({ title: '新建成功', icon: 'success' });
                    }
                    setTimeout(() => uni.navigateBack(), 800);
                }).catch((ret) => {
                    // 网络异常/超时等失败必须可见，与请假申请页失败弹确认框一致
                    this.submitting = false;
                    uni.showModal({ title: '提示', content: (ret && ret.msg) || '保存失败，请重试', showCancel: false });
                });
            },
        },
    };
</script>
