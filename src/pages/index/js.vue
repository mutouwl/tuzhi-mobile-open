<script>
var that;
export default {
  data() {
    return {
      pageParams: {
        id: 0,
      },
      data: {
        page: {},
      },
      pageNull: false,
      loading: false,
      circleList: [],
      circlePostList: [],
      circleInstalled: false,
    };
  },
  watch: {},
  methods: {
    getData() {
      that.loading = true;
      that
        .$api("page.decorate.getPage", {
          id: that.pageParams.id,
        })
        .then((res) => {
          that.loading = false;
          uni.stopPullDownRefresh();
          if (res.code == 1) {
            this.pageNull = false;
            that.data = res.data;
            uni.setNavigationBarTitle({
              title: res.data.page.name,
            });

            if (res.data.default_page == 1 || res.data.type == "index") {
              uni.setStorageSync("index_id", res.data.id);
            }

            that.loadCircleComponents(res.data.compontents || []);

            // #ifdef H5
            this.$nav.share(res.data.page.name);
            // #endif
          } else {
            this.pageNull = true;
          }
        })
        .catch((err) => {
          that.loading = false;
          uni.stopPullDownRefresh();
        });
    },

    // 加载圈子类组件数据（插件未安装时跳过，组件不渲染）
    async loadCircleComponents(compontents) {
      that.circleInstalled = !!that.$tools.systemConfig("app_isinstall_circle");
      if (!that.circleInstalled) {
        return;
      }
      for (const item of compontents) {
        if (!item || !item.type) {
          continue;
        }
        if (item.type == "circle") {
          const config = item.config || {};
          const source = config.source || "auto";
          if (source == "manual" && config.list && config.list.length) {
            const ids = config.list.map(c => c.id).join(',');
            const res = await that.$api("circle.circle.goodsList", { ids });
            if (res.code == 1) {
              that.circleList = res.data || [];
            }
          } else {
            const res = await that.$api("circle.circle.goodsList", { limit: config.maxShowNum || 6 });
            if (res.code == 1) {
              that.circleList = res.data || [];
            }
          }
        }
        if (item.type == "circle_post") {
          const config = item.config || {};
          if (config.circleId) {
            const res = await that.$api("circle.post.previewList", {
              circle_id: config.circleId,
              tab: config.postType || "all",
              limit: config.maxShowNum || 5,
            });
            if (res.code == 1) {
              that.circlePostList = res.data || [];
            }
          }
        }
      }
    },

    // 自定义页圈子动态卡片点击：进入动态详情（与圈子主页 goDetail 一致，详情页按 id 加载）
    goPostDetail(post) {
      if (!post || !post.id) return;
      that.$nav.to('/pages/app/circle/post/detail?id=' + post.id);
    },

    //刷新
    refresh() {
      that.getData();
    },
  },
  onShow() {
    // 获取当前页面的路由信息

    // #ifdef MP-WEIXIN || MP-TOUTIAO
    let pages = getCurrentPages(); //获取加载的页面
    let currentPage = pages[pages.length - 1]; //获取当前页面的对象
    var path = currentPage.$page.fullPath;
    // #endif

    // #ifdef H5
    const path = window.location.hash;
    // #endif

    const keyword = "id=";
    const index = path.indexOf(keyword);
    if (index !== -1) {
      that.pageParams.id = path.substring(index + keyword.length);
    } else {
      that.pageParams.id = "";
    }


    this.getData();
    if (this.$refs.hasOwnProperty("tabbar")) {
      this.$refs["tabbar"].refresh();
    }
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  //上划加载
  onReachBottom() {
    return false;
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>
