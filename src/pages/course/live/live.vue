<template>
  <div class="tiktok-live-room container" :class="{ 'ui-hidden': isClearScreen }">
  <div class="bg-layer" :style="bgLayerStyle"></div>
    <!-- #ifdef MP -->
    <platform-limit :shareId="pageParams.id"/>
    <!-- #endif -->
  
    <!-- #ifdef H5 -->
    <!-- 直播间加载骨架屏：数据加载期间展示，布局与真实直播间结构一致 -->
    <div v-if="loading" class="live-skeleton">
      <div class="sk-header">
        <div class="sk-left">
          <div class="sk-circle"></div>
          <div class="sk-pill sk-w-60"></div>
        </div>
        <div class="sk-right">
          <div class="sk-pill sk-w-56"></div>
          <div class="sk-pill sk-w-56"></div>
        </div>
      </div>
      <div class="sk-video">
        <div class="sk-loading-content">
          <u-loading-icon
            mode="circle"
            size="36"
            color="#999"
            inactive-color="rgba(153,153,153,0.3)"
          ></u-loading-icon>
          <text class="sk-loading-tip">直播加载中…</text>
        </div>
      </div>
      <div class="sk-chat">
        <div class="sk-bubble sk-w-45"></div>
        <div class="sk-bubble sk-w-30"></div>
        <div class="sk-bubble sk-w-38"></div>
      </div>
      <div class="sk-bottom-bar">
        <div class="sk-input"></div>
        <div class="sk-circle-sm"></div>
        <div class="sk-circle-sm"></div>
      </div>
    </div>

    <template v-else>
      <!-- 1. 背景层 (高斯模糊) -->
      

      <!-- 2. 视频层 (居中显示) -->
      <div class="video-layer" :class="{ 'first-loading-hide-playbtn': videoFirstLoading }">
        <!-- 清晰度切换加载遮罩 -->
        <div v-if="qualitySwitching" class="quality-switching-overlay">
          <u-loading-icon mode="circle" size="36" color="#fff" inactive-color="rgba(255,255,255,0.35)"></u-loading-icon>
          <text class="quality-switching-text">清晰度切换中…</text>
        </div>
        <!-- 断流/卡顿缓冲遮罩：直播中断流（liveStreamStop）或播放中途卡顿时保持
             最后一帧画面并提示「直播缓冲中…」，不拆播放器、不翻「主播暂时离开」；
             恢复出画面（timeupdate）自动收起；清晰度切换遮罩优先 -->
        <div v-if="showBufferingOverlay" class="video-buffering-overlay">
          <u-loading-icon mode="circle" size="36" color="#fff" inactive-color="rgba(255,255,255,0.35)"></u-loading-icon>
          <text class="video-buffering-text">直播缓冲中…</text>
        </div>
        <!-- 首次出画面加载遮罩：起播缓冲期间给出转圈反馈，pointer-events 穿透不阻挡播放器按钮 -->
        <div v-if="videoFirstLoading" class="video-first-loading-overlay">
          <u-loading-icon mode="circle" size="36" color="#fff" inactive-color="rgba(255,255,255,0.35)"></u-loading-icon>
          <text class="video-first-loading-text">画面加载中…</text>
        </div>
        <!-- 这里的 video-box 需要支持 height="100%" 且内部 video 标签 object-fit: contain -->
        <!-- :is-live="roomData.status == 'run_playback' ? false : true" -->
        <video-box
          ref="videoBox"
          v-if="
            !videoErrorLocked && (roomData.status == 'online' || (roomData.status == 'run_playback' && videoUrl))
          "
          :source="videoUrl"
          :is-live="isCustomVideoLive"
          :autoplay="playbackAutoplay"
          :resumePlay="userPlayRequested"
          :cover="data.warm_up_cover ? data.warm_up_cover : data.cover"
          :objectFit="linkConnecting ? 'contain' : (data.live_screen_ratio == 1 ? 'contain' : 'cover')"
          :height="videoBoxHeight"
          :bulletScreen="false"
          @error="liveErrorHandle"
          @ready="videoReady"
          @play="onPlay"
          @end="onEnd"
          @paused="onPaused"
          @waiting="onVideoWaiting"
          @playing="onVideoPlaying"
          @timeupdate="onVideoTimeUpdate"
          @refresh="userRefresh"
          @onM3u8Retry="onM3u8Retry"
          @stop="liveStreamStopHandle"
          :showFullscreenButton="
            roomData.status == 'online' && data.live_type == 2 ? false : true
          "
          controlBarVisibility="always"
          class="main-video"
        />

        <live-status-box
          @refresh="userRefresh"
          v-else
          :showBtn="roomData.status != 'end'"
          :refreshing="isRefreshing"
          :tip="roomData.status_text"
          :height="videoBoxHeight"
          :startTime="data.live_start_time"
          :endTime="data.live_end_time || data.live_start_time"
          :cover="data.warm_up_cover || data.cover || ''"
        />
      </div>

      <!-- 3. UI 交互层 (清屏时隐藏) -->
      <transition name="fade">
        <div class="ui-layer" :style="{height:'calc(100% - ' + safeAreaBottom + 'px)'}" v-show="!isClearScreen">
          <!-- 顶部主播信息 -->
          <header class="live-header">
            <div class="header-left">
              <!-- 返回首页按钮 -->
              <div class="back-btn" @click="goBack">
                <tz-icon name="homepage" :size="14" color="#fff"></tz-icon>
              </div>
              <div class="anchor-info" v-if="showViewerCount">
                <div class="avatar">
                  <img src="@/static/image/video/views.png" />
                </div>
                <div class="info-text">
                  <div class="likes">{{ onlineUserNum }}</div>
                </div>
              </div>
            </div>

            <div class="header-right">
              <!-- <div class="control-btn" @click="togglePlay">
                    <img v-if="isPlaying" src="@/components/video/assets/img/smallpause.png" width="20" height="20" />
                    <img v-else="isFullscreen" src="@/components/video/assets/img/smallplay.png" width="20" height="20" />
                </div>
                <div class="control-btn" @click="toggleFullscreen">
                    <img v-if="isFullscreen" src="@/components/video/assets/img/smallscreen.png" width="20" height="20" />
                    <img v-else src="@/components/video/assets/img/fullscreen.png" width="20" height="20" />
                </div>
                <div class="control-btn" @click="refreshVideo">
                    <tz-icon name="refresh" :size="20" color="#fff"></tz-icon>
                </div> -->
              <!--  v-if="roomData.status == 'run_playback'" -->
              <div
                class="playback-btn"
                v-if="roomData.status == 'run_playback'"
                @click="modal.playbackVideo = true"
              >
                直播回放
              </div>
              <div
                class="clear-screen-btn"
                @click="modal.columnCourse = true"
                v-if="pageParams.column_id"
              >
                目录
              </div>
              <div
                class="clear-screen-btn"
                v-if="showQualitySwitch"
                @click="openQualityPopup"
              >
                {{ currentQualityName }}
              </div>
              <div class="clear-screen-btn" @click="toggleClearScreen">
                清屏
              </div>
              <div v-if="$tools.systemConfig('app_complaint') === '1'" class="clear-screen-btn" @click="goComplaint">
                投诉
              </div>
            </div>
          </header>

          <!-- 底部容器 -->
          <div
            :class="[
              'bottom-container',
              {
                'control-bottom':
                  roomData.status == 'online' ||
                  (roomData.status == 'run_playback' && videoUrl),
              },
            ]"
          >
            <!-- 底部左侧：聊天面板 -->
            <div class="message-box">
              <message-box
                ref="message"
                @control="modal.control = true"
                @openRedpacket="openRedpacket"
                @link-allow="onLinkAllow"
                @link-rejected="onLinkRejected"
                @link-invite="onLinkInvited"
                @link-approved="onLinkApproved"
                @link-ended="onLinkEnded"
                @link-invite-cancel="onLinkInviteCancel"
                @stream-status="onStreamStatus"
                @link-status="onMessageLinkStatus"
                :course_id="data.id"
                :topic="roomData.message_topic"
                :height="messageBoxHeight"
                :message-pubkey="roomData.message_pubkey"
                :message-subkey="roomData.message_subkey"
                :notice="roomData.config.notice"
                :message-provider="roomData.message_provider"
                :message-enabled="roomData.message_enabled"
              />
            </div>
            <div class="footer-control-box">
              <!-- 工具条连麦按钮显隐（:link）要求：真实直播 + 消息服务开启（连麦事件依赖消息通道实时推送） + 直播在线 + 平台可用 + 本场连麦开关 -->
              <message-box-bottom-box
                :bantalk="roomData.config.bantalk"
                @control="modal.control = true"
                :gift="roomData.config.gift"
                :goods="roomData.config.goods"
                :link="isRealLive && linkEntryInstalled && roomData.message_enabled == 1 && roomData.status == 'online' && platformLinkEnabled && (roomData.config.link == 1 || linkEntryActive) ? 1 : 0"
                @link-click="onLinkEntryClick"
                :gift_max_count="roomData.config.gift_max_count"
                :course-id="data.id"
                :is-playing="isPlaying"
                :is-fullscreen="isFullscreen"
                :safeAreaBottom="safeAreaBottom"
                :message-enabled="roomData.message_enabled"
                v-if="data.id"
              />
              <!-- 连麦弹窗/面板（live_link，H5 端）；触发按钮在 message-box-bottom 工具条。
                   仅真实直播（live_type=1）且消息服务开启时挂载：不挂载即整个连麦功能不可用；
                   邀请/同意/结束由消息服务实时推送驱动（加载时拉取一次兜底） -->
              <link-entry
                v-if="data.id && linkEntryInstalled && isRealLive && roomData.message_enabled == 1"
                ref="linkEntry"
                :course-id="data.id"
                :link="roomData.config.link"
                @link-allow="onLinkAllow"
                @link-active="onLinkActive"
                @link-connecting="onLinkConnecting"
              />
            </div>
          </div>
        </div>
      </transition>

      <!-- 恢复显示按钮 (仅在清屏模式显示，放在ui-layer外防止被隐藏) -->
      <div class="restore-btn" v-show="isClearScreen" @click="toggleClearScreen">
        恢复
      </div>
    </template>

    <!-- <div class="bg-layer" :style="bgLayerStyle"></div> -->
      <!-- <div class="bg-mask"></div> -->

    <!-- 弹窗组件保持不变，但样式需调整为底部弹出 -->
    <control-popup
      :courseId="data.id"
      :visible="modal.control"
      :bindData="data.bind_data"
      :liveDetail="data.detail"
      :limit_copy="data.limit_copy"
      @close="modal.control = false"
      @control="control"
    />

    <playbackVideoModal
      :visible="modal.playbackVideo"
      @close="modal.playbackVideo = false"
      @play="playback"
      :courseId="data.id"
      :currentVideoUrl="videoUrl"
    />


    <column-course-modal
      :visible="modal.columnCourse"
      :courseId="data.id"
      :columnId="pageParams.column_id"
      @close="modal.columnCourse = false"
      ref="columnCourseModel"
    />

    <!-- 红包弹窗 -->
    <redpacket-modal
      v-if="$tools.systemConfig('app_isinstall_live_redpacket')"
      :visible="showRedpacketModal"
      :courseId="data.id"
      :redpacketData="redpacketData"
      @close="showRedpacketModal = false"
      @grabbed="onRedpacketGrabbed"
    />

    <u-popup
      :show="qualityPopupVisible"
      @close="qualityPopupVisible = false"
      mode="bottom"
      :closeable="true"
      :round="10"
      :overlayStyle="{ zIndex: 10100 }"
      :zIndex="10110"
    >
      <view class="quality-popup-content">
        <view class="popup-header">
          <view class="popup-title">切换清晰度</view>
        </view>
        <view class="quality-list">
          <view
            v-for="item in qualityOptions"
            :key="item.key"
            class="quality-item"
            :class="{ active: isCurrentQuality(item) }"
            @click="switchQuality(item)"
          >
            <text>{{ item.name }}</text>
            <tz-icon
              v-if="isCurrentQuality(item)"
              name="check"
              :size="16"
              color="#0968f6"
            />
          </view>
        </view>
      </view>
    </u-popup>
    <!-- #endif -->
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";

