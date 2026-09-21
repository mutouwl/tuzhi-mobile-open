<template>
    <view class="box">
        <!--  :style="{ height: height + 'px' }"  :style="{ height: '100%' }"-->
        <video :show-center-play-btn="false" @loadedmetadata="loadedmetadataHandle" :style="{ height: videoHeight + 'px' }" id="videoPlayer" :autoplay="false"
            @play="videoPlayHandle" class="vod-video" @controlstoggle="tapVideo" @pause="playPaused" @bindended="playEnd" @ended="playEnd"
            @timeupdate="timeUpdate" @fullscreenchange="fullScreen" :poster="cover" :is-live="isLive"
            :show-progress="!isLive" :enable-progress-gesture="!disableSeek" :src="source"  @waiting="videoWaiting" :show-mute-btn="true" :vslide-gesture="true"
            @error="videoError">
            
            <!-- 自定义居中播放按钮 -->
            <view class="custom-play-btn" v-if="!videoPlaying && controlHidden">
                <view class="play-icon" @click="playVideo">
                    <view class="play-triangle"></view>
                </view>
            </view>
            
            <view class="video-control" :style="{ display: isLive ? 'none' : controlHidden ? 'none' : 'block' }">
                <view class="multi rate" @click="showSwitchRate()">{{ currentRate }} <span style="font-size: 10px;margin-left:2px;font-weight: 400;">倍</span></view>
            </view>

            <view class="refresh-btn" v-if="isLive && !controlHidden" @click="refresh">
                <img src="/static/image/video/reply.png" />
            </view>

            <view :class="['multi-list', 'rate', {
                'active': rateShow ? true : ''
            }], fullScreenData">
                <view class="multi-box">
                    <view v-for="(item, index) in [0.5, 0.8, 1.0, 1.25, 1.5]" :key="item"
                        :class="['multi-item', 'rate']" :data-rate="item" @click="switchRate">
                        <span>{{ item }} <span style="font-size: 10px;margin-left:2px;font-weight: 400;">倍</span>   </span>
                    </view>
                </view>
                <view class="rate-cancel" @click="showSwitchRate()">
                    <view>取消</view>
                </view>
                <!-- <view class="close-btn-wrap" :style="{ display: fullScreenData === '' ? 'none' : 'block' }">
                    <view class="close-btn" bindtap="closeControl">x</view>
                </view> -->
            </view>

            <!-- 
            <view :class="['multi-list', 'rate', {
                'active': rateShow ? true : ''
            }], fullScreenData">
                <view v-for="(item, index) in [0.5, 0.8, 1.0, 1.25, 1.5]" :key="item" :class="['multi-item', 'rate', {
                    'active': item === currentRate ? true : false
                }]" :data-rate="item" @click="switchRate">{{ item }}</view>
                <view class="close-btn-wrap">
                    <view class="close-btn" bindtap="closeControl">x</view>
                </view>
            </view> -->

            <div :class="['bullet-screen']" :style="bulletScreenStyle + bulletScreenTop" v-if="bulletScreen !== false">
                {{ bulletScreen }}
            </div>

            <div class="copyright-bg" v-if="marqueeConfig.copyright_status == '1' && copyrightShow">
                <div class="copyright-text paused">
                    {{marqueeConfig.copyright_text}}
                </div>
            </div>

            <div class="hot-tag" v-if="views !== false">
                <span>
                    <img style="width: 16px; height: 16px; top: 4px; position: relative"
                        src="@/components/video/assets/img/views.png" />
                </span>
                <span id="hot-views-val">
                    {{ views }}
                </span>
            </div>

            <!-- <div class="rate-box">
            </div> -->
        </video>


        <!-- speed -->
        <!-- <u-action-sheet :safeAreaInsetBottom="true" cancelText="取消" :show="modal.speed" :actions="speedOption"
            :closeOnClickOverlay="true" :closeOnClickAction="true" @close="modal.speed = false" @select="speedSelect">
        </u-action-sheet> -->
    </view>
