<script>
var that;
export default {
  data() {
    return {
      pageParams: {},
      member: {},
      form: {
        money: ''
      },
      bank: {},
      config: {},
      // 首屏即为加载态：账户 / 余额 / 提现说明都到齐前整块铺骨架屏（M16）
      loading: true,
      withdrawChannel: [
        {
          name: '微信',
          type: 'wechat'
        },
        {
          name: '支付宝',
          type: 'alipay',
        },
        {
          name: '添加提现渠道',
          type: 'channel',
          id: '0'
        }
      ]
    }
  },
  watch: {
  },
  methods: {
    getMember() {
      return that.$api('app.agent.member.getMember', {}).then(res => {
        if (res.code === 1) {
          that.member = res.data;
        }
      });
    },

    getCard() {
      return that.$api('app.agent.wallet.getCard', {}).then(res => {
        if (res.code === 1) {
          if (res.data) {
            that.bank = res.data;
          } else {
            that.bank = false;
          }
        }
      });
    },

    getConfig() {
      return that.$api('app.agent.config.getConfig', {}).then(res => {
        if (res.code === 1) {
          that.config = res.data;
        }
      });
    },

    //提交提现
    submit() {

      if (that.config.withdraw_status != 1) {
        uni.$u.toast('提现暂时关闭');
        return false;
      }

      var membermoney = parseFloat(that.member.money);
      var formmoney = parseFloat(that.form.money);
      var configwithdraw_minmoney = parseFloat(that.config.withdraw_minmoney);

      if (formmoney < configwithdraw_minmoney || formmoney < 0) {
        uni.$u.toast('提现最小金额为:' + configwithdraw_minmoney + '元');
        return false;
      }

      if (formmoney > membermoney) {
        uni.$u.toast('可提现金额不足');
        return false;
      }

      if (!that.bank) {
        uni.$u.toast('请先添加提现的银行卡');
        return false;
      }


      that.$api('app.agent.withdraw.submit', {
        money: that.form.money
      }).then(res => {
        uni.$u.toast(res.msg);
        if (res.code === 1) {
          setTimeout(function () {
            uni.navigateBack({
              delta: 1
            })
          }, 1400)
        }
      });


    },

    //全部提现
    all() {
      that.form.money = that.member.money;
    }

  },
  onShow() {
    // 从「提现账户」页退回来由本页自己重取账户那一格，不再动 loading ⇒ 已渲染的余额不闪骨架（M23）
    this.getCard().catch(() => {});
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    // 骨架屏收口：账户 / 余额 / 提现开关三个请求全部回音才撤，早撤会摆出没依据的账户态与空余额（M16）；
    // 单路失败不拖住其余，失败同样要撤
    Promise.all([this.getCard(), this.getMember(), this.getConfig()].map(job => job.catch(() => null)))
      .then(() => {
        that.loading = false;
        uni.stopPullDownRefresh();
      });
  }
}
</script>