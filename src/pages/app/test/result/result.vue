<template>
  <div class="container">
    <tz-loading-page tip="正在加载" :loading="loading"/>
    <tz-box>
      <div class="result-box" v-if="data.test.result_show_type == 1">
        <div class="result-val">
          <div class="result-name">
          {{ data.grade_status == 0 ? '考试结果' : (data.test.pass_score_type == 0 ? '你的分数' : '考试结果') }}
          </div>
          <div class="result-val-num">
            <template v-if="data.grade_status == 0">正在批改中</template>
            <template v-else-if="data.test.pass_score_type == 0"
              >{{ data.user_score }}<span class="result-val-unit">分</span></template
            >
            <template v-else>{{
              data.user_score > data.test.pass_score_val ? "通过" : "未通过"
            }}</template>
          </div>
        </div>
      </div>

      <div class="test-property-box">
        <div class="test-property-item">
          <div class="test-property-item-name">总分数</div>
          <div class=""></div>
          <div class="test-property-item-value">
            <span>{{ data.test_score }}</span>
          </div>
        </div>
        <div class="test-property-item">
          <div class="test-property-item-name">题目数</div>
          <div class=""></div>
          <div class="test-property-item-value">
            <span>{{ data.question_count }}</span>
            <span class="test-property-item-unit">题</span>
          </div>
        </div>
        <div class="test-property-item" v-if="data.test.pass_score_type">
          <div class="test-property-item-name">通过分数</div>
          <div class=""></div>
          <div class="test-property-item-value">
            <span>{{ data.test.pass_score_val }}</span>
            <span class="test-property-item-unit">分</span>
          </div>
        </div>

        <div class="test-property-item">
          <div class="test-property-item-name">答题用时</div>
          <div class=""></div>
          <div class="test-property-item-value">
            <span>{{
              data.submittime - data.createtime > 0
                ? $tools.formatMediaTime(data.submittime - data.createtime)
                : 0
            }}</span>
            <span class="test-property-item-unit"></span>
          </div>
        </div>
      </div>

      <div class="test-time">
        <div>本次考试开始时间：{{ $tools.formatDate(data.createtime) }}</div>
        <div>本次考试提交时间：{{ $tools.formatDate(data.submittime) }}</div>
        <div v-if="data.test.test_time_limit">
          本场考试结束时间：{{ $tools.formatDate(data.test.test_time_end) }}
        </div>
      </div>
    </tz-box>
    <tz-divider />
    <div class="btn-groups">
      <div
        class="btn"
      >
      <tz-button
          :customStyle="{ width: '100%' }"
          class="custom-style"
          long
          :text="data.button.text"
          @click="buildWork"
          :disabled="!data.button.status"
        ></tz-button>
      </div>
      <div class="btn">
        <tz-button @click="gohome" long type="primary" shape="circle" text="回首页逛逛"></tz-button>
      </div>
    </div>

    <template v-if="data.grade_status != 0 && data.question_list && data.question_list.length > 0">
      <tz-divider />
      <tz-title title="答卷" size="small" :more="false" />
      <tz-box padding="0 15px 15px">
        <template v-for="(item, index) in data.question_list">
          <question-box
            :key="item.id"
            :edit="false"
            :score="item.score"
            :option="item.option"
            :type="item.type"
            :analysis="item.analysis"
            :question="item.question"
            :user_answer="data.user_answer ? data.user_answer[item.id] : ''"
            :answer="item.answer"
            :grade_status_text="item.grade_status_text"
            :grade_comment="item.grade_comment"
            :user_score="item.user_score"
            :is_correct="item.is_correct"
            @changeoption="changeOption"
          />
          <tz-divider v-if="index < data.question_list.length - 1" />
        </template>
      </tz-box>
    </template>

    <tz-tab-bar />
    <tz-footer />
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
