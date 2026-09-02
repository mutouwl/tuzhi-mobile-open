<template>
  <div>
    <!-- 连麦中控制面板（底部弹出） -->
    <u-popup
      :show="show"
      @close="close"
      :closeable="false"
      :round="12"
      mode="bottom"
      bgColor="transparent"
      :overlayStyle="{ zIndex: 10400 }"
      :zIndex="10410"
    >
      <div class="link-panel-modal">
        <!-- 右上角关闭按钮（对齐申请弹窗） -->
        <div class="modal-close" @click="close">
          <tz-icon name="close" color="#fff" :size="12" />
        </div>

        <div class="panel-title">连麦设置</div>
        <!-- 连麦时长（顶部展示，进入连麦起计时）；语音连麦时右侧标识连麦模式 -->
        <div class="panel-duration">
          <view class="duration-text">
            连麦时长 <text class="duration-value">{{ durationText }}</text>
          </view>
          <text v-if="linkType == 2" class="panel-mode">语音连麦模式</text>
        </div>

        <!-- 语音连麦（linkType=2）隐藏摄像头，仅剩一项时 grid 居中展示 -->
        <div class="panel-grid" :class="{ 'panel-grid-single': linkType == 2 }">
          <!-- 麦克风（iconfont 无 mic 图标，用 sound-on/sound-off 表达开/关） -->
          <div class="panel-item" @click="toggleField('mute', !muted)">
            <view class="panel-icon" :class="{ active: !muted }">
              <tz-icon :name="!muted ? 'sound-on' : 'sound-off'" :color="!muted ? '#0968f6' : '#86909c'" :size="24" />
            </view>
            <text class="panel-text">{{ !muted ? '麦克风开' : '麦克风关' }}</text>
          </div>

          <!-- 摄像头（语音连麦不可用） -->
          <div
            v-if="linkType != 2"
            class="panel-item"
            @click="toggleField('video_on', videoOn ? 0 : 1)"
          >
            <view class="panel-icon" :class="{ active: videoOn }">
              <tz-icon name="video" :color="videoOn ? '#0968f6' : '#86909c'" :size="24" />
            </view>
            <text class="panel-text">{{ videoOn ? '摄像头开' : '摄像头关' }}</text>
          </div>
        </div>

        <!-- 结束连麦 -->
        <div class="panel-end" @click="endLink">结束连麦</div>
      </div>
    </u-popup>
  </div>
</template>

<script src="./link-panel.js"></script>

<style scoped>
@import "./css.css";
</style>