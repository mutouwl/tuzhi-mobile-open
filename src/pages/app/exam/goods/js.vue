<script>
var that;
import exercisesControlModal from "../components/exercises-control-modal.vue";
export default {
  components: { exercisesControlModal },
  data() {
    return {
      tabsList: [
        {
          name: "全部",
          id: 0,
        },
      ],
      form: {
        limit: 15,
        page: 1,
        search: "",
        order: "",
        sort: "",
        group_id: 0,
      },
      list: [],

      modal: {
        exercisesControl: false,
      },
      checkExercisesId: 0,
      pageParams: {},
    };
  },
  watch: {},
  methods: {
    getData() {
      uni.showLoading({
        title: "请稍后",
      });

      //资产类型

      that.$api("app.exam.exercises.getGoodsList", that.form).then((res) => {
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

        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },
    //刷新
    refresh() {
      that.form.page = 1;
      that.list = [];
      uni.showLoading({
        title: "请稍后",
      });
      
      that.getData();
    },
    getGroup() {
      that.tabsList = [
        {
          name: "全部",
          id: 0,
        },
      ];
      that.$api("app.exam.exercises.group", {}).then((res) => {
        if (res.code === 1) {
          that.tabsList = that.tabsList.concat(res.data);
        }
      });
    },
    /**
     * tabs被点击
     * @param {*} option
     */
    tabsHandle(option) {
	      if (this.form.group_id != option.id) {
	        this.form.group_id = option.id;
	        that.refresh();
	      } else {
	      }
	    },
	    // 跳转分类浏览页
	    goCategory() {
	      uni.navigateTo({
	        url: '/pages/app/exam/group/group'
	      });
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
	    // 从分类页跳转进来时，设置 group_id 筛选
	    if (that.pageParams.group_id) {
	      that.form.group_id = parseInt(that.pageParams.group_id);
	    }
	    that.refresh();
	    // 无 group_id 时展示一级 tabs
	    if (!that.pageParams.group_id) {
	      this.getGroup();
	    }
	  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>
