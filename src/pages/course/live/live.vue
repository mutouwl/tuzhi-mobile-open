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
          :autoplay="videoAutoplay"
          :showProgress="!isPseudoLiveOnline"
          :resumePlay="userPlayRequested"
          :cover="data.warm_up_cover ? data.warm_up_cover : data.cover"
          :objectFit="linkConnecting ? 'contain' : (data.live_screen_ratio == 1 ? 'contain' : 'cover')"
          :pictureOffsetPercent="livePictureOffsetPercent"
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
          :showFullscreenButton="!isPseudoLiveOnline"
          controlBarVisibility="always"
          class="main-video"
        />

        <live-status-box
          @refresh="userRefresh"
          v-else
          :showBtn="roomData.status != 'end' && !blackKicked"
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
                <tz-icon name="homepage" :size="18" color="#fff"></tz-icon>
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
                @openShareGift="openShareGift"
                @openInviteRank="openInviteRank"
                @link-allow="onLinkAllow"
                @link-rejected="onLinkRejected"
                @link-invite="onLinkInvited"
                @link-approved="onLinkApproved"
                @link-ended="onLinkEnded"
                @link-invite-cancel="onLinkInviteCancel"
                @stream-status="onStreamStatus"
                @user-black="onUserBlack"
                @live-entry="onLiveEntry"
                @entry-card="onEntryCardMessage"
                @link-status="onMessageLinkStatus"
                @link-bar-state="onLinkBarState"
                @link-bar-dismiss="linkBarDismissed = true"
                :link-bar-dismissed="linkBarDismissed"
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
              <!-- 底部工具条：分享按钮那一枚只发 openShare，真正的分享弹层挂在页面根（见文件末尾 share-modal），
                   海报的封面与名称由页面自己传给那一只，工具条不再持有弹层 -->
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
                @openShare="openLiveShare"
                @popup="onToolbarPopup"
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
      :showLiveDetail="true"
      :liveCover="data.cover"
      :liveName="data.name"
      :liveBriefing="data.briefing"
      :liveStartTime="data.live_start_time"
      :liveEndTime="data.live_end_time"
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
    <!-- 分享有礼：活动清单 / 活动详情两层弹窗，右侧悬浮入口与讨论区卡片都开这一只组件。
         受邀人那一发助力仍在直播间上报（归因要落库），但进房不再弹「助力成功」那一层
         （2026-10-06 用户点名「被邀请的用户进入直播间后，不要弹出来」，见 share-gift/js.vue 的 tryAssist）。
         未安装时插件接口根本不存在（paid-plugins §一：代码即插件），入口与卡片都按这一判据收起。
         右侧栏上的位置：红包之下、达人榜之上（这一栏自上而下 红包 → 分享有礼 → 达人榜，层号见 js.vue
         的 sideEntryLevels；2026-09-30 用户点名「按红包的位置作为顶部，新增按钮依次往下排列」）。
         邀请人 id 走本系统既有分享口径，且与达人榜归因读同一份（js.vue 的 liveInviterId）：
         链接直达吃 URL 上的 share（新链如此，历史 inviter_id 链兼容保留），从课程详情页中转进来
         时 URL 上没有，取 live-inviter.js 按直播间记下的那一份（2026-10-04 现场即这一跳丢了归因） -->
    <share-gift-popup
      v-if="$tools.systemConfig('app_isinstall_share_gift')"
      ref="shareGiftPopup"
      :course-id="data.id"
      :inviter-id="liveInviterId"
      :show-entry="sideEntryVisible"
      :level="sideEntryLevels.shareGift"
      :center-y="sideEntryCenterY"
      :stack-count="sideEntryResidentShown"
      @share="openLiveShare"
      @entry-state="onShareGiftEntryState"
    ></share-gift-popup>

    <!-- 分享弹层必须挂在页面根、.ui-layer 之外：.ui-layer 自身 z-index:150 且带 position，
         是一层新的层叠上下文，里面任何 fixed 弹层（原先它挂在工具条里）z-index 再大也只在这 150 里排，
         于是被根挂载的活动详情弹层（10230）整块盖住 —— 2026-09-30 用户点名「分享弹窗出现在详情弹窗下面」。
         工具条那一枚分享按钮与两枚运营弹层的「立即分享」现在都收口到这一只（openLiveShare），
         分享链接 / 海报 / 按端取码四条端路仍只有 share-modal 一份实现（M18⑧）。
         海报画这一条直播课程的封面与名称，取本页 course.detail 已加载的数据，内容卡只有「封面 + 标题」 -->
    <share-modal
      :val="data.id"
      :visible="shareVisible"
      :title="data.name"
      :cover="data.cover"
      @close="shareVisible = false"
    ></share-modal>

    <!-- 红包入口（2026-09-30 用户点名「红包按钮移到右侧」）：右侧悬浮栏常驻那几枚里**最上那枚**，
         也就是那一整根栏的顶部锚点（`top` 那一档，level 0）——「按现在红包的位置作为顶部，后面新增的
         按钮依次往下排列」（2026-09-30 用户点名）。
         显隐判据 = 后端下发的那一枚真值 roomData.redpacket_entry（= 直播间红包开关 AND 本场发过红包，
         后端 Room::courseGetRoom 与 EntryNotice 广播共用同一份实现，前端不拼判据，见 M22）——
         用户 2026-10-04 点名「如果本场直播还没有发过红包，那么右侧按钮就不要显示红包按钮」。
         「发过」不限进行中：已抢完 / 已过期 / 已撤回的行都算数，拿进行中红包当门就是硬约束 27②
         那一族自锁——红包一过期入口自己先消失，学员再也点不开自己的手气记录
         （用户 2026-09-30 点名「点击红包入口没有弹出红包记录弹窗」）。
         与另两枚同一根栏、共用 tz-live-side-entry 一份几何，收起条件同它们（sideEntryVisible）；
         点列表里某一只才进信封，讨论区那条红包消息卡仍直连信封（openRedpacket） -->
    <tz-live-side-entry
      v-if="redpacketEntryOn"
      :level="sideEntryLevels.redpacket"
      :center-y="sideEntryCenterY"
      :stack-count="sideEntryResidentShown"
      icon="/static/image/red_packet.png"
      @open="openRedpacketRecords"
    />

    <!-- 邀请达人榜：右侧悬浮栏常驻那几枚里最下那枚（叠在分享有礼下方；这一栏自上而下 红包 → 分享有礼
         → 达人榜，需求正文「可放置在分享有礼上方」指的是分享有礼那枚之上仍有空间，排在它下方即满足，
         且用户 2026-09-30 点名整栏改成「红包在顶、依次往下」）+ 榜单 / 我的邀请两层弹层。
         未安装时插件接口与类都不存在，入口与上报都按这一判据收起（paid-plugins §一：代码即插件）。
         与分享有礼同层、在 .ui-layer 之外：悬浮入口的 z-index:160 要向 .tiktok-live-room 那层解析 -->
    <invite-rank-entry
      v-if="$tools.systemConfig('app_isinstall_invite_rank')"
      ref="inviteRankPopup"
      :course-id="data.id"
      :show-entry="sideEntryVisible"
      :level="sideEntryLevels.inviteRank"
      :center-y="sideEntryCenterY"
      :stack-count="sideEntryResidentShown"
      @share="openLiveShare"
      @entry-state="onInviteRankEntryState"
    ></invite-rank-entry>

    <!-- 消息服务连接失败那张卡（message-box 内 .link-error-box）的关闭/找回：
         卡上关闭图标把 linkBarDismissed 置 true 收起，这一枚入口点它置回 false 把卡放回来。
         显隐判据在 js.vue 的 linkBarEntryVisible（卡片本应显示 && 已被关掉 && 无弹窗/未清屏）。
         层号与另三枚不同：它**不参与** js.vue 的 sideEntryLevels 连续发号（那一拨只发红包 / 分享有礼 /
         达人榜），而是落在常驻那几枚**最下那枚之下**（层号 = 常驻此刻显示着的枚数，常驻一枚都没有就是
         0；见 js.vue 的 sideEntryLevels 注释里【二】）——
         用户多半是进房后关的那张卡，让它插进去发号就等于每关一次整根栏上移一格，
         读出来是「消息按钮出现在中间，原有的两个按钮都往上跑了」（2026-09-30 用户点名）。
         48.25 这个步进高度（入口自身高 38.25 + 上下间距 10；自身高就是一个圆底 —— 2026-10-01 用户先点名
         把这一栏收到底部工具条那一档尺寸（圆底 34），再点名「可以去掉文字，只显示icon」，文字那一层
         （间隙 4 + 文字行高 14）随之删干净，从 52/62 收到 34/44；2026-10-04 同一天两轮：先「再增大1/4」
         圆底 34 → 42.5，再「有点太大了，把放大的量缩小1/2」把增量减半 ⇒ 38.25，图标同比 18 → 20.25 /
         iconfont 24 → 27，间距始终仍 10，步进 44 → 52.5 → 48.25）
         仍是 tz-live-side-entry 自己的口径，这里不抄。图标 2026-10-06 由用户点名从 iconfont 的 warning
         （叹号，:size 27 ⇒ 墨迹 24.2×19.4）换成 `live/message_error.png`（双气泡带叹号，琥珀色），
         于是这一栏四枚全是同一型「透明底字形图」、同吃 `.tz-side-entry__icon` 的 20.25 内缩档。
         ⚠️ 那张素材原文件四周各留 8px 透明边（墨迹只占画布 67% ⇒ 装进去比同栏另三枚小一圈），
         装进 src 前已裁成 41×41（只裁边、不缩放、像素逐字节相同），墨迹 16.3px 与同栏的
         16.9 / 16.1 / 14.6 同档。下一枚素材进来先量这一条。 -->
    <tz-live-side-entry
      v-if="linkBarEntryVisible"
      :level="sideEntryLevels.linkBar"
      :center-y="sideEntryCenterY"
      :stack-count="sideEntryResidentShown"
      icon="/static/image/live/message_error.png"
      @open="linkBarDismissed = false"
    />

    <!-- 红包记录：右侧那枚红包入口开的一屏。点列表里某一只时**这一屏不关**（2026-10-01 用户点名
         「点击弹出领取红包弹窗，不要关闭这个红包记录弹窗」），信封叠在它上面，关掉信封就回到这一屏。
         分层不靠 DOM 序：信封那一份抬到 10220（遮罩 10210）、这一份留在 10210（遮罩 10200）；
         记录仍挂在 redpacket-modal 之前，同层兜底时也是信封在上 -->

    <redpacket-records
      v-if="$tools.systemConfig('app_isinstall_live_redpacket')"
      :visible="showRedpacketRecords"
      :courseId="data.id"
      @close="showRedpacketRecords = false"
      @pick="openRedpacketFromRecord"
    />

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
        <view class="live-popup-title">切换清晰度</view>
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

/* 旧的全局弹窗头档（本样式块未加 scoped，规则整站生效：其它按 popup-header / popup-title /
   popup-content 类名渲染的弹窗会与各自文件里的同名规则互相覆盖，这正是 M11 禁止通用类名的原因）。
   回放列表与切换清晰度两弹窗已改走校务 Popup 档（.live-popup-title：16px/600 左对齐、不带分隔线）；
   这一份先留着给仍用旧类名的弹窗（当场删掉会连带改到它们的观感），新增弹窗不得再用它自造居中标题行（M18） */
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

/* 弹窗标题走校务 Popup 档（.school-popup-title 同一组数值：16px/600 左对齐、不带分隔线，
   与回放列表弹窗、教务校区/套餐的选择弹窗一致；本页样式块未加 scoped，类名带页面前缀） */
.live-popup-title {
  padding: 15px 16px 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  text-align: left;
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
