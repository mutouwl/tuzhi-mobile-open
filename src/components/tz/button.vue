<template>
    <div @click="click" :disabled="disabled" :style="customStyle" :class="[
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
        'theme-send-friend':theme == 'send-friend',
        'theme-group-buy':theme == 'group-buy',
        'theme-score':theme == 'score',
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
            // 业务主题：'' = 全站默认配色；'send-friend' = 送好友那一档的深钢蓝（#004C8B，
            // 与 `bottom-btn` 的 theme 同名同值，两个组件读的是同一档业务色）；
            // 'group-buy' = 拼团业务色（2026-10-30 用户点名「这个页面中的主题色是蓝色的，那最好可以
            // 同步一下平台的主题色」——拼团模块自己的主题色是红橙，取 `group-buy-btn` /
            // `group-buy-banner` 那一条 `linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)`，
            // 与商详底栏「立即开团」逐字同值，页面不再自己拼一条渐变）；
            // 'score' = 积分模块业务色（2026-11-08 用户点名「把按钮的主题色调整为黄色，也就是我们这个
            // 页面顶部的背景色那种主题」——积分中心页顶部余额区那条琥珀渐变 `#ef8531 → #f2a03a`
            // 就是这一模块自己的主色，按钮与同屏的「+N 积分 / 已完成」一起从它派生，不再吃平台蓝）。
            // 只换底色、不换圆角与尺寸 —— 圆角仍吃 4px（M17）。
            theme: {
                type: String,
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
            },
            // 调用点要改这一枚按钮的内衬时走这里（M12：跨组件覆盖只认 props）。
            // 微信端本组件默认 `isolated`，调用方 wxss 里的 `::v-deep .tuzi-btn` 编译进产物也穿不进组件内部，
            // 只有 inline style 能过隔离；传 CSS 字符串，避免 MP 端 `:style` 绑对象不序列化的那一坑。
            customStyle: {
                type: String,
                default: ""
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

    /* 送好友主题：底色取 `bottom-btn` 同一档深钢蓝（#004C8B），白字；
       只作用于显式传 theme="send-friend" 的调用点，其余按钮逐字不变 */
    .tuzi-btn.primary.theme-send-friend{
        background-color: #004C8B;
        border-color: #004C8B;
    }

    /* 拼团主题：底色取 `group-buy-btn` / `group-buy-banner` 那一条红橙渐变（逐字同值，
       与商详底栏「立即开团」同一套配色）；白字 3.34:1（渐变浅端 2.28，与模块内既有按钮同一档）。
       只作用于显式传 theme="group-buy" 的调用点，其余按钮的蓝底逐字不变 —— 拼团详情页
       `pages/app/group_buy/detail/detail.vue` 的动作区四枚主按钮走这一档 */
    .tuzi-btn.primary.theme-group-buy{
        background: linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%);
        border-color: transparent;
    }

    /* 积分主题：底色取积分中心页顶部余额区那一条琥珀渐变（`pages/app/score/home/home.vue`
       的 `.score-head`：`#ef8531 0% → #f2a03a 56% → #f8ca47 100%`），与同屏余额数值压在同一条底上。
       按钮只取前两档、不带浅端 `#f8ca47`：那一段白字只有 1.55:1，26px 高的小块上整条渐变读不清
       （与 `theme-group-buy` 同理，M81）。白字对比 2.60 / 2.13，与同屏顶部这条渐变的既有白字、
       参照页同类按钮（实测 2.11–2.46）同一档。只作用于显式传 theme="score" 的调用点，
       其余按钮的蓝底逐字不变 —— 积分中心首页与「全部任务」页的任务行按钮走这一档 */
    .tuzi-btn.primary.theme-score{
        background: linear-gradient(90deg, #ef8531 0%, #f2a03a 100%);
        border-color: transparent;
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