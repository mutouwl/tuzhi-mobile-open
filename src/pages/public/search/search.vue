<template>
	<div class="container">

		<u-sticky bgColor="#fff" :offsetTop="0">

			<tz-box padding="10px 10px 5px">
				<u-search @search="search" v-model="pageParams.content" borderColor="#fff" :showAction="false"
					placeholder="请输入要搜索的内容" shape="square" ></u-search>
			</tz-box>

			<div class="filter">
				<div class="type" @click="showModel('type')">
					<span>{{ type[typeChecked].name }}</span>
					<span><tz-icon name="unfold" :size="14" color="#4E5969" /></span>
				</div>
				<div class="sort">
					<span :class="{
						'active': form.sort == 'time'
					}" @click="sortChange('time')">最近</span>
					<span :class="{
						'active': form.sort == 'view'
					}" @click="sortChange('view')">热门</span>
				</div>
			</div>
		</u-sticky>

		<tz-box bgColor="none">
			<tz-course :round="true" :list="list" v-if="list.length > 0"></tz-course>
			<u-empty icon="/static/image/empty.png" width="70" height="70" v-else-if="!loading" />
			<view class="load-more-box" v-if="list.length > 0">
				<u-loadmore :status="loadStatus" />
			</view>
		</tz-box>


		<!-- 类型 -->
		<u-action-sheet :round="10" :safeAreaInsetBottom="true" title="筛选内容类型" :show="modal.type" :actions="type"
			:closeOnClickOverlay="true" :closeOnClickAction="true" @close="showModel('type')" @select="typeSelect">
		</u-action-sheet>

		<tz-footer />

		<tz-tab-bar />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>