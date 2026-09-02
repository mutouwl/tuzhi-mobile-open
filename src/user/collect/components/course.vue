<template>
  <div
    :class="[
      'course-item-box',
      {
        'course-item-box-round': round,
        'course-item-box-border': border,
      },
    ]"
    :style="{
      'margin-bottom': margin + 'px',
    }"
    @click="$nav.to(itemId, 'course')"
  >
    <div
      class="cover"
      :style="{
        'background-image': 'url(' + cover + ')',
        'background-size': '100% 100%',
      }"
    >
      <div class="type">
        <span>{{ $t(type) }}</span>
      </div>
    </div>
    <div class="info">
      <div :class="['title', 'two-line-hidden']">
        {{ name }}
      </div>

      <div class="time" @click.stop="">
        <!-- <span @click="cancel(itemId, index)">
          <tz-icon name="qingchu" size="16" color="#4e5969" />
        </span> -->
        <!-- <tz-button @click="cancel(itemId, index)" size="small" text="取消收藏"/> -->
      </div>
    </div>
  </div>
</template>

<script>
// #ifdef MP-TOUTIAO
import i18n from "@/components/language/index.js";
// #endif
export default {
  // #ifdef MP-TOUTIAO
  i18n,
  // #endif
  components: {},
  data() {
    return {};
  },
  props: {
    cover: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    itemId: {
      type: [String, Number],
      default: "",
    },
    index: {
      type: [String, Number],
      default: "",
    },
    start_time: {
      type: [String, Number],
      default: 0,
    },
    end_time: {
      type: [String, Number],
      default: 0,
    },

    //是否有圆角
    round: {
      type: [Boolean, Number],
      default: false,
    },

    //单列 双列
    type: {
      type: String,
      default: "single",
    },
    border: {
      type: [Boolean, Number],
      default: false,
    },
    //间距
    margin: {
      type: Number,
      default: 10,
    },
  },
  methods: {
    cancel(id, index) {
      var that = this;
      uni.showModal({
        title: "提示",
        content: "确定要取消收藏吗",
        success: function (res) {
          if (res.confirm) {
            // that.$api('user.info.logout', {}).then(res => {
            //     if (res.code === 1) {
            //         this.$emit('cancel', id, index);
            //     }
            // });
            that.$emit("cancel", id, index);
          }
        },
      });
    },
  },
  watch: {},
  mounted() {},
};
</script>
<style>
.course-item-box {
  width: 100%;
  height: 120px;
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  margin-bottom: 10px;
  overflow: hidden;
}

.course-item-box .info {
  width: calc(100% - 160px);
  padding: 8px;
  overflow: hidden;
  position: relative;

  display: flex;
  align-items: start;
  justify-content: space-between;
}

.course-item-box .cover {
  height: 100%;
  width: 160px;
  position: relative;
}

.course-item-box .info .time {
  /* position: absolute;
        bottom: 6px;
        right: 8px;
        font-size: 13px;
        line-height: 20px; */
  text-align: right;
}

.time-value {
  color: #4e5969;
  margin-left: 4px;
}

.course-item-box-round {
  border-radius: 10px;
}

.course-item-box-border {
  border: 1px solid #efefef;
}

.course-item-box:last-child {
  margin-bottom: 0;
}

.course-item-box .info .title {
  color: #1d2129;
  font-size: 14px;
  font-weight: 600;
}

.course-item-box .info .subtitle {
  color: #86909c;
  font-size: 12px;
  margin-top: 4px;
}

.course-item-box .info .time .unit,
.course-item-box .info .time .marking {
  font-size: 14px;
}

.course-item-box .cover .type {
  position: absolute;
  bottom: 4px;
  right: 4px;
  height: 20px;
  border-radius: 0.08rem;
  padding: 0px 6px;
  box-sizing: border-box;
  line-height: 18px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.course-item-box .cover .type span {
  color: #fff;
  font-weight: 400;
  font-size: 12px;
}
</style>
