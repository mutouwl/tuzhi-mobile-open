<template>
	<div class="container">


		<div class="icon">
			<img src="/static/image/success.png" alt="">
		</div>

		<div class="tip">
			<div class="title">
				{{ title }}
			</div>

			<div class="subtitle">
				{{ subtitle }}
			</div>
		</div>

		<tz-divider height="20" bgColor="none" />

		<tz-box bgColor="none">
			<div class="btn-group">
				<u-button shape="circle" :plain="true" text="查看活动详情" @click="$nav.to('/pages/index/index','local','redirectTo')"></u-button>
				<u-button type="primary" shape="circle" :text="btnText" @click="$nav.to('/pages/order/detail/detail?order_no='+order_no,'local','redirectTo')"></u-button>
			</div>
		</tz-box>

		<tz-footer/>

	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
