<template>
  <view class="user-home">
    <!-- 加载骨架屏：上个人信息 + 下动态列表 -->
    <view v-if="loading" class="user-home-skeleton">
      <view class="sk-profile">
        <view class="sk-profile-head">
          <view class="sk-avatar sk-avatar-lg"></view>
          <view class="sk-profile-info">
            <view class="sk-line sk-w-40"></view>
            <view class="sk-line sk-w-30"></view>
          </view>
        </view>
        <view class="sk-profile-stats">
          <view class="sk-stat" v-for="i in 3" :key="i">
            <view class="sk-line sk-w-40"></view>
            <view class="sk-line sk-w-30"></view>
          </view>
        </view>
      </view>
      <view class="sk-post" v-for="i in 4" :key="i">
        <view class="sk-head">
          <view class="sk-avatar"></view>
          <view class="sk-head-info">
            <view class="sk-line sk-w-40"></view>
            <view class="sk-line sk-w-20"></view>
          </view>
        </view>
        <view class="sk-line"></view>
        <view class="sk-line sk-w-80"></view>
        <view class="sk-line sk-w-60"></view>
      </view>
    </view>

    <view v-if="!loading && profile">
      <view class="profile-head">
        <view class="profile-main">
          <image class="profile-avatar" :src="profile.avatar" mode="aspectFill" />
          <view class="profile-info">
            <view class="profile-name-row">
              <text class="profile-name">{{ profile.nickname }}</text>
              <text class="owner-tag" v-if="profile.is_owner == 1">圈主</text>
            </view>
            <view class="profile-meta">{{ joinText }}</view>
          </view>
        </view>

        <view class="profile-stats">
          <view class="stat-item">
            <text class="stat-value">{{ formatCount(stats.post_count) }}</text>
            <text class="stat-label">动态</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ formatCount(stats.like_count) }}</text>
            <text class="stat-label">获赞</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ formatCount(stats.essence_count) }}</text>
            <text class="stat-label">精选</text>
          </view>
        </view>
      </view>

      <!-- 动态导航：白底通栏，紧贴 profile-head 下方（与圈子首页 nav-bar 位置一致） -->
      <view class="section-tabs">
        <u-tabs :list="navTabs" :current="tabIndex" @change="onTabChange" lineColor="#0968f6" :scrollable="true"></u-tabs>
      </view>

      <view class="profile-content">
        <view class="post-list">
          <!-- 列表首次加载态（与圈子首页 tab 加载态一致）；加载更多走 u-loadmore -->
          <view v-if="postsLoading && !posts.length" class="tab-loading"><u-loading-icon color="#0968f6" text="加载中" textSize="12" /></view>
          <template v-else>
            <tz-circle-post
              :list="posts"
              mode="full"
              :circle-id="circleId"
              :content-protect="contentProtect"
              @like="onLike"
              @comment="goDetail"
              @refresh="refresh"
            />
            <u-loadmore :status="loadStatus" margin-top="16" v-if="posts.length" />
            <u-empty v-if="!posts.length && !postsLoading" text="还没有发布动态" icon="/static/image/empty.png" width="70" height="70" margin-top="70"></u-empty>
          </template>
        </view>
      </view>
    </view>

    <!-- 个人信息加载失败空状态 -->
    <view v-if="!loading && !profile" class="profile-content">
      <u-empty :text="loadMsg || '个人主页加载失败'" icon="/static/image/empty.png" width="70" height="70" margin-top="80"></u-empty>
    </view>
  </view>
</template>

<script>
var that;

