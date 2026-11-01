<template>
    <div :style="{ 'height': height + 'px', 'background-color': bgColor }"
    
    :class="[
        {'round':round}
    ]">
    </div>
</template>
<script lang="ts">
export default {
    components: {},
    data() {
        return {

        }
    },
    props: {
        
        height:{
            type:[Number,String],
            default:10
        },
        //背景颜色：默认取页面底色（App.vue `page { background: rgba(250,250,250,1) }` = #fafafa）。
        //块间那几枚直接吃这个默认值即为「页面底色」；卡内分隔要跟着白卡走，由调用点显式传 #fff/none。
        //自定义页面（pages/index/index.vue、custom-form.vue）的颜色来自装修配置的 bgColor，不走这个默认值。
        bgColor:{
            type:String,
            default:'#fafafa'
        },
        //是否有圆角
        round:{
            type:Boolean,
            default:false
        },
    },
    methods: {

    },
    watch: {
    }


};
</script>

<style>
</style>
