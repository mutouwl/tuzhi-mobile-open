<template>
  <div class="container"> 
    <tz-loading-page :loading="loading"/>
    <div class="wrapper background-semicircle-blue">
      <div class="gift-content-wrapper">
        <div class="gift-code-detail">
          <div class="gift-code-header" v-if="store.name">
            <img :src="store.logo" :alt="store.name" class="logo" />
            <div class="store-name">{{ store.name }}</div>
          </div>
          <div class="detail-line blue"></div>
          <div class="gift-code-title">成为视频号分享员</div>
          <template v-if="step == 2">
            <div class="gift-code-image">
              <div class="goods-cover-box">
                <image mode="scaleToFill" :src="qrcode" class="goods-cover" :show-menu-by-longpress="true"></image>
              </div>
            </div>
            <div class="detail-line gray"></div>
            <div class="tips-wrapper">
              <div class="tips-title">第二步，扫描二维码</div>
              <div class="tips-content">
                <p>长按二维码或截图保存后使用微信扫一扫成为分享员</p>
              </div>
            </div>

            <div class="btn-group">
              <div>
                <u-button :customStyle="{ display: 'block', width: '100%' }" style="
                    display: block;
                    width: 100%;
                    line-height: 40px;
                    border: 1px solid #f3f3f3;
                  " shape="circle" :plain="true" text="上一步" @click="step=1"></u-button>
              </div>
              <div>
                <u-button :customStyle="{ display: 'block', width: '100%' }"
                  style="display: block; width: 100%; line-height: 40px;background:#FF6146" type="primary" shape="circle" text="加入成功"
                  @click="check"></u-button>
              </div>
            </div>
          </template>

          <template v-if="step == 1">
            <u-input customStyle="margin:50px 10px;padding: 5px 10px!important;border:1px solid #f3f3f3"
              class="u-input-diy" border="surround" v-model="form.username" placeholder="请输入微信号" />

            <div class="detail-line gray"></div>
            <div class="tips-wrapper">
              <div class="tips-title">第一步，填写微信号</div>
              <div class="tips-content">
                <p>进入「我 - 个人信息 - 微信号」长按复制黏贴至表单后点击下一步</p>
              </div>
            </div>

            <div class="btn-group">
              <div>
                <u-button :customStyle="{ display: 'block', width: '100%' }" style="
                    display: block;
                    width: 100%;
                    line-height: 40px;
                    border: 1px solid #f3f3f3;
                  " shape="circle" :plain="true" text="取消" @click="$nav.back()"></u-button>
              </div>
              <div>
                <u-button :customStyle="{ display: 'block', width: '100%' }"
                  style="display: block; width: 100%; line-height: 40px;background:#FF6146" type="primary" shape="circle" text="下一步"
                  @click="next"></u-button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <tz-tab-bar />
    <tz-footer />
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
  @import "./css.css";
</style>