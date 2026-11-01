<template>
  <view class="circle-presale" :class="{ 'has-footer-bar': info }" :style="(info && tabbarVisible && tabbarHeight) ? ('padding-bottom:' + (80 + tabbarHeight) + 'px;') : ''">
    <!-- 首屏骨架屏（M16）：外壳复用真实版式那一档的类（.cover-wrap 16:9、.info-card 白底 15 内衬、
         .tab-card 白卡），灰块只往容器内部放，压在白底上取 #e5e6eb。
         「详情 / 动态预览」两枚页签名与底部操作栏是 v-if/v-show 才判的，不在骨架里预留。 -->
    <view v-if="loading" class="ps-sk">
      <view class="cover-wrap">
        <view class="ps-sk-cover"></view>
      </view>
      <view class="info-card">
        <view class="ps-sk-line ps-sk-h22 ps-sk-w30"></view>
        <view class="ps-sk-line ps-sk-h16 ps-sk-w70"></view>
        <view class="ps-sk-line ps-sk-h12 ps-sk-w88"></view>
        <view class="ps-sk-line ps-sk-h12 ps-sk-w45"></view>
      </view>
      <view class="tab-card">
        <view class="ps-sk-tabs">
          <view class="ps-sk-line ps-sk-h14 ps-sk-w56"></view>
          <view class="ps-sk-line ps-sk-h14 ps-sk-w70"></view>
        </view>
        <view class="tab-body">
          <view class="ps-sk-line ps-sk-h12 ps-sk-w92"></view>
          <view class="ps-sk-line ps-sk-h12 ps-sk-w96"></view>
          <view class="ps-sk-line ps-sk-h12 ps-sk-w88"></view>
          <view class="ps-sk-line ps-sk-h12 ps-sk-w64"></view>
        </view>
      </view>
    </view>

    <!-- 圈子不存在/已下架等状态异常：空状态 + 对应说明（文案以后端返回为准） -->
    <view v-if="!loading && !info" class="presale-empty">
      <u-empty :text="loadMsg || '圈子不存在'" icon="/static/image/empty.png" width="70" height="70" margin-top="80"></u-empty>
    </view>

    <view v-if="!loading && info">
      <!-- 封面区（参照课程详情页 banner：整图展示 16:9，无文字浮层） -->
      <view class="cover-wrap gbd-anchor">
        <image class="cover" :src="info.cover" mode="aspectFill" />
        <tz-group-buy-danmu v-if="gbBuyers.length" :buyers="gbBuyers" overlay />
      </view>

      <!-- 信息区（参照课程详情页 course-info：白底卡片，价格/标题/副标题） -->
      <view class="info-card">
        <!-- 拼团价横幅回拼团区（2026-10-30 用户点名「bga-rule 拼团玩法都应该放在 gba-banner 下面，
             也包括正在拼团的列表，让拼团连成一个整体」+「上下挨在一起，不要拆分放」）：
             横幅与玩法、凑团列表在下面那张卡里连着排，拼团进行中本卡价格行收起（第五轮；免费行同样收起）。 -->
        <view class="price-row" v-if="gbPriceShown && info.sell_type == 2">
          <template v-if="!isVirtualPay">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ currentSpec ? currentSpec.price : minPrice }}</text>
            <text class="price-marking" v-if="currentSpec && currentSpec.marking_price && Number(currentSpec.marking_price) > Number(currentSpec.price)">¥{{ currentSpec.marking_price }}</text>
          </template>
          <template v-else>
            <text class="price-value">{{ currentSpec ? (currentSpec.virtual_price || currentSpec.price) : minPrice }}</text>
            <text class="coin-name">{{ coinName }}</text>
          </template>
        </view>
        <view class="price-row free-row" v-else-if="gbPriceShown"><text class="free-tag">免费</text></view>
        <view class="cover-name">{{ info.name }}</view>
        <view class="cover-subtitle" v-if="info.intro">{{ info.intro }}</view>
        <view class="cover-stat" v-if="info.show_member_count == 1 && info.show_post_count == 1">{{ info.member_count }}人加入 · {{ info.post_count }}条动态</view>
        <view class="cover-stat" v-else-if="info.show_member_count == 1">{{ info.member_count }}人加入</view>
        <view class="cover-stat" v-else-if="info.show_post_count == 1">{{ info.post_count }}条动态</view>
        <!-- 送好友（M45 同族，2026-10-28 补圈子入口）：与课程商详同一条奶白长条，摆在信息卡里。
             显隐只吃后端 `send_friend_entry`；`manual` 是因为圈子要**先选有效期**再走送礼下单页
             （`extend` = 当前规格 `规格ID_价格`，换规格时组件自己重取 flag），
             选完由本页调组件的 `submitUrlFor()` 拼同一个落页，URL 不给第二处拼。
             **上距按页给（2026-10-29 用户点名「送好友卡片要有上边距」）**：本页长条上方是
             `.cover-stat`（人加入 · 动态，自带 6px 上距），与长条之间不留缝就读成同一段 ⇒ 传 8，
             与课程商详那一档同值（M45：改这一档只改调用点，不回 `.sfa-entry--card` 写死）。 -->
        <tz-send-friend-area v-if="id && info.sell_type == 2" ref="sfCard" scene="inCard" manual
          goods-type="circle" :goods-id="id" :margin-top="8"
          :extend="currentSpec ? (currentSpec.id + '_' + currentSpec.price) : ''" @open="onGiftOpen" />
      </view>

      <!-- 拼团区（M-P1）：压在「价格 + 名称」那张信息卡正下方，拼团价与售卖价同一屏可比（写法照实物详情页）。
           两条入参：① `goods-type` 取后端 `ActivityForm::GOODS_TYPES` 里那一档 `circle`，
           与本页下单那份 goodsList 里的 goodsType 逐字相同；② `goods-id` 用本页真实的圈子 id
           （data 里就叫 `id`，onLoad 由 options.id 写入；首屏还没落地时它是 0，所以 v-if 挂在这枚上）。
           免费圈不另判：拼不拼由商家建活动决定，判据只有一枚「后端有没有返回进行中的活动」，
           前端不重判第二遍（M22：同一件事只判一处）。
           `@go-pay` 只记账：导航由组件自己发，见 js.vue 的 gbGoPay -->
      <!-- `host-spec`（2026-10-29）：规格（有效期）交给本页自己的 `tz-circle-spec-popup` 选，
           拼团区不再摆第二套规格卡；选完回调 `afterSpec`，阶梯档由拼团区第二步弹窗接着问 -->
      <tz-group-buy-area v-if="id" ref="gbArea" goods-type="circle" :goods-id="id" host-spec hide-danmu
        :join-team="gbJoinCtx ? gbJoinCtx.teamId : 0"
        :join-activity="gbJoinCtx ? gbJoinCtx.activityId : 0"
        :join-goods-id="gbJoinCtx ? gbJoinCtx.goodsId : 0"
        :join-spec="gbJoinCtx ? gbJoinCtx.specId : 0"
        :join-ladder="gbJoinCtx ? gbJoinCtx.ladderId : 0"
        :join-price="gbJoinCtx ? gbJoinCtx.price : 0"
        @pick-spec="openGbSpec" @go-pay="gbGoPay" @ready="gbReady" />

      <!-- 封禁状态提示（黑名单/永久封禁） -->
      <view class="ban-banner" v-if="isBanned">
        <text>{{ info.ban_text }}</text>
      </view>

      <!-- 优惠券 -->
      <view class="card coupon-card" v-if="info.coupons && info.coupons.length" @tap="goCoupons">
        <view class="coupon-list">
          <view v-for="(c, i) in info.coupons.slice(0, 2)" :key="i" class="coupon-tag">{{ c.name }}</view>
        </view>
        <text class="coupon-action">领券 ></text>
      </view>

      <!-- 私域引流 -->
      <view class="card drain-card" v-if="info.drain_config && info.drain_config.before_qrcode" @tap="previewQr(info.drain_config.before_qrcode)">
        <view class="drain-left">
          <tz-icon name="qrcode" :size="20" color="#ff7d00" />
          <text class="drain-text">进入专属沟通小组</text>
        </view>
        <text class="drain-action">立即扫码 ></text>
      </view>

      <!-- 圈子大咖 -->
      <view class="card master-card" v-if="info.masters && info.masters.length">
        <view class="section-title">圈子大咖</view>
        <scroll-view scroll-x class="master-scroll">
          <view class="master-list">
            <view v-for="m in info.masters" :key="m.id" class="master-item">
              <image class="master-avatar" :src="m.avatar" mode="aspectFill" />
              <text class="master-name">{{ m.nickname }}</text>
              <text class="master-role">{{ m.role_text }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 有效期选择 -->
      <view class="cell-card" v-if="info.sell_type == 2 && joinStatus != 'joined' && !isBanned" @tap="handleBuy">
        <text class="cell-label">选择圈子有效期</text>
        <view class="cell-right">
          <text class="cell-value">{{ currentSpec ? currentSpec.name : '请选择' }}</text>
          <tz-icon name="enter" :size="16" />
        </view>
      </view>

      <!-- Tab：详情/动态预览 -->
      <view class="tab-card">
        <u-tabs :list="tabs" :current="tab" @change="tab = $event.index" lineColor="#0968f6"></u-tabs>
        <view v-show="tab == 0" class="tab-body">
          <tz-parse v-if="info.detail && info.detail != '<p><br></p>'" :content="info.detail"></tz-parse>
          <u-empty v-else text="暂无详情" icon="/static/image/empty.png" width="70" height="70" margin-top="60"></u-empty>
        </view>
        <view v-show="tab == 1" class="tab-body">
          <tz-circle-post v-if="info.posts && info.posts.length" :list="info.posts" mode="preview" :circle-id="info.id" />
          <u-empty v-else text="暂无动态" icon="/static/image/empty.png" width="70" height="70" margin-top="60"></u-empty>
        </view>
      </view>

      <!-- 底部栏（tabbar 页面时上移：高度来自事件兜底 112rpx 与页面级实测校正值，
     实测值在开发者工具/真机间自动适配；内联表达式保证小程序 WXML 可解析） -->
      <view class="footer-bar h5-bottom-bar" :style="(tabbarVisible && tabbarHeight) ? ('bottom:' + (tabbarHeight + tabbarOffset) + 'px;') : ''">
        <!-- 当前页是自定义导航栏（TabBar）页面之一时，底部导航已含首页入口，不再重复展示首页按钮 -->
        <view class="footer-icons" v-if="!tabbarVisible">
          <view class="footer-icon-btn" @tap="goHome">
            <tz-icon name="homepage" :size="22" color="#86909c" />
            <text class="footer-icon-text">首页</text>
          </view>
        </view>
        <view class="footer-main">
          <!-- 拼团入口在**每一个还能下单的状态**里都要在（2026-10-29 用户点名
               `/pages/app/circle/presale/presale?id=3168`「已经是拼团商品了，为什么没有下单按钮」）：
               原先 `<tz-group-buy-btn>` 只挂在最后「未加入」那一支，已加入（续费/进入圈子）与已过期
               （立即续费）两支各摆自己的按钮 ⇒ 拼团区在成员态照样渲染、横幅上写着「¥100 2人拼团价」，
               底栏却只剩 ¥223 的续费，读出来就是「拼团商品没有下单按钮」。
               口径：**同一枚入口的状态分支只许收一处** —— 三支共用下面同一段标签形状；
               `gbEntry` 空（无活动/未装插件）时整组退回改造前那几枚，逐字不变。
               `gbInTeam` 是拼团区 `@ready` 上抛的 `inTeam`（2026-10-27 PRD：我正在这一场有进行中的团
               ⇒ 主购买/续费一律收起，底栏只留「查看拼团详情」这一个出口），这里**只判这一处**、
               三支的购买按钮读同一枚标记，页面不另判 `my_team`。 -->
          <view class="footer-btn-group" v-if="joinStatus == 'joined'">
            <tz-group-buy-btn v-if="gbEntry" class="presale-gb-slot" height="44" :text="gbEntry ? gbEntry.text : ''" :price="gbEntry ? gbEntry.price_text : ''" @open="openGb" />
            <view class="footer-btn renew" v-if="info.sell_type == 2 && !gbInTeam && !gbJoinMode" @tap="handleRenew">续费</view>
            <view class="footer-btn joined" @tap="goIndex">进入圈子</view>
          </view>
          <view class="footer-btn full" v-else-if="isBanned" @tap="onBanned">已被封禁</view>
          <view class="footer-btn-group" v-else-if="joinStatus == 'expired' && info.sell_type == 2">
            <tz-group-buy-btn v-if="gbEntry" class="presale-gb-slot" height="44" :text="gbEntry ? gbEntry.text : ''" :price="gbEntry ? gbEntry.price_text : ''" @open="openGb" />
            <view class="footer-btn renew" v-if="!gbInTeam && !gbJoinMode" @tap="handleRenew">立即续费</view>
          </view>
          <view class="footer-btn full" v-else-if="isFull" @tap="onFull">该圈子已满员</view>
          <view class="footer-btn free" v-else-if="info.sell_type == 1 || info.can_join_free == 1" @tap="freeJoin">免费加入</view>
          <!-- 拼团档：与「立即购买」并排（竞品 07 图：售卖 + 发起拼团）。
               `gbEntry` 空（无活动/未装插件）时整组只剩「立即购买」一枚，与改造前逐字相同 -->
          <view class="footer-btn-group" v-else>
            <tz-group-buy-btn v-if="gbEntry" class="presale-gb-slot" height="44" :text="gbEntry ? gbEntry.text : ''" :price="gbEntry ? gbEntry.price_text : ''" @open="openGb" />
            <view class="footer-btn" v-if="!gbInTeam && !gbJoinMode" @tap="handleBuy">立即购买</view>
          </view>
        </view>
      </view>

      <!-- 规格弹层：照实物商品 SKU 弹窗结构（价格头部 + 规格区块 + 底部独立按钮区）。
           2026-10-28 起抽成 `tz-circle-spec-popup`：成员端圈子首页「送好友」用的是同一只
           （两页只差续费提示那一句与确认后去哪，弹层本身逐字相同，不许各写一份）。
           `giftMode` 只决定确认后走 `sf=1` 送礼下单页，规格选择与立即购买共用同一份 `currentSpec`。 -->
      <!-- `in-team`（2026-10-30）：底栏「立即购买 / 续费」收起只是把入口藏起来，「选择圈子有效期」
           这一行照样点得开、弹层里照样能下原价单——用户点名「这应该是一个逻辑漏洞」。弹层照开
           （时长档与续费折扣只有这里看得见），确认按钮由 `inTeamBlocked` 换成禁用态并写原因；
           送好友那一趟（`giftMode`）不算本人参团中的原价单，不传这一枚。
           参团中那一趟也带活动（同组合商品）：弹层按拼团态画价与人数档，按钮仍是禁用 + 原因 -->
      <tz-circle-spec-popup :show="showSpec" :specs="(info && info.specs) || []"
        :spec-id="currentSpec ? currentSpec.id : 0" :is-virtual-pay="isVirtualPay" :coin-name="coinName"
        :cover="(info && info.cover) || ''"
        :gb="(gbPicking || (gbInTeam && !giftMode)) ? gbActivity : null"
        :in-team="gbInTeam && !giftMode"
        :renew-tip="renewTip" @pick="onSpecPick" @confirm="confirmSpec"
        @update:show="showSpec = $event" @close="closeSpec" />
    </view>

    <tz-tab-bar @visibleChange="onTabbarVisible" />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
