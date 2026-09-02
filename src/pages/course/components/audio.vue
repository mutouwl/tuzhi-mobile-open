<template>
    <view class="box">
        <tz-box padding="20px 15px 0" bgColor="none">

            <div class="cover">
                <div :class="[
                    'image',
                    { 'spin': isplay }
                ]" :style="patch ? {
    'background-image': 'url(' + patch + ')'
} : {}">

                </div>
            </div>

            <template>
                <div class="rate">
                    <div class="start">
                        {{ $tools.formatMediaTime(currentTime) }}
                    </div>
                    <div class="step">
                        <u-slider @change="sliderChange" :disabled="loading" :value="currentTime" inactiveColor="#E5E6EB"
                            activeColor="#86909C" :min='0' :max="duration"></u-slider>
                    </div>
                    <div class="end">
                        {{ $tools.formatMediaTime(duration) }}
                    </div>
                </div>

                <div class="control-box">

                    <div class="reduce" @click="isMuted = !isMuted">
                        <div>
                            <tz-icon name="sound-off" :size="24" v-if="isMuted" />
                            <tz-icon name="sound-on" :size="24" v-if="!isMuted" />
                        </div>
                        <div class="tip">{{ isMuted ? '关闭静音' : '静音' }}</div>
                    </div>
                    <div class="prev" @click="stepChange('back')">
                        <tz-icon name="rewind-back" />
                    </div>
                    <div class="stop">
                        <template v-if="!loading">
                            <span @click="play" v-if="!isplay">
                                <tz-icon name="play1" :size="44" />
                            </span>
                            <span @click="pause" v-if="isplay">
                                <tz-icon name="pause" :size="44" />
                            </span>
                        </template>

                        <span class="loading" v-if="loading">
                            <u-loading-icon textSize="18"></u-loading-icon>
                        </span>
                    </div>
                    <div class="next" @click="stepChange('forward')">
                        <tz-icon name="rewind-forward" />
                    </div>
                    <div class="add" @click="showModel('speed')">
                        <div><tz-icon name="flashlight_fill" :size="24" /></div>
                        <div class="tip">{{ speedOption[checked.speed].name }}</div>
                    </div>
                </div>
            </template>
        </tz-box>

        <!-- speed -->
        <u-action-sheet :safeAreaInsetBottom="true" cancelText="取消" :show="modal.speed" :actions="speedOption"
            :closeOnClickOverlay="true" :closeOnClickAction="true" @close="showModel('speed')" @select="speedSelect">
        </u-action-sheet>
 
        <!--  #ifdef H5 -->
        <div style="height: 1px;width:1px;overflow:hidden">
            <video-h5 ref="audioPlayer" domId="audio" :height="1" :source="path" :isLive="false"  :styles="{
                opacity: opacity, transition: 'opacity 0.5s ease-in-out',width:'50px',height:'50px',position: 'fixed',left: 0
            }" @play="playerOnPlay" @pause="playerOnPause" @ended="playerOnEnded" @timeupdate="playerOnTimeupdate"
            @waiting="playerOnWaiting" @error="playerOnError" @loadedmetadata="audioLoaded"/>
        </div>
        <!--  #endif -->
        <!--  #ifdef MP -->
        <video id="audioPlayer"
            :src="path"
            :autoplay="false" :muted="isMuted" :style="{
                opacity: opacity, transition: 'opacity 0.5s ease-in-out',width:'50px',height:'50px',position: 'fixed',left: 0
            }" @play="playerOnPlay" @pause="playerOnPause" @ended="playerOnEnded" @timeupdate="playerOnTimeupdate"
            @waiting="playerOnWaiting" @error="playerOnError" @loadedmetadata="audioLoaded"></video>
            <!--  #endif -->
    </view>
</template>

