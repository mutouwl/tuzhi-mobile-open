
<script>
var that;
export default {
  data() {
    return {


      form: {
        mobile: '', //用户/电话
        newpassword: '', //密码
        captcha: ''//验证码
      },

      //加载中
      isRotate: false,

      tips: '',
      pageParams: {
        type: 'nologin'
      }
    }
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    if (pageParams.hasOwnProperty('type') && pageParams.type == 'update') {
      uni.setNavigationBarTitle({
          title: "重置密码"
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
          mobile: that.form.mobile,
          event: 'resetpwd'
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


    /**
     * 提交修改
     */
    submit() {
      var that = this;

      if (!this.$tools.checkModbile(this.form.mobile)) {
        uni.$u.toast('请输入正确的手机号码');
        return;
      }
      if (!this.$tools.checkPassword(this.form.newpassword)) {
        uni.$u.toast('密码格式错误');
        return;
      }

      if (!this.$tools.checkSmsCode(this.form.captcha)) {
        uni.$u.toast('验证码格式错误');
        return;
      }


      uni.showLoading({
        title: '加载中'
      });

      that.$api('user.info.resetpwd', that.form).then(res => {
        if (res.code == 1) {
          uni.hideLoading();

          var msg = '密码修改完成,请直接登录';
          if (that.pageParams.hasOwnProperty('type') && that.pageParams.type == 'update') {
            msg = '操作成功';
          }

          uni.showToast({
            title: msg,
            duration: 1500,
            success: ()=>{
              setTimeout(function(){
                uni.navigateBack({
                delta: 1
              })
              },1500)
            }
          });

        }
      }).catch(res => {
        uni.hideLoading();
        uni.$u.toast('网络连接断开，请检查网络设置');
      });
    },
    //登陆页面
    login() {
      this.$nav.to("/pages/public/login/login", 'local', 'redirectTo');
    },
    register() {
      this.$nav.to("/pages/public/register/register", 'local', 'redirectTo');
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