<template>
    <div>
        <u-popup :show="show" title="联系客服" @close="close" @open="open" :closeable="true" :round="10">
            
            <div class="service-box">
                <tz-box padding="10px 15px 15px" bgColor="none">
                    <div class="service-mobile" @click="copy" v-if="mobile">
                        <span>联系电话</span>
                        <span class="service-mobile-val">{{ mobile }}</span>
                    </div>
                    <div class="service-code-img" v-if="code">
                        <image mode="scaleToFill" :src="code" :show-menu-by-longpress="true"></image>
                        <span>长按图片或截图后微信扫码</span>
                    </div>
                    

                </tz-box>
            </div>
        </u-popup>
    </div>
</template>

<script >

var that;
export default {
    components: { },
    data() {
        return {
            show: false
        }
    },
    props: {
        visible: {
            type: [Boolean, Number],
            default: false
        },
        mobile: {
            type: [String, Number],
            default: ''
        },
        code:{
            type: String,
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
        },
        copy() {
            uni.setClipboardData({
                data: that.mobile,
                success: function () {
                    uni.$u.toast('联系电话已复制');
                }
            });
        },
        preview() {
            var imgPath = [this.code];
            uni.previewImage({
                urls: imgPath,
                longPressActions: {
                    itemList: ['发送给朋友', '保存图片', '收藏'],
                    success: function (data) {
                    },
                    fail: function (err) {
                        console.log(err.errMsg);
                    }
                }
            });
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

.service-box{
    text-align: center;
}

.service-code-img{
    width: 160px;
    height: 160px;
    margin: 20px auto 40px;
    font-size: 12px;
    color: #86909C;
}

.service-code-img image{
    width: 100%;
    height: 100%;
}

.service-mobile{
    
    color: #4E5969;
    font-size: 14px;
    width: 100%;
    text-align: center;

    
    /* display: flex;
    justify-content: space-between;
    align-items: center; */

    margin: 10px 0;
}

.service-mobile span{
    vertical-align: middle;
}

.service-mobile-val{
    color: #0968f6;
    font-weight: 700;
    margin: 0 4px;
    font-size: 14px;
}


</style>
