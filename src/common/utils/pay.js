/**
 * ShoproPay v1.0.0
 * @Class ShoproPay
 * @description shopro-pay 1.0.0 统一支付
 * @Author llidongtony
 * @Date 2020-04-09
 * @Email lidongtony@qq.com
 */
import api from '@/common/request/index'
import tools from '@/common/utils/tools';
import router from '@/common/utils/router';
// #ifdef H5
import wxsdk from '@/common/wechat/sdk';
// #endif
import Wechat from '@/common/wechat/wechat';


export default class PayHandle {


	//						wxOfficialAccount			wxMiniProgram			App						H5
	// 			wechat			公众号JSSDK支付				小程序支付			微信开放平台支付			H5网页支付
	//			alipay			复制网址						复制网址				支付宝开放平台支付		    直接跳转链接
	// 			balance			v							v					v						v


	constructor(pay_type, orderNo, callback = function () { },isGoOrder = true) {
		this.pay_type = pay_type;
		this.orderNo = orderNo;
		this.isGoOrder = isGoOrder;
		this.callback = callback;
		this.platform = uni.getStorageSync('platform');

		// #ifdef H5
		// 页面位于 iframe 内（如直播间带货详情弹窗）时，微信 JSSDK 支付与 WAP 收银台在 iframe 中不可用，
		// 微信支付转交顶层窗口发起
		if (this.pay_type === 'wechat' && this.isInIframe()) {
			window.parent.postMessage({
				type: 'tuzi-live-pay',
				payload: {
					pay_type: this.pay_type,
					order_no: this.orderNo,
					is_go_order: this.isGoOrder
				}
			}, window.location.origin);
			// 通知调用方关闭支付弹窗
			this.callback(this.pay_type, { code: 1, delegated: true });
			return;
		}
		// #endif

		let payMehod = this.getPayMethod();
		payMehod();

	}

	// 判断当前页面是否处于 iframe 中（H5 场景）
	isInIframe() {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	}

	getPayMethod() {
		var payMethod = {
			'wxOfficialAccount': {
				'wechat': () => {
					this.wxOfficialAccountPay()
				},
				'alipay': () => {
					this.copyPayLink()
				},
				'balance': () => {
					this.balancePay()
				}
			},
			'wxMiniProgram': {
				'wechat': () => {
					this.wxMiniProgramPay()
				},
				'alipay': () => {
					this.copyPayLink()
				},
				'balance': () => {
					this.balancePay()
				}
			},
			'dyMiniProgram': {
				'douyinpay': () => {
					this.dyMiniProgramPay()
				},
				'balance': () => {
					this.balancePay()
				}
			},
			'App': {
				'wechat': () => {
					this.wechatPay()
				},
				'alipay': () => {
					this.aliPay()
				},
				'balance': () => {
					this.balancePay()
				},
			},
			'H5': {
				'wechat': () => {
					this.wechatWapPay()
				},
				'alipay': () => {
					this.goToPayLink()
				},
				'balance': () => {
					this.balancePay()
				},
			},
		}
		return payMethod[this.platform][this.pay_type];
	}



	prepay() {
		let that = this;
		uni.showLoading({
			title: '支付中',
			mask: true
		});
		return new Promise((resolve, reject) => {
			let that = this;
			let params = {
				order_no: that.orderNo,
				pay_type: that.pay_type
			}
			if (uni.getStorageSync('user_openid')) {
				params.openid = uni.getStorageSync('user_openid');
			}

			// #ifdef MP-WEIXIN
			if (that.platform === 'wxMiniProgram' && that.pay_type === 'wechat') {
				uni.login({
					success(info) {
						params.code = info.code;
						that.createPrepay(params, resolve);
					},
					fail(err) {
						uni.hideLoading();
						uni.$u.toast('支付授权失败,请重试');
						reject(err);
					}
				});
				return;
			}
			// #endif

			that.createPrepay(params, resolve);
		});
	}

