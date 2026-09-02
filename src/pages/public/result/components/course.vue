<template>
    <div class="dir-box" v-if="list.length > 0 || subscription">
        <div :class="['course-box']" v-for="(item, index) in list" :key="index"
            @click="jump(item.snapshoot.id, item.snapshoot.type)">
            <div class="cover">
                <img :src="item.snapshoot.cover" />
            </div>
            <div class="data">
                <div :class="['name', 'one-line-hidden']">
                    {{ item.snapshoot.name }}
                </div>
                <div class="info">
                    <span class="type">
                        {{ $t(item.snapshoot.type) }}
                    </span>

                    <span class="views">
                        <span v-if="item.snapshoot.updatetime">{{
                            $tools.timestamp(item.snapshoot.updatetime)
                            }}</span><span v-if="item.snapshoot.views">｜{{ item.snapshoot.views }}次浏览</span>
                    </span>
                </div>
            </div>
            <span class="more">
                <tz-icon name="enter" color="#86909C" :size="16" />
            </span>
        </div>
        
    </div>
</template>

<script>
    // #ifdef MP-TOUTIAO
    import i18n from "@/components/language/index.js";
    // #endif
    export default {
        // #ifdef MP-TOUTIAO
        i18n,
        // #endif
        components: {},
        data() {
            return {};
        },
        props: {
            list: {
                type: [Array, Object],
                default: () => {
                    return [];
                },
            },
        },
        methods: {
            jump(id, type) {
                switch (type) {
                    case "vipcard":
                        this.$nav.to("/pages/app/vip/center/center", "local", "redirectTo");
                        break;
                    case "exercises":
                        this.$nav.to("/pages/app/exam/detail/detail?id=" + id, "local", "redirectTo");
                        break;
                    case "composite":
                        this.$nav.to("/pages/app/composite/detail/detail?id=" + id, "local", "redirectTo");
                        break;
                    case "circle":
                        this.$nav.to("/pages/app/circle/presale/presale?id=" + id, "local", "redirectTo");
                        break;

                    default:
                        this.$nav.to(id, "course", "redirectTo");
                        break;
                }
            },
        },
        watch: {},
        mounted() { },
    };
</script>
<style>
    .course-cover {
        width: 40px;
        height: 30px;
    }

    ::v-deep .u-cell__body {
        background: #f6f6f6 !important;
    }

    .course-box {
        padding: 10px 10px;
        margin-bottom: 10px;
        /* border-bottom: 1px solid #efefef; */
        background-color: #fff;
        border-radius: 6px;
        display: flex;
        justify-content: space-between;
        /* justify-content: center;水平主轴居中 */
        align-items: center;
        /*垂直交叉轴居中*/
    }

    .course-box:last-child {
        /* padding-bottom: 0px; */
        border: none;
        margin-bottom: 0;
    }

    .course-box .data {
        width: calc(100% - 100px);
        /* padding: 8px; */
        overflow: hidden;
        padding-bottom: 2px;
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
        font-weight: 500;
        vertical-align: middle;
    }

    .course-box .name.selected {
        color: green;
    }

    .course-box .info {
        margin-top: 5px;
        font-size: 13px;
    }

    .course-box .info .type {
        font-size: 13px;
        font-weight: 500;
        color: #4e5969;
    }

    .course-box .info .views {
        color: #86909c;
        margin-left: 10px;
        font-size: 12px;
    }

    .course-box .info .more {
        float: right;
    }

    .free-tag {
        padding: 1px 4px;
        /* background-color: #0968f6; */
        border: 1px solid #6aa1ff;
        color: #6aa1ff;
        margin-right: 4px;
        border-radius: 2px;
        font-size: 12px;
    }

    .loading {
        width: 100%;
        height: 200px;
        padding-top: 100px;
    }
</style>