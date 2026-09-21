<template>
	<!--
		联系方式操作弹窗（模块共用）
		底部弹出：标题 + 中部展示联系方式 + 底部「复制」/主操作按钮（电话→拨打、地址→导航）。
		电话/地址为空时不弹窗（弹窗里没有可操作的内容），由组件内兜底判断，使用方无需再判空。
		使用方：校区详情（联系电话、校区地址）、教师详情（联系电话）。
	-->
	<u-popup :show="show && !!value" mode="bottom" :round="10" :closeable="true" :safeAreaInsetBottom="false" @close="$emit('close')">
		<view class="tz-contact-popup">
			<view class="tz-contact-popup-title">{{ titleText }}</view>
			<view class="tz-contact-popup-value">{{ displayValue }}</view>
			<view class="tz-contact-popup-actions">
				<view class="tz-contact-popup-btn" @click="copy">复制</view>
				<view class="tz-contact-popup-btn primary" @click="doAction">{{ actionText }}</view>
			</view>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'TzContactPopup',
	props: {
		// 是否显示（由使用方控制）
		show: {
			type: Boolean,
			default: false
		},
		// 联系方式类型：phone 电话（拨打）/ address 地址（导航）
		type: {
			type: String,
			default: 'phone'
		},
		// 联系电话
		phone: {
			type: [String, Number],
			default: ''
		},
		// 地址
		address: {
			type: String,
			default: ''
		},
		// 地址导航坐标（gcj02，字段 latitude/longitude/name/address）；未设置定位传 null
		location: {
			type: Object,
			default: null
		},
		// 弹窗标题，不传按类型取默认（联系电话 / 地址）
		title: {
			type: String,
			default: ''
		}
	},
	computed: {
		// 当前类型的原始值：复制用它，判空也用它（不加任何展示格式）
		// 空串/null/undefined/数字 0 一律视为空，弹窗不展示
		value() {
			const raw = this.type === 'address' ? this.address : this.phone;
			if (raw === null || raw === undefined || raw === '' || raw === 0) return '';
			return String(raw);
		},
		titleText() {
			if (this.title) return this.title;
			return this.type === 'address' ? '地址' : '联系电话';
		},
		// 电话按 3 4 4 展示，地址原样展示
		displayValue() {
			return this.type === 'address' ? this.value : this.$tools.formatPhone(this.value);
		},
		actionText() {
			return this.type === 'address' ? '导航' : '拨打';
		}
	},
	methods: {
		// 复制不带格式的原始号码/地址
		copy() {
			if (!this.value) return;
			uni.setClipboardData({
				data: this.value,
				success: () => {
					// 微信小程序 setClipboardData 自带“内容已复制”提示，避免重复弹窗
					// #ifndef MP-WEIXIN
					uni.showToast({ title: '已复制', icon: 'none' });
					// #endif
				}
			});
		},
		// 主操作：电话→拨打（弹窗保持打开，取消通话后还能复制）；地址→关弹窗并导航
		doAction() {
			if (!this.value) return;
			if (this.type === 'address') {
				this.$emit('close');
				this.openNavi();
				return;
			}
			this.$tools.callPhone(this.value);
		},
		// 点「导航」：小程序/App 调起系统地图，H5 见 openNaviH5
		openNavi() {
			// #ifdef H5
			this.openNaviH5();
			// #endif
			// #ifndef H5
			const loc = this.navLocation();
			if (!loc) {
				this.toastNoLocation();
				return;
			}
			uni.openLocation({
				...loc,
				fail: () => uni.showToast({ title: '导航打开失败，请重试', icon: 'none' })
			});
			// #endif
		},
		/**
		 * H5：微信内用 JS-SDK 打开微信内置地图（地图页自带导航入口），其他浏览器直接跳高德地图页。
		 * 高德链接按 gcj02 坐标打点；未定位时退化为地址文字检索。
		 */
		openNaviH5() {
			const loc = this.navLocation();
			const inWechat = !!(this.$wxsdk && this.$wxsdk.isWechat());
			if (inWechat) {
				if (!loc) {
					this.toastNoLocation();
					return;
				}
				// 内置地图调起失败时退回高德网页，保证仍能导航
				this.$wxsdk.openLocation({ ...loc, fail: () => this.openAmap(loc) });
				return;
			}
			this.openAmap(loc);
		},
		// 高德地图：有坐标用标记点，无坐标按地址检索（新窗口打开，仍在用户点击行为内）
		openAmap(loc) {
			const keyword = this.address || (this.location && this.location.name) || '';
			const url = loc
				? `https://uri.amap.com/marker?position=${loc.longitude},${loc.latitude}&name=${encodeURIComponent(loc.name || '')}`
				: `https://uri.amap.com/search?keyword=${encodeURIComponent(keyword)}`;
			// #ifdef H5
			window.open(url, '_blank');
			// #endif
		},
		// 微信内置地图与系统地图都必须有坐标，未设置定位的只能提示（浏览器可走文字检索，见 openAmap）
		toastNoLocation() {
			uni.showToast({ title: '未设置定位，无法导航', icon: 'none' });
		},
		// 导航坐标规范化：latitude/longitude 为非 0 有限值才有效，未设置定位返回 null
		navLocation() {
			const loc = this.location || {};
			const lat = Number(loc.latitude);
			const lng = Number(loc.longitude);
			if (!isFinite(lat) || !isFinite(lng) || lat === 0 || lng === 0) return null;
			return { latitude: lat, longitude: lng, name: loc.name || '', address: loc.address || '' };
		}
	}
};
</script>

<style scoped>
/* 版式对齐学生选择/套餐规格等模块底部弹窗：标题左对齐、操作按钮固定靠下，中间内容区占满剩余高度并垂直居中；
   弹窗高度取屏幕 1/3（对齐收款账户弹窗 30vh 等既有 vh 写法），用 min-height 保证地址过长时撑高不裁切 */
.tz-contact-popup {
	display: flex;
	flex-direction: column;
	min-height: 33vh;
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	/* 底部安全区统一挂在弹层根节点（模板已关 u-popup 的 safeAreaInsetBottom，
	   此前操作栏与 u-popup 各补一份全量安全区）；微信端按教务口径减半 */
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}

.tz-contact-popup-title {
	flex-shrink: 0;
	padding: 15px 16px 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}

/* 内容区：占据标题与操作栏之间的剩余高度，展示值在其中垂直居中 */
.tz-contact-popup-value {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 16px;
	font-size: 14px;
	line-height: 20px;
	color: #666;
	text-align: center;
	word-break: break-all;
}

/* 操作栏固定靠下（对齐套餐规格弹窗底部操作栏：分隔线 + 16px 内边距） */
.tz-contact-popup-actions {
	flex-shrink: 0;
	display: flex;
	padding: 16px;
	border-top: 1px solid #f7f8fa;
}

.tz-contact-popup-btn {
	flex: 1;
	height: 46px;
	line-height: 46px;
	text-align: center;
	font-size: 16px;
	font-weight: 500;
	border-radius: 4px;
	background: #fff;
	border: 1px solid #ddd;
	color: #4e5969;
}

.tz-contact-popup-btn + .tz-contact-popup-btn {
	margin-left: 12px;
}

.tz-contact-popup-btn.primary {
	background: #0968f6;
	border-color: #0968f6;
	color: #fff;
}
</style>
