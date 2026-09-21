<template>
  <div class="container">
    <u-sticky bgColor="#fff" :offsetTop="0">
      <div class="nav-bar">
        <u-subsection :list="tabs" :current="current" @change="tabChange"></u-subsection>
      </div>
    </u-sticky>

    <template v-if="list.length > 0">
      <coupon-my
        v-for="(item, index) in list"
        :data="item.coupon"
        :disabled="item.status != 'can_use'"
      />
    </template>
    <u-empty v-else mode="coupon" />

    <tz-tab-bar />
    <tz-footer />
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
