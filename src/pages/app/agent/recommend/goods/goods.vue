<template>
	<view class="container">

		<u-sticky bgColor="#fff" :offsetTop="0">

			<tz-box padding="15px 15px 5px">
				<u-search  borderColor="#fff" @search="refresh()" v-model="form.name" :showAction="false" placeholder="请输入要搜索的商品" shape="square"></u-search>
			</tz-box>

			<div class="filter">

				<div class="type" @click="modal.type = true">
					<span>{{ type[typeChecked].name }}</span>
					<span><tz-icon :name="modal.type ==false ? 'unfold' : 'packup'" :size="16" color="#4E5969" /></span>
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


		<div class="goods-list" v-if="list.length > 0">
			<div class="goods-item" v-if="item.prop" v-for="(item, index) in list" @click="$nav.to(item.id, item.type)">
				<div class="goods-item-cover" :style="{
					'background-image': 'url(' + item.cover + ')',
					'background-size': '100% 100%'
				}">
					<div class="goods-item-type">
						<span>{{ $t(item.type) }}</span>
					</div>
				</div>
				<div class="goods-item-info">
					<div class="goods-item-title two-line-hidden">
						{{ item.name }}
					</div>


					<div class="goods-item-footer" @click.stop="">

						<div class="goods-item-price" @click.stop="">
							{{ parseFloat(item.price) > 0 ? item.price : '-' }}
						</div>

						<div class="goods-item-btn" @click.stop="shareGoods(item.id,item.type)">
							<span>预计得</span><span class="value">{{ parseFloat(item.prop.price.goods) > 0 ? ' ¥' + item.prop.price.goods : item.prop.prop.goods + '%'}}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<u-empty icon="/static/image/empty.png" width="70" height="70" v-else/>


		<!-- 类型筛选 -->
		<u-action-sheet :safeAreaInsetBottom="true" cancelText="取消" :show="modal.type" :actions="type"
			:closeOnClickOverlay="true" :closeOnClickAction="true" @close="modal.type = false" @select="typeSelect">
		</u-action-sheet>


		<!-- 分享弹窗 -->
		<share-modal :type="shareGoodsType" :val="shareGoodsId" :visible="modal.share" @close="modal.share = false" />

		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue">

</script> 

<style lang="scss">
@import "./css.css";
</style>
