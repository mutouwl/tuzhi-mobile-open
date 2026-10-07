<template>
  <!-- 本页常驻吸底栏（分享 + 主操作，被拦住时栏内多一行原因），页面根固定走 .school-page--bar（底部留白 90）；
       栏里多那一行时留白跟着加一档（ctd-page-guard），否则滚到页底会把版权行压在吸底栏下面 -->
  <view class="school-page school-page--bar" :class="blockReason ? 'ctd-page-guard' : ''">
    <!-- 首屏骨架屏（M16，替代整页 Loading）：外壳复用真实区块的 .school-block .school-head / .school-card，
         灰块与真实版式逐块对齐（任务标题行 + 两行灰字 / 介绍标题 + 正文三行 / 动态卡 头像 + 两行 + 动作行），
         仅在请求中且未拿到任务时出现，onShow 静默刷新不再闪骨架（与活动主页、介绍页同一口径） -->
    <block v-if="loading">
      <view class="school-block school-head ctd-head">
        <u-skeleton :loading="true" :animate="true" :title="true" title-width="52%" title-height="20" :rows="2" :rows-width="['44%', '30%']" rows-height="12" />
      </view>
      <view class="school-block school-head">
        <u-skeleton :loading="true" :animate="true" :title="true" title-width="22%" title-height="16" :rows="3" :rows-width="['100%', '94%', '62%']" rows-height="12" />
      </view>
      <view class="school-cards">
        <view class="school-card" v-for="i in 2" :key="'fsk' + i">
          <view class="ctd-sk-row">
            <view class="ctd-sk-avatar"></view>
            <view class="ctd-sk-text">
              <u-skeleton :loading="true" :animate="true" :title="true" title-width="38%" title-height="15" :rows="1" :rows-width="['56%']" rows-height="12" />
            </view>
          </view>
          <u-skeleton :loading="true" :animate="true" :title="false" :rows="2" :rows-width="['92%', '64%']" rows-height="14" />
          <view class="ctd-sk-foot">
            <view class="ctd-sk-foot-time"></view>
            <view class="ctd-sk-foot-act"></view>
          </view>
        </view>
      </view>
    </block>

    <view v-if="!loading && task">
      <!-- 任务头卡：通栏白卡（.school-block 白底无圆角无阴影 + .school-head 内衬 14/16，照活动主页 .cd-head），
           版式照参照图的「Day2 + 打卡时间」两行，另补列表卡上没有的两样：右上角状态标签（文字由后端 check_text
           下发，M22 不在前端另存判据）与所属活动行（分享链接直达本页时，这是回活动主页的唯一入口）。
           打卡时间一行给「开始 至 截止」一个完整区间（与提交页 .cs-task-date 同一写法），
           拆成「几点开始 / 几点截止」两行读不出这是一段时间（2026-09-25 用户点名）；
           闯关模式整行不显示（判据取后端逐行 show_time，闯关任务的起止只是创建时铺下的宽窗口底座） -->
      <view class="school-block school-head ctd-head">
        <view class="ctd-title-row">
          <text class="ctd-level" v-if="task.level">第 {{ task.level }} 关</text>
          <view class="ctd-title">{{ task.title }}</view>
          <text class="ctd-state" v-if="task.check_text">{{ task.check_text }}</text>
        </view>
        <view class="ctd-time" v-if="task.show_time != 0">{{ fmt(task.start_time) }} 至 {{ fmt(task.end_time) }}</view>
        <view class="ctd-count">{{ task.user_count || 0 }}人已打卡</view>
        <view class="ctd-act" @tap="goActivity">
          <u-icon name="calendar" size="19" color="#1d2129"></u-icon>
          <text class="ctd-act-title">{{ task.checkin_title }}</text>
          <u-icon name="arrow-right" size="20" color="#86909c"></u-icon>
        </view>
      </view>

      <!-- 打卡介绍：任务正文是后台富文本编辑器录入的（tuzi-web task.vue 的 editor），故走 tz-parse，
           判空口径与打卡介绍页的「活动介绍」同一份（空标签/占位内容不渲染富文本，落「暂无」） -->
      <view class="school-block">
        <tz-title title="打卡介绍" :more="false" />
        <tz-box padding="0 15px 15px">
          <tz-parse v-if="introHtml" :content="introHtml" />
          <!-- 任务级关了「提前预习」时正文压根没下发（后端只给标题与日期），空态要说清是「没解锁所以不给」，
               不能写成「暂无任务说明」让人以为管理员忘了填 -->
          <u-empty v-else icon="/static/image/empty.png" width="70" height="70"
            :text="task.preview === 0 ? '任务解锁后可查看' : '暂无任务说明'" />
        </tz-box>
      </view>

      <!-- 已提交的动态：只列本任务下已提交的动态（feed 接口带 task_id 下推 SQL，M3），
           不再是整个圈子的动态；控件行与卡片外壳沿用活动主页动态栏那一档。
           标题不给白底（bgColor="none"，与优惠券/微信小店列表页的裸标题同一档写法）：
           这一栏下面是灰底列表区（.school-cards），标题压在白横条上会读成上一块「打卡介绍」的尾巴 -->
      <tz-title title="已提交的日记" :more="false" bgColor="none" />
      <!-- 「全部 / 精选 + 排序 + 时间筛选」是本页唯一的页签行（整页没有第二排可点的筛选），按 M5 一律吸顶。
           行搬出 .school-cards 但不能因此换底色：带底给同一份列表灰底 #f7f8fa，左右 10px 内衬由本行自己给
           （与 .school-cards 的留边同值），带下方列表容器的 top 内衬收掉，行内外看起来始终是同一条灰底。
           带底不给白底：白底会让这一排在吸顶前后换个背景，正是活动主页动态栏 cd-feed-head 被点名两次的那个病 -->
      <u-sticky bgColor="#f7f8fa" :offsetTop="0">
        <view class="ctd-chips">
          <view :class="['ctd-chip', feedOnlyFeatured ? '' : 'ctd-chip-active']" @tap="setFeedFeatured(false)">全部</view>
          <view :class="['ctd-chip', 'ctd-chip-featured', feedOnlyFeatured ? 'ctd-chip-active' : '']" @tap="setFeedFeatured(true)">精选</view>
          <view class="ctd-chip ctd-feed-sort" @tap="toggleFeedOrder">
            <tz-icon class="ctd-ic-mid" :name="feedOrder === 'asc' ? 'zhengxu2' : 'daoxu'" :size="16" color="#86909c" /><text>{{ feedOrder === 'asc' ? '正序' : '倒序' }}</text>
          </view>
          <view class="ctd-chip ctd-feed-filter" @tap="filterVisible = true">
            <tz-icon class="ctd-ic-mid" name="shijianfanwei2" :size="19" :color="filterActive ? '#0968f6' : '#86909c'" />
            <text :style="{ color: filterActive ? '#0968f6' : '#86909c' }">{{ feedFilterLabel }}</text>
          </view>
        </view>
      </u-sticky>
      <view class="school-cards ctd-feed-list">
        <block v-if="feedLoading">
          <view class="school-card" v-for="i in 2" :key="'fkl' + i">
            <view class="ctd-sk-row">
              <view class="ctd-sk-avatar"></view>
              <view class="ctd-sk-text">
                <u-skeleton :loading="true" :animate="true" :title="true" title-width="38%" title-height="15" :rows="1" :rows-width="['56%']" rows-height="12" />
              </view>
            </view>
            <u-skeleton :loading="true" :animate="true" :title="false" :rows="2" :rows-width="['92%', '64%']" rows-height="14" />
            <view class="ctd-sk-foot">
              <view class="ctd-sk-foot-time"></view>
              <view class="ctd-sk-foot-act"></view>
            </view>
          </view>
        </block>
        <block v-else>
          <!-- 本页的动态都是这一条任务的，卡上的任务名标签收掉（组件的 hideTaskTag 传 true）：
               任务名已经是本页标题，再摆一枚点自己页面的标签纯属重复 -->
          <tz-checkin-record-card v-for="record in feed" :key="record.id" :record="record" :checkin-id="task.checkin_id" :hide-task-tag="true"
            @detail="goDiary" @like="onLike" @comment="openComment" @refresh="loadFeed(true)" />
          <u-empty icon="/static/image/empty.png" width="70" height="70" v-if="!feed.length" :text="feedError || '还没有人提交这条任务的日记，快来抢占沙发吧'" />
          <u-loadmore :status="feedLoadStatus" v-if="feed.length && feedLoadStatus !== 'nomore'"></u-loadmore>
        </block>
      </view>

      <!-- 吸底栏：左「分享」是横排「图标+文字」型入口（与活动主页头卡工具行同一档：文字 14px、图标墨迹 12px），
           点开任务级分享半屏（海报/图文，链接落在本页）；右主按钮只表动作（参与活动/去补卡/立即打卡），
           状态归头卡右上角的标签，打不了卡时整枚灰掉 —— 任务列表那一级的「去打卡」恒可点，
           打卡的禁用逻辑收在这同一枚按钮上（ui-baseline-mobile.md M22）；
           唯一按住的分支是「今日已完成该任务」（mainBtnLocked → u-button 的 disabled）：这条今天再点也只会
           重复听一句「今日已完成该任务」，2026-09-26 用户口径改为整枚不可点，状态由头卡那枚「已打卡」说清；
           容器/内衬/阴影/安全区走全局 .school-footer + .h5-bottom-bar。
           灰掉/按住那一档的「为什么不能打卡」写在按钮行上面（.ctd-footer 把吸底栏折成两行），不再等点击弹框
           （2026-09-27 用户口径）：内容仍是后端逐条下发的 check_msg，常驻可见，比读一遍弹窗更省事 -->
      <view class="school-footer ctd-footer h5-bottom-bar">
        <u-alert v-if="blockReason" type="warning" :title="blockReason" :showIcon="true" effect="light"
          customStyle="width: 100%; margin-bottom: 8px;" />
        <view class="ctd-bar-row">
          <view class="ctd-share" @tap="shareVisible = true">
            <tz-icon name="share" :size="14" color="#4e5969" />
            <text class="ctd-share-text">分享</text>
          </view>
          <u-button class="ctd-main-btn" type="primary" :text="mainBtnText" :custom-style="mainBtnStyle" :disabled="mainBtnLocked" @click="onMainAction"></u-button>
        </view>
      </view>

      <!-- 筛选半屏：与活动主页动态栏同一份组件与同一组口径（只筛排序 + 时间，弹窗里没有精选项，
           所以精选不回显在这个按钮上，见 ui-baseline-mobile M7③） -->
      <tz-filter-popup :visible="filterVisible" title="日记筛选" :sort="feedOrder" :sort-options="[{ name: '正序', value: 'asc' }, { name: '倒序', value: 'desc' }]"
        :time-filter="feedTimeFilter" :custom-range="feedCustomRange" @update:visible="filterVisible = $event" @confirm="onFilterConfirm" />

      <!-- 评论弹窗：与活动主页动态栏、圈子动态卡片同一处实现（点卡片评论图标先弹这条日记的评论列表，
           弹窗内点「写下你的评论吧」再弹回复框）。接口名与目标参数由本页下发（打卡评论接口不收图片） -->
      <tz-circle-comment :visible="commentVisible" :entity="commentEntity" list-api="checkin.checkin.commentList"
        :list-params="commentTarget" reply-api="checkin.checkin.comment" :id-params="commentTarget" reply-key="parent_id"
        closed-text="该打卡活动已关闭评论"
        :allow-image="false" :deletable="false" :handle-bar-like="false"
        comment-like-api="checkin.checkin.commentLike" :comment-like-params="commentTarget"
        :owner-record-id="commentTarget.checkin_id"
        @close="commentVisible = false" @like="onPopupLike" @share="shareVisible = true" @posted="onCommentPosted" />

      <!-- 任务级分享半屏：type=checkin_task 走 Links 的新类型，链接落在本页（src 只给 task_id，
           活动由后端按任务行反推，故分享出去的卡片与海报二维码都能直达这条任务） -->
      <!-- 海报画这一条任务的名称与所属活动封面，取本页 taskDetail 已加载的 task
           （内容卡只有「封面 + 标题」，活动名不再挤成第三行；扫进去落的就是这条任务的详情页） -->
      <share-modal :visible="shareVisible" type="checkin_task" :val="task.id" @close="shareVisible = false"
        :title="task.title" :cover="task.checkin_cover" />
    </view>

    <!-- 任务/活动不可访问（任务已隐藏 / 活动未上架 / 网络异常）：给一处可读原因，不再只留一秒的 toast（M13） -->
    <u-empty v-if="!loading && notFound" :text="loadMsg" icon="/static/image/empty.png" width="70" height="70" margin-top="80"></u-empty>

    <!-- 底部导航 + 版权页脚：打卡模块各页同一档（tz-tab-bar 只在本页被配成底部导航项时渲染） -->
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>
<style>
@import "./css.css";
</style>
