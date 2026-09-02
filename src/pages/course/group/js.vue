<script>
var that;
export default {
  data() {
    return {
      tabsList: [
        {
          name: "全部",
          id: 0,
        },
      ],
      tabbarHeight: 0,
      form: {
        limit: 10,
        page: 1,
        group: 0
      },
      list: [],
      pageParams: {},
      showTabs: false,
      loading: false
    };
  },
  watch: {},
  methods: {
    getData() {

      if(that.showTabs){
        if(!that.form.group){
          that.form.group = that.pageParams.id;
        }
      }else{
        if (that.pageParams.id) {
          that.form.group = that.pageParams.id;
        }
      }

      that.loading = true;

      that.$api("course.course", that.form).then((res) => {
        uni.hideLoading();
        that.loading = false;
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i]);
          }
          that.list = list;
        }
      });
      uni.stopPullDownRefresh();
    },
    getGroup() {
      that.tabsList = [
        { 
          name: "全部",
          id: 0,
        },
      ];
      that.$api("course.group.getList", { parent_id: that.pageParams.id || 0 }).then((res) => {
        if (res.code === 1) {
          that.tabsList = that.tabsList.concat(res.data);
        }
      });
    },

    refresh() {
      that.form.page = 1;
      that.list = [];
      uni.showLoading({
        title: "请稍后",
      });
      that.getData();
    },

    tabsHandle(option) {
      if (this.form.group != option.id) {
        this.form.group = option.id;
        that.refresh();
      }
    },
  },
  onLoad(pageParams) {
    that = this;
    if (pageParams) {
      that.pageParams = that.$nav.parsePageParams(pageParams);
    } else {
      that.pageParams = null;
    }

    uni.getSystemInfo({
      success: function (res) {
        that.titleBarHeight = res.windowTop;
      },
    });
    
    if ((that.pageParams && that.pageParams.tabs == 1) || !that.pageParams.id) {
      that.showTabs = true;
    }
    
    if (that.showTabs) {
      that.getGroup();
    }
    that.refresh();
    
    if (that.pageParams && that.pageParams.name) {
      const decodedName = decodeURIComponent(that.pageParams.name);
      uni.setNavigationBarTitle({
        title: decodedName
      });
    }
  },
  onPullDownRefresh() {
    that.refresh();
  },
  onReachBottom() {
    that.form.page++;
    that.getData();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>