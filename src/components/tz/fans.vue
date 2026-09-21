<template>
    <div>
        <div class="fans-box">
            <div class="avatar">
                <image :src="avatar" :show-menu-by-longpress="true"></image>
            </div>
            <div class="info">
                <div class="title one-line-hidden">
                    {{title}} 
                </div>
                <div class="subtitle one-line-hidden">
                    {{subtitle}}
                </div>
            </div>
            <div class="btn">
                <u-tag text="立即关注" @click="showModal()"></u-tag>
            </div>
        </div>
        <u-modal :show="show" :closeOnClickOverlay="true" width="300px" @confirm="showModal" confirmColor="#567" confirmText="取消">
            <view class="code-content">

                <div class="tip">
                    <div>扫码关注</div>
                    <div>{{ tipText }}</div>
                </div>

                <div class="code-img">
                    <image mode="scaleToFill" :src="code" :show-menu-by-longpress="true"></image>
                    <div style="font-size: 10px;color: #777;">长按二维码识别，或截图保存</div>
                </div>
            </view>
        </u-modal>
    </div>
</template>
<script lang="ts">
export default {
    components: {},
    data() {
        return {
            show: false
        }
    },
    props: {
        //头像
        avatar: {
            type: [String],
            default: ''
        },
        //二维码
        code: {
            type: [String],
            default: ''
        },
        //标题
        title: {
            type: [ String],
            default: '公众号名称'
        },
        //描述
        subtitle: {
            type: [ String],
            default: '公众号描述信息'
        },
        //背景颜色
        bgColor: {
            type: String,
            default: '#fff'
        },
        //提示文本
        tipText: {
            type: [ String],
            default: '扫码关注,随时收听课程，不耽误'
        }
    },
    methods: {
        showModal() {
            this.show = !this.show;
        }
    },
    watch: {
        
    }


};
</script>

<style>
.code-content {
    text-align: center;
    padding-bottom: 10px;
    /* padding: 20px; */
}
.code-content .tip{
    text-align: center;
}
.code-content .tip div:first-child {
    color: #1D2129;
    font-size: 18px;
    font-weight: 500;
}

.code-content .tip div:last-child {
    margin-top: 10px;
    color: #6b7785;
    font-size: 14px;
}

.code-content .code-img {
    width: 150px;
    height: 150px;
    
    margin: 20px auto 0;
}

.code-content .code-img image {
    width: 100%;
    height: 100%;
}

.fans-box {
    background-color: #fff;
    width: calc(100% - 20px);
    display: flex;
    justify-content: space-between;
    /* vertical-align: middle; */
    align-items: center;
    padding: 10px;
}

.fans-box .avatar {
    width: 38px;
    height: 38px;
    /* margin-top: 5px; */
}

.fans-box .avatar image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

.fans-box .info {
    width: calc(100% - 140px);
}

.fans-box .info .title {
    color: #1D2129;
    font-size: 16px;
    font-weight: 500;
    /* margin-top: 6px; */
}


.fans-box .info .subtitle {
    font-size: 13px;
    margin-top: 5px;
    color: #6b7785;
}


.fans-box .btn {
    /* width: 100px; */
    /* margin-top: 13px; */
}

.fans-box .btn span {}
</style>
