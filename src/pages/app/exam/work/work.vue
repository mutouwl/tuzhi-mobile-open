<template>
	<!-- 做题页通用外壳（与刷题本共用）：版式真源＝刷题本做题页，外壳见 exam/components/question-work-shell.vue -->
	<question-work-shell :loading="loading" :questions="workQuestions" :answer-list="answerList"
		:current-index="currentIndex" empty-text="暂无题目" :can-submit="Number(data.status) === 0" back-text="返回"
		@change-index="currentIndex = $event" @change-option="changeOption"
		@submit="submitConfirm" @back="backPrev">
		<!-- 考试倒计时（与题号同一行；练习 / 错题本不摆） -->
		<template #header-extra>
			<view class="work-slot-time" v-if="pageParams.jobtype == 'test'">
				<template v-if="data.test && data.test.test_duration_limit == 1 && data.status == 0">
					<u-count-down v-if="data.test.test_duration_val * 1000 > 0"
						:time="data.test.test_duration_val * 1000" format="HH:mm:ss" autoStart />
					<span v-else style="font-size: 14px;color:red">已过考试时长</span>
				</template>
			</view>
		</template>

		<!-- 错题本：底栏多一枚「移除」 -->
		<template #bottom-extra>
			<view class="work-slot-control" @click="delError" v-if="pageParams.type && pageParams.type == 'error'">
				<tz-icon name="delete" color="#444" :size="26" />
				<text class="work-slot-control-text">移除</text>
			</view>
		</template>
	</question-work-shell>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
