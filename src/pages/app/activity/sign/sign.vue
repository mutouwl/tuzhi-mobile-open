<template>
  <div class="container">

    <u-loading-page :loading="loading"></u-loading-page>

    <div class="activity-box">
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
        <live-start-time-bar :start-time="data.activity_start_time" />
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
