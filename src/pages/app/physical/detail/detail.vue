<template>
  <view class="goods-detail">
    <!-- 首屏骨架屏：仿详情页真实结构（轮播 / 价格标题 / 信息行 / 详情正文），底部操作栏同步占位，
         数据落地后整块换成真实内容，页面不跳位 -->
    <view class="detail-sk-page" v-if="skeletonLoading">
      <view class="detail-sk-swiper"></view>

      <view class="detail-sk-card">
        <view class="detail-sk-price-row">
          <view class="detail-sk-block detail-sk-price"></view>
          <view class="detail-sk-block detail-sk-sales"></view>
        </view>
        <view class="detail-sk-block detail-sk-title"></view>
      </view>

      <view class="detail-sk-cells">
        <view class="detail-sk-cell" v-for="i in 3" :key="i">
          <view class="detail-sk-block detail-sk-label"></view>
          <view class="detail-sk-block detail-sk-value"></view>
        </view>
      </view>

      <view class="detail-sk-card detail-sk-detail-card">
        <view class="detail-sk-section-head">
          <view class="detail-sk-block detail-sk-section-title"></view>
        </view>
        <view class="detail-sk-block detail-sk-line detail-sk-line-first"></view>
        <view class="detail-sk-block detail-sk-line detail-sk-line-short"></view>
      </view>

      <view class="detail-sk-tabbar">
        <view class="detail-sk-button"></view>
      </view>
    </view>

    <view class="detail-swiper-selector gbd-anchor" v-if="!skeletonLoading && goodsInfo">
      <swiper
        class="goods-swiper"
        :indicator-dots="true"
        :autoplay="false"
        :circular="true"
        indicator-color="rgba(0, 0, 0, .3)"
        indicator-active-color="#0968f6"
      >
        <swiper-item v-for="(item, index) in goodsSwiper" :key="index">
          <image class="swiper-image" :src="item" mode="aspectFit" @tap="previewImage(index)" />
        </swiper-item>
      </swiper>
      <tz-group-buy-danmu v-if="gbBuyers.length" :buyers="gbBuyers" overlay />

      <view class="title-card detail-card">
        <!-- 拼团横幅不再压到价格格（2026-10-30 用户点名「gba-rule 拼团玩法都应该放在 gba-banner
             下面，也包括正在拼团的列表，让拼团连成一个整体」+「上下挨在一起，不要拆分放」）：
             横幅回拼团区那张卡的第一行、与玩法/凑团列表连着放；本格恢复原价 + 已售 -->
        <view class="price-box" v-if="gbPriceShown">
          <view class="price-wrapper">
            <text class="price-symbol" v-if="!isVirtualPay">¥</text>
            <text class="price-text">{{
              goodsInfo.min_price || goodsInfo.price || 0
            }}</text>
            <text class="price-symbol" v-if="isVirtualPay">{{ $tools.systemConfig('coin_name') || '金币' }}</text>
            <text class="price-suffix" v-if="hasMultipleSku">起</text>
          </view>
          <view
            class="sales-text"
            v-if="goodsInfo.total_sales !== undefined && goodsInfo.total_sales !== null"
          >
            已售{{ goodsInfo.total_sales }}
          </view>
        </view>

        <view class="title-text">{{ goodsInfo.name }}</view>
      </view>

      <!-- 拼团区（M-P1）：压在「价格 + 标题」那张卡正下方，拼团价与售卖价同一屏可比。
           组件只有两枚入参，别往调用点上再加第三枚：
           ① `goods-type` 取后端 `ActivityForm::GOODS_TYPES` 里那一档 `physical`；
           ② `goods-id` 给取数用 —— 活动绑的是商品 id（后端 goodsArea 按它查进行中的活动）。
           多规格实物（2026-10-28 起支持）：规格位与下单装箱只存 `GoodsSpecs`（实物装箱 = `商品id_规格id`），
           学员在凑团弹层里先选规格再开团，所以本页不需要第二份「下单用商品 id」—— `goods-id` 只给拼团区取数用 -->
      <!-- `host-spec`（2026-10-29）：规格交给本页自己的 `sku-select-modal` 选，拼团区不再摆第二套规格卡；
           选完回调 `afterSpec`，阶梯档/份数由拼团区那只第二步弹窗接着问 -->
      <tz-group-buy-area v-if="goodsId" ref="gbArea" goods-type="physical" :goods-id="goodsId" host-spec hide-danmu
        :share="share" :join-team="gbJoinCtx ? gbJoinCtx.teamId : 0"
        :join-activity="gbJoinCtx ? gbJoinCtx.activityId : 0"
        :join-goods-id="gbJoinCtx ? gbJoinCtx.goodsId : 0"
        :join-spec="gbJoinCtx ? gbJoinCtx.specId : 0"
        :join-ladder="gbJoinCtx ? gbJoinCtx.ladderId : 0"
        :join-price="gbJoinCtx ? gbJoinCtx.price : 0"
        @pick-spec="openGbSpec" @go-pay="gbGoPay" @ready="gbReady" />

      <view class="detail-cell-card">
        <view class="cell-item" @tap="openSkuPicker">
          <view class="cell-label">选择</view>
          <view class="cell-value">
            <text class="cell-value-text">{{
              selectedSkuPrice.goods_sku_text || "请选择规格"
            }}</text>
            <text
              class="cell-value-count"
              v-if="goodsInfo.sku_tree && goodsInfo.sku_tree.length > 0"
              >共{{ getSkuCount }}种{{ goodsInfo.sku_tree[0].name }}可选</text
            >
          </view>
          <view class="cell-arrow"><tz-icon name="enter" :size="16" /></view>
        </view>
        <view
          class="cell-item"
          v-if="guaranteeList.length > 0"
          @tap="showGuaranteeModal = true"
        >
          <view class="cell-label">保障</view>
          <view class="cell-value guarantee-tags">
            <text class="guarantee-text">{{
              guaranteeList.map((item) => item.title).join("·")
            }}</text>
          </view>
          <text class="cell-arrow"><tz-icon name="enter" :size="16" /></text>
        </view>
        <view
          class="cell-item"
          v-if="paramsList.length > 0"
          @tap="showParamsModal = true"
        >
          <view class="cell-label">参数</view>
          <view class="cell-value params-tags">
            <text class="params-text">{{
              paramsList.map((item) => item.name).join("·")
            }}</text>
          </view>
          <text class="cell-arrow"><tz-icon name="enter" :size="16" /></text>
        </view>
      </view>

      <view class="detail-content-card" v-if="goodsInfo.detail">
        <view class="content-title">商品详情</view>
        <tz-parse :content="goodsInfo.detail"></tz-parse>
      </view>
    </view>

    <!-- 底栏：活动期间与「立即购买」并排多一枚「¥xx 拼团」（竞品 07 图：售卖 + 发起拼团）。
         `gbEntry` 空（无活动/未装插件）时不渲染那枚，点击由 `openGb` 就地开凑团弹层；
         按钮本体走全站共用的 `tz-group-buy-btn`（两行：立即开团 + 拼团价，色值只存那一份组件）；
         售罄档不摆拼团按钮（售罄的商品拼不了）。
         **我正在这一场拼团里已有进行中的团（`gbInTeam`）→ 「立即购买 / 已售罄」两档一起收起**
         （PRD 2026-10-27 用户点名「如果我当前正在拼团，那么是不能再购买的」）：底栏只留
         「查看拼团详情」这一个出口。判据吃拼团区 `@ready` 上抛的 `inTeam`，本页不读 `my_team` -->
    <view class="detail-tabbar h5-bottom-bar" v-if="!skeletonLoading && goodsInfo && selectedSkuPrice.id">
      <tz-group-buy-btn v-if="gbEntry" class="goods-gb-slot" height="44" :text="gbEntry ? gbEntry.text : ''" :price="gbEntry ? gbEntry.price_text : ''" @open="openGb" />
      <button
        class="buy-btn"
        @tap="openSkuPicker"
        v-if="!gbInTeam && !gbJoinMode && Number(selectedSkuPrice.stock) > 0"
      >
        立即购买
      </button>
      <button class="disabled-btn" disabled v-else-if="!gbInTeam && !gbJoinMode">已售罄</button>
    </view>
    <view class="detail-tabbar h5-bottom-bar" v-else-if="!skeletonLoading && goodsInfo">
      <tz-group-buy-btn v-if="gbEntry" class="goods-gb-slot" height="44" :text="gbEntry ? gbEntry.text : ''" :price="gbEntry ? gbEntry.price_text : ''" @open="openGb" />
      <button class="buy-btn" @tap="openSkuPicker" v-if="!gbInTeam && !gbJoinMode">立即购买</button>
    </view>

    <!-- 商品不存在或已下架（含缺少 id、接口返回失败）：给一处出口，避免只留一张空白页 -->
    <u-empty
      v-if="!skeletonLoading && !goodsInfo"
      icon="/static/image/empty.png"
      width="70"
      height="70"
      text="商品不存在或已下架"
    />

    <!-- SKU选择弹窗（`in-team` 2026-10-30）：底栏「立即购买」收起只是把入口藏起来，
         「选择」这一行照样点得开、弹窗里照样能下原价单——用户点名「这应该是一个逻辑漏洞」。
         弹窗照开（规格树 / 数量只有这里看得见），确认按钮由 `inTeamBlocked` 换成禁用态并写原因。
         参团中那一趟也带活动（同组合商品）：弹窗按拼团态画价与人数档，按钮仍是禁用 + 原因 -->
    <sku-select-modal
      :show="showSelectSku"
      :goods-info="goodsInfo"
      :is-virtual-pay="isVirtualPay"
      :selected-sku-price="selectedSkuPrice"
      :selected-skus="selectedSkus"
      :goods-num.sync="goodsNum"
      :gb="(gbPicking || gbInTeam) ? gbActivity : null"
      :in-team="gbInTeam"
      @selectSku="onSelectSku"
      @confirm="onSkuConfirm"
      @close="closeSkuPicker"
    />

    <!-- 服务保障弹窗 -->
    <guarantee-modal
      :show="showGuaranteeModal"
      :guarantee-list="guaranteeList"
      @confirm="showGuaranteeModal = false"
      @close="showGuaranteeModal = false"
    />

    <!-- 产品参数弹窗 -->
    <params-modal
      :show="showParamsModal"
      :params-list="paramsList"
      @confirm="showParamsModal = false"
      @close="showParamsModal = false"
    />
    <!-- 悬浮快捷导航按钮（与课程/校区/教师/套餐详情页同一组件） -->
    <tz-hover-btn />
    <tz-tab-bar />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
