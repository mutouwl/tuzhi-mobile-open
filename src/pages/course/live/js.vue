<script>
var that;
import messageBox from "@/pages/course/components/message-box.vue";
import videoBox from "@/components/video/video.vue";
// import forumPopup from "@/pages/course/components/forum-popup.vue";
import controlPopup from "@/pages/course/components/control-popup.vue";
import columnBelongs from "@/pages/course/components/column-belongs.vue";
import liveStartTimeBar from "@/components/course/live-start-time-bar.vue";
import playbackVideoModal from "@/pages/course/components/playback-video.vue";
import liveStatusBox from "@/pages/course/components/live-status-box.vue";
import interactionTab from "@/pages/course/components/interaction.vue";
import courseLibrary from "@/common/utils/course.js";
import messageBoxBottomBox from "@/pages/course/components/message-box-bottom.vue";
import columnCourseModal from "@/pages/course/components/column-course-modal.vue";

import platformLimit from "@/pages/course/live/components/platform-limit.vue";
import redpacketModal from "@/pages/course/live/redpacket/redpacket-modal.vue";
// #ifdef H5
import linkEntry from "@/pages/course/live/link/link-entry.vue";
// #endif
// #ifdef H5
import PayHandle from "@/common/utils/pay.js";
// #endif
// const courseLibrary = require("@/common/utils/course.js");
// getRoomDetail 连续失败上限：达到后停止自动轮询（不再频繁请求），等待用户手动点击刷新恢复
var ROOM_DETAIL_FAIL_LIMIT = 5;
// 用户点播后的出画面看门狗窗口（从「用户点击播放」重新起算，比布防默认 6s 更宽）：
// 起播缓冲（LL-HLS 需先拉分片/Part 列表）在移动网络下可达 5~8s，若沿用页面加载时
// 布防的剩余窗口，用户停留几秒再点播放就会被误判超时 → 降级换源 → 播放器重建 →
// 大播放按钮重现，首次点击作废需再点一次（线上实测「点播放后按钮重复出现」根因）
var VIDEO_LOAD_WATCHDOG_PLAY_TIMEOUT = 10000;
// 同源续播的新鲜期（ms）：后端播流鉴权地址有效期 12 小时（live/Url.php $playExpireTime），
// 详情刷新返回的同路径新签名地址在新鲜期内沿用（不重建播放器），该场景实际不再触发，
// 逻辑保留作为兜底
var LIVE_SOURCE_KEEP_MS = 8 * 60 * 1000;
// 鉴权地址临期主动重签阈值（ms）：稳定观看期间 getRoomDetail 不会自动刷新，地址过 10 分钟
// 过期后播放器拉流 403 → 恢复失败 → liveStreamStop「主播暂时离开」（线上实证观看约 10 分钟
// 掉一次且需约 40s 才恢复）。在线在播时临近过期主动全量刷新，由 applyOnlineSourceUrl 的
// 临期重签路径换新签名重建（须大于 LIVE_SOURCE_KEEP_MS，保证重签判定生效）
var LIVE_SOURCE_RESIGN_MS = (8 * 60 + 30) * 1000;
// 是否优先选用 LL-HLS(hls_ll) 播流地址。
// 曾重新开启（2026-09-01）：意图是让 iOS 无 MSE 终端的标清/转码流落到近边缘 3~5s；
// 但 RTC（超低延时直播/ARTMC）推流期间 -llhls.m3u8 周期性 404（低延时转直播 CDN 会话重置
// 窗口），线上实证 `-llhls.m3u8?aliyunols=on` 持续 404 + playerror →「视频播放出错」。
// 单点探测 -llhls 200 不能证明协议稳定（2026-09-01 曾因单点探测恢复优选后被线上 RTC
// 周期性 404 推翻）。现保持关闭：无 MSE 终端（iOS）落标准 HLS（10~30s，RTC 流同样会
// 周期 404，由 watch 出画面看门狗 + probeHlsLlUrl 预检负缓存自动兜底），MSE 终端走 FLV（2~5s）。
// 选流顺序：artc → flv（MSE）→ 标准 hls；hls_ll 仅在显式启用时作为近边缘兜底。
// 后端 hls_ll 地址生成开关独立保留（hls_ll_enabled/low_latency），此处仅为播放端选流策略
var LL_HLS_PREFERRED = false;
// 断流缓冲宽限总时长（ms）：liveStreamStop/断流后保持播放器挂载与最后一帧画面，
// 叠加「直播缓冲中…」遮罩并 10s 周期探测恢复（RTC HLS 会话重置窗口/转码流未生成等
// 周期 404 不再立刻翻「主播暂时离开」）；超时仍未恢复则强制退到「主播暂时离开」，
// 由 10s 离线轮询继续探测重新开播（后端 CDN 状态滞后仍报 online 的真断流兜底）
var MAX_STREAM_BUFFER_MS = 60 * 1000;
export default {
  components: {
    interactionTab,
    liveStatusBox,
    playbackVideoModal,
    liveStartTimeBar,
    videoBox,
    messageBox,
    columnBelongs, 
    controlPopup,
    messageBoxBottomBox,
    columnCourseModal,
    platformLimit,
    redpacketModal
    // #ifdef H5
    ,linkEntry
    // #endif
  },
  data() {
    return {
      coverImage:"https://www.tuzhi.ltd/assets/img/tuzhi/2c924502dd0401555b9e332c7b49fc87.png",
      isClearScreen: false,
      showVideoControlBar: true,
      startX: 0,
      startY: 0,
      safeAreaBottom:0,
      tabsChecked: "detail",
      // tabsChecked: "interaction",
      tabs: [
        {
          name: "讨论",
          type: "interaction",
        },
        {
          name: "介绍",
          type: "detail",
        },
        // #ifdef MP-TOUTIAO
        {
          name: "回放",
          type: "playback",
        },
        // #endif
        {
          name: "互动",
          type: "interaction_exam",
        },
      ],
      //视频高度
      videoBoxHeight: 230,
      messageBoxHeight: 200,
      //控制区高度
      controlPanelHeight: 0,
      modal: {
        //讨论区
        forum: false,
        //控制条
        control: false,
        //课件
        courseware: false,
        //详情弹窗
        detail: false,
        //互动弹窗
        interaction: false,

        playbackVideo: false,
        columnCourse:false
      },
      data: {},
      roomData: {
        config: {},
        push_url: {},
        status_text: "正在获取直播数据",
      },
      loading: true,

      // 首次 onShow 紧跟 onLoad，此时已由 onLoad 发起首次直播详情请求；跳过这一次，
      // 避免起播时两次详情响应先后重置 videoUrl、重建播放器。
      hasShownOnce: false,
      initialRefreshStarted: false,

      isLive: true,

      roomStatus: "not_start",
      videoUrl: "",
      pageParams: {},
      studyTime: null,
      isPlaying: false,
      isFullscreen: false,
      refreshTimer: null, // 刷新定时器
      isRefreshing: false, // 刷新请求（全量 course.detail → live.room.detail / 轻量仅 live.room.detail）进行中：上一次未返回前不重复发起
      refreshPending: false, // 刷新进行期间又有刷新诉求：上一请求结束后立即补发一次
      refreshPendingFull: false, // 待补发诉求中是否包含「全量刷新（含课程详情）」：有则补全量，无则补轻量（仅直播间状态）
      refreshPendingManual: false, // 待补发诉求是否来自用户手动刷新：停机状态下补发仅放行手动来源
      roomDetailFailCount: 0, // getRoomDetail 连续未成功计数（网络异常或业务 code!=1，任一次成功即清零）
      roomDetailStopped: false, // 连续失败达上限已停止自动轮询：不再频繁请求，等待用户手动点「刷新」，成功后自动恢复
      isPageActive: true, // 页面是否活跃
      videoErrorLocked: false, // 视频播放错误锁定，阻止自动刷新
      rtsFallbackTried: false, // 本次直播会话是否已做过 RTS(artc) → FLV 降级重试（只降级一次）
      flvFallbackTried: false, // 本次直播会话是否已做过 FLV → HLS 降级重试（只降级一次）
      llhlsFallbackTried: false, // 本次直播会话是否已做过 LL-HLS(低延迟HLS) → 标准 HLS 降级重试（只降级一次）
      // 直播出画面看门狗：宿主播放器在某些失败场景不触发 error 事件（RTS SDK 加载卡住、
      // 无 MSE 终端原生 HLS 404 后无限重试），加载遮罩会永远停在「加载中」；看门狗超时强制走
      // liveErrorHandle 降级链（各协议只降一次），保证最终落到可播协议或明确错误态
      videoLoadWatchdog: null,
      videoLoadArmedUrl: "",        // 看门狗值守的 URL
      videoLoadArmedTimeout: 0,     // 本次值守的超时窗口（ms），页面不在前台顺延重挂时沿用
      videoLoadPlayingSinceArm: false, // 本次值守期间是否已确认出画面（timeupdate，playing 不可信）
      videoLoadDeadlineUrl: "",     // 看门狗截止时间所属的播放源 URL（换源/解锁重挂才重新起算）
      videoLoadDeadlineAt: 0,       // 当前播放源的看门狗截止时间戳（重复布防不重置）
      // 用户是否已表达播放意图（onPlay 触发即置位）：降级换源/重建播放器后据此自动续播，
      // 避免换源重建把大播放按钮顶回来、用户必须再点一次；错误锁定（终态）时复位
      userPlayRequested: false,
      // 当前 videoUrl 的落盘时间戳：配合同源续播判定（后端鉴权地址有效期 10 分钟，
      // 同路径地址在新鲜期内沿用，临近过期才接受重签）
      videoUrlSetAt: 0,
      // 转码清晰度协议是否已在本会话耗尽（全部 404/失败后已降回原画链）：
      // 置位后详情刷新不再回选转码流，避免「转码(未生成)→原画→刷新→转码」循环；
      // 用户手动切清晰度或新一场推流（publish 推送）时解除
      qualityFallbackToOriginal: false,
      // 首次出画面（首帧）加载遮罩：用户点击播放按钮后、首个 playing 事件前的转圈加载提示，
      // 参照清晰度切换遮罩（qualitySwitching）视觉，但 pointer-events 穿透不阻挡播放器按钮
      videoFirstLoading: false,
      // 当前是否为 H5(Web) 环境：仅 H5 可用 LL-HLS(hls_ll) 播流地址与 WebRTC；小程序走原生组件不受影响
      webEnv: (function () {
        return typeof window !== "undefined" && !!window.document;
      })(),
      // 当前环境是否支持 RTS(artc, WebRTC) 拉流：需 HTTPS 安全上下文 + 浏览器具备 WebRTC 能力。
      // 不满足时直接跳过 artc 尝试，避免每次开播先报一次错再降级
      rtsSupported: (function () {
        try {
          if (typeof window === "undefined" || !window.location) return false;
          if (String(window.location.protocol) !== "https:") return false;
          if (typeof (window.RTCPeerConnection || window.webkitRTCPeerConnection) !== "function") return false;
          // RTS 负缓存：本机 artc 失败（信令 404 等，多为域名级 RTS 未生效）后 10 分钟内跳过 artc——
          // 避免「信令 404 → 重试 → 刷新/重进又试」的循环请求。artc 播放成功即清除（见 onVideoPlaying），
          // RTS 恢复后自动回到 artc 优先
          var downUntil = parseInt(uni.getStorageSync("live_rts_down_until") || "0", 10);
          return !(downUntil > Date.now());
        } catch (e) {
          return false;
        }
      })(),
      // 当前环境是否支持 FLV(MSE) 播放：iOS Safari/微信 iOS 等无 MediaSource，FLV 不可播，
      // 强试会触发播放器「移动端不支持FLV、RTMP视频，请使用m3u8」报错，须跳过 flv 直达 hls
      mseSupported: (function () {
        try {
          if (typeof window === "undefined" || typeof window.MediaSource !== "function") return false;
          if (typeof window.MediaSource.isTypeSupported !== "function") return true;
          return !!window.MediaSource.isTypeSupported("video/mp4");
        } catch (e) {
          return false;
        }
      })(),

      qualityPopupVisible: false, // 清晰度选择弹窗
      currentQuality: null, // 当前选中的清晰度，null 表示原画
      userSelectedQuality: false, // 用户是否主动选择过清晰度
      qualitySwitching: false, // 清晰度切换加载中
      autoPlaybackAttempted: false, // 进入已结束直播页时只自动查询一次首个回放
      userPlaybackSelected: false, // 用户手动选择后不允许迟到的自动首播请求覆盖
      playbackAutoplay: false, // H5 自动首播时启用播放器的静音降级策略
      bufferingState: {
        isBuffering: false,
        startTime: 0,
        lastWaitingTime: 0,
        lastPromptTime: 0,
        timer: null,
      },
      onlineUserNum: 0, // 在线观看人数
      onlineUserTimer: null, // 在线人数轮询定时器

      // 连麦（live_link，内置基础功能，H5 端）
      linkEntryInstalled: false, // H5 端渲染连麦入口（小程序端不支持连麦）
      linkEntryActive: false, // 当前用户有进行中/已申请的连麦时保持工具条连麦按钮常显（连麦中设置面板出口）
      linkConnecting: false, // 当前用户是否已真正上麦连麦（inLink）：上麦后直播合流成片为竖屏上下/横屏左右布局，
      // 主画面由 cover（裁剪填满）切 contain（等比完整显示），保证连麦合流画面不变形（对齐 PC/web 端表现）
      // 移动端连麦是否可用（直播设置-连麦「移动端开关」，getLinkInfo.platform_link_enabled 轮询
      // 兜底/实时推送联动）：关闭后工具条连麦按钮隐藏；默认开启保证历史配置不被误屏蔽
      platformLinkEnabled: true,

      // 直播流终止过渡（liveStreamStop 触发后置位）
      streamStopped: false, // 直播流已终止，等待后端权威状态（恢复推流/直播结束）
      streamStoppedAt: 0, // 终止标记时间戳，缓冲宽限期内驱动恢复探测
      // 断流缓冲宽限态（liveStreamStop 进入，仅 H5）：保持播放器挂载与最后一帧画面，
      // 叠加「直播缓冲中…」遮罩并 10s 周期探测恢复——RTC HLS 会话重置窗口/转码流未
      // 生成的周期 404 不再立刻翻「主播暂时离开」拆播放器（线上实证"离开→恢复"频繁闪断）；
      // 出画面（timeupdate）或后端权威状态翻转离线后退出
      streamBuffering: false,
      streamBufferRetryTimer: null, // 缓冲宽限期恢复探测定时器（10s）
      maxStreamBufferAt: 0, // 缓冲宽限截止时间戳：超过仍未恢复转「主播暂时离开」
      videoBuffering: false, // 已出画面后的播放中途卡顿缓冲遮罩（保持画面，不翻状态页）
      // 卡顿缓冲遮罩延迟点亮定时器：卡顿 2s 内保持原画面不叠「直播缓冲中…」，
      // 超过 2s 才显示（短暂网络抖动 waiting 秒级恢复，立即点亮会高频闪层）
      videoBufferTimer: null,
      // 直播 m3u8 连续重试计数（onM3u8Retry）：RTC 流 HLS 周期 404 时播放器不停重试
      // 刷「GET ...m3u8 404」空转，计满阈值后走 liveErrorHandle 降级链终止空转
      m3u8RetryCount: 0,
      // 断流缓冲宽限内的快速恢复（recoverStreamStoppedIfAlive）：最近一次提前恢复时间戳与探测进行中标记。
      // 探测只能证明「流在推」，不能证明当前协议（尤其 RTS）可播——RTS 投递持续异常时流仍在推，
      // 无限频会形成「重挂→再断流→再重挂」循环；30s 限频超出后由缓冲宽限态
      // （10s 周期探测 + MAX_STREAM_BUFFER_MS 超时强制离线）兜底
      lastStreamFastRecoverAt: 0,
      streamRecoverProbing: false,
      onlineStatusTimer: null, // 直播在线时的结束探测轮询（10s 一次轻量状态查询）

      // 死流本地兜底检测：直播中最后一次播放进展时间戳（playing/timeupdate/暂停/切清晰度都会刷新）。
      // FLV/转码流断流时播放器可能不抛 liveStreamStop/error 任何事件（画面停在最后一帧），
      // 仅靠后端 CDN 状态探测存在检测滞后窗口——长时间无播放进展视为画面已冻结，
      // 由 checkLiveEnded 先行进入「主播暂时离开」过渡态并刷新，后端权威状态随后接管
      lastVideoPlayed: 0,

      // 本直播会话是否已成功出过画面（timeupdate 时间前进触发过；playing 在 RTS 半生效
      // 时会假阳性，不可作为出画面依据）。
      // 起播/切源加载阶段的 waiting 属于正常缓冲（尤其 LL-HLS 起播需先拉取分片列表），
      // 卡顿提示仅在已出画面后的播放中途卡顿才触发，避免「一开始加载就弹网络卡顿」误报
      everPlayed: false,

      // 起播期「流未就绪」自动重试计数：全链耗尽且原画流未在推（开播建流窗口/短暂断流）
      // 时不锁死，延迟拉新地址强制重挂，成功出画面或确认流在推后复位
      streamRetryCount: 0,
      // 锁定后自动解锁重建计数（上限 3 次，防「解锁→失败→再锁定」无限循环）
      errorRebuildCount: 0,
      // 待强制重建标记：锁定后状态翻转解锁时，同源续播会跳过同路径重建，
      // 置位后由 applyOnlineSourceUrl(forceRebuild) 绕过重建一次
      forceRebuildOnce: false,

      // 直播状态 SOCKET 推送（stream_status）防抖时间戳：同一 action 2s 内只处理一次
      // （阿里云回调可能重试/多端并发，配合后端 30s 去重做客户端侧二次防抖）。
      // 注意：Vue2 data 中以下划线 _ 开头的字段不会代理到 this（initData 只代理非 _/$ 开头
      // 的 key），读取会得到 undefined——字段名不能以下划线开头
      streamStatusHandledAt: {},

      // 消息服务是否已连接（SOCKET 可用）：连接成功后 getRoomDetail/结束探测降为低频兜底，
      // 直播开始已不依赖推送，状态实时性由 10s 轮询保证；未连接/断线保持快轮询（10s）
      messageConnected: false,

      // 红包相关
      redpacketData: {}, // 当前红包数据
      showRedpacketModal: false, // 红包弹窗显示状态
    };
  },
  watch: {
    videoUrl(newVal, oldVal) {
      // 直播源变化（切清晰度/降级换源/断流续播）后启动出画面看门狗，
      // 静默失败的场景由看门狗超时兜底触发降级链，避免加载遮罩无限停留；
      // 用户已表达播放意图（点过播放）的换源沿用更宽窗口，避免降级源起播
      // 稍慢又被默认窗口误杀、再次触发重建
      if (newVal && newVal !== oldVal) {
        this.armVideoLoadWatchdog(
          newVal,
          this.userPlayRequested ? VIDEO_LOAD_WATCHDOG_PLAY_TIMEOUT : undefined
        );
        // LL-HLS 地址秒级预检：封装未配置/未覆盖转码流时 -llhls.m3u8 会 404（无 MSE 终端原生
        // HLS 对 404 静默重试不触发 error），不等看门狗、直接走降级链
        this.probeHlsLlUrl(newVal);
      }
    },
    // 错误锁定后播放器被直播状态提示框替换，首次加载遮罩必须同步收起；
    // 已是终态，换源自动续播的播放意图一并复位（手动重试成功后由 onPlay 重新置位）
    videoErrorLocked(locked) {
      if (locked) {
        this.videoFirstLoading = false;
        this.userPlayRequested = false;
      } else {
        // 解锁（手动重试/状态翻起）后播放器重挂：同一 URL 重新给完整观察窗，
        // 避免沿用已过期的看门狗截止时间导致刚重挂就被立即降级
        this.videoLoadDeadlineUrl = "";
      }
    },
    // 离开在线态（断流过渡/已结束/回放切换）：播放器被状态框替换或即将卸载，
    // 首帧加载遮罩必须同步收起——否则推流结束后页面已切「主播暂时离开」仍永远显示
    // 「画面加载中」（线上实证）；恢复在线后由 waiting 事件重新置位
    "roomData.status"(val) {
      if (val !== "online") {
        this.videoFirstLoading = false;
        // 离开在线态即退出断流缓冲宽限：roomData 已由 getRoomDetail 替换为后端
        // 权威文案（主播暂时离开/直播已结束/回放中），缓冲重试定时器一并停止
        if (this.streamBuffering) {
          this.leaveStreamBuffering();
        }
      }
    },
  },
  computed: {
    /**
     * 直播页背景层（暖场图/封面）：数据未返回时 cover 为空，不能拼 url(undefined)，
     * 否则 CSS background 会请求 `/undefined` 产生 404（H5 页面 Network 噪音）
     */
    bgLayerStyle() {
      var cover = this.data ? this.data.warm_up_cover || this.data.cover : '';
      return cover ? { backgroundImage: 'url(' + cover + ')' } : {};
    },
    /**
     * 当前播放地址在 Web 端是否支持播放
     * 支持：m3u8（HLS）、mp4、flv、artc（RTS）
     * 不支持：rtmp（浏览器原生不支持）
     */
    isVideoUrlSupported() {
      if (!this.videoUrl) return false;
      var url = String(this.videoUrl).toLowerCase().split('?')[0];
      if (url.indexOf('rtmp://') === 0) return false;
      return true;
    },
    /**
     * 根据直播类型与视频地址判断是否启用直播模式
     * 回放：非直播
     * 自定义播流地址（live_type=3）：mp4 当作点播；其他（m3u8/flv/rtmp）当作直播
     * 其他直播类型：直播
     */
    isCustomVideoLive() {
      if (this.roomData.status == 'run_playback') {
        return false;
      }
      if (this.data && this.data.live_type == 3 && this.videoUrl) {
        var url = String(this.videoUrl).toLowerCase().split('?')[0];
        if (url.endsWith('.mp4')) {
          return false;
        }
      }
      return true;
    },

    /**
     * 是否显示清晰度切换按钮
     */
    showQualitySwitch() {
      return (
        this.roomData.status == 'online' &&
        this.roomData.qualities &&
        this.roomData.qualities.length >= 2
      );
    },

    /**
     * 断流/卡顿缓冲遮罩显示条件：
     * 断流缓冲宽限态（streamBuffering，liveStreamStop 进入）或播放中途卡顿
     * （videoBuffering，waiting 事件）时，在播放器上方叠加「直播缓冲中…」遮罩——
     * 保持最后一帧画面，不拆播放器、不翻「主播暂时离开」；清晰度切换遮罩优先显示
     */
    showBufferingOverlay() {
      return (
        !this.videoErrorLocked &&
        !this.qualitySwitching &&
        (this.streamBuffering || this.videoBuffering)
      );
    },

    /**
     * 当前清晰度显示名称
     * 有选中清晰度显示对应名称；否则显示「原画」。
     * 展示必须与实际播放源一致：多清晰度开启后默认档由 computeDefaultQuality 选中列表
     * 最高档并登记到 currentQuality；转码降级回原画时 currentQuality 置 null，此处如实显示原画
     */
    currentQualityName() {
      if (this.currentQuality) {
        return this.currentQuality.name;
      }
      return '原画';
    },

    /**
     * 是否为真实直播（course.live_type == 1）
     * 仅真实直播支持连麦：伪直播/自定义播流没有主播实时推流与 RTC 连麦房间，
     * 连麦按钮与连麦组件（申请/邀请）均不渲染，即整个连麦功能不可用
     */
    isRealLive() {
      return !!(this.data && this.data.live_type == 1);
    },

    /**
     * 是否显示观看人数
     * 需同时满足：运营设置开启观看人数 + 消息服务已开启
     */
    showViewerCount() {
      return (
        this.roomData.config &&
        this.roomData.config.views == 1 &&
        this.roomData.message_enabled == 1
      );
    },

    /**
     * 清晰度选项列表（包含原画）
     */
    qualityOptions() {
      var options = [];
      var hasQualities = this.roomData.qualities && this.roomData.qualities.length > 0;
      if (!hasQualities) {
        // 清晰度列表为空，只有原画
        options.push({
          key: 'original',
          name: '原画',
          level: Number.MAX_SAFE_INTEGER,
          isOriginal: true,
          url: this.roomData.push_url || {},
        });
      } else {
        this.roomData.qualities.forEach(function (item) {
          options.push({
            key: 'quality_' + item.template_id,
            name: item.name,
            level: item.level,
            template_id: item.template_id,
            isOriginal: false,
            url: item.url || {},
          });
        });
      }
      return options;
    },
  },
  methods: {
    // 刷新视频
    refreshVideo() {
      if (this.$refs.videoBox) {
        this.$refs.videoBox.refresh();
      }
    },

    control(type){
      this.modal.control = false;
      switch(type){
        case 'detail':
          this.modal.detail = true;
          break;
        case 'interaction':
          this.modal.interaction = true;
          break;
      }
    },

    /**
     * 打开红包弹窗
     * 消息体中红包内容在 message 字段（JSON 字符串），需解析后构造弹窗数据
     */
    openRedpacket(data) {
      if (!this.$tools.systemConfig('app_isinstall_live_redpacket')) {
        return;
      }
      var raw = data.data || data;
      var redpacket = raw;
      if (raw.message && typeof raw.message === 'string') {
        try {
          var content = JSON.parse(raw.message);
          redpacket = {
            id: content.redpacket_id,
            nickname: raw.nickname,
            avatar: raw.avatar,
            type: content.type,
            type_text: content.type == 'equal' ? '普通红包' : '拼手气红包',
            total_amount: content.total_amount,
            total_num: content.total_count,
            blessing: content.blessing,
            status: content.status,
            expire_time: content.expire_time,
          };
        } catch (e) {
          redpacket = raw;
        }
      }
      this.redpacketData = redpacket;
      this.showRedpacketModal = true;
    },

    /**
     * 红包被抢回调
     */
    onRedpacketGrabbed(data) {
      // 可扩展：播放动画、更新UI等
    },
    

    // 清屏功能 - 点击按钮切换
    toggleClearScreen() {
      this.isClearScreen = !this.isClearScreen;
    
      this.$refs.videoBox.showControlBar();

      // 同时控制视频控制栏的显示/隐藏
      this.showVideoControlBar = !this.isClearScreen;
    },

    /**
     * 工具条「连麦」按钮点击：转发给 link-entry 处理
     * 无连麦记录 → 直接弹窗选择语音/视频；有记录 → 展示连麦记录 + 申请连麦入口
     */
    onLinkEntryClick() {
      // #ifdef H5
      if (this.$refs.linkEntry && typeof this.$refs.linkEntry.onEntryClick === "function") {
        this.$refs.linkEntry.onEntryClick();
      }
      // #endif
    },

    /**
     * 实时感知运营设置「直播连麦」开关变化（link_allow 消息推送 / 状态拉取兜底）
     * 更新 roomData.config，驱动工具条「申请连麦」按钮及时显示/隐藏
     * 消息体兼容两种来源：消息推送（含 link/allow_link 顶层字段，嵌套 message JSON 兜底）
     * 与 link-entry poll 兜底（仅 link，以运营设置开关为准）
     */
    onLinkAllow(data) {
      if (!data || !this.roomData || !this.roomData.config) {
        return;
      }
      // 兼容 message 字段嵌套 JSON 的推送结构
      var msg = null;
      if (typeof data.message === "string") {
        try {
          msg = JSON.parse(data.message);
        } catch (e) {
          msg = null;
        }
      }

      // 主开关：运营设置「直播连麦」（config.link），驱动按钮显隐
      var link = parseInt(data.link, 10);
      if (isNaN(link)) {
        link = msg && !isNaN(parseInt(msg.link, 10)) ? parseInt(msg.link, 10) : NaN;
      }
      if (!isNaN(link)) {
        this.$set(this.roomData.config, "link", link === 1 ? 1 : 0);
      }

      // 兼容字段（历史接口仍返回 allow_link，与主开关保持一致）
      var allow = parseInt(data.allow_link, 10);
      if (isNaN(allow)) {
        allow = msg && !isNaN(parseInt(msg.allow_link, 10)) ? parseInt(msg.allow_link, 10) : NaN;
      }
      if (!isNaN(allow)) {
        this.$set(this.roomData.config, "allow_link", allow === 1 ? 1 : 0);
      }

      // 移动端平台可用（直播设置-连麦「移动端开关」，poll 兜底下发）：关闭后隐藏工具条连麦按钮
      if (data.platformEnabled !== undefined && data.platformEnabled !== null) {
        this.platformLinkEnabled = parseInt(data.platformEnabled, 10) == 1;
      }
    },

    /**
     * 实时消息：讲师已拒绝连麦申请（message-box 上抛 link-rejected）
     * 转发给 link-entry 提示学员并刷新连麦记录弹窗
     * @param {Object} data 消息体（user_id/link_id/status）
     */
    onLinkRejected(data) {
      // #ifdef H5
      if (this.$refs.linkEntry && typeof this.$refs.linkEntry.onLinkRejected === "function") {
        this.$refs.linkEntry.onLinkRejected(data);
      }
      // #endif
    },

    /**
     * 实时消息：讲师邀请连麦（message-box 上抛 link-invite，定向当前用户）
     * 转发给 link-entry 弹出邀请提醒（不再依赖周期轮询）
     * @param {Object} data 消息体（user_id/link_id/link_type/status）
     */
    onLinkInvited(data) {
      // #ifdef H5
      if (this.$refs.linkEntry && typeof this.$refs.linkEntry.onLinkInvited === "function") {
        this.$refs.linkEntry.onLinkInvited(data);
      }
      // #endif
    },

    /**
     * 实时消息：讲师取消连麦邀请（message-box 上抛 link-invite-cancel，定向当前用户）
     * 转发给 link-entry 关闭邀请弹窗并提示（不再依赖周期轮询）
     * @param {Object} data 消息体（user_id/link_id/status）
     */
    onLinkInviteCancel(data) {
      // #ifdef H5
      if (this.$refs.linkEntry && typeof this.$refs.linkEntry.onLinkInviteCancel === "function") {
        this.$refs.linkEntry.onLinkInviteCancel(data);
      }
      // #endif
    },

    /**
     * 实时消息：讲师已同意连麦申请（message-box 上抛 link-approved，定向当前用户）
     * 转发给 link-entry 自动进入连麦（不再依赖周期轮询）
     * @param {Object} data 消息体（user_id/link_id/link_type/status）
     */
    onLinkApproved(data) {
      // #ifdef H5
      if (this.$refs.linkEntry && typeof this.$refs.linkEntry.onLinkApproved === "function") {
        this.$refs.linkEntry.onLinkApproved(data);
      }
      // #endif
    },

    /**
     * 实时消息：讲师结束连麦/全员下麦（message-box 上抛 link-ended，定向当前用户）
     * 转发给 link-entry 本地下麦、恢复 CDN 播放（不再依赖周期轮询）
     * @param {Object} data 消息体（user_id/link_id/status）
     */
    onLinkEnded(data) {
      // #ifdef H5
      if (this.$refs.linkEntry && typeof this.$refs.linkEntry.onLinkEnded === "function") {
        this.$refs.linkEntry.onLinkEnded(data);
      }
      // #endif
    },

    /**
     * 当前用户连麦状态变化（申请中/连麦中/已下麦）
     * 连麦中/申请中保持工具条「连麦」按钮常显，保证连麦设置面板与取消申请等出口可用
     */
    onLinkActive(active) {
      var wasActive = this.linkEntryActive;
      this.linkEntryActive = !!active;
      // 连麦结束（下麦，active 由 true → false）：CDN 输出通道被旁路转推/合流接管后
      // 恢复原主播流，RTC 推流的 HLS manifest 会短暂 404（低延时转直播会话重置，
      // 线上实证 7X815FthEb.m3u8 连发 404）；MSE 终端直接回弹 FLV（HTTP-FLV 长连接
      // 自动续连，无 manifest 404 噪音与卡顿），并复位 flv 降级标记使 FLV 重新可用
      if (wasActive && !active) {
        this.bounceToFlvAfterLinkEnd();
      }
    },

    /**
     * 当前用户是否已真正上麦连麦（link-entry 精确上报，区别于 link-active 的「申请中也置位」）
     * 上麦后直播间 CDN 输出为连麦合流成片（竖屏上下/横屏左右布局），主播放器切 contain
     * 等比完整显示合流画面（对齐 PC/web 端表现），避免 cover 下竖屏手机直播画面被压扁
     * @param {Boolean} active 是否已上麦连麦
     */
    onLinkConnecting(active) {
      this.linkConnecting = !!active;
    },

    /**
     * 连麦下麦后回弹 FLV（MSE 终端）：
     * 当前正拉 m3u8（标准 HLS）且支持 MSE 时直接换同源 FLV，消除「连麦结束后
     * m3u8 反复 404」的请求噪音与短暂卡顿；无 MSE 终端（iOS 原生 HLS）保持原路径，
     * 由播放器原生重试自愈
     */
    bounceToFlvAfterLinkEnd() {
      if (!this.mseSupported || !this.roomData || !this.roomData.push_url) {
        return;
      }
      var path = String(this.videoUrl || '').toLowerCase().split('?')[0];
      if (path.indexOf('.m3u8') === -1) {
        return;
      }
      var flv = this.roomData.push_url.flv;
      if (!flv) {
        return;
      }
      // 复位 flv 降级标记（此前 FLV 瞬时抖动降级到 HLS 时置位），回弹后 FLV 重新可用
      this.flvFallbackTried = false;
      this.lastVideoPlayed = Date.now();
      this.videoUrlSetAt = Date.now();
      // 路径不一致（m3u8 → flv）触发播放器重建并自动续播（用户已表达播放意图）
      this.videoUrl = flv;
    },

    /**
     * 实时消息：主播推流状态变化（stream_status，message-box 上抛）
     * 负载 data = {course_id, action: publish|publish_done, status, status_text}。
     * 2026-09-01 调整：直播开始（publish）不再依赖消息服务推送，统一由 10s 轮询
     * getRoomDetail 感知开播（等待/离线页轮询到 online 后自动落盘播流地址重挂播放器），
     * 推送到达仅控制台打印日志；直播中（观看中，roomData.status=online）不因推送执行
     * 刷新/状态翻转——断流重推场景下 publish_done/publish 交替推送，若按推送立即刷新
     * 会造成周期性闪断。直播结束（publish_done）在非直播中页面仍沿用推送快速更新
     * 状态文案并轻量刷新（免等轮询周期）。
     * 防事件污染：course_id 必须匹配当前直播间，否则忽略；防抖：同一 action 2s 内
     * 只处理一次（阿里云回调重试/多端并发的客户端兜底）
     */
    onStreamStatus(data) {
      if (!data) return;
      var payload = data.data || null;
      if (!payload || !payload.course_id) return;
      // 防事件污染：非本直播间消息直接忽略
      if (String(payload.course_id) !== String(this.pageParams.id || "")) {
        return;
      }

      // 直播中（观看中）不因推送刷新页面，仅打印日志
      if (this.roomData && this.roomData.status == "online") {
        return;
      }

      // 直播开始（publish）不再由推送驱动：等待/离线页的开播感知依赖 10s 轮询
      // getRoomDetail（状态翻转为 online 时自动落盘播流地址开始观看），此处丢弃
      if (payload.action == "publish") {
        return;
      }

      // 客户端防抖：同一 action 2s 内只处理一次
      var now = Date.now();
      if (
        this.streamStatusHandledAt[payload.action] &&
        now - this.streamStatusHandledAt[payload.action] < 2000
      ) {
        return;
      }
      this.streamStatusHandledAt[payload.action] = now;

      // 推流停止（publish_done）：等待/终态页按推送状态更新文案并轻量刷新（观看中已在上方返回）
      var status = payload.status || "offline";
      var statusText = payload.status_text || "主播暂时离开";
      if (
        this.roomData &&
        (status == "end" ||
          status == "run_playback" ||
          status == "wait_playback" ||
          status == "not_start")
      ) {
        // 等待/终态页：直接更新状态文案，并轻量刷新一次规避轮询周期内的滞后
        this.roomData.status = status;
        this.roomData.status_text = statusText;
        this.refresh(false, true);
      } else {
        // 其他状态（如离线页收到断流）：轻量刷新一次
        this.refresh(false, true);
      }
    },

    // 跳转投诉页面
    goComplaint() {
      uni.navigateTo({
        url: '/pages/app/complaint/index/index?target_type=live&target_id=' + (this.data.id || this.pageParams.id || '')
          + '&target_title=' + encodeURIComponent(this.data.name || '')
      });
    },

    // 打开清晰度选择弹窗
    openQualityPopup() {
      this.qualityPopupVisible = true;
    },

    /**
     * 切换清晰度
     * @param {Object} quality 清晰度选项
     * @param {Boolean} isAutoDegrade 是否为自动降级触发
     */
    switchQuality(quality, isAutoDegrade = false) {
      if (!quality) return;

      this.qualityPopupVisible = false;
      this.clearBufferingState();
      // 标记用户主动选择过清晰度
      this.userSelectedQuality = true;
      // 用户主动选择：解除「转码耗尽回原画」粘性（尊重用户选择，转码流给重新机会）
      this.qualityFallbackToOriginal = false;

      var targetUrl = '';
      if (quality.isOriginal) {
        // 切回原画：清除「原画流」LL-HLS 负缓存（按流隔离后仅清除原画 hls_ll 的 key，
        // 转码流 404 的负缓存不误伤原画；历史域名级 key 一并清除兜底）
        this.clearLlhlsDown(this.roomData.push_url ? this.roomData.push_url.hls_ll : "");
        // 直播播放优先 RTS(artc，低延迟 0.5-2s)，其次 flv（2-5s，仅支持 MSE 的终端），HLS 作兜底。
        // 本会话已降级过 RTS（rtsFallbackTried）则不再尝试 artc，避免切回原画又报错；
        // 无 MSE 终端直选标准 HLS（LL_HLS_PREFERRED=false 后不再落入不稳定的 -llhls）
        targetUrl = this.roomData.push_url
          ? (this.rtsFallbackTried
              ? ((this.mseSupported ? this.roomData.push_url.flv : '') ||
                 (LL_HLS_PREFERRED && this.roomData.push_url.hls_ll
                   ? this.roomData.push_url.hls_ll
                   : '') ||
                 this.roomData.push_url.hls)
              : this.pickOriginalUrl(this.roomData.push_url))
          : '';
        this.currentQuality = null;
      } else {
        // 转码清晰度流：转码流地址后端同样生成 artc（官方口径「转码流地址支持 RTS 格式」），
        // 与原画同规则按终端能力挑选（RTS 可用优先 artc，MSE 终端 flv，无 MSE 终端 hls_ll→hls）；
        // 本会话已降级过 RTS 则不再尝试 artc（与原画一致），避免切清晰度后再次报错
        targetUrl = quality.url ? this.pickQualityUrl(quality.url, this.rtsFallbackTried) : '';
        this.currentQuality = {
          name: quality.name,
          level: quality.level,
          template_id: quality.template_id,
          url: quality.url,
        };
      }

      // 缓存当前选择的清晰度
      if (this.currentQuality && this.currentQuality.template_id) {
        try {
          uni.setStorageSync('live_quality_' + this.pageParams.id, this.currentQuality.template_id);
        } catch (e) {}
      }

      if (!targetUrl || targetUrl === this.videoUrl) {
        return;
      }

      // 切源后由播放器的 playing 事件关闭遮罩；兜底定时器避免异常流导致遮罩常驻。
      this.qualitySwitching = true;
      // 主动切清晰度期间的加载等待不参与死流兜底检测
      this.lastVideoPlayed = Date.now();
      clearTimeout(this._qualitySwitchTimer);
      var self = this;
      this._qualitySwitchTimer = setTimeout(function () {
        self.qualitySwitching = false;
      }, 15000);
      this.videoUrlSetAt = Date.now();
      this.videoUrl = targetUrl;
    },

    /**
     * 判断是否为当前选中的清晰度
     */
    isCurrentQuality(quality) {
      if (quality.isOriginal) {
        return this.currentQuality === null;
      }
      return (
        this.currentQuality &&
        this.currentQuality.template_id == quality.template_id
      );
    },

    /**
     * 直播出画面看门狗：宿主播放器在某些失败场景不触发 error 事件（RTS 信令 404 后 SDK
     * 无限重试、无 MSE 终端原生 HLS 拉 404 流后静默重试），加载遮罩会永远停在「加载中」。
     * 约定超时（6s）内未确认出画面（timeupdate 时间前进）即强制走 liveErrorHandle 降级链
     * ——降级链内各协议只降一次，最终必然落到可播协议或明确的错误态，不再无限等待。
     * 此前默认 10s 是「第一次开播等待 10s+ 才出画面」的直接组成部分（开播建流期静默源
     * 白等满窗才降级/重试），缩短到 6s 后配合「流未就绪自动重试」起播明显更快。
     * 截止时间按播放源 URL 记一次：play/ready 事件（含 RTS 重试风暴）重复布防只按剩余
     * 时间挂定时器，不再重置窗口；换源/错误解锁重挂才重新起算
     * @param {String} url 值守的播放地址（与当前 videoUrl 不一致时本次值守自动失效）
     * @param {Number} timeoutMs 本次值守的超时窗口，缺省 6s；用户点播后的重新布防传更宽窗口
     */
    armVideoLoadWatchdog(url, timeoutMs) {
      var that = this;
      this.clearVideoLoadWatchdog();
      this.videoLoadArmedUrl = url || "";
      this.videoLoadPlayingSinceArm = false;
      // 仅直播场景值守（状态 online，含伪直播）；回放慢起缓冲属正常，不参与
      if (!url || this.roomData.status !== "online") {
        return;
      }
      this.videoLoadArmedTimeout = typeof timeoutMs === "number" ? timeoutMs : 6000;
      if (this.videoLoadDeadlineUrl !== url) {
        this.videoLoadDeadlineUrl = url;
        this.videoLoadDeadlineAt = Date.now() + this.videoLoadArmedTimeout;
      }
      this.scheduleVideoLoadWatchdog();
    },

    /**
     * 按当前截止时间挂看门狗定时器（重复布防共用同一截止时间，仅剩余时间递减）
     */
    scheduleVideoLoadWatchdog() {
      var that = this;
      var remaining = this.videoLoadDeadlineAt - Date.now();
      if (remaining <= 0) {
        remaining = 250;
      }
      this.videoLoadWatchdog = setTimeout(function () {
        that.videoLoadWatchdog = null;
        // 已换源 / 已出画面 / 已锁死：本次值守结束
        if (that.videoUrl !== that.videoLoadArmedUrl) return;
        if (that.videoLoadPlayingSinceArm || that.videoErrorLocked) return;
        if (!that.isPageActive) {
          // 页面不在前台顺延：截止时间重推一个完整窗口，避免后台期间被误判
          that.videoLoadDeadlineAt = Date.now() + that.videoLoadArmedTimeout;
          that.scheduleVideoLoadWatchdog();
          return;
        }
        console.warn("[live] video load watchdog timeout:", that.videoLoadArmedUrl);
        that.liveErrorHandle({ errMsg: "video load watchdog timeout" });
      }, remaining);
    },

    /**
     * 取消直播出画面看门狗
     */
    clearVideoLoadWatchdog() {
      if (this.videoLoadWatchdog) {
        clearTimeout(this.videoLoadWatchdog);
        this.videoLoadWatchdog = null;
      }
    },

    /**
     * HLS 播流地址快速预检（仅 H5，fetch 秒级）：
     * - -llhls.m3u8：直播封装未配置/未覆盖该流时会 404（线上实证 _lsd-llhls.m3u8 由「可播」变 404）；
     * - 转码清晰度的 m3u8（currentQuality 登记中）：转码流在推流开始后需数秒~数十秒才生成，
     *   未就绪期间全部协议地址 404；
     * 无 MSE 终端的原生 HLS 对 404 是静默重试、不触发 error 事件，只能等出画面看门狗——
     * 这里秒级预检后立即走 liveErrorHandle 降级链（-llhls 降同源标准 HLS；转码标准 m3u8
     * 无协议可降 → 转码耗尽分支回原画链）。fetch 网络异常不作失效判据（弱网误判），仍由看门狗兜底
     * @param {String} url 当前播放地址（与 videoUrl 不一致时探测结果作废）
     */
    probeHlsLlUrl(url) {
      var that = this;
      var urlLower = String(url || "").toLowerCase();
      var isArtc = urlLower.indexOf("artc://") === 0;
      var isLlhls = urlLower.indexOf("-llhls.m3u8") > -1;
      var isTranscodeM3u8 =
        !!this.currentQuality && urlLower.split("?")[0].endsWith(".m3u8");
      if (
        !this.webEnv ||
        !url ||
        typeof fetch !== "function" ||
        (!isArtc && !isLlhls && !isTranscodeM3u8)
      ) {
        return;
      }
      // 注意：不要对 artc 做「GET https 信令地址」预检——RTS 信令网关只接受携带真实 WebRTC
      // SDP offer 的 POST（浏览器实测：SDK subscribe 200 + 媒体流成功，同一 URL 的 GET/假 body
      // POST 一律 404），GET 404 不能证明 RTS 未生效，反而会把已生效的 RTS 误杀降级到
      // FLV/HLS 档（2026-08-30 实测推翻早前「信令 404 = RTS 未生效」判读）。
      // artc 失败的真实兜底 = liveRetry=1 + rtsLoadDataTimeout=3000 快速上抛 error +
      // liveErrorHandle 降级链 + 出画面看门狗，无需预检。
      if (isArtc) {
        return;
      }
      try {
        fetch(url)
          .then(function (res) {
            if (!res.ok) {
              return "";
            }
            return res.text();
          })
          .then(function (body) {
            // 地址已被降级链换掉 / 已锁死：本次探测作废
            if (that.videoUrl !== url || that.videoErrorLocked) {
              return;
            }
            if (!body || body.indexOf("#EXT-X") === -1) {
              console.warn("[live] hls source probe failed:", url);
              // -llhls 404 负缓存：封装未配置/未生效时 10 分钟内本机跳过 hls_ll 直选标准 HLS，
              // 避免每次进页都先打一次 404 预检请求；封装恢复后 TTL 到期自动重试，
              // hls_ll 成功出画面即清除（onVideoTimeUpdate）。
              // 持久化以「原画流正在推」为前提（persistLlhlsDown）——开播初期/断流期的 404
              // 不能证明封装缺失，误写会把已恢复的 LL-HLS 压住 10 分钟（iOS 落回标准 HLS 10s 档）
              if (isLlhls) {
                that.persistLlhlsDown(url);
              }
              // 交降级链按地址形态分流：-llhls → 同源标准 HLS；转码标准 m3u8 → 转码耗尽回原画
              that.liveErrorHandle({ errMsg: "hls source probe 404/invalid" });
            }
          })
          .catch(function () {
            // fetch 异常不作为失效判据，交给出画面看门狗兜底
          });
      } catch (e) {}
    },

    /**
     * LL-HLS 负缓存是否生效：直播封装未配置/未生效期间 -llhls.m3u8 404 后 10 分钟内，
     * 本机选流跳过该流的 hls_ll 直选标准 HLS（写入见 probeHlsLlUrl/liveErrorHandle，
     * 清除见 onVideoTimeUpdate；封装恢复后 TTL 到期自动重试 LL-HLS）。
     * 负缓存**按流隔离**（key 取 -llhls 地址中的流名）：LL-HLS 实为按流生效——
     * 线上实证原画流 -llhls.m3u8 200（直播封装已覆盖）、转码流 -llhls.m3u8 404
     * （封装未覆盖转码流）；按域名全局压会把可用流的 hls_ll 一并压掉，iOS 端只能
     * 落标准 HLS（20~30s 延迟，多清晰度下标清延迟 30s 的根因之一）。
     * 兼容旧版域名级 key（live_llhls_down_until）：存量缓存未到期时同样视为生效，
     * 自然过期后不再续写
     * @param {String} url hls_ll 地址（缺失时仅判断旧版域名级缓存）
     */
    llhlsDownActive(url) {
      try {
        var key = this.llhlsCacheKey(url);
        if (key) {
          var perStream = parseInt(uni.getStorageSync(key) || "0", 10);
          if (perStream > Date.now()) {
            return true;
          }
        }
        // 旧版域名级缓存兼容（存量数据自然过期后即失效）
        var legacy = parseInt(uni.getStorageSync("live_llhls_down_until") || "0", 10);
        return legacy > Date.now();
      } catch (e) {
        return false;
      }
    },

    /**
     * LL-HLS 负缓存的按流 key：从 -llhls 地址提取流名（如 7X815FthEb_240p），
     * key = live_llhls_down_ + 流名；无法解析（非 hls_ll 地址）返回空串
     * @param {String} url hls_ll 地址
     * @return {String} 负缓存 storage key，解析失败返回 ""
     */
    llhlsCacheKey(url) {
      try {
        var u = String(url || "").split("?")[0];
        if (u.indexOf("-llhls.m3u8") === -1) {
          return "";
        }
        var name = u.split("/").pop().replace(/-llhls\.m3u8$/i, "").replace(/\.m3u8$/i, "");
        if (!name) {
          return "";
        }
        return "live_llhls_down_" + name;
      } catch (e) {
        return "";
      }
    },

    /**
     * 清除 LL-HLS 负缓存（按流）：负缓存为按流生效，转码流 404 只压转码流自己，
     * 切回原画/原画 hls_ll 可播时仅需清除原画流对应 key；url 缺失时同时清除旧版
     * 域名级 key（兼容历史清理语义）
     * @param {String} url 需要恢复尝试的 hls_ll 地址（可空）
     */
    clearLlhlsDown(url) {
      try {
        var key = this.llhlsCacheKey(url);
        if (key) {
          uni.removeStorageSync(key);
        }
        uni.removeStorageSync("live_llhls_down_until");
      } catch (e) {}
    },

    /**
     * 原画流可达性探测（仅 H5，fetch 秒级）：
     * 用于区分「协议/封装确实不可用」与「开播初期/断流期流本身未就绪」——
     * 后者在直播中随时出现（推流刚开始 CDN 未生成、主播短暂断流），此时各协议 404
     * 均不能证明协议坏了，写跨会话负缓存会把自己之后 10 分钟的可用协议压掉。
     * 探测候选按序尝试：当前播放源 → 原画 FLV → 原画 HLS，任一返回直播流内容
     * （HTTP-FLV 魔数「FLV」/ HLS 播放列表头「#EXTM3U」）即视为原画流在推。
     * 本播流域名标准 HLS 封装 404（线上实证同一时刻 flv 200 / m3u8 404），旧实现只用
     * m3u8 探测会把「流在推」误判为「未在推」——断流快速恢复（recoverStreamStoppedIfAlive）
     * 与错误解锁（getRoomDetail 翻转）永不触发，观众卡在「主播暂时离开/视频加载失败」
     * 直到 30s 防御窗/后端状态翻转才恢复，且每次探测都打出一条 m3u8 404 网络噪音。
     * 3s 超时/全部候选失败一律按「不可知」处理（返回 false，不写负缓存，行为与历史一致）
     * @return {Promise<boolean>} true=原画流正在推
     */
    originalStreamAlive() {
      var that = this;
      return new Promise(function (resolve) {
        var pushUrl = (that.roomData && that.roomData.push_url) || {};
        // 探测候选：当前播放源（完整带鉴权参数）→ 原画 FLV → 原画 HLS；去重避免重复请求
        var urls = [];
        var current = String(that.videoUrl || "");
        if (/^https?:/i.test(current) && urls.indexOf(current) === -1) {
          urls.push(current);
        }
        if (pushUrl.flv && urls.indexOf(pushUrl.flv) === -1) {
          urls.push(pushUrl.flv);
        }
        if (pushUrl.hls && urls.indexOf(pushUrl.hls) === -1) {
          urls.push(pushUrl.hls);
        }
        if (!that.webEnv || urls.length === 0 || typeof fetch !== "function") {
          resolve(false);
          return;
        }
        var settled = false;
        var done = function (result) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(result);
        };
        var timer = setTimeout(function () {
          done(false);
        }, 3000);
        var idx = 0;
        var tryNext = function () {
          if (idx >= urls.length) {
            done(false);
            return;
          }
          var url = urls[idx++];
          fetch(url)
            .then(function (res) {
              if (res.status !== 200 && res.status !== 206) {
                // 该候选不可用（404/403）→ 尝试下一个候选
                tryNext();
                return;
              }
              // 读首个数据块验证内容特征后立即断开，避免 HTTP-FLV 长连接持续拉流
              var reader = res.body && res.body.getReader ? res.body.getReader() : null;
              if (!reader) {
                done(true);
                return;
              }
              reader
                .read()
                .then(function (chunk) {
                  try {
                    reader.cancel();
                  } catch (e) {}
                  var bytes = chunk && chunk.value ? new Uint8Array(chunk.value) : new Uint8Array(0);
                  var head = "";
                  for (var i = 0; i < Math.min(bytes.length, 8); i++) {
                    head += String.fromCharCode(bytes[i]);
                  }
                  if (head.indexOf("FLV") === 0 || head.indexOf("#EXTM3U") === 0) {
                    done(true);
                  } else {
                    tryNext();
                  }
                })
                .catch(function () {
                  tryNext();
                });
            })
            .catch(function () {
              // 当前候选探测失败（弱网/CORS/暂不可用）→ 顺序尝试下一个候选
              tryNext();
            });
        };
        tryNext();
      });
    },

    /**
     * RTS 负缓存持久化（流在推才落盘）：liveErrorHandle RTS 失败分支调用，
     * 内存级 rtsSupported=false / rtsFallbackTried 已同步置位，本会话行为不受影响
     */
    persistRtsDown() {
      var that = this;
      this.originalStreamAlive().then(function (alive) {
        if (!alive) return;
        try {
          uni.setStorageSync("live_rts_down_until", String(Date.now() + 10 * 60 * 1000));
        } catch (e) {}
      });
    },

    /**
     * LL-HLS 负缓存持久化（按流、流在推才落盘）：probeHlsLlUrl -llhls 404 分支与
     * liveErrorHandle LL-HLS 失败分支调用，url 为实际失败的 hls_ll 地址——
     * 只压该流，不误伤同域名其他流的 hls_ll
     * @param {String} url 失败的 hls_ll 地址
     */
    persistLlhlsDown(url) {
      var that = this;
      this.originalStreamAlive().then(function (alive) {
        if (!alive) return;
        try {
          var key = that.llhlsCacheKey(url || that.videoUrl);
          if (key) {
            uni.setStorageSync(key, String(Date.now() + 10 * 60 * 1000));
          }
        } catch (e) {}
      });
    },

    /**
     * 转码流负缓存持久化（流在推才落盘）：liveErrorHandle 转码耗尽回原画分支调用
     */
    persistTranscodeDown() {
      var that = this;
      this.originalStreamAlive().then(function (alive) {
        if (!alive) return;
        try {
          uni.setStorageSync("live_transcode_down_until", String(Date.now() + 10 * 60 * 1000));
        } catch (e) {}
      });
    },

    /**
     * 视频缓冲事件
     */
    onVideoWaiting() {
      // 首次出画面（首帧）加载：起播/切源后、首个 playing 之前的缓冲显示转圈加载遮罩，
      // 与多清晰度提示解耦（showQualitySwitch 关闭、且无转码清晰度时同样给出加载反馈）；
      // 降级换源（artc→hls_ll→hls 等）期间遮罩保持，直至出画面或错误锁定
      if (
        !this.everPlayed &&
        !this.qualitySwitching &&
        this.roomData.status === "online" &&
        !this.videoErrorLocked
      ) {
        this.videoFirstLoading = true;
      }
      // 已出画面后的播放中途卡顿：卡顿 2s 内保持原画面不叠层（短暂抖动立即点亮
      // 会高频闪现「直播缓冲中…」），超过 2s 才显示遮罩（保持当前画面，不拆播放器
      // 不翻状态页、不弹频繁提示），恢复播放（timeupdate/play）自动收起
      if (
        this.everPlayed &&
        !this.qualitySwitching &&
        !this.streamStopped &&
        !this.videoErrorLocked &&
        !this.videoBuffering &&
        !this.videoBufferTimer
      ) {
        var bufSelf = this;
        this.videoBufferTimer = setTimeout(function () {
          bufSelf.videoBufferTimer = null;
          // 2s 内已恢复出画面（timeupdate/play 会清掉该定时器）则不点亮
          if (
            bufSelf.everPlayed &&
            !bufSelf.qualitySwitching &&
            !bufSelf.streamStopped &&
            !bufSelf.videoErrorLocked
          ) {
            bufSelf.videoBuffering = true;
          }
        }, 2000);
      }
      if (!this.showQualitySwitch) return;

      // 首次出画面的起播/切源加载阶段不提示（LL-HLS 起播拉取分片列表本身需数秒缓冲）；
      // 仅在已成功出过画面后的播放中途卡顿才计时提示
      if (!this.everPlayed) return;

      var now = Date.now();
      if (
        !this.bufferingState.isBuffering ||
        now - this.bufferingState.lastWaitingTime > 3000
      ) {
        this.clearBufferingState();
        this.bufferingState.isBuffering = true;
        this.bufferingState.startTime = now;
        var that = this;
        this.bufferingState.timer = setTimeout(function () {
          that.promptSwitchQuality();
        }, 5000);
      }
      this.bufferingState.lastWaitingTime = now;
    },

    /**
     * 视频恢复播放事件
     * playing ≠ 出画面：RTS 信令 404 等半生效场景下播放器会反复触发 play/playing 却永远
     * 无帧渲染，此前据此清看门狗/置 everPlayed/清负缓存，会永远停在死源上不降级
     * （线上实证：一直画面加载中、循环请求 artc 信令地址）。真实出画面统一由
     * onVideoTimeUpdate（时间前进=有帧渲染）确认并承接全部副作用
     */
    onVideoPlaying() {},

    /**
     * 播放进展事件（playing 期间高频触发）：
     * 当前播放源首次 timeupdate 即确认真实出画面——清看门狗、收加载遮罩、清 RTS/转码负缓存。
     * 以 videoLoadPlayingSinceArm（每次布防复位）判定本源是否已确认，切清晰度/换源后
     * 新源仍需重新确认（否则新源看门狗永不清除，会把成功的切换误降级）
     */
    onVideoTimeUpdate() {
      this.lastVideoPlayed = Date.now();
      // 播放中途卡顿结束（恢复出画面）：收起「直播缓冲中」遮罩（含 2s 延迟点亮定时器），
      // 并复位 m3u8 连续重试计数（出画面说明 m3u8 已恢复可用）
      this.clearVideoBufferTimer();
      this.videoBuffering = false;
      this.m3u8RetryCount = 0;
      // 断流缓冲宽限态恢复出画面：解除终止标记并退出缓冲态（缓冲重试定时器停止）
      if (this.streamBuffering) {
        this.streamStopped = false;
        this.streamStoppedAt = 0;
        this.leaveStreamBuffering();
      }
      if (this.videoLoadPlayingSinceArm) {
        return;
      }
      // 本播放源首次真实出画面（timeupdate = 时间前进 = 有帧渲染）
      this.everPlayed = true;
      // 播放链路已恢复：复位「流未就绪自动重试」与「锁定后自动重建」计数
      this.streamRetryCount = 0;
      this.errorRebuildCount = 0;
      // 转码清晰度成功出画面：清除转码流负缓存（本机转码可用），后续进页回到转码优先
      if (this.currentQuality && this.currentQuality.template_id) {
        try {
          uni.removeStorageSync("live_transcode_down_until");
        } catch (transCacheErr) {}
      }
      // artc 成功出画面：清除 RTS 负缓存（本机 RTS 可用），后续刷新/重进继续 artc 优先
      if (this.videoUrl && String(this.videoUrl).indexOf("artc://") === 0) {
        try {
          uni.removeStorageSync("live_rts_down_until");
        } catch (rtsCacheErr) {}
      }
      // hls_ll 成功出画面：清除该流 LL-HLS 负缓存（直播封装已可用），后续进页恢复 LL-HLS 优先
      if (this.videoUrl && String(this.videoUrl).toLowerCase().indexOf("-llhls.m3u8") > -1) {
        try {
          this.clearLlhlsDown(this.videoUrl);
        } catch (llhlsCacheErr) {}
      }
      // 已出画面：解除首次加载遮罩与加载看门狗（静默失败兜底不再触发）
      this.videoFirstLoading = false;
      this.videoLoadPlayingSinceArm = true;
      this.clearVideoLoadWatchdog();
      this.clearBufferingState();
      // 清晰度切换加载完成
      if (this.qualitySwitching) {
        this.qualitySwitching = false;
        clearTimeout(this._qualitySwitchTimer);
      }
    },

    /**
     * 播放器 m3u8 重试事件
     * RTC 流 HLS 周期 404（低延时转直播 CDN 会话重置）时播放器会不停重试刷
     * 「GET ...m3u8 404」空转并反复触发 waiting →「直播缓冲中」驻留；连续重试满
     * 2 次即走 liveErrorHandle 降级链（MSE 终端回弹 FLV 长连接自愈，无 MSE 终端
     * 由降级/重试/看门狗链路接管），终止无效 404 请求
     */
    onM3u8Retry() {
      if (
        this.roomData.status !== "online" ||
        !this.isLive ||
        this.videoErrorLocked ||
        this.streamStopped
      ) {
        return;
      }
      this.m3u8RetryCount = (this.m3u8RetryCount || 0) + 1;
      // 仅 MSE 终端升级降级链（可回弹 FLV 长连接自愈）；无 MSE 终端（iOS 原生 HLS）
      // FLV 不可播，保持播放器自行重试，由 liveStreamStop→缓冲宽限探测链路兜底恢复
      if (this.m3u8RetryCount >= 2 && this.mseSupported) {
        this.m3u8RetryCount = 0;
        this.liveErrorHandle({ errMsg: "m3u8 retry exhausted" });
      }
    },

    /**
     * 清理卡顿缓冲遮罩 2s 延迟点亮定时器（timeupdate/play 恢复、卸载时调用）
     */
    clearVideoBufferTimer() {
      if (this.videoBufferTimer) {
        clearTimeout(this.videoBufferTimer);
        this.videoBufferTimer = null;
      }
    },

    /**
     * 清除卡顿检测状态
     */
    clearBufferingState() {      if (this.bufferingState.timer) {
        clearTimeout(this.bufferingState.timer);
      }
      var lastPrompt = this.bufferingState.lastPromptTime;
      this.clearVideoBufferTimer();
      this.videoBuffering = false;
      this.bufferingState = {
        isBuffering: false,
        startTime: 0,
        lastWaitingTime: 0,
        lastPromptTime: lastPrompt,
        timer: null,
      };
    },

    /**
     * 卡顿提示切换清晰度
     * 不自动切换，仅提示用户手动切换，1 分钟最多提示 1 次
     */
    promptSwitchQuality() {
      if (!this.showQualitySwitch) return;

      // 1 分钟内已提示过则不再提示
      var now = Date.now();
      if (now - this.bufferingState.lastPromptTime < 60000) {
        return;
      }
      this.bufferingState.lastPromptTime = now;

      // 判断是否存在更低清晰度可供切换
      var currentLevel = this.currentQuality
        ? this.currentQuality.level
        : Number.MAX_SAFE_INTEGER;
      var hasLower = this.qualityOptions.some(function (item) {
        return !item.isOriginal && item.level < currentLevel;
      });

      if (hasLower) {
        uni.$u.toast('当前网络不佳，建议切换较低清晰度');
      }
    },

    // 返回上一页
    goBack() {
      this.goHome();
    },

    // #ifdef H5
    /**
     * 接收 iframe 弹窗（带货详情/订单页）发来的微信支付请求，转由顶层窗口发起支付
     * iframe 内微信 JSSDK 支付与 WAP 收银台不可用，必须在顶层窗口执行
     */
    handleIframePayMessage(event) {
      if (event.origin !== window.location.origin) {
        return;
      }
      var data = event.data || {};
      if (data.type !== 'tuzi-live-pay' || !data.payload || !data.payload.order_no) {
        return;
      }
      new PayHandle(
        data.payload.pay_type,
        data.payload.order_no,
        function () { },
        data.payload.is_go_order !== false
      );
    },
    // #endif

    // 跳转到首页
    goHome() {
      uni.reLaunch({
        url: '/pages/index/index'
      });
    },
    /**
     * 播放回放视频
     */
    playback(url, autoplay = false) {
      if (!url) return;

      if (!autoplay) {
        this.userPlaybackSelected = true;
      }
      this.videoErrorLocked = false;
      this.playbackAutoplay = autoplay;
      this.videoUrlSetAt = Date.now();
      this.videoUrl = url;
      this.isLive = false;
      this.modal.playbackVideo = false;

      // 首次选择时播放器组件刚挂载；等待 DOM/播放器实例就绪后主动播放，
      // 同时兼容再次点击当前回放地址（source 不变化、watch 不会触发）的场景。
      this.$nextTick(() => {
        if (this.$refs.videoBox) {
          this.$refs.videoBox.play();
        }
      });
    },

    /**
     * 已开启回放且直播结束时，进入页面自动播放列表中的第一条回放。
     */
    autoPlayFirstPlayback(roomData) {
      if (
        this.autoPlaybackAttempted ||
        !roomData ||
        roomData.status !== 'run_playback' ||
        !roomData.config ||
        roomData.config.play_back != 1
      ) {
        return;
      }

      this.autoPlaybackAttempted = true;
      var self = this;
      this.$api('live.room.playback', {
        course_id: this.pageParams.id,
      }).then(function (res) {
        if (!res || res.code !== 1) {
          // 请求失败时允许页面下次显示/刷新后重新尝试。
          self.autoPlaybackAttempted = false;
          return;
        }
        var list = res && res.code === 1 && Array.isArray(res.data) ? res.data : [];
        if (!self.userPlaybackSelected && list.length > 0 && list[0].file_path) {
          self.playback(list[0].file_path, true);
        }
      }).catch(function () {
        self.autoPlaybackAttempted = false;
      });
    },

    //tabs切换事件
    tabsChange(option) {
      this.tabsChecked = option.type;
    },

    /**
     * 获取课程信息
     */
    getData(addViews = false) {
      // that.loading = true;

      courseLibrary.stopStudyLog();

      courseLibrary.banScreenRecordStart();
      // clearInterval(that.studyTime);
      that
        .$api("course.detail", {
          id: this.pageParams.id,
          add_views:addViews
        })
        .then((res) => {
          uni.stopPullDownRefresh();
          uni.hideLoading();
          that.loading = false;
          if (res.code === 1) {
            if (!res.data.subscription || res.data.type != "live") {
              that.$nav.to(
                "/pages/course/detail/detail?id=" + that.pageParams.id,
                "local",
                "redirectTo"
              );
              that.finishRefresh();
              return false;
            }
            // #ifdef MP-WEIXIN
            //检查PC端是否能学习
            courseLibrary.checkBanPc(res.data.type, res.data.id);
            // #endif

            that.data = res.data;

            // #ifdef H5
            this.$nav.share(res.data.name, '', res.data.warm_up_cover || res.data.cover);
            // #endif

            // 页面已隐藏/卸载时不再启动学习记录定时器，避免异步响应晚于 onHide/onUnload 触发导致定时器泄漏、日志接口持续上报
            if (that.isPageActive) {
              courseLibrary.intervalSetStudyLog(res.data.id,that.pageParams.column_id);
            }

            

            // 详情请求（live.room.detail）结束后统一复位刷新标记；
            // getRoomDetail 失败同样走 finishRefresh 复位，保证 10s 轮询不会因一次失败永久停摆
            // 注意：getRoomDetail 需 return 自身 promise 链，链上 then 回调抛错也会落入失败的第二个参数复位
            var detailPromise = that.getRoomDetail();
            if (detailPromise && typeof detailPromise.then === "function") {
              detailPromise.then(that.finishRefresh, that.finishRefresh);
            } else {
              that.finishRefresh();
            }
          } else {
            uni.showModal({
              title: "提示",
              content: res.msg,
              success: function (res) {
                that.$nav.back();
              },
            });
            that.finishRefresh();
          }
        })
        .catch(function () {
          // 课程信息请求失败：复位刷新标记，避免轮询停摆
          that.finishRefresh();
        });
    },

    /**
     * 直播流终止（H5 播放器 liveStreamStop：m3u8 多次重试失败后触发；
     * 断流 SOCKET 推送 stream_status 也复用此入口进入过渡态）
     * 直播中流终止 = 主播断流/直播结束。
     * H5 端进入「直播缓冲中」宽限态：保持播放器挂载与最后一帧画面，不立即翻
     * 「主播暂时离开」——RTC HLS 会话重置窗口/转码流未生成等周期 404 触发 liveStreamStop
     * 会让观众看到「离开→恢复」频繁闪断（线上实证）；由 10s 缓冲重试探测流恢复
     * （attemptStreamBufferResume），或后端权威状态翻转离线（getRoomDetail）后真正
     * 展示「主播暂时离开/直播已结束/可查看回放」，不再频繁刷新页面。
     * 小程序端无 fetch 探测能力（originalStreamAlive 不可用），保持旧行为：立即切换
     * 状态页，由 10s 离线轮询感知重新开播。
     * @param string $statusText 过渡态文案（默认「主播暂时离开」，仅小程序端沿用）
     */
    liveStreamStopHandle(statusText) {
      // 仅直播中有效；回放/播放器加载失败等其他场景忽略
      if (this.roomData.status != "online") {
        return;
      }
      this.streamStopped = true;
      this.streamStoppedAt = Date.now();
      // 不锁死播放器错误：此刻缓冲宽限态驱动恢复探测，且不会再有错误锁死分支进入
      this.videoErrorLocked = false;
      if (!this.webEnv) {
        // 小程序：无 fetch 探测，直接切「主播暂时离开」由 10s 离线轮询接管
        this.streamStopped = false;
        this.streamStoppedAt = 0;
        this.roomData.status = "offline";
        this.roomData.status_text = statusText || "主播暂时离开";
        this.refresh(false, true);
        return;
      }
      // 进入「直播缓冲中」宽限态：保持播放器挂载与最后一帧画面，周期探测恢复
      this.enterStreamBuffering();
      // 立即查询一次后端权威状态：已结束/已开回放时直接切换对应文案（仅查直播间状态即可）
      this.refresh(false, true);
    },

    /**
     * 断流缓冲宽限内的快速恢复探测（30s 限频，H5）：
     * 缓冲宽限态（streamBuffering，保持末帧+「直播缓冲中…」遮罩）期间 getRoomDetail
     * 返回 online 时调用：异步探测原画流是否已恢复在推（originalStreamAlive，秒级
     * fetch），确认恢复则立即解除终止标记并轻量刷新——刷新走在线分支重挂播放器，
     * 恢复时间压到一个轮询周期内，观众看不到「主播暂时离开」闪断。
     * 限频原因：探测只证明「流在推」，不证明当前协议可播——RTS 投递持续异常时流仍在推，
     * 无限制提前重挂会形成「重挂→再断流→再重挂」循环；30s 限频后由 buffering 宽限态
     * （10s 周期探测 + MAX_STREAM_BUFFER_MS 超时强制离线）兜底，有界。
     * artc 源顺势降级：直播中刚发生 liveStreamStop 级断流说明 RTS 投递已不稳定，恢复重挂
     * 直接走 flv/hls_ll/hls（置 rtsFallbackTried + 负缓存，与 liveErrorHandle RTS 失败分支
     * 同策略）；同时补上「播放中断流不触发降级链」的缺口——liveStreamStop 后到达的 error
     * 被 streamStopped 分支拦截，起播期才有的降级链在播放中不生效
     */
    recoverStreamStoppedIfAlive() {
      if (!this.webEnv || !this.streamStopped || this.streamRecoverProbing) {
        return;
      }
      // 限频 3 分钟过长：本播流域名 HLS 封装未覆盖在推流（flv 200 / 标准 m3u8 404），
      // FLV 短暂抖动 → 降级 m3u8 → 404 → liveStreamStop 的「主播暂时离开」在一次直播中
      // 可能反复出现，3 分钟限频会让 30s 防御窗内无法快速恢复（线上实证每次中断要黑屏
      // 30~40s 才恢复、且恢复后仍挂死 m3u8）。缩到 30s（与防御窗同量级）：探测仍只证明
      // 「流在推」，但下方 m3u8→FLV 回弹让恢复落在可播协议上，不会形成「重挂→再断流→
      // 再重挂」的协议横跳循环；RTS 投递持续异常的极端场景由 30s 限频 + 防御窗兜底，有界
      if (Date.now() - (this.lastStreamFastRecoverAt || 0) < 30 * 1000) {
        return;
      }
      var that = this;
      this.streamRecoverProbing = true;
      this.originalStreamAlive().then(function (alive) {
        that.streamRecoverProbing = false;
        // 探测期间过渡态已被解除（缓冲重试成功/后端翻转离线）或已错误锁定：状态链路已接管
        if (!alive || !that.streamStopped || that.videoErrorLocked) {
          return;
        }
        that.lastStreamFastRecoverAt = Date.now();
        // artc 源顺势降级（负缓存以「原画流在推」为前提落盘，persistRtsDown 内部再探测一次）
        if (String(that.videoUrl).indexOf("artc://") === 0 && !that.rtsFallbackTried) {
          that.rtsFallbackTried = true;
          that.rtsSupported = false;
          that.persistRtsDown();
        }
        // 原画流确认恢复在推：若当前源是已 404 的 HLS(m3u8) 且 MSE 终端可播 FLV——
        // 本播流域名实证 flv 200 / 标准 m3u8 404（HLS 封装未覆盖在推流）。此前这里只
        // 清过渡态交给 refresh 重挂，resolveOnlineSource 同路径偏好会再次选回 m3u8 →
        // 再 404 → 再 liveStreamStop →「主播暂时离开」反复（线上实证每次中断约 40s 才
        // 恢复、恢复后仍挂死 m3u8）。此处直接回弹 FLV，恢复即落在可播协议上；
        // 与 liveErrorHandle 内 HLS 回弹同判据（mseSupported 守卫，iOS 无 MSE 不弹）
        var stopBounceSrc = that.currentSourceUrls();
        var stopCurPath = String(that.videoUrl || "").toLowerCase().split("?")[0];
        if (that.mseSupported && stopCurPath.indexOf(".m3u8") > -1 && stopBounceSrc.flv) {
          that.videoUrl = stopBounceSrc.flv;
        }
        // 解除终止标记；给死流兜底一个新鲜观察窗（重挂后首个 timeupdate 到来前
        // lastVideoPlayed 已超过 25s，不清会误触发 liveStreamStopHandle）
        that.streamStopped = false;
        that.streamStoppedAt = 0;
        that.lastVideoPlayed = Date.now();
        that.refresh(false, true);
      });
    },

    /**
     * 进入断流缓冲宽限态（H5）：保持播放器挂载与最后一帧画面，叠加「直播缓冲中…」遮罩，
     * 启动 10s 周期探测恢复（attemptStreamBufferResume）。出画面（timeupdate）自动退出，
     * 后端权威状态翻转离线或宽限超时（MAX_STREAM_BUFFER_MS）由对应出口退出
     */
    enterStreamBuffering() {
      if (this.streamBuffering) {
        return;
      }
      this.streamBuffering = true;
      this.maxStreamBufferAt = Date.now() + MAX_STREAM_BUFFER_MS;
      this.startStreamBufferRetry();
    },

    /**
     * 退出断流缓冲宽限态：停止恢复探测定时器、收起「直播缓冲中」遮罩。
     * 不带 forceOffline 时 roomData 由调用方/后端权威状态接管（getRoomDetail 已替换）；
     * forceOffline=true 用于宽限超时兜底——后端 CDN 状态滞后仍报 online 的真断流，
     * 强制按「主播暂时离开」展示，由 10s 离线轮询继续探测重新开播
     * @param {Boolean} forceOffline 是否强制切离线文案
     */
    leaveStreamBuffering(forceOffline) {
      this.streamBuffering = false;
      this.stopStreamBufferRetry();
      if (forceOffline && this.roomData && this.roomData.status == "online") {
        this.roomData.status = "offline";
        this.roomData.status_text = "主播暂时离开";
      }
    },

    /**
     * 启动断流缓冲恢复探测（10s）：页面活跃且仍处缓冲宽限态时周期调用
     * attemptStreamBufferResume 探测原画流恢复在推，恢复则强制重建播放器续播；
     * 流未在推保持缓冲展示，等待后端权威状态翻转（getRoomDetail 离线 →「主播暂时离开」）
     */
    startStreamBufferRetry() {
      this.stopStreamBufferRetry();
      var that = this;
      this.streamBufferRetryTimer = setInterval(function () {
        if (
          !that.streamBuffering ||
          !that.isPageActive ||
          that.videoErrorLocked ||
          that.roomData.status !== "online"
        ) {
          return;
        }
        that.attemptStreamBufferResume();
      }, 10000);
    },

    /**
     * 停止断流缓冲恢复探测定时器
     */
    stopStreamBufferRetry() {
      if (this.streamBufferRetryTimer) {
        clearInterval(this.streamBufferRetryTimer);
        this.streamBufferRetryTimer = null;
      }
    },

    /**
     * 断流缓冲恢复尝试（H5，10s 周期）：
     * 1) 宽限超时兜底：无论流是否探测到在推，先强制退缓冲转「主播暂时离开」，
     *    由 10s 离线轮询继续探测重新开播（覆盖 CDN 状态滞后仍报 online 的真断流）；
     * 2) 原画流确认恢复在推（originalStreamAlive 秒级探测）则强制重建当前源——
     *    重载标记驱动 watch 重建，resumePlay 自动续播；MSE 终端当前为 m3u8 时回弹
     *    同源 FLV（RTC HLS 周期性 404 场景避免再挂 m3u8）；
     * 3) 流未在推且未超时：保持缓冲展示，等后端权威状态接管（翻转离线即「主播暂时离开」）
     */
    attemptStreamBufferResume() {
      var that = this;
      if (Date.now() > (this.maxStreamBufferAt || 0)) {
        this.streamStopped = false;
        this.streamStoppedAt = 0;
        this.leaveStreamBuffering(true);
        this.refresh(false, true);
        return;
      }
      this.originalStreamAlive().then(function (alive) {
        if (!alive || !that.streamBuffering || that.videoErrorLocked) {
          return;
        }
        that.streamStopped = false;
        that.streamStoppedAt = 0;
        that.lastVideoPlayed = Date.now();
        var bufferUrls = that.currentSourceUrls();
        var bufferPath = String(that.videoUrl || "").toLowerCase().split("?")[0];
        var target = that.videoUrl;
        if (that.mseSupported && bufferPath.indexOf(".m3u8") > -1 && bufferUrls.flv) {
          that.flvFallbackTried = false;
          target = bufferUrls.flv;
        }
        // 强制重建（同路径重载标记驱动 watch 重建），恢复后首个 timeupdate 自动退出缓冲态
        that.applyOnlineSourceUrl(that.appendReloadMark(target), that.currentQuality, true);
        that.leaveStreamBuffering();
      });
    },

    /**
     * 直播在线时的结束探测（轻量状态接口兜底）：
     * 每 10s 查询一次直播状态，非在线说明直播已结束/断流，停止探测并轻量刷新切换状态页。
     * 覆盖播放器未触发 liveStreamStop 的死流场景（如 m3u8 不再更新但未断开的流）
     */
    checkLiveEnded() {
      var self = this;

      // 鉴权地址临期主动重签：播流地址签名有效期 10 分钟，稳定观看期间 getRoomDetail 不会
      // 自动刷新，地址过期后播放器拉流 403 → 恢复失败 → liveStreamStop「主播暂时离开」，
      // 需约 40s 才能恢复（线上实证观看约 10 分钟掉一次）。在线在播时临近过期（>8.5min）
      // 主动全量刷新，由 applyOnlineSourceUrl 的临期重签路径换新签名重建（约 1~2s 换源，
      // pickUrlWithDowngradeState 同源重签沿用当前协议，不跳协议）
      if (
        this.everPlayed &&
        !this.videoErrorLocked &&
        !this.qualitySwitching &&
        !this.streamStopped &&
        this.roomData &&
        this.roomData.status == "online" &&
        this.videoUrlSetAt > 0 &&
        Date.now() - this.videoUrlSetAt > LIVE_SOURCE_RESIGN_MS
      ) {
        this.refresh(false, true);
        return;
      }

      // 死流本地兜底：直播中播放器长时间无播放进展（无 playing/timeupdate），
      // 且非用户主动暂停、非切清晰度、非处于流终止过渡时，判定观看端画面已冻结（直播流已终止）——
      // FLV/转码流断流时播放器往往不抛 liveStreamStop/error 任何事件，画面停在最后一帧；
      // 后端 CDN 断流检测也存在滞后窗口，只靠 live.room.status 等待翻转可能长时间不刷新。
      // 此处先行进入「主播暂时离开」过渡态（streamStopped）并轻量刷新，
      // 由刷新后的后端权威状态接管：主播恢复推流则解除标记恢复直播，直播已结束则停在状态页
      if (
        !this.streamStopped &&
        !this.videoErrorLocked &&
        this.roomData &&
        this.roomData.status == "online" &&
        this.lastVideoPlayed > 0 &&
        Date.now() - this.lastVideoPlayed > 25000 &&
        !this.qualitySwitching
      ) {
        this.stopOnlineStatusPolling();
        this.liveStreamStopHandle();
        return;
      }

      this.$api("live.room.status", {
        course_id: this.pageParams.id,
      })
        .then(function (res) {
          if (!res || res.code !== 1) return;
          var status = res.data;
          if (self.videoErrorLocked) {
            // 错误锁定期间的恢复探测：轻量刷新交给后端权威状态——流恢复（重新开播）时
            // getRoomDetail 检测到非 online→online 状态翻转自动解锁重挂；流已停则切
            // 「主播暂时离开」。锁定期间不做本地死流判定（上方已跳过）
            self.refresh(false, true);
            return;
          }
          if (status !== "online") {
            self.stopOnlineStatusPolling();
            // 仅刷新直播间状态（getRoomDetail），无需重复拉取课程详情
            self.refresh(false, true);
          }
        })
        .catch(function () {});
    },

    /**
     * 消息服务连接状态变化（message-box 上抛 link-status）
     * SOCKET 可用（success）后在线结束探测降为低频兜底（30s），断线/失败自动回快轮询（10s）。
     * 注意：这里**不触碰离线/未开始轮询**（refreshTimer）——该轮询恒为 10s 且是开播感知
     * 的唯一驱动（直播开始不依赖消息推送），socket 首次连接成功（进页 1~5s 内）恰发生在
     * getRoomDetail 首次返回离线并建立定时器之后，若在此清掉且不重建，「主播暂时离开」
     * 状态下页面将不再轮询开播（线上实证 OBS 推流后约半分钟仍不直播）
     * @param {String|Boolean} status 消息连接状态（success=已连接）
     * @return {void}
     */
    onMessageLinkStatus(status) {
      var connected = status === "success";
      if (this.messageConnected === connected) {
        return;
      }
      this.messageConnected = connected;
      // 在线结束探测：按新间隔重建（离线/未开始轮询不受消息连接影响，保持 10s 运行）
      if (this.onlineStatusTimer) {
        this.stopOnlineStatusPolling();
        this.startOnlineStatusPolling();
      }
    },

    /**
     * 直播在线结束探测间隔（ms）
     * 消息服务已连接时 SOCKET publish_done 已覆盖断流即时通知，探测降为 30s 兜底；
     * 未连接/断线维持 10s（同时覆盖死流本地兜底）
     * @return {Number}
     */
    liveStatusPollInterval() {
      return this.messageConnected ? 30000 : 10000;
    },

    /**
     * 启动直播在线状态轮询（页面活跃期间运行，直播结束后自动转由离线轮询接管）
     */
    startOnlineStatusPolling() {
      this.stopOnlineStatusPolling();
      var self = this;
      var interval = this.liveStatusPollInterval();
      this.onlineStatusTimer = setInterval(function () {
        self.checkLiveEnded();
      }, interval);
    },

    /**
     * 停止直播在线状态轮询
     */
    stopOnlineStatusPolling() {
      if (this.onlineStatusTimer) {
        clearInterval(this.onlineStatusTimer);
        this.onlineStatusTimer = null;
      }
    },

    liveErrorHandle(e) {
      that.qualitySwitching = false;
      clearTimeout(that._qualitySwitchTimer);

      // 直播流终止后的伴随 error（liveStreamStop 之后播放器触发）：
      // 已由 liveStreamStopHandle 进入缓冲宽限态（H5）或离线过渡态（小程序），
      // 此处不做状态翻转、不锁死播放器——H5 保持播放器挂载与最后一帧画面，
      // 「直播缓冲中」遮罩持续显示，由缓冲重试/后端权威状态接管恢复或离开
      if (that.streamStopped) {
        return;
      }

      // RTS(artc) 播放失败自动降级：支持 MSE 的终端降到 FLV（低延迟），
      // 无 MSE 的终端（iOS Safari/微信 iOS 等）FLV 不可播，直接降到 HLS/LL-HLS，避免「移动端不支持FLV」报错
      // 注意：降级目标必须跳过 artc（pickOriginalUrl 第二个参数 skipRts=true）——否则 rtsSupported 环境下
      // 降级目标又选回 artc，二次失败后无分支可降、直接锁死黑屏（线上实测「移动端加载不出播放画面」根因）
      if (
        !that.videoErrorLocked &&
        !that.rtsFallbackTried &&
        String(that.videoUrl).indexOf("artc://") === 0 &&
        that.roomData.push_url
      ) {
        that.rtsFallbackTried = true;
        // RTS 负缓存：本机 10 分钟内跳过 artc（rtsSupported 初始化时读取，跨刷新/重进生效），
        // 停止「信令 404 → 重试 → 又试」的循环请求；artc 播放成功时清除（onVideoPlaying）。
        // 内存立即置 false 保证本会话不再选 artc；持久化以「原画流正在推」为前提异步落盘
        // （persistRtsDown）——开播初期/断流期的信令 404 不写跨会话负缓存，否则 RTS 恢复后
        // 仍会被本机压 10 分钟
        that.rtsSupported = false;
        that.persistRtsDown();
        // 降级目标限定在「当前播放源」内（转码清晰度用同一模板的 flv/hls，原画用原画地址），
        // 当前源无可用降级地址时才回原画链，避免转码清晰度失败直接丢回原画；
        // 降级目标必须跳过 artc（pickOriginalUrl 第二个参数 skipRts=true）——否则 rtsSupported 环境下
        // 降级目标又选回 artc，二次失败后无分支可降、直接锁死黑屏（线上实测「移动端加载不出播放画面」根因）
        var rtsSourceUrls = that.currentSourceUrls();
        var rtsFallbackUrl = '';
        if (that.mseSupported && rtsSourceUrls.flv) {
          rtsFallbackUrl = rtsSourceUrls.flv;
        } else if (LL_HLS_PREFERRED && that.webEnv && rtsSourceUrls.hls_ll && !that.llhlsDownActive(rtsSourceUrls.hls_ll)) {
          rtsFallbackUrl = rtsSourceUrls.hls_ll;
        } else if (rtsSourceUrls.hls) {
          rtsFallbackUrl = rtsSourceUrls.hls;
        }
        that.videoUrl = rtsFallbackUrl ||
          (that.pickOriginalUrl(that.roomData.push_url, true) || that.roomData.push_url.hls || that.roomData.push_url.flv);
        return;
      }

      // LL-HLS 播放失败自动降级标准 HLS：hls_ll 依赖播流域名已配置直播封装，异常/未生效时切回常规 m3u8 兜底；
      // 降级到当前播放源的标准 HLS（转码清晰度用同一模板的 hls，原画用原画 hls）；
      // 只降级一次，避免 LL-HLS/标准 HLS 反复横跳
      if (
        !that.videoErrorLocked &&
        !that.llhlsFallbackTried &&
        String(that.videoUrl).toLowerCase().indexOf("-llhls.m3u8") > -1 &&
        that.roomData.push_url &&
        that.roomData.push_url.hls
      ) {
        that.llhlsFallbackTried = true;
        // LL-HLS 负缓存：与 RTS 负缓存同机制（按流、流在推才落盘），10 分钟内本机选流
        // 跳过该流的 hls_ll（封装恢复后 TTL 到期自动重试，成功出画面即清除）——避免每次
        // 进页都重新付一次 404 预检；持久化以「原画流正在推」为前提（persistLlhlsDown），
        // 开播初期/断流期不写
        that.persistLlhlsDown(that.videoUrl);
        var llhlsSourceUrls = that.currentSourceUrls();
        that.videoUrl = llhlsSourceUrls.hls || that.roomData.push_url.hls;
        return;
      }

      // FLV 播放失败自动降级 HLS：artc/flv 均不可用（或转码清晰度流 flv 异常）的环境，
      // 首次报错时优先降当前播放源的 LL-HLS（3~5s，H5 + 直播封装就绪时），缺失再降标准 HLS 兜底，
      // 避免直接锁死；只降级一次，避免 FLV/HLS 反复横跳
      if (
        !that.videoErrorLocked &&
        !that.flvFallbackTried &&
        String(that.videoUrl).toLowerCase().indexOf(".flv") > -1 &&
        that.roomData.push_url &&
        that.roomData.push_url.hls
      ) {
        that.flvFallbackTried = true;
        var flvSourceUrls = that.currentSourceUrls();
        // 降级目标必须逐项取 URL 字符串（与上方 artc 降级分支同写法）：
        // 写成「(a && b && c) || d || e」链式表达式时，第一组条件全真会短路成布尔值
        // true 赋给 videoUrl，播放器拿到非法源再次报错 → 无分支可降直接锁死
        // （真机「闪现画面→一直加载→主播暂时离开，刷新才恢复」的元凶之一）
        var flvFallbackUrl = "";
        if (LL_HLS_PREFERRED && that.webEnv && flvSourceUrls.hls_ll && !that.llhlsDownActive(flvSourceUrls.hls_ll)) {
          flvFallbackUrl = flvSourceUrls.hls_ll;
        } else if (flvSourceUrls.hls) {
          flvFallbackUrl = flvSourceUrls.hls;
        }
        that.videoUrl = flvFallbackUrl || that.roomData.push_url.hls;
        return;
      }

      // 转码清晰度全部协议耗尽（直播封装未覆盖转码流/转码流未生成/封装改造了转码流地址等）：
      // 降回原画链兜底——原画地址不受直播封装对转码流地址改造的影响，保证一定出画面（最差 10~30s 档）；
      // 置粘性标记后 resolveOnlineSource 不再回选转码流（否则一次普通刷新又选回未就绪的转码流，循环重建）
      if (
        !that.videoErrorLocked &&
        that.currentQuality &&
        that.currentQuality.template_id &&
        that.roomData.push_url &&
        (that.roomData.push_url.hls || that.roomData.push_url.flv)
      ) {
        that.currentQuality = null;
        that.qualityFallbackToOriginal = true;
        // LL-HLS 负缓存已改为按流隔离：本次 404 的是转码流 hls_ll（直播封装未覆盖转码流），
        // 只清除该流负缓存 key——原画流 hls_ll 不受影响仍可近边缘低延迟；若不按流清除，
        // 10 分钟内原画链的 hls_ll 被一并压掉，iOS 端只能落标准 HLS（20~30s 延迟，本次线上
        // 开启多清晰度后标清延迟 30s 的根因）——清除后原画链重新按 pickOriginalUrl 尝试 hls_ll
        that.clearLlhlsDown(that.videoUrl);
        // 转码流负缓存：转码输出在服务端不可用（线上实证 HLS 404/FLV 空体、RTS 12s 无数据）时，
        // 10 分钟内本机默认选档跳过转码直接原画（computeDefaultQuality 读取），跨刷新/重进生效——
        // 避免每次进页都重付 RTS 无数据超时 + 逐协议探测的代价；转码清晰度成功出画面时清除
        // （onVideoPlaying），转码恢复后自动回到转码优先。持久化以「原画流正在推」为前提
        // （persistTranscodeDown）——开播初期转码流未生成属正常，不应写跨会话负缓存
        that.persistTranscodeDown();
        // 原画是新的播放源：FLV/LL-HLS 降级标记复位，原画链各协议重新获得尝试机会
        // （转码流失败不代表原画同样失败，如转码 flv 404 而原画 flv 正常）；
        // RTS 标记保持——artc 未生效多为域名级配置问题，不重复尝试
        that.flvFallbackTried = false;
        that.llhlsFallbackTried = false;
        that.videoUrl =
          that.pickOriginalUrl(that.roomData.push_url, true) ||
          that.roomData.push_url.hls ||
          that.roomData.push_url.flv;
        return;
      }

      // 全链耗尽锁死前：区分「流未就绪」与「协议真死」——开播初期/主播短暂断流期
      // （原画流未在推）各协议 404/无数据均不能证明协议坏，直接锁死会让观众在开播
      // 建流窗口内永远黑屏只能手动刷新（线上实证「第一次开播要等 10s+ 仍进不去」）。
      // 流未在推：保持加载态，延迟自动重试（同协议强制重挂，最多 3 次，配合 6s 看门狗
      // 与 4s 重试间隔，开播后通常一轮内出画面）；流确认在推仍全链失败：协议真死，锁定
      if (
        that.roomData.status === "online" &&
        that.webEnv &&
        that.streamRetryCount < 3
      ) {
        that.originalStreamAlive().then(function (alive) {
          if (that.streamStopped || that.videoErrorLocked || that.roomData.status !== "online") {
            // 期间已切离线过渡/终态/锁定：状态链路已接管
            return;
          }
          if (!alive) {
            that.streamRetryCount++;
            setTimeout(function () {
              if (that.videoErrorLocked || that.streamStopped || that.roomData.status !== "online") {
                return;
              }
              // 追加重载标记后强制重建当前源（同路径绕过同源续播）：流建立后同协议
              // 即可出画面；URL 变化自动触发 watch 重新布防看门狗与 LL-HLS 预检
              that.applyOnlineSourceUrl(that.appendReloadMark(that.videoUrl), that.currentQuality, true);
            }, 4000);
            return;
          }
          // 流在推但当前协议拉流失败：若当前源是 HLS(m3u8) 且源内存在 FLV——
          // 本播流域名实证 flv 200 / 标准 m3u8 404（HLS 封装未覆盖在推流），
          // HLS 路径反复 404 只能锁定后等轮询翻转，观众卡在「主播暂时离开」数秒~数十秒。
          // 直接回弹 FLV：流在推即可立即续播，消除该空窗；flvFallbackTried 保持 true
          // （已 FLV→HLS 降级过），避免回弹后 FLV 再次瞬时失败又走 FLV→HLS 降级横跳
          // （该场景落入下方锁定 + 轮询解锁，行为与历史一致）
          var hlsBounceSrc = that.currentSourceUrls();
          var curLowerPath = String(that.videoUrl || "").toLowerCase().split("?")[0];
          // mseSupported 守卫：iOS/微信 iOS 无 MSE，FLV 不可播，回弹只会把原生 HLS 换成
          // 不可播的 FLV 直接锁死；无 MSE 终端保持 HLS 重试（落入下方锁定 + 轮询解锁）
          if (that.mseSupported && curLowerPath.indexOf(".m3u8") > -1 && hlsBounceSrc.flv) {
            that.videoUrl = hlsBounceSrc.flv;
            return;
          }
          that.lockVideoError(e);
        });
        return;
      }

      that.lockVideoError(e);
    },

    /**
     * 播放错误锁定（降级链全耗尽终点）：展示明确错误文案并保留自动轮询——
     * 此前锁定即清掉刷新定时器、只等用户手动刷新，主播恢复推流/断流结束后观众端
     * 永远停在错误页；现在由离线轮询探测状态翻转，解锁并强制重建重试（见
     * getRoomDetail 在线分支的解锁探测），错误文案不变
     */
    lockVideoError(e) {
      that.videoErrorLocked = true;
      const isPlayback = that.roomData.status === "run_playback";

      // 保留自动轮询（错误锁定只阻止播放器重挂，不阻断状态探测）
      if (that.isPageActive && !that.refreshTimer) {
        that.refreshTimer = setInterval(function () {
          that.refresh(false, true);
        }, that.messageConnected ? 30000 : 10000);
      }

      // 回放加载失败不改变直播间状态，否则会误显示直播状态结构并隐藏“直播回放”入口。
      if (!isPlayback) {
        that.roomData.status = "offline";
      }

      if (isPlayback) {
        that.roomData.status_text = "视频加载失败，请重试";
      } else if (e && e.hasOwnProperty("errMsg")) {
        const errorText = that.parseErrorText(e.errMsg);
        // 判断是否为不支持的格式错误（rtmp 等）
        if (errorText.indexOf("4011") !== -1 || errorText.indexOf("不支持") !== -1 || errorText.indexOf("rtmp") !== -1) {
          that.roomData.status_text = "当前视频格式不支持播放，请联系管理员使用 m3u8、mp4、flv 或 RTS 格式播流地址，点击重试";
        } else {
          that.roomData.status_text = "视频加载失败，点击重试";
        }
      } else {
        that.roomData.status_text = "视频加载失败，点击重试";
      }
    },
    parseErrorText(input) {
      // 尝试定位内嵌 JSON 的起始位置
      const startIndex = input.indexOf('{"code"');
      if (startIndex === -1) {
        return input;
      }

      // 提取内嵌 JSON 字符串
      const jsonString = input.substring(startIndex);

      try {
        // 直接解析内嵌 JSON
        const result = JSON.parse(jsonString);
        return result.code + "-" + result.text;
      } catch (error) {
        // 尝试回退到手动提取（处理结尾多引号的情况）
        const cleanedJson = jsonString.replace(/"}\s*"$/, "}");
        try {
          const result = JSON.parse(cleanedJson);
          return result.code + "-" + result.text;
        } catch (e) {
          return input;
        }
      }
    },

    /**
     * 两个播放地址是否同一播放源（协议+流路径一致，忽略签名等 query 参数）：
     * 阿里云鉴权地址每次接口请求签名都不同，但路径相同即为同一流——
     * 详情刷新/状态探测/开播推送的重复刷新不应因「签名变了」重建播放器
     */
    sameSourcePath(a, b) {
      if (!a || !b) return false;
      return String(a).split("?")[0] === String(b).split("?")[0];
    },

    /**
     * 给播流地址追加重载标记（_r=毫秒时间戳）：
     * 强制重建场景（流未就绪自动重试/锁定后解锁重建）需要播放器 dispose 重建重新拉流，
     * 但同路径地址值不变时 Vue watch 不触发、播放器不会重建——追加一个无害 query 参数
     * 让地址值变化以驱动重建。_r 不参与阿里云 auth_key 签名（签名串仅含 path/时间戳/key），
     * 不影响鉴权；重复追加前先剥掉旧标记，避免多次重试后 URL 无限膨胀
     * @param {String} url 原播流地址（artc/flv/hls 均可）
     * @return {String} 带重载标记的地址
     */
    appendReloadMark(url) {
      var clean = String(url || "").replace(/([?&])_r=\d+/g, "$1");
      if (!clean) return url;
      return clean + (clean.indexOf("?") > -1 ? "&" : "?") + "_r=" + Date.now();
    },

    /**
     * 在线状态播放地址落盘（统一入口）：
     * - 同源（路径一致）且地址仍在新鲜期（后端签名有效期 10 分钟，留余量 8 分钟）：
     *   沿用当前地址继续播——只刷新清晰度登记（含最新签名地址对象，供降级链取同源各协议地址），
     *   不重写 videoUrl、不重建播放器、不复位降级状态；
     * - 真换源（路径变化）或地址临近过期：落盘新地址并复位 RTS/FLV/LL-HLS 降级标记（新一轮尝试）。
     * 若不做同源判定，状态探测抖动/开播推送/请求补发等任何一次重复刷新都会重建播放器并
     * 复位降级状态，配合转码流未就绪的 404 形成「重建→加载中→降级→再重建」死循环（线上实证）
     * @param {String} url 期望播放地址
     * @param {Object|null} quality 清晰度登记对象（null=原画）
     * @param {Boolean} forceRebuild 强制重建（同路径也重建）：供「流未就绪自动重试」「锁定后
     *   状态翻转解锁」等场景使用——重试/恢复必须重建播放器重新拉流，同源续播会跳过导致黑屏依旧
     */
    applyOnlineSourceUrl(url, quality, forceRebuild) {
      if (!url) return;
      var keepAlive = Date.now() - (this.videoUrlSetAt || 0) < LIVE_SOURCE_KEEP_MS;
      if (!forceRebuild && this.sameSourcePath(url, this.videoUrl) && keepAlive) {
        this.currentQuality = quality || null;
        return;
      }
      this.rtsFallbackTried = false;
      this.flvFallbackTried = false;
      this.llhlsFallbackTried = false;
      this.videoUrlSetAt = Date.now();
      this.currentQuality = quality || null;
      this.videoUrl = url;
    },

    /**
     * 按终端能力挑地址并沿用会话内降级状态（与 pickQualityUrl 同优先级 artc→flv→hls_ll→hls）：
     * pickQualityUrl 只感知 RTS 降级（skipRts）；LL-HLS/FLV 已降级过时（llhls/flvFallbackTried），
     * 详情刷新重选地址同样不得选回已失败的协议——否则一次普通刷新就把播放器拽回坏源
     * （重建→加载中→再次降级），白白打断观看
     * @param {Object} urlObj 含 artc/flv/hls/hls_ll 键的地址对象（转码清晰度或原画 push_url）
     * @return {String} 播放地址
     */
    pickUrlWithDowngradeState(urlObj) {
      if (!urlObj) return "";
      // 同源重签沿用当前协议：地址对象里存在与当前播放地址路径一致的条目（同流同协议的新签名）
      // 时优先沿用，避免临期重签按终端能力重选在 flv/hls 间跳变（延迟档位变化、中断感更大）
      var currentPath = String(this.videoUrl || "").split("?")[0];
      if (currentPath) {
        var protocolKeys = ["artc", "flv", "hls_ll", "hls"];
        for (var i = 0; i < protocolKeys.length; i++) {
          var candidate = urlObj[protocolKeys[i]];
          if (candidate && String(candidate).split("?")[0] === currentPath) {
            return candidate;
          }
        }
      }
      if (!this.rtsFallbackTried && this.rtsSupported && urlObj.artc) {
        return urlObj.artc;
      }
      if (this.mseSupported && urlObj.flv && !this.flvFallbackTried) {
        return urlObj.flv;
      }
      if (LL_HLS_PREFERRED && this.webEnv && urlObj.hls_ll && !this.llhlsFallbackTried && !this.llhlsDownActive(urlObj.hls_ll)) {
        return urlObj.hls_ll;
      }
      return urlObj.hls || "";
    },

    /**
     * 在线状态期望播放源计算（只计算，不落盘，由 applyOnlineSourceUrl 统一落盘）：
     * - 转码清晰度协议本会话已耗尽（qualityFallbackToOriginal）且用户未手动选择：保持原画链，
     *   避免下一次刷新又选回尚未生成/不可播的转码流；
     * - 已选中清晰度：该清晰度最新地址（沿用会话内降级状态挑协议，RTS 已降级过则跳过 artc）；
     * - 默认：缓存清晰度/最高画质（原 initDefaultQuality 同规则）
     * @param {Object} resData 直播间详情数据（qualities/push_url）
     * @return {Object} { url: String, quality: Object|null }
     */
    resolveOnlineSource(resData) {
      if (this.qualityFallbackToOriginal && !this.userSelectedQuality) {
        return { quality: null, url: this.pickUrlWithDowngradeState(resData.push_url) };
      }
      if (this.currentQuality && resData.qualities && resData.qualities.length > 0) {
        var matchedQuality = null;
        for (var i = 0; i < resData.qualities.length; i++) {
          if (resData.qualities[i].template_id == this.currentQuality.template_id) {
            matchedQuality = resData.qualities[i];
            break;
          }
        }
        if (matchedQuality && matchedQuality.url) {
          // 顺手刷新清晰度登记的最新签名地址对象（降级链取同源各协议地址用）
          this.currentQuality.url = matchedQuality.url;
          var url = this.pickUrlWithDowngradeState(matchedQuality.url);
          if (url) {
            return { quality: this.currentQuality, url: url };
          }
          if (matchedQuality.url.hls) {
            return { quality: this.currentQuality, url: matchedQuality.url.hls };
          }
        }
      }
      return this.computeDefaultQuality(resData);
    },

    /**
     * 转码流负缓存是否生效：转码输出服务端不可用（HLS 404/FLV 空体/RTS 无数据）后 10 分钟内，
     * 本机默认选档跳过转码直接原画（写入见 liveErrorHandle 转码耗尽分支，清除见 onVideoPlaying）
     * @return {Boolean}
     */
    transcodeDownActive() {
      try {
        var downUntil = parseInt(uni.getStorageSync("live_transcode_down_until") || "0", 10);
        return downUntil > Date.now();
      } catch (e) {
        return false;
      }
    },

    /**
     * 默认清晰度计算（缓存恢复优先，其次清晰度列表最高档；无转码模板回退原画）。
     * 只计算不落盘：videoUrl/currentQuality/降级标记统一由 applyOnlineSourceUrl
     * 按「播放源路径是否变化」落盘，避免每次详情刷新都重写地址、重建播放器
     * @return {Object} { url: 播放地址, quality: 清晰度登记对象或 null }
     */
    computeDefaultQuality(roomData) {
      if (roomData.qualities && roomData.qualities.length > 0) {
        var sorted = roomData.qualities.slice().sort(function (a, b) {
          return b.level - a.level;
        });

        // 读取用户历史手动选择的清晰度缓存（switchQuality 写入）：用户明确选择的清晰度
        // 优先恢复，优先级高于转码流负缓存——负缓存是「默认选档」的保护机制，不应覆盖
        // 用户主动选择；转码确实不可用时由 liveErrorHandle 降级链回原画兜底（该分支会
        // 将 currentQuality 置 null，清晰度按钮如实显示原画，与真实播放源一致）
        var cacheKey = 'live_quality_' + this.pageParams.id;
        var cachedTemplateId = '';
        try {
          cachedTemplateId = uni.getStorageSync(cacheKey) || '';
        } catch (e) {}

        // 在清晰度列表中匹配缓存的 template_id
        var matched = null;
        if (cachedTemplateId) {
          for (var i = 0; i < sorted.length; i++) {
            if (sorted[i].template_id == cachedTemplateId) {
              matched = sorted[i];
              break;
            }
          }
        }

        // 1) 恢复用户缓存选择的清晰度（刷新/重进页面后仍保持用户上次选择的清晰度）
        if (matched && matched.url) {
          var cachedUrl = this.pickUrlWithDowngradeState(matched.url);
          if (cachedUrl || matched.url.hls) {
            return {
              quality: {
                name: matched.name,
                level: matched.level,
                template_id: matched.template_id,
                url: matched.url,
              },
              url: cachedUrl || matched.url.hls,
            };
          }
        }

        // 2) 转码流负缓存生效期内默认选档直接原画（写入见 liveErrorHandle 转码耗尽分支）
        if (this.transcodeDownActive()) {
          return { quality: null, url: this.pickUrlWithDowngradeState(roomData.push_url) };
        }

        // 3) 无历史选择默认播清晰度列表最高档：多清晰度开启后默认即播放清晰度列表中的
        //    最高画质（不再默认播列表外的「原画」）；该档不可用由降级链兜底回原画
        var target = sorted[0];
        if (target && target.url) {
          var defaultUrl = this.pickUrlWithDowngradeState(target.url);
          if (defaultUrl || target.url.hls) {
            return {
              quality: {
                name: target.name,
                level: target.level,
                template_id: target.template_id,
                url: target.url,
              },
              url: defaultUrl || target.url.hls,
            };
          }
        }
        // 清晰度列表中的档均无可用地址：兜底原画
        return { quality: null, url: this.pickUrlWithDowngradeState(roomData.push_url) };
      }
      return { quality: null, url: this.pickUrlWithDowngradeState(roomData.push_url) };
    },

    /**
     * 按终端能力挑选原画直播地址：
     * RTS 可用（HTTPS+WebRTC）优先 artc；否则支持 MSE 的终端用 flv，无 MSE（iOS 等）直达 hls
     * @param {Object} pushUrl 直播间 push_url（artc/flv/hls/hls_ll）
     * @param {Boolean} skipRts 跳过 artc（用于 artc 已失败后的降级目标选择，避免降级又选回 artc 死循环）
     * @return {String} 播放地址
     */
    pickOriginalUrl(pushUrl, skipRts) {
      if (!pushUrl) return '';
      if (!skipRts && this.rtsSupported && pushUrl.artc) {
        return pushUrl.artc;
      }
      if (this.mseSupported && pushUrl.flv) {
        return pushUrl.flv;
      }
      // 无 MSE（iOS Safari/微信 iOS 等）：优先 LL-HLS（-llhls.m3u8，近边缘），缺失再标准 HLS
      // （见 LL_HLS_PREFERRED；hls_ll 依赖直播封装，异常由预检负缓存自动回标准 HLS）
      if (LL_HLS_PREFERRED && this.webEnv && pushUrl.hls_ll && !this.llhlsDownActive(pushUrl.hls_ll)) {
        return pushUrl.hls_ll;
      }
      return pushUrl.hls || '';
    },

    /**
     * 按终端能力挑选转码清晰度播放地址（与 pickOriginalUrl 同规则）：
     * 转码流地址后端同样生成 artc（官方口径转码流地址支持 RTS 格式），RTS 可用优先 artc；
     * MSE 终端用 flv（2~5s）；无 MSE（iOS 等）优先 LL-HLS（3~5s）再标准 HLS
     * @param {Object} qualityUrl 清晰度 url 对象（artc/flv/hls/hls_ll）
     * @param {Boolean} skipRts 跳过 artc（本会话 RTS 已降级过时与原画同规则不再尝试）
     * @return {String} 播放地址
     */
    pickQualityUrl(qualityUrl, skipRts) {
      if (!qualityUrl) return '';
      if (!skipRts && this.rtsSupported && qualityUrl.artc) {
        return qualityUrl.artc;
      }
      if (this.mseSupported && qualityUrl.flv) {
        return qualityUrl.flv;
      }
      if (LL_HLS_PREFERRED && this.webEnv && qualityUrl.hls_ll && !this.llhlsDownActive(qualityUrl.hls_ll)) {
        return qualityUrl.hls_ll;
      }
      return qualityUrl.hls || '';
    },

    /**
     * 当前播放源对应的地址对象：转码清晰度取所选清晰度的 url，原画取直播间 push_url。
     * 降级链据此限定在当前源内换协议（转码清晰度用同一模板的各协议地址），
     * 避免转码清晰度异常时直接丢回原画
     * @return {Object} 含 artc/flv/hls/hls_ll 键的地址对象
     */
    currentSourceUrls() {
      if (this.currentQuality && this.currentQuality.url) {
        return this.currentQuality.url;
      }
      return this.roomData.push_url || {};
    },

    /**
     * 获取直播间详情
     */
    getRoomDetail() {
      var tabs = [
        // #ifdef MP-TOUTIAO
        {
          name: "讨论",
          type: "interaction",
        },
        {
          name: "回放",
          type: "playback",
        },
        // #endif
        {
          name: "介绍",
          type: "detail",
        },
        {
          name: "互动",
          type: "interaction_exam",
        },
      ];

      // 请求实例先单独挂一组旁路结果统计（不改变返回链路，调用方 then 第一/第二参数行为保持原样）：
      // 成功（code==1 且有数据）即复位失败计数并解除停机；失败（请求层异常或业务 code!=1）累计计数，
      // 达上限自动停止轮询。业务 code!=1 在移动端请求封装中同样以 resolve 返回，需在此一并判定
      var detailRequest = that.$api("live.room.detail", {
        course_id: this.pageParams.id,
      });
      detailRequest.then(
        function (res) {
          if (res && res.code === 1 && res.data) {
            that.roomDetailFailCount = 0;
            that.roomDetailStopped = false;
          } else {
            that.handleRoomDetailFail();
          }
        },
        function () {
          // 网络异常/HTTP 错误/请求取消等请求层失败
          that.handleRoomDetailFail();
        }
      );

      // return 自身 promise 链：供 getData 在请求结束时统一复位刷新标记（finishRefresh）
      return detailRequest.then((res) => {
        that.loading = false;
        // 业务失败（code!=1 或空数据）：保留已有 roomData 展示旧状态，
        // 等待下一轮或手动刷新，避免用 undefined 覆盖导致页面状态区异常
        if (!res || res.code !== 1 || !res.data) {
          return false;
        }
        // 记录翻转前状态：仅「非在线 → 在线」翻转才解除错误锁定重挂播放器
        // （推流恢复/新一场开播）；online→online 的普通刷新不解锁，避免 CDN 状态
        // 滞后期间「解锁重挂→再锁定」循环
        var prevStatus = that.roomData ? that.roomData.status : "";
        that.roomData = res.data;

          // 直播流终止过渡（liveStreamStopHandle 置位）：不强制按离线展示——
          // H5 缓冲宽限态保持播放器挂载与最后一帧画面（「直播缓冲中…」遮罩），
          // 后端仍报 online 时由缓冲重试（attemptStreamBufferResume 10s）+ 
          // recoverStreamStoppedIfAlive 快速恢复探测驱动续播，避免 RTC HLS 会话重置等
          // 周期 404 造成「主播暂时离开」频繁闪断；宽限超时（MAX_STREAM_BUFFER_MS）
          // 在 attemptStreamBufferResume 内强制转「主播暂时离开」由离线轮询接管
          if (res.data.status == "online") {
            if (that.streamStopped) {
              // 流终止后快速恢复探测（原画流恢复在推即解除过渡态并重挂续播）
              that.recoverStreamStoppedIfAlive();
            } else {
              that.streamStopped = false;
            }
          } else if (
            res.data.status == "run_playback" ||
            res.data.status == "end" ||
            res.data.status == "wait_playback"
          ) {
            // 直播已进入终态：解除终止标记，避免残留到下一次开播的缓冲宽限判断
            that.streamStopped = false;
            that.streamStoppedAt = 0;
          }

          // 连麦入口：连麦为内置基础功能，H5 端始终挂载（小程序端不支持连麦）；
          // 连麦组件内部按 config.link 控制「申请连麦」按钮显隐；
          // 讲师邀请/同意/结束由消息服务实时推送驱动（加载时组件拉取一次连麦状态兜底，
          // 保证讲师邀请在已打开的直播间也能弹出邀请提醒，不依赖 config.link 开关）；
          // 移动端平台开关（getRoomDetail 下发 link_mobile_enabled，直播设置-连麦「移动端开关」）：
          // 关闭后工具条连麦按钮隐藏（老接口未下发时保持默认开启）
          // #ifdef H5
          that.linkEntryInstalled = true;
          if (res.data.link_mobile_enabled !== undefined && res.data.link_mobile_enabled !== null) {
            that.platformLinkEnabled = res.data.link_mobile_enabled == 1;
          }
          // #endif

          // #ifndef MP-TOUTIAO
          if (res.data.message_subkey) {
            tabs.unshift({
              name: "讨论",
              type: "interaction",
            });
            that.tabsChecked = "interaction";
          }
          if (res.data.status == "run_playback") {
            tabs.unshift({
              name: "回放",
              type: "playback",
            });
            that.tabsChecked = "playback";
          }

          // #endif

          if (res.data.status == "online") {
            // 非 online → online 的状态翻转（推流恢复/新一场开播）：解除错误锁定重挂播放器；
            // online→online 的普通刷新不解锁（见 prevStatus 注释）。
            // 解锁前先探测原画流确实在推（originalStreamAlive）：锁定多为「开播建流窗口/
            // 断流期」的流未就绪（CDN 状态滞后仍报 online），流未在推时解锁重建只会再次
            // 失败形成「锁定↔重建」循环；流恢复在推（true）才解锁并强制重建重试，上限 3 次
            if (prevStatus !== "online" && that.videoErrorLocked) {
              that.originalStreamAlive().then(function (alive) {
                if (
                  !alive ||
                  that.errorRebuildCount >= 3 ||
                  that.streamStopped ||
                  that.roomData.status !== "online"
                ) {
                  return;
                }
                that.errorRebuildCount++;
                that.streamRetryCount = 0;
                that.videoErrorLocked = false;
                // 追加重载标记强制重建（同路径绕过同源续播），URL 变化自动触发
                // watch 重新布防看门狗与 LL-HLS 预检
                var rebuildSource = that.resolveOnlineSource(res.data);
                that.applyOnlineSourceUrl(
                  that.appendReloadMark(rebuildSource.url),
                  rebuildSource.quality,
                  true
                );
              });
            }
            // 计算本轮期望的播放源并按「同源续播」规则落盘：阿里云鉴权地址每次请求签名都不同，
            // 若每次详情响应都重写 videoUrl，任何重复刷新（状态探测抖动/开播推送/请求补发）都会
            // dispose+重建播放器、复位降级状态——配合转码流未就绪的 404 会形成
            // 「重建→加载中→降级→再重建」死循环（线上实证：开播后一直「画面加载中」，
            // 控制台循环输出「视频加载完成/视频开始播放」；推流结束后遮罩也不消失）
            var onlineSource = that.resolveOnlineSource(res.data);
            that.applyOnlineSourceUrl(onlineSource.url, onlineSource.quality);
            // 在线状态，清除定时器
            if (that.refreshTimer) {
              clearInterval(that.refreshTimer);
              that.refreshTimer = null;
            }
            // 预检测播流地址是否支持播放，不支持时直接提示，避免播放器循环报错触发刷新
            if (!that.isVideoUrlSupported) {
              that.videoErrorLocked = true;
              that.roomData.status_text = "当前视频格式不支持播放，请联系管理员使用 m3u8、mp4、flv 或 RTS 格式播流地址";
            }
          } else if (res.data.status == "offline" || res.data.status == "not_start") {
            // 后端权威状态确认非在线：退出断流缓冲宽限态（roomData 已替换为后端
            // 权威文案「主播暂时离开」，播放器按 v-if 卸载），停止缓冲重试探测
            if (that.streamBuffering) {
              that.leaveStreamBuffering();
            }
            that.streamStopped = false;
            that.streamStoppedAt = 0;
            // 离线或未开始状态，页面活跃时启动定时器（错误锁定不拦截：锁定只阻止播放器
            // 重挂，离线页轮询负责探测重新开播，恢复在线时由状态翻转解锁重挂）。
            // 轮询间隔固定 10s（不随消息服务连接状态放宽）：直播开始（publish）已不依赖
            // 消息服务推送，开播感知完全由本轮询驱动——等待/断流页每 10s 请求一次
            // getRoomDetail，状态翻转为 online 时自动落盘播流地址开始观看；
            // !refreshTimer 守卫避免圈内多入口重复创建定时器（循环重复执行）
            if (that.isPageActive && !that.refreshTimer) {
              that.refreshTimer = setInterval(() => {
                // 主播暂时离开/未开播：仅轮询直播间状态（getRoomDetail），课程详情不变无需重复请求
                that.refresh(false, true);
              }, 10000);
            }
          } else {
            // 其他状态，清除定时器
            if (that.refreshTimer) {
              clearInterval(that.refreshTimer);
              that.refreshTimer = null;
            }
          }

          that.autoPlayFirstPlayback(res.data);
          that.tabs = tabs;

          // 根据观看人数配置启动或停止轮询
          if (that.showViewerCount) {
            that.startOnlineUserPolling();
          } else {
            that.stopOnlineUserPolling();
          }

          // 直播在线且红包插件已安装时，拉取进行中的红包（用户错过消息推送可补拉）
          if (res.data.status == "online") {
            that.getActiveRedpacket();
          }

          // 结束探测：在线状态时启动 10s 轻量状态轮询，直播结束后及时切换状态页；
          // 非在线状态由上方 10s 轮询（offline/not_start）接管，此处停止在线轮询
          if (res.data.status == "online") {
            that.startOnlineStatusPolling();
          } else {
            that.stopOnlineStatusPolling();
          }
        });
    },

    /**
     * 拉取直播间当前进行中的红包
     * 进入直播间时调用，避免用户错过红包消息推送后无法看到红包
     */
    getActiveRedpacket() {
      if (!this.$tools.systemConfig('app_isinstall_live_redpacket')) {
        return;
      }
      var self = this;
      this.$api('live.redpacket.getActive', {
        course_id: this.pageParams.id,
      }).then(function (res) {
        if (res && res.code == 1 && res.data && res.data.id) {
          var rp = res.data;
          // 构造弹窗数据（与消息推送的数据结构保持一致）
          self.redpacketData = {
            id: rp.id,
            nickname: rp.admin_name,
            avatar: '',
            type: rp.type,
            type_text: rp.type == 'equal' ? '普通红包' : '拼手气红包',
            total_amount: rp.total_amount,
            total_num: rp.total_count,
            blessing: rp.blessing,
          };
          // 不自动弹出，仅在用户点击红包气泡时打开（进行中红包会在消息列表渲染）
        }
      }).catch(function () {});
    },

    /**
     * 开始轮询在线观看人数
     */
    startOnlineUserPolling() {
      this.stopOnlineUserPolling();
      this.fetchOnlineUserNum();
      var self = this;
      this.onlineUserTimer = setInterval(function () {
        self.fetchOnlineUserNum();
      }, 15000);
    },

    /**
     * 停止轮询在线观看人数
     */
    stopOnlineUserPolling() {
      if (this.onlineUserTimer) {
        clearInterval(this.onlineUserTimer);
        this.onlineUserTimer = null;
      }
    },

    /**
     * 获取在线观看人数
     */
    fetchOnlineUserNum() {
      var self = this;
      this.$api('live.room.getOnlineUserNum', {
        course_id: this.pageParams.id,
      }).then(function (res) {
        if (res && res.code == 1) {
          self.onlineUserNum = res.data || 0;
        }
      }).catch(function () {});
    },

    /**
     * 用户主动刷新（状态页「刷新」按钮 / 下拉刷新 / onShow 回到页面）：
     * 停机状态下仅放行这类来源，成功获取数据后自动恢复正常轮询
     */
    userRefresh() {
      this.refresh(false, false, true);
    },

    /**
     * getRoomDetail 连续失败处理：
     * 连续 ROOM_DETAIL_FAIL_LIMIT 次（网络异常或业务 code!=1）后停止自动轮询——
     * 清掉离线 10s 轮询与在线 10s 结束探测、丢弃在途补发标记，不再频繁请求；
     * 等待类状态同步提示文案，状态页常驻「刷新」按钮，用户点击成功一次即复位恢复轮询
     */
    handleRoomDetailFail() {
      that.roomDetailFailCount += 1;
      if (that.roomDetailFailCount < ROOM_DETAIL_FAIL_LIMIT) {
        return;
      }
      if (!that.roomDetailStopped) {
        that.roomDetailStopped = true;
        console.warn(
          "[live] getRoomDetail 连续失败 " +
            ROOM_DETAIL_FAIL_LIMIT +
            " 次，停止自动轮询，等待用户手动刷新"
        );
        if (that.refreshTimer) {
          clearInterval(that.refreshTimer);
          that.refreshTimer = null;
        }
        that.stopOnlineStatusPolling();
        // 在途补发诉求一并丢弃，避免本次失败复位刷新标记后立即再补发一枪
        that.refreshPending = false;
        that.refreshPendingFull = false;
        that.refreshPendingManual = false;
        if (
          that.roomData &&
          (that.roomData.status == "offline" ||
            that.roomData.status == "not_start")
        ) {
          that.roomData.status_text = "直播状态获取失败，请点击刷新重试";
        }
      }
    },

    //刷新
    refresh(addViews = false, roomOnly = false, manual = false) {
      // 停机状态下拦截一切自动触发的刷新（定时器已清空，此处兜底单发场景：
      // onEnd 播放结束/liveStreamStop 流终止/被合并的补发等），仅用户手动操作放行
      if (that.roomDetailStopped && !manual) {
        return;
      }
      // 上一次刷新请求尚未返回时，不再重复发起请求，标记待补发、等上一请求结束后再补发一次——
      // 避免 10s 轮询与 liveStreamStop/onShow/手动刷新等入口叠加并发请求
      // （getRoomDetail 内部会查阿里云流状态并做旁路兜底，并发反复调用会放大计费与负载）
      if (that.isRefreshing) {
        that.refreshPending = true;
        // 补发模式取并集：期间存在任一全量诉求则补全量，否则维持轻量
        if (!roomOnly) {
          that.refreshPendingFull = true;
        }
        // 补发同样继承手动身份：停机状态下只有手动诉求允许补发出去
        if (manual) {
          that.refreshPendingManual = true;
        }
        return;
      }
      that.isRefreshing = true;
      // 仅用户主动刷新解除错误锁定：自动刷新（状态轮询/开播推送/补发）不解锁——
      // 自动解锁会让播放器按 v-if 重新挂载、从头再走加载/降级链，而推流刚结束时 CDN 状态
      // 有滞后窗口（接口仍报 online、流已停），会形成「锁定→轮询→解锁重挂→再锁定」循环；
      // 主播恢复推流的自动解锁由 onStreamStatus publish 分支与 getRoomDetail 解锁探测
      // （originalStreamAlive 判流在推 + 上限 3 次）显式处理
      if (manual) {
        that.videoErrorLocked = false;
        that.streamRetryCount = 0;
        that.errorRebuildCount = 0;
      }
      // 清空清晰度登记：由 getRoomDetail 按缓存/当前规则重新选定（同源续播判定保证
      // 选出同一路径时不重写 videoUrl、不重建播放器，仅刷新登记的最新签名地址）
      that.currentQuality = null;
      if (roomOnly) {
        // 仅刷新直播间状态（live.room.getRoomDetail）：主播暂时离开/未开播的 10s 轮询、
        // 10s 结束探测、流终止过渡与播放结束重试等「状态刷新」场景无需重复拉取课程详情
        // （course.course.detail，不带 add_views），避免冗余请求与学习计时重置副作用
        var detailPromise = that.getRoomDetail();
        if (detailPromise && typeof detailPromise.then === "function") {
          detailPromise.then(that.finishRefresh, that.finishRefresh);
        } else {
          that.finishRefresh();
        }
      } else {
        that.getData(addViews);
      }
    },

    /**
     * 刷新请求链路结束（成功/失败均复位）
     * 复位后若期间又有刷新诉求（轮询 tick/状态翻转/手动刷新），立即补发一次，
     * 保证状态变化不会因「上一请求未返回被合并」而漏刷
     */
    finishRefresh() {
      that.isRefreshing = false;
      if (that.refreshPending) {
        that.refreshPending = false;
        // 待补发诉求期间若出现过全量诉求（onShow/下拉刷新等）则补全量，否则补轻量（仅直播间状态）
        var roomOnly = !that.refreshPendingFull;
        // 补发继承手动身份，停机状态下只放行手动来源
        var manual = that.refreshPendingManual;
        that.refreshPendingFull = false;
        that.refreshPendingManual = false;
        that.refresh(false, roomOnly, manual);
      }
    },

    /**
     * 视频加载完成
     * */

    // #ifdef MP
    videoReady(e) {
      // this.getElementHeight(e.video_height + 47);
      console.log('视频加载完成');
      // 播放器重建即视为新的播放会话：重算死流兜底检测基准
      this.lastVideoPlayed = Date.now();

      // 同步控制栏状态与清屏状态
      this.showVideoControlBar = !this.isClearScreen;
    },
    // #endif

    // #ifndef MP
    videoReady() {
      // setTimeout(() => {
      //   that.getElementHeight(0);
      // }, 500);
      console.log('视频加载完成');
      // 播放器重建即视为新的播放会话：重算死流兜底检测基准
      this.lastVideoPlayed = Date.now();
      this.fakeVideoJump();
      // 播放器每次挂载/重建（含 v-if 重挂、换源重建）都布防出画面看门狗：
      // 重挂时 videoUrl 可能未变化（watch 不触发），无看门狗时无 MSE 终端原生 HLS
      // 拉 404 流静默重试会让「画面加载中」永远停留
      if (!this.everPlayed) {
        this.armVideoLoadWatchdog(
          this.videoUrl,
          this.userPlayRequested ? VIDEO_LOAD_WATCHDOG_PLAY_TIMEOUT : undefined
        );
      }
      // 同步控制栏状态与清屏状态
      this.showVideoControlBar = !this.isClearScreen;
    },
    // #endif

    /**
     * 视频开始播放
     * */
    onPlay() {
      this.isPlaying = true;
      // 用户已表达播放意图：后续若降级换源/重建播放器，据此自动续播（不必再点一次）
      this.userPlayRequested = true;
      // 结束播放中途卡顿缓冲遮罩（waiting 恢复后 first play 即出画面）
      this.clearVideoBufferTimer();
      if (this.videoBuffering) {
        this.videoBuffering = false;
      }
      console.log('视频开始播放');
      // 首次出画面（everPlayed=false，含点播与自动播放起播）：出画面看门狗从本次播放
      // 请求重新起算并放宽窗口——布防起点本是页面加载赋值 videoUrl 的时刻，用户停留
      // 几秒再点播放会挤占剩余窗口，正常偏慢的起播缓冲被误判超时 → 降级换源重建
      // 播放器 → 大播放按钮重现，首次点击作废需再点一次
      if (!this.everPlayed) {
        this.armVideoLoadWatchdog(this.videoUrl, VIDEO_LOAD_WATCHDOG_PLAY_TIMEOUT);
      }
      this.fakeVideoJump();
    },

    fakeVideoJump(){
      if(this.roomData && this.data && this.data.live_type == 2 && this.roomData.status == 'online'){
        //这里应该通过前端获取实时的live_current_time
        // 计算当前应跳转的直播进度（秒）
        const now = Math.floor(Date.now() / 1000); // 当前 Unix 时间戳（秒）
        const liveStartTime = parseInt(this.data.live_start_time); // PHP 时间戳（秒）
        this.data.live_current_time = Math.max(0, now - liveStartTime); // 直播已进行时长（秒）

        setTimeout(() => {
          this.$refs.videoBox.setCurrentTime(parseInt(this.data.live_current_time));
        }, 500);
      }
    },

    /**
     * 视频暂停
     * */
    onPaused() {
      // 用户主动暂停画面冻结属正常操作，不参与死流兜底检测
      this.lastVideoPlayed = Date.now();
      this.isPlaying = false;
      console.log('视频暂停');
    },

    /**
     * 视频播放结束
     * */
    onEnd() {
      this.isPlaying = false;
      // 播放结束多为直播结束/断流：3s 后仅查直播间状态切换状态页，无需重复拉取课程详情
      setTimeout(() => {
        this.refresh(false, true);
      }, 3000);
    },
    /**
     * 获取元素高度
     * */
    getElementHeight(height = 0) {
      // #ifndef MP
      const query = uni.createSelectorQuery().in(that);
      query
        .select(".flex-container")
        .boundingClientRect((rect) => {
          that.videoBoxHeight = rect.height;
          that.setContainerHeight();
        })
        .exec();
      // #endif

      // #ifdef MP
      that.videoBoxHeight = height;
      that.setContainerHeight();
      // #endif
    },

    setContainerHeight(init = false) {
      
      uni.getSystemInfo({
        success: function (res) {
          let safeAreaBottom = 0;
          if (res.safeAreaInsets && res.safeAreaInsets.bottom) {
            safeAreaBottom = res.safeAreaInsets.bottom;
          }
          that.safeAreaBottom = safeAreaBottom;
          that.videoBoxHeight = res.windowHeight - safeAreaBottom;
          that.messageBoxHeight = res.windowHeight / 3;
        },
      });
    },
  },
  onHide() {
    courseLibrary.stopStudyLog();
    courseLibrary.banScreenRecordCancel();

    // 页面隐藏时标记为非活跃，清除定时器，停止请求
    this.isPageActive = false;
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    // 隐藏时清空卡顿检测
    this.clearBufferingState();
    // 停止断流缓冲恢复探测（后台期间不探测，回前台由 onShow 刷新接管）
    this.stopStreamBufferRetry();
    // 停止在线人数轮询
    this.stopOnlineUserPolling();
    // 停止直播在线状态轮询
    this.stopOnlineStatusPolling();
  },
  onUnload() {
    courseLibrary.stopStudyLog();
    courseLibrary.banScreenRecordCancel();

    // 清理定时器，避免内存泄露
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    // 卸载时清空卡顿检测
    this.clearBufferingState();
    // 清理卡顿缓冲遮罩延迟点亮定时器
    this.clearVideoBufferTimer();
    // 清理清晰度切换兜底定时器
    clearTimeout(this._qualitySwitchTimer);
    // 停止断流缓冲恢复探测，避免内存泄露
    this.stopStreamBufferRetry();
    // 停止在线人数轮询
    this.stopOnlineUserPolling();
    // 停止直播在线状态轮询
    this.stopOnlineStatusPolling();

    // #ifdef H5
    window.removeEventListener('message', this.handleIframePayMessage);
    // #endif

    this.$refs.message && this.$refs.message.onPageUnload && this.$refs.message.onPageUnload()
  },
  deactivated() {
    courseLibrary.stopStudyLog();
  },
  onShow() {
    courseLibrary.intervalSetStudyLog(that.pageParams.id,that.pageParams.column_id);
    // 页面重新显示时标记为活跃，恢复轮询；首次 onShow 与 onLoad 属同一次进页，
    // 首次详情请求已经发出，不能再补发一次，否则会在用户首次点播放时重建播放器。
    that.isPageActive = true;
    if (that.hasShownOnce || !that.initialRefreshStarted) {
      // 非 H5 端首次加载仍由 onShow 发起；后续从后台回到页面同样视为用户主动刷新，
      // 停机状态下也放行一次。
      that.userRefresh();
    }
    that.hasShownOnce = true;
  },
  //下拉刷新
  onPullDownRefresh() {
    courseLibrary.stopStudyLog();
    courseLibrary.banScreenRecordCancel();
    // 下拉属于用户主动操作，停机状态下放行
    that.userRefresh();
  },
  //上划加载
  onReachBottom() {
    // that.getData();
  },

  onLoad(pageParams) {
    that = this;
    this.setContainerHeight(true);
    that.pageParams = that.$nav.parsePageParams(pageParams);
    // #ifdef H5
    that.initialRefreshStarted = true;
    that.refresh(true);
    window.addEventListener('message', that.handleIframePayMessage);
    // #endif
  },
  onShareAppMessage() {
    return this.$nav.share(that.data.name || '', '', that.data.warm_up_cover || that.data.cover || '');
  },
  onShareTimeline() {
    return this.$nav.share(that.data.name || '', '', that.data.warm_up_cover || that.data.cover || '');
  },
};
</script>
