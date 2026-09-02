import Request from './request'
import apiList from './api_list'
// import store from '@/common/store/index.js'
var loginTipShow = false;
export default function api(url, data = {}) {
	const request = new Request();
	console.log("url",url)
	let api = getApiObj(url);
	request.interceptor.request((config, cancel) => { /* 请求之前拦截器 */
		if (api.auth) {
			let token = uni.getStorageSync('user_token');
			if (!token) {
				// 必须 cancel 而不是仅 return：拦截器返回 undefined 时，
				// request() 会把配置展开为空对象，uni.request 以空配置静默执行且永不回调，
				// Promise 永不 settle，调用方（发布/提交等）会静默挂起、loading 卡死页面。
				cancel('未登录，已阻止该请求');
				tipLogin();
				return;
			}
		}
		if (uni.getStorageSync('user_token')) {
			config.header.token = uni.getStorageSync('user_token');
		}
		return config
	});

	request.interceptor.response((response) => { /* 请求之后拦截器 */
		if (response.data.code === 0) { // 服务端返回的状态码不等于200，则reject()
			uni.showToast({
				title: response.data.msg || '请求出错,稍后重试',
				icon: 'none',
				duration: 1000,
				mask: true
			});
			uni.hideLoading();
		}

		if (response.data.code === 401) { // 服务端返回的状态码不等于200，则reject()
			uni.removeStorageSync('user_token');
			uni.removeStorageSync('user_info');
			console.log("loginTipShow",loginTipShow,api)
			tipLogin();

		}
		// if (response.config.custom.verification) { // 演示自定义参数的作用
		//   return response.data
		// }
		return response
	}, (response) => { // 预留可以日志上报
		return response
	})

	return request.request({
		url: api.url,
		data,
		method: api.method
	})

}

function tipLogin(){
	// #ifdef MP
	var currentPath = getCurrentPages()[(getCurrentPages().length - 1)].$page.fullPath;
	// #endif
	// #ifdef H5
	var currentPath = getCurrentPages()[(getCurrentPages().length - 1)].__page__.fullPath;
	// #endif
	uni.hideLoading();

	// 登录页自身触发的 401 不记录返回路径，也不重复弹窗
	if (currentPath.indexOf('pages/public/login/login') !== -1) {
		return false;
	}
	if(loginTipShow){
		return false;
	}
	// 仅在首次弹出登录提示时记录当前路径，避免后续 401 覆盖登录后的回跳目标
	uni.setStorageSync('first_path', currentPath);
	loginTipShow = true;
	
	uni.showModal({
		title: '提示',
		content: '请登录后继续操作',
		cancelText: '返回首页',
		confirmText:"去登录",
		success: function (res) {
			loginTipShow = false;
			
			if (res.confirm) {

				//记住当前的路径，登录后跳转
				// // #ifdef MP-WEIXIN || MP-TOUTIAO
				// let pages = getCurrentPages()    //获取加载的页面
				// let currentPage = pages[pages.length - 1]    //获取当前页面的对象
				// var path = currentPage.$page.fullPath;
				// var pageInfo = currentPage.$page;
				// // #endif

				// // #ifdef H5
				// var pageInfo = this.pageInfo;
				// const path = window.location.hash;
				// // #endif

				// uni.redirectTo({
				// 	url: '/pages/public/login/login?redirect='+encodeURIComponent(path)
				// })

				uni.redirectTo({
					url: '/pages/public/login/login'
				})
			} else{
				uni.reLaunch({
				url: '/pages/index/index'
			});
			}
		}
	});
}

function getApiObj(url) {
	let apiArray = url.split(".");
	let api = apiList;
	apiArray.forEach(v => {
		api = api[v];
	});
	return api;
}
