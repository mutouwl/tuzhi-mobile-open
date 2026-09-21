<script>
import schoolStudent from '@/common/utils/school-student';
import StudentSelectPopup from '../components/student-select-popup.vue';
import StudentInfo from '../components/student-info.vue';
import PackageGoodsCard from '@/components/tz/package-goods-card.vue';
export default {
    components: { StudentSelectPopup, StudentInfo, PackageGoodsCard },
    data() {
        // 预填上次选中的学生（教务中心/确认页切换后缓存），进页后拉列表刷新姓名/班级并兜底解析
        return { id: 0, skuIndex: 0, campusId: 0, form: {}, student: schoolStudent.get() || { id: 0, name: '' }, studentPopup: false, skeletonLoading: true, installed: true };
    },
    computed: {
        sku() {
            return (this.form.skus || [])[this.skuIndex] || {};
        },
        skuLessons() {
            return (this.sku.courses || []).reduce((sum, c) => sum + parseFloat(c.lessons || 0), 0);
        },
        validText() {
            const sku = this.sku;
            if (!sku.id) return '';
            return sku.valid_type == 1 ? '长期有效' : sku.valid_days + '天内有效';
        },
        campusName() {
            const campus = (this.form.campus_list || []).find((c) => c.id == this.campusId);
            return campus ? campus.name : '';
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
        this.id = options.id;
        this.skuIndex = parseInt(options.sku) || 0;
        this.campusId = parseInt(options.campus) || 0;
        this.getData();
        // 拉取绑定学生列表：刷新缓存学生的展示字段（姓名/班级），未选中过时兜底解析
        this.resolveStudent();
    },
    methods: {
        getData() {
            this.$api('school.package.detail', { id: this.id }).then((ret) => {
                this.form = ret.data || {};
                this.skeletonLoading = false;
            }).catch(() => {
                this.skeletonLoading = false;
            });
        },
        // 拉取绑定学生列表：缓存学生仍存在时用接口数据刷新展示字段，否则按统一规则兜底解析
        resolveStudent() {
            this.$api('school.user.students').then((ret) => {
                const list = (ret.data && ret.data.list) || [];
                if (!list.length) return;
                if (this.student.id) {
                    const hit = list.find((x) => x.id == this.student.id);
                    if (hit) this.student = hit;
                    return;
                }
                this.student = list.find((x) => x.id == schoolStudent.resolve(list)) || { id: 0, name: '' };
            }).catch(() => {});
        },
        // 弹层确认切换上课学生（弹层内部已写入缓存，供其他页面恢复）
        onStudentPicked(stu) {
            if (!stu || !stu.id) return;
            this.student = stu;
        },
        // 提交订单 → 提交订单页（未登录时由接口拦截跳登录页）。
        // 用 redirectTo 关掉本页：确认过校区/学生后不该再退回本页重选，返回直接回上一级套餐详情
        goSubmit() {
            if (!this.sku.id) { uni.showToast({ title: '套餐信息有误，请返回重新选择', icon: 'none' }); return; }
            if (!this.student.id) { uni.showToast({ title: '请选择上课学生', icon: 'none' }); return; }
            const goodsList = JSON.stringify([{
                goodsId: this.sku.id,
                goodsType: 'school_package',
                count: 1,
                extend: {
                    package_id: this.form.id,
                    student_id: this.student.id,
                    campus_id: this.campusId,
                },
            }]);
            this.$nav.to('/pages/order/submit/submit?type=school_package&goodsList=' + goodsList, 'local', 'redirectTo');
        },
    },
};
</script>
