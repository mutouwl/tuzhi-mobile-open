<template>
  <div class="container">
    <div class="wrapper background-semicircle-blue" v-if="qrcode">
      <div class="gift-content-wrapper">
        <div class="gift-code-detail">
          <!-- <div class="gift-code-header" v-if="store.name">
            <img :src="store.logo" :alt="store.name" class="logo" />
            <div class="store-name">{{ store.name }}</div>
          </div>
          <div class="detail-line blue"></div> -->
        <div class="order-no" v-if="order" @click="copy">订单号：{{order}} <span>「复制」</span></div>
          <div class="goodsinfo" v-if="goods"> 
            <tz-box> 
              <tz-course-mini :round="true" :border="false" :list="[goods]"/>
            </tz-box>
          </div>
          <div class="detail-line blue"></div>
          <!-- <div class="detail-line blue"></div> -->

          <div class="qrcode-box">
            <tz-box padding="40px 40px">
              <image class="qrcode" :show-menu-by-longpress="true" :src="qrcode"></image>
              <p class="scan-qrcode-tip">长按图片或截图保存图片至微信扫码进入</p>
            </tz-box>
          </div>
          <div class="detail-line gray"></div>
          <div class="tips-wrapper">
            <div class="tips-title">使用须知</div>
            <div class="tips-content">
              <p>1、使用微信扫描弹二维码。</p>
              <p style="margin-top: 5px">
                2、使用购课手机号登录，在【我的】-【我的订阅】中查看已购课程。
              </p>
            </div>
          </div>

          <!-- <div class="gift-code-image" v-if="goods.cover">
            <div
              class="goods-cover-box"
              style="overflow: hidden; border-radius: 0.15rem"
            >
              <div
                class="goods-cover-bg"
                :style="'--back-ground: url('+goods.cover+');'"
              ></div>
              <img
                :src="goods.cover"
                class="goods-cover"
              />
            </div>
          </div>
          <div class="gift-code-title">{{ goods.name }}</div>
          <div class="detail-line gray"></div>
          <div class="tips-wrapper">
            <div class="tips-title">使用须知</div>
            <div class="tips-content">
            <p>1、点击查看商品，使用微信扫描弹出的二维码;</p>
            <p style="margin-top: 5px;">2、使用购课手机号登录，在【我的】-【我的订阅】中查看已购课程。</p>
            </div>
          </div> -->
        </div>
      </div>
      <!-- <div class="fix-button">
        <div class="use-btn" @click="modal.qrcode = true">查看商品</div>
      </div> -->
    </div>
    <u-empty
      icon="/static/image/empty.png"
      width="70"
      height="70"
      v-else
      text="获取信息错误"
    />
    <u-loading-page :loading="loading"></u-loading-page>
    <!-- <delivery-qrcode-modal :visible="modal.qrcode" :qrcode="qrcode" @close="modal.qrcode=false"/> -->
    <!-- <tz-tab-bar /> -->
    <!-- <tz-footer /> -->
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
