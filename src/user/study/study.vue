<template>
	<view class="container">
		<div class="user-header">
			<div class="info">
				<div class="avatar" v-if="userInfo && userInfo.avatar">
					<img :src="userInfo.avatar" />
				</div>
				<div class="content">
					<div class="username">
						{{ userInfo && userInfo.nickname ? userInfo.nickname : '-' }}
					</div>
				</div>
				<div class="message"></div>
			</div>

			<div class="user-study-val">
				已加入 <span>{{days.join_days}}</span> 天，连续学习 <span>{{days.study_days}}</span> 天
			</div>
		</div>

		<u-sticky :offsetTop="0" bgColor="#fff"> 
			<u-tabs :list="tabs" @click="tabsChange"></u-tabs>
		</u-sticky>
		<tz-box v-if="tabsChecked == 'log'">
			<course v-if="list.length > 0" :list="list" />
			<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="list.length == 0" />
		</tz-box>

		<template v-if="tabsChecked == 'statistics'">
			<tz-title title="历史数据" :more="false" />
			<tz-box padding="0px 15px 15px">
				<div class="data-box">
					<div class="data-item">
						<div class="data-title">累计学习时长</div>
						<div class="data-info">
							<span class="data-value">{{ statistics.total.time }}</span>小时
						</div>
					</div>
					<div class="data-item">
						<div class="data-title">累计学习课程</div>
						<div class="data-info">
							<span class="data-value">{{ statistics.total.course }}</span>
						</div>
					</div>
				</div>
			</tz-box>
			<tz-divider />
			<tz-title title="学习数据" :more="false" />
			<tz-box padding="0px 15px 15px">
				<div class="time-filter">
					<u-subsection :list="timeTabs" @change="timeChange" :current="timeCurrent"></u-subsection>
				</div>

				<tz-divider :height="20" bgColor="#fff" />
				<div class="data-box">
					<div class="data-item">
						<div class="data-title">学习时长</div>
						<div class="data-info">
							<span class="data-value">{{ statistics.time_total.time }}</span>小时
						</div>
					</div>
					<div class="data-item">
						<div class="data-title">学习课程</div>
						<div class="data-info">
							<span class="data-value">{{ statistics.time_total.course }}</span>
						</div>
					</div>
				</div>
				<tz-divider bgColor="#fff" :height="40" />
				<charts type="line" :opts="chartsOpts" :chartData="JSON.parse(JSON.stringify(chartsDataLine))"></charts>
			</tz-box>
		</template>

		<tz-tab-bar ref="tabbar" />
		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style lang="scss">
	@import "./css.css";
</style>