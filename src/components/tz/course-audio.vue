<template>
	<view>
		<!-- 1. 占位符：吸顶时撑开高度 -->
		<view class="placeholder" v-if="isMini"></view>

		<!-- 2. 主容器 -->
		<view class="box" :class="{ 'box-mini': isMini }">

			<!-- 背景层 -->
			<div class="audio-bg-container">
				<div class="audio-bg-image" :style="'background-image: url('+safePatch+')'"></div>
				<div class="audio-bg-mask"></div>
			</div>

			<view class="inner-content">

				<!-- [区域1] 封面与信息 -->
				<div class="info-section">
					<!-- 封面 -->
					<div class="audio-patch">
						<template v-if="!isMini">
							<div class="patch-bg" :style="'background-image: url('+safePatch+')'"></div>
							<div class="patch-mask"></div>
						</template>
						<img :src="safePatch" :alt="name" class="patch-img" @error="onPatchError" />

						<!-- 迷你模式播放遮罩 -->
						<div class="mini-mask" v-if="isMini && isplay">
							<tz-icon name="chart-bar" color="#fff" :size="20"></tz-icon>
						</div>
					</div>

					<!-- 迷你模式文字 -->
					<div class="mini-info" v-if="isMini">
						<div class="mini-title u-line-1 one-line-hidden">{{ name || '正在播放' }}</div>
						<div class="mini-sub">{{ $tools.formatMediaTime(currentTime) }} / {{ $tools.formatMediaTime(duration) }}</div>
					</div>
				</div>

				<!-- [区域2] 中间操作与进度条 (仅大屏显示) -->
				<template v-if="!isMini">
					
					<!-- 更多按钮 (...) -->
					<div class="middle-action">
                            <div class="time-step">
                                <span class="time-step-text">
                                    {{ $tools.formatMediaTime(currentTime) }}/{{ $tools.formatMediaTime(duration) }}
                                </span>
                            </div>
						<!-- <tz-icon name="more-dot" color="#fff" :size="24"></tz-icon> -->
					</div>

					<!-- 进度条区域 -->
					<div class="progress-box">
						<div class="slider-wrapper">
							<!-- 1. 底层 Slider -->
							<u-slider 
								@change="sliderChange" 
								@changing="sliderChanging"
								:disabled="loading || disableSeek" 
								:value="currentTime" 
								inactiveColor="rgba(255,255,255,0.25)" 
								activeColor="#ffffff" 
								:blockStyle="{width: '28px', height: '28px', backgroundColor: 'transparent'}"
								:min='0' 
								:max="duration || 1">
							</u-slider>

							<!-- 
                                2. 上层视觉层：时间胶囊
                                【关键修改】：transform 使用动态百分比
                                - progressPercent 为 0 时，translate(-0%, -50%) -> 左侧对齐锚点
                                - progressPercent 为 100 时，translate(-100%, -50%) -> 右侧对齐锚点
                            -->
							<!-- <div class="time-pill-handle" :style="{ 
                                left: progressPercent + '%', 
                                transform: `translate(-${progressPercent}%, -50%)` 
                            }">
                                <span class="time-text">
                                    {{ $tools.formatMediaTime(currentTime) }}/{{ $tools.formatMediaTime(duration) }}
                                </span>
                            </div> -->
						</div>
					</div>
				</template>

				<!-- 迷你模式底部的细进度条 -->
				<div class="mini-progress-bar" v-if="isMini" :style="{ width: progressPercent + '%' }"></div>

				<!-- [区域3] 控制栏 -->
				<div class="control-box">

					<!-- 左侧：倍速 -->
					<div class="btn-item speed-btn" @click="showModel('speed')" v-if="!isMini">
						<div class="icon-wrap"><tz-icon name="flashlight_fill" color="#fff" :size="22" /></div>
						<div class="tip">{{ currentSpeed.name }}</div>
					</div>

					<!-- 上一曲 -->
					<div class="btn-item" @click="stepChange('back')">
						<tz-icon name="rewind-back" color="#fff" :size="isMini ? 24 : 28" />
					</div>

					<!-- 播放/暂停 -->
					<div class="btn-item play-btn-wrap">
						<template v-if="!loading">
							<div :class="['play-circle', {'mini-circle': isMini}]" @click="play" v-if="!isplay">
								<tz-icon name="play1" :color="isMini ? '#fff' : '#333'" :size="isMini ? 32 : 38" :style="!isMini ? 'margin-left: 4px;' : ''" />
							</div>
							<div :class="['play-circle', {'mini-circle': isMini}]" @click="pause" v-if="isplay">
								<tz-icon name="pause" :color="isMini ? '#fff' : '#333'" :size="isMini ? 32 : 38" />
							</div>
						</template>
						<span class="loading" v-if="loading">
							<!-- 加载动画为白色，与播放按钮同色 -->
							<u-loading-icon color="#fff" textSize="18"></u-loading-icon>
						</span>
					</div>

					<!-- 下一曲 -->
					<div class="btn-item" @click="stepChange('forward')">
						<tz-icon name="rewind-forward" color="#fff" :size="isMini ? 24 : 28" />
					</div>

					<!-- 右侧：静音 -->
					<div class="btn-item mute-btn" @click="isMuted = !isMuted">
						<div class="icon-wrap">
							<tz-icon color="#fff" name="sound-off" :size="22" v-if="isMuted" />
							<tz-icon color="#fff" name="sound-on" :size="22" v-if="!isMuted" />
						</div>
						<div class="tip" v-if="!isMini">{{ isMuted ? "关闭静音" : "静音" }}</div>
					</div>

				</div>
			</view>
		</view>

		<!-- speed 弹窗：弹层壳/标题/底部「关闭」行仍由 u-action-sheet 自带（M18 不自造弹层与关闭行），
		     只把默认的那一列按钮换成横排的倍率选择条；倍率清单沿用下方 speedOption，不另起一套 -->
		<u-action-sheet :round="10" :safeAreaInsetBottom="true" cancelText="关闭" title="请选择倍速"
			:show="modal.speed" :closeOnClickOverlay="true" @close="showModel('speed')">
			<view class="ca-speed-panel">
				<view class="ca-speed-track">
					<view v-for="opt in speedOption" :key="opt.key" class="ca-speed-opt"
						:class="{ 'ca-speed-opt--on': checked.speed === opt.key }" @click="speedSelect(opt)">{{ opt.name }}</view>
				</view>
			</view>
		</u-action-sheet>

        <!-- 播放器内核：Aliplayer 是视频播放器，音频这一档只借它解码，它的皮肤（64px 大播放键 /
		     控制栏 / 倍速浮层）一概不能露面。先前内核的 inline 是 position:fixed + 1px，
		     而 fixed 元素不吃祖先的 overflow:hidden 裁剪 ⇒ 那颗按 1px 框居中的大播放键从框里溢出去，
		     贴在页面中部左缘（2026-09-27 用户点名「音频课程会在页面中部左侧出现一个播放器按钮」）。
		     内核改 absolute，并由下面这一格 1px 的 relative + overflow:hidden 壳包死，皮肤怎么算都出不了这 1px -->
		<!--  #ifdef H5 -->
		<div class="ca-kernel">
			<video-h5 ref="audioPlayer" :domId="domId" :height="1" :mute="isMuted" :source="path" :isLive="false" :styles="{
                opacity: opacity, transition: 'opacity 0.5s ease-in-out', width: '1px', height: '1px', position: 'absolute', left: 0, top: 0,
            }" @play="playerOnPlay" @pause="playerOnPause" @ended="playerOnEnded" @timeupdate="playerOnTimeupdate"
				@waiting="playerOnWaiting" @playing="playerOnPlaying" @error="playerOnError" @loadedmetadata="audioLoaded" />
		</div>
		<!--  #endif -->
		<!--  #ifdef MP -->
		<!--  #ifndef MP-WEIXIN -->
		<video id="audioPlayer" :src="path" :autoplay="false" :muted="isMuted" :style="{
            opacity: opacity, transition: 'opacity 0.5s ease-in-out', width: '1px', height: '1px', position: 'fixed', left: 0,
        zIndex:'-2'}" @play="playerOnPlay" @pause="playerOnPause" @ended="playerOnEnded" @timeupdate="playerOnTimeupdate"
			@waiting="playerOnWaiting" @playing="playerOnPlaying" @error="playerOnError" @loadedmetadata="audioLoaded"></video>
		<!--  #endif -->
		<!--  #endif -->
	</view>
