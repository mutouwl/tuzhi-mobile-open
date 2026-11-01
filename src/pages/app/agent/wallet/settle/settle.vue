<template>
	<div class="container">
		<tz-box bgColor="none">
			<!-- 可提现金额随接口回填：到手前这一格按真实版式占好位置再盖骨架块，不摆一枚空的「¥ 」（M16）；
			     提现按钮与下方两个入口不依赖接口，常驻不动 -->
			<div class="settle-header stl-sk" v-if="loading">
				<div class="settle-icon"><span class="stl-sk-img stl-sk-block"></span></div>
				<div class="settle-tip"><span class="stl-sk-line stl-sk-block sk-w-30"></span></div>
				<div class="settle-balance"><span class="stl-sk-line stl-sk-block sk-w-40"></span></div>
			</div>
			<div class="settle-header" v-else>
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
				<!-- 开启新账本后这一本只出不进，得说一句它是什么，否则看着余额不动像坏了（M41 同一个事实一屏只说一遍） -->
				<div class="settle-note" v-if="settleToBalance">
					佣金已改为结算到下方「账户余额」，这里只留开启前到账的佣金，提现仍由平台人工打款
				</div>
			</div>

			<div class="settle-btn">
				<u-button text="提现" type="primary" @click="$nav.to('/pages/app/agent/wallet/withdraw/withdraw')"></u-button>
			</div>
		</tz-box>

		<!-- 商家开启「结算到用户余额」之后才有这一本：账户余额、待结算收益与到账提示、去余额提现的入口。
		     整块的显隐只吃后端下发的那枚开关，不许前端按「有没有余额」自己判（硬约束 27②/M36）；
		     v-if 才出的整块按 M16 不铺骨架块、也不预留空位 -->
		<div class="settle-cell" v-if="!loading && settleToBalance">
			<tz-box padding="0 0px">
				<u-cell-group :border="false">
					<u-cell :border="true" size="large" title="账户余额" :value="'¥ ' + balance"
						label="佣金到账后并入这里，可用微信零钱、支付宝提现"></u-cell>
					<u-cell :border="true" size="large" title="待结算收益" :value="'¥ ' + waiting"
						:label="waitingTip"></u-cell>
					<u-cell :border="false" size="large" title="去余额提现" @click="$nav.to('/pages/user/balance/index')">
						<template #right-icon>
							<tz-icon name="enter" color="#86909C" :size="13" />
						</template>
					</u-cell>
				</u-cell-group>
			</tz-box>
		</div>

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
