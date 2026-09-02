<script>
var that;
import exercisesControlModal from "../components/exercises-control-modal.vue";
export default {
  components: { exercisesControlModal },
  data() {
    return {
      form: {
        limit: 15,
        page: 1,
        search: '',
        order: '',
        sort: ''
      },
      list: [],
      actionList: [
        {
          name: '新练习',
          index: 'new',
          fontSize: 14
        },
        {
          name: '错题本',
          index: 'new',
          fontSize: 14
        },
        {
          name: '练习记录',
          index: 'new',
          fontSize: 14
        },
        {
          name: '收藏题目',
          index: 'new',
          fontSize: 14
        },
        {
          name: '练习详情',
          index: 'new',
          fontSize: 14
        }
      ],
      modal: {
        exercisesControl: false
      },
      checkExercisesId:0,
      pageParams:{}
    }
  },
  watch: {
  },
  methods: {

    getData() {
      uni.showLoading({
        title: '请稍后'
      });

      //资产类型

      that.$api('app.exam.exercises.getSubscribeList', that.form).then(res => {
        if (res.code === 1) {
          var list = that.list;

          if (that.form.page == 1) {
            list = [];
          }
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list;
        }

        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },
    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      uni.showLoading({
        title: '请稍后'
      });
      that.getData();
    },
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  //上划加载
  onReachBottom() {
    that.form.page++;
    that.getData();
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    that.refresh();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>