<template>
    <div>
        <!-- 层级必须显式压过吸底操作栏：全局 .school-footer 是 z-index 10063，
             而 uview 弹层默认 10075 只高出 12 —— 页面样式表未 scoped（H5 全站合并、小程序 app.wxss 同表），
             任何一条后加载的规则把底栏抬高一点，遮罩就会被戳穿，表现为「弹窗打开时底部操作栏还亮着」。
             这里把面板与遮罩一并钉到 10100 以上（2026-11-19 用户点名「不会被动窗的遮罩覆盖」） -->
        <u-popup :show="show" @close="close" @open="open" :closeable="true" title="答题卡" :round="10"
            :zIndex="10110" :overlayStyle="{ zIndex: 10100 }">
            <div class="sheet-box">
                <tz-box padding="10px 15px 15px" bgColor="none">
                    <!-- 宫格自己摆，不用 u-grid/u-grid-item：那两层把 40px 方块塞进 1/7 宽的格子里，
                         横向实距 = 格宽 − 40（375 屏约 13.6），纵向却只有 margin 叠出来的 10 ——
                         读出来就是「上下比左右挤」；320 屏上 7×(40+10) 还会超出屏宽、格子互相压。
                         改成 flex-wrap + 一条 gap：横纵间距同为 10，列数按可用宽度自动换行
                         （375 宽 7 列、320 宽 6 列），不再为头条单独开一套 display:block 分支。 -->
                    <div class="question-list-box">
                        <div class="question-list-wrap">
                            <div :class="['question-list-item', { active: isActive(item.id), marked: isMarked(item) }]"
                                v-for="(item, index) in questionList" :key="item.id || index"
                                @click="optionHandle(index)">
                                {{ index + 1 }}
                            </div>
                        </div>
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
        /** 题目标记（刷题本做题页的 flag 标记）：只读题目行自带的 marked，0/1 归一成布尔 */
        isMarked(item){
            return Number(item && item.marked) === 1;
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




/* 答题卡格区：题少时按内容撑开会只剩一两排（20 题＝3 排 150），面板矮得像一条；
   题多时又要挡住吸底栏。所以下限给 300px（2026-11-22 用户点名），上限按视口 60vh 收
   （固定 400 在短屏上叠加标题与内衬会顶出去），超出在格区内滚动。
   宽度不用管：u-popup 是底部弹层，panel 恒为屏宽。 */
.question-list-box {
    /* 下限只存这一处，格区内部那层也读它（两处写同一个像素值，改一处就分叉） */
    --sheet-min-h: 300px;
    min-height: var(--sheet-min-h);
    max-height: 60vh;
    overflow-y: auto;
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
}

/* 格区内部这一层负责排列：横纵间距同为一档 10px，列数由可用宽度自动决定。
   面板有 300px 下限而题目只有一两排时，这几排贴着面板顶部排、下方留白
   （2026-11-22 用户点名：题少时不要垂直居中，放在上面）；内容高过 300 时
   这一层长到内容高，align-content 不再分配剩余空间，首排不会被裁到滚动区外面。 */
.question-list-wrap {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 10px;
    min-height: var(--sheet-min-h);
    box-sizing: border-box;
}

.question-list-item {
    position: relative;
    overflow: hidden;
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;

    font-size: 14px;
    font-weight: 600;

    border-radius: 4px;
    color: #1D2129;
    background-color: #F7F8FA;
}

/* 已标记的题目：右上角一枚橙色角标（不改格子几何与题号位置；
   选中态蓝底上同样可见，与「答对/答错」的红绿两档不撞色） */
.question-list-item.marked::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-top: 12px solid #FF7D00;
    border-left: 12px solid transparent;
}

.question-list-item.active {
    color: #fff;
    background-color: #0968f6;
}
</style>
