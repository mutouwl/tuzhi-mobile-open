<script>
var that;
import exercisesControlModal from "../components/exercises-control-modal.vue";
import couponGoodsBar from "@/components/coupon/coupon-goods-bar.vue";
import bindCourseList from "@/components/course/bind-course-list.vue";
// 拼团「加入别人的团」上下文（团详情「立即加入」带 gb_team 一组参数进本页）
import { readGroupBuyJoin } from "@/common/utils/group-buy-join.js";
import scoreExchange from '@/common/mixins/score-exchange.js';
export default {
  mixins: [scoreExchange],
  components: {
    exercisesControlModal,
    couponGoodsBar,
    bindCourseList
  },
  data() {
    return {
      data: {
        course: false
      },
      /**
       * 首屏骨架屏开关（M16，2026-10-30 用户点名「加载的效果给我骨架屏」）。
       * 只服务「这一屏还是空的」那一趟：下拉刷新 / 订阅成功回来重取时内容已经在，不闪骨架（M23）；
       * 初值给 true —— 首屏第一帧就是骨架，不许先白一帧再铺（那一下用户读出来就是「闪了一下」）。
       */
      skeletonLoading: true,
      modal: {
        exercisesControl: false
      },
      pageParams: {},
      // 拼团区「这一趟是被送去开团/参团的」那本账：回本页时只静默重取拼团区那两条，
      // 不在 onShow 里顺手重取练习本体（这一页 data 只随 onLoad / onPullDownRefresh / subscribe 取）
      // 购买弹幕素材（拼团区 @ready 上抛的 `activity.buyers`），只喂封面左上角那一枚
      gbBuyers: [],
      gbPending: false,
      // 拼团区经 @ready 上抛的活动摘要（{ text } / null）：底栏那枚拼团按钮的显隐与文案吃它
      gbEntry: null,
      // 「我在这一场拼团里已有进行中的团」：底栏那枚「立即订阅」收不收吃它（PRD 2026-10-27）。
      // 判据只认拼团区 @ready 上抛的 inTeam（后端 GoodsArea::myTeam），页面不读 my_team 自己拼
      gbInTeam: false,
      // 受邀参团（2026-10-30）：URL 带 gb_team 时进 join 态，底栏只留「加入拼团」
      gbJoinCtx: null,
      gbJoinMode: false
    }
  },
  watch: {
  },
  computed: {
    /**
     * 拼团区（连它自己那份横幅与档位）/ 购买弹幕两处出不出的唯一判据：**这一件练习还没有使用权限**。
     * 2026-10-30 用户点名 `/pages/app/exam/detail/detail?id=5`「当前已经有了练习的使用权限，
     * 为什么还会显示拼团价格」——`is_auth` 就是「现在能做题」（已购 `sales_type=2` /
     * 绑定课程可学 `sales_type=3` / 免费 `sales_type=1` 都在内），已经拥有的人再读一遍拼团价，
     * 读出来就是「还要再买一次」。课程商详同口径（`!data.subscription`，见 `pages/course/detail`）。
     * 首屏 `data` 还是空壳 ⇒ 不挂组件、一条活动请求都不发；`subscribe()` 回来 `is_auth` 翻真，
     * 组件卸载，横幅与弹幕吃同一枚 `gbVisible` 跟着一起收。
     */
    gbVisible() {
      return !!this.data.id && !this.data.is_auth;
    },
    /**
     * 优惠券条出不出的唯一判据：**还没加入过这一件练习**。
     * 2026-10-30 用户点名 `/pages/app/exam/detail/detail?id=14`「如果已经加入了练习，就不要再显示这个优惠券领取bar了」
     * ——`is_subscribe` 就是底栏那枚「加入练习」按过之后的状态（付费练习付款时 `Payed` 也会落一行
     * `type=pay` 的订阅），加入过的人再读一遍「领券」只会在这一页多一条与本次无关的促销。
     * 首屏 `data` 还是空壳 ⇒ 组件不挂载、一条优惠券请求都不发；`subscribe()` 回来 `getData()` 让
     * `is_subscribe` 翻真，这一条当场卸载。虚拟支付那一档照旧不出（金币价没有券）。
     */
    couponVisible() {
      return !this.isVirtualPay(this.data) && !this.data.is_subscribe;
    },
    /**
     * 价格格的标题：这一件练习正挂着一场进行中的拼团时写「原价」（2026-10-30 用户点名
     * `/pages/app/exam/detail/detail?id=5`「如果是拼团商品，那么售价可以改为原价」）。
     * 判据吃拼团区 `@ready` 上抛的 `activity`（活动结束 / 没有活动时它上抛 null），与本页底栏那枚
     * 拼团按钮、封面弹幕同一份来源（硬约束 11）——同屏拼团区已经写着拼团价，这一格再写「售价」
     * 会被读成「两个卖价」。**只换标题、不动显隐**：这一行仍常驻（㉔），拼团那一趟也照样能读到数字。
     */
    priceLabel() {
      if (this.isScoreExchange) {
        return '兑换积分';
      }
      return this.gbEntry && this.gbEntry.activity ? '原价' : '售价';
    }
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
    isVirtualPay(goods) {
      return Number(goods && goods.is_virtual_pay) === 1 && uni.getStorageSync("platform") === "wxMiniProgram";
    },


    /**
   * 订阅练习
   */
    subscription() {
      //判断购买方式、单独购买、购买专栏
      var goodsList = [that.withScoreGoods({
        goodsId: that.data.id,
        goodsType: 'exercises',
        count: 1
      })];
      that.$nav.to('/pages/order/submit/submit?type=exercises&goodsList=' + JSON.stringify(goodsList));
    },

    /**
     * 获取练习详情
     * **首屏走骨架屏，不再用「请稍后」那枚黑底转圈 toast**（M16）：
     * 转圈不预布局，撤下时整屏内容跳位；骨架屏的块与真实版式逐块同几何，数据落地只换内容不换版。
     *
     * 三条退出分支一次写全（硬约束 22：加了「进入加载态」就要把每一支出口都走一遍）：
     *   ① 成功 → 落 `data`，骨架收掉；
     *   ② 业务失败（`code !== 1`，请求层已弹一句 toast）→ 不落 data，骨架一样收掉；
     *   ③ 网络异常 / 未登录被请求层拦下（Promise reject）→ 同上。
     * ②③ 收掉骨架之后 `data.id` 还是空 ⇒ 模板那一枚 `u-empty`（练习不存在或已下架）接手，
     * 绝不允许停在骨架态（那是「页面一直加载中、接口其实早就回来了」的典型症状）。
     * `uni.stopPullDownRefresh()` 挪到收口处：下拉那一趟要等这一发有回音才收条。
     */
    getData() {
      const vm = this;
      // 只有还没有详情时才铺骨架：下拉刷新 / 订阅成功回来重取时，这一屏已经有内容，不闪骨架
      if (!vm.data.id) {
        vm.skeletonLoading = true;
      }
      const finish = function () {
        vm.skeletonLoading = false;
        uni.stopPullDownRefresh();
      };
      vm.$api('app.exam.exercises.detail', {
        id: vm.pageParams.id,
      }).then(res => {
        if (res.code === 1) {
          // 回包缺 data 时兜成空壳：模板里那一串 `data.xxx` 读 null 会在渲染期抛错、
          // 整轮 patch 被跳过（症状是「接口 200 但页面不动」）
          vm.data = res.data || { course: false };

          // #ifdef H5
          vm.$nav.share(vm.data.name, '', vm.data.cover);
          // #endif
        }
        finish();
      }).catch(function () {
        // 网络异常 / 未登录被拦（请求层 reject）：按「取不到练习」收口，空态由模板给
        finish();
      });
    },


    /**
     * 加入练习
     * 用于未订阅的免费课程 或 绑定课程
     */
    subscribe() {
      // 这是**动作进度** toast（M16：标题带动作名的那一档合法），与首屏加载态不是一回事 ——
      // 首屏已改骨架屏，这一句只说明「这一刻在加入」，不再写「请稍后」那种没有动作名的等待语
      uni.showLoading({
        title: '正在加入'
      });
      that.$api('app.exam.exercises.subscribe', {
        id: that.pageParams.id,
      }).then(res => {
        uni.hideLoading();
        if (res.code === 1) {
          that.getData();
          that.modal.exercisesControl = true;
        }
        that.$u.toast(res.msg);
      }).catch(function () {
        // 未登录被请求层拦下 / 网络异常：这一发一样要把转圈收掉，否则 toast 永久挂在屏上
        uni.hideLoading();
      });
    }

  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    this.initScoreExchange(that.pageParams);
    // 受邀参团：URL 上那一组 gb_* 只活在本页实例上；初值先置真，拼团区取到活动后由 `@ready.join` 校准
    that.gbJoinCtx = readGroupBuyJoin(that.pageParams);
    that.gbJoinMode = !!that.gbJoinCtx;
    that.getData();
  },


  /**
   * 从拼团区去开团/参团（→ 支付面板 → 团详情）退回来：只有「这一趟是被拼团区送出去的」才静默重取
   * 拼团区那两条（硬约束 16 的正半句「退回哪一页，就由那一页自己在 onShow 重取」，取的是那一块、不是整页）。
   * 付完款要看见自己那一行、活动结束或名额满了要把那一段收掉，都只靠拼团区自己那两条；
   * 练习本体（订阅态/题量）一律不动 —— 那一坨在这一页只随 onLoad / 下拉 / subscribe 取。
   */
  onShow() {
    // M23 硬要求：用了模块级 that 的页面，onShow 的第一条语句必须把它收回当前实例
    that = this;
    if (!that.gbPending) { return; }
    that.gbPending = false;
    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
  },

  //下拉刷新
  onPullDownRefresh() {
    that.getData();
    // 下拉是本块唯一的强制重载出口：拼团区跟着重取它自己那两条（活动结束就把整段收掉）
    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
  },
  onShareAppMessage() {
    return this.$nav.share(that.data.name || '', '', that.data.cover || '');
  },
  onShareTimeline() {
    return this.$nav.share(that.data.name || '', '', that.data.cover || '');
  }
}
</script>
