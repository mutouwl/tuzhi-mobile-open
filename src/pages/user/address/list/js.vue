<script>
var that;

export default {
	data() {
		return {
			addressList: [],
			loading: false,
			isSelectMode: false
		}
	},
	onLoad(options) {
		that = this;
		// 判断是否为选择模式
		if (options.select === '1') {
			that.isSelectMode = true;
		}
	},
	onShow() {
		that.getAddressList();
	},
	methods: {
		// 获取地址列表
		async getAddressList() {
			that.loading = true;
			const res = await that.$api('user.address.index', {});
			that.loading = false;
			if (res.code === 1) {
				that.addressList = res.data || [];
			}
		},
		
		// 选择地址（选择模式下）
		selectAddress(item) {
			if (that.isSelectMode) {
				uni.$emit('addressSelected', item);
				uni.navigateBack();
			}
		},
		
		// 设为默认
		async setDefault(item) {
			if (item.is_default === 1) return;
			
			const res = await that.$api('user.address.setDefault', {
				id: item.id
			});
			if (res.code === 1) {
				that.$u.toast('设置成功');
				that.getAddressList();
			}
		},
		
		// 删除地址
		deleteAddress(item) {
			uni.showModal({
				title: '提示',
				content: '确定删除该地址吗？',
				success: async (res) => {
					if (res.confirm) {
						const result = await that.$api('user.address.delete', {
							id: item.id
						});
						if (result.code === 1) {
							that.$u.toast('成功删除');
							that.getAddressList();
						}
					}
				}
			});
		},
		
		// 复制地址
		copyAddress(item) {
			const text = `${item.name} ${item.mobile} ${item.province}${item.city}${item.district}${item.address}`;
			uni.setClipboardData({
				data: text,
				success: () => {
					that.$u.toast('复制成功');
				}
			});
		},
		
		// 编辑地址
		editAddress(item) {
			that.$nav.to('/pages/user/address/edit/edit?id=' + item.id);
		},
		
		// 新增地址
		addAddress() {
			that.$nav.to('/pages/user/address/edit/edit');
		}
	}
}
</script>
