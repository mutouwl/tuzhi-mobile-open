<script>
var that;
import banner from '@/components/course/banner.vue';
import liveStartTimeBar from "@/components/course/live-start-time-bar.vue";
import couponGoodsBar from "@/components/coupon/coupon-goods-bar.vue";
// 拼团「加入别人的团」上下文（团详情「立即加入」带 gb_team 一组参数进本页）
import { readGroupBuyJoin } from "@/common/utils/group-buy-join.js";
// 拼团下单上下文在中间页之间的搬运（键名只存那一份；2026-10-31 线下活动接上「选票 → 报名信息」两页）
import { withGroupBuyOrder } from "@/common/utils/group-buy-order.js";
import scoreExchange from '@/common/mixins/score-exchange.js';
export default {
  mixins: [scoreExchange],
  components: { banner, liveStartTimeBar,couponGoodsBar },
  data() {
    return {
      // 详情这一腿是否落地（骨架判据见 computed `loading`：还要并上积分商品那一腿）
      detailLoaded: false,
      data: {},
      pageParams: {},
      bindCoutseList: [],
      // 拼团区（2026-10-28）：从下单页退回来只重取那一块（硬约束 16 正半句），不整页重来
      // 购买弹幕素材（拼团区 @ready 上抛的 `activity.buyers`），只喂封面左上角那一枚
      gbBuyers: [],
      gbPending: false,
      gbEntry: null,
      // 「我在这一场拼团里已有进行中的团」：底栏那枚「立即报名」收不收吃它（PRD 2026-10-27）。
      // 判据只认拼团区 @ready 上抛的 inTeam（后端 GoodsArea::myTeam），页面不读 my_team 自己拼
      gbInTeam: false,
      // 受邀参团（2026-10-30）：URL 带 gb_team 时进 join 态，底栏只留「加入拼团」。
      // 票种与报名信息（2026-10-31 起）都在本页自己的「选票页 → 报名信息页」里收
      gbJoinCtx: null,
      gbJoinMode: false
    }
  },
  watch: {
  },
  computed: {
    /**
     * 骨架屏的撤出判据（2026-11-09）
     *
     * 两条腿：活动详情 ∧ 积分商品详情（兑换模式才有，非兑换模式 `scoreReady` 恒 true）。
     * 价格格在兑换模式下读 `scoreExchangeScore`，只按详情那一条收口会先闪一遍「0 积分」
     * （硬约束 22：一个加载态盖住多条腿时，收口必须是「整条链都收尾」）。
     */
    loading() {
      return !(this.detailLoaded && this.scoreReady);
    },
    /**
     * 宿主价格行显不显示（2026-10-30 第五轮，用户第二次点名「拼团价要复制覆盖原来的价格」）：
     * 拼团进行中（拼团区 `@ready` 上抛的 `gbEntry.activity` 非空）⇒ 本页价格行收起，
     * 价格只由拼团卡第一行的横幅给 —— 一屏只有一个价；没有活动 / 活动结束抛 null ⇒ 照常显示。
     * 判据只此一处（与底栏那枚拼团按钮、封面弹幕同一份 `gbEntry`）。
     */
    gbPriceShown() {
      return !(this.gbEntry && this.gbEntry.activity);
    }
  },
  methods: {
    /** 拼团区把人送去下单：本页只记这一枚账，回来由 onShow 兑（用 this，模块级 that 会被别的实例顶掉） */
    gbGoPay() { this.gbPending = true; },
    /** 拼团区 @ready：摘要收下来喂底栏那枚拼团按钮（摘要串由组件算好，本页不加工） */
    gbReady(entry) {
      this.gbEntry = entry;
      this.gbInTeam = !!(entry && entry.inTeam);
      this.gbJoinMode = !!(entry && entry.join);
      this.gbBuyers = (entry && entry.activity && entry.activity.buyers) || [];
    },
    /** 底栏「立即开团」：就地开拼团区那只凑团弹层（壳挂在组件里，不走页面导航） */
    openGb() { if (this.$refs.gbArea) { this.$refs.gbArea.openPopup(); } },
    /**
     * 拼团下单入口（2026-10-31 用户点名「活动拼团点击后，应该在 ticket 中添加报名信息啊，
     * 然后再跳转到 form 填写报名信息」）
     *
     * 线下活动的商品是票券：拼团单要带「票种 + 张数 + 报名信息 id」，这三样本来就在本页自己的
     * 两张中间页里收（选票页 `app/activity/ticket` → 报名信息页 `app/activity/form`），
     * 不能像其它商详页那样由拼团区直接带去结算页。拼团区因此挂 `host-ticket` + `host-order`：
     * 点开团 / 参团 / 去凑团都只把上下文经 `@order` 抛回来，本页带它进选票页；
     * 之后两跳由那两页原样搬运（键名只存 `common/utils/group-buy-order.js`）。
     *
     * **只带身份与档位**：票种/张数是选票页选的（这里带了就是两个来源），份数同理；
     * `gb_team` 是受邀参团那一档（团详情「立即加入」），普通开团为空串。
     * @param {Object} ctx 拼团区 `gbCtx()`：{ activity_id, team_id?, ladder_id?, spec_id?, count? }
     */
    gbOrder(ctx) {
      const c = ctx || {};
      const url = withGroupBuyOrder('/pages/app/activity/ticket/ticket?id=' + this.pageParams.id, {
        gb_activity: c.activity_id,
        gb_team: c.team_id || '',
        gb_ladder: c.ladder_id || '',
        gb_goods_type: 'activity',
        gb_goods_id: this.pageParams.id,
      });
      // 与「立即报名」同一道前置闸门（关联课程，`apply()` 里那一发）：拼团这条链也要先过，
      // 否则票券与报名信息都填完了，到结算页才被后端一句「请先订阅关联课程」拦下
      that.$api('app.activity.course.check', { activity_id: that.pageParams.id }).then(ret => {
        if (ret.code === 1) { that.$nav.to(url); }
        else { uni.$u.toast(ret.msg); }
      });
    },
    isVirtualPay(goods) {
      return Number(goods && goods.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },

    hasPrice(price) {
      return price !== undefined && price !== null && price !== '';
    },

    formatPrice(price, goods) {
      return this.isVirtualPay(goods) ? (price || 0) + (this.$tools.systemConfig('coin_name') || '金币') : '¥' + price;
    },

    getData() {
      clearInterval(that.studyTime);
      // 首屏（还没有详情）由骨架屏给反馈；从下一跳退回来 / 下拉刷新时已有内容，
      // 静默重取、不闪骨架（M16 的「回退不闪」与 M23 的「返回由本页重取」两条一起满足）
      // 这一趟开始时先按「详情没落地」记一次；已经有内容就不回骨架（骨架由 computed 收口）
      that.detailLoaded = !!that.data.id;

      that.tabs = [];
      that.$api('app.activity.detail', {
        id: this.pageParams.id
      }).then(res => {
        uni.stopPullDownRefresh();
        if (res.code === 1) {

          that.data = res.data;

          // #ifdef H5
          this.$nav.share(res.data.name, '', res.data.cover);
          // #endif

          that.getBindCourse();


          that.detailLoaded = true;
        } else {
          that.detailLoaded = true;
          uni.showModal({
            title: '提示',
            content: res.msg,
            complete: function (res) {
              that.$nav.back();
            }
          });
        }
      }).catch(() => {
        // 网络异常 / 请求被拦：同样要收口，否则页面永远停在骨架态（M22 的退出分支一次写全）；
        // 收口后页面是空的，得把原因说出来，用户才知道下拉刷新这一条出口
        that.detailLoaded = true;
        uni.$u.toast('加载失败，请重试');
      });

    },
    //刷新
    refresh() {
      // 下拉刷新是这一块的唯一强制重载出口：拼团区跟着重取它自己那两条
      if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
      this.getData();
    },

    apply() {
      that.$api('app.activity.course.check', {
        activity_id: that.pageParams.id
      }).then(ret => {
        if (ret.code === 1) {
          let url = '/pages/app/activity/ticket/ticket?id=' + that.pageParams.id;
          if (Number(that.pageParams.score_goods_id) > 0) {
            url += '&score_goods_id=' + Number(that.pageParams.score_goods_id);
          }
          that.$nav.to(url);
        }else{
          uni.$u.toast(ret.msg);
        }
      });
      
    },


    /**
      * 获取课程所属的专栏
    */
    getBindCourse() {
      var that = this;
      that.$api('app.activity.course.list', {
        activity_id: that.pageParams.id
      }).then(ret => {
        if (ret.code === 1) {
          this.bindCoutseList = ret.data;
        }
      });
    }
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  onShow() {
    that = this;
    // 从下单/支付退回来：只重取拼团区（不整页重来，已填的报名信息与滚动位置都不动）
    if (!that.gbPending) { that.refresh(); return; }
    that.gbPending = false;
    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    this.initScoreExchange(that.pageParams);
    // 受邀参团：URL 上那一组 gb_* 只活在本页实例上；初值先置真，拼团区取到活动后由 `@ready.join` 校准
    that.gbJoinCtx = readGroupBuyJoin(that.pageParams);
    that.gbJoinMode = !!that.gbJoinCtx;

    // this.getData();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>
