<template>
    <div>
        <u-popup :show="show" @close="close" @open="open" :closeable="true" title="答题卡" :round="10">
            <div class="sheet-box">
                <tz-box padding="10px 15px 15px" bgColor="none">
                    <div class="question-list-box">
                    <!-- #ifdef MP-TOUTIAO -->
            <u-grid :border="false" col="7" customStyle="display: block;">
        <!-- #endif -->
            <!-- #ifndef MP-TOUTIAO -->
                        <u-grid :border="false" col="7">
                        <!-- #endif -->
                            <template v-for="(item, index) in questionList">
                                <u-grid-item>
                                    <div :class="['question-list-item',{
                                         active:isActive(item.id),
                                         last: index === questionList.length - 1
                                    }]" @click="optionHandle(index)">
                                        {{ index + 1 }}
                                    </div>
                                </u-grid-item>
                            </template>
                        </u-grid>
                    </div>
                </tz-box>
            </div>
        </u-popup>
    </div>
</template>

<script >

var that;
export default {
    components: {},
    data() {
        return {
            show: false
        }
    },
    props: {
        visible: {
            type: [Boolean, Number],
            default: false
        },
        questionList: {
            type: [Array],
            default: function () {
                return [];
            }
        },
        answerList:{
            type: [Array,Object],
            default: function () {
                return [];
            }
        }
    },
    watch: {
        visible() {
            this.show = this.visible;
        }
    },
    methods: {
        isActive(id){
            if(!this.answerList || this.answerList.length == 0){
                return false;
            }

            const numericArray = Object.keys(this.answerList).map(Number);
            if(numericArray.includes(id)){
                return true;
            }

            return false
        },
        close() {
            this.$emit('close', false);
        },
        open() {
            this.$emit('open', false);
        },
        optionHandle(index){
            this.$emit('jump', index);
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

<style>
.sheet-title {
    width: 100%;
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    text-align: center;
    border-bottom: 1px solid #efefef;
}




.question-list-box {
    max-height: 400px;
    min-height: 160px;
    overflow-y: auto;
}

.question-list-item {
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;

    font-size: 14px;
    font-weight: 600;

    border-radius: 4px;
    margin: 5px;
    color: #1D2129;
    background-color: #F7F8FA;

}

.question-list-item.active {
    color: #fff;
    background-color: #0968f6;
}

/* 最后一项margin-right:auto */
.question-list-item.last {
    margin-right: auto;
}
</style>
