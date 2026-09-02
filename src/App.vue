<script>
	import Vue from "vue";
	import Wechat from "./common/wechat/wechat";
	export default {
		onLaunch: function () {
			this.init();

			var that = this;
			//获取当前页面路由

			// #ifdef MP-WEIXIN || MP-TOUTIAO
			setTimeout(() => {
				try {
					var pages = getCurrentPages(); //获取加载的页面
					if (pages && pages.length) {
						var currentPage = pages[pages.length - 1]; //获取当前页面的对象
						if (currentPage && currentPage.$page && currentPage.$page.fullPath) {
							var path = currentPage.$page.fullPath;
							// launch 启动页不参与上报，由其跳转后的真实页面通过拦截器上报
							if (path && path.indexOf('/pages/launch/launch') === -1) {
								that.record(path);
							}
						}
					}
				} catch (e) {
					console.warn('record current page failed', e);
				}
			}, 1000);
			// #endif

			// #ifdef H5
			var pages = getCurrentPages();
			that.record(window.location.hash);
			// #endif

			uni.addInterceptor("navigateTo", {
				//监听跳转
				invoke(e) {
					that.record(e.url);
				},
			});
			//2
			uni.addInterceptor("redirectTo", {
				//监听关闭本页面跳转
				invoke(e) {
					that.record(e.url);
				},
			});
			/**
			 * 3
			 * 拦截uni.switchTab本身没有问题。
			 * 但是在微信小程序端点击tabbar的底层逻辑并不是触发uni.switchTab。
			 * 所以误认为拦截无效，此类场景的解决方案是在tabbar页面的页面生命周期onShow中处理。
			 */
			uni.addInterceptor("switchTab", {
				//监听tabBar跳转
				invoke(e) {
					that.record(e.url);
				},
			});
			//4
			uni.addInterceptor("navigateBack", {
				//监听返回
				invoke(e) {
					that.record(e.url);
				},
			});
		},
		onShow: function () {
			console.log("App Show");
			// 回到前台时通知各页面导航栏校验最新配置，保证后台编辑导航后移动端自动刷新生效
			uni.$emit('navigationRefresh');
		},
		onHide: function () {
			console.log("App Hide");
		},
		watch: {},

		siteInfo: require("siteinfo.js"),
		methods: {
			record(url) {
				if (!url) {
					return false;
				}
				// 访问统计关闭后不再上报页面访问记录
				if (this.$tools && this.$tools.systemConfig("app_statistics_visit_log") == '0') {
					return false;
				}
				this.$api("data.record", { url: url });
			},

			init(options) {
				return Promise.all([this.setAppInfo(), this.getConfig()]);
			},

			getConfig() {
				var that = this;
				that.$api("common.init", {}).then((res) => {
					if (res.code == 1) {
						uni.setStorageSync("systemConfig", JSON.stringify(res.data));
						// #ifdef H5
						that.$nav.share();
						// #endif
					}
				});
			},

			
			// 获取系统栏高度
			async setAppInfo() {
				let that = this;
				let platform = "";
				return new Promise((resolve, reject) => {
					uni.getSystemInfo({
						success: function (e) {
							Vue.prototype.StatusBar = e.statusBarHeight;
							// #ifdef H5
							Vue.prototype.CustomBar = e.statusBarHeight + 45;
							if (that.$wxsdk.isWechat()) {
								platform = "wxOfficialAccount";
							} else {
								platform = "H5";
							}
							// #endif

							// #ifdef APP-PLUS
							platform = "App";
							if (e.platform == "android") {
								uni.setStorageSync("isAndroid", true);
								Vue.prototype.CustomBar = e.statusBarHeight + 50;
							} else {
								Vue.prototype.CustomBar = e.statusBarHeight + 45;
								uni.setStorageSync("isAndroid", false);
							}
							// #endif

							// #ifdef MP-TOUTIAO
							platform = "dyMiniProgram";
							uni.removeStorageSync("session_key");
							new Wechat().getDyMiniProgramSessionKey();
							let custom = tt.getMenuButtonBoundingClientRect();
							Vue.prototype.Custom = custom;
							Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
							// #endif
							// #ifdef MP-WEIXIN
							platform = "wxMiniProgram";
							uni.removeStorageSync("session_key");
							new Wechat().getWxMiniProgramSessionKey();
							let custom = wx.getMenuButtonBoundingClientRect();
							Vue.prototype.Custom = custom;
							Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
							// #endif
							uni.setStorageSync("platform", platform);
						},
					});

					resolve(platform);
				});
			},
		},
	};
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "@/components/uview-ui/theme.scss";

	//图标组件
	@import "/static/assets/font/icon/iconfont.css";

	*{
		box-sizing: border-box;
	}
	uni-toast {
		z-index: 999999;
	}

	.uni-app--showleftwindow,
	.uni-tabbar-bottom {
		display: none;
	}

	//主题文件src/static/themes/css/arco.css

	// @import '/static/themes/css/arco.css';

	/*  #ifdef  MP-WEIXIN  */

	// 微信小程序中图标颜色由 tz-icon 的内联 color 或父级颜色控制，不能用 !important 覆盖。
	.iconfont {
		color: inherit;
	}

	/*  #endif  */

	/*每个页面公共css */
	.tabbar-icon {
		width: 30px;
		height: 30px;
	}

	.u-input {
		height: 40px;
	}

	.u-border-bottom {
		border-bottom: 1px solid #f3f3f3;
	}

	.u-border {
		border: 1px solid #f3f3f3;
	}

	.u-button--primary,
	.u-tag--primary {
		// background-color: #0968f6 !important;
		// border-color: #0968f6 !important;
	}

	.u-tabs__wrapper__nav__line {
		// background-color: #0968f6 !important;
	}


	::v-deep .uni-page-refresh__icon {
		color: #000 !important;
	}

	.one-line-hidden,
	.two-line-hidden {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.one-line-hidden {
		white-space: nowrap !important;
	}

	.two-line-hidden {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	.round {
		border-radius: 10px;
	}

	page {
		background: rgba(250, 250, 250, 1);
		/*  #ifdef H5  */
		max-width: 480px;
		/*  #endif  */
		margin: 0 auto;
	}

	// .u-empty {
	// 	margin: 140px 0 !important;
	// }

	.uni-system-preview-image {
		z-index: 999999 !important;
	}

	// .popup-title {
	// 	width: 100%;
	// 	height: 50px;
	// 	line-height: 50px;
	// 	font-size: 16px;
	// 	text-align: center;
	// 	// border-bottom: 1px solid #efefef;
	// 	font-weight: 500;
	// 	color: #1d2129;
	// }

</style>
