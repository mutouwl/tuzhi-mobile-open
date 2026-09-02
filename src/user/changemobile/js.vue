<script>
var that;
export default {
  data() {
    return {
      form: {
        confirm: {
          captcha: ''
        },
        change: {
          mobile: '',
          captcha: ''
        }
      },

      step: 1,



      mobile: '',

      pageParams: {},
      tips: {
        old: '获取验证码',
        new: '获取验证码'
      },
    }
  },
  watch: {
  },
  methods: {

    oldCodeChange(text) {
      that.tips.old = text;
    },
    newCodeChange(text) {
      that.tips.new = text;
    },

    //获取验证码
    getCode(type) {
      if (type == 'old') {
        var ref = that.$refs.olduCode;
        var event = 'confirmmobile';
        var mobile = that.mobile;
      } else {
        var ref = that.$refs.newuCode;
        var event = 'changemobile';
        var mobile = that.form.change.mobile;
      }
      if (ref.canGetCode) {
        // 模拟向后端请求验证码
        uni.showLoading({
          title: '正在获取验证码'
        })
        that.$api('sms.send', {
          mobile: mobile,
          event: event
        }).then(res => {
          if (res.code == 1) {
            uni.hideLoading();
            uni.$u.toast(res.msg);
            ref.start();
          }
        }).catch(res => {
          uni.hideLoading();
        });
      } else {
        uni.$u.toast('倒计时结束后再发送');
      }
    },

    // 确认原密码
    confirm() {
      if (!this.$tools.checkSmsCode(that.form.confirm.captcha)) {
        uni.$u.toast('验证码格式错误');
        return;
      }
      uni.showLoading({
        title: '等待验证'
      })
      that.$api('sms.check', {
        mobile: that.mobile,
        captcha: that.form.confirm.captcha,
        event: 'confirmmobile'
      }).then(res => {
        if (res.code == 1) {
          uni.hideLoading();
          that.step = 2;
        }
      }).catch(res => {
        uni.hideLoading();
      });
    },

    submit() {
      if (that.step == 1) {
        that.confirm()
      } else {
        that.changemobile()
      }
    },

    //修改新密码
    changemobile() {
      var that = this;

      if (!this.$tools.checkModbile(this.form.change.mobile)) {
        uni.$u.toast('请输入正确的手机号码');
        return;
      }
      if (!this.$tools.checkSmsCode(this.form.change.captcha)) {
        uni.$u.toast('验证码格式错误');
        return;
      }


      uni.showLoading({
        title: '正在操作'
      });

      that.$api('user.info.changemobile', that.form.change).then(res => {
        if (res.code == 1) {

          uni.hideLoading();
          if (res.msg == 'merge') {
            that.$emit('close', false);
            uni.showModal({
              title: '提示',
              content: '该手机号已被注册，是否合并账号',
              success: function () {
                that.$nav.to("/pages/user/merge/merge?mobile=" + res.data.mobile + "&key=" + res.data.key)
              },
              cancel: function () {
                uni.$u.toast('请更换要绑定的手机号');
              }
            });
            return false;
          }

          
          uni.showToast({
            title: res.msg,
            duration: 1500,
            success: () => {
              setTimeout(function () {
                uni.navigateBack({
                  delta: 1
                })
              }, 1500)
            }
          });
        }
      }).catch(res => {
        uni.hideLoading();
        uni.$u.toast('网络异常');
      });
    },
    //
    getData() {
      that.$api('user.info.index', {}).then(res => {
        if (res.code === 1) {
          that.mobile = res.data.mobile;

          if (!that.mobile) {
            that.step = 2;
            uni.setNavigationBarTitle({
              title: "绑定手机号"
            })
          }
        }
      });
    },

  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    that.getData();
  }
}
</script>