<template>
    <div>
        <u-action-sheet @select="actionSelect" :closeOnClickOverlay="true" :closeOnClickAction="true" :actions="actionList"
            round="10" title="操作" @close="close" :show="show" cancelText="取消"></u-action-sheet>
    </div>
</template>

<script >
import { br } from '@dcloudio/vue-cli-plugin-uni/packages/postcss/tags';


var that;
export default {
    components: {},
    data() {
        return {
            show: false,
            actionList: [
                {
                    name: '新练习',
                    index: 'new',
                    fontSize: 14
                },
                {
                    name: '错题本',
                    index: 'error',
                    fontSize: 14
                },
                {
                    name: '练习记录',
                    index: 'log',
                    fontSize: 14
                },
                // {
                //     name: '收藏题目',
                //     index: 'collect',
                //     fontSize: 14
                // },
                {
                    name: '练习详情',
                    index: 'detail',
                    fontSize: 14
                }
            ]
        }
    },
    props: {
        visible: {
            type: [Boolean, Number],
            default: false
        },
        exercisesId: {
            type: [String, Number],
            default: ''
        }
    },
    watch: {
        visible() {
            this.show = this.visible;
        }
    },
    methods: {
        close() {
            this.$emit('close', false);
        },
        open() {
            this.$emit('open', false);
        },
        actionSelect(option) {
            this.$emit('close', false);

            switch (option.index) {
                case 'detail':
                    this.$nav.to('/pages/app/exam/detail/detail?id=' + that.exercisesId, 'local')
                    break;
                case 'error':
                    this.$nav.to('/pages/app/exam/work/work?id=' + that.exercisesId + '&type=error', 'local')
                    break;
                case 'log':
                    this.$nav.to('/pages/app/exam/log/log?id=' + that.exercisesId, 'local')
                    break;
                case 'new':
                    //创建练习
                    that.$api('app.exam.exercises.buildLog', {
                        id: that.exercisesId,
                    }).then(res => {
                        if (res.code === 1) {
                            this.$nav.to('/pages/app/exam/work/work?id=' + res.data, 'local')
                        }
                    });
                    break;
            }
        }
    },
    created() {

    },
    mounted() {
        that = this;
        this.show = this.visible;

    }
}

</script>

<style></style>
