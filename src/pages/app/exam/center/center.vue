<template>
	<div class="container">

		<tz-box padding="0px 15px" v-if="list.length > 0">
			<div class="exam-box">
				<div class="exam-item" v-for="(item,index) in list">
					<div class="exam-item-info">
						<div class="exam-item-info-title one-line-hidden">
							{{ item.exercises.name }}
						</div>
						<div class="exam-item-info-step">
							<div class="progress-prop">{{ item.complete_prop }}%</div>
							<div class="progress-val">共{{item.complete_question_count}}/{{ item.question_count }}道</div>
							<!-- <div class="progress-prop"><u-rate :count="3" :value="item.degree" :size="14" :readonly="true"></u-rate></div> -->
						</div>
					</div>
					<div class="exam-item-start">
						<u-button type="primary" @click="checkExercisesId = item.exercises_id;modal.exercisesControl = true;" size="small" text="开始" ></u-button>
					</div>
				</div>
			</div>

			
		</tz-box>

		<u-empty icon="/static/image/empty.png" width="70" height="70" v-else text="暂无可用练习"/>


		<exercises-control-modal :exercises-id="checkExercisesId" @close="modal.exercisesControl = false" :visible="modal.exercisesControl"/>

		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
