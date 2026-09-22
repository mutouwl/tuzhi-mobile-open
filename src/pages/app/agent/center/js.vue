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
  watch: {
  },
  methods: {
    getData() {
      that.getUserInfo();
      that.getMember();
      that.getLevel();
      that.getConfig();
      uni.stopPullDownRefresh();

      that.$api('app.agent.member.getMemberTotal', that.form).then(res => {
        that.loading = false;
        if (res.code === 1) {
          that.statistics = res.data;
        }

      }).catch(() => {
        // 请求失败也要撤掉首屏骨架屏，否则页面一直停在占位态
        that.loading = false;
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
      that.$api('app.agent.member.getMember', {}).then(res => {
        if (res.code === 1) {
          that.member = res.data;
        }
      });
      uni.stopPullDownRefresh();
    },

    getUserInfo() {
      that.$api('user.info.index', {}).then(res => {
        if (res.code === 1) {
          that.userInfo = res.data;
        }
      });
    },
    getStatus() {
      // loading 只驱动首屏骨架屏：统一由 getData 的统计接口关闭（早关会露出 0 值），且此处不置 true，
      // 免得 onShow / 下拉刷新重拉时闪骨架屏挡住已渲染内容
      that.$api('app.agent.recruit.getStatus', that.form).then(res => {
        if (res.code === 1 && res.data == 1) {
          that.getData();
        } else {
          that.loading = false;
          if (res.code === 1) {
            that.$nav.to('/pages/app/agent/member/recruit/recruit','local','redirectTo');
          }
        }
      }).catch(() => {
        that.loading = false;
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