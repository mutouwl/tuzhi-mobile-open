<script>
// #ifdef MP-TOUTIAO
import i18n from '@/components/language/index.js';
// #endif
var that;
import shareModal from "@/components/modal/share-modal.vue";
export default {
// #ifdef MP-TOUTIAO
    i18n,
    // #endif
  components:{shareModal},
  data() {
    return {
      form: {
        limit:15,
        page: 1,
        type:'',
        name:'',
        sort:'time',
        order:'desc'
      },
      sortType:[
        {
          type:'time',
          name:'时间'
        },
        {
          type:'price',
          name:'价格'
        }
      ],
      list: [],
      pageParams:{
        type:'money'
      },
      modal:{
        time:false,
        mode:false,
        type:false,
        share:false
      },

      userInfo:{},

      type:[
        {
          name:'全部',
          key:0,
          type:''
        },
        {
          name:'文章',
          type:'article',
          key:1
        },
        {
          name:'视频',
          type:'video',
          key:2
        },
        {
          name:'音频',
          type:'audio',
          key:3
        },
        {
          name:'专栏',
          type:'column',
          key:4
        },
        {
          name:'活动',
          type:'activity',
          key:5
        },
        {
          name:'考试练习',
          type:'exercises',
          key:6
        },
        {
          name:'会员卡',
          type:'vipcard',
          key:7
        }
      ],
      typeChecked:0,
      shareGoodsId:'',
      shareGoodsType:'goods'
    }
  },
  watch: {
  },
  methods: {

    //类型被切换
    typeSelect(option){
      this.typeChecked = option.key;
      this.form.type = option.type;
      this.refresh();
    },

    //调整排序
    changeSort(type){
      if(type == this.form.sort){
        this.form.order = this.form.order == 'desc' ? 'asc' : 'desc';
      }else{
        this.form.order = 'desc';
        this.form.sort = type;
      }
      this.refresh();
    },

    shareGoods(id,type){
        if(type == 'article' || type == 'column' || type == 'video' || type == 'audio' || type == 'live'){
          type = 'goods';
        }
        this.shareGoodsId = id;
        this.shareGoodsType = type;
        this.showModel('share');
    },
    showModel(type){
      // this.form.mode = type
      this.modal[type] = !this.modal[type]
    },

    getData() {
      
      uni.showLoading({
        title: '请稍后'
      });
      //资产类型
      var form = JSON.parse(JSON.stringify(that.form));
      // form.type = that.pageParams.type;
      // form.time = Math.round(that.form.time/1000);

      that.$api('app.agent.goods.getGoodsList', form).then(res => {
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

    // 仅当 composite 插件已安装时，添加“组合商品”筛选项
    if (that.$tools.systemConfig('app_isinstall_composite')) {
      that.type.push({
        name: '组合商品',
        type: 'composite',
        key: that.type.length
      });
    }

    // 仅当 circle（圈子）付费插件已安装时，添加“圈子”筛选项
    if (that.$tools.systemConfig('app_isinstall_circle')) {
      that.type.push({
        name: '圈子',
        type: 'circle',
        key: that.type.length
      });
    }

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