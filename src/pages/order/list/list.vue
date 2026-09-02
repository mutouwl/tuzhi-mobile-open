
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

		<order :orderIndex="index" :price="item.real_price" :status="item.status" :orderNo="item.order_no"
			:controll="item.controll" :isVirtualPay="item.is_virtual_pay == 1"
			v-for="(item, index) in list" :key="index" v-if="list.length > 0"
			@handle="orderHandle">
			<course v-if="option.snapshoot" v-for="(option, key) in item.item" :key="key" :name="option.snapshoot.name"
				:cover="option.snapshoot.cover" :type="option.snapshoot.type" :price="option.snapshoot.price"
				:count="option.count" :can_use="false" :is-virtual-pay="item.is_virtual_pay == 1" />
		</order>



		<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="list.length == 0" />

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
