<template>
	<view v-if="config && visible">
		<t-tab-bar t-class="t-tab-bar" :value="String(value)" theme="normal" :split="false" :fixed="fixed"
			:bordered="bordered" :placeholder="placeholder" :safe-area-inset-bottom="safeAreaEnabled" :z-index="zIndex"
			@change="onChange" :style="tabBarStyle">
			<t-tab-bar-item class="tab-bar-item" v-for="(item, index) in config.navigation" :key="index"
				:value="String(index)">
				<template #icon>
					<view class="tabbar-icon-wrap">
						<image v-if="item.icon.selected.type == 'image'" class="tabbar-icon" :src="item.icon.selected.src"
							:style="{'width': size + 'px', 'height': size + 'px'}" />
						<tz-icon v-if="item.icon.selected.type == 'icon'" :name="item.icon.selected.src"
							:color="String(value) === String(index) ? config.color.selected : config.color.default"
							:size="size" />
					</view>
				</template>
				{{ item.name }}
			</t-tab-bar-item>
		</t-tab-bar>
	</view>
</template>

<script>
	import TTabBar from '@tdesign/uniapp/tab-bar/tab-bar.vue';
	import TTabBarItem from '@tdesign/uniapp/tab-bar-item/tab-bar-item.vue';

	export default {
		components: {
			TTabBar,
			TTabBarItem,
		},
		props: {
			navigation: {
				type: [Object, Array],
				default: () => { }
			},
			color: {
				type: Object,
				default: () => {
					return {
						selected: 'blue',
						default: '#0009'
					}
				}
			},
			/** 是否显示外边框 */
			bordered: {
				type: Boolean,
				default: true,
			},
			placeholder: {
				type: Boolean,
				default: true,
			},
			/** 是否固定在底部 */
			fixed: {
				type: Boolean,
				default: true,
			},
			size: {
				type: [String, Number],
				default: 26
			},
			/**
			 * 层级：默认 1001，高于页面全屏加载遮罩（tz-loading-page 100 / u-loading-page 999），
			 * 保证页面数据加载期间 tabbar 不被遮罩盖住、及时展示
			 */
			zIndex: {
				type: [String, Number],
				default: 1001
			}
		},

		emits: ['update:modelValue', 'onChange', 'visibleChange'],
		data() {
			return {
				visible: false,
				pagePath: '',
				pageInfo: {},
				config: {},
				value: '0',
				viewportOffset: 0,
				/** 设备底部安全区高度（px，env(safe-area-inset-bottom) 实测值，H5 端量取一次） */
				safeInset: 0
			}
		},
		computed: {
			/**
			 * 安全区内边距开关：微信 H5 底部工具栏弹出时，工具栏自身已包含 home 指示区，
			 * tabbar 再保留 env(safe-area-inset-bottom) 内边距会双重叠加，
			 * 表现为"底部安全区过大、安全区下方还透出一条工具栏区域"，
			 * 因此占位高度已覆盖安全区时动态关闭（小程序端保持开启，由样式减半处理）
			 */
			safeAreaEnabled() {
				// #ifdef H5
				return !(this.safeInset > 0 && this.viewportOffset >= this.safeInset);
				// #endif
				// #ifndef H5
				return true;
				// #endif
			},
			tabBarStyle() {
				// #ifdef H5
				if (this.viewportOffset > 0) {
					// 用 bottom 布局定位补偿微信 H5 底部工具栏占位高度。
					// 禁止改用 transform/translateY：iOS WKWebView 中 fixed + transform
					// 会被提升为独立合成层，滚动时极易被丢弃渲染（tabbar 滚动时消失、
					// 停止后又突然出现），带 transition 还会产生位移跳变
					return {
						bottom: this.viewportOffset + 'px'
					};
				}
				// #endif
				return {};
			}
		},
		mounted() {
			var pages = getCurrentPages();
			var page = pages[pages.length - 1];
			this.pageInfo = page.$page || page.__page__;
			this.visible = false;
			this.getNavigation();

			// 监听全局导航刷新事件（App 回到前台时触发），后台编辑导航后移动端自动更新
			uni.$on('navigationRefresh', this.verifyNavigation);

			// #ifdef H5
			this.measureSafeInset();
			this.initViewportListener();
			// #endif
		},
		beforeDestroy() {
			uni.$off('navigationRefresh', this.verifyNavigation);
			// #ifdef H5
			this.removeViewportListener();
			// #endif
		},
		watch: {
			visible(val) {
				// tabbar 显隐变化时向页面广播实际高度（px，含安全区），
				// 供页面固定底栏（如圈子售前页操作栏）上移避让，避免按钮被 tabbar 遮挡
				this.$nextTick(() => this.emitTabVisible());
			},
			// #ifdef H5
			viewportOffset() {
				// iOS 微信浏览器底部工具栏显隐导致 tabbar 位移时，联动通知底栏跟随避让
				if (this.visible) {
					this.$nextTick(() => this.emitTabVisible());
				}
			},
			// #endif
		},
		methods: {
			/**
			 * 向页面广播 tabbar 可见状态与占位高度（px，含安全区）：
			 * 页面固定底部操作栏据此设置 bottom 偏移，避免按钮被 tabbar 遮挡
			 * 注意：事件名必须用驼峰 visibleChange——uni-app Vue2 小程序端 $emit 不做名字转换
			 * （原样 triggerEvent），模板绑定的驼峰事件才能在小程序端精确匹配；
			 * 用 kebab-case 时 H5 正常、小程序端事件永远不触发
			 */
			emitTabVisible() {
				const payload = { visible: this.visible, height: 0, offset: 0 };
				// #ifdef H5
				payload.offset = this.viewportOffset > 0 ? this.viewportOffset : 0;
				// #endif
				if (!this.visible) {
					this.notifyTabVisible(payload);
					return;
				}
				// 先广播计算兜底高度（TDesign tabbar 高度固定：item 80rpx + 上下 16rpx 边距 = 112rpx，另加底部安全区），
				// 避免小程序端 wx:if 节点渲染晚于 nextTick 导致首次测量失败时，页面底栏不避让
				payload.height = this.getFallbackTabBarHeight();
				this.notifyTabVisible(payload);
				// 再测量实际高度（含安全区）覆盖兜底值；小程序端测量失败自动重试
				this._tabBarMeasureTimes = 0;
				this.measureTabBar();
			},

			/**
			 * 广播 tabbar 可见状态：组件事件 + 全局事件总线双通道
			 * 小程序端组件事件桥接（$emit → triggerEvent）存在平台差异风险，
			 * 全局总线（uni.$emit/uni.$on，纯 JS）兜底，保证页面侧一定能收到；
			 * 总线仅在本组件所在页为栈顶页面时广播，避免污染页面栈内其他页面状态
			 * （如本页压栈下单页后，其他页面广播可能把本页避让状态踩掉）
			 */
			notifyTabVisible(payload) {
				this.$emit('visibleChange', payload);
				const pages = getCurrentPages();
				const currentPage = pages[pages.length - 1];
				if (currentPage && currentPage.$page && this.pageInfo && currentPage.$page.fullPath === this.pageInfo.fullPath) {
					uni.$emit('tabBarVisibleChange', payload);
					// #ifdef MP-WEIXIN
					console.log('[tz-tab-bar] tabBarVisibleChange', payload);
					// #endif
				}
			},

			/**
			 * 测量 tabbar 固定栏实际高度；节点未渲染完成时返回空，自动重试
			 * （微信小程序端 wx:if 渲染晚于 $nextTick，H5 端 DOM 同步渲染一次即中）
			 */
			measureTabBar() {
				// 测量期间 tabbar 已隐藏（如后台导航刷新）：停止测量，广播隐藏态让页面复位
				if (!this.visible) {
					this.notifyTabVisible({ visible: false, height: 0, offset: 0 });
					return;
				}
				const query = uni.createSelectorQuery().in(this);
				query.select('.t-tab-bar').boundingClientRect(rect => {
					const height = rect && rect.height ? rect.height : 0;
					if (height) {
						const payload = { visible: true, height: height, offset: 0 };
						// #ifdef H5
						payload.offset = this.viewportOffset > 0 ? this.viewportOffset : 0;
						// #endif
						this.notifyTabVisible(payload);
						return;
					}
					// 最多重试 10 次（约 500ms），期间页面已应用兜底高度，不影响展示
					if (this._tabBarMeasureTimes < 10) {
						this._tabBarMeasureTimes++;
						setTimeout(() => this.measureTabBar(), 50);
					}
				}).exec();
			},

			/**
			 * 计算兜底高度：112rpx（TDesign 80rpx + 上下 16rpx 边距）换算 px。
			 * 注意：不加安全区——实例环境（DevTools/真机）中 tabbar 是否渲染 safe 内边距
			 * 不一致（开发者工具实测不渲染，tabbar ≈ 112rpx），加安全区会导致底栏悬空；
			 * 真机是否带安全区内边距由页面级实测高度（boundingClientRect）校正，兜底只对齐内容区
			 */
			getFallbackTabBarHeight() {
				let info = {};
				try {
					info = uni.getSystemInfoSync();
				} catch (e) {}
				const windowWidth = info.windowWidth || 375;
				return Math.round((112 * windowWidth) / 750);
			},
			// #ifdef H5
			/**
			 * 量取设备底部安全区高度（px）。env(safe-area-inset-bottom) 无法在 JS 直接读取，
			 * 用探针节点量取一次；页面全局是 border-box，探针需显式 content-box 才能量到 padding
			 */
			measureSafeInset() {
				if (typeof document === 'undefined' || !document.body) {
					return;
				}
				const probe = document.createElement('div');
				probe.style.cssText = 'position:fixed;left:-9999px;top:0;width:0;height:0;visibility:hidden;box-sizing:content-box;padding-bottom:constant(safe-area-inset-bottom);padding-bottom:env(safe-area-inset-bottom);';
				document.body.appendChild(probe);
				this.safeInset = probe.offsetHeight || 0;
				document.body.removeChild(probe);
			},
			/**
			 * 初始化视觉视口监听，解决iOS微信浏览器底部工具栏显隐时
			 * fixed元素无法贴底的问题
			 */
			initViewportListener() {
				if (typeof window === 'undefined' || !window.visualViewport) {
					return;
				}
				this._onViewportResize = () => {
					const vv = window.visualViewport;
					// 顶部下拉回弹时 offsetTop 为负值（视觉视口越出文档顶部），
					// 不钳制会算出假偏移，tabbar 被误抬升且页面未真正滚动时收不到
					// 后续 scroll 事件复位，表现为打开首页即出现"安全区过大+底部透明区"
					const offsetTop = Math.max(0, vv.offsetTop || 0);
					// 视觉视口底部 与 布局视口底部 的差值（微信底部工具栏/键盘占位高度）
					const offset = window.innerHeight - (vv.height + offsetTop);
					this.viewportOffset = offset > 0 ? offset : 0;
				};
				window.visualViewport.addEventListener('resize', this._onViewportResize);
				window.visualViewport.addEventListener('scroll', this._onViewportResize);
				// 兜底：部分 webview 工具栏显隐只派发 window resize
				this._onWindowResize = () => this._onViewportResize();
				window.addEventListener('resize', this._onWindowResize);
				// 初始化执行一次
				this._onViewportResize();
			},
			removeViewportListener() {
				if (typeof window === 'undefined' || !window.visualViewport || !this._onViewportResize) {
					return;
				}
				window.visualViewport.removeEventListener('resize', this._onViewportResize);
				window.visualViewport.removeEventListener('scroll', this._onViewportResize);
				if (this._onWindowResize) {
					window.removeEventListener('resize', this._onWindowResize);
				}
			},
			// #endif

			onChange(e) {
				console.log('tab-bar onChange', e);
				var index = parseInt(e.value);
				this.value = String(index);
				var item = this.config.navigation[index];
				if (item && item.link.type && item.link.type != 'unlink') {
					this.$nav.to(item.link.src, item.link.type, 'redirectTo')
				}
			},
			getNavigation() {
				var config = uni.getStorageSync('navigation');

				// 有缓存优先用缓存渲染 tabbar，避免接口异常导致 tabbar 缺失
				if (config) {
					this.config = config;
					this.setChecked(config);
				}

				// 无论是否有缓存，都后台校验最新配置：
				// 后台编辑导航后移动端可自动刷新生效，接口异常时不影响缓存渲染
				this.verifyNavigation();
				return config;
			},

			/**
			 * 后台拉取最新导航配置并校验
			 * 仅当配置发生变化（后台编辑过导航）时才更新缓存并重新渲染
			 */
			verifyNavigation() {
				this.$api('page.navigation.getNavigation', {}).then(res => {
					if (res.code == 1) {
						var fresh = res.data.config || {};
						var cached = uni.getStorageSync('navigation');
						if (!cached || JSON.stringify(fresh) !== JSON.stringify(cached)) {
							uni.setStorageSync('navigation', fresh);
							this.config = fresh;
							this.setChecked(fresh);
						}
					}
				}).catch(ret => {
					// 接口异常：保留缓存渲染，不影响 tabbar 展示
				});
			},

			refresh() {
				this.visible = false;
				this.setChecked(this.config);
			},

			checkIndex(url) {
				//判断是否为首页
				var indexPageId = uni.getStorageSync('index_id');
				// 定义要匹配的路径
				const pathPattern = /pages\/index\/index/;
				const idPattern = /[?&]id=([^&]*)/;
				if (pathPattern.test(url)) {
					const match = url.match(idPattern);
					if (match) {
						var nowPageId = match[1];

						if (indexPageId == nowPageId) {
							return true;
						}
					}
				}
				return false;
			},

			/**
			 * 导航项对应的可匹配页面路径集合
			 * 圈子导航链接特殊处理：同一圈子同时匹配售前页与圈子首页，
			 * 保证成员进入圈子首页（/pages/app/circle/index/index?id=xx）后底部导航仍显示
			 * （默认 getPagePath 对 circle 类型只返回圈子售前页）
			 */
			getNavPaths(link) {
				var paths = [this.$nav.getPagePath(link.src, link.type)];
				if (link.type == 'circle') {
					paths.push('/pages/app/circle/index/index?id=' + link.src);
				}
				return paths;
			},

			setChecked(config) {
				if (!config) {
					return false;
				}

				// #ifdef MP-WEIXIN || MP-TOUTIAO
				let pages = getCurrentPages()    //获取加载的页面
				let currentPage = pages[pages.length - 1]    //获取当前页面的对象
				var path = currentPage.$page.fullPath;
				var pageInfo = currentPage.$page;
				// #endif

				// #ifdef H5
				var pageInfo = this.pageInfo;
				const path = window.location.hash;
				// #endif

				//分享链接携带share参数，会影响路由判断，这里进行过滤
				var pattern = /\?share=[0-9]*/;
				var pagePath = path.replace(pattern, "");
				pageInfo.fullPath = pageInfo.fullPath.replace(pattern, "");

				pattern = /\&share=[0-9]*/;
				pagePath = pagePath.replace(pattern, "");
				pageInfo.fullPath = pageInfo.fullPath.replace(pattern, "");

				pattern = /\?scene=share\%[0-9a-zA-Z]*/;
				pagePath = pagePath.replace(pattern, "");
				pageInfo.fullPath = pageInfo.fullPath.replace(pattern, "");

				pattern = /\?id=$/;
				pagePath = pagePath.replace(pattern, "");
				pageInfo.fullPath = pageInfo.fullPath.replace(pattern, "");

				pattern = /\?category_id=[0-9]*/;
				pagePath = pagePath.replace(pattern, "");
				pageInfo.fullPath = pageInfo.fullPath.replace(pattern, "");


				if (pagePath.length < 10) {
					pageInfo.fullPath = pagePath.replace('#/', '/pages/index/index')
				} else {
					pageInfo.fullPath = pagePath.replace('#/', '/');
				}

				for (var i in config.navigation) {
					if (this.checkIndex(pageInfo.fullPath)) {
						this.visible = true;
						continue;
					}
					var navPaths = this.getNavPaths(config.navigation[i].link);
					for (var j in navPaths) {
						if (pageInfo.fullPath == navPaths[j]) {
							this.visible = true;
							break;
						}
					}
				}

				var matched = false;
				for (var i in config.navigation) {
					var selPaths = this.getNavPaths(config.navigation[i].link);
					for (var j in selPaths) {
						if (selPaths[j] == pageInfo.fullPath) {
							this.value = String(i);
							matched = true;
							break;
						}
					}
					if (matched) {
						break;
					}
				}
			}
		}
	}
