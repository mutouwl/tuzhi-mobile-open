<template>
    <div>
        <div class="filler-box"></div>

        <view class="box control-box" v-if="type == 'control'">
            <template>
                <!-- <div class="control-btn"  @click="$nav.to('/pages/index/index')">
                    <tz-icon name="homepage" color="#444" />
                    <div>首页</div>
                </div> -->
                <div class="control-btn" @click="collect">
                    <tz-icon name="collection_fill" v-if="params.iscollect" :customStyle="{ color: '#0968f6' }" color="#0968f6" />
                    <tz-icon name="collection" v-if="!params.iscollect" :customStyle="{ color: '#0968f6' }" color="#444" />
                    <div>收藏</div>
                </div>
                <div class="control-btn" @click="dir" v-if="params.column_id">
                    <div><tz-icon name="createtask" color="#444" /></div>
                    <div>目录</div>
                </div>

                <div class="control-btn" @click="comment" v-if="$tools.systemConfig('comment_entry_status') != 'close'">
                    <div><tz-icon name="editor" color="#444" /></div>
                    <div>评论</div>
                </div>

                <div class="control-btn" @click="share">
                    <div><tz-icon name="share" color="#444" /></div>
                    <div>分享</div>
                </div>
            </template>
            <!-- #ifdef MP-TOUTIAO -->
            <u-safe-bottom></u-safe-bottom>
            <!-- #endif -->
        </view>


        <view class="box" v-if="type == 'order'">

            <template>
                <div class="icon" @click="$nav.to('/pages/index/index')">
                    <tz-icon name="homepage" color="#444" />
                </div>
                <div class="icon" @click="share">
                    <tz-icon name="share" color="#444" />
                </div>
                <div class="icon" @click="collect">
                    <!-- <u-button class="custom-style" style="border:none;padding-right: 30px;" :text="'收藏'"
                    @click="handle"></u-button> -->
                    <tz-icon name="collection_fill" v-if="params.iscollect" color="#F53F3F" />
                    <tz-icon name="collection" v-if="!params.iscollect" color="#444" />
                </div> 

                <!-- #ifdef MP-WEIXIN -->
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style"
                    v-if="params.is_virtual_pay || $tools.systemConfig('wx_mp_ban_pay') == 'close' || platform != 'ios'" type="primary"
                    :text="btnTitle ? btnTitle : '立即订阅'" @click="handle"></u-button>
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" v-else type="primary"
                    text="不支持IOS端支付" disabled></u-button>
                <!-- #endif -->

                <!-- #ifdef MP-TOUTIAO -->
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style"
                    v-if="$tools.systemConfig('dy_mp_ban_pay') == 'close' || platform != 'ios'" type="primary"
                    :text="btnTitle ? btnTitle : '立即订阅' + platform" @click="handle"></u-button>
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" v-else type="primary"
                    text="不支持IOS端支付" disabled></u-button>
                <!-- #endif -->

                <!-- #ifdef H5 -->
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" type="primary"
                    :text="btnTitle ? btnTitle : '立即订阅'" @click="handle"></u-button>
                <!-- #endif -->
            </template>
            <!-- #ifdef MP-TOUTIAO -->
            <u-safe-bottom></u-safe-bottom>
            <!-- #endif -->
        </view>

        <view class="box" v-if="type == 'submit'">
            <template>
                <div class="price">
                    <span class="total-text">合计:</span>
                    <span class="unit" v-if="!params.is_virtual_pay">¥</span>{{ params.price }}<span class="unit" v-if="params.is_virtual_pay">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
                </div>

                <!-- #ifdef MP-WEIXIN -->
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" type="primary"
                    v-if="params.is_virtual_pay || $tools.systemConfig('wx_mp_ban_pay') == 'close' || platform != 'ios'"
                    :text="btnTitle ? btnTitle : '立即支付'" @click="handle"></u-button>
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" v-else type="primary"
                    text="暂不支持支付" disabled></u-button>
                <!-- #endif -->

                <!-- #ifdef MP-TOUTIAO -->
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" type="primary"
                    :text="btnTitle ? btnTitle : '立即支付'" @click="handle"></u-button>
                <!-- #endif -->

                <!-- #ifdef H5 -->
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" type="primary"
                    :text="btnTitle ? btnTitle : '立即支付'" @click="handle"></u-button>
                <!-- #endif -->


            </template>
            <!-- #ifdef MP-TOUTIAO -->
            <u-safe-bottom></u-safe-bottom>
            <!-- #endif -->
        </view>

        <view class="box" v-if="type == 'evaluate'">
            <template>
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" type="primary"
                    :text="btnTitle ? btnTitle : '立即评价'" @click="handle"></u-button>
            </template>
            <!-- #ifdef MP-TOUTIAO -->
            <u-safe-bottom></u-safe-bottom>
            <!-- #endif -->
        </view>

        <view class="box" v-if="type == ''">
            <template>
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" type="primary"
                    :text="btnTitle ? btnTitle : '立即评价'" @click="handle"></u-button>
            </template>
            <!-- #ifdef MP-TOUTIAO -->
            <u-safe-bottom></u-safe-bottom>
            <!-- #endif -->
        </view>
        <!-- #ifndef MP-TOUTIAO -->
        <u-safe-bottom></u-safe-bottom>
        <!-- #endif -->
    </div>
