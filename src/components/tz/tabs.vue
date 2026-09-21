<template>
    <div :style="{ 'background-color': bgColor }" :class="[
        { 'round': round }
    ]">

        <u-tabs :list="tabs" @click="click" :lineColor="lineColor" :activeStyle="activeStyle"
            :inactiveStyle="inactiveStyle"></u-tabs>

        <div style="margin-top: 10px;">
            <tz-course></tz-course>
        </div>
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
        tabs: {
            type: [Object, Array],
            default: () => {
                return [
                    {
                        name: '关注',
                    }, 
                    {
                        name: '推荐',
                    }
                ]
            }
        },
        //背景颜色
        bgColor: {
            type: String,
            default: 'none'
        },
        //是否有圆角
        round: {
            type: Boolean,
            default: false
        },
        //滑块颜色
        lineColor: {
            type: String,
            default: '#0968f6'
        },
        activeStyle: {
            type: [Object, String],
            default: () => {
                return { color: '#303133' }
            }
        },
        inactiveStyle: {
            type: [Object, String],
            default: () => {
                return { color: '#606266' }
            }
        }
    },
    methods: {
        click(item) {
            console.log('item', item);
        }
    },
    watch: {
    }


};
</script>

<style></style>
