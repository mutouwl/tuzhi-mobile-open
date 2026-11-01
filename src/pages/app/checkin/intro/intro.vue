<template>
  <!-- 打卡介绍页（商品详情形态，版式借教务详情页 pages/app/school/package/detail 的「封面 + 卡片区块 + 吸底操作栏」）：
       未参与的打卡活动从「我的打卡」列表进本页，看完介绍再参与（免费/付费/密码兑换/绑定课程/指定学员），
       参与成功后进打卡主页（M-P2）；已参与的活动仍由列表直接进主页。
       本页无需登录即可浏览（分享出去的落地页，取数走 checkin.intro.detail / auth=false）：
       参与类按钮仍全部 auth=true，未登录点它们由请求层统一弹「请登录后继续操作」并记住回跳路径，
       页面自己不再写一套登录守卫。
       打卡没有多规格：不引入套餐页的「选择套餐」行 / 规格选择弹窗 / 多规格价格，付费价就是活动自己的单一 price。
       页面根走 .school-page + .school-page--bar：底部留白跟着常驻的吸底参与栏走 -->
  <view class="school-page school-page--bar">
    <!-- 首屏骨架屏（替代整页 Loading）：外壳与真实区块逐块对齐（16:9 封面 + 标题标签卡 + 打卡信息卡 + 活动介绍卡），
         仅在请求中且未拿到详情时出现，onShow 静默刷新不再闪骨架（与教务详情页 package/detail 同一口径） -->
    <view v-if="loading">
      <view class="cdi-sk-banner"></view>
      <view class="school-sk-card">
        <u-skeleton :loading="true" :animate="true" :title="true" title-width="62%" title-height="20" :rows="1" :rows-width="['44%']" rows-height="14" />
        <view class="cdi-sk-tags">
          <view class="cdi-sk-tag" v-for="i in 3" :key="i"></view>
        </view>
      </view>
      <view class="school-sk-card">
        <u-skeleton :loading="true" :animate="true" :title="true" title-width="22%" title-height="16" :rows="2" :rows-width="['52%', '40%']" rows-height="14" />
      </view>
      <view class="school-sk-card">
        <u-skeleton :loading="true" :animate="true" :title="true" title-width="28%" title-height="16" :rows="3" :rows-width="['100%', '94%', '62%']" rows-height="12" />
      </view>
    </view>

    <template v-else>
      <template v-if="info">
        <!-- 顶部封面：打卡封面按 16:9 上传（后台提示 750*420），容器等比例铺满，与教务详情页顶部主图同档 -->
        <view class="cdi-banner-wrap gbd-anchor">
          <image class="cdi-banner" :src="info.cover || '/static/image/empty.png'" mode="aspectFill" @error="onCoverError" />
          <tz-group-buy-danmu v-if="gbBuyers.length" :buyers="gbBuyers" overlay />
        </view>
        <!-- 标题卡：名称 + 状态/参与方式标签 + 参与数据；付费才有价格行。
             「打卡时间/打卡模式」不在页头出现，只在下方「打卡信息」卡出一处（2026-09-25 用户点名
             「显示了两个打卡时间」——同一字段一屏只有一个落点，页头灰字行/标签与卡内信息行二选一） -->
        <view class="school-head">
          <view class="cdi-name">{{ info.title }}</view>
          <view class="cdi-tags">
            <text class="cdi-tag" v-if="stateText">{{ stateText }}</text>
            <text class="cdi-tag" v-if="joinTypeText">{{ joinTypeText }}</text>
          </view>
          <view class="cdi-stats" v-if="statsText">{{ statsText }}</view>
          <!-- 拼团价横幅回拼团区（2026-10-30 用户点名「gba-rule 拼团玩法都应该放在 gba-banner 下面，
               也包括正在拼团的列表，让拼团连成一个整体」+「上下挨在一起，不要拆分放」）：
               横幅与玩法、凑团列表在同一张卡里连着排，拼团进行中本卡参与价收起（第五轮）。 -->
          <view class="cdi-price" v-if="gbPriceShown && isPay"><text class="rmb" v-if="!isVirtualPay">￥</text><text class="num">{{ info.price }}</text><text class="coin" v-if="isVirtualPay">{{ $tools.systemConfig('coin_name') || '金币' }}</text></view>
        </view>
        <!-- 拼团区（M-P1）：压在「名称 + 标签 + 参与数据 + 参与价」那张标题卡正下方，拼团价与售卖价同一屏可比
             （写法照实物详情页）。两条入参：① `goods-type` 取后端 `ActivityForm::GOODS_TYPES` 里那一档
             `checkin`，与本页吸底「立即购买」那份 goodsList 里的 goodsType 逐字相同；
             ② `goods-id` 用本页真实的打卡活动 id（data 里的 `id`，onLoad 由 options.id 写入，
             v-if 挂在这枚上 ⇒ 首屏不带着 0 去取数）。
             「已参与」这一档不在这儿另判：后端 `Gate` 自己有「你已参与该团」那一句（同一条判据只存一处，M22），
             本页不重判一遍，也不拿它当隐藏条件（硬约束 27②：入口显隐不许依赖只有该入口自己能产生的数据）。
             `@go-pay` 只记账：导航由组件自己发，见 js.vue 的 gbGoPay -->
        <tz-group-buy-area v-if="id" ref="gbArea" goods-type="checkin" :goods-id="id" hide-danmu
          :join-team="gbJoinCtx ? gbJoinCtx.teamId : 0"
          :join-activity="gbJoinCtx ? gbJoinCtx.activityId : 0"
          :join-goods-id="gbJoinCtx ? gbJoinCtx.goodsId : 0"
          :join-spec="gbJoinCtx ? gbJoinCtx.specId : 0"
          :join-ladder="gbJoinCtx ? gbJoinCtx.ladderId : 0"
          :join-price="gbJoinCtx ? gbJoinCtx.price : 0"
          @go-pay="gbGoPay" @ready="gbReady" />
        <!-- 打卡信息：标题条 + 信息行，版式照教务教师详情页 pages/app/school/teacher/detail
             （tz-title 50px 标题条与行同压一张白卡）；行用全局 .school-cell-* 档，不抄教师页的私有类名 -->
        <view class="school-block">
          <tz-title title="打卡信息" :more="false" />
          <view class="school-cell-item" v-for="row in infoRows" :key="row.label">
            <view class="school-cell-label">{{ row.label }}</view>
            <view class="school-cell-value">
              <text class="school-cell-value-text">{{ row.value }}</text>
            </view>
          </view>
        </view>
        <!-- 关联课程（参与方式=绑定课程）：排在「打卡信息」下面（2026-09-27 用户口径「关联课程放在打卡信息下面」，
             原先压在「活动介绍」之后，富文本一长就要滚很久才看得到这门课）；
             区块标题走 tz-title（与本页「打卡信息」「活动介绍」同一条 50px 标题档），
             课程本身用课程列表卡 tz-course（与「我的打卡」那两处列表同一只组件，M24：磨砂标签/名称/灰字简介/
             底行价格四个落点全由课程卡给，卡字段整行取后端下发的 info.course，前端不再拼一份课程卡样式）；
             圆角走课程卡自己的 round 档 10px（与搜索页/收藏页/小组页同一写法，不在这页另定一档数值）；
             白底区块与左右内衬跟「活动介绍」那一份一致（.school-block + tz-box 0 15px 15px），
             navigate=false：落点是本页 goCourse 那条守卫（取不到课程 id 要说一句，不静默） -->
        <view class="school-block" v-if="courseCard">
          <tz-title title="关联课程" :more="false" />
          <tz-box padding="0 15px 15px">
            <tz-course :list="[courseCard]" :round="true" :navigate="false" @click="goCourse" />
          </tz-box>
        </view>
        <!-- 活动介绍：区块标题用 tz-title（与教务详情页同款 50px 标题条），正文走 tz-parse 富文本 -->
        <view class="school-block">
          <tz-title title="活动介绍" :more="false" />
          <tz-box padding="0 15px 15px">
            <tz-parse v-if="detailHtml" :content="detailHtml" />
            <u-empty v-else icon="/static/image/empty.png" width="70" height="70" text="暂无活动介绍" />
          </tz-box>
        </view>
      </template>
      <!-- 活动不可访问（未上架 / 不存在 / 网络异常）：落整页空态并保留后端给的原因，不再只留一秒的 toast -->
      <view class="school-empty-box" v-else>
        <u-empty icon="/static/image/empty.png" width="70" height="70" :text="loadMsg"></u-empty>
      </view>
    </template>

    <!-- 吸底参与栏：按参与条件渲染主操作（免费参与/立即购买/输入密码参与/购买课程后参与/仅受邀学员），
         已参与给「进入打卡」，活动结束或已过参与截止给只读提示 —— 同屏只出一个主操作。
         绑定课程分两态：已购关联课程 → 加入打卡；未购 → 跳课程详情看课/购课（回来时 onShow 已刷新成前一态）。
         版式照教务详情页 package/detail 的 .school-footer + u-button type=primary -->
    <view class="school-footer cdi-footer h5-bottom-bar" v-if="!loading && info">
      <!-- 被拉黑：只出后端那一句原因（逐字同 checkin.checkin.join 被拒时的文案），不再摆任何可点的参与按钮
           ——拉黑只能由后台解除，这里留着「免费参与/立即购买」就是一枚点了必被拒的死按钮 -->
      <view class="cdi-join-tip" v-if="isBlack">你已被拉黑，无法参与本打卡活动</view>
      <u-button class="cdi-main-btn" type="primary" text="进入打卡" @click="goHome()" v-else-if="isMember"></u-button>
      <view class="cdi-join-tip" v-else-if="joinClosed">{{ joinClosedText }}</view>
      <u-button class="cdi-main-btn" type="primary" text="免费参与" @click="doJoin" v-else-if="joinType == 'free'"></u-button>
      <block v-else-if="joinType == 'pay'">
        <view class="cdi-join-price"><text v-if="!isVirtualPay">¥</text><text>{{ info.price }}</text><text class="cdi-join-coin" v-if="isVirtualPay">{{ $tools.systemConfig('coin_name') || '金币' }}</text></view>
        <!-- 拼团档：与「立即购买」并排（竞品 07 图：售卖 + 发起拼团）。
             `gbEntry` 空（无活动/未装插件）时不出这一枚，本行与改造前逐字相同；
             按钮本体是全站共用的 `tz-group-buy-btn`（两行：立即开团 + 拼团价；
             底色那条红橙渐变只存组件一处，不在页面里另写色值）。
             **我正在这一场拼团里已有进行中的团（`gbInTeam`）→ 「立即购买」收起**（PRD 2026-10-27）：
             底栏只留「查看拼团详情」这一个出口，不留一枚点了会被后端拒的死按钮 -->
        <tz-group-buy-btn v-if="gbEntry" class="cdi-main-btn" :text="gbEntry ? gbEntry.text : ''" :price="gbEntry ? gbEntry.price_text : ''" @open="openGb" />
        <u-button class="cdi-main-btn" type="primary" text="立即购买" @click="goBuy" v-if="!gbInTeam && !gbJoinMode"></u-button>
      </block>
      <u-button class="cdi-main-btn" type="primary" text="输入密码参与" @click="pwdVisible = true" v-else-if="joinType == 'password'"></u-button>
      <u-button class="cdi-main-btn" type="primary" text="加入打卡" @click="doJoin" v-else-if="joinType == 'course' && hasCourse"></u-button>
      <u-button class="cdi-main-btn" type="primary" text="购买课程后参与" @click="goCourse" v-else-if="joinType == 'course'"></u-button>
      <view class="cdi-join-tip" v-else>本活动仅受邀学员可参与</view>
    </view>

    <!-- 密码兑换：与课程详情页/打卡主页同款居中弹窗（u-modal + u-input），兑换成功即进主页 -->
    <u-modal :show="pwdVisible" title="输入兑换密码" :showCancelButton="true" :closeOnClickOverlay="true"
      @close="pwdVisible = false" @confirm="doPasswordJoin" @cancel="pwdVisible = false">
      <u-input v-model="password" placeholder="请输入兑换密码" type="password"></u-input>
    </u-modal>

    <!-- 悬浮快捷导航钮：与课程/校区/教师/套餐/实物详情页同一只组件（M17，落点照套餐详情页 pkg detail）；
         本页有吸底参与栏但无发布钮，不存在打卡主页那页「与 48px 发布钮重叠所以要自造 .cd-more-btn」的情形 -->
    <tz-hover-btn />
    <!-- 底部导航 + 版权页脚：打卡模块各页同一档（tz-tab-bar 只在本页被配成底部导航项时渲染） -->
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>
<style>
@import "./css.css";
</style>