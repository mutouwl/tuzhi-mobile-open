<template>
  <view class="school-page">
    <!-- 列表容器与条目卡与「我的打卡」列表同一档：.school-cards--divided + 条目卡
         tz-checkin-activity-card（内部直接复用课程列表卡 tz-course 的分隔线档），两页同一只组件、同一份字段口径 -->
    <view class="school-cards school-cards--divided">
      <!-- 首屏骨架屏：由卡片组件的 loading 态渲染，与真实卡逐块对齐；上拉翻页时保留已有列表（同「我的打卡」） -->
      <block v-if="loading && !list.length">
        <tz-checkin-activity-card v-for="i in 3" :key="i" :loading="true" />
      </block>
      <block v-else>
        <tz-checkin-activity-card
          v-for="item in list"
          :key="item.id"
          :item="item"
          :attr="attr"
          @open="goIntro"
        />
        <u-empty icon="/static/image/empty.png" width="70" height="70" v-if="!list.length" :text="loadFailed ? '加载失败，请下拉重试' : '暂无可参与的打卡'" />
        <u-loadmore :status="loadStatus" v-if="list.length && loadStatus !== 'nomore'"></u-loadmore>
      </block>
    </view>

    <!-- 底部导航 + 版权页脚：打卡模块各页同一档（tz-tab-bar 只在本页被配成底部导航项时渲染，自带占位不压内容） -->
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>
<style>
@import "./css.css";
</style>
