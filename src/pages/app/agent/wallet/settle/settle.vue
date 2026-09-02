<template>
	<div class="container">
		<tz-box bgColor="none">
			<div class="settle-header">
				<div class="settle-icon">
					<img src="@/static/image/app/withdraw.png">
				</div>
				<div class="settle-tip">
					可提现金额
				</div>
				<div class="settle-balance">
					¥ {{ data.money }}
				</div>

				<div class="settle-freeze" v-if="data.money_freeze>0">
					冻结中 ¥ {{ data.money_freeze }}
				</div>
			</div>

			<div class="settle-btn">
				<u-button text="提现" type="primary" @click="$nav.to('/pages/app/agent/wallet/withdraw/withdraw')"></u-button>
			</div>
		</tz-box>

		<div class="settle-cell">
			<tz-box padding="0 0px">
				<u-cell-group :border="false">
					<u-cell :border="true" title="收支明细" @click="$nav.to('/pages/app/agent/wallet/detail/detail')">
						<template #right-icon>
							<tz-icon name="enter" color="#86909C" :size="13" />
						</template>
					</u-cell>
					<u-cell :border="false" title="提现记录" @click="$nav.to('/pages/app/agent/wallet/withdrawlog/withdrawlog')">
						<template #right-icon>
							<tz-icon name="enter" color="#86909C" :size="13" />
						</template>
					</u-cell>
				</u-cell-group>
			</tz-box>
		</div>


		<tz-tab-bar />
		<tz-footer/>
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
