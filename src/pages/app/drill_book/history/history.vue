<template>
	<div class="container db-history">
		<u-sticky bgColor="#fff" :offsetTop="0">
			<u-tabs :list="tabs" :current="tabIndex" @change="onTab" lineColor="#0968f6"
				:activeStyle="{ color: '#0968f6', fontWeight: 'bold' }" />
		</u-sticky>

		<template v-if="skeletonLoading">
			<view class="db-card">
				<view class="db-sk-line" style="width:100%;height:64px;margin-bottom:10px" v-for="i in 3" :key="i"></view>
			</view>
		</template>

		<template v-else>
			<view class="db-history-list" v-if="rows.length">
				<view class="db-history-item" :class="{ 'is-last': i === rows.length - 1 }"
					v-for="(item, i) in rows" :key="item.log_id" @click="openItem(item)">
					<view class="db-history-name">{{ item.name }}</view>
					<view class="db-history-meta">
						<text class="db-history-time">提交时间：{{ item.submittime_text || item.createtime_text || '-' }}</text>
						<text v-if="item.status === 1">共 {{ item.question_count }} 道 · 做对 {{ item.true_count }} 道</text>
						<text v-else class="db-history-undo">未完成</text>
					</view>
				</view>
			</view>
			<!-- 空态走全站 u-empty 档（图标 + 文字） -->
			<u-empty v-if="!rows.length" icon="/static/image/empty.png" width="70" height="70"
				text="暂无练习记录" margin-top="60" />
			<view class="db-loadmore" v-if="rows.length && loadStatus !== 'nomore'">
				<u-loadmore :status="loadStatus" />
			</view>
		</template>
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
