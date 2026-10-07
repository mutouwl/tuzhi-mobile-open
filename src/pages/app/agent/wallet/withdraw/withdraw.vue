<template>
	<div class="container">
		<!-- 首屏骨架屏：提现账户、可提现金额与说明文字都来自接口，未到手前整块按真实版式占位——
		     既不摆一枚空的「可提现金额 元」，也不给一张能把已存金额漏掉的空表单（M16）；
		     占位条与真实行共用容器类（.withdraw-tip / .withdraw-banalce-tip / .withdraw-btn 的留白由它们给） -->
		<div class="wtd-sk" v-if="loading">
			<tz-box padding="0">
				<div class="wtd-sk-cell">
					<span class="wtd-sk-line wtd-sk-block sk-w-25"></span>
					<span class="wtd-sk-line wtd-sk-block sk-w-30"></span>
				</div>
			</tz-box>
			<tz-divider bgColor="none" />
			<tz-box>
				<div class="withdraw-tip"><span class="wtd-sk-line wtd-sk-block sk-w-25"></span></div>
				<div class="withdraw-input"><span class="wtd-sk-input wtd-sk-block"></span></div>
				<div class="withdraw-banalce-tip"><span class="wtd-sk-line wtd-sk-block sk-w-50"></span></div>
				<div class="withdraw-btn"><span class="wtd-sk-btn wtd-sk-block"></span></div>
			</tz-box>
			<tz-box bgColor="none">
				<span class="wtd-sk-line wtd-sk-block sk-w-100"></span>
			</tz-box>
		</div>
		<template v-else>
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
		</template>


		<tz-footer/>
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
