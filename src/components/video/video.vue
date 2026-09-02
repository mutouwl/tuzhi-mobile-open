<template>
    <view class="box">
        <!--  #ifdef H5 -->
        <video-h5 :controlBarVisibility="controlBarVisibility" :showFullscreenButton="showFullscreenButton" :objectFit="objectFit" @control-bar-visible-change="handleControlBarVisibleChange" @ended="end" @ready="ready" ref="videoPlayer" :domId="domId" :playauth="playauth" :cover="cover" :height="height" :source="source" :isLive="isLive" :autoplay="autoplay" :views="views"
            :bulletScreen="bulletScreen" :disableSeek="disableSeek" :resumePlay="resumePlay" @stop="stopHandle" @paused="pausedHandle" @play="playHandle" @refresh="refresh" @error="error" @waiting="waitingHandle" @playing="playingHandle" @timeupdate="timeUpdateHandle" @onM3u8Retry="onM3u8RetryHandle"/>
        <!--  #endif -->

        <!--  #ifdef MP -->
        <video-mp @ended="end" @ready="ready" ref="videoPlayer" :cover="cover" :height="height" :source="source" :isLive="isLive" :views="views"
            :bulletScreen="bulletScreen" :showFullscreenButton="showFullscreenButton" :disableSeek="disableSeek" @stop="stopHandle" @error="videoError" @paused="pausedHandle" @play="playHandle" @waiting="waitingHandle" @playing="playingHandle" @timeupdate="timeUpdateHandle"/>
        <!--  #endif -->

    </view>
</template>

<script >
var that;
// #ifndef MP-WEIXIN
import videoH5 from "@/components/video/video-h5.vue";
// #endif
// #ifdef MP
import videoMp from "@/components/video/video-mp.vue";
// #endif
export default {
    // videoH5
    components: {
        // #ifdef MP
        videoMp,
        // #endif
        // #ifndef MP-WEIXIN
        videoH5
        // #endif
    },
    data() {
        return {
        }
    },
    props: {
        //封面
        cover: {
            type: String,
            default: ''
        },
        //视频地址
        source: {
            type: String,
            default: ''
        },
        //播放凭证
        playauth: {
            type: String,
            default: ''
        },
        //是否为直播
        isLive: {
            type: Boolean,
            default: false
        },
        // 是否在播放器初始化后自动播放（H5 会在有声自动播放失败时降级为静音）
        autoplay: {
            type: Boolean,
            default: false
        },
        // 用户已表达播放意图（点过播放按钮）：H5 换源重建后自动续播，避免需要二次点击
        resumePlay: {
            type: Boolean,
            default: false
        },
        //浏览量
        views: {
            type: [String, Number, Boolean],
            default: false
        },
        //跑马灯
        bulletScreen: {
            type: [String, Number, Boolean],
            default: false
        },
        //高度
        height: {
            type: [String, Number],
            default: 270
        },
        domId: {
            type: String,
            default: ''
        },
        controlBarVisibility:{
        type: String,
        default: 'click',
        },
        //是否显示全屏按钮
        showFullscreenButton: {
            type: Boolean,
            default: true
        },
        //视频填充模式
        objectFit: {
            type: String,
            default: 'contain'
        },
        //禁止拖拽进度条（web 课程设置 progress_seek 关闭时由父级传入）
        disableSeek: {
            type: Boolean,
            default: false
        }
    },
    watch: {
    },
    methods: {
        handleControlBarVisibleChange(e){
            this.$emit('control-bar-visible-change', e);
        },
        showControlBar(){
            this.$refs.videoPlayer.showControlBar();
            
        },
        resize(width, height) {
            if (this.$refs.videoPlayer && typeof this.$refs.videoPlayer.resize === 'function') {
                this.$refs.videoPlayer.resize(width, height);
            }
        },
        reload() {
            if (this.$refs.videoPlayer && typeof this.$refs.videoPlayer.reload === 'function') {
                this.$refs.videoPlayer.reload();
            }
        },
        play() {
            this.$refs.videoPlayer.play();
        },
        pause() {
            this.$refs.videoPlayer.pause();
        },
        requestFullScreen() {
            this.$refs.videoPlayer.requestFullScreen();
        },
        exitFullScreen() {
            this.$refs.videoPlayer.exitFullScreen();
        },
        refresh() {
            // if (this.$refs.videoPlayer.refresh) {
            //     this.$refs.videoPlayer.refresh();
            // } else if (this.$refs.videoPlayer.replay) {
            //     this.$refs.videoPlayer.replay();
            // }
            this.$emit('refresh', false);
        },
        onM3u8RetryHandle() {
            this.$emit('onM3u8Retry', false);
        },
        error(e) {
            // 透传错误负载（false 或 {errMsg}），直播页降级链与错误文案依赖它
            this.$emit('error', e);
        },
        pausedHandle(){
            this.$emit('paused', false);
        },
        playHandle(){
            this.$emit('play', false);
        },

        waitingHandle(){
            this.$emit('waiting', false);
        },

        playingHandle(){
            this.$emit('playing', false);
        },

        timeUpdateHandle(e){
            this.$emit('timeupdate', e);
        },
        
        ready(e){
            this.$emit('ready', e);
        },

        end(e){
            this.$emit('end', e);
        },
        /**
         * 获取播放时间
         */
         getCurrentTime(){
            return this.$refs.videoPlayer.getCurrentTime();
        },

        /**
         * 设置播放进度
         * @param {*} time 
         */
         setCurrentTime(time){
            this.$refs.videoPlayer.setCurrentTime(time);
        },
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
        videoPause() {},
        // 播放结束
        videoEnded() { },
        // 播放错误
        videoError(e) {
            this.$emit('error', e);
        },
        progress() { },

        //直播终止
        stopHandle(){
            this.$emit('stop', false);
        }
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
