<template>
	<div class="container">

		<u-sticky bgColor="#fff" :offsetTop="0">
			<u-tabs :list="tabs" :scrollable="true" @change="tabChange"></u-tabs>
		</u-sticky>


		<div class="item" v-for="(item, index) in list" :key="index" v-if="list.length > 0">
			<evaluate :content="item.content" :rate="item.rate" :time="$tools.formatDate(item.createtime)" :imgs="item.imgs" :avatar="item.user.avatar" :username="item.user.nickname"/>
		</div>

		<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="list.length == 0" text="暂无评价"/>

		<tz-footer/>
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
 