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
      <!-- 首屏骨架屏：仿商品卡版式（grid 双列 / list 单行，尺寸与 tz-physical-goods 一致），
           仅「请求中且列表为空」时出现；上拉翻页保留已有商品，由 uni-load-more 反馈 -->
      <view
        v-if="loading && !pagination.data.length"
        class="goods-sk-box"
        :class="iconStatus ? 'goods-sk-list' : 'goods-sk-grid'"
      >
        <view class="goods-sk-item" v-for="i in (iconStatus ? 4 : 6)" :key="i">
          <view class="goods-sk-cover"></view>
          <view class="goods-sk-info">
            <view class="goods-sk-block goods-sk-title"></view>
            <view class="goods-sk-block goods-sk-title2"></view>
            <view class="goods-sk-price-row">
              <view class="goods-sk-block goods-sk-price"></view>
              <view class="goods-sk-block goods-sk-sales"></view>
            </view>
          </view>
        </view>
      </view>

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
