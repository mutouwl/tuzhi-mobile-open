<template>
	<view class="container">

		<tz-box padding="5px 15px" v-if="list.length > 0">
			<u-cell-group :border="false">
				<u-cell  size="large" v-for="(item,index) in list" :key="index" :border="(list.length - 1) == index ? false : true" :title="item.date" :value='"积分+"+item.score'></u-cell>
			</u-cell-group>			
		</tz-box>
		<u-empty icon="/static/image/empty.png" width="70" height="70" v-else/>


		<tz-footer/>
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
