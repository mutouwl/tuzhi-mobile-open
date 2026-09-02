<template>
  <div
    class="container"
    :style="{ 'background-color': page.bgColor == 'default' ? '#fff' : page.diyColor }">
    <div
      class="header"
      v-if="page.banner_show == 1"
      style="background-image: linear-gradient(-20deg, #e9defa 0%, #fbfcdb 100%)">
      <div class="img-wrap">
        <img v-if="page.banner_bg_img" :src="page.banner_bg_img" alt
          class="header-img" />
      </div>
      <div class="header-wrap">
        <div class="header-title">{{ page.name }}</div>
        <div class="form-description" v-if="page.banner_desc">{{
          page.banner_desc }}</div>
      </div>
    </div>

    <custom-form
      :disabled="(!status_info.can_submit || pageParams.log_id && !editmode) ? true : false"
      ref="customForm"
      :key="formKey"
      v-model="formValue"
      :components="components" />

    <template v-if="!loading">
      <template v-if="!pageParams.log_id || editmode">
      <tz-bottom-btn :disabled="!status_info.can_submit" @handle="submitCheck" :btnTitle="status_info.can_resubmit ? (editmode ? '修改':'提交') : status_info.message" />
    </template>

    <template v-else>
      <view class="bottom-btn-box">
        <div class="control-btn" @click="resubmit"
          v-if="status_info.can_resubmit == 1">
          <div><tz-icon name="brush" color="#444" :size="26" /></div>
          <div>再填一份</div>
        </div>

        <div class="control-btn" @click="editsubmit"
          v-if="status_info.can_modify == 1">
          <div><tz-icon name="editor" color="#444" :size="26" /></div>
          <div>修改表单</div>
        </div>
        <div
          class="control-btn"
          @click="modal.backCourse = true"
          v-if="pageParams.from !== 'order' && content_list.length > 0">
          <div><tz-icon name="manage" color="#444" :size="26" /></div>
          <div>返回课程</div>
        </div>

        <div class="control-btn" @click="toLogPage">
          <div><tz-icon name="order" color="#444" :size="26" /></div>
          <div>提交记录</div>
        </div>
      </view>
      
    </template>
    </template>

    <back-course-modal
      :courses="content_list"
      :visible="modal.backCourse"
      @close="modal.backCourse = false" />
    <tz-tab-bar />
    <tz-footer />

    <tz-loading-page tip="正在加载页面" :loading="loading" />
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
