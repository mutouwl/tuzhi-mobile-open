<template>
    <div :class="['loading-page',{
        'loading-absolute':absolute
    }] "  v-if="loading">
    <div>
        <u-loading-icon></u-loading-icon>
        <div class="loading-tip">{{ tip }}</div>
    </div>
    
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
        //二维码
        loading: {
            type: [Boolean],
            default: false
        },
        tip:{
            type: [String],
            default: '加载中…'
        },
        absolute:{
            type: [Boolean],
            default: false
        }
    },
    methods: {
    },
    watch: {
        
    }


};
</script>

<style>

.loading-page{
    width: 100%;
    height: 100%;
    z-index: 100;
    background-color: #F7F8FA;
    position: fixed;
    left: 0;
    top: 0;

    text-align: center;
    box-sizing: border-box;
    font-size: 14px;
    color: #86909C;

    padding-top: 200px;

}

.loading-absolute{
    position: absolute;
    left:0;
    top:0
}

.loading-tip{
    margin-top: 20px;
}

</style>
