/**
 * 连麦 SDK 统一封装（live_link）
 *
 * 设计目标：业务页面只依赖统一的 startPush/stopPush/startPull/stopPull/switchCamera/beauty
 * 方法名，内部按服务商 provider 分发。首期实现阿里云（imp-web-live-push Web 连麦互动 SDK），
 * 火山引擎等后续厂商在对应分支补充，业务层零改动。
 *
 * 仅 H5 端使用（微信内置浏览器 / PC 浏览器）；小程序端不接连麦。
 */
const ALIYUN_LINE_PUSH_SDK_URL =
  "https://g.alicdn.com/apsara-media-box/imp-web-live-push/6.4.9/alivc-live-push.js";

// 预取采集流的复用有效期：学员点击「申请/接听」到讲师同意一般在 90s 内；
// 超时未上麦自动释放设备（摄像头灯熄灭），推流时重新采集
const PREFLIGHT_STREAM_TTL_MS = 90 * 1000;

let sdkLoadingPromise = null;
let aliyunLogSocketInstalled = false;

/**
 * 拦截阿里云连麦 SDK 的遥测通道（wss://logprod.aliyuncs.com/binlog）：
 * SDK 每次加入直播间 RTC 频道都会创建该 WebSocket 做埋点上报，部分网络/浏览器
 * 环境下连接失败，控制台反复打印「WebSocket connection to 'wss://logprod.aliyuncs.com/binlog'
 * failed」与 {"isTrusted":true} 噪音（连麦功能本身不受影响）。
 * 仅对 logprod 域返回一个不实际建连的哑代理（readyState=OPEN 供 SDK 直接 send），
 * 其余 URL 完全透传原生 WebSocket，不影响直播互动消息等业务 Socket。
 * @return {void}
 */
function installAliyunLogSocketGuard() {
  if (aliyunLogSocketInstalled || typeof window === "undefined") return;
  if (typeof window.WebSocket !== "function") return;
  aliyunLogSocketInstalled = true;
  var NativeWS = window.WebSocket;
  var LogProxyWS = function (url, protocols) {
    if (url && String(url).indexOf("logprod.aliyuncs.com") > -1) {
      // 遥测通道：返回哑代理，不实际建连（浏览器不再打印连接失败）
      return {
        readyState: 1, // OPEN：SDK 可能以此判断可 send
        bufferedAmount: 0,
        extensions: "",
        protocol: "",
        binaryType: "blob",
        url: url,
        send: function () {},
        close: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {
          return true;
        },
      };
    }
    return protocols === undefined ? new NativeWS(url) : new NativeWS(url, protocols);
  };
  LogProxyWS.prototype = NativeWS.prototype;
  LogProxyWS.CONNECTING = NativeWS.CONNECTING;
  LogProxyWS.OPEN = NativeWS.OPEN;
  LogProxyWS.CLOSING = NativeWS.CLOSING;
  LogProxyWS.CLOSED = NativeWS.CLOSED;
  window.WebSocket = LogProxyWS;
}

/**
 * 动态加载阿里云 Web 连麦 SDK（imp-web-live-push）
 * @returns {Promise}
 */
function loadAliyunLinkSdk() {
  if (window.AlivcLivePush && window.AlivcLivePush.AlivcLivePusher) {
    return Promise.resolve(window.AlivcLivePush);
  }
  if (sdkLoadingPromise) {
    return sdkLoadingPromise;
  }
  // 拦截 SDK 遥测 WebSocket（logprod），避免控制台 binlog 连接失败噪音
  installAliyunLogSocketGuard();
  sdkLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = ALIYUN_LINE_PUSH_SDK_URL;
    script.async = true;
    script.charset = "UTF-8";
    script.onload = () => {
      if (window.AlivcLivePush && window.AlivcLivePush.AlivcLivePusher) {
        resolve(window.AlivcLivePush);
      } else {
        sdkLoadingPromise = null;
        reject(new Error("阿里云连麦 SDK 加载完成但未找到全局对象"));
      }
    };
    script.onerror = () => {
      sdkLoadingPromise = null;
      reject(new Error("阿里云连麦 SDK 加载失败"));
    };
    document.getElementsByTagName("head")[0].appendChild(script);
  });
  return sdkLoadingPromise;
}

/**
 * 统一连麦动作封装
 * 通过 provider 分发到不同厂商 SDK（首期仅 aliyun）
 */
