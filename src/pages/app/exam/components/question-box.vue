<template>
    <div :class="{ 'question-box-fillblank': edit && type == 'fillblank' }">
        <tz-box bgColor="none" class="question-box-main">
            <div class="question-type">
                <span>{{ $t(type) }}<span v-if="score > 0">({{score}}分)</span></span>
                <span v-if="!edit && questionResultText" :class="['question-result', questionResultClass]">{{ questionResultText }}</span>
            </div>
            <div class="question-content">
                <tz-parse :content="question" />
            </div>
            <div class="question-option" v-if="(type !== 'fillblank' && type !== 'essay') || edit">
                <option-click :only-read="!edit" :type="type"
                :error-answer="errorAnswerComputed"
                :option="option"
                :question="question"
                :blank_count="type == 'fillblank' && Array.isArray(answer) ? answer.length : 0"
                :answer="optionClickAnswer"
                @change="changeOption" />
            </div>
        </tz-box>

        <template v-if="!edit">

            <tz-title title="解析" size="small" :more="false" v-if="analysis && analysis.trim() && analysis != '<p><br></p>'"/>
            <tz-box bgColor="none" padding="0 15px 15px">
                <div class="answer-box">
                    <div class="answer-val-box">
                        <!-- 单选/多选/判断/不定项选择 -->
                        <template v-if="['single','multiple','judge','indefinite'].indexOf(type) !== -1">
                            <div class="answer-row" v-if="answer !== ''">
                                <span class="answer-system">正确答案
                                    <span class="answer-val answer-true">
                                        {{ parseAnswer(answer) }}
                                    </span>
                                </span>
                            </div>
                            <div class="answer-row" v-if="user_answer !== ''">
                                <span class="answer-user">我的答案
                                    <span :class="[
                          'answer-val',
                          {
                            'answer-false':
                              parseAnswer(answer) != parseAnswer(user_answer) && answer !== '',
                            'answer-true':
                              parseAnswer(answer) == parseAnswer(user_answer),
                          },
                        ]">
                                        {{ parseAnswer(user_answer) }}</span></span>
                            </div>
                            <div class="answer-essay-score" v-if="type == 'indefinite' && user_score !== '' && user_score !== null && user_score !== undefined">
                                <span class="answer-essay-score-label">得分</span>
                                <span class="answer-essay-score-text">{{ user_score }}分</span>
                            </div>
                        </template>

                        <!-- 填空题 -->
                        <template v-if="type == 'fillblank'">
                            <div class="answer-blank-item" v-for="(blank, index) in fillblankAnswerList" :key="index">
                                <div class="answer-blank-title">
                                    <span class="answer-blank-no">{{ index + 1 }}</span>
                                </div>
                                <div class="answer-blank-row">
                                    <div class="answer-row">
                                        <span class="answer-system">正确答案
                                            <span class="answer-val answer-true">{{ blank.right }}</span>
                                        </span>
                                    </div>
                                    <div class="answer-row">
                                        <span class="answer-user">我的答案
                                            <span :class="['answer-val', blank.isCorrect ? 'answer-true' : 'answer-false']">
                                                {{ blank.user !== '' ? blank.user : '未作答' }}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="answer-essay-score" v-if="user_score !== '' && user_score !== null && user_score !== undefined">
                                <span class="answer-essay-score-label">得分</span>
                                <span class="answer-essay-score-text">{{ user_score }}分</span>
                            </div>
                        </template>

                        <!-- 问答题 -->
                        <template v-if="type == 'essay'">
                            <div class="answer-essay-box">
                                <div class="answer-essay-item" v-if="answerSystemText !== '' || answerSystemImages.length > 0">
                                    <div class="answer-essay-title answer-system">参考答案</div>
                                    <div class="answer-essay-content" v-if="answerSystemText !== ''"><tz-parse :content="answerSystemText" /></div>
                                    <div class="answer-essay-images" v-if="answerSystemImages.length > 0">
                                        <image v-for="(img, idx) in answerSystemImages" :key="idx" :src="img" mode="widthFix" @click="previewImage(img, answerSystemImages)" />
                                    </div>
                                </div>
                                <div class="answer-essay-item">
                                    <div class="answer-essay-title answer-user">
                                        我的答案
                                    </div>
                                    <div class="answer-essay-content" v-if="userAnswerText !== '' || userAnswerImages.length > 0">
                                        <tz-parse :content="userAnswerText" />
                                        <div class="answer-essay-images" v-if="userAnswerImages.length > 0">
                                            <image v-for="(img, idx) in userAnswerImages" :key="idx" :src="img" mode="widthFix" @click="previewImage(img, userAnswerImages)" />
                                        </div>
                                    </div>
                                    <div class="answer-essay-content answer-essay-empty" v-else>未作答</div>
                                    <div class="answer-essay-comment" v-if="grade_comment">
                                        <span class="answer-essay-comment-label">评语</span>
                                        <span class="answer-essay-comment-text">{{ grade_comment }}</span>
                                    </div>
                                    <div class="answer-essay-score" v-if="user_score !== '' && user_score !== null && user_score !== undefined">
                                        <span class="answer-essay-score-label">得分</span>
                                        <span class="answer-essay-score-text">{{ user_score }}分</span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                    <div class="analysis" v-if="analysis && analysis.trim() && analysis != '<p><br></p>'">
                        <tz-parse :content="analysis" />
                    </div>
                </div>
            </tz-box>
        </template>
    </div>
