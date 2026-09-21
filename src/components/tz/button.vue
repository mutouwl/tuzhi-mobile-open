<template>
    <div @click="click" :disabled="disabled" :class="[
    'tuzi-btn',
    {
        'primary':type == 'primary',
        'danger':type == 'danger',
        'warning':type == 'warning',
        'default':!type || type == 'default',
        'size-normal':size == 'normal',
        'size-small':size == 'small',
        'size-mini':size == 'mini',
        'size-mid':size == 'mid',
        'size-large':size == 'large',
        'long':long,
        'disabled':disabled
    }
    
    ]">
    {{ text }}
    </div>
</template>
<script lang="ts">
    export default {
        components: {},
        data() {
            return {
            };
        },
        props: {
            text: {
                type: [String],
                default: ""
            },
            type: {
                type: [String],
                default: "default"
            },
            size: {
                type: [String],
                default: "normal"
            },
            long: {
                type: [Boolean],
                default: false
            }, 
            disabled: {
                type: [Boolean],
                default: false
            }
        },
        methods: {
            click() {
                if(this.disabled){
                    return false;
                }
                this.$emit('click', false);
            }
        },
        watch: {},
    };
</script>

<style scoped>
    .tuzi-btn {
        margin: 0px 0px;
        font-size: 14px;
        border-radius: 4px;
        width: fit-content;
        text-align: center;
        box-sizing: border-box;
    }

    .tuzi-btn.long{
        width: 100%;
    }

    

    .tuzi-btn.size-normal{
        padding: 10px 20px;
    }

    .tuzi-btn.size-small{
        padding: 5px 15px;
    }

    .tuzi-btn.size-mini{
        padding: 2px 10px;
        font-size: 12px;
        line-height: 16px;
    }

    /* mid：列表卡内操作按钮（教务时间轴卡片等「卡片里的按钮」，比 mini 大约 1/3）——
       内边距 2/10 → 3/13、行高 16 → 21（热区 20px → 27px），字号取按钮通用口径 14px，
       不再随 mini 用 12px，否则按钮变大而文字不变会显得空。
       夹在 mini 与 small 之间：small 是页面操作按钮（详情页底部那一档），mid 只用于列表卡内 */
    .tuzi-btn.size-mid{
        padding: 3px 13px;
        font-size: 14px;
        line-height: 21px;
    }

    .tuzi-btn.size-large{
        padding: 16px 30px;
        font-size: 16px;
    }

    .tuzi-btn.default{
        color: rgb(78,89,105);
        background-color: rgb(242,243,245) ;
    }

    .tuzi-btn.primary{
        color:  #fff;
        background-color: #0968f6;
    }

    .tuzi-btn.success{
        color: rgb(0,180,42);
        background-color: rgb(232,255,234);
    }

    .tuzi-btn.warning{
        color: rgb(255,125,0);
        background-color: rgb(255,247,232);
    }

    .tuzi-btn.danger{
        color: rgb(245,63,63);
        background-color: rgb(255,236,232) ;
    }

    .tuzi-btn.disabled{
        color: #c8c9cc!important;
        cursor: default!important;
        background-color: #f7f8fa!important;
        border-color: #e9e9eb!important;
    }

</style>