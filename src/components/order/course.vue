<template>
    <div :class="[
        'course-item-box',
        {
            'course-item-box-round': round,
            'course-item-box-border': border,
        }
    ]" :style="{ 'margin-bottom': margin + 'px' }" @click="courseHandle">
        <div class="cover" :style="{
            'background-image': 'url(' + cover + ')',
            'background-size': '100% 100%'
        }">

        <img :src="cover" :alt="name">
            <div class="type">
                <span>{{ $t(type) }}</span>
            </div>
        </div>
        <div class="info">
            <div :class="[
                'title',
            ]">
                <span class="one-line-hidden">{{ name }}</span>
                <!-- <span class="go-study" v-if="more && type != 'live_gift'"><tz-icon name="enter" @click="cancel(itemId, index)" size="16" color="#86909C"/></span> -->
            </div>
            <div class="subtitle two-line-hidden">
                {{ sku }}
            </div>
            <div class="footer">
                <div class="price">
                    <span class="unit" v-if="!isVirtualPay">¥ </span> {{ price }}<span class="unit" v-if="isVirtualPay">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
                </div>

                <div class="num">
                    <span class="marking">x{{ count }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// #ifdef MP-TOUTIAO
import i18n from '@/components/language/index.js';
// #endif
export default {
// #ifdef MP-TOUTIAO
    i18n,
    // #endif
    components: {},
    data() {
        return {
        }
    },
    props: {
        data: {
            type: [Object, Array],
            default: () => {
                return [];
            }
        },

        sku: {
            type: [String, Number],
            default: ''
        },
        cover: {
            type: [String],
            default: ''
        },
        count: {
            type: [String, Number],
            default: 1
        },
        name: {
            type: [String, Number],
            default: ''
        },
        sku: {
            type: [String, Number],
            default: ''
        },
        itemId: {
            type: [String, Number],
            default: ''
        },
        price: {
            type: [String, Number],
            default: ''
        },
        isVirtualPay: {
            type: Boolean,
            default: false
        },
        //是否有圆角
        round: {
            type: Boolean,
            default: false
        },

        //是否显示去学习
        more: {
            type: Boolean,
            default: false
        },
        can_use: {
            type: Boolean,
            default: true
        },

        //单列 双列
        type: {
            type: String,
            default: 'single'
        },
        border: {
            type: Boolean,
            default: false
        },
        //间距
        margin: {
            type: Number,
            default: 0
        }
    },
    methods: {
        courseHandle() {

            console.log("this.can_use",this.can_use)
            if(!this.can_use){
                return false;
            }

            switch (this.type) {
                case 'goods':
                    this.$nav.to(this.itemId, 'course')
                    break;
                case 'article':
                    this.$nav.to(this.itemId, 'course')
                    break;
                case 'column':
                    this.$nav.to(this.itemId, 'course')
                    break;
                case 'video':
                    this.$nav.to(this.itemId, 'course')
                    break;
                case 'audio':
                    this.$nav.to(this.itemId, 'course')
                    break;
                case 'activity':
                    this.$nav.to(this.itemId, 'activity')
                    break;
                case 'video':
                    this.$nav.to(this.itemId, 'course')
                    break;
                case 'score':
                    this.$nav.to(this.itemId, 'course')
                    break;
                case 'physical':
                    this.$nav.to(this.itemId, 'physical')
                    break;
                case 'composite':
                    this.$nav.to('/pages/app/composite/detail/detail?id=' + this.itemId, 'local')
                    break;
                case 'vipcard':
                    this.$nav.to('/pages/app/vip/center/center', 'local')
                    break;
                case 'exercises':
                    this.$nav.to('/pages/app/exam/detail/detail?id=' + this.itemId, 'local')
                    break;
                case 'circle':
                    this.$nav.to('/pages/app/circle/presale/presale?id=' + this.itemId, 'local')
                    break;

                default:
                    break;
            }
        }
    },
    watch: {
    },
    mounted() {
    }
}
</script>
<style scoped>
.course-item-box {
    width: 100%;
    height: 80px;
    display: flex;
    justify-content: space-between;
    /* background-color: #fff; */
    margin: 10px 0;
    overflow: hidden;
    
}


.course-item-box .info {
    width: 71%;
    padding: 5px 5px;
    overflow: hidden;
    position: relative;
}


.course-item-box .cover {
    height: 100%;
    width: 28%;
    padding: 0px;
    position: relative;
    border-radius: 6px;
    overflow: hidden;
}


.course-item-box .cover  img{
    width: 100%;
    height: 100%;
    object-fit: contain;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 6px;
    overflow: hidden;

}



.course-item-box-round {
    border-radius: 10px;
}

.course-item-box-border {
    border: 1px solid #efefef;
}

.course-item-box:last-child {
    margin-bottom: 0;
}


.course-item-box .info .title {
    color: #1d2129;
    font-size: 16px;
    
    display: flex;
    align-items: start;
    justify-content: space-between;
}

.course-item-box .info .subtitle {
    color: #86909C;
    font-size: 12px;
    margin-top: 6px;
    line-height: 15px;
}


.course-item-box .info .footer {
    margin-top: 14px;
    bottom: 0;
    width: 94%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    /* right: 3%;
    left: 3%; */
}

.course-item-box .info .footer .price {
    /* font-weight: 600; */
    font-size: 14px;
    color: #86909c;

}
.course-item-box .info .price .unit{
    margin-right: 2px;
}
.course-item-box .info .price .unit,
.course-item-box .info .price .marking {
    font-size: 12px;
}

.course-item-box .info .num {
    color: #86909C;
    font-size: 14px;
    font-weight: normal;
}


.course-item-box .cover .type {
    position: absolute;
    bottom: 6px;
    right: 3px;
    height: 18px;
    border-radius: 5px;
    padding: 0px 6px;
    box-sizing: border-box;
    line-height: 14px;
    background: rgba(0, 0, 0, .25);
    border-radius: 4px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
}

.course-item-box .cover .type span {
    color: #fff;
    font-weight: 500;
    font-size: 10px;
}

.go-study{
    width: 40px;
    font-size: 12px;
    text-align: right;
}
</style>
