<script>
var that;
export default {
  data() {
    return {
      form: {
        limit:15,
        page: 1,
        time:Number(new Date()),
        mode:0 //0全部 1支出 2收入
      },
      list: [],
      loading: true,
      pageParams:{
        type:'money'
      },
      modal:{
        time:false,
        mode:false
      },

      userInfo:{},
      // 余额接口是否已返回（成功或失败）：未返回前余额位展示占位条，避免首屏只剩「可用余额」标签
      userInfoLoaded:false,

      modeList:[
        {
          name:'全部',
          key:0
        },
        {
          name:'支出',
          key:1
        },
        {
          name:'收入',
          key:2
        }
      ],
      typeChecked:0
    }
  },
  watch: {
  },
  methods: {


    //时间
    confirmTime(time){
      
      that.showModel('time')

      if(time != that.form.time){
        that.form.time = time.value;
        that.refresh();
      }
      
    },

    showModel(type){
      // this.form.mode = type
      this.modal[type] = !this.modal[type]
    },

    modeSelect(option){
      this.form.mode = option.key;
      that.refresh();
    },

    getData() {
      that.loading = true;
      // 首屏（列表为空）由骨架屏给反馈，不再叠加原生 loading；上拉翻页时已有流水还在屏上，用「请稍后」提示
      var loadingTip = that.list.length > 0;
      if (loadingTip) {
        uni.showLoading({
          title: '请稍后'
        });
      }
      that.getUserInfo();
      //资产类型
      var form = JSON.parse(JSON.stringify(that.form));
      form.type = that.pageParams.type;
      form.time = Math.round(that.form.time/1000);

      that.$api('user.assets.getAssetsLog', form).then(res => {
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list
        }

        if (loadingTip) {
          uni.hideLoading();
        }
        that.loading = false;
      }).catch(() => {
        that.loading = false;
        if (loadingTip) {
          uni.hideLoading();
        }
      });
      uni.stopPullDownRefresh();
    },

    getUserInfo(){
      that.$api('user.info.index', {}).then(res => {
        if (res.code === 1) {
          that.userInfo = res.data;
        }
        that.userInfoLoaded = true;
      }).catch(() => {
        // 失败同样退出占位态：否则余额位一直闪灰块
        that.userInfoLoaded = true;
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