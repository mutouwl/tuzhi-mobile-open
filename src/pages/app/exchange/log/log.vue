<template>
	<view class="container">

		<tz-box padding="5px 15px" v-if="list.length > 0">
			<div class="order-list">
				<div class="order-item" v-for="(item, index) in list">
					<div class="order-item-list">
						兑换权益：<span v-if="item.course.name" class="order-item-value">{{ item.course.name }} [{{ $t(item.course.type) }}]</span>
						<span v-else class="order-item-value">课程不可用</span>
					</div>
					<div class="order-item-list">
						使用卡密：<span class="order-item-value">{{ item.code }}</span>
					</div>
					<div class="order-item-list">
						兑换时间：<span class="order-item-value">{{ $tools.formatDate(item.createtime) }}</span>
					</div>
				</div>
			</div>
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
