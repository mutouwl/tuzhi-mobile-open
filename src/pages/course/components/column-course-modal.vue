<template>
  <div>
    <u-popup :show="show" @close="close" @open="open" :closeable="true" :round="10">
      <div class="popup-title" @click="backColumn">
      <u-icon color="#A9AEB8" name="arrow-left" size="12"></u-icon>
      <span>返回专栏</span>
        
      </div>
      <div class="box">
        <column-dir :courseId="courseId" :columnId="columnId" />
      </div>
    </u-popup>
  </div>
</template>

<script>
var that;
import columnDir from "@/pages/course/components/column-dir.vue";
export default {
  components: { columnDir },
  data() {
    return {
      show: false,
      subscription: false,
    };
  },
  props: {
    visible: {
      type: [Boolean, Number],
      default: false,
    },

    columnId: {
      //专栏ID
      type: [Number, String],
      default: () => {
        return 0;
      },
    },
    courseId: {
      //这里的课程ID
      type: [Number, String],
      default: () => {
        return 0;
      },
    },
  },
  watch: {
    visible() {
      this.show = this.visible;
      if (this.show) {
        this.loading = true;
      }
    },
  },
  methods: {
    close() {
      this.$emit("close", false);
    },
    open() {
      this.$emit("open", false);
    },

    backColumn(){
        var path = "/pages/course/detail/detail?id=" + this.columnId;
        this.$nav.to(path, "local","redirectTo");
    }
  },
  mounted(pageParams) {
    that = this;
    this.loading = true;
  },
};
</script>

<style>
.box {
  padding: 0 15px 15px;
  max-height: 500px;
  overflow-y: auto;
  background-color: #fff;
}

.loading {
  width: 100%;
  height: 200px;
  padding-top: 100px;
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

.popup-title span{
    margin-left: 4px;
}
</style>
