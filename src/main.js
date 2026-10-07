import Vue from 'vue'
import App from './App'

// TDesign 样式
import '@/common/tdesign-theme.css';



import api from '@/common/request/index';
import request from '@/common/request/request';
import tools from '@/common/utils/tools';
import nav from '@/common/utils/router';
import sls from '@/common/utils/log-sls';



Vue.config.productionTip = false
Vue.config.devtools = true
Vue.prototype.$api = api;
Vue.prototype.$request = request;
Vue.prototype.$tools = tools;
Vue.prototype.$nav = nav;
Vue.prototype.$sls = sls;

// #ifdef MP-TOUTIAO
import CN from '@/components/language/zh-CN.js'
Vue.prototype.$t = function(key){
  return CN[key];
}
// #endif

// #ifdef MP-WEIXIN || MP-TOUTIAO
Vue.prototype.$titleBarHeight = 0;
// #endif
// #ifdef H5
Vue.prototype.$titleBarHeight = 40;
setTimeout(function(){
  uni.getSystemInfo({
    success: function (res) {
      Vue.prototype.$titleBarHeight = res.windowTop;
    }
  })
},1000)
// #endif



App.mpType = 'app'

function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}

uni.addInterceptor({
  returnValue(res) {
    if (!isPromise(res)) {
      return res;
    }
    return new Promise((resolve, reject) => {
      res.then((res) => {
        if (res[0]) {
          reject(res[0]);
        } else {
          resolve(res[1]);
        }
      });
    });
  },
});


// import uView from 'uview-ui';
import uView from '@/components/uview-ui/index.js';
Vue.use(uView);

uni.$u.setConfig({
    // 修改$u.config对象的属性
    config: {
        // 修改默认单位为rpx，相当于执行 uni.$u.config.unit = 'rpx'
        unit: 'px'
    },
    // 修改$u.props对象的属性
    props: {
        tabs:{
            lineColor:"#0968f6",
            inactiveStyle: {
              color:"#999",
              fontWeight:400
            }
        },
        // switch:{
        //     activeColor:"#0052d9"
        // },
        // checkbox:{
        //     activeColor:"#0052d9",  
        // },
        // line:{
        //     color:"#F0F3F5"
        // }
        // 修改radio组件的size参数的默认值，相当于执行 uni.$u.props.radio.size = 30
        // radio: {
        //     size: 15
        // }
        // 其他组件属性配置
        // ......
    }
})


//绑定手机号全局组件
import bindMobileModal from "@/components/modal/bind-mobile.vue";
Vue.component('bindMobileModal', bindMobileModal)

import i18n from '@/components/language/index.js';
const app = new Vue({
  i18n,
  ...App
})

// #ifdef H5
import wxsdk from '@/common/wechat/sdk'
Vue.prototype.$wxsdk = wxsdk;

/**
 * 微信 H5 全局分享兜底：每个页面 onShow 先设置默认分享（系统名 + 系统 logo + 引导文案），
 * 保证固定页面/列表页分享卡片也有图片与文案；详情页数据加载完成后用内容标题/封面覆盖。
 * mixins 钩子先于页面自身钩子执行，页面 onShow 自定义分享不冲突；
 * sdk 签名按 URL 缓存，页面切换不再重复请求 jssdk 接口。
 */
Vue.mixin({
	onShow() {
		if (this.$wxsdk && this.$nav && this.$wxsdk.isWechat()) {
			this.$nav.share();
		}
	}
});
// #endif

/**
 * 骨架屏看门狗（全端）：首屏 loading 超过 8 秒还没撤，就自己落到「带原因的空态」。
 * 为什么要有这一条：这一族问题（过期响应 return 不关 loading、插件兜底 return 不关 loading、
 * 请求既不 resolve 也不 reject）已经反复被点名，逐个分支补出口是必要的，但**只要还有一支漏了，
 * 用户看到的就是无限灰块 + 整页按钮像死掉**，而且控制台不报错、远程无从定位。
 * 兜底不改变正常路径（loading 一翻 false 就立刻撤表并解绑），只保证「不会有第二种的永久骨架屏」。
 */
