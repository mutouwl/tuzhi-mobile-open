/**
 * Wechat v1.0.0
 * @Class Wechat
 * @description shopro-wechat 1.0.0 wehcat第三方登录组件
 * @Author llidongtony
 * @Date 2020-02-19
 * @Email lidongtony@qq.com
 */
import api from '@/common/request/index';
// import store from '@/common/store'
// import router from '@/common/router'
import tools from '../utils/tools';

export default class Wechat {

	async login() {
		let token = '';
		// if (router.$Route.path.indexOf('public/login') == -1) {
		// 	uni.setStorageSync('fromLogin', router.$Route);
		// }
		// #ifdef MP-WEIXIN
		// store.commit('FORCE_OAUTH', true);
		// #endif
		// #ifdef H5
		this.wxOfficialAccountLogin();
		// #endif
		// #ifdef APP-PLUS
		token = await this.wxOpenPlatformLogin();
		return token;
		// #endif
	}
	// #ifdef H5

	wxOfficialAccountLogin() {
		let oUrl = window.location.href;
		var url = encodeURIComponent(config.apiUrl);
		var share = uni.getStorageSync('share');
		window.location = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + tools.systemConfig('app_id') +
			`&redirect_uri=${url}user/info/wxAccountLogin/share/` + share + `/&response_type=code&scope=snsapi_userinfo&state=` +
			oUrl;
		throw 'stop';
	}
	//临时登录获取OpenId 不入库不绑定用户

