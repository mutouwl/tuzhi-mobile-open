<template>
  <view class="user-home">
    <!-- 首屏骨架屏（M16）：外壳直接用真实 .profile-head / .profile-main / .profile-info /
         .profile-stats / .stat-item，加载完不换版；灰块只往容器内部放。
         「圈主」徽标是 v-if 才出的，不预留空位；下方动态卡版式存在 tz-circle-post 里，这里不抄一份。 -->
    <view v-if="loading" class="user-home-skeleton">
      <view class="profile-head">
        <view class="profile-main">
          <view class="profile-avatar uh-sk-avatar"></view>
          <view class="profile-info">
            <view class="uh-sk-line uh-sk-h15 uh-sk-w40"></view>
            <view class="uh-sk-line uh-sk-h12 uh-sk-w60"></view>
          </view>
        </view>
        <view class="profile-stats">
          <view class="stat-item" v-for="i in 3" :key="'uh-sk-stat-' + i">
            <view class="uh-sk-line uh-sk-h18 uh-sk-w40"></view>
            <view class="uh-sk-line uh-sk-h12 uh-sk-w40"></view>
          </view>
        </view>
      </view>
      <view class="profile-content">
        <view class="post-list">
          <tz-circle-post :skeleton="true" :list="[]" :skeleton-count="4" />
        </view>
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
          <!-- 列表首次加载态：判据 postsLoading && !posts.length（翻页不闪骨架）；
               动态卡骨架由 tz-circle-post 自己出 -->
          <tz-circle-post v-if="postsLoading && !posts.length" :skeleton="true" :list="[]" :skeleton-count="3" />
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
      that.loading = false; // 兜底分支也要撤骨架：这一页只弹一句 toast 就留在灰块上，看着像「一直加载中」
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

/* ===== 首屏骨架屏（M16）=====
   外壳复用真实 .user-home-skeleton / .profile-head / .profile-main / .profile-avatar /
   .profile-info / .profile-stats / .stat-item / .profile-content / .post-list，
   灰块只往容器内部放。静态块取 uview 骨架灰 #e5e6eb、圆角 4px（压在白底上那一档），
   流光由 u-skeleton 内置那一档负责，本页不再自写渐变。 */
.user-home-skeleton { min-height: 100vh; background: #f7f8fa; }
.uh-sk-avatar {
  /* 真实 .profile-avatar 的占位底是半透明白，压在骨架的白底上读不出来，这一档换成骨架灰 */
  background: #e5e6eb;
}
.uh-sk-line {
  border-radius: 4px;
  background: #e5e6eb;
}
/* 昵称条与下方那行（IP 属地/加入时间）之间：真实 .profile-meta 的上间距 6 */
.uh-sk .profile-info .uh-sk-line + .uh-sk-line,
.uh-sk .stat-item .uh-sk-line + .uh-sk-line {
  margin-top: 6px;
}
.uh-sk-h18 { height: 18px; }
.uh-sk-h15 { height: 15px; }
.uh-sk-h12 { height: 12px; }
.uh-sk-w40 { width: 40%; }
.uh-sk-w60 { width: 60%; }
</style>
