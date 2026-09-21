<script>
var that;
import Wechat from '@/common/wechat/wechat'
export default {
  data() {
    return {
      nickname: '',
      modal: {
        nickname: false
      },
      userInfo: {},
      list: [],
      pageParams: {},
      orderNav: [
        {
          name: '昵称',
          icon: 'people'
        },
        {
          name: '手机号',
          icon: 'people'
        },
        {
          name: '登录密码',
          icon: 'people'
        }
      ],
      isWechat: false,
      userInfo: {},
      // url:''
    }
  },
  watch: {
  },


  methods: {

    agreement(type){
      that.$nav.to('/pages/public/agreement/agreement?type='+type);
    },

    getData() {
      that.$api('user.info.index', {}).then(res => {
        if (res.code === 1) {
          that.userInfo = res.data;
          // that.userInfo = res.data;
          // that.nickname = res.data.nickname;
        }
      });
    }, 

    /**
     * 绑定账号
     */
    bindAccount() {
      if (!that.userInfo.openid) {
        let wechat = new Wechat();
        wechat.wxOfficialAccountOauth();
      }
    },


    hideModal(type) {
      that.model[type] = false;
    },
    changeModalShow(type) {
      that.modal[type] = !that.modal[type];
    },

    nicknameInputChange(option) {
      that.nickname = option.detail.value;
      // that.nickname = value;
    },



    //修改昵称
    nicknameConfirm() {
      if (that.userInfo.nickname == that.nickname) {
        that.changeModalShow('nickname');
        return false;
      }

      if (!that.nickname) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none',
          duration: 1000,
          mask: true
        });
        return false;
      }
      that.$api('user.info.profile', {
        nickname: that.nickname
      }).then(res => {
        if (res.code === 1) {
          uni.showToast({
            title: res.msg,
            icon: 'success',
            duration: 1000,
            mask: true
          });
          that.changeModalShow('nickname');
          that.getData();
        }
      });
    },

    //注销登录
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗',
        success: function (res) {
          if (res.confirm) {
            that.$api('user.info.logout', {}).then(res => {
              if (res.code === 1) {
                uni.removeStorageSync('user_token');
                uni.removeStorageSync('user_info');
                uni.removeStorageSync('session_key');
                uni.removeStorageSync('user_openid');
                uni.reLaunch({
                  url: '/pages/public/login/login'
                });
              }
            });
          }
        }
      });

    },

    changeMobile() {
      this.$nav.to('/pages/user/changemobile/changemobile')
    },
    changePassword() {
      this.$nav.to('/pages/public/resetpwd/resetpwd?type=update')
    },


    changeAvatar(e) {
      // #ifdef MP-WEIXIN || MP-TOUTIAO
      this.editAvatar(e.detail.avatarUrl)
      // #endif
      // #ifdef H5
      uni.chooseImage({
        count: 1, //默认9
        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], //从相册选择
        success: function (res) {
          that.editAvatar(res.tempFiles[0].path);
        }
      });
      // #endif
    },


    editAvatar(path) {


      that.$tools.uploadImage('common/upload', path).then(ret => {
        that.$api('user.info.profile', {
          avatar: ret.full_url
        }).then(res => {
          if (res.code === 1) {
            uni.showToast({
              title: res.msg,
              icon: 'success',
              duration: 1000,
              mask: true
            });
            that.getData();
          }
        });
      });


      // that.$request.upload('common/upload', {
      //   filePath:path
      // }).then(res => {
      //   // if (res.code === 1) {
      //   //   that.$nav.to('/pages/user/index/index')
      //   // }
      // });
    }


  },
  computed: {
    file(){}
  },
  onShow() {
    this.getData();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    this.isWechat = this.$tools.isWechat();
    // this.url = this.$tools.systemConfig('apiUrl');
    this.getData();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline(){
    return this.$nav.share();
  }
}
</script>