</template>

<script>
    import optionClick from "@/pages/app/exam/components/option/click.vue";
    var that;
    export default {
        components: { optionClick },
        data() {
            return {

            }
        },
        props: {
            edit: {
                type: [Boolean, Number],
                default: false
            },
            user_answer: {
                type: [String, Number, Array, Object],
                default: ''
            },
            score: {
                type: [String, Number],
                default: ''
            },
            option: {
                type: [Array, Object],
                default: () => {
                    return [];
                }
            },
            analysis: {
                type: [String, Number],
                default: ''
            },
            answer: {
                type: [String, Number, Array, Object],
                default: ''
            },
            question: {
                type: [String, Number],
                default: ''
            },
            type: {
                type: String,
                default: ''
            },
            grade_status_text: {
                type: String,
                default: ''
            },
            grade_comment: {
                type: String,
                default: ''
            },
            user_score: {
                type: [String, Number],
                default: ''
            },
            is_correct: {
                type: [String, Number],
                default: null
            }
        },
        computed: {
            questionResultText() {
                if (this.edit) {
                    return '';
                }
                if (this.type == 'essay' || this.type == 'indefinite') {
                    var score = parseFloat(this.score) || 0;
                    var userScore = this.user_score;
                    if (userScore !== '' && userScore !== null && userScore !== undefined) {
                        userScore = parseFloat(userScore) || 0;
                        if (score > 0 && userScore == score) {
                            return '正确';
                        }
                        if (userScore == 0) {
                            return '错误';
                        }
                        if (userScore > 0 && userScore < score) {
                            return '得分';
                        }
                    }
                    if (this.grade_status_text) {
                        return this.grade_status_text;
                    }
                    return '';
                }
                if (this.is_correct == 1) {
                    return '正确';
                }
                if (this.is_correct == 0) {
                    return '错误';
                }
                return '';
            },
            questionResultClass() {
                var text = this.questionResultText;
                if (text == '正确') {
                    return 'question-result-true';
                }
                if (text == '错误') {
                    return 'question-result-false';
                }
                return 'question-result-pending';
            },
            optionClickAnswer() {
                if (this.edit) {
                    return this.user_answer !== false ? this.user_answer : [];
                }
                // 结果解析模式下，选择题展示正确答案用于高亮；填空/问答展示学员答案
                if (['fillblank', 'essay'].indexOf(this.type) !== -1) {
                    return this.user_answer !== false ? this.user_answer : [];
                }
                return this.answer !== '' ? this.answer : [];
            },
            errorAnswerComputed() {
                if (this.edit || this.answer === '') {
                    return [];
                }
                if (['single', 'multiple', 'judge', 'indefinite'].indexOf(this.type) !== -1) {
                    return this.parseAnswer(this.answer) != this.parseAnswer(this.user_answer) ? this.user_answer : [];
                }
                // 填空/问答在解析区展示对错，不在选项组件标记
                return [];
            },
            fillblankAnswerList() {
                var right = Array.isArray(this.answer) ? this.answer : [];
                var user = Array.isArray(this.user_answer) ? this.user_answer : [];
                var list = [];
                for (var i = 0; i < Math.max(right.length, user.length); i++) {
                    var rightBlank = right[i] || [];
                    var userBlank = user[i] !== undefined ? user[i] : '';
                    var isCorrect = false;
                    if (Array.isArray(rightBlank) && rightBlank.length > 0) {
                        for (var j = 0; j < rightBlank.length; j++) {
                            if (String(rightBlank[j]).trim().toLowerCase() === String(userBlank).trim().toLowerCase()) {
                                isCorrect = true;
                                break;
                            }
                        }
                    }
                    list.push({
                        right: Array.isArray(rightBlank) && rightBlank.length > 0 ? rightBlank.join(' / ') : '-',
                        user: userBlank,
                        isCorrect: isCorrect
                    });
                }
                return list;
            },
            answerSystemText() {
                return this.parseEssayText(this.answer);
            },
            answerSystemImages() {
                return this.parseEssayImages(this.answer);
            },
            userAnswerText() {
                return this.parseEssayText(this.user_answer);
            },
            userAnswerImages() {
                return this.parseEssayImages(this.user_answer);
            }
        },
        watch: {
            visible() {
                this.show = this.visible;
            }
        },
        methods: {
            /**
             * 解析答案
             * 将序号变为字母
             * @param {*} val
             */
            parseAnswer(val) {
                if (val === '' || val === undefined || val === null) {
                    return '';
                }
                if (typeof val == "object") {
                    // 不定项/多选：选项索引数组
                    if (['multiple', 'indefinite'].indexOf(this.type) !== -1) {
                        var abc = [];
                        for (var i in val) {
                            abc.push(String.fromCharCode(65 + parseInt(val[i])));
                        }
                        return abc.join(" ");
                    }
                    // 填空题：字符串数组
                    if (Array.isArray(val)) {
                        return val.join(" / ");
                    }
                    return '';
                } else {
                    return String.fromCharCode(65 + parseInt(val));
                }
            },

            changeOption(option) {
                this.$emit('changeoption', option);
            },
            open() {
                this.$emit('open', false);
            },
            actionSelect(option) {
                this.$emit('close', false);

            },
            parseEssayText(val) {
                if (val && typeof val == 'object' && !Array.isArray(val)) {
                    return val.text || '';
                }
                return typeof val == 'string' ? val : '';
            },
            parseEssayImages(val) {
                if (val && typeof val == 'object' && !Array.isArray(val)) {
                    return Array.isArray(val.images) ? val.images : [];
                }
                return [];
            },
            previewImage(current, urls) {
                uni.previewImage({
                    current: current,
                    urls: urls
                });
            }
        },
        created() {

        },
        mounted() {
            that = this;
        }
    }

