<template>
  <div class="container">
    <tz-loading-page :loading="loading" />

    <tz-box padding="0px 15px" v-if="list.length > 0">
      <div class="cert-box">
        <div class="cert-item" v-for="(item, index) in list">
          <div class="cert-item-info">
            <div class="cert-item-info-title one-line-hidden">
              {{ item.form.name }}
            </div>
            <div class="cert-item-info-step">
              <div class="progress-val">
                最后提交：{{ item.updatetime }}
              </div>
            </div>
          </div>
          <div class="cert-item-start">
            <u-button
              type="default"
              @click="detail(item.id)"
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
      v-else
      text="暂无表单提交记录"
    />

    <tz-loading-page tip="正在加载页面" :loading="loading" />
    <tz-tab-bar />
    <tz-footer />
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
