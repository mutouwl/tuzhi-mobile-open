<template>
    <div v-if="!isInIframe"> 
        <div class="hover-btn" @click="show = true">
            <tz-icon name="manage" :size="26" color="#86909C" />
        </div>

        <u-popup :show="show" @close="show = false" :closeable="true" :round="10">
            <div style="padding: 30px 10px 60px;">
                <div class="box control-box">
                    <div class="control-btn" @click="show = false; $nav.to('/pages/index/index', 'local', 'reLaunch')">
                        <tz-icon name="homepage" color="#1D2129" :size="35" />
                        <div>首页</div>
                    </div>
                    <div class="control-btn" @click="show = false; $nav.to('/pages/user/study/study', 'local', 'reLaunch')">
                        <div><tz-icon name="dynamic" color="#1D2129" :size="35" /></div>
                        <div>学习中心</div>
                    </div>
                    <div class="control-btn" @click="show = false; $nav.to('/pages/order/list/list', 'local')">
                        <div><tz-icon name="createtask" color="#1D2129" :size="35" /></div>
                        <div>订单管理</div>
                    </div>
                    <div class="control-btn" @click="show = false; $nav.to('/pages/user/index/index', 'local', 'reLaunch')">
                        <div><tz-icon name="people" color="#1D2129" :size="35" /></div>
                        <div>个人中心</div>
                    </div>
                </div>
                <!-- <u-button text="关闭" class="close-btn" @click="show = false"></u-button> -->
            </div>
        </u-popup>
    </div>
</template>

<script >

var that;
export default {
    data() {
        return {
            show: false,
            isInIframe: false
        }
    },
    props: {
    },
    mounted() {
        that = this;
        this.checkIframe();
    },
    methods: {
        checkIframe() {
            try {
                if (typeof window !== 'undefined' && window.self && window.top) {
                    this.isInIframe = window.self !== window.top;
                } else {
                    this.isInIframe = false;
                }
            } catch (e) {
                this.isInIframe = false;
            }
        },
        close() {
            this.$emit('close', false);
        }
    }

}

</script>

<style>
.box {
    width: calc(100% - 20px);
    padding: 15px;

    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 每行三列 */
    grid-row-gap: 20px;                    /* 行间距 */
    grid-column-gap: 10px;                 /* 列间距 */

    z-index: 100;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
}

.control-btn {
    text-align: center;
    font-size: 12px;
    color: #1D2129;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px; /* 图标与文字距离 */
}

.hover-btn {
    position: fixed;
    right: 20px;
    bottom: 140px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 5px 10px rgba(0, 0, 0, .1);
    z-index: 10;
    padding: 8px 10px;
}
</style>
