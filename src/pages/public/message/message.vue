<template>
	<view class="container">

		
		<div class="message-box" v-if="list.length > 0">
			<div class="message-item-box" v-for="(item,index) in list">

				<div class="message-title" v-if="item.title">{{ item.title }}</div>
				<div class="message-time">
						{{ $tools.formatDate(item.createtime) }}
					</div>
				<div class="message-content" v-if="item.content">
					<u-parse :content="item.content" :selectable="true"></u-parse>
				</div>

				<div class="message-footer" v-if="item.link && item.link.type && item.link.type !='unlink'" @click="$nav.to(item.link.src,item.link.type)">
					<div class="message-btn">
						<span>{{ item.btn_text }}</span>
					</div>

					<tz-icon name="enter" color="#86909C" :size="13" />
				</div>
			</div>
		</div>

		<u-empty mode="message" v-else/>


		<tz-footer/>

		<tz-tab-bar />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
