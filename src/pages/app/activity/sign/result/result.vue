<template>
	<div class="container">


		<template v-if="data">
			<div class="icon">
				<img src="/static/image/success.png" alt="">
			</div>
			<div class="tip">
				<div class="title">
					{{ title }}
				</div>

				<div class="subtitle">
					{{ subtitle }}
				</div>
			</div>
			<tz-divider height="20" bgColor="none" />
			<div class="ticket-list">
				<div class="ticket-item">
					<div class="ticket-item-list">
						活动名称: <span>{{ data.activity_name }}</span>
					</div>
					<div class="ticket-item-list">
						票种: <span>{{ data.ticket_name }}</span>
					</div>
					
					<div class="ticket-item-list">
						参加人: <span>{{ data.name }}</span>
					</div>
					<div class="ticket-item-list">
						手机号: <span>{{ data.mobile }}</span>
					</div>
					<div class="ticket-item-list" v-if="data.use_time">
						签到时间: <span>{{ $tools.formatDate(data.use_time) }}</span>
					</div>
				</div>
			</div>

			<tz-box bgColor="none">
				<div class="btn-group">
					<u-button shape="circle" :plain="true" text="查看活动详情"
						@click="$nav.to('/pages/app/activity/detail/detail?id=' + data.activity_id, 'local')"></u-button>
				</div>
			</tz-box>
		</template>


		<u-empty text="未查询到相关票券信息" v-else/>

		<tz-footer />

	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
