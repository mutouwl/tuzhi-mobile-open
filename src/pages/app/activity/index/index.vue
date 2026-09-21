<template>
	<div class="container">

		<tz-course :round="10" v-if="list.length > 0" :list="list"/>

		<u-empty v-else icon="/static/image/empty.png" width="70" height="70" text="暂无活动"/>
		
		<tz-footer/> 

		<tz-tab-bar />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
