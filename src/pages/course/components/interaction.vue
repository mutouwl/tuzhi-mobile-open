<template>
    <view class="box">
        <u-cell-group :border="false">
            <u-cell v-if="examshow" :label="'已关联 '+list.exercises.length+' 个练习'" :isLink="true"
                @click="detail('exercises')">
                <div slot="icon" style="margin-right: 6px;">
                    <tz-icon name="brush" :size="22" />
                </div>
                <text slot="title" style="font-size: 14px;">练习</text>
            </u-cell>


            <u-cell :border="testshow || formshow" :label="'已关联 '+list.activity.length+' 个线下活动'" :isLink="true"
                @click="detail('activity')">
                <div slot="icon" style="margin-right: 6px;">
                    <tz-icon name="flag" :size="22" />
                </div>
                <text slot="title" style="font-size: 14px;">线下活动</text>
            </u-cell>

            <u-cell v-if="testshow" :border="formshow" :label="'已关联 '+list.test.length+' 个考试'" :isLink="true"
                @click="detail('test')">
                <div slot="icon" style="margin-right: 6px;">
                    <tz-icon name="document" :size="22" />
                </div>
                <text slot="title" style="font-size: 14px;">考试</text>
            </u-cell>
            

            <u-cell v-if="formshow" :border="false" :label="'已关联 '+list.form.length+' 个表单'" :isLink="true"
                @click="detail('form')">
                <div slot="icon" style="margin-right: 6px;">
                    <tz-icon name="activity" :size="22" />
                </div>
                <text slot="title" style="font-size: 14px;">表单</text>
            </u-cell>

        </u-cell-group>

        <u-popup :show="show" @close="show=false" title="互动" :closeable="true" :round="10">
            <div class="sheet-box">
                <tz-course-mini v-if="list[checked] && list[checked].length > 0" :list="list[checked]" :round="true" :border="false"
                    type="single" />
                <u-empty v-else icon="/static/image/empty.png" width="70" height="70" text="暂无内容" />
            </div>
        </u-popup>


        <!-- <tz-course-mini v-if="list && list.length > 0" :list="list" :round="true" type="exercises"/> -->

    </view>
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
            return {
                loading: false,
                list: {
                    test: [],
                    exercises: [],
                    activity: [],
                    form: []
                },
                show: false,
                testshow: false,
                examshow: false,
                formshow: false,
                checked: ''
            };
        },
        props: {
            courseId: {
                type: [String, Number],
                default: 0,
            }
        },
        watch: {},
        methods: {

            getCourseBindExam() {
                var url = "app.exam.exercises.getCourseBindExam";
                that
                    .$api(url, {
                        course_id: that.courseId,
                    })
                    .then((res) => {
                        if (res.code === 1) {
                            that.list.exercises = res.data;
                        }
                        this.loading = false;
                    });
            },
            getCourseBindTest() {
                var url = "app.test.getCourseBindTest";
                that
                    .$api(url, {
                        course_id: that.courseId,
                    })
                    .then((res) => {
                        if (res.code === 1) {
                            that.list.test = res.data;
                        }
                        this.loading = false;
                    });
            },
            courseBindActivity() {
                var url = "app.activity.courseBindActivity";
                that
                    .$api(url, {
                        course_id: that.courseId,
                    })
                    .then((res) => {
                        if (res.code === 1) {
                            that.list.activity = res.data;
                        }
                        this.loading = false;
                    });
            },
            getCourseBindForm() {
                var url = "app.form.courseBindForm";
                that
                    .$api(url, {
                        course_id: that.courseId,
                    })
                    .then((res) => {
                        if (res.code === 1) {
                            that.list.form = res.data;
                        }
                        this.loading = false;
                    });
            },
            detail(type) {
                this.show = true;
                this.checked = type;
            }
        },
        mounted() {
            that = this;
            this.examshow = that.$tools.systemConfig("app_isinstall_test");
            if (this.examshow) {
                this.getCourseBindExam();
            }
            this.courseBindActivity();

            if (that.$tools.systemConfig("app_isinstall_test")) {
                this.testshow = true;
                this.getCourseBindTest();
            }

            if (that.$tools.systemConfig("app_isinstall_form")) {
                this.formshow = true;
                this.getCourseBindForm();
            }
        }
    };
</script>

<style>
    .box {
        padding-top: 10px;
        padding-bottom: 10px;
    }

    .sheet-title {
        background: rgba(250, 250, 250, 1);
        width: 100%;
        height: 50px;
        line-height: 50px;
        font-size: 14px;
        text-align: center;
        border-bottom: 1px solid #efefef;
    }

    .sheet-box {
        height: 500px;
        padding: 10px;
        overflow-y: scroll;
        /* background-color: #f6f6f6; */
        /* padding-bottom: calc(env(safe-area-inset-bottom)); */
    }
</style>