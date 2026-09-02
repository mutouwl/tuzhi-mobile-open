<script>
var that;
export default {
  data() {
    return {
      pageParams: {
        url: ''
      },
      type:'',
      content:''

    }
  },
  methods: {
    getData() {
      uni.showLoading({
        title:'加载中……'
      });
      that.$api('common.agreenment', {
        type:that.type
      }).then(res => {
        uni.hideLoading();
        if (res.code === 1) {
          that.content = res.data;
        }else{
          that.content = false;
        }
      });
    },

  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);;
    that.type = that.pageParams.type;

    switch(that.type){
      case 'service':
        uni.setNavigationBarTitle({
        title: '服务协议'
      })
        break;
      case 'privacy':
        uni.setNavigationBarTitle({
        title: '隐私协议'
      })
        break;
        case 'merchant_privacy':
        uni.setNavigationBarTitle({
        title: '商家隐私声明'
      })
        break;
    }
    that.getData();
  }
}
</script>