<script>
var that;
import shareModal from "@/components/modal/share-modal.vue";
export default {
  components: { shareModal },
  data() {
    return {
      
      pageParams: {},
      modal: {},
      loading: true,
      page: 1, // 分页
      form: {
        page: 1,
      },
      list:[]
    };
  },

  watch: {},
  methods: {
    
    getData() {
      that.loading = true;
      that.$api("app.form.log", that.form).then((res) => {
        if (res.code === 1) {
          var list = that.list;

          if (that.form.page == 1) {
            list = [];
          }
          for (var i in res.data) {
            list.push(res.data[i]);
          }
          that.list = list;
        }

        that.loading = false;

        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },

    detail(id){
      uni.navigateTo({
        url:"/pages/app/form/submit/submit?log_id="+id
      })
    },

    //刷新
    refresh() {
      that.list = [];
      that.form.page = 1;
      that.getData();
    },
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  onShow() {
    // that.refresh();
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
    // that.getStatus();

    // this.distributeData(this.allData);
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>
