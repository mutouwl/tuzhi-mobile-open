<template>
  <view class="school-page school-page--bar">
    <!-- 首屏骨架屏（替代整页 Loading）：外壳直接用真实区块的 .school-block（通栏、直角、无阴影），
         灰块与真实版式逐块对齐（作者卡 头像 + 一行 / 正文四行） -->
    <!-- 评论列表 / 底部栏 / 回复弹窗全部是共用组件（tz-circle-comment-list / tz-circle-comment-bar / tz-circle-reply-popup），
         本页评论区不自造一份 -->
    <block v-if="loading">
      <view class="school-block cdy-first cdy-sk-card">
        <view class="cdy-sk-row">
          <view class="cdy-sk-avatar"></view>
          <view class="cdy-sk-text">
            <u-skeleton :loading="true" :animate="true" :title="true" title-width="38%" title-height="15" :rows="1" :rows-width="['56%']" rows-height="12" />
          </view>
        </view>
      </view>
      <view class="school-block cdy-sk-card">
        <u-skeleton :loading="true" :animate="true" :title="false" :rows="4" :rows-width="['96%', '92%', '88%', '54%']" rows-height="14" />
      </view>
    </block>
    <view v-if="!loading && detail.id">
      <!-- 正文整篇一张通栏白块（.school-block 白底无圆角无阴影 + 内衬 14/16），
           与教务详情档、圈子动态详情同口径；卡内关联 chip 行（打卡名称 + 任务名称）走 4px 小元素档，
           放不下一行时整行左右滑动；语音随图片/视频走媒体九宫格。
           cdy-first = 本页第一个白块贴住页面顶部，不再留 .school-block 的 12px 上边距（照动态详情 .post-main） -->
      <view class="school-block cdy-first cdy-post">
        <!-- 作者行（头像 + 昵称）整块可点 → 他在这个活动内的打卡记录页，与动态卡头部、排行榜行、成员卡
             同一个入口（守卫与地址见 common/utils/checkin-owner.js）；官方动态没有这个人，组件内不跳
             （右上角「更多」自带 @tap.stop，点它不会冒到这一层） -->
        <view class="cdy-head" @tap="goAuthorRecord">
          <!-- 更多：与动态详情同款入口（卡片右上角），只给本人——日签图/编辑/删除三项全是「自己这条动态」的
               动作，别人的动态菜单里一项都没有，入口也就不出（is_mine 随 headPost 交给组件按圈子原判据判，
               本页不再叠第二道；2026-09-26 用户口径：日签图仅自己可见，点开没有按钮就不显示右上角按钮）；
               官方动态（is_official）没有本人操作，连入口一起隐掉 -->
          <!-- 昵称行只留「谁发的 + 第 N 天打卡」：任务名不再挂在这里（原先是 #tags 插槽里的
               tz-checkin-task-tag），与卡底那枚任务 chip 同一字段两个落点会被读成两条信息（M15④），
               现按 2026-09-26 用户口径收进卡底 chip 行，与打卡名称并排 -->
          <tz-circle-post-head :post="headPost" :type-tag="typeTag" :meta="authorMeta" :show-more="!detail.is_official" @more="moreVisible = true" />
        </view>
        <view class="cdy-content">{{ detail.content }}</view>
        <!-- 图片/视频/语音走与动态详情同一份九宫格组件（tz-circle-media-grid，三列横向排布）：
             图片点击放大预览、视频/语音开共用预览弹窗播放，本页不自造媒体区与语音条 -->
        <tz-circle-media-grid class="cdy-media" v-if="mediaList.length" :items="mediaList"
          @preview-image="previewImage" @preview-video="previewVideo" @preview-audio="previewAudio" />
        <!-- 附件：与动态详情同一份组件（tz-circle-file-list），条数不截断、点开走组件自带的 tz-file-preview -->
        <tz-circle-file-list class="cdy-files" v-if="(detail.files || []).length" :files="detail.files" preview />
        <!-- 课程卡片：官方动态挂的课（后台「发布动态」的课程列表字段），与动态流卡片同一份组件；
             详情页不像卡片只列 2 门，后台挂几门这里就列几门（口径同圈子动态详情） -->
        <view class="cdy-course" v-if="courseList.length">
          <tz-course-mini :list="courseList" :round="true" :border="true" :margin="0" />
        </view>
        <!-- 卡底「关联」chip 行：左＝打卡名称（进活动主页）、右＝任务名称（进任务详情页），
             两枚同一几何、同一描边（2026-09-26 用户口径：任务标签去掉背景色、加边框，与左侧的打卡标签一致），
             只差行首那枚图标（日历 = 所属活动 / 清单 = 所属任务）。活动名与任务名都可能是长句，
             一行放不下时整行左右滑动：scroll-view scroll-x + white-space: nowrap + 子项 inline-flex
             （与日签图的色板行同一写法），不折行、也不给某一枚加省略号——折成两列就读不出「同一行两个去处」，
             而这两枚点了都是去看那个实体本身，名字截断一半就认不出是哪条 -->
        <scroll-view scroll-x :show-scrollbar="false" class="cdy-tags">
          <!-- 打卡名称 chip 与动态流卡片同一份组件（点进活动主页）；本页是「动态流 → 日记 → 活动主页」的
               中转站，返回键该直接落回上一级，故传 replace（redirectTo，组件里那一档 prop）；
               左右留白与横排对齐只能写在宿主节点上（组件是 isolated 的，页面样式进不去内部，M12/M21） -->
          <tz-checkin-activity-tag class="cdy-activity-chip" :checkin-id="checkinId" :title="checkinTitle" replace />
          <!-- 任务 chip 与动态流卡片同一份组件、同一可点判据（task_id=0 自己不出，官方动态也不出） -->
          <tz-checkin-task-tag class="cdy-task-chip" :task-id="detail.task_id" :title="detail.task_title" />
        </scroll-view>
        <view class="cdy-time">{{ fmt(detail.createtime) }}</view>
      </view>

      <!-- 评论区整块走共用组件 tz-circle-comment-list（标题「评论 N」/头像/昵称/回复分组/骨架屏/空状态
           都在组件里，与圈子动态详情、评论弹窗一份实现），本页不再自造评论行；
           排序与评论点赞打卡接口已支持（切排序带 sort 重取、点赞回权威 like_count），只有删除评论没有接口，
           那一个入口仍传 false 隐掉（与打卡活动详情、打卡记录页的评论弹窗同一口径）；左右内衬只由外层卡片给一份（M21）；
           sticky-header：这一页正文一长就要滚出标题带，让「评论 N」+ 排序那一行吸顶（组件默认不吸，
           弹窗那几处不受影响） -->
      <view class="school-block cdy-comments">
        <tz-circle-comment-list :post="commentSubject" :loading="commentsLoading" :loaded="commentsLoaded" :empty-text="commentsMsg || '还没有评论'"
          :deletable="false" :sticky-header="true" :owner-record-id="checkinId" @reply="replyComment" @sort-change="onCommentSort" @like="onCommentLike" />
      </view>

      <!-- 底部栏：复用圈子动态详情底栏（评论入口 + 点赞 + 分享），点评论入口弹回复弹窗、
           点「分享」弹分享弹窗（share-modal，与打卡主页/打卡记录页同一份口径）；
           页内不再自造输入框，版式与安全区与动态详情一份口径 -->
      <tz-circle-comment-bar :post="barPost" :like-text="likeText" :disabled="!canComment" fixed @open="openReply" @like="onLike" @share="shareVisible = true" />
    </view>

    <!-- 日记不可见（已删除 / 活动未上架 / 无权限）：给后端返回的原因，不再白屏 -->
    <u-empty v-if="!loading && !detail.id" :text="loadMsg || '日记不存在或已删除'" icon="/static/image/empty.png" width="70" height="70" margin-top="80"></u-empty>

    <!-- 更多：半屏操作菜单（M18，不自造图标网格；标题 + 顶部圆角 10 与全站同一档） -->
    <u-action-sheet :show="moreVisible" title="更多操作" :round="10" :actions="moreActions" cancelText="取消" :closeOnClickOverlay="true"
      @select="onMoreSelect" @close="moreVisible = false"></u-action-sheet>

    <!-- 回复弹窗：与圈子动态详情共用组件，打卡评论接口不收图片（allow-image=false），
         目标参数与接口名由调用方下发，弹窗自身不写死圈子口径 -->
    <tz-circle-reply-popup ref="replyPopup" api="checkin.checkin.comment" :id-params="commentTarget" reply-key="parent_id" :allow-image="false" @posted="onCommentPosted" />

    <!-- 分享弹窗：与打卡主页、打卡记录页同一份（分享这个打卡活动：图文文案 / 海报二维码两栏）。
         日记没有独立的分享链接口径（微信卡片另走 checkin-share 的标题封面），链接统一落到活动页，
         否则非成员/仅管理员可见的日记分享出去是「该日记不可见」空态 -->
    <!-- 海报画这一条日记的封面/名称，复用本页已有的 shareTitle / shareCover（checkin-share 口径，取本页已加载的 detail） -->
    <share-modal :visible="shareVisible" type="checkin" :val="checkinId" @close="shareVisible = false"
      :title="shareTitle" :cover="shareCover" />

    <!-- 媒体预览弹窗：九宫格里点视频/语音后播放（与动态详情共用 tz-file-preview）；图片不走弹窗，走系统放大预览 -->
    <tz-file-preview :visible="previewVisible" :data="previewData" @close="previewVisible = false" />

    <!-- 日签图弹层（底部弹层：海报在上，选样式与保存/分享在下）：卡内「保存」「分享」两枚按钮的端上差别
         都在组件里判（保存见 exportPoster，分享见 share：小程序调微信图片分享面板、微信内 H5 提示右上角「···」，
         只剩普通浏览器/App 那一端由组件自己复制活动链接——这条兜底收在组件里，与动态列表卡「更多→日签图」
         共用一份实现，本页不再各存一份 shareLink）；
         金句库（quotes）与分享背景图（share_bgs）随这条日记的详情一起下发，弹层里「换一条」、换底图都是本地动作，
         不在前端写死语录与样式；右下角那张码按端取（H5 二维码 / 小程序码），落点是 checkinId 这个活动的主页，
         与下面 share-modal、上面 chip 进的活动主页同一个去处 -->
    <tz-checkin-daily-card :show="dailyShow" :checkin-id="checkinId" :checkin-title="checkinTitle" :nickname="detail.nickname" :avatar="detail.avatar"
      :total-days="detail.total_days || daySeq || 1" :quotes="detail.quotes" :share-bgs="detail.share_bgs" @close="dailyShow = false" />

    <!-- 底部导航 + 版权页脚：打卡模块各页同一档（与圈子动态详情 pages/app/circle/post/detail 同一份写法）。
         tz-tab-bar 只在本页被配成底部导航项时渲染，普通从动态列表进来的详情页不会出现，不压吸底评论栏 -->
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>
<style>
@import "./css.css";
</style>
