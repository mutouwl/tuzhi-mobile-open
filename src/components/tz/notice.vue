<template>
    <!-- `mode` 决定右箭头：只有真能跳才出。原来写的 `link & link.type` 是位与（字符串转数字后
         恒为 NaN ⇒ 恒假），箭头从来没出现过；这里改成判空的可跳判定，与跳转本身同一判据。 -->
    <u-notice-bar @click="jump" :mode="jumpable ? 'link' : ''" :text="text"></u-notice-bar>
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
        //通知内容
        text: {
            type: [String, Array],
            default: ''
        },
        // 跳转（全站 change-link 的 {type,src}）
        link: {
            type: Object,
            default: (ret) => {
                return {
                    type: '',
                    src: ''
                }
            }
        },
    },
    computed: {
        /**
         * 是否可跳：`unlink`（不跳转档）与空 type 都不算
         *
         * 箭头与点击共用这一个判据 —— 原实现两处各写一遍，箭头那边还是位与，结果「有链接没箭头」
         * 与「有箭头点了不动」两种自相矛盾都出现过。
         */
        jumpable() {
            const link = this.link || {};
            return !!(link.type && link.type !== 'unlink' && link.src);
        },
    },
    methods: {
        jump(){
            if (this.jumpable) {
                this.$nav.to(this.link.src, this.link.type)
            }else{
                this.$emit('click',false)    
            }
        }
    },
    watch: {
        
    }


};
</script>

<style>
</style>