class LinkSdkAdapter {
  constructor() {
    this.provider = "aliyun";
    this.pusher = null;
    this.player = null;
    this.localStream = null;
    // 预取授权时缓存的采集流：学员点击「申请/接听」与讲师同意之间存在时间差，
    // 若预取后立刻 stop 轨道、推流时再 getUserMedia 重新开设备，真机（iOS WKWebView /
    // Android X5）在「刚释放又立刻重开摄像头」场景常拿到黑帧/冻结视频轨——推流成功
    // 但无有效画面，混流后就是「连麦的那一半黑屏」。改为短 TTL 缓存复用：等待期短时
    // 直接复用预取流（无重开竞态），超时自动释放设备，推流时重新采集
    this.cachedStream = null;
    this.cachedStreamAt = 0;
    this.cachedStreamTimer = null;
  }

  setProvider(provider) {
    if (provider) {
      this.provider = provider;
    }
  }

  /**
   * 开始推流（上麦）
   * @param {Object} opts { pushUrl, channelId, userId, linkType(1视频/2语音), auth }
   * @returns {Promise}
   */
  async startPush(opts = {}) {
    if (this.provider === "aliyun") {
      return this.startAliyunPush(opts);
    }
    return Promise.reject(new Error("暂不支持的连麦服务商: " + this.provider));
  }

  /**
   * 停止推流（下麦）
   * @returns {Promise}
   */
  async stopPush() {
    if (!this.pusher) return Promise.resolve();
    try {
      // 先停本地预览（画面展示），再停止推流
      if (typeof this.pusher.stopPreview === "function") {
        try {
          await this.pusher.stopPreview();
        } catch (e) {
          console.warn("[link-sdk] stopPreview 异常", e);
        }
      }
      if (typeof this.pusher.stopPush === "function") {
        await this.pusher.stopPush();
      } else if (typeof this.pusher.stop === "function") {
        await this.pusher.stop();
      }
      // SDK 未提供 destroy 时忽略；部分版本暴露 destroy 可释放引擎内部资源
      if (typeof this.pusher.destroy === "function") {
        try {
          await this.pusher.destroy();
        } catch (e) {
          console.warn("[link-sdk] pusher destroy 异常", e);
        }
      }
    } catch (e) {
      console.warn("[link-sdk] stopPush 异常", e);
    } finally {
      this.pusher = null;
    }
  }

  /**
   * 开始本地预览（上麦后展示自己的画面，仅视频连麦）
   * SDK 的 startPreview 要求真实 HTMLVideoElement（getHtmlMediaElement 校验 nodeName=video）
   * @param {Element} videoEl
   * @returns {Promise}
   */
  async startPreview(videoEl) {
    if (!this.pusher || !videoEl) return;
    if (typeof this.pusher.startPreview !== "function") {
      console.warn("[link-sdk] 当前 SDK 不支持本地预览");
      return;
    }
    await this.pusher.startPreview(videoEl);
  }

  /**
   * 停止本地预览
   * @returns {Promise}
   */
  async stopPreview() {
    if (!this.pusher) return Promise.resolve();
    if (typeof this.pusher.stopPreview === "function") {
      try {
        await this.pusher.stopPreview();
      } catch (e) {
        console.warn("[link-sdk] stopPreview 异常", e);
      }
    }
  }

  /**
   * 开始拉流（拉取主播/其他成员流）
   * @param {Object} opts { playUrl, viewEl }
   * @returns {Promise}
   */
  async startPull(opts = {}) {
    if (this.provider === "aliyun") {
      return this.startAliyunPull(opts);
    }
    return Promise.reject(new Error("暂不支持的连麦服务商: " + this.provider));
  }

  /**
   * 停止拉流
   * @returns {Promise}
   */
  async stopPull() {
    if (this.player) {
      try {
        if (typeof this.player.stop === "function") {
          this.player.stop();
        }
        if (typeof this.player.destroy === "function") {
          this.player.destroy();
        }
      } catch (e) {
        console.warn("[link-sdk] stopPull 异常", e);
      }
      this.player = null;
    }
  }

  /**
   * 切换本地摄像头（前置/后置，Web 端一般只有前置）
   * @param {boolean} on
   * @returns {Promise}
   */
  async switchCamera(on) {
    // WebRTC 单摄像头场景主要是开关切换，真机多摄像头时按厂商扩展
    if (this.pusher && typeof this.pusher.switchCamera === "function") {
      try {
        await this.pusher.switchCamera();
      } catch (e) {
        console.warn("[link-sdk] switchCamera 异常", e);
      }
    }
  }

