// 连麦申请/接听弹窗（live_link）
var that;
export default {
  components: {},
  data() {
    return {
      loading: false,
      mode: "apply", // apply=主动申请 invite=收到讲师邀请 record=连麦记录
      inviteLinkId: 0,
      inviteLinkType: 1, // 1视频 2语音
      recordList: [],
      recordLoading: false,
      // 申请模式当前提交中的连麦类型（1视频 2语音；0=无，用于选中项加载态展示）
      applyLoadingType: 0,
      // 接听/拒绝提交中的动作（'accept'/'reject'；''=无，用于接听/拒绝按钮加载态展示）
      inviteAction: "",
      // 工具条点击路由时已拉取的记录（一次性，由 applyMode 消费，避免弹窗内二次请求）
      pendingRecords: null,
    };
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    courseId: {
      type: [String, Number],
      default: 0,
    },
    // 弹窗模式：apply 主动申请 / invite 讲师邀请 / record 连麦记录
    value: {
      type: String,
      default: "apply",
    },
    // 讲师邀请的连麦记录
    inviteData: {
      type: Object,
      default: null,
    },
    // 是否被禁止申请连麦（0 未禁止 / 1 个人禁止 / 2 全场禁止主动连麦），
    // 由父级从 live.link.info 的 ban_link/forbid_apply_link 标记同步；
    // 仅拦主动申请，讲师邀请/已存在记录不受影响
    banned: {
      type: [Number, String],
      default: 0,
    },
  },
  computed: {
    modalTitle() {
      if (this.mode == "invite") {
        return "连麦邀请";
      }
      if (this.mode == "disabled") {
        return "无法申请连麦";
      }
      if (this.mode == "record" || this.mode == "pending") {
        return "连麦申请";
      }
      return "申请连麦";
    },
    modalDesc() {
      if (this.mode == "invite") {
        return "讲师邀请你进行连麦";
      }
      if (this.mode == "record") {
        return "你的连麦记录，申请中可取消";
      }
      if (this.mode == "pending") {
        return "正在获取连麦信息";
      }
      if (this.mode == "disabled") {
        return "";
      }
      return "选择连麦模式";
    },
    // 禁止连麦空态说明（与后端 live/link/apply 拦截文案一致，前后端同一校验文案）
    bannedTip() {
      if (Number(this.banned) == 1) {
        return "你已被禁止申请连麦，可联系讲师解除";
      }
      if (Number(this.banned) == 2) {
        return "讲师已开启禁止主动连麦，可等待讲师邀请";
      }
      return "";
    },
    // 底部取消/返回按钮文案（apply=取消；record=申请连麦入口；disabled=知道了。邀请弹窗无此按钮：接听/拒绝）
    cancelText() {
      if (this.mode == "record") {
        return "申请连麦";
      }
      if (this.mode == "disabled") {
        return "知道了";
      }
      return "取消";
    },
    // 记录列表中是否有进行中的连麦（申请中/连麦中）——存在时后端不允许再次申请，
    // 记录弹窗底部不显示「申请连麦」入口。
    // 注意按全部记录判断：弹窗仅展示最近一条，若较新的记录被拒/取消而更早的记录仍在
    // 进行中，只看展示数据会误显示「申请连麦」入口（点击也会被后端拦截）
    hasActiveRecord() {
      return this.recordList.some((item) => item.status == 0 || item.status == 1);
    },
    // 弹窗内仅展示最近一条连麦记录（最新状态即可操作；进行中判断仍看全部记录）
    visibleRecords() {
      return this.recordList.slice(0, 1);
    },
  },
  watch: {
    show(val) {
      if (val) {
        this.applyMode();
      }
    },
    // 弹窗已打开时父级切换模式（如记录弹窗打开期间讲师邀请到达 → 切到接听/拒绝），
    // 仅同步内部 mode，避免 show 不变时内容不刷新
    value(val) {
      if (this.show && val) {
        this.applyMode();
      }
    },
    // 内部模式切换（申请成功后转记录弹窗、记录切语音/视频选择等）同步给父级，
    // 供父级判断当前弹窗类型（如自动上麦时区分「接听邀请」与「申请/记录」弹窗）
    mode(val) {
      this.$emit("mode-change", val);
    },
  },
  methods: {
    // 按传入模式初始化弹窗内容（mode/inviteLinkId/inviteLinkType/记录加载）
    applyMode() {
      this.mode = this.value || "apply";
      // 被禁止申请连麦（个人/全场）：语音/视频选择直接替换为「当前禁止连麦」空态
      if (this.mode == "apply" && Number(this.banned)) {
        this.mode = "disabled";
      }
      this.inviteLinkType = 1;
      this.applyLoadingType = 0;
      this.inviteAction = "";
      // 讲师邀请：记录落位（invite 接听用 linkId，展示连麦类型）
      if (this.mode == "invite" && this.inviteData) {
        this.inviteLinkId = this.inviteData.link_id || this.inviteData.id || 0;
        this.inviteLinkType = this.inviteData.link_type || 1;
      }
      // 连麦记录模式：优先使用工具条点击时已拉取的记录（一次性），否则拉取最新列表
      if (this.mode == "record") {
        if (this.pendingRecords !== null) {
          this.recordList = this.pendingRecords;
          this.recordLoading = false;
          this.pendingRecords = null;
        } else {
          this.loadRecords();
        }
      }
    },

    /**
     * 工具条点击路由：父级已随 live.link.info 拉到记录数据，先暂存，
     * 由随后 value watch 触发的 applyMode 直接落位，省去弹窗内二次请求
     * @param {Array} records 连麦记录列表
     */
    routeToRecord(records) {
      this.pendingRecords = Array.isArray(records) ? records : [];
    },

    close() {
      this.$emit("close", false);
    },

    // 底部取消/返回按钮：record 切到语音/视频选择（申请连麦入口）；其余关闭。邀请弹窗无此按钮（直接接听/拒绝）
    handleCancel() {
      if (this.mode == "record") {
        this.goApply();
      } else {
        this.close();
      }
    },

    // 从记录弹窗切到「选择语音/视频」申请（apply 模式模板不读 inviteData）
    // 被禁止申请连麦时切到空态（不展示语音/视频选择，申请会被后端拦截）
    goApply() {
      this.mode = Number(this.banned) ? "disabled" : "apply";
    },

    /**
     * 拉取连麦记录列表（with_records=1 时后端返回 my_records）
     */
    loadRecords() {
      this.recordLoading = true;
      this.$api("live.link.info", {
        course_id: this.courseId,
        with_records: 1,
      })
        .then((res) => {
          this.recordLoading = false;
          if (res.code == 1 && res.data) {
            this.recordList = res.data.my_records || [];
          }
        })
        .catch(() => {
          this.recordLoading = false;
          this.recordList = [];
        });
    },

    /**
     * 取消申请中的连麦（学员主动申请且未接通的记录），二次确认后提交
     */
    cancelRecord(item) {
      if (this.loading) return;
      uni.showModal({
        title: "取消连麦",
        content: "确定取消这条连麦申请吗",
        success: (res) => {
          if (!res.confirm) return;
          this.loading = true;
          this.$api("live.link.cancel", {
            course_id: this.courseId,
            link_id: item.id,
          })
            .then((res) => {
              this.loading = false;
              if (res.code == 1) {
                uni.showToast({ title: "已取消", icon: "none" });
                this.afterRecordChange();
              } else {
                uni.showToast({ title: res.msg || "取消失败", icon: "none" });
              }
            })
            .catch((err) => {
              this.loading = false;
              uni.showToast({ title: (err && err.msg) || "取消失败", icon: "none" });
            });
        },
      });
    },

    // 连麦记录列表中接听讲师邀请（复用邀请流程）
    acceptRecord(item) {
      if (this.loading) return;
      this.inviteLinkId = item.id || 0;
      // 同步连麦类型（预取权限约束按真实邀请类型：语音只取麦克风）
      this.inviteLinkType = item.link_type || this.inviteLinkType;
      this.acceptLink();
    },

    // 连麦记录列表中拒绝讲师邀请（复用邀请流程）
    rejectRecord(item) {
      if (this.loading) return;
      this.inviteLinkId = item.id || 0;
      this.rejectLink();
    },

    // 连麦记录列表中「连麦中」行：讲师已同意但尚未上麦时进入连麦（备用入口，主链路已自动进入）
    // 先权限预取（点击手势内），授权通过后直接走父级上麦链路
    enterLinkByRecord(item) {
      if (this.loading || !item) return;
      this.loading = true;
      this.requestMediaPermission(item.link_type || 1, () => {
        this.loading = false;
        this.$emit("accepted", { link: item });
        this.$emit("close", false);
      });
    },

    /**
     * 记录状态变更后：记录模式重拉列表并通知父级刷新状态；其余模式关闭弹窗
     */
    afterRecordChange() {
      if (this.mode == "record") {
        this.loadRecords();
        this.$emit("status-change");
      } else {
        this.$emit("close", false);
      }
    },

    /**
     * 预取媒体权限（必须在用户点击手势内发起）
     * 微信内置浏览器要求 getUserMedia 由用户手势触发，否则权限确认框不弹出——
     * 讲师同意连麦由消息事件驱动，其后的自动上麦无手势上下文（表现为连麦成功
     * 却需再点一次连麦图标才弹权限框）。因此在申请/接听/进入连麦的点击时机先授权，
     * 授权通过后再走后续提交/上麦链路，同意到达时 getUserMedia 直接通过不再弹窗：
     * - 通过：authorized() 内继续原流程
     * - 拒绝：确认框完整展示错误与微信设置引导（L1-4.1），终止本次操作
     * @param {Number} linkType 连麦模式：1视频 2语音
     * @param {Function} authorized 授权通过后的回调
     */
    requestMediaPermission(linkType, authorized) {
      var that = this;
      this.$emit("preflight-media", linkType, function (result) {
        var permission = result || { granted: true };
        if (!permission.granted) {
          that.loading = false;
          that.applyLoadingType = 0;
          that.inviteAction = "";
          uni.showModal({
            title: "无法开启连麦",
            content:
              permission.error ||
              "未获得摄像头/麦克风权限。若已被拒绝，请在微信右上角「设置」中允许访问摄像头与麦克风后重试。",
            showCancel: false,
            confirmText: "知道了",
          });
          return;
        }
        authorized && authorized();
      });
    },

    // 主动申请：选择连麦模式（选中项显示加载状态，另一项弱化禁点）
    // 先同步调起权限预取（点击手势内），授权通过后才提交申请，
    // 保证讲师同意后能立即自动上麦推流（不再弹权限框、无需二次点击）
    confirmType(linkType) {
      if (this.loading) return;
      this.loading = true;
      this.applyLoadingType = linkType;
      this.requestMediaPermission(linkType, () => {
        this.submitApply(linkType);
      });
    },

    // 提交连麦申请（权限已预取通过）
    submitApply(linkType) {
      this.$api("live.link.apply", {
        course_id: this.courseId,
        link_type: linkType,
        platform: "mobile",
      })
        .then((res) => {
          this.loading = false;
          if (res.code == 1) {
            uni.showToast({ title: "申请已提交，请等待讲师同意", icon: "none" });
            // 申请成功后直接切到连麦申请记录弹窗（展示申请中记录可取消），不关闭弹窗
            this.applyLoadingType = 0;
            this.pendingRecords = null;
            this.mode = "record";
            this.$emit("applied", res.data);
            this.loadRecords();
          } else {
            this.applyLoadingType = 0;
            uni.showToast({ title: res.msg || "申请失败", icon: "none" });
          }
        })
        .catch((err) => {
          this.loading = false;
          this.applyLoadingType = 0;
          uni.showToast({ title: (err && err.msg) || "申请失败", icon: "none" });
        });
    },

    // 记录列表某行接听/拒绝是否提交中（用于按钮加载态展示）
    isRecordLoading(item, action) {
      if (!item) return false;
      return this.inviteAction == action && this.inviteLinkId == item.id;
    },

    // 接听讲师邀请（默认按邀请类型接通）
    // 先权限预取（点击手势内），授权通过后提交接听，成功后父级自动上麦推流
    acceptLink() {
      if (this.loading) return;
      this.loading = true;
      this.inviteAction = "accept";
      this.requestMediaPermission(this.inviteLinkType || 1, () => {
        this.submitAccept();
      });
    },

    // 提交接听讲师邀请（权限已预取通过）
    submitAccept() {
      this.$api("live.link.accept", {
        course_id: this.courseId,
        link_id: this.inviteLinkId,
        platform: "mobile",
      })
        .then((res) => {
          this.loading = false;
          this.inviteAction = "";
          if (res.code == 1) {
            uni.showToast({ title: "连麦成功", icon: "none" });
            // 后端返回接通后的连麦记录（含 push_url），透传给父级上麦使用；
            // 不传记录时父级会回退到状态缓存（邀请时创建、无 push_url），报「连麦推流地址缺失」
            this.$emit("accepted", { link: res.data });
            this.$emit("close", false);
          } else {
            uni.showToast({ title: res.msg || "连麦失败", icon: "none" });
          }
        })
        .catch((err) => {
          this.loading = false;
          this.inviteAction = "";
          uni.showToast({ title: (err && err.msg) || "连麦失败", icon: "none" });
        });
    },

    // 拒绝讲师邀请（邀请提醒弹窗与记录列表共用；失败保持弹窗打开可重试）
    rejectLink() {
      if (this.loading) return;
      this.loading = true;
      this.inviteAction = "reject";
      this.$api("live.link.reject", {
        course_id: this.courseId,
        link_id: this.inviteLinkId,
      })
        .then((res) => {
          this.loading = false;
          this.inviteAction = "";
          uni.showToast({ title: "已拒绝", icon: "none" });
          this.afterRecordChange();
        })
        .catch((err) => {
          this.loading = false;
          this.inviteAction = "";
          uni.showToast({ title: (err && err.msg) || "操作失败", icon: "none" });
        });
    },
  },
};