Vue.mixin({
	onLoad() {
		const vm = this;
		if (!vm.$data || vm.$data.loading !== true) return;
		const unwatch = vm.$watch('loading', (v) => {
			if (v === false) {
				clearTimeout(vm.__skTimer);
				vm.__skTimer = null;
				unwatch();
			}
		});
		vm.__skTimer = setTimeout(() => {
			vm.__skTimer = null;
			if (vm.$data.loading !== true) return;
			// 把原因写进这一页已有的那句空态文案键上（loadMsg / failMsg / errorMsg 三档命名都认）
			['loadMsg', 'failMsg', 'errorMsg'].some((k) => {
				if (!(k in vm.$data)) return false;
				vm[k] = '加载超时，请下拉刷新重试';
				return true;
			});
			vm.loading = false;
		}, 8000);
	},
	onUnload() {
		if (this.__skTimer) {
			clearTimeout(this.__skTimer);
			this.__skTimer = null;
		}
	}
});

/**
 * 视图层推送的统一闸门（MP 端）：页面一旦出栈，就丢弃它（以及它内部组件）的 setData。
 *
 * 为什么必须在唯一出口上拦，而不是逐个体检异步回调（2026-09-27 实测，详见 ui-baseline-mobile.md M26）：
 *  · 页面返回时，仍在路上的异步结果（图片 @load、量宽回调、观察器、接口 .then、定时器续跑…）
 *    会在页面卸载后写 data；这一次写入会走 Vue patch → 对一个已经出栈的页面调 setData；
 *  · 这一次推送落进死页面，微信运行时就地抛 `TypeError`，顺着 `__patch__` 冒到 uni 的调度队列上；
 *    处理不好就**把整条 setData 通道拖死**：所有页面停在首屏（视图层 `p.data.loading` 恒为 true、真实节点
 *    从不渲染）、所有点击都像失灵、接口却全是 200 —— 症状与「请求没有回调」一模一样。
 *  · **归因更正（2026-09-28 同日）**：报错原文 `Cannot read properties of null (reading 'mutouweb')`
 *    （mutouweb = tuzhi.mutouweb.com 的二级域）**不是出栈**，是「图片地址当 data 键」被 setData 当成嵌套路径
 *    解析（uni 的 `_diff` 用点拼键），见 ui-baseline-mobile.md M27 与 common/utils/mp-data-key.js。
 *    本项目先按出栈修了三轮保护罩，海报那一处始终没治好，就是这个原因。
 *  · 逐回调补 `gone()` 只是补救：组件实例未必被 `$destroy` 级联到，`_isDestroyed` 可能是 false（实测），
 *    漏一个入口就复发；而在出口拦一次，是**把这一整类「晚到的写入」全部挡掉**。
 *
 * 放行规则（宁可漏挡不可误挡）：
 *  · 解析不到所属页面（实例已被摘链）→ 放行；
 *  · 所属页面还在页面栈里（含隐藏页）→ 放行，不改变正常行为；
 *  · 所属页面**登记过、现在已经出栈** → 丢弃这一次推送（那一页已经没人看得见，丢掉不会有任何可见影响）；
 *  · 所属页面**从未登记**（组件首帧推送早于页面 onLoad）→ 放行。这一条是必须的：
 *    只看「在不在栈里」会把首帧内容一起吞掉（实测症状：我的打卡首帧 Tabs 文字空白，切一次 Tab 才出来）。
 */