  /**
   * 静音/恢复麦克风（连麦设置「麦克风开关」）
   * 优先走推流 SDK 接口（阿里云 AlivcLivePusher.stopMicrophone/startMicrophone），
   * 本地采集流音轨兜底（SDK 接口缺失时仍可生效）
   * @param {boolean} muted true=静音
   * @returns {Promise}
   */
  async setMuted(muted) {
    if (!this.pusher) return;
    try {
      if (muted && typeof this.pusher.stopMicrophone === "function") {
        await this.pusher.stopMicrophone();
      } else if (!muted && typeof this.pusher.startMicrophone === "function") {
        await this.pusher.startMicrophone();
      }
    } catch (e) {
      console.warn("[link-sdk] setMuted 异常", e);
    }
    // 兜底：同步禁用/启用本地采集流麦克风音轨
    if (this.localStream && typeof this.localStream.getAudioTracks === "function") {
      this.localStream.getAudioTracks().forEach((t) => {
        t.enabled = !muted;
      });
    }
  }

  /**
   * 开关摄像头（连麦设置「摄像头开关」）
   * 优先走推流 SDK 接口（阿里云 AlivcLivePusher.stopCamera/startCamera），
   * 本地采集流视频轨兜底（SDK 接口缺失时仍可生效）
   * @param {boolean} on true=开启
   * @returns {Promise}
   */
  async setVideoEnabled(on) {
    if (!this.pusher) return;
    try {
      if (!on && typeof this.pusher.stopCamera === "function") {
        await this.pusher.stopCamera();
      } else if (on && typeof this.pusher.startCamera === "function") {
        await this.pusher.startCamera();
      }
    } catch (e) {
      console.warn("[link-sdk] setVideoEnabled 异常", e);
    }
    // 兜底：同步禁用/启用本地采集流视频轨（关闭后推流画面冻结为黑帧）
    if (this.localStream && typeof this.localStream.getVideoTracks === "function") {
      this.localStream.getVideoTracks().forEach((t) => {
        t.enabled = !!on;
      });
    }
  }

  /**
   * 美颜（Web 端连麦互动 SDK 一般不支持，预留接口）
   * @param {number} level
   */
  beauty(level) {
    return Promise.resolve();
  }

