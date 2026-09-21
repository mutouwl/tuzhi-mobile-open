<template>
	<view class="launch-page">
		<view class="loading-text">加载中...</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			targetUrl: '/pages/index/index',
			redirected: false
		};
	},
	onLoad(options) {
		// 拼接参数
		let query = '';
		if (options && Object.keys(options).length) {
			const arr = [];
			for (const k in options) {
				if (options[k] !== undefined && options[k] !== null && options[k] !== '') {
					arr.push(`${k}=${encodeURIComponent(options[k])}`);
				}
			}
			if (arr.length) {
				query = '?' + arr.join('&');
			}
		}
		this.targetUrl = '/pages/index/index' + query;
	},
	onReady() {
		this.goIndex();
	},
	onShow() {
		// 兜底：onReady 在某些平台冷启动时可能不触发，onShow 再保险一次
		setTimeout(() => {
			this.goIndex();
		}, 50);
	},
	methods: {
		goIndex() {
			if (this.redirected) return;
			this.redirected = true;
			const url = this.targetUrl;
			uni.reLaunch({
				url: url,
				fail: () => {
					uni.redirectTo({
						url: url,
						fail: () => {
							uni.navigateTo({ url: url });
						}
					});
				}
			});
		}
	}
};
</script>

<style scoped>
.launch-page {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100vh;
	background-color: #f8f8f8;
}
.loading-text {
	font-size: 14px;
	color: #999;
}
</style>
