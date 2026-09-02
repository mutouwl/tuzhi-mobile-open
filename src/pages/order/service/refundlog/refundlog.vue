<template>
	<view class="container">


		<tz-box padding="5px 5px" v-if="list.length > 0">
			<u-cell-group :border="false">
				<u-cell  size="large" v-for="(item,index) in list" :key="index"  :border="(list.length - 1) == index ? false : true" :title="item.item_name ? '退款商品「'+item.item_name +'」': '-'" :value="'¥'+item.refund_fee" :label="$tools.formatDate(item.createtime)">
				</u-cell>
			</u-cell-group>			
		</tz-box>
		<u-empty icon="/static/image/empty.png" width="70" height="70" text="暂无退款记录" v-else/>


		<tz-footer/>
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
