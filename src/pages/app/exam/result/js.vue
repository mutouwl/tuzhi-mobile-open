<script>
var that;
import questionBox from "@/pages/app/exam/components/question-box.vue";
export default {
  components: { questionBox },
  data() {
    return {
      data: {},
      pageParams:{}
    }
  },
  watch: {
  },
  methods: {

    //获取练习详情
    getData() {
      uni.showLoading({
        title: '请稍后'
      });

      that.$api('app.exam.exercises.result', {
        id: that.pageParams.id,
      }).then(res => {
        if (res.code === 1) {
          that.data = res.data;
        } else {
        }
        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },

    analysis() {
      that.$nav.to('/pages/app/exam/work/work?id=' + that.pageParams.id,'local', 'redirectTo')
    },

    buildWork() {
      //创建练习
      that.$api('app.exam.exercises.buildLog', {
        id: that.data.exercises_id,
      }).then(res => {
        if (res.code === 1) {
          that.$nav.to('/pages/app/exam/work/work?id=' + res.data,'local', 'redirectTo')
        }
      });
    },

    changeOption() {
      // 结果页无需处理选项变更
    }



  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    that.getData();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>