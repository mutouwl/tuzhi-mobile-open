<script>
import { listTitle, applyH5Share, mpCard } from "@/common/utils/checkin-share";
import shareModal from "@/components/modal/share-modal.vue";
var that;
export default {
  components: { shareModal },
  data() {
    return {
      id: 0,
      // 看谁的记录页：0 = 本人（从「我的打卡记录」进来不带 user_id）；>0 = 从别人的头像/昵称/榜单行点进来
      ownerId: 0,
      // 是否本人页：以接口下发为准（后端把 user_id=本人/缺省都归一成本人口径），前端不自己比
      isSelf: true,
      // 分组隔离下跨组看别人：接口给的「遮蔽」标记与那句原因（判据与文案都在后端一处，前端不自己比分组、
      // 也不另存一套说法）。遮蔽时个人信息卡照画，统计/日历/当日列表换成空态
      masked: false,
      maskedMsg: "",
      loading: true,
      notFound: false,
      loadMsg: "",
      title: "",
      cover: "",
      stats: {},
      days: {},
      joinedDays: 0,
      selectedDay: "",
      dayRecords: [],
      // 当日列表取数失败的原因（空串=没失败）：文案吃后端 ret.msg，与动态栏 feedError 同一档写法
      dayError: "",
      // 当日列表是分页的（一次只列日历上选中的那一天，超过 dayLimit 条上拉续取）：
      // has_more 全取后端回的值，前端不自己数（口径见 ui-baseline-mobile.md M3）
      dayPage: 1,
      dayLimit: 10,
      dayHasMore: false,
      // dayLoading 只管「切日期」这一种加载态（列表区局部骨架屏）；翻页用 dayLoadStatus 出 u-loadmore
      dayLoading: false,
      dayLoadStatus: "loadmore",
      // 连点两个日期时用来丢弃先发出的那次响应，否则旧日期的列表会盖到新日期上
      daySeq: 0,
      nickname: "",
      avatar: "",
      // 打卡昵称长度上限吃接口值（nickname_max），不前端写死
      nicknameMax: 0,
      // 当前要评论的日记 id（点卡片评论图标时写入，供共用的评论弹窗定位目标与接口参数）
      commentRecordId: 0,
      commentVisible: false,
      shareVisible: false,
    };
  },
  computed: {
    // 微信分享卡片（列表页口径）：「活动名 · 打卡记录」+ 活动封面，活动名未回来时只用页面名
    shareTitle() {
      return listTitle(this.title, "打卡记录");
    },
    shareCover() {
      return this.cover || "";
    },
    // 评论弹窗/回复弹窗的目标参数：打卡评论接口按 checkin_id + record_id 定位
    commentTarget() {
      return { checkin_id: this.id, record_id: this.commentRecordId };
    },
    // 弹窗底栏的点赞态取当天列表里那条原对象（onLike 乐观更新改的就是它，弹窗跟着变）
    commentRecord() {
      return (this.dayRecords || []).find((x) => Number(x.id) === Number(this.commentRecordId)) || null;
    },
    // 打卡的点赞字段叫 is_liked，共用底栏按圈子口径读 liked / like_count，这里映射过去（与日记页 barPost 同一口径）
    commentEntity() {
      const r = this.commentRecord;
      if (!r) return null;
      return { id: r.id, liked: r.is_liked, like_count: Number(r.like_count) || 0, allow_user_comment: r.allow_user_comment };
    },
    dayMarks() {
      return this.days || {};
    },
    statList() {
      const s = this.stats || {};
      return [
        { label: "日记", value: s.diary || 0 },
        { label: "精选", value: s.featured || 0 },
        { label: "获赞", value: s.liked || 0 },
        { label: "累计(天)", value: s.total || 0 },
        { label: "连续(天)", value: s.streak || 0 },
      ];
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
    // 从别人的头像/昵称/排行榜行点进来时带 user_id ⇒ 这一页看的是他的记录（判据全在后端，
    // 见 CheckinBase::viewTarget：未参与 / 分组隔离 / 仅管理员可见）
    that.ownerId = Number(options.user_id || 0);
    // 首屏先用登录缓存占位（缓存键是 user_info 且为 JSON 字符串，旧写法读 "userInfo" 取到的永远是空值，
    // 于是头像只能落默认图）；接口回来后由 getData 覆盖成后端下发的打卡昵称与账号头像。
    // 看别人时不占位：把自己的头像昵称铺上去，接口回来前那一秒会被读成「这就是 TA」
    const user = that.$tools.cachedUser() || {};
    if (!that.ownerId || that.ownerId === Number(user.id || 0)) {
      that.nickname = user.nickname || "";
      that.avatar = user.avatar || "";
    }
    that.getData();
  },
  // 回到本页就重取（与活动主页 detail、任务详情页 taskdetail 的 onShow 同一口径）：
  // 卡片「更多→编辑」进提交页改完退回来时，本页实例还活着，不重取就一直挂着改前的正文与统计。
  // 重取的是日历 + 当前所选日期那天的日记（保留所选日期，不跳回今天），动作与下拉刷新同一份；
  // 首进不重复取：H5 在 created 里连着触发 onLoad→onShow，那一刻 getData 还在路上（loading 仍为 true）
  onShow() {
    // 同一路由两个实例同时在栈时（记录页↔活动主页环跳），模块级 that 停在最后 onLoad 的那一个上；
    // 本页重新可见先收回绑定——否则本页的刷新与点赞/回复/日历切换全改到已销毁的实例上（症状：退回后按钮全「不可用」）
    that = this;
    if (!(that && that.id) || that.loading) return;
    that.getData().then(() => {
      if (that.selectedDay) that.reloadDay();
    });
  },
  // 下拉刷新（pages.json 已开 enablePullDownRefresh）：日历/统计重取后，把当前选中日期的日记一并重拉
  // （保留所选日期，不跳回今天）；getData 自带 catch，失败也会收起刷新动画
  onPullDownRefresh() {
    that.getData().then(
      () => {
        if (that.selectedDay) that.reloadDay();
        uni.stopPullDownRefresh();
      },
      () => uni.stopPullDownRefresh()
    );
  },
  // 上拉加载下一页（只在这一天还没取完时发请求；整页骨架/当日骨架期间也不发，避免和切日期抢）
  onReachBottom() {
    if (!that.dayHasMore || that.dayLoading || that.dayLoadStatus === "loading") return;
    that.dayPage += 1;
    that.loadDay();
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
    // 保存成功：接口回来的昵称先落上，再整页重取（动态卡、日签图、排行榜取的都是这一份打卡昵称）
    onNicknameSaved(nickname) {
      that.nickname = nickname;
      that.getData();
    },
    getData() {
      // user_id 为本人口径时后端按 0/本人归一（is_self=1，昵称行右侧的编辑入口才出）
      return that.$api("checkin.checkin.calendar", { checkin_id: that.id, user_id: that.ownerId || 0 })
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
          // 遮蔽档吃接口值（跨组与否由后端 canBrowseMember 一处判）：masked=1 时后端只给了这个人是谁
          // 与已加入几天，stats/days 根本没下发，所以这里既不铺零值、也不去取当日列表（selectedDay 留空）
          that.masked = Number(ret.data.masked) === 1;
          that.maskedMsg = ret.data.masked_msg || "";
          that.stats = ret.data.stats || {};
          that.days = ret.data.days || {};
          that.joinedDays = ret.data.joined_days || 0;
          that.title = ret.data.title || "";
          that.cover = ret.data.cover || "";
          // 「这一页是谁的、是不是本人」吃接口值：后端把缺省/user_id=本人 归一成本人口径，
          // 前端不自己拿缓存 id 比（两处各判一次就会分叉，且未登录时缓存里根本没 id）
          that.isSelf = Number(ret.data.is_self) !== 0;
          that.ownerId = Number(ret.data.owner_id) || that.ownerId;
          // 用户卡的昵称/头像以接口下发为准（打卡昵称优先、为空才回落账号昵称，口径在 MemberService::ownCard）
          if (ret.data.nickname) that.nickname = ret.data.nickname;
          if (ret.data.avatar) that.avatar = ret.data.avatar;
          if (Number(ret.data.nickname_max)) that.nicknameMax = Number(ret.data.nickname_max);
          const today = that.dayStr(Math.floor(Date.now() / 1000));
          if (that.masked) {
            // 手上还留着上一次取到的那一天要一起收掉：遮蔽后 `.cr-day-title` 会按 selectedDay 画出一行
            // 「x 的打卡」标题，底下却是空的（留一行没人认领的标题算偏离，M13/M16）
            that.selectedDay = "";
            that.dayRecords = [];
            that.dayHasMore = false;
            that.dayLoading = false;
            that.dayLoadStatus = "loadmore";
          }
          // 遮蔽档不去取当日列表（selectedDay 留空 ⇒ 模板那一段自己什么都不画）：
          // 发一次「后端注定不给内容」的请求没有消费方，还会把空态文案抢成「加载失败」（M13）
          if (!that.selectedDay && !that.masked) that.onDayClick(today);
          that.loading = false;
          // 活动名/封面到手后才能拼出分享标题，放在数据回调最后一步（H5 分享抛异常会中断前面的渲染）
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
    dayStr(ts) {
      const d = new Date(ts * 1000);
      const pad = (n) => (n < 10 ? "0" + n : "" + n);
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    },
    // 日历上点了另一天：本页每次只列这一天的动态，所以整块当日列表重取——
    // 先清空（不清会把上一天的日记挂在新日期标题下），再铺列表区的局部骨架屏（用户 2026-09-26 点名
    // 「切日期要触发刷新、刷新时显示局部刷新状态」，骨架与真实卡逐块对齐见 css.css 的 .cr-sk-rec-*）
    onDayClick(day) {
      that.selectedDay = day;
      that.dayRecords = [];
      that.dayHasMore = false;
      that.dayPage = 1;
      that.dayError = "";
      that.dayLoading = true;
      that.loadDay();
    },
    // 静默重取当前所选那天的第一页（onShow / 下拉刷新 / 卡片「更多→编辑/删除」退回来）：
    // 不清列表、不铺骨架——M23 的口径是「回来看的还是那一页，闪骨架算偏离」，
    // 骨架屏只服务「换了一天」这件事
    reloadDay() {
      that.dayPage = 1;
      that.loadDay();
    },
    // 当日列表取数：day + page/limit 一起下发，翻到第几页由 dayPage 决定；总数与有没有下一页只认后端回的值
    loadDay() {
      const seq = ++that.daySeq;
      const firstPage = that.dayPage <= 1;
      that.dayLoadStatus = "loading";
      return that.$api("checkin.checkin.dayDetail", {
        checkin_id: that.id, day: that.selectedDay, user_id: that.ownerId || 0, page: that.dayPage, limit: that.dayLimit,
      })
        .then((ret) => {
          // 连点两个日期时先发出的那一次可能后回来，seq 对不上就说明用户已经换天了，结果丢掉
          if (seq !== that.daySeq) { that.dayLoading = false; return; } // 过期响应只丢数据，不撤骨架
          that.dayLoading = false;
          if (!ret || ret.code !== 1) {
            that.dayFail(ret && ret.msg);
            return;
          }
          const d = ret.data || {};
          const rows = d.records || [];
          that.dayRecords = firstPage ? rows : that.dayRecords.concat(rows);
          that.dayHasMore = d.has_more === true;
          that.dayError = "";
          that.dayLoadStatus = that.dayHasMore ? "loadmore" : "nomore";
        })
        .catch(() => {
          if (seq !== that.daySeq) { that.dayLoading = false; return; } // 过期响应只丢数据，不撤骨架
          that.dayLoading = false;
          that.dayFail("加载失败，请重试");
        });
    },
    // 取数失败的出口（M13：判到失败还不够，必须让人看见原因）：
    // 翻下一页失败 → 页码退回去（再上拉就是重试）并 toast；静默重取失败 → 只 toast，旧内容还在手上；
    // 第一页且本来就取空了 → 落到空态文案，不把后端故障说成「当天还没有打卡记录」
    dayFail(msg) {
      const text = msg || "加载失败，请重试";
      that.dayLoadStatus = "loadmore";
      if (that.dayPage > 1) {
        that.dayPage -= 1;
        uni.showToast({ title: text, icon: "none" });
      } else if (that.dayRecords.length) {
        uni.showToast({ title: text, icon: "none" });
      } else {
        that.dayError = text;
      }
    },
    // 顶部活动卡（打卡名称 + 已加入 N 天）→ 这个打卡的详情页（活动主页）。
    // 记录页本来就是从主页「更多→打卡记录」进来的，栈里已经压着同一场活动的主页时退回那一层，
    // 不重复开第二张（开了会让人按两次返回才回到本页）；深链/分享直接进记录页时栈里没有才新开。
    // 探栈写法与判据照 common/utils/checkin-owner 的入口链（同 M20③：路由 + 实体 id 双重比对），
    // 这一步发生在跳转之前、本页还在栈顶，两端都够得对页（M23 禁的是 onUnload 里跨页取数）
    goDetail() {
      const DETAIL = "/pages/app/checkin/detail/detail";
      const pages = getCurrentPages() || [];
      for (let i = pages.length - 2; i >= 0; i--) {
        const page = pages[i];
        const vm = page && page.$vm;
        if (!vm) continue;
        const route = "/" + String((page && (page.route || (page.$page && page.$page.route))) || "").replace(/^\//, "");
        if (route === DETAIL && Number(vm.id) === Number(that.id)) {
          uni.navigateBack({ delta: pages.length - 1 - i });
          return;
        }
      }
      uni.navigateTo({ url: DETAIL + "?id=" + that.id });
    },
    goDiary(record) {
      uni.navigateTo({ url: "/pages/app/checkin/diary/diary?id=" + record.id + "&checkin_id=" + that.id });
    },
    // 卡片评论图标：先弹共用的评论弹窗（评论列表 + 底栏「写下你的评论吧」→ 再弹回复框），
    // 与圈子动态卡片同一处实现、同一层级，不在本页直接弹输入框
    openComment(record) {
      if (!record || !record.id) return;
      that.commentRecordId = record.id;
      that.commentVisible = true;
    },
    // 弹窗底栏点赞：组件只上抛（打卡点赞接口与参数在本页），转给当天列表里那条记录走同一套乐观更新与回滚
    onPopupLike() {
      const r = that.commentRecord;
      if (r) that.onLike(r);
    },
    // 弹窗发送成功：只把当天列表里这条的评论数 +1，不重拉当天记录
    onCommentPosted() {
      const r = that.commentRecord;
      if (r) r.comment_count = (Number(r.comment_count) || 0) + 1;
    },
    // 小程序端子组件 $emit 上抛的是它那份 props 拷贝，直接改上抛对象回不到本页的 dayRecords
    // （H5 两端共用同一对象所以看着正常），症状就是「点了心形和数字一动不动」
    // ⇒ 先按 id 回到本页列表里那一行再改（与 circle/index、checkin/search 的 onLike 同一口径）
    onLike(emitRecord) {
      const record = (that.dayRecords || []).find((x) => Number(x.id) === Number(emitRecord && emitRecord.id));
      if (!record) return;
      const old = record.is_liked;
      const oldCount = record.like_count;
      record.is_liked = old ? 0 : 1;
      record.like_count = oldCount + (old ? -1 : 1);
      that.$api("checkin.checkin.like", { checkin_id: that.id, record_id: record.id }).then((ret) => {
        if (!ret || ret.code !== 1) {
          record.is_liked = old;
          record.like_count = oldCount;
          // 回滚只是让心形变回去，还得说一句为什么（M13：失败分支必须有可读出口）
          uni.showToast({ title: (ret && ret.msg) || "点赞失败，请重试", icon: "none" });
        }
      });
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
