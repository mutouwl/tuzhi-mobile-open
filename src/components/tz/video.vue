<template>
  <div>
    <div class="video-box">
      <div class="card-item" style="--flex-align: flex-start">
        <div class="image-box video-ref">
          <div
            class="middle-sty-custom"
            :style="'background:url('+patch+');'"
          ></div>
          <!--  #ifdef  H5 -->
          <video-h5  :cover="patch" :source="path" :autoplay="false" :domId="domId"/>
            <!--  #endif -->

            <!--  #ifdef  MP-WEIXIN -->
            <video-mp  :cover="patch" :source="path" :autoplay="false"/>
            <!--  #endif -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// #ifdef H5
import videoH5 from "@/components/video/video-h5.vue";
// #endif
// #ifdef MP
import videoMp from "@/components/video/video-mp.vue";
// #endif
export default {
  components: {
    // #ifdef H5
    videoH5,
    // #endif
    // #ifdef MP
    videoMp
    // #endif
  },
  data() {
    return {
    };
  },
  props: {
    patch:{
        type: String,
        default: "",
    },
    path:{
        type: String,
        default: "",
    },
    height: { type: [String, Number], default: 100 },
  },
  computed: {
    domId() {
      return Math.random().toString(36).substr(2);
    }
  },
  methods: {
    handle(index) {
      var item = this.list[index].link;
      if (item.type) {
        this.$nav.to(item.src, item.type);
      }
    },
  },
  watch: {},
  mounted() {},
};
</script>
<style>
.video-box {
  position: relative;
  width: 100%;
}

.card-item {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  overflow: hidden;
}

.card-item .image-box {
  position: relative;
  box-sizing: border-box;
}

.top-image {
  position: absolute;
  left: 0;
  z-index: 2;
  top: 0;
  object-fit: contain;
}

.card-item .image-box img,
.card-item .image-box .default-img-video {
  object-fit: cover;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.card-item .image-box .video-img {
  object-fit: contain;
}

.card-item .image-box .video-title-wrap {
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 0;
  padding: 8px 12px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%);
  z-index: 2;
  box-sizing: border-box;
}

.two-line-hidden {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card-item .image-box .video-title-wrap .video-title {
  font-weight: 600;
  color: #fff;
  word-break: break-all;
  word-wrap: break-word;
  white-space: normal;
}

.card-item .image-box .video-title-wrap .video-title.video-title-big {
  font-size: 16px;
  line-height: 24px;
}

.middle-sty,.middle-sty-custom {
  height: 100%;
  width: 100%;
  top: 0;
  position: absolute;
  margin: 0 auto;
  padding: 1em;
  background: hsla(0, 0%, 100%, 0.25) border-box;
  overflow: hidden;
  text-shadow: 0 1px 1px hsla(0, 0%, 100%, 0.3);
  -webkit-user-select: none;
  user-select: none;
}
</style>
