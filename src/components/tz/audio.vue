<template>
  <div>
    <div class="audio-box">
      <div class="audio-container">
        <div class="title">
          <span class="text-line-one">{{ title }}</span>
          <div class="jump-btn" v-if="link_status" @click="jump">
            <span>
              详情
              <tz-icon name="enter" color="#b2b2b2" :size="12" />
            </span>
          </div>
        </div>
        <div class="audio-box">
          <div class="audio-info">
            <div class="audio-line-box">
              <u-slider
                @change="sliderChange"
                :disabled="loading"
                :value="currentTime"
                inactiveColor="#ccc"
                activeColor="#0968f6"
                :min="0"
                :blockSize="12"
                :max="duration"
              ></u-slider>
            </div>
            <div class="time-info">
              <div class="time-start">{{ $tools.formatMediaTime(currentTime) }}</div>
              <div class="time-end" style>
                {{ $tools.formatMediaTime(duration) }}
              </div>
            </div>
          </div>
          <div class="audio-icon">
            <template v-if="!loading">
              <span @click="play" v-if="!isplay">
                <tz-icon color="#0968f6" name="play1" :size="22" />
              </span>
              <span @click="pause" v-if="isplay">
                <tz-icon color="#0968f6" name="pause" :size="22" />
              </span>
            </template>
            <span class="loading" v-if="loading">
              <u-loading-icon color="#0968f6" textSize="18"></u-loading-icon>
            </span>
          </div>
          <!-- <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAC+9JREFUeF7tnHlwVdUdxz+/+7IBIQGSYLXW6gzWVpyxC13EFsba6rQzpcuAOFqr/UP+sKIQFu2iPlFrEROiKFatVaZTRwouU7UKU8cFxcFBLVOhIiguFCvvvUBCZEve/XXOvfckj0fy1puXRPNmGAbuds7nfn/L+Z17jjD8K4qAFHX18MUMAyxSBMMAhwEWSaDIywexAjWtbaJF9rVfLh9ggCrMwGGi54tdouLm1MuoOoDDZpSJaM7X5XTz/E4aGIAWQJQkpCkrqs6EBOUHy3Dcj/0g54xCa2pJbonSedT55oQZGhkokKUDaDppfqskad9xw2VarSM4RZQJrnCauHwB+LwI412oFRgBqMIhR4mrsBtllzpsdWATDtv5mO2x5dLRrZtenpOfpvI7uwQAAzO14KJaNmYfkyPKdIHJwClAdX7N7j67A2G7KC92CStrE2x89wE5CPaZuL0qtsCH9XZZ/wH0zRTrn2rn60kVLj9S5TLEg5b66wr+4V9Dn/mpDSTGV5q2+6oG8//m35uBB1xY2dosH/jPP7IdIbLL2NDinmMavRkx5tqwQD/jJvmNwHnAMSmdNaZsOu4HhMJ+BmQqTB+kshPh/oOdLOtYJjEPYtQ8K/xIHrICe8z1uKiOPNTOxcD1Ag0BLNvZQoFlw2wAmmeY+xtarQI3x2u4nagc9oLNqnDNOlyAXgMl2TBHv+w63Bn4ONNpm570F7h0sEbdpm/e8xSeicC83c2yyYfYE8iyvZFsx8MBmGIi9Y16KfAHYBxgfJvxU+E8J1tvjj5uFWna0ApcHW+We70gE0XCyB9D6FjPiGHcPBY7yoLAXK1/y7/b4V6RbtY3JWq41odn2l6cXywSoN+A+oU6WrpYofDTQaC6vvAbkMa0ywQeTXZySesyaS8WYuEAPbMVd+xVWhvp5EHgh4MYnoXaDRHlKbeL8z2IQV8KEX6BAK3ZijY06iMpyisrpBEDcI3xzZ4SY83yM1+FXvqZd8GiMIDBG6tv1EXANYFp2KR2AHgU9EhjzqbNt8Sb5apCVZg/wCANCKLtPUMUniVuIc7yonMBKU5+AK3y5uhXJcJaVepSRhYFyWCAL/JGLiIkFM6NN8mr+SoxD4BByJ+tlXXlPC7w/SGuvnQVrqtu5ZzuYkSO/jB3gIH66ubpQlEWf0LgWYheUFG4PNEsd+ZjyjkC9NVXPVsbKsvZnDK2zfH6ATbU7I/3TFlhtxPh9NgS+V+u+WFuAKJaRlS66hr1RoHf9pf6JGiNqaAOwM8LKAq3J5rlylxVmB1gYLpj5uiJZQ7PAyekVDyK7qdpgAHX6UJXEhyBijJ/8OyWFqSt4nwoEabGlsi2XAJKdoA9act8YEkw2gglYTbgki4cTkJDNZwwDvYdhG27fXijq/zjJVSkn2ALc2JNclsuKswO0GgsqlV17WwUmBhW2mLhGTgLz4XZZ0FluQ9szWa4ZQ1s2AE1I6A84v9/CX5+QVZ4K76P07hHOrM9MzNAO96do2dGHF4oonJ8VDsMwIOdsGgazDnbV5wxXwPUHGs7APeug7ueh11tUFPlHyuRVbsinBVrkheymXE2gF7waGjUZSbEhxU8DKBDXfClY2DdQl9hdlLDkDZqM+cYoFs+hBufhMf+5ftGo1I1Zp1NGoUf94KJwB2xZplNEED7ul0GgH7qcsx8HZV0veDxtbAAGjAdh+D8SXDfxT2qS22kpzajSsf/++HXIfoEvL0bqit9uP0UZOzw7pV4J1NYJocypTR9A7Tl+Ub9iuIBHB2W/zOdN8Hiksmw/IIj1Zf+pi0kc83e/dDyDNzxLBzo9EEaJYYcZKwx7EeZGl8qGzMFk74BBtJtmKfTVVkVZvS1AH9xBvzxwuy2lq7GTTth0ZPw1BtQWQZVQfDJfqecz7DlrvNjzbIykxlnAugVTOvm6Q2i/K4/AF58BtyVA0Db7XSQf9kAi9fAjjiMqoCIE1q09od2wo2JJrkmUyDJmsbUzdVVIkwPM3m2CswXoAXpBkHGBJoPWn2ID74Ch7tgVGUovtFPqpW/xZfKzEy6zRaFnfp2L305czABTAVphizmhbz8DsxfDf/eCSMqioZoAW6I1zI50+xdRoCnRrUi1sYbKpwcVgAxnS9WgamKSA0y8Q646M/w4nYYWRxEG0h2xGv4ojcp38evD4B+CnP8XB1xQPmvOIwdrABtvzqTfj759BaYflfRpmwB7qlSPrtzqRzoK5XJCPC4WTrycDUxYORgB2hHMm/H4MfLYeceP0IXmCt2pzIVHTTsukf2f2oAvp+AacthRwKqBhrgUDRhM+S78D4/yS5QfcYrFGvCvmfxgkg7byqcNFhNODWIxDrgvLth43vhBBFVtiVqOa2AIBK45qg6dW2sF+GbgzWNMbmg+bNuG1z/hF8CKzICm87b4upL8RqmFJzGmDvVz9WViPdxpL1pzuOhvk4sNo05IpHeAy3/hPvX+xXtEHLAboCqrE4slRmFJdI9s3CDcihnTPevG+Cmp+CdOIyp8pVYhN9L5RTCUM4WExp1psJDAzkWtoVUz1yB1z6A6x+HtVv8+uCIMugKt2JtS/szYk2yurBiQlDOqrtSvy4RngszF8zHhFODROJjaFoLK16GPfv9OZN+LGftE5gaa5bXCytnBR8fTpitlXvLvfHwN8IsqJp64EXfgrt/3ntB1QNnC6rAw6/C75+GzbtgdKVfeQnJXNNdnC2ovlrRwZRMSbS5MFsxod9K+qZycvJ4eGF+j+M3yvQ8uJkXCaY7zQzddX+HxzZBhQNVwRg35CJqKsSwSvrBGououGPm6ZQy5dmwJ5X2H4YbpsHc76VMKgVv1ZT8lz8Htz8LrR2+uRpFhuvq+oyvbtJlyp4Weam4SSV7/1laXj+aN1BvKVbq/E/BKY1RWDKYGbriLLj8uzBmhG/Oz7zp53Sm8myqzSWf1lQ2V+9hkv+hUeZf1oKqdaAN8/RKVVrCjMZe2uH68xvH1sKJdfBRO+zc6+d0XnG0f2fg0ul40RdYEG+WW8OZWA/ywZoFenJ5kucFjg0zqe7+tCPppyJmPrG8zK8Zlmgyvbs+G7io97tcpu5tkXezmW/2IGJvbVOauXqbCFeEFY3TX/+g+LioZx7EC6DFm7B3B7/AGqx72yQwPixfmK2BJTpuP2+LHepkore+Lsc1JNl9YLoKG/VXZtY+TF9YIkiZHuPnfsrC+FJZkovp2pvlDtC+kahWjWtjrSN8p79MucRA7XeBaxOdTMv2JcJRbievxtqPzOfqJIQ1wXq4UNKavNoR3sk9H5knOSfeIq/lo77cg0hqg4OAMnaOzoo43D3EVeipz4VZrSVZ5mBB2lJXoy4WWDhEIdox7w3xZrk2X+UV4ANTZZiy1GuuPqLSvcgwlC9Xw7PQPu/kl6uUR2NLB2Kpl2lXoMJxs7XGKeMhhB8MqcWG8I9kORfsWSxthaqvMB94xEv180MPYjkrgJ8MYog9y12VR5NdA73ctRtksILJTEC1syhYBnHEIucSmGS2R9i9GsQVlrQ2cVXPBfmv0Ex9WB55YIY2piz5H9eolzo9S/6No/Y2gMjWw3463qM6IZFMcnVri/xpkC35T+l6kOKMb9TTk9AkcHZw1CjAdKZUS2LTN7l4SV0uTbTIf3KpsOTzMkNWRsouRVGtqG/nCoVfi78BRSnM2r4ou+2J+a7nusoaVuyKyv7Bv+1Jql8MdsUw6+uqypmN8kuE40uy8Q58pLDSiXCzt+6tHzcnC1mBKeJP23JpXKN+znGZqQ6X9LJgJ3UXo0zZgV3dYE30yLxT2SrC8sMOj7fdKju81gzJrZ/SUx2zR6DdMSiqVWP3MalMmanCt1EmFLX5GGxVWJ8UVu8dzfruGl4/7FLUm2/sPwWmP62P7e+oYAIRJrhwuricgnCcKONdoV6gMliGesCBNlfZLQ7vqctbjnhfzm6XA2z9hG9/18t7S9mc7OijKqdGKW9vI5K6AWNVF+72OjqP/tDH24XIRPfcd8DMJ8xmObd0CuytIRZkMVuAhryZWL5sBxZgxtYOb0Kb78sckucPYgUODZ7DAIt8T8MAhwEWSaDIy/8PL5idnLPYRTIAAAAASUVORK5CYII="
            class="audio-icon" /> -->
        </div>
      </div>
    </div>

    <!--  #ifdef H5 -->
    <video-h5
      ref="audioPlayer"
      :domId="domId"
      :height="1"
      :mute="isMuted"
      :source="path"
      :isLive="false"
      :styles="{
        opacity: opacity,
        transition: 'opacity 0.5s ease-in-out',
        width: '50px',
        height: '50px',
        position: 'fixed',
        left: 0,
      }"
      @play="playerOnPlay"
      @pause="playerOnPause"
      @ended="playerOnEnded"
      @timeupdate="playerOnTimeupdate"
      @waiting="playerOnWaiting"
      @error="playerOnError"
      @loadedmetadata="audioLoaded"
    />
    <!--  #endif -->
    <!--  #ifdef MP -->
    <video
      id="audioPlayer"
      :src="path"
      :autoplay="false"
      :muted="isMuted"
      :style="{
        opacity: opacity,
        transition: 'opacity 0.5s ease-in-out',
        width: '50px',
        height: '50px',
        position: 'fixed',
        left: 0,
      }"
      @play="playerOnPlay"
      @pause="playerOnPause"
      @ended="playerOnEnded"
      @timeupdate="playerOnTimeupdate"
      @waiting="playerOnWaiting"
      @error="playerOnError"
      @loadedmetadata="audioLoaded"
    ></video>
    <!--  #endif -->
  </div>
