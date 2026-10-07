<template>
  <view class="school-page">
    <!-- 内容区与区块卡走教务全局档：.school-cards（左右留边 10）+ .school-card（白底、直角、内衬 14、卡间距 10、无阴影） -->
    <view class="school-cards">
    <!-- 首屏骨架屏（替代整页 Loading）：灰块与真实版式逐块对齐（用户卡 头像44 + 昵称 / 活动卡 / 五格统计 / 日历卡） -->
    <block v-if="loading">
      <view class="school-card cr-sk-user">
        <view class="cr-sk-avatar"></view>
        <view class="cr-sk-nick"></view>
      </view>
      <view class="school-card cr-sk-card cr-sk-act">
        <view class="cr-sk-act-icon"></view>
        <view class="cr-sk-text">
          <u-skeleton :loading="true" :animate="true" :title="true" title-width="60%" title-height="14" :rows="0" />
        </view>
      </view>
      <view class="school-card cr-sk-card cr-sk-stats">
        <view class="cr-sk-stat" v-for="i in 5" :key="i">
          <view class="cr-sk-line w40"></view>
          <view class="cr-sk-line w24"></view>
        </view>
      </view>
      <view class="school-card cr-sk-card cr-sk-cal"></view>
    </block>
    <view v-if="!loading && !notFound">
      <view class="school-card cr-user">
        <image class="cr-avatar" :src="avatar || '/static/image/default-avatar.png'" mode="aspectFill" @error="onAvatarError" />
        <text class="cr-nickname">{{ nickname }}</text>
        <!-- 右侧编辑入口：改的是我在本活动的打卡昵称（展示优先于账号昵称），与「我的-设置」共用同一个弹窗组件。
             看别人的记录页时整枚隐掉：昵称是 TA 的，点了也改不了（不可用的动作不留在这里，is_self 吃接口值） -->
        <view class="cr-user-edit" v-if="isSelf" @tap="openNicknameEdit">
          <tz-icon name="editor" :size="19" color="#86909c" />
        </view>
      </view>

      <!-- 顶部活动卡（打卡名称 + 已加入 N 天）→ 这个打卡的详情页（活动主页），落点见 js.vue 的 goDetail() -->
      <view class="school-card cr-act-card" @tap="goDetail">
        <u-icon name="calendar" size="19" color="#1d2129"></u-icon>
        <text class="cr-act-title">{{ title }}</text>
        <text class="cr-act-days">已加入{{ joinedDays }}天</text>
        <u-icon name="arrow-right" size="20" color="#86909c"></u-icon>
      </view>

      <!-- 分组隔离下跨组看别人（masked 吃接口值，判据只在后端一处）：上面这张个人信息卡照常摆，
           属于 TA 的打卡内容整块换成一句空态——统计摆 0 会被读成「TA 一次没打」，与「你看不到」是两件相反的事
           （M13/M16：不把没给的数据渲染成零值，也不留一块没人认领的空白）；
           当日列表那一段不必另加判据：遮蔽时 selectedDay 就是空，那一段自己什么都不画 -->
      <view class="school-card cr-stats" v-if="!masked">
        <view class="cr-stat" v-for="s in statList" :key="s.label">
          <text class="cr-stat-label">{{ s.label }}</text>
          <text class="cr-stat-num">{{ s.value }}</text>
        </view>
      </view>

      <tz-checkin-calendar v-if="!masked" :marks="dayMarks" :selected="selectedDay" @day-click="onDayClick" />

      <u-empty v-if="masked" icon="/static/image/empty.png" width="70" height="70" :text="maskedMsg" margin-top="60"></u-empty>

      <view class="cr-day-title" v-if="selectedDay">{{ selectedDay }} 的打卡</view>
      <!-- 切换日历日期时的局部加载态：只铺「当日列表」这一块骨架（首屏整页骨架是上面那一段），
           外壳用与真实卡同一只 .school-card，灰块与 tz-checkin-record-card 逐块对齐
           （头像 36 + 昵称行 / 正文两行 / 卡片脚时间+动作，缩进 42px 与卡内正文同一线），
           写法照活动主页动态栏的 .cd-sk-feed，口径见 ui-baseline-mobile.md M16 -->
      <block v-if="dayLoading">
        <view class="school-card cr-sk-rec" v-for="i in 3" :key="'rdsk' + i">
          <view class="cr-sk-rec-row">
            <view class="cr-sk-rec-avatar"></view>
            <view class="cr-sk-rec-text">
              <u-skeleton :loading="true" :animate="true" :title="true" title-width="38%" title-height="15" :rows="1" :rows-width="['56%']" rows-height="12" />
            </view>
          </view>
          <view class="cr-sk-rec-body">
            <u-skeleton :loading="true" :animate="true" :title="false" :rows="2" :rows-width="['92%', '64%']" rows-height="14" />
          </view>
          <view class="cr-sk-rec-foot">
            <view class="cr-sk-rec-time"></view>
            <view class="cr-sk-rec-act"></view>
          </view>
        </view>
      </block>
      <block v-else>
        <!-- 当日列表：一次只列日历上选中的这一天，超过 10 条上拉续取（page/limit 见 js.vue 的 loadDay）；
             卡片「更多→删除」成功后静默重取所选那天（reloadDay，不闪骨架） -->
        <tz-checkin-record-card v-for="record in dayRecords" :key="record.id" :record="record" :checkin-id="id" @detail="goDiary" @like="onLike" @comment="openComment" @refresh="reloadDay" />
        <block v-if="selectedDay && !dayRecords.length">
          <u-empty icon="/static/image/empty.png" width="70" height="70" :text="dayError || '当天还没有打卡记录'" />
        </block>
        <!-- 取到当天最后一条就不再出这行（status 由后端 has_more 决定，与动态栏同一档） -->
        <u-loadmore :status="dayLoadStatus" v-if="dayRecords.length && dayLoadStatus !== 'nomore'"></u-loadmore>
      </block>

      <!-- 评论弹窗：与圈子动态卡片、活动详情动态栏同一处实现（点评论图标先弹评论列表，弹窗内再弹回复框）。
           本页没有分享半屏，底栏「分享」按活动详情页口径挂 share-modal（分享这个打卡活动） -->
      <tz-circle-comment :visible="commentVisible" :entity="commentEntity" list-api="checkin.checkin.commentList"
        :list-params="commentTarget" reply-api="checkin.checkin.comment" :id-params="commentTarget" reply-key="parent_id"
        closed-text="该打卡活动已关闭评论"
        :allow-image="false" :deletable="false" :handle-bar-like="false"
        comment-like-api="checkin.checkin.commentLike" :comment-like-params="commentTarget"
        :owner-record-id="id"
        @close="commentVisible = false" @like="onPopupLike" @share="shareVisible = true" @posted="onCommentPosted" />
      <!-- 海报画这个打卡活动的封面/名称，直接复用本页日历接口 shareMeta 下发的 title/cover（不再取一次接口） -->
      <share-modal :visible="shareVisible" type="checkin" :val="id" @close="shareVisible = false"
        :title="title" :cover="cover" />
      <!-- 修改打卡昵称：与「我的-设置」的修改昵称同一组件，field 选改哪一份、target 传活动 id -->
      <tz-nickname-modal ref="nicknameModal" field="checkin" :target="{ checkin_id: id }" :nickname="nickname" :max-len="nicknameMax" @saved="onNicknameSaved" />
    </view>
    </view>

    <!-- 活动不可访问（未上架 / 不存在 / 网络异常）：不再把失败渲染成「一个都没打卡」的零值页 -->
    <u-empty v-if="!loading && notFound" :text="loadMsg" icon="/static/image/empty.png" width="70" height="70" margin-top="80"></u-empty>

    <!-- 底部导航 + 版权页脚：打卡模块各页同一档（tz-tab-bar 只在本页被配成底部导航项时渲染，自带占位不压内容） -->
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>
<style>
@import "./css.css";
</style>
