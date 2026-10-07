<script>
import { typeText, statusText, amountText } from './redpacket-text.js';
import { maskNickname } from '@/common/utils/privacy';

var that;
export default {
  components: {},
  data() {
    return {
      show: false,
      status: 'pending', // pending: 未抢, grabbed: 已抢到, finished: 已抢完, expired: 已过期
      myAmount: '0.00',
      grabList: [],
      detail: {},
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
    // 白卡态：领取记录、已抢到、已抢完、已过期——信封换成「红身 + 米白内卡」那套版式
    cardMode() {
      return this.showRecords || this.status != 'pending';
    },
    typeLabel() {
      var t = (this.detail && this.detail.type) || this.redpacketData.type || 'lucky';
      return typeText(t);
    },
    // 结果卡那一句：状态词只在一处翻译（与红包记录清单同一份表），抢到手的那一档另有说法
    resultLine() {
      if (this.status == 'grabbed') {
        return '恭喜你抢到了';
      }
      var t = statusText(this.status);
      return t ? '红包' + t : '红包已结束';
    },
    /**
     * 加载态那一枚转圈的颜色（2026-10-02 用户点名「加载中时偏白色的那块显示的是黑色」）。
     * 加载层原先两层都压 rgba(0,0,0,0.35)：红身压成暗红还读得出「红」，白卡那一档底下本该是
     * #fff8f4 的浅米白被压成了黑色。改成不压黑之后，转圈必须跟着它站的那块底换，否则白底上
     * 一枚白转圈直接看不见。底色在 css.css 的 .redpacket-loading 上，两档在这里成对给出。
     */
    loadingColor() {
      return this.cardMode ? '#c2273d' : '#ffffff';
    },
    loadingInactiveColor() {
      return this.cardMode ? 'rgba(194, 39, 61, 0.28)' : 'rgba(255, 255, 255, 0.4)';
    },
    // 总计金额：详情优先、消息卡兜底；去掉 .00 尾巴（888.00 → 888）
    totalAmountText() {
      return amountText((this.detail && this.detail.total_amount) || this.redpacketData.total_amount || '');
    },
    // 白卡中间那个大数字：抢到的是我抢到的金额，没抢到/过期/撤回的是这只红包的总额
    cardAmount() {
      return this.status == 'grabbed' ? this.myAmount : this.totalAmountText;
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
        that.detail = {};
        that.showRecords = false;
      }
    },
  },
  methods: {
    close() {
      this.$emit('close', false);
    },
    /**
     * 用户名脱敏：保留首字符，其余以 *** 代替（如 冯浩森@凸知 → 冯***）。
     * 实现已上移到 `common/utils/privacy.js`（全站单一真源，2026-10-03），这里只做转发，
     * 方法名留着是为了模板里的 maskName(item.nickname) 那一处不用动。
     */
    maskName(name) {
      return maskNickname(name);
    },
    open() {
      this.$emit('open', false);
    },
    getInitialStatus() {
      var s = (that.redpacketData && that.redpacketData.status) || '';
      // 行上已经带了终态（已抢到 / 已抢完 / 已过期 / 已撤回）就照它先渲染，
      // 详情回来后再按 my_grab 校正；从红包记录点进来的那一只多半就是终态
      if (s && s != 'pending') {
        return s;
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
     * 「去提现」：进个人中心的余额页。弹层要先收掉，回退回来不会还盖在余额页上面
     */
    goBalance() {
      that.close();
      that.$nav.to('/pages/user/balance/index');
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
          that.detail = data;
          that.grabList = data.grab_list || [];
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
