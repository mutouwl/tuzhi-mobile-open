<template>
	<view>

		

		<template v-if="config.status == 1">
			<u-sticky :offsetTop="0" bgColor="#fff">

				<tz-box padding="10px 15px 0px">
					<u-search placeholder="请输入商品名称" shape="square" :showAction="false" v-model="form.search" @search="refresh"></u-search>
				</tz-box>

				<u-tabs :list="tabsList" @click="groupChange">
					<!-- 筛选入口：页签行右侧（M7②），生效时图标与文字一起转主色；类型与排序收进共用 tz-filter-popup。
						 文字用 <text> 收成真实元素：裸 mustache 是 flex 的匿名文本项，行盒跟继承字号走，
						 与图标那条定高行盒不同档，只靠 align-items:center 对齐两枚行盒会看着一高一低（§1） -->
					<view slot="right" class="sc-filter" :class="{ active: filterActive }" @click="modal.filter = true;">
						<tz-icon name="paixu" :size="16" :color="filterActive ? '#0968f6' : '#4E5969'" />
						<text>{{ sortTypes[sortChecked].name }}</text>
					</view>
				</u-tabs>
			</u-sticky>
			<view class="container">

				<!-- 首屏骨架屏（M16）：走与真实卡同一只组件（`:skeleton`），页面不再抄一份卡片尺寸，
					 从骨架到数据整版不跳 -->
				<view v-if="loading && list.length === 0">
					<course-item v-for="i in 4" :key="'sk' + i" :skeleton="true" :margin="12" />
				</view>
				<template v-else>
					<view class="goods-list" v-if="list.length > 0">
						<course-item v-for="(item, index) in list" :key="item.score_goods_id || index" :round="true"
							:border="false" :itemId="item.goods_id" :name="item.name" :type="item.type"
							:typeLabel="item.type_label" :cover="item.cover" :score="item.score"
							:priceMarking="item.price_marking" :redeemed="item.redeemed"
							:showRedeemed="showRedeemed"
							:goodsType="item.goods_type" :subType="item.goods_sub_type"
							:scoreGoodsId="item.score_goods_id" :margin="12" />
					</view>
					<u-empty icon="/static/image/empty.png" width="70" height="70" v-else text="暂无积分商品" />
				</template>
			</view>

			<!-- 商品筛选弹窗：类型 + 排序，与推广商品页（agent/recommend/goods）同一形；
				 类型选项由后端下发（未装插件的那几档不出现），7 档排序名较长故按两列换行铺排，时间组隐藏 -->
			<tz-filter-popup :visible="modal.filter" title="商品筛选" :type-value="form.type" :type-options="typeOptions"
				:sort="sortValue" :sort-options="sortOptions" :sort-wrap="true" :show-time="false"
				@update:visible="modal.filter = $event" @confirm="onFilterConfirm" />
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
