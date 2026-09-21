<template>
	<view class="container">
		<u-sticky :offsetTop="0" bgColor="#fff">
			<u-tabs :list="tabs" @click="tabsChange"></u-tabs>
		</u-sticky>

		<tz-box bgColor="none">
			<course v-if="list.length > 0" :key="index" v-for="(item, index) in list" :cover="item.course.cover" :border="false" :round="true"
				:start_time="item.createtime" :end_time="item.validity_time" :type="item.course.type" :name="item.course.name" :itemId="item.course.id" />
			<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="list.length == 0" />
		</tz-box>

		<tz-footer/>

		<tz-tab-bar />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
