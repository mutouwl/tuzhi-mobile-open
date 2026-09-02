<template>
  <div class="container">
    <tz-loading-page :loading="loading" />

    <u-sticky :offsetTop="0" bgColor="none">
      <!-- <u-tabs :list="tabs" @click="tabsChange"></u-tabs> -->
      <tz-box padding="10px 15px">
        <u-subsection :list="tabs" :current="current" @change="tabsChange"></u-subsection>
      </tz-box>
    </u-sticky>

    <tz-box padding="0px 15px" v-if="list.length > 0">
      <div class="cert-box">
        <div class="cert-item" v-for="(item, index) in list">
          <div class="cert-item-info">
            <div class="cert-item-info-title one-line-hidden">
              {{ item.title }}
            </div>
            <div class="cert-item-info-step">
              <div class="progress-prop">{{ item.createtime }}</div>
              <div class="progress-val">
                {{ item.type == "test" ? "考试证书" : "课程证书" }}
              </div>
            </div>
          </div>
          <div class="cert-item-start">
            <u-button
              type="default"
              @click="show(item.id)"
              size="small"
              text="查看"
            ></u-button>
          </div>
        </div>
      </div>
    </tz-box>

    <u-empty
      icon="/static/image/empty.png"
      width="70"
      height="70"
      v-else-if="!loading"
      text="暂无证书"
    />

    <tz-tab-bar />
    <tz-footer />
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
