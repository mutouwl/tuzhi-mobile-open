<template>
    <div class="start-time-bar" :class="styleType">
        <div class="time-section">
            <div class="start-time">
                时间：{{ $tools.formatDate(startTime, 'MM-DD HH:mm') }} ～ {{ $tools.formatDate(endTime, 'MM-DD HH:mm') }}
            </div>
        </div>
        
        <div class="remaining-time" v-if="(startTime - nowTime) > 0 && (startTime - nowTime) <86400 * 30">
            <span>距离开始：</span>
            <u-count-down :time="(startTime - nowTime) * 1000" autoStart millisecond @change="onChange">
                <view class="time">
                    <text class="time__item" v-if="timeData.days > 0">{{ timeData.days }}天</text>
                    <text class="time__item" v-if="timeData.hours > 0">{{ timeData.hours > 10 ? timeData.hours : '0' +
                        timeData.hours }}时</text>
                    <text class="time__item">{{ timeData.minutes }}分</text>
                    <text class="time__item">{{ timeData.seconds }}秒</text>
                </view>
            </u-count-down>
        </div>
    </div>
</template>

<script >
var that;
export default {
    components: { },
    data() {
        return {
            timeData: {},
            nowTime:Date.now()/1000
        }
    },
    props: {
        startTime: {
            type: [String, Number],
            default: 0
        },
        endTime: {
            type: [String, Number],
            default: 0
        },
        styleType: {
            type: String,
            default: 'default',
            validator: function(value) {
                return ['default', 'light'].indexOf(value) !== -1;
            }
        }
    },
    watch: {
        visible() {
            this.show = this.visible;
        }
    },
    methods: {
        onChange(e) {
            this.timeData = e
        },
        close() {
            this.$emit('close', false);
        },
        open() {
            this.$emit('open', false);
        },
        optionHandle(index) {
            this.$emit('jump', index);
        }
    },
    created() {

    },
    mounted() {
        that = this;
        this.show = this.visible;

    }
}

</script>

<style scoped>
/* 默认样式 */
.start-time-bar {
    display: flex;
    flex-direction: column;
    padding: 8px 10px;
    border-radius: 5px;
    gap: 6px;
    background-color: #f0f6ff;
}

.start-time-bar .time-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.start-time-bar .start-time {
    font-size: 12px;
    color: #007aff;
    font-weight: 600;
    text-align: left;
}

.start-time-bar .end-time {
    font-size: 12px;
    color: #007aff;
    font-weight: 600;
    text-align: left;
}

.start-time-bar .remaining-time {
    font-size: 12px;
    color: #007aff;
    font-weight: 600;
    display: flex;
    justify-content: left;
    align-items: center;
    text-align: left;
}
.start-time-bar .remaining-time .time-unit{
    font-size: 14px;
    font-weight: 400;
    color: #007aff;
    margin:0 3px;
}

/* 轻量样式 - 无背景、白色字体、居中 */
.start-time-bar.light {
    background: none!important;
    border: none!important;
    padding: 0;
    border-radius: 0;
    gap: 4px;
    text-align: center;
}

.start-time-bar.light .time-section {
    text-align: center;
}

.start-time-bar.light .start-time {
    color: #ffffff;
    text-align: center;
    font-size: 11px;
    font-weight: 500;
}

.start-time-bar.light .end-time {
    color: #ffffff;
    text-align: center;
    font-size: 11px;
    font-weight: 500;
}

.start-time-bar.light .remaining-time {
    color: #ffffff;
    justify-content: center;
    text-align: center;
    font-size: 11px;
    font-weight: 500;
}

.start-time-bar.light .remaining-time .time-unit {
    color: #ffffff;
    font-size: 12px;
    font-weight: 400;
}
</style>
