<template>
  <view class="goods-detail">
    <u-loading-page :loading="loading" bg-color="#F7F8FA"></u-loading-page>
    <view class="detail-content" v-if="!loading && goodsInfo">
      <!-- 商品封面 -->
      <image
        v-if="goodsInfo.cover"
        class="goods-cover"
        :src="goodsInfo.cover"
        mode="widthFix"
        @tap="previewImage(0)"
      />

      <!-- 价格区 -->
      <view class="title-card">
        <view class="price-box">
          <view class="price-wrapper" v-if="selectedSpec">
            <text class="price-symbol" v-if="!isVirtualPay">¥</text>
            <text class="price-text">{{ selectedSpec.price }}</text>
            <text class="coin-name" v-if="isVirtualPay">{{ coinName }}</text>
          </view>
          <view class="price-wrapper" v-else-if="goodsInfo.specs && goodsInfo.specs.length > 1">
            <text class="price-text" style="font-size: 20px; font-weight: 500;">请选择规格</text>
          </view>
          <view class="price-wrapper" v-else>
            <text class="price-symbol" v-if="!isVirtualPay">¥</text>
            <text class="price-text">{{ goodsInfo.min_price || 0 }}</text>
            <text class="coin-name" v-if="isVirtualPay">{{ coinName }}</text>
          </view>
        </view>
        <view class="title-text">{{ goodsInfo.name }}</view>
        <view class="sell-point" v-if="goodsInfo.sell_point">{{ goodsInfo.sell_point }}</view>
      </view>

      <!-- 规格选择区 -->
      <view class="detail-cell-card">
        <view class="cell-item" @tap="showSpecModal = true">
          <view class="cell-label">选择</view>
          <view class="cell-value">
            <view class="cell-value-row" v-if="goodsInfo.specs && goodsInfo.specs.length > 0">
              <image v-if="selectedSpec && selectedSpec.image" :src="selectedSpec.image" class="spec-thumb" mode="aspectFill"></image>
              <text class="cell-value-text">{{ selectedSpec ? selectedSpec.name : '请选择规格' }}</text>
            </view>
            <text class="cell-value-count" v-if="goodsInfo.specs">共{{ goodsInfo.specs.length }}种规格可选</text>
          </view>
          <view class="cell-arrow"><tz-icon name="enter" :size="16" /></view>
        </view>
      </view>

      <!-- 详情 -->
      <view class="detail-content-card" v-if="goodsInfo.detail">
        <view class="content-title">商品详情</view>
        <tz-parse :content="goodsInfo.detail"></tz-parse>
      </view>
    </view>

    <!-- 底部栏 -->
    <view class="detail-tabbar" v-if="!loading && goodsInfo">
      <view class="tabbar-right">
        <button class="buy-btn" @tap="handleBuy">立即购买</button>
      </view>
    </view>

    <!-- 规格选择弹窗 -->
    <spec-select-modal
      :show="showSpecModal"
      :goods-info="goodsInfo"
      :selected-spec="selectedSpec"
      @select="onSpecSelect"
      @confirm="onSpecConfirm"
      @close="showSpecModal = false"
    />

    <!-- 内含商品弹窗 -->
    <sub-goods-popup
      :show="showSubGoodsPopup"
      :spec="selectedSpec"
      @close="showSubGoodsPopup = false"
    />

    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