export default {
  data() {
    return {
      circleId: 0,
      userId: 0,
      loading: true,
      loadMsg: '',
      profile: null,
      stats: { post_count: 0, like_count: 0, essence_count: 0 },
      navTabs: [{ name: '动态' }],
      tabIndex: 0,
      contentProtect: 0,
      posts: [],
      page: 1,
      limit: 10,
      total: 0,
      postsLoading: false,
      loadStatus: 'loadmore',
    };
  },
  computed: {
    joinText() {
      if (!this.profile) return '';
      const parts = [];
      if (this.profile.location) parts.push('IP属地：' + this.profile.location);
      if (!this.profile.join_time) return parts.join(' · ') || '圈子成员';
      const d = new Date(Number(this.profile.join_time) * 1000);
      parts.push(d.getFullYear() + '年' + (d.getMonth() + 1) + '月加入');
      return parts.join(' · ');
    }
  },
  onLoad(options) {
    that = this;
    that.circleId = Number(options.circle_id || 0);
    that.userId = Number(options.user_id || 0);
    if (!that.$tools.systemConfig('app_isinstall_circle')) {
      uni.showToast({ title: '圈子功能未安装', icon: 'none' });
      setTimeout(() => uni.navigateBack(), 1200);
      return;
    }
    if (!that.circleId || !that.userId) {
      that.loading = false;
      that.loadMsg = '页面参数错误';
      uni.showToast({ title: '页面参数错误', icon: 'none' });
      return;
    }
    that.loadProfile();
  },
  onPullDownRefresh() {
    that.loadProfile();
  },
  onReachBottom() {
    if (that.posts.length < that.total) that.loadPosts(true);
  },
  methods: {
    formatCount(value) {
      const count = Number(value) || 0;
      if (count < 10000) return String(count);
      return (count / 10000).toFixed(2).replace(/\.?0+$/, '') + 'w';
    },
    async loadProfile() {
      const res = await that.$api('circle.circle.userHome', {
        circle_id: that.circleId,
        user_id: that.userId,
      });
      if (res.code !== 1) {
        that.loading = false;
        that.loadMsg = res.msg || '个人主页加载失败';
        uni.stopPullDownRefresh();
        uni.showToast({ title: res.msg || '个人主页加载失败', icon: 'none' });
        return;
      }
      that.profile = res.data.user;
      that.stats = res.data.stats || that.stats;
      that.contentProtect = res.data.content_protect || 0;
      uni.setNavigationBarTitle({ title: that.profile.nickname || '个人主页' });
      that.page = 1;
      that.posts = [];
      that.loading = false;
      await that.loadPosts(false);
      uni.stopPullDownRefresh();
    },
    async loadPosts(more) {
      if (that.postsLoading) return;
      that.postsLoading = true;
      that.loadStatus = 'loading';
      const res = await that.$api('circle.post.list', {
        circle_id: that.circleId,
        user_id: that.userId,
        tab: 'all',
        sort: 'new',
        page: that.page,
        limit: that.limit,
      });
      that.postsLoading = false;
      if (res.code === 1) {
        const rows = res.data.rows || [];
        that.total = Number(res.data.total) || 0;
        that.posts = more ? that.posts.concat(rows) : rows;
        that.page++;
        that.loadStatus = that.posts.length >= that.total ? 'nomore' : 'loadmore';
      } else {
        that.loadStatus = 'loadmore';
      }
    },
    refresh() {
      return that.loadProfile();
    },
    onTabChange(e) {
      that.tabIndex = e.index;
    },
    goDetail(post) {
      // 兜底：条目无 id 时不跳详情（?id=undefined 会解析为 0，报 动态不存在）
      if (!post || !post.id) return;
      that.$nav.to('/pages/app/circle/post/detail?id=' + post.id);
    },
    async onLike(post) {
      if (!post || !post.id) return;
      const postIndex = that.posts.findIndex(item => Number(item.id) === Number(post.id));
      if (postIndex < 0) return;

      const current = that.posts[postIndex];
      const wasLiked = Number(current.liked) === 1;
      const api = wasLiked ? 'circle.post.unlike' : 'circle.post.like';
      let res;
      try {
        res = await that.$api(api, { target_type: 'post', target_id: current.id });
      } catch (e) {
        uni.showToast({ title: (e && e.msg) || '操作失败', icon: 'none' });
        return;
      }
      if (!res || Number(res.code) !== 1) {
        uni.showToast({ title: (res && res.msg) || '操作失败', icon: 'none' });
        return;
      }

      const liked = res.data && res.data.liked !== undefined
        ? Number(res.data.liked) === 1
        : !wasLiked;
      const nextPost = Object.assign({}, current);
      nextPost.liked = liked ? 1 : 0;
      nextPost.like_count = Math.max(0, Number(current.like_count || 0) + (liked === wasLiked ? 0 : (liked ? 1 : -1)));
      that.stats.like_count = Math.max(0, Number(that.stats.like_count || 0) + (liked === wasLiked ? 0 : (liked ? 1 : -1)));

      const currentUser = uni.getStorageSync('user_info') || {};
      const nickname = currentUser.nickname || '我';
      const likeUsers = Array.isArray(current.like_users) ? current.like_users.slice() : [];
      const userIndex = likeUsers.indexOf(nickname);
      if (liked && userIndex === -1) likeUsers.unshift(nickname);
      if (!liked && userIndex > -1) likeUsers.splice(userIndex, 1);
      if (nextPost.like_count <= 0) likeUsers.length = 0;
      nextPost.like_users = likeUsers;
      that.$set(that.posts, postIndex, nextPost);
    }
  }
};
</script>

