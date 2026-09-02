<script>
import RegionPicker from '../components/region-picker.vue';

var that;

export default {
	components: {
		RegionPicker,
		'tz-icon': () => import('@/components/tz/icon.vue')
	},
	data() {
		return {
			isEdit: false,
			addressId: null,
			form: {
				name: '',
				mobile: '',
				province: '',
				city: '',
				district: '',
				address: '',
				is_default: 0
			},
			parseText: '',
			showRegionPicker: false
		}
	},
	computed: {
		regionText() {
			if (that.form.province && that.form.city && that.form.district) {
				return `${that.form.province}${that.form.city}${that.form.district}`;
			}
			return '';
		}
	},
	onLoad(options) {
		that = this;
		if (options.id) {
			that.isEdit = true;
			that.addressId = options.id;
			that.getAddressDetail();
		}
	},
	methods: {
		// 获取地址详情
		async getAddressDetail() {
			const res = await that.$api('user.address.detail', {
				id: that.addressId
			});
			if (res.code === 1) {
				const data = res.data;
				that.form = {
					name: data.name,
					mobile: data.mobile,
					province: data.province,
					city: data.city,
					district: data.district,
					address: data.address,
					is_default: data.is_default
				};
			}
		},
		
		// 省市区选择确认
		onRegionConfirm(e) {
			that.form.province = e.province;
			that.form.city = e.city;
			that.form.district = e.district;
			that.showRegionPicker = false;
		},
		
		// 默认地址切换
		onDefaultChange(e) {
			that.form.is_default = e.detail.value ? 1 : 0;
		},
		
		// 清除识别文本
		clearParse() {
			that.parseText = '';
		},
		
		// 智能识别地址
		async parseAddress() {
			if (!that.parseText.trim()) {
				that.$u.toast('请输入要识别的地址文本');
				return;
			}
			
			const res = await that.$api('user.address.parse', {
				text: that.parseText
			});
			if (res.code === 1) {
				const data = res.data;
				that.form.name = data.name || '';
				that.form.mobile = data.mobile || '';
				that.form.province = data.province || '';
				that.form.city = data.city || '';
				that.form.district = data.district || '';
				that.form.address = data.address || '';
				that.$u.toast('识别成功');
			}
		},
		
		// 保存地址
		async saveAddress() {
			// 表单验证
			if (!that.form.name.trim()) {
				that.$u.toast('请输入收货人姓名');
				return;
			}
			if (!that.form.mobile.trim()) {
				that.$u.toast('请输入手机号码');
				return;
			}
			if (!/^1[3-9]\d{9}$/.test(that.form.mobile)) {
				that.$u.toast('请输入正确的手机号码');
				return;
			}
			if (!that.form.province || !that.form.city || !that.form.district) {
				that.$u.toast('请选择所在地区');
				return;
			}
			if (!that.form.address.trim()) {
				that.$u.toast('请输入详细地址');
				return;
			}
			
			const params = {
				...that.form
			};
			if (that.isEdit) {
				params.id = that.addressId;
			}
			
			const res = await that.$api('user.address.save', params);
			if (res.code === 1) {
				that.$u.toast(that.isEdit ? '成功修改' : '成功添加');
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		},
		
		// 删除地址
		deleteAddress() {
			uni.showModal({
				title: '提示',
				content: '确定删除该地址吗？',
				success: async (res) => {
					if (res.confirm) {
						const result = await that.$api('user.address.delete', {
							id: that.addressId
						});
						if (result.code === 1) {
							that.$u.toast('删除成功');
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						}
					}
				}
			});
		}
	}
}
</script>