	createPrepay(params, resolve) {
		let that = this;
		api('pay.handle', params).then(res => {
			uni.hideLoading()
			if (res.code === 1) {
				if (res.data === 'no_openid') {
						// 需要先静默授权，关闭支付弹窗，授权后由用户重新发起支付
						this.callback(this.pay_type, res);
						uni.showModal({
							title: '支付授权',
							content: '点击确定后请再次支付',
							showCancel: false,
							success: function (res) {
								console.log("res", res)
								if (res.confirm) {
									//静默获取openid
									let wechat = new Wechat();
									// #ifdef MP-WEIXIN
									uni.login({
										success: function (info) {
											let code = info.code;
											api('user.info.getWxMiniProgramSessionKey', {
												code: code,
											}).then(res => {
												if (res.code === 1) {
													uni.setStorageSync('user_openid', res.data.openid);
													uni.showToast({
														title: '请继续操作',
														duration: 1300
													});
												}
											});
										},
										fail: function () {
											uni.showToast({
												title: '登录失败',
												duration: 1300
											});
										}
									});
									// #endif

									// #ifdef MP-TOUTIAO
									wechat.getDyMiniProgramSessionKey();
									// #endif
									// #ifdef H5
									wechat.wxOfficialAccountOauth();
									// #endif


								} else if (res.cancel) {
									console.log('用户点击取消');
								}
							}
						});

				} else {
					resolve(res);
				}
			} else {
				uni.$u.toast(res.msg);
				// 预支付失败，通知调用方关闭支付弹窗（成功时不回调，避免弹窗提前关闭导致支付流程中断）
				this.callback(this.pay_type, res);
			}
		});
}

	goOrder() {

		if(!this.isGoOrder){
			this.callback(this.pay_type, 'success');
			return;
		}

		// #ifdef MP-WEIXIN || MP-TOUTIAO
		var pages = getCurrentPages()    //获取加载的页面
		var currentPage = pages[pages.length - 1]    //获取当前页面的对象
		var pagepath = currentPage.__route__;
		// #endif


		// #ifdef H5
		var pages = getCurrentPages();
		var pagepath = pages[pages.length - 1].__page__.meta.pagePath;
		// #endif

		var jumpType = 'navigateTo';
		if (pagepath == 'pages/order/submit/submit' || pagepath == 'pages/order/detail/detail') {
			jumpType = 'redirectTo';
		}
		router.to("/pages/public/result/result?order_no=" + this.orderNo, 'local', jumpType);
	}

	compareVersion(v1, v2) {
		if (typeof v1 !== 'string' || typeof v2 !== 'string') return 0;
		const parts1 = v1.split('.');
		const parts2 = v2.split('.');
		const len = Math.max(parts1.length, parts2.length);
		while (parts1.length < len) parts1.push('0');
		while (parts2.length < len) parts2.push('0');
		for (let i = 0; i < len; i++) {
			const num1 = parseInt(parts1[i], 10);
			const num2 = parseInt(parts2[i], 10);
			if (num1 > num2) return 1;
			else if (num1 < num2) return -1;
		}
		return 0;
	}

	async wxOfficialAccountPay() {


		let that = this;
		let result = await this.prepay();
		let payData = result.data.pay_data || result.data;
		wxsdk.wxpay(payData, (res) => {
			if (res.errMsg === 'chooseWXPay:cancel') {
				uni.$u.toast('取消支付');
			} else {
				if (res.errMsg == "chooseWXPay:ok") {
					that.goOrder();
				} else {
					var msg = '支付失败,请重试';
					uni.$u.toast(msg);
				}

			}
		});

	}
	//

