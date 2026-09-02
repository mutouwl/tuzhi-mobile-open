/**
 * 直播连麦前台控制器（live_link）
 *
 * 职责：
 * - 页面加载时拉取一次当前用户连麦状态（getLinkInfo），检测既有「讲师邀请/已同意」记录：
 *   加载时已有邀请（inviter=1）→ 触发邀请弹窗；已有同意（status=1）→ 触发自动进入连麦
 * - 直播期间的状态变化由消息服务实时推送驱动（message-box 上抛
 *   link-invite/link-approved/link-rejected/link-ended），不再周期轮询；
 *   poll() 保留为操作后即时刷新（申请/取消/拒绝/接听等回调后同步状态，供按钮路由判断）
 * - 维护连麦中状态（myLink），控制进入连麦态/下麦
 * - 统一封装连麦 SDK 生命周期（startPush/stopPush/startPull/destroy），
 *   由页面在对应生命周期点（onLoad/onHide/onUnload）调用
 *
 * 设计：独立模块，不侵入直播间页面主逻辑；页面通过实例方法交互，保持低耦合。
 * 仅 H5 端启用（小程序不强接连麦 SDK）。
 */
export default class LiveLinkController {
  /**
   * @param {Object} vm 直播间页面实例（this）
   * @param {Object} opts { courseId, getLinkSdkFn }
   */
  constructor(vm, opts = {}) {
    this.vm = vm;
    this.courseId = opts.courseId || 0;
    this.enabled = false; // 连麦是否启用（仅 H5 端）
    this.myLink = null; // 当前用户连麦记录
    this.status = "idle"; // idle/apply/linking
    this.linkSdk = null;
    this.linking = false; // SDK 初始化中
    // 已被实时消息（link-rejected/link-closed）处理过的终态记录 ID，poll 检测到同一记录消失时跳过（防重复提示）
    this.closedNotifiedId = 0;
    // 状态变化感知（即时刷新：供页面实时刷新连麦按钮显隐）
    this.roomLinkPrev = -1; // 上次 poll 的本场连麦开关（live_room.config.link，运营设置为准）
    this.activePrev = false; // 上次 poll 的「有进行中连麦」状态
    this.banPrev = 0; // 上次 poll 的「被禁止申请连麦」标记（0/1/2）
    // 移动端连麦是否可用（直播设置-连麦「移动端开关」，getLinkInfo.platform_link_enabled）；
    // 未同步前默认可用，保证历史配置不因缺字段屏蔽入口
    this.platformEnabled = true;
  }

  /**
   * 初始化：检测连麦能力（仅 H5 端支持）+ 加载时拉取一次连麦状态
   * @returns {Promise<boolean>} 是否启用连麦
   */
  async init() {
    const vm = this.vm;

    // #ifdef H5
    this.enabled = true;
    // #endif

    // 非 H5（小程序）不支持连麦
    if (!this.enabled) {
      return false;
    }

    try {
      // 动态引入 SDK 封装（仅在 H5 初始化时加载，避免小程序主包体积）
      const sdkModule = await import("@/pages/course/live/link/link-sdk.js");
      this.linkSdk = sdkModule.getLinkSdk();
    } catch (e) {
      console.warn("[live-link] SDK 封装加载失败", e);
    }

    // 页面加载时拉取一次当前用户连麦状态：检测既有「讲师邀请/已同意」记录并触发对应动作；
    // 直播期间状态变化由消息服务实时推送驱动（见 link-entry 的 onLinkInvited/onLinkApproved/onLinkEnded），
    // 不再周期轮询（避免 getLinkInfo 高频请求）；poll() 仍可供操作后即时刷新
    this.poll();
    return true;
  }

