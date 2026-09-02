<template>
    <u-notice-bar @click="" :mode="link & link.type ? 'link' : ''" :text="text"></u-notice-bar>
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
        text: {
            type: [String],
            default: ''
        },
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
    methods: {
        jump(){
            if (this.link.type) {
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
