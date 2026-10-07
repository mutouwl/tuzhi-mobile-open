<template>
  <view class="tz-category">
   
    <tz-box padding="10px 10px">
    <tz-search inputBgColor="#f5f5f5"></tz-search>
    </tz-box>
    <view class="three-level-wrap tz-flex tz-col-top">
      <view class="side-menu-wrap">
        <scroll-view scroll-y style="height: 100vh;">
          <!-- 首屏取分类树时左栏出同尺寸（padding 20/10、行高 16）的灰条目，不遮整页 -->
          <block v-if="loading">
            <view class="cat-sk-menu" v-for="i in 8" :key="'m' + i">
              <view class="cat-sk-menu-bar"></view>
            </view>
          </block>
          <block v-else>
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
          </block>
        </scroll-view>
      </view>
      <!-- 首屏骨架屏（替代 u-loading-page 整页遮罩）：搜索栏、左右两栏的版式都先摆出来，
           只把两栏各自的内容换成灰块；右侧内容与真实课程卡同一只组件出骨架（banner 块 + 紧凑卡） -->
      <view class="goods-list-box" v-if="loading">
        <view class="cat-sk-banner"></view>
        <tz-course-mini :round="true" :border="false" :skeleton="true" :skeleton-count="5"></tz-course-mini>
      </view>
      <!-- 一级分类没有下级分类时的空状态 -->
      <view
        class="goods-list-box empty-box"
        v-else-if="!categoryList.children || !categoryList.children.length"
      >
        <u-empty
          icon="/static/image/empty.png"
          width="70"
          height="70"
          text="暂无分类"
        ></u-empty>
      </view>
      <scroll-view 
        scroll-y 
        class="goods-list-box" 
        v-else
        style="height: 100vh;"
        @scrolltolower="onScrollToLower"
      >
        <image
          v-if="categoryList.children[activeMenu].image"
          class="banner-img"
          :src="categoryList.children[activeMenu].image"
          mode="widthFix"
        ></image>
        
        <!-- 课程列表模式：一级分类，或当前选中分类没有更深层级时直接显示课程列表 -->
        <template v-if="courseGroupId">
          <u-sticky bgColor="#fff" v-if="showSecondTabs">
            <u-tabs :list="secondCategoryList" :current="activeSecondMenu" @click="onSecondMenu"></u-tabs>
          </u-sticky>
          <!-- 切左侧菜单/页签换列表时，骨架只铺这一栏（页签与左栏菜单都已在前一次响应里就位，保持可点） -->
          <tz-course-mini :round="true" :border="false" :skeleton="true" :skeleton-count="5" v-if="courseLoading && !courseList.length"></tz-course-mini>
          <template v-else>
            <tz-course-mini :round="true" :border="false" :list="courseList" v-if="courseList.length > 0"></tz-course-mini>
            <u-empty icon="/static/image/empty.png" width="70" height="70" v-if="courseList.length == 0" text="暂无课程"></u-empty>
          </template>
          <view class="load-more-box" v-if="courseList.length > 0">
            <u-loadmore :status="loadStatus" />
          </view>
        </template>

        <!-- groupLevel = 3: 三级分类导航，二级分类数据作为标题，三级分类数据作为item -->
        <template v-else-if="groupLevel === 3">
          <third-one
            v-if="categoryList.children[activeMenu]"
            :data="categoryList.children[activeMenu]"
            :pagination="pagination"
            :isLevel3="true"
          />
          <u-empty icon="/static/image/empty.png" width="70" height="70" v-else text="暂无分类"></u-empty>
        </template>

        <!-- groupLevel >= 4: 显示tabs和三四级分类导航 -->
        <template v-else>
          <u-sticky bgColor="#fff" v-if="secondCategoryList.length > 0">
            <u-tabs :list="secondCategoryList" :current="activeSecondMenu" @click="onSecondMenu"></u-tabs>
          </u-sticky>
          <third-one
            v-if="currentSecondCategory && (categoryList.style === 'third_one' || categoryList.style === 'third_one_big' || categoryList.style === 'first')"
            :data="currentSecondCategory"
            :pagination="pagination"
          />
        </template>
      </scroll-view>
    </view>

    <tz-tab-bar />
  </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
