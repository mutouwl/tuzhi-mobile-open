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
      // 首屏即为加载态：商品列表区先铺骨架屏（M16），本次请求回音后才撤
      loading: true,
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
      shareGoodsType:'goods',
      // 分享海报用：被分享这一条商品的整行数据（列表接口已下发 name/cover/price，随 shareGoods 一起存下，不再取一次接口）
      shareGoodsItem:{}
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

    shareGoods(id,type,item){
        if(type == 'article' || type == 'column' || type == 'video' || type == 'audio' || type == 'live'){
          type = 'goods';
        }
        this.shareGoodsId = id;
        this.shareGoodsType = type;
        // 分享海报用：把整行留在 data 上（列表接口已下发 name/cover/price，不用再取一次接口）
        this.shareGoodsItem = item || {};
        this.showModel('share');
    },
    showModel(type){
      // this.form.mode = type
      this.modal[type] = !this.modal[type]
    },

    getData() {
      
      //资产类型
      var form = JSON.parse(JSON.stringify(that.form));
      // form.type = that.pageParams.type;
      // form.time = Math.round(that.form.time/1000);

      that.$api('app.agent.goods.getGoodsList', form).then(res => {
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            var item = res.data[i];
            // 课程套餐的佣金按售卖规格配置，推广落地页是套餐详情，跳转与分享取套餐 ID
            item.link_id = item.type == 'school_package' ? (item.package_id || item.id) : item.id;
            list.push(item)
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
      // 搜索/类型/排序会清空列表，loading 置回 true 才不换成一帧空态（M16）
      that.loading = true;
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

    // 仅当 school（教务）付费插件已安装时，添加“课程套餐”筛选项
    if (that.$tools.systemConfig('app_isinstall_school')) {
      that.type.push({
        name: '课程套餐',
        type: 'school_package',
        key: that.type.length
      });
    }

    // 仅当 checkin（打卡）付费插件已安装时，添加“打卡活动”筛选项
    if (that.$tools.systemConfig('app_isinstall_checkin')) {
      that.type.push({
        name: '打卡活动',
        type: 'checkin',
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