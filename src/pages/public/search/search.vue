<template>
	<div class="container">

		<!-- 顶部搜索栏：搜索框 + 右上角筛选按钮，与圈子搜索同一份共用组件（自身吸顶白底通栏） -->
		<tz-search-filter-bar :value="pageParams.content" placeholder="请输入要搜索的内容" :focus="searchFocus"
			:maxlength="-1" :filter-active="filterActive" @change="onKeywordChange" @submit="search"
			@filter="modal.filter = true" />

		<tz-box bgColor="none">
			<!-- 骨架屏：首屏与换筛选/搜索共用这一支，判据 loading && !list.length（翻页追加不闪骨架）。
			     灰块套在 tz-course 真实卡同一只外壳类里，页面不再单抄一份卡尺寸 -->
			<tz-course v-if="listLoading" :skeleton="true" :skeleton-count="4" :round="true" :list="[]" />
			<template v-else>
				<tz-course :round="true" :list="list" v-if="list.length > 0"></tz-course>
				<u-empty icon="/static/image/empty.png" width="70" height="70" v-else :text="loadMsg" />
				<view class="load-more-box" v-if="list.length > 0">
					<u-loadmore :status="loadStatus" />
				</view>
			</template>
		</tz-box>

		<!-- 筛选弹窗：类型与排序都收进这一处（页面不再摆行内类型/排序条） -->
		<tz-filter-popup :visible="modal.filter" title="筛选" :type-value="form.type" :type-options="typeOptions"
			:sort="form.sort" :sort-options="sortOptions" :show-time="false" @update:visible="modal.filter = $event"
			@confirm="onFilterConfirm" />

		<tz-footer />

		<tz-tab-bar />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
