<template>
    <div class="option-single-box">
        <!-- 刷题本做题页（variant=report）：无底色选项行 + 圆形 / 圆角方形字母牌。
             作答态：选中项实心主色；判断项与单选同走字母牌（A 正确 / B 错误），对错只由颜色表达（2026-11-24 用户点名） -->
        <template v-if="variant === 'report'">
            <template v-if="isOptionType">
                <div class="oq-list" :class="{ 'oq-list--edit': !onlyRead, 'oq-list--scored': scored }">
                    <div class="oq-item" v-for="(item, index) in list" :key="index" @click="select(index)">
                        <div :class="['oq-no', isSquare ? 'oq-no--square' : 'oq-no--circle',
                            { 'is-right': onlyRead && isActive(index), 'is-wrong': errorIsActive(index),
                              'is-picked': !onlyRead && isActive(index) }]">
                            <text>{{ String.fromCharCode(65 + parseInt(index)) }}</text>
                        </div>
                        <div class="oq-val">
                            <tz-parse bgColor="none" :content="item" />
                        </div>
                    </div>
                </div>
            </template>

            <!-- 填空题：底部一张上掀的白色输入面板（解析态只读回显，答错的空带红叉、答对带绿勾） -->
            <template v-if="type == 'fillblank'">
                <div class="oq-fill" :class="{ 'is-collapsed': fillCollapsed }">
                    <div class="oq-fill-tab" @click="toggleFill">
                        <div class="oq-fill-arrow" :class="{ 'is-up': fillCollapsed }"></div>
                    </div>
                    <div class="oq-fill-body" v-show="!fillCollapsed">
                        <div class="oq-fill-row" v-for="(item, index) in blankList" :key="index">
                            <div v-if="onlyRead" class="oq-fill-mark"
                                :class="blankWrong[index] ? 'is-wrong' : 'is-right'">
                                <tz-icon :name="blankWrong[index] ? 'cha' : 'gou'" :size="13" color="#fff" />
                            </div>
                            <div v-else class="oq-fill-no">{{ index + 1 }}</div>
                            <input :class="['oq-fill-input', { 'is-disabled': onlyRead }]" type="text"
                                v-model="fillblankAnswer[index]" :disabled="onlyRead" @input="onFillblankChange"
                                placeholder-class="oq-fill-ph" :placeholder="onlyRead ? '' : '请填写答案'" />
                        </div>
                    </div>
                </div>
            </template>

            <!-- 问答题：大输入框 + 左下角一枚插图入口（不起数量角标） -->
            <template v-if="type == 'essay'">
                <div class="oq-essay">
                    <textarea class="oq-essay-input" v-model="essayAnswer" :disabled="onlyRead"
                        @input="onEssayChange" placeholder-class="oq-fill-ph"
                        :placeholder="onlyRead ? '' : '请填写答案'" maxlength="10000" />
                    <div class="oq-essay-tools" v-if="!onlyRead">
                        <tz-upload class="oq-essay-upload" v-model="essayImages" :maxCount="4"
                            @change="onEssayImagesChange">
                            <view class="oq-essay-upload-btn">
                                <tz-icon name="picture" :size="20" color="#666" />
                            </view>
                        </tz-upload>
                    </div>
                </div>
            </template>
        </template>

        <template v-else>
        <!-- 单选/多选/判断/不定项选择 -->
        <template v-if="isOptionType">
            <div :class="['option-single-item', { 'success_answer': isActive(index), 'error_answer': errorIsActive(index) }]"
                v-for="(item, index) in list" :key="index" @click="select(index)">
                <div class="option-single-no">
                    {{ String.fromCharCode(65 + parseInt(index)) }}
                </div>
                <div class="option-single-val">
                    <tz-parse bgColor="none" :content="item" />
                </div>
            </div>
        </template>

        <!-- 填空题 -->
        <template v-if="type == 'fillblank'">
            <div class="fillblank-box">
                <div class="fillblank-scroll">
                    <div class="fillblank-item" v-for="(item, index) in blankList" :key="index">
                        <div class="fillblank-no">{{ index + 1 }}</div>
                        <input :class="['fillblank-input', { 'is-disabled': onlyRead }]" type="text" v-model="fillblankAnswer[index]"
                            :disabled="onlyRead" @input="onFillblankChange"
                            :placeholder="onlyRead ? '' : '请输入答案'" />
                    </div>
                </div>
            </div>
        </template>

        <!-- 问答题 -->
        <template v-if="type == 'essay'">
            <div class="essay-box">
                <textarea :class="['essay-textarea', { 'is-disabled': onlyRead }]" v-model="essayAnswer" :disabled="onlyRead"
                    @input="onEssayChange" :placeholder="onlyRead ? '' : '请输入答案'" maxlength="10000" />
                <div class="essay-tools" v-if="!onlyRead">
                    <div class="essay-upload-count">{{ essayImages.length }}/4</div>
                    <tz-upload class="essay-tool" v-model="essayImages" :maxCount="4" @change="onEssayImagesChange" />
                </div>
            </div>
        </template>
        </template>
    </div>
