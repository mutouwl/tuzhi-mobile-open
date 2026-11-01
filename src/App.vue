<script>
	import Vue from "vue";
	import Wechat from "./common/wechat/wechat";
	// 付费插件（拼团/送好友）安装态闸门：init 回包落库后置「本会话已就绪」并广播，
	// 之前挂载的商详组件/插件页据此重判一次（详见 common/utils/plugin-guard.js 头注释）
	import { markSystemConfigReady } from "./common/utils/plugin-guard";
	export default {
		onLaunch: function () {
			/**
			 * 构建戳：排查「客户端到底跑的是哪一份包」用。
			 * ⚠ 不能只写 console.log —— 生产包（build:mp-weixin）会把 console 全部剥掉，
			 * 那条戳在产物里根本不存在（2026-09-27 实测 dist 里 grep 不到），照着"打日志看戳"会白查。
			 * 所以同时写一份 Storage：开发者工具 → 调试器 → Storage 面板搜 `__mp_build__` 即可确认版本。
			 */
			var buildStamp = "2026-09-28-0620 渲染异常四层隔离 + 出栈窗口自愈看门狗 + 海报按需挂载 + 清 wxss 非法选择器";
			try { uni.setStorageSync("__mp_build__", buildStamp); } catch (e) {}
			console.log("__MP_BUILD__ " + buildStamp);
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
				// 切到阿里云日志服务后直连上报，不再经过自己的 PHP。
				// PV 不做汇总：进出几次就是几条，汇总反而把「进出次数」这个语义抹掉了。
				// page_type / page_id 不在端上算 —— 那套 url 映射是后端 Record::getPageInfo 里的
				// switch 白名单，端上再抄一份必然对不上，留给回流时按同一套逻辑补。
				if (this.$sls && this.$sls.isSlsMode()) {
					this.$sls.send({
						biz_type: 'pv',
						log_id: this.$sls.newLogId(),
						url: url,
						visitor_id: this.$sls.visitorId()
					});
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
						// **本会话已就绪**：放在落库之后、广播之前（等待中的组件一收到就能读到这一份）。
						// 失败（res.code != 1 / 网络异常）不置真：付费插件的入口宁可晚一轮出现，
						// 也不许拿上一轮存下来的 flag 去发一条必然失败的请求（plugin-guard.js ①）
						markSystemConfigReady();
						// #ifdef H5
						that.setSiteIcon(res.data.ico);
						that.$nav.share();
						// #endif
					}
				});
			},

			/**
			 * 设置浏览器标签页图标（后台 基础设置-ICO图标）
			 * 仅 H5 生效，未配置时保留浏览器默认图标
			 */
			setSiteIcon(icon) {
				// #ifdef H5
				if (!icon) {
					return false;
				}
				var links = document.querySelectorAll("link[rel~='icon']");
				if (!links.length) {
					var link = document.createElement("link");
					link.rel = "icon";
					document.head.appendChild(link);
					links = [link];
				}
				for (var i = 0; i < links.length; i++) {
					links[i].href = icon;
				}
				// #endif
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
	/* 购买弹幕浮层锚点（2026-10-29）：九类商详页把 tz-group-buy-danmu(overlay) 挂进封面那一格，
	   这层只提供定位上下文；贴角数值（top 44 / left 15）只存组件 `.gba-danmu--cover` 一处。 */
	.gbd-anchor {
		position: relative;
	}
	/* uni.showToast 要压在「图片放大预览」那一层之上：uni-app 的 app 外壳里 <toast> 排在
	   <preview-image> 前面，同 z-index 时预览会把提示盖掉（日签图点「保存」要在放大图的同时
	   看得见那句「长按图片可保存至相册」，2026-09-26 用户点名）。提示层是 pointer-events:none
	   的整屏壳，抬高一档不会挡住预览的滑动与长按。 */
	uni-toast {
		z-index: 1000000;
	}

	/*  #ifdef H5  */
	/* uni-app 内置弹层（H5）默认 z-index 999，低于底部导航 tz-tab-bar 的 1001：
	   带 tabbar 的页面弹 uni.showModal 确认框时（如个人中心绑定手机号提示合并账号），
	   遮罩压不住 tabbar，导航条会浮在确认框遮罩之上；uni.showActionSheet、picker 同理。
	   统一抬到 1010——高于 tabbar(1001)，仍低于 uview 弹层（u-overlay 10070、
	   u-popup / u-modal 10075）与页面自定义浮层（10000+），
	   circle-comment 等处"u-modal 须在 uni.showModal 之上"的既有层级约定不受影响。
	   选择器与 uni-h5 自带规则同为单类/单标签，层级取决于样式注入顺序，
	   故加 !important 保证生效（同下方 .uni-system-preview-image） */
	uni-modal,
	uni-actionsheet .uni-actionsheet,
	.uni-mask.uni-actionsheet__mask,
	.uni-picker-container,
	.uni-mask.uni-picker-mask {
		z-index: 1010 !important;
	}
	/*  #endif  */

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

	/* ===== 校务（教务）/ 打卡等模块统一版式（卡片版式口径见 .trae/rules/ui-baseline-mobile.md M21） =====
	   口径参照套餐详情页 pages/app/school/package/detail：整页卡片为通栏白卡（margin 12px 0 0、无圆角、
	   左右内衬 16px）；列表页条目卡同样不做圆角（直角）、列表左右留边 10、卡间距 10、卡内衬 14；底部弹窗顶部圆角 10。
	   说明：移动端页面 css 未加 scoped，H5 端所有页面样式合并为全站生效，同名结构类会随打包顺序互相覆盖
	   （历史上教务页圆角/边距反复不统一的根因），故模块共用结构类集中在此，各页不再自定义同名规则。
	   自带底色的提示条（蓝/橙 notice）不要挂 .school-block，只借它的 margin 档位。 */
	.school-page {
		min-height: 100vh;
		background: #f7f8fa;
		padding-bottom: 20px;
	}

	/* 带底部固定操作栏/导航条的页面：底部留白统一 90px */
	.school-page.school-page--bar {
		padding-bottom: 90px;
	}

	/* 通栏白卡区块 */
	.school-block {
		background: #fff;
		margin: 12px 0 0;
	}

	/* 信息行区块：行自带 min-height 与分隔线，卡体只补上下留白 */
	.school-block.school-block--rows {
		padding: 6px 16px;
	}

	/* cell 行卡（校区 / 选择套餐 / 选择学生等选择类行） */
	.school-cell-card {
		background: #fff;
		margin: 12px 0 0;
		overflow: hidden;
	}

	.school-cell-item {
		display: flex;
		align-items: center;
		padding: 14px 16px;
		border-bottom: 1px solid #f7f8fa;
	}

	.school-cell-item:last-child {
		border-bottom: none;
	}

	.school-cell-label {
		font-size: 14px;
		color: #666;
		width: 70px;
		flex-shrink: 0;
	}

	.school-cell-value {
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 0;
		margin-right: 8px;
	}

	.school-cell-value-text {
		font-size: 14px;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.school-cell-value-text.cell-placeholder {
		color: #86909c;
	}

	.school-cell-arrow {
		flex-shrink: 0;
		margin-left: 4px;
	}

	/* 列表页：容器留边 10，条目卡直角（不做圆角，与模块通栏白卡口径一致）、内衬 14、卡间距 10 */
	.school-cards {
		padding: 10px;
	}

	/* 分隔线档列表（打卡「我的打卡」「可参与的打卡」）：条目卡自带左右内衬与行间发丝线、白底通栏，
	   容器随之收掉左右留边（白底要铺到屏幕缘）；顶部贴顶不留边（2026-09-27 用户口径「最上方去掉页面顶部上边距」），
	   底部留边仍取上面的 10px 档 */
	.school-cards.school-cards--divided {
		padding: 0 0 10px;
	}

	/* 列表页吸顶搜索栏（套餐列表 / 校区列表同款） */
	.school-search-box {
		background-color: #fff;
		width: 100%;
		box-sizing: border-box;
		padding: 6px 10px 8px;
	}

	/* 详情页标题卡（封面下方的名称/价格区） */
	.school-head {
		background: #fff;
		padding: 14px 16px;
	}

	.school-card {
		background: #fff;
		border-radius: 0;
		padding: 14px;
		margin-bottom: 10px;
	}

	/* 页面级骨架卡与真实通栏卡同版式（列表条目骨架直接用 .school-card） */
	.school-sk-card {
		background: #fff;
		margin: 12px 0 0;
		padding: 14px 16px;
	}

	/* 底部弹窗：只统一背景与内衬（左右 16px、底部 20px + 安全区）；
	   顶部圆角不进全局档，各弹窗沿用本页原档位（教师列表 12px、选择课次/请假类型 10px）。
	   使用方必须给 u-popup 传 :safeAreaInsetBottom="false"：u-popup 自带的全量安全区会与
	   本档的内衬叠加（iPhone X 下 20px + 34px + 34px），表现为弹窗底部空出一条过高留白。
	   本档只适用于**页面模板**里的弹层：小程序自定义组件默认样式隔离（isolated），
	   app.wxss/页面样式进不去组件内部，独立 .vue 弹层组件须把安全区规则写进自身样式 */
	.school-popup {
		background: #fff;
		padding: 0 16px 20px;
		padding-bottom: calc(20px + constant(safe-area-inset-bottom));
		padding-bottom: calc(20px + env(safe-area-inset-bottom));
		/*  #ifdef  MP-WEIXIN  */
		/* 微信小程序端底部安全区按设计减半（iPhone X 全量 34px → 约 17px），
		   与 tz-tab-bar、tz-bottom-btn 的既有口径一致；H5/App 端保持全量 */
		padding-bottom: calc(20px + constant(safe-area-inset-bottom) / 2);
		padding-bottom: calc(20px + env(safe-area-inset-bottom) / 2);
		/*  #endif  */
	}

	.school-popup-title {
		padding: 15px 0 12px;
		font-size: 16px;
		font-weight: 600;
		color: #1d2129;
		text-align: left;
	}

	/* 整页空态（校区/教师详情等）：上下留白 100px 居中放置 u-empty */
	.school-empty-box {
		padding: 100px 0;
	}

	/* 底部固定操作栏 */
	.school-footer {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		background: #fff;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
		padding: 10px 16px;
		padding-bottom: calc(10px + constant(safe-area-inset-bottom));
		padding-bottom: calc(10px + env(safe-area-inset-bottom));
		/*  #ifdef  MP-WEIXIN  */
		/* 与 .school-popup 同口径：微信端底部安全区减半，底栏不显过高 */
		padding-bottom: calc(10px + constant(safe-area-inset-bottom) / 2);
		padding-bottom: calc(10px + env(safe-area-inset-bottom) / 2);
		/*  #endif  */
		z-index: 10063;
	}

	page {
		background: rgba(250, 250, 250, 1);
		/*  #ifdef H5  */
		max-width: 480px;
		/*  #endif  */
		margin: 0 auto;
	}

	/*  #ifdef H5  */
	/* H5 页面内容居中且限宽 480px（见上方 page），而弹窗为 fixed 定位会铺满整个窗口，宽度与页面不一致；
	   统一把 u-popup 的定位容器限宽到页面最大宽度并水平居中（u-modal/u-picker/u-keyboard 等均基于 u-popup，一并生效） */
	.u-popup .u-transition {
		max-width: 480px;
		margin-left: auto;
		margin-right: auto;
	}

	/* 底部固定操作栏（购买/确认/提交等）同为 fixed 定位，会铺满整个窗口，宽度与页面不一致；
	   模板给底栏加 h5-bottom-bar 类即可对齐页面最大宽度并水平居中
	   （left/right 同时置 0，兼容只写 left 或只写 width 的底栏写法）；
	   第三方组件的固定层无法加类名，按其固定态类名单独列出：
	   .t-tab-bar--fixed（TDesign 底部导航）、.t-popup--bottom/--top（TDesign 弹窗，如 t-calendar 选择日期）；
	   .t-popup--center 是 translate 居中的对话框，不在此列 */
	.h5-bottom-bar,
	.t-tab-bar--fixed,
	.t-popup--bottom,
	.t-popup--top {
		left: 0;
		right: 0;
		max-width: 480px;
		margin-left: auto;
		margin-right: auto;
	}
	/*  #endif  */

	/* 底栏插槽里的插件入口（拼团 `.tbb-slot` / 送好友 `.sf-control-slot`）的宽度**必须落在全局表**，
	   不能写进 `components/tz/bottom-btn.vue` 的 `<style>`（2026-10-29 用户第三次点名同一处：
	   「底部操作栏 收藏、评论、分享、送好友 四个按钮为什么不能等宽」）。
	   两个端各让那张表"够不着"一次：
	     · 小程序端：底栏那一行的 flex 项是自定义组件的**宿主节点**（页面所有），组件 wxss 受
	       样式隔离，`bottom-btn.wxss` 里的 `.control-box .sf-control-slot` 选不中它；
	     · H5 端：uni-app 把组件样式自动 scoped，`.control-box .sf-control-slot[data-v-底栏]` 要求
	       子组件根带**底栏的** scope id，而插槽内容是页面渲染的（只带页面的 scope id）⇒ 不命中。
	   结果就是插件入口按内容收缩、同栏 `.control-btn` 等分 ⇒ 四枚里有一枚窄一截。
	   全局表（H5 的全局 CSS / 小程序的 `app.wxss`）对这一枚两端都生效，所以口径写在这里，
	   且沿用 `.control-btn` 那一档 `flex: 1 1 0`（basis 0 + `min-width:0`，三字标签不反撑）。
	   调用点仍必须在组件标签上点出这两个 class，否则全局表没有抓手。 */
	.sf-control-slot,
	.tbb-slot {
		flex: 1 1 0;
		min-width: 0;
	}

	/* 插件入口**这一拍不该出现**时，宿主节点必须不占宽度（`display:none` 连 gap 一起收掉）。
	   这一档是「入口是动态的」那一半：未装 / 总开关关 / 品类不可送 / 积分商品 / 没进行中活动，
	   都要把那一格让回去（4 枚变 3 枚，剩下几枚各 1/3，而不是继续各占 1/4）。
	   · 不许改成 `v-if` 卸载：送好友组件要一直挂着 —— 下拉刷新 / 支付成功回来还要
	     `$refs.sfArea.reload()` 把它重新点亮，卸载了就再也没有 `$refs` 了；
	   · 状态由组件 `visible` 事件给（判据落定才抛，取数在途不抛，见 `send-friend-area.vue`）；
	   · 拼团那一枚是**无状态**的（摘要全由宿主页 `gbEntry` 传进来），所以它走 `v-if="gbEntry"`，
	     class 这一档只是给「同样是动态、但要保持挂载」的入口留的备用档。 */
	.sf-control-slot--off,
	.tbb-slot--off {
		display: none;
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
