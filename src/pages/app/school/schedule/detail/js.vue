<script>
import TeacherInfoPopup from '../../package/components/teacher-info-popup.vue';

export default {
        components: { TeacherInfoPopup },
        data() {
            return {
                // 路由参数：student_id 学生、id 课次（schedule_student.id）、date 课次日期（Y-m-d）
                studentId: 0, id: 0, date: '',
                lesson: {},
                // 老师弹窗显隐（弹层内一次列出该课次全部授课老师及其联系电话）
                teacherPopupShow: false,
                // 教务设置开关（schedule 接口下发）：允许学生请假 / 学生签到
                allowLeave: true,
                studentSign: true,
                missing: false,
                loadError: false,
                skeletonLoading: true,
                installed: true,
            };
        },
        computed: {
            // 空态文案：课次不存在/加载失败（异常）两种口径
            emptyText() { return this.loadError ? '加载失败，请重试' : '课程不存在或已被删除'; },
            // 签到状态（与 signTip 提示口径一致：已核销/请假已通过/已标记未到的课次无需签到）
            signText() {
                const s = this.lesson;
                if (s.sign_time > 0) return '已签到';
                if (s.verify_status == 1 || s.verify_status == 3 || s.verify_status == 4) return '无需签到';
                if (s.leave_id) return '请假中';
                return '未签到';
            },
            // 消课状态（机构有没有确认扣课时），与后台 VerifyService::consumeStatusText 同口径：
            // 优先用接口下发文案，接口未下发时（旧版后端/局部刷新）按同一判据本地兜底；
            // 机构关闭「签到自动消课」时，学生签到后为「待消课」，签到状态仍是「已签到」，两行各说一件事；
            // 未签到／请假待审核＝还没进入消课环节，文案为「未消课」（后端该档不再下发空串）
            consumeText() {
                const s = this.lesson;
                if (s.consume_status_text) return s.consume_status_text;
                if (s.verify_status == 1) return '已消课';
                if (s.verify_status == 2) return '消课失败';
                if (s.verify_status == 3 || s.verify_status == 4) return s.account_id > 0 ? '已消课' : '无需消课';
                if (s.sign_time > 0) return '待消课';
                return '未消课';
            },
            lessonTime() {
                const d = this.lesson;
                if (!d.date_text) return '-';
                const t = [d.start_time, d.end_time].filter(Boolean).join('-');
                return t ? d.date_text + ' ' + t : d.date_text;
            },
            // 授课老师列表（元素含 name/role，1主讲 2助教；接口未下发时兜底为空数组）
            lessonTeachers() {
                return this.lesson.teachers || [];
            },
            // 老师行取值：全部授课老师姓名（一主讲一助教都能看到，身份/电话进弹窗看）；
            // 接口未下发 teachers 时回退后端的 main_teacher 兼容字段，都没有则占位「-」
            teacherText() {
                const names = this.lessonTeachers.map((t) => t.name).filter(Boolean);
                return names.length ? names.join('、') : (this.lesson.main_teacher || '-');
            },
            // 签到按钮显隐：已签到或无需签到（已核销/请假/未到）后不再显示；未到时间等暂不可签场景仍置灰展示
            showSignBtn() {
                const s = this.lesson;
                return !(s.sign_time > 0 || s.verify_status == 1 || s.verify_status == 3 || s.verify_status == 4);
            },
            // 请假按钮显隐：机构关闭学生请假（allow_leave）时隐藏；课次不可请假（已签到/已核销/已过停止请假线等）时
            // 直接不显示，不再留一个点不动的置灰按钮——操作区只放真正能用的操作；
            // 课次已有请假单（leave_id）时仍显示，转成「请假详情」供查看与撤回
            showLeaveBtn() {
                const s = this.lesson;
                return this.allowLeave && !!(s.can_leave || s.leave_id);
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
            options = options || {};
            this.id = parseInt(options.id) || 0;
            this.studentId = parseInt(options.student_id) || 0;
            this.date = options.date ? decodeURIComponent(options.date) : this.fmt(new Date());
        },
        onShow() { if (this.installed) this.refresh(); },
        onPullDownRefresh() { this.refresh(); uni.stopPullDownRefresh(); },
        methods: {
            fmt(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
            // 按课次日期拉当天课表并定位当前课次：can_sign/can_leave 取实时值，设置开关随接口一并下发。
            // skeletonLoading 仅首次为 true（data 初始值），此后 onShow/签到后的刷新静默更新
            refresh() {
                if (!this.id || !this.studentId) {
                    this.missing = true;
                    this.skeletonLoading = false;
                    return;
                }
                this.$api('school.user.schedule', {
                    student_id: this.studentId,
                    start_date: this.date,
                    end_date: this.date,
                }).then((ret) => {
                    this.allowLeave = ret.data.allow_leave !== false;
                    this.studentSign = ret.data.student_sign !== false;
                    const list = ret.data.list || [];
                    this.lesson = list.find((x) => x.id == this.id) || {};
                    this.missing = !this.lesson.id;
                    this.skeletonLoading = false;
                }).catch(() => {
                    this.loadError = true;
                    this.skeletonLoading = false;
                });
            },
            // 签到按钮点击：可签先弹确认框防误触，确认后签到；置灰（不可签）时弹窗说明原因
            onSignTap() {
                const s = this.lesson;
                if (!s || !s.id) return;
                if (!s.can_sign) {
                    uni.showModal({ title: '提示', content: this.signTip(s), showCancel: false });
                    return;
                }
                uni.showModal({
                    title: '签到确认',
                    content: '确认为「' + (s.course_name || '该课次') + '」签到吗？',
                    success: (res) => {
                        if (res.confirm) this.doSign();
                    },
                });
            },
            // 不可签到原因（与后端 sign() 校验口径、文案一致）
            signTip(s) {
                if (!this.studentSign) return '当前机构未开启学生签到';
                if (s.verify_status == 1) return '课程已签到，无需签到';
                if (s.verify_status == 3) return '请假已通过的课次无需签到';
                if (s.sign_time > 0) return '已签到，无需重复操作';
                const parts = (s.date_text || '').split(' ');
                const lessonDate = parts[0] || '';
                const today = this.fmt(new Date());
                if (lessonDate && lessonDate > today) return '尚未到签到时间，请在 ' + lessonDate + (parts[1] ? '（' + parts[1] + '）' : '') + '签到';
                if (lessonDate && lessonDate < today) return '已超过签到时间，该课次已结束';
                return '当前时间不在签到时间内';
            },
            doSign() {
                this.$api('school.user.sign', { schedule_student_id: this.lesson.id })
                    .then((ret) => {
                        // 全局拦截器对 code=0 只 toast 不 reject，须校验业务码，避免把失败提示成"签到成功"
                        if (!ret || ret.code !== 1) {
                            // code=0 全局拦截器已 toast 具体原因，401 已走登录弹窗，其余异常码此处兜底提示
                            if (ret && ret.code !== 0 && ret.code !== 401) {
                                uni.showModal({ title: '提示', content: ret.msg || '签到失败', showCancel: false });
                            }
                            return;
                        }
                        // 关闭「签到自动消课」时签到不会扣课时，提示里说清下一步（消课状态为待消课）
                        const verified = !!(ret.data && ret.data.verified);
                        uni.showToast({ title: verified ? '签到成功，已消课' : '签到成功，课时待机构确认', icon: verified ? 'success' : 'none' });
                        this.refresh();
                    })
                    .catch((ret) => uni.showModal({ title: '提示', content: (ret && ret.errMsg) || '签到失败', showCancel: false }));
            },
            goLeave() {
                const s = this.lesson;
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
            // 老师弹窗：多位老师时列出全部（头像/姓名/身份/联系电话），弹窗内每位老师可点进各自详情；
            // 接口未下发授课老师（无 id 可查）时不弹，避免开出空弹层
            openTeachers() {
                if (!this.lessonTeachers.length) return;
                this.teacherPopupShow = true;
            },
            // 老师行点击：单个老师直接进教师详情；多个老师先弹名单再各自进详情
            onTeacherTap() {
                const list = this.lessonTeachers;
                if (list.length === 1 && list[0].id) {
                    this.goTeacher(list[0]);
                    return;
                }
                this.openTeachers();
            },
            // 教师详情页（老师行与老师弹窗共用同一目标页与参数口径）
            goTeacher(t) {
                if (!t || !t.id) return;
                uni.navigateTo({ url: '/pages/app/school/teacher/detail/detail?id=' + t.id });
            },
            // 校区详情页：接口未下发 campus_id 时不响应（行尾箭头同样不出现）
            goCampus() {
                if (!this.lesson.campus_id) return;
                uni.navigateTo({ url: '/pages/app/school/campus/detail/detail?id=' + this.lesson.campus_id });
            },
        },
    };
</script>
