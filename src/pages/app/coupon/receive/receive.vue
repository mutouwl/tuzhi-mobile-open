<template>
  <div class="container">
    <div class="coupon-box">
      <div class="coupon-container">
        <div class="couponTopWrap">
          <div class="linkCoupon_top">
            <div class="store-info-box">
              <img :src="store.logo" class="store-logo" /><span class="store-name">{{
                store.name
              }}</span>
            </div>
          </div>
          <div style="margin-top: 25px">
            <coupon-my :data="data" />
          </div>
        </div>
        <div class="contrl-box">
          <template v-if="data.stock_status == 1">
            <div class="poverDailog">
              <span class="progress-info"> 优惠券数量剩余 {{ data.stock_prop }}% </span>
            </div>
            <div class="coupon-progress-info-box">
              <u-line-progress
                :percentage="data.stock_prop"
                inactiveColor="#fff"
                :showText="false"
                height="14"
                activeColor="#ff0000"
              ></u-line-progress>
            </div>
          </template>
          <div class="contrl-btn-box">
            <button
              :class="[
              'contrl-btn',
              (data.get_status != 'can_get' && data.get_status != 'can_use' || data.stock <= 0) ? '' : 'orange'] "
              @click="receive()"
              v-if="!data.can_use || data.get_status == 'can_get'"
              :disabled="(data.get_status != 'can_get' && data.get_status != 'can_use' || data.stock <= 0)"
            >
              {{ data.get_status =='can_get' ? '立即领取' : data.get_status_text }}
            </button>

            <button @click="use()" class="contrl-btn" v-if="data.can_use">立即使用</button>
            <!-- <div class="contrl-btn orange" @click="receive">立即领取</div> -->
          </div>
        </div>
      </div>
    </div>



    <template v-if="data.recommend_goods_status == 1 && data.goods && data.goods.length > 0">
      <tz-title title="推荐商品" style="background: none" :more="false" />
      <tz-box bgColor="none">
        <tz-course :list="data.goods" :border="false" :round="true" type="diallel" />
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
