<template>
  <view class="circle-search">
    <!-- 顶部搜索栏：搜索框 + 右侧筛选按钮（共用组件） -->
    <tz-search-filter-bar :value="keyword" placeholder="搜索圈子动态" :focus="searchFocus" :maxlength="MAX_KEYWORD_LEN" :filter-active="filterActive" @change="onKeywordChange" @submit="onSearch" @filter="toggleFilter" />

    <!-- 动态列表：首屏与切档/搜索/筛选共用一支骨架，判据 loading && !list.length（翻页不闪骨架）。
         吸顶搜索筛选栏留在骨架屏外保持可点；动态卡骨架由 tz-circle-post 自己出，页面不抄一份卡尺寸。 -->
    <view class="feed">
      <tz-circle-post v-if="listLoading" :skeleton="true" :list="[]" :skeleton-count="3" />
      <template v-else>
        <tz-circle-post :list="posts" mode="full" :circle-id="id" :content-protect="contentProtect" @like="onLike" @comment="goDetail" @refresh="refresh" />
        <u-loadmore :status="loadStatus" margin-top="20" v-if="posts.length" />
        <u-empty v-if="!posts.length && !loadingMore" :text="loadMsg" icon="/static/image/empty.png" width="70" height="70" margin-top="60"></u-empty>
      </template>
    </view>

    <!-- 搜索筛选弹窗（排序 + 时间，通用组件） -->
    <tz-filter-popup
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
