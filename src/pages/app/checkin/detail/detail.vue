<template>
  <!-- 底部留白档（.school-page--bar = 90）跟着吸底栏走：已参与后本页没有吸底栏，
       留白交回 .school-page 的 20 + 页尾 tz-footer 自带的高度 -->
  <view class="school-page" :class="{ 'school-page--bar': showFooterBar }">
    <!-- 首屏骨架屏（替代整页 Loading）：外壳直接用真实区块的 .school-block .school-head / .school-card
         （通栏直角、无阴影、内衬一致），灰块与真实版式逐块对齐（活动卡 封面88x60 + 标题/日期 + 四个工具入口 + 任务卡），
         仅在请求中且未拿到详情时出现，onShow 静默刷新不再闪骨架（与教务套餐/校区详情页同一口径） -->
    <block v-if="loading">
      <view class="school-block school-head cd-head">
        <view class="cd-sk-row">
          <view class="cd-sk-cover"></view>
          <view class="cd-sk-text">
            <!-- rows-width 用数组传值：u-skeleton 对单行列表会把「最后一行」宽度写死成 70%，传字符串不生效 -->
            <u-skeleton :loading="true" :animate="true" :title="true" title-width="70%" title-height="17" :rows="1" :rows-width="['46%']" rows-height="12" />
          </view>
        </view>
        <view class="cd-sk-tools">
          <view class="cd-sk-tool" v-for="i in 4" :key="i"></view>
        </view>
      </view>
      <view class="school-card" v-for="i in 3" :key="'t' + i">
        <u-skeleton :loading="true" :animate="true" :title="true" title-width="58%" title-height="16" :rows="2" :rows-width="['80%', '34%']" rows-height="12" />
        <view class="cd-sk-btn"></view>
      </view>
    </block>
    <view v-if="!loading && info">
      <!-- 头部：通栏白卡（.school-block 白底无圆角无阴影 + .school-head 内衬 14/16，照套餐详情头部卡），
           卡内是封面缩略 + 名称/日期 + 分隔线下的工具入口行。
           整块信息区（封面/名称/日期）可点，进打卡介绍页看基本信息 —— 工具行自己带 @tap，
           只绑在 .cd-head-row 上，点工具按钮不会冒泡多开一层介绍页。
           工具行是「图标+文字」型按钮：按用户口径（2026-09-25）文字要大于图标——文字走正文档 14px、
           图标墨迹归一 12px（下方四处 :size 由 `python tools/icon-ink-normalize.py 12 名字` 反算，
           与「行内图标墨迹 ≈16px 配 12px 标签」那一档分开，不混用） -->
      <view class="school-block school-head cd-head">
        <view class="cd-head-row" @tap="goIntro">
          <image class="cd-cover" :src="info.cover || '/static/image/empty.png'" mode="aspectFill" @error="onCoverError" />
          <view class="cd-head-text">
            <!-- 标题行：活动名 + 右侧搜索入口同一行（用户 2026-09-26 口径「搜索按钮与 cd-title 水平、靠右显示」）。
                 入口挂在 .cd-head-row 里面，必须 @tap.stop：整块信息区进介绍页，点搜索不能再冒泡多开一层（M19） -->
            <view class="cd-title-row">
              <view class="cd-title">{{ info.title }}</view>
              <view class="cd-head-search" @tap.stop="goFeedSearch">
                <tz-icon name="search" :size="20" color="#4e5969" />
              </view>
            </view>
            <view class="cd-date">{{ dateText }}</view>
          </view>
        </view>
        <view class="cd-tools">
          <view class="cd-tool" @tap="goRank"><tz-icon name="paixu" :size="14" color="#4e5969" /><text class="cd-tool-text">排行榜</text></view>
          <view class="cd-tool" @tap="goRecord"><tz-icon class="cd-ic-mid" name="tasklist" :size="14" color="#4e5969" /><text class="cd-tool-text">打卡记录</text></view>
          <view class="cd-tool" @tap="goMember"><tz-icon name="group" :size="13" color="#4e5969" /><text class="cd-tool-text">成员</text></view>
          <view class="cd-tool" @tap="shareVisible = true"><tz-icon name="share" :size="14" color="#4e5969" /><text class="cd-tool-text">分享</text></view>
        </view>
      </view>

      <!-- 任务/动态 tab：吸顶带里只放页签行（与教务预约/套餐/校区列表同款，带里只有白底页签），
           两栏的控件行一律留在列表容器里走灰底，见下方 .cd-chips -->
      <u-sticky bgColor="#fff" :offsetTop="0">
        <view class="cd-tabs">
          <view :class="['cd-tab', tabIndex === 0 ? 'cd-tab-active' : '']" @tap="switchTab(0)">
            <text>任务</text>
            <view class="cd-tab-line" v-if="tabIndex === 0"></view>
          </view>
          <view :class="['cd-tab', tabIndex === 1 ? 'cd-tab-active' : '']" @tap="switchTab(1)">
            <text>日记</text>
            <view class="cd-tab-line" v-if="tabIndex === 1"></view>
          </view>
          <view class="cd-tab-cal" @tap="goTaskCalendar"><u-icon name="calendar" size="22" color="#1d2129"></u-icon></view>
        </view>
      </u-sticky>

      <!-- 任务栏：列表区走 .school-cards（左右留边 10），任务卡由 tz-checkin-task-card 按直角卡口径渲染。
           切页签/切「待完成·全部任务」/切排序都会重拉任务并只给这块列表铺骨架屏（chip 与页签留在骨架外保持可点） -->
      <view class="school-cards" v-if="tabIndex === 0">
        <view class="cd-chips">
          <view :class="['cd-chip', taskFilter === 'pending' ? 'cd-chip-active' : '']" @tap="setTaskFilter('pending')">待完成({{ pendingCount }})</view>
          <view :class="['cd-chip', 'cd-chip-all', taskFilter === 'all' ? 'cd-chip-active' : '']" @tap="setTaskFilter('all')">全部任务({{ info.task_total }})</view>
          <!-- 活动级的玩法/频率提示不再各占一行常驻灰字（三行压在列表上方会把第一条任务挤出首屏）：
               只留一枚提示图标，排在排序按钮左侧同一排，点开的半屏里逐条列全（见下方 ruleTips 与「规则说明」弹层）。
               判据只留 ruleTips 一处，一条规则都没有时整枚图标不出，不留点不开的空入口（M13）；
               它一收，排序仍是右组唯一一枚，位置不动 -->
          <view class="cd-rule" v-if="ruleTips.length" @tap="ruleVisible = true">
            <u-icon class="cd-ic-mid" name="info-circle" size="17" color="#86909c"></u-icon>
          </view>
          <!-- 排序控件与「待完成/全部任务/精选」是同一类按钮，一律复用 .cd-chip 的灰底版式，
               只在自己的类里补布局（图标与文字间距、作为右组末项收掉右间距）；靠右不由它自己撑，
               由左组末项 .cd-chip-all 的 margin-right:auto 给出（与动态栏 .cd-chip-featured 同一份写法）；
               动态栏那排 chip 与本行同挂 .cd-chips、同进 .school-cards，行底色与按钮底色只存这一处，两栏不会再分叉 -->
          <view class="cd-chip cd-chip-sort" @tap="toggleTaskOrder">
            <tz-icon class="cd-ic-mid" :name="taskOrder === 'asc' ? 'zhengxu2' : 'daoxu'" :size="16" color="#86909c" />
            <text>{{ taskOrder === 'asc' ? '正序' : '倒序' }}</text>
          </view>
        </view>
        <!-- 剩余补卡次数是当下的余额不是规则，仍留在行内（原来它就排在 per_day_tip 的 else 分支里，
             per_day_tip 搬进弹层后把这条互斥判据显式写出来，渲染结果与改版前逐字一致） -->
        <view class="cd-tip" v-if="!info.per_day_tip && info.makeup_left > 0">剩余补打卡： {{ info.makeup_left }} 次</view>
        <block v-if="taskLoading">
          <view class="school-card" v-for="i in 3" :key="'tsk' + i">
            <u-skeleton :loading="true" :animate="true" :title="true" title-width="58%" title-height="16" :rows="2" :rows-width="['80%', '34%']" rows-height="12" />
            <view class="cd-sk-btn"></view>
          </view>
        </block>
        <block v-else>
          <!-- 按章节分组（版式与结构照抄专栏课程目录 column-dir：章节标题行 + 其下条目行，
               未分章的任务平铺在章块之后）。没建章节时 taskGroups 只有一个无名分组，与分组前一模一样；
               可见性判据只在 shownTasks 一处（原来卡片上还挂了一道重复的 pending 判据，两处会分叉，收进一处） -->
          <block v-for="group in taskGroups" :key="group.key">
            <view class="cd-chapter" v-if="group.title">
              <text class="cd-chapter-name">{{ group.title }}</text>
              <text class="cd-chapter-count">({{ group.tasks.length }}个任务)</text>
            </view>
            <tz-checkin-task-card v-for="task in group.tasks" :key="task.id" :task="task" @go="goSubmit(task)" />
          </block>
          <!-- 两档的取行都由后端逐行的 pending 标记筛出来（见 js.vue 的 shownTasks），这一栏空了就是真的没有行，
               判据只留 shownTasks 一处；文案跟着当前这一档说：「全部任务」为空是整个活动没有可见任务，
               不是「暂无待办」 -->
          <view class="cd-empty-task" v-if="!shownTasks.length">
            <u-empty icon="/static/image/empty.png" width="70" height="70" />
            <view class="cd-empty-text">{{ taskFilter === 'pending' ? '暂无待办，可发表普通日记打卡' : '暂无任务' }}</view>
          </view>
        </block>
      </view>

      <!-- 动态栏：同样走 .school-cards，动态卡由 tz-checkin-record-card 按直角卡口径渲染；
           刷新（切页签/精选/排序/筛选）只铺这块骨架屏，骨架与真实卡同版式（头像 + 两行 + 底部动作行）
           控件行与任务栏同一份 .cd-chips / .cd-chip：同一个列表容器给灰底与左右留边，
           两栏的底色、内衬、按钮底色都由同一处规则给出，不会再一栏灰底一栏白底 -->
      <view class="school-cards" v-if="tabIndex === 1">
        <view class="cd-chips">
          <!-- 「全部 / 精选」是同一根维度的两个选项（与任务栏「待完成 / 全部任务」同一档写法），默认选中「全部」；
               左组仍由末尾的精选用 margin-right:auto 把排序、时间筛选推到右边 -->
          <view :class="['cd-chip', feedOnlyFeatured ? '' : 'cd-chip-active']" @tap="setFeedFeatured(false)">全部</view>
          <view :class="['cd-chip', 'cd-chip-featured', feedOnlyFeatured ? 'cd-chip-active' : '']" @tap="setFeedFeatured(true)">精选</view>
          <view class="cd-chip cd-feed-sort" @tap="toggleFeedOrder">
            <tz-icon class="cd-ic-mid" :name="feedOrder === 'asc' ? 'zhengxu2' : 'daoxu'" :size="16" color="#86909c" /><text>{{ feedOrder === 'asc' ? '正序' : '倒序' }}</text>
          </view>
          <view class="cd-chip cd-feed-filter" @tap="filterVisible = true">
            <tz-icon class="cd-ic-mid" name="shijianfanwei2" :size="19" :color="filterActive ? '#0968f6' : '#86909c'" />
            <text :style="{ color: filterActive ? '#0968f6' : '#86909c' }">{{ feedFilterLabel }}</text>
          </view>
        </view>
        <block v-if="feedLoading">
          <view class="school-card cd-sk-feed" v-for="i in 3" :key="'fsk' + i">
            <view class="cd-sk-row">
              <view class="cd-sk-avatar"></view>
              <view class="cd-sk-text">
                <u-skeleton :loading="true" :animate="true" :title="true" title-width="38%" title-height="15" :rows="1" :rows-width="['56%']" rows-height="12" />
              </view>
            </view>
            <u-skeleton :loading="true" :animate="true" :title="false" :rows="2" :rows-width="['92%', '64%']" rows-height="14" />
            <view class="cd-sk-foot">
              <view class="cd-sk-foot-time"></view>
              <view class="cd-sk-foot-act"></view>
            </view>
          </view>
        </block>
        <block v-else>
          <tz-checkin-record-card v-for="record in feed" :key="record.id" :record="record" :checkin-id="id"
            @detail="goDiary" @like="onLike" @comment="openComment" @refresh="loadFeed(true)" />
          <u-empty icon="/static/image/empty.png" width="70" height="70" v-if="!feed.length" :text="feedError || '还没有人打卡，快来发第一条'" />
          <u-loadmore :status="feedLoadStatus" v-if="feed.length && feedLoadStatus !== 'nomore'"></u-loadmore>
        </block>
      </view>

      <!-- 发布动态入口：照抄动态模块（pages/app/circle/index）的右侧悬浮圆钮档，不再占吸底栏。
           出现条件沿用原吸底栏「打卡」按钮的口径（后端 can_submit：已参与且未暂停），
           点击仍走 goSubmit(null) = 不选任务的普通动态提交，守卫提示逻辑一处不改 -->
      <view class="cd-publish-btn" :class="{ disabled: !canPublish }" @tap="goSubmit(null)" v-if="info.can_submit == 1">
        <tz-icon name="brush_fill" :size="24" color="#86909C" />
      </view>

      <!-- 悬浮「更多」入口：档位照抄动态模块（pages/app/circle/index）的 .more-btn，落在发布钮正下方一档
           （发布钮 bottom 160 占 48px，本钮 bottom 100）。不直接用 tz-hover-btn，是因为那份固定 right:20/bottom:140，
           与本页 48px 的发布钮会重叠；弹窗内容与动态模块同一份快捷导航 -->
      <view class="cd-more-btn" @tap="moreNavVisible = true">
        <tz-icon name="manage" :size="24" color="#86909C" />
      </view>

      <!-- 吸底操作栏：只留未参与时的参与/购买入口（免费/付费/密码/购课/受邀）。未参与进本页会被
           getData 自动 redirectTo 到介绍页（js.vue redirectToIntro），这条栏只在替换失败时兜底出现。
           绑定课程分两态（与打卡介绍页同一口径）：已购关联课程 → 加入打卡；未购 → 跳课程详情看课/购课。
           已参与的「打卡」上移成右侧悬浮按钮，与上面那条互斥 —— 同屏只出一个主操作，
           不再出现「吸底栏 + 悬浮圆钮」并排（版式照抄教务套餐详情 package/detail 的 .school-footer + u-button type=primary） -->
      <view class="school-footer h5-bottom-bar" v-if="showFooterBar">
        <!-- 被拉黑（只在替换到介绍页失败时才会在这条兜底栏上看到）：说原因，不摆一枚点了必被后端拒的参与按钮 -->
        <view class="cd-join-tip" v-if="info.is_black == 1">你已被拉黑，无法参与本打卡活动</view>
        <u-button class="cd-main-btn" type="primary" text="免费参与" @click="doJoin" v-else-if="info.join_type == 'free'"></u-button>
        <block v-else-if="info.join_type == 'pay'">
          <view class="cd-join-price"><text v-if="!isVirtualPay">¥</text><text>{{ info.price }}</text><text class="cd-join-coin" v-if="isVirtualPay">{{ $tools.systemConfig('coin_name') || '金币' }}</text></view>
          <u-button class="cd-main-btn" type="primary" text="立即购买" @click="goBuy"></u-button>
        </block>
        <u-button class="cd-main-btn" type="primary" text="输入密码参与" @click="pwdVisible = true" v-else-if="info.join_type == 'password'"></u-button>
        <u-button class="cd-main-btn" type="primary" text="加入打卡" @click="doJoin" v-else-if="info.join_type == 'course' && info.has_course == 1"></u-button>
        <u-button class="cd-main-btn" type="primary" text="购买课程后参与" @click="goCourse" v-else-if="info.join_type == 'course'"></u-button>
        <view class="cd-join-tip" v-else>本活动仅受邀学员可参与</view>
      </view>

      <!-- 悬浮「更多」的快捷导航弹窗：与动态模块 / tz-hover-btn 同一份内容与同一档弹层（closeable + round 10） -->
      <u-popup :show="moreNavVisible" @close="moreNavVisible = false" :closeable="true" :round="10">
        <view style="padding: 30px 10px 60px;">
          <view class="cd-more-grid">
            <view class="cd-more-item" @tap="moreNav('/pages/index/index', 'reLaunch')">
              <tz-icon name="homepage" color="#1D2129" :size="35" />
              <text>首页</text>
            </view>
            <view class="cd-more-item" @tap="moreNav('/pages/user/study/study', 'reLaunch')">
              <tz-icon name="dynamic" color="#1D2129" :size="35" />
              <text>学习中心</text>
            </view>
            <view class="cd-more-item" @tap="moreNav('/pages/order/list/list')">
              <tz-icon name="createtask" color="#1D2129" :size="35" />
              <text>订单管理</text>
            </view>
            <view class="cd-more-item" @tap="moreNav('/pages/user/index/index', 'reLaunch')">
              <tz-icon name="people" color="#1D2129" :size="35" />
              <text>个人中心</text>
            </view>
          </view>
        </view>
      </u-popup>

      <!-- 密码兑换：与课程详情页同款居中弹窗（u-modal + u-input），不再手搓弹窗按钮 -->
      <u-modal :show="pwdVisible" title="输入兑换密码" :showCancelButton="true" :closeOnClickOverlay="true"
        @close="pwdVisible = false" @confirm="doPasswordJoin" @cancel="pwdVisible = false">
        <u-input v-model="password" placeholder="请输入兑换密码" type="password"></u-input>
      </u-modal>

      <!-- 筛选半屏 -->
      <tz-filter-popup :visible="filterVisible" title="日记筛选" :sort="feedOrder" :sort-options="[{ name: '正序', value: 'asc' }, { name: '倒序', value: 'desc' }]"
        :time-filter="feedTimeFilter" :custom-range="feedCustomRange" @update:visible="filterVisible = $event" @confirm="onFilterConfirm" />

      <!-- 规则说明半屏：任务栏那枚提示图标点开这里。弹层外壳走 M6/M18 那一档，与「修改昵称」「推荐语」
           逐值一致（u-popup mode=bottom + round 12 + bgColor=transparent + closeable + safeAreaInsetBottom=false），
           标题走全局 .school-popup-title（16px/600 左对齐）；
           圆角必须由面板自己给（.u-popup__content 只有 border-radius 没有 overflow:hidden，
           里头那块白底面板是直角的，只写 :round 会被面板方角盖住——2026-09-26 用户点名「标题圆角要与其他弹窗对齐」），
           内容只把 ruleTips 逐条列出，不在这儿另存一套文案 -->
      <u-popup :show="ruleVisible" mode="bottom" :round="12" bgColor="transparent" :closeable="true" :safeAreaInsetBottom="false" @close="ruleVisible = false">
        <view class="school-popup cd-rule-popup">
          <view class="school-popup-title">规则说明</view>
          <view class="cd-rule-line" v-for="(tip, i) in ruleTips" :key="i">{{ tip }}</view>
        </view>
      </u-popup>

      <!-- 评论弹窗：与圈子动态卡片同一处实现（点卡片评论图标先弹这条日记的评论列表，
           弹窗内点「写下你的评论吧」再弹回复框，不在页面里直弹输入框）。
           接口名与目标参数由本页下发（打卡评论接口不收图片）；排序与评论点赞走打卡自己的评论接口，
           点赞接口名与参数一并下发给共用弹窗（本模块评论接口没有「删除评论」能力，那一个入口仍传 false 隐掉），
           底栏点赞（点整条动态）也交给本页走打卡的点赞接口与乐观更新 -->
      <tz-circle-comment :visible="commentVisible" :entity="commentEntity" list-api="checkin.checkin.commentList"
        :list-params="commentTarget" reply-api="checkin.checkin.comment" :id-params="commentTarget" reply-key="parent_id"
        closed-text="该打卡活动已关闭评论"
        :allow-image="false" :deletable="false" :handle-bar-like="false"
        comment-like-api="checkin.checkin.commentLike" :comment-like-params="commentTarget"
        :owner-record-id="id"
        @close="commentVisible = false" @like="onPopupLike" @share="shareVisible = true" @posted="onCommentPosted" />

      <!-- 海报画这个打卡活动的封面与名称，取本页 checkin.detail 已加载的 info；
           内容卡只有「封面 + 标题」，价格与打卡模式标签不再抄给海报（模式在详情页与扫码落点上说） -->
      <share-modal :visible="shareVisible" type="checkin" :val="id" @close="shareVisible = false"
        :title="info.title" :cover="info.cover" />
    </view>

    <!-- 活动不可访问（未上架 / 不存在 / 网络异常）：给一处可读原因，不再只留一秒的 toast -->
    <u-empty v-if="!loading && notFound" :text="loadMsg" icon="/static/image/empty.png" width="70" height="70" margin-top="80"></u-empty>

    <!-- 底部导航 + 版权页脚：打卡模块各页同一档（动态模块 / 教务模块同口径）。
         tz-tab-bar 只在「本页被配成底部导航项」时渲染（组件内部按导航配置判页路径），
         深链进来的详情页保持无导航条；tz-footer 常驻 -->
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>
<style>
@import "./css.css";
</style>
