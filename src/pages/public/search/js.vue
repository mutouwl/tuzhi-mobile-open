<script>
var that;
export default {
  data() {
    return {
      form: {
        limit:10,
        page: 1,
        sort:'time',
        type:''
      },
      list: [],
      pageParams:{
        content:''
      },
      modal:{
        timeChange:false,
        type:false
      },
      type:[
        {
          name:'全部',
          key:0,
          type:''
        },
        {
          name:'图文',
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
          name:'练习',
          type:'exercises',
          key:6
        },
        {
          name:'会员卡',
          type:'vipcard',
          key:7
        },
        {
          name:'实物商品',
          type:'physical',
          key:8
        }
      ],
      typeChecked:0,
      loadStatus: 'loadmore',
      hasMore: true,
      loading: false
    }
  },
  watch: {
  },
  methods: {
    sortChange(type){
      this.form.sort = type;
      this.refresh();
    },
    showModel(type){
      this.modal[type] = !this.modal[type]
    },
    typeSelect(option){
      this.typeChecked = option.key;
      this.form.type = option.type;
      this.refresh();
    },
    getData() {
      that.form.searchKey = this.pageParams.content;
      that.loading = true;
      that.loadStatus = 'loading';
      
      that.$api('goods.list', that.form).then(res => {
        that.loading = false;
        uni.stopPullDownRefresh();
        uni.hideLoading();
        
        if (res.code === 1) {
          var list = that.list;
          for (var i in res.data) {
            list.push(res.data[i])
          }
          that.list = list;
          
          if (res.data.length < that.form.limit) {
            that.hasMore = false;
            that.loadStatus = 'nomore';
          } else {
            that.loadStatus = 'loadmore';
          }
        } else {
          that.loadStatus = 'loadmore';
        }
      }).catch(() => {
        that.loading = false;
        that.loadStatus = 'loadmore';
        uni.stopPullDownRefresh();
        uni.hideLoading();
      });
    },

    refresh() {
      that.form.page = 1;
      that.list = [];
      that.hasMore = true;
      that.loadStatus = 'loadmore';
      uni.showLoading({
        title: '加载中'
      });
      that.getData();
    },

    search(){
      this.refresh();
    }

  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    
    uni.showLoading({
      title: '加载中'
    });
    this.getData();
  },
  onPullDownRefresh() {
    that.refresh();
  },
  onReachBottom() {
    if (that.loading || !that.hasMore) return;
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