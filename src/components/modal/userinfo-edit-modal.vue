<template>
    <div>
        <u-popup
            title="完善个人资料"
            :show="show"
            @close="close"
            @open="open"
            :closeable="true"
            :round="10">
            <div class="service-box">
                <tz-box padding="10px 15px 15px" bgColor="none">
                    <u-cell-group :border="false">
                        <u-cell :border="false"
                            :titleStyle="{ 'font-size': '12px' }" title="头像">
                            <template #right-icon>
                                <div class="avatar-box">
                                    <!--  #ifdef H5 -->
                                    <u-avatar
                                        :src="form.avatar"
                                        @click="changeAvatar"
                                        shape="square"></u-avatar>
                                    <!--  #endif -->
                                    <!--  #ifdef MP-WEIXIN || MP-TOUTIAO -->
                                    <button
                                        class="avatar-wrapper"
                                        open-type="chooseAvatar"
                                        @chooseavatar="changeAvatar">
                                        <u-avatar :src="form.avatar"
                                            shape="square"></u-avatar>
                                    </button>
                                    <!--  #endif -->

                                    <tz-icon name="enter" color="#86909C"
                                        :size="16" />
                                </div>
                            </template>
                        </u-cell>
                        <u-cell :border="false"
                            :titleStyle="{ 'font-size': '12px' }" title="昵称">
                            <template #right-icon>
                                <input type="nickname" placeholder="请输入要修改的昵称"
                                    @change="nicknameInputChange"
                                    v-model="form.nickname"
                                    class="nickname-input"
                                    style="background-color: #fff;" />
                            </template>
                        </u-cell>
                    </u-cell-group>
                </tz-box>

                <tz-divider height="10" bgColor="none" />

                <tz-box bgColor="none">
                    <tz-button type="primary" long text="提交"
                        @click="submit"></tz-button>
                </tz-box>
                <tz-divider height="20" bgColor="none" />
            </div>
        </u-popup>
    </div>
</template>

<script>
var that;
export default {
  components: {},
  data() {
    return {
      show: false,
      form: {
        nickname: "",
        avatar: "",
      },
      tips: "获取验证码",
    };
  },
  props: {
    visible: {
            type: [Boolean, Number],
            default: false
        },
    nickname: {
            type: [String],
            default: ''
        },
        avatar: {
            type: [String],
            default: ''
        }
  },
  watch: {
    visible() {
            this.show = this.visible;

            if(this.show){
                this.getData()
            }
        }
  },
  methods: {
    close() {
      this.$emit("close", false);
    },
    ok() {
      this.$emit("ok", false);
    },
    open() {
      this.$emit("open", false);
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
        that.form.avatar = ret.full_url;
      });
    },

    nicknameInputChange(option) {
      that.form.nickname = option.detail.value;
    },

    submit(){
        uni.showLoading({
            title: '提交中...',
            mask: true
        });
        that.$api('user.info.profile', that.form).then(res => {
            uni.hideLoading();
          if (res.code === 1) {
            uni.showToast({
              title: res.msg,
              icon: 'success',
              duration: 1000,
              mask: true
            });
            that.ok();
          }
        });
    },
    getData() {
        that.form.avatar = this.avatar;
        that.form.nickname = this.nickname;
    },
  },
  created() {},
  mounted() {
    that = this;
    this.show = this.visible;
    if(this.show){
        this.getData()
    }
  },
};
</script>

<style scoped>
::v-deep .u-cell__body{
    padding: 12px 0!important;
    border-bottom:1px solid #F2F3F5!important;
}

::v-deep .u-cell__body--large{
    padding-top: 5px!important;
    padding-bottom: 5px!important;
}

::v-deep .u-cell-group__wrapper .u-cell:last-child .u-cell__body{
    border: none!important;
}

::v-deep .u-cell__title-text--large,::v-deep .u-cell__value--large{
    font-size: 14px!important;
}

.avatar-box{
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.nickname-input{
    width: 100%;
    border: 1px solid #f5f5f5;
    text-align: right;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    padding: 0 15px;
    background-color: #fff;
}

.avatar-wrapper{
    background-color: #fff;
}
.avatar-wrapper::after{
    border: none;
}
</style>
