<script>
var that;
export default {
  data() {
    return {
      pageParams: {
        url: ''
      },
      link:''

    }
  },
  methods: {
    error(){
      uni.$u.toast("页面加载错误,请稍后重试");
      that.$nav.back();

    }
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);;
    that.link = that.pageParams.url;
  }
}
</script>