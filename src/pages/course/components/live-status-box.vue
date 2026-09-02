<template>
    <div class="live-status-box" :style="{ height: height + 'px', backgroundImage: 'url(' + cover + ')' }">
        <div class="live-status-info">
            <div class="live-status-icon">
                <img src="@/static/image/video/live.png">
            </div>
            <div class="live-status-text">
                <!-- 正在获取直播数据：数据拉取中，左侧显示小尺寸加载转圈图标 -->
                <div v-if="tip == '正在获取直播数据'" class="live-status-text-loading">
                    <u-loading-icon
                        mode="circle"
                        :size="14"
                        color="#fff"
                        inactive-color="rgba(255,255,255,0.3)"
                    ></u-loading-icon>
                </div>
                <span>{{ tip }}</span>
            </div>
            <!-- 刷新中：按钮替换为旋转的刷新图标，不弹加载提示 -->
            <div class="live-status-refreshing" v-if="tip != '正在获取直播数据' && refreshing">
                <tz-icon class="live-status-refresh-spin" name="refresh" :size="14" color="#fff"></tz-icon>
            </div>
            <div class="live-status-refresh" @click="refresh" v-if="tip != '正在获取直播数据' && !refreshing">
                <tz-icon name="refresh" :size="14" color="#fff"></tz-icon>
                <span>刷新</span>
            </div>
            <live-start-time-bar styleType="light" v-if="startTime" :end-time="endTime" :start-time="startTime" />
        </div>
    </div>
</template>

<script >
var that;
import liveStartTimeBar from '@/components/course/live-start-time-bar.vue';
export default {
    components: {
        liveStartTimeBar
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
        //是否刷新中（刷新时按钮替换为旋转图标）
        refreshing: {
            type: Boolean,
            default: false
        },
        //提示文字
        tip: {
            type: String,
            default: '正在获取直播数据'
        },
        //高度
        height: {
            type: [String, Number],
            default: 210
        },
        showBtn: {
            type: Boolean,
            default: false
        },
        //开始时间
        startTime: {
            type: [String, Number],
            default: 0
        },
        //开始时间
        endTime: {
            type: [String, Number],
            default: 0
        }
    },
    watch: {
    },
    methods: {
        refresh() {
            this.$emit('refresh', false);
        }
    },
    created() {

    },
    mounted() {
        that = this;
    }
}

</script>

<style>
.live-status-box {
    background-size: 100% 100%;
    width: 100%;
    /* z-index: 20000; */


    /*  #ifdef  MP-TOUTIAO  */
    width: 100%;
    position: relative;
    /*  #endif  */
}

.live-status-box:after {
    content: " ";
    display: inline-block;
    width: 100%;
    /*  #ifdef  MP  */
    height: calc(100%);
    /*  #endif  */
    /*  #ifdef  H5  */
    height: calc(100%);
    /*  #endif  */
    /* 高斯模糊效果 - 替换原来的半透明背景 */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px); /* Safari 兼容 */
    background-color: rgba(0, 0, 0, .3); /* 降低透明度，让模糊效果更明显 */
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;

    /*  #ifdef  MP-TOUTIAO  */
    height: 100%;
    /*  #endif  */
}

.live-status-info {
    text-align: center;
    width: 100%;
    position: absolute;
    top: 35%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    color: #fff;
    text-align: center;
    z-index: 10;

    /*  #ifdef  MP-TOUTIAO  */
    top: 50%;
    /*  #endif  */
}

.live-status-text {
    font-size: 12px;
    color: #fff;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
    line-height: 1.5;
}

.live-status-refresh {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 12px auto 0;
    padding: 6px 16px;
    background-color: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 16px;
    font-size: 12px;
    color: #fff;
}

/* 刷新中：仅展示旋转的刷新图标 */
.live-status-refreshing {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 12px auto 0;
    padding: 8px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.4);
}

.live-status-refresh-spin {
    -webkit-animation: live-status-refresh-spin 1s linear infinite;
    animation: live-status-refresh-spin 1s linear infinite;
}

@keyframes live-status-refresh-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.live-status-text-loading {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
}

.live-status-refresh span {
    margin-left: 4px;
}


.live-status-icon img {
    width: 45px;
    height: 45px;
    opacity: .85;
}

.live-status-btn {
    width: 80px;
    margin: 10px auto;
    padding: 5px 10px;
    /* background-color: aliceblue; */
    font-size: 12px;
    border-radius: 5px;

}

/* 直播开始时间条样式 */
.live-status-info .start-time-bar {
    margin-top: 15px;
    background-color: rgba(240, 246, 255, 0.9);
    border: 1px solid rgba(0, 122, 255, 0.2);
    max-width: 90%;
    margin-left: auto;
    margin-right: auto;
}
</style>
