<script>
var that;
export default {
  data() {
    return {
      pageParams: {},
      // 首屏即为加载态：已存卡片回填到手前整块铺骨架屏（M16），不摆一张看着像没填的空表
      loading: true,
      data: {},
      form: {
        card_no: '',
        name: '',
        address: ''
      },
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
      ],

      form: {

      },
      rules: []
    }
  },
  watch: {
  },
  methods: {
    getCard() {
      return that.$api('app.agent.wallet.getCard', {}).then(res => {
        if (res.code === 1) {
          if (res.data) {
            that.form = res.data;
          }
        }
      });
    },

    setCard() {
      that.$api('app.agent.wallet.setCard', this.form).then(res => {
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



    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      that.getData();
    },

    //全部提现
    all() {
      that.form.money = that.data.money;
    }

  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    // 骨架屏收口：回填到手（或失败）才出表单——空表摆在页面上等着被提交，会覆盖掉已存的那张卡号
    this.getCard().catch(() => null).then(() => {
      that.loading = false;
    });
  }
}
</script>