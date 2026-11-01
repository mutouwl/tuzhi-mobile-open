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
    <div class="cover">
      <!-- 封面走 `<image>`：背景图没有「加载失败」这一档（2026-10-29 口径 M65）-->
      <image class="col-cover-img" :src="coverSrc" mode="scaleToFill" @error="onCoverError" />
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
import { mpKey } from '@/common/utils/mp-data-key.js';
export default {
  // #ifdef MP-TOUTIAO
  i18n,
  // #endif
  components: {},
  data() {
    return {
      // 封面加载失败标记（键 = mpKey(地址)）与全站默认商品图（2026-10-29，口径 M65）
      coverErrors: {},
      defaultCover: '/static/image/default-goods.jpg',
    };
  },
  computed: {
    /** 封面真正摆出去的那一张：地址为空或加载失败都换默认商品图 */
    coverSrc() {
      const url = String(this.cover || '');
      if (!url) { return this.defaultCover; }
      return this.coverErrors[mpKey(url)] ? this.defaultCover : url;
    },
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
    /** 图片 `@error` 回调会写到 data 上，入口先过「已销毁」闸门（M26②） */
    gone() {
      return this._isDestroyed === true || this._isBeingDestroyed === true;
    },
    /** 封面取不到（地址为空或加载失败）：记下这一张并让模板换默认商品图（M65） */
    onCoverError() {
      if (this.gone()) { return; }
      const url = String(this.cover || '');
      if (url) { this.$set(this.coverErrors, mpKey(url), true); }
    },
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

/* 封面图（2026-10-29，口径 M65）：铺满 `.cover` 的盒子，几何与原来那张
   `background-size:100% 100%` 一致；圆角继承容器，换写法不改视觉，只为拿到 `@error` */
.course-item-box .cover .col-cover-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
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
