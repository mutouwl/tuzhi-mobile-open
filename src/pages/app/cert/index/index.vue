<template>
  <div class="container">
    <!-- 页签留在骨架屏之外，加载中照样可切（M16） -->
    <u-sticky bgColor="rgba(250, 250, 250, 1)" style="padding-bottom: 2px;" :offsetTop="0">
      <tz-box padding="10px 15px 0px" bgColor="rgba(250, 250, 250, 1)">
        <u-tabs :list="tabs" :current="current" :scrollable="true" @change="tabChange"></u-tabs>
      </tz-box>
    </u-sticky>

    <!-- 首屏骨架屏（M16，替掉原先的 tz-loading-page 整页遮罩：接口快于 300ms 淡入时整页闪白，
         慢时又只有转圈没有信息）。外壳与真实列表同一只 tz-box、同一份内衬，每一行复用真实行的
         .cert-item / .cert-item-info / .cert-item-info-step / .cert-item-start，
         灰块按真实版式给高（标题行走 u-skeleton 的 18 档＝那只组件的默认行高，也约等于 14px 正文的行盒；
         元信息两项按 12px 文字档；按钮块与 u-button size="small" 同为 60×30），不另抄一套尺寸。
         判据是 loading && !list.length：上拉翻页由已有列表顶着，不闪骨架 -->
    <tz-box padding="0px 15px" v-if="loading && !list.length">
      <view class="cert-item" v-for="i in 3" :key="'cert-sk-' + i">
        <view class="cert-item-info">
          <!-- rows-width 必须传数组：写成字符串时 u-skeleton 认不出数组，最后一行宽度被写死 70% -->
          <u-skeleton :loading="true" :animate="true" :title="false" :rows="1" :rows-width="['58%']" rows-height="18" />
          <view class="cert-item-info-step">
            <view class="cert-sk-meta-time"></view>
            <view class="cert-sk-meta-type"></view>
          </view>
        </view>
        <view class="cert-item-start cert-sk-btn"></view>
      </view>
    </tz-box>

    <tz-box padding="0px 15px" v-else-if="list.length > 0">
      <div class="cert-box">
        <div class="cert-item" v-for="(item, index) in list">
          <div class="cert-item-info">
            <div class="cert-item-info-title one-line-hidden">
              {{ item.title }}
            </div>
            <div class="cert-item-info-step">
              <div class="progress-prop">{{ item.createtime }}</div>
              <div class="progress-val">
                {{ item.type_text }}
              </div>
            </div>
          </div>
          <div class="cert-item-start">
            <u-button type="default" @click="show(item.id)" size="small" text="查看"></u-button>
          </div>
        </div>
      </div>
    </tz-box>

    <u-empty
      icon="/static/image/empty.png"
      width="70"
      height="70"
      v-else
      text="暂无证书"
    />

    <tz-tab-bar />
    <tz-footer />

    <tz-cert-viewer :show="viewerShow" :pending="certPending" :layout="certLayout" subject="证书"
      @close="viewerShow = false" />
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