const livePages = new Set();
// 曾经登记过的页面（onLoad 加入、onUnload 不删）：用来把「已经出栈」与「还没轮到 onLoad」区分开
const knownPages = new Set();
// 计数用本地对象（不直接依赖 globalThis：老基础库上 globalThis 不存在的话，写在模块顶层会让整包加载失败）；
// 再尽力暴露到 globalThis 供真机/模拟器自查（微信 V8 支持，失败静默）
const guardStats = { dropped: 0, allowed: 0, unresolved: 0, unregistered: 0, known: 0, live: 0, lastDroppedRoute: '', patchErrors: 0, setDataErrors: 0, watchErrors: 0, nextTickErrors: 0, stalled: 0, lastStallAt: 0, _wdArmed: false, where: '', lastPatchError: '', lastWatchError: '', lastNextTickError: '', lastSetDataError: '', pendingHealed: 0, lastTell: '' };
try { globalThis.__setDataGuard = guardStats; } catch (e) {}

/** 推送回调等多久没回来就当「在途标志卡死」（见 guardSetData 里那只看门表）
 *  取 1s：正常回调是视图层应用完这次更新就回来（毫秒级到几十毫秒），1s 只兜「根本不回来」的那种 */
const PENDING_STALL_MS = 1000;

/**
 * 被吞掉的异常必须在控制台留一声（同一类节流 3 秒，避免逐帧刷屏）
 *
 * 为什么非要有它：下面这几处 catch 是「一次异常不再废掉全 App 视图」的代价，
 * 但**静默吞掉会让下一次复现变成瞎子摸象**——2026-09-28 用户报「分享弹窗一直加载中、关不掉，
 * 包括最新版本」时，Console 里一条错误都没有（全被这里吞了），根因只能靠猜。
 * 真机/模拟器上除看这条日志，还可以直接读 globalThis.__setDataGuard 里那几枚 last* 快照。
 */
function guardTell(kind, detail) {
	try {
		const now = Date.now();
		guardStats.lastTellAt = guardStats.lastTellAt || {};
		if (now - (guardStats.lastTellAt[kind] || 0) < 3000) return;
		guardStats.lastTellAt[kind] = now;
		guardStats.lastTell = kind + ' | ' + detail;
		console.error('[setData-guard] ' + kind + '：' + detail);
	} catch (e) {
		// 记日志本身绝不抛
	}
}

/**
 * 所属页面此刻还在不在页面栈里（权威判据：getCurrentPages，不依赖 onLoad 的登记时机）。
 *
 * 2026-09-28 实测补这一刀的原因：原来只按「登记过 且 已出栈」丢，**从未登记过的实例一律放行**，
 * 而 reLaunch / 连续进出同一页时，被微信销毁的那一页的组件正好落在「从未登记」这一档
 * （实测 unregistered 1929 次、setDataErrors 7 次；**注：那几条 `reading 'mutouweb'` 后来查明是 M27
 * 那一族「地址当 data 键」，不是出栈**，本闸门只挡出栈这一族，两族的症状文本撞车过）——放行即打到一个微信已经不认的页面上，
 * 抛错被吞掉之后**那一页的视图通道仍然废了**：逻辑层每一级都已是 show=false，屏幕上弹窗纹丝不动，
 * 之后再点这页任何入口都不再渲染（用户读出来就是「关闭按钮和遮罩层都点不动」）。
 * 判据换成栈本身：在栈里（含首帧，页面实例先于组件首帧推送就在栈里）⇒ 照常推；不在 ⇒ 丢。
 * 取不到栈（异常）时按「在」处理——宁可漏挡不可误挡。
 */
function ownerInStack(owner) {
	if (!owner) return false;
	try {
		const stack = (typeof getCurrentPages === 'function' && getCurrentPages()) || [];
		for (let i = 0; i < stack.length; i++) {
			const p = stack[i];
			if (p === owner || (p && p.$vm === owner)) return true;
		}
		return false;
	} catch (e) {
		return true;
	}
}

