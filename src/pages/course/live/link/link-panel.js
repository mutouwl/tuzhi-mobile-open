// 连麦中控制面板（live_link）
var that;
export default {
  components: {},
  data() {
    return {
      muted: false,
      videoOn: true,
      loading: false,
      // 连麦时长计时（面板打开期间每秒刷新，基于父级下发的连麦开始时间计算）
      durationNow: 0,
      durationTimer: null,
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
    linkId: {
      type: [String, Number],
      default: 0,
    },
    linkType: {
      type: Number,
      default: 1, // 1视频 2语音
    },
    // 连麦开始时间戳（ms，优先后端同意时间），用于展示连麦时长
    linkStartTime: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    // 连麦时长文本（mm:ss；超过 1 小时显示 hh:mm:ss）
    durationText() {
      let sec = 0;
      if (this.linkStartTime > 0 && this.durationNow > this.linkStartTime) {
        sec = Math.floor((this.durationNow - this.linkStartTime) / 1000);
      }
      const pad = (n) => (n < 10 ? "0" + n : "" + n);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return h > 0 ? pad(h) + ":" + pad(m) + ":" + pad(s) : pad(m) + ":" + pad(s);
    },
  },
  watch: {
    show(val) {
      if (val) {
        // 语音连麦强制关摄像头
        if (this.linkType == 2) {
          this.videoOn = false;
        }
        // 开启连麦时长计时（关闭面板时停止）
        this.durationNow = Date.now();
        this.startDurationTimer();
      } else {
        this.stopDurationTimer();
      }
    },
  },
  beforeDestroy() {
    this.stopDurationTimer();
  },
  methods: {
    close() {
      this.$emit("close", false);
    },

    // 连麦时长每秒刷新
    startDurationTimer() {
      this.stopDurationTimer();
      this.durationTimer = setInterval(() => {
        this.durationNow = Date.now();
      }, 1000);
    },

    stopDurationTimer() {
      if (this.durationTimer) {
        clearInterval(this.durationTimer);
        this.durationTimer = null;
      }
    },

    // 本地开关切换（麦克风/摄像头）
    toggleField(field, value) {
      // 语音连麦禁开摄像头
      if (field === "video_on" && this.linkType == 2) {
        uni.showToast({ title: "语音连麦不支持开启摄像头", icon: "none" });
        return;
      }

      if (field === "mute") {
        this.muted = !!value;
      }
      if (field === "video_on") {
        this.videoOn = !!value;
      }

      // 本地媒体控制（由父级通过 linkSdk 处理实际音视频 mutes）
      this.$emit("local-change", { field: field, value: value });

      // 上报后端记录
      this.$api("live.link.updateLocal", {
        course_id: this.courseId,
        link_id: this.linkId,
        field: field,
        value: value ? 1 : 0,
      }).catch(() => {});
    },

    // 结束连麦（二次确认，防误触）
    endLink() {
      if (this.loading) return;
      uni.showModal({
        title: "结束连麦",
        content: "确定结束连麦吗",
        success: (res) => {
          if (!res.confirm) return;
          // 结束期间显示加载弹窗（mask 防重复点击/误触，对齐提交类操作惯例）
          this.loading = true;
          uni.showLoading({ title: "结束连麦中", mask: true });
          this.$api("live.link.end", {
            course_id: this.courseId,
            link_id: this.linkId,
          })
            .then((res) => {
              this.loading = false;
              uni.hideLoading();
              if (res.code == 1) {
                uni.showToast({ title: "已结束连麦", icon: "none" });
                // 连接结束后通知父级下麦（停推流/恢复 CDN/移除本地预览）并关闭连麦设置弹窗
                this.$emit("ended", {});
                this.$emit("close", false);
              } else {
                uni.showToast({ title: res.msg || "操作失败", icon: "none" });
              }
            })
            .catch((err) => {
              this.loading = false;
              uni.hideLoading();
              uni.showToast({ title: (err && err.msg) || "操作失败", icon: "none" });
            });
        },
      });
    },
  },
};