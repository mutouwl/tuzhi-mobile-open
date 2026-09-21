<template>
    <div class="option-single-box">
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
</style>
