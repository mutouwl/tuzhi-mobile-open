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
      
      uni.showLoading({
        title: '请稍后'
      });
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

        uni.hideLoading();
      });
      uni.stopPullDownRefresh();
    },

    getUserInfo(){
      that.$api('user.info.index', {}).then(res => {
        if (res.code === 1) {
          that.userInfo = res.data;
        }
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