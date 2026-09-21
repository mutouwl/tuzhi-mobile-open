<template>
    <div v-if="list.length > 0">
        <tz-box padding="0px 15px 0px">
            <div class="column-box">
                <div class="column-title">包含该课程的还有</div>

                <div class="column-course-list">
                    <div class="column-item-box" v-for="(item, index) in list"
                        @click="$nav.to(item.column.id, 'course')" v-if="index == 0 || showMore">
                        <div class="column-item-cover">
                            <img :src="item.column.cover" />
                        </div>

                        <div class="column-item-info">
                            <div class="column-item-info-title one-line-hidden">
                                {{ item.column.name }}
                            </div>
                            <div class="column-item-info-subtitle">已更新 {{ item.count }} 期课程</div>
                        </div>

                        <div class="column-item-more">
                            <tz-icon name="enter" color="#999" :size="16" />
                        </div>
                    </div>
                </div>

                <div class="column-more" v-if="list && list.length > 1 && !showMore" @click="showMore = !showMore">
                    <div>更多专栏</div>
                    <div><tz-icon name="unfold" color="#999" :size="14" /></div>
                </div>
            </div>
        </tz-box>
        <tz-divider />
    </div>
</template>

<script>
    var that;
    export default {
        components: {},
        data() {
            return {
                list: [],
                showMore:false
            };
        },
        props: {
            itemId: {
                type: [Number, String],
                default: 0,
            },
        },
        watch: {
            itemId() {
                this.getCourseBelongsColumn();
            },
        },
        methods: {
            /**
             * 获取课程所属的专栏
             */
            getCourseBelongsColumn() {
                var that = this;
                that
                    .$api("course.getBelongsColumn", {
                        course_id: that.itemId,
                    })
                    .then((ret) => {
                        if (ret.code === 1) {
                            this.list = ret.data;
                        }
                    });
            },
        },
        mounted() {
            this.getCourseBelongsColumn();
        },
    };
</script>
<style>
    .column-box {
        /* background-color: #fafafa; */
        padding: 15px 0;
        /* margin: 15px 0; */
        border-radius: 5px;
    }

    .column-item-box {
        height: 45px;
        width: 100%;

        display: flex;
        justify-content: space-between;

        margin: 15px 0;

        /* padding-bottom: 15px; */

        /* border-bottom: 1px solid #efefef; */
    }

    .column-item-box {
        position: relative;
    }

    .column-item-box .column-item-info {
        width: calc(100% - 80px);
        /* padding: 8px; */
        overflow: hidden;

        position: relative;
    }

    .column-item-box .column-item-cover {
        height: 100%;
        width: 70px;
    }

    .column-item-box .column-item-cover img {
        width: 100%;
        height: 100%;
        border-radius: 5px;
    }

    .column-item-box .column-item-info .column-item-info-title {
        font-weight: 700;
        font-size: 14px;
        color: #333;
    }

    .column-item-box .column-item-info .column-item-info-subtitle {
        color: #999999;
        font-size: 12px;
        /* margin-top: 6px; */
        bottom: 0;
        left: 0;
        position: absolute;
    }

    .column-item-more {
        /* margin-top: 26px; */
        position: absolute;
        right: 0px;
        top: 36%;
    }

    .column-title {
        font-weight: 500;
        color: #333;
        font-size: 16px;
        margin-bottom: 10px;
    }

    .column-course-list .column-item-box:last-child {
        padding-bottom: 0px;
        border: none;
        margin-bottom: 0;
    }

    .column-more {
        width: 100%;
        color: #999;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
        font-size: 12px;
        margin-top: 15px;
    }
</style>