<template>
  <view class="school-page cmm-page">
    <!-- 搜索栏走教务全局档 .school-search-box（白底通栏，照校区列表 campus/list），不再自造圆角搜索卡；
         本页把外壳内衬清零（见 css.css），只留 tz-search-filter-bar 自身那档 8/12，避免两层内衬叠加 -->
    <u-sticky bgColor="#fff" :offsetTop="0">
      <view class="school-search-box">
        <tz-search-filter-bar :value="keyword" placeholder="请输入学员昵称" :filter-active="order === 'asc'"
          @change="onKeywordChange" @submit="refresh" @filter="filterVisible = true" />
      </view>
    </u-sticky>
    <tz-filter-popup :visible="filterVisible" title="成员筛选" :sort="order" :sort-options="sortOptions" :show-time="false"
      @update:visible="filterVisible = $event" @confirm="onFilterConfirm" />

    <!-- 列表容器与条目卡走教务全局档：.school-cards（左右留边 10）+ .school-card（白底、直角、内衬 14、卡间距 10、无阴影） -->
    <view class="school-cards">
    <!-- 首屏骨架屏（替代整页 Loading）：搜索/筛选栏留在骨架屏之外保持可点，列表按真实成员卡铺灰块（头像 44 + 两行） -->
    <block v-if="loading">
      <view class="school-card cmm-sk-card" v-for="i in 5" :key="i">
        <view class="cmm-sk-avatar"></view>
        <view class="cmm-sk-text">
          <u-skeleton :loading="true" :animate="true" :title="true" title-width="42%" title-height="15" :rows="1" :rows-width="['28%']" rows-height="12" />
        </view>
      </view>
    </block>
    <block v-if="!loading">
      <!-- 整卡可点 → 该学员在本活动内的打卡记录页（入口与守卫见 common/utils/checkin-owner） -->
      <view class="school-card cmm-card" v-for="(m, i) in list" :key="m.user_id" @tap="goUserRecord(m)">
        <image class="cmm-avatar" :src="m.avatar || '/static/image/default-avatar.png'" mode="aspectFill" @error="onAvatarError(m)" />
        <view class="cmm-info">
          <view class="cmm-name">{{ m.nickname }}</view>
          <view class="cmm-streak">已坚持打卡{{ m.streak }}天</view>
        </view>
      </view>
      <u-empty icon="/static/image/empty.png" width="70" height="70" v-if="!list.length" :text="notFound ? loadMsg : '暂无成员'" />
      <u-loadmore :status="loadStatus" v-if="list.length && loadStatus !== 'nomore'"></u-loadmore>
    </block>
    </view>

    <!-- 底部导航 + 版权页脚：打卡模块各页同一档（tz-tab-bar 只在本页被配成底部导航项时渲染，自带占位不压内容） -->
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>
<style>
@import "./css.css";
</style>