</script>

<style>
    .question-type {
        border-left: 3px solid #0968f6;
        font-size: 12px;
        padding-left: 4px;
        height: 14px;
        line-height: 14px;
        color: #4E5969;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .question-result {
        font-size: 12px;
        line-height: 14px;
    }

    .question-result-true {
        color: #00B42A;
    }

    .question-result-false {
        color: #F53F3F;
    }

    .question-result-pending {
        color: #FF7D00;
    }

    .show-analysis {
        color: #0968f6;
    }

    .question-content {
        font-size: 14px;
        margin-top: 10px;
        color: #1D2129;
    }

    .question-option {
        margin-top: 15px;

    }

    .question-box-fillblank {
        display: flex;
        flex-direction: column;
        min-height: 100%;
    }

    .question-box-fillblank .question-box-main {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .question-box-fillblank .question-option {
        margin-top: auto;
        padding-bottom: 10px;
    }


    .answer-val-box {
        font-size: 14px;
        color: #1D2129;
        font-weight: 500;
        color: #000;
    }

    .answer-row {
        display: block;
        margin-bottom: 8px;
    }

    .answer-val {
        margin-left: 4px;
    }

    .answer-val.answer-true {
        color: #00B42A;
    }

    .answer-val.answer-false {
        color: #F53F3F;
    }

    .answer-system {
        margin-right: 30px;
        color: #00B42A;
    }

    .analysis {
        font-size: 12px;
        color: #4E5969;
        margin-top: 5px;
    }

    .answer-blank-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;
    }

    .answer-blank-title {
        flex-shrink: 0;
        font-size: 13px;
        color: #4E5969;
        margin-right: 10px;
        margin-top: 2px;
    }

    .answer-blank-no {
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #C9CDD4;
        color: #fff;
        font-size: 12px;
        line-height: 20px;
        text-align: center;
    }

    .answer-blank-row {
        flex: 1;
        display: block;
    }

    .answer-blank-row .answer-system {
        margin-right: 0;
    }

    .answer-essay-box {
        margin-top: 5px;
    }

    .answer-essay-item {
        margin-bottom: 12px;
    }

    .answer-essay-title {
        font-size: 13px;
        color: #4E5969;
        margin-bottom: 5px;
    }

    .answer-essay-status {
        margin-left: 8px;
        padding: 1px 6px;
        font-size: 12px;
        color: #FF7D00;
        background-color: #FFF7E8;
        border-radius: 3px;
    }

    .answer-essay-content {
        font-size: 14px;
        color: #1D2129;
        line-height: 1.6;
        word-break: break-all;
    }

    .answer-essay-empty {
        color: #86909C;
    }

    .answer-essay-images {
        display: flex;
        flex-wrap: wrap;
        margin-top: 8px;
    }

    .answer-essay-images image {
        width: 80px;
        height: 80px;
        margin-right: 8px;
        margin-bottom: 8px;
        border-radius: 5px;
        background-color: #F7F8FA;
    }

    .answer-essay-comment {
        margin-top: 8px;
        padding: 8px 12px;
        background-color: #FFF7E8;
        border-radius: 5px;
        font-size: 13px;
        line-height: 1.5;
    }

    .answer-essay-comment-label {
        color: #FF7D00;
        font-weight: 500;
        margin-right: 8px;
    }

    .answer-essay-comment-text {
        color: #4E5969;
    }

    .answer-essay-score {
        margin-top: 8px;
        padding: 8px 12px;
        background-color: #F2F3F5;
        border-radius: 5px;
        font-size: 13px;
        line-height: 1.5;
    }

    .answer-essay-score-label {
        color: #0968F6;
        font-weight: 500;
        margin-right: 8px;
    }

    .answer-essay-score-text {
        color: #1D2129;
    }
</style>
