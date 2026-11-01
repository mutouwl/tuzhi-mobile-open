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
			<!-- 列表骨架屏：与 components/course.vue 的真实行逐块对齐（封面 120x80 圆角 5 + 标题与两行灰字），
			     判据 loading && !list.length，上拉翻页不闪骨架（M16） -->
			<block v-if="loading && !list.length">
				<div class="study-sk-item" v-for="n in 3" :key="n">
					<div class="study-sk-cover"></div>
					<div class="study-sk-info">
						<u-skeleton :loading="true" :animate="true" :title="false" :rows="3"
							:rows-width="['55%', '40%', '30%']" rows-height="14" />
					</div>
				</div>
			</block>
			<course v-else-if="list.length > 0" :list="list" />
			<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="list.length == 0 && !loading" />
		</tz-box>

		<template v-if="tabsChecked == 'statistics'">
			<tz-title title="历史数据" :more="false" />
			<tz-box padding="0px 15px 15px">
				<div class="data-box">
					<div class="data-item">
						<div class="data-title">累计学习时长</div>
						<div class="study-sk-value" v-if="totalLoading"></div>
						<div class="data-info" v-else>
							<span class="data-value">{{ statistics.total.time }}</span>小时
						</div>
					</div>
					<div class="data-item">
						<div class="data-title">累计学习课程</div>
						<div class="study-sk-value" v-if="totalLoading"></div>
						<div class="data-info" v-else>
							<span class="data-value">{{ statistics.total.course }}</span>
						</div>
					</div>
				</div>
			</tz-box>
			<tz-divider bgColor="#fafafa" />
			<tz-title title="学习数据" :more="false" />
			<tz-box padding="0px 15px 15px">
				<!-- 日/周/月留在骨架屏之外保持可点（M16），切换档位时下面两块换成骨架 -->
				<div class="time-filter">
					<u-subsection :list="timeTabs" @change="timeChange" :current="timeCurrent"></u-subsection>
				</div>

				<tz-divider :height="20" bgColor="#fff" v-if="!statError" />
				<div class="data-box" v-if="!statError">
					<div class="data-item">
						<div class="data-title">学习时长</div>
						<div class="study-sk-value" v-if="statLoading"></div>
						<div class="data-info" v-else>
							<span class="data-value">{{ statistics.time_total.time }}</span>小时
						</div>
					</div>
					<div class="data-item">
						<div class="data-title">学习课程</div>
						<div class="study-sk-value" v-if="statLoading"></div>
						<div class="data-info" v-else>
							<span class="data-value">{{ statistics.time_total.course }}</span>
						</div>
					</div>
				</div>
				<!-- 取数失败：说一句为什么，并留「下拉可重试」这条路（本页已开下拉刷新），不摆成 0 -->
				<div class="study-sk-error" v-if="!statLoading && statError">{{ statError }}</div>
				<tz-divider bgColor="#fff" :height="40" v-if="!statError" />
				<div class="study-sk-chart" v-if="statLoading"></div>
				<charts type="line" :opts="chartsOpts" :chartData="JSON.parse(JSON.stringify(chartsDataLine))" v-if="!statLoading && !statError"></charts>
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