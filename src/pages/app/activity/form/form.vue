<template>
	<div class="container">
		<u-loading-page :loading="loading"></u-loading-page>
		<tz-title title="票务信息" :more="false" size="mini" />
		<tz-box padding="0px 0px 10px">
			<u-cell :border="(checkedTicket.length - 1) != index" :title="item.name" :label="item.number+'张'" center v-for="(item,index) in checkedTicket">
				<template slot="value">
					<div class="ticket-price">
						<template v-if="isVirtualPay(detail)">
							<span class="ticket-price-value">{{ (item.price * item.number).toFixed(2) }}</span><span class="ticket-coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
						</template>
						<template v-else>
							<span class="ticket-price-unit">¥</span><span class="ticket-price-value">{{ (item.price * item.number).toFixed(2) }}</span>
						</template>
					</div>
				</template>
			</u-cell>
		</tz-box>
		<tz-divider />
		<tz-title title="报名信息" :more="false" size="mini" />
		<tz-box padding="0px 0px 10px">
			<u-cell :title="item[0]" :label="item[1]" :border="false" center v-for="(item,index) in applyInfo">
				<template slot="value">
					<span class="form-contro-btn" @click="editApplyInfo(index)">
						<tz-icon color="#4E5969" name="brush" :size="24" />
					</span>
					<span class="form-contro-btn" @click="delApplyInfo(index)">
						<tz-icon color="#F76560" name="empty" :size="24" />
					</span>
				</template>
			</u-cell>

			<!-- <u-button v-if="(detail.apply_info_collet == 1 && total.number > applyInfo.length) || (detail.apply_info_collet != 1 && applyInfo.length<1)" @click="addApplyInfo" style="width: 200px;margin: 0 auto;" plain color="#257AF2" icon="plus-circle"
				text="添加报名信息"></u-button> -->

				<u-button v-if="total.number > applyInfo.length" @click="addApplyInfo" :custom-style="{width:'200px',margin:'0 auto'}" style="width: 200px;margin: 0 auto;" plain color="#257AF2" icon="plus-circle"
				text="添加报名信息"></u-button>
		</tz-box>
		<tz-divider />
		


		<view class="box control-box">
			<div class="ticket-change">
				<div class="price">
					<span class="total-text">合计：</span>
					<template v-if="isVirtualPay(detail)">
						<span class="price-value">{{ total.price.toFixed(2) }}</span><span class="coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
					</template>
					<template v-else>
						<span class="unit">¥</span><span class="price-value">{{ total.price.toFixed(2) }}</span>
					</template>
				</div>
			</div>

			<div>
				<u-button style="width: 200px;" :custom-style="{width:'200px'}" class="custom-style" @click="subscription" type="primary" text="提交订单"></u-button>
			</div>
		</view>


		<form-modal @ok="formHandle" :initdata="applyInfoIndex === '' ? [] : applyInfo[applyInfoIndex]" :field="apply_info_form" @close="modal.form = false" :visible="modal.form" />
		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
