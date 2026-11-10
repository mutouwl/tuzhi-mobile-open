<template>
	<div class="container">
		<tz-loading-page :loading="loading"/>
		<template v-if="data.question_list.length > 0">
			<u-sticky bgColor="#fff" :offsetTop="0">
				<tz-box bgColor="none" padding="10px 15px">
					<div class="work-header-bar">
						<div class="work-step">
							<span class="work-step-now">{{ currentIndex + 1 }}</span>
							<span class="work-step-all">/{{ data.question_list.length }}</span>
						</div>
						<div class="work-time" v-if="pageParams.jobtype == 'test'">
							<template v-if="data.test.test_duration_limit == 1 && data.status == 0">
								<u-count-down v-if="data.test.test_duration_val * 1000 > 0" :time="data.test.test_duration_val * 1000" format="HH:mm:ss" autoStart/>
								<span v-else style="font-size: 14px;color:red">已过考试时长</span>
							</template>
						</u-count-down>
						</div>
						<div class="work-submit">
							<u-button v-if="data.status == 0" type="primary" size="small" text="交卷"
								@click="submitConfirm"></u-button>
						</div>
					</div>
				</tz-box>
			</u-sticky> 
			<swiper class="swiper" @change="changeSwiper" :current="currentIndex" :style="{ height: swiperHeight + 'px' }">
				<template v-for="(item, index) in data.question_list">
					<swiper-item>
						<div class="swiper-item-box">
							<question-box :edit="data.status != 1" :score="item.score" :option="item.option" :type="item.type" :question="item.question" :user_answer="answerList[item.id]" :analysis="item.analysis" :answer="item.answer" @changeoption="changeOption" />

						</div>

					</swiper-item>
				</template>
			</swiper>
		</template>

		<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="data.question_list.length == 0" text="暂无题目" />



		<view class="bottom-btn-box h5-bottom-bar" v-if="data.question_list.length > 0">
			<template>
				<div class="control-btn" @click="delError" v-if="pageParams.type && pageParams.type == 'error'">
					<div><tz-icon name="delete" color="#444" :size="26" /></div>
					<div>移除</div>
				</div>

				<div class="control-btn" @click="modal.answerSheet = true">
					<div><tz-icon name="createtask" color="#444" :size="26" /></div>
					<div>答题卡</div>
				</div>

				<!-- 三枚按钮都不许再写 `display:block`（2026-11-09 用户点名「上一题、下一题及交卷
				     并没有在垂直方向上居中，也没有水平居中」）：inline 的 display 会盖掉 uview
				     `.u-button` 的 `display:flex; align-items:center; justify-content:center`，
				     文字只剩 uni-button 自带的 `text-align:center` + 行盒贴顶，两轴都不居中。
				     宽高交给 `.u-button{width:100%}` 与 `.page-btn>div` 的格子，按钮自己不带 margin -->
				<div class="page-btn">
					<div>
						<u-button :customStyle="{ width: '100%' }" type="default" plain :disabled="currentIndex == 0" @click="changeQuestion('prev')">
							<tz-icon name="return" :size="16" />&nbsp;上一题
						</u-button>
					</div>
					<div v-if="currentIndex < data.question_list.length - 1">
						<u-button :customStyle="{ width: '100%' }" type="primary" @click="changeQuestion('next')">
							下一题 &nbsp;<tz-icon name="enter" :size="16" />
						</u-button>
					</div>
					<div v-else-if="data.status == 0">
						<u-button :customStyle="{ width: '100%' }" type="primary" @click="submitConfirm">
							交卷 &nbsp;<tz-icon name="checkmark" :size="16" />
						</u-button>
					</div>
				</div>

			</template>
		</view>
		<!-- 答题卡 -->
		<answer-sheet-modal @jump="jumpQuestion" :question-list="data.question_list" :answer-list="answerList"
			:visible="modal.answerSheet" @close="modal.answerSheet = false" />

		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
