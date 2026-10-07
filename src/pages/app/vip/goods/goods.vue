<template>
	<view class="container">

		<u-sticky bgColor="#fff" :offsetTop="0">

			<tz-box padding="15px 15px 5px">
				<u-search borderColor="#fff" @search="refresh()" v-model="form.name" :showAction="false"
					placeholder="请输入要搜索的商品" shape="round"></u-search>
			</tz-box>

			<div class="filter">

				<div class="type" @click="modal.type = true">
					<span>{{ type[typeChecked].name }}</span>
					<span><tz-icon :name="modal.type == false ? 'unfold' : 'packup'" :size="16" color="#4E5969" /></span>
				</div>
				<div class="sort">
					<span :class="{
						'active': form.sort == item.type
					}" @click="changeSort(item.type)" v-for="(item, index) in sortType">
						{{ item.name }}
						<tz-icon v-if="form.sort == item.type" :name="form.order == 'asc' ? 'zhengxu2' : 'daoxu'"
							:size="12" />
					</span>
				</div>
			</div>
		</u-sticky>


		<tz-box bgColor="none">
			<tz-course :round="true" :border="false" :list="list" v-if="list.length > 0"></tz-course>
			<u-empty icon="/static/image/empty.png" width="70" height="70" v-else text="暂无会员商品"/>
		</tz-box>


		<!-- 类型筛选 -->
		<u-action-sheet :round="10" :safeAreaInsetBottom="true" cancelText="取消" :show="modal.type" :actions="type"
			:closeOnClickOverlay="true" :closeOnClickAction="true" @close="modal.type = false" @select="typeSelect">
		</u-action-sheet>


		<!-- 分享弹窗 -->
		<!-- 海报画这一条会员商品的封面与名称，取列表页已加载好的那一行（shareGoods 存下的整行）；
		     内容卡只有「封面 + 标题」，价格与类型不再抄给海报 -->
		<share-modal :val="shareGoodsId" :visible="modal.share" @close="modal.share = false"
			:title="shareGoodsItem.name" :cover="shareGoodsItem.cover" />

		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
