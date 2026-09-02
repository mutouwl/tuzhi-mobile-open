<template>
    <view class="box">
        <img v-if="!imgError" :src="cover" @error="imgError = true" >
        <view v-else class="placeholder">
            <tz-icon name="picture" :size="40" color="#C9CDD4" />
        </view>
        <div class="type">
            {{ type ? $t(type) :''}}
        </div>
    </view>
</template>

<script >

var that;
// #ifdef MP-TOUTIAO
import i18n from '@/components/language/index.js';
// #endif
export default {
// #ifdef MP-TOUTIAO
    i18n,
    // #endif
    data() {
        return {
            imgError: false
        }
    },
    props: {
        cover:{
            type:String,
            default:''
        },
        type:{
            type:String,
            default:''
        }
    },
    watch: {
        // 切换课程时封面变化，重置加载失败状态
        cover() {
            this.imgError = false
        }
    },
    methods: {
       
    },
    onLoad(pageParams) {
        that = this
    }
}

</script>

<style>
.box {
    width: 100%;
    background-color: #fff;
    /* padding: 20px 0; */
    /* background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat; */
    /* height: 260px; */
    position: relative;
}

.box img{
    width: 100%;
}

/* 封面加载失败的填充占位区域 */
.box .placeholder{
    position: relative;
    width: 100%;
    /* 16:9 占位，与常见课程封面比例一致 */
    padding-top: 56.25%;
    background-color: #F2F3F5;
}

.box .placeholder tz-icon{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}


.box .type{
    position: absolute;
    bottom: 18px;
    right: 18px;
    height: 22px;
    border-radius: 0.08rem;
    padding: 0px 6px;
    box-sizing: border-box;
    line-height: 22px;
    background: rgba(0, 0, 0, .25);
    border-radius: 4px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    color: #fff;
    font-size: 12px;
    opacity: .8;
}
</style>
