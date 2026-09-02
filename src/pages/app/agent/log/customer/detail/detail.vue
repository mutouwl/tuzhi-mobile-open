<template>
	<view class="container">


		<u-loading-page :loading="loading || !data.user"></u-loading-page>

		<template v-if="data.user && !loading">
			<tz-box bgColor="none">
				<div class="customer-item">
					<div class="customer-item-cover">
						<img :src="data.user.avatar" />
					</div>
					<div class="customer-item-info">
						<div class="customer-item-header">
							<div class="customer-item-name">
								<div>{{ data.user.nickname }}</div>
								<div class="customer-item-list">
									最近下单: {{ data.order.order_last_time ? $tools.formatDate(data.order.order_last_time) :
										'-' }}
								</div>
							</div>
						</div>
					</div>

				</div>

				<div class="total-box">
					<div class="total-item">
						<div class="total-item-name">待结算订单金额(元)</div>
						<div class="total-item-value">
							{{ data.order.price_waiting }}
						</div>
					</div>
					<div class="total-item">
						<div class="total-item-name">待结算订单数</div>
						<div class="total-item-value">
							{{ data.order.order_waiting_count }}
						</div>
					</div>
					<div class="total-item">
						<div class="total-item-name">已结算订单金额(元)</div>
						<div class="total-item-value">
							{{ data.order.price_success }}
						</div>
					</div>
					<div class="total-item">
						<div class="total-item-name">已结算订单数</div>
						<div class="total-item-value">
							{{ data.order.order_success_count }}
						</div>
					</div>
				</div>
				<div class="order-log" @click="$nav.to('/pages/app/agent/log/earnings/log/log?uid=' + data.user_id)">
					订单收益记录 >
				</div>
			</tz-box>


			<tz-box bgColor="none" padding="0 15px 15px">
				<div class="detail-list">
					<div class="detail-item">
						<div class="detail-item-name">绑定时间</div>
						<div class="detail-item-value">{{ $tools.formatDate(data.createtime) }}</div>
					</div>
				</div>
			</tz-box>
		</template>
		<tz-footer />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
