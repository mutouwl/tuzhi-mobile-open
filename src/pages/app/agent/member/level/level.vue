<template>
	<div class="container">
		<tz-loading-page :loading="loading"/>
		<view class="uni-margin-wrap">
			<div class="user-box" v-if="userInfo">
				<div class="user-avatar" v-if="userInfo.avatar">
					<img :src="userInfo.avatar" />
				</div>
				<div class="user-info" v-if="userInfo.nickname">
					<div class="user-name">
						{{ userInfo.nickname }}
					</div>
				</div>
			</div>
			<swiper @change="levelChange" :current="current" indicator-active-color="#ff781f" indicator-color="#fff" class="swiper" circular
				:indicator-dots="true" :autoplay="false">
				<swiper-item v-for="(item, index) in level.list">
					<div class="level-item-box">
						<div class="name-level">
							<div>
								{{ item.name }}
								<div class="level-geted" v-if="level.user>=index">已解锁</div>
								<div class="level-noget" v-else>未解锁</div>
							</div>
							<div>
								Lv.<span class="level-val">{{ index + 1 }}</span>
							</div>
						</div>
					</div>
				</swiper-item>
			</swiper>
		</view>

		<!-- #ifdef MP-TOUTIAO -->
		<u-empty icon="/static/image/empty.png" width="70" height="70" text="分销功能禁止抖音小程序端使用" />
		<!-- #endif -->
		<!-- #ifndef MP-TOUTIAO -->


		<tz-box padding="0px 15px 15px">

			<div class="level-equity-header">
				<span class="level-name">
					{{ level.list[current] ? level.list[current].name : "-" }}
				</span>
				<span>等级权益</span>
			</div>

			<div class="data-box">
				<div class="data-item">

					<div class="data-info">
						<span class="data-value">{{
							level.list[current] ? level.list[current].proportion.goods : 0
							}}%</span>
					</div>
					<div class="data-title">商品佣金</div>
				</div>
				<div class="data-item">
					<div class="data-info">
						<span class="data-value">{{config.mode != 2 ? 0 :(level.list[current] ?
							level.list[current].proportion.customer : 0)}}%</span>
					</div>
					<div class="data-title">下级分销员卖货提成</div>
				</div>
			</div>

			<template v-if="level.list[current + 1]">
				<div class="level-equity-header">
					<div>升级条件</div>
					<div class="level-rule-condition">{{'满足以下条件' + (config.upgrade == 1 ? '' : '之一') + '即可升级'}}</div>
				</div>
				
				<template v-for="(item, index) in level.list[current + 1].condition">
					<div class="level-rule-item-value" v-if="item.status == 1">
						{{
						index == "agent"
						? "发展客户数"
						: index == "customer_pay"
						? "推广金额"
						: index == "self_pay"
						? "自购金额"
						: "邀请分销员"
						}}
						{{ item.value }}
						{{ index == "customer_pay" || index == "self_pay" ? "元" : "人" }}

					</div>
				</template>
			</template>
		</tz-box>		
		
		<!-- #endif -->

		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
	@import "./css.css";
</style>