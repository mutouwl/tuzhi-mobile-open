<template>
  <view class="circle-index">
    <u-loading-page :loading="loading" bg-color="#F7F8FA"></u-loading-page>
    <view v-if="!loading && info">
      <!-- 顶部信息区 -->
      <view class="head">
        <!-- 封面图背景（高斯模糊 + 暗色遮罩，内容浮于其上） -->
        <view class="head-bg">
          <image class="head-bg-img" :src="info.cover" mode="aspectFill" />
          <view class="head-bg-mask"></view>
        </view>
        <view class="head-body">
          <view class="head-info" @tap="goPresale">
            <image class="head-cover" :src="info.cover" mode="aspectFill" />
            <view class="head-text">
              <view class="head-name">{{ info.name }}</view>
              <view class="head-intro">{{ info.intro || '和圈内伙伴一起成长' }}</view>
            </view>
          </view>
          <button class="head-search" aria-label="搜索动态" @tap="goSearch">
            <tz-icon name="search" :size="28" color="#fff" />
          </button>
          <button class="head-share" aria-label="分享圈子" @tap="openShare">
            <tz-icon name="share" :size="28" color="#fff" />
          </button>
        </view>
        <view class="head-members">
          <text class="member-count" v-if="info.show_post_count == 1"><text class="member-number">{{ formatCount(info.post_count) }}</text>动态</text>
          <text class="member-divider" v-if="info.show_post_count == 1 && info.show_member_count == 1">|</text>
          <text class="member-count" v-if="info.show_member_count == 1"><text class="member-number">{{ formatCount(info.member_count) }}</text>成员</text>
        </view>

        <view class="top-posts" v-if="info.top_posts && info.top_posts.length">
          <view class="top-post-row" v-for="post in info.top_posts" :key="post.id" @tap="goDetail(post)">
            <view class="top-post-icon">
              <tz-icon name="shangjiantou" :size="14" color="#8c7668" />
            </view>
            <text class="top-post-title">{{ postTitle(post.content) }}</text>
          </view>
        </view>
      </view>

      <!-- 黑名单状态提示：可浏览内容但限制互动 -->
      <view class="ban-banner" v-if="myMember.status == 2">
        <text>你已被限制互动，请联系圈主</text>
      </view>

      <!-- 今日任务 -->
      <view class="task-bar" v-if="info.today_task" @tap="goTask">
        <text class="task-tag">今日任务</text>
        <text class="task-title">{{ info.today_task.title }}</text>
        <text class="task-action">上次学到 {{ info.today_task.progress }}</text>
      </view>

      <!-- 导航 tab + 排序（吸顶） -->
      <view class="sticky-wrap">
        <view class="nav-bar">
          <u-tabs :list="navTabs" :current="tabIndex" @change="onTabChange" lineColor="#0968f6" :scrollable="true">
            <view class="sort-box" :style="{ color: filterActive ? '#0968f6' : '#86909c' }" @tap="toggleSort" v-if="currentTab.type != 'showcase' && currentTab.type != 'course'">
              <text class="sort-text">{{ sortText }}</text>
              <tz-icon name="paixu" :size="18" />
            </view>
          </u-tabs>
        </view>
      </view>

      <!-- 课程 tab：与专栏目录一致，进入时挂载组件并由组件单次加载 -->
      <view v-if="currentTab.type == 'course'" class="feed">
        <circle-course-dir :circle-id="id" :is-member="isMember" />
      </view>

      <!-- 商品橱窗 -->
      <view v-else-if="currentTab.type == 'showcase'" class="feed">
        <view v-if="tabLoading" class="tab-loading"><u-loading-icon color="#0968f6" text="加载中" textSize="12" /></view>
        <tz-course-mini v-else-if="showcaseList.length" :list="showcaseList" type="single" :round="true" :border="true" :margin="8" />
        <u-empty v-else text="暂无商品" icon="/static/image/empty.png" width="70" height="70" margin-top="60"></u-empty>
      </view>

      <!-- 动态流 -->
      <view v-else class="feed">
        <view v-if="tabLoading" class="tab-loading"><u-loading-icon color="#0968f6" text="加载中" textSize="12" /></view>
        <template v-else>
          <tz-circle-post :list="posts" mode="full" :circle-id="id" :content-protect="info.content_protect" @like="onLike" @comment="goDetail" @refresh="refresh" />
          <u-loadmore :status="loadStatus" margin-top="20" v-if="posts.length" />
          <u-empty v-if="!posts.length && !loadingMore" text="还没有动态，来发布第一条吧" icon="/static/image/empty.png" width="70" height="70" margin-top="60"></u-empty>
        </template>
      </view>

      <!-- 悬浮发布按钮 -->
      <view class="publish-btn" @tap="goPublish" v-if="myMember.status != 2">
        <tz-icon name="brush_fill" :size="24" color="#86909C" />
      </view>

      <!-- 悬浮更多按钮：点击弹出快捷导航（与 hover-btn 弹窗一致） -->
      <view class="more-btn" @tap="modal.more = true">
        <tz-icon name="manage" :size="24" color="#86909C" />
      </view>
    </view>

    <!-- 圈子不存在或状态异常空状态 -->
    <view v-if="!loading && notFound" class="feed">
      <u-empty :text="loadMsg || '圈子不存在或状态异常'" icon="/static/image/empty.png" width="70" height="70" margin-top="80"></u-empty>
    </view>

    <!-- tabbar 不依赖圈子数据加载，保证切换页面时及时展示 -->
    <tz-tab-bar />
    <tz-footer v-if="!loading && info" />

    <!-- 分享弹窗（海报/图文，type=circle 链接圈子售前页） -->
    <share-modal v-if="!loading && info" :visible="shareVisible" :val="id" type="circle" @close="shareVisible = false" />

    <!-- 动态筛选弹窗（排序 + 时间，与圈子搜索页共用组件） -->
    <circle-post-filter
	  v-if="!loading && info"
      :visible="modal.sortFilter"
      title="动态筛选"
      :sort="sort"
      :time-filter="timeFilter"
      :custom-range="customRange"
      @update:visible="modal.sortFilter = $event"
      @confirm="onFilterConfirm"
    />

    <!-- 更多弹窗（与 hover-btn 弹窗一致：快捷导航） -->
    <u-popup v-if="!loading && info" :show="modal.more" @close="modal.more = false" :closeable="true" :round="10">
      <view style="padding: 30px 10px 60px;">
        <view class="more-grid">
          <view class="more-item" @tap="moreNav('/pages/index/index', 'reLaunch')">
            <tz-icon name="homepage" color="#1D2129" :size="35" />
            <text>首页</text>
          </view>
          <view class="more-item" @tap="moreNav('/pages/user/study/study', 'reLaunch')">
            <tz-icon name="dynamic" color="#1D2129" :size="35" />
            <text>学习中心</text>
          </view>
          <view class="more-item" @tap="moreNav('/pages/order/list/list')">
            <tz-icon name="createtask" color="#1D2129" :size="35" />
            <text>订单管理</text>
          </view>
          <view class="more-item" @tap="moreNav('/pages/user/index/index', 'reLaunch')">
            <tz-icon name="people" color="#1D2129" :size="35" />
            <text>个人中心</text>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
