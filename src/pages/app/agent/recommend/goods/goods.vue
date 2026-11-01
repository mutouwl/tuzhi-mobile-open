<template>
	<view class="container">

		<!-- 搜索栏走共用「搜索框 + 右侧筛选按钮」档（M7①，与圈子搜索页同一组件），
		     类型与排序收进筛选弹窗，原来那一行「类型下拉 + 两个排序字」不再占位 -->
		<tz-search-filter-bar :value="form.name" placeholder="请输入要搜索的商品" :filter-active="filterActive"
			@change="onKeywordChange" @submit="refresh" @filter="filterVisible = true" />

		<!-- 商品筛选弹窗（类型 + 排序）：排序把原来的「时间/价格 × 正序/倒序」四态收成四档单选 -->
		<tz-filter-popup :visible="filterVisible" title="商品筛选" :type-value="form.type" :type-options="typeOptions"
			:sort="sortValue" :sort-options="sortOptions" :show-time="false" @update:visible="filterVisible = $event"
			@confirm="onFilterConfirm" />


		<!-- 首屏骨架屏：占位块逐块对齐真实商品卡（140 封面 + 两行标题 + 底部价格与「预计得」那一排），
		     吸顶搜索栏留在骨架屏外保持可点；翻页追加列表不闪骨架（M16） -->
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
				<!-- 封面走 `<image>` 而不是 `background-image`：背景图没有「加载失败」这一档，
				     地址失效 / CDN 掉图 / 域名没进小程序白名单时那一格永远是白的。
				     取不到（含地址为空）就换全站默认商品图 `/static/image/default-goods.jpg`
				     —— 2026-10-29 用户点名「包括这个页面，图片也要有填充」（口径 M65） -->
				<div class="goods-item-cover">
					<image class="goods-item-cover-img" :src="coverOf(item)" mode="scaleToFill"
						@error="onCoverError(item)" />
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
