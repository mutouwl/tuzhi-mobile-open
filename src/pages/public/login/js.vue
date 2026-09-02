<script>
  var that;
  import Wechat from "@/common/wechat/wechat";
  export default {
    data() {
      return {
        //登陆方式
        loginType: "captcha",

        form: {
          account: "", //用户/电话
          password: "", //密码
          captcha: "", //验证码
        },

        //加载中
        isRotate: false,

        tips: "",
        value: "",
        pageParams: {},
        agreementChecked: false,
        agreementToastShow:false
      };
    },
    onLoad(pageParams) {
      that = this;
      that.pageParams = that.$nav.parsePageParams(pageParams);
      if (pageParams.token) {
        this.tokenLogin(pageParams.token);
      }

      if (pageParams.msg) {
        uni.$u.toast(pageParams.msg);
      }

      // #ifdef MP-WEIXIN
      new Wechat().getWxMiniProgramSessionKey();
      // #endif
    },
    onShow() {
      if (that.$nav.checkLogin()) {
        that.$nav.to("/pages/user/index/index");
      }
      
    },

    methods: {
      /**
       * 同意协议
       */
      agreementChange(e) {
        this.agreementChecked = e;
      },

      /**
       * 跳转用户协议页面
       */
      agreement(type) {
        that.$nav.to("/pages/public/agreement/agreement?type=" + type);
      },

      /**
       * 根据token获取用户信息登陆
       * @param {*} token
       */
      tokenLogin(token) {
        uni.setStorageSync("user_token", token);

        //根据token获取用户信息

        // #ifdef MP-TOUTIAO
        uni.showLoading({
          title: "请稍等……",
        });
        // #endif

        // #ifndef MP-TOUTIAO
        uni.showLoading({
          title: "登录中……",
        });
        // #endif

        that.$api("user.info.index", {}).then((res) => {
          if (res.code === 1) {
            that.setToken(res.data);
            var firstpath = uni.getStorageSync("first_path");
            if (firstpath) {
              that.$nav.to(firstpath, "local", "reLaunch");
              uni.removeStorageSync("first_path");
            } else {
              that.$nav.to("/pages/user/index/index", "local", "reLaunch");
            }
          } else {
            uni.$u.toast("登录异常,请重试");
          }
          uni.hideLoading();
        });
      },

      codeChange(text) {
        this.tips = text;
      },
      getCode() {
        if (this.$refs.uCode.canGetCode) {
          // 模拟向后端请求验证码
          uni.showLoading({
            title: "正在获取验证码",
          });

          that
            .$api("sms.send", {
              mobile: that.form.account,
              event: "mobilelogin",
            })
            .then((res) => {
              if (res.code == 1) {
                uni.hideLoading();
                uni.$u.toast(res.msg);
                this.$refs.uCode.start();
              }
            })
            .catch((res) => {
              uni.hideLoading();
            });
        } else {
          uni.$u.toast("倒计时结束后再发送");
        }
      },

      /**
       * 微信登陆
       */
      async wxLogin() {
        if (!that.agreementChecked) {
          that.agreementTip('wxLogin');
          return false;
        }

        let wechat = new Wechat();
        let token = await wechat.login();
        if (token !== undefined) {
          // this.setTokenAndBack(token);
        }
      },

      agreementTip(loginType = 'login',options = {}){
        if(that.agreementToastShow){
          return false;
        }
        that.agreementToastShow = true;
        uni.showModal({
          title: "提示",
          content: "你尚未同意用户协议，是否同意并登录",
          cancelText: "取消",
          confirmText: "继续登录",
          success: function (res) {
            that.agreementToastShow = false;
            if (res.confirm) {
              that.agreementChecked = true;
              switch(loginType){
                case "login":
                  that.login();
                  break;
                case "getuserinfo":
                  that.getuserinfo(options);
                  break;
                case "wxLogin":
                  that.wxLogin();
                  break;
              }
            }
          },
          fail: function (res) {
            console.log(res);
          }
        })
      },

      //微信小程序登录
      // #ifdef MP-WEIXIN
      async getuserinfo(e) {
        if (!this.agreementChecked) {
          that.agreementTip("getuserinfo",e);
          // uni.$u.toast("请先阅读并同意用户协议");
          return;
        }
        var wechat = new Wechat();
        let ret = await wechat.wxMiniProgramLogin(e);

        if (ret.code == 1) {
          this.tokenLogin(ret.data.token);
        } else {
          uni.$u.toast(ret.msg);
        }

        // store.commit('FORCE_OAUTH', false);
        // this.setTokenAndBack(token);
      },
      // #endif

      //抖音小程序登录
      // #ifdef MP-TOUTIAO
      async getuserinfo(e) {
        if (!this.agreementChecked) {
          that.agreementTip("getuserinfo",e);
          return;
        }
        var wechat = new Wechat();

        let ret = await wechat.dyMiniProgramLogin();

        if (ret) {
          if (ret.code == 1) {
            this.tokenLogin(ret.data.token);
          } else {
            uni.$u.toast(ret.msg);
          }
        }
      },
      // #endif
      // 切换登录方式
      changeLoginType() {
        this.loginType = this.loginType == "captcha" ? "password" : "captcha";
      },

      login() {
        var that = this;

        if (!this.agreementChecked) {
          that.agreementTip("login");
          return;
        }

        if (!this.$tools.checkModbile(this.form.account)) {
          uni.$u.toast("请输入正确的手机号码");
          return;
        }
        if (
          that.loginType == "password" &&
          !this.$tools.checkPassword(this.form.password)
        ) {
          uni.$u.toast("密码格式错误");
          return;
        }

        if (that.loginType == "captcha" && !this.$tools.checkSmsCode(this.form.captcha)) {
          uni.$u.toast("验证码格式错误");
          return;
        }
        // #ifdef MP-TOUTIAO
        uni.showLoading({
          title: "请稍等……",
        });
        // #endif

        // #ifndef MP-TOUTIAO
        uni.showLoading({
          title: "登录中……",
        });
        // #endif

        var shareId = uni.getStorageSync("share");
        that.form.share = shareId;

        if (that.loginType == "captcha") {
          that.form.mobile = that.form.account;
          var url = "user.info.mobilelogin";
        } else {
          var url = "user.info.login";
        }

        that
          .$api(url, that.form)
          .then((res) => {
            if (res.code == 1) {
              uni.hideLoading();
              that.setToken(res.data.userinfo);
              var firstpath = uni.getStorageSync("first_path");
              if (firstpath) {
                that.$nav.to(firstpath, "local", "reLaunch");
                uni.removeStorageSync("first_path");
              } else {
                that.$nav.to("/pages/user/index/index", "local", "reLaunch");
              }
            } else {
              uni.$u.toast(res.msg);
            }
          })
          .catch((res) => {
            uni.hideLoading();
            uni.$u.toast("网络异常");
          });
      },

      setToken(userinfo) {
        uni.setStorageSync("user_token", userinfo.token);
        uni.setStorageSync("user_openid", userinfo.openid);
        uni.setStorageSync("user_info", JSON.stringify(userinfo));
      },

      resetpwd() {
        this.$nav.to("/pages/public/resetpwd/resetpwd", "local");
      },
      register() {
        this.$nav.to("/pages/public/register/register", "local");
      },
    },
    onShareAppMessage() {
      return this.$nav.share();
    },
    onShareTimeline() {
      return this.$nav.share();
    },
  };
</script>