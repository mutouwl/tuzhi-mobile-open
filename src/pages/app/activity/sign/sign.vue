<template>
  <div class="container">

    <!-- 首屏骨架（2026-10-31 用户点名「加载方式调整为骨架屏」，与活动详情 / 报名信息两页同批）：
         外壳走真实 .activity-box（94% 宽 / 白底 / 圆角 10 / 阴影），灰块只替换会变的那几格
         （封面 / 活动名 / 浏览次数 / 时间条）；下方那张表单的标签与输入框是静态的，
         骨架期间照常显示，不铺灰块 -->
    <view class="activity-box" v-if="loading">
      <view class="asign-sk-cover"></view>

      <tz-box padding="15px 15px 15px">
        <view class="asign-sk-block asign-sk-title"></view>
        <view class="asign-sk-block asign-sk-subtitle"></view>
        <view class="asign-sk-block asign-sk-time"></view>
      </tz-box>
    </view>

    <div class="activity-box" v-else>
      <banner :cover="data.cover" type="activity" />

      <tz-box padding="15px 15px 15px">
        <div class="info">
          <div class="title">
            {{ data.name }}
          </div>
          <div class="subtitle">
            {{ data.views }}次浏览
          </div>
        </div>
        <live-start-time-bar :start-time="data.activity_start_time" :end-time="data.activity_end_time" />
      </tz-box>
    </div>


    <tz-box padding="10px 15px 0px" style="margin-top: 30px;">
      <u-form labelPosition="top" ref="uForm" labelWidth="300">
        <u-form-item label="购票姓名">
          <u-input border="none" v-model="form.name" placeholder="请输入购票时填写的姓名"></u-input>
        </u-form-item>
        <u-form-item label="购票手机号">
          <u-input border="none" v-model="form.mobile" placeholder="请输入购票时填写的手机号"></u-input>
        </u-form-item>
      </u-form>
    </tz-box>

    

    <tz-bottom-btn @handle="check" btnTitle="立即签到" />
    <tz-footer />

  </div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