	async wechatWapPay() {

		let that = this;
		let result = await this.prepay();
		if (result.code === 1) {
			var url = result.data.pay_data.match(/url\=\'(\S*)\'/);
			let reg = new RegExp('&amp;', 'g') //g代表全部
			let newUrl = url[1].replace(reg, '&');
			// 直播带货等场景下页面可能处于 iframe 弹窗中，微信WAP收银台禁止被 iframe 嵌套，需在顶层窗口打开
			try {
				if (window.top && window.top !== window) {
					window.top.location.href = newUrl;
				} else {
					window.location.href = newUrl;
				}
			} catch (e) {
				window.location.href = newUrl;
			}

		}
	}

	async wxMiniProgramPay() {
		let that = this;
		let result = await this.prepay();
		let resData = result.data;

		if (resData.is_virtual_pay === 1) {
			// #ifdef MP-WEIXIN
			let payData = resData.pay_data;
			console.log('虚拟支付参数 payData:', payData);
			const SDKVersion = wx.getAppBaseInfo ? wx.getAppBaseInfo().SDKVersion : wx.getSystemInfoSync().SDKVersion;
			if (that.compareVersion(SDKVersion, '2.19.2') >= 0 || wx.canIUse('requestVirtualPayment')) {
				if (typeof payData.signData !== 'string') {
					console.error('requestVirtualPayment signData 必须使用后端签名时的原始字符串，不能在前端重新 JSON.stringify:', payData.signData);
					uni.$u.toast('支付参数异常,请重试');
					return;
				}
				let virtualSignData = payData.signData;
				let virtualPayMode = payData.mode || 'short_series_goods';
				console.log('requestVirtualPayment 调用参数:', {
					signData: virtualSignData,
					paySig: payData.paySig,
					signature: payData.signature,
					mode: virtualPayMode
				});
				wx.requestVirtualPayment({
					signData: virtualSignData,
					paySig: payData.paySig,
					signature: payData.signature,
					mode: virtualPayMode,
					success(res) {
						console.log('requestVirtualPayment success', res);
						that.goOrder();
					},
					fail(err) {
						console.error('requestVirtualPayment fail', err);
						console.error('错误详情:', JSON.stringify(err));
						if (err.errCode === -2) {
							uni.$u.toast('取消支付');
							that.cancelVirtualPayOrder();
						} else if (err.errCode === -15005) {
							uni.$u.toast('支付签名错误,请重试');
						} else if (err.errCode === 4) {
							uni.$u.toast('Apple账户所在地区不支持购买该商品');
						} else {
							uni.$u.toast('支付失败[' + err.errCode + ']');
						}
					}
				});
			} else {
				uni.showModal({
					title: '提示',
					content: '当前微信版本过低，无法使用支付功能，请升级到最新微信版本后重试。',
					showCancel: false
				});
			}
			// #endif
			return;
		}

		let payData = resData.pay_data || resData;
		uni.requestPayment({
			provider: 'wxpay',
			timeStamp: payData.timeStamp,
			nonceStr: payData.nonceStr,
			package: payData.package,
			signType: payData.signType,
			paySign: payData.paySign,
			success: function (res) {
				that.goOrder();
			},
			fail: function (err) {
				var msg = '支付失败,请重试';
				uni.$u.toast(msg);
			}
		});
	}

	async dyMiniProgramPay() {
		let that = this;
		let result = await this.prepay();
		let payData = result.data;

		console.log("payData.data",payData.data)
		tt.requestOrder({
			data: payData.data, // 请勿在前端对data做任何处理
			byteAuthorization: payData.authorization, // 请勿在前端对byteAuthorization做任何处理
			success: (res) => {
				tt.getOrderPayment({
					orderId:res.orderId,
					success: (ret) => {
						that.goOrder();
					},
					fail: (ret) => {
						var msg = '支付失败,请重试';
						uni.$u.toast(msg);
					},
				});
			},
			fail: (res) => {
				var msg = '获取支付参数失败,请重试';
				uni.$u.toast(msg);
			},
		});
	}

	async balancePay() {
		let that = this;
		let result = await this.prepay();

		this.callback(this.pay_type, result);

		if (result.code === 1) {

			that.goOrder();
		}
	}

	async goToPayLink() {
		let that = this;
		let result = await this.prepay();
		if (result.code === 1) {
			let payData = result.data.pay_data;

			let ua = navigator.userAgent.toLowerCase();
			let isWechat = ua.indexOf('micromessenger') !== -1;

			if (isWechat && that.pay_type === 'alipay') {
				let payUrl = window.location.origin + '/index/alipay/pay?order_no=' + that.orderNo;
				that.callback('alipay_wechat', { pay_url: payUrl });
				return;
			}

			if (typeof payData === 'string' && payData.indexOf('<form') !== -1) {
				document.open();
				document.write(payData);
				document.close();
			} else {
				window.location = payData;
			}
		}
	}

	async copyPayLink() {
		let that = this;
		let result = await this.prepay();
		if (result.code === 1) {
			let payUrl = window.location.origin + '/index/alipay/pay?order_no=' + that.orderNo;
			that.callback('alipay_wechat', { pay_url: payUrl });
		}
	}

	async aliPay() {
		let that = this;
		let result = await this.prepay();
		if (result.code === 1) {
			let payData = result.data.pay_data || result.data;
			// #ifdef APP-PLUS
			uni.requestPayment({
				provider: 'alipay',
				orderInfo: payData,
				success(res) {
					that.goOrder();
				},
				fail(err) {
					uni.$u.toast('支付失败,请重试');
				}
			});
			// #endif
		}
	}

	cancelVirtualPayOrder() {
		api('order.status.cancel', {
			order_no: this.orderNo
		}).then(res => {
			console.log('取消虚拟支付订单结果:', res);
			if (res.code === 1) {
				uni.stopPullDownRefresh();
				setTimeout(() => {
					uni.startPullDownRefresh();
				}, 100);
			}
		});
	}

}
