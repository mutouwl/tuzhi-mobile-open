<template>
	<div class="container">

		<tz-box padding="0px 15px" v-if="list.length > 0">

			<div class="order-list">
				<div class="exercises-log" v-for="(item, index) in list">
					<div class="exercises-log-header">
						<div class="exercises-log-count">
							<span class="exercises-log-count-success">{{ item.result_true_count }}</span>/<span class="exercises-log-count-error">{{ item.result_error_count }}</span>/<span class="exercises-log-count-all">{{ item.question_count }}</span>
						</div>
						<div class="analyze" @click="$nav.to('/pages/app/exam/work/work?id=' + item.id, 'local')">
							查看解析
						</div>
					</div>
					<div class="exercises-log-list">
						正确率：<span class="exercises-log-value">{{ item.prop }}%</span>
					</div>
					<div class="exercises-log-list">
						开始时间：<span class="exercises-log-value">{{ $tools.formatDate(item.createtime) }}</span>
					</div>
					<div class="exercises-log-list">
						提交时间：<span class="exercises-log-value">{{ item.updatetime ?  $tools.formatDate(item.updatetime) : '-' }}</span>
					</div>
				</div>
			</div>
		</tz-box>

		<u-empty icon="/static/image/empty.png" width="70" height="70" v-else text="暂无练习记录"/>

		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
