<script>
var that = null;
export default {
  data() {
    return {
      form: {
        mobile: '', //用户/电话
        password: '', //密码
        code: ''//验证码
      },

      //加载中
      isRotate: false,

      tips: '',
      value: ''
    }
  },
  onLoad(){
    that = this;
  },
  onShow(){
    if (that.$nav.checkLogin()) {
      uni.switchTab({
        url: '/pages/user/index/index'
      })
    }
  },
  methods: {
    codeChange(text) {
      this.tips = text;
    },
    getCode() {
      if (this.$refs.uCode.canGetCode) {
        // 模拟向后端请求验证码
        uni.showLoading({
          title: '正在获取验证码'
        })

        that.$api('sms.send', {
          mobile:that.form.mobile,
          event:'register'
        }).then(res => {
          if (res.code == 1) {
            uni.hideLoading();
            uni.$u.toast(res.msg);
            this.$refs.uCode.start();
          }
        }).catch(res => {
          uni.hideLoading();
        });
      } else {
        uni.$u.toast('倒计时结束后再发送');
      }
    },

    submit() {

      if (!that.$tools.checkModbile(that.form.mobile)) {
        uni.$u.toast('请输入正确的手机号码');
        return;
      }
      if (!that.$tools.checkPassword(that.form.password)) {
        uni.$u.toast('密码格式错误');
        return;
      }

      if (!that.$tools.checkSmsCode(that.form.code)) {
        uni.$u.toast('验证码格式错误');
        return;
      }

      
      that.form.share = uni.getStorageSync('share');


      uni.showLoading({
        title: '正在注册'
      });

      this.isRotate = false;

      that.$api('user.info.register', that.form).then(res => {
        if (res.code == 1) {
          uni.hideLoading();
          uni.setStorageSync('user_token', res.data.userinfo.token);
          uni.setStorageSync('user_info', JSON.stringify(res.data.userinfo));
          uni.switchTab({
            url: '/pages/user/index/index'
          })
          uni.$u.toast(res.msg);

        }
      }).catch(res => {
        uni.hideLoading();
      });
    },
    login(){
      this.$nav.to("/pages/public/login/login",'local','redirectTo');
    },
    resetpwd(){
      this.$nav.to("/pages/public/resetpwd/resetpwd",'local','redirectTo');
    }
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline(){
    return this.$nav.share();
  }
}
</script>