  /**
   * 预取媒体权限（必须在用户点击手势内发起）
   *
   * 微信内置浏览器（iOS WKWebView / Android X5）要求 getUserMedia 由用户手势发起，
   * 非手势调起时权限确认框不弹出、请求被挂起/拦截——而「讲师同意连麦」是消息事件，
   * 其后自动上麦链路（onAccepted → startPush → getUserMedia）没有手势上下文，
   * 表现为学员端连麦成功却无权限弹窗，需再点一次连麦图标才解锁。
   * 因此在学员点击「申请/接听/进入连麦」时先调起授权；授权成功后**缓存采集流短时间复用**
   * 而不是立即 stop 轨道——「刚释放又立刻重开摄像头」在真机上常拿到黑帧/冻结视频轨
   * （推流成功但混流右侧黑屏的根因）。缓存超过 TTL 自动释放设备，推流时重新采集；
   * 下麦/销毁（destroy）时一并释放。
   * @param {Number} linkType 连麦模式：1视频 2语音
   * @returns {Promise<{granted: boolean, error: string}>}
   */
  async preflightMediaPermission(linkType) {
    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      return { granted: false, error: "当前浏览器不支持摄像头/麦克风，请在最新版浏览器或微信中打开" };
    }
    // 与 startAliyunPush 使用相同约束，保证授权结果覆盖真实推流采集
    const constraints = {
      audio: true,
      video:
        linkType == 2
          ? false // 语音连麦禁开摄像头
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.cachePreflightStream(stream);
      return { granted: true, error: "" };
    } catch (err) {
      const name = err && err.name ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        return {
          granted: false,
          error:
            "未获得摄像头/麦克风权限。若已被拒绝，请在微信右上角「设置」中允许访问摄像头与麦克风后重试。",
        };
      }
      if (name === "NotFoundError") {
        return { granted: false, error: "未检测到可用的摄像头或麦克风设备" };
      }
      return {
        granted: false,
        error: (err && err.message) || "无法获取摄像头/麦克风权限",
      };
    }
  }

  /**
   * 缓存预取采集流（TTL 内推流直接复用，超时自动释放设备）
   * @param {MediaStream} stream
   */
  cachePreflightStream(stream) {
    this.releaseCachedStream();
    this.cachedStream = stream;
    this.cachedStreamAt = Date.now();
    this.cachedStreamTimer = setTimeout(() => {
      // 超时仍未上麦（讲师未同意/学员取消申请）：释放设备，
      // 已被推流接管（localStream 指向同一条流）时不释放
      if (this.cachedStream && this.localStream !== this.cachedStream) {
        this.releaseCachedStream();
      }
    }, PREFLIGHT_STREAM_TTL_MS);
  }

  /**
   * 取出可复用的预取采集流；缺失/超时/轨道失活/与连麦模式不匹配时释放并返回 null
   * @param {Number} linkType 连麦模式：1视频 2语音
   * @returns {MediaStream|null}
   */
  takeCachedStream(linkType) {
    const stream = this.cachedStream;
    if (
      !stream ||
      Date.now() - this.cachedStreamAt > PREFLIGHT_STREAM_TTL_MS
    ) {
      this.releaseCachedStream();
      return null;
    }
    const tracks = typeof stream.getTracks === "function" ? stream.getTracks() : [];
    if (!tracks.length || tracks.some((t) => t.readyState !== "live")) {
      this.releaseCachedStream();
      return null;
    }
    // 轨道组成必须与本次连麦模式一致（视频连麦要有视频轨、语音连麦不能带视频轨），
    // 不匹配（中途切换模式）时弃用重新采集
    const hasVideo = stream.getVideoTracks().length > 0;
    if ((linkType == 2 && hasVideo) || (linkType != 2 && !hasVideo)) {
      this.releaseCachedStream();
      return null;
    }
    this.cachedStream = null;
    this.cachedStreamAt = 0;
    if (this.cachedStreamTimer) {
      clearTimeout(this.cachedStreamTimer);
      this.cachedStreamTimer = null;
    }
    return stream;
  }

  /**
   * 释放预取缓存流（停止轨道，解除设备占用）
   */
  releaseCachedStream() {
    if (this.cachedStreamTimer) {
      clearTimeout(this.cachedStreamTimer);
      this.cachedStreamTimer = null;
    }
    const stream = this.cachedStream;
    this.cachedStream = null;
    this.cachedStreamAt = 0;
    if (!stream) return;
    try {
      stream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch (e) {
          console.warn("[link-sdk] 释放预取缓存流轨道异常", e);
        }
      });
    } catch (e) {
      console.warn("[link-sdk] 释放预取缓存流异常", e);
    }
  }

  /**
   * 采集本地媒体并做轨道健康校验（黑帧/冻结轨防御）
   * 真机在「设备刚释放又重开」等场景可能拿到 readyState 非 live 的视频轨（黑帧），
   * 校验失败时短暂等待重试一次，仍失败上抛由调用方提示
   * @param {Object} constraints getUserMedia 约束
   * @returns {Promise<MediaStream>}
   */
  async getUserMediaHealthy(constraints) {
    const needVideo = !!constraints.video;
    const acquire = async () => {
      const stream = await this.getUserMediaWithGuide(constraints, {});
      if (needVideo) {
        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack || videoTrack.readyState !== "live") {
          try {
            stream.getTracks().forEach((t) => t.stop());
          } catch (e) {
            console.warn("[link-sdk] 停止失活采集流异常", e);
          }
          return null;
        }
      }
      return stream;
    };
    const first = await acquire();
    if (first) return first;
    await new Promise((resolve) => setTimeout(resolve, 300));
    const second = await acquire();
    if (second) return second;
    // eslint-disable-next-line no-throw-literal
    throw new Error("摄像头采集异常，请关闭其他占用摄像头的应用后重试");
  }

  /**
   * 释放本地采集流（停止摄像头/麦克风占用）
   * 页面持有的 getUserMedia 流即使已交给 SDK 发布，下麦/销毁时也必须显式停止，
   * 否则摄像头指示灯常亮、设备被占用导致其他应用无法复用
   */
  releaseLocalStream() {
    if (!this.localStream) return;
    try {
      this.localStream.getTracks().forEach(function (t) {
        t.stop();
      });
    } catch (e) {
      console.warn("[link-sdk] releaseLocalStream 异常", e);
    }
    this.localStream = null;
  }

  /**
   * 销毁所有连麦资源
   */
  async destroy() {
    await this.stopPull();
    await this.stopPush();
    this.releaseLocalStream();
    this.releaseCachedStream();
  }

  /* ==================== 阿里云实现 ==================== */

  /**
   * 阿里云：开始推流（imp-web-live-push AlivcLivePusher）
   * @param {Object} opts { pushUrl, ... }
   * @returns {Promise}
   */
  async startAliyunPush(opts = {}) {
    const alivc = await loadAliyunLinkSdk();
    const { AlivcLivePusher } = alivc;

    // 浏览器授权 + 采集唯一一份本地媒体（视频连麦带摄像头、语音连麦仅麦克风）
    const mediaConstraints = {
      audio: true,
      video:
        opts.linkType === 2
          ? false // 语音连麦禁开摄像头
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
    };
    // 优先复用预取缓存流（学员点击「申请/接听」时采集的那份）：同一份流直接交给 SDK，
    // 不存在「释放→重开摄像头」竞态；缓存超时/轨道失活/模式不匹配时重新采集（带健康校验）。
    // 黑屏背景：此前预取授权后立即 stop 轨道、此处再 getUserMedia 重开设备，真机
    // （iOS WKWebView / Android X5）常拿到黑帧/冻结视频轨——推流成功但混流右侧黑屏
    const cachedStream = this.takeCachedStream(opts.linkType);
    if (cachedStream) {
      this.localStream = cachedStream;
      console.log("[link-sdk] 复用预取采集流上麦");
    } else {
      this.localStream = await this.getUserMediaHealthy(mediaConstraints);
    }

    if (this.pusher) {
      await this.stopPush();
    }
    this.pusher = new AlivcLivePusher();

    // 以 custom + mediaStream 把上面采集到的同一份流交给 SDK 发布：
    // SDK 的 init 在非 custom 模式下会内部再调一次 getUserMedia，而页面此刻已持有
    // 摄像头采集——微信 H5（Android X5/XWeb、iOS WKWebView）下二次采集经常拿不到
    // 有效视频帧，推流出去就是黑画面（「右侧学员画面黑屏、视频没推上去」根因）。
    // 把授权成功的那份流直接交给 SDK 发布，保证推流的就是真实摄像头画面；
    // 推流地址（pushUrl/channelId/userId/auth）由 SDK 从 artc 地址 query 自行解析，
    // 无需重复传入 init。
    if (typeof this.pusher.init === "function") {
      await this.pusher.init({
        custom: true,
        mediaStream: this.localStream,
      });
    }
    if (typeof this.pusher.startPush === "function") {
      await this.pusher.startPush(opts.pushUrl);
    } else if (typeof this.pusher.start !== "function") {
      // SDK 结构与预期不同时给出明确错误，避免静默失败
      throw new Error("阿里云连麦推流 SDK 接口不匹配");
    }
    return this.pusher;
  }

  /**
   * 阿里云：开始拉流（AlivcLivePlayer）
   * @param {Object} opts { playUrl, viewEl }
   * @returns {Promise}
   */
  async startAliyunPull(opts = {}) {
    const alivc = await loadAliyunLinkSdk();
    const { AlivcLivePlayer } = alivc;

    if (this.player) {
      await this.stopPull();
    }
    this.player = new AlivcLivePlayer();
    // TODO: 按 SDK 实际接口绑定视图容器与拉流地址
    if (typeof this.player.start === "function" && opts.viewEl) {
      this.player.start(opts.viewEl, opts.playUrl);
    }
    return this.player;
  }

  /**
   * 获取用户媒体权限（带微信内置浏览器引导）
   * @param {Object} constraints
   * @param {Object} opts
   * @returns {Promise<MediaStream>}
   */
  async getUserMediaWithGuide(constraints, opts = {}) {
    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      throw new Error("当前浏览器不支持摄像头/麦克风，请在最新版浏览器或微信中打开");
    }

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      const name = err && err.name ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        // 微信内置浏览器（尤其 iOS）拦截系统权限弹窗，需引导去微信设置手动开启
        const errMsg =
          "无法获取摄像头/麦克风权限。请点击页面授权，若已被拒绝，请在微信右上角「设置」中允许访问摄像头与麦克风后重试。";
        // eslint-disable-next-line no-throw-literal
        throw { name: "NotAllowed", message: errMsg };
      }
      if (name === "NotFoundError") {
        throw new Error("未检测到可用的摄像头或麦克风设备");
      }
      if (name === "NotReadableError") {
        throw new Error("摄像头或麦克风被其他应用占用，请关闭其他应用后重试");
      }
      if (name === "OverconstrainedError") {
        throw new Error("设备不支持当前采集参数，请降低清晰度后重试");
      }
      throw err || new Error("获取媒体权限失败");
    }
  }
}

/**
 * 单例导出
 */
let instance = null;
export function getLinkSdk() {
  if (!instance) {
    instance = new LinkSdkAdapter();
  }
  return instance;
}

export default {
  getLinkSdk,
};