</template>
<script>
    var that;
    export default {
        components: {},
        data() {
            return {
                speedOption: [
                    {
                        name: "正常",
                        key: 0,
                        value: 1,
                    },
                    {
                        name: "0.5倍",
                        key: 1,
                        value: 0.5,
                    },
                    {
                        name: "0.8倍",
                        key: 2,
                        value: 0.8,
                    },
                    {
                        name: "1.25倍",
                        key: 3,
                        value: 1.25,
                    },
                    {
                        name: "1.5倍",
                        key: 4,
                        value: 1.5,
                    },
                ],
                modal: {
                    speed: false,
                    mode: false,
                },

                page: 1,
                size: 5,
                userInfo: null,
                videoList: [],
                total: 0,
                loading: false,
                loadAll: false,
                multiListShow: false,

                rateShow: false,
                currentRate: 1.0,

                videoPlaying: false,

                controlHidden: true,

                currentTime: 0,

                isSwitchDefinition: false,

                isAndroid: false,

                fullScreenData: "",
                videoContext: null,

                videoHeight: 320,

                bulletScreenStyle: 'font-size: 10px;color: #e67e23;opacity: 1;',
                bulletScreenTop:'top: 50%;',

                marqueeConfig: {
                    copyright_status: 0,
                    copyright_text: ''
                },

                copyrightShow: false,

                //禁止拖拽进度条时的跳变检测基准（最近一次上报的播放时间）
                lastSeekTime: 0,
                //自己发起 seek（续播等）后的豁免截止时间戳，避免把正常 seek 误判为拖拽
                seekGuardUntil: 0
            };
        },
        props: {
            //封面
            cover: {
                type: String,
                default: "",
            },
            //视频地址
            source: {
                type: String,
                default: "",
            },
            //是否为直播
            isLive: {
                type: Boolean,
                default: false,
            },
            //浏览量
            views: {
                type: [String, Number, Boolean],
                default: false,
            },
            //跑马灯
            bulletScreen: {
                type: [String, Number, Boolean],
                default: false,
            },
            //高度
            height: {
                type: [String, Number],
                default: 210,
            },
            //是否显示全屏按钮
            showFullscreenButton: {
                type: Boolean,
                default: true
            },
            //禁止拖拽进度条（web 课程设置 progress_seek 关闭时由父级传入）
            disableSeek: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            source() {
                this.playVideo();
                // player.loadByUrl(this.source);
            },
        },
        methods: {
            speedSelect(option) {
                // this.checked.speed = option.key;
                // this.videoCtx.playbackRate(option.value);

                let rate = option.value;
                if (this.videoPlaying) {
                    this.videoContext.playbackRate(rate);
                }
                this.currentRate = rate;
                // this.rateShow = false;
            },
            //直播刷新
            refresh() {
                this.videoContext.seek(999999999);
                this.videoContext.play();
            },
            videoPlayHandle(e) {
                this.$emit("play", false);
                this.$emit("playing", false);
                this.videoPlaying = true;
                this.controlHidden = false;
                this.videoContext.playbackRate(Number(this.currentRate));
            },

            closeControl() {
                this.multiListShow = false;
                // this.rateShow = false;
            },

            tapVideo(e) {
                // this.rateShow = false;

                if (!e.detail) {
                    this.rateShow = false;
                }
                if (this.videoPlaying && !this.fullScreenData) {
                    this.controlHidden = !e.detail.show;
                }
            },

            switchResource() {
                this.multiListShow = true;
            },

            showSwitchRate() {
                // this.rateShow = true;
                this.rateShow = !this.rateShow;
            },

            switchRate(e) {
                let rate = Number(e.currentTarget.dataset.rate);
                if (this.videoPlaying) {
                    this.videoContext.playbackRate(rate);
                }
                this.currentRate = rate;

                this.rateShow = false;
                uni.$u.toast(rate + "倍速");
            },
            playVideo() {
                if (!this.videoContext) {
                    this.videoContext = uni.createVideoContext("videoPlayer", this);
                }
                this.videoContext.play();
                this.videoPlaying = true;
                this.controlHidden = false;
                this.$emit("play", false);
            },

            timeUpdate(e) {
                let { currentTime } = e.detail;
                this.currentTime = currentTime;
                this.videoPlaying = true;
                // 播放进展上报（直播间死流兜底检测的时间戳刷新；禁止拖拽场景复用同一事件源）
                this.$emit("timeupdate", e);
                // 禁止拖拽进度条：检测 timeupdate 跳变（仅前进跳变算拖拽），跳变时拉回原位置
                if (this.disableSeek && this.isSeekJump(currentTime)) {
                    if (this.videoContext) {
                        this.videoContext.seek(this.lastSeekTime);
                    }
                    uni.$u.toast("该课程已禁止拖动进度条");
                    return;
                }
            },

            /**
             * 禁止拖拽进度条：判断本次上报是否为拖拽造成的进度跳变
             * @param {number} time 当前上报的播放时间
             * @return {boolean} 是否发生了拖拽跳变
             */
            isSeekJump(time) {
                if (Date.now() < this.seekGuardUntil) {
                    // 自己发起的 seek 豁免窗内直接采信，不再检测
                    this.lastSeekTime = time;
                    return false;
                }
                if (time > this.lastSeekTime && (time - this.lastSeekTime) > 4) {
                    this.seekGuardUntil = Date.now() + 2000;
                    return true;
                }
                this.lastSeekTime = time;
                return false;
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
                // 自己发起的 seek（续播等）进入豁免窗，避免后续 timeupdate 落差被误判为拖拽
                this.seekGuardUntil = Date.now() + 3000;
                this.lastSeekTime = time;
                this.videoContext.seek(time);
            },

            /**
             * 暂停播放
             */
            playPaused() {
                // console.log("paused")
                this.videoPlaying = false;
                this.$emit("paused", false);
            },

            /**
             * 暂停播放
             */
             playEnd() {
                this.videoPlaying = false;
                this.$emit("ended", false);
            },

            fullScreen(e) {
                var fullScreen = e.detail.fullScreen;
                var direction = e.detail.direction;
                if (fullScreen) {
                    this.fullScreenData = " full-screen " + direction;
                    this.controlHidden = false;
                }
            },

            /**
             * 视频元数据加载完成时触发
             * @param {*} e event.detail = {width, height, duration}
             */
            loadedmetadataHandle() {
                that.videoHeight = uni.getWindowInfo().windowWidth / 1.7777;
                if(that.videoHeight > 270){
                    that.videoHeight = 270;
                }
                that.$emit("ready", {
                    video_height: that.videoHeight,
                });
            },

            getVideoTime(duration) {
                let secondTotal = Math.round(duration);

                let hour = Math.floor(secondTotal / 3600);
                let minute = Math.floor((secondTotal - hour * 3600) / 60);

                let second = secondTotal - hour * 3600 - minute * 60;

                if (minute < 10) {
                    minute = "0" + minute;
                }
                if (second < 10) {
                    second = "0" + second;
                }
                return hour === 0 ? minute + ":" + second : hour + ":" + minute + ":" + second;
            },

            //视频出现缓冲
            videoWaiting() {
                this.$emit("waiting", false);
                if (that.isLive) {
                    // uni.$u.toast('主播暂时离开,正在重新连接');
                }
            },

            //视频播放错误
            videoError(e) {
                if (that.isLive) {
                    that.$emit("error", e.detail);
                }
            },

            startMarquee() {
                // 立即执行一次，然后每隔15分钟执行
                this.showMarquee();
                setInterval(() => {
                    this.showMarquee();
                }, 900000);
            },


            showMarquee() {
                this.copyrightShow = true;
                // 1分钟后隐藏
                setTimeout(() => {
                    this.copyrightShow = false;
                }, 60000); // 60,000 毫秒 = 1 分钟
            }
        },
        created: function () {
            this.videoContext = uni.createVideoContext("videoPlayer", this);
        },
        mounted(pageParams) {
            that = this;

            //获取跑马灯样式、版权是否显示
            var marqueeConfig = that.$tools.systemConfig("marquee");

            this.bulletScreenStyle = 'color:' + marqueeConfig.bullet_color + ';font-size:' + marqueeConfig.bullet_font_size + 'px;opacity:' + marqueeConfig.bullet_opacity+';';

            this.marqueeConfig = marqueeConfig;

            // 设置定时器每 10 分钟触发一次
            this.startMarquee();
        }
    };
