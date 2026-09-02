<template>
  <view class="goods-list-page">
    <view class="search-bar">
      <input
        class="search-input"
        v-model="keyword"
        placeholder="搜索商品"
        @confirm="onSearch"
      />
      <button class="search-btn" @tap="onSearch">搜索</button>
    </view>

    <view class="tab-bar">
      <view
        class="tab-item"
        v-for="(item, index) in tabList"
        :key="item.value"
        :class="[{ 'tab-active': index == currentTab }]"
        @tap="onTabsChange(index)"
      >
        {{ item.name }}
      </view>
      <view class="list-icon" @tap="iconStatus = !iconStatus">
        <text v-if="iconStatus" class="icon-list">☰</text>
        <text v-else class="icon-card">⊞</text>
      </view>
    </view>

    <div class="container">
      <tz-physical-goods
        :list="pagination.data"
        :type="iconStatus ? 'list' : 'grid'"
        :round="true"
        :border="false"
      />
      <u-empty
        v-if="pagination.total === 0 && !loading"
        icon="/static/image/empty.png"
        width="70"
        height="70"
        text="暂无商品"
      />
    </div>

    <u-loading-page :loading="loading" bg-color="#F7F8FA"></u-loading-page>

    <uni-load-more
      v-if="pagination.total > 0"
      :status="loadStatus"
      :content-text="{
        contentdown: '上拉加载更多',
      }"
      @tap="loadmore"
    />

    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
