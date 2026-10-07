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


		<!-- 首屏骨架屏：占位块逐块对齐真实商品卡（140 封面 + 两行标题 + 底部价格与「预计得」那一排），
		     吸顶搜索栏与类型/排序留在骨架屏外保持可点；翻页追加列表不闪骨架（M16） -->
		<div class="goods-list gd-sk" v-if="loading">
			<div class="goods-item" v-for="i in 4" :key="i">
				<div class="goods-item-cover gd-sk-block"></div>
				<div class="goods-item-info">
					<div class="gd-sk-line gd-sk-block sk-h-14 sk-w-100"></div>
					<div class="gd-sk-line gd-sk-block sk-h-14 sk-w-75"></div>
					<div class="goods-item-footer">
						<div class="gd-sk-line gd-sk-block sk-h-16 sk-w-30"></div>
						<div class="gd-sk-line gd-sk-block sk-h-20 sk-w-45"></div>
					</div>
				</div>
			</div>
		</div>
		<div class="goods-list" v-else-if="list.length > 0">
			<div class="goods-item" v-if="item.prop" v-for="(item, index) in list" @click="$nav.to(item.link_id, item.type)">
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

						<div class="goods-item-btn" @click.stop="shareGoods(item.link_id,item.type,item)">
							<span>预计得</span><span class="value">{{ parseFloat(item.prop.price.goods) > 0 ? ' ¥' + item.prop.price.goods : item.prop.prop.goods + '%'}}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<u-empty icon="/static/image/empty.png" width="70" height="70" v-else/>


		<!-- 类型筛选 -->
		<u-action-sheet :round="10" :safeAreaInsetBottom="true" cancelText="取消" :show="modal.type" :actions="type"
			:closeOnClickOverlay="true" :closeOnClickAction="true" @close="modal.type = false" @select="typeSelect">
		</u-action-sheet>


		<!-- 分享弹窗 -->
		<!-- 海报画这一条商品的封面与名称，取本页列表已加载好的那一行（shareGoods 存下的整行）；
		     内容卡只有「封面 + 标题」，价格、类型与佣金都不再抄给海报 -->
		<share-modal :type="shareGoodsType" :val="shareGoodsId" :visible="modal.share" @close="modal.share = false"
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
