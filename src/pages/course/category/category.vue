<template>
  <view class="tz-category">
    <u-loading-page :loading="loading" bg-color="#F7F8FA"></u-loading-page>
   
    <tz-box padding="10px 10px">
    <tz-search inputBgColor="#f5f5f5"></tz-search>
    </tz-box>
    <view class="three-level-wrap tz-flex tz-col-top" v-if="!loading">
      <view class="side-menu-wrap">
        <scroll-view scroll-y style="height: 100vh;">
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
          <view class="loading-box" v-if="courseLoading && courseList.length === 0">
            <u-loading-icon mode="circle" size="40"></u-loading-icon>
            <text class="loading-text">加载中</text>
          </view>
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