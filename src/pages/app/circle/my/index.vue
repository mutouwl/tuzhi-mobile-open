<template>
  <view class="my-circle">
    <!-- 首屏骨架屏（M16）：版式存在 tz-circle 组件里（:skeleton 那一档），页面不抄一份卡尺寸；
         原来这份手写流光是裸名且非 scoped，与全站其它页面的 .sk-card/.sk-line 互相覆盖。 -->
    <view v-if="loading" class="list">
      <tz-circle :skeleton="true" type="mini" :margin="0" :round="1" :skeleton-count="4" />
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
      that.loading = false; // 兜底分支也要撤骨架：这一页只弹一句 toast 就留在灰块上，看着像「一直加载中」
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
      try {
        const res = await that.$api('circle.circle.index', { page: that.page, limit: 10 });
        uni.stopPullDownRefresh();
        that.loadMsg = '';
        // 判 code 之前先判 res 在不在：request.js 对 HTTP 500 是 resolve(response.data)，
        // 空体会把 undefined 交上来，res.code 直接抛进未处理的 rejection ⇒ loading 永久不撤
        if (res && res.code === 1) {
          that.list = that.list.concat((res.data && res.data.rows) || []);
          that.total = (res.data && res.data.total) || 0;
        } else {
          that.loadMsg = (res && res.msg) || '加载失败';
          uni.showToast({ title: that.loadMsg, icon: 'none' });
        }
      } catch (e) {
        uni.stopPullDownRefresh();
        that.loadMsg = '加载失败，请重试';
        uni.showToast({ title: that.loadMsg, icon: 'none' });
      }
      // 骨架屏的出口收在这一条：成功 / 业务码失败 / 网络异常 / 响应体为空都要撤（M13）
      that.loading = false;
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

</style>