  /**
   * 已废弃：原 8s 周期轮询已移除（连麦状态变化改由消息服务实时推送驱动）
   * 保留 stopPolling 供 destroy 调用（无定时器时安全）
   */
  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * 拉取当前用户连麦状态（页面加载时一次 + 操作完成后即时刷新）
   * 不再周期调用；加载时已有邀请（inviter==1）/已同意（status==1）记录同样在此检测触发
   */
  poll() {
    const vm = this.vm;
    if (!vm || !this.courseId) return;

    vm.$api("live.link.info", { course_id: this.courseId, platform: "mobile" })
      .then((res) => {
        if (!res || res.code != 1) return;
        const data = res.data || {};
        this.enabled = data.link_enabled == 1;
        // 记录上轮状态：讲师结束连麦（后端无进行中记录/记录更换）时需通知页面本地下麦
        const prevLink = this.myLink;
        const wasLinking = this.status == "linking";
        this.myLink = data.my_link || null;

        // 无进行中记录：重置状态（讲师结束连麦等场景），避免残留 linking/approved 导致后续同意提醒失效
        if (!this.myLink && this.status != "idle") {
          this.status = "idle";
        }

        // 讲师已结束连麦（中控台结束单条/全员下麦、频道对不上号自动回写等）：
        // 本地已在推流（status=linking）但后端已无该进行中记录（或记录已更换）→
        // 通知页面停止推流、恢复 CDN 播放并移除本地预览，否则学员端一直停留在「连麦中」
        const linkGone =
          !this.myLink ||
          (prevLink && this.myLink && prevLink.id !== this.myLink.id);
        if (wasLinking && linkGone) {
          this.vm.$emit && this.vm.$emit("link-ended");
        }

        // 申请/待接入记录消失（讲师拒绝申请、撤销邀请、申请超时、学员已取消等）：
        // 拉取该记录的最新终态并通知页面（toast 提示结果 + 刷新记录弹窗），
        // 避免学员端只静默重置状态、仍停留在「申请中」的旧界面；
        // 已由实时消息（link-rejected）处理过的记录跳过，防止重复提示
        if (
          !wasLinking &&
          prevLink &&
          (prevLink.status == 0 || prevLink.status == 1) &&
          linkGone
        ) {
          if (String(this.closedNotifiedId) === String(prevLink.id)) {
            this.closedNotifiedId = 0;
          } else {
            this.fetchClosedRecord(prevLink.id);
          }
        }

        // 处于申请中 + 讲师邀请 → 触发邀请弹窗
        if (
          this.myLink &&
          this.myLink.status == 0 &&
          this.myLink.inviter == 1 &&
          this.status == "idle"
        ) {
          this.status = "apply";
          this.vm.$emit && this.vm.$emit("link-invite", this.myLink);
        }

        // 讲师已同意申请（status=1 连麦中）→ 触发自动进入连麦（学员端无需再点确认）
        // 仅触发一次：进入连麦后 status 置 linking，不再重复打扰；
        // 自动上麦失败时（如权限被拒），学员可点击工具条「连麦」按钮再次进入（onEntryClick 对 status=1 同样自动进入）
        if (
          this.myLink &&
          this.myLink.status == 1 &&
          this.status != "linking" &&
          this.status != "approved"
        ) {
          this.status = "approved";
          this.vm.$emit && this.vm.$emit("link-approved", this.myLink);
        }

        // 开关/连麦状态变化即时通知（消息推送为主通道，此处为状态同步兜底）：
        // 运营设置「直播连麦」（room_link，config.link）变化后，页面据此及时显示/隐藏工具条连麦按钮；
        // 移动端平台开关（platform_link_enabled，直播设置-连麦「移动端开关」）变化同样联动按钮显隐
        const roomLink = data.room_link == 1 ? 1 : 0;
        const platformEnabled = !(data.platform_link_enabled === 0 || data.platform_link_enabled === "0");
        if (roomLink !== this.roomLinkPrev || platformEnabled !== this.platformEnabled) {
          this.roomLinkPrev = roomLink;
          this.platformEnabled = platformEnabled;
          this.vm.$emit && this.vm.$emit("link-allow-change", {
            link: roomLink,
            platformEnabled: platformEnabled ? 1 : 0,
          });
        }
        var activeNow = !!(this.myLink && this.myLink.id) || this.status == "linking" || this.status == "apply";
        if (activeNow !== this.activePrev) {
          this.activePrev = activeNow;
          this.vm.$emit && this.vm.$emit("link-active-change", activeNow);
        }

        // 被禁止申请连麦标记变化（个人 ban_link / 全场 forbid_apply_link）→
        // 页面同步申请弹窗空态（仅拦学员主动申请，讲师邀请/已存在记录不受影响）
        var banNow =
          parseInt(data.ban_link, 10) == 1
            ? 1
            : parseInt(data.forbid_apply_link, 10) == 1
            ? 2
            : 0;
        if (banNow !== this.banPrev) {
          this.banPrev = banNow;
          this.vm.$emit && this.vm.$emit("link-ban-change", banNow);
        }
      })
      .catch(() => {});
  }

