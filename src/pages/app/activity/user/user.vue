<template>
	<div class="container">

		<u-sticky bgColor="#fff" :offsetTop="0">
			<tz-box padding="10px 15px 10px" style="border-bottom: 1px solid #efefef;">
				<u-search placeholder="请输入活动名称/票号/票种搜索" :showAction="false" v-model="form.search"
							@search="refresh"></u-search>
			</tz-box>
			<u-tabs :list="tabs" :current="current" :scrollable="false" @change="tabChange"></u-tabs>
		</u-sticky>

		<tz-box padding="0px 15px 0px" margin="2px 0 0" v-if="list && list.length > 0">
			<div class="ticket-list">
				<div class="ticket-item" v-for="(item, index) in list">
					<div class="ticket-item-header">
						<div class="ticket-item-name"
							@click="$nav.to('/pages/app/activity/detail/detail?id=' + item.activity_id, 'local')">
							{{ item.activity_name ? item.activity_name : '活动暂不可用'}} <tz-icon color="#86909C" name="enter" :size="14" />
						</div>
						<div class="ticket-item-status">
							{{ item.sign == 1 ? '已签到' : item.status == 1 ? '待使用' : item.status == 0 ? '待审核' : '作废' }}
						</div>
					</div>
					<div class="ticket-item-list">
						票号: <span @click="$tools.copy(item.ticket_no)">{{ item.ticket_no }} <span class="more-btn"
								style="margin-left: 4px;">[复制]</span></span>
					</div>
					<div class="ticket-item-list">
						价格: 
						<span v-if="isVirtualPay(item)">
							<span class="ticket-price-value">{{ item.price }}</span><span class="ticket-coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
						</span>
						<span v-else>
							<span class="ticket-price-unit">¥</span><span class="ticket-price-value">{{ item.price }}</span>
						</span>
					</div>
					<div class="ticket-item-list">
						规格: <span>{{ item.ticket_name }}</span>
					</div>
					<div class="ticket-item-list">
						参加人: <span>{{ item.name }}</span>
					</div>
					<div class="ticket-item-list">
						手机号: <span>{{ item.mobile }}</span>
					</div>
					<div class="ticket-item-list" v-if="item.other.length > 2">
						更多信息: <span class="more-btn" @click="otherIndex = index; modal.info = true;">查看</span>
					</div>
					<div class="ticket-item-list">
						购买时间: <span>{{ $tools.formatDate(item.createtime) }}</span>
					</div>
					<div class="ticket-item-list" v-if="item.use_time">
						使用时间: <span>{{ $tools.formatDate(item.use_time) }}</span>
					</div>
				</div>
			</div>
		</tz-box>

		<u-empty v-else icon="/static/image/empty.png" width="70" height="70" text="暂无可用票券" />

		<u-modal :show="modal.info" title="报名信息" :closeOnClickOverlay="true" @close="modal.info = false"
			@confirm="modal.info = false">
			<view class="slot-content" style="width: 100%;" v-if="otherIndex !== ''">
				<u-cell :border="index < (list[otherIndex].other.length - 1)" :title="item[0]"
					:value="item[1] ? item[1] : '-'" v-for="(item, index) in list[otherIndex].other"></u-cell>
			</view>

		</u-modal>

		<tz-footer />

	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">@import "./css.css";</style>
