<template>
  <div class="container">
    <tz-box bgColor="none">
      <coupon-my :data="data"/>
    </tz-box>


    <template v-if="data.recommend_goods_status == 1 && data.goods && data.goods.length > 0">
      <tz-title title="推荐商品" bgColor="none" :more="false" />
      <tz-box bgColor="none">
        <tz-course :list="data.goods" :border="false" :round="false" type="diallel" />
      </tz-box>
    </template>

    <template v-else>
      <u-empty icon="/static/image/empty.png" width="70" height="70" :text="data.recommend_goods_status == 3 ? '暂无推荐商品' : '暂无适用商品'"/>
    </template>

    


    <tz-tab-bar />
    <tz-footer />
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
