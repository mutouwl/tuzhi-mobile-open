<template>
	<div class="container">

		<tz-box padding="0px 15px" v-if="list.length > 0">

			<div class="order-list">
				<div class="test-log" v-for="(item, index) in list" @click="$nav.to('/pages/app/test/result/result?id=' + item.id, 'local')">
					<div class="test-log-header">
						<div class="test-log-name">
							{{ item.test.name }}
						</div>
						<div :class="[{ok:item.status == 1,no:item.status != 1}]">
							{{ item.status == 1 ? '已交卷' : '未交卷' }}
						</div>
					</div>
					<div class="test-log-list">
						正确率：<span class="test-log-value">{{ item.accuracy }}%</span>
					</div>
					<div class="test-log-list">
						得分：<span class="test-log-value">{{ item.user_score }}</span>
					</div>
					<div class="test-log-list">
						开始时间：<span class="test-log-value">{{ $tools.formatDate(item.createtime) }}</span>
					</div>
					<div class="test-log-list">
						提交时间：<span class="test-log-value">{{ item.submittime ?  $tools.formatDate(item.submittime) : '-' }}</span>
					</div>
				</div>
			</div>
		</tz-box>

		<u-empty icon="/static/image/empty.png" width="70" height="70" v-else text="暂无考试记录"/>

		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