</template>

<script>
// #ifdef H5
import videoH5 from "@/components/video/video-h5.vue";
// #endif
var that;
export default {
  components: { 
    // #ifdef H5
    videoH5
// #endif
   },
  data() {
    return {
      opacity: 0,
      value: 0,

      checked: {
        mode: 0,
        speed: 0,
      },
      audio: {
        duration: 0,
      },
      isplay: false,
      loading: false,
      videoCtx: null,
      isMuted: false,

      src: "",
      singer: "...",
      // #ifdef MP-TOUTIAO
      duration: 60,
      // #endif
      // #ifndef MP-TOUTIAO
      duration: 0,
      // #endif
      currentTime: 0,
      playState: "pause", //"loading"/"playing"/"pause"
      isSliderChanging: false,
    };
  },
  computed: {
    domId() {
      return Math.random().toString(36).substr(2);
    }
  },
  watch: {
    path() {
      this.audio.src = this.path;
      this.videoCtx.src = this.path;
      this.stop();
    },
  },
  props: {
    path: {
      type: String,
      default: "",
    },
    title:{
      type: String,
      default: ""
    },
    //加粗
    link_status: {
      type: [Boolean, Number],
      default: 1,
    },
    link: {
      type: [Object,Array],
      default: (ret) => {
        return {
          type: "",
          config: {},
        };
      },
    },
  },
  methods: {
    setSinger: function (value) {
      this.singer = value;
    },
    playerOnPlay: function (e) {
      this.playState = "playing";
      this.$emit("play", false);
    },
    playerOnPause: function (e) {
      this.playState = "pause";
      this.$emit("paused", false);
    },
    /**
     * 视频元数据加载完成时触发。event.detail = {width, height, duration}
     * @param {*} e
     */
    audioLoaded(e) {
      this.duration = e.detail.duration ? parseInt(e.detail.duration) : 0;
    },
    playerOnEnded: function (e) {
      this.playState = "pause";
      this.stop();
      this.$emit("ended", false);
      this.$emit("paused", false);
    },
    playerOnTimeupdate: function (e) {
      this.playState = "playing";
      this.duration = parseInt(e.detail.duration);
      this.currentTime = parseInt(e.detail.currentTime);
      this.$emit("timeUpdate", e.detail);
    },
    playerOnWaiting: function (e) {
      this.playState = "loading";
    },
    playerOnError: function (e) {
      console.log("playerOnError",e)
      uni.$u.toast("播放出错，请刷新重试");
      this.isplay = false;
    },
    stop: function () {
      this.isplay = false;
      this.$emit("paused", false);
      // #ifdef H5
      this.$refs.audioPlayer.pause();
      // #endif
      // #ifdef MP
      this.videoCtx.stop();
      // #endif
    },
    seek: function (t) {
      // #ifdef H5
      this.$refs.audioPlayer.seek(t);
      // #endif
      // #ifdef MP
      this.videoCtx.seek(t);
      // #endif
    },
    play: function () {
      var that = this;
      if (this.isplay) {
        return false;
      }
      this.isplay = true;
      // #ifdef H5
      this.$refs.audioPlayer.play();
      // #endif

      // #ifdef MP
      this.videoCtx.play(); //在有的H5浏览器里，如果play不是用户触发的，则play()会报错
      // #endif
      this.$emit("play", false);
    },
    pause: function () {
      this.isplay = false;
      this.$emit("paused", false);
      // #ifdef H5
      this.$refs.audioPlayer.pause();
      // #endif
      // #ifdef MP
      this.videoCtx.pause();
      // #endif
    },

    /**
     * 获取播放时间
     */
    getCurrentTime() {
      return this.currentTime;
    },

    /**
     * 设置播放进度
     * @param {*} time
     */
    setCurrentTime(time) {
      this.seek(time);
    },
    playbackRate: function (value) {
      // #ifdef H5
      this.$refs.audioPlayer.setSpeed(value);
      // #endif
      // #ifdef MP
      this.videoCtx.playbackRate(value);
      // #endif
      //playbackRate不能在play之前或者之后立即调用，否则只有很少几率会成功
    },
    sliderChange: function (e) {
      this.isSliderChanging = false;
      //要通过e.detail.value获取，否则如果通过dom去读取slider的value
      //就会存在滚动条拖不动的情况
      this.seek(e);
    },
    sliderChanging: function () {
      this.isSliderChanging = true;
    },

    stepChange(type) {
      var step = 15;
      var currentTime = 0;
      if (type == "back") {
        if (that.currentTime - step < 0) {
          currentTime = 0;
        } else {
          currentTime = that.currentTime - step;
        }
        uni.$u.toast("回退到" + that.$tools.formatMediaTime(currentTime));
      } else {
        if (that.currentTime + step > that.duration) {
          currentTime = that.duration;
        } else {
          currentTime = that.currentTime + step;
        }
        uni.$u.toast("快进到" + that.$tools.formatMediaTime(currentTime));
      }

      that.seek(currentTime);
      // that.pause();
    },

    jump() {
      if (this.link_status && this.link.type) {
        this.$nav.to(this.link.src, this.link.type);
      }
    },
  },
  created: function () {
    // #ifdef MP
    //自定义组件，需要传递第二个参数为this，否则后续的pause等操作
    this.videoCtx = uni.createVideoContext("audioPlayer", this);
    // #endif
    setTimeout(function () {
      this.opacity = "1";
    }, 300);
  },
  mounted() {
    that = this;
    // this.audio = uni.createInnerAudioContext();
    // this.audio.src = this.path;
    // this.audio.onCanplay(() => {
    //     that.loading = false;
    //     that.duration = this.audio.duration;
    // })
  },
};
</script>
<style>
.audio-box {
  overflow: hidden;
}