</template>

<script >

var that;
export default {
    data() {
        return {
            platform: ''
        }
    },
    props: {
        btnTitle: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        },
        params: {
            type: Object,
            default: (ret) => {
                return {
                    iscollect: false
                }
            }
        }
    },

    mounted() {
        this.platform = uni.getSystemInfoSync().platform;
    },
    methods: {
        collect() {
            this.$emit('collect', false);
        },
        dir() {
            this.$emit('dir', false);
        },
        share() {
            this.$emit('share', false);
        },
        handle() {
            this.$emit('handle', false);
        },
        comment() {
            this.$emit('comment', false);
        }
    }
}

</script>

<style>
.box {
    position: fixed;
    bottom: 0;
    left: 0;

    width: calc(100%);
    /* height: 50px; */
    /* width: 100%; */

    padding: 10px 10px 10px;

    background-color: #fff;
    box-shadow: 0 0 8px 0 rgb(0 0 0 / 8%);

    display: flex;
    justify-content: space-between;

    align-items: center;

    z-index: 10;

    box-sizing: border-box;

    /*  #ifdef  MP-WEIXIN  */
    /* 微信小程序端：底部安全区按设计加半（iPhone X 约 17px），按钮不直贴屏底、
    也不过高；抖音端已由各 box 内 u-safe-bottom 处理全量安全区，此处不再叠加 */
    padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
    padding-bottom: calc(env(safe-area-inset-bottom) / 2);
    /*  #endif  */
}

.box>div {
    margin: 0 5px;
}

.box .u-button,.box .tz-button {
    margin: 0 5px;
}

.box>div:last-child,
.box>div:first-child {
    /* margin: 0; */
}

.box>div:first-child {
    margin-left: 0;
}

.filler-box {
    width: 100%;
    height: 60px;
    background: none;
}

.price {
    font-weight: 600;
    font-size: 22px;
    color: #f53f3f;

    line-height: 40px;

    width: 400px;
}

.price .total-text {
    font-weight: 400;
    font-size: 14px;
    color: #1D2129;
    
}

.price .unit {
    font-weight: 400;
    font-size: 16px;
    margin-right: 2px;
    margin-left: 4px;
}


.dir-btn {
    width: 100%;
    text-align: center;
    font-size: 12px;

    padding-bottom: 10px;
}


.control-box {
    justify-content: center;
}

.control-btn {
    width: 24%;
    text-align: center;
    font-size: 12px;
    color: #888;
}

.custom-style {
    width: 100%;
}
</style>
