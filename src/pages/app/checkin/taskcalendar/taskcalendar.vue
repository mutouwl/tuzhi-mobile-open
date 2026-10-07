<template>
  <view class="school-page">
    <!-- 内容区与区块卡走教务全局档：.school-cards（左右留边 10）+ .school-card（白底、直角、内衬 14、卡间距 10、无阴影） -->
    <view class="school-cards">
    <!-- 首屏骨架屏（替代整页 Loading）：外壳直接用真实卡的 .school-card，灰块与真实版式逐块对齐（用户卡 头像44 + 两行文字 / 三格统计 / 日历卡 / 任务卡） -->
    <block v-if="loading">
      <view class="school-card ctc-sk-card ctc-sk-head">
        <view class="ctc-sk-avatar"></view>
        <view class="ctc-sk-text">
          <u-skeleton :loading="true" :animate="true" :title="true" title-width="40%" title-height="16" :rows="1" :rows-width="['68%']" rows-height="12" />
        </view>
      </view>
      <view class="school-card ctc-sk-card ctc-sk-stats">
        <view class="ctc-sk-stat" v-for="i in 3" :key="i">
          <view class="ctc-sk-line w40"></view>
          <view class="ctc-sk-line w24"></view>
        </view>
      </view>
      <view class="school-card ctc-sk-card ctc-sk-cal"></view>
      <view class="school-card ctc-sk-card">
        <u-skeleton :loading="true" :animate="true" :title="true" title-width="58%" title-height="16" :rows="2" :rows-width="['80%', '34%']" rows-height="12" />
        <view class="ctc-sk-btn"></view>
      </view>
    </block>
    <view v-if="!loading && !notFound">
      <view class="school-card ctc-head">
        <image class="ctc-avatar" :src="avatar || '/static/image/default-avatar.png'" mode="aspectFill" @error="onAvatarError" />
        <view class="ctc-user">
          <view class="ctc-name">{{ nickname }}</view>
          <view class="ctc-join">{{ joinText }}</view>
        </view>
        <!-- 昵称右侧的编辑入口：与打卡记录页、我的-设置共用 tz-nickname-modal（field=checkin，改的是本活动打卡昵称） -->
        <view class="ctc-user-edit" @tap="openNicknameEdit">
          <tz-icon name="editor" :size="19" color="#86909c" />
        </view>
      </view>

      <view class="school-card ctc-stats">
        <view class="ctc-stat" v-for="s in statList" :key="s.label">
          <text class="ctc-stat-label">{{ s.label }}</text>
          <text class="ctc-stat-num">{{ s.value }}</text>
        </view>
      </view>

      <tz-checkin-calendar :marks="redMarks" :selected="selectedDay" @day-click="onDayClick" />

      <view class="ctc-day-title" v-if="selectedDay">{{ selectedDay }} 的任务</view>
      <tz-checkin-task-card v-for="task in dayTasks" :key="task.id" :task="task" @go="goSubmit" />
      <block v-if="selectedDay && !dayTasks.length">
        <u-empty icon="/static/image/empty.png" width="70" height="70" text="当天没有任务" />
      </block>

      <!-- 修改打卡昵称：与打卡记录页、我的-设置同一组件，field 选改哪一份、target 传活动 id -->
      <tz-nickname-modal ref="nicknameModal" field="checkin" :target="{ checkin_id: id }" :nickname="nickname" :max-len="nicknameMax" @saved="onNicknameSaved" />
    </view>
    </view>

    <!-- 活动不可访问（未上架 / 不存在 / 网络异常）：不再把失败渲染成一张零统计的空日历 -->
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
