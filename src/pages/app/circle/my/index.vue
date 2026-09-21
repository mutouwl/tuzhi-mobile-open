<template>
  <view class="my-circle">
    <!-- 加载骨架屏：与 tz-circle mini 卡片同构 -->
    <view v-if="loading" class="list">
      <view class="sk-card" v-for="i in 4" :key="i">
        <view class="sk-cover"></view>
        <view class="sk-info">
          <view class="sk-line sk-w-40"></view>
          <view class="sk-line sk-w-30"></view>
        </view>
        <view class="sk-btn"></view>
      </view>
    </view>

    <view v-else class="list">
      <!-- 复用 DIY 通用圈子组件（mini 紧凑横排，与课程详情圈子 tab 一致）；有效期/已过期/续费由组件成员模式（is_expired/expire_text）渲染 -->
      <tz-circle :list="list" type="mini" :margin="0" :round="1" />
    </view>

    <u-empty v-if="!loading && !list.length" :text="loadMsg || '还没有加入任何圈子'" icon="/static/image/empty.png" width="70" height="70" margin-top="120"></u-empty>

    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script>
var that;

export default {
  data() {
    return {
      loading: true,
      loadMsg: '',
      list: [],
      page: 1,
      total: 0,
    };
  },
  onLoad() {
    that = this;
    // 圈子插件未安装时兜底
    if (!that.$tools.systemConfig("app_isinstall_circle")) {
      uni.showToast({ title: "圈子功能未安装", icon: "none" });
      setTimeout(() => uni.navigateBack(), 1200);
      return;
    }
    that.load();
  },
  onPullDownRefresh() {
    that.page = 1;
    that.list = [];
    that.load();
  },
  onReachBottom() {
    if (that.list.length < that.total) {
      that.page++;
      that.load();
    }
  },
  methods: {
    async load() {
      const res = await that.$api('circle.circle.index', { page: that.page, limit: 10 });
      uni.stopPullDownRefresh();
      that.loadMsg = '';
      if (res.code === 1) {
        that.list = that.list.concat(res.data.rows || []);
        that.total = res.data.total || 0;
        that.loading = false;
      } else {
        that.loadMsg = res.msg || '加载失败';
        that.loading = false;
        uni.showToast({ title: that.loadMsg, icon: 'none' });
      }
    }
  }
};
</script>

<style>
.my-circle {
  min-height: 100vh;
  background: #f7f8fa;
}
.list {
  padding: 12px;
}
/* 加载骨架屏：与 tz-circle mini 卡片同构（封面 110x80 + 名称/有效期两行 + 右侧按钮） */
.sk-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 10px;
  padding: 0;
  height: 80px;
  margin-bottom: 8px;
  overflow: hidden;
}
.sk-cover {
  flex: none;
  width: 110px;
  height: 100%;
  background: linear-gradient(90deg, #f1f2f4 25%, #e6e6e6 37%, #f1f2f4 50%);
  background-size: 400% 100%;
  animation: sk-animate 1.8s ease infinite;
}
.sk-info {
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  padding-right: 70px;
}
.sk-btn {
  flex: none;
  width: 52px;
  height: 24px;
  border-radius: 12px;
  margin-left: -52px;
  background: linear-gradient(90deg, #f1f2f4 25%, #e6e6e6 37%, #f1f2f4 50%);
  background-size: 400% 100%;
  animation: sk-animate 1.8s ease infinite;
}
.sk-line {
  height: 15px;
  border-radius: 3px;
  margin-top: 10px;
  background: linear-gradient(90deg, #f1f2f4 25%, #e6e6e6 37%, #f1f2f4 50%);
  background-size: 400% 100%;
  animation: sk-animate 1.8s ease infinite;
}
.sk-info .sk-line:first-child {
  margin-top: 0;
}
.sk-w-40 {
  width: 40%;
}
.sk-w-30 {
  width: 30%;
}
@keyframes sk-animate {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>