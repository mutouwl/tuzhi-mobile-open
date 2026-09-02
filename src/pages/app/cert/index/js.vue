<script>
var that;
import shareModal from "@/components/modal/share-modal.vue";
export default {
  components: { shareModal },
  data() {
    return {
      current:0,
      pageParams: {},
      tabs: [
        {
          name: "全部",
          type: "all",
        },
        {
          name: "课程证书",
          type: "course",
        },
        {
          name: "考试证书",
          type: "test",
        },
      ],

      tabsChecked: "all",

      modal: {},

      leftList: [],
      rightList: [],
      leftHeight: 0,
      rightHeight: 0,
      loading: false,
      page: 1, // 分页
      form: {
        page: 1,
      },
      list:[]
    };
  },

  watch: {},
  methods: {
    preview(img) {
      uni.previewImage({
        urls: [img],
        longPressActions: {
          itemList: ["发送给朋友", "保存图片", "收藏"],
          success: function (data) {},
          fail: function (err) {
            console.log(err.errMsg);
          },
        },
      });
    },

    //tabs切换事件
    tabsChange(option) {
      that.current = option;
      that.tabsChecked = that.tabs[option].type;
      // this.tabsChecked = option.type;
      this.refresh();
    },
    getData() {
      that.form.type = this.tabsChecked;
      // 首页加载时显示加载状态，翻页时不遮挡页面
      if (that.form.page == 1) {
        that.loading = true;
      }
      that.$api("app.cert.log", that.form).then((res) => {
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
      }).catch(() => {
        that.loading = false;
        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },

    show(id){
      uni.showLoading({
        title: "正在获取"
      });
      that.$api("app.cert.preview", {id:id}).then((res) => {
        if (res.code === 1) {
          that.preview(res.data);
        }

        uni.hideLoading();
      });
    },

    //刷新
    refresh() {
      that.rightList = [];
      that.leftList = [];
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
