<template>
  <div class="video-h5-root" :style="[styles, coverStyle]">
    <div
      class="player-olympic"
      :class="{ 'player-olympic-sm-screen': !fullScreen, 'player-seek-disabled': disableSeek }"
      :ref="'playerTemp' + domId"
    ></div>
  </div>
</template>

<script>
var that;
import "@/components/video/assets/aliplayer-min.css";
import Aliplayer from "@/components/video/assets/aliplayer-min.js";
import aliplayerRateComponent from "@/components/video/assets/components/rate/index.js";
import aliplayerBulletScreenComponent from "@/components/video/assets/components/bullet_screen/index.js";
import aliplayerCopyrightComponent from "@/components/video/assets/components/copyright/index.js";
import aliplayerHotComponent from "@/components/video/assets/components/hot/index.js";
import aliplayerStatusControllComponent from "@/components/video/assets/components/status_controll/index.js";
// import AliPlayerComponent from "@/components/video/assets/aliplayercomponents-1.0.9.min.js";
export default {
  components: {},
  data() {
    return {
      player: null,
      playingVideo: {},
      videoLoading: true,
      fullScreen: false,
      initCurrentTime: 0,
      controlBarVisible: true,
      lastControlBarToggleTime: 0,
      fullscreenChangeHandler: null,
      videoFullscreenChangeHandler: null,
      refreshButtonContainer: null,
      refreshButtonHandler: null,
      // 禁止拖拽进度条时的跳变检测基准（最近一次上报的播放时间）
      lastPlayerTime: null,
      // 自己发起 seek（续播等）后的豁免截止时间戳，避免把正常 seek 误判为拖拽
      seekGuardUntil: 0,
      // 自动播放兜底的令牌：每次调用 playWithAutoplayFallback / 换源重建时递增，
      // 使上一轮的静音重试定时器失效，避免新旧实例交叉触发播放
      autoPlayRetryToken: 0,
      // 静音降级是否由本组件所为（attemptPlay(true) 置位）：据此在用户点击画面时恢复声音
      mutedByFallback: false,
      // 本次实例是「VID + PlayAuth」凭证档还是「播流地址」档建起来的：
      // 决定 refreshPlayer() 走重建还是 loadByUrl（地址档 loadByUrl 会重吃同一个一次性签名，
      // 凭证档必须重新取凭证再重建），并随每次重建重新判定
      playingWithCredential: false,
      // 换源重建的「同一拍只排一次」闸门：vid/playauth/source 常常在同一拍里一起变
      // （页面一次回填凭证），逐个重建会把播放器拆三回、用户看到连续闪
      rebuildScheduled: false,
      // 「用户按下播放按钮」那一刻的兜底重试定时器（见 bindPlayIntent）
      playIntentRetryTimer: null,
    };
  },
  props: {
    //封面
    cover: {
      type: String,
      default: "",
    },
    //视频地址
    source: {
      type: String,
      default: "",
    },
    //播放凭证
    playauth: {
      type: String,
      default: "",
    },
    // 阿里云点播视频 ID（VID）。
    // 为什么单独一枚而不是接着复用 source：过去「传了 playauth 就把 source 当 VID」这一约定
    // 让同一个 prop 在两种档位之间摇摆（`tz/file-preview.vue` 就按那一档写调用点），
    // 而课程详情这类「地址与 ID 同时要发（小程序吃地址、H5 吃 ID）」的调用点没法表达，
    // 只能二选一——这正是课程一直停在地址档、电脑端首播报 4400 的形态原因之一。
    // 传了它且 playauth 非空 ⇒ 凭证档；只传 playauth ⇒ 沿用旧调用点（source 当 VID）
    vid: {
      type: String,
      default: "",
    },
    //是否为直播
    isLive: {
      type: Boolean,
      default: false,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    //是否静音播放
    mute: {
      type: Boolean,
      default: false,
    },
    // 用户已表达播放意图（点过播放按钮）：换源重建后自动续播（静音降级 + 重试窗口），
    // 避免降级换源重建播放器后大播放按钮顶回来、用户必须再点一次
    resumePlay: {
      type: Boolean,
      default: false,
    },
    //浏览量
    views: {
      type: [String, Number, Boolean],
      default: false,
    },
    //跑马灯
    bulletScreen: {
      type: [String, Number, Boolean],
      default: false,
    },
    //高度
    height: {
      type: [String, Number],
      default: 0,
    },
    domId: {
      type: String,
      default: "",
    },
    styles: {
      type: [Object, Array],
      default: function () {
        return [];
      },
    },
    //是否显示全屏按钮
    showFullscreenButton: {
      type: Boolean,
      default: true
    },
    //视频填充模式
    objectFit: {
      type: String,
      default: 'contain'
    },
    controlBarVisibility:{
      type: String,
      default: 'click',
    },
    // 预览场景需要拦截播放器默认的 location.reload，改为只重载当前视频
    preventPageReloadOnRefresh: {
      type: Boolean,
      default: false,
    },
    // 凭证档的「重载」要不要改成去要一枚新凭证（课程详情页传 true）。
    // 默认 false 保住既有调用点（tz/file-preview 那一份只把 @refresh 用来收加载态，
    // 它不会重取凭证，把重建省掉等于让刷新按钮失灵）。
    // 过期凭证再吃一次只会换回同一块错误板，所以 opt-in 的这一档把重建交还给 playauth watcher
    refreshNeedsNewAuth: {
      type: Boolean,
      default: false,
    },
    //禁止拖拽进度条（web 课程设置 progress_seek 关闭时由父级传入）
    disableSeek: {
      type: Boolean,
      default: false,
    },
    // 点播模式下是否显示进度条与时长（直播间伪直播传 false：按点播模式播放录制视频是为了
    // 能 seek 对齐进度，但露出进度条等于告诉观众「这是录播」且允许跳到未播内容）。
    // 小程序端直播间不渲染播放器（platform-limit 占位），故仅 H5 分支消费该开关
    showProgress: {
      type: Boolean,
      default: true,
    },
    // 画面垂直位置上移比例（整数百分比，按播放区高度）：0 = 默认垂直居中；
    // 横屏直播画面按 contain 等比缩放后居中、下半部分会被底部消息区遮挡，
    // 直播间按该比例上移（基础 10% + 按播放区高度换算的 50px，即画面中心由 1/2 上移该比例）
    pictureOffsetPercent: {
      type: [Number, String],
      default: 0,
    },
  },
  computed: {
    /**
     * 封面包裹样式：仅在存在真实封面时才注入 --cover-url，避免 cover 未就绪/空值时
     * CSS background 触发 `/undefined` 这类 404 请求（H5 页面 Network 面板噪音与无谓请求）
     */
    coverStyle() {
      return this.cover ? { '--cover-url': `url(${this.cover})` } : {};
    },
  },
  watch: {
    source() {
      this.rebuildOnMediaChange();
    },
    // 视频 ID 与凭证换值 = 换了一档可播的资格（课程详情页重试/续播时重新取一枚凭证就会走到这里）：
    // 与换源同一档处理——重建实例，让 Aliplayer 拿新凭证重新取址。
    // 地址档的 loadByUrl 在凭证档是不允许的（SDK 自己会报「不能更新地址」），只能重建。
    vid() {
      this.rebuildOnMediaChange();
    },
    playauth() {
      this.rebuildOnMediaChange();
    },
    mute() {
      if (this.mute) {
        this.player.mute();
      } else {
        this.player.unMute();
      }
    },
    // objectFit（画面填充模式）变化：直设播放器 video 元素的内联样式兜底，
    // 确保竖屏直播连麦合流成片等场景的等比显示即时生效（不依赖重建播放器）
    objectFit() {
      this.$nextTick(() => {
        this.syncPlayerObjectFit();
      });
    },
    // 画面垂直偏移变化（横屏直播画面位置上调）：同样直设 video 元素内联样式
    pictureOffsetPercent() {
      this.$nextTick(() => {
        this.syncPlayerPictureOffset();
      });
    },
    // 全屏切换后重新同步：全屏由播放器铺满整屏，需要撤掉 / 恢复该偏移
    fullScreen() {
      this.$nextTick(() => {
        this.syncPlayerPictureOffset();
      });
    },
  },
  methods: {
    getPlayerElement() {
      return document.getElementById("player-con" + this.domId);
    },

    /**
     * 调整播放器容器尺寸（连麦分屏场景：主画面与本地画面各占 1/2）
     * 直接驱动容器内联样式，不需要重建播放器（重建会中断直播流、丢暂停态）。
     * 同时调整外层容器与容器内 .prism-player（视频标签绝对定位在后者内，宽度/高度随容器缩放）
     * @param {String} width 如 '100%' / '50%'
     * @param {String} height 如 '400px' / '50%'
     */
    resize(width, height) {
      try {
        const playerElement = this.getPlayerElement();
        if (!playerElement) return;
        const targets = [playerElement];
        // Aliplayer 根节点 .prism-player 位于容器内（视频标签在它内部绝对定位 100%×100%）
        const prism = playerElement.querySelector
          ? playerElement.querySelector(".prism-player")
          : null;
        if (prism) {
          targets.push(prism);
        }
        targets.forEach((el) => {
          if (width) el.style.width = width;
          if (height) el.style.height = height;
        });
        // 通知播放器自身重排（部分版本需要 setPlayerSize 才会同步内部布局）
        if (this.player && typeof this.player.setPlayerSize === "function") {
          try {
            this.player.setPlayerSize(width, height);
          } catch (e) {
            console.warn("setPlayerSize 失败", e);
          }
        }
      } catch (e) {
        console.warn("调整播放器尺寸失败", e);
      }
    },

    /**
     * 同步 objectFit 到播放器内 video 元素的内联样式（Aliplayer 实例原生不支持运行时切换
     * objectFit 属性，直接设 video 标签的 style.objectFit 覆盖实例构造时的默认值）。
     * 用于连麦上麦/下麦时主画面填充模式切换（cover ↔ contain），避免竖屏直播连麦合流
     * 画面被压扁变形（连麦合流成片布局由后端混流编排保证，移动端只需等比显示）。
     * 在 player ready 后的首次同步与 objectFit 属性 watcher 两处调用。
     */
    syncPlayerObjectFit() {
      try {
        const videoEl = this.getVideoElement();
        if (videoEl && this.objectFit) {
          videoEl.style.objectFit = this.objectFit;
        }
      } catch (e) {
        // 吞掉异常，不打断播放
      }
    },
    /**
     * 同步画面垂直偏移到播放器内 video 元素的内联样式（pictureOffsetPercent，% 播放区高度）。
     * 与 objectFit 一样只能走内联样式：video 元素由播放器 JS 创建，页面样式够不到它——
     * uni-app 会把页面样式里的 video 标签选择器改写成 uni-video，且页面样式带作用域属性
     * （data-v-xxx），而播放器内部元素两者都不具备，CSS 规则会静默失效。
     * video 元素本身占满播放区高度、画面在元素内居中，故上移 N% 即画面中心从 1/2 上移 N%。
     * 全屏由播放器铺满整屏，此时撤掉偏移（置空内联 top 还原默认定位）。
     */
    syncPlayerPictureOffset() {
      try {
        const videoEl = this.getVideoElement();
        if (!videoEl) {
          return;
        }
        const percent = Number(this.pictureOffsetPercent) || 0;
        videoEl.style.top =
          !this.fullScreen && percent > 0 ? "-" + percent + "%" : "";
      } catch (e) {
        // 吞掉异常，不打断播放
      }
    },
    getVideoElement() {
      const playerElement = this.getPlayerElement();
      return playerElement ? playerElement.querySelector("video") : null;
    },
    getMediaElement() {
      const playerElement = this.getPlayerElement();
      return playerElement
        ? playerElement.querySelector("video") ||
            playerElement.querySelector("audio")
        : null;
    },
    /**
     * 播放器是否停在「等用户手势」那一态（大播放按钮挂着、什么都没在拉）。
     * 页面据此决定起播加载态要不要显示：桌面浏览器（电脑端开 H5）会拦有声自动播放，
     * play() 被拒后播放器就停在这里，此刻加载遮罩盖在播放按钮上，读起来是
     * 「加载中不消失、还能透过它点播放」（2026-09-28 用户点名）。
     * 媒体元素还没建好时同样算「没在加载」——那一段该由 ready/play 事件重新给加载态。
     * @return {Boolean} true=没有在加载
     */
    isAwaitingPlay() {
      const media = this.getMediaElement();
      return !media || !!media.paused;
    },
    /**
     * 有媒体元素、且它停在暂停态（真的什么都没在拉）
     * 与 isAwaitingPlay 的差别只在一处：媒体元素还没建好（换源重建/首次建播放器的间隙）不算。
     * 页面用它判断「这一发起播已经被浏览器拒掉/被中断了，加载遮罩可以收」——重建间隙里元素本来
     * 就没了，按 isAwaitingPlay 判会把「正在重建」误当成「没人拉」，遮罩在换源那一拍闪掉、
     * 露出的正是那个「再点一下」的大播放按钮（2026-10-31）。
     * @return {Boolean} true=有媒体元素且 paused
     */
    isPausedWithMedia() {
      const media = this.getMediaElement();
      return !!media && !!media.paused;
    },
    syncFullScreenState() {
      const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      this.fullScreen = !!fullscreenElement || !!document.webkitIsFullScreen;
    },
    bindFullscreenEvents() {
      if (typeof document === "undefined" || this.fullscreenChangeHandler) {
        return;
      }

      this.fullscreenChangeHandler = () => {
        this.syncFullScreenState();
      };

      [
        "fullscreenchange",
        "webkitfullscreenchange",
        "mozfullscreenchange",
        "MSFullscreenChange",
      ].forEach((eventName) => {
        document.addEventListener(eventName, this.fullscreenChangeHandler);
      });
    },
    bindVideoFullscreenEvents() {
      const videoElement = this.getVideoElement();

      if (!videoElement || this.videoFullscreenChangeHandler) {
        return;
      }

      this.videoFullscreenChangeHandler = {
        begin: () => {
          this.fullScreen = true;
        },
        end: () => {
          this.fullScreen = false;
        },
      };

      videoElement.addEventListener(
        "webkitbeginfullscreen",
        this.videoFullscreenChangeHandler.begin
      );
      videoElement.addEventListener(
        "webkitendfullscreen",
        this.videoFullscreenChangeHandler.end
      );
    },
    /**
     * 监听底层媒体元素（video/audio）的时长事件。
     * 阿里云播放器 ready 事件时音频时长可能尚未就绪（getDuration 返回 0/NaN），
     * 通过原生 loadedmetadata/durationchange 兜底获取真实总时长。
     */
    bindMediaDurationEvents() {
      const mediaElement = this.getMediaElement();
      if (!mediaElement || mediaElement.__durationBinded) {
        return;
      }
      mediaElement.__durationBinded = true;
      const emitDuration = () => {
        const duration = mediaElement.duration;
        if (duration && isFinite(duration) && duration > 0) {
          this.$emit("loadedmetadata", {
            detail: {
              duration: parseInt(duration),
            },
          });
        }
      };
      mediaElement.addEventListener("loadedmetadata", emitDuration);
      mediaElement.addEventListener("durationchange", emitDuration);
    },
    unbindFullscreenEvents() {
      if (typeof document === "undefined" || !this.fullscreenChangeHandler) {
        return;
      }

      [
        "fullscreenchange",
        "webkitfullscreenchange",
        "mozfullscreenchange",
        "MSFullscreenChange",
      ].forEach((eventName) => {
        document.removeEventListener(eventName, this.fullscreenChangeHandler);
      });

      this.fullscreenChangeHandler = null;
    },
    unbindVideoFullscreenEvents() {
      const videoElement = this.getVideoElement();

      if (!videoElement || !this.videoFullscreenChangeHandler) {
        this.videoFullscreenChangeHandler = null;
        return;
      }

      videoElement.removeEventListener(
        "webkitbeginfullscreen",
        this.videoFullscreenChangeHandler.begin
      );
      videoElement.removeEventListener(
        "webkitendfullscreen",
        this.videoFullscreenChangeHandler.end
      );

      this.videoFullscreenChangeHandler = null;
    },
    bindRefreshButton() {
      if (!this.player) {
        return;
      }

      this.unbindRefreshButton();
      const playerElement = this.getPlayerElement();
      if (!playerElement) {
        return;
      }

      this.refreshButtonContainer = playerElement;
      this.refreshButtonHandler = (event) => {
        const target = event.target;
        const refreshButton = target && typeof target.closest === 'function'
          ? target.closest('.prism-button-refresh')
          : null;

        if (!refreshButton || !playerElement.contains(refreshButton)) {
          return;
        }

        if (this.preventPageReloadOnRefresh) {
          // 阿里云播放器内置按钮会直接调用 location.reload，这里在捕获阶段截断该行为。
          event.preventDefault();
          event.stopPropagation();
          if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
          }
          this.refreshPlayer();
        }
        this.$emit('refresh', false);
      };
      playerElement.addEventListener(
        'click',
        this.refreshButtonHandler,
        this.preventPageReloadOnRefresh
      );
    },
    unbindRefreshButton() {
      if (this.refreshButtonContainer && this.refreshButtonHandler) {
        this.refreshButtonContainer.removeEventListener('click', this.refreshButtonHandler, true);
      }
      this.refreshButtonContainer = null;
      this.refreshButtonHandler = null;
    },
    /**
     * 接管「用户按下播放按钮」这一刻（中央大播放按钮 / 底栏播放键）
     *
     * 两件事：
     * ① 立刻把播放意图抛给页面（`play-intent`）：页面据此点亮「画面加载中…」遮罩、从点击起算
     *    重挂出画面看门狗。页面原先只能等播放器 `play` 事件，而 Aliplayer 的 `play` 在**真正开播
     *    那一刻**才抛，首帧没出、这一发起播又被浏览器自动播放策略拒掉时它永远不来；
     * ② 兜底补发一次播放：这一下 play() 被拒/被内部 load 中断时，媒体停在 paused、大播放按钮
     *    还挂着，用户必须再点一次（2026-10-31 用户实报的「点播放→加载中→播放按钮又出现→
     *    再点一下才出画面」）。600ms 后复查仍停在暂停态就补发一次（走静音降级链，无手势时
     *    只有静音起播能过策略）。
     * 只在「点下去是要播放」这一侧生效：正在播时同一个按钮是暂停，不能当成播放意图。
     * 容器（#player-con{domId}）在换源重建时复用，用元素上的标记防重复绑定。
     */
    bindPlayIntent() {
      const playerElement = this.getPlayerElement();
      if (!playerElement || playerElement.__playIntentBound) {
        return;
      }
      playerElement.__playIntentBound = true;
      const self = this;
      playerElement.addEventListener(
        "click",
        (event) => {
          const target = event.target;
          const button =
            target && typeof target.closest === "function"
              ? target.closest(".prism-big-play-btn, .prism-play-btn")
              : null;
          if (!button || !playerElement.contains(button)) {
            return;
          }
          // 正在播时这一下是暂停：它不是播放意图，也不进补发窗口
          const media = self.getMediaElement();
          if (media && !media.paused) {
            return;
          }
          self.$emit("play-intent", false);
          clearTimeout(self.playIntentRetryTimer);
          self.playIntentRetryTimer = setTimeout(function () {
            self.playIntentRetryTimer = null;
            if (!self.player) {
              return;
            }
            const pending = self.getMediaElement();
            // 已经播起来（或已经在拉流）就不再补：补发会把用户刚点出来的播放再打断一次
            if (pending && !pending.paused) {
              return;
            }
            self.playWithAutoplayFallback();
          }, 600);
        },
        true
      );
    },
    /**
     * 取消「播放按钮兜底补发」定时器（换源/销毁时调用：旧实例的补发不能打到新实例上）
     */
    clearPlayIntentRetry() {
      if (this.playIntentRetryTimer) {
        clearTimeout(this.playIntentRetryTimer);
        this.playIntentRetryTimer = null;
      }
    },
    /**
     * 接管播放器内置的全屏按钮（iOS/iPadOS）。
     * 按钮点击落在 Aliplayer 自己的 fullscreenService 上，服务里那套 iOS 判据认不出
     * iPadOS 的桌面级 UA ⇒ 全屏无反应。这里在容器捕获阶段拦下这一下点击，改走
     * video 原生全屏（与 iPhone 一致）；没有原生能力时放行给播放器，行为不变。
     * 容器（#player-con{domId}）在换源重建时复用，用元素上的标记防重复绑定。
     */
    bindFullscreenButtonGuard() {
      if (!this.isIOSFamily()) {
        return;
      }
      const playerElement = this.getPlayerElement();
      if (!playerElement || playerElement.__iosFullscreenGuardBound) {
        return;
      }
      playerElement.__iosFullscreenGuardBound = true;
      playerElement.addEventListener(
        "click",
        (event) => {
          const target = event.target;
          const button =
            target && typeof target.closest === "function"
              ? target.closest(".prism-fullscreen-btn")
              : null;
          if (!button || !playerElement.contains(button)) {
            return;
          }
          const videoElement = this.getVideoElement();
          if (!videoElement || typeof videoElement.webkitEnterFullscreen !== "function") {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          if (typeof event.stopImmediatePropagation === "function") {
            event.stopImmediatePropagation();
          }
          if (this.isNativeVideoFullscreenActive(videoElement)) {
            this.exitNativeVideoFullscreen(videoElement);
          } else {
            this.enterNativeVideoFullscreen(videoElement);
          }
        },
        true
      );
    },
    /**
     * 换了一档可播的东西（地址 / 视频 ID / 凭证）⇒ 拆掉旧实例重建。
     *
     * 三枚 watcher 共用这一条：页面回填凭证时 source 与 playauth 往往同一拍一起变，
     * 逐枚重建会把播放器连拆三回。这一拍已经排过一次就跳过（本拍内 buildPlayer 读的是
     * 最新值，跳过不会漏掉新参数）。时序保持与原来逐枚同步重建一致，不改成 nextTick 延后——
     * 直播页在换源后紧接着就调 setCurrentTime，延后一拍拿到的是旧实例。
     */
    rebuildOnMediaChange() {
      if (this.rebuildScheduled) {
        return;
      }
      this.rebuildScheduled = true;
      this.$nextTick(() => {
        this.rebuildScheduled = false;
      });

      // 换源即弃用上一轮自动播放重试计划与静音降级标记：旧实例的定时器不再触发，
      // 新实例的声音状态不沿用（是否静音由新实例的自动播放降级重新决定）
      this.autoPlayRetryToken++;
      this.mutedByFallback = false;
      this.disposePlayerInstance();
      // 切换播放源后重置拖拽检测基准，避免沿用上一视频的播放时间误判
      this.lastPlayerTime = null;
      this.seekGuardUntil = 0;
      this.buildPlayer();
      if (this.playbackTarget()) {
        this.playWithAutoplayFallback();
      }
    },

    /**
     * 销毁当前播放器实例（先摘掉「当前实例」标识再 dispose，异步事件不再当数）
     * @return void
     */
    disposePlayerInstance() {
      if (!this.player) {
        return;
      }
      this.unbindRefreshButton();
      this.unbindVideoFullscreenEvents();
      // 旧实例的「播放按钮兜底补发」一并作废，不能让它补到新实例上
      this.clearPlayIntentRetry();
      // 先清空当前实例标识，再销毁旧播放器。旧实例在 dispose 期间仍可能异步派发
      // waiting/error/liveStreamStop；若仍被当作当前实例处理，会把刚切入的新直播源
      // 误判为失败并重置播放器。
      var previousPlayer = this.player;
      this.player = null;
      previousPlayer.dispose();
    },

    /**
     * 这一档播放到底拿什么去播：凭证档返回 VID，地址档返回播流地址
     * 页面只传了 playauth、没传 vid 时沿用旧调用点那一档（source 位放的就是 VID，
     * 见 `tz/file-preview.vue`），但不许把一条签名地址当 VID 交给 SDK——那一发只会换回
     * 一句「playauth 解析错误 / 不能更新地址」，所以先用 looksLikeMediaUrl 挡一刀
     * @return {String} 两者都没有时返回空串
     */
    playbackTarget() {
      var vid = (this.vid || "").trim();
      if (this.playauth) {
        if (vid) {
          return vid;
        }
        return this.looksLikeMediaUrl(this.source) ? "" : (this.source || "").trim();
      }
      return (this.source || "").trim();
    },

    /**
     * 这串是不是「一条要交给媒体元素/浏览器的媒体地址」（含协议头或播放类扩展名）
     * @param {String} value
     * @return {Boolean}
     */
    looksLikeMediaUrl(value) {
      var text = (value || "").trim();
      if (!text) {
        return false;
      }
      return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(text)
        || /\.(m3u8|mp4|flv|mp3|webm|mov|m4a)(\?|#|$)/i.test(text);
    },

    /**
     * 重载当前视频（连麦下麦后恢复播放等场景）：
     * 仅重载视频流本身，不刷新页面/不改变直播间状态
     */
    reload() {
      this.refreshPlayer();
    },

    refreshPlayer() {
      var target = this.playbackTarget();
      if (!this.player || !target) {
        return;
      }

      // VID + PlayAuth 播放不是普通 URL，不能用 loadByUrl(raw video id) 重载；
      // 重新创建实例，沿用当前凭证和加密播放参数。
      // 凭证那一枚的有效期是阿里云侧的短窗口，页面挂着不动过窗之后这一发重建会失败——
      // 所以端上「刷新」在凭证档必须由页面重新取一枚凭证（页面收到 refresh 事件后重取，
      // 新值经 playauth watcher 走到 rebuildOnMediaChange），这里只是把当前凭证再吃一次
      if (this.playingWithCredential) {
        if (this.refreshNeedsNewAuth) {
          // 凭证档的「重载」要的是新的一枚凭证，而不是把手里这枚再吃一次：
          // 过窗的凭证重建回来还是同一块错误板。这里只出声，页面重取的那一枚到手后
          // 由 playauth watcher 走 rebuildOnMediaChange —— 那才是「不用刷新整页」的出口
          this.$emit("refresh", false);
          return;
        }
        this.autoPlayRetryToken++;
        this.mutedByFallback = false;
        this.disposePlayerInstance();
        this.buildPlayer();
        if (this.autoplay || this.isLive) {
          this.playWithAutoplayFallback();
        }
        return;
      }

      if (typeof this.player.loadByUrl !== 'function') {
        return;
      }
      this.player.loadByUrl(target);
      if (this.autoplay || this.isLive) {
        this.playWithAutoplayFallback();
      }
    },
    /**
     * 是否 iOS / iPadOS 家族（含 iPadOS 13+ 的桌面级 UA）。
     * vendored Aliplayer 2.15.2 只按 UA 里的 iPad/iPhone/iPod 认 iOS；iPadOS 13 起
     * Safari 默认发 Macintosh 桌面 UA，它会走 Fullscreen API / 模拟全屏那条链，
     * 而 iPad 浏览器与微信内置浏览器要么没有该 API、要么只认 video 原生全屏，
     * 表现为「全屏按钮点了没反应」。这里补齐 iPadOS 的判据（桌面 UA + 多点触控）。
     */
    isIOSFamily() {
      if (typeof navigator === "undefined") {
        return false;
      }
      var ua = navigator.userAgent || "";
      if (/iPad|iPhone|iPod/i.test(ua)) {
        return true;
      }
      // iPadOS 13+：UA 与 Mac 相同，但支持多点触控（Mac 笔记本 maxTouchPoints 为 0）
      return /Macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1;
    },
    isNativeVideoFullscreenActive(videoElement) {
      return !!(videoElement && videoElement.webkitDisplayingFullscreen);
    },
    /**
     * 进入 video 元素的原生全屏（iOS/iPadOS 上唯一稳定可用的一条，iPhone 现有行为即是它）。
     * 系统播放器铺满整屏，不受页面容器尺寸、层级与模拟全屏 CSS 的影响。
     * @return {Boolean} 是否已成功发起（无此能力或抛错时返回 false，交回播放器原有链路）
     */
    enterNativeVideoFullscreen(videoElement) {
      if (!videoElement || typeof videoElement.webkitEnterFullscreen !== "function") {
        return false;
      }
      try {
        // 用户可能在 ready 之前就点全屏：先把 iOS 原生全屏的进出事件挂上，
        // 否则退出时（系统播放器「完成」按钮）fullScreen 状态收不回来
        this.bindVideoFullscreenEvents();
        videoElement.webkitEnterFullscreen();
        // 原生全屏事件（webkitbeginfullscreen）在部分内核下延迟到达，先同步状态；
        // 画面垂直偏移只在非全屏态生效，这里要立刻撤掉
        this.fullScreen = true;
        return true;
      } catch (error) {
        console.warn("请求原生视频全屏失败:", error);
        return false;
      }
    },
    exitNativeVideoFullscreen(videoElement) {
      if (!this.isNativeVideoFullscreenActive(videoElement)) {
        return false;
      }
      try {
        videoElement.webkitExitFullscreen();
        this.fullScreen = false;
        return true;
      } catch (error) {
        console.warn("退出原生视频全屏失败:", error);
        return false;
      }
    },
    requestFullScreen() {
      if (!this.player) {
        return;
      }

      const videoElement = this.getVideoElement();

      // iOS/iPadOS 优先走 video 原生全屏：与手机端（iPhone UA 被判为 iOS 后走同一条链）
      // 行为一致，也绕开 iPad 上失效的元素全屏 / 模拟全屏链路
      if (this.isIOSFamily()) {
        if (this.isNativeVideoFullscreenActive(videoElement)) {
          return;
        }
        if (this.enterNativeVideoFullscreen(videoElement)) {
          return;
        }
      }

      if (this.fullScreen) {
        return;
      }

      const player = this.player;

      try {
        if (
          player.fullscreenService &&
          typeof player.fullscreenService.requestFullScreen === "function"
        ) {
          player.fullscreenService.requestFullScreen();
        } else if (typeof player.requestFullScreen === "function") {
          player.requestFullScreen();
        } else if (videoElement && typeof videoElement.requestFullscreen === "function") {
          videoElement.requestFullscreen();
        } else if (
          videoElement &&
          typeof videoElement.webkitRequestFullscreen === "function"
        ) {
          videoElement.webkitRequestFullscreen();
        } else if (
          videoElement &&
          typeof videoElement.webkitEnterFullscreen === "function"
        ) {
          videoElement.webkitEnterFullscreen();
        }
      } catch (error) {
        console.warn("请求系统全屏失败:", error);
      }
    },
    exitFullScreen() {
      if (!this.player) {
        return;
      }

      // iOS/iPadOS 的退出同样走原生：requestFullScreen 用的是 video 原生全屏，
      // document.exitFullscreen 对它无效（页面里没有 fullscreenElement）
      if (this.isIOSFamily() && this.exitNativeVideoFullscreen(this.getVideoElement())) {
        return;
      }

      const hasFullscreenElement = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        document.webkitIsFullScreen
      );

      if (!this.fullScreen && !hasFullscreenElement) {
        return;
      }

      const player = this.player;

      try {
        if (
          player.fullscreenService &&
          typeof player.fullscreenService.cancelFullScreen === "function"
        ) {
          player.fullscreenService.cancelFullScreen();
        } else if (typeof player.cancelFullScreen === "function") {
          player.cancelFullScreen();
        } else if (typeof document.exitFullscreen === "function") {
          document.exitFullscreen();
        } else if (typeof document.webkitExitFullscreen === "function") {
          document.webkitExitFullscreen();
        }
      } catch (error) {
        console.warn("退出系统全屏失败:", error);
      }
    },
    setSpeed(val) {
      this.player.setSpeed(val);
    },

    /**
     * 自动播放兜底策略（H5 移动端必需）：
     * 直播（isLive）与自动首播（autoplay）场景，浏览器（iOS Safari / 微信内置浏览器 /
     * 部分安卓内核）会拦截「有声」自动播放，若直接失败，播放器只会展示大播放按钮，
     * 等待用户手动点击——直播开始时即出现「需要再点一下」的体验问题。
     * 本项目内嵌的 Aliplayer 2.15.2 不支持 autoplayPolicy/fallbackToMute 配置
     * （vendored aliplayer-min.js 中无这些选项），故在此手动实现降级：
     * 先尝试有声播放；被拦截（play() 返回的 promise 被 reject / 老内核无法拿到
     * promise 时延迟探测 paused）则静音底层 video 元素后重试——静音自动播放
     * 在主流移动端浏览器中均被允许，保证直播开始时画面自动拉流。
     */
    playWithAutoplayFallback() {
      // 判「有没有得播」要按当前这一档：凭证档的播流资格是 VID，页面只传 vid 时 source 是空的，
      // 只看 this.source 会让自动首播整条兜底静默不跑（表现就是「进去只有大播放按钮」）
      if (!this.player || !this.playbackTarget()) {
        return;
      }
      // 仅「期望自动播放」的场景走降级（直播 / 显式 autoplay），普通点播不干预
      if (!this.autoplay && !this.isLive) {
        return;
      }
      var self = this;
      // 递增令牌：再次调用（如 ready 回调）使上一轮重试计划失效，只保留本轮
      var token = ++this.autoPlayRetryToken;
      var attemptPlay = function (muted) {
        var media = self.getVideoElement();
        if (muted && media) {
          // 静音降级：直接操作底层 video 元素，保证静音自动播放通过浏览器拦截
          try {
            media.muted = true;
          } catch (e) {}
          self.mutedByFallback = true;
        }
        var p = null;
        try {
          p = self.player.play();
        } catch (e) {
          p = null;
        }
        // 部分内核下 player.play() 不返回 promise，改取底层 video 元素的 play()
        if (!p || typeof p.then !== "function") {
          try {
            p = media ? media.play() : null;
          } catch (e) {
            p = null;
          }
        }
        return p;
      };

      // 静音续播重试窗口（仅在用户已表达播放意图 resumePlay 时启用）：
      // 换源重建后的单次 play() 常因引擎尚未就绪被中断（AbortError）或被自动播放
      // 策略拒绝，失败又被吞掉 → 停在暂停态、大播放按钮重现，用户必须再点一次。
      // 在窗口期内对仍处暂停态的媒体元素按间隔补发静音播放——出画面即自动停止；
      // 静音起播后用户点击画面/音量按钮即恢复声音。首次进页维持单次尝试，不放大
      // 既有行为（是否自动播放仍由浏览器策略决定）
      if (this.resumePlay) {
        [800, 1600, 2400, 3600, 4800, 6000].forEach(function (delay) {
          setTimeout(function () {
            if (token !== self.autoPlayRetryToken || !self.player) {
              return;
            }
            var media = self.getVideoElement();
            if (!media || !media.paused) {
              return;
            }
            var retry = attemptPlay(true);
            if (retry && typeof retry.catch === "function") {
              retry.catch(function () {});
            }
          }, delay);
        });
      }

      var promise = attemptPlay(false);
      if (promise && typeof promise.then === "function") {
        // 标准路径：有声自动播放被拦截时 promise 会 reject，静音重试一次
        promise.catch(function () {
          if (token !== self.autoPlayRetryToken) {
            return;
          }
          var retry = attemptPlay(true);
          if (retry && typeof retry.catch === "function") {
            retry.catch(function () {});
          }
        });
      } else {
        // 老内核拿不到 promise：延迟探测是否真的在播，仍处于暂停说明被拦截，静音重试一次
        setTimeout(function () {
          if (token !== self.autoPlayRetryToken) {
            return;
          }
          var media = self.getVideoElement();
          if (media && media.paused) {
            var retry = attemptPlay(true);
            if (retry && typeof retry.catch === "function") {
              retry.catch(function () {});
            }
          }
        }, 800);
      }
    },

    /**
     * 静音自动续播后的声音恢复：自动续播受浏览器策略限制只能静音起播（无用户手势
     * 不能带声播放），用户随后对播放器的点击（大播放按钮/画面任意位置）即恢复声音。
     * 控制栏内的音量按钮由播放器自行处理，点击不在此列，避免与音量开关互相打架
     */
    bindMuteRestore() {
      var playerElement = this.getPlayerElement();
      if (!playerElement || playerElement.__muteRestoreBound) {
        return;
      }
      playerElement.__muteRestoreBound = true;
      var self = this;
      playerElement.addEventListener("click", function (event) {
        if (!self.mutedByFallback) {
          return;
        }
        var target = event.target;
        if (
          target &&
          typeof target.closest === "function" &&
          target.closest(".prism-controlbar")
        ) {
          return;
        }
        var media = self.getMediaElement();
        if (media && media.muted) {
          try {
            media.muted = false;
          } catch (e) {}
        }
        self.mutedByFallback = false;
      });
    },

    /**
     * 手动切换控制栏显示状态
     */
    toggleControlBar() {
      if (!this.player) return;
      
      const currentTime = Date.now();
      // 防止频繁点击，最少间隔300ms
      if (currentTime - this.lastControlBarToggleTime < 300) {
        return;
      }
      this.lastControlBarToggleTime = currentTime;
      
      this.controlBarVisible = !this.controlBarVisible;
      this.updateControlBarVisibility();
    },

    /**
     * 更新控制栏显示状态
     */
    updateControlBarVisibility(status = null) {
      if (!this.player) return;
      
      try {
        const playerElement = document.getElementById("player-con" + this.domId);
        console.log("playerElement",playerElement)
        if (playerElement) {
          const controlBar = playerElement.querySelector('.prism-controlbar');
          console.log("controlBar",controlBar)
          if (controlBar) {
            var display = this.controlBarVisible ? 'block' : 'none';
            var visibility = this.controlBarVisible ? 'visible' : 'hidden';

            if(status){
              if(status == 'show'){
                display = 'none';
                visibility = 'hidden';
              }else{
                display = 'block';
                visibility = 'visible';
              }
            }

            controlBar.style.display = display;
            controlBar.style.visibility = visibility;
            
          }
        }
      } catch (error) {
        console.warn('控制控制栏显示状态时出错:', error);
      }
    },

    showControlBar() {
      this.toggleControlBar();
    },

    /**
     * 初始化控制栏点击事件
     */
    initControlBarEvents() {
      if (!this.player) return;
      
      this.$nextTick(() => {
        const playerElement = document.getElementById("player-con" + this.domId);
        if (playerElement) {
          // 添加点击事件监听
          playerElement.addEventListener('click', (event) => {
            // 避免点击控制栏本身时触发切换
            if (!event.target.closest('.prism-controlbar')) {
              this.toggleControlBar();
            }
          });
          
          // 初始化控制栏状态
          this.updateControlBarVisibility();
        }
      });
    },

    playVideo(video) {
      if (this.player === null || this.playingVideo.VideoId === video.VideoId) {
        return;
      }
      this.player.loadByUrl(video.source);
      this.playingVideo = video;
      return;
    },
    /**
     * 获取播放时间
     */
    getCurrentTime() {
      return this.player.getCurrentTime();
    },

    /**
     * 设置播放进度
     * @param {*} time
     */
    setCurrentTime(time) {

      var videoDuration = this.getDuration();

      // 时长未知（直播模式/元数据未就绪时 getDuration 返回 0 或 NaN）时不跳转：
      // 原写法会把它折算成 -2 传给 seek，播放器按非法位置直接报错（伪直播进房首轮
      // 「视频加载失败」的落点）；元数据就绪后 onPlay/ready 会再对齐一次
      if (!(videoDuration > 0)) {
        console.log("setCurrentTime skipped: duration not ready", time, videoDuration);
        return;
      }

      if (time > videoDuration - 2) {
        time = videoDuration - 2;
      }
      if (time < 0) {
        time = 0;
      }

      console.log("videoDuration",time,videoDuration);
      // 自己发起的 seek 进入豁免窗，避免后续 timeupdate 落差被误判为拖拽
      this.seekGuardUntil = Date.now() + 3000;
      this.lastPlayerTime = time;
      this.player.seek(time);
      // this.player.play()
    },
    /**
     * 禁止拖拽进度条：检测 timeupdate 跳变（仅前进跳变算拖拽），跳变时拉回原位置
     * @param {number} time 当前上报的播放时间
     * @return {boolean} 是否发生了拖拽跳变并已拉回
     */
    isSeekJump(time) {
      if (Date.now() < this.seekGuardUntil) {
        // 自己发起的 seek 豁免窗内直接采信，不再检测
        this.lastPlayerTime = time;
        return false;
      }
      if (this.lastPlayerTime != null && time > this.lastPlayerTime && (time - this.lastPlayerTime) > 4) {
        this.player.seek(this.lastPlayerTime);
        this.seekGuardUntil = Date.now() + 2000;
        return true;
      }
      this.lastPlayerTime = time;
      return false;
    },

    pause() {
      if (this.player) {
        this.player.pause();
        this.$emit("paused", false);
      }
    },
    replay() {
      this.player.replay();
    },
    play() {
      if (this.player) {
        this.player.play();
      }
    },
    seek(time) {
      // this.player.seek(time);
      console.log("this.player.seek(time)",this.player.seek(time))
    },
    getDuration() {
      return this.player.getDuration();
    },
    buildPlayer() {
      var that = this;
      if (document.getElementById("player-con" + this.domId) === null) {
        let playerDomWrap = that.$refs["playerTemp" + this.domId];
        let playerDom = document.createElement("div");
        playerDom.setAttribute("id", "player-con" + this.domId);
        playerDomWrap.appendChild(playerDom);
      }

      var height = this.height;
      var defailtHeight = uni.getWindowInfo().windowWidth / 1.7777;

      if(defailtHeight > 270){
        defailtHeight = 270;
      }

      if(!height){
        height = defailtHeight
      }


      let props = {
        id: "player-con" + this.domId,
        width: "100%",
        objectFit: this.objectFit,//横屏直播 contain;竖屏直播cover
        height: height + "px",
        // height:'4.22rem',
        // height: "100%",
        videoMaxHeight:'270px',
        // videoMaxHeight:'400px',
        autoplay: this.autoplay,
        cover: this.cover,
        components: [],
        enableMockFullscreen: false,
        controlBarVisibility:this.controlBarVisibility
      };

      // 两档播放形态在这里一次定下来，并把结论记进 playingWithCredential：
      // refreshPlayer() 与页面都要按这一档决定「重取凭证重建」还是「loadByUrl 同一条地址」
      var target = this.playbackTarget();
      this.playingWithCredential = !!(this.playauth && target);

      if (this.playingWithCredential) {
        // 阿里云官方对私有加密 VID 的播法：SDK 自己拿凭证取址、自己按端解密。
        // 电脑浏览器没有原生 HLS、MSE 又拿不到阿里云侧的分片密钥，把私有加密 m3u8 直接交给
        // 媒体元素就是 error_code 4400 / error_msg "4 || "（MEDIA_ERR_SRC_NOT_SUPPORTED，
        // 且回体里 mediaId/requestId 全空 = 一次网络响应都没发生）；走凭证档由 SDK 链路取址，
        // 桌面与手机才是同一条链
        props.playauth = this.playauth;
        props.vid = target;
        props.authTimeout = 7200;
        props.format = "m3u8";
        props.encryptType = 1;
      } else {
        props.source = this.source;
        // 根据 source 后缀自动适配播放格式
        var sourceFormat = this.detectSourceFormat(this.source);
        if (sourceFormat) {
          props.format = sourceFormat;
        }
      }
      if (this.isLive) {
        props.autoplay = true;
        props.preload = true;
        props.isLive = true;
        props.playsinline = true;
        props.skipRtsSupportCheck = false;
        // 直播低延迟治理（官方 Aliplayer 播放器配置）：
        // - flvFrameChasing：FLV 直播追帧，缓冲落后时加速追齐，默认 false 会累积 2~5s 缓冲延迟
        // - liveSyncDurationCount：HLS 直播同步到近边缘的「分片数」，默认 3（叠加分片时长≈10~30s 延迟），
        //   调为 1 后 MSE 端 HLS 兜底链路同样保持近实时；无 MSE 的 iOS 端走原生 HLS/LL-HLS（见后台 LL-HLS 配置）
        props.flvFrameChasing = true;
        props.liveSyncDurationCount = 1;
        // 追帧两阶段显式启用（vendored aliplayer 2.15.2 透传逻辑：不传则用引擎默认关闭）——
        // 只开 flvFrameChasing 总开关而两阶段未开时，FLV 缓冲落后不会实际追帧，
        // 延迟沿缓冲自然累积到 FLV 档上限（2026-08-30 实测 H5 电脑浏览器 5s 的代码层根因）；
        // 速度取官方直播低延迟示例值：起播 1.5 倍追齐，播放中 1.25 倍维持近边缘
        props.chasingFirstParagraph = true;
        props.chasingFirstSpeed = 1.5;
        props.chasingSecondParagraph = true;
        props.chasingSecondSpeed = 1.25;
        // HLS 兜底链路同样追帧（modern Hls 引擎；iOS 无 MSE 走原生 HLS 不受影响）
        props.hlsFrameChasing = true;
        // RTS 建立成功但 N 秒收不到媒体数据即判失败（vendored 默认 6000ms）：
        // 起播失败降级由页面 6s 出画面看门狗兜底（liveErrorHandle 降级链），此处超时
        // 只影响重试节奏；播放中途 5s 内的网络抖动/CDN 切换不触发重建，仅画面短暂停顿
        props.rtsLoadDataTimeout = 5000;
        // RTS 拉流失败重试次数：默认 5 次才触发 liveStreamStop/error。设 2 让播放中途
        // 的短暂断流（约 10s 内恢复）由 SDK 静默重试吸收——重订阅成功即无缝续播，
        // 不再直接进入「主播暂时离开」过渡态拆掉播放器（重试期间的降级兜底仍是看门狗，
        // 起播失败降级节奏不受影响）；直播真实结束由后端 SOCKET 断流推送即时告知
        props.liveRetry = 2;
        // 直播 HLS 启用最新 Hls 引擎 + 低延迟模式（本包已内嵌 Hls 引擎，无需外部 SDK）：
        // - LL-HLS（-llhls.m3u8?aliyunols=on）按 PART 分片近边缘同步，端到端 3~5s 而非按普通分片缓冲（10s+）；
        // - 标准 HLS 兜底同样由 modern 引擎接管，配合 liveSyncDurationCount=1 保持近实时；
        // - 播放器默认 lowLatencyMode=false 时才先探测 PART-INF 再切引擎，显式开启可省去探测、起播更快
        props.useHls2 = true;
        props.lowLatencyMode = true;
        props.autoplayPolicy = {
          fallbackToMute: true, // 有声自动播放失败后，是否降级为静音自动播放，默认为false
          showUnmuteBtn: true, // 静音自动播放时，是否居中显示静音大按钮，默认为true
        }

        props.skinLayout = [
          { name: "errorDisplay", align: "tlabs", x: 0, y: 0 },
          { name: "infoDisplay", align: "cc" },
          {
            //控制栏。
            name: "controlBar",
            align: "blabs",
            x: 0,
            y: 0,
            children: [
              { name: "playButton", align: "tl", x: 15, y: 12 },
              //直播播放时画面上显示LIVE字样。
              // { name: "liveDisplay", align: "tlabs", x: 15, y: 6 },
              // 音量。
              { name: "volume", align: "tr", x: 5, y: 10 },
              //全屏按钮（根据props控制显示）。
              ...(this.showFullscreenButton ? [{ name: "fullScreenButton", align: "tr", x: 10, y: 12 }] : [])
            ],
          }
        ];
      } else {
        props.isLive = false;
        if (this.autoplay) {
          // 浏览器禁止有声自动播放时，降级为静音播放，确保自动首播真实生效。
          props.autoplayPolicy = {
            fallbackToMute: true,
            showUnmuteBtn: true,
          };
        }
        props.skinLayout = [
          {
            name: "H5Loading",
            align: "cc",
          },
          { name: "errorDisplay", align: "tlabs", x: 0, y: 0 },
          { name: "infoDisplay" },
          { name: "tooltip", align: "blabs", x: 0, y: 56 },
          { name: "thumbnail" },
          {
            name: "controlBar",
            align: "blabs",
            x: 0,
            y: 0,
            children: [
              // 进度条与时长随 showProgress 收放：关掉后控制栏退化为「播放/音量/全屏」，
              // 与直播形态一致（伪直播按点播模式播放但不允许被看出是点播）
              ...(this.showProgress ? [{ name: "progress", align: "blabs", x: 0, y: 44 }] : []),
              { name: "playButton", align: "tl", x: 15, y: 12 },
              ...(this.showProgress ? [{ name: "timeDisplay", align: "tl", x: 10, y: 7 }] : []),
              { name: "volume", align: "tr", x: 5, y: 10 },
              //全屏按钮（根据props控制显示）。
              ...(this.showFullscreenButton ? [{ name: "fullScreenButton", align: "tr", x: 10, y: 12 }] : [])
            ],
          }
        ];
      }

      // 有得播才摆大播放按钮：凭证档的「有得播」是 VID（页面只传 vid、source 留空那一档），
      // 只看 this.source 会让凭证档点不出第一下
      if (target) {
        props.skinLayout.push({ name: "bigPlayButton", align: "cc" });
      }

      var marqueeConfig = that.$tools.systemConfig("marquee");

      if (this.bulletScreen !== false) {
        props.components.push({
          name: "BulletScreenComponent",
          type: aliplayerBulletScreenComponent,
          args: [
            this.bulletScreen,
            {
              fontSize: marqueeConfig.bullet_font_size + "px",
              color: marqueeConfig.bullet_color,
              opacity: marqueeConfig.bullet_opacity,
            },
            "random",
          ],
        });
      }

      if (marqueeConfig.copyright_status == 1) {
        props.components.push({
          name: "BulletScreenComponent",
          type: aliplayerCopyrightComponent,
          args: [
            marqueeConfig.copyright_text,
            {
              fontSize: "12px",
              color: "rgb(255, 255, 255)",
              opacity: "0.6",
            },
            "top",
          ],
        });
      }

      if (this.views !== false) {
        props.components.push({
          name: "HotComponent",
          type: aliplayerHotComponent,
          args: [this.views],
        });
      }

      if (this.isLive) {
        props.components.push({
          name: "StatusControllComponent",
          type: aliplayerStatusControllComponent,
        });
      } else {
        props.components.push({
          name: "RateComponent",
          type: aliplayerRateComponent,
        });
      }

      this.player = new Aliplayer(props);
      // 静音自动续播后的点击恢复声音（容器持久复用，实例属性防重复绑定）
      this.bindMuteRestore();
      // 每次切源都会重建实例；异步到达的旧实例事件不得影响当前播放状态。
      var playerInstance = this.player;
      var isCurrentPlayer = function () {
        return that.player === playerInstance;
      };
      this.bindFullscreenEvents();
      this.player.on("requestFullScreen", this.fullScreenHandle);
      this.player.on("cancelFullScreen", this.cancelFullScreenHandel);

      //在播放出错时，Aliyunplay播放器会重试5次取重新获取数据，同时会触发onM3u8Retry事件
      this.player.on("onM3u8Retry", function () {
        if (!isCurrentPlayer()) {
          return;
        }
        that.$emit("onM3u8Retry", false);
      });
      //尝试数据恢复失败时，会触发liveStreamStop事件。
      this.player.on("liveStreamStop", function () {
        if (!isCurrentPlayer()) {
          return;
        }
        that.$emit("stop", false);
        // uni.$u.toast('直播已结束');
      });

      // 播放器内置的 AutoStreamSelector 会在直播起播缓冲达到默认 20 秒后自行弹出
      // 「网络不给力，是否切换到…」并接管切源。直播页已有清晰度入口和加载态，
      // 两套切换机制并存会在用户首次点击播放后重建播放器，导致又出现一次播放按钮。
      // 统一由页面清晰度入口处理，隐藏播放器内置弹窗，避免它抢占首次播放流程。
      this.player.on("auto_stream_show", function () {
        if (!isCurrentPlayer()) {
          return;
        }
        playerInstance.trigger("auto_stream_hide");
      });

      //播放器提供的方法需要在该事件发生后才可以调用。
      this.player.on("ready", function (e) {
        if (!isCurrentPlayer()) {
          return;
        }
        var duration = parseFloat(this.getDuration());
        that.bindVideoFullscreenEvents();
        // 播放器就绪后同步画面填充模式到实际 video 元素（内存中重建的 video 标签
        // 每次 ready 都需重设，保证竖屏连麦合流成片等比显示，不被拉伸变形）
        that.syncPlayerObjectFit();
        // 同理同步画面垂直偏移（横屏直播画面位置上调，重建后同样需要重设）
        that.syncPlayerPictureOffset();

        // ready 时音频时长可能尚未就绪（getDuration 返回 0/NaN），
        // 仅在拿到有效时长时上报，否则依赖底层媒体元素时长监听兜底
        if (duration && isFinite(duration) && duration > 0) {
          that.$emit("loadedmetadata", {
            detail: {
              duration: parseInt(duration),
            },
          });
        }
        that.bindMediaDurationEvents();
        // if (that.initCurrentTime > 0) {
        //   that.player.seek(that.initCurrentTime);
        //   that.initCurrentTime = 0;
        // }

        // 监听刷新按钮点击事件
        

        // 初始化控制栏事件
        if (that.showControlBar) {
          // that.initControlBarEvents();
        }

        // 自动播放兜底：浏览器拦截有声自动播放时静音降级重试，
        // 保证直播开始时 / 自动首播时画面自动拉流，无需用户手动点击播放按钮
        if (that.autoplay || that.isLive) {
          that.playWithAutoplayFallback();
        }

        that.$emit("ready", false);
      });

      // this.player.on('canplay',function(){
      //     that.$emit('loadedmetadata', {
      //         detail:{
      //             duration:parseFloat(this.getDuration())
      //         }
      //     });
      // })

      this.player.on("error", function (e) {
        if (!isCurrentPlayer()) {
          return;
        }
        console.log("playerror", e);
        // 错误事件形态不统一：多数带 paramData.display_msg，但原生 video 错误为
        // {errortype: e}、部分 RTS 错误也无 paramData——直接取 e.paramData.display_msg
        // 会抛 TypeError 使 $emit("error") 被跳过，页面收不到降级信号，只能等看门狗超时
        var errMsg =
          e && e.paramData && e.paramData.display_msg
            ? e.paramData.display_msg
            : "";
        that.$emit("error", errMsg ? { errMsg: errMsg } : false);
      });

      //视频由暂停恢复为播放时触发。
      this.player.on("play", function (e) {
        if (!isCurrentPlayer()) {
          return;
        }
        that.$emit("play", false);
      });
      //视频暂停时触发。
      this.player.on("pause", function (e) {
        if (!isCurrentPlayer()) {
          return;
        }
        that.$emit("pause", false);
      });
      
      //能够开始播放音频和视频时发生，会多次触发，仅H5播放器。
      this.player.on("canplay", function (e) {
        if (!isCurrentPlayer()) {
          return;
        }
        that.$emit("canplay", false);
        that.setMaxHeight();
      });
      //播放中，会触发多次。
      this.player.on("playing", function (e) {
        if (!isCurrentPlayer()) {
          return;
        }
        that.$emit("playing", false);
      });

      //数据缓冲事件。
      this.player.on("waiting", function (e) {
        if (!isCurrentPlayer()) {
          return;
        }
        that.$emit("waiting", false);
      });

      //当前视频播放完毕时触发。
      this.player.on("ended", function (e) {
        if (!isCurrentPlayer()) {
          return;
        }
        that.$emit("ended", false);
      });

      //播放位置发生改变时触发，仅H5模式播放器。可通过getCurrentTime方法，得到当前播放时间。
      this.player.on("timeupdate", function (e) {
        if (!isCurrentPlayer()) {
          return;
        }
        var currentTime = this.getCurrentTime();
        // 禁止拖拽进度条时检测跳变（拖拽被拉回，本次上报不再向上抛出）
        if (that.disableSeek && that.isSeekJump(currentTime)) {
          return;
        }
        that.$emit("timeupdate", {
          detail: {
            duration: this.getDuration(),
            currentTime: currentTime,
          },
        });
      });

      this.$nextTick(() => {
        this.bindRefreshButton();
        this.bindFullscreenButtonGuard();
        this.bindPlayIntent();
      });
    },
    fullScreenHandle() {
      this.syncFullScreenState();
      this.fullScreen = true;
    },
    cancelFullScreenHandel() {
      this.syncFullScreenState();
      this.fullScreen = false;
    },
    setMaxHeight() {},
    /**
     * 根据视频地址自动识别播放格式
     * 阿里云 Web 播放器 format 支持值：mp4、hls/m3u8、flv、mp3
     * RTS 协议（artc://）由播放器自动识别，不需设置 format
     * RTMP 协议（rtmp://）浏览器原生不支持，无法播放
     */
    detectSourceFormat(source) {
      if (!source) return "";
      var url = source.toLowerCase().split("?")[0];
      if (url.indexOf("artc://") === 0) {
        // RTS 协议，由播放器自动处理，不指定 format
        return "";
      }
      if (url.indexOf("rtmp://") === 0) {
        // RTMP 协议浏览器不支持，但仍返回值，由上层提示
        return "";
      }
      if (url.endsWith(".m3u8")) {
        return "m3u8";
      }
      if (url.endsWith(".mp4")) {
        return "mp4";
      }
      if (url.endsWith(".flv")) {
        return "flv";
      }
      if (url.endsWith(".mp3")) {
        return "mp3";
      }
      return "";
    },
  },
  beforeDestroy() {
    // 组件销毁后静音重试定时器不再触发
    this.autoPlayRetryToken++;
    this.clearPlayIntentRetry();
    this.unbindRefreshButton();
    this.unbindVideoFullscreenEvents();
    this.unbindFullscreenEvents();
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
  },
  created: function () {},
  mounted(pageParams) {
    that = this;

    this.buildPlayer();
    this.videoLoading = false;
  },
};
</script>

<!-- <style>@import "./assets/aliplayer-min.css";</style> -->
<style scoped>
/* 禁止拖拽进度条：屏蔽阿里云播放器进度条的鼠标/触摸事件，进度仅展示不可拖动 */
::v-deep .player-seek-disabled .prism-progress {
  pointer-events: none;
  cursor: default;
}

::v-deep #player-con::before {
  background-image: var(--cover-url) !important;
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  background-repeat: no-repeat;
  background-position: center center;
  background-attachment: fixed;
  background-size: cover;
  /* 模糊半径 10 → 20 → 30：封面态几乎读不出原图细节，白色控件/文案压得住 */
  filter: blur(30px);
  /* 灰色遮罩：inset 阴影画在本元素背景之上、内容之下，正好压住封面又不会盖到播放画面；
     半径越大边缘透明带越宽，遮罩的边缘同样会被 filter 一起模糊掉，
     故 scale 与半径同步放大（30px ↔ 1.15），把两条透明带一并推出可视区防白边
     （参照 tz/course-audio.vue .audio-bg-image、web studio.vue .studio-bg 同款 scale 写法） */
  transform: scale(1.15);
  box-shadow: inset 0 0 0 999px rgba(120, 120, 120, 0.3); /* 遮罩：中性灰纱，把封面色彩压灰一档 */
  z-index: 0;
  /* 确保内容在模糊层之上 */
}

