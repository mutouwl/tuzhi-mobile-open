<template>
	<view>

		

		<template v-if="config.status == 1">
			<u-sticky :offsetTop="0" bgColor="#fff">

				<tz-box padding="10px 15px 0px">
					<u-search placeholder="请输入课程名称" :showAction="false" v-model="form.search" @search="refresh"></u-search>
				</tz-box>

				<u-tabs :list="tabsList" @click="groupChange">
					<view slot="right" class="filter" @click="modal.sort = true;">
						<tz-icon name="paixu" :size="16" color="#4E5969" />
						{{ sortTypes[sortChecked].name }}
					</view>
				</u-tabs>
			</u-sticky>
			<view class="container">

				<div :class="['course-list-box', 'single']" v-if="list.length > 0">
					<template v-for="(item, index) in list">
						<course-item :round="true" :border="false" :itemId="item.course.id" :name="item.course.name"
							:type="item.course.type" :cover="item.course.cover" :score="item.score"
							:price_marking="item.course.price" />
					</template>
				</div>
				<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="list.length == 0" text="暂无积分商品" />
			</view>

			<u-action-sheet :safeAreaInsetBottom="true" cancelText="取消" :show="modal.sort" :actions="sortTypes"
				:closeOnClickOverlay="true" :closeOnClickAction="true" @close="modal.sort = false" @select="sortSelect">
			</u-action-sheet>
		</template>

		<u-empty icon="/static/image/empty.png" width="70" height="70" v-else text="该功能暂不可用" />

		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue">

</script>

<style  lang="scss">
@import "./css.css";
</style>
