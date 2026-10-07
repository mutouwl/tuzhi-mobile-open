<script>
var that;
export default {
  data() {
    return {
      current: 0,
      pageParams: {},
      tabs: [],

      tabsChecked: "all",

      //打卡证书页签随插件安装状态出现（init 接口下发的安装位，模板外判据）
      checkinInstalled: false,

      modal: {},

      leftList: [],
      rightList: [],
      leftHeight: 0,
      rightHeight: 0,
      // 初值给 true：首帧就铺骨架屏，不闪一帧空态（M16）
      loading: true,
      // 元素清单还在取：加载态摆在弹层里那一格海报本体上（M18⑨g 的遮罩档），
      // 「查看」按钮自己不带 loading——点一下就看得到弹层，按钮转圈等于让人多等一屏
      certPending: false,
      page: 1, // 分页
      form: {
        page: 1,
      },
      list: [],

      //证书查看弹层：元素清单由后端 layout 接口下发，前端 canvas 照单出图
      viewerShow: false,
      // 空对象而不是 null：那只组件的 layout prop 契约是对象（canvasW/previewWidth 直接取 .width），
      // 传 null 会在首帧渲染时抛掉整个组件
      certLayout: {},
    };
  },

  watch: {},
  methods: {
    //tabs切换事件（页签形态与订单列表同款 u-tabs，回调签名同 pages/order/list）
    tabChange(tab, index) {
      that.current = tab.index;
      that.tabsChecked = tab.type;
      //换页签＝换一整个数据集：先清掉上一页签的列表，让骨架屏顶上来，
      //否则旧列表要挂到接口回来那一刻，看着像新页签也有一堆证书
      that.list = [];
      that.refresh();
    },

    getData() {
      that.form.type = that.tabsChecked;
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
        } else {
          uni.showToast({ title: (res && res.msg) || "加载失败，请重试", icon: "none" });
        }

        that.loading = false;
        //下拉刷新的收条要等这一趟有回音（M4），否则转圈一闪就没了、看不出刷新结果
        uni.stopPullDownRefresh();
      }).catch(() => {
        that.loading = false;
        uni.stopPullDownRefresh();
        uni.showToast({ title: "加载失败，请重试", icon: "none" });
      });
    },

    //查看证书：取后端算好的元素清单（显示哪些数据/位置/字号/颜色），弹层里前端照单出图
    show(id) {
      // 弹层先开、清单后到：预览那一格从首帧起就是最终尺寸（比例是组件里的画布常数，不读接口），
      // 所以这一段等待由弹层里那层海报本体遮罩来说话，按钮不参与
      that.certLayout = {};
      that.certPending = true;
      that.viewerShow = true;
      that.$api("app.cert.layout", { id: id }).then((res) => {
        if (res.code === 1 && res.data && res.data.elements) {
          that.certLayout = res.data;
          that.certPending = false;
        } else {
          // code=1 但清单为空也算没取到：这一条路没有出图，弹层就地关掉并把原因说出口（M13），
          // 不能留一张盖着遮罩的空白等人自己发现
          that.certPending = false;
          that.viewerShow = false;
          uni.showToast({ title: (res && res.msg) || "证书获取失败，请重试", icon: "none" });
        }
      }).catch(() => {
        that.certPending = false;
        that.viewerShow = false;
        uni.showToast({ title: "证书获取失败，请重试", icon: "none" });
      });
    },

    //刷新
    refresh() {
      that.rightList = [];
      that.leftList = [];
      that.form.page = 1;
      that.getData();
    },

    //页签清单：打卡证书在插件已安装时才出现（口径同管理端编辑页的类型选项）
    buildTabs() {
      that.tabs = [
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
      ];
      if (that.checkinInstalled) {
        that.tabs.push({
          name: "打卡证书",
          type: "checkin",
        });
      }
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

    that.checkinInstalled = !!that.$tools.systemConfig("app_isinstall_checkin");
    that.buildTabs();

    that.refresh();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>
