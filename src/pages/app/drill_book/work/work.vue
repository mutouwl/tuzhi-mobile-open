<template>
	<!-- 做题页通用外壳（与练习 / 考试共用）：版式真源在本页，外壳见 exam/components/question-work-shell.vue -->
	<question-work-shell :loading="skeletonLoading" :questions="workQuestions" :answer-list="answerList"
		:current-index="currentIndex" :empty-text="emptyText"
		:can-submit="!isAnalysis && Number(data.log.status) === 0"
		:back-text="isAnalysis ? '返回结果' : '返回'" :paper="isPaper"
		@change-index="currentIndex = $event" @change-option="changeOption" @submit="submitConfirm"
		@back="backPrev">
		<!-- 试卷（模拟测试）的「已用时」：与考试做题页同一行、同一档（只摆在答题中，解析态 / 已交卷不摆）。
		     试卷没有限时配置可用（试卷库无时长列，关联考试的 test_duration_limit=0），所以走正计时；
		     起点取记录 createtime，与交卷时后端写入的 use_time（now − createtime）同一个来源，
		     顶栏显示的这一串与结果页「总用时」不会出现两个口径。 -->
		<template #header-extra>
			<view class="work-slot-time" v-if="showElapsed">已用时 {{ elapsedText }}</view>
		</template>
		<!-- 收藏 / 标记：练习态与解析态都摆（2026-11-22 用户点名：解析态右上角也要显示）。
		     解析态是只读回看，但标记 / 收藏仍作用于本次题集，两枚照常可用；
		     试卷（模拟测试）做题中仍走考试样式，不摆这两枚。
		     两枚同一图标家族（2026-11-19 用户点名「一个是粗线条，一个是细线条」）：
		     收藏 = collection 空心/实心、标记 = flag 空心/实心，四枚笔画同为 6px，
		     同一字号下单看粗细一致；标记不再拿「圆圈里一个斜体 i」的字符自拼。
		     collection 也是全站「收藏」的既有档（tz-bottom-btn / 课程操作弹层同此） -->
		<template #header-tools>
			<!-- 两枚必须包在同一行容器里：小程序端命名插槽的内容会被编译成一层 `view slot` 包装节点，
			     直接摆两个 view 会被那层块级包装竖着排下来（2026-11-23 用户点名「变成垂直排列」）。
			     横排规则落在 `.work-slot-tools` 上，包装层是块级也不影响里面这一行 -->
			<view class="work-slot-tools" v-if="isAnalysis || !isPaper">
				<view class="work-slot-tool" @click="toggleCollect">
					<tz-icon :name="isCollected ? 'collection_fill' : 'collection'"
						:color="isCollected ? '#0968f6' : '#4e5969'" :size="20" />
				</view>
				<view class="work-slot-tool" @click="toggleMark">
					<tz-icon :name="currentMarked ? 'flag_fill' : 'flag'"
						:color="currentMarked ? '#0968f6' : '#4e5969'" :size="20" />
				</view>
			</view>
		</template>
	</question-work-shell>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
