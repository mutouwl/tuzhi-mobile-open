<template>
  <div>
    <u-popup :show="show" @close="close" @open="open" :closeable="true" :round="10">
      <div class="popup-title" @click="backCircle">
        <u-icon color="#A9AEB8" name="arrow-left" size="12"></u-icon>
        <span>返回圈子</span>
      </div>
      <div class="box">
        <circle-course-dir :circle-id="circleId" :is-member="true" :current-course-id="currentCourseId" />
      </div>
    </u-popup>
  </div>
</template>

<script>
var that;
import circleCourseDir from "@/components/tz/circle-course-dir.vue";
export default {
  components: { circleCourseDir },
  data() {
    return {
      show: false,
    };
  },
  props: {
    visible: {
      type: [Boolean, Number],
      default: false,
    },
    circleId: {
      type: [Number, String],
      default: () => {
        return 0;
      },
    },
    currentCourseId: {
      type: [Number, String],
      default: () => {
        return 0;
      },
    },
  },
  watch: {
    visible() {
      this.show = this.visible;
    },
  },
  methods: {
    close() {
      this.$emit("close", false);
    },
    open() {
      this.$emit("open", false);
    },
    backCircle() {
      var path = "/pages/app/circle/index/index?id=" + this.circleId;
      this.$nav.to(path, "local", "redirectTo");
    },
  },
  mounted(pageParams) {
    that = this;
  },
};
</script>

<style>
.box {
  padding: 0 5px 15px;
  max-height: 500px;
  overflow-y: auto;
  background-color: #fff;
}
.popup-title {
  width: 100%;
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  text-align: left;
  font-weight: 500;
  color: #1d2129;
  padding-left: 15px;
  display: flex;
  justify-content: left;
  align-items: center;
}
.popup-title span {
  margin-left: 4px;
}
</style>
