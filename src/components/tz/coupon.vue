<template>
    <div class="coupon-list" v-if="coupon.length > 0">
        <template v-for="(item, index) in coupon">
            <div class="coupon-box" v-if="index < max_show_num">
                <div class="coupon-text">
                    <div class="price">
                        <span v-if="item.type == 'reduce'">￥ <span class="val">{{ item.amount }}</span></span>
                        <span v-else><span class="val" style="margin-right: 5px;">{{ item.discount }}</span> 折</span>
                        <!-- <div class="range">
                            <span v-if="item.use_time_type == 'days'">{{"领取" +(item.start_days == 0 ? "立即" : item.start_days + "天后") + "生效，有效期" +item.days +"天"}}</span>
                        
                        <template v-else>
                            <div>{{item.use_start_time}}至</div>
                            <div>{{item.use_end_time}}</div>
                        </template>
                        </div> -->
                    </div>
                    <div class="desc">

                        {{
                            !item.enough_status || item.enough == 0
                            ? "无门槛"
                            : "满" + item.enough + "元可用"
                            }}
                        
                        
                    </div>
                </div>
                <div class="get-coupon-btn">

                    <div @click="receive(item.id)" v-if="item.get_status == 'can_get'">
                        {{ item.received ? "继续领" : "点击领取" }}
                    </div>
                    <div v-else>
                        已领完
                    </div>

                </div>
            </div>
        </template>
    </div>
</template>

<script>
    export default {
        components: {},
        data() {
            return {};
        },
        props: {
            coupon: {
                type: [Object, Array],
                default: () => {
                    return [];
                },
            },
            max_show_num: {
                type: [Boolean, Number],
                default: 6,
            },
            source: {
                type: String,
                default: "new",
            },
        },
        computed: {},
        methods: {
            click() {
                if (this.link.type) {
                    this.$nav.to(this.link.src, this.link.type);
                } else {
                    this.$emit("click", false);
                }
            },
            /**
             * 领取优惠券
             */
            receive(id) {
                var that = this;
                uni.showLoading({
                    title: "请稍后",
                });
                this.$api("app.coupon.receive", {
                    id: id,
                })
                    .then((res) => {
                        uni.hideLoading();
                        if (res.code == 1) {
                            that.$emit("refresh", false);
                        }

                        uni.$u.toast(res.msg);
                    });
            }
        },
        watch: {},
        mounted() { },
    };
</script>
<style>
    .coupon-list {
        width: 100%;
        box-sizing: border-box;
    }

    .coupon-box {
        width: 100%;
        height: 72px;
        padding: 0 12px;
        box-sizing: border-box;
        display: flex;
        overflow: hidden;
        white-space: nowrap;
        background-image: url(/static/image/coupon-bg.png);
        background-size: 100% 100%;
        margin-top: 12px;
        color: #ff882d;
        display: flex;
        -webkit-justify-content: space-between;
        justify-content: space-between;
        align-items: center;
        vertical-align: middle;
    }

    .coupon-box:first-child {
        margin-top: 0;
    }

    .coupon-box .coupon-text {
        height: 100%;
        width: 70%;
        padding: 0 0 0 10px;
        box-sizing: border-box;
        display: -webkit-flex;
        display: flex;
        -webkit-align-items: center;
        align-items: center;
        -webkit-justify-content: space-between;
        justify-content: space-between;
        padding: 0 12px;
    }

    .coupon-box .coupon-text .price {
        width: auto;
        padding-top: 0;
    }

    .coupon-box .coupon-text .price span {
        display: inline-block;
        text-align: center;
        font-size: 12px;
        line-height: 28px;
    }

    .coupon-box .coupon-text .price .val {
        font-size: 22px;
        font-weight: 600;
    }

    .coupon-box .coupon-text .range {
        margin-top: 2px;
        font-size: 12px;
        text-align: left;
    }

    .coupon-box .coupon-text .desc {
        font-size: 12px;
        font-weight: 400;
        color: #ff781f;
    }

    .coupon-box .get-coupon-btn {
        width: 26%;
        font-size: 14px;
        font-weight: 500;
        color: #ff781f;
        text-align: center;
    }
</style>