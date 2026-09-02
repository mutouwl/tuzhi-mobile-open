<template>
  <u-popup 
    :show="show" 
    @close="close" 
    @open="open" 
    mode="bottom" 
    :closeable="false" 
    :round="10"
    :overlayStyle="{ zIndex: 12100 }"
    :zIndex="12110"
  >
    <view class="detail-popup-content">
      <view class="popup-header">
        <view class="popup-title">详情</view>
        <view class="header-actions">
          <!-- <view class="back-btn" @click="goBack">
            <text>回退</text>
          </view> -->
          <view class="fullscreen-btn" @click="openFullscreen">
            <tz-icon name="link" color="#0968f6" :size="16" />
            <text>全屏</text>
          </view>
          <view class="close-btn" @click="close">
            <tz-icon name="close" color="#666" :size="20" />
          </view>
        </view>
      </view>
      <iframe 
        v-if="url" 
        :src="url" 
        class="detail-iframe"
        frameborder="0"
        @load="onIframeLoad"
      ></iframe>
    </view>
  </u-popup>
</template>

<script>
export default {
  name: 'DetailPopup',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    },
    whitelist: {
      type: Array,
      default: () => [
        '/pages/course/detail/detail',
        '/pages/app/physical/detail/detail',
        '/pages/app/activity/detail/detail',
        '/pages/order/submit/submit',
        '/pages/app/activity/user/user',
        '/pages/app/activity/submit/submit',
        '/pages/app/vip/center/center',
        '/pages/public/result',
        '/pages/app/activity/ticket/ticket',
        '/pages/app/activity/form/form',
        '/pages/order/detail/detail',
        '/pages/user/address/list/list',
        '/pages/user/address/edit/edit',
        '/pages/app/exam/detail/detail',
        '/pages/order/express/log/log',
        '/pages/app/composite/detail/detail'
      ]
    }
  },
  data() {
    return {
      iframeCheckTimer: null,
      lastIframePath: ''
    };
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.startIframeCheck();
      } else {
        this.stopIframeCheck();
      }
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    
    open() {
      this.$emit('open');
    },
    
    goBack() {
      try {
        const iframe = document.querySelector('.detail-iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.history.back();
        }
      } catch (e) {
      }
    },
    openFullscreen() {
      try {
        const iframe = document.querySelector('.detail-iframe');
        if (iframe && iframe.contentWindow) {
          let currentUrl = iframe.contentWindow.location.href;
          let navigateUrl = this.extractPathWithQuery(currentUrl);
          
          this.$nav.to(navigateUrl);
        }
      } catch (e) {
        if (this.url) {
          let navigateUrl = this.url;
          if (navigateUrl.startsWith('/#/')) {
            navigateUrl = navigateUrl.substring(2);
          }
          this.$nav.to(navigateUrl);
        }
      }
    },
    
    onIframeLoad() {
      this.checkIframePath();
    },
    
    startIframeCheck() {
      this.stopIframeCheck();
      this.iframeCheckTimer = setInterval(() => {
        this.checkIframePath();
      }, 500);
    },
    
    stopIframeCheck() {
      if (this.iframeCheckTimer) {
        clearInterval(this.iframeCheckTimer);
        this.iframeCheckTimer = null;
      }
    },
    
    checkIframePath() {
      try {
        const iframe = document.querySelector('.detail-iframe');
        if (iframe && iframe.contentWindow) {
          const currentHref = iframe.contentWindow.location.href;
          // iframe 初始加载或重置时 href 可能是 about:blank，需跳过，避免误触发跳转
          if (!currentHref || currentHref === 'about:blank') {
            return;
          }
          const currentPath = this.extractPathFromUrl(currentHref);
          if (!currentPath) {
            return;
          }

          if (currentPath !== this.lastIframePath) {
            this.lastIframePath = currentPath;

            if (!this.isInWhitelist(currentPath)) {
              this.closeDetailAndNavigate(currentHref);
            }
          }
        }
      } catch (e) {
      }
    },
    
    extractPathFromUrl(url) {
      try {
        if (!url || url === 'about:blank') {
          return '';
        }
        const urlObj = new URL(url);
        let path = urlObj.pathname;

        if (urlObj.hash) {
          path = urlObj.hash.substring(1);
        }

        const queryIndex = path.indexOf('?');
        if (queryIndex !== -1) {
          path = path.substring(0, queryIndex);
        }

        return path;
      } catch (e) {
        return '';
      }
    },
    
    extractPathWithQuery(url) {
      try {
        const urlObj = new URL(url);
        let path = urlObj.pathname;
        
        if (urlObj.hash) {
          path = urlObj.hash.substring(1);
        }
        
        return path;
      } catch (e) {
        return '';
      }
    },
    
    isInWhitelist(path) {
      return this.whitelist.some(whitelistPath => path.startsWith(whitelistPath));
    },
    
    closeDetailAndNavigate(url) {
      this.$emit('navigate', url);
    }
  },
  
  beforeDestroy() {
    this.stopIframeCheck();
  }
};
</script>

<style scoped>
.detail-popup-content {
  width: 100%;
  height: 90vh;
  background-color: #fff;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  position: relative;
}

.popup-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  z-index: 10;
}

.popup-title {
  width: 100%;
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  text-align: left;
  font-weight: 500;
  color: #1d2129;
  padding-left: 15px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  cursor: pointer;
  margin-right: 8px;
}

.back-btn text {
  font-size: 14px;
  color: #0968f6;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-right: 12px;
}

.fullscreen-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: #fff;
  border-radius: 16px;
  cursor: pointer;
  margin-right: 12px;
}

.back-btn text,.fullscreen-btn text {
  font-size: 12px;
  color: #0968f6;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #fff;
  border-radius: 50%;
  cursor: pointer;
}

.detail-iframe {
  width: 100%;
  height: 100%;
  border: none;
  padding-top: 50px;
  box-sizing: border-box;
}
</style>
