<template>
	<view class="test-list-page">
		<!-- 首屏骨架（M16）：与真实行同一只盒子（内衬 15/0、标题 14、副行 12），灰块只替换会变的那几格 -->
		<tz-box padding="0px 15px" v-if="!loaded">
			<view class="exam-row" :class="{ 'exam-row-last': index === 3 }" v-for="(i, index) in 4" :key="index">
				<view class="exam-row-main">
					<u-skeleton
						:loading="true"
						:animate="true"
						:title="true"
						title-width="46%"
						title-height="15"
						:rows="2"
						:rows-width="['72%', '38%']"
						rows-height="12"
					/>
				</view>
				<view class="exam-row-arrow-sk"></view>
			</view>
		</tz-box>

		<!-- 一条都没到手时说的是失败原因，不把故障说成「暂无考试」 -->
		<u-empty
			v-else-if="list.length === 0"
			icon="/static/image/empty.png"
			width="70"
			height="70"
			:text="loadMsg || '暂无考试'"
		/>

		<template v-else>
			<tz-box padding="0px 15px">
				<view
					class="exam-row"
					:class="{ 'exam-row-last': index === list.length - 1 }"
					v-for="(item, index) in list"
					:key="item.id"
					hover-class="exam-row-hover"
					@tap="goDetail(item)"
				>
					<view class="exam-row-main">
						<view class="exam-row-title one-line-hidden">{{ item.name }}</view>
						<view class="exam-row-sub">考试时间：{{ timeText(item) }}</view>
						<view class="exam-row-sub">{{ metaText(item) }}</view>
					</view>
					<tz-icon name="enter" :size="16" color="#C9CDD4" />
				</view>
			</tz-box>
			<view class="load-more-box">
				<u-loadmore :status="loadStatus" />
			</view>
		</template>

		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style lang="scss" scoped>
@import "./css.css";
</style>