</template>

<script>
// #ifdef H5
import videoH5 from "@/components/video/video-h5.vue";
// #endif
// 微信 BackgroundAudioManager 的事件表：[on*/off* 的后半段, 本组件 handlers 的键名]。
// 收成一份表、bind/unbind 各一次循环，而不是照抄十行 onXxx() / offXxx()：
// **off* 那一半并不是全都有** —— 基础库 3.17 的 BackgroundAudioManager 就没有 offCanplay，
// 逐行 unbind 会在 beforeDestroy 抛 `TypeError: t.offCanplay is not a function`。
// 这一抛断在卸载链路上：本组件与它所在页面的 $destroy 没跑完，之后那一次在途 setData 的回调
// 就永远不会回来（控制台紧跟着那条「[setData-guard] 在途推送标志卡死」是它的后继现象，不是另一件事）。
const BG_AUDIO_EVENTS = [
    ['Canplay', 'canplay'],
    ['Play', 'play'],
    ['Pause', 'pause'],
    ['Stop', 'stop'],
    ['Ended', 'ended'],
    ['Waiting', 'waiting'],
    ['TimeUpdate', 'timeupdate'],
    ['Prev', 'prev'],
    ['Next', 'next'],
    ['Error', 'error'],
];

var that;
export default {
    // #ifdef H5
    components: { videoH5 },
    // #endif
    props: {
        name: { type: String, default: "" },
        patch: { type: String, default: "/static/image/filetype/audio.png" },
        path: { type: String, default: "" },
        scrollTop: { type: Number, default: 0 },
        domId: {
            type: String,
            default: 'audio'
        },
        // 课程页允许退出页面后继续播放；动态预览等临时播放器关闭即停止。
        allowBackgroundPlay: { type: Boolean, default: false },
        // 禁止拖拽进度条（web 课程设置 progress_seek 关闭时由父级传入）
        disableSeek: { type: Boolean, default: false }
    },
    data() {
        return {
            opacity: 0,
            modal: { speed: false },
            // 档位按倍率从小到大排，「正常」(value=1) 落在 0.8 与 1.25 之间（2026-09-27 用户点名：
            // 原先「正常」摆在整排最前，读起来像比 0.5 还慢）。key 是这一档的稳定身份（0＝正常，
            // checked.speed 存的就是它）而不是数组下标 ⇒ 换顺序不用跟着改默认值与选中态
            speedOption: [
                { name: "0.5倍", key: 1, value: 0.5 },
                { name: "0.8倍", key: 2, value: 0.8 },
                { name: "正常", key: 0, value: 1 },
                { name: "1.25倍", key: 3, value: 1.25 },
                { name: "1.5倍", key: 4, value: 1.5 },
            ],
            checked: { speed: 0 },
            isplay: false,
            loading: false,
            // 是否已完成初始化（音频数据加载并开始播放过）；完成后再触发 waiting（切进度/缓冲）不再显示加载态
            hasStarted: false,
            videoCtx: null,
            // backgroundAudioManager / backgroundAudioHandlers 不放 data：前者是微信的全局原生对象、
            // 后者是一包闭包，两个都不进模板，却会被 uni 当成渲染数据序列化推给视图层
            // （见 ui-baseline-mobile.md M27 同一族的「data 里只放要渲染的东西」）；
            // 它们在 mounted 里赋一次，当普通实例字段用
            backgroundAudioPath: '',
            // 本组件挂载时接管了同一条后台音频；课程页据此保留后台实时进度，
            // 不再用服务端稍旧的学习进度反向覆盖。
            restoredFromBackground: false,
            readyPath: '',
            isMuted: false,
            duration: 0,
            currentTime: 0,
            isSliderChanging: false,
            // 封面加载失败标记，失败时回退默认音频占位图
            imgError: false,
        };
    },
    computed: {
        isMini() {
            return this.scrollTop > 400;
        },
        // 当前倍速那一档：按 key（身份）找，不按数组下标取——上一版 speedOption[checked.speed] 把
        // key 当下标用，档位一改顺序（「正常」挪到 0.8 与 1.25 之间）就会指到错的行
        currentSpeed() {
            return this.speedOption.find((item) => item.key === this.checked.speed) || this.speedOption[0];
        },
        // 封面地址：加载失败或为空时回退默认占位图
        safePatch() {
            if (this.imgError || !this.patch) {
                return "/static/image/filetype/audio.png";
            }
            return this.patch;
        },
        progressPercent() {
            if (!this.duration || this.duration === 0) return 0;
            let p = (this.currentTime / this.duration) * 100;
            return Math.min(Math.max(p, 0), 100);
        }
    },
    watch: {
        patch: {
            handler() {
                // 封面地址变化时重置加载失败标记
                this.imgError = false;
            },
            immediate: true
        },
        path: {
            handler(val) {
                // 切换课程即新的初始化流程，重置初始化完成标记
                this.hasStarted = false;
                // #ifdef MP-WEIXIN
                this.backgroundAudioPath = '';
                this.restoredFromBackground = false;
                this.readyPath = '';
                this.isplay = false;
                this.loading = false;
                this.currentTime = 0;
                this.duration = 0;
                this.$nextTick(() => this.syncBackgroundAudioState());
                // #endif
                // #ifdef MP
                // #ifndef MP-WEIXIN
                if (this.videoCtx) {
                    this.videoCtx.src = val;
                    // 切歌时停止播放，等待用户操作，或根据需求自动播放
                    this.videoCtx.stop();
                    // 重置时间防止进度条跳动
                    this.currentTime = 0;
                    this.duration = 0;
                }
                // #endif
                // #endif
                // #ifdef H5
                if(this.$refs.audioPlayer) {
                    this.$refs.audioPlayer.src = val;
                    this.stop();
                }
                // #endif
            },
            // 加上 immediate: false，因为我们在 mounted 里手动处理了初始化
            immediate: false
        },
    },
    methods: {
        isCurrentBackgroundAudio() {
            return this.restoredFromBackground;
        },
        emitReadyOnce() {
            if (!this.path || this.readyPath === this.path) return;
            this.readyPath = this.path;
            this.$emit('ready');
        },
        managerMatchesPath() {
            if (!this.backgroundAudioManager || !this.path) return false;
            return this.backgroundAudioManager.src === this.path;
        },
        syncBackgroundAudioState() {
            // #ifdef MP-WEIXIN
            const manager = this.backgroundAudioManager;
            if (!manager || !this.path || manager.src !== this.path) return;
            this.backgroundAudioPath = this.path;
            this.restoredFromBackground = true;
            this.duration = parseInt(manager.duration) || this.duration;
            this.currentTime = parseInt(manager.currentTime) || 0;
            this.hasStarted = this.duration > 0 || this.currentTime > 0;
            this.isplay = manager.paused === false;
            this.loading = false;
            this.emitReadyOnce();
            if (this.isplay) this.$emit('play');
            // #endif
        },
        bindBackgroundAudioEvents() {
            // #ifdef MP-WEIXIN
            const manager = this.backgroundAudioManager;
            if (!manager) return;
            // 除「这条音频还是不是我这条」之外还要判「我还在不在」：没有 off* 的那几档摘不掉，
            // 销毁后回调照样进来（M26 那一族）
            const owns = () => this._isDestroyed !== true && this._isBeingDestroyed !== true
                && this.managerMatchesPath();
            const handlers = {
                canplay: () => {
                    if (!owns()) return;
                    this.hasStarted = true;
                    this.duration = parseInt(manager.duration) || this.duration;
                    this.loading = false;
                    this.emitReadyOnce();
                },
                play: () => { if (owns()) this.playerOnPlay(); },
                pause: () => { if (owns()) this.playerOnPause(); },
                stop: () => { if (owns()) this.playerOnPause(); },
                ended: () => { if (owns()) this.playerOnEnded(); },
                waiting: () => { if (owns()) this.playerOnWaiting(); },
                timeupdate: () => {
                    if (!owns()) return;
                    this.hasStarted = true;
                    if (this.isSliderChanging) return;
                    this.duration = parseInt(manager.duration) || this.duration;
                    this.currentTime = parseInt(manager.currentTime) || 0;
                    this.loading = false;
                },
                prev: () => { if (owns()) this.stepChange('back'); },
                next: () => { if (owns()) this.stepChange('forward'); },
                error: error => { if (owns()) this.playerOnError(error); },
            };
            this.backgroundAudioHandlers = handlers;
            BG_AUDIO_EVENTS.forEach((pair) => {
                const on = manager['on' + pair[0]];
                if (typeof on === 'function') on.call(manager, handlers[pair[1]]);
            });
            // #endif
        },
        unbindBackgroundAudioEvents() {
            // #ifdef MP-WEIXIN
            const manager = this.backgroundAudioManager;
            const handlers = this.backgroundAudioHandlers;
            // 先把表收走再摘：这一句之后无论摘没摘全，本组件都不会再有「算我的」的回调
            this.backgroundAudioHandlers = null;
            if (!manager || !handlers) return;
            BG_AUDIO_EVENTS.forEach((pair) => {
                const off = manager['off' + pair[0]];
                if (typeof off === 'function') off.call(manager, handlers[pair[1]]);
            });
            // #endif
        },
        getCurrentTime(){
            return this.currentTime;
        },
        // 封面加载失败时回退默认占位图
        onPatchError() {
            this.imgError = true;
        },
        setCurrentTime(t) {
            const time = Math.max(0, Number(t) || 0);
            this.currentTime = time;
            this.seek(time);
        },
        playerOnTimeupdate: function (e) {
            // 首次上报进度说明音频数据已可播放，初始化完成
            this.hasStarted = true;
            if(this.isSliderChanging) return;
            this.loading = false;
            // MP 端有时的 duration 会在 update 中才准确
            if (e.detail.duration) {
                 this.duration = parseInt(e.detail.duration);
            }
            this.currentTime = parseInt(e.detail.currentTime);
        },
        sliderChange: function (e) {
            this.isSliderChanging = false;
            if (this.disableSeek) {
                uni.$u.toast("该课程已禁止拖动进度条");
                return;
            }
            this.currentTime = e; 
            this.seek(e);
        },
        sliderChanging: function (e) {
            this.isSliderChanging = true;
            if (this.disableSeek) {
                uni.$u.toast("该课程已禁止拖动进度条");
                return;
            }
            this.currentTime = e;
        },
        seek: function (t) {
            // #ifdef H5
            this.$refs.audioPlayer.seek(t);
            // #endif
            // #ifdef MP
            // #ifndef MP-WEIXIN
            if(this.videoCtx) this.videoCtx.seek(t);
            // #endif
            // #endif
            // #ifdef MP-WEIXIN
            if (this.managerMatchesPath()) this.backgroundAudioManager.seek(t);
            // #endif
        },
        stepChange(type) {
            // 禁止拖拽进度条时同步禁用快进/回退，避免绕过限制
            if (this.disableSeek) {
                uni.$u.toast("该课程已禁止拖动进度条");
                return;
            }
            var step = 15;
            var t = 0;
            if (type == "back") {
                t = (this.currentTime - step) < 0 ? 0 : this.currentTime - step;
                uni.$u.toast("回退15秒");
            } else {
                t = (this.currentTime + step) > this.duration ? this.duration : this.currentTime + step;
                uni.$u.toast("快进15秒");
            }
            this.currentTime = t;
            this.seek(t);
        },
        play: function () {
            if (this.isplay) return;
            // 仅在初始化（首次加载音频数据）时显示加载态；已加载完成后的播放/续播不再显示
            if (!this.hasStarted) this.loading = true;
            // #ifdef H5
            this.$refs.audioPlayer.play();
            // #endif
            // #ifdef MP
            // #ifndef MP-WEIXIN
            if(this.videoCtx) this.videoCtx.play();
            // #endif
            // #endif
            // #ifdef MP-WEIXIN
            const manager = this.backgroundAudioManager;
            if (!manager || !this.path) {
                this.isplay = false;
                this.loading = false;
                uni.showToast({ title: '暂无可播放音频', icon: 'none' });
                return;
            }
            this.isplay = true;
            if (manager.src !== this.path) {
                manager.title = this.name || '音频课程';
                manager.epname = this.name || '音频课程';
                manager.singer = '课程音频';
                manager.coverImgUrl = this.safePatch || '';
                manager.playbackRate = this.currentSpeed.value;
                this.backgroundAudioPath = this.path;
                this.restoredFromBackground = false;
                manager.src = this.path;
            } else {
                this.backgroundAudioPath = this.path;
                manager.play();
            }
            // #endif
        },
        pause: function () {
            this.isplay = false;
            // #ifdef H5
            this.$refs.audioPlayer.pause();
            // #endif
            // #ifdef MP
            // #ifndef MP-WEIXIN
            if(this.videoCtx) this.videoCtx.pause();
            // #endif
            // #endif
            // #ifdef MP-WEIXIN
            if (this.managerMatchesPath()) this.backgroundAudioManager.pause();
            // #endif
        },
        stop: function () {
            this.isplay = false;
            this.loading = false;
            // #ifdef H5
            this.$refs.audioPlayer.pause();
            // #endif
            // #ifdef MP
            // #ifndef MP-WEIXIN
            if(this.videoCtx) this.videoCtx.stop();
            // #endif
            // #endif
            // #ifdef MP-WEIXIN
            if (this.managerMatchesPath()) this.backgroundAudioManager.stop();
            // #endif
        },
        showModel(type) {
            this.modal[type] = !this.modal[type];
        },
        speedSelect(option) {
            this.checked.speed = option.key;
            // #ifdef H5
            this.$refs.audioPlayer.setSpeed(option.value);
            // #endif
            // #ifdef MP
            // #ifndef MP-WEIXIN
            if(this.videoCtx) this.videoCtx.playbackRate(option.value);
            // #endif
            // #endif
            // #ifdef MP-WEIXIN
            if (this.managerMatchesPath()) this.backgroundAudioManager.playbackRate = option.value;
            // #endif
        },
        audioLoaded(e) {
            // 加载元数据后设置总时长；0/NaN 视为时长尚未就绪，保留原值
            const d = Number(e.detail && e.detail.duration);
            if (d && isFinite(d) && d > 0) {
                this.duration = parseInt(d);
            }
            // 注意：此处不清除 loading。loadedmetadata 只代表元数据就绪，不代表数据已加载到可播放，
            // 提前清除会在加载期间闪现播放/暂停按钮。加载态统一由 playing/timeupdate 事件清除。
            // this.play();
        },
        playerOnPlay(){ this.isplay = true; this.$emit('play'); },
        playerOnPlaying(){
            // 实际开始播放后清除加载态（waiting → playing 链路兜底），并标记初始化完成
            this.hasStarted = true;
            this.loading = false;
        },
        playerOnPause(){ this.isplay = false; this.loading = false; this.$emit('paused'); },
        playerOnEnded(){ this.isplay = false; this.loading = false; this.$emit('ended'); },
        playerOnWaiting(){
            // 仅在初始化阶段显示加载态；加载完毕播放后，切换进度/缓冲产生的 waiting 不显示加载状态
            if (!this.hasStarted) this.loading = true;
        },
        playerOnError(e){ 
            this.isplay = false; 
            this.loading = false;
            this.pause();
            // #ifdef MP-WEIXIN
            // 背景音频加载/播放失败（域名未配置或音频源异常）时明确提示，避免“点击播放无反应”的假象
            uni.showToast({ title: '音频加载失败，请稍后重试', icon: 'none' });
            // #endif
        },
    },
    created: function () {
        // created 阶段不建议操作 UI 上下文相关的 videoCtx，移动到 mounted
    },
    mounted() { 
        that = this; 
        
        // #ifdef MP
        // #ifndef MP-WEIXIN
        // 1. 初始化 VideoContext
        this.videoCtx = uni.createVideoContext("audioPlayer", this);
        
        // 2. [修复 Bug]：如果 path 初始有值，watch 不会触发，需要手动赋值一次 src
        // 这样才能触发底层的 loadedmetadata 事件，从而获取时长
        if (this.path) {
            setTimeout(() => {
                this.videoCtx.src = this.path;
            }, 200);
        }
        // #endif
        // #endif

        // #ifdef MP-WEIXIN
        this.backgroundAudioManager = uni.getBackgroundAudioManager();
        this.bindBackgroundAudioEvents();
        this.syncBackgroundAudioState();
        // #endif

        setTimeout(() => { this.opacity = "1"; }, 300);
    },
    beforeDestroy() {
        // BackgroundAudioManager 是全局播放器：页面销毁只解绑本组件监听，
        // 不停止音频，才能在锁屏、切后台和页面跳转后继续播放。
        // 动态预览属于临时播放，关闭弹窗时仍应停止。
        if (!this.allowBackgroundPlay && this.backgroundAudioManager && this.managerMatchesPath()) {
            this.backgroundAudioManager.stop();
        }
        this.unbindBackgroundAudioEvents();
    },
};
</script>

