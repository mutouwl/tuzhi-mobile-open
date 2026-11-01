<script>
// #ifdef MP-TOUTIAO
import i18n from '@/components/language/index.js';
// #endif
var that;
import shareModal from "@/components/modal/share-modal.vue";
// 封面地址这类外部串作 data 的键必过 mpKey（M27/硬约束 25）：只改写点 = 兜底图静默失效
import { mpKey } from '@/common/utils/mp-data-key.js';
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
      // 排序档（筛弹窗里单选）：value = 排序字段 + '_' + 方向，确认时拆回 form.sort/form.order
      sortOptions:[
        {
          name:'时间最新',
          value:'time_desc'
        },
        {
          name:'时间最早',
          value:'time_asc'
        },
        {
          name:'价格最高',
          value:'price_desc'
        },
        {
          name:'价格最低',
          value:'price_asc'
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
        share:false
      },
      // 筛选弹窗（类型 + 排序，tz-filter-popup）
      filterVisible:false,

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
      shareGoodsId:'',
      shareGoodsType:'goods',
      // 分享海报用：被分享这一条商品的整行数据（列表接口已下发 name/cover/price，随 shareGoods 一起存下，不再取一次接口）
      shareGoodsItem:{},
      // 封面加载失败标记（键 = mpKey(地址)）与全站默认商品图（2026-10-29，口径 M65）
      coverErrors:{},
      defaultCover:'/static/image/default-goods.jpg'
    }
  },
  computed: {
    // 类型选项：全站商品类型（含后面按插件追加的几类），'' = 全部
    typeOptions() {
      return this.type.map(item => ({ name: item.name, value: item.type }));
    },
    // 当前排序在弹窗里的取值（sort + 方向）
    sortValue() {
      return this.form.sort + '_' + this.form.order;
    },
    // 筛选是否生效（非「全部类型 + 时间最新」），驱动筛选图标主色
    filterActive() {
      return this.form.type !== '' || this.form.sort !== 'time' || this.form.order !== 'desc';
    }
  },
  watch: {
  },
  methods: {

    /** 图片 `@error` 回调会写到 data 上，入口先过「已销毁」闸门（M26②） */
    gone() {
      return this._isDestroyed === true || this._isBeingDestroyed === true;
    },
    /** 卡片封面真正摆出去的那一张（2026-10-29 用户点名「包括这个页面，图片也要有填充」，口径 M65）：
     *  地址为空或加载失败都换全站默认商品图 `/static/image/default-goods.jpg`
     *  （套餐卡 / 确认报名页 / 规格弹窗 / 分享海报封面同一张，不为兜底新造图）。
     *  失败表按 mpKey(地址) 查——模板看不到模块级 import，所以走方法（M27） */
    coverOf(item) {
      const url = String((item || {}).cover || '');
      if (!url) { return this.defaultCover; }
      return this.coverErrors[mpKey(url)] ? this.defaultCover : url;
    },
    /** 封面加载失败：记下这一张（写点同样过 mpKey） */
    onCoverError(item) {
      if (this.gone()) { return; }
      const url = String((item || {}).cover || '');
      if (url) { this.$set(this.coverErrors, mpKey(url), true); }
    },

    //搜索关键词变更（t-search 的 change 事件带回 {value}）
    onKeywordChange(e){
      that.form.name = (e && e.value) || '';
    },

    //筛选弹窗确认：类型 + 排序一次落回 form，再统一刷新
    onFilterConfirm(e){
      var sort = (e && e.sort) ? e.sort.split('_') : ['time', 'desc'];
      that.form.type = (e && e.type) || '';
      that.form.sort = sort[0] || 'time';
      that.form.order = sort[1] || 'desc';
      that.refresh();
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