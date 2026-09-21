<template>
    <div
    
    :class="[
        {'round':round}
    ]" style="box-sizing: border-box;">

        <u-search v-model="content" :borderColor="borderColor" @search="search" :inputAlign="inputAlign" :showAction="false" placeholder="请输入要搜索的内容" :bgColor="inputBgColor" :shape="round ? 'round' : 'square'"></u-search>
    </div>
</template>
<script lang="ts">
export default {
    components: {},
    data() {
        return {
            content:''
        }
    },
    props: {
        borderColor:{
            type:String,
            default:'#fff'
        },
        color:{
            type:String,
            default:'#606266'
        },
        height:{
            type:[Number,String],
            default:10
        },
        inputBgColor:{
            type:String,
            default:'#fff'
        },
        round:{
            type:Boolean,
            default:false
        },
        inputAlign:{
            type:String,
            default:'left'
        },
    },
    methods: {
        search(){
            if(!this.content){
                return false;
            }

            this.$nav.to('/pages/public/search/search?content='+this.content)
        }
    },
    watch: {
    }


};
</script>

<style>
::v-deep .u-search__content {
    padding: 2px 10px;
}
</style>