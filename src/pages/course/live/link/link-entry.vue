<template>
  <div class="link-entry-wrap">
    <!-- 连麦本地浮层（H5）：仅语音连麦显示该学员头像（方形）占位；
         视频连麦不再显示本地预览与分屏（link-local-preview / link-split-* 不再挂载），连麦中主画面保持全屏 -->
    <!-- #ifdef H5 -->
    <div
      v-show="inLink && myLinkType == 2"
      ref="localPreviewWrap"
      class="link-local-preview link-local-voice"
    >
      <!-- 语音连麦无摄像头画面：以该学员头像（方形）替代空置背景，底部保留「语音连麦中」提示 -->
      <img class="link-local-voice-avatar" :src="myAvatar" />
      <div class="link-local-voice-tip">语音连麦中</div>
    </div>
    <!-- #endif -->

    <!-- 连麦按钮已放入 message-box-bottom 工具条（带货/送礼物旁），
         点击经 live.vue -> onLinkEntryClick -> onEntryClick 转发到本组件 -->

    <!-- 申请/接听弹窗 -->
    <link-apply
      ref="linkApply"
      :show="applyVisible"
      :course-id="courseId"
      :value="inviteMode"
      :invite-data="inviteData"
      :banned="banState"
      @close="applyVisible = false"
      @applied="onApplied"
      @accepted="onAccepted"
      @status-change="onStatusChange"
      @mode-change="onModeChange"
      @preflight-media="onPreflightMedia"
    />

    <!-- 连麦中控制面板 -->
    <link-panel
      :show="panelVisible"
      :course-id="courseId"
      :link-id="myLinkId"
      :link-type="myLinkType"
      :link-start-time="linkStartTime"
      @close="panelVisible = false"
      @ended="onEnded"
      @local-change="onLocalChange"
    />
  </div>
</template>

<script src="./link-entry.js"></script>

<style scoped>
@import "./css.css";
</style>