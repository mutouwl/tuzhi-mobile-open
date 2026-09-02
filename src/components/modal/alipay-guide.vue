<template>
    <u-popup :show="show" mode="bottom" round="16" :safeAreaInsetBottom="true" @close="close">
        <view class="alipay-guide">
            <view class="guide-header">
                <image class="alipay-icon" src="/static/image/alipay.png" mode="aspectFit"></image>
                <view class="title">支付宝支付</view>
            </view>
            <view class="guide-body">
                <view class="desc">请复制链接到浏览器打开完成支付</view>
                <view class="link-box">
                    <text class="link-text" user-select="true">{{ payUrl }}</text>
                </view>
                <view class="btn-row">
                    <button class="btn-copy" @click="copyLink">复制链接</button>
                    <button class="btn-success" @click="paySuccess">付款成功</button>
                </view>
            </view>
            <view class="guide-footer">
                <view class="tip">付款完成后返回此页面刷新查看订单</view>
            </view>
        </view>
    </u-popup>
</template>

<script>
export default {
    name: 'AlipayGuide',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        payUrl: {
            type: String,
            default: ''
        }
    },
    methods: {
        close() {
            this.$emit('close');
        },
        copyLink() {
            if (!this.payUrl) {
                uni.$u.toast('支付链接为空');
                return;
            }
            uni.setClipboardData({
                data: this.payUrl,
                success: () => {
                    uni.$u.toast('链接已复制');
                }
            });
        },
        paySuccess() {
            this.$emit('close');
        }
    }
}
</script>

<style scoped>
.alipay-guide {
    width: 100%;
    background: #fff;
    border-radius: 16px 16px 0 0;
    overflow: hidden;
}

.guide-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 20px 12px;
}

.alipay-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
}

.title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.guide-body {
    padding: 0 20px 16px;
}

.desc {
    font-size: 13px;
    color: #666;
    text-align: center;
    margin-bottom: 16px;
}

.link-box {
    display: flex;
    align-items: center;
    background: #f7f8fa;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
}

.link-text {
    flex: 1;
    font-size: 12px;
    color: #666;
    word-break: break-all;
    line-height: 1.4;
    max-height: 36px;
    -webkit-user-select: text;
    user-select: text;
}

.btn-row {
    display: flex;
    gap: 12px;
}

.btn-copy {
    flex: 1;
    height: 44px;
    line-height: 44px;
    background: #fff;
    color: #1677FF;
    font-size: 15px;
    border-radius: 8px;
    border: none;
    margin: 0;
    padding: 0;
}

.btn-copy::after {
    border: none;
}

.btn-success {
    flex: 1;
    height: 44px;
    line-height: 44px;
    background: #1677FF;
    color: #fff;
    font-size: 15px;
    border-radius: 8px;
    border: none;
    margin: 0;
    padding: 0;
    text-align: center;
}

.btn-success::after {
    border: none;
}

.guide-footer {
    padding: 0 20px 20px;
}

.tip {
    font-size: 12px;
    color: #999;
    text-align: center;
}
</style>
