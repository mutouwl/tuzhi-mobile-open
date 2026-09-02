var jweixin = require('jweixin-module');
import api from '@/common/request/index'
import tools from '@/common/utils/tools.js'

// JSSDK 签名缓存：微信要求签名 URL 为不含 # 及后面部分的页面 URL（hash 路由下恒定），
// 同一站点 base URL 只需签名一次，避免每个页面重复请求、也避免并发重复 config
var jssdkCache = null;
export default {
	//判断是否在微信中
	isWechat: function() {

		// #ifdef MP-WEIXIN
		return false;
		// #endif
		var ua = window.navigator.userAgent.toLowerCase();
		if (ua.match(/micromessenger/i) == 'micromessenger') {
			return true;
		} else {
			return false;
		}
	},
	initJssdk: function(callback) {

		// 微信 JS-SDK 签名 URL 规则：取当前页面 URL 中 # 之前的部分（不含 hash）。
		// 带 # 的完整 URL 签名会 invalid signature（config 失败后分享/定位/支付全部失效）
		var pageUrl = window.location.href.split('#')[0];
		var uri = encodeURIComponent(pageUrl);

		if (jssdkCache && jssdkCache.uri === uri) {
			jssdkCache.promise.then(function(res) {
				if (callback) {
					callback(res);
				}
			}).catch(function() {});
			return;
		}

		var promise = api('wechat.jssdk', {
			uri: uri
		}).then(res => {
			jweixin.config({
				debug: res.data.debug,
				appId: res.data.appId,
				timestamp: res.data.timestamp,
				nonceStr: res.data.nonceStr,
				signature: res.data.signature,
				jsApiList: res.data.jsApiList
			});
			return res.data;
		}).catch(function() {
			// 签名获取失败：清除缓存允许下次重试（如 jsapi_ticket 异常后恢复）
			if (jssdkCache && jssdkCache.uri === uri) {
				jssdkCache = null;
			}
		});

		jssdkCache = {
			uri: uri,
			promise: promise
		};
		promise.then(function(res) {
			if (res && callback) {
				callback(res);
			}
		}).catch(function() {});
	},
	//在需要定位页面调用
	getlocation: function(callback) {
		if (!this.isWechat()) {
			return;
		}
		this.initJssdk(function(res) {
			jweixin.ready(function() {
				jweixin.getLocation({
					type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
					success: function(res) {

						callback(res)
					},
					fail: function(res) {},
				});
			});
		});
	},
	/**
	 * 分享图片地址规范化：微信分享卡片要求 https 可访问的绝对地址
	 * 相对路径（/uploads/...）补全为站点绝对地址；// 开头补 https: 协议头
	 */
	formatShareImage: function(url) {
		if (!url || typeof url !== 'string') {
			return '';
		}
		url = url.trim();
		if (!url) {
			return '';
		}
		if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
			return url;
		}
		if (url.indexOf('//') === 0) {
			return 'https:' + url;
		}
		if (url.indexOf('/') === 0) {
			return window.location.origin + url;
		}
		return url;
	},
	share: function(data, callback) { 
		if (!this.isWechat()) {
			return;
		}
		var self = this;
		this.initJssdk(function(res) {
			jweixin.ready(function() {

				var imageUrl = data.imageUrl || data.imgUrl || tools.systemConfig('logo') || '';
				imageUrl = self.formatShareImage(imageUrl);

				//朋友圈卡片不展示描述，仅标题/链接/封面
				var shareData = {
					title: data.title,
					desc: data.desc || '打开查看详情',
					link: data.path || data.link,
					imgUrl: imageUrl,
					success: function(res) {
						callback(res)
					},
					cancel: function(res) {}
				};
				var timelineShareData = {
					title: data.title,
					link: data.path || data.link,
					imgUrl: imageUrl,
					success: shareData.success,
					cancel: shareData.cancel
				};

				//新版分享接口（官方推荐；老接口 onMenuShare* 已废弃，部分新版微信不生效导致卡片无封面）
				if (typeof jweixin.updateAppMessageShareData === 'function') {
					jweixin.updateAppMessageShareData(shareData);
				}
				if (typeof jweixin.updateTimelineShareData === 'function') {
					jweixin.updateTimelineShareData(timelineShareData);
				}
				//老接口兜底，兼容旧版本微信 JSSDK
				jweixin.onMenuShareAppMessage(shareData);
				jweixin.onMenuShareTimeline(timelineShareData);


			});
		});

	},
	openLocation: function(data, callback) { //打开位置
		if (!this.isWechat()) {
			return;
		}
		this.initJssdk(function(res) {
			jweixin.ready(function() {
				jweixin.openLocation({ //根据传入的坐标打开地图
					latitude: data.latitude,
					longitude: data.longitude
				});
			});
		});
	},
	chooseImage: function(callback) { //选择图片
		if (!this.isWechat()) {
			return;
		}
		this.initJssdk(function(res) {
			jweixin.ready(function() {
				jweixin.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album'],
					success: function(rs) {
						callback(rs)
					}
				})
			});
		});
	},
	//微信支付
	wxpay: function(data, callback) {
		if (!this.isWechat()) {
			// 非微信环境无法调起公众号支付，明确提示而非静默返回
			uni.$u.toast('请在微信中打开后再支付');
			return;
		}

		this.initJssdk(function(res) {
			jweixin.ready(function() {
				jweixin.chooseWXPay({
					timestamp: data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
					nonceStr: data.nonceStr, // 支付签名随机串，不长于 32 位
					package: data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
					signType: data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
					paySign: data.paySign, // 支付签名
					success: function(res) {
						callback(res)
					},
					fail: function(res) {
						callback(res)
					},
					cancel: function(res) {
						// 取消支付同时会触发 fail 回调，由调用方统一处理，此处不再提示
					},
				});
			});
		});
	}
}
