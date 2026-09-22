<template>
  <view class="goods-detail">
    <!-- 首屏骨架屏：仿详情页真实结构（轮播 / 价格标题 / 信息行 / 详情正文），底部操作栏同步占位，
         数据落地后整块换成真实内容，页面不跳位 -->
    <view class="detail-sk-page" v-if="skeletonLoading">
      <view class="detail-sk-swiper"></view>

      <view class="detail-sk-card">
        <view class="detail-sk-price-row">
          <view class="detail-sk-block detail-sk-price"></view>
          <view class="detail-sk-block detail-sk-sales"></view>
        </view>
        <view class="detail-sk-block detail-sk-title"></view>
      </view>

      <view class="detail-sk-cells">
        <view class="detail-sk-cell" v-for="i in 3" :key="i">
          <view class="detail-sk-block detail-sk-label"></view>
          <view class="detail-sk-block detail-sk-value"></view>
        </view>
      </view>

      <view class="detail-sk-card detail-sk-detail-card">
        <view class="detail-sk-section-head">
          <view class="detail-sk-block detail-sk-section-title"></view>
        </view>
        <view class="detail-sk-block detail-sk-line detail-sk-line-first"></view>
        <view class="detail-sk-block detail-sk-line detail-sk-line-short"></view>
      </view>

      <view class="detail-sk-tabbar">
        <view class="detail-sk-button"></view>
      </view>
    </view>

    <view class="detail-swiper-selector" v-if="!skeletonLoading && goodsInfo">
      <swiper
        class="goods-swiper"
        :indicator-dots="true"
        :autoplay="false"
        :circular="true"
        indicator-color="rgba(0, 0, 0, .3)"
        indicator-active-color="#0968f6"
      >
        <swiper-item v-for="(item, index) in goodsSwiper" :key="index">
          <image class="swiper-image" :src="item" mode="aspectFit" @tap="previewImage(index)" />
        </swiper-item>
      </swiper>

      <view class="title-card detail-card">
        <view class="price-box">
          <view class="price-wrapper">
            <text class="price-symbol" v-if="!isVirtualPay">¥</text>
            <text class="price-text">{{
              goodsInfo.min_price || goodsInfo.price || 0
            }}</text>
            <text class="price-symbol" v-if="isVirtualPay">{{ $tools.systemConfig('coin_name') || '金币' }}</text>
            <text class="price-suffix" v-if="hasMultipleSku">起</text>
          </view>
          <view
            class="sales-text"
            v-if="goodsInfo.total_sales !== undefined && goodsInfo.total_sales !== null"
          >
            已售{{ goodsInfo.total_sales }}
          </view>
        </view>

        <view class="title-text">{{ goodsInfo.name }}</view>
      </view>

      <view class="detail-cell-card">
        <view class="cell-item" @tap="showSelectSku = true">
          <view class="cell-label">选择</view>
          <view class="cell-value">
            <text class="cell-value-text">{{
              selectedSkuPrice.goods_sku_text || "请选择规格"
            }}</text>
            <text
              class="cell-value-count"
              v-if="goodsInfo.sku_tree && goodsInfo.sku_tree.length > 0"
              >共{{ getSkuCount }}种{{ goodsInfo.sku_tree[0].name }}可选</text
            >
          </view>
          <view class="cell-arrow"><tz-icon name="enter" :size="16" /></view>
        </view>
        <view
          class="cell-item"
          v-if="guaranteeList.length > 0"
          @tap="showGuaranteeModal = true"
        >
          <view class="cell-label">保障</view>
          <view class="cell-value guarantee-tags">
            <text class="guarantee-text">{{
              guaranteeList.map((item) => item.title).join("·")
            }}</text>
          </view>
          <text class="cell-arrow"><tz-icon name="enter" :size="16" /></text>
        </view>
        <view
          class="cell-item"
          v-if="paramsList.length > 0"
          @tap="showParamsModal = true"
        >
          <view class="cell-label">参数</view>
          <view class="cell-value params-tags">
            <text class="params-text">{{
              paramsList.map((item) => item.name).join("·")
            }}</text>
          </view>
          <text class="cell-arrow"><tz-icon name="enter" :size="16" /></text>
        </view>
      </view>

      <view class="detail-content-card" v-if="goodsInfo.detail">
        <view class="content-title">商品详情</view>
        <tz-parse :content="goodsInfo.detail"></tz-parse>
      </view>
    </view>

    <view class="detail-tabbar h5-bottom-bar" v-if="!skeletonLoading && goodsInfo && selectedSkuPrice.id">
      <button
        class="buy-btn-full"
        @tap="showSelectSku = true"
        v-if="Number(selectedSkuPrice.stock) > 0"
      >
        立即购买
      </button>
      <button class="disabled-btn" disabled v-else>已售罄</button>
    </view>
    <view class="detail-tabbar h5-bottom-bar" v-else-if="!skeletonLoading && goodsInfo">
      <button class="buy-btn-full" @tap="showSelectSku = true">立即购买</button>
    </view>

    <!-- 商品不存在或已下架（含缺少 id、接口返回失败）：给一处出口，避免只留一张空白页 -->
    <u-empty
      v-if="!skeletonLoading && !goodsInfo"
      icon="/static/image/empty.png"
      width="70"
      height="70"
      text="商品不存在或已下架"
    />

    <!-- SKU选择弹窗 -->
    <sku-select-modal
      :show="showSelectSku"
      :goods-info="goodsInfo"
      :is-virtual-pay="isVirtualPay"
      :selected-sku-price="selectedSkuPrice"
      :selected-skus="selectedSkus"
      :goods-num.sync="goodsNum"
      @selectSku="onSelectSku"
      @confirm="onSkuConfirm"
      @close="showSelectSku = false"
    />

    <!-- 服务保障弹窗 -->
    <guarantee-modal
      :show="showGuaranteeModal"
      :guarantee-list="guaranteeList"
      @confirm="showGuaranteeModal = false"
      @close="showGuaranteeModal = false"
    />

    <!-- 产品参数弹窗 -->
    <params-modal
      :show="showParamsModal"
      :params-list="paramsList"
      @confirm="showParamsModal = false"
      @close="showParamsModal = false"
    />
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
