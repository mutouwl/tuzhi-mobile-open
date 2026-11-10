<script>
var that;
import courseList from "./components/course.vue"
import { FEATURE_SEND_FRIEND } from '@/common/utils/feature-flags.js';
export default {
  components:{courseList},
  data() {
    return {
      // 送好友功能开关（2026-10-22 用户点名「未开发完毕的与拼团一起隐藏」；当前 feature-flags 里为 true）
      featureSendFriend: FEATURE_SEND_FRIEND,
      status: 'success',
      title: '成功支付',
      subtitle: '',
      btnText: '查看订单',
      order_no:'',
      orderDetail:{
        goodsList:[]
      }
    }
  },
  watch: {
  },
  computed: {
    /**
     * 本单到账的消费积分（后端 `consume_score`，由 `ConsumeGrant::earnedOfOrder()` 求和 pay 流水）。
     * 端上不重算：兑换单 / 完成时机未到账 / 零流水后端都回 0，这里只做展示前的数值兜底。
     */
    earnedScore() {
      const detail = this.orderDetail || {};
      const score = Number(detail.consume_score);
      return isFinite(score) && score > 0 ? Math.floor(score) : 0;
    }
  },
  methods: {
    /**
     * 「恭喜您获得 N 积分」整行点进积分中心（navigateTo：看完能返回结果页）
     */
    goScoreCenter() {
      this.$nav.to('/pages/app/score/home/home', 'local');
    },
    handleBtnTap() {
      if (typeof this.btnClick === 'function') {
        this.btnClick();
      }
    },
    order(){
      uni.redirectTo({
        url:"/pages/order/detail/detail?order_no="+this.order_no
      })
    },
    /**
     * 【去赠送】的落点（M-P3，2026-10-28 用户点名「在这个页面点进去赠送，直接跳转赠送详情」）。
     *
     * 目标页是送礼页（赠送详情，M-P9），它认礼单凭据 `code` —— 凭据由后端随订单详情
     * 一起下发（`gift_code`，判据只存 `Gift::firstCodeByOrder()`：待赠送优先、回落 seq 最小一条），
     * 端上不再中转赠送记录列表，也不自己拉一次 `gift/list` 去猜第一条（第二份判据 = 下次分叉）。
     * 拿不到凭据（领取单 / 未装残留 / 这一单还没有礼单行）才回落到赠送记录列表，
     * 且只列这一张购买单 —— 不造一条点进去是空页的入口（硬约束 27②）。
     * `redirectTo`：付完款这一页不再回头。
     */
    goGift() {
      const code = String((this.orderDetail || {}).gift_code || '');
      if (code !== '') {
        this.$nav.to('/pages/app/send_friend/send/send?code=' + encodeURIComponent(code), 'local', 'redirectTo');
        return;
      }
      this.$nav.to('/pages/app/send_friend/gift/gift' + (this.order_no ? '?order_no=' + this.order_no : ''), 'local', 'redirectTo');
    },
    getOrderDetail() {
      that.$api('order.detail', {
        order_no: that.order_no
      }).then(res => {
        if (res.code == 1) {
          that.orderDetail = res.data;
        }
      });
      uni.stopPullDownRefresh();
    },

  },
  onLoad(pageParams) {
    that = this;
    if (pageParams.status) {
      this.status = pageParams.status;
    }
    if (pageParams.order_no) {
      this.order_no = pageParams.order_no;
      this.getOrderDetail();
    }
  }
}
</script>