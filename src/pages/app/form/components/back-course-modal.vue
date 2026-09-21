<template>
    <div>
        <u-popup
            :show="show"
            title="选择关联的课程"
            @close="close"
            @open="open"
            :closeable="true"
            :round="10">
            <div class="course-box">
            <tz-box bgColor="none">
                <template v-if="courses && courses.length > 0">
                    <tz-course-mini :list="courses" :border="true" :round="true" />
                </template>

                <u-empty
                    icon="/static/image/empty.png"
                    width="70"
                    height="70"
                    v-else
                    text="暂无课程" />
            </tz-box>
            </div>

        </u-popup>
    </div>
</template>

<script>
var that;
export default {
  components: {},
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
    mobile: {
      type: [String, Number],
      default: "",
    },
    courses: {
      type: [Array, Object],
      default: () => {
        return [];
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
    copy() {
      uni.setClipboardData({
        data: that.mobile,
        success: function () {
          uni.$u.toast("联系电话已复制");
        },
      });
    },
    preview() {
      var imgPath = [this.code];
      uni.previewImage({
        urls: imgPath,
        longPressActions: {
          itemList: ["发送给朋友", "保存图片", "收藏"],
          success: function (data) {},
          fail: function (err) {
            console.log(err.errMsg);
          },
        },
      });
    },
  },
  created() {},
  mounted() {
    that = this;
    this.show = this.visible;
  },
};
</script>

<style scoped>

.course-box{
    max-height: 500px;
    overflow-y: auto;
}

</style>
