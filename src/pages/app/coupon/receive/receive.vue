<template>
  <div class="container">
    <div class="coupon-box">
      <div class="coupon-container">
        <div class="couponTopWrap">
          <!-- 店铺名/logo 来自本地系统配置，首屏就在，不参与加载态（静态文案保持真文字，M16②） -->
          <div class="linkCoupon_top">
            <div class="store-info-box">
              <img :src="store.logo" class="store-logo" /><span class="store-name">{{
                store.name
              }}</span>
            </div>
          </div>
          <div style="margin-top: 25px">
            <!-- 券卡骨架档由 coupon-my 自己出（:skeleton），本页不另铺一棵灰块树 -->
            <coupon-my :skeleton="loading" :data="data" />
          </div>
        </div>
        <!-- 领取进度条与操作按钮都按 stock_status / get_status / can_use 判，属于「v-if 才出的元素」：
             骨架档不给灰块也不预留空位（加载中先不摆这一段，免得撤下时整块跳位，M16③） -->
        <div class="contrl-box" v-if="!loading">
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
              (data.get_status != 'can_get' && data.get_status != 'can_use' || data.stock <= 0) ? '' : 'orange' ]"
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

    <!-- 取数失败的出口（M13）：不把后端故障渲染成一张空券卡 + 「暂无适用商品」 -->
    <u-empty
      v-if="!loading && failMsg"
      icon="/static/image/empty.png"
      width="70"
      height="70"
      :text="failMsg"
    />

    <!-- 推荐商品：券卡版式走 tz-course 自带的 round 档（10px 圆角），与券使用页同一写法。
         这一段按后端 recommend_goods_status 判（v-if），骨架档不预留 -->
    <template v-if="!loading && data.recommend_goods_status == 1 && data.goods && data.goods.length > 0">
      <tz-title title="推荐商品" style="background: none" :more="false" />
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
