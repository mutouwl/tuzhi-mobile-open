<template>
    <div>
        <u-swiper :height="height" :list="imgs" :radius="round ? 10 : 0"
            :indicator="list.length > 1 ? indicator ? true : false : false" :indicatorMode="indicatorMode"
            @click="handle"></u-swiper>
    </div>
</template>

<script>
export default {
    components: {},
    data() {
        return {
            imgs: []
        }
    },
    props: {
        list: {
            type: [Object, Array],
            default: () => {
                return []
            }
        },
        //是否有圆角
        round: {
            type: [Boolean, Number],
            default: false
        },
        height: {
            type: [String, Number],
            default: 140
        },

        //单列 双列
        type: {
            type: String,
            default: 'single'
        },
        indicator: {
            type: [Boolean, Number],
            default: true
        },
        //指示器模式 line	dot
        indicatorMode: {
            type: String,
            default: 'dot'
        }
    },
    methods: {
        handle(index) {
            var item = this.list[index].link;
            if (item.type) {
                this.$nav.to(item.src, item.type)
            }
        }
    },
    watch: {
    },
    mounted() {
        var list = this.list;
        var imgs = [];
        for (var i in list) {
            imgs[i] = list[i].img;
        }
        this.imgs = imgs;
    }
}
</script>
<style></style>

