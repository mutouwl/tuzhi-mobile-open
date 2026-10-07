<template>
    <view class="box">
        <!-- 加载态：四类清单还在取，按真实行（内衬 10/15、图标 22）先占位再盖骨架 -->
        <template v-if="loading">
            <view class="ia-sk-row" v-for="i in 3" :key="'ia-sk-' + i">
                <view class="ia-sk-icon"></view>
                <!-- 宽度给数值不给百分比：u-skeleton 的百分比要先量容器宽度，宿主在 flex 行里量不到就画不出块 -->
                <u-skeleton :loading="true" :animate="true" :title="true" title-width="56" title-height="14"
                    :rows="1" :rows-width="[130]" rows-height="12" />
            </view>
        </template>

        <template v-else>
            <u-cell-group :border="false" v-if="sections.length > 0">
                <u-cell v-for="(item, index) in sections" :key="item.type" :border="index < sections.length - 1"
                    :label="'已关联 ' + item.count + ' 个' + item.name" :isLink="true" @click="detail(item.type)">
                    <div slot="icon" style="margin-right: 6px;">
                        <tz-icon :name="item.icon" :size="22" />
                    </div>
                    <text slot="title" style="font-size: 14px;">{{ item.name }}</text>
                </u-cell>
            </u-cell-group>
            <!-- 四类都空才是空态；一条都没取到手时说的是失败原因，不把故障说成「暂无」 -->
            <u-empty v-else icon="/static/image/empty.png" width="70" height="70" :text="loadMsg || '暂无互动内容'" />
        </template>

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
    // #ifdef MP-TOUTIAO
    import i18n from "@/components/language/index.js";
    // #endif

    // 互动栏四类实体的名称/图标/接口/所属插件只存这一处，行按「关联数 > 0」渲染
    const SECTIONS = [
        {
            type: "exercises",
            name: "练习",
            icon: "brush",
            api: "app.exam.exercises.getCourseBindExam",
            plugin: "app_isinstall_test"
        },
        {
            type: "activity",
            name: "线下活动",
            icon: "flag",
            api: "app.activity.courseBindActivity",
            plugin: ""
        },
        {
            type: "test",
            name: "考试",
            icon: "document",
            api: "app.test.getCourseBindTest",
            plugin: "app_isinstall_test"
        },
        {
            type: "form",
            name: "表单",
            icon: "activity",
            api: "app.form.courseBindForm",
            plugin: "app_isinstall_form"
        }
    ];

    export default {
        // #ifdef MP-TOUTIAO
        i18n,
        // #endif
        data() {
            return {
                loading: true,
                pending: 0,
                loadMsg: "",
                list: {
                    test: [],
                    exercises: [],
                    activity: [],
                    form: []
                },
                show: false,
                checked: ""
            };
        },
        props: {
            courseId: {
                type: [String, Number],
                default: 0,
            }
        },
        computed: {
            // 只有关联到内容的那一类才占一行，四类全空由模板落空态
            sections() {
                var list = this.list;
                var rows = [];
                SECTIONS.forEach(function (item) {
                    var bound = list[item.type] || [];
                    if (bound.length > 0) {
                        rows.push({ type: item.type, name: item.name, icon: item.icon, count: bound.length });
                    }
                });
                return rows;
            }
        },
        watch: {},
        methods: {
            /**
             * 并行取四类关联清单：未安装插件的那一类不发请求，
             * 全部回音（含失败）后才撤骨架屏，骨架屏不常驻
             */
            loadAll() {
                var vm = this;
                var tasks = SECTIONS.filter(function (item) {
                    return !item.plugin || vm.$tools.systemConfig(item.plugin);
                });
                vm.pending = tasks.length;
                tasks.forEach(function (item) {
                    vm.$api(item.api, { course_id: vm.courseId }).then(function (res) {
                        if (!res || res.code !== 1) {
                            vm.loadMsg = (res && res.msg) || "互动内容加载失败";
                        } else {
                            vm.list[item.type] = res.data || [];
                        }
                        vm.finishLoad();
                    }, function () {
                        vm.loadMsg = "互动内容加载失败，请重试";
                        vm.finishLoad();
                    });
                });
            },
            finishLoad() {
                this.pending -= 1;
                if (this.pending <= 0) {
                    this.loading = false;
                }
            },
            detail(type) {
                this.show = true;
                this.checked = type;
            }
        },
        mounted() {
            this.loadAll();
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

    /* 骨架行：与真实 u-cell 行同一档（内衬 10px 15px、左侧图标 22、图标与文字间距 6） */
    .ia-sk-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 10px 15px;
    }

    .ia-sk-icon {
        width: 22px;
        height: 22px;
        margin-right: 6px;
        border-radius: 4px;
        background-color: #e5e6eb;
    }
</style>
