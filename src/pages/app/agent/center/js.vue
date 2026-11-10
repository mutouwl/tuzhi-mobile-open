<script>
var that;
import shareModal from "@/components/modal/share-modal.vue";
export default {
  components:{shareModal},
  data() {
    return {
      pageParams:{},
      member:{},
      userInfo:{},
      statistics:{
        customer:{
          today:{},
          total:{}
        },
        order:{
          today:{},
          total:{}
        }
      },
      modal:{
        share:false
      },
      loading:true,
      level:{
        list:[],
        user:0
      },
      config:{
        mode:1
      },
      form:{}
    }
  },
  computed: {
    /**
     * 可提现金额那一行显不显示
     *
     * 2026-11-08 用户口径：可提现金额为 0 时整行收起。
     * 只认接口回填的 member.money（缺字段/取数失败一律当 0，不凭前端猜）；
     * 它是 v-if 才出的行，骨架屏按 M16 不给灰块、也不预留空位。
     */
    showWithdrawMoney() {
      var money = Number(this.member && this.member.money);
      return !isNaN(money) && money > 0;
    }
  },
  watch: {
  },
  methods: {
    getData() {
      that.getUserInfo();
      var memberJob = that.getMember();
      that.getLevel();
      that.getConfig();

      var totalJob = that.$api('app.agent.member.getMemberTotal', that.form).then(res => {
        if (res.code === 1) {
          that.statistics = res.data;
        }
      });

      // 可提现金额那一行按 member.money 判显隐：金额与统计一起落地才撤骨架屏，
      // 否则先撤骨架、金额后到会让整行迟一步冒出来（硬约束 22：一个加载态盖住多条腿时统一收口）。
      // 下拉刷新也等这一趟全部回音再收条（M4），任何一条失败都不拖住其余。
      Promise.all([
        memberJob.catch(() => null),
        totalJob.catch(() => null)
      ]).then(() => {
        that.loading = false;
        uni.stopPullDownRefresh();
      });
    },

    getConfig() {
      that.$api('app.agent.config.getConfig', that.form).then(res => {
        if (res.code === 1) {
          that.config = res.data;
        }
      });
    },
    getLevel() {
      that.$api('app.agent.level.getLevelList', that.form).then(res => {
        if (res.code === 1) {
          that.level = res.data;
        }
      });
    },
    getMember() {
      // 返回这条请求本身：可提现金额行的显隐要等它落地，getData 拿它和统计一起收口
      return that.$api('app.agent.member.getMember', {}).then(res => {
        if (res.code === 1) {
          that.member = res.data;
        }
      });
    },

    getUserInfo() {
      that.$api('user.info.index', {}).then(res => {
        if (res.code === 1) {
          that.userInfo = res.data;
        }
      });
    },
    getStatus() {
      // loading 只驱动首屏骨架屏：统一由 getData 的统计与成员两条腿一起关闭（早关会露出 0 值），
      // 且此处不置 true，免得 onShow / 下拉刷新重拉时闪骨架屏挡住已渲染内容
      that.$api('app.agent.recruit.getStatus', that.form).then(res => {
        if (res.code === 1 && res.data == 1) {
          that.getData();
        } else {
          that.loading = false;
          uni.stopPullDownRefresh();
          if (res.code === 1) {
            that.$nav.to('/pages/app/agent/member/recruit/recruit','local','redirectTo');
          }
        }
      }).catch(() => {
        that.loading = false;
        uni.stopPullDownRefresh();
      });
    },
    channels(){
      that.$nav.to('/pages/app/channels/center/center');
    },

    //刷新
    refresh() {
      that.getStatus();
    },
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  onShow(){
    that.refresh();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    
    // that.getStatus();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline(){
    return this.$nav.share();
  }
}
</script>