</template>

<script>

var that;
export default {
    name: 'singleOption',
    components: {},
    data() {
        return {
            alphabet: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
            show: false,
            active: false,
            itemAnswer: [],
            fillblankAnswer: [],
            fillCollapsed: false,
            essayAnswer: '',
            essayImages: []
        }
    },

    props: {
        visible: {
            type: [Boolean, Number],
            default: false
        },
        option: {
            type: [Array, Object],
            default: function () {
                return []
            }
        },
        type: {
            type: String,
            default: 'judge'
        },
        answer: {
            type: [String, Array, Number, Boolean, Object],
            default: function () {
                return []
            }
        },
        onlyRead: {
            type: Boolean,
            default: false
        },
        errorAnswer: {
            type: [String, Array, Number, Boolean],
            default: function () {
                return []
            }
        },
        blank_count: {
            type: Number,
            default: 0
        },
        question: {
            type: String,
            default: ''
        },
        // '' = 练习/考试的既有选项样式；report = 刷题本做题页的解析版式
        variant: {
            type: String,
            default: ''
        },
        // 填空解析态每空是否答错（与题目正确答案逐空对账，由 question-box 给）
        blank_wrong: {
            type: Array,
            default: function () {
                return [];
            }
        },
        // 试卷题（有卷面分）：解析态未选项的字母取深灰；练习模式取浅灰（参照图两态不同）
        scored: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        list() {
            if (this.type == 'judge') {
                return ['正确', '错误'];
            }
            return this.option;
        },
        isOptionType() {
            return ['single', 'multiple', 'judge', 'indefinite'].indexOf(this.type) !== -1;
        },
        /** 多选 / 不定项用圆角方形牌，单选 / 判断用圆形牌（参照页口径） */
        isSquare() {
            return this.type === 'multiple' || this.type === 'indefinite';
        },
        blankList() {
            var count = parseInt(this.blank_count) || 0;
            if (!count && this.answer && Array.isArray(this.answer) && this.answer.length > 0) {
                count = this.answer.length;
            }
            if (!count && this.option && Array.isArray(this.option) && this.option.length > 0) {
                count = this.option.length;
            }
            if (!count && this.question) {
                count = this.getBlankCountFromQuestion(this.question);
            }
            if (!count) count = 1;
            return new Array(count).fill(null);
        }
    },
    watch: {
        answer() {

            this.initActive();
        }
    },
    methods: {

        // 填空题输入面板顶部中央的抓手：点一下折叠 / 展开输入区
        toggleFill() {
            this.fillCollapsed = !this.fillCollapsed;
        },

        initActive() {
            if (this.isOptionType) {
                if (typeof this.answer == 'object' && this.answer !== null) {
                    for (var i in this.answer) {
                        this.answer[i] = parseInt(this.answer[i]);
                    }
                }
                this.active = this.answer;
            } else if (this.type == 'fillblank') {
                var arr = [];
                for (var i = 0; i < this.blankList.length; i++) {
                    arr[i] = (this.answer && Array.isArray(this.answer) && this.answer[i] !== undefined) ? this.answer[i] : '';
                }
                this.fillblankAnswer = arr;
            } else if (this.type == 'essay') {
                var essayVal = (this.answer !== undefined && this.answer !== null) ? this.answer : '';
                if (essayVal && typeof essayVal == 'object' && !Array.isArray(essayVal)) {
                    this.essayAnswer = essayVal.text || '';
                    this.essayImages = Array.isArray(essayVal.images) ? essayVal.images : [];
                } else {
                    this.essayAnswer = Array.isArray(essayVal) ? '' : String(essayVal);
                    this.essayImages = [];
                }
            }
        },

        isActive(index) {

            // if (!this.answer) {
            //     if (this.type == 'multiple') {
            //         this.answer = [];
            //     }else{
            //         this.answer = '';
            //     }
            //     return false;
            // }

            // if (this.type == 'multiple') {

            //     return this.answer.indexOf(index) !== -1;
            //     // this.active.indexOf(index)
            // } else {
            //     return parseInt(this.answer) == index;
            // }

            switch (this.type) {
                case 'single':
                    return this.active === index;
                    break;
                case 'multiple':
                case 'indefinite':
                    return this.active && this.active.indexOf(index) !== -1;
                case 'judge':
                    return this.active === index;
                    break;
            }
        },
        errorIsActive(index) {

            if (typeof this.errorAnswer == 'object') {
                for (var i in this.errorAnswer) {
                    this.errorAnswer[i] = parseInt(this.errorAnswer[i]);
                }
            }

            switch (this.type) {
                case 'single':
                    return this.errorAnswer === index;
                    break;
                case 'multiple':
                case 'indefinite':
                    return this.errorAnswer && this.errorAnswer.indexOf(index) !== -1;
                case 'judge':
                    return this.errorAnswer === index;
                    break;
            }
        },
        select(index) {

            if (this.onlyRead) {
                return false;
            }
            switch (this.type) {
                case 'single':
                    this.active = index;
                    break;
                case 'multiple':
                case 'indefinite':
                    if (this.active && this.active.indexOf(index) !== -1) {
                        delete this.active[this.active.indexOf(index)]
                        // this.active.splice(this.active.indexOf(index));
                    } else {
                        var active = [];
                        if (this.active) {
                            active = this.active;
                        }
                        active.push(index);
                        this.active = active;
                    }
                    var active = [];
                    for(var i in this.active){
                        if(this.active[i] != null && this.active[i] != undefined){
                            active.push(this.active[i]);
                        }
                    }
                    this.active = active;
                    break;
                case 'judge':
                    this.active = index;
                    break;

                default:
                    break;
            }

            this.$emit('change', this.active);
        },

        onFillblankChange() {
            var result = [];
            for (var i = 0; i < this.fillblankAnswer.length; i++) {
                result[i] = this.fillblankAnswer[i] !== undefined ? this.fillblankAnswer[i] : '';
            }
            this.$emit('change', result);
        },

        onEssayChange() {
            this.emitEssayAnswer();
        },

        onEssayImagesChange(images) {
            this.essayImages = Array.isArray(images) ? images : [];
            this.emitEssayAnswer();
        },

        emitEssayAnswer() {
            this.$emit('change', {
                text: this.essayAnswer,
                images: this.essayImages
            });
        },

        /**
         * 从题干中识别空格数量
         * 支持 ___、(_)、（） 等常见占位符
         * @param {string} question
         * @return {number}
         */
        getBlankCountFromQuestion(question) {
            if (!question) return 0;
            // 去除 HTML 标签
            var text = question.replace(/<[^>]+>/g, '');
            var count = 0;
            // 连续 3 个及以上下划线视为一个空格
            var underlineMatches = text.match(/_{3,}/g);
            if (underlineMatches) {
                count += underlineMatches.length;
            }
            // 小括号/全角小括号内为空或仅下划线
            var bracketMatches = text.match(/\(\s*_?\s*\)/g);
            if (bracketMatches) {
                count += bracketMatches.length;
            }
            var fullBracketMatches = text.match(/（\s*_?\s*）/g);
            if (fullBracketMatches) {
                count += fullBracketMatches.length;
            }
            return count;
        }
    },
    created() {

    },
    mounted() {
        that = this;
        this.show = this.visible;
        this.initActive();
    }
}

