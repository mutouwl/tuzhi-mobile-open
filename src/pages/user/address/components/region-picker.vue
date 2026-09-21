<template>
	<u-popup :show="show" @close="close" @open="open" mode="bottom" :closeable="true">
		<view class="region-picker-content">
			<view class="picker-header">
				<text class="picker-title">选择省市区</text>
			</view>
			
			<view class="picker-tabs">
				<view 
					class="tab-item" 
					:class="{ 'tab-active': activeTab === 0 }"
					@click="activeTab = 0"
				>
					{{ provinceName || '请选择' }}
				</view>
				<view 
					class="tab-item" 
					:class="{ 'tab-active': activeTab === 1, 'tab-disabled': !provinceId }"
					@click="provinceId && (activeTab = 1)"
				>
					{{ cityName || '请选择' }}
				</view>
				<view 
					class="tab-item" 
					:class="{ 'tab-active': activeTab === 2, 'tab-disabled': !cityId }"
					@click="cityId && (activeTab = 2)"
				>
					{{ districtName || '请选择' }}
				</view>
			</view>
			
			<scroll-view class="picker-list" scroll-y>
				<view 
					class="picker-item" 
					v-for="(item, index) in currentList" 
					:key="item.id"
					:class="{ 'item-active': isSelected(item) }"
					@click="selectItem(item)"
				>
					<text class="item-name">{{ item.name }}</text>
					<text class="item-check" v-if="isSelected(item)">✓</text>
				</view>
				<view class="loading-view" v-if="loading">
					<u-loading-icon mode="circle"></u-loading-icon>
					<text class="loading-text">加载中...</text>
				</view>
			</scroll-view>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'RegionPicker',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		province: {
			type: String,
			default: ''
		},
		city: {
			type: String,
			default: ''
		},
		district: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			activeTab: 0,
			provinceId: null,
			provinceName: '',
			cityId: null,
			cityName: '',
			districtId: null,
			districtName: '',
			provinceList: [],
			cityList: [],
			districtList: [],
			loading: false
		}
	},
	computed: {
		currentList() {
			switch (this.activeTab) {
				case 0:
					return this.provinceList;
				case 1:
					return this.cityList;
				case 2:
					return this.districtList;
				default:
					return [];
			}
		}
	},
	watch: {
		show(val) {
			if (val) {
				this.initData();
			}
		}
	},
	methods: {
		// 初始化数据
		async initData() {
			// 重置选择状态
			this.activeTab = 0;
			this.loading = true;
			
			// 如果有初始值，设置选中状态
			if (this.province) {
				this.provinceName = this.province;
			}
			if (this.city) {
				this.cityName = this.city;
			}
			if (this.district) {
				this.districtName = this.district;
			}
			
			// 加载省份列表
			await this.loadProvinces();
			
			// 如果有省份，加载城市列表
			if (this.province) {
				const province = this.provinceList.find(p => p.name === this.province);
				if (province) {
					this.provinceId = province.id;
					await this.loadCities(province.id);
					
					// 如果有城市，加载区县列表
					if (this.city) {
						const city = this.cityList.find(c => c.name === this.city);
						if (city) {
							this.cityId = city.id;
							await this.loadDistricts(city.id);
							
							// 如果有区县，设置选中
							if (this.district) {
								const district = this.districtList.find(d => d.name === this.district);
								if (district) {
									this.districtId = district.id;
								}
							}
						}
					}
				}
			}
			this.loading = false;
		},
		
		// 加载省份列表
		async loadProvinces() {
			this.loading = true;
			const res = await this.$api('data.area.children', { pid: 0 });
			this.loading = false;
			if (res.code === 1) {
				this.provinceList = res.data || [];
			}
		},
		
		// 加载城市列表
		async loadCities(provinceId) {
			this.loading = true;
			const res = await this.$api('data.area.children', { pid: provinceId });
			this.loading = false;
			if (res.code === 1) {
				this.cityList = res.data || [];
			}
		},
		
		// 加载区县列表
		async loadDistricts(cityId) {
			this.loading = true;
			const res = await this.$api('data.area.children', { pid: cityId });
			this.loading = false;
			if (res.code === 1) {
				this.districtList = res.data || [];
			}
		},
		
		// 选择项目
		async selectItem(item) {
			switch (this.activeTab) {
				case 0:
					// 选择省份
					this.provinceId = item.id;
					this.provinceName = item.name;
					this.cityId = null;
					this.cityName = '';
					this.districtId = null;
					this.districtName = '';
					this.cityList = [];
					this.districtList = [];
					await this.loadCities(item.id);
					this.activeTab = 1;
					break;
				case 1:
					// 选择城市
					this.cityId = item.id;
					this.cityName = item.name;
					this.districtId = null;
					this.districtName = '';
					this.districtList = [];
					await this.loadDistricts(item.id);
					this.activeTab = 2;
					break;
				case 2:
					// 选择区县，完成选择
					this.districtId = item.id;
					this.districtName = item.name;
					this.confirm();
					break;
			}
		},
		
		// 判断是否选中
		isSelected(item) {
			switch (this.activeTab) {
				case 0:
					return this.provinceId === item.id;
				case 1:
					return this.cityId === item.id;
				case 2:
					return this.districtId === item.id;
				default:
					return false;
			}
		},
		
		// 确认选择
		confirm() {
			this.$emit('confirm', {
				province: this.provinceName,
				city: this.cityName,
				district: this.districtName,
				provinceId: this.provinceId,
				cityId: this.cityId,
				districtId: this.districtId
			});
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
.region-picker-content {
	background-color: #fff;
	border-radius: 12px 12px 0 0;
	max-height: 70vh;
}

.picker-header {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 16px;
	border-bottom: 1px solid #F7F8FA;
}

.picker-title {
	font-size: 18px;
	font-weight: 600;
	color: #333;
}

.picker-tabs {
	display: flex;
	padding: 0 16px;
	border-bottom: 1px solid #F7F8FA;
}

.tab-item {
	padding: 12px 16px;
	font-size: 15px;
	color: #666;
	position: relative;
}

.tab-active {
	color: #0968f6;
	font-weight: 500;
}

.tab-active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 16px;
	right: 16px;
	height: 2px;
	background-color: #0968f6;
}

.tab-disabled {
	color: #ccc;
}

.picker-list {
	max-height: 40vh;
	padding: 8px 0;
}

.picker-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
}

.item-name {
	font-size: 15px;
	color: #333;
}

.item-active .item-name {
	color: #0968f6;
}

.item-check {
	color: #0968f6;
	font-size: 14px;
}

.loading-view {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.loading-text {
	font-size: 14px;
	color: #999;
	margin-top: 8px;
}
</style>
