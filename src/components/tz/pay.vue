<template>
    <view>
        <u-popup :show="isShow" mode="bottom" :round="10" :closeable="true" @close="closeModal" :safeAreaInsetBottom="false">
            <view class="pay-popup">
                <u-empty icon="/static/image/error.png" width="70" height="70" text="虚拟商品订单需在小程序中支付，请重新创建订单" v-if="showVirtualPayTip"></u-empty>
                <template v-else>
                    <view class="pay-amount">
                        <text class="amount-label">付款金额</text>
                        <view class="amount-value">
                            <text class="currency" v-if="!isVirtualPay">¥</text>
                            <text class="amount">{{ money }}</text>
                            <text class="currency" v-if="isVirtualPay">{{ $tools.systemConfig('coin_name') || '金币' }}</text>
                        </view>
                    </view>
                    
                    <view class="pay-type-list">
                        <view 
                            class="pay-type-item" 
                            v-for="(item, index) in payTypes" 
                            :key="index"
                            @tap="selectPayType(index)"
                        >
                            <view class="pay-type-left">
                                <image v-if="item.type === 'wechat'" src="/static/image/weixin.png" class="pay-icon"></image>
                                <image v-else-if="item.type === 'alipay'" src="/static/image/alipay.png" class="pay-icon"></image>
                                <image v-else-if="item.type === 'balance'" src="/static/image/exchange.png" class="pay-icon"></image>
                                <image v-else src="/static/image/wallet.png" class="pay-icon"></image>
                                <view class="pay-name-box">
                                    <text class="pay-name">{{ item.name }}</text>
                                    <text v-if="item.subname" class="balance-text">{{ item.subname }}</text>
                                </view>
                            </view>
                            <view class="pay-type-right">
                                <view class="radio-circle" :class="{ 'radio-checked': payChecked === index }">
                                    <u-icon v-if="payChecked === index" name="checkmark" color="#fff" size="12"></u-icon>
                                </view>
                            </view>
                        </view>
                    </view>
                    
                    <view class="pay-btn-box">
                        <button class="pay-btn" @tap="confirmPay">立即支付</button>
                    </view>
                </template>
            </view>
        </u-popup>
        <alipay-guide :show="showAlipayGuide" :payUrl="alipayPayUrl" @close="closeAlipayGuide"></alipay-guide>
    </view>
</template>
<script>
var that;
import PayHandle from '@/common/utils/pay.js';
import AlipayGuide from '@/components/modal/alipay-guide.vue';
export default {
    components: {
        AlipayGuide
    },
    computed: {
        isWxMiniProgram() {
            return uni.getStorageSync('platform') === 'wxMiniProgram';
        },
        showVirtualPayTip() {
            return this.isVirtualPay && !this.isWxMiniProgram;
        }
    },
    data() {
        return {
            isShow:false,
            payTypes: [],
            payChecked: 0,
            show: false,
            modal: {
                payType: false
            },
            showAlipayGuide: false,
            alipayPayUrl: '',
            isAlipayProcessing: false
        }
    },
    watch:{
        visible(val){
            this.isShow = val
            if(val){
                this.getPayType()
            }
        }
    },
    props: {
        visible:{
            type:Boolean,
            default:false
        },
        orderNo:{
            type:String,
            default:''
        },
        money: {
            type: [String, Number],
            default: '0.00'
        },
        balance: {
            type: [String, Number],
            default: undefined
        },
        isVirtualPay: {
            type: Boolean,
            default: false
        },
        goOrder:{
            type:Boolean,
            default:true
        }
    },
    methods: {
        closeModal(){
            if (this.showAlipayGuide) {
                return;
            }
            this.$emit('close', false);
            this.$emit('update:visible', false);
        },
        getPayType() {
            that.$api('pay.getPayType', {}).then(res => {
                if (res.code === 1) {
                    let payTypes = res.data || [];
                    if (that.isVirtualPay) {
                        payTypes = payTypes.filter(item => item.type !== 'balance');
                    }
                    that.payTypes = payTypes;
                    if (that.payTypes.length > 0) {
                        that.payChecked = 0;
                    }
                }
            });
        },
        showModal(type) {
            that.modal[type] = !that.modal[type];
        },
        selectPayType(index) {
            this.payChecked = index;
        },
        confirmPay() {
            if (that.payTypes.length === 0) {
                uni.showToast({
                    title: '暂无可用支付方式',
                    icon: 'none'
                });
                return;
            }
            
            const option = that.payTypes[that.payChecked];
            that.isAlipayProcessing = option.type === 'alipay';
            new PayHandle(option.type, that.orderNo, function(payType, result){
                if (payType === 'alipay_wechat') {
                    that.alipayPayUrl = result.pay_url;
                    that.showAlipayGuide = true;
                    that.isAlipayProcessing = false;
                    return;
                }
                if (that.isAlipayProcessing) {
                    return;
                }
                that.$emit('handle', payType, result);
                that.closeModal();
            }, that.goOrder);
        },
        closeAlipayGuide() {
            this.showAlipayGuide = false;
            this.isShow = false;
            this.$emit('update:visible', false);
            this.$emit('alipay-guide-close');
        }
    },
    mounted() {
        that = this
        that.getPayType()
    }
};
</script>

<style scoped>
.pay-popup {
    background-color: #f5f5f5;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    overflow: hidden;
}

.pay-amount {
    text-align: center;
    padding: 20px 0 30px;
}

.amount-label {
    display: block;
    font-size: 12px;
    color: #666;
    margin-bottom: 10px;
}

.amount-value {
    display: flex;
    align-items: baseline;
    justify-content: center;
}

.pay-amount .currency {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.pay-amount .amount {
    font-size: 32px;
    font-weight: bold;
    color: #333;
}

.pay-type-list {
    background-color: #fff;
    padding: 10px 20px;
    border-radius: 8px;
    margin: 0 20px 20px;
}

.pay-type-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid #f5f5f5;
}

.pay-type-item:last-child {
    border-bottom: none;
}

.pay-type-left {
    display: flex;
    align-items: center;
}

.pay-icon {
    width: 28px;
    height: 28px;
    margin-right: 12px;
}

.pay-name-box {
    display: flex;
    flex-direction: column;
}

.pay-name {
    font-size: 15px;
    color: #333;
}

.balance-text {
    font-size: 12px;
    color: #999;
    margin-top: 2px;
}

.pay-type-right {
    display: flex;
    align-items: center;
}

.radio-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
}

.radio-checked {
    background-color: #0968f6;
    border-color: #0968f6;
}

.pay-btn-box {
    padding: 0 20px 20px;
}

.pay-btn {
    width: 100%;
    height: 44px;
    line-height: 44px;
    background: #0968f6;
    color: #fff;
    font-size: 16px;
    border-radius: 8px;
    border: none;
}

.pay-btn::after {
    border: none;
}
</style>
