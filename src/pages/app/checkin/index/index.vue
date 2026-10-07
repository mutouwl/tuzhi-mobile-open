<template>
  <view class="school-page">
    <!-- 顶部页签带（吸顶）：主页签 +「参与的打卡」下的子页签同在一个 u-sticky 里，
         页面向下滚动时两行一起吸顶（2026-09-27 用户口径：顶部 Tabs 吸顶，第一个 Tab 的子 Tab 也要跟随一并吸顶）；
         页签版式照订单列表页 pages/order/list（白底 + 裸 u-tabs 一行，不自造页签壳），带底白底与下方列表区分（M5）。
         带里只放这两行（主页签 u-tabs + 子页签 u-subsection）——子页签的切换只换列表条件，不换页面身份，故留在带内随之一并吸顶 -->
    <u-sticky bgColor="#fff" :offsetTop="0">
      <u-tabs :list="tabs" :current="current" lineColor="#0968f6" :scrollable="true" @change="tabChange"></u-tabs>
      <!-- 子页签用分段器 u-subsection：只在第一个页签下出现，第二个页签没有下级。三档口径全在后端：
           最近加入/最近使用是排序、今日任务是筛选（闸门链，M22），前端只把 sort 传下去，
           不本地重排、也不自己判「今天有没有任务」。
           尺寸与配色一律走 uview 默认（activeColor #0968f6 已在组件默认里），与券包列表
           pages/app/coupon/my、学习数据 pages/user/study、分销订单页同一档，不在这儿另调一档；
           list 传对象数组时组件按 keyName（默认 name）取文字，sort 那一列照样跟着行走 -->
      <view class="mck-sub-bar" v-if="current === 0">
        <u-subsection :list="subTabs" :current="subCurrent" @change="subTabChange"></u-subsection>
      </view>
    </u-sticky>

    <!-- ===== 页签一：参与的打卡 ===== -->
    <!-- 列表容器走教务全局档 .school-cards 的分隔线变体 .school-cards--divided（App.vue 一处给，
         两页打卡列表共用）；条目卡 tz-checkin-activity-card 内部直接复用课程列表卡 tz-course 的分隔线档，
         卡的高矮、封面圆角、标签、进度与价格位一律与课程卡同一份实现，本页不再定样式 -->
    <view class="school-cards school-cards--divided" v-if="current === 0">
      <!-- 首屏骨架屏（替代整页 Loading）：骨架块与真实卡同一只组件渲染（:loading="true"），
           改卡版式时不会出现「真实卡变了、骨架还是老尺寸」；只在「请求中且列表为空」时出现，
           上拉翻页由已有列表继续展示（与教务套餐列表 package/list 同一口径） -->
      <block v-if="loading && !list.length">
        <tz-checkin-activity-card v-for="i in 3" :key="i" :loading="true" />
      </block>
      <block v-else>
        <!-- 本页只铺「我参与的」：导航栏标题已是「我的打卡」，列表上方不再叠一段同名标题 -->
        <tz-checkin-activity-card
          v-for="item in list"
          :key="item.id"
          :item="item"
          :attr="attr"
          @open="goDetail"
        />
        <u-empty icon="/static/image/empty.png" width="70" height="70" v-if="!list.length" :text="listEmptyText" />
        <u-loadmore :status="loadStatus" v-if="list.length && loadStatus !== 'nomore'"></u-loadmore>
      </block>
    </view>

    <!-- ===== 页签二：发布的日记 ===== -->
    <!-- 跨活动的日记列表（我在每个打卡里发布过的），条目卡与活动主页动态栏、动态搜索页同一只
         tz-checkin-record-card（版式与打卡 Tag / 任务 Tag 都在卡里，本页不再自抄一份） -->
    <view class="school-cards" v-else>
      <!-- 骨架屏（M16）：与真实卡逐块对齐（头像 36 + 昵称行 / 正文两行 / 底部时间+动作行），
           数值与动态搜索页 .cks-sk-* 同一档（同一只卡片的同一版式） -->
      <block v-if="diaryLoading && !diaryList.length">
        <view class="school-card" v-for="i in 3" :key="'dsk' + i">
          <view class="mck-sk-row">
            <view class="mck-sk-avatar"></view>
            <view class="mck-sk-text">
              <!-- rows-width 用数组传值：u-skeleton 对单行列表会把「最后一行」宽度写死成 70%，传字符串不生效 -->
              <u-skeleton :loading="true" :animate="true" :title="true" title-width="38%" title-height="15" :rows="1" :rows-width="['56%']" rows-height="12" />
            </view>
          </view>
          <u-skeleton :loading="true" :animate="true" :title="false" :rows="2" :rows-width="['92%', '64%']" rows-height="14" />
          <view class="mck-sk-foot">
            <view class="mck-sk-foot-time"></view>
            <view class="mck-sk-foot-act"></view>
          </view>
        </view>
      </block>
      <block v-else>
        <!-- 整卡与卡片脚的评论图标都进这条日记详情（复用现有日记页 pages/app/checkin/diary，
             与动态搜索页同一落点：那一页点评论也是 goDiary，评论栏与分享都在详情页自带）；
             点赞在本页乐观更新，本人日记删除后重取当前这一份结果 -->
        <tz-checkin-record-card v-for="record in diaryList" :key="record.id" :record="record"
          :checkin-id="record.checkin_id" @detail="goDiary" @comment="goDiary" @like="onLike" @refresh="reloadDiary" />
        <u-empty icon="/static/image/empty.png" width="70" height="70" v-if="!diaryList.length"
          :text="diaryFailMsg || '还没有发布日记'" margin-top="60" />
        <u-loadmore :status="diaryLoadStatus" v-if="diaryList.length && diaryLoadStatus !== 'nomore'"></u-loadmore>
      </block>
    </view>

    <!-- 底部导航 + 版权页脚：打卡模块各页同一档（tz-tab-bar 只在本页被配成底部导航项时渲染，自带占位不压内容） -->
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>
<style>
@import "./css.css";
</style>
