<template>
    <div :class="{ 'question-box-fillblank': edit && type == 'fillblank', 'qb-report-fill': isReport && type == 'fillblank' }">
        <!-- 做题页版式（variant=report）：题型徽标 + 无底色选项 + 「答案 / 解析」分节。
             由通用做题外壳 pages/app/exam/components/question-work-shell.vue 统一传（练习 / 考试 / 刷题本三处），
             其余页面（如刷题收藏）不传，走下方原版式 -->
        <template v-if="isReport">
            <div class="qb-report">
                <div class="qb-report-question" :class="{ 'qb-report-question--fill': type == 'fillblank' }">
                    <div class="qb-report-badge">
                        <text>{{ $t(type) }}<text v-if="parseFloat(score) > 0">/{{ score }}分</text></text>
                    </div>
                    <div class="qb-report-question-text">
                        <tz-parse :content="question" />
                    </div>
                    <div class="qb-report-options" v-if="showReportOptions">
                        <option-click variant="report" :only-read="!edit" :type="type"
                            :error-answer="errorAnswerComputed" :option="option" :question="question"
                            :blank_count="type == 'fillblank' && Array.isArray(answer) ? answer.length : 0"
                            :blank_wrong="fillblankWrongList" :scored="parseFloat(score) > 0"
                            :answer="optionClickAnswer" @change="changeOption" />
                    </div>
                </div>

                <template v-if="!edit">
                    <div class="qb-report-sec">
                        <div class="qb-report-head">
                            <image class="qb-report-spark" src="/static/image/drill_book/spark.png" />
                            <text class="qb-report-head-text">{{ answerSectionTitle }}</text>
                        </div>

                        <!-- 单选 / 多选 / 判断 / 不定项 -->
                        <template v-if="isChoiceType">
                            <div class="qb-report-scorebox" v-if="showReportScore">
                                <text class="qb-report-result" :class="reportResultClass">{{ reportResultText }}</text>
                                <text class="qb-report-score" v-if="reportScoreText">{{ reportScoreText }}</text>
                            </div>
                            <div class="qb-report-ansbox qb-report-ansbox--row">
                                <div class="qb-report-ansgroup">
                                    <text class="qb-report-label">正确答案：</text>
                                    <text class="qb-report-val qb-report-val--right">{{ reportRightText }}</text>
                                </div>
                                <div class="qb-report-ansgroup">
                                    <text class="qb-report-label">你的答案：</text>
                                    <text class="qb-report-val" :class="reportUserClass">{{ reportUserText }}</text>
                                </div>
                            </div>
                            <!-- 练习模式（无卷面分）：第二条给逐题正确率，替代试卷的「回答错误 得0分」 -->
                            <div class="qb-report-ansbox qb-report-ansbox--row" v-if="hasAccuracy">
                                <div class="qb-report-ansgroup">
                                    <text class="qb-report-label">个人正确率：</text>
                                    <text class="qb-report-val qb-report-val--rate">{{ personalAccuracyText }}</text>
                                </div>
                                <div class="qb-report-ansgroup">
                                    <text class="qb-report-label">全站正确率：</text>
                                    <text class="qb-report-val qb-report-val--rate">{{ globalAccuracyText }}</text>
                                </div>
                            </div>
                        </template>

                        <!-- 填空：作答回显在题目下方的输入区，这里只列每空的正确答案 -->
                        <template v-if="type == 'fillblank'">
                            <div class="qb-report-scorebox" v-if="showReportScore">
                                <text class="qb-report-result" :class="reportResultClass">{{ reportResultText }}</text>
                                <text class="qb-report-score" v-if="reportScoreText">{{ reportScoreText }}</text>
                            </div>
                            <div class="qb-report-ansbox">
                                <div class="qb-report-blankrow" v-for="(blank, index) in fillblankAnswerList" :key="index">
                                    <text class="qb-report-label">空{{ index + 1 }}：</text>
                                    <text class="qb-report-val qb-report-val--right">{{ blank.right }}</text>
                                </div>
                            </div>
                            <div class="qb-report-ansbox qb-report-ansbox--row" v-if="hasAccuracy">
                                <div class="qb-report-ansgroup">
                                    <text class="qb-report-label">个人正确率：</text>
                                    <text class="qb-report-val qb-report-val--rate">{{ personalAccuracyText }}</text>
                                </div>
                                <div class="qb-report-ansgroup">
                                    <text class="qb-report-label">全站正确率：</text>
                                    <text class="qb-report-val qb-report-val--rate">{{ globalAccuracyText }}</text>
                                </div>
                            </div>
                        </template>

                        <!-- 问答：我的答案 -->
                        <template v-if="type == 'essay'">
                            <div class="qb-report-ansbox">
                                <template v-if="userAnswerText !== '' || userAnswerImages.length > 0">
                                    <div class="qb-report-body"><tz-parse :content="userAnswerText" /></div>
                                    <div class="qb-report-imgs" v-if="userAnswerImages.length > 0">
                                        <image v-for="(img, idx) in userAnswerImages" :key="idx" :src="img"
                                            mode="widthFix" @click="previewImage(img, userAnswerImages)" />
                                    </div>
                                </template>
                                <text class="qb-report-empty" v-else>未作答</text>
                            </div>
                            <!-- 批阅信息：只有考卷解析那一路会传（刷题本做题页不传，不摆这几行） -->
                            <div class="qb-report-ansbox" v-if="grade_status_text">
                                <text class="qb-report-label">批阅状态：</text>
                                <text class="qb-report-val">{{ grade_status_text }}</text>
                            </div>
                            <div class="qb-report-ansbox" v-if="grade_comment">
                                <text class="qb-report-label">评语：</text>
                                <text class="qb-report-val">{{ grade_comment }}</text>
                            </div>
                            <div class="qb-report-ansbox"
                                v-if="user_score !== '' && user_score !== null && user_score !== undefined">
                                <text class="qb-report-label">得分：</text>
                                <text class="qb-report-val qb-report-val--rate">{{ user_score }}分</text>
                            </div>
                        </template>
                    </div>

                    <!-- 问答：参考答案单独成节（参照版式：我的答案 / 参考答案 / 解析 三节并列） -->
                    <template v-if="type == 'essay' && (answerSystemText !== '' || answerSystemImages.length > 0)">
                        <div class="qb-report-sec">
                            <div class="qb-report-head">
                                <image class="qb-report-spark" src="/static/image/drill_book/spark.png" />
                                <text class="qb-report-head-text">参考答案</text>
                            </div>
                            <div class="qb-report-body" v-if="answerSystemText !== ''">
                                <tz-parse :content="answerSystemText" />
                            </div>
                            <div class="qb-report-imgs" v-if="answerSystemImages.length > 0">
                                <image v-for="(img, idx) in answerSystemImages" :key="idx" :src="img"
                                    mode="widthFix" @click="previewImage(img, answerSystemImages)" />
                            </div>
                        </div>
                    </template>

                    <!-- 解析 -->
                    <template v-if="hasAnalysis">
                        <div class="qb-report-sec">
                            <div class="qb-report-head">
                                <image class="qb-report-spark" src="/static/image/drill_book/spark.png" />
                                <text class="qb-report-head-text">解析</text>
                            </div>
                            <div class="qb-report-body"><tz-parse :content="analysis" /></div>
                        </div>
                    </template>
                    <div class="qb-report-foot"></div>
                </template>
            </div>
        </template>

        <template v-else>
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
            },
            // 版式：'' = 练习/考试/测试的既有版式；report = 刷题本做题页的解析版式
            variant: {
                type: String,
                default: ''
            },
            // 逐题判题结果（0 错 / 1 对 / 2 未作答），report 版式据此出「回答错误 得0分」那一行
            result: {
                type: [String, Number],
                default: null
            },
            // 逐题正确率（%，个人 / 全站）：练习模式答案区第二条
            personal_accuracy: {
                type: [String, Number],
                default: null
            },
            global_accuracy: {
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
            },
            /* ------------- report 版式（刷题本做题页） ------------- */
            isReport() {
                return this.variant === 'report';
            },
            isChoiceType() {
                return ['single', 'multiple', 'judge', 'indefinite'].indexOf(this.type) !== -1;
            },
            showReportOptions() {
                if (this.isChoiceType || this.type === 'fillblank') return true;
                // 问答题只在作答态出输入框，解析态由「我的答案 / 参考答案」两节接管
                return !!this.edit;
            },
            hasResult() {
                return this.result !== null && this.result !== undefined && this.result !== '';
            },
            /** 「回答错误 得0分」只属于有卷面分的试卷题；练习模式换成下方的正确率一条 */
            showReportScore() {
                return this.hasResult && parseFloat(this.score) > 0;
            },
            hasAccuracy() {
                return !this.edit
                    && !(parseFloat(this.score) > 0)
                    && this.personal_accuracy !== null && this.personal_accuracy !== undefined
                    && this.personal_accuracy !== '';
            },
            personalAccuracyText() {
                return this.accuracyText(this.personal_accuracy);
            },
            globalAccuracyText() {
                return this.accuracyText(this.global_accuracy);
            },
            reportResultValue() {
                return this.hasResult ? Number(this.result) : null;
            },
            reportResultText() {
                if (!this.hasResult) return '';
                return this.reportResultValue === 1 ? '回答正确' : '回答错误';
            },
            reportResultClass() {
                return this.reportResultValue === 1 ? 'qb-report-right' : 'qb-report-wrong';
            },
            /** 分值只有试卷题才有；目录刷题（score=0）只留对错、不出「得0分」 */
            reportScoreText() {
                var full = parseFloat(this.score);
                if (!this.hasResult || !(full > 0)) return '';
                return '得' + (this.reportResultValue === 1 ? full : 0) + '分';
            },
            answerSectionTitle() {
                return this.type === 'essay' ? '我的答案' : '答案';
            },
            reportRightText() {
                if (this.type === 'judge') {
                    var idx = parseInt(this.answer, 10);
                    return idx === 0 ? '正确' : idx === 1 ? '错误' : '';
                }
                if (this.type === 'multiple' || this.type === 'indefinite') {
                    var arr = Array.isArray(this.answer) ? this.answer : [];
                    return arr.map(function (i) {
                        return String.fromCharCode(65 + parseInt(i));
                    }).join('');
                }
                return this.parseAnswer(this.answer);
            },
            reportUserText() {
                if (this.type === 'judge') {
                    if (this.user_answer === '' || this.user_answer === null || this.user_answer === undefined) return '未作答';
                    var idx = parseInt(this.user_answer, 10);
                    return idx === 0 ? '正确' : idx === 1 ? '错误' : '未作答';
                }
                if (this.type === 'multiple' || this.type === 'indefinite') {
                    var arr = Array.isArray(this.user_answer) ? this.user_answer : [];
                    if (!arr.length) return '未作答';
                    return arr.map(function (i) {
                        return String.fromCharCode(65 + parseInt(i));
                    }).join('');
                }
                var val = this.parseAnswer(this.user_answer);
                return val === '' ? '未作答' : val;
            },
            reportUserClass() {
                return this.reportUserText !== '未作答' && this.reportUserText === this.reportRightText
                    ? 'qb-report-right'
                    : 'qb-report-wrong';
            },
            /** 填空输入区每空的错标（解析态只读回显时用）：与「空N」正确答案逐空对账 */
            fillblankWrongList() {
                return this.fillblankAnswerList.map(function (item) {
                    return !item.isCorrect;
                });
            },
            hasAnalysis() {
                var text = this.analysis === null || this.analysis === undefined ? '' : String(this.analysis).trim();
                return text !== '' && this.analysis != '<p><br></p>';
            }
        },
        watch: {
            visible() {
                this.show = this.visible;
            }
        },
        methods: {
            /**
             * 正确率文案（%）：后端给整数百分比，越界与空值都夹到 0~100
             * @param {*} val
             */
            accuracyText(val) {
                var n = parseInt(val, 10);
                if (isNaN(n)) {
                    n = 0;
                }
                n = Math.max(0, Math.min(100, n));
                return n + '%';
            },
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

    /* ---------- 刷题本做题页版式（variant=report）---------- */
    .qb-report {
        background: #fff;
        padding-bottom: 8px;
    }

    /* 填空题：输入面板压到这一屏底部（题干占满剩余高度），作答态与解析态同一条几何 */
    .question-box-fillblank,
    .qb-report-fill {
        display: flex;
        flex-direction: column;
        min-height: 100%;
    }

    .question-box-fillblank .qb-report,
    .qb-report-fill .qb-report {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-height: 100%;
    }

    .question-box-fillblank .qb-report-question,
    .qb-report-fill .qb-report-question {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
    }

    .question-box-fillblank .qb-report-options,
    .qb-report-fill .qb-report-options {
        margin-top: auto;
    }

    .qb-report-question {
        padding: 10px 15px 24px;
    }

    /* 填空题：题干区与输入面板同为白底（2026-11-22 用户点名：浅灰带与周边不协调） */
    .qb-report-question--fill {
        background: #fff;
    }

    .qb-report-badge {
        display: inline-block;
        /* 填空题的题干区是 flex 列（把输入面板压到底），徽标作为 flex 子项会被拉满整行 ⇒ 钉回内容宽 */
        align-self: flex-start;
        padding: 2px 6px;
        border-radius: 3px;
        background: #EAF3FF;
        color: #0968F6;
        font-size: 12px;
        line-height: 16px;
    }

    .qb-report-question-text {
        margin-top: 16px;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.55;
        color: #1D2129;
    }

    .qb-report-options {
        margin-top: 18px;
    }

    .qb-report-sec {
        padding: 18px 15px 16px;
        background: #fff;
    }

    .qb-report-head {
        display: flex;
        align-items: center;
        margin-bottom: 14px;
    }

    .qb-report-spark {
        width: 18px;
        height: 18px;
        margin-right: 8px;
        flex: 0 0 auto;
    }

    .qb-report-head-text {
        font-size: 18px;
        line-height: 22px;
        font-weight: 600;
        color: #1D2129;
    }

    .qb-report-scorebox {
        display: flex;
        align-items: center;
        padding: 14px 15px;
        border-radius: 8px;
        background: #F5F9FF;
    }

    .qb-report-result {
        font-size: 15px;
        line-height: 22px;
        margin-right: 16px;
    }

    .qb-report-right {
        color: #00B42A;
    }

    .qb-report-wrong {
        color: #F53F3F;
    }

    .qb-report-score {
        font-size: 15px;
        line-height: 22px;
        color: #1D2129;
    }

    .qb-report-ansbox {
        margin-top: 10px;
        padding: 14px 15px;
        border-radius: 8px;
        background: #F5F9FF;
        font-size: 15px;
        line-height: 22px;
    }

    .qb-report-ansbox--row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
    }

    .qb-report-ansgroup {
        display: flex;
        align-items: center;
    }

    .qb-report-ansgroup + .qb-report-ansgroup {
        margin-left: 16px;
    }

    .qb-report-label {
        font-size: 15px;
        line-height: 22px;
        color: #1D2129;
    }

    .qb-report-val {
        font-size: 15px;
        line-height: 22px;
        font-weight: 500;
    }

    .qb-report-val--right {
        color: #00B42A;
    }

    .qb-report-val--rate {
        color: #0968F6;
    }

    .qb-report-blankrow + .qb-report-blankrow {
        margin-top: 10px;
    }

    .qb-report-body {
        font-size: 15px;
        line-height: 1.7;
        color: #1D2129;
    }

    .qb-report-empty {
        font-size: 15px;
        line-height: 22px;
        color: #86909C;
    }

    .qb-report-imgs {
        display: flex;
        flex-wrap: wrap;
        margin-top: 8px;
    }

    .qb-report-imgs image {
        width: 100px;
        height: 100px;
        margin-right: 8px;
        margin-bottom: 8px;
        border-radius: 4px;
        background: #F2F3F5;
    }

    .qb-report-foot {
        height: 20px;
    }
</style>
