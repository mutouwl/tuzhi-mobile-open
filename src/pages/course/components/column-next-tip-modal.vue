<template>
  <div>
    <u-popup
      :show="isShow"
      title="你已学完当前课程"
      @close="close"
      mode="center"
      :closeable="true"
      :safeAreaInsetBottom="false"
      :round="10"
    >
      <view class="popup-content">
        <view class="countdown-tip"> {{ countdown }}s将自动跳转下一课程 </view>
        <view class="video-info">
          <span class="type">[{{ $t(course.type) }}]</span>
          <text>{{ course.name }}{{ course.name }}{{ course.name }}</text>
        </view>
        <u-button class="next-btn" type="primary" @click="handleNext">下一节</u-button>
        <view class="skip-btn" @click="close">暂不跳转</view>
      </view>
    </u-popup>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isShow: false,
      countdown: 5,
      timer: null, // 定时器实例
    };
  },
  watch: {
    visible() {
      this.isShow = this.visible;

      if (this.isShow) {
        this.startCountdown(); // 弹窗显示时启动定时器
      } else {
        this.clearTimer(); // 弹窗隐藏时清除定时器
      }
    },
  },
  props: {
    visible: {
      type: [Boolean, Number],
      default: false,
    },
    course: {
      type: Object,
      default: false,
    },
  },
  created() {
    this.isShow = this.visible;
    if (this.isShow) {
      this.startCountdown(); // 弹窗显示时启动定时器
    } else {
      this.clearTimer(); // 弹窗隐藏时清除定时器
    }
  },

  methods: {
    // 启动倒计时
    startCountdown() {
      this.countdown = 5;
      this.clearTimer(); // 先清除旧定时器，防止重复执行

      this.timer = setInterval(() => {
        this.countdown--;

        if (this.countdown <= 0) {
          this.handleNext(); // 倒计时结束，执行跳转
        }
      }, 1000);
    },

    // 清除定时器
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null; // 重置定时器实例为 null
      }
    },

    // 点击“下一节”跳转
    handleNext() {
      this.clearTimer(); // 跳转前清除定时器
      //   this.visible = false;
      this.$emit("close", false);

      var path =
        "/pages/course/detail/detail?id=" +
        this.course.id +
        "&column_id=" +
        this.course.column_id;
      this.$nav.to(path, "local");
      // 示例：跳转到下一任务页面（根据实际需求修改路由）
      //   uni.navigateTo({
      //     url: "/pages/nextTask/nextTask",
      //   });
    },

    // 点击“暂不跳转”关闭弹窗
    close() {
      this.clearTimer(); // 关闭弹窗时清除定时器
      this.$emit("close", false);
      //   this.visible = false;
    },
  },

  // 组件销毁时强制清除定时器（关键！）
  beforeDestroy() {
    this.clearTimer();
  },
};
</script>

<style scoped>
/* 样式部分已将 rpx 改为 px */
.popup-content {
  /* width: 80%; */
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
}
.countdown-tip {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}
.video-info {
  display: flex;
  align-items: center;
  margin-bottom: 40px;

  max-width: 240px;
}
.video-info .type {
  font-size: 12px;
  color: #86909c;
  
  /* font-weight: 500; */
}
.video-info text {
    flex: 1;
  font-size: 14px;
  overflow: hidden; /* 超出部分隐藏 */
  white-space: nowrap; /* 不换行 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
  display: inline-block; /* 必须是块级或行内块级元素 */
  min-width: 0; /* flex布局下必加，允许被压缩 */
}
.next-btn {
  max-width: 100px;
  margin-bottom: 20px;
}
.skip-btn {
  font-size: 12px;
  color: #666;
  margin-top: 20px;
}
</style>
