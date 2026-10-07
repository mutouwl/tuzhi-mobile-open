<template>
  <view class="school-page cks-page">
    <!-- 顶部搜索栏：搜索框 + 右侧筛选按钮，与动态模块 pages/app/circle/search 同一份共用组件
         （tz-search-filter-bar 自身就是吸顶白底通栏，列表滚上去搜索栏常驻，M5/M7） -->
    <tz-search-filter-bar :value="keyword" placeholder="搜索打卡日记" :focus="searchFocus" :maxlength="MAX_KEYWORD_LEN"
      :filter-active="filterActive" @change="onKeywordChange" @submit="onSearch" @filter="filterVisible = true" />

    <!-- 列表容器与条目卡走打卡模块全局档：.school-cards（左右留边 10）+ 动态卡由 tz-checkin-record-card
         按直角卡口径渲染（与活动主页动态栏同一只组件，卡内版式不会再分叉） -->
    <view class="school-cards">
      <!-- 骨架屏（M16）：搜索/换筛选条件重拉时铺这一块，灰块与真实卡逐块对齐（头像 36 + 昵称行 / 正文两行 /
           底部时间+动作行），数值取活动主页 .cd-sk-* 那一档 -->
      <block v-if="loading">
        <view class="school-card" v-for="i in 3" :key="'sk' + i">
          <view class="cks-sk-row">
            <view class="cks-sk-avatar"></view>
            <view class="cks-sk-text">
              <!-- rows-width 用数组传值：u-skeleton 对单行列表会把「最后一行」宽度写死成 70%，传字符串不生效 -->
              <u-skeleton :loading="true" :animate="true" :title="true" title-width="38%" title-height="15" :rows="1" :rows-width="['56%']" rows-height="12" />
            </view>
          </view>
          <u-skeleton :loading="true" :animate="true" :title="false" :rows="2" :rows-width="['92%', '64%']" rows-height="14" />
          <view class="cks-sk-foot">
            <view class="cks-sk-foot-time"></view>
            <view class="cks-sk-foot-act"></view>
          </view>
        </view>
      </block>
      <block v-else>
        <!-- 整卡与卡片脚的评论图标都进这条动态详情（与动态模块搜索页同一落点：那一页点评论也是 goDetail），
             详情页自带评论栏与分享，本页不再挂一份评论弹窗；点赞在本页乐观更新，本人动态删除后重取当前这一份结果 -->
        <tz-checkin-record-card v-for="record in list" :key="record.id" :record="record" :checkin-id="id"
          @detail="goDiary" @comment="goDiary" @like="onLike" @refresh="refresh" />
        <u-empty icon="/static/image/empty.png" width="70" height="70" v-if="!list.length" :text="loadMsg" margin-top="60"></u-empty>
        <u-loadmore :status="loadStatus" v-if="list.length && loadStatus !== 'nomore'"></u-loadmore>
      </block>
    </view>

    <!-- 搜索筛选弹窗（排序 + 发表日期，与动态模块搜索页同一份共用组件）；
         排序选项只列打卡动态流接口当下真能改的两档（正序/倒序），不把圈子那套「评论最多/获赞最多」摆成假选项 -->
    <tz-filter-popup :visible="filterVisible" title="搜索筛选" :sort="order" :sort-options="sortOptions"
      :time-filter="timeFilter" :custom-range="customRange" @update:visible="filterVisible = $event" @confirm="onFilterConfirm" />

    <!-- 底部导航 + 版权页脚：打卡模块各页同一档 -->
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
