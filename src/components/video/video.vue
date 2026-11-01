<template>
    <view class="box">
        <!--  #ifdef H5 -->
        <video-h5 :controlBarVisibility="controlBarVisibility" :showFullscreenButton="showFullscreenButton" :objectFit="objectFit" :pictureOffsetPercent="pictureOffsetPercent" @control-bar-visible-change="handleControlBarVisibleChange" @ended="end" @ready="ready" ref="videoPlayer" :domId="domId" :playauth="playauth" :vid="vid" :cover="cover" :height="height" :source="source" :isLive="isLive" :autoplay="autoplay" :views="views"
            :bulletScreen="bulletScreen" :disableSeek="disableSeek" :resumePlay="resumePlay" :showProgress="showProgress" :preventPageReloadOnRefresh="preventPageReloadOnRefresh" :refreshNeedsNewAuth="refreshNeedsNewAuth" @stop="stopHandle" @paused="pausedHandle" @play="playHandle" @play-intent="playIntentHandle" @refresh="refresh" @error="error" @waiting="waitingHandle" @playing="playingHandle" @timeupdate="timeUpdateHandle" @onM3u8Retry="onM3u8RetryHandle"/>
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
        // 阿里云点播视频 ID（与 playauth 成对，只给 H5 那一档吃）。
        // 必须在本组件声明并往下透传——只写实现层等于调用点传不进来（见本文件 115 行那条教训）；
        // 也不许转给 video-mp：小程序原生 <video> 只认播流地址，给它 VID 等于换了个坏源
        vid: {
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
        // 画面垂直位置上移比例（整数百分比，按播放区高度）：0 = 默认垂直居中，
        // 横屏直播传 10 表示画面中心由 1/2 上移到 2/5（仅 H5 播放器支持）
        pictureOffsetPercent: {
            type: [Number, String],
            default: 0
        },
        //禁止拖拽进度条（web 课程设置 progress_seek 关闭时由父级传入）
        disableSeek: {
            type: Boolean,
            default: false
        },
        // 点播模式下是否显示进度条与时长（直播间伪直播传 false：伪直播窗口内按点播模式播放
        // 录制视频只是为了能 seek 对齐进度，露出进度条/时长等于告诉观众这是录播且允许跳到未播内容）。
        // 注意：本组件是 video-h5 的包装层，必须在这里声明 props 才能把父级的值转下去——
        // 只写模板上的 :showProgress="showProgress" 而不声明，取到的永远是 undefined，子组件回落到
        // 自己的默认值 true，表现为「传了 false 但进度条照样显示」的静默失效
        showProgress: {
            type: Boolean,
            default: true
        },
        // 拦截播放器内置错误板那枚「刷新」按钮的默认 location.reload（直播/预览场景整页重载
        // 会丢房间状态、连麦与播放进度），改为只重载当前视频流。本组件是 video-h5 的包装层，
        // 必须在**这里**声明并往下透传——只写实现层等于调用点传不进来（同本文件 115 行那条
        // props 透传的教训）
        preventPageReloadOnRefresh: {
            type: Boolean,
            default: false
        },
        // 凭证档刷新时要不要向页面再要一枚播放凭证（同上一条：必须在包装层声明并透传，
        // 只写实现层等于调用点传不进来）
        refreshNeedsNewAuth: {
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
        /**
         * 播放器是否停在「等用户手势」（大播放按钮、什么都没在拉）：转给内层播放器。
         * 本组件是 video-h5 的包装层，**方法也要一层层转下去**——只加在实现层，页面隔着
         * 这一层拿到的是 undefined，判据恒为 false（同本文件 115 行那条 props 透传的教训：
         * 「画面加载中不再压在播放按钮上」这一条就是这么在包装层断掉的）
         * @return {Boolean} 内层没实现（小程序端 video-mp）时返回 false，不改小程序表现
         */
        isAwaitingPlay() {
            if (this.$refs.videoPlayer && typeof this.$refs.videoPlayer.isAwaitingPlay === 'function') {
                return this.$refs.videoPlayer.isAwaitingPlay();
            }
            return false;
        },
        /**
         * 有媒体元素且停在暂停态（与 isAwaitingPlay 只差「媒体还没建好那一段不算」）
         * 同上一条：方法必须逐层转下去，页面隔着这一层才有得问
         * @return {Boolean} 内层没实现时返回 false（小程序端不受影响）
         */
        isPausedWithMedia() {
            if (this.$refs.videoPlayer && typeof this.$refs.videoPlayer.isPausedWithMedia === 'function') {
                return this.$refs.videoPlayer.isPausedWithMedia();
            }
            return false;
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
        /**
         * 用户按下播放器播放按钮那一刻（此时还没真正开播）
         * 本组件是 video-h5 的包装层，事件也要一层层转上去——只写实现层，页面隔着这一层收不到
         * （同本文件 164 行那条「方法与 props 必须逐层透传」的教训）
         */
        playIntentHandle(){
            this.$emit('play-intent', false);
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


</style>
