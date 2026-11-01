<template>
    <div class="course-list">
        <div :class="['course-item-box']" v-for="(item, index) in list" @click="$nav.to(item.course.id, 'course')">
            <div class="cover">
                <!-- 封面走 `<image>`：背景图没有「加载失败」这一档（2026-10-29 口径 M65）-->
                <image class="study-cover-img" :src="coverOf(item)" mode="scaleToFill"
                    @error="onCoverError(item)" />
                <div class="type">
                    <span>{{ $t(item.course.type) }}</span>
                </div>
            </div>
            <div class="info">
                <div :class="[
                    'title',
                    'one-line-hidden'
                ]">
                    {{ item.course.name }}
                </div>

                <div class="time">
                    <div>学习次数：<span class="time-value"> {{item.count}}</span> 次</div>
                    <div>学习用时：<span class="time-value">{{$tools.formatStudyTime(item.total_time)}}</span></div>
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
    props: {
        list: {
            type: [Array, Object],
            default: () => {
                return [];
            }
        }
    },
    methods: {
        /** 图片 `@error` 回调会写到 data 上，入口先过「已销毁」闸门（M26②） */
        gone() {
            return this._isDestroyed === true || this._isBeingDestroyed === true;
        },
        /** 封面真正摆出去的那一张：地址为空或加载失败都换默认商品图（M65）。
         *  失败表按 mpKey(地址) 查——模板看不到模块级 import，所以走方法（M27） */
        coverOf(item) {
            const url = String(((item || {}).course || {}).cover || '');
            if (!url) { return this.defaultCover; }
            return this.coverErrors[mpKey(url)] ? this.defaultCover : url;
        },
        /** 封面加载失败：记下这一张（写点同样过 mpKey） */
        onCoverError(item) {
            if (this.gone()) { return; }
            const url = String(((item || {}).course || {}).cover || '');
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
    height: 80px;
    display: flex;
    justify-content: space-between;
    /* background-color: #fff; */
    margin-bottom: 14px;
    overflow: hidden;
    padding-bottom: 14px;
    border-bottom: 1px solid #efefef;
}


.course-list .course-item-box:last-child{
    border-bottom: none;
    padding-bottom: 0px;
    margin-bottom: 0px;
}

.course-item-box .info {
    width: calc(100% - 130px);
    overflow: hidden;
    position: relative;
}


.course-item-box .cover {
    height: 100%;
    width: 120px;
    border-radius: 5px;
    position: relative;
}

/* 封面图（2026-10-29，口径 M65）：铺满 `.cover` 的盒子，几何与原来那张
   `background-size:100% 100%` 一致；圆角继承容器，换写法不改视觉，只为拿到 `@error` */
.course-item-box .cover .study-cover-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
}

.course-item-box .info .time {
    position: absolute;
    bottom: 0px;
    font-size: 12px;
    color: #86909C;
    /* text-align: right; */
}

.course-item-box .info .time div {
    margin-top: 2px;
}

.time-value {
    /* color: #4E5969;
    font-weight: 600;
    font-size: 13px;
    margin-left: 4px;
    margin-right: 4px; */
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
    font-size: 14px;
    /* font-weight: 600; */
}

.course-item-box .info .subtitle {
    color: #86909C;
    font-size: 12px;
    margin-top: 8px;
}



.course-item-box .info .time .unit,
.course-item-box .info .time .marking {
    font-size: 14px;
}


.course-item-box .cover .type {
    position: absolute;
    bottom: 4px;
    right: 4px;
    height: 20px;
    padding: 0px 4px;
    box-sizing: border-box;
    line-height: 18px;
    background: rgba(0, 0, 0, .25);
    border-radius: 4px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
}

.course-item-box .cover .type span {
    color: #fff;
    font-size: 10px;
}
</style>

