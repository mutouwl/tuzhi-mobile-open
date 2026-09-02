<template>
	<u-popup :show="show" @close="close" @open="open" mode="bottom" :round="10">
		<view class="params-modal-content">
			<view class="params-header">
				<view class="params-title">产品参数</view>
				<text class="params-close" @tap="close">×</text>
			</view>
			<scroll-view class="params-body" scroll-y>
				<view class="params-item" v-for="(item, index) in paramsList" :key="index">
					<view class="params-item-label">{{ item.name }}</view>
					<view class="params-item-value">{{ item.value }}</view>
				</view>
			</scroll-view>
			<view class="params-footer">
				<button class="params-confirm-btn" @tap="onConfirm">确定</button>
			</view>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'ParamsModal',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		paramsList: {
			type: Array,
			default: () => []
		}
	},
	methods: {
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
.params-modal-content {
	background-color: #fff;
	border-radius: 12px 12px 0 0;
	max-height: 70vh;
}

.params-header {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 16px;
	position: relative;
	border-bottom: 1px solid #F7F8FA;
}

.params-title {
	font-size: 18px;
	font-weight: 600;
	color: #333;
}

.params-close {
	position: absolute;
	right: 16px;
	top: 50%;
	transform: translateY(-50%);
	font-size: 24px;
	color: #999;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.params-body {
	padding: 0 16px;
	max-height: 45vh;
}

.params-item {
	display: flex;
	align-items: center;
	padding: 16px 0;
	border-bottom: 1px solid #F7F8FA;
}

.params-item:last-child {
	border-bottom: none;
}

.params-item-label {
	width: 80px;
	font-size: 14px;
	color: #666;
	flex-shrink: 0;
}

.params-item-value {
	flex: 1;
	font-size: 14px;
	color: #333;
	margin-left: 20px;
}

.params-footer {
	padding: 16px;
	border-top: 1px solid #F7F8FA;
}

.params-confirm-btn {
	width: 100%;
	height: 46px;
	line-height: 46px;
	font-weight: 500;
	font-size: 16px;
	background: #0968f6;
	color: #fff;
}
</style>
