<script>
var that;
export default {
  data() {
    return {
      balance: '0.00',
      totalIncome: '0.00',
      totalWithdraw: '0.00',
      wechatBound: false,
      withdrawStatus: 'close',
      withdrawTypes: [],
      withdrawTip: '',
      withdrawMinMoney: 0,
      withdrawMonthTimes: 0,
      monthUsedCount: 0,
      withdrawAmount: '',
      withdrawType: '',
      allPayTypes: [
        { label: '银行卡', value: 'bank' },
        { label: '支付宝', value: 'alipay' },
        { label: '微信零钱', value: 'wechat' },
      ],
      accountTypes: [
        { label: '银行卡', value: 'bank' },
        { label: '支付宝', value: 'alipay' },
      ],
      selectedAccount: null,
      accountList: [],
      showAccountPopup: false,
      showAddAccount: false,
      accountForm: {
        id: 0,
        type: 'bank',
        account_name: '',
        account_no: '',
        ext: '',
      },
      // 收款账户保存中（防重复提交）
      accountSaving: false,
      // 提现提交中（防重复提交）
      withdrawSubmitting: false,
      showWechatNamePopup: false,
      wechatRealName: '',
    };
  },
  computed: {
    currentTypeAccounts() {
      var type = this.withdrawType;
      return this.accountList.filter(function (item) {
        return item.type == type;
      });
    },
    needAccount() {
      return this.withdrawType != 'wechat';
    },
    payTypes() {
      var that = this;
      return this.allPayTypes.filter(function (item) {
        return that.withdrawTypes.indexOf(item.value) !== -1;
      });
    },
    isWithdrawEnabled() {
      return this.withdrawStatus === 'open';
    },
    monthRemaining() {
      if (!this.withdrawMonthTimes || this.withdrawMonthTimes <= 0) {
        return -1;
      }
      return Math.max(0, this.withdrawMonthTimes - this.monthUsedCount);
    },
    withdrawAmountNumber() {
      return parseFloat(this.withdrawAmount) || 0;
    },
    needWechatRealName() {
      return this.withdrawType == 'wechat' && this.withdrawAmountNumber >= 2000;
    },
    amountPlaceholder() {
      if (this.withdrawMinMoney > 0) {
        return '最低提现金额 ¥' + Number(this.withdrawMinMoney).toFixed(2);
      }
      return '请输入提现金额';
    },
    accountNameLabel() {
      return this.accountForm.type == 'alipay' ? '支付宝姓名' : '持卡人姓名';
    },
    accountNamePlaceholder() {
      return this.accountForm.type == 'alipay' ? '请输入支付宝实名姓名' : '请输入持卡人姓名';
    },
    accountNoLabel() {
      return this.accountForm.type == 'alipay' ? '支付宝账号' : '银行卡号';
    },
    accountNoPlaceholder() {
      return this.accountForm.type == 'alipay' ? '请输入支付宝账号' : '请输入银行卡号';
    },
    currentAccountTypeLabel() {
      return this.getWithdrawTypeLabel(this.withdrawType == 'wechat' ? 'bank' : this.withdrawType);
    },
  },
  watch: {
    withdrawType() {
      this.selectedAccount = null;
      if (this.withdrawType != 'wechat') {
        this.wechatRealName = '';
      }
    },
  },
  onLoad() {
    that = this;
    this.loadData();
  },
  onPullDownRefresh() {
    this.loadData();
  },
  methods: {
    loadData() {
      uni.showLoading({ title: '加载中' });
      var balanceDone = false;
      var accountDone = false;
      var checkDone = function () {
        if (balanceDone && accountDone) {
          uni.hideLoading();
          uni.stopPullDownRefresh();
        }
      };
      that.getBalance(function () { balanceDone = true; checkDone(); });
      that.getAccount(function () { accountDone = true; checkDone(); });
    },
    getBalance(callback) {
      that.$api('user.withdraw.getBalance', {}).then(function (res) {
        if (res.code === 1 && res.data) {
          that.balance = res.data.balance || '0.00';
          that.totalIncome = res.data.total_income || '0.00';
          that.totalWithdraw = res.data.total_withdraw || '0.00';
          that.wechatBound = !!res.data.wechat_bound;
          that.withdrawStatus = res.data.withdraw_status || 'close';
          that.withdrawTypes = that.normalizeWithdrawTypes(res.data.withdraw_types || []);
          that.withdrawTip = res.data.withdraw_tip || '';
          that.withdrawMinMoney = parseFloat(res.data.withdraw_min_money) || 0;
          that.withdrawMonthTimes = parseInt(res.data.withdraw_month_times) || 0;
          that.monthUsedCount = parseInt(res.data.month_used_count) || 0;
          if (!that.withdrawType && that.payTypes.length > 0) {
            that.withdrawType = that.payTypes[0].value;
          }
        }
        if (typeof callback === 'function') callback();
      }).catch(function () {
        if (typeof callback === 'function') callback();
      });
    },
    getAccount(callback) {
      that.$api('user.withdraw.getAccount', {}).then(function (res) {
        if (res.code === 1 && res.data) {
          that.accountList = res.data.list || [];
          if (res.data.wechat_bound !== undefined) {
            that.wechatBound = !!res.data.wechat_bound;
          }
        }
        if (typeof callback === 'function') callback();
      }).catch(function () {
        if (typeof callback === 'function') callback();
      });
    },
    goBindAccount() {
      uni.navigateTo({ url: '/pages/user/bindaccount/bindaccount' });
    },
    goAssetsDetail() {
      uni.navigateTo({ url: '/pages/user/assets/assets?type=money' });
    },
    goWithdrawLog() {
      uni.navigateTo({ url: '/pages/user/redpacket/withdraw-log' });
    },
    selectAccount(item) {
      that.selectedAccount = item;
      that.showAccountPopup = false;
    },
    // 打开添加账户弹窗（同类型最多可添加三个）
    openAddAccount() {
      if (that.currentTypeAccounts.length >= 3) {
        uni.showToast({ title: '每种类型的收款账户最多可添加3个', icon: 'none' });
        return;
      }
      var accountType = that.withdrawType == 'alipay' ? 'alipay' : 'bank';
      that.accountForm = { id: 0, type: accountType, account_name: '', account_no: '', ext: '' };
      that.showAddAccount = true;
    },
    // 编辑收款账户
    editAccount(item) {
      that.accountForm = {
        id: item.id,
        type: item.type,
        account_name: item.name,
        account_no: item.account,
        ext: item.ext || '',
      };
      that.showAddAccount = true;
    },
    // 删除收款账户
    deleteAccount(item) {
      that.showAccountPopup = false;
      uni.showModal({
        title: '删除收款账户',
        content: '确认删除该收款账户吗？',
        confirmText: '删除',
        success: function (res) {
          if (!res.confirm) return;
          that.$api('user.withdraw.delAccount', { id: item.id }).then(function (delRes) {
            if (delRes.code === 1) {
              uni.showToast({ title: '删除成功', icon: 'success' });
              if (that.selectedAccount && that.selectedAccount.id == item.id) {
                that.selectedAccount = null;
              }
              that.getAccount();
            } else {
              uni.showToast({ title: delRes.msg || '删除失败', icon: 'none' });
            }
          });
        },
      });
    },
    saveAccount() {
      // 保存中禁止重复点击（加载框不阻断按钮点击，需显式拦截）
      if (that.accountSaving) return;
      if (!that.accountForm.account_name || that.accountForm.account_name.trim().length < 2) {
        uni.showToast({ title: '请输入正确的户名（至少2个字符）', icon: 'none' });
        return;
      }
      if (!that.accountForm.account_no) {
        uni.showToast({ title: '请输入账号', icon: 'none' });
        return;
      }
      if (that.accountForm.type == 'bank') {
        if (!/^\d{10,19}$/.test(that.accountForm.account_no)) {
          uni.showToast({ title: '请输入正确的银行卡号（10-19位数字）', icon: 'none' });
          return;
        }
        if (!that.accountForm.ext) {
          uni.showToast({ title: '请输入开户行', icon: 'none' });
          return;
        }
      } else if (that.accountForm.type == 'alipay') {
        if (that.accountForm.account_no.trim().length < 4) {
          uni.showToast({ title: '请输入正确的支付宝账号', icon: 'none' });
          return;
        }
      }
      that.accountSaving = true;
      uni.showLoading({ title: '保存中' });
      that.$api('user.withdraw.saveAccount', {
        id: that.accountForm.id,
        type: that.accountForm.type,
        name: that.accountForm.account_name,
        account: that.accountForm.account_no,
        ext: that.accountForm.ext,
      }).then(function (res) {
        that.accountSaving = false;
        uni.hideLoading();
        if (res.code === 1) {
          uni.showToast({ title: '保存成功', icon: 'success' });
          that.showAddAccount = false;
          that.accountForm = { id: 0, type: 'bank', account_name: '', account_no: '', ext: '' };
          that.getAccount();
        } else {
          uni.showToast({ title: res.msg || '保存失败', icon: 'none' });
        }
      }).catch(function () {
        that.accountSaving = false;
        uni.hideLoading();
      });
    },
    submitWithdraw() {
      // 提交中禁止重复点击，防止重复发起提现申请
      if (that.withdrawSubmitting) return;
      if (!that.withdrawAmount || parseFloat(that.withdrawAmount) <= 0) {
        uni.showToast({ title: '请输入正确的提现金额', icon: 'none' });
        return;
      }
      if (!that.withdrawType || that.withdrawTypes.indexOf(that.withdrawType) === -1) {
        uni.showToast({ title: '该提现方式暂未开启', icon: 'none' });
        return;
      }
      if (parseFloat(that.withdrawAmount) > parseFloat(that.balance)) {
        uni.showToast({ title: '提现金额不能超过余额', icon: 'none' });
        return;
      }
      if (that.withdrawMinMoney > 0 && parseFloat(that.withdrawAmount) < that.withdrawMinMoney) {
        uni.showToast({ title: '最低提现金额为 ¥' + Number(that.withdrawMinMoney).toFixed(2), icon: 'none' });
        return;
      }
      if (that.monthRemaining === 0) {
        uni.showToast({ title: '本月提现次数已用完', icon: 'none' });
        return;
      }
      if (that.withdrawType == 'wechat') {
        if (!that.wechatBound) {
          uni.showToast({ title: '请先绑定微信账号', icon: 'none' });
          return;
        }
        if (that.needWechatRealName && !that.getWechatRealName()) {
          that.showWechatNamePopup = true;
          return;
        }
      } else {
        if (!that.selectedAccount) {
          uni.showToast({ title: '请选择收款账户', icon: 'none' });
          return;
        }
      }
      var amount = Number(parseFloat(that.withdrawAmount)).toFixed(2);
      var channel = that.getWithdrawTypeLabel(that.withdrawType);
      uni.showModal({
        title: '确认提现',
        content: that.buildWithdrawConfirmContent(channel, amount),
        confirmText: '确认提交',
        cancelText: '再看看',
        success: function (modalRes) {
          if (!modalRes.confirm) return;
          that.submitWithdrawRequest();
        },
      });
    },
    getWechatRealName() {
      return (this.wechatRealName || '').replace(/^\s+|\s+$/g, '');
    },
    confirmWechatRealName() {
      var realName = this.getWechatRealName();
      if (!realName || realName.length < 2) {
        uni.showToast({ title: '请输入收款人真实姓名', icon: 'none' });
        return;
      }
      this.wechatRealName = realName;
      this.showWechatNamePopup = false;
      this.submitWithdraw();
    },
    cancelWechatRealName() {
      this.showWechatNamePopup = false;
    },
    buildWithdrawConfirmContent(channel, amount) {
      var content = '提现渠道：' + channel + '\n提现金额：¥' + amount;
      if (this.needWechatRealName && this.getWechatRealName()) {
        content += '\n收款姓名：' + this.getWechatRealName();
      }
      return content;
    },
    getWithdrawTypeLabel(type) {
      var item = this.allPayTypes.find(function (payType) {
        return payType.value == type;
      });
      return item ? item.label : type;
    },
    normalizeWithdrawTypes(value) {
      var raw = [];
      if (Array.isArray(value)) {
        raw = value;
      } else if (value && typeof value === 'object') {
        Object.keys(value).forEach(function (key) {
          raw.push(key);
          raw.push(value[key]);
        });
      } else if (typeof value === 'string') {
        raw = value ? value.split(',') : [];
      }

      var map = {
        bank: 'bank',
        '银行卡': 'bank',
        '银行卡提现': 'bank',
        alipay: 'alipay',
        '支付宝': 'alipay',
        '支付宝提现': 'alipay',
        wechat: 'wechat',
        '微信零钱': 'wechat',
        '微信提现': 'wechat',
        '微信零钱提现': 'wechat',
      };
      var result = [];
      raw.forEach(function (item) {
        var candidates = [];
        if (item && typeof item === 'object') {
          ['value', 'name', 'key', 'label', 'title'].forEach(function (field) {
            if (item[field]) candidates.push(item[field]);
          });
        } else {
          candidates.push(item);
        }
        candidates.forEach(function (candidate) {
          var key = String(candidate || '').trim();
          if (!key || key === '0' || key.toLowerCase() === 'false') return;
          var type = map[key] || map[key.toLowerCase()];
          if (type && result.indexOf(type) === -1) {
            result.push(type);
          }
        });
      });
      return result;
    },
    submitWithdrawRequest() {
      that.withdrawSubmitting = true;
      uni.showLoading({ title: '提交中' });
      that.$api('user.withdraw.submit', {
        money: that.withdrawAmount,
        type: that.withdrawType,
        user_name: that.needWechatRealName ? that.getWechatRealName() : '',
      }).then(function (res) {
        that.withdrawSubmitting = false;
        uni.hideLoading();
        if (res.code === 1) {
          uni.showToast({ title: '提现申请已提交', icon: 'success' });
          that.withdrawAmount = '';
          that.wechatRealName = '';
          that.getBalance();
        } else {
          uni.showToast({ title: res.msg || '提现失败', icon: 'none' });
        }
      }).catch(function () {
        that.withdrawSubmitting = false;
        uni.hideLoading();
      });
    },
  },
};
</script>
