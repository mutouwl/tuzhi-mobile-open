<script>
import StudentSelectPopup from '../package/components/student-select-popup.vue';
import schoolStudent from '@/common/utils/school-student';

export default {
  components: { StudentSelectPopup },
  data() {
    return {
      installed: true,
      students: [], studentId: 0, studentPickerVisible: false,
      studentPage: 1, studentHasMore: false, studentLoading: false,
      // 学生列表是否完成过一次加载（区分「未添加学生」与「列表尚未加载完」）
      studentsLoaded: false,
      // 学生页拦截：未选定学生进入学生页时暂存目标入口，选定学生后继续跳转
      pendingNav: null,
      // 拦截等待首屏学生列表返回期间的加载遮罩状态（只在展示过时才 hide，避免误关其他提示）
      navLoading: false,
      // 入口分两组：我的教务（学生自己的数据）/ 套餐与校区（机构商品库、校区库，只读查询）
      // icon 只能取 iconfont.ttf 里有字形的名字：教务专用图标（kebiao、yuyue、qingjia、xuexiao 等）
      // 在 iconfont.css 里有规则但字体缺字形，会渲染成空白（口径见 .trae/progress/school.md 2026-09-17）
      // size 是逐个实测值（fontTools 读 ttf 字形墨迹盒，unitsPerEm 1024）：iconfont 混了多套图标，
      // 同一字号下墨迹最大边占比从 0.688（createtask）到 1.000（满幅）差 45%，故按「墨迹归一到 21px」
      // 反推字号（= 21 ÷ 墨迹占比），并压在宫格缺省 28px 这一上限内——需要超过 28 才归得平的（createtask 30.5、
      // flag 29.2、coordinates 28.6）一律按 28 走，墨迹落 19.2~21.2px，仍在参照网格的 19~23px 视觉带内：
      //   满幅 1.000 的字形（如 peixun）归一要 21，与缺省差得多，用到时单列一档
      //   0.876 ⇒ 24：daifukuan（已购课程）
      //   0.797/0.781 ⇒ 26：activity（我的课表）、addressbook（学生列表）
      //   0.758/0.750/0.746/0.735 ⇒ 28：clock（我的预约）、document（上课记录）、commodity（全部套餐）、coordinates（校区列表）
      //   0.719/0.688 ⇒ 28（已到上限）：flag（我的请假）、createtask（课时流水）
      // activity/document/coordinates 在个人中心「常用功能」网格里也有（表单、考试、收货地址，都走缺省 28），
      // 本页按归一 21px 取值，与那边差在 1~2px 墨迹内，不算分叉；
      // 换图标要按同一办法重测墨迹改这一列（缺省字号见 index.vue 的 `item.size || 28`）
      navGroups: [
        {
          title: "我的教务",
          items: [
            { name: "我的课表", icon: "activity", size: 26, path: "/pages/app/school/schedule/index/index", needStudent: true },
            // 预约上课入口放在「我的预约」页底部按钮，本页不重复提供；
            // 我的预约与课时流水均按 student_id 查询，进入时带上当前选中学生
            { name: "我的预约", icon: "clock", size: 28, path: "/pages/app/school/booking/list/list", needStudent: true, withStudent: true },
            { name: "已购课程", icon: "daifukuan", size: 24, path: "/pages/app/school/balance/index/index", needStudent: true },
            { name: "课时流水", icon: "createtask", size: 28, path: "/pages/app/school/balance/logs/logs", needStudent: true, withStudent: true },
            { name: "上课记录", icon: "document", size: 28, path: "/pages/app/school/records/index/index", needStudent: true },
            { name: "我的请假", icon: "flag", size: 28, path: "/pages/app/school/leave/list/list" },
            { name: "学生列表", icon: "addressbook", size: 26, path: "/pages/app/school/student/list/list" },
          ],
        },
        {
          title: "套餐与校区",
          items: [
            { name: "全部套餐", icon: "commodity", size: 28, path: "/pages/app/school/package/list/list" },
            { name: "校区列表", icon: "coordinates", size: 28, path: "/pages/app/school/campus/list/list" },
          ],
        },
      ],
    };
  },
  computed: {
    currentStudent() {
      return this.students.find((x) => x.id == this.studentId) || {};
    },
    // 首次加载学生列表且尚无姓名回显时：按钮内展示骨架块（已有姓名则保留，避免刷新闪骨架）
    studentPickSkeleton() {
      return this.studentLoading && !this.currentStudent.name;
    },
  },
  onLoad() {
    if (!this.$tools.systemConfig("app_isinstall_school")) {
      this.installed = false;
      uni.showToast({ title: "该功能未开通", icon: "none" });
      setTimeout(() => {
        if (getCurrentPages().length > 1) { uni.navigateBack(); } else { uni.reLaunch({ url: "/pages/index/index" }); }
      }, 800);
    }
  },
  onShow() {
    if (this.installed) this.loadStudents(true);
  },
  methods: {
    go(item) {
      if (!item.needStudent) {
        this.navigate(item);
        return;
      }
      // 已有可用学生（本页已选中，或本地缓存的上次选中）就直接进：
      // 不能让学生列表请求的在途窗口吃掉点击——请求偶发慢的时候，点了没反应要等接口返回才跳
      if (this.knownStudentId()) {
        this.navigate(item);
        return;
      }
      // 暂存目标入口：弹窗选定学生后由 onStudentPicked 续跳，首屏列表返回后续判
      this.pendingNav = item;
      // 列表已确认加载完、名下确实没有学生：直接引导选择
      if (this.studentsLoaded) {
        this.promptStudent();
        return;
      }
      // 首屏列表还没返回过且无缓存可用：无从判断有没有学生，只能等这一次返回，期间给加载遮罩
      this.showNavLoading();
    },
    // 当前可用的学生 id：本页已选中优先，其次本地缓存的上次选中（目标页会各自按列表校验兜底）
    knownStudentId() {
      return this.studentId || (schoolStudent.get() || {}).id || 0;
    },
    navigate(item) {
      let url = item.path;
      if (item.withStudent) {
        // 学生列表未加载完时回退本地缓存的上次选中学生
        url += '?student_id=' + this.knownStudentId();
      }
      this.pendingNav = null;
      this.endNavLoading();
      uni.navigateTo({ url });
    },
    // 无可选学生时的引导：提示后弹出选择学生弹窗（目标入口仍暂存在 pendingNav，选定后续跳）
    promptStudent() {
      this.endNavLoading();
      uni.showModal({
        title: '提示',
        content: '请先选择学生',
        showCancel: false,
        success: () => {
          this.studentPickerVisible = true;
        },
      });
    },
    showNavLoading() {
      if (this.navLoading) return;
      this.navLoading = true;
      uni.showLoading({ title: '加载中', mask: true });
    },
    endNavLoading() {
      if (!this.navLoading) return;
      this.navLoading = false;
      uni.hideLoading();
    },
    // 首屏学生列表返回后的续判：有学生续跳目标页，没有则引导选择
    resumePendingNav() {
      const item = this.pendingNav;
      if (!item) return;
      // 选择弹窗已打开（含新建学生返回）：等用户在弹窗内操作，避免弹层未关就跳页或重复提示
      if (this.studentPickerVisible) return;
      if (this.students.length || this.knownStudentId()) this.navigate(item);
      else this.promptStudent();
    },
    // 学生列表（分页：refresh 拉首页，否则加载下一页）；恢复上次选中的学生供按钮回显
    loadStudents(refresh) {
      if (this.studentLoading) return;
      if (!refresh && !this.studentHasMore) return;
      const page = refresh ? 1 : this.studentPage + 1;
      this.studentLoading = true;
      this.$api('school.user.students', { page, limit: 20 }).then((ret) => {
        const list = ret.data.list || [];
        this.students = refresh ? list : this.students.concat(list);
        this.studentPage = page;
        this.studentHasMore = !!ret.data.has_more;
        this.studentLoading = false;
        if (refresh) {
          this.studentsLoaded = true;
          if (!this.studentId && this.students.length) this.studentId = schoolStudent.resolve(this.students);
          // 首屏学生加载完成：续判被拦截的学生页进入
          this.resumePendingNav();
        }
      }).catch(() => {
        this.studentLoading = false;
        if (refresh) {
          this.studentsLoaded = true;
          this.resumePendingNav();
        }
      });
    },
    // 弹窗确认选择学生（弹窗内部已写入缓存，供其他页面恢复）
    onStudentPicked(s) {
      if (!s || !s.id) return;
      this.studentId = s.id;
      // 拦截进入期间确认的学生：继续进入原目标页
      const item = this.pendingNav;
      if (item) {
        this.pendingNav = null;
        this.navigate(item);
      }
    },
    // 弹窗关闭（取消选择）：丢弃暂存的目标入口，下次进入重新判定
    onStudentPickerClose() {
      this.studentPickerVisible = false;
      this.pendingNav = null;
    },
  },
};
</script>
