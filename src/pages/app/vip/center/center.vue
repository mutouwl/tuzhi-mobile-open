<template>
	<div class="container">
		<tz-loading-page :loading="loading"></tz-loading-page>
		<template v-if="detail[checkCardIndex] && config.status == 1">

			<div class="user-header">
				<div class="info">
					<div class="avatar" v-if="userInfo && userInfo.avatar">
						<img :src="userInfo.avatar" />
					</div>
					<div class="content">
						<div class="username">
							<span>
								{{ userInfo && userInfo.nickname ? userInfo.nickname : '-' }}
							</span>
						</div>

						<div class="user-descip">

							<span :class="[
								'viptag',
								{'pay':vipUserInfo ? true : false}
							]"">{{vipUserInfo ? vipUserInfo.card.title : '暂未开通'}}</span>
							<span v-if=" vipUserInfo">到期时间：{{$tools.formatDate(vipUserInfo.end_time)}}</span>
						</div>

					</div>
				</div>
			</div>

			<tz-box padding="15px 15px 10px">
				<swiper class="card-swiper" :style="{ height: swiperHeight ? swiperHeight + 'px' : '' }"
					indicator-active-color="#000000" indicator-color="#efefef" circular
					:autoplay="false" :indicator-dots="true" :duration="300" @change="changeCard">
					<swiper-item v-for="(item, index) in detail" :key="index">
						<div class="vip-card" :class="{ 'card-measured': cardMeasured }"
							:style="{ 'background-color': item.style == 1 ? 'black' : item.style_color }">
							<div class="card-title">
								{{ item.title }}
							</div>
							<div class="card-subtitle" v-if="item.subtitle">
								{{ item.subtitle }}
							</div>
							<div class="card-icon">
								<img src="@/static/image/app/vip.png" alt="">
							</div>


							<div class="privilege"
								v-if="item.privilege_free == 1 || item.privilege_discount == 1">
								<u-grid :border="false" :col="4">
									<u-grid-item v-if="item.privilege_free == 1">
										<div class="vip-privilege-icon">
											<tz-icon name="transaction_fill" color="#fff" :size="32"></tz-icon>
										</div>
										<text class="name">专属课程免费</text>
									</u-grid-item>
									<u-grid-item v-if="item.privilege_discount == 1">
										<div class="vip-privilege-icon">
											<tz-icon name="marketing_fill" color="#fff" :size="32"></tz-icon>
										</div>
										<text class="name">专属课程折扣</text>
									</u-grid-item>
								</u-grid>
							</div>
						</div>
					</swiper-item>
				</swiper>
			</tz-box>



			<template v-if="detail[checkCardIndex]">
				<tz-box padding="0px 15px 5px">
					<div class="price-cell">

						<u-scroll-list :indicator="false">
							<div class="cell-item" @click="changeSku(index)" :class="[{
													'active': skuIndex == index ? true : false
												}]" v-for="(item, index) in detail[checkCardIndex].sku" :key="index">
								<div class="cell-title">
									{{ item.time + '天' }}
								</div>
								<div class="cell-value">
									<span class="value-unit" v-if="!isVirtualPaySku(item, detail[checkCardIndex])">¥</span>{{item.price }}<span class="value-unit" v-if="isVirtualPaySku(item, detail[checkCardIndex])">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
								</div>
								<div class="cell-label">
									{{ formatAveragePrice(item, detail[checkCardIndex]) }} <span
										v-if="item.limit>0">，此规格限购{{item.limit}}次</span>
								</div>

							</div>

						</u-scroll-list>

					</div>
				</tz-box>
			</template>

			<tz-divider />
			<u-sticky bgColor="#fff" :offsetTop="0">
				<u-tabs :list="tabs" :current="current" :scrollable="true" @change="tabChange"></u-tabs>
			</u-sticky>
			

			<template v-if="currentTabType == 'detail'">
				<tz-box padding="0px 15px 15px">
					<tz-parse :content="detail[checkCardIndex].detail" :selectable="true"></tz-parse>
				</tz-box>
			</template>

			<template v-if="currentTabType == 'goods'">

				<!-- 免费权益：全部课程 -->
				<template
					v-if="detail[checkCardIndex].privilege_free == 1 && detail[checkCardIndex].privilege_free_scope == 'all'">
					<tz-title title="免费权益" :more="false" />
					<tz-box>
						<div class="privilege-tip">
							<u-icon name="gift-fill" :size="40" color="#0968f6"></u-icon>
							<div class="privilege-tip-text">全部课程均可免费学习</div>
						</div>
					</tz-box>
				</template>

				<!-- 免费权益：指定课程 -->
				<template
					v-else-if="detail[checkCardIndex].privilege_free == 1 && detail[checkCardIndex].privilege_free_goods.length > 0">

					<tz-title title="免费权益" subtitle="查看更多"
						@click="$nav.to('/pages/app/vip/goods/goods?type=free&card_id=' + detail[checkCardIndex].id)" />
					<tz-box>
						<tz-course type="diallel"  :round="true" border="true"
							:list="detail[checkCardIndex].privilege_free_goods"></tz-course>
					</tz-box>
				</template>

				<!-- 折扣权益：全部课程 -->
				<template
					v-if="detail[checkCardIndex].privilege_discount == 1 && detail[checkCardIndex].privilege_discount_scope == 'all'">
					<tz-title :title="'专享'+detail[checkCardIndex].privilege_discount_val+'折'" :more="false"/>
					<tz-box>
						<div class="privilege-tip">
							<u-icon name="gift-fill" :size="40" color="#0968f6"></u-icon>
							<div class="privilege-tip-text">{{ '全部课程购买可享' + detail[checkCardIndex].privilege_discount_val + '折优惠' }}</div>
						</div>
					</tz-box>
				</template>

				<!-- 折扣权益：指定课程 -->
				<template
					v-else-if="detail[checkCardIndex].privilege_discount == 1 && detail[checkCardIndex].privilege_discount_goods.length > 0">

					<tz-title :title="'专享'+detail[checkCardIndex].privilege_discount_val+'折'" subtitle="查看更多"
						@click="$nav.to('/pages/app/vip/goods/goods?type=discount&card_id=' + detail[checkCardIndex].id)" />
					<tz-box>
						<tz-course type="diallel" :round="true" border="true"
							:list="detail[checkCardIndex].privilege_discount_goods"></tz-course>
					</tz-box>

				</template>

			</template>


			<template v-if="config.exchange == 0 && vipUserInfo && vipUserInfo.card_id != detail[checkCardIndex].id">
				<tz-bottom-btn :disabled="true" btnTitle="暂不支持会员卡换购" @handle="buy" />
			</template>
			<template v-else>
				<tz-bottom-btn btnTitle="立即开通" @handle="buy" />
			</template>

		</template>
		<template v-else>
			<u-empty icon="/static/image/empty.png" width="70" height="70"
				:text="config.status != 1 ? '会员卡功能暂不可用' :'暂无可用会员卡'" />
		</template>



		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
	@import "./css.css";
</style>
