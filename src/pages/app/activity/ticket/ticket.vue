<template>
	<div class="container">
		<u-loading-page :loading="loading"></u-loading-page>

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
					<span class="ticket-price">
						<template v-if="isVirtualPay(detail)">
							<span class="ticket-price-value">{{item.price}}</span><span class="ticket-coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
						</template>
						<template v-else>
							<span class="ticket-price-unit">¥</span><span class="ticket-price-value">{{item.price}}</span>
						</template>
					</span>
					<span class="ticket-num">{{item.inventory ? '剩余'+item.can_buy+'张' : ''}} <span style="margin-left: 10px;"> {{ item.limit_buy ? '可购'+item.can_buy+'张' :'不限购' }}</span></span>
				</div>
			</div>

		</div>
		<u-empty v-else icon="/static/image/empty.png" width="70" height="70" text="暂无可购票券"/>

		<view class="box control-box">
			<div class="ticket-change">
				<div>
				</div>
				<div class="price">
					<span class="total-text">合计：</span>
					<template v-if="isVirtualPay(detail)">
						<span class="price-value">{{ price.toFixed(2) }}</span><span class="coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
					</template>
					<template v-else>
						<span class="unit">¥</span><span class="price-value">{{ price.toFixed(2) }}</span>
					</template>
				</div>
			</div>

			<div >
				<u-button :disabled="ticketCount == 0" @click="form" :custom-style="{width:'120px'}" style="width:120px" class="custom-style" type="primary" :text="'下一步'"></u-button>
			</div>
		</view>

		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
