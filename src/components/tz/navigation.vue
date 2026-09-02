<template>
    <div class="box" :style="{
        'background-color': bgColor ? bgColor : ''
    }" :class="[
    { 'round': round }
]">


        <!-- #ifdef MP-TOUTIAO -->
        <u-grid :border="border ? true : false" :col="col" customStyle="display: block;">
            <!-- #endif -->
            <!-- #ifndef MP-TOUTIAO -->
            <u-grid :border="border ? true : false" :col="col">
                <!-- #endif -->
                <u-grid-item v-for="(item, index) in list" :key="index" @click="handle(index)">
                    <img class="tabbar-icon" :style="{
                            'width': size + 'px',
                            'height': size + 'px',
                            'margin-top': (spacing / 2) + 'px'
                        }" :src="item.icon.src" v-if="item.icon.type == 'image'" />

                        <tz-icon v-if="item.icon.type == 'icon'" :style="{ 'margin-top': (spacing / 2) + 'px' }" :name="item.icon.src" :size="size - 5" />
                        <text class="name" :style="{
                            color: color,
                            'font-size': fontSize + 'px',
                            'margin-bottom': (spacing / 2) + 'px'
                        }">{{ item.name }}</text>
                </u-grid-item>
            </u-grid>
    </div>
</template>

<script>
export default {
    components: {},
    data() {
        return {

        }
    },
    props: {
        list: {
            type: [Object, Array],
            default: () => {
                return [];
            }

        },
        color: {
            type: String,
            default: '#999'
        },
        col: {
            type: [String, Number],
            default: 5
        },
        size: {
            type: [String, Number],
            default: 35
        },
        fontSize: {
            type: [String, Number],
            default: 14
        },
        spacing: {
            type: [String, Number],
            default: 10
        },
        border: {
            type: [Boolean, Number],
            default: false
        },
        //是否有圆角
        round: {
            type: [Boolean, Number],
            default: false
        },
        //背景颜色
        bgColor: {
            type: String,
            default: '#fff'
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
            imgs.push(list[i].img)
        }
        this.imgs = imgs;
    }
}
</script>
<style>
.box {
    padding: 0px 0;
}

.box .name {
    margin-top: 6px;
    font-size: 12px;
}

</style>

