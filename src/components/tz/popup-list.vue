<template>
    <scroll-view
        class="tz-popup-list"
        scroll-y
        :style="{ height: height, padding: padding }"
        :refresher-enabled="refreshable"
        :refresher-triggered="refreshing"
        refresher-default-style="black"
        @refresherrefresh="$emit('refresh')"
        @scrolltolower="$emit('lower')"
    >
        <slot />
    </scroll-view>
</template>
<script>
export default {
    name: 'TzPopupList',
    props: {
        // 下拉刷新状态（refresher-triggered）
        refreshing: {
            type: Boolean,
            default: false
        },
        // 是否支持下拉刷新（静态列表关闭）
        refreshable: {
            type: Boolean,
            default: true
        },
        // 列表区高度：必须是确定高度，不能写成 min/max-height。
        // 小程序端 scroll-view 里真正能拖动、能下拉刷新的画布依赖自身 height 解析 100%：
        // 只给 min-height 时外层白盒按 340px 撑开、画布仍按列表内容高度收缩，
        // 表现就是「弹窗下方一片空白，可在空白处滑不动、下拉刷新也拉不出来」（H5 端真 Vue 能解析百分比，看不出问题）。
        // 同一问题在 package-sku-select-modal 的 .pkg-body 上已按「确定高度」收口（那里实测 flex 撑高的父级解析不出 height:100%）。
        // 内容不足时列表区留白、超出时在框内滚动，弹窗高度不随条数跳动。
        height: {
            type: String,
            default: '60vh'
        },
        // 列表内衬（如 '0 16px'），挂在 scroll-view 自身。不能由使用方在本组件标签上写 class 承载：
        // 小程序端标签上的样式作用在宿主节点，而宿主是行内盒，padding 撑不动内部的滚动画布，
        // 表现为弹窗列表贴到弹层左右边缘（H5 端组件根节点即宿主，同一条规则却生效）
        padding: {
            type: String,
            default: '0'
        }
    }
};
</script>
<style scoped>
.tz-popup-list {
    box-sizing: border-box;
}
</style>
