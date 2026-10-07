<template>
  <view class="school-page">
    <!-- 我的成绩卡排在页签上方（第一块，margin-top 由双类选择器清零，见 css.css）；
         吸顶页签留在骨架屏之外保持可点，故骨架的两块按真实顺序分列页签上下 -->
    <view class="school-block crk-sk-my" v-if="loading">
      <view class="crk-sk-user">
        <view class="crk-sk-avatar"></view>
        <view class="crk-sk-nick"></view>
      </view>
      <view class="crk-sk-stats">
        <view class="crk-sk-item" v-for="i in 4" :key="i">
          <view class="crk-sk-line w40"></view>
          <view class="crk-sk-line w24"></view>
        </view>
      </view>
    </view>

    <u-sticky bgColor="#fff" :offsetTop="0">
      <u-tabs :list="tabs" :current="tabIndex" lineColor="#0968f6" :scrollable="true" @change="onTabChange"></u-tabs>
    </u-sticky>

    <!-- 榜单骨架：外壳直接用真实区块的 .school-block / .school-cell-item
         （通栏、直角、无阴影、内衬一致），列表区按真实行高铺灰块（名次 28 + 头像 40 + 姓名 + 次数） -->
    <view class="school-block" v-if="loading">
      <view class="school-cell-item crk-sk-row" v-for="i in 6" :key="i">
        <view class="crk-sk-no"></view>
        <view class="crk-sk-row-avatar"></view>
        <view class="crk-sk-name"></view>
        <view class="crk-sk-num"></view>
      </view>
    </view>
    <block v-if="!loading && !notFound">
      <!-- 我的成绩卡：身份行 + 四格数据行（与打卡记录页的用户卡 + 统计卡同一档）。
           四个数各自一格、各带自己的标签，不再把「排名/参与人数」挤进同一格（一格只说一件事） -->
      <view class="school-block crk-my" v-if="my">
        <view class="crk-my-user" @tap="goUserRecord(my)">
          <image class="crk-avatar" :src="my.avatar || '/static/image/default-avatar.png'" mode="aspectFill" @error="onAvatarError(my)" />
          <text class="crk-my-name">{{ my.nickname }}</text>
        </view>
        <view class="crk-my-stats">
          <view class="crk-my-item" v-for="s in myStats" :key="s.label">
            <text class="crk-my-num">{{ s.value }}</text>
            <text class="crk-my-label">{{ s.label }}</text>
          </view>
        </view>
      </view>

      <view class="school-block">
        <view class="school-cell-item crk-row" v-for="(item, i) in list" :key="item.user_id" @tap="goUserRecord(item)">
          <text :class="['crk-no', item.rank <= 3 ? 'crk-no-top' : '']">{{ item.rank }}</text>
          <image class="crk-row-avatar" :src="item.avatar || '/static/image/default-avatar.png'" mode="aspectFill" @error="onAvatarError(item)" />
          <text class="crk-row-name">{{ item.nickname }}</text>
          <text class="crk-row-num">{{ item.num }}次</text>
        </view>
      </view>
      <u-empty icon="/static/image/empty.png" width="70" height="70" v-if="!list.length" text="还没有人打卡" />
      <u-loadmore :status="loadStatus" v-if="list.length && loadStatus !== 'nomore'"></u-loadmore>
    </block>

    <!-- 活动不可访问（未上架 / 不存在 / 网络异常）：不再把失败渲染成「还没有人打卡」 -->
    <u-empty v-if="!loading && notFound" :text="loadMsg" icon="/static/image/empty.png" width="70" height="70" margin-top="80"></u-empty>

    <!-- 底部导航 + 版权页脚：打卡模块各页同一档（tz-tab-bar 只在本页被配成底部导航项时渲染，自带占位不压内容） -->
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>
<style>
@import "./css.css";
</style>
