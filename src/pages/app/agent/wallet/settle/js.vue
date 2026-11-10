<script>
var that;
export default {
  data() {
    return {
      pageParams: {},
      //分销钱包（开启新账本之前到账的那一截）
      data: {},
      //商家配置：只读「结算到用户余额」这一枚生效值
      config: {},
      //待结算收益与到账提示（都由后端算）
      total: {},
      // 首屏即为加载态：金额那一格先铺骨架屏（M16）；onShow 重取不置回 true，已渲染的数字不被盖掉
      loading: true
    }
  },
  computed: {
    /**
     * 商家有没有开启「佣金结算到用户余额」
     *
     * 只吃后端 getConfig 下发的那一枚生效值（缺字段就当没开，与旧包一致），
     * 不许前端按「账户余额有多少」自己判——那是只有这一屏才会产生的数据。
     */
    settleToBalance() {
      return String(this.config.settle_to_balance) === '1';
    },

    /**
     * 待结算收益下面那一句灰字：整句由后端下发（「预计 3 天后到账」/「待订单完成后起算」/ 空）
     */
    waitingTip() {
      return this.total.next_settle_text ? this.total.next_settle_text : '佣金到账后自动并入账户余额';
    },

    waiting() {
      var waiting = Number(this.total.price_waiting);
      return isNaN(waiting) ? '0.00' : waiting.toFixed(2);
    }
  },
  watch: {
  },
  methods: {
    getData() {
      // 三条腿一起取：分销钱包、商家开关、待结算汇总（账户余额已按用户口径从本页撤掉，不再取）。
      // 骨架屏的收口判据是这三条全部回音（硬约束 22：一个加载态盖住多条腿时不能「这一腿回来了就撤」），
      // 任何一条失败都不能拖住其余，否则整页停在占位态
      var jobs = [
        that.$api('app.agent.member.getMember', {}).then(res => {
          if (res.code === 1) {
            that.data = res.data;
          }
        }),
        that.$api('app.agent.config.getConfig', {}).then(res => {
          if (res.code === 1) {
            that.config = res.data;
          }
        }),
        //读汇总时后端会先把本人到点的佣金就地结算掉，这里的待结算才是同一时刻的数
        that.$api('app.agent.order.getTotal', { type: '' }).then(res => {
          if (res.code === 1) {
            that.total = res.data;
          }
        })
      ];

      // 下拉刷新等这一趟全部回音再收条（M4）
      Promise.all(jobs.map(job => job.catch(() => null))).then(() => {
        that.loading = false;
        uni.stopPullDownRefresh();
      });
    },

    //刷新
    refresh() {
      that.getData();
    },

  },
  onShow() {
    this.getData();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    this.getData();
  }
}
</script>
