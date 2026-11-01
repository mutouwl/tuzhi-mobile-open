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
            <div class="cover">
                <!-- 封面走 `<image>`：背景图没有「加载失败」这一档（2026-10-29 口径 M65）-->
                <image class="score-cover-img" :src="coverSrc" mode="scaleToFill" @error="onCoverError" />
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
import { mpKey } from '@/common/utils/mp-data-key.js';
export default {
// #ifdef MP-TOUTIAO
    i18n,
    // #endif
    components: {},
    data() {
        return {
            // 封面加载失败标记（键 = mpKey(地址)）与全站默认商品图（2026-10-29，口径 M65）
            coverErrors: {},
            defaultCover: '/static/image/default-goods.jpg'
        }
    },
    computed: {
        /** 封面真正摆出去的那一张：地址为空或加载失败都换默认商品图 */
        coverSrc() {
            const url = String(this.cover || '');
            if (!url) { return this.defaultCover; }
            return this.coverErrors[mpKey(url)] ? this.defaultCover : url;
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
    methods: {
        /** 图片 `@error` 回调会写到 data 上，入口先过「已销毁」闸门（M26②） */
        gone() {
            return this._isDestroyed === true || this._isBeingDestroyed === true;
        },
        /** 封面取不到（地址为空或加载失败）：记下这一张并让模板换默认商品图（M65） */
        onCoverError() {
            if (this.gone()) { return; }
            const url = String(this.cover || '');
            if (url) { this.$set(this.coverErrors, mpKey(url), true); }
        }
    },
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

/* 封面图（2026-10-29，口径 M65）：铺满 `.cover` 的盒子，几何与原来那张
   `background-size:100% 100%` 一致；圆角继承容器，换写法不改视觉，只为拿到 `@error` */
.course-item-box .cover .score-cover-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
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

