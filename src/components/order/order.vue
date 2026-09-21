<template>
    <div class="order-box">
        <tz-box padding="10px 10px" style="border-radius: 10px;overflow: hidden;">
            <div class="order-header" @click="detail(orderNo)">
                <div class="order-no">
                    <span>
                        订单号 {{orderNo}}</span>
                </div>
                <div class="order-status">
                    {{ $t('status.'+ status) }}
                </div>
            </div>
            <div class="order-body" @click="detail(orderNo)">
                <slot></slot>
                <tz-divider bgColor="#fff" height="4" />
                <!-- <u-line dashed></u-line> -->
                <!-- <tz-divider bgColor="#fff" height="4" />
                <div class="total-box">
                    应付款：
                    <span class="price">
                        <span class="unit">¥</span>
                        {{ price }}
                    </span>
                </div> -->
                <tz-divider bgColor="#fff" />

            </div>
            <div class="order-footer">
                <div class="total-box">
                    合计:
                    <span class="price" v-if="!isVirtualPay">
                        <span class="unit">¥</span>
                        {{ price }}
                    </span>
                    <span class="price coin-price" v-else>
                        {{ price }} {{ $tools.systemConfig('coin_name') || '金币' }}
                    </span>
                </div>
            </div>
            <div class="btns-box">
                <template v-for="(item,index) in controll">
                    <tz-button :key="index" v-if="item" size="small" :text="$t('controll.' + index)" style="margin-left: 10px" @click="controller(orderIndex,index,orderNo)"></tz-button>
                </template>
            </div>
        </tz-box>


    </div>
</template>

<script>
    // #ifdef MP-TOUTIAO
    import i18n from '@/components/language/index.js';
    // #endif
    import course from '@/components/order/course.vue';
    export default {
        // #ifdef MP-TOUTIAO
        i18n,
        // #endif
        components: { course },
        data() {
            return {
            }
        },
        props: {
            orderIndex: {
                type: [Number, String],
                default: 0
            },
            orderNo: {
                type: [Number, String],
                default: 0
            },
            status: {
                type: [Number, String],
                default: 0
            },
            price: {
                type: [Number, String],
                default: 0
            },
            controll: {
                type: [Array, Object],
                default: []
            },
            isVirtualPay: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            detail(orderNo) {
                this.$nav.to('/pages/order/detail/detail?order_no=' + orderNo)
            },
            controller(orderIndex, type, orderNo) {
                this.$emit('handle', orderIndex, type, orderNo);
            }
        },
        watch: {
        },
        mounted() {
        }
    }
</script>
<style>
    .order-box {
        padding: 10px 10px 5px;
        box-sizing: border-box;
    
    }

    .total-box {
        text-align: right;
        color: #4E5969;
        font-size: 13px;
    }

    .total-box .price {
        color: #f53f3f;
        font-weight: 700;
        font-size: 16px;
        margin-left: 4px;
    }

    .total-box .unit {
        font-size: 13px;
        margin-right: 2px;
    }

    .total-box .coin-price {
        color: #0968f6;
        font-weight: 700;
        font-size: 16px;
        margin-left: 4px;
    }

    .order-header {
        display: flex;
        justify-content: space-between;
        height: 30px;
        line-height: 30px;
        margin-bottom: 5px;
    }

    .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .btns-box {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex-wrap: nowrap;
        margin-top: 10px;
    }

    .order-footer .order-btn {
        margin: 0px 3px;
        padding: 4px 15px;
        font-size: 14px;
        color: #4E5969;
        margin-left: 5px;
        background-color: #f5f5f5 !important;
        border-radius: 4px;
    }

    .order-footer .order-btn:last-child {
        margin-right: 0px;
    }

    .order-footer .order-btn:first-child {
        margin-left: 0px;
    }

    .order-no {
        color: #1D2129;
        /* font-weight: bold; */
        /* font-weight: bold; */
    }

    .order-status,
    .order-no {
        font-size: 14px;
        /* font-weight: 500; */
    }

    .order-status {
        color: #4E5969;
        /* font-weight: bold; */
    }
</style>