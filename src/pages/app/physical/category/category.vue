<template>
  <view class="tz-category">
    <u-loading-page :loading="loading" bg-color="#F7F8FA"></u-loading-page>
    <view class="three-level-wrap tz-flex tz-col-top" v-if="!loading">
      <view class="side-menu-wrap">
        <scroll-view scroll-y :style="{ height: pageHeight + 'px' }">
          <view
            class="menu-item tz-flex"
            v-for="(item, index) in categoryList.children"
            :key="item.id"
            :class="[{ 'menu-item-active': index == activeMenu }]"
            @tap="onMenu(index)"
          >
            <view class="menu-title tz-line-1">
              {{ item.name }}
            </view>
          </view>
        </scroll-view>
      </view>
      <!-- 一级分类没有下级分类时的空状态 -->
      <view
        class="goods-list-box empty-box"
        v-if="!categoryList.children || !categoryList.children.length"
      >
        <u-empty
          icon="/static/image/empty.png"
          width="70"
          height="70"
          text="暂无分类"
        ></u-empty>
      </view>
      <view class="goods-list-box" v-else>
        <image
          v-if="categoryList.children[activeMenu].image"
          class="banner-img"
          :src="categoryList.children[activeMenu].image"
          mode="widthFix"
        ></image>
        <first-one
          v-if="categoryList.style === 'first_one'"
          :data="categoryList"
          :activeMenu="activeMenu"
          :pagination="pagination"
        />
        <first-two
          v-if="categoryList.style === 'first_two'"
          :data="categoryList"
          :activeMenu="activeMenu"
          :pagination="pagination"
        />
        <second-one
          v-if="categoryList.style === 'second_one'"
          :data="categoryList"
          :activeMenu="activeMenu"
          :pagination="pagination"
        />
        <third-one
          v-if="
            categoryList.style === 'third_one' ||
            categoryList.style === 'third_one_big' ||
            categoryList.style === 'first'
          "
          :data="categoryList.children[activeMenu]"
          :pagination="pagination"
        />
        <uni-load-more
          v-if="
            (categoryList.style === 'first_one' || categoryList.style === 'first_two') &&
            pagination.total > 0
          "
          :status="loadStatus"
          :content-text="{
            contentdown: '点击查看更多',
          }"
          @tap="loadmore"
        />
      </view>
    </view>

    <tz-tab-bar />
  </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
