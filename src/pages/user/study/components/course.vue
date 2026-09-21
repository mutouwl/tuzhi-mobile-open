<template>
    <div class="course-list">
        <div :class="['course-item-box']" v-for="(item, index) in list" @click="$nav.to(item.course.id, 'course')">
            <div class="cover" :style="{
                    'background-image': 'url(' + item.course.cover + ')',
                    'background-size': '100% 100%'
                }">
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
        list: {
            type: [Array, Object],
            default: () => {
                return [];
            }
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

