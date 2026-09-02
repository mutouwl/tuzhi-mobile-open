<template>
	<view class="container">


		<template v-if="config.status == 1">
			<tz-box>
				<!-- 打卡日历页面 -->
				<view class="calendar">

					<view class="sign-everyday pad">

						<view class="sign-num-box">
							已连续签到
							<text class="sign-num">{{ cuntinueDays }}</text>
							天
						</view>

						<text class="sign-everyday-log" @click="$nav.to('/pages/app/sign/log/log')">签到记录</text>
					</view>

					<view class="bar">
						<!-- 年月 -->
						<view class="previous" @click="handleCalendar(0)">
							<tz-icon name="return" :size="16" color="#4E5969" />
						</view>
						<view class="date">{{ cur_year || '--' }} 年 {{ cur_month || '--' }} 月</view>
						<view class="next" @click="handleCalendar(1)">
							<tz-icon name="enter" :size="16" color="#4E5969" />
						</view>
					</view>
					<!-- 显示星期 -->
					<view class="week x-f">
						<view class="week-item" v-for="(item, index) in weeks_ch" :key="index">{{ item }}</view>
					</view>
					<!-- 日历表 -->
					<view class="myDateTable">
						<view v-for="(item, j) in days" :key="j" class="dateCell">
							<view v-if="item.date == undefined || item.date == null" class="cell"><text
									:decode="true">&nbsp;&nbsp;</text></view>
							<template v-else>
								<!-- 已签到日期 -->
								<view v-if="item.is_sign" class="cell is-sign">
									<text>{{ item.day }}</text>
								</view>
								<!-- 漏签 -->
								<view class="cell forget-sign" v-else-if="cur_year < toYear || (cur_year == toYear && cur_month < toMonth) || (cur_year == toYear && cur_month == toMonth && item.date < today)
									">
									<text>{{ item.day }}</text>
								</view>
								<view class="cell" v-else>
									<text>{{ item.day }}</text>
								</view>
							</template>
						</view>

					</view>
				</view>

			</tz-box>

			<!-- 签到按钮 -->
			<view class="sign-btn">
				<u-button :disabled="isPresentMonth || isSign" :text="isSign ? '今日已签到' : '签到'" type="primary"
					@click="onSign"></u-button>
			</view>
			<tz-tab-bar />
		</template>


		<u-empty icon="/static/image/empty.png" width="70" height="70" v-else text="该功能暂不可用" />

		<tz-footer />
	</view>
</template>

<script src="./js.vue">

</script>

<style  lang="scss">
@import "./css.css";
</style>