/* 控制栏显示/隐藏样式 */
::v-deep .prism-controlbar {
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
}

::v-deep .prism-controlbar[style*="display: none"],
::v-deep .prism-controlbar[style*="visibility: hidden"] {
  opacity: 0;
}

::v-deep .prism-controlbar:not([style*="display: none"]):not([style*="visibility: hidden"]) {
  opacity: 1;
}

/* 播放器层级隔离（关键）：Aliplayer 的 .prism-player 自身没有 z-index、不产生堆叠上下文，
   其内部层级会直接参与页面级比较——大播放按钮与 loading-center 的 100 会压住
   课程详情底部操作栏(z-index:10)、吸顶导航、页面弹窗等，非常不协调；
   而单独调低这个 100，又会被播放器自己的封面(.prism-cover 11)和消息条(.prism-info-display 90)
   盖住导致按钮点不到。这里在播放器根节点建立独立堆叠上下文，内部层级
   （封面 11 / 消息条 90 / 大播放按钮与 loading 100）全部收敛在播放器矩形内、不再外溢；
   使用方页面按常规层级（底部操作栏、弹窗 z-index > 0）即可稳定盖住播放器 */
.video-h5-root {
  position: relative;
  z-index: 0;
}

/* 播放器内部层级：只需高于消息条 .prism-info-display(90) 与封面 .prism-cover(11)，
   保证大播放按钮不被横穿全宽的消息条和封面遮挡、可正常点击；
   该值已被 .video-h5-root 隔离，不会影响播放器外的任何元素 */
::v-deep .prism-player .prism-big-play-btn,
::v-deep .prism-player .loading-center {
  z-index: 100 !important;
}

/* 大播放按钮样式微调：纯白实心圆改为轻微透明、削弱阴影，减轻对画面的压迫感 */
::v-deep .prism-player .prism-big-play-btn {
  opacity: 0.9;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  transition: box-shadow 0.3s ease, opacity 0.3s ease;
}

::v-deep .prism-player .prism-big-play-btn:hover {
  opacity: 1;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.24);
}

</style>
