<script>
var that;
import banner from '@/components/course/banner.vue';
import liveStartTimeBar from "@/components/course/live-start-time-bar.vue";
// 拼团下单上下文（2026-10-31）：拼团那一趟从活动详情带进来，本页只原样带给报名信息页
import { readGroupBuyOrder, withGroupBuyOrder } from '@/common/utils/group-buy-order.js';
// 拼团业务主题色（2026-10-31）：拼团那一趟按钮换红橙渐变、价格换业务红（与拼团区/详情页同一档）
import { GB_GRADIENT, GB_TEXT } from '@/common/utils/group-buy-theme.js';
// 票种 → 拼团价 的映射（与报名信息页同读一份；各写一遍就是下一次改口径只改一半）
import { gbTicketPrice } from '@/common/utils/group-buy-ticket-price.js';
import scoreExchange from '@/common/mixins/score-exchange.js';
export default {
  mixins: [scoreExchange],
  components: { banner, liveStartTimeBar },
  data() {
    return {
      // 三路取数各自落地（2026-10-31 骨架屏）：只按「最后回来的那一路」收口，
      // 拼团价就会先闪成票券原价（硬约束 22「一个加载态盖住多条腿」）
      detailLoaded: false,
      ticketLoaded: false,
      gbLoaded: false,
      detail: {},
      ticketList: [],
      // 未裁剪的票券原清单：兑换模式的裁剪每次都从它重算（不拿裁过的再裁）
      rawTicketList: [],
      // 空态文案（积分商品不可兑时给后端那一句原因，不再是「暂无可购票券」）
      loadMsg: '',
      ticketSelected: {},
      price: 0,
      ticketCount:0,
      pageParams:{},
      // 拼团下单上下文（没有 `gb_activity` 就是空对象 = 普通报名链，逐字不变）
      gbOrder: {},
      // 拼团活动本体（拼团那一趟才有）：票种拼团价 / 划线原价都从它取，前端不自己算
      gbActivity: null
    }
  },
  watch: {
  },
  computed: {
    /** 骨架屏的撤出判据：详情 / 票券 / 拼团活动（非拼团链恒为已落地）全部到手 */
    loading() {
      // 积分商品这一腿（2026-11-09）：兑换模式的价格区读 `scoreExchangeScore`，
      // 没落地前那一格是 0 —— 只按另外三路收口就会先闪一遍「0 积分」
      return !(this.detailLoaded && this.ticketLoaded && this.gbLoaded && this.scoreReady);
    },
    /** 拼团那一趟（URL 带 `gb_activity`）：价格按活动的拼团价画 */
    gbPicking() {
      return !!(this.gbOrder && this.gbOrder.gb_activity);
    },
    /** 主按钮底色：拼团那一趟换业务红橙渐变（模板读不到 import，经 computed 下发；空串 = 平台蓝） */
    gbBtnColor() {
      return this.gbPicking ? GB_GRADIENT : '';
    },
    /** 价格文字色：拼团那一趟换业务红（白底 5.04:1），普通链仍是平台价红 */
    gbPriceStyle() {
      return this.gbPicking ? { color: GB_TEXT } : {};
    }
  },
  methods: {

    isVirtualPay(goods) {
      return Number(goods && goods.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },

    formatPrice(price, goods) {
      return this.isVirtualPay(goods) ? (price || 0) + (this.$tools.systemConfig('coin_name') || '金币') : '¥' + price;
    },

    getDetail() {
      that.$api('app.activity.detail', {
        id: that.pageParams.id
      }).then(res => {
        uni.stopPullDownRefresh();
        if (res.code === 1) {

          that.detail = res.data;

        } else {
          uni.showModal({
            title: '提示',
            content: res.msg,
            complete: function (res) {
              that.$nav.back();
            }
          });
        }
        that.detailLoaded = true;
      }).catch(() => { that.detailLoaded = true; });
    },
    getTicket() {
      that.$api('app.activity.ticket.getTicket', {
        id: this.pageParams.id
      }).then(res => {
        uni.stopPullDownRefresh();
        if (res.code === 1) {
          var list = res.data || [];
          // 积分兑换（2026-11-08）：只摆商家勾过的那几种票券（判据在后端 `spec_ids`，
          // 票券 id 就是活动这一族的 spec_id）。未裁剪的原清单另存一份，重裁时从它算。
          that.rawTicketList = list.slice();
          that.ticketList = that.filterScoreTickets(list);
        } else {
          uni.showModal({
            title: '提示',
            content: res.msg,
            complete: function (res) {
              that.$nav.back();
            }
          });
        }
        that.ticketLoaded = true;
      }).catch(() => { that.ticketLoaded = true; });
    },
    /** 积分商品详情到手（mixins 回调）：票券清单重裁一次（详情可能晚于票券到） */
    onScoreExchangeReady() {
      if (!that.isScoreExchange) { return; }
      if (that.scoreExchangeError) {
        that.loadMsg = that.scoreExchangeError;
        that.ticketList = [];
        return;
      }
      that.loadMsg = '';
      if (that.rawTicketList && that.rawTicketList.length) {
        that.ticketList = that.filterScoreTickets(that.rawTicketList);
      }
      // 商家勾过的票种一档都不剩：说清原因，别留一屏「暂无可购票券」让人以为活动没票
      if (!that.ticketList.length && that.scoreHasSpec) {
        that.loadMsg = '该积分商品暂无可兑换的票券';
      }
    },
    /** 按 `score_spec_ids` 过滤票券；不吃规格/非兑换模式原样返回 */
    filterScoreTickets(list) {
      var rows = Array.isArray(list) ? list : [];
      if (!that.isScoreExchange || !that.scoreHasSpec) { return rows; }
      return that.scoreSpecOptions(rows).map(function (row) { return row.item; });
    },

    /**
     * 拼团那一趟的票价（2026-10-31 用户点名「价格并未适配拼团」）
     *
     * 线下活动的拼团价挂在**活动**上：`group_buy.activity.detail` 的 `specs[].price`
     * （票种逐档的拼团价）与 `ladder[].price`（阶梯逐档）—— 本页不自己算，只展示。
     * 阶梯型按 URL 上的 `gb_ladder` 取那一档（拼团区弹层选的），缺省第一档，与拼团区
     * `initPick()` 同口径；实付仍由结算页 `team.open/join` 现算。
     * 普通报名链（`gbOrder` 空）不发这一条，页面与改造前逐字不变。
     */
    getGroupBuy() {
      if (!that.gbPicking) { that.gbLoaded = true; return; }
      const goodsType = that.gbOrder.gb_goods_type || 'activity';
      const goodsId = Number(that.gbOrder.gb_goods_id) || Number(that.pageParams.id) || 0;
      const done = () => { that.gbLoaded = true; };
      that.$api('group_buy.activity.detail', { goods_type: goodsType, goods_id: goodsId })
        .then(res => {
          // 对不上 URL 上那一场（活动已结束、商家又开了新的一场）⇒ 不拿别场的价画这一单，
          // 回落票券原价（结算页那边同样会以「拼团活动已结束」拦下）
          if (res && res.code === 1 && res.data
              && Number(res.data.activity_id) === Number(that.gbOrder.gb_activity)) {
            that.gbActivity = res.data;
          }
          done();
        })
        .catch(done);
    },
    /** 这一张票的拼团价与划线原价（映射只在 `common/utils/group-buy-ticket-price.js` 一份） */
    gbTicketPriceOf(item) {
      return gbTicketPrice(this.gbActivity, item, this.gbOrder.gb_ladder);
    },
    /** 卡片上的单价：拼团那一趟用拼团价，其余照旧 */
    ticketUnitPrice(item) {
      const row = this.gbTicketPriceOf(item);
      return row ? row.price : (Number(item && item.price) || 0);
    },
    /** 卡片单价文案：两位小数（接口回的票券价本来就是 "100.00" 这种串，拼团价是数字，
     *  统一成两位才不会出现「¥40」与「¥100.00」并排） */
    ticketUnitText(item) {
      return Number(this.ticketUnitPrice(item)).toFixed(2);
    },
    /** 划线原价（两位小数串）：取活动快照那一份，不比拼团价高就不摆 */
    ticketOrigin(item) {
      const row = this.gbTicketPriceOf(item);
      return row && row.origin ? row.origin.toFixed(2) : '';
    },

    //刷新
    refresh() {
    },
    form() {
      // 拼团单（2026-10-31）：后端 `team.open/join` 只认一枚票种（`ActivitySpec::box()` 把票种
      // 当规格、份数另带）⇒ 多选票种会被静默压成一档。这里明说，不留一个「选了 3 种只卖出 1 种」的单。
      if (that.gbOrder && that.gbOrder.gb_activity && Object.keys(that.ticketSelected).length > 1) {
        uni.$u.toast('拼团一次只能选择一种票券');
        return;
      }
      // 拼团上下文随 `ticket` 一起落到报名信息页（键名只存 `group-buy-order.js`；
      // 普通报名链 `gbOrder` 是空对象 ⇒ `withGroupBuyOrder` 原样返回，地址逐字不变）
      let url = withGroupBuyOrder(
        '/pages/app/activity/form/form?id=' + that.pageParams.id + '&ticket=' + JSON.stringify(this.ticketSelected),
        that.gbOrder
      );
      if (Number(that.pageParams.score_goods_id) > 0) {
        url += '&score_goods_id=' + Number(that.pageParams.score_goods_id);
      }
      that.$nav.to(url);
    },
    numberChange(option) {
      var count = 0;
      this.ticketSelected[option.name] = option.value;
      var price = 0;
      for (var i in this.ticketSelected) {
        if (!this.ticketSelected[i]) {
          delete this.ticketSelected[i];
          continue;
        }
        for (var j in this.ticketList) {
          if (this.ticketList[j].id == i) {
            // 合计与卡片同源：拼团那一趟按拼团价累加（2026-10-31）
            price += this.ticketUnitPrice(this.ticketList[j]) * this.ticketSelected[i]
          }
        }

        count += this.ticketSelected[i]
      }
      this.ticketCount = count;
      this.price = Math.round(price * 100) / 100;
    }
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  onShow() {
    that.refresh();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    this.initScoreExchange(that.pageParams);
    // 拼团那一趟（活动详情 `gbOrder()` 带上来的扁平 `gb_*`）：本页只搬运，不重判。
    // **身份核的是 `gb_goods_id` 与 `pageParams.id`**（活动 9），不是 `gb_activity`（拼团活动 12388）：
    // 对不上（历史链接 / 手工改址）⇒ 当普通报名链，别把别一场活动带进这一单
    const gbIn = readGroupBuyOrder(that.pageParams);
    const gbGoods = Number(gbIn.gb_goods_id) || 0;
    that.gbOrder = gbIn.gb_activity && (!gbGoods || gbGoods === Number(that.pageParams.id)) ? gbIn : {};
    that.getDetail();
    that.getTicket();
    that.getGroupBuy();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>
