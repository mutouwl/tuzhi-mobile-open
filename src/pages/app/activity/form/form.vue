<template>
	<div class="container">
		<!-- 首屏骨架（2026-10-31 用户点名「加载方式调整为骨架屏」）：三段取数（活动详情 / 票券 /
		     报名表单）都落地才撤骨架，见 js 的 `loading` 判据——只按先回来的那一路收口，
		     合计与票券行会先闪一遍半成品（硬约束 22「一个加载态盖住多条腿」）。
		     外壳走真实版式那一档（票务信息 / 报名信息两张标题 + 它们下面那个 tz-box 的 u-cell 行），
		     静态文案照旧是真文字，灰块只替换会变的那几格（票种名 / 张数 / 单价 / 报名信息 /
		     行尾两枚操作图标 / 底栏合计与提交按钮）。「添加报名信息」那枚按钮按张数与已填份数才出，
		     不预留空位。 -->
		<view v-if="loading">
			<tz-title title="票务信息" :more="false" size="mini" />
			<tz-box padding="0px 0px 10px">
				<view class="adform-sk-cell" v-for="n in 2" :key="'sk-ticket' + n">
					<view class="adform-sk-col">
						<view class="adform-sk-block adform-sk-name"></view>
						<view class="adform-sk-block adform-sk-label"></view>
					</view>
					<view class="adform-sk-block adform-sk-price"></view>
				</view>
			</tz-box>
			<tz-divider bgColor="#fafafa" />
			<tz-title title="报名信息" :more="false" size="mini" />
			<tz-box padding="0px 0px 10px">
				<view class="adform-sk-cell" v-for="n in 2" :key="'sk-apply' + n">
					<view class="adform-sk-col">
						<view class="adform-sk-block adform-sk-name"></view>
						<view class="adform-sk-block adform-sk-label"></view>
					</view>
					<view class="adform-sk-icons">
						<view class="adform-sk-block adform-sk-icon"></view>
						<view class="adform-sk-block adform-sk-icon"></view>
					</view>
				</view>
			</tz-box>
			<tz-divider bgColor="#fafafa" />

			<!-- 底栏占位：与真实 .control-box 同位置同尺寸（10px 内衬 + 40px 主按钮），
			     期间不摆「合计 0.00」——会被读成这一单是 0 元 -->
			<view class="box control-box h5-bottom-bar">
				<view class="ticket-change">
					<view class="adform-sk-block adform-sk-total"></view>
				</view>
				<view class="adform-sk-block adform-sk-submit"></view>
			</view>
		</view>

		<template v-else>
			<tz-title title="票务信息" :more="false" size="mini" />
			<tz-box padding="0px 0px 10px">
				<u-cell :border="(checkedTicket.length - 1) != index" :title="item.name" :label="item.number+'张'" center v-for="(item,index) in checkedTicket">
					<template slot="value">
						<!-- 行金额：拼团那一趟按活动的拼团价算（`ticketUnitPrice`），普通报名链仍是票券原价 -->
						<div class="ticket-price" :style="gbPriceStyle">
							<template v-if="isVirtualPay(detail)">
								<span class="ticket-price-value">{{ (ticketUnitPrice(item) * item.number).toFixed(2) }}</span><span class="ticket-coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
							</template>
							<template v-else>
								<span class="ticket-price-unit">¥</span><span class="ticket-price-value">{{ (ticketUnitPrice(item) * item.number).toFixed(2) }}</span>
							</template>
						</div>
					</template>
				</u-cell>
			</tz-box>
			<tz-divider bgColor="#fafafa" />
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

				<u-button v-if="totalNumber > applyInfo.length" @click="addApplyInfo" :color="gbPlainColor" :custom-style="{width:'200px',margin:'0 auto'}" style="width: 200px;margin: 0 auto;" plain icon="plus-circle"
					text="添加报名信息"></u-button>
			</tz-box>
			<tz-divider bgColor="#fafafa" />
			


			<view class="box control-box h5-bottom-bar">
				<div class="ticket-change">
					<div class="price" :style="gbPriceStyle">
						<span class="total-text">合计：</span>
						<template v-if="isVirtualPay(detail)">
							<span class="price-value">{{ totalPrice.toFixed(2) }}</span><span class="coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
						</template>
						<template v-else>
							<span class="unit">¥</span><span class="price-value">{{ totalPrice.toFixed(2) }}</span>
						</template>
					</div>
				</div>

				<div>
					<u-button style="width: 200px;" :custom-style="{width:'200px'}" class="custom-style" @click="subscription" type="primary" :color="gbBtnColor" text="提交订单"></u-button>
				</div>
			</view>
		</template>


		<form-modal @ok="formHandle" :initdata="applyInfoIndex === '' ? [] : applyInfo[applyInfoIndex]" :field="apply_info_form" @close="modal.form = false" :visible="modal.form" :theme="gbPicking ? 'group-buy' : ''" />
		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
