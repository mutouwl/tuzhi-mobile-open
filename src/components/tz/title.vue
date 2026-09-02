<template>
    <div class="box" :style="{
        'background': bgColor,
        'padding': getPadding, 
        'margin': margin + 'px', 
        'box-sizing':'border-box',
        'height':height+'px',
        'line-height':height+'px'
    }">
        <div class="title" :style="{
                'font-size': size == 'bg' ? '20px' : size == 'md' ? '16px' : '14px',
                'color': color,
                'font-weight': bold ? '600' : '400'
            }">
            {{ title }}
        </div>
        <div class="more" v-if="more" @click="click">
            <span :style="{color:sub_color}">{{ subtitle }}</span>
            <tz-icon name="enter" :color="sub_color" :size="13" />
        </div>
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
        margin: {
            type: [Number, String],
            default: 0
        },
        padding: {
            type: [Number, String],
            default: '0 15px'
        },
        title: {
            type: String,
            default: '标题'
        },
        subtitle: {
            type: String,
            default: ''
        },
        more: {
            type: [Boolean, Number],
            default: 1
        },
        //尺寸 bg md sm
        size: {
            type: String,
            default: 'md'
        },
        color: {
            type: String,
            default: '#323233'
        },
        sub_color:{
            type:String,
            default:'#86909C'
        },
        height:{
            type: [Boolean, Number],
            default: 50
        },
        //背景颜色
        bgColor: {
            type: String,
            default: '#fff'
        },
        //加粗
        bold: {
            type: [Boolean, Number],
            default: 1
        },
        link: {
            type: [Object,Array],
            default: (ret) => {
                return {
                    type: '',
                    config: {}
                }
            }
        },
        //路由地址
        routeSrc: {
            type: String,
            default: ''
        },
        //路由类型
        routeType: {
            type: String,
            default: 'local'
        },
        //跳转模式
        routeMode: {
            type: String,
            default: ''
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
        }
    },
    methods: {
        click() {
            if (this.link.type) {
                this.$nav.to(this.link.src, this.link.type)
            }else{
                this.$emit('click',false)    
            }
            
        }
    },
    watch: {
    },
    mounted() {
    }
}
</script>
<style>
.box {
    width: calc(100% - 20px);
    width: 100%;
    height: 50px;
    line-height: 50px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;

    box-sizing: border-box;
}

.box .more span {
    font-size: 13px;
    color: #86909C;
    /* vertical-align: middle; */
    /* margin-right: 14px; */
}
</style>

