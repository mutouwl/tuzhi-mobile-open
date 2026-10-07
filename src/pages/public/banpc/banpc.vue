<template>
  <div class="ban_pc_box">
    <div class="tip-text">
      商家已设置该课程不支持pc端学习<br />请前往手机端小程序观看此课程
    </div>
    <div class="share-imgs" @tap="preview">
      <!-- 海报改到前端画（与分享弹窗同一只组件的 inline 档，M18⑧「海报一律用户端生成」）：
           这一张上的码扫出去就是这一条课程，店铺名取系统配置、封面取分享图文接口给的那一张；
           不再请求 share/getPoster 让后端合图（那一处只有头像与二维码，认不出是哪门课）。
           图由组件在挂出来时自己出（@rendered 回地址），点这一张放大预览 -->
      <tz-share-poster inline layout="content" :poster="poster" code-type="goods" :code-id="pageParams.id"
        subject="分享海报" @rendered="onRendered"></tz-share-poster>
      <div class="share-tip">点击图片可放大，长按或右键可保存</div>
    </div>
    <div class="tip-text">或在手机微信搜索【{{ name }}】小程序</div>
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