/**
 * 自愈：把「在途推送标志」卡死的页面拉回来。
 *
 * uni-app 的页面级差量推送靠实例上的 `__next_tick_pending` 串行化：置 true → 发 setData → 回调里复位。
 * 一旦这一次 setData 抛出（就是本文件上面那一族「对已出栈页面推送 ⇒ 微信 _updateValues 抛 TypeError」），
 * 复位回调跑不到，标志**永远停在 true**；此后这一页的所有更新都被并进一个再也不会落地的批次里 ——
 * 症状是逻辑层每一级都改了、屏幕上纹丝不动（2026-09-28 用户点名的「分享弹窗点关闭、点遮罩都退不出去」，
 * 实测 `page.__next_tick_pending === true` 且改数据后视图停在打开海报那一帧，而推送计数还在走）。
 * 判据保守：连续两次看到它是 true（间隔 >1.2s）才认定卡死，清掉标志并补一次重渲染，把这一页的当前状态重推一遍。
 */
function healStuckPending(owner) {
	if (!owner) return;
	try {
		if (owner.__next_tick_pending !== true) {
			owner.__nextTickStuckAt = 0;
			return;
		}
		const now = Date.now();
		if (!owner.__nextTickStuckAt) {
			owner.__nextTickStuckAt = now;
			return;
		}
		if (now - owner.__nextTickStuckAt < 1200) return;
		owner.__next_tick_pending = false;
		owner.__nextTickStuckAt = 0;
		guardStats.pendingHealed = (guardStats.pendingHealed || 0) + 1;
		if (typeof owner.$forceUpdate === 'function') owner.$forceUpdate();
	} catch (e) {
		// 自愈失败不影响这一次推送本身
	}
}

function ownerPageOf(vm) {	// 先看缓存（同一个 $scope 反复推送时不重复走链）
	const scope = vm && vm.$scope;
	if (scope && scope.__guardOwner) return scope.__guardOwner;
	let v = vm;
	let hops = 0;
	while (v && hops < 25) {
		// ⚠ 标记是 vm.mpType（uni-app 设在实例上，不带 $ 前缀），不是 $mpType ——
		// 写成 $mpType 会永远解析不出页面，闸门退化成"全部放行"（2026-09-27 实测 unresolved 452/452）
		if (v.mpType === 'page' || v.$mpType === 'page') {
			if (scope) scope.__guardOwner = v;
			return v;
		}
		v = v.$parent;
		hops++;
	}
	// 解析不出来**不缓存**：缓存的 null 会让这个 scope 从此永远走「放行」那一支，
	// 而解析不出的这一类正是「晚到回调打到已出栈页面」最可能的入口；走链本身很便宜
	return null;
}

