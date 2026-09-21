<template>
    
        <div :class="[
            'course-item-box',
            {
                'course-item-box-round': round,
                'course-item-box-border': border,
            }
        ]" :style="{
    'margin-bottom': margin + 'px'
}" @click="$nav.to('/pages/course/detail/detail?id='+itemId+'&type=score', 'local')">
            <div class="cover" :style="{
                'background-image': 'url(' + cover + ')',
                'background-size': '100% 100%'
            }">
                <div class="type">
                    <span>{{ $t(type) }}</span>
                </div>
            </div>
            <div class="info">
                <div :class="[
                    'title',
                    'two-line-hidden'
                    ]">
                    {{ name }}
                </div>
                <div class="price">
                    <span class="marking" v-if="price_marking > 0"> ¥{{ price_marking }}</span>
                    <span class="marking" v-else> </span>
                            <span><span class="unit">积分 </span> {{ score }}</span>

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

        itemId:{
            type: [String, Number],
            default: ''
        },
        name:{
            type: [String, Number],
            default: ''
        },
        type:{
            type: [String, Number],
            default: ''
        },
        cover:{
            type: [String, Number],
            default: ''
        },
        score:{
            type: [String, Number],
            default: ''
        },
        price_marking:{
            type: [String, Number],
            default: ''
        },
        //是否有圆角
        round: {
            type: [Boolean, Number],
            default: true
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
    methods: {},
    watch: {
    },
    mounted() {
    }
}
</script>
<style>
.course-item-box {
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    margin-bottom: 10px;
    overflow: hidden;
    box-sizing: border-box;
}


.course-item-box .info {
    width: calc(100% - 160px);
    padding: 8px;
    overflow: hidden;
    position: relative;
}


.course-item-box .cover {
    height: 100%;
    width: 160px;
    position: relative;
}

.course-item-box .info .price {
    position: absolute;
    bottom: 4px;
    left: 8px;
    font-weight: 700;
    font-size: 18px;
    color:#0968f6;
    width: calc(100% - 16px);
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    color: #1D2129;
    font-size: 16px;
    font-weight: 500;
}

.course-item-box .info .subtitle {
    color: #86909C;
    font-size: 14px;
    margin-top: 8px;
}



.course-item-box .info .price .unit,
.course-item-box .info .price .marking {
    font-size: 12px;
    margin-right: 4px;
}

.course-item-box .info .price .marking {
    color: #C9CDD4;
    font-weight: 400;
    margin-right: 10px;
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
    background: rgba(0, 0, 0, .25);
    border-radius: 4px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
}

.course-item-box .cover .type span {
    color: #fff;
    font-size: 12px;
}
</style>

