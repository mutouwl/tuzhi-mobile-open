// 连麦入口封装组件（live_link）
// 汇聚：入口图标 + 申请/接听弹窗 + 连麦控制面板 + 连麦状态控制器
var that;
import LiveLinkController from "./live-link-controller.js";
import linkApply from "./link-apply.vue";
import linkPanel from "./link-panel.vue";

export default {
  components: {
    linkApply,
    linkPanel,
  },
  data() {
    return {
      linkEnabled: false,
      status: "idle", // idle/apply/linking
      applyVisible: false,
      inviteMode: "apply",
      inviteData: null,
      panelVisible: false,
      myLinkId: 0,
      myLinkType: 1,
      controller: null,
      // 是否已在连麦（SDK 已推流）
      inLink: false,
      // 连麦开始时间戳（ms，优先取后端同意时间），连麦设置面板展示连麦时长用
      linkStartTime: 0,
      // 上麦流程进行中（防状态自动进入与工具条点击并发重复推流）
      starting: false,
      // 当前学员是否被禁止申请连麦（0 未禁止 / 1 个人禁止 / 2 全场禁止主动连麦）
      // getLinkInfo 下发 ban_link/forbid_apply_link 标记，工具条点击路由与 poll 同步更新；
      // 被禁止时申请弹窗展示「当前禁止连麦」空态，不展示语音/视频选择
      banState: 0,
      // 本地预览 video 元素（H5，已停用：视频连麦不再创建本地预览，见 setupLocalPreview）
      previewEl: null,
    };
  },
  props: {
    courseId: {
      type: [String, Number],
      default: 0,
    },
    // 是否允许连麦（roomData.config.link == 1）
    link: {
      type: [Boolean, Number, String],
      default: 0,
    },
  },
  computed: {
    /**
     * 是否显示连麦详情按钮（连麦中）
     */
    isLinking() {
      return this.inLink;
    },

    /**
     * 当前学员头像（语音连麦本地占位展示用）
     * 读取本地登录信息 user_info；解析失败或头像缺失回退默认头像
     */
    myAvatar() {
      var defaultAvatar = "/static/image/default-avatar.png";
      try {
        var userInfo = uni.getStorageSync("user_info");
        var info = userInfo ? JSON.parse(userInfo) : null;
        return (info && info.avatar) || defaultAvatar;
      } catch (e) {
        return defaultAvatar;
      }
    },
  },
  mounted() {
    that = this;
    this.$nextTick(() => {
      this.initController();
    });
  },
  beforeDestroy() {
    if (this.controller) {
      this.controller.destroy();
    }
    this.teardownLocalPreview();
  },
  methods: {
    async initController() {
      // #ifdef H5
      // 仅 H5 初始化控制器（小程序不支持连麦）
      // 先注册连麦事件监听，再初始化控制器：controller.init() 内部会立即 poll 一次，
      // 若页面加载时已有「讲师邀请/已同意」记录，事件在监听注册前发出会永久
      // 丢失（poll 随即将状态置为 apply/approved，后续不再重复触发），必须先 $on 再 init
      this.$on("link-invite", (myLink) => {
        if (this.inLink) return;
        this.inviteMode = "invite";
        this.inviteData = myLink;
        this.applyVisible = true;
      });
      // 监听讲师同意事件：学员申请被同意（status=1）→ 自动进入连麦，
      // 无需学员再点「进入连麦」按钮；正在处理讲师邀请（接听/拒绝）时跳过，
      // 其余弹窗（申请/记录）先关闭再自动进入——避免申请成功后打开记录弹窗挡住自动上麦
      this.$on("link-approved", (myLink) => {
        if (this.inLink || this.starting) return;
        if (this.applyVisible && this.inviteMode == "invite") return;
        this.applyVisible = false;
        this.onAccepted({ link: myLink });
      });

      // poll 兜底（消息推送不可达时）：运营设置「直播连麦」（config.link）变化 → 转发父级刷新按钮显隐；
      // 同时透传移动端平台可用标记（直播设置-连麦「移动端开关」），父级联动工具条按钮显隐
      this.$on("link-allow-change", (data) => {
        this.$emit("link-allow", {
          link: data && data.link,
          platformEnabled: data && data.platformEnabled,
        });
      });
      // 讲师已结束连麦（中控台结束单条/全员下麦，实时消息/poll 感知）→ 本地下麦：
      // 停止 SDK 推流、恢复 CDN 播放、移除本地预览，避免学员端停留在「连麦中」
      this.$on("link-ended", () => {
        if (!this.inLink) return;
        uni.showToast({ title: "讲师已结束连麦", icon: "none" });
        this.applyVisible = false;
        this.panelVisible = false;
        this.onEnded();
      });
      // 申请/待接入记录进入终态（讲师拒绝申请、撤销邀请、申请超时，poll 兜底感知）：
      // 及时提示结果并刷新连麦记录弹窗，避免学员端停留在「申请中」的旧界面；
      // 实时消息（link-rejected）由父级 onLinkRejected 转发，同样走 handleLinkClosed
      this.$on("link-closed", (record) => {
        if (!record || this.inLink) return;
        this.handleLinkClosed(record);
      });
      // poll 兜底：当前用户连麦状态（申请中/连麦中/已下麦）变化 → 转发父级保持按钮常显
      this.$on("link-active-change", (active) => {
        this.$emit("link-active", !!active);
      });
      // poll 兜底：被禁止申请连麦（个人 ban_link / 全场 forbid_apply_link）状态变化
      // → 同步申请弹窗空态（不展示语音/视频选择，仅「当前禁止连麦」提示）
      this.$on("link-ban-change", (ban) => {
        this.banState = ban;
      });

      this.controller = new LiveLinkController(this, {
        courseId: this.courseId,
      });
      const enabled = await this.controller.init();
      if (!enabled) {
        this.linkEnabled = false;
        return;
      }
      this.linkEnabled = this.link == 1;
      this.controller.enabled = this.linkEnabled;
      // #endif
    },

    /**
     * 工具条「连麦」按钮点击：
     * 立即弹出弹窗（pending 骨架加载态），拉取最新状态后再路由：
     * - 连麦中 → 切到连麦设置面板
     * - 讲师已同意（status=1）→ 直接自动进入连麦（无需再点确认）
     * - 有进行中的连麦记录（status=0）→ 记录列表（申请中可取消，讲师邀请可接听/拒绝）
     * - 无记录 → 语音/视频选择（申请）
     */
    async onEntryClick() {
      // #ifdef H5
      // 本地已上麦：直接开设置面板，无需等待网络
      if (this.inLink) {
        this.panelVisible = true;
        return;
      }

      // 先弹出骨架加载态，保证点击立即有响应
      this.inviteMode = "pending";
      this.inviteData = null;
      this.applyVisible = true;

      let myLink = (this.controller && this.controller.myLink) || null;
      let records = null;
      try {
        const res = await this.$api("live.link.info", {
          course_id: this.courseId,
          with_records: 1,
          platform: "mobile",
        });
        if (res && res.code == 1 && res.data) {
          myLink = res.data.my_link || null;
          records = res.data.my_records || [];
          this.updateBanState(res.data);
          if (this.controller) {
            this.controller.myLink = myLink;
          }
        }
      } catch (e) {
        // 拉取失败沿用状态缓存；记录数据缺失时由弹窗内自行加载
      }

      // 等待期间用户可能已关闭弹窗，此时不再路由
      if (!this.applyVisible) return;

      if (myLink && myLink.status == 1) {
        // 讲师已同意但尚未上麦 → 自动进入连麦（与状态自动进入一致，无需再点确认）；
        // 若状态自动进入已在进行中（starting/inLink）则直接忽略本次点击
        this.applyVisible = false;
        if (!this.inLink && !this.starting) {
          this.onAccepted({ link: myLink });
        }
        return;
      }
      if (myLink && myLink.status == 0) {
        // 有进行中的连麦记录 → 记录列表；已拉取的数据直接落位，无数据则弹窗内自行加载
        this.inviteMode = "record";
        this.inviteData = null;
        if (
          records !== null &&
          this.$refs.linkApply &&
          typeof this.$refs.linkApply.routeToRecord === "function"
        ) {
          this.$refs.linkApply.routeToRecord(records);
        }
        return;
      }
      // 无进行中记录且被禁止申请连麦（个人禁止/全场禁止主动连麦）→
      // 弹窗展示「当前禁止连麦」空态，不展示语音/视频选择（提交申请会被后端拦截）
      if (this.banState) {
        this.inviteMode = "disabled";
        this.inviteData = null;
        return;
      }
      // 无记录 → 语音/视频选择
      this.inviteMode = "apply";
      // #endif
    },

    /**
     * 同步「被禁止申请连麦」标记（getLinkInfo 下发 ban_link/forbid_apply_link）：
     * 0 未禁止 / 1 个人被禁止（中控台成员面板「禁止连麦」）/ 2 全场禁止主动连麦（运营设置）。
     * 仅拦学员主动申请；讲师邀请/已存在记录不受影响，记录弹窗照常可用
     * @param {Object} data live.link.info 接口返回数据
     */
    updateBanState(data) {
      if (!data) return;
      var ban = 0;
      if (parseInt(data.ban_link, 10) == 1) {
        ban = 1;
      } else if (parseInt(data.forbid_apply_link, 10) == 1) {
        ban = 2;
      }
      if (ban !== this.banState) {
        this.banState = ban;
      }
    },

    /**
     * 记录状态变更（取消申请/拒绝邀请后）→ 立即刷新一次连麦状态，
     * 保证工具条入口下次点击的路由判断准确
     */
    onStatusChange() {
      if (this.controller) {
        this.controller.poll();
      }
    },

    /**
     * 连麦事件消息 → 连麦记录对象
     * 消息体顶层字段（user_id/link_id/link_type/status/inviter）与 live.link.info 返回的
     * my_link 结构对齐，供邀请弹窗/自动上麦/下麦流程复用；嵌套 message JSON 兜底
     * @param {Object} data 消息体
     * @return {Object|null}
     */
    parseLinkMsg(data) {
      if (!data) return null;
      var msg = data.message || null;
      if (typeof msg === "string") {
        try {
          msg = JSON.parse(msg);
        } catch (e) {
          msg = null;
        }
      }
      msg = msg || {};
      var linkId = data.link_id || msg.link_id || 0;
      if (!linkId) return null;
      return {
        id: linkId,
        link_id: linkId,
        status: parseInt(data.status != null ? data.status : msg.status, 10) || 0,
        inviter: parseInt(data.inviter != null ? data.inviter : msg.inviter, 10) || 0,
        link_type: parseInt(data.link_type != null ? data.link_type : msg.link_type, 10) || 1,
        status_text: data.status_text || msg.status_text || "",
        push_url: data.push_url || msg.push_url || "",
      };
    },

    /**
     * 实时消息：讲师邀请连麦（message-box 上抛 link-invite，定向当前用户）
     * 弹出邀请提醒（与加载时 poll 检测到邀请进入同一路径）
     * @param {Object} data 消息体（user_id/link_id/link_type/status）
     */
    onLinkInvited(data) {
      // #ifdef H5
      const myLink = this.parseLinkMsg(data);
      if (!myLink || this.inLink) return;
      // 同一邀请记录弹窗已打开时不重复弹（加载时 poll 与实时消息可能先后触发）
      if (
        this.applyVisible &&
        this.inviteMode == "invite" &&
        this.inviteData &&
        String(this.inviteData.id) === String(myLink.id)
      ) {
        return;
      }
      this.inviteMode = "invite";
      this.inviteData = myLink;
      this.applyVisible = true;
      if (this.controller) {
        this.controller.myLink = myLink;
        this.controller.status = "apply";
      }
      // #endif
    },

    /**
     * 实时消息：讲师已取消连麦邀请（message-box 上抛 link-invite-cancel，定向当前用户）
     * 未接通的邀请被讲师终止：关闭邀请弹窗并提示，同步状态控制器
     * （poll 检测到记录消失时不再重复提示/不再误弹出其它终态文案）
     * @param {Object} data 消息体（user_id/link_id/link_type/status）
     */
    onLinkInviteCancel(data) {
      // #ifdef H5
      if (!data || this.inLink) return;
      const myLink = this.parseLinkMsg(data);
      // 关闭邀请弹窗（记录已终态，继续停留无意义）
      if (this.applyVisible) {
        this.applyVisible = false;
      }
      uni.showToast({ title: "讲师已取消连麦邀请", icon: "none" });
      // 同步状态控制器：标记该记录已实时通知，poll 检测到同一记录消失时跳过重复提示
      if (this.controller) {
        if (myLink && myLink.id) {
          this.controller.markClosedNotified(myLink.id);
          this.controller.myLink = null;
        }
        this.controller.poll();
      }
      this.notifyActive();
      // #endif
    },

    /**
     * 实时消息：讲师已同意连麦申请（message-box 上抛 link-approved，定向当前用户）
     * 自动进入连麦（与 poll 检测到同意同路径，无需学员再点确认）
     * @param {Object} data 消息体（user_id/link_id/link_type/status）
     */
    onLinkApproved(data) {
      // #ifdef H5
      const myLink = this.parseLinkMsg(data);
      if (!myLink) return;
      if (this.inLink || this.starting) return;
      // 正在处理讲师邀请（接听/拒绝弹窗）时跳过，避免打断
      if (this.applyVisible && this.inviteMode == "invite") return;
      this.applyVisible = false;
      this.onAccepted({ link: myLink });
      // #endif
    },

    /**
     * 实时消息：讲师结束连麦/全员下麦（message-box 上抛 link-ended，定向当前用户）
     * 连麦中 → 本地下麦、恢复 CDN 播放并提示；申请中弹窗 → 关闭并提示；
     * 同步控制器状态，避免按钮路由读到已结束的旧记录
     * @param {Object} data 消息体（user_id/link_id/status）
     */
    onLinkEnded(data) {
      // #ifdef H5
      if (!data || !data.link_id) return;
      if (this.inLink) {
        uni.showToast({ title: "讲师已结束连麦", icon: "none" });
        this.applyVisible = false;
        this.panelVisible = false;
        this.onEnded();
        return;
      }
      if (this.applyVisible) {
        uni.showToast({ title: "讲师已结束连麦", icon: "none" });
        this.applyVisible = false;
      }
      // 同步控制器状态（记录已被结束，onEnded 路径内已处理，此处覆盖申请中场景）
      if (this.controller && this.controller.myLink) {
        this.controller.endLink();
        this.notifyActive();
      }
      // #endif
    },

    /**
     * 实时消息：讲师已拒绝连麦申请（message-box 上抛 link-rejected，仅当前用户收到）
     * 提示结果 + 刷新记录弹窗 + 同步状态控制器（避免后续 poll 重复触发）
     * @param {Object} data 消息体（user_id/link_id/status）
     */
    onLinkRejected(data) {
      if (!data || this.inLink) return;
      if (this.controller) {
        // 标记该记录已实时通知，poll 检测到同一记录消失时不再重复提示
        this.controller.markClosedNotified(data.link_id);
        this.controller.poll();
      }
      this.handleLinkClosed({
        id: data.link_id,
        status: parseInt(data.status, 10) || 3,
        status_text: "已拒绝",
        inviter: 2,
      });
    },

    /**
     * 申请/待接入记录终态统一处理（poll link-closed 与实时 link-rejected 共用）：
     * 按终态给出对应提示（取消为学员自己操作不发提示），记录弹窗打开时刷新列表，
     * 让「申请中」行实时变为终态并可再次申请
     * @param {Object} record 终态连麦记录
     */
    handleLinkClosed(record) {
      if (!record || !record.id) return;
      var status = parseInt(record.status, 10);
      var tip = "";
      if (status == 3) {
        // 已拒绝（讲师拒绝学员申请）
        tip = "讲师已拒绝你的连麦申请";
      } else if (status == 2) {
        // 已结束：讲师邀请被撤销 / 学员申请被结束
        tip = record.inviter == 1 ? "讲师已撤销连麦邀请" : "讲师已结束连麦申请";
      } else if (status == 4) {
        // 已超时
        tip = "连麦申请已超时";
      }
      if (tip) {
        // 实时消息与poll 兜底可能双触发，3s 内同文案只提示一次
        var now = Date.now();
        if (!(tip == this.lastClosedTip && now - (this.lastClosedTipAt || 0) < 3000)) {
          uni.showToast({ title: tip, icon: "none" });
          this.lastClosedTip = tip;
          this.lastClosedTipAt = now;
        }
      }
      // 记录弹窗打开时刷新列表（「申请中」行实时变为终态，可再次申请）
      if (
        this.applyVisible &&
        this.inviteMode == "record" &&
        this.$refs.linkApply &&
        typeof this.$refs.linkApply.loadRecords === "function"
      ) {
        this.$refs.linkApply.loadRecords();
      }
      this.notifyActive();
    },

    /**
     * 弹窗内部模式切换同步（申请成功后转记录弹窗、记录切语音/视频选择等），
     * 保证父级 inviteMode 与弹窗实际模式一致（自动上麦需区分「接听邀请」与「申请/记录」弹窗）
     */
    onModeChange(mode) {
      this.inviteMode = mode;
    },

    /**
     * 同步「当前用户有进行中连麦」状态给父级（即时路径，poll 兜底见 live-link-controller）
     * 父级用于开关关闭时保持工具条连麦按钮常显，保证连麦设置面板/取消申请出口可用
     */
    notifyActive() {
      var active =
        this.status != "idle" ||
        (this.controller && this.controller.myLink && this.controller.myLink.id) ||
        this.inLink;
      this.$emit("link-active", !!active);
      // 精确上报「是否已真正上麦」（区别于 link-active 的「申请中也置位」）：
      // 上麦后直播 CDN 输出切为连麦合流成片，父级据此刻将主画面切等比缩放（contain）
      this.$emit("link-connecting", !!this.inLink);
    },

    /**
     * 预取媒体权限（link-apply 点击申请/接听/进入连麦时上抛，携带用户点击手势）
     * 微信内置浏览器要求 getUserMedia 在用户手势内发起，否则权限确认框不弹出
     * （讲师同意消息触发的自动上麦无手势上下文，表现为连麦成功需再点一次连麦图标）：
     * 在用户点击时机先授权，同意后 onAccepted 内的 getUserMedia 直接通过并推流。
     * @param {Number} linkType 连麦模式：1视频 2语音
     * @param {Function} callback 授权结果回调（{granted, error}）
     */
    async onPreflightMedia(linkType, callback) {
      // #ifdef H5
      var result = { granted: false, error: "连麦功能未就绪，请稍后重试" };
      if (
        this.controller &&
        typeof this.controller.preflightMedia === "function"
      ) {
        try {
          result = await this.controller.preflightMedia(linkType);
        } catch (e) {
          result = {
            granted: false,
            error: (e && e.message) || "获取媒体权限失败",
          };
        }
      }
      if (typeof callback === "function") {
        callback(result);
      }
      // #endif
    },

    /**
     * 申请已提交
     */
    onApplied(data) {
      if (this.controller) {
        this.controller.onApplied(data);
      }
      this.status = "apply";
      this.notifyActive();
    },

    /**
     * 已接通（讲师同意或接受邀请）
     * 上麦前必须先停止 CDN 播放器（防回音），再初始化连麦 SDK
     */
    async onAccepted(data) {
      var linkRow = (data && data.link) || this.controller?.myLink || null;
      // 已上麦或正在上麦时忽略重复触发（状态自动进入与工具条点击可能并发）
      if (this.inLink || this.starting) {
        return;
      }
      this.starting = true;

      try {
        // 获取连麦 SDK 参数
        const infoRes = await this.$api("live.link.info", {
          course_id: this.courseId,
          platform: "mobile",
        });
        const info = infoRes.data || {};
        const sdkAuth = info.sdk_auth || {};

        // 连麦记录兜底：入参记录缺失时依次取状态缓存、本次信息接口的最新记录
        // （接听接口返回的记录含 push_url；状态缓存可能是邀请时创建的旧记录，无 push_url）
        linkRow =
          (linkRow && linkRow.id && linkRow) ||
          this.controller?.myLink ||
          info.my_link ||
          null;
        if (!linkRow || !linkRow.id) {
          throw new Error("连麦信息缺失，请稍后重试");
        }
        this.myLinkId = linkRow.id;
        this.myLinkType = linkRow.link_type || 1;
        // 同步最新记录给状态控制器（含 push_url/start_time），后续 poll 与工具条路由不再读到旧记录
        if (this.controller) {
          this.controller.myLink = linkRow;
        }

        // 推流地址由后端按官方连麦地址格式生成（agree/accept 时写入 push_url）；
        // 缺失时给出明确错误，不拼接旧格式地址（SDK parseUrl 报 url invalid）
        const pushUrl =
          linkRow.push_url || (info.my_link && info.my_link.push_url) || "";
        if (!pushUrl) {
          throw new Error("连麦推流地址缺失，请退出后重新进入连麦");
        }

        await this.controller.startLink({
          pushUrl: pushUrl,
          channelId: info.channel_id || "",
          userId: info.rtc_user_id || "",
          linkType: this.myLinkType,
          auth: sdkAuth,
        });

        this.inLink = true;
        // 连麦时长起点：优先取后端同意时间（重进直播间/重开面板仍显示真实总时长），缺失时取本地上麦时间
        this.linkStartTime =
          parseInt(linkRow.start_time, 10) > 0
            ? parseInt(linkRow.start_time, 10) * 1000
            : Date.now();
        // 状态控制器同步为连麦中（myLink 已是最新记录），避免 poll 重复触发「讲师已同意」自动进入
        if (this.controller) {
          this.controller.onLinked(linkRow);
        }
        // 上麦后展示自己的画面（本地预览小窗，仅视频连麦）
        this.setupLocalPreview();
        uni.showToast({ title: "已上麦", icon: "none" });
        this.notifyActive();
      } catch (err) {
        console.warn("[live-link] 上麦失败", err);
        // 错误用确认框完整展示（L1-4.1），微信权限拒绝场景给设置引导
        if (typeof uni.showModal === "function") {
          uni.showModal({
            title: "连麦失败",
            content: (err && err.message) || "无法开启连麦，请检查摄像头/麦克风权限",
            showCancel: false,
            confirmText: "知道了",
          });
        } else {
          uni.showToast({ title: (err && err.message) || "连麦失败", icon: "none" });
        }
      } finally {
        this.starting = false;
      }
    },

    /**
     * 连麦已结束（学员主动下麦）
     */
    async onEnded() {
      if (this.controller) {
        await this.controller.endLink();
      }
      this.inLink = false;
      this.status = "idle";
      // 下麦后移除本地预览（语音连麦头像占位不再展示）
      this.teardownLocalPreview();
      this.notifyActive();
    },

    /**
     * 本地设置变更（连麦设置面板「麦克风/摄像头」触发）：
     * 经控制器调用 SDK 实际静音/关摄像头
     */
    onLocalChange(change) {
      if (this.controller) {
        this.controller.setLocalMedia(change);
      }
      // 继续向上抛出（当前父页面不消费，保留对外能力）
      this.$emit("link-local-change", change);
    },

    /* ==================== 本地预览（H5，已停用） ==================== */

    /**
     * 本地画面展示（H5，已停用）：视频连麦不再显示本地预览浮层
     * （link-local-preview / link-split-* 不再挂载，连麦中主画面保持全屏），
     * 语音连麦由模板静态展示头像占位；
     * 保留空实现与 teardownLocalPreview 对称，保证下麦/销毁清理路径完整
     */
    setupLocalPreview() {
      // #ifdef H5
      // 不创建本地预览 video 元素（连麦推流走 link-sdk startPush，不依赖本地预览）
      // #endif
    },

    /**
     * 下麦/销毁时移除本地预览（Stop 预览 + 卸载 video 元素）
     */
    teardownLocalPreview() {
      // #ifdef H5
      if (this.controller && this.controller.linkSdk) {
        this.controller.linkSdk.stopPreview().catch(() => {});
      }
      if (this.previewEl && this.previewEl.parentNode) {
        this.previewEl.parentNode.removeChild(this.previewEl);
      }
      this.previewEl = null;
      // #endif
    },
  },
};