<script >
// #ifdef H5
import videoH5 from "@/components/video/video-h5.vue";
// #endif
var that;
export default {
    // #ifdef H5
    components:{videoH5},
    // #endif
    data() {
        return {
            opacity:0,
            value: 0,

            modal: {
                speed: false,
                mode: false
            },
            speedOption: [
                {
                    name: '正常',
                    key: 0,
                    value: 1
                },
                {
                    name: '0.5倍',
                    key: 1,
                    value: 0.5
                },
                {
                    name: '0.8倍',
                    key: 2,
                    value: 0.8
                },
                {
                    name: '1.25倍',
                    key: 3,
                    value: 1.25
                },
                {
                    name: '1.5倍',
                    key: 4,
                    value: 1.5
                }
            ],
            checked: {
                mode: 0,
                speed: 0
            },
            audio: {
                duration: 0
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
            playState: "pause",//"loading"/"playing"/"pause"
            isSliderChanging: false
        }
    },
    props: {
        name: {
            type: String,
            default: ''
        },
        patch: {
            type: String,
            default: ''
        },
        path: {
            type: String,
            default: ''
        }
    },
    watch: {
        path() {
            this.audio.src = this.path;
            this.videoCtx.src = this.path;
            this.stop();
        }
    },
    methods: {

        setSinger: function (value) {
            this.singer = value;
        },
        playerOnPlay: function (e) {
            this.playState = "playing";
            this.$emit("play",false);
        },
        playerOnPause: function (e) {
            this.playState = "pause";
            this.$emit("paused",false);
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
            this.$emit("ended",false);
            this.$emit("paused",false);
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
            this.isplay = false;
        },
        stop: function () {
            this.isplay = false;
            this.$emit("paused",false);
            // #ifdef H5
            this.$refs.audioPlayer.stop();
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
            this.videoCtx.play();//在有的H5浏览器里，如果play不是用户触发的，则play()会报错
            // #endif
            this.$emit("play",false);
        },
        pause: function () {
            this.isplay = false;
            this.$emit("paused",false);
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
        getCurrentTime(){
            return this.currentTime;
        },

        getPlayTime(){
            return this.$refs.audioPlayer.getPlayTime();
        },

        /**
         * 设置播放进度
         * @param {*} time 
         */
        setCurrentTime(time){
            this.seek(time);
        },
        playbackRate: function (value) {
            this.videoCtx.playbackRate(value);
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
            if (type == 'back') {
                if ((that.currentTime - step) < 0) {
                    currentTime = 0;
                } else {
                    currentTime = that.currentTime - step;
                }
                uni.$u.toast('回退到' + that.$tools.formatMediaTime(currentTime));
            } else {
                if ((that.currentTime + step) > that.duration) {
                    currentTime = that.duration;
                } else {
                    currentTime = that.currentTime + step;
                }
                uni.$u.toast('快进到' + that.$tools.formatMediaTime(currentTime));
            }

            that.seek(currentTime);
            // that.pause();
        },

        showModel(type) {
            this.modal[type] = !this.modal[type]
        },

        speedSelect(option) {
            this.checked.speed = option.key;
            this.videoCtx.playbackRate(option.value);
        },

    },
    created: function () {
        // #ifdef MP
        //自定义组件，需要传递第二个参数为this，否则后续的pause等操作
        this.videoCtx = uni.createVideoContext("audioPlayer", this);
        // #endif
        setTimeout(function () {
            this.opacity = '1';
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
    }
}

</script>

<style>

.box {
    width: 100%;
    background-color: #fff;
    background-image: linear-gradient(to bottom right, #E9F2FE, #fff);
    /* padding: 20px 0; */
}

@-webkit-keyframes spin {
    0% {
        -webkit-transform: rotate(0deg);
    }

    25% {
        -webkit-transform: rotate(90deg);
    }

    50% {
        -webkit-transform: rotate(180deg);
    }

    75% {
        -webkit-transform: rotate(270deg);
    }

    100% {
        -webkit-transform: rotate(360deg);
    }
}

/* 旋转 */
.spin {
    -webkit-animation: spin 20s linear infinite;
}

.cover {
    width: 130px;
    height: 130px;
    margin: 10px auto;
    padding: 30px 30px;
    border-radius: 50%;
    overflow: hidden;

    background-image: linear-gradient(to right, #010101, #2B2B2B, #010101);
}


.cover .image {

    background-size: cover;
    width: 100%;
    height: 100%;
    z-index: 2;

    border-radius: 50%;
}

.control-box {

    display: flex;
    justify-content: space-between;

    padding: 0 10px;
}

.loading {
    display: block;
    margin-top: 20px;
}

.control-box>div {
    text-align: center;
    padding: 10px 0 5px;
    width: 50px;
}

.control-box div:nth-child(3) {
    padding: 0;
}

.control-box .tip {
    font-size: 12px;
    color: #4E5969;
}

.rate {
    width: 100%;
    margin: 10px 0;
    padding: 0 20px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
}

.rate .step {
    width: 80%;
    margin: 0 5px;
}

.rate .start,
.rate .end {
    width: 10%;
    text-align: center;
    line-height: 38px;

    color: #1D2129;
    font-size: 12px;
}

.rate .start {
    text-align: right;
}

.rate .end {
    text-align: left;
}
</style>