/* 弹窗头部样式 */
.popup-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.popup-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.popup-content {
  padding: 0 15px 20px;
  max-height: 400px;
  overflow-y: auto;
}

/* 详情弹窗内容样式 */
.popup-content .detail-content {
  padding: 20px 0;
  line-height: 1.6;
  color: #333;
}

/* 互动弹窗内容样式 */
.popup-content .interaction-tab {
  padding: 20px 0;
}

/* 清晰度切换弹窗 */
.quality-popup-content {
  width: 100%;
  background-color: #fff;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.quality-popup-content .popup-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.quality-popup-content .popup-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.quality-list {
  padding: 10px 0;
  max-height: 400px;
  overflow-y: auto;
}

.quality-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s ease;
}

.quality-item.active {
  color: #0968f6;
  font-weight: 500;
  background-color: #f7f8fa;
}

/* 清晰度切换加载遮罩 */
.quality-switching-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.quality-switching-text {
  margin-top: 12px;
  font-size: 14px;
  color: #fff;
}

/* 断流/卡顿缓冲遮罩：与清晰度切换遮罩同视觉，保持画面并提示「直播缓冲中…」；
   不拆播放器不翻「主播暂时离开」，恢复出画面即收起 */
.video-buffering-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.35);
}

.video-buffering-text {
  margin-top: 12px;
  font-size: 14px;
  color: #fff;
}

/* 首次出画面加载遮罩：与清晰度遮罩视觉一致，但需穿透点击，
   避免挡住建播后首次点击播放的按钮；播放器自身大按钮 z-index:100 !important 不受影响 */
.video-first-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.35);
  pointer-events: none;
}

.video-first-loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #fff;
}

/* 首帧加载期间隐藏播放器大播放按钮：降级换源重建的间隙按钮会闪现一下又回到加载态
   （线上实证），期间加载反馈由页面遮罩统一给出；起播失败由降级链/看门狗接管出明确结果 */
.video-layer.first-loading-hide-playbtn .prism-big-play-btn {
  display: none !important;
}

.tiktok-live-room .prism-player .prism-cover {
  z-index: 8 !important;
}

.tiktok-live-room .prism-player .prism-big-play-btn,
.tiktok-live-room .prism-player .loading-center {
  /* 仅需高于播放器内部消息条 .prism-info-display(90)；
     与页面浮层的先后由 .ui-layer(z-index:150) 收敛——UI 层及其内的连麦/礼物等弹窗恒在本按钮之上 */
  z-index: 100 !important;
}
</style>
