<template>
    <div v-if="course && course.id" :class="['course-box',{'border':bordered ? true : false,selected: course.id == courseId}]" @click="jump(course.id)">

        <!-- <div class="cover">
            <img :src="course.cover" />
        </div> -->
        <div class="data">
            <div :class="[
          'name',
          'one-line-hidden',
          {
            selected: course.id == courseId,
          },
        ]">
                {{course.no}}. {{ course.name }}
            </div>
            <div class="info">
                <span class="type">
                    {{ $t(course.type) }}｜
                </span>
                <span class="views">
                    {{ $tools.timestamp(course.updatetime) }}｜{{
                    course.views
                    }}次浏览
                    <template v-if="is_try">｜<span class="free-tag">试学</span></template>
                </span>
                <span class="more">
                    <!-- <tz-icon name="enter" color="#86909C" :size="16" v-if="subscription" /> -->
                    <tz-icon name="lock" color="#4E5969" :size="20" v-if="!subscription" />
                </span>
            </div>
        </div>
    </div>
</template>

<script>
    var that;
    // #ifdef MP-TOUTIAO
    import i18n from "@/components/language/index.js";
    // #endif
    export default {
        // #ifdef MP-TOUTIAO
        i18n,
        // #endif
        data() {
            return {};
        },
        props: {
            //课程信息
            course: {
                type: [Array, Object],
                default: () => {
                    return {}
                }
            },
            //当前页面的课程
            courseId: {
                type: [String, Number],
                default: "",
            },
            //专栏
            columnId: {
                type: [String, Number],
                default: "",
            },
            // 来源圈子，携带它可在课程详情页展示圈子目录与前后课程导航
            circleId: {
                type: [String, Number],
                default: "",
            },
            //是否订阅
            subscription: {
                type: [Boolean, Number],
                default: false
            },
            //是否订阅
            bordered: {
                type: [Boolean, Number],
                default: false
            },
            //是否免费试看
            is_try: {
                type: [Boolean, Number],
                default: false
            }
        },
        watch: {},
        methods: {
            jump(courseId) {
                if (courseId == this.courseId) {
                    uni.$u.toast("正在浏览该课程");
                    return false;
                }

                var path = "/pages/course/detail/detail?id=" + courseId;
                if (this.columnId) {
                    path += "&column_id=" + this.columnId;
                }
                if (this.circleId) {
                    path += "&circle_id=" + this.circleId;
                }
                this.$nav.to(path, "local");
            }
        },
        onLoad() {
            that = this;
        }
    };
</script>

<style>
    .course-cover {
        width: 40px;
        height: 30px;
    }

    .course-box {
        padding: 15px 15px;
        
        display: flex;
        justify-content: space-between;
        /* justify-content: center;水平主轴居中 */
        align-items: center;
        /* background-color: #ff9; */
        margin: 5px 0;
        /*垂直交叉轴居中*/
        /* border-radius: 10px; */
    }

    .course-box.selected {
        background-color: #E8F3FF;
        border-bottom: none!important;
    }

    .border{
        border-bottom: 1px solid #efefef;
    }

    .course-box:last-child {
        /* padding-bottom: 0px;
        border: none;
        margin-bottom: 0; */
    }

    .course-box .data {
        /* width: calc(100% - 70px); */
        /* padding: 8px; */
        overflow: hidden;
        padding-bottom: 2px;
        width: 100%;
    }

    .course-box .cover {
        height: 40px;
        width: 60px;
        vertical-align: middle;
    }

    .course-box .cover img {
        width: 100%;
        height: 100%;
        border-radius: 5px;
    }

    .course-box .name {
        color: #333;
        font-size: 16px;
        vertical-align: middle;
    }

    .course-box .name.selected {
        color: #165DFF;
    }

    .course-box .info {
        margin-top: 6px;
        font-size: 13px;
    }

    .course-box .info .type {
        font-size: 12px;
        color: #86909c;
        /* font-weight: 500; */
    }

    .course-box .info .views {
        color: #86909c;
        /* margin-left: 10px; */
        font-size: 12px;
    }

    .course-box .info .more {
        float: right;
    }

    .free-tag {
        padding: 1px 4px;
        background: #dae6fc;
        color: #0968f6;
        /* margin-left: 8px; */
        border-radius: 2px;
        font-size: 12px;
    }
</style>