function guardSetData(vm) {
	const scope = vm && vm.$scope;
	if (!scope || scope.__guardInstalled || typeof scope.setData !== 'function') return;
	scope.__guardInstalled = true;
	const orig = scope.setData;
	scope.setData = function (data, cb) {
		try {
			const owner = ownerPageOf(vm);
			healStuckPending(owner);
			// 两个集合的规模也报出来：真机复现时可据此判断"登记是否在正常发生"
			guardStats.known = knownPages.size;
			guardStats.live = livePages.size;
			if (owner === null) {
				guardStats.unresolved++;
			} else if (ownerInStack(owner)) {
				// 还在页面栈里（含隐藏页、含首帧）：照常推，与不装闸门时一致
				if (!livePages.has(owner)) guardStats.unregistered++;
				guardStats.allowed++;
			} else {
				// 已经不在栈里：这一页没人看得见，而微信对它的数据推送会抛（见 ownerInStack 那段实测）
				guardStats.dropped++;
				if (!knownPages.has(owner)) guardStats.unregistered++;
				guardStats.lastDroppedRoute = (owner.$page && owner.$page.route) || owner.route || '';
				try { if (vm && vm.__next_tick_pending) vm.__next_tick_pending = false; } catch (e2) {}
				return;
			}
		} catch (e) {
			// 闸门自身绝不抛：判不出来就放行，保持与不装闸门时一致
		}
		let stallTimer = 0;
		try {
			// uni-app 的差量推送把「复位在途标志」放在 setData 的**回调**里
			// （common/vendor.js：`this.__next_tick_pending=!0, n.setData(a, () => { r.__next_tick_pending=!1; ... })`），
			// 而 queueWatcher 在标志为 true 时**不再入队**、只把这一拍塞进 __next_tick_callbacks
			// ⇒ 回调一旦跑不到（这次 setData 抛错、或页面销毁导致回调不回），这一页的视图就永久停更：
			// 逻辑层每一级都改了、屏幕上纹丝不动（用户读出来就是「弹窗一直加载中，点关闭也没反应」）。
			// 所以每一次推送都配一只看门表：回调到点没回来就当标志卡死，复位并补一次重渲染。
			// （这条自愈必须由推送本身武装：标志卡死后 queueWatcher 不再入队 ⇒ 渲染那一层再也不会被调用）
			const args = Array.prototype.slice.call(arguments);
			const cb = args[1];
			let acked = false;
			args[1] = function () {
				acked = true;
				clearTimeout(stallTimer);
				if (typeof cb === 'function') return cb.apply(this, arguments);
			};
			stallTimer = setTimeout(function () {
				if (acked) return;
				try {
					if (!vm || vm.__next_tick_pending !== true) return;
					vm.__next_tick_pending = false;
					guardStats.pendingHealed = (guardStats.pendingHealed || 0) + 1;
					const ownerNow = ownerPageOf(vm);
					guardTell('在途推送标志卡死（setData 回调没回来），已复位并补一次重渲染',
						((ownerNow && (ownerNow.route || (ownerNow.$page && ownerNow.$page.route))) || '?') + '');
					if (typeof vm.$forceUpdate === 'function') vm.$forceUpdate();
				} catch (e) {
					// 自愈失败不影响这一次推送本身
				}
			}, PENDING_STALL_MS);
			return orig.apply(this, args);
		} catch (e) {
			clearTimeout(stallTimer);
			// ★ 关键之一：微信运行时对「已出栈页面」的 setData 会抛 TypeError，而这一抛会顺着
			// __patch__ 冒到 Vue 的 flushSchedulerQueue，打断整个调度循环（waiting 不再复位）
			// ⇒ 从此全 App 的视图都不再更新（所有页面停在首屏、点击像失灵、接口却全是 200）。
			// 这一层把它就地吞掉，绝不让它进调度队列。
			guardStats.setDataErrors = (guardStats.setDataErrors || 0) + 1;
			// 这一抛会让 uni-app 的差量推送回调跑不到，把它的 in-flight 标志复位，免得后续推送被跳过。
			// 页面级那一份也要一起复位：抛出点常在子组件的 scope 上，而卡住的是页面的那一个标志
			try {
				if (vm && vm.__next_tick_pending) vm.__next_tick_pending = false;
				const ownForReset = ownerPageOf(vm);
				if (ownForReset && ownForReset.__next_tick_pending) ownForReset.__next_tick_pending = false;
			} catch (e3) {}
			// 记下这条被吞掉的错误与它落在哪一页（真机调试时可直接读 globalThis.__setDataGuard.lastSetDataError）
			try {
				const own = ownerPageOf(vm);
				guardStats.lastSetDataError = (((own && (own.route || (own.$page && own.$page.route))) || '?') + ' | ' + String((e && e.message) || e)).slice(0, 160);
			} catch (e2) {
				guardStats.lastSetDataError = String((e && e.message) || e).slice(0, 160);
			}
			// 这一条以前是静默的：Console 里一条痕迹都没有，真机再报同族症状时无从下手（见 guardTell）
			guardTell('setData 抛错（已就地吞掉，否则整条调度队列会被打断）', guardStats.lastSetDataError);
			return undefined;
		}
	};
}

