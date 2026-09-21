<template>
	<div class="container">
		<tz-loading-page :loading="loading"/>
		<!-- #ifdef MP-TOUTIAO -->
		<u-empty icon="/static/image/empty.png" width="70" height="70" text="分销功能禁止抖音小程序端使用" />
		<!-- #endif -->
		<!-- #ifndef MP-TOUTIAO -->
		<u-empty v-if="config.status == 0" icon="/static/image/empty.png" width="70" height="70" text="分销功能已关闭" />
		<template v-if="config.status == 1">
			<tz-box bgColor="#242531" padding="20px 15px">

				<div class="user-box" @click="$nav.to('/pages/app/agent/member/level/level')">
					<div class="user-avatar">
						<img :src="userInfo.avatar" />
					</div>
					<div class="user-info">
						<div class="user-name">
							{{ userInfo.nickname ? userInfo.nickname : '-' }}
						</div>
						<div class="user-descip" v-if="member.status != 1">
							当前已禁用分销功能
						</div>
					</div>

					<div class="user-more">
						<tz-icon name="enter" color="#fff" :size="16" />
					</div>
				</div>

				<div class="level-box" @click="$nav.to('/pages/app/agent/member/level/level')" v-if="level.list.length > 0">

					<div class="level-info">
						<div class="level-name">
							{{ level.list[level.user].name }}
						</div>
						<div class="level-descip">
							商品佣金:{{ level.list[level.user] ? level.list[level.user].proportion.goods : 0 }}% <template
								v-if="config.mode == 2"> ；下级分销员卖货提成:{{ level.list[level.user] ?
									level.list[level.user].proportion.customer : 0 }}%</template>
						</div>
					</div>

					<div class="level-cover">
						<img src="@/static/image/app/vip.png" />
					</div>
				</div>
			</tz-box>

			<tz-box bgColor="none">
				<div class="data-total-box" style="border-radius: 6px 6px 0 0 ;">
					<div class="data-total-item">
						<div class="data-total-name">
							今日收益(元)
						</div>
						<div class="data-total-value">
							{{ statistics.order.today.price_success ? statistics.order.today.price_success : '0' }}
						</div>
					</div>

					<div class="data-total-item">
						<div class="data-total-name">
							总收益(元)
						</div>
						<div class="data-total-value">
							{{ statistics.order.total.price_success ? statistics.order.total.price_success : '0' }}
						</div>
					</div>
				</div>
				<tz-box>
					<div class="data-box">
						<div class="data-item" @click="$nav.to('/pages/app/agent/log/earnings/log/log')">
							<div class="data-item-name">
								今日推广订单 <tz-icon name="enter" color="#86909C" :size="12" />
							</div>
							<div class="data-item-value">
								{{ statistics.order.today.order_count ? statistics.order.today.order_count : '0' }}
							</div>
						</div>
						<div class="data-item" @click="$nav.to('/pages/app/agent/log/earnings/log/log')">
							<div class="data-item-name">
								累计推广订单 <tz-icon name="enter" color="#86909C" :size="12" />
							</div>
							<div class="data-item-value">
								{{ statistics.order.total.order_count ? statistics.order.total.order_count : '0' }}
							</div>
						</div>
						<div class="data-item" @click="$nav.to('/pages/app/agent/log/customer/log/log')">
							<div class="data-item-name">
								今日新增客户 <tz-icon name="enter" color="#86909C" :size="12" />
							</div>
							<div class="data-item-value">
								{{ statistics.customer.today.count ? statistics.customer.today.count : '0' }}
							</div>
						</div>
						<div class="data-item" @click="$nav.to('/pages/app/agent/log/customer/log/log')">
							<div class="data-item-name">
								累计客户 <tz-icon name="enter" color="#86909C" :size="12" />
							</div>
							<div class="data-item-value">
								{{ statistics.customer.total.count ? statistics.customer.total.count : '0' }}
							</div>
						</div>
					</div>

					<u-cell :border="false" title="可提现金额" style="padding: 0;" :value="member.money"
						@click="$nav.to('/pages/app/agent/wallet/settle/settle')">
						<template #right-icon>
							<tz-icon name="enter" color="#86909C" :size="13" />
						</template>
					</u-cell>
				</tz-box>
				<tz-divider bgColor="none" />
				<tz-box padding="10px 15px">
					<div class="channel-box">
						<div class="channel-item" @click="$nav.to('/pages/app/agent/recommend/goods/goods')">
							<div class="channel-item-info">
								<div class="channel-item-info-title">推广商品</div>
								<div class="channel-item-info-subtitle">佣金赚不够</div>
							</div>
							<div class="channel-item-cover">
								<img src="@/static/image/app/goods.png">
							</div>
						</div>
						<div class="channel-item" @click="modal.share = true;">
							<div class="channel-item-info">
								<div class="channel-item-info-title">推广海报</div>
								<div class="channel-item-info-subtitle">发圈快速获客</div>
							</div>
							<div class="channel-item-cover">
								<img src="@/static/image/app/poster.png">
							</div>
						</div>
						<!-- <div class="channel-item" v-if="config.channels" @click="channels()">
							<div class="channel-item-info">
								<div class="channel-item-info-title">视频号分享员</div>
								<div class="channel-item-info-subtitle">视频号私域分销</div>
							</div>
							<div class="channel-item-cover">
								<img src="@/static/image/channels.png">
							</div>
						</div> -->
					</div>
				</tz-box>
			</tz-box>
		</template>
		<!-- #endif -->

		<share-modal val="pages/index/index" type="page" :visible="modal.share" @close="modal.share = false" />


		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">@import "./css.css";</style>
