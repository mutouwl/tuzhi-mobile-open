<template>
  <div class="container">
    <tz-box bgColor="none">
      <!-- 券卡骨架档由 coupon-my 自己出（:skeleton），本页不另铺一棵灰块树 -->
      <coupon-my :skeleton="loading" :data="data" />
    </tz-box>

    <!-- 取数失败的出口（M13）：不把后端故障渲染成一张空券卡 + 「暂无适用商品」 -->
    <u-empty
      v-if="!loading && failMsg"
      icon="/static/image/empty.png"
      width="70"
      height="70"
      :text="failMsg"
    />

    <!-- 推荐商品：券卡版式走 tz-course 自带的 round 档（10px 圆角），与券详情页（receive）同一写法。
         这一段按后端 recommend_goods_status 判（v-if），骨架档不预留 -->
    <template v-if="!loading && data.recommend_goods_status == 1 && data.goods && data.goods.length > 0">
      <tz-title title="推荐商品" bgColor="none" :more="false" />
      <tz-box bgColor="none">
        <tz-course :list="data.goods" :border="false" :round="true" type="diallel" />
      </tz-box>
    </template>

    <template v-else-if="!loading && !failMsg">
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
