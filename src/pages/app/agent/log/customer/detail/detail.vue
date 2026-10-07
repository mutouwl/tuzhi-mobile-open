<template>
	<view class="container">


		<!-- 首屏骨架屏：占位块逐块对齐本页真实版式（45px 头像圆 + 昵称行 + 最近下单 / 四格订单汇总 /
		     收益记录入口 / 绑定时间行），撤掉骨架屏后各块位置不跳（M16） -->
		<tz-box bgColor="none" v-if="loading">
			<div class="cud-sk">
				<div class="customer-item">
					<div class="customer-item-cover cud-sk-block"></div>
					<div class="customer-item-info">
						<div class="customer-item-header">
							<div class="cud-sk-line cud-sk-block sk-h-14 sk-w-35"></div>
							<div class="cud-sk-line cud-sk-block sk-h-12 sk-w-50"></div>
						</div>
					</div>
				</div>
				<div class="total-box">
					<div class="total-item" v-for="i in 4" :key="i">
						<div class="cud-sk-line cud-sk-block sk-h-12 sk-w-75"></div>
						<div class="cud-sk-line cud-sk-block sk-h-16 sk-w-40"></div>
					</div>
				</div>
				<div class="order-log"><span class="cud-sk-line cud-sk-block sk-h-12 sk-w-30"></span></div>
			</div>
		</tz-box>
		<tz-box bgColor="none" padding="0 15px 15px" v-if="loading">
			<div class="cud-sk">
				<div class="detail-list">
					<div class="cud-sk-row">
						<div class="cud-sk-line cud-sk-block sk-h-14 sk-w-25"></div>
						<div class="cud-sk-line cud-sk-block sk-h-14 sk-w-35"></div>
					</div>
				</div>
			</div>
		</tz-box>

		<template v-else>
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