  /**
   * 申请/待接入记录已进入终态（讲师拒绝/撤销、超时、学员取消等）时，
   * 拉取该记录的最新状态并通知页面（仅状态切换瞬间触发一次，不常态化携带 with_records）
   * @param {Number|String} linkId 消失的进行中记录 ID
   */
  fetchClosedRecord(linkId) {
    const vm = this.vm;
    if (!vm || !linkId) return;
    vm.$api("live.link.info", {
      course_id: this.courseId,
      with_records: 1,
      platform: "mobile",
    })
      .then((res) => {
        if (!res || res.code != 1) return;
        const records = (res.data && res.data.my_records) || [];
        const found = records.find((r) => String(r.id) === String(linkId));
        if (found) {
          vm.$emit && vm.$emit("link-closed", found);
        }
      })
      .catch(() => {});
  }

  /**
   * 实时消息已处理某条记录的终态（讲师拒绝等），标记后 poll 检测到同一记录消失时不再重复查/提示
   * @param {Number|String} linkId 连麦记录 ID
   */
  markClosedNotified(linkId) {
    if (linkId) {
      this.closedNotifiedId = linkId;
    }
  }

  /**
   * 申请成功后进入等待态
   */
  onApplied() {
    this.status = "apply";
  }

  /**
   * 讲师同意/接通进入连麦态
   * @param {Object} myLink 连麦记录
   * @param {Object} extra 连麦 SDK 参数（channel/rtc_user_id 等）
   */
  onLinked(myLink, extra = {}) {
    this.myLink = myLink || this.myLink;
    if (this.myLink && this.myLink.id) {
      this.status = "linking";
    }
  }

  /**
   * 开始真正的连麦（用户点击进入连麦后）
   * 上麦前由页面先停止 CDN 播放器，再调此方法推流
   * @param {Object} sdkParams { pushUrl, channelId, userId, linkType }
   * @returns {Promise}
   */
  async startLink(sdkParams = {}) {
    this.linking = true;
    try {
      const result = await this.linkSdk.startPush({
        pushUrl: sdkParams.pushUrl,
        channelId: sdkParams.channelId,
        userId: sdkParams.userId,
        linkType: sdkParams.linkType,
      });
      this.linking = false;
      this.status = "linking";
      return result;
    } catch (e) {
      this.linking = false;
      throw e;
    }
  }

  /**
   * 本地媒体设置变更（连麦设置面板「麦克风/摄像头」触发）
   * 分发到 SDK 实际控制推流媒体
   * @param {Object} change { field: 'mute'|'video_on', value: 0|1 }
   */
  async setLocalMedia(change) {
    if (!change || !this.linkSdk) return;
    const field = change.field;
    const on = !!change.value;
    try {
      if (field === "mute") {
        await this.linkSdk.setMuted(on);
      } else if (field === "video_on") {
        await this.linkSdk.setVideoEnabled(on);
      }
    } catch (e) {
      console.warn("[live-link] 本地媒体设置失败", e);
    }
  }

  /**
   * 预取媒体权限（学员点击申请/接听/进入连麦时由页面调用，携带用户点击手势）
   * 微信内置浏览器要求 getUserMedia 在用户手势内发起，否则讲师同意后自动上麦
   * （消息事件，无手势上下文）不弹权限确认框——表现为「连麦成功但无反应，
   * 需再点一次连麦图标」；提前授权后同意到达时 getUserMedia 直接通过，无需再弹窗。
   * @param {Number} linkType 连麦模式：1视频 2语音
   * @returns {Promise<{granted: boolean, error: string}>}
   */
  async preflightMedia(linkType) {
    if (
      !this.linkSdk ||
      typeof this.linkSdk.preflightMediaPermission !== "function"
    ) {
      return { granted: false, error: "连麦功能加载中，请稍后重试" };
    }
    return this.linkSdk.preflightMediaPermission(linkType);
  }

  /**
   * 下麦：停止 SDK 资源
   */
  async endLink() {
    if (this.linkSdk) {
      try {
        await this.linkSdk.destroy();
      } catch (e) {
        console.warn("[live-link] destroy 异常", e);
      }
    }
    this.myLink = null;
    this.status = "idle";
  }

  /**
   * 页面 onUnload / 后台清理
   */
  destroy() {
    this.stopPolling();
    if (this.linkSdk) {
      this.linkSdk.destroy().catch(() => {});
    }
  }
}