<script>
var that;
export default {
  components: {},
  data() {
    return {
      show: false,
      status: 'pending', // pending: 未抢, grabbed: 已抢到, finished: 已抢完, expired: 已过期
      myAmount: '0.00',
      grabList: [],
      luckyKing: null,
      grabbing: false,
      detailLoading: false,
      showRecords: false,
    };
  },
  props: {
    visible: {
      type: [Boolean, Number],
      default: false,
    },
    courseId: {
      type: [String, Number],
      default: 0,
    },
    redpacketData: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  computed: {
    isRedpacketEnabled() {
      return !!this.$tools.systemConfig('app_isinstall_live_redpacket');
    },
  },
  watch: {
    visible() {
      that.show = that.visible;
      if (that.show && that.redpacketData && that.redpacketData.id) {
        that.status = that.getInitialStatus();
        that.detailLoading = true;
        that.getDetail();
      }
    },
    redpacketData() {
      if (that.show && that.redpacketData && that.redpacketData.id) {
        that.status = that.getInitialStatus();
        that.myAmount = '0.00';
        that.grabList = [];
        that.luckyKing = null;
      }
    },
  },
  methods: {
    close() {
      this.$emit('close', false);
    },
    /**
     * 用户名脱敏：保留首字符，其余以 *** 代替（如 冯浩森@凸知 → 冯***）
     */
    maskName(name) {
      if (!name) return '-';
      return String(name).slice(0, 1) + '***';
    },
    open() {
      this.$emit('open', false);
    },
    getInitialStatus() {
      if (that.redpacketData && that.redpacketData.status == 'expired') {
        return 'expired';
      }
      if (that.redpacketData && that.redpacketData.expire_time) {
        var expireTime = parseInt(that.redpacketData.expire_time);
        if (expireTime && Math.floor(Date.now() / 1000) >= expireTime) {
          return 'expired';
        }
      }
      return 'pending';
    },
    /**
     * 抢红包
     */
    grabRedpacket() {
      if (that.grabbing) return;
      if (!that.isRedpacketEnabled) {
        uni.showToast({ title: '红包功能未开启', icon: 'none' });
        return;
      }
      if (!that.redpacketData || !that.redpacketData.id) {
        uni.showToast({ title: '红包信息异常', icon: 'none' });
        return;
      }
      that.grabbing = true;
      uni.showLoading({ title: '抢红包中' });
      that.$api('live.redpacket.grab', {
        redpacket_id: that.redpacketData.id,
        course_id: that.courseId,
      }).then(function (res) {
        uni.hideLoading();
        that.grabbing = false;
        if (res.code === 1) {
          that.myAmount = res.data.amount || '0.00';
          that.status = 'grabbed';
          that.$emit('grabbed', res.data);
          // 刷新详情
          that.getDetail();
        } else {
          // 抢红包失败（已抢完/已过期/已抢过）
          if (res.data && res.data.status) {
            that.status = res.data.status;
          }
          uni.showToast({ title: res.msg || '抢红包失败', icon: 'none' });
          that.getDetail();
        }
      }).catch(function () {
        uni.hideLoading();
        that.grabbing = false;
      });
    },
    /**
     * 获取红包详情
     */
    getDetail() {
      if (!that.redpacketData || !that.redpacketData.id) {
        that.detailLoading = false;
        return;
      }
      that.$api('live.redpacket.detail', {
        redpacket_id: that.redpacketData.id,
      }).then(function (res) {
        that.detailLoading = false;
        if (res.code === 1 && res.data) {
          var data = res.data;
          that.grabList = data.grab_list || [];
          // 从抢夺列表中查找手气最佳
          that.luckyKing = null;
          for (var i = 0; i < that.grabList.length; i++) {
            if (that.grabList[i].is_max == 1) {
              that.luckyKing = that.grabList[i];
              break;
            }
          }
          // 更新状态
          if (data.status) {
            that.status = data.status;
          }
          if (data.my_grab && data.my_grab.amount !== undefined && data.my_grab.amount !== null) {
            that.myAmount = data.my_grab.amount;
            if (parseFloat(data.my_grab.amount) > 0) {
              that.status = 'grabbed';
            }
          }
        }
      }).catch(function () {
        that.detailLoading = false;
      });
    },
  },
  mounted() {
    that = this;
    this.show = this.visible;
    if (this.show && this.redpacketData && this.redpacketData.id) {
      this.status = this.getInitialStatus();
      this.detailLoading = true;
      this.getDetail();
    }
  },
};
</script>
