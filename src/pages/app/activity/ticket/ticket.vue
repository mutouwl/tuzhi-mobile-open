<template>
	<div class="container">
		<!-- 首屏骨架（2026-10-31 用户点名「改为骨架屏加载」）：外壳走真实 `.ticket-item` 那一档
		     （宽 90% / 白卡 / 10px 内衬），灰块只替换会变的那四格（票种名 / 步进器 / 单价 / 余量），
		     静态文案一个不放；底栏与空态在取数落地前不摆（合计 0.00 会被读成这一单是 0 元）。
		     三路取数（详情 / 票券 / 拼团活动）都落地才撤骨架，见 js 的 `loading` 判据 -->
		<view class="ticker-list" v-if="loading">
			<view class="ticket-item" v-for="n in 3" :key="'sk' + n">
				<view class="ticket-item-header">
					<view class="tk-sk tk-sk-name"></view>
					<view class="tk-sk tk-sk-step"></view>
				</view>
				<view class="ticket-item-body">
					<view class="tk-sk tk-sk-price"></view>
					<view class="tk-sk tk-sk-num"></view>
				</view>
			</view>
		</view>

		<template v-else>
			<div class="ticker-list" v-if="ticketList.length > 0">
				<div class="ticket-item" v-for="(item, index) in ticketList">
					<div class="ticket-item-header">
						<div class="ticket-item-name">
							{{item.name}}
						</div>
						<div class="ticket-item-control">
							<u-number-box @change="numberChange" :min="0" :integer="true" :max="item.can_buy" :name="item.id"></u-number-box>
						</div>
					</div>
					<div class="ticket-item-body">
						<!-- 单价：拼团那一趟取活动的拼团价（`group_buy.activity.detail` 的 specs/ladder，
						     阶梯型按 URL 上那一档），普通报名链仍取票券原价；划线原价取活动快照
						     `origin_price`（商家改过票券价时以活动为准），同价不摆假的优惠 -->
						<view class="ticket-price-box">
							<span class="ticket-price" :style="gbPriceStyle">
								<!-- 积分兑换（2026-11-08）：兑换口径下每一张票按「积分」计价，不许画现金价
								     （后端下单同样按 `score * count` 累加，见 `OrderCreate`） -->
								<template v-if="isScoreExchange">
									<span class="ticket-price-value">{{ scoreExchangeScore }}</span><span class="ticket-coin-name">积分</span>
								</template>
								<template v-else-if="isVirtualPay(detail)">
									<span class="ticket-price-value">{{ ticketUnitText(item) }}</span><span class="ticket-coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
								</template>
								<template v-else>
									<span class="ticket-price-unit">¥</span><span class="ticket-price-value">{{ ticketUnitText(item) }}</span>
								</template>
							</span>
							<!-- 划线原价只在人民币档出：兑换/虚拟支付那一档与售价不是同一套单位 -->
							<span class="ticket-origin" v-if="ticketOrigin(item) && !isVirtualPay(detail) && !isScoreExchange">¥{{ ticketOrigin(item) }}</span>
						</view>
						<span class="ticket-num">{{item.inventory ? '剩余'+item.can_buy+'张' : ''}} <span style="margin-left: 10px;"> {{ item.limit_buy ? '可购'+item.can_buy+'张' :'不限购' }}</span></span>
					</div>
				</div>

			</div>
			<!-- 空态文案：积分商品不可兑 / 勾过的票种一档不剩时给后端那一句原因，
			     不再一律写「暂无可购票券」（那一句会把「配置失效」读成「活动没票」） -->
			<u-empty v-else icon="/static/image/empty.png" width="70" height="70" :text="loadMsg || '暂无可购票券'"/>

			<view class="box control-box h5-bottom-bar">
				<div class="ticket-change">
					<div>
					</div>
					<div class="price" :style="gbPriceStyle">
						<span class="total-text">合计：</span>
						<template v-if="isScoreExchange">
							<span class="price-value">{{ scoreExchangeScore * ticketCount }}</span><span class="coin-name">积分</span>
						</template>
						<template v-else-if="isVirtualPay(detail)">
							<span class="price-value">{{ price.toFixed(2) }}</span><span class="coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
						</template>
						<template v-else>
							<span class="unit">¥</span><span class="price-value">{{ price.toFixed(2) }}</span>
						</template>
					</div>
				</div>

				<div >
					<u-button :disabled="ticketCount == 0" @click="form" :custom-style="{width:'120px'}" style="width:120px" class="custom-style" type="primary" :color="gbBtnColor" :text="'下一步'"></u-button>
				</div>
			</view>
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
