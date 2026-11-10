<template>
	<view class="sign-page">
		<template v-if="config.status == 1">
			<!-- 顶部状态区（对齐行业口径：今日状态 + 连签天数 + 签到记录/规则入口） -->
			<view class="hero">
				<view class="hero-main">
					<template v-if="!loaded">
						<view class="hero-sk hero-sk-title"></view>
						<view class="hero-sk hero-sk-sub"></view>
					</template>
					<template v-else>
						<text class="hero-title">{{ isSign ? '今日已签到' : '今日未签到' }}</text>
						<text class="hero-sub">已连续签到 {{ cuntinueDays }} 天</text>
					</template>
				</view>
				<!-- 顶部两枚入口：签到记录在左、规则在右（同一档半透明白胶囊，几何只由 .hero-links 给） -->
				<view class="hero-links">
					<view class="hero-link" hover-class="hero-link-hover" @tap="goLog">签到记录</view>
					<view class="hero-link" hover-class="hero-link-hover" @tap="goRule">规则</view>
				</view>
			</view>

			<!-- 签到日历 -->
			<view class="calendar-card">
				<view class="cal-bar">
					<view class="cal-nav" @tap="handleCalendar(0)">
						<view class="cal-nav-ic"><tz-icon name="return" :size="16" color="#4E5969" /></view>
						<text class="cal-nav-text">上月</text>
					</view>
					<text class="cal-month">{{ cur_year || '--' }}年{{ pad(cur_month) }}月</text>
					<view class="cal-nav" @tap="handleCalendar(1)">
						<text class="cal-nav-text">下月</text>
						<view class="cal-nav-ic"><tz-icon name="enter" :size="16" color="#4E5969" /></view>
					</view>
				</view>

				<view class="week">
					<text v-for="(item, index) in weeks_ch" :key="index" class="week-item">{{ item }}</text>
				</view>

				<template v-if="!loaded">
					<view class="day-grid">
						<view v-for="i in 35" :key="i" class="day-cell">
							<view class="day-sk-coin"></view>
							<view class="day-sk-num"></view>
						</view>
					</view>
				</template>
				<template v-else>
					<view class="day-grid">
						<view v-for="(item, j) in days" :key="j" class="day-cell">
							<view v-if="item.date" class="day-inner" :class="{ 'is-today': item.current === 'today' }">
								<view class="coin" :class="item.coin_class">
									<text class="coin-star">{{ item.is_sign ? '✓' : '★' }}</text>
									<text v-if="item.reward_score > 0 && !item.is_sign" class="coin-badge">+{{ item.reward_score }}</text>
									<text v-else-if="item.is_sign && item.reward_score > 0" class="coin-badge coin-badge-signed">+{{ item.reward_score }}</text>
								</view>
								<text class="day-num" :class="{ 'day-num-today': item.current === 'today' }">
									{{ item.current === 'today' ? '今天' : item.day }}
								</text>
							</view>
						</view>
					</view>
				</template>
			</view>

			<!-- 签到按钮：已签到时「明日继续签到」写在按钮里，不再另外摆一行提示 -->
			<view class="sign-action">
				<tz-button long size="normal" type="primary" :disabled="!loaded || isSign || signing"
					:text="isSign ? '今日已签到，明日继续签到' : '立即签到'" @click="onSign" />
			</view>

			<tz-footer />
		</template>

		<u-empty v-else icon="/static/image/empty.png" width="70" height="70" text="该功能暂不可用" />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
