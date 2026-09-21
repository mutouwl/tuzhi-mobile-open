<template>
	<view class="container">
		<tz-loading-page tip="物流信息加载中" :loading="loading" />
		
		<template v-if="!loading && expressInfo">
			<!-- 无需物流 -->
			<view class="no-ship-section" v-if="expressInfo.status === 'noexpress'">
				<u-empty icon="/static/image/empty.png" width="70" height="70" text="该订单无需物流发货"></u-empty>
			</view>

			<!-- 物流信息 -->
			<view class="express-info-section" v-else-if="expressInfo.express_name && expressInfo.express_no">
				<view class="express-info-item">
					<text class="info-label">快递公司：</text>
					<text class="info-value">{{ expressInfo.express_name }}</text>
				</view>
				<view class="express-info-item">
					<text class="info-label">快递单号：</text>
					<text class="info-value">{{ expressInfo.express_no }}</text>
					<view class="copy-btn" @click="copyExpressNo">
						<tz-icon name="copy" color="#0968f6" :size="14" />
						<text class="copy-text">复制</text>
					</view>
				</view>
			</view>
			
			<!-- 暂未发货 -->
			<view class="no-ship-section" v-else>
				<u-empty icon="/static/image/empty.png" width="70" height="70" text="暂未发货"></u-empty>
			</view>
			
			<!-- 物流轨迹 -->
			<view class="timeline-section" v-if="expressInfo.express_name && expressInfo.express_no">
				<view class="timeline-header">
					<text class="timeline-title">物流详情</text>
					<view class="refresh-btn" @click="refreshExpressInfo">
						<u-icon name="reload" color="#0968f6" size="14"></u-icon>
						<text class="refresh-text">刷新</text>
					</view>
				</view>
				<view class="timeline-list" v-if="expressInfo.logs && expressInfo.logs.length > 0">
					<view 
						class="timeline-item" 
						v-for="(item, index) in expressInfo.logs" 
						:key="item.id"
						:class="{ 'active': index === 0 }"
					>
						<view class="timeline-left">
							<view class="timeline-dot" :class="{ 'active': index === 0 }"></view>
							<view class="timeline-line" v-if="index !== expressInfo.logs.length - 1"></view>
						</view>
						<view class="timeline-content">
							<view class="timeline-text">{{ item.content }}</view>
							<view class="timeline-time">{{ item.change_date }}</view>
						</view>
					</view>
				</view>
				<view class="empty-timeline" v-else>
					<u-empty icon="/static/image/empty.png" width="70" height="70" text="暂无物流信息"></u-empty>
				</view>
			</view>
		</template>
		

		
		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style lang="scss">
	@import "./css.css";
</style>
