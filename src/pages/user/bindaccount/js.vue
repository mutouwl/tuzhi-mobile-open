<script>
var that;
import Wechat from '@/common/wechat/wechat'
export default {
  data() {
    return {

    }
  },
  watch: {
  },
  methods: {
    bind() { 
      let wechat = new Wechat();
      wechat.wxOfficialAccountOauth();
    }
  },

  onLoad(pageParams) {
    that = this;
    var path = '/pages/user/index/index';
    if(pageParams.path){
      var path = decodeURIComponent(pageParams.path);
      path = path.replace(/lianjie/g, '&');
      path = path.replace(/\&"/g, '"');
      path = path.replace(/wenhao/g, '?');
      path = path.replace(/\-/g, '/');
      
      path = '/'+path;
      
      console.log("path",path)
    }

    if (pageParams.status) {
      if (pageParams.status == 'true') {
        //重新获取用户ID
        that.$api('user.info.index', {}).then(res => {
          if (res.code === 1) {
            uni.setStorageSync('user_openid', res.data.openid);
            uni.showModal({
              title: '提示',
              content: '成功绑定',
              success: function (res) {
                if(path){
                  that.$nav.to(path,'local','redirectTo')
                }
              }
            });
          }
        });

      } else {
        uni.$u.toast(pageParams.status)
      }
    }
  }
}
</script>