<style lang="scss" scoped>
/* ================== 基础结构 ================== */
.box {
    width: 100%;
    min-height: 400px; 
    transition: all 0.3s ease;
    position: relative;
    z-index: 999;
    overflow: hidden;
}

.placeholder { height: 400px; width: 100%; }

/* 背景层 */
.audio-bg-container {
    position: absolute; left: 0; top: 0; width: 100%; height: 100%;
    overflow: hidden; z-index: 0;
}
.audio-bg-image {
    position: absolute; width: 100%; height: 100%;
    background-position: center; background-size: cover;
    z-index: 1; filter: blur(20px); transform: scale(1.1); 
}
.audio-bg-mask {
    position: absolute; width: 100%; height: 100%;
    background-color: rgba(0, 0, 0, 0.5); z-index: 2;
}

.inner-content {
    position: relative; z-index: 10;
    padding: 20px 25px 10px;
    height: 100%;
    display: flex; flex-direction: column; 
}

/* 播放器内核那一格：1px 的 relative + overflow:hidden 壳，把 Aliplayer 的皮肤全部关在里面
   （内核自己是 absolute，见模板那段注释）。只写宽高不写 relative 的话 absolute 的内核会
   往上找别的定位祖先（.box），这一格就裁不到它 */
.ca-kernel {
    position: relative;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

/* 吸顶模式 */
.box.box-mini {
    position: fixed; top: 0; left: 0; right: 0;
    min-height: auto; height: 80px;
}
.box.box-mini .inner-content {
    padding: 0 15px;
    flex-direction: row; 
    align-items: center; justify-content: space-between;
}

/* ================== 1. 封面与信息 ================== */
.info-section {
    display: flex; justify-content: center; transition: all 0.3s ease;
    width: 100%;
}
.box:not(.box-mini) .info-section { padding: 30px 0 10px; }

/* 封面容器 */
.audio-patch {
    position: relative; margin: 0 auto;
    border-radius: 8px; overflow: hidden;
    width: 260px; height: 150px; 
    background: #d9d9d9;
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
}
.patch-bg { position: absolute; width: 100%; height: 100%; background-position: center; background-size: cover; z-index: 1; }
.patch-mask { position: absolute; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.1); backdrop-filter: blur(30px); z-index: 2; }
.patch-img { position: absolute; width: 100%; height: 100%; object-fit: contain; z-index: 3; left: 0; top: 0; }

