<template>
  <u-popup 
    :show="show" 
    @close="close" 
    @open="open" 
    :closeable="true" 
    :round="10"
    mode="bottom">
    
    <div class="popup-header">
      <div class="popup-title">回放列表</div>
    </div>
    
    <div class="popup-content">
      <div v-if="loading" class="playback-video-skeleton">
        <div
          v-for="index in 4"
          :key="index"
          class="playback-video-skeleton-item"
        >
          <u-skeleton
            :loading="true"
            :animate="true"
            :title="true"
            title-width="45%"
            title-height="14"
            :rows="1"
            rows-width="25%"
            rows-height="12"
          />
        </div>
      </div>

      <div class="playback-video-list" v-else-if="videoList.length > 0">
        <u-cell-group :border="false">
          <u-cell
            size="large"
            v-for="(item, index) in videoList"
            :key="item.id || item.file_path || index"
            :class="[{ active: index === activeIndex }]"
            @click="play(index)"
            :border="videoList.length - 1 == index ? false : true">
            <div slot="title" class="playback-video-title">
              {{ item.file_name }}
            </div>
            <div slot="title" class="playback-video-label">
              {{ index === activeIndex ? '正在播放' : '待播放' }}
            </div>
            <div slot="icon">
              <div class="playback-video-no">{{ index + 1 }}.</div>
            </div>
            <div slot="value" class="playback-video-icon">
              <u-icon name="play-right" :color="index === activeIndex ? '#0968f6' : '#c9cdd4'"/>
            </div>
          </u-cell>
        </u-cell-group>
      </div>

      <u-empty
        icon="/static/image/empty.png"
        width="70"
        height="70"
        v-else
        text="暂无回放视频" />
    </div>
  </u-popup>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      activeIndex: null,
      videoList: [],
      show: false,
      loading: false,
      requestId: 0,
    };
  },
  computed: {},
  props: {
    courseId: {
      type: [String, Number],
      default: 0,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    currentVideoUrl: {
      type: String,
      default: "",
    },
  },
  watch: {
    courseId() {
      // that.getData();
    },
    visible() {
      this.show = this.visible;
      if (this.show) {
        this.getData();
      }
    },
    currentVideoUrl() {
      this.syncActiveIndex();
    },
  },
  methods: {
    play(index) {
      this.activeIndex = index;
      this.$emit("play", this.videoList[index].file_path);
    },
    close() {
      this.$emit("close", false);
    },
    open() {
      this.$emit("open", true);
    },
    normalizeVideoUrl(url) {
      return String(url || "").split("#")[0].split("?")[0];
    },
    syncActiveIndex() {
      if (!this.currentVideoUrl || !this.videoList.length) {
        this.activeIndex = null;
        return;
      }

      var currentUrl = this.normalizeVideoUrl(this.currentVideoUrl);
      this.activeIndex = this.videoList.findIndex((item) => {
        return this.normalizeVideoUrl(item.file_path) === currentUrl;
      });
      if (this.activeIndex < 0) {
        this.activeIndex = null;
      }
    },
    getData() {
      var currentRequestId = ++this.requestId;
      this.loading = true;
      this.videoList = [];
      this.activeIndex = null;

      this
        .$api("live.room.playback", {
          course_id: this.courseId,
        })
        .then((res) => {
          if (currentRequestId !== this.requestId) return;
          if (res.code === 1) {
            this.videoList = Array.isArray(res.data) ? res.data : [];
            this.syncActiveIndex();
          }
        })
        .catch(() => {})
        .then(() => {
          if (currentRequestId === this.requestId) {
            this.loading = false;
          }
        });
    },
  },
  mounted() {
    this.show = this.visible;
  },
};
</script>

<style>
.popup-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.popup-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.popup-content {
  padding: 0 15px 20px;
  min-height: 260px;
  max-height: 400px;
  overflow-y: auto;
}

.playback-video-skeleton {
  padding: 10px 0;
}

.playback-video-skeleton-item {
  padding: 10px 0;
  border-bottom: 1px solid #efefef;
}

.playback-video-skeleton-item:last-child {
  border-bottom: 0;
}

.playback-video-no {
  font-size: 16px;
  font-weight: 700;
  color: #86909c;
  width: 30px;
}

.playback-video-list {
  padding: 10px 0;
}

::v-deep .u-cell__body {
  padding: 10px 0 !important;
}

::v-deep .playback-video-title {
  font-size: 14px !important;
  font-weight: 400 !important;
}

::v-deep .playback-video-label {
  font-size: 12px !important;
  margin-top: 2px !important;
  color: #86909c;
}

::v-deep .u-cell__body .u-cell__value {
  font-size: 14px !important;
  font-weight: 700 !important;
}

::v-deep .u-line {
  border-bottom: 1px solid #efefef !important;
}

.active .u-cell__value,
::v-deep .active .playback-video-title,
.active .playback-video-label {
  color: #0968f6;
}
</style>
