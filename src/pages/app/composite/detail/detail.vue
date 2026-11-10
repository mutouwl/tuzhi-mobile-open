<template>
  <view class="goods-detail">
    <!-- 首屏骨架屏（M16：加载态一律骨架屏，`u-loading-page` 那层整页遮罩与 `uni.showLoading`
         那枚「加载中」黑底转圈都已下线——接口快于淡入时整页闪白、慢时又是「转圈无信息」）。
         写法照同族商详（`pages/app/physical/detail`、`pages/app/group_buy/detail`）：
         ① **外壳一律复用真实区块的类**（`.detail-content` / `.title-card` / `.price-box` /
         `.detail-cell-card` / `.cell-item` / `.cell-label` / `.cell-value` / `.cell-arrow` /
         `.detail-tabbar` / `.tabbar-right`），灰块只往容器里放，不另铺一棵灰块树；
         ② **只盖会变的那几格**（封面 / 价格 / 标题 / 规格行两格 / 底栏按钮），
         写死的静态文案与图标（规格行左侧「选择」、右侧箭头）照常摆真内容；
         ③ **灰块高 + 上下外衬 = 真实行盒高**（价格 32、标题行 26、规格行 20），数据到手逐块换真内容不跳位；
         ④ `v-if` 才出的元素（卖点一句、商品详情卡）不给灰块、也不预留空位（M16③）。
         骨架那层底不吃另一个色：整块贴在 `.goods-detail` 的 `#F7F8FA` 上，
         块间缝与取数前后同一色（硬约束 42③ / M58⑤），故骨架容器不另写 background。 -->
    <view class="detail-content" v-if="loading">
      <!-- 封面：真实那张是 `mode="widthFix"`（高度由图片算），先按同族实物商详那一档占位 -->
      <view class="cmp-sk-cover"></view>

      <!-- 价格 + 标题卡：外壳走真实 `.title-card` 的 16 内衬 -->
      <view class="title-card">
        <view class="price-box">
          <view class="cmp-sk-line cmp-sk-line--price">
            <view class="cmp-sk cmp-sk-price"></view>
          </view>
        </view>
        <view class="cmp-sk-line cmp-sk-line--title">
          <view class="cmp-sk cmp-sk-title"></view>
        </view>
      </view>

      <!-- 规格行：与真实行同 16 内衬 + 1px 底边线；左侧「选择」与右侧箭头是写死的，照常摆真内容，
           只有「值」与右侧计数两格盖灰（取数后要变的正是这两处） -->
      <view class="detail-cell-card">
        <view class="cell-item">
          <view class="cell-label">选择</view>
          <view class="cell-value">
            <view class="cmp-sk-line cmp-sk-line--value">
              <view class="cmp-sk cmp-sk-value"></view>
            </view>
            <view class="cmp-sk-line cmp-sk-line--count">
              <view class="cmp-sk cmp-sk-count"></view>
            </view>
          </view>
          <view class="cell-arrow"><tz-icon name="enter" :size="16" /></view>
        </view>
      </view>
    </view>

    <view class="detail-content" v-else-if="goodsInfo">
      <!-- 商品封面 -->
      <view class="cmp-media gbd-anchor" v-if="goodsInfo.cover">
        <image
          class="goods-cover"
          :src="goodsInfo.cover"
          mode="widthFix"
          @tap="previewImage(0)"
        />
        <tz-group-buy-danmu v-if="gbBuyers.length" :buyers="gbBuyers" overlay />
      </view>

      <!-- 价格区 -->
      <view class="title-card">
        <!-- 拼团价横幅回拼团区（2026-10-30 用户点名「gba-rule 拼团玩法都应该放在 gba-banner 下面，
             也包括正在拼团的列表，让拼团连成一个整体」+「上下挨在一起，不要拆分放」）：
             横幅与玩法、凑团列表在下一张卡里连着排，拼团进行中本卡价格行收起（第五轮）。 -->
        <view class="price-box" v-if="isScoreExchange">
          <view class="price-wrapper">
            <text class="price-text">{{ scoreExchangeScore }}</text>
            <text class="price-symbol">积分</text>
          </view>
        </view>
        <view class="price-box" v-else-if="gbPriceShown">
          <view class="price-wrapper" v-if="selectedSpec">
            <text class="price-symbol" v-if="!isVirtualPay">¥</text>
            <text class="price-text">{{ selectedSpec.price }}</text>
            <text class="coin-name" v-if="isVirtualPay">{{ coinName }}</text>
          </view>
          <view class="price-wrapper" v-else-if="goodsInfo.specs && goodsInfo.specs.length > 1">
            <text class="price-text" style="font-size: 20px; font-weight: 500;">请选择规格</text>
          </view>
          <view class="price-wrapper" v-else>
            <text class="price-symbol" v-if="!isVirtualPay">¥</text>
            <text class="price-text">{{ goodsInfo.min_price || 0 }}</text>
            <text class="coin-name" v-if="isVirtualPay">{{ coinName }}</text>
          </view>
        </view>
        <view class="title-text">{{ goodsInfo.name }}</view>
        <view class="sell-point" v-if="goodsInfo.sell_point">{{ goodsInfo.sell_point }}</view>
      </view>

      <!-- 拼团区（M-P1）：压在「价格 + 标题」那张卡正下方，拼团价与售卖价同一屏可比（写法照实物详情页）。
           两条入参：① `goods-type` 取后端 `ActivityForm::GOODS_TYPES` 里那一档 `composite`，
           与本页「立即购买」那份 goodsList 里的 goodsType 逐字相同；② `goods-id` 用本页真实的商品 id
           （onLoad 由 options.id 写进 goodsId，首屏还没落地时它是 0，所以 v-if 挂在这枚上，
           不带 0 去取数 —— 拼团区自己发那两条请求，页面不替它取）。
           `@go-pay` 只记账：导航由组件自己发（它才知道选了哪一档、凑的是哪一个团），见 js.vue 的 gbGoPay -->
      <!-- `host-spec`（2026-10-29）：规格/内含商品交给本页自己的 `spec-select-modal` 选（那只本来就有这两节），
           拼团区不再摆第二套规格卡；选完回调 `afterSpec`，阶梯档由拼团区第二步弹窗接着问 -->
      <tz-group-buy-area v-if="goodsId && !isScoreExchange" ref="gbArea" goods-type="composite" :goods-id="goodsId" host-spec hide-danmu
        :join-team="gbJoinCtx ? gbJoinCtx.teamId : 0"
        :join-activity="gbJoinCtx ? gbJoinCtx.activityId : 0"
        :join-goods-id="gbJoinCtx ? gbJoinCtx.goodsId : 0"
        :join-spec="gbJoinCtx ? gbJoinCtx.specId : 0"
        :join-ladder="gbJoinCtx ? gbJoinCtx.ladderId : 0"
        :join-price="gbJoinCtx ? gbJoinCtx.price : 0"
        @pick-spec="openGbSpec" @go-pay="gbGoPay" @ready="gbReady" />

      <!-- 规格选择区 -->
      <view class="detail-cell-card">
        <view class="cell-item" @tap="openSpecPicker">
          <view class="cell-label">选择</view>
          <view class="cell-value">
            <view class="cell-value-row" v-if="goodsInfo.specs && goodsInfo.specs.length > 0">
              <image v-if="selectedSpec && selectedSpec.image" :src="selectedSpec.image" class="spec-thumb" mode="aspectFill"></image>
              <text class="cell-value-text">{{ selectedSpec ? selectedSpec.name : '请选择规格' }}</text>
            </view>
            <text class="cell-value-count" v-if="goodsInfo.specs">共{{ goodsInfo.specs.length }}种规格可选</text>
          </view>
          <view class="cell-arrow"><tz-icon name="enter" :size="16" /></view>
        </view>
      </view>

      <!-- 详情 -->
      <view class="detail-content-card" v-if="goodsInfo.detail">
        <view class="content-title">商品详情</view>
        <tz-parse :content="goodsInfo.detail"></tz-parse>
      </view>
    </view>

    <!-- 底部栏：活动期间与「立即购买」并排多一枚「¥xx 拼团」（竞品 07 图：售卖 + 发起拼团）。
         `gbEntry` 空（无活动/未装插件）时不渲染那枚，点击由 `openGb` 就地开凑团弹层。
         **我正在这一场拼团里已有进行中的团（`gbInTeam`）→ 「立即购买」收起**（PRD 2026-10-27 用户点名
         「如果我当前正在拼团，那么是不能再购买的」）：底栏只留「查看拼团详情」这一个出口，
         不留一枚点了会被后端拒的死按钮。判据吃拼团区 `@ready` 上抛的 `inTeam`，本页不读 `my_team`；
         课程详情（`tz-bottom-btn` 的 `hide-main`）与圈子售前页走的是同一枚标记，九类商详页同一口径 -->
    <!-- 底栏骨架占位：与真实底栏同一份类（定位 / 内衬 / 小程序安全区 / H5 居中宽度全吃它），
         只把按钮换成同尺寸灰块（真实 `.buy-btn` 高 44），数据到手不在底部弹出一条。
         枚数按首帧真实那一档摆（`gbEntry` 要到拼团区回包后才有，首帧就是一枚「立即购买」） -->
    <view class="detail-tabbar h5-bottom-bar" v-if="loading">
      <view class="tabbar-right">
        <view class="cmp-sk cmp-sk-btn"></view>
      </view>
    </view>
    <view class="detail-tabbar h5-bottom-bar" v-else-if="goodsInfo">
      <view class="tabbar-right">
        <tz-group-buy-btn v-if="gbEntry && !isScoreExchange" class="cmp-gb-slot" height="44" :text="gbEntry ? gbEntry.text : ''" :price="gbEntry ? gbEntry.price_text : ''" @open="openGb" />
        <button class="buy-btn" @tap="handleBuy" v-if="!gbInTeam && !gbJoinMode">{{ isScoreExchange ? '立即兑换' : '立即购买' }}</button>
      </view>
    </view>

    <!-- 规格选择弹窗（`in-team` 2026-10-30）：底栏「立即购买」收起只是把入口藏起来，
         「选择」这一行照样点得开、弹窗里照样能下原价单——用户点名「这应该是一个逻辑漏洞」。
         弹窗照开（内含商品只有这里看得见），确认按钮由 `inTeamBlocked` 换成禁用态并写原因。
         **参团中那一趟也要带活动**（2026-10-30 用户点名「点击规格菜单会弹出规格弹窗，这个规格弹窗
         应该是拼团类型的，而不是单独购买的」）：底栏的原价按钮已经收了，弹窗再按原价画就是在
         单独购买的口径里点一个禁用的按钮 ⇒ 参团中与拼团那一趟一样吃 `gb`，头区切拼团价、
         阶梯型照常出人数档；按钮仍是禁用态 + 原因（`inTeamBlocked` 优先于「立即开团」） -->
    <spec-select-modal
      :show="showSpecModal"
      :goods-info="goodsInfo"
      :selected-spec="selectedSpec"
      :gb="(gbPicking || gbInTeam) ? gbActivity : null"
      :in-team="gbInTeam"
      :score-mode="isScoreExchange"
      :score-value="scoreExchangeScore"
      @select="onSpecSelect"
      @confirm="onSpecConfirm"
      @close="closeSpecPicker"
    />

    <!-- 内含商品弹窗 -->
    <sub-goods-popup
      :show="showSubGoodsPopup"
      :spec="selectedSpec"
      @close="showSubGoodsPopup = false"
    />

    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
