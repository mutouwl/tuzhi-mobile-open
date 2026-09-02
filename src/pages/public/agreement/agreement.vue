<template>
	<div>
		<u-empty v-if="content === false" icon="/static/image/empty.png" width="70" height="70" text="未查询到相关协议内容"/>
		<tz-box v-else>
			<tz-parse  :content="content" ></tz-parse>
		</tz-box>


		
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
// @import "./css.css";
</style>
