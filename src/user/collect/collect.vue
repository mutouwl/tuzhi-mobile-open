<template>
	<view class="container">
		<u-sticky :offsetTop="0" bgColor="#fff">
			<u-tabs :list="tabs" @click="tabsChange"></u-tabs>
		</u-sticky>

		<tz-box bgColor="none">
		<tz-course v-if="list.length > 0" :round="true" :border="false" :list="list"></tz-course>
			<!-- <tz-course v-if="list.length > 0" :key="index" v-for="(item, index) in list" :cover="item.course.cover" :border="false" :round="true"
				:start_time="item.createtime" @cancel="cancel" :index="index" :end_time="item.validity_time" :type="item.course.type" :name="item.course.name" :itemId="item.course.id" /> -->
			<u-empty mode="favor" v-if="list.length == 0" />
		</tz-box>

		<tz-footer/>
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
