<template>
	<div class="container">
		<!-- 首屏骨架屏：占位块逐块对齐本页真实版式（深色头区的头像圆 + 昵称 / 那张 100px 高的等级卡 /
		     下方权益标题与两格佣金），撤掉骨架屏后各块位置不跳（M16）；
		     深色与橙色底上各取半透明白、半透明品牌橙那一档，同分销中心页 -->
		<div class="lvl-sk" v-if="loading">
			<view class="uni-margin-wrap">
				<div class="user-box">
					<div class="user-avatar lvl-sk-block lvl-sk-light"></div>
					<div class="user-info">
						<div class="lvl-sk-line lvl-sk-block lvl-sk-light sk-h-14 sk-w-35"></div>
					</div>
				</div>
				<div class="level-item-box">
					<div class="name-level">
						<div class="lvl-sk-line lvl-sk-block lvl-sk-brand sk-h-22 sk-w-30"></div>
						<div class="lvl-sk-line lvl-sk-block lvl-sk-brand sk-h-30 sk-w-15"></div>
					</div>
				</div>
			</view>
			<tz-box padding="0px 15px 15px">
				<div class="level-equity-header">
					<div class="lvl-sk-line lvl-sk-block sk-h-16 sk-w-45"></div>
				</div>
				<div class="data-box">
					<div class="data-item" v-for="i in 2" :key="i">
						<div class="lvl-sk-line lvl-sk-block sk-h-22 sk-w-50"></div>
						<div class="lvl-sk-line lvl-sk-block sk-h-12 sk-w-75"></div>
					</div>
				</div>
			</tz-box>
		</div>
		<view class="uni-margin-wrap" v-else>
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


		<tz-box padding="0px 15px 15px" v-if="!loading">

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