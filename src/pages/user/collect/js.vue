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
      form: {
        limit: 15,
        page: 1,
        type: 'all'
      },
      list: [],
      tabs: [
        {
          name: '全部',
          type: 'all'
        },
        {
          name: '文章',
          type: 'article'
        },
        {
          name: '视频',
          type: 'video'
        },
        {
          name: '音频',
          type: 'audio'
        },
        {
          name: '专栏',
          type: 'column'
        },
        {
          name: '直播',
          type: 'live'
        }
      ],

      tabsChecked: 'log',
      pageParams:{}
    }
  },
  watch: {
  },
  methods: {

    //tabs切换事件
    tabsChange(option) {
      this.form.type = option.type;
      that.refresh();
    },

    getData() {

      uni.showLoading({
        title: '请稍后'
      });

      that.$api('user.collect.getMyCollect', that.form).then(res => {
        uni.hideLoading();
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i].course)
          }
          that.list = list
        }

        
      });
      uni.stopPullDownRefresh();
    },

    cancel(id,index){
      that.$api('user.collect.setCollect', {
        item_id: id,
        type: 'course'
      }).then(res => {
        if(that.form.page == 1){
          that.refresh()
        }else{
          that.list.splice(index,1)
        }
        
        uni.$u.toast(res.msg);
      });
    },

    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      that.getData();
    },

  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);

    this.getData();
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
}
</script>