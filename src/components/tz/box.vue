<template>
    <div :style="{ 'padding': getPadding, 'margin': getMargin, 'box-sizing':'border-box','background': bgColor}"
        :class="[
            { 'round': round } 
        ]">
        <slot></slot>
    </div>
</template>
<script lang="ts">
export default {
    components: {},
    data() {
        return {
        }
    },
    computed: {
        getPadding() {
            var padding = this.padding;
            var unit = 'px';

            if (typeof padding == 'number') {
                padding = padding.toString();
            }

            padding = padding.split(' ');

            if (padding.length <= 1) {
                if (padding[0].indexOf(unit) !== -1) {
                    padding[0] += unit;
                }else{
                }
                return padding[0] + unit;
            }

            for (var i in padding) {
                if (padding[i].indexOf(unit) == -1) {
                    padding[i] += 'px';
                }
            }
            return padding.join(" ");
        },
        getMargin() {
            if (this.marginTop !== undefined && this.marginTop !== null) {
                return this.marginTop + 'px 0 0 0';
            }
            return this.margin + 'px';
        }
    },

    props: {
        margin: {
            type: [Number, String],
            default: 0
        },
        marginTop: {
            type: [Number, String],
            default: undefined
        },
        padding: {
            type: [Number, String],
            default: 15
        },
        //背景颜色
        bgColor: {
            type: String,
            default: '#fff'
        },
        //是否有圆角
        round: {
            type: [Number, Boolean],
            default: 0
        }
    },
    methods: {

    },
    watch: {
    }


};
</script>

<style>
.round {
    border-radius: 10px;
    overflow: hidden;
    padding: 15px;
}
</style>
