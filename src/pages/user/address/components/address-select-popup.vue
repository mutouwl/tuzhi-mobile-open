<template>
	<u-popup :show="show" @close="close" @open="open" mode="bottom" :closeable="true">
		<view class="address-popup-content">
			<view class="popup-header">
				<text class="popup-title">地址选择</text>
			</view>
			
			<scroll-view class="address-list" scroll-y>
				<view 
					class="address-item" 
					v-for="(item, index) in addressList" 
					:key="item.id"
					@click="selectAddress(item)"
				>
					<view class="address-info">
						<view class="user-info">
							<text class="name">{{ item.name }}</text>
							<text class="mobile">{{ item.mobile }}</text>
						</view>
						<view class="address-text">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.address }}</view>
					</view>
					<view class="select-icon" v-if="selectedId === item.id">
						<text class="icon-check">✓</text>
					</view>
				</view>
				
				<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="addressList.length === 0 && !loading" text="暂无收货地址" />
				
				<view class="loading-wrap" v-if="loading">
					<u-loading-icon size="24" color="#0968f6"></u-loading-icon>
					<text class="loading-text">加载中...</text>
				</view>
			</scroll-view>
			
			<view class="popup-footer">
				<button class="add-btn" @click="addAddress">新增地址</button>
			</view>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'AddressSelectPopup',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		selectedId: {
			type: [Number, String],
			default: null
		}
	},
	data() {
		return {
			addressList: [],
			loading: false
		}
	},
	watch: {
		show(val) {
			if (val) {
				this.getAddressList();
			}
		}
	},
	methods: {
		// 获取地址列表
		async getAddressList() {
			this.loading = true;
			const res = await this.$api('user.address.index', {});
			this.loading = false;
			if (res.code === 1) {
				this.addressList = res.data || [];
			}
		},
		
		// 选择地址
		selectAddress(item) {
			this.$emit('select', item);
			this.close();
		},
		
		// 新增地址
		addAddress() {
			this.$emit('add');
			this.close();
		},
		
		// 关闭弹窗
		close() {
			this.$emit('close');
		},
		
		// 打开弹窗
		open() {
			this.$emit('open');
		}
	}
}
</script>

<style scoped>
.address-popup-content {
	background-color: #fff;
	border-radius: 12px 12px 0 0;
	max-height: 70vh;
}

.popup-header {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 16px;
	border-bottom: 1px solid #F7F8FA;
}

.popup-title {
	font-size: 18px;
	font-weight: 600;
	color: #333;
}

.address-list {
	max-height: 50vh;
	padding: 0 16px;
}

.address-item {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 16px 0;
	border-bottom: 1px solid #F7F8FA;
}

.address-item:last-child {
	border-bottom: none;
}

.address-info {
	flex: 1;
}

.user-info {
	display: flex;
	align-items: center;
	margin-bottom: 8px;
}

.user-info .name {
	font-size: 16px;
	font-weight: 500;
	color: #333;
	margin-right: 12px;
}

.user-info .mobile {
	font-size: 14px;
	color: #666;
}

.address-text {
	font-size: 14px;
	color: #333;
	line-height: 1.5;
}

.select-icon {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background-color: #0968f6;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 12px;
	flex-shrink: 0;
}

.icon-check {
	color: #fff;
	font-size: 14px;
}

.empty-tip {
	text-align: center;
	padding: 40px 20px;
	color: #999;
	font-size: 14px;
}

.loading-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
}

.loading-text {
	font-size: 14px;
	color: #999;
	margin-top: 8px;
}

.popup-footer {
	padding: 16px;
	border-top: 1px solid #F7F8FA;
}

.add-btn {
	width: 100%;
	height: 46px;
	line-height: 46px;
	background-color: #0968f6;
	color: #fff;
	font-size: 16px;
	border-radius: 23px;
	border: none;
}
</style>
