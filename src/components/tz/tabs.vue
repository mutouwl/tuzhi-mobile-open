<template>
    <div :style="{ 'background-color': bgColor }" :class="[
        { 'round': round }
    ]">

        <u-tabs :list="tabs" @click="click" :lineColor="lineColor" :activeStyle="activeStyle"
            :inactiveStyle="inactiveStyle"></u-tabs>

        <!-- 页签下面那一条「margin-top:10px 的 <tz-course>」已删（2026-10-28）：
             它是模板里没传 list 的死挂件（两个调用点只传 `tabs`），easycom 会把它真挂成课程卡组件，
             但 rows 恒空 ⇒ 渲染成「一只 10px 高的空白块」，页签行下面凭空多一道白边。
             调用点把本组件包进 u-sticky 吸顶后，这道白边正好落在白色吸顶带里、比页签行还显眼
             （M5 要求带内只有页签行）。课程列表要摆在哪由调用页自己摆，不由本页签组件代摆 -->
    </div>
</template>
<script lang="ts">
export default {
    components: {},
    data() {
        return {
        }
    },
    props: {
        tabs: {
            type: [Object, Array],
            default: () => {
                return [
                    {
                        name: '关注',
                    }, 
                    {
                        name: '推荐',
                    }
                ]
            }
        },
        //背景颜色
        bgColor: {
            type: String,
            default: 'none'
        },
        //是否有圆角
        round: {
            type: Boolean,
            default: false
        },
        //滑块颜色
        lineColor: {
            type: String,
            default: '#0968f6'
        },
        activeStyle: {
            type: [Object, String],
            default: () => {
                return { color: '#303133' }
            }
        },
        inactiveStyle: {
            type: [Object, String],
            default: () => {
                return { color: '#606266' }
            }
        }
    },
    methods: {
        // 对外只报事件、不替调用页决定切哪个页签：u-tabs 的 `click` 在这一层被本组件吃掉后
        // 不会自己冒到 `<tz-tabs @click>` 上（Vue 2 组件上的 v-on 只收 $emit，不绑到根节点），
        // 不在这里重发，调用页拿到的就是「页签点了没反应」（硬约束 27①那一族）。
        // 事件名用非原生名 `tab-change`：模板里 `@tap`/`@click` 会被编译器改名，组件对外的事件
        // 用原生名会在 H5 与小程序两端各走一条路，源码看着对称、实跑收不到。
        click(item) {
            this.$emit('tab-change', item);
        }
    },
    watch: {
    }


};
</script>

<style></style>