</script>
<style>
.option-single-item {
    background-color: #F7F8FA;
    margin: 8px 0;
    padding: 10px;
    font-size: 14px;
    border-radius: 5px;
    color: #4E5969;

    display: flex;
    align-items: center;
    border: 1px solid #fff;
}

.option-single-no {
    margin-right: 8px;
    /* padding-right: 10px; */

    font-weight: 600;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    line-height: 26px;
    text-align: center;

    flex: 0 0 auto;

    /* border-right: 1px solid #E5E6EB; */
}

.option-single-val {

    padding-left: 5px;
}

.option-single-item.success_answer {

    background-color: #E8F3FF!important;
    border: 1px solid #4080FF!important;
}

.option-single-item.error_answer {
    background-color: #FFECE8;
    border: 1px solid #F76560;
}

.option-single-item.success_answer .option-single-no {
    background-color: #4080FF!important;
    border-radius: 50%;
    color: #fff;
}

.option-single-item.error_answer .option-single-no {
    background-color: #F76560;
    border-radius: 50%;
    color: #fff;
}

.fillblank-box {
    margin-top: 5px;
}

.fillblank-scroll {
    max-height: 300px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.fillblank-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.fillblank-no {
    flex: 0 0 auto;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #C9CDD4;
    color: #fff;
    font-size: 13px;
    line-height: 24px;
    text-align: center;
    margin-right: 10px;
}

.fillblank-input {
    flex: 1;
    height: 40px;
    line-height: 40px;
    padding: 0 12px;
    font-size: 14px;
    color: #1D2129;
    background-color: #F7F8FA;
    border-radius: 5px;
    border: 1px solid #fff;
}

.fillblank-input.is-disabled {
    background-color: #F2F3F5;
    color: #86909C;
}

.essay-box {
    margin-top: 5px;
}

.essay-textarea {
    width: 100%;
    min-height: 120px;
    padding: 10px;
    font-size: 14px;
    color: #1D2129;
    background-color: #F7F8FA;
    border-radius: 5px;
    border: 1px solid #fff;
    box-sizing: border-box;
}

.essay-textarea.is-disabled {
    background-color: #F2F3F5;
    color: #86909C;
}

.essay-tools {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
    margin-top: 10px;
    min-height: 36px;
    height: auto;
}

.essay-upload-count {
    width: 100%;
    font-size: 12px;
    color: #86909C;
    margin-bottom: 6px;
}

.essay-tool {
    margin-right: 12px;
    margin-bottom: 8px;
    width: 100%;
}

.essay-tool .u-upload {
    justify-content: flex-start !important;
}

.essay-tool .u-upload__wrap {
    justify-content: flex-start !important;
    flex-wrap: wrap;
}

.essay-tool .u-upload__button,
.essay-tool .u-upload__wrap__preview {
    margin: 0 8px 8px 0 !important;
}

/* ---------- 刷题本做题页选项（variant=report）---------- */
/* 作答态与解析态同一行距（2026-11-22 用户点名：做完题转解析后间距不能再变）：
   行距只在本节落一次，解析态不许收窄；同日用户点名「选项行距与字号偏大」，
   行内上下留白收到 14px、选项正文 18→16px（选项牌仍 40） */
.oq-item {
    display: flex;
    align-items: center;
    padding: 14px 0;
}

.oq-no {
    flex: 0 0 auto;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #E5E6EB;
    background: #fff;
    color: #4E5969;
    font-size: 16px;
    line-height: 1;
}

.oq-no--circle {
    border-radius: 50%;
}

.oq-no--square {
    border-radius: 8px;
}

.oq-val {
    flex: 1 1 0;
    min-width: 0;
    font-size: 16px;
    line-height: 24px;
    color: #1D2129;
}

.oq-list--scored .oq-no {
    color: #4E5969;
}

/* 作答态统一取浅灰并覆盖上面的试卷档 */
.oq-list--edit .oq-no {
    color: #999;
}

/* 单选 / 判断：选中的那枚整颗填色，字母反白 */
.oq-no--circle.is-right {
    background: #00B42A;
    border-color: #00B42A;
    color: #fff;
}

.oq-no--circle.is-wrong {
    background: #F53F3F;
    border-color: #F53F3F;
    color: #fff;
}

/* 多选 / 不定项：正确项绿描边绿字，错误项红描边红字 */
.oq-no--square.is-right {
    border-color: #00B42A;
    color: #00B42A;
}

.oq-no--square.is-wrong {
    border-color: #F53F3F;
    color: #F53F3F;
}

/* 作答态（未判）：选中的那一枚走主色，别提前读成「正确」 */
.oq-no--circle.is-picked {
    background: #0968F6;
    border-color: #0968F6;
    color: #fff;
}

.oq-no--square.is-picked {
    background: #0968F6;
    border-color: #0968F6;
    color: #fff;
}

/* 填空：底部一张上掀的白色输入面板（顶部中央一枚下三角抓手） */
.oq-fill {
    position: relative;
    margin: 16px -8px -24px;
    padding: 16px 15px 20px;
    background: #fff;
    border-radius: 8px 8px 0 0;
}

.oq-fill-tab {
    position: absolute;
    top: -15px;
    left: 50%;
    margin-left: -25px;
    width: 50px;
    height: 15px;
    background: #fff;
    border-radius: 8px 8px 0 0;
}

.oq-fill-arrow {
    position: absolute;
    top: 4px;
    left: 50%;
    margin-left: -7px;
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 7px solid #C9CDD4;
    transition: transform .2s;
}

/* 已折叠：三角翻向朝上，面板收成一条抓手 */
.oq-fill-arrow.is-up {
    transform: rotate(180deg);
}

.oq-fill.is-collapsed {
    padding-top: 8px;
    padding-bottom: 16px;
}

.oq-fill-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.oq-fill-row:last-child {
    margin-bottom: 0;
}

/* 解析态：答错的空红底叉、答对的空绿底勾 */
.oq-fill-mark {
    flex: 0 0 auto;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.oq-fill-mark.is-wrong {
    background: #F53F3F;
}

.oq-fill-mark.is-right {
    background: #00B42A;
}

/* 作答态：圆钮里是空的序号 */
.oq-fill-no {
    flex: 0 0 auto;
    width: 20px;
    height: 20px;
    margin-right: 10px;
    border-radius: 50%;
    background: #B2B2B2;
    color: #fff;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
}

.oq-fill-input {
    flex: 1 1 0;
    min-width: 0;
    height: 44px;
    line-height: 44px;
    padding: 0 12px;
    box-sizing: border-box;
    font-size: 15px;
    color: #1D2129;
    background: #fff;
    border: 1px solid #E5E6EB;
    border-radius: 8px;
}

.oq-fill-input.is-disabled {
    background: #fff;
    color: #1D2129;
}

.oq-fill-ph {
    color: #B2B2B2;
}

/* 问答：大输入框 + 左下角一枚插图入口 */
.oq-essay-input {
    width: 100%;
    min-height: 240px;
    padding: 14px;
    box-sizing: border-box;
    font-size: 15px;
    line-height: 1.6;
    color: #1D2129;
    background: #fff;
    border: 1px solid #E5E6EB;
    border-radius: 8px;
}

.oq-essay-tools {
    display: flex;
    align-items: center;
    margin-top: 14px;
}

.oq-essay-upload-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
