<template>
  <view class="circle-search">
    <!-- 顶部搜索栏：tdesign 搜索框 + 右侧筛选按钮 -->
    <view class="search-bar">
      <t-search :value="keyword" placeholder="搜索圈子动态" shape="square" :clearable="true" :focus="searchFocus" :maxlength="MAX_KEYWORD_LEN" @change="onKeywordChange" @submit="onSearch">
        <template #action>
          <view class="filter-btn" @tap="toggleFilter">
            <tz-icon name="paixu" :size="20" :color="filterActive ? '#0968f6' : '#86909c'" />
          </view>
        </template>
      </t-search>
    </view>

    <!-- 动态列表 -->
    <view class="feed">
      <view v-if="tabLoading" class="tab-loading">
        <u-loading-icon color="#0968f6" text="加载中" textSize="12" />
      </view>
      <template v-else>
        <tz-circle-post :list="posts" mode="full" :circle-id="id" :content-protect="contentProtect" @like="onLike" @comment="goDetail" @refresh="refresh" />
        <u-loadmore :status="loadStatus" margin-top="20" v-if="posts.length" />
        <u-empty v-if="!posts.length && !loadingMore" :text="loadMsg" icon="/static/image/empty.png" width="70" height="70" margin-top="60"></u-empty>
      </template>
    </view>

    <!-- 搜索筛选弹窗（排序 + 时间，与圈子首页共用组件） -->
    <circle-post-filter
      :visible="modal.sortFilter"
      title="搜索筛选"
      :sort="sort"
      :time-filter="timeFilter"
      :custom-range="customRange"
      @update:visible="modal.sortFilter = $event"
      @confirm="onFilterConfirm"
    />
  </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
