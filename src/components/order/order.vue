<template>
    <div class="order-box">
        <!-- 订单卡直角（2026-10-28 用户点名「去掉box圆角」）：卡级不再写圆角，M21 页面卡本是直角档；
             内衬与白底仍由 tz-box 给，只撤掉 radius 与那一条为圆角服务的 overflow -->
        <tz-box padding="10px 10px">
            <div class="order-header" @click="detail(orderNo)">
                <div class="order-no">
                    <span>
                        订单号 {{orderNo}}</span>
                </div>
                <div class="order-status">
                    <!-- 头行只放「订单号 + 状态词」两样（2026-10-29 用户点名）：拼团状态标原先挤在这一格，
                         把订单号与状态词一起压成两行 ⇒ 列表卡不再挂任何业务态标签；
                         拼团档位（待成团/已成团/已退款）在订单详情那块「拼团状态」里看 -->
                    <!-- 订单状态词：拼团挂起单后端下 `status_text='待成交'`（底层 status 仍是 paid），
                         普通单为空串 ⇒ 回落到 `status.<code>` 词条，界面逐字不变 -->
                    {{ statusText || $t('status.'+ status) }}
                </div>
            </div>
            <div class="order-body" @click="detail(orderNo)">
                <slot></slot>
                <!-- 块间只留一条间隔条（2026-10-30 用户口径「这个最多只能出现一个相邻」）：虚线那行早就注释掉，
                     原先围着它的 4px 那条已没有对象可围，与下面 10px 那条并排就是两条相连的 divider -->
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
                    <!-- 积分兑换单（2026-11-09）：现金实付恒 0，合计这一格画积分（`score_amount`） -->
                    <span class="price coin-price" v-if="scoreMode">
                        {{ price }} 积分
                    </span>
                    <span class="price" v-else-if="!isVirtualPay">
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
            },
            /** 订单状态展示词（2026-10-28）：拼团挂起单后端下「待成交」，其余单为空串走 i18n 词条 */
            statusText: {
                type: String,
                default: ''
            },
            /**
             * 积分兑换单（2026-11-09）：`price` 这一格记的是**积分**（后端把现金实付归零、改记
             * `score_amount`）⇒ 合计画「N 积分」、不挂 ¥。缺省 false 时其余调用点逐字不变。
             */
            scoreMode: {
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
        /* 头行永远一行（2026-10-29 用户点名「订单号和订单状态被挤压发生换行」）：
           宽的那一格自己收，状态词那格不参与收缩 —— 换行只由这一处判，不靠标签在不在 */
        flex-wrap: nowrap;
        white-space: nowrap;
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
        /* 订单号是这一行里可让位的那一格：极窄机型上收成省略号，也不许把状态词挤到第二行 */
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
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
        /* 状态词不参与收缩：它只有 2~3 个字，被压窄就会折行 */
        flex: none;
        margin-left: 10px;
        /* font-weight: bold; */
    }

    /* 拼团状态标（M-P7）只在订单详情页那一块「拼团状态」里出现；
       列表订单卡这一份已按 2026-10-29 用户点名撤掉（会挤压头行的订单号与状态词）——
       这里不留 .order-gb-tag 的任何声明，留一条就会有人把它接回来 */
</style>