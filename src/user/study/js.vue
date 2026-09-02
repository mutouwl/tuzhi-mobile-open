<script>
import course from './components/course.vue';
import charts from '@/components/qiun-data-charts/qiun-data-charts/qiun-data-charts.vue';
var that;
export default {
  components: {
    course, charts
  },
  data() {
    return {
      userInfo:{
        createtime:0
      },
      form: {
        limit: 15,
        page: 1
      },
      list: [],
      tabs: [
        {
          name: '学习记录',
          type: 'log'
        },
        {
          name: '学习统计',
          type: 'statistics'
        }
      ],

      timeTabs: ['日', '周', '月'],
      tabsChecked: 'log',
      timeCurrent: 0,
      chartsOpts:{
        color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        
        extra: {
          line: {
            type: "curve",
            width: 2,
            activeType: "hollow",
            linearType: "custom",
            onShadow: true,
            animation: "horizontal"
          }
        }
      },
      chartsDataLine: {
        categories: [],
        series: [
        ]
      },
      statistics: {
        total: {},
        time_total: {}
      },
      pageParams:{},
      days:{
        study_days:0,
        join_days:0
      },
      continuousStudyDays:0
    }
  },
  watch: {
  },
  methods: {


    timeChange(value) {
      that.timeCurrent = value;
      that.getStatistics();
    },
    //tabs切换事件
    tabsChange(option) {
      this.tabsChecked = option.type;
    },


    /**
     * 获取统计
     */
    getStatistics() {
      uni.showLoading({
        title: '请稍后'
      });
      that.$api('study.getStatistics', {
        time: that.timeCurrent
      }).then(res => {
        if (res.code === 1) {
          that.statistics = res.data;

          var chartsDataLine = {
            categories: [],
            series: [
            ]
          }
          var time = {
            name: '学习时长',
            data: []
          };
          var course = {
            name: '学习课程',
            data: []
          };

          for (var i in res.data.log) {
            chartsDataLine.categories.push(i);
            time.data.push(res.data.log[i].time);
            course.data.push(res.data.log[i].course);
          }

          chartsDataLine.series[0] = time;
          chartsDataLine.series[1] = course

          console.log("chartsDataLine",chartsDataLine)
          that.chartsDataLine = chartsDataLine;

        }

        uni.hideLoading();
      });
    },


    getData() {


      uni.showLoading({
        title: '请稍后'
      });

      that.$api('study.getLog', that.form).then(res => {
        if (res.code === 1) {
          var list = that.list;
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
      that.getData();
    },

    
    //获取连续学习天数
    getContinuousStudyDays() {
      that.$api("study.getContinuousStudyDays", {}).then((res) => {
        if (res.code === 1) {
          this.days = res.data;
        }
      });
    },

    getUserData() {
      that.$api("user.info.index", {}).then((res) => {
        if (res.code === 1) {
          that.userInfo = res.data;
        }
      });
    },

  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);


    that.getUserData();
    that.getStatistics();
    that.getContinuousStudyDays();

    uni.getSystemInfo({
      success: function (res) {
        that.titleBarHeight = res.windowTop;
      }
    })
    this.getData();
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  //上划加载
  onReachBottom() {

    if(this.tabsChecked != 'log'){
      return false;
    }

    that.form.page++;
    that.getData();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline(){
    return this.$nav.share();
  }
}
</script>