/**
 * 给「这一拍渲染/推送」包一层 try/catch（**这才是让 App 不再整片卡死的那一道**）。
 * 为什么必须在实例上包、而且要包 __patch__ 与 _update 两个：
 *  · 线上那条崩溃的栈是 `_update → __patch__ → setData`，异常从 setData 冒上来；
 *  · 只有把它拦在调度队列之外，flushSchedulerQueue 才能跑完、`waiting` 才能复位，
 *    后续所有页面的渲染才不会被一起带走（实测：一旦打断，连在栈的上一页也不再渲染）；
 *  · 顺带把「已出栈页面的这一拍」直接跳过，省掉一次注定失败的 setData。
 */
function wrapRenderFn(fn, key) {
	if (typeof fn !== 'function' || fn.__guardWrapped) return fn;
	const wrapped = function () {
		const self = this;
		try {
			const owner = ownerPageOf(self);
			// 补装一次闸门：mount 之后才建出来的 scope、或首帧那一刻还没解析出所属页面的实例，
			// 它自己的 setData 可能一直没被包上（包过就立刻返回，代价是一次属性读取）
			guardSetData(self);
			// 顺带自愈一次：渲染这一拍跑得起来，说明调度队列还在动，这一刻修标志最安全
			healStuckPending(owner);
			guardStats.known = knownPages.size;
			guardStats.live = livePages.size;
			if (owner && !ownerInStack(owner)) {
				// 同 guardSetData 那一条：出栈页面的这一拍直接跳过（判据见 ownerInStack）
				guardStats.dropped++;
				guardStats.where = key;
				if (!knownPages.has(owner)) guardStats.unregistered++;
				guardStats.lastDroppedRoute = (owner.route || (owner.$page && owner.$page.route) || '') + '';
				return;
			}
			if (owner === null) guardStats.unresolved++;
			else guardStats.allowed++;
		} catch (e) {
			// 判不出来就照常渲染
		}
		try {
			return fn.apply(self, arguments);
		} catch (e) {
			guardStats.patchErrors = (guardStats.patchErrors || 0) + 1;
			guardStats.lastPatchError = String((e && e.message) || e).slice(0, 120);
			// 这一拍被整拍丢掉了（数据没推到视图层）：必须留一声，否则界面上只表现为「没反应」
			guardTell('渲染这一拍抛错（已跳过这一拍，视图这一轮不更新）', (guardStats.where || key) + ' | ' + guardStats.lastPatchError);
			return undefined;
		}
	};
	wrapped.__guardWrapped = true;
	return wrapped;
}

function guardPatch(vm) {
	['__patch__', '_update'].forEach(function (key) {
		const cur = vm[key];
		const wrapped = wrapRenderFn(cur, key);
		if (wrapped !== cur) {
			try {
				vm[key] = wrapped;
			} catch (e) {
				// 挂不上就算了：下面原型那一层 + setData 那一层都还有兜底
			}
		}
	});
}

Vue.mixin({
	onLoad() {
		knownPages.add(this);
		livePages.add(this);
		guardSetData(this);
	},
	onUnload() {
		livePages.delete(this);
		// 页面出栈后的几秒正是"晚到回调"最密集、最容易把调度队列打断的窗口：这时才武装看门狗
		armWatchdog();
	},
	created() {
		guardSetData(this);
		guardPatch(this);
		guardWatchers(this);
	},
	mounted() {
		guardSetData(this);
		guardPatch(this);
		guardWatchers(this);
		// 运行时可能在挂载后才把 __patch__/_update 挂上来、也可能后建 watcher：首帧之后补包一次
		this.$nextTick(() => {
			guardPatch(this);
			guardWatchers(this);
		});
	}
});

