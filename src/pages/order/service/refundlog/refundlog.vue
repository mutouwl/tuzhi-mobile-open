<template>
	<view class="container">


		<!-- 首屏骨架屏（M16，替代原先 uni.showLoading 的黑底转圈）：外壳复用真实 tz-box，行与真实 u-cell size="large" 逐块对齐——
		     行高 71 = 上下内衬 13×2 + 标题行盒 22（灰块 14 + 上下 4）+ 说明行盒 18（灰块 12 + 上下 3，
		     两行之间那 5px 是真实 .u-cell__label 的 margin-top）+ 右侧金额 14；行间分隔照真实 u-line 那一档。
		     判据 loading && !list.length：上拉翻页由已有列表顶着不闪骨架，下拉刷新清空列表后重新铺骨架。 -->
		<tz-box padding="5px 5px" v-if="loading && !list.length">
			<view class="rfl-sk-cell" v-for="i in 3" :key="i">
				<view class="rfl-sk-main">
					<view class="rfl-sk-line">
						<u-skeleton :loading="true" :animate="true" :title="false" :rows="1" :rows-width="['62%']" :rows-height="[14]"></u-skeleton>
					</view>
					<view class="rfl-sk-line rfl-sk-line-sub">
						<u-skeleton :loading="true" :animate="true" :title="false" :rows="1" :rows-width="['38%']" :rows-height="[12]"></u-skeleton>
					</view>
				</view>
				<view class="rfl-sk-value"></view>
			</view>
		</tz-box>

		<tz-box padding="5px 5px" v-else-if="list.length > 0">
			<u-cell-group :border="false">
				<u-cell  size="large" v-for="(item,index) in list" :key="index"  :border="(list.length - 1) == index ? false : true" :title="item.item_name ? '退款商品「'+item.item_name +'」': '-'" :value="'¥'+item.refund_fee" :label="$tools.formatDate(item.createtime)">
				</u-cell>
			</u-cell-group>			
		</tz-box>
		<u-empty icon="/static/image/empty.png" width="70" height="70" text="暂无退款记录" v-else-if="!loading"/>


		<tz-footer/>
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
