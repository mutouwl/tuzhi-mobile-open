<template>
	<div class="container">


		<div class="result-box">
			<div class="result-val">
				<div class="result-name">正确率</div>
				<div><u-count-to :startVal="0" color="#0968f6" :fontSize="40" bold :endVal="data.prop"></u-count-to>%</div>
			</div>
			<u-line-progress activeColor="#0968f6" :percentage="data.prop" :showText="false"></u-line-progress>
		</div>


		<div class="exam-property-box">
			<div class="exam-property-item">
				<div class="exam-property-item-name">题量/次</div>
				<div class=""></div>
				<div class="exam-property-item-value">
					<span>{{ data.question_count }}</span>
					<span class="exam-property-item-unit">题</span>
				</div>
			</div>

			<div class="exam-property-item">
				<div class="exam-property-item-name">答对题数</div>
				<div class=""></div>
				<div class="exam-property-item-value">
					<span>{{ data.result_true_count }}</span>
					<span class="exam-property-item-unit">题</span>
				</div>
			</div>
			<div class="exam-property-item">
				<div class="exam-property-item-name">答错题数</div>
				<div class=""></div>
				<div class="exam-property-item-value">
					<span>{{ data.result_error_count }}</span>
					<span class="exam-property-item-unit">题</span>
				</div>
			</div>

			<div class="exam-property-item">
				<div class="exam-property-item-name">所用时间</div>
				<div class=""></div>
				<div class="exam-property-item-value">
					<span>{{ (data.updatetime - data.createtime) > 0 ? $tools.formatMediaTime(data.updatetime - data.createtime) : 0 }}</span>
					<span class="exam-property-item-unit"></span>
				</div>
			</div>
		</div>

		<tz-box>
			<div class="btn">
				<u-button @click="analysis" type="primary" shape="circle">查看解析</u-button>
			</div>
			<div class="btn">
				<u-button @click="buildWork" type="default" plain shape="circle">继续练习</u-button>
			</div>
			
		</tz-box>

		<template v-if="data.question_list && data.question_list.length > 0">
			<tz-divider />
			<tz-title title="解析" size="small" :more="false" />
			<tz-box padding="0 15px 15px">
				<template v-for="(item, index) in data.question_list">
					<question-box
						:edit="false"
						:score="item.score"
						:option="item.option"
						:type="item.type"
						:analysis="item.analysis"
						:question="item.question"
						:user_answer="data.user_answer ? data.user_answer[item.id] : ''"
						:answer="item.answer"
						@changeoption="changeOption"
					/>
					<tz-divider v-if="index < data.question_list.length - 1" />
				</template>
			</tz-box>
		</template>

		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