.audio-container {
  background: #fff;
  padding: 12px 16px;
}

.audio-container .title {
  height: 20px;
  line-height: 20px;
  display: -webkit-flex;
  display: flex;
  -webkit-flex: 1;
  flex: 1;
  color: #333;
  font-weight: 500;
  margin-bottom: 12px;
  -webkit-justify-content: space-between;
  justify-content: space-between;
  -webkit-align-items: center;
  align-items: center;
}

.text-line-one {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jump-btn {
  margin-left: 8px;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
}

.jump-btn span {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  height: 16px;
  font-size: 12px;
  color: #b2b2b2;
}

.jump-btn .icon-wrapper {
  width: 16px;
  height: 16px;
}

.jump-btn .icon-wrapper {
  width: 16px;
  height: 16px;
}

.audio-container .audio-box {
  display: -webkit-flex;
  display: flex;
  width: 100%;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: space-between;
  justify-content: space-between;
}

.audio-container .audio-box .audio-icon {
  width: 24px;
  height: 24px;
  margin-left: 16px;
}

.audio-container .audio-box .audio-info {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-flex: 1;
  flex: 1;
}

.audio-container .audio-box .audio-info .time-info {
  width: 100%;
  display: -webkit-flex;
  display: flex;
  -webkit-justify-content: space-between;
  justify-content: space-between;
  margin-top: 2px;
  color: #ccc;
  font-size: 10px;
  height: 12px;
  line-height: 12px;
}

.audio-container .audio-box .audio-info .audio-line-box {
  /* height: 10px; */
  width: 100%;
  -webkit-align-items: center;
  align-items: center;
}

::v-deep .uni-slider-handle-wrapper {
  height: 3px !important;
}

::v-deep uni-slider {
  margin: 0px !important;
}
</style>
