<template>
  <view class="box">
    <div
      class="bind-course-box"
      @click="$nav.to(course.id, 'course')"
      v-for="(course, index) in data"
    >
      <div class="column-item-cover">
        <img :src="course.cover" />
      </div>

      <div class="column-item-info">
        <div class="column-item-info-title one-line-hidden">
          {{ course.name }}
        </div>
        <div class="column-item-info-subtitle">
          {{ course.is_subscription ? "已订阅" : "获取该考试需订阅该课程" }}
        </div>
      </div>

      <div class="column-item-more">
        <tz-icon name="enter" color="#86909C" :size="16" />
      </div>
    </div>
  </view>
</template>

<script>
var that;
export default {
  data() {
    return {};
  },
  props: {
    data: {
      type: Array,
      default: [],
    },
  },
  watch: {},
  methods: {},
  mounted() {
    that = this;
  },
};
</script>

<style>
.bind-course-title {
  font-weight: 500;
  color: #333;
  font-size: 16px;
  margin-bottom: 10px;
}

.bind-course-box {
  height: 45px;
  width: 100%;

  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: 10px;
  align-items: center;
}

.bind-course-box:last-child {
  margin-bottom: 0;
}

.bind-course-box .column-item-info {
  width: calc(100% - 100px);
  /* padding: 8px; */
  overflow: hidden;
  position: relative;
}

.bind-course-box .column-item-cover {
  height: 100%;
  width: 70px;
}

.bind-course-box .column-item-cover img {
  width: 100%;
  height: 100%;
  border-radius: 5px;
}

.bind-course-box .column-item-info .column-item-info-title {
  font-weight: 400;
  font-size: 14px;
  color: #333;
}

.bind-course-box .column-item-info .column-item-info-subtitle {
  color: #999999;
  font-size: 12px;
  margin-top: 6px;
  /* margin-top: 6px; */
  /* bottom: 0;
    left: 0;
    position: absolute; */
}

.column-item-more {
  /* margin-top: 26px; */
  /* position: absolute;
    right: 0px; */
  /* top: 36%; */
}
</style>
