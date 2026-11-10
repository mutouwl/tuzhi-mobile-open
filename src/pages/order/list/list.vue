
<template>
	<view class="container">
		<u-sticky bgColor="rgba(250, 250, 250, 1)" style="padding-bottom: 2px;" :offsetTop="0">
			<tz-box padding="10px 15px 0px" bgColor="rgba(250, 250, 250, 1)">
				<div class="filter-bar">
					<div class="search-field" @click="modal.searchField = true">
						<span>{{ searchFields[searchFieldChecked].name }}</span>
						<span><tz-icon :name="modal.searchField == false ? 'unfold' : 'packup'" :size="14"
								color="#4E5969" /></span>
					</div>
					<u-search shape="square" style="width:100%;flex:1" :placeholder="'请输入' + searchFields[searchFieldChecked].name" :showAction="false" v-model="form.search" @search="refresh"></u-search>
				</div>
			</tz-box>
			<u-tabs :list="tabs" :current="current" :scrollable="true" @change="tabChange"></u-tabs>
		</u-sticky>

		<!-- 首屏骨架屏（M16，替代 uni.showLoading 的黑底转圈）：灰块与订单卡逐块对齐——
		     卡片外壳 10 内衬 / 10 圆角、头行 30 行盒（左订单号、右状态）、商品行 80 高
		     （28% 封面 + 71% 信息列，价格与数量分列两端）、合计行右对齐、按钮行右侧两枚。
		     判据 loading && !list.length：上拉翻页由已有列表顶着，不闪骨架；
		     切页签 / 换搜索字段 / 下拉刷新走 refresh() 清空列表，会重新铺骨架而不是闪空态。 -->
		<block v-if="loading && !list.length">
			<view class="ols-sk-box" v-for="i in 3" :key="'ols-sk-' + i">
				<view class="ols-sk-card">
					<view class="ols-sk-header">
						<view class="ols-sk-no"></view>
						<view class="ols-sk-status"></view>
					</view>
					<view class="ols-sk-goods">
						<view class="ols-sk-cover"></view>
						<view class="ols-sk-info">
							<u-skeleton class="ols-sk-line" :loading="true" :animate="true" :title="false" :rows="1" :rows-width="['72%']" :rows-height="[16]"></u-skeleton>
							<u-skeleton class="ols-sk-line ols-sk-line-sub" :loading="true" :animate="true" :title="false" :rows="1" :rows-width="['46%']" :rows-height="[12]"></u-skeleton>
							<view class="ols-sk-foot">
								<view class="ols-sk-price"></view>
								<view class="ols-sk-num"></view>
							</view>
						</view>
					</view>
					<view class="ols-sk-total"></view>
					<view class="ols-sk-btns">
						<view class="ols-sk-btn"></view>
						<view class="ols-sk-btn ols-sk-btn-wide"></view>
					</view>
				</view>
			</view>
		</block>

			<block v-else>
				<!-- 积分兑换单（2026-11-09）：现金实付恒 0，合计与商品行都改画积分（后端下发 `score_amount`） -->
				<order :orderIndex="index" :price="Number(item.score_amount) > 0 ? item.score_amount : item.real_price" :status="item.status" :orderNo="item.order_no"
					:controll="item.controll" :isVirtualPay="item.is_virtual_pay == 1"
					:score-mode="Number(item.score_amount) > 0"
					:status-text="item.status_text || ''"
					v-for="(item, index) in list" :key="index"
					@handle="orderHandle">
					<course v-if="option.snapshoot" v-for="(option, key) in item.item" :key="key" :name="option.snapshoot.name"
						:cover="option.snapshoot.cover" :type="option.snapshoot.type"
						:price="Number(option.score_amount) > 0 ? option.score_amount : option.snapshoot.price"
						:score-mode="Number(option.score_amount) > 0"
						:count="option.count" :can_use="false" :is-virtual-pay="item.is_virtual_pay == 1" />
				</order>
			</block>


		<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="list.length == 0 && !loading" />

		<evaluate-items :visible="modal.evaluate" :orderNo="evaluateOrderNo" @close="modal.evaluate = false" />


		<tz-pay :visible="modal.pay" :order-no="payOrderNo" :money="payMoney" :is-virtual-pay="payIsVirtualPay" @close="modal.pay = false"></tz-pay>


		<u-action-sheet title="选择搜索内容" :round="10" :safeAreaInsetBottom="true" :show="modal.searchField" :actions="searchFields"
			:closeOnClickOverlay="true" :closeOnClickAction="true" @close="modal.searchField = false"
			@select="searchFieldSelect">
		</u-action-sheet>

		<tz-footer />

		<tz-tab-bar />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
