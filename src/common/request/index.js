import Request from './request'
import apiList from './api_list'
// 付费插件（拼团/送好友）闸门：未安装 / 本会话 init 还没回包时，插件地址一律不发网络请求
// （用户 2026-10-27 点名「如果没有安装插件前端请求对应的初始化接口会报错。要做好适配」）
import { pluginOfUrl, canRequestPlugin, markPluginMissing } from '@/common/utils/plugin-guard'
// import store from '@/common/store/index.js'
var loginTipShow = false;
export default function api(url, data = {}, extra = {}) {
	const request = new Request();
	console.log("url",url)
	let api = getApiObj(url);
	// **发出前先过插件那道闸门**：`app/group_buy/…` / `app/send_friend/…` 只有在
	// 「本会话 init 已回包 ∧ 那一枚 app_isinstall_* 为真」时才发得出去。
	// 拦下来的是**一条静默的 reject**（不带 toast）：未安装是「功能不存在」，不是用户操作失败；
	// 调用方各自的退出分支（组件 hide、页面空态/退回）照旧接管。
	const pluginTag = pluginOfUrl(api.url);
	if (pluginTag && !canRequestPlugin(api.url)) {
		return Promise.reject({ errMsg: 'plugin-not-installed:' + pluginTag, plugin: pluginTag });
	}
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
			// 第三参带 custom.noToast 的那一发只免这一句 toast（401 的登录引导、reject 分支、
			// hideLoading 都不受影响）。要这一档的都是**不是用户点出来的**请求（进房自动发的归因
			// 上报那一族）：这一句黑 toast 是 1 秒 + mask，受邀人刚进直播间就凭空冒出来，
			// 2026-10-06 用户点名「被邀请的用户进入直播间后，不要弹出来」；失败的原因改由调用点
			// 落 console（口径同 invite_rank.rank.report——后端那一发对什么都不 error，天然静默）。
			// 不带的调用点行为一字不变。
			// 付费插件「XX功能未安装」：后端说了这句话 = 插件代码不在盘上（`app.php` 版本号还在的那一档）。
			// 这一句不是用户操作失败，不许弹全局 toast；就地 mark => 本会话 flags 静默、后续请求由上面的闸门拦掉
			const pluginMissingMsg = !!pluginTag && /未安装/.test(String(response.data.msg || ''));
			if (pluginMissingMsg) { markPluginMissing(pluginTag); }
			if (!pluginMissingMsg
				&& !(response.config && response.config.custom && response.config.custom.noToast)) {
				uni.showToast({
					title: response.data.msg || '请求出错,稍后重试',
					icon: 'none',
					duration: 1000,
					mask: true
				});
			}
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
		// 插件控制器整个目录都不在盘时是 404（ThinkPHP 找不到控制器）：同样按「未安装」收口，
		// 不再让页面停在「网络异常」那一句。500 不在此列（可能是真的服务故障，不许扩大成「插件不存在」）
		if (pluginTag && response && Number(response.statusCode) === 404) { markPluginMissing(pluginTag); }
		return response
	})

	return request.request({
		url: api.url,
		data,
		method: api.method,
		// 逐请求的开关走 luch-request 的 custom（request.js 把它留在 handleRe 里，
		// response.config.custom 读得到；发给 uni.request 的那份副本才删掉）
		custom: { ...(extra.custom || {}) }
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
