<script>
import { listTitle, applyH5Share, mpCard } from "@/common/utils/checkin-share";
var that;
export default {
  data() {
    return {
      id: 0,
      loading: true,
      notFound: false,
      loadMsg: "",
      title: "",
      // 分享卡片用：活动封面由 taskCalendar 接口一并下发（见后端 shareMeta）
      cover: "",
      nickname: "",
      avatar: "",
      // 打卡昵称长度上限吃接口值（nickname_max），不前端写死
      nicknameMax: 0,
      joinedText: "",
      done: 0,
      undone: 0,
      monthDone: 0,
      redMarks: {},
      tasks: [],
      selectedDay: "",
    };
  },
  computed: {
    // 微信分享卡片（列表页口径）：「活动名 · 任务日历」+ 活动封面，活动名未回来时只用页面名
    shareTitle() {
      return listTitle(this.title, "任务日历");
    },
    shareCover() {
      return this.cover || "";
    },
    joinText() {
      return this.joinedText ? this.joinedText + " 加入「" + this.checkinTitle + "」" : "";
    },
    checkinTitle() {
      return this.title || "";
    },
    // 统计三格与打卡记录页 .cr-stats 同一摆法（口径文字在上、数值在下）
    statList() {
      return [
        { label: "已打卡", value: this.done },
        { label: "未打卡", value: this.undone },
        { label: "当月打卡", value: this.monthDone },
      ];
    },
    // done / can_makeup / can_check 全部由后端逐条下发（TaskGate，与提交校验同源）：
    // 原来在这里按「当天有没有日记」判 done，同一天挂第二个任务时会跟着一起变「已打卡」，
    // 补卡也只判日期、不看剩余次数与活动是否结束，点进去才被后端拒掉
    dayTasks() {
      return this.tasks.filter((t) => t.day === this.selectedDay);
    },
    todayStr() {
      const d = new Date();
      const pad = (n) => (n < 10 ? "0" + n : "" + n);
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    },
  },
  onLoad(options) {
    that = this;
    if (!that.$tools.systemConfig("app_isinstall_checkin")) {
      uni.showToast({ title: "打卡功能未安装", icon: "none" });
      setTimeout(() => uni.navigateBack(), 800);
      that.loading = false; // 兜底分支也要撤骨架：这一页只弹一句 toast 就留在灰块上，看着像「一直加载中」
      return;
    }
    that.id = Number(options.id || 0);
    // 首屏先用登录缓存占位（缓存键是 user_info 且为 JSON 字符串，旧写法读 "userInfo" 取到的永远是空值，
    // 于是这张用户卡在接口回来前是空白），接口回来后由 getData 覆盖成后端下发的打卡昵称与头像
    const user = that.$tools.cachedUser();
    that.nickname = user.nickname || "";
    that.avatar = user.avatar || "";
    that.getData();
  },
  // 模块级 that 停在最后 onLoad 的实例上；本页重新可见先收回绑定
  // （同一路由在栈里出现两次时，日期切换/统计重取会改到已销毁的那一个上）
  onShow() {
    that = this;
  },
  // 下拉刷新（pages.json 已开 enablePullDownRefresh）：任务日历/统计整页重取，当前选中日期保留不动
  onPullDownRefresh() {
    that.getData().then(
      () => uni.stopPullDownRefresh(),
      () => uni.stopPullDownRefresh()
    );
  },
  methods: {
    // 分享卡片口径见 common/utils/checkin-share：H5 走 JSSDK，小程序端走下面的 onShare* 钩子
    applyShare() {
      applyH5Share(this.$nav, this.shareTitle, this.shareCover);
    },
    // 用户卡右侧编辑入口：弹共用的修改昵称弹窗（field=checkin，改的是我在本活动的打卡昵称）
    openNicknameEdit() {
      that.$refs.nicknameModal.open();
    },
    // 头像加载失败（坏链/文件被删）：兜底默认头像（与接口未下发头像时同一张），不留破图
    onAvatarError() {
      this.avatar = '/static/image/default-avatar.png';
    },
    // 保存成功：接口回来的昵称先落上，再整页重取（打卡昵称也是动态流/排行榜/日签图用的那一份）
    onNicknameSaved(nickname) {
      that.nickname = nickname;
      that.getData();
    },
    pad(n) { return n < 10 ? "0" + n : "" + n; },
    getData() {
      return that.$api("checkin.checkin.taskCalendar", { checkin_id: that.id })
        .then((ret) => {
          if (!ret || ret.code !== 1) {
            if (!that.title) {
              that.notFound = true;
              that.loadMsg = (ret && ret.msg) || "打卡活动不存在或已下架";
            }
            that.loading = false;
            return;
          }
          that.notFound = false;
          that.loadMsg = "";
          const d = ret.data || {};
          that.done = d.done || 0;
          that.undone = d.undone || 0;
          that.monthDone = d.month_done || 0;
          that.tasks = d.tasks || [];
          const marks = {};
          (d.red_dots || []).forEach((day) => { marks[day] = 1; });
          that.redMarks = marks;
          if (d.joined_at) {
            const jd = new Date(d.joined_at * 1000);
            that.joinedText = jd.getFullYear() + "-" + that.pad(jd.getMonth() + 1) + "-" + that.pad(jd.getDate()) + " " + that.pad(jd.getHours()) + ":" + that.pad(jd.getMinutes()) + ":" + that.pad(jd.getSeconds());
          }
          if (!that.selectedDay) {
            that.selectedDay = d.today || that.todayStr;
          }
          that.title = d.title || that.title;
          that.cover = d.cover || that.cover;
          // 用户卡的昵称/头像以接口下发为准（打卡昵称优先、为空才回落账号昵称，与记录页同一份 ownCard）
          if (d.nickname) that.nickname = d.nickname;
          if (d.avatar) that.avatar = d.avatar;
          if (Number(d.nickname_max)) that.nicknameMax = Number(d.nickname_max);
          that.loading = false;
          // 分享标题要带活动名，放在数据回调最后一步（H5 分享调用抛异常会中断前面的渲染）
          this.applyShare();
        })
        .catch(() => {
          if (!that.title) {
            that.notFound = true;
            that.loadMsg = "加载失败，请重试";
          }
          that.loading = false;
        });
    },
    onDayClick(day) {
      that.selectedDay = day;
    },
    goSubmit(task) {
      // 与活动主页任务卡同一个落点、同一套口径：列表这一层不拦点击（原来 done / 时间窗外的任务在这儿吃一句
      // toast，用户读卡上看不出差别），「去打卡」恒可点，能不能打卡由任务详情页的吸底按钮按后端
      // can_check / check_msg 判并给原因（ui-baseline-mobile.md M22）
      uni.navigateTo({ url: "/pages/app/checkin/taskdetail/taskdetail?task_id=" + task.id });
    },
  },
  // 小程序转发/朋友圈卡片：与 H5 同一份标题封面（口径见 common/utils/checkin-share）
  onShareAppMessage() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover);
  },
  onShareTimeline() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover, true);
  },
};
</script>
