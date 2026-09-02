<template>
	<div class="container">
		<tz-box padding="0">
			<u-cell-group :border="false">
				<u-cell :border="false" title="提现账户" :value="bank ? bank.name : '添加银行卡'" @click="$nav.to('/pages/app/agent/wallet/bank/bank')">
					<template #right-icon>
						<tz-icon name="enter" color="#86909C" :size="13" />
					</template>
				</u-cell>
			</u-cell-group>
		</tz-box>


		<tz-divider bgColor="none" />
		<tz-box>
			<div class="withdraw-tip">提现金额</div>
			<div class="withdraw-input">
				<u-input placeholder="请输入提现金额" :font-size="20" border="bottom" type="number" v-model="form.money" clearable>
					<span class="withdraw-unit" slot="prefix">¥</span>
				</u-input>
			</div>
			<div class="withdraw-banalce-tip">
				可提现金额 <span class="bold">{{ member.money }}</span> 元。<span class="all" @click="all">全部提现</span>
			</div>
			<div class="withdraw-btn">
				<u-button :text="config.withdraw_status == '2' ? '提现暂时关闭' : '提现'" type="primary" @click="submit" :disabled="config.withdraw_status == '2'"></u-button>
			</div>
		</tz-box>

		<tz-box bgColor="none">
			<span class="tips">
				{{ config.withdraw_tips }}
			</span>
		</tz-box>


		<tz-footer/>
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