/**
 * 出口闸门第二道（**这一道才真正在推送路径上**）：框架把 Vue 的渲染结果推给视图层，走的不是 `$scope.setData`。
 * 实测（开发者工具，2026-09-28）：把 `loading` 这种模板绑定字段改掉，视图确实更新了，而 `$scope.setData` 上的
 * 计数一次都不动 —— 说明上面那个包装器只拦到"显式调用"，框架自己的推送绕过了它（这正是闸门装好后真机
 * 仍复现同一条崩溃的原因）。真正在路径上的是 Vue 的渲染出口 `_update`（用户贴的栈也正是
 * `_update → __patch__ → setData → _updateValues → TypeError`）。
 *
 * 所以在这里再拦一次：这一拍要渲染的实例，其所属页面已经出栈，就**整拍跳过**。跳过是安全的：那一页
 * 已经没人看得见，丢掉不会有任何可见影响；页面还在栈里时一律照常渲染。判据沿用三态（从未登记 = 放行），
 * 宁可漏挡不可误挡。
 */
// 本版 vue 的 __patch__/_update 都挂在**原型**上（vendor 里 `mn.prototype.__patch__=Yn`，
// 崩溃栈写作 `a.Yn [as __patch__]` 就是"原型方法被按属性调用"）。所以原型上也包一层，
// 覆盖所有没有自己那份实现的实例；已被包过的函数带 __guardWrapped，不会再被重复包。
['__patch__', '_update'].forEach(function (key) {
	const protoFn = Vue.prototype[key];
	const wrapped = wrapRenderFn(protoFn, key);
	if (wrapped !== protoFn) {
		try {
			Vue.prototype[key] = wrapped;
		} catch (e) {
			// 原型改不动就只靠实例层
		}
	}
});

/**
 * 第四道：`$nextTick` 回调也包住。
 * 为什么：Vue 的 nextTick 是"一批回调按顺序跑"，**这一批里任何一个抛异常，后面的回调就被跳过**——
 * 而 `queueWatcher` 早已把 `waiting` 置成 true，被跳过的那一个往往正是 flushSchedulerQueue 自己
 * ⇒ 调度从此永久停摆（与 flush 里抛异常同一类后果）。App 代码里大量用 `this.$nextTick(...)`，
 * 所以在这一层兜住最划算（内部实现里的 nextTick 无法覆盖，但业务代码这条路能收干净）。
 */
const origNextTick = Vue.prototype.$nextTick;
if (typeof origNextTick === 'function' && !origNextTick.__guardWrapped) {
	const guardedNextTick = function (cb, ctx) {
		if (typeof cb === 'function' && !cb.__guardWrapped) {
			const wrapped = function () {
				try {
					return cb.apply(this, arguments);
				} catch (e) {
					guardStats.nextTickErrors = (guardStats.nextTickErrors || 0) + 1;
					guardStats.lastNextTickError = String((e && e.message) || e).slice(0, 120);
					guardTell('$nextTick 回调抛错（已吞掉，免得后面排队的回调全被跳过）', guardStats.lastNextTickError);
					return undefined;
				}
			};
			wrapped.__guardWrapped = true;
			return origNextTick.call(this, wrapped, ctx);
		}
		return origNextTick.apply(this, arguments);
	};
	guardedNextTick.__guardWrapped = true;
	try {
		Vue.prototype.$nextTick = guardedNextTick;
	} catch (e) {
		// 改不动就算了：渲染那几道已经能保证 flush 不被打断
	}
}

/**
 * 自愈看门狗（只在"页面出栈后"那个高风险窗口里开，平时一次都不跑）。
 * 为什么需要它：我前面四道兜底覆盖的是"App 代码在 flush 里抛异常"；万一还有覆盖不到的一类
 * （例如运行时内部 nextTick 回调抛异常），`flushSchedulerQueue` 会被打断、`waiting` 再不复位，
 * 全 App 的视图从此永久停更——那是任何业务代码都救不回来的死局。这里做一次极轻的探活：
 * 让当前页 `$forceUpdate()` 走一遍正常调度，若连 `_update` 都没跑到（闸门计数不动）就判定停摆，
 * 立刻手动把在栈页面的渲染 watcher `run()` 一遍（**run() 不经过队列**），把界面补回来。
 * 代价：只在出栈后的 ~6 秒内、每 1.2 秒多一次"数据没变"的重渲染（diff 为空、几乎零传输）。
 */
