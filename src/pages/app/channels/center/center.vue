<template>
  <div class="container">
    <tz-title title="可加入的视频号小店" bgColor="none" :link="{
        type: 'local',
        src: '/pages/app/channels/sharer/bind/bind',
      }" subtitle="查看已加入的小店" :more="true" />
    <template v-if="list && list.length > 0">
      <div class="store-item" v-for="(item, index) in list">
        <div class="store-info-box">
          <span class="store-info-name">{{ item.nickname }}</span>
        </div>
        <div class="store-join" @click="join(item.id)" v-if="!item.is_bind">成为分享员</div>
        <div class="store-join" @click="copy(item.nickname)" v-else>立即分享</div>
      </div>
    </template>
    <u-empty icon="/static/image/empty.png" text="暂无可分享小店" width="70" height="70" v-else />

    <tz-tab-bar />
    <tz-footer />
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
  @import "./css.css";
</style>