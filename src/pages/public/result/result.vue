<template>
	<div class="container">
		<div class="icon">
			<img src="/static/image/success.png" alt="" />
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

	<tz-box bgColor="none" v-if="!isInIframe">
			<div class="btn-group">
				<div>
					<tz-button text="返回首页" style="width: 100%" long
						@click="$nav.to('/pages/index/index', 'local', 'redirectTo')"></tz-button>
				</div>
				<div>
					<tz-button :text="btnText" style="width: 100%" long @click="
              $nav.to(
                '/pages/order/detail/detail?order_no=' + order_no,
                'local',
                'redirectTo'
              )
            "></tz-button>
				</div>
			</div>

			<template v-if="orderDetail.order_type == 'activity'">
				<div style="margin-top: 20px; width: 100%">
					<tz-button text="查看我的票券" style="margin-top: 20px" long
						@click="$nav.to('/pages/app/activity/user/user', 'local', 'redirectTo')"></tz-button>
				</div>
			</template>

			<template v-if="orderDetail.live_id">
				<div style="margin-top: 20px; width: 100%">
					<tz-button text="返回直播" type="primary" long @click="
              $nav.to(
                '/pages/course/live/live?id=' + orderDetail.live_id,
                'local',
                'redirectTo'
              )
            "></tz-button>
				</div>
			</template>
		</tz-box>

	<template v-if="!isInIframe && orderDetail.order_type != 'activity' && orderDetail.order_type != 'physical'">
			<tz-box style="margin-top: 30px" padding="0 15px 0px" v-if="orderDetail.goodsList.length > 0">
				<course-list :list="orderDetail.goodsList" />
			</tz-box>
		</template>

		<tz-footer />
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
	@import "./css.css";
</style>