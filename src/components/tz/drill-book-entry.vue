<template>
    <!--
      商详页「刷题本」入口（付费插件 drill_book，与 `group-buy-btn` 同构）

      刷题本关联了本课程时，课程详情底栏要有一枚进得去的入口：点击就地开
      「这门课关联的刷题本」弹层（列表与权益由 `drill-book-course-modal.vue` 呈现）。
      未订阅这一档的底栏是购买栏（`tz-bottom-btn type="order"`），打卡那种「图标 + 文字」
      的控制栏形态在那儿没有位置，所以这里走**次级按钮**：与拼团那一枚同一格、
      描边档（`plain`）、40 高，排在主购买按钮左侧。

      两条纪律与 `group-buy-btn` 逐字同源：
       ① 根节点 `flex:1 + min-width:0`：`.box` 那一行里 slot 内容就是 flex 项；
       ② 按钮本体走 `u-button`（4px 圆角档，M17），不另造颜色。

      显隐判据由宿主页给（`app.drill_book.books.courseBind` 回行数 > 0 才渲染）：
      组件不认识插件、也不自己取数（未安装刷题本时宿主页既不放这一枚也不发那一发请求）。
    -->
    <view class="dbk-entry" @click="open">
        <!-- `plain`（描边档）：它是购买栏里的次级入口，不能与右侧主购买按钮抢同一种实心蓝；
             uview 默认 type=info 给灰描边 + 白底，正文用 #4e5969（白底 7.1:1） -->
        <u-button plain :customStyle="{ width: '100%', fontWeight: 600, height: height + 'px' }" class="custom-style">
            <text class="dbk-text">{{ text }}</text>
        </u-button>
    </view>
</template>

<script>
/**
 * 课程详情底栏「刷题本」入口（未订阅那一档的购买栏用）
 *
 * 已订阅那一档不挂本组件：那里是控制栏（`type="control"`），刷题本与打卡同形，
 * 用 `control-btn` 的「图标 + 文字」即可（见 `bottom-btn.vue` 的 drill_book 分支）。
 */
export default {
    name: 'DrillBookEntry',
    props: {
        /** 按钮文案（默认「刷题本」；宿主可换成「我的刷题本」这类，不改组件） */
        text: { type: String, default: '刷题本' },
        /** 按钮高度（px）：与同栏 u-button 同档（商详底栏 40） */
        height: { type: [Number, String], default: 40 },
    },
    emits: ['open'],
    methods: {
        open() {
            this.$emit('open');
        },
    },
};
</script>

<style scoped>
/* 根节点是 .box 里的 flex 项：给足权重与收缩下限（同 `group-buy-btn` 头注释①） */
.dbk-entry {
    flex: 1;
    min-width: 0;
}

.custom-style {
    width: 100%;
}

.dbk-text {
    font-size: 15px;
    font-weight: 600;
    color: #4e5969;
    line-height: 1;
}
</style>
