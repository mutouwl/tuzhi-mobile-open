<template>
  <div
    class="image-box"
    :style="'gap: ' + gap + 'px; grid-template-columns:repeat(' + col + ', 1fr)'">
    <div
      class="img-box"
      :style="{ borderRadius: round ? round_val + '%' : '0px' }"
      @click="handle(item.link)"
      v-for="(item, index) in list">
      <div class="img-container" :style="{height:height+'px'}">
        <img :src="item.img" class="img-item" style="object-fit: cover" />
      </div>
      <div class="img-title" v-if="title_status && item.title">
        <div class="img-title-container">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: [Object, Array],
      default: () => {
        return [];
      },
    },
    col: { type: [String, Number], default: 3 },
    gap: { type: [String, Number], default: 10 },
    height: { type: [String, Number], default: 100 },
    round: { type: [Boolean, Number], default: 0 },
    title_status: { type: [Boolean, Number], default: false },
    round_val: { type: [String, Number], default: 10 },
  },
  methods: {
    handle(link) {
      if (link && link.type) {
        this.$nav.to(link.src, link.type);
      }
    }
  },
  watch: {},
  mounted() {},
};
</script>

<style>
.image-box {
  display: grid;
  justify-items: stretch;
  align-items: stretch;
}

.img-box {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.img-container {
  width: 100%;
  height: 100%;
}

.img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-title {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  text-align: center;
  font-size: 14px;
  padding: 4px 0;
}
</style>
