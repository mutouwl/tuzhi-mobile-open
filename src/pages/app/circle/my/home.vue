<template>
  <view class="my-home">
    <u-loading-page :loading="loading" bg-color="#F7F8FA"></u-loading-page>
    <view v-if="!loading && data">
      <!-- 我的信息卡 -->
      <view class="card user-card">
        <image class="avatar" :src="userInfo.avatar" mode="aspectFill" />
        <view class="user-info">
          <view class="nickname">{{ userInfo.nickname }}</view>
          <view class="join-time">{{ data.member.createtime_text }} 加入</view>
        </view>
      </view>

      <!-- 有效期卡 -->
      <view class="card expire-card">
        <view class="expire-label">我的有效期</view>
        <view class="expire-value" :class="{ warn: data.member.is_expired == 1 }">{{ data.member.expire_text }}</view>
        <view class="expire-days" v-if="data.member.is_expired != 1 && data.member.days != null && data.member.days <= 15">
          剩余 {{ data.member.days }} 天，请及时续费
        </view>
        <view class="renew-btn" v-if="data.circle && data.circle.sell_type == 2" @tap="renew">
          立即续费
          <text v-if="Number(data.circle.renew_discount) > 0" class="renew-discount">享{{ data.circle.renew_discount }}折</text>
        </view>
      </view>

      <!-- 我的数据 -->
      <view class="card stat-card">
        <view class="stat-item">
          <view class="stat-value">{{ data.stats.post_count }}</view>
          <view class="stat-label">动态</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ data.stats.like_count }}</view>
          <view class="stat-label">获赞</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ data.stats.comment_count }}</view>
          <view class="stat-label">评论</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
var that;

export default {
  data() {
    return {
      circleId: 0,
      loading: true,
      data: null,
      userInfo: {},
    };
  },
  onLoad(options) {
    that = this;
    that.circleId = Number(options.circle_id || 0);
    that.userInfo = uni.getStorageSync('user_info') || {};
    // 圈子插件未安装时兜底
    if (!that.$tools.systemConfig("app_isinstall_circle")) {
      uni.showToast({ title: "圈子功能未安装", icon: "none" });
      setTimeout(() => uni.navigateBack(), 1200);
      return;
    }
    that.load();
  },
  methods: {
    async load() {
      const res = await that.$api('circle.circle.expire', { circle_id: that.circleId });
      if (res.code === 1) {
        const d = res.data;
        d.member.createtime_text = that.formatDate(d.member.createtime);
        if (d.member.expire_time < 9999999999) {
          d.member.days = Math.max(0, Math.ceil((d.member.expire_time * 1000 - Date.now()) / 86400000));
        } else {
          d.member.days = null;
        }
        if (!d.stats) {
          d.stats = { post_count: 0, like_count: 0, comment_count: 0 };
        }
        that.data = d;
        that.loading = false;
      } else {
        that.loading = false;
        uni.showToast({ title: res.msg || '加载失败', icon: 'none' });
      }
    },
    formatDate(ts) {
      if (!ts) return '';
      const d = new Date(Number(ts) * 1000);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },
    renew() {
      that.$nav.to('/pages/app/circle/presale/presale?id=' + that.circleId);
    }
  }
};
</script>

<style>
.my-home {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 12px;
}
.card {
  background: #fff;
  border-radius: 4px;
  padding: 14px;
  margin-bottom: 10px;
}
.user-card {
  display: flex;
  align-items: center;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.user-info {
  margin-left: 10px;
}
.nickname {
  font-size: 16px;
  font-weight: 600;
}
.join-time {
  font-size: 11px;
  color: #86909c;
  margin-top: 3px;
}
.expire-card {
  text-align: center;
}
.expire-label {
  font-size: 12px;
  color: #86909c;
}
.expire-value {
  font-size: 20px;
  font-weight: 700;
  color: #1d2129;
  margin-top: 4px;
}
.expire-value.warn {
  color: #f53f3f;
}
.expire-days {
  font-size: 11px;
  color: #ff7d00;
  margin-top: 4px;
}
.renew-btn {
  margin-top: 10px;
  height: 40px;
  line-height: 40px;
  background: #0968f6;
  color: #fff;
  font-size: 14px;
  border-radius: 4px;
}
.renew-discount {
  font-size: 11px;
  margin-left: 4px;
}
.stat-card {
  display: flex;
}
.stat-item {
  flex: 1;
  text-align: center;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1d2129;
}
.stat-label {
  font-size: 11px;
  color: #86909c;
  margin-top: 2px;
}
</style>
