<script>
import schoolStudent from '@/common/utils/school-student';
import StudentSelectPopup from '../components/student-select-popup.vue';
import StudentInfo from '../components/student-info.vue';
import CampusSelectPopup from '../components/campus-select-popup.vue';
import PackageGoodsCard from '@/components/tz/package-goods-card.vue';
// 拼团下单上下文（扁平 gb_* 键）：本页既是普通报名的确认页，也是**拼团那条链**的确认页 ——
// 拼团进来时原样收下、确认完（校区可换、学生可选）再原样带回结算页。键名只存那一处（硬约束 11）。
import { readGroupBuyOrder, withGroupBuyOrder } from '@/common/utils/group-buy-order.js';
export default {
    components: { StudentSelectPopup, StudentInfo, CampusSelectPopup, PackageGoodsCard },
    data() {
        // 预填上次选中的学生（教务中心/确认页切换后缓存），进页后拉名单按接口数据校正（见 resolveStudent）
        return { id: 0, skuIndex: 0, campusId: 0, form: {}, student: schoolStudent.get() || { id: 0, name: '' }, studentPopup: false, campusPicker: false, gb: {}, skeletonLoading: true, installed: true };
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
        // 校区格文案：已选显示名称；还有可选校区但没选 ⇒ 提示去选；一个可选校区都没有（全部删/禁用）⇒ '-'
        campusText() {
            if (this.campusName) { return this.campusName; }
            return (this.form.campus_list || []).length ? '请选择校区' : '-';
        },
        /** 拼团那一趟（拼团区经 URL 带 `gb_activity` 等扁平键进来） */
        gbMode() {
            return Number(this.gb.gb_activity) > 0;
        },
        /**
         * 商品卡上的价：拼团档显示**拼团价**（与规格弹窗同一个取价口，`common/utils/group-buy-spec.js`），
         * 绝不在确认页再摆一次原价 —— 「一屏两个价」已经被用户点过多次名；普通档仍按所选规格的原价。
         */
        displayPrice() {
            const gbPrice = Number(this.gb.gb_price) || 0;
            if (this.gbMode && gbPrice > 0) {
                return gbPrice.toFixed(2);
            }
            return this.sku.price;
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
        // 拼团上下文本页不解释、只搬运（进结算页时再和确认后的校区/学生一起交回去）
        this.gb = readGroupBuyOrder(options);
        this.getData();
        // 拉取绑定学生列表：刷新缓存学生的展示字段（姓名/班级），未选中过时兜底解析
        this.resolveStudent();
    },
    methods: {
        getData() {
            this.$api('school.package.detail', { id: this.id }).then((ret) => {
                this.form = ret.data || {};
                // 进页时没带校区 / 带了但已失效（软删或停用）：只有一个可选校区就直接选上，
                // 多个则等用户在本页点选（校区格写「请选择校区」，提交前会拦一次）
                if (!this.campusName && (this.form.campus_list || []).length === 1) {
                    this.campusId = Number(this.form.campus_list[0].id) || 0;
                }
                this.skeletonLoading = false;
            }).catch(() => {
                this.skeletonLoading = false;
            });
        },
        // 拉取绑定学生列表：本页学生以接口下发的名单为准（接口只含未删除的学生），缓存只作首帧占位。
        // 缓存学生不在名单中＝已被机构删除或已解绑：先丢掉失效缓存再按统一规则回落，
        // 否则本页会一直回显已删除的学生，教务中心也会继续拿这个失效 id 拼学生页链接
        resolveStudent() {
            this.$api('school.user.students').then((ret) => {
                const list = (ret.data && ret.data.list) || [];
                const hit = this.student.id ? list.find((x) => x.id == this.student.id) : null;
                if (hit) { this.student = hit; return; }
                if (this.student.id) schoolStudent.clear();
                this.student = list.find((x) => x.id == schoolStudent.resolve(list)) || { id: 0, name: '' };
            }).catch(() => {});
        },
        /**
         * 校区格：校区选择走共用弹层 `campus-select-popup`（校区卡 + 右侧单选，与课时余额页同一只），
         * 不在本页另造选择器（2026-10-30 用户点名「明明有自定义的校区选择呀，为什么不用」）。
         * 没有可选校区（套餐绑定校区全部删除/禁用）时说一句，不开一只空弹层。
         */
        openCampusPicker() {
            if (!(this.form.campus_list || []).length) {
                uni.showToast({ title: '暂无可选校区', icon: 'none' });
                return;
            }
            this.campusPicker = true;
        },
        onCampusPicked(c) {
            if (!c || !c.id) { return; }
            this.campusId = Number(c.id) || 0;
            this.campusPicker = false;
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
            // 校区：套餐还有可选校区时必须选一个（后端取价口按「校区适用」核，0 会以「该套餐不支持所选校区」拒单）
            if (!this.campusId && (this.form.campus_list || []).length) {
                uni.showToast({ title: '请选择上课校区', icon: 'none' });
                return;
            }
            if (!this.student.id) { uni.showToast({ title: '请选择上课学生', icon: 'none' }); return; }
            // 拼团那一趟（2026-10-30）：校区与学生确认完，把拼团上下文原样带回结算页 ——
            // 结算页的拼团档因此不再需要任何校区/学生选择器（用户点名「不要原生 Picker」）
            if (this.gbMode) {
                let url = '/pages/order/submit/submit?goodsList=[]';
                url = withGroupBuyOrder(url, Object.assign({}, this.gb, {
                    gb_campus: this.campusId,
                    gb_student: this.student.id,
                }));
                this.$nav.to(url, 'local', 'redirectTo');
                return;
            }
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
