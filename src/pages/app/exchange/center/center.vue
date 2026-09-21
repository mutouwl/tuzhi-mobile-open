<template>
	<div class="container">

		<div class="exchange-box">
			<span>输入兑换码兑换</span>
			<div class="exchange-input">
				<u-input placeholder="请输入兑换码" :font-size="20" v-model="code" >
				</u-input>
			</div>
			<div class="exchange-btn">
				<u-button text="立即兑换" type="primary" @click="exchange"></u-button>
			</div>
		</div>


		<div class="log-box">
			<span @click="$nav.to('/pages/app/exchange/log/log')">兑换记录</span>
			<span @click="$nav.to('/pages/user/subscription/subscription')">我的订阅</span>
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
