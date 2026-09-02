<script>
var that;
import evaluate from '@/components/comment/evaluate.vue';
export default {
  components: { evaluate },
  data() {
    return {
      tabs: [
        {
          name: '全部',
          type: ''
        },
        {
          name: '好评',
          type: 'good'
        },
        {
          name: '差评',
          type: 'bad'
        },
        {
          name: '有图',
          type: 'img'
        }
      ],
      form: {
        limit: 10,
        page: 1,
        item_id: 0,
        status: ''
      },
      list: [],
      pageParams: {}
    }
  },
  watch: {
  },
  methods: {
    getData() {

      uni.showLoading({
        title:'加载中…'
      })
      that.$api('order.evaluate.list', that.form).then(res => {
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list
        }
        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },

    //状态被切换
    tabChange(tab) {
      that.form.status = tab.type;
      that.refresh();
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

    that.form.item_id = pageParams.item_id;
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
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline(){
    return this.$nav.share();
  }
}
</script>