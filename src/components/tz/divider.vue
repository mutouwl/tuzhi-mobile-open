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
        //背景颜色
        bgColor:{
            type:String,
            default:'#f5f5f5'
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
