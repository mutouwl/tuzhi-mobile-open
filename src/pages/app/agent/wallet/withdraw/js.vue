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
      that.$api('app.agent.member.getMember', {}).then(res => {
        if (res.code === 1) {
          that.member = res.data;
        }
      });
      uni.stopPullDownRefresh();
    },

    getCard() {
      that.$api('app.agent.wallet.getCard', {}).then(res => {
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
      that.$api('app.agent.config.getConfig', {}).then(res => {
        if (res.code === 1) {
          that.config = res.data;
        }
      });
      uni.stopPullDownRefresh();
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
    this.getCard();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    this.getCard()
    this.getMember();
    this.getConfig();
  }
}
</script>