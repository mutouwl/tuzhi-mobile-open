<template>
  <!-- 使用 fixed 定位实现全屏遮挡，z-index 设为极高确保在最上层 -->
  <view class="platform-limit-container" v-if="show" @touchmove.stop.prevent>
    <view class="content-box">
      <!-- 标题 -->
      <view class="title">{{ title }}</view>

      <!-- 二维码区域 -->
      <view class="qr-box">
        <!-- 加载中状态 -->
        <view class="loading-state" v-if="loading">
          <u-loading-icon mode="circle" size="40" text="获取二维码中..."></u-loading-icon>
        </view>

        <!-- 二维码图片 -->
        <image
          v-else-if="qrCode"
          :src="qrCode"
          class="qr-img"
          mode="aspectFit"
          :show-menu-by-longpress="true"
        ></image>

        <!-- 错误/无二维码占位 -->
        <view v-else class="error-state">
          <u-icon name="info-circle" size="40" color="#999"></u-icon>
          <text class="error-text">停止观看</text>
        </view>
      </view>

      <!-- 底部提示文字 -->
      <view class="sub-title">
        <text class="text">{{ subTitle }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    // 内容类型：course=课程, test=考试
    type: {
      type: String,
      default: "course",
    },
    // 内容ID
    shareId: {
      type: [Number, String],
      default: 0,
    }
  },
  data() {
    return {
      show: false, // 是否显示全屏遮罩
      loading: false,
      qrCode: "", // 二维码图片地址
      title: "", // 主标题
      subTitle: "", // 副标题
      targetEnv: "", // 目标环境: 'mp' | 'h5' | 'none'
    };
  },
  mounted() {
    this.checkPermissions();
  },
  methods: {
    /**
     * 核心权限检测逻辑
     */
    checkPermissions() {
        this.triggerBlock("h5", "当前内容仅限H5观看", "请使用手机微信扫一扫查看");
        this.fetchQrCode('h5');
    },

    /**
     * 触发拦截显示
     */
    triggerBlock(targetEnv, title, subTitle) {
      this.show = true;
      this.targetEnv = targetEnv;
      this.title = title;
      this.subTitle = subTitle;
      // 隐藏原生导航栏，确保全屏覆盖
      uni.hideTabBar().catch(() => {});
    },

    /**
     * 请求获取小程序码
     * 需要后端提供生成小程序码的接口
     */
    async fetchQrCode(platform) {
      this.loading = true;
      try {
        // TODO: 替换为你实际的接口地址
        // 这里的 page 参数通常是当前内容的详情页路径
        const res = await this.$api("share.getQrcode", {
                type: this.type,
                id: this.shareId,
                platform:platform
            });

        if (res.code === 1) {
          this.qrCode = res.data;
        } else {
          uni.$u.toast(res.msg || "获取二维码失败");
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    }

  }
};
</script>

<style lang="scss" scoped>
.platform-limit-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  z-index: 9999; /* 确保层级最高 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.content-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.title {
  font-size: 36rpx;
  color: #333333;
  font-weight: bold;
  margin-bottom: 60rpx;
  text-align: center;
}

.qr-box {
  width: 400rpx;
  height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
  position: relative;
}

.qr-img {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f8f8f8;
  border-radius: 16rpx;
}

.error-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.sub-title {
  display: flex;
  align-items: center;
  justify-content: center;
}
.sub-title .text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  margin-left: 10rpx;
}
</style>
