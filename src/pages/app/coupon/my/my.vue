<template>
  <div class="container">
    <u-sticky bgColor="#fff" :offsetTop="0">
      <div class="nav-bar">
        <u-subsection :list="tabs" :current="current" @change="tabChange"></u-subsection>
      </div>
    </u-sticky>

    <!-- 首屏骨架屏（ui-baseline-mobile M16，替代原来的 uni.showLoading 黑底转圈 toast）：
         券卡逐块占位，形状由 coupon-my 自己的 skeleton 档给（卡壳/圆角/间距/内衬仍是真实那张券），
         本页不另抄一份卡尺寸。判据是「请求中且列表为空」——上拉翻页由已加载的券继续展示不闪骨架，
         切页签与下拉刷新清空列表后同一判据重新铺上（不闪空态） -->
    <template v-if="sk">
      <coupon-my v-for="i in 3" :key="'cmy-sk-' + i" :skeleton="true" />
    </template>

    <template v-else-if="list.length > 0">
      <coupon-my
        v-for="(item, index) in list"
        :key="index"
        :data="item.coupon"
        :disabled="item.status != 'can_use'"
      />
    </template>

    <!-- 空态：取数失败时说失败原因，不把后端故障说成「暂无优惠券」（M13） -->
    <u-empty v-else mode="coupon" :text="failMsg || '暂无优惠券'" />

    <tz-tab-bar />
    <tz-footer />
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