</script>

<style scoped>
	::v-deep .t-tab-bar {
		--td-tab-bar-active-color: #0968f6;
		--td-tab-bar-active-bg: rgba(9, 104, 246, 0.08);
		/* TDesign 已通过 safe-area-inset-bottom 统一处理底栏与占位高度，外层不再重复叠加；
		小程序端（微信/抖音）安全区按设计缩小一倍，见下方 #ifdef 覆盖 */
	}

	/* 小程序端（微信/抖音）：TDesign 默认给底栏加全量 env(safe-area-inset-bottom)
	（iPhone X 等机型为 34px），整条 bar 高达约 90px、安全区观感过厚；
	按设计缩小一倍（约 17px）更紧凑。H5/App 端保持 TDesign 默认全量安全区，不受影响。 */
	/* #ifdef MP-WEIXIN || MP-TOUTIAO */
	::v-deep .t-tab-bar--safe {
		padding-bottom: calc(constant(safe-area-inset-bottom) / 2) !important;
		padding-bottom: calc(env(safe-area-inset-bottom) / 2) !important;
	}
	/* #endif */

	/* 调整 tab-bar 字体大小 */
	::v-deep .t-tab-bar-item__text {
		font-size: 20rpx !important;
	}

	/* 修复微信小程序端 tdesign :host { flex: 1 } 组合选择器不生效，
	导致 tab 项无法均分宽度、布局错乱的问题 */
	::v-deep .t-tab-bar-item,
	.tab-bar-item {
		flex: 1;
		min-width: 0;
	}

	.tabbar-icon-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tabbar-icon {
		width: 26px;
		height: 26px;
	}
</style>
