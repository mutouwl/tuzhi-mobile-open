<template>
  <div class="container">
    <tz-loading-page tip="正在加载" :loading="loading"/>
    <div class="test-header-box">
      <img :src="data.cover" class="test-cover" />

      <tz-box padding="10px 15px 15px">
        <div class="test-info-box">
          <div class="test-info-title one-line-hidden">
            {{ data && data.name ? data.name : '-' }}
          </div>

          <div class="test-info-time one-line-hidden">
          考试时间：
            <template v-if="data.test_time_limit">{{ data.test_time_start_text }} 至 {{ data.test_time_end_text }}</template>
            <template v-else>不限</template>
          </div>
        </div>
      </tz-box>
    </div>

    <tz-divider />
    <tz-title title="考试信息" size="small" :more="false" />
    <tz-box padding="0 15px 15px">
      <div class="test-property-box">
        <div class="test-property-item">
          <div class="test-property-item-value">
            <span v-if="data.test_duration_limit == 0">不限</span>
            <template v-else>
              <span>{{ data.test_duration_val }}</span>
              <span class="test-property-item-unit">分</span>
            </template>
          </div>
          <div class="test-property-item-name">时长</div>
        </div>

        <div class="test-property-item"> 
          <div class="test-property-item-value">
            <span>{{ data.testpaper.question_amount }}</span>
            <span class="test-property-item-unit"></span>
          </div>
          <div class="test-property-item-name">题目量</div>
        </div>

        <div class="test-property-item" v-if="data.pass_score_type == 1">
          <div class="test-property-item-value">
            <span>{{ data.pass_score_val }}</span>
            <span class="test-property-item-unit"></span>
          </div>
          <div class="test-property-item-name">通过分数</div>
        </div>

        <div class="test-property-item">
          <div class="test-property-item-value">
            <span style="font-size: 16px">{{ data.testpaper.score_amount }}</span>
            <span class="test-property-item-unit"></span>
          </div>
          <div class="test-property-item-name">考试总分</div>
        </div>
      </div>
    </tz-box>

    <template v-if="data.bind_course && data.bind_course.length >0" >
      <tz-divider />
      <tz-title title="该考试关联课程" size="small" :more="false" />
      <tz-box padding="0 15px 15px">
        
        <bind-course-list :data="data.bind_course"/>
      </tz-box>
    </template>

    <template v-if="data.detail && data.detail != '<p><br></p>'">
      <tz-divider />
      <tz-title title="考试详情" size="small" :more="false" />
      <tz-box padding="0 15px 15px">
        <tz-parse :content="data.detail" />
      </tz-box>
    </template>

    <view class="btn-box">
      <template>
        <div class="control-btn" @click="result" v-if="data.last_worklog">
          <div><tz-icon name="dynamic" :size="26" color="#1D2129" /></div>
          <div>成绩</div>
        </div>
        <tz-button
          :customStyle="{ width: '100%' }"
          class="custom-style"
          type="primary"
          long
          :text="data.button.text"
          @click="handle"
          :disabled="!data.button.status"
        ></tz-button>
      </template>
      <!-- #ifdef MP-TOUTIAO -->
      <u-safe-bottom></u-safe-bottom>
      <!-- #endif -->
    </view>
    <!-- #ifndef MP-TOUTIAO -->
    <u-safe-bottom></u-safe-bottom>
    <!-- #endif -->
    <tz-footer />

    <bind-mobile-modal/>
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss" scoped>
@import "./css.css";
</style>
