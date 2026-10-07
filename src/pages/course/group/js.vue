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
      loading: true,
      // 分页状态：hasMore 由「本页是否铺满」判定，loadStatus 供底部 u-loadmore 展示
      hasMore: true,
      loadStatus: 'loadmore',
      // 取数失败（接口 code!=1）时不复用「暂无课程」，避免把后端故障说成没内容
      loadFailed: false
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
      that.loadStatus = 'loading';

      that.$api("course.course", that.form).then((res) => {
        that.loading = false;
        // 下拉刷新指示器要等数据回来再收，否则用户看不出刷新有没有生效
        uni.stopPullDownRefresh();
        if (!res || res.code !== 1) {
          that.loadFailed = true;
          // 失败复位加载行，便于再次上拉重试
          that.loadStatus = that.hasMore ? 'loadmore' : 'nomore';
          return;
        }
        var rows = res.data || [];
        for (var i in rows) {
          that.list.push(rows[i]);
        }
        that.loadFailed = false;
        // 本页没铺满即到底：不再发下一页请求，加载行收掉
        that.hasMore = rows.length >= that.form.limit;
        that.loadStatus = that.hasMore ? 'loadmore' : 'nomore';
      });
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
      that.hasMore = true;
      that.loadStatus = 'loadmore';
      // 不再叠 uni.showLoading：首屏/切页签的加载反馈由骨架屏给（M16），下拉刷新有原生指示器
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
    // 请求在途或已到底不再翻页：翻页期间列表留着、由 u-loadmore 给反馈（M16 不闪骨架）
    if (that.loading || !that.hasMore) return;
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