	wxOfficialAccountOauth() {
		var pages = getCurrentPages();
		var pagepath = pages[pages.length - 1].__page__.fullPath;
		pagepath = pagepath.substring(1).replace(/\//g, '-').replace(/\?/g, 'wenhao').replace(/\&/g, 'lianjie')

		pagepath = encodeURIComponent(pagepath);


		// return false; 
		let oUrl = window.location.href;

		var url = url = encodeURIComponent(config.apiUrl)
		let token = uni.getStorageSync('user_token');
		var share = uni.getStorageSync('share');
		//首次进入 没有登录 保存
		var locationUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + tools.systemConfig('app_id') +
			`&redirect_uri=${url}user/info/wxOauth/token/` + token + `/share/` + share + `/path/` + pagepath + `&response_type=code&scope=snsapi_base&state=` +
			oUrl;
		window.location = locationUrl;
		throw 'stop';
	}
	// #endif

	wxOpenPlatformLogin() {
		let that = this;
		return new Promise((resolve, reject) => {
			uni.login({
				provider: 'weixin',
				success: function (loginRes) {
					if (loginRes.errMsg === "login:ok") {
						let authResult = loginRes.authResult;
						uni.getUserInfo({
							provider: 'weixin',
							success: function (infoRes) {
								if (infoRes.errMsg === "getUserInfo:ok") {
									let userInfo = infoRes.userInfo;
									api('user.wxAccountLogin', {
										authResult: authResult,
										userInfo: userInfo
									}).then(res => {
										if (res.code === 1) {
											resolve(res.data.token);
										}
									});
								}
							},
							fail: function (res) {
								// api('dev.debug', {
								// 	info: res
								// })
							}
						});
					}
				},
				fail: function (res) {
				}
			});
		});
	}

	// #ifdef MP-TOUTIAO
	getDyMiniProgramSessionKey(isLogin = false) {
		let that = this;
		let sessionStatus = false;
		let session_key = '';
		return new Promise((resolve, reject) => {
			uni.checkSession({
				success(res) {
					if (res.errMsg === 'checkSession:ok') sessionStatus = true;
				},
				complete() {
					if (!uni.getStorageSync('session_key') || !uni.getStorageSync('user_openid') || !sessionStatus) {
						tt.login({
							force: true,
							success(info) {
								let code = info.code;
								api('user.info.getDyMiniProgramSessionKey', {
									code: code,
								}).then(res => {
									if (res.code === 1) {
										uni.setStorageSync('session_key', res.data.session_key);
										uni.setStorageSync('user_openid', res.data.openid);
										session_key = res.data.session_key;
										if (isLogin) {
											that.dyMiniProgramLogin(false)
										}

									} else {
										tt.showToast({
											title: info.msg,
											icon: 'none'
										});
									}
								});
							},
							fail(res) {
								tt.showToast({
									title: '登录失败,请重试',
									icon: 'none'
								});
							},
						});
					} else {
						session_key = uni.getStorageSync('session_key');
					}
				}
			})

			resolve(session_key);
		});

	}
	dyMiniProgramLogin(isLogin = true) {
		let that = this;

		if ((!uni.getStorageSync('session_key') || !uni.getStorageSync('user_openid')) && isLogin) {
			return this.getDyMiniProgramSessionKey(true);
		}

		return new Promise((resolve, reject) => {
			uni.getUserProfile({
				withCredentials: true,
				success(ret) {

					if (ret.errMsg === "getUserProfile:ok") {
						var shareId = uni.getStorageSync('share');
						var openid = uni.getStorageSync('user_openid');
						api('user.info.dyMiniProgramLogin', {
							session_key: uni.getStorageSync('session_key'),
							encryptedData: ret.encryptedData,
							iv: ret.iv,
							signature: ret.signature,
							share: shareId,
							openid: openid,
						}).then(res => {
							resolve(res);
						});
					}

				},
				fail(res) {
					console.log("getUserProfile 调用失败", res);
				},
			});
		});
	}

	// #endif

	// #ifdef MP-WEIXIN
	getWxMiniProgramSessionKey(force = false) {
		let that = this; 
		let sessionStatus = false;
		return new Promise((resolve, reject) => {
			const refreshSessionKey = () => {
				uni.login({
					success: function (info) {
						let code = info.code;
						api('user.info.getWxMiniProgramSessionKey', {
							code: code,
						}).then(res => {
							if (res.code === 1) {
								uni.setStorageSync('session_key', res.data.session_key);
								uni.setStorageSync('user_openid', res.data.openid);
								resolve(res.data.session_key);
								// uni.showToast({
								// 	title: '获取用户信息成功,请继续操作',
								// 	duration: 1300
								// });
							} else {
								reject(res);
							}
						}).catch(reject);
					},
					fail: reject
				});
			};

			uni.checkSession({
				success(res) {
					if (res.errMsg === 'checkSession:ok') sessionStatus = true;
				},
				complete() {
					if (force || !uni.getStorageSync('session_key') || !sessionStatus) {
						refreshSessionKey();
					} else {
						resolve(uni.getStorageSync('session_key'));
					}
				}
			});
		});
	}

	wxMiniProgramLogin(e) {
		let that = this;
		return new Promise((resolve, reject) => {
			if (e.detail.errMsg === "getUserInfo:ok") {
				var shareId = uni.getStorageSync('share');
				
				api('user.info.wxMiniProgramLogin', {
					session_key: uni.getStorageSync('session_key'),
					encryptedData: e.detail.encryptedData,
					iv: e.detail.iv,
					signature: e.detail.signature,
					share: shareId
				}).then(res => {
					// if (res.code === 1) {
					// 	resolve(res.data.token);
					// }
					resolve(res);
				});
			}
		});
	}

	checkMiniProgramUpdate() {
		let updateManager = uni.getUpdateManager();
		updateManager.onCheckForUpdate(function (res) {
			// 请求完新版本信息的回调
		});
		updateManager.onUpdateReady(function (res) {
			uni.showModal({
				title: '更新提示',
				content: '新版本已经准备好，是否重启应用？',
				success(res) {
					if (res.confirm) {
						// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
						updateManager.applyUpdate();
					}
				}
			});
		});
		updateManager.onUpdateFailed(function (res) {
			// 新的版本下载失败
		});
	}

	// #endif


}
