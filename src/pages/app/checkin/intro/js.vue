<script>
import { detailTitle, applyH5Share, mpCard } from "@/common/utils/checkin-share";
// 拼团「加入别人的团」上下文（团详情「立即加入」带 gb_team 一组参数进本页）
import { readGroupBuyJoin } from "@/common/utils/group-buy-join.js";
import scoreExchange from '@/common/mixins/score-exchange.js';
var that;
export default {
  mixins: [scoreExchange],
  data() {
    return {
      id: 0,
      loading: true,
      info: null,
      loadMsg: "",
      pwdVisible: false,
      password: "",
      // 参与请求进行中：防连点（成功后要跳主页，连点会开两份主页）
      joining: false,
      // 拼团区「这一趟是被送去下单/支付的」那本账：回本页时只静默重取拼团区那两条
      // （开团付完款要看见自己那一行、活动结束要把那一段收掉），本页本体仍按原有判据取
      // 购买弹幕素材（拼团区 @ready 上抛的 `activity.buyers`），只喂封面左上角那一枚
      gbBuyers: [],
      gbPending: false,
      // 拼团区经 @ready 上抛的活动摘要（{ text } / null）：底栏那枚拼团按钮的显隐与文案吃它
      gbEntry: null,
      // 「我在这一场拼团里已有进行中的团」：底栏那枚「立即购买」收不收吃它（PRD 2026-10-27）。
      // 判据只认拼团区 @ready 上抛的 inTeam（后端 GoodsArea::myTeam），页面不读 my_team 自己拼
      gbInTeam: false,
      // 受邀参团（2026-10-30）：URL 带 gb_team 时进 join 态，底栏只留「加入拼团」
      gbJoinCtx: null,
      gbJoinMode: false,
    };
  },
  computed: {
    /**
     * 宿主价格行显不显示（2026-10-30 第五轮，用户第二次点名「拼团价要复制覆盖原来的价格」）：
     * 拼团进行中（拼团区 `@ready` 上抛的 `gbEntry.activity` 非空）⇒ 本页价格行收起，
     * 价格只由拼团卡第一行的横幅给 —— 一屏只有一个价；没有活动 / 活动结束抛 null ⇒ 照常显示。
     * 判据只此一处（与底栏那枚拼团按钮、封面弹幕同一份 `gbEntry`）。
     */
    gbPriceShown() {
      return !(this.gbEntry && this.gbEntry.activity);
    },
    // 分享卡片（详情页口径）：标题取活动名称、封面取活动封面，与打卡主页/教务详情页同口径；
    // 活动名要等 detail 接口回来，未回来时用「打卡」占位，不能让卡片标题空着
    shareTitle() {
      return detailTitle(this.info && this.info.title, "打卡");
    },
    shareCover() {
      return (this.info && this.info.cover) || "";
    },
    attr() {
      return (this.info && this.info.attr) || {};
    },
    joinType() {
      return (this.info && this.info.join_type) || "";
    },
    // 枚举文案全部取接口 attr（后端单一来源），前端不另存一份中文映射
    stateText() {
      const info = this.info || {};
      return ((this.attr.run_state || {})[info.run_state]) || "";
    },
    joinTypeText() {
      return (this.attr.join_type || {})[this.joinType] || "";
    },
    modeText() {
      const info = this.info || {};
      return ((this.attr.checkin_mode || {})[info.checkin_mode]) || "";
    },
    isPay() {
      return this.joinType === "pay";
    },
    // 参与价按代币显示：判据取后端 detail 下发的 is_virtual_pay（只在微信小程序端且商家勾了打卡时为 1），
    // 前端不再自己读一遍虚拟支付配置（M22 同一件事只判一处）
    isVirtualPay() {
      return Number(this.info && this.info.is_virtual_pay) === 1 && uni.getStorageSync("platform") === "wxMiniProgram";
    },
    isMember() {
      return !!this.info && Number(this.info.is_member) === 1;
    },
    /**
     * 被主办方拉黑（后台成员管理那一列）
     *
     * 后端把这一档视同未参与（is_member=0），但单独下发 is_black：本页吸底栏据此只出一句原因，
     * 不留一枚「点了必被后端拒」的参与按钮 —— 拉黑只能由后台解除，学员端没有这条路（M13、不留死按钮）。
     */
    isBlack() {
      return !!this.info && Number(this.info.is_black) === 1;
    },
    // 已购关联课程（后端按 Subscription::getUserCourse 判）：绑定课程的吸底操作据此二选一
    hasCourse() {
      return !!this.info && Number(this.info.has_course) === 1;
    },
    // 参与入口是否已关闭：活动已结束、或过了参与截止时间。两种情形各给各的文案，
    // 吸底栏落只读提示，不出现「点了必被后端拒」的死按钮（后端 assertJoinDeadline 同判据）
    joinClosed() {
      const info = this.info || {};
      if (!info.id) return false;
      if (info.run_state === "ended") return true;
      return Number(info.join_deadline_type) === 2 && Number(info.join_deadline) > 0
        && Math.floor(Date.now() / 1000) > Number(info.join_deadline);
    },
    joinClosedText() {
      const info = this.info || {};
      return info.run_state === "ended" ? "打卡活动已结束" : "参与已截止";
    },
    // 打卡时间：固定起止=日期区间（结束可不限）；固定天数=每人 N 天（随到随学），与列表卡同一句口径
    dateText() {
      const info = this.info || {};
      if (Number(info.time_type) === 2) return "每人打卡 " + info.total_days + " 天（随到随学）";
      return (info.start_date || "") + " 至 " + (info.end_date || "不限");
    },
    // 页头参与数据：「已进行 x/y 天」（固定起止才有此口径）+ 人数 + 次数，与后台详情页统计同一份来源。
    // 这一对两头都在活动窗口那根轴上：done_days=今天落在窗口内是第几个有效打卡日、total_days=窗口内的
    // 有效打卡天数（扣除休息日），所以永远 x<=y；「我自己打过几天」不在这根轴上，走我的打卡列表那份 day_count
    // （介绍页曾出现「已进行 3/2 天」，成因是详情接口把 total_days 覆盖成了后者，2026-09-26 已修在后端）
    statsText() {
      const info = this.info || {};
      const parts = [];
      if (Number(info.time_type) === 1 && Number(info.total_days) > 0) {
        parts.push("已进行 " + (Number(info.done_days) || 0) + "/" + info.total_days + " 天");
      }
      parts.push((Number(info.join_count) || 0) + " 人参与");
      parts.push((Number(info.record_count) || 0) + " 次打卡");
      return parts.join(" · ");
    },
    // 打卡时间/打卡模式的唯一落点就是本页的「打卡信息」卡（页头不再重复一份灰字日期行与模式标签，
    // 2026-09-25 用户口径）：这一卡只回答「什么时候打、按哪种打卡模式」
    infoRows() {
      const rows = [{ label: "打卡时间", value: this.dateText }];
      if (this.modeText) rows.push({ label: "打卡模式", value: this.modeText });
      return rows;
    },
    // 活动介绍（富文本）：与教务详情页（package/detail）同一份判空口径 —— 空标签/占位内容不渲染富文本，落「暂无」
    detailHtml() {
      const content = this.info && this.info.detail;
      if (typeof content !== "string") return "";
      const html = content.replace(/<!--[\s\S]*?-->/g, "");
      if (/<(?:img|video|audio|iframe|embed|object)\b/i.test(html)) return content;
      return html
        .replace(/<[^>]*>/g, "")
        .replace(/&(?:nbsp|#0*160|#x0*a0);/gi, "")
        .replace(/[\s\u200b\ufeff]/g, "").length > 0 ? content : "";
    },
    // 关联课程卡（参与方式=绑定课程）：整行字段取后端下发的 info.course（课程列表卡要读的那几列都在里面，
    // 前端不写死课程类型/价格文案），未挂课或课程行已取不到时为 null ⇒ 整块不出，不留一枚点不开的卡
    courseCard() {
      const course = this.info && this.info.course;
      return course && Number(course.id) > 0 && course.name ? course : null;
    },
  },
  onLoad(options) {
    that = this;
    this.initScoreExchange(options);
    if (!that.$tools.systemConfig("app_isinstall_checkin")) {
      uni.showToast({ title: "打卡功能未安装", icon: "none" });
      setTimeout(() => uni.navigateBack(), 800);
      that.loading = false; // 兜底分支也要撤骨架：这一页只弹一句 toast 就留在灰块上，看着像「一直加载中」
      return;
    }
    that.id = Number(options.id || 0);
    // 受邀参团：URL 上那一组 gb_* 只活在本页实例上；初值先置真，拼团区取到活动后由 `@ready.join` 校准
    that.gbJoinCtx = readGroupBuyJoin(options);
    that.gbJoinMode = !!that.gbJoinCtx;
    that.getData();
  },
  onShow() {
    // 模块级 that 停在最后 onLoad 的实例上；本页重新可见先收回绑定（同路由多实例时交互会改到销毁的实例上）
    that = this;
    // 拼团区那一条链（开团/参团 → 支付面板 → 团详情）退回来：只有「这一趟是被拼团区送出去的」
    // 才静默重取它自己那两条（硬约束 16：退回哪一页由那一页自己重取，取的是那一块、不是替它整页取）
    if (that.gbPending) {
      that.gbPending = false;
      if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
    }
    // 购买/参与链路回到本页（如反悔退出下单页）：静默刷新一次成员态与统计，不整页闪骨架
    if (that && that.id && !that.loading) that.getData();
  },
  onPullDownRefresh() {
    that.getData().then(
      () => uni.stopPullDownRefresh(),
      () => uni.stopPullDownRefresh()
    );
    // 下拉是本块唯一的强制重载出口：拼团区跟着重取它自己那两条（活动结束就把整段收掉）
    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
  },
  methods: {
    /**
     * 拼团区（`components/tz/group-buy-area.vue`）要把人带去开团/参团：
     * 导航由组件自己发（它才知道选了哪一档、凑的是哪一个团），本页只记这一枚「去过了」的账，
     * 回来由 onShow 兑。用 `this` 不用模块级 `that`：这一枚是模板上的事件处理器。
     */
    gbGoPay() {
      this.gbPending = true;
    },
    /** 拼团区 @ready：活动摘要收下来喂给底栏那枚拼团按钮（摘要字符串由组件算好，本页不加工） */
    gbReady(entry) {
      this.gbEntry = entry;
      this.gbInTeam = !!(entry && entry.inTeam);
      this.gbJoinMode = !!(entry && entry.join);
      this.gbBuyers = (entry && entry.activity && entry.activity.buyers) || [];
    },
    /** 底栏「¥xx 拼团」按钮：就地开拼团区那只凑团弹层（壳挂在拼团区组件里，不走页面导航） */
    openGb() {
      if (this.$refs.gbArea) { this.$refs.gbArea.openPopup(); }
    },
    // 分享卡片口径见 common/utils/checkin-share：H5 走 JSSDK，小程序端走下面的 onShare* 钩子
    applyShare() {
      applyH5Share(this.$nav, this.shareTitle, this.shareCover);
    },
    getData() {
      that.loading = !that.info;
      // 介绍页免登录取数：走 app/checkin/intro/detail（auth=false），访客点开分享链接先看内容，
      // 不再被请求层的「未登录，已阻止该请求」挡在空骨架上。带 token 时后端照样认身份，
      // 已参与的人进这一页读到的仍是自己的 is_member/has_course，吸底栏不会错出「免费参与」
      return that.$api("checkin.intro.detail", { checkin_id: that.id })
        .then((ret) => {
          if (!ret || ret.code !== 1) {
            // 活动未上架/不存在：拦截器只 toast 一秒就消失，页面必须留下后端给的原因，否则只剩白屏
            if (!that.info) that.loadMsg = (ret && ret.msg) || "打卡活动不存在或已下架";
            that.loading = false;
            return;
          }
          that.info = ret.data;
          that.loadMsg = "";
          that.loading = false;
          // 分享卡片放在数据回调最后一步：H5 分享调用一旦抛异常会中断后面的渲染逻辑
          this.applyShare();
        })
        .catch(() => {
          if (!that.info) that.loadMsg = "加载失败，请重试";
          that.loading = false;
        });
    },
    // 封面加载失败（坏链/文件被删）：兜底默认图（与封面为空时同一张），页头不留破图
    onCoverError() {
      if (this.info) this.$set(this.info, "cover", "/static/image/empty.png");
    },
    // 进打卡主页（M-P2）：replace=true 用于参与成功后替换掉介绍页，
    // 返回键回列表而不是回到一张已经参与过的介绍页
    goHome(replace) {
      const url = "/pages/app/checkin/detail/detail?id=" + that.id;
      if (replace) uni.redirectTo({ url });
      else uni.navigateTo({ url });
    },
    doJoin() {
      if (that.joining) return;
      that.joining = true;
      that.$api("checkin.checkin.join", { checkin_id: that.id })
        .then((ret) => {
          that.joining = false;
          if (!ret || ret.code !== 1) return;
          uni.showToast({ title: "参与成功", icon: "none" });
          setTimeout(() => that.goHome(true), 600);
        })
        .catch(() => {
          that.joining = false;
        });
    },
    doPasswordJoin() {
      if (!that.password) {
        uni.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      that.$api("checkin.checkin.passwordPay", { checkin_id: that.id, password: that.password }).then((ret) => {
        if (!ret || ret.code !== 1) return;
        that.pwdVisible = false;
        uni.showToast({ title: "兑换成功", icon: "none" });
        setTimeout(() => that.goHome(true), 600);
      });
    },
    // 付费参与：与打卡主页同一条下单链路（订单 goods_type=checkin），支付成功由 Payed 行为发放权益
    goBuy() {
      const goodsList = [that.withScoreGoods({
        goodsId: that.id,
        goodsType: 'checkin',
        count: 1,
        extend: '',
      })];
      that.$nav.to('/pages/order/submit/submit?type=checkin&goodsList=' + JSON.stringify(goodsList));
    },
    goCourse() {
      const courseId = that.info && Number(that.info.course_id);
      if (!courseId) {
        uni.showToast({ title: "关联课程不存在", icon: "none" });
        return;
      }
      uni.navigateTo({ url: "/pages/course/detail/detail?id=" + courseId });
    },
  },
  // 小程序转发/朋友圈卡片：标题取活动名、封面取活动封面（H5 的分享由上面 getData 里 applyShare 走 JSSDK 设置；
  // 朋友圈卡片只认 query，回传 path 会丢页面参数）
  onShareAppMessage() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover);
  },
  onShareTimeline() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover, true);
  },
};
</script>