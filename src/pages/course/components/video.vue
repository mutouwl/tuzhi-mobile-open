<template>
    <view class="box">
        <!-- <tz-box padding="20px 15px 0" bgColor="none"> -->
            <!-- <div class="video">
                <video id="videoPlayer" controls="controls" :title="name" 
                x-webkit-airplay="allow" x5-video-player-type="h5-page" 
                x5-video-orientation="portrait" preload="meta" controlslist="nodownload" 
                class="video_area" 
                :src="path"
                :poster="patch" 
                ></video>
            </div> -->

            <!--  #ifdef  H5 -->
            <video-h5  :cover="patch" :source="path"/>
            <!--  #endif -->

            <!--  #ifdef  mp-weixin -->
            <video-mp  :cover="patch" :source="path"/>
            <!--  #endif -->

            <!--  -->
            <!-- <video-mp /> -->
            <!-- <x-video ref="videoPlayer" :poster="patch" videoId="myVideo" :src="path" @play="videoPlay"
                @pause="videoPause" @ended="videoEnded" @timeupdate="videoTimeUp" @loadeddata="videoLoaded"
                @seeking="videoSeeking" @seeked="videoSeeked" @error="videoError" :autoplay="false"/> -->
        <!-- </tz-box> -->

    </view>
</template>

<script >
var that;
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
            value: 0,

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
    },
    methods: {
        // 视频信息加载完成
        videoLoaded(durationTime) { },
        // 当前播放时间
        videoTimeUp(currentTime) { },
        // 点击原始播放
        videoPlay() { },
        // 正在拖动
        videoSeeking() { },
        // 拖动结束
        videoSeeked(e) { },
        // 触发暂停
        videoPause() { },
        // 播放结束
        videoEnded() { },
        // 播放错误
        videoError() { },
        progress(){},
    },
    created: function () {
        //自定义组件，需要传递第二个参数为this，否则后续的pause等操作不起作用
        // this.videoCtx = uni.createVideoContext("videoPlayer", this);
        // this.videoCtx.src = this.path;
    },
    mounted(pageParams) {
        that = this
    }
}

</script>

<style>
.box {
    width: 100%;
    background-color: #fff;
    box-sizing: border-box;
    overflow: hidden;
    /* padding: 20px 0; */
}

.video {
    width: 100%;
}

.video video {
    width: 100%;
}
</style>
