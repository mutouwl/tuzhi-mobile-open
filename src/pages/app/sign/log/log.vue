<template>
	<view class="container">

		<!-- 首屏骨架屏：仿签到记录列表行（左标题+日期、右积分），与资产流水列表同一口径；
		     仅「请求中且列表为空」时出现，上拉翻页保留已有记录 -->
		<tz-box padding="5px 15px" v-if="loading && !list.length">
			<view class="sign-log-sk-cell" v-for="i in 4" :key="i">
				<view class="sign-log-sk-main">
					<u-skeleton
						:loading="true"
						:animate="true"
						:title="true"
						title-width="34%"
						title-height="14"
						:rows="1"
						:rows-width="['46%']"
						rows-height="12"
					/>
				</view>
				<view class="sign-log-sk-amount"></view>
			</view>
		</tz-box>
		<tz-box padding="5px 15px" v-else-if="list.length > 0">
			<u-cell-group :border="false">
				<u-cell size="large" v-for="(item,index) in list" :key="index" :border="(list.length - 1) == index ? false : true">
					<template #title>
						<view class="sign-log-main">
							<text class="sign-log-name">签到奖励</text>
							<text class="sign-log-date">{{ item.date }}</text>
						</view>
					</template>
					<template #value>
						<text class="sign-log-score">积分+{{ item.score }}</text>
					</template>
				</u-cell>
			</u-cell-group>
		</tz-box>
		<u-empty icon="/static/image/empty.png" width="70" height="70" v-else-if="!loading"/>


		<tz-footer/>
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