.box.box-mini .info-section { justify-content: flex-start; align-items: center; width: auto; }
.box.box-mini .audio-patch {
    width: 50px; height: 35px; margin-right: 10px;
    box-shadow: none; border-radius: 4px; background: transparent;
}
.box.box-mini .patch-img { object-fit: cover; }

.mini-info { display: flex; flex-direction: column; justify-content: center; max-width: 140px; }
.mini-title { font-size: 14px; color: #fff; font-weight: bold; }
.mini-sub { font-size: 10px; color: rgba(255,255,255,0.7); }

/* ================== 2. 中间操作 & 进度条 ================== */
.middle-action {
    display: flex; justify-content: center; opacity: 0.8;
}

.progress-box {
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 30px; width: 100%;
    /* 将 padding 改小一点，因为现在胶囊不会超出去了，只需留出胶囊圆角和阴影的空间 */
    padding: 0 5px; 
    box-sizing: border-box;
}

/* 滑块容器 */
.slider-wrapper {
    width: 100%; 
    position: relative;
    height: 30px; 
}

/* 时间胶囊 Pill */
.time-pill-handle {
    position: absolute;
    top: calc(50% + 5px);
    /* 这里的 transform 被内联样式覆盖了，写在这里是为了由 fallback */
    transform: translate(-50%, -50%); 
    background-color: #fff;
    border-radius: 20px;
    padding: 0px 10px;
    z-index: 5; 
    pointer-events: none; 
    white-space: nowrap; 
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    height: 26px;
    line-height: 26px;
    /* 增加过渡效果，让胶囊滑动更丝滑 */
    // transition: left 0.1s linear, transform 0.1s linear;
}


.time-step-text{
    font-size: 14px; color: #fff; font-weight: bold;
    //增加字体间距
    letter-spacing: 0.5px;
}

.time-text {
    font-size: 12px; color: #333; font-weight: bold;
}


.time-step{
    color: #fff;
    border-radius: 20px;
    padding: 0px 10px;
    z-index: 5; 
    pointer-events: none; 
    white-space: nowrap; 
    height: 26px;
    line-height: 26px;
    margin: 0 auto;
}

/* 迷你底部进度条 */
.mini-progress-bar {
    position: absolute; bottom: 0; left: 0; height: 2px;
    background-color: #fff; transition: width 0.1s linear; z-index: 20;
}

/* ================== 3. 控制栏 ================== */
.control-box {
    display: flex; align-items: center; transition: all 0.3s ease; width: 100%;
}
.box:not(.box-mini) .control-box {
    justify-content: space-between; padding: 0 10px;
}
.box.box-mini .control-box {
    justify-content: flex-end; width: auto; flex: 1;
}

.btn-item {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-width: 50px; text-align: center;
}
.box.box-mini .btn-item { min-width: 36px; margin-left: 5px; } 

.icon-wrap { margin-bottom: 4px; }
.tip { font-size: 12px; color: #fff; }

.play-btn-wrap { display: flex; align-items: center; justify-content: center; }
.box:not(.box-mini) .play-btn-wrap { width: 70px; height: 70px; }

.play-circle {
    width: 66px; height: 66px;
    background-color: #fff; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.play-circle.mini-circle {
    width: auto; height: auto; background-color: transparent; box-shadow: none;
}

::v-deep .uni-slider-handle-wrapper{
    height: 5px;
}

/* ================== 4. 倍速选择条（u-action-sheet 的插槽内容） ================== */
/* 灰底圆角条 + 选中项主题色圆底：整条是一排等宽档位，选中那一档换成 #0968f6 圆底白字，
   未选中走辅助灰 #86909c（§1 主色 / 辅助灰档）。圆角一律 999px（胶囊由高度决定实际半径），
   不写 12~39px 的单值圆角（M21 卡片圆角档、M17 按钮圆角档都不适用于这一档选择控件）。
   弹层外壳与底部「关闭」行是 u-action-sheet 自带的，这里只画选择条本身。 */
.ca-speed-panel {
    padding: 20px 15px 24px;
}
.ca-speed-track {
    display: flex;
    align-items: center;
    background-color: #f2f3f5;
    border-radius: 999px;
    padding: 5px;
}
.ca-speed-opt {
    flex: 1;
    height: 36px;
    line-height: 36px;
    text-align: center;
    white-space: nowrap;
    font-size: 14px;
    color: #86909c;
    border-radius: 999px;
    transition: background-color 0.2s ease, color 0.2s ease;
}
.ca-speed-opt--on {
    background-color: #0968f6;
    color: #fff;
    font-weight: 600;
}
.box.box-mini .audio-bg-mask{
    background-color: #0968f6;
}
</style>
