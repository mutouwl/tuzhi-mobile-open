<template>
    <div>
        <u-popup title="绑定手机号" :show="show" @close="close" @open="open" :closeable="true" :round="10">
            <div class="service-box">
                <tz-box padding="10px 15px 15px" bgColor="none">
                    <u-input type="number" border="surround" style="background: #fff;" v-model="form.mobile" class="u-input-diy"
                        placeholder="请输入手机号">
                    </u-input>
                    <u-input customStyle="margin-top: 10px;" style="background: #fff;" type="number" border="surround" v-model="form.captcha"
                        class="u-input-diy" placeholder="请输入验证码">
                        <template slot="suffix">
                            <u-code ref="code" @change="codeChange" seconds="60" changeText="X秒重新获取"></u-code>
                            <span class="get-code-btn" @click="getCode" :text="tips">{{ tips }}</span>
                        </template>
                    </u-input>
                </tz-box>

                <tz-divider height="10" bgColor="none" />

                <tz-box bgColor="none">
                    <tz-button type="primary" long text="确定" @click="changemobile"></tz-button>
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
                    mobile: "",
                    captcha: "",
                },
                tips: "获取验证码",
            };
        },
        props: {},
        watch: {},
        methods: {

            //获取验证码
            getCode() {

                var ref = that.$refs.code;
                var event = "changemobile";
                var mobile = that.form.mobile;

                if (ref.canGetCode) {
                    // 向后端请求验证码
                    uni.showLoading({
                        title: "正在获取验证码",
                    });
                    that
                        .$api("sms.send", {
                            mobile: mobile,
                            event: event,
                        })
                        .then((res) => {
                            if (res.code == 1) {
                                uni.hideLoading();
                                uni.$u.toast(res.msg);
                                ref.start();
                            }else{
                                uni.$u.toast(res.msg);
                            }
                        })
                        .catch((res) => {
                            uni.hideLoading();
                            uni.$u.toast(res.msg);
                        });
                } else {
                    uni.$u.toast("倒计时结束后再发送");
                }
            },
            //修改新密码
            changemobile() {
                var that = this;

                if (!this.$tools.checkModbile(this.form.mobile)) {
                    uni.$u.toast("请输入正确的手机号码");
                    return;
                }
                if (!this.$tools.checkSmsCode(this.form.captcha)) {
                    uni.$u.toast("验证码格式不正确");
                    return;
                }

                uni.showLoading({
                    title: "正在操作",
                });

                that
                    .$api("user.info.changemobile", that.form)
                    .then((res) => {
                        if (res.code == 1) {
                            uni.hideLoading();
                            if (res.msg == "merge") {
                                that.close();
                                uni.showModal({
                                    title: "提示",
                                    content: "该手机号已被注册，是否合并账号",
                                    success: function () {
                                        that.$nav.to(
                                            "/pages/user/merge/merge?mobile=" +
                                            res.data.mobile +
                                            "&key=" +
                                            res.data.key
                                        );
                                    },
                                    cancel: function () {
                                        uni.$u.toast("请更换要绑定的手机号");
                                    },
                                });
                                return false;
                            }

                            uni.showToast({
                                title: res.msg,
                                duration: 1500,
                                icon:'none',
                                success: () => {
                                    setTimeout(function () {
                                        that.close();
                                        // uni.navigateBack({
                                        //     delta: 1
                                        // })
                                    }, 1500);
                                },
                            });
                        }
                    })
                    .catch((res) => {
                        uni.hideLoading();
                        uni.$u.toast("网络异常");
                    });
            },
            codeChange(text) {
                this.tips = text;
            },
            close() {
                this.show = false;
                this.$emit("close", false);
            },
            open() {
                this.$emit("open", false);
            },

            showModal(){
                this.show = true;
            },

            /**
             * 检查用户是否绑定手机号
             */
            check() {
                var that = this;
                var userInfo = uni.getStorageSync("user_info");
                if (!userInfo) {
                    return false;
                }
                userInfo = JSON.parse(userInfo);
                if (
                    userInfo &&
                    !userInfo.mobile &&
                    that.$tools.systemConfig("bind_mobile_modal") == "open"
                ) {
                    //复核一下，避免重复弹窗
                    this.recheck();
                }
            },

            /**
             * 复查用户是否绑定手机号
             */
            recheck() {
                that.$api("user.info.index", {}).then((res) => {
                    if (res.code === 1) {
                        if (!res.data.mobile) {
                            that.show = true;
                        } else {
                            uni.setStorageSync("user_info", JSON.stringify(res.data));
                        }
                    }
                });
            },
        },
        created() { },
        mounted() {
            that = this;
            this.check();
        }
    };
</script>

<style>
    .popup-title {
        width: 100%;
        height: 50px;
        line-height: 50px;
        font-size: 14px;
        text-align: center;
        border-bottom: 1px solid #efefef;
    }

    .icon {
        width: 100px;
        height: 100px;
        margin: 30px auto 20px;
    }

    .icon img {
        width: 100%;
        height: 100%;
    }

    .tip {
        width: 100%;
        text-align: center;

        margin: 20px 0 30px;
    }

    .tip .title {
        font-size: 16px;
        color: #1d2129;
    }

    .tip .subtitle {
        font-size: 13px;
        color: #86909c;

        margin-top: 6px;
    }

    .get-code-btn {
        font-size: 14px;
        color: #0968f6;
    }

    .u-input-diy {
        height: 50px;
        line-height: 50px;
    }
</style>