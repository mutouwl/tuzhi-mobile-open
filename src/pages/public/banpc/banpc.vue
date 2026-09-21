<template>
  <div class="ban_pc_box">
    <div class="tip-text">
      商家已设置该课程不支持pc端学习<br />请前往手机端小程序观看此课程
    </div>
    <div class="share-imgs">
      <div class="share-poster-loading" v-if="posterLoading"></div>
      <div class="share-poster-img" v-else-if="!posterSrc" @click="getPoster">海报生成失败，点此重试</div>
      <img class="share-poster-img" v-else @click="preview" :src="posterSrc" />
      <div class="share-tip" v-if="!posterLoading">点击图片后长按可保存至相册</div>
    </div>
    <div class="tip-text">或在手机微信搜索【{{ name }}】小程序</div>
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