<style scoped>
.user-home { min-height: 100vh; background: #f7f8fa; }
.profile-head {
  padding: 46px 20px 15px;
  color: #1d2129;
  background: #fff;
}
.profile-main { display: flex; align-items: center; }
.profile-avatar {
  width: 51px;
  height: 51px;
  flex: none;
  border: 2px solid #fff;
  border-radius: 50%;
  background: rgba(255,255,255,.2);
}
.profile-info { flex: 1; min-width: 0; margin-left: 14px; }
.profile-name-row { display: flex; align-items: center; }
.profile-name { max-width: 80%; font-size: 15px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.owner-tag { margin-left: 7px; padding: 1px 5px; border-radius: 3px; color: #725b50; background: #f5dfbd; font-size: 10px; }
.profile-meta { margin-top: 6px; color: #86909c; font-size: 12px; }
.profile-stats { display: flex; margin-top: 34px; }
.stat-item { min-width: 68px; margin-right: 16px; display: flex; flex-direction: column; align-items: flex-start; }
.stat-value { font-size: 18px; font-weight: 700; }
.stat-label { margin-top: 5px; color: #86909c; font-size: 12px; }
.profile-content {
  position: relative;
  min-height: 50vh;
  padding: 8px 12px 70px;
  background: #f7f8fa;
}
/* 动态导航：白底通栏，紧贴 profile-head 下方，滚动吸顶（与圈子首页 sticky-wrap 一致） */
.section-tabs {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
}
.post-list { overflow: hidden; }
/* 列表首次加载态（与圈子首页 tab-loading 一致） */
.tab-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

/* 加载骨架屏：上与 profile-head 同构，下为动态卡片 */
.user-home-skeleton { min-height: 100vh; background: #f7f8fa; }
.sk-profile { padding: 46px 20px 15px; background: #fff; }
.sk-profile-head { display: flex; align-items: center; }
.sk-avatar-lg { width: 51px; height: 51px; }
.sk-profile-info { flex: 1; min-width: 0; margin-left: 14px; }
.sk-profile-stats { display: flex; margin-top: 34px; }
.sk-stat { min-width: 68px; margin-right: 16px; }
.sk-post {
  margin: 8px 12px 0;
  padding: 12px 14px 13px;
  background: #fff;
  border-radius: 4px;
}
.sk-head { display: flex; align-items: center; }
.sk-avatar {
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f1f2f4 25%, #e6e6e6 37%, #f1f2f4 50%);
  background-size: 400% 100%;
  animation: sk-animate 1.8s ease infinite;
}
.sk-head-info { flex: 1; min-width: 0; margin-left: 8px; }
.sk-line {
  height: 15px;
  border-radius: 3px;
  margin-top: 10px;
  background: linear-gradient(90deg, #f1f2f4 25%, #e6e6e6 37%, #f1f2f4 50%);
  background-size: 400% 100%;
  animation: sk-animate 1.8s ease infinite;
}
.sk-w-80 { width: 80%; }
.sk-w-60 { width: 60%; }
.sk-w-40 { width: 40%; }
.sk-w-30 { width: 30%; }
.sk-w-20 { width: 20%; }
@keyframes sk-animate {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
</style>
