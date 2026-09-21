<template>
	<u-popup :show="show" @close="close" @open="open" mode="bottom" :round="10">
		<view class="guarantee-modal-content">
			<view class="guarantee-header">
				<view class="guarantee-title">服务保障</view>
				<text class="guarantee-close" @tap="close">×</text>
			</view>
			<scroll-view class="guarantee-body" scroll-y>
				<view class="guarantee-item" v-for="(item, index) in guaranteeList" :key="index">
					<view class="guarantee-item-title">
						<text class="guarantee-name">{{ item.title }}</text>
					</view>
					<view class="guarantee-item-desc">{{ item.desc }}</view>
				</view>
			</scroll-view>
			<view class="guarantee-footer">
				<button class="guarantee-confirm-btn" @tap="onConfirm">确定</button>
			</view>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'GuaranteeModal',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		guaranteeList: {
			type: Array,
			default: () => [
				{
					icon: 'checkmark-circle-fill',
					title: '7天无理由退换',
					desc: '满足相应条件（吊牌缺失,洗涤后不支持）时，消费者可申请"7天无理由退换货"'
				},
				{
					icon: 'car-fill',
					title: '退货运费险',
					desc: '卖家投保退货运费险，负担一定金额退货运费'
				},
				{
					icon: 'clock-fill',
					title: '极速退款',
					desc: '卖家投保退货运费险，负担一定金额退货运费'
				}
			]
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
.guarantee-modal-content {
	background-color: #fff;
	border-radius: 12px 12px 0 0;
	max-height: 70vh;
}

.guarantee-header {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 16px;
	position: relative;
	border-bottom: 1px solid #F7F8FA;
}

.guarantee-title {
	font-size: 18px;
	font-weight: 600;
	color: #333;
}

.guarantee-close {
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

.guarantee-body {
	padding: 20px 16px;
	max-height: 45vh;
}

.guarantee-item {
	margin-bottom: 24px;
}

.guarantee-item-title {
	font-size: 15px;
	font-weight: 600;
	color: #333;
	margin-bottom: 8px;
	display: flex;
	align-items: center;
}

.guarantee-name {
}

.guarantee-item-desc {
	font-size: 13px;
	color: #999;
	line-height: 1.6;
}

.guarantee-footer {
	padding: 16px;
	border-top: 1px solid #F7F8FA;
}

.guarantee-confirm-btn {
	width: 100%;
	height: 46px;
	line-height: 46px;
	font-weight: 500;
	font-size: 16px;
	background: #0968f6;
	color: #fff;
}
</style>
