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