function armWatchdog() {
	if (typeof setInterval !== 'function') return;
	if (guardStats._wdArmed) return;
	guardStats._wdArmed = true;
	let ticks = 0;
	const timer = setInterval(function () {
		ticks++;
		if (!livePages.size || ticks > 5) {
			clearInterval(timer);
			guardStats._wdArmed = false;
			return;
		}
		const before = guardStats.allowed;
		let probeRoute = '';
		try {
			const stack = getCurrentPages();
			const top = stack[stack.length - 1];
			probeRoute = (top && top.route) || '';
			// 只探"有活跃渲染 watcher 的在栈页面"：没有渲染 watcher 的实例本来就不会产生 _update（会误判成停摆）
			if (top && top.$vm && top.$vm._watcher && top.$vm._watcher.active && typeof top.$vm.$forceUpdate === 'function') {
				top.$vm.$forceUpdate();
			} else {
				guardStats._wdMiss = 0;
				return;
			}
		} catch (e) {
			// 探活本身出错就当没停摆
		}
		setTimeout(function () {
			try {
				const top2 = getCurrentPages()[getCurrentPages().length - 1];
				const route2 = (top2 && top2.route) || '';
				// 计数涨了 = 调度正常；路由变了 = 正在切页（这一拍的丢弃是应该的）⇒ 都不算停摆
				if (guardStats.allowed !== before || route2 !== probeRoute) {
					guardStats._wdMiss = 0;
					return;
				}
				guardStats._wdMiss = (guardStats._wdMiss || 0) + 1;
				// 连续两次都没跑到 _update 才判定停摆（单次可能只是"这一拍本来就不需要推送"）
				if (guardStats._wdMiss < 2) return;
				guardStats.stalled = (guardStats.stalled || 0) + 1;
				guardStats.lastStallAt = Date.now();
				guardStats._wdMiss = 0;
				livePages.forEach(function (vm) {
					try {
						if (vm._watcher && typeof vm._watcher.run === 'function') vm._watcher.run();
					} catch (e) {}
					try {
						const seen = new Set();
						const walk = function (v, d) {
							if (!v || d > 12 || seen.has(v)) return;
							seen.add(v);
							if (v._watcher && v !== vm && typeof v._watcher.run === 'function') {
								try {
									v._watcher.run();
								} catch (e) {}
							}
							(v.$children || []).forEach(function (c) {
								walk(c, d + 1);
							});
						};
						(vm.$children || []).forEach(function (c) {
							walk(c, 1);
						});
					} catch (e) {}
				});
			} catch (e) {
				// 自愈失败也不抛
			}
		}, 700);
	}, 1200);
}

function guardWatchers(vm) {
	(vm._watchers || []).forEach(function (w) {
		if (!w.user && typeof w.getter === 'function' && !w.getter.__guardWrapped) {
			const g = w.getter;
			const gw = function () {
				try {
					return g.apply(this, arguments);
				} catch (e) {
					guardStats.patchErrors = (guardStats.patchErrors || 0) + 1;
					guardStats.lastPatchError = String((e && e.message) || e).slice(0, 120);
					guardTell('组件取值（computed）抛错：这一拍按空值渲染', guardStats.lastPatchError);
					return undefined;
				}
			};
			gw.__guardWrapped = true;
			w.getter = gw;
		}
		if (w.user && typeof w.cb === 'function' && !w.cb.__guardWrapped) {
			const cb = w.cb;
			const cw = function () {
				try {
					return cb.apply(this, arguments);
				} catch (e) {
					guardStats.watchErrors = (guardStats.watchErrors || 0) + 1;
					guardStats.lastWatchError = String((e && e.message) || e).slice(0, 120);
					guardTell('业务 watcher 回调抛错（已吞掉，免得打断这一批调度）', guardStats.lastWatchError);
					return undefined;
				}
			};
			cw.__guardWrapped = true;
			w.cb = cw;
		}
	});
}

app.$mount();