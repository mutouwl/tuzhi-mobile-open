<template>
  <view class="my-home">
    <!-- 首屏骨架屏（M16）：外壳复用真实三张卡（.card / .user-card / .expire-card / .stat-card），
         灰块只往卡内放，压在白底上取 #e5e6eb。
         「我的有效期」是写死的静态文案（加载前后一字不变），保持真文字不给灰块（M16②）；
         「立即续费」按钮与「剩余 N 天」都是 v-if 才出的，不预留空位（M16③）。 -->
    <view v-if="loading" class="mh-sk">
      <view class="card user-card">
        <view class="mh-sk-avatar"></view>
        <view class="user-info">
          <view class="mh-sk-line mh-sk-h16 mh-sk-w45"></view>
          <view class="mh-sk-line mh-sk-h11 mh-sk-w60"></view>
        </view>
      </view>
      <view class="card expire-card">
        <view class="expire-label">我的有效期</view>
        <view class="mh-sk-line mh-sk-h20 mh-sk-w40 mh-sk-center"></view>
      </view>
      <view class="card stat-card">
        <view class="stat-item" v-for="i in 3" :key="'mh-sk-stat-' + i">
          <view class="mh-sk-line mh-sk-h20 mh-sk-w50 mh-sk-center"></view>
          <view class="mh-sk-line mh-sk-h11 mh-sk-w50 mh-sk-center"></view>
        </view>
      </view>
    </view>

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

    <!-- 加载失败空状态（接口失败/参数错误时给一句可读出口，不留整页空白） -->
    <view v-if="!loading && !data" class="mh-empty">
      <u-empty :text="loadMsg || '加载失败，请重试'" icon="/static/image/empty.png" width="70" height="70" margin-top="80"></u-empty>
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
      loadMsg: '',
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
      that.loading = false; // 兜底分支也要撤骨架：这一页只弹一句 toast 就留在灰块上，看着像「一直加载中」
      return;
    }
    that.load();
  },
  methods: {
    async load() {
      let res;
      try {
        res = await that.$api('circle.circle.expire', { circle_id: that.circleId });
      } catch (e) {
        // 网络异常这一支也要撤骨架并给可读出口，否则整页停在灰块上
        that.loading = false;
        that.loadMsg = (e && (e.msg || e.errMsg)) || '加载失败，请重试';
        uni.showToast({ title: that.loadMsg, icon: 'none' });
        return;
      }
      if (res && res.code === 1) {
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
        that.loadMsg = '';
        that.loading = false;
      } else {
        that.loading = false;
        that.loadMsg = (res && res.msg) || '加载失败，请重试';
        uni.showToast({ title: that.loadMsg, icon: 'none' });
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

/* ===== 首屏骨架屏（M16）=====
   外壳 .card / .user-card / .expire-card / .stat-card 与真实卡同一份（白底、4px 圆角、14 内衬、10 间距），
   只补占位块自身尺寸；静态块取 uview 骨架灰 #e5e6eb、圆角 4px（压在白底上那一档）。 */
.mh-sk-avatar {
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 50%;
  background: #e5e6eb;
}
/* 真实 .user-info 没有 flex，骨架条是百分比宽，必须自己撑开否则宽度塌成 0 */
.mh-sk .user-info {
  flex: 1;
  min-width: 0;
}
.mh-sk-line {
  border-radius: 4px;
  background: #e5e6eb;
}
.mh-sk .user-info .mh-sk-line + .mh-sk-line {
  margin-top: 3px;
}
.mh-sk-h16 { height: 16px; }
.mh-sk-h20 { height: 20px; }
.mh-sk-h11 { height: 11px; }
.mh-sk-w40 { width: 40%; }
.mh-sk-w45 { width: 45%; }
.mh-sk-w50 { width: 50%; }
.mh-sk-w60 { width: 60%; }
/* 有效期/数据卡是整卡居中，数值条与标签条跟着居中；有效期数值上距照真实 .expire-value 的 4px */
.mh-sk-center {
  margin-left: auto;
  margin-right: auto;
}
.mh-sk .expire-card .mh-sk-line {
  margin-top: 4px;
}
.mh-sk .stat-item .mh-sk-line + .mh-sk-line {
  margin-top: 2px;
}
/* 失败空状态：与卡片区同底，给一句可读出口 */
.mh-empty {
  min-height: 60vh;
  background: #f7f8fa;
}
</style>
