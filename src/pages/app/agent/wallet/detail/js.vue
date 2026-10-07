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
      // 首屏即为加载态：流水列表区先铺骨架屏（M16），本次请求回音后才撤
      loading: true,
      pageParams:{
        type:'money'
      },
      modal:{
        time:false,
        mode:false
      },

      userInfo:{},

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
      
      //资产类型
      var form = JSON.parse(JSON.stringify(that.form));
      form.type = that.pageParams.type;
      form.time = Math.round(that.form.time/1000);

      that.$api('app.agent.wallet.getMoneyLog', form).then(res => {
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list
        }
        that.loading = false;
      }).catch(() => {
        // 请求失败也要撤掉骨架屏，否则页面一直停在占位态（与分销中心页同一口径）
        that.loading = false;
      });
      uni.stopPullDownRefresh();
    },

    //刷新
    refresh() {
      that.form.page = 1
      that.list = [];
      // 换月份/类型会清空列表，loading 置回 true 才不换成一帧空态（M16）
      that.loading = true;
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
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline(){
    return this.$nav.share();
  }
}
</script>