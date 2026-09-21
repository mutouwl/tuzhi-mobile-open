<template>
	<div class="container">
		<u-alert type="primary" title="选中一个账号作为主账号，另外的账号将被注销" description="账号合并后，被合并的账号权益（包括课程、账户、资产、订单等）将被迁移至新账号中。"></u-alert>
		<tz-divider />
		<tz-title title="当前账号" :more="false" size="sm" />
		<tz-box padding="5 10 15">
			<div class="user-header" @click="radioChange('main')">
				<div class="radio-box">
					<radio-group>
						<radio :checked="accountCheck == 'main'" value="main"></radio>
					</radio-group>
				</div>
				<div class="info">
					<div class="avatar">
						<img :src="userInfo.avatar">
					</div>
					<div class="content">
						<div class="username">
							{{ userInfo.nickname }} <span class="platform">【{{ userInfo.platform ? $t(userInfo.platform) :'-'}}】</span>
						</div>
						<div class="assets">
							<span>余额:{{ userInfo.money }}</span>
							<span>积分:{{ userInfo.score }}</span>
						</div>
					</div>
				</div>
			</div>
		</tz-box>
		<tz-divider />
		<tz-title title="冲突账号" :more="false" size="sm" />
		<tz-box padding="5 10 15">
			<div class="user-header" @click="radioChange('sub')">
				<div class="radio-box">
					<radio-group>
						<radio :checked="accountCheck == 'sub'" value="sub">
						</radio>
					</radio-group>
				</div>
				<div class="info">
					<div class="avatar">
						<img :src="mergeAccountInfo.avatar">
					</div>
					<div class="content">
						<div class="username">
							{{ mergeAccountInfo.username }} <span class="platform">【{{ mergeAccountInfo.platform ? $t(mergeAccountInfo.platform) :'-'}}】</span>
						</div>
						<div class="assets">
							<span>余额:{{ mergeAccountInfo.money }}</span>
							<span>积分:{{ mergeAccountInfo.score }}</span>
						</div>
					</div>
				</div>
			</div>
		</tz-box>

		<tz-box bgColor="none">
			<u-button type="primary" text="立即合并" @click="submit"></u-button>
		</tz-box>

		<tz-footer/>
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
