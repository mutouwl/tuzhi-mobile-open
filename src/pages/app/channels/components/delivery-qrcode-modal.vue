<template>
    <div>
        <u-popup :show="show" @close="close" @open="open" :closeable="true" :round="10">
            <div class="popup-title">扫码获取</div>
            <div class="qrcode-box">
                <tz-box padding="40px 40px">
                    <image  class="qrcode" :show-menu-by-longpress="true" :src="qrcode"></image>
                    <p class="scan-qrcode-tip">长按图片或截图保存图片至微信扫码进入</p>
                </tz-box>

            </div>
        </u-popup>
    </div>
</template>

<script >

var that;
export default {
    components: {},
    data() {
        return {
            show: false,
            form: {
                mobile: '',
                captcha: ''
            },
            tips: '获取验证码'
        }
    },
    props: {
        visible: {
            type: [Boolean, Number],
            default: false
        },
        qrcode: {
            type: [String],
            default: ''
        }
    },
    watch: {
        visible() {
            this.show = this.visible;
        }
    },
    methods: {
        close() {
            this.$emit('close', false);
        },
        open() {
            this.$emit('open', false);
        }
    },
    created() {

    },
    mounted() {
        that = this;
        this.show = this.visible;

    }
}

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

.qrcode-box{
    text-align: center;
}

.qrcode{
    width: 150px;
    height: 150px;
}

.scan-qrcode-tip{
    margin-top: 12px;
    font-size: 12px;
    color: #86909C;
}

</style>
