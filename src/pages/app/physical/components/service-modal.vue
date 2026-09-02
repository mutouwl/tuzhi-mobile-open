<template>
	<u-popup :show="show" @close="close" @open="open" mode="bottom" :closeable="true">
		<view class="service-modal-content">
			<view class="service-header">
				<view class="service-title">服务</view>
			</view>
			<scroll-view class="service-body" scroll-y>
				<view class="service-item" v-for="(service, index) in serviceList" :key="index">
					<view class="service-item-title">
						<u-icon name="checkmark-circle-fill" size="16" color="#0968f6"></u-icon>
						<text class="service-name">{{ service }}</text>
					</view>
					<view class="service-item-desc">{{ getServiceDesc(service) }}</view>
				</view>
			</scroll-view>
			<view class="service-footer">
				<button class="service-confirm-btn" @tap="onConfirm">我知道了</button>
			</view>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'ServiceModal',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		serviceList: {
			type: Array,
			default: () => []
		}
	},
	methods: {
		getServiceDesc(service) {
			const descMap = {
				'不支持7天无理由退货': '该商品不支持7天无理由退货',
				'支持换货': '支持买家申请退换货',
				'支持退货': '支持买家申请退货',
				'包邮': '该商品享受包邮服务',
				'正品保证': '平台承诺正品保证',
				'极速发货': '商家承诺24小时内发货'
			};
			return descMap[service] || service;
		},

		onConfirm() {
			this.$emit('confirm');
		},

		close() {
			this.$emit('close');
		},

		open() {
			this.$emit('open');
		}
	}
}
</script>

<style scoped>
.service-modal-content {
	background-color: #fff;
	border-radius: 12px 12px 0 0;
	max-height: 60vh;
}

.service-header {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 16px;
	border-bottom: 1px solid #F7F8FA;
}

.service-title {
	font-size: 16px;
	font-weight: 600;
	color: #333;
}

.service-body {
	padding: 20px 16px;
	max-height: 40vh;
}

.service-item {
	margin-bottom: 24px;
}

.service-item-title {
	font-size: 15px;
	font-weight: 500;
	color: #333;
	margin-bottom: 8px;
	display: flex;
	align-items: center;
}

.service-name {
	margin-left: 6px;
}

.service-item-desc {
	font-size: 13px;
	color: #999;
	padding-left: 22px;
	line-height: 1.5;
}

.service-footer {
	padding: 16px;
	border-top: 1px solid #F7F8FA;
}

.service-confirm-btn {
	width: 100%;
	height: 46px;
	line-height: 46px;
	font-weight: 500;
	font-size: 16px;
	border-radius: 23px;
	background: #0968f6;
	color: #fff;
}
</style>
