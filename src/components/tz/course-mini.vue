<template>
    <div :class="[
        'course-list-box',
        'single'
    ]">
        <div :class="[
            'course-item-box',
            {
                'course-item-box-round': round,
                'course-item-box-border': border,
            }
        ]" :style="{
    'margin-bottom': margin + 'px'
}" v-for="(item, index) in list" :key="index" @click="detail(item.id, item.type)">
            <div :class="[
                'cover',
                {
                    'course-item-box-round': round
                }
            ]" :style="{
                'background-image': 'url(' + item.cover + ')',
                'background-size': '100% 100%'
            }">
            <div class="vip-tag" v-if="item.is_vip_goods"><span class="vip-tag-text">会员商品</span></div>
                <div class="type">
                    <span>{{ $t(item.type) }}</span>
                </div>
            </div>
            <div class="info">
                <div :class="[
                    'title',
                    'two-line-hidden'
                ]">
                    {{ item.name }}
                </div>
                <div class="price">
                    <template v-if="item.pay_type">
                        <template v-if="item.pay_type == 'free'">
                            <span class="unit">免费</span>
                        </template>
                        <template v-if="item.pay_type == 'student'">
                            <span class="unit">指定学员</span>
                        </template>
                        <template v-if="item.pay_type == 'bind_course'">
                            <span class="unit">绑定课程</span>
                        </template>
                        <template v-if="item.pay_type == 'password'">
                            <span class="unit">密码兑换</span>
                        </template>
                        <template v-if="item.pay_type == 'pay'">
                            <template v-if="isVirtualPay(item)">
                                <span class="price-value">{{ item.price }}</span><span class="coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
                            </template>
                            <template v-else>
                            <span class="unit">¥ </span> {{ item.price }}
                            <span class="marking" v-if="item.price_marking">¥{{ item.price_marking }}</span>
                            </template>
                        </template>
                    </template>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    data() {
        return {
        }
    },
    props: {
        list: {
            type: [Object, Array],
            default: () => {
                return [];
            }

        },
        //是否有圆角
        round: {
            type: [Boolean, Number],
            default: false
        },

        //单列 双列
        type: {
            type: String,
            default: 'single'
        },
        border: {
            type: [Boolean, Number],
            default: false
        },
        //间距
        margin: {
            type: Number,
            default: 10
        }
    },
    methods: {
        detail(id, type) {
            this.$nav.to(this.$nav.getPagePath(id, type));
        },
        isVirtualPay(item) {
            return Number(item && item.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
        }
    },

    watch: {
    }
}
</script>
<style>
.course-list-box.single .course-item-box {
    width: 100%;
    height: 80px;
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    margin-bottom: 10px;
    overflow: hidden;
    box-sizing: border-box;
}


.course-list-box.single .course-item-box .info {
    width: calc(100% - 110px);
    padding: 6px 8px;
    overflow: hidden;
    position: relative;
}


.course-list-box.single .course-item-box .cover {
    height: 100%;
    width: 140px;
    position: relative;
}

.course-list-box.single .course-item-box .info .price {
    position: absolute;
    bottom: 4px;
    left: 8px;
    font-weight: 700;
    font-size: 14px;
    color: #F53F3F;
}

.course-list-box.single .course-item-box .info .price .price-value {
    font-size: 14px;
    font-weight: 700;
}

.course-list-box.single .course-item-box .info .price .coin-name {
    font-size: 10px;
    font-weight: 500;
    margin-left: 2px;
}



.course-item-box-round {
    border-radius: 10px;
}

.course-item-box-border {
    border: 1px solid #F0F3F5;
}

.course-item-box:last-child {
    margin-bottom: 0;
}


.course-item-box .info .title {
    color: #1D2129;
    font-size: 14px;
    font-weight: 500;
}


.course-item-box .info .price .unit,
.course-item-box .info .price .marking {
    font-size: 12px;
}

.course-item-box .info .price .marking {
    color: #C9CDD4;
    font-weight: 400;
    margin-left: 10px;
    text-decoration: line-through;
}


.course-item-box .cover .type {
    position: absolute;
    bottom: 4px;
    right: 4px;
    height: 20px;
    border-radius: 0.08rem;
    padding: 0px 6px;
    box-sizing: border-box;
    line-height: 18px;
    background: rgba(0, 0, 0, .05);
    border-radius: 4px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
}

.course-item-box .cover .type span {
    color: #fff;
    font-weight: 400;
    font-size: 10px;
}


  .vip-tag{
    position: absolute;
    top: 0;
    left: 0;
    display: -webkit-flex;
    display: flex;
    padding: 2px 4px;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-align-items: center;
    align-items: center;
    background: linear-gradient(275deg, #F2C89F 1.39%, #F9E5DB 100%);
    border-radius: 0 0 4px;
    z-index: 1;
}
.vip-tag .vip-tag-text{
    color: #66351f;
    font-size: 10px;
    font-weight: 600;
    line-height: 12px;
}
</style>

