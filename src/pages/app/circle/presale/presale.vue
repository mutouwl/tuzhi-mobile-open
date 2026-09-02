<template>
  <view class="circle-presale" :class="{ 'has-footer-bar': info }" :style="(info && tabbarVisible && tabbarHeight) ? ('padding-bottom:' + (80 + tabbarHeight) + 'px;') : ''">
    <u-loading-page :loading="loading" bg-color="#F8F8F8"></u-loading-page>

    <!-- 圈子不存在/已下架等状态异常：空状态 + 对应说明（文案以后端返回为准） -->
    <view v-if="!loading && !info" class="presale-empty">
      <u-empty :text="loadMsg || '圈子不存在'" icon="/static/image/empty.png" width="70" height="70" margin-top="80"></u-empty>
    </view>

    <view v-if="!loading && info">
      <!-- 封面区（参照课程详情页 banner：整图展示 16:9，无文字浮层） -->
      <view class="cover-wrap">
        <image class="cover" :src="info.cover" mode="aspectFill" />
      </view>

      <!-- 信息区（参照课程详情页 course-info：白底卡片，价格/标题/副标题） -->
      <view class="info-card">
        <view class="price-row" v-if="info.sell_type == 2">
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
        <view class="price-row free-row" v-else><text class="free-tag">免费</text></view>
        <view class="cover-name">{{ info.name }}</view>
        <view class="cover-subtitle" v-if="info.intro">{{ info.intro }}</view>
        <view class="cover-stat" v-if="info.show_member_count == 1 && info.show_post_count == 1">{{ info.member_count }}人加入 · {{ info.post_count }}条动态</view>
        <view class="cover-stat" v-else-if="info.show_member_count == 1">{{ info.member_count }}人加入</view>
        <view class="cover-stat" v-else-if="info.show_post_count == 1">{{ info.post_count }}条动态</view>
      </view>

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
      <view class="footer-bar" :style="(tabbarVisible && tabbarHeight) ? ('bottom:' + (tabbarHeight + tabbarOffset) + 'px;') : ''">
        <view class="footer-icons">
          <view class="footer-icon-btn" @tap="goHome">
            <tz-icon name="homepage" :size="22" color="#86909c" />
            <text class="footer-icon-text">首页</text>
          </view>
        </view>
        <view class="footer-main">
          <view class="footer-btn-group" v-if="joinStatus == 'joined'">
            <view class="footer-btn renew" v-if="info.sell_type == 2" @tap="handleRenew">续费</view>
            <view class="footer-btn joined" @tap="goIndex">进入圈子</view>
          </view>
          <view class="footer-btn full" v-else-if="isBanned" @tap="onBanned">已被封禁</view>
          <view class="footer-btn renew" v-else-if="joinStatus == 'expired' && info.sell_type == 2" @tap="handleRenew">立即续费</view>
          <view class="footer-btn full" v-else-if="isFull" @tap="onFull">该圈子已满员</view>
          <view class="footer-btn free" v-else-if="info.sell_type == 1 || info.can_join_free == 1" @tap="freeJoin">免费加入</view>
          <view class="footer-btn" v-else @tap="handleBuy">立即购买</view>
        </view>
      </view>

      <!-- 规格弹层：参照实物商品 SKU 弹窗结构——价格头部（价格+已选规格，切换规格实时更新）+ 规格区块 + 底部独立按钮区 -->
      <u-popup :show="showSpec" mode="bottom" round="10" :safeAreaInsetBottom="true" closeable @close="showSpec = false">
        <view class="spec-popup">
          <view class="spec-header">
            <view class="spec-price">
              <template v-if="!isVirtualPay">
                <text class="spec-price-symbol">¥</text>
                <text class="spec-price-num">{{ currentSpec ? currentSpec.price : minPrice }}</text>
                <text class="spec-price-marking" v-if="currentSpec && currentSpec.marking_price && Number(currentSpec.marking_price) > Number(currentSpec.price)">¥{{ currentSpec.marking_price }}</text>
              </template>
              <template v-else>
                <text class="spec-price-num">{{ currentSpec ? (currentSpec.virtual_price || currentSpec.price) : minPrice }}</text>
                <text class="spec-coin-name">{{ coinName }}</text>
              </template>
            </view>
          </view>
          <view class="spec-body">
            <view class="spec-label">圈子有效期</view>
            <view class="spec-list">
              <view
                v-for="s in info.specs"
                :key="s.id"
                class="spec-item"
                :class="{ active: currentSpec && currentSpec.id == s.id }"
                @tap="currentSpec = s"
              >{{ s.name }}</view>
            </view>
            <view class="spec-renew-tip" v-if="joinStatus == 'expired' && info.sell_type == 2 && Number(info.renew_discount) > 0">老成员续费享 {{ info.renew_discount }} 折</view>
          </view>
          <view class="spec-footer">
            <view class="spec-confirm" @tap="confirmSpec">确认</view>
          </view>
        </view>
      </u-popup>
    </view>

    <tz-tab-bar @visibleChange="onTabbarVisible" />
    <tz-footer />
  </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
