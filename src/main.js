import Vue from 'vue'
import App from './App'

// TDesign 样式
import '@/common/tdesign-theme.css';



import api from '@/common/request/index';
import request from '@/common/request/request';
import tools from '@/common/utils/tools';
import nav from '@/common/utils/router';



Vue.config.productionTip = false
Vue.config.devtools = true
Vue.prototype.$api = api;
Vue.prototype.$request = request;
Vue.prototype.$tools = tools;
Vue.prototype.$nav = nav;

// #ifdef MP-TOUTIAO
import CN from '@/components/language/zh-CN.js'
Vue.prototype.$t = function(key){
  return CN[key];
}
// #endif

// #ifdef MP-WEIXIN || MP-TOUTIAO
Vue.prototype.$titleBarHeight = 0;
// #endif
// #ifdef H5
Vue.prototype.$titleBarHeight = 40;
setTimeout(function(){
  uni.getSystemInfo({
    success: function (res) {
      Vue.prototype.$titleBarHeight = res.windowTop;
    }
  })
},1000)
// #endif



App.mpType = 'app'

function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}

uni.addInterceptor({
  returnValue(res) {
    if (!isPromise(res)) {
      return res;
    }
    return new Promise((resolve, reject) => {
      res.then((res) => {
        if (res[0]) {
          reject(res[0]);
        } else {
          resolve(res[1]);
        }
      });
    });
  },
});


// import uView from 'uview-ui';
import uView from '@/components/uview-ui/index.js';
Vue.use(uView);

uni.$u.setConfig({
    // 修改$u.config对象的属性
    config: {
        // 修改默认单位为rpx，相当于执行 uni.$u.config.unit = 'rpx'
        unit: 'px'
    },
    // 修改$u.props对象的属性
    props: {
        tabs:{
            lineColor:"#0968f6",
            inactiveStyle: {
              color:"#999",
              fontWeight:400
            }
        },
        // switch:{
        //     activeColor:"#0052d9"
        // },
        // checkbox:{
        //     activeColor:"#0052d9",  
        // },
        // line:{
        //     color:"#F0F3F5"
        // }
        // 修改radio组件的size参数的默认值，相当于执行 uni.$u.props.radio.size = 30
        // radio: {
        //     size: 15
        // }
        // 其他组件属性配置
        // ......
    }
})


//绑定手机号全局组件
import bindMobileModal from "@/components/modal/bind-mobile.vue";
Vue.component('bindMobileModal', bindMobileModal)

import i18n from '@/components/language/index.js';
const app = new Vue({
  i18n,
  ...App
})

// #ifdef H5
import wxsdk from '@/common/wechat/sdk'
Vue.prototype.$wxsdk = wxsdk;

/**
 * 微信 H5 全局分享兜底：每个页面 onShow 先设置默认分享（系统名 + 系统 logo + 引导文案），
 * 保证固定页面/列表页分享卡片也有图片与文案；详情页数据加载完成后用内容标题/封面覆盖。
 * mixins 钩子先于页面自身钩子执行，页面 onShow 自定义分享不冲突；
 * sdk 签名按 URL 缓存，页面切换不再重复请求 jssdk 接口。
 */
Vue.mixin({
	onShow() {
		if (this.$wxsdk && this.$nav && this.$wxsdk.isWechat()) {
			this.$nav.share();
		}
	}
});
// #endif
app.$mount();