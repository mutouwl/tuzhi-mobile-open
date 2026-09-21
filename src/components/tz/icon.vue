<template>
    <text
        :class="['iconfont', 'icon-' + name]"
        :style="{
            color: color,
            fontSize: iconSize,
            lineHeight: iconSize
        }"
    ></text>
</template>

<script>
export default {
    components: {  },
    data() {
        return {
        }
    },
    props: {
        name: {
            type: String,
            default: false
        },
        size: {
            type: [Number, String],
            default: 30
        },
        color:{
            type: [String,Object],
            default: ''
        }
    },
    computed: {
        iconSize() {
            if (typeof this.size === 'number' || /^[0-9]+$/.test(String(this.size))) {
                return this.size + 'px';
            }
            return this.size;
        }
    },
    methods: {},
    watch: {
    },
    mounted() {
    }
}
</script>
<style>

    
</style>