</script>

<style>
    /**index.wxss**/


    .close-btn-wrap {
        width: 100%;
        display: flex;
        margin-top: 150rpx;
        justify-content: center;
    }

    .close-btn {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        background-color: rgba(220, 220, 220, 0.5);
        font-size: 18px;
        color: #fff;
        text-align: center;
        line-height: 75rpx;
        z-index: 9999;
    }

    .video-list {
        height: 67vh;
    }

    .video-title {
        width: 100%;
        box-sizing: border-box;
        padding-right: 230rpx;
        padding-left: 35rpx;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 90rpx;
        color: #fff;
    }

    .vod-video {
        display: block;
        /* width: 100%; */
        /* height: 100%; */
    }

    .video-wrap {
        position: relative;
    }

    .multi-list.full-screen.vertical {
        height: 100vh !important;
        padding: 8vh 0;
    }

    .multi-list.full-screen.horizontal {
        height: 100vw !important;
        padding: 8vw 0;
    }

    .video-control {
        /* background-color: rgba(0, 0, 0, .1); */
        /* background: rgba(0, 0, 0, 0.6); */
        /* background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.01));
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.1);
    height: 50px;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 997; */

        /* background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)); */

            /* background: rgba(0, 0, 0, 0.05);
            -webkit-backdrop-filter: blur(1px);
            backdrop-filter: blur(0px); */
            border-radius: 50%;
            position: absolute;
            top: calc(50% - 28px);
            right: 10px;
            height: 45px;
            width: 45px;
            height: 45px;
            opacity: .8;
    }

    .multi {
        z-index: 998;
        /* width: 40px; */
        height: 18px;
        line-height: 18px;
        color: #fff;
        text-align: center;
        transition: color ease 0.3s;
    }

    .multi.rate {
        /* border: 1px solid #fff; */
        /* padding: 6px 4px; */
        /* border-radius: 40px; */
        /* margin: 7px 10px; */
        /* font-size: 14px;
    position: absolute;
    display: block;
    left: 30px;
    top: 15px; */

            padding: 6px 4px;
            font-size: 12px;
            position: absolute;
            display: block;
            height: 100%;
            width: 100%;
            line-height: 30px;
            box-sizing: border-box;
    }

    .multi-list {
        position: absolute;
        height: 0;
        width: 100%;
        /* width: 50%; */
        /* background-color: rgba(0, 0, 0, 0.65); */
        top: 0;
        right: 0;
        transition: height 0.3s ease;
        z-index: 999;
        /* box-sizing: border-box; */
        /* padding: 50rpx 0; */
        overflow: hidden;
        background: rgba(0, 0, 0, 0.25);
        -webkit-backdrop-filter: blur(5px);
        backdrop-filter: blur(5px);
    }

    .multi-box {
        margin-top: 25%;
        display: flex;
        justify-content: space-between;
        padding: 0 20px;
        box-sizing: border-box;
    }

    .multi-list.active {
        /* width: 300rpx; */
        height: 100%;
    }

    .rate-cancel {
        width: 100%;
        margin-top: 15%;
        color: #fff;
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        opacity: .8;
    }

    .multi-item {
        width: 20%;
        text-align: center;
        color: #fff;
        /* line-height: 80rpx; */
        /* height: 20%; */
        /* line-height: 20%; */
        transition: color ease 0.3s;

        display: flex;
        align-items: center;
        /* 垂直居中对齐 */
        justify-content: center;
        /* 水平居中对齐 */
        height: 20%;
        /* 设置容器高度 */
        font-size: 14px;
        font-weight: 700;
    }

    .multi-item span {
        width: 100%;
        text-align: center;
        /* writing-mode: vertical-rl; */
        /* text-orientation: upright; */
    }

    .vod-video {
        width: 100%;
    }

    .tips {
        text-align: center;
        color: #ccc;
        font-size: 12px;
    }

    .video-item {
        height: 25vw;
        display: flex;
        padding: 8rpx 16rpx;
        background-color: #f6f6f6;
    }

    .video-item.active .cover {
        box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.3), 0 -1px 6px rgba(0, 0, 0, 0.3),
            -1px 0 6px rgba(0, 0, 0, 0.3);
    }

    .video-item.active .name {
        box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.3), 0px -1px 6px rgba(0, 0, 0, 0.3);
    }

    .cover {
        width: 40%;
        background-color: #000;
        position: relative;
        border-radius: 3px 0 0 3px;
        box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
    }

    .duration {
        position: absolute;
        bottom: 10rpx;
        right: 10rpx;
        background-color: rgba(0, 0, 0, 0.6);
        padding: 0 10rpx;
        border-radius: 3px;
        font-size: 12px;
        color: #fff;
    }

    .cover image {
        max-width: 100%;
        max-height: 100%;
        display: block;
    }

    .name {
        width: 60%;
        box-sizing: border-box;
        padding: 16rpx 32rpx;
        border-radius: 0 3px 3px 0;
        background-color: #fff;
        box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
    }

    .video-title-name {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .video-title-name.description {
        margin-top: 20rpx;
        color: #999;
        font-size: 12px;
    }


    /* 跑马灯 start */
    .bullet-screen {
        position: absolute;
        white-space: nowrap;
        animation: bullet 30s linear infinite;
    }

    @keyframes bullet {
        from {
            left: 100%;
        }

        to {
            left: 0%;
            transform: translateX(-100%);
        }
    }

    /* 跑马灯 end */


    .copyright-bg {
        background-color: rgba(178, 178, 178, .5);
        width: 100%;
        top: 20px;
        position: absolute;
        height: 20px;
        line-height: 20px;
    }

    .copyright-text {
        animation: copyrightanimation 20s linear infinite;
        color: #fff;
        font-size: 12px;
        white-space: nowrap;
    }

    @keyframes copyrightanimation {
        from {
            left: 100%;
        }

        to {
            left: 0%;
            transform: translateX(-100%);
        }
    }

    /* 浏览量 start  */

    .hot-tag {
        position: absolute;
        left: 30px;
        top: 30px;
        font-size: 12px;
        color: #fff;
        padding: 0px 6px;
        box-sizing: border-box;
        line-height: 22px;
        background: rgba(0, 0, 0, 0.25);
        border-radius: 4px;
        -webkit-backdrop-filter: blur(1px);
        backdrop-filter: blur(1px);
        border-radius: 30px;
        display: flex;
        align-items: center;
    }

    .hot-views-icon {
        width: 16px;
        height: 16px;

        position: relative;
        top: 4px;
    }

    .hot-views-val {
        margin-left: 4px;
    }

    .refresh-btn {
        position: absolute;
        bottom: 10px;
        right: 10px;
        opacity: .6;
    }

    .refresh-btn img {
        width: 28px;
        height: 28px;
    }

    .rate-box {
        width: 100%;
        height: 100%;
        /* background-color: red; */
        z-index: 999;
        background: linear-gradient(to bottom,
                rgba(255, 255, 255, 0),
                rgba(255, 255, 255, 1) 50%,
                rgba(255, 255, 255, 0));
    }

    /* 浏览量end */

    /* 自定义播放按钮 start */
    .custom-play-btn {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 998;
        cursor: pointer;
        transition: all 0.3s ease;
        
        /* 灰色透明遮罩层 */
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .custom-play-btn:hover {
        background: rgba(0, 0, 0, 0.4);
    }
    
    .custom-play-btn:hover .play-icon {
        transform: scale(1.1);
    }
    
    .play-icon {
        width: 60px;
        height: 60px;
        background: transparent;
        border: 3px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
    }
    
    .play-triangle {
        width: 0;
        height: 0;
        border-left: 16px solid #ffffff;
        border-top: 12px solid transparent;
        border-bottom: 12px solid transparent;
        margin-left: 4px;
    }
    
    /* 响应式设计 */
    @media (max-width: 480px) {
        .play-icon {
            width: 50px;
            height: 50px;
        }
        
        .play-triangle {
            border-left: 14px solid #ffffff;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            margin-left: 3px;
        }
    }
    /* 自定义播放按钮 end */
</style>