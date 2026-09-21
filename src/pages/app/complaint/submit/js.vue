<script>
export default {
	components: {},
	data() {
		return {
			pageParams: {},
			path: [],
			content: '',
			images: [],
			submitting: false,
			submitted: false,
			// 提交后路由：close=关闭页面，home=返回首页
			postRoute: 'home'
		}
	},
	computed: {
		categoryPathText() {
			if (this.path.length > 0) {
				return this.path.map(item => this.deepDecode(item.title || '')).join(' / ');
			}
			return this.deepDecode(this.pageParams.category_title || '');
		},
		canSubmit() {
			return this.content.trim().length > 0 && this.content.length <= 200 && this.images.length <= 4 && !this.submitting;
		}
	},
	onLoad(options) {
		this.pageParams = this.$nav.parsePageParams(options || {});
		if (this.pageParams.path) {
			try {
				this.path = JSON.parse(this.deepDecode(this.pageParams.path));
			} catch(e) {
				this.path = [];
			}
		}
		// init 下发值先兜底，再取接口最新设置（后台刚改过设置时也能立即生效）
		this.postRoute = this.$tools.systemConfig('app_complaint_post_route') === 'close' ? 'close' : 'home';
		this.getConfig();
	},
	methods: {
		deepDecode(str) {
			let prev = '';
			let curr = str;
			try {
				do {
					prev = curr;
					curr = decodeURIComponent(prev);
				} while (curr !== prev);
			} catch(e) {}
			return curr;
		},
		getConfig() {
			this.$api('app.complaint.config', {}).then(res => {
				if (res.code == 1 && res.data) {
					this.postRoute = res.data.post_route === 'close' ? 'close' : 'home';
				}
			}).catch(() => {});
		},
		onContentChange(e) {
			this.content = String(e.value || '').slice(0, 200);
		},
		onImagesChange(images) {
			this.images = images.slice(0, 4);
		},
		handleDone() {
			if (this.postRoute === 'close') {
				this.closePage();
				return;
			}
			this.gotoHome();
		},
		gotoHome() {
			uni.reLaunch({ url: '/pages/index/index' });
		},
		/**
		 * 关闭页面：H5 微信内关闭整个网页、小程序尝试退出小程序，
		 * 关闭/退出不成功（浏览器禁止脚本关窗、小程序入口场景受限）统一退化为返回首页
		 */
		closePage() {
			// #ifdef H5
			if (typeof WeixinJSBridge !== 'undefined' && typeof WeixinJSBridge.invoke === 'function') {
				WeixinJSBridge.invoke('closeWindow', {}, function() {});
			} else if (typeof window !== 'undefined' && typeof window.close === 'function') {
				window.close();
			}
			// 关窗成功页面即销毁、定时器随之失效；800ms 后仍在页面内说明没关掉，退化为返回首页
			setTimeout(() => {
				this.gotoHome();
			}, 800);
			return;
			// #endif
			// #ifdef MP-WEIXIN
			// 微信仅允许特定入口场景（客服会话、小程序跳小程序等）退出小程序，其余场景走 fail 回调
			var exitMiniProgram = (typeof wx !== 'undefined' && typeof wx.exitMiniProgram === 'function') ? wx.exitMiniProgram
				: (typeof uni !== 'undefined' && typeof uni.exitMiniProgram === 'function' ? uni.exitMiniProgram : null);
			if (exitMiniProgram) {
				exitMiniProgram({
					fail: () => {
						this.gotoHome();
					}
				});
				return;
			}
			this.gotoHome();
			// #endif
			// #ifndef H5 || MP-WEIXIN
			// 其他端（抖音小程序、App）无退出能力，退化为返回首页
			this.gotoHome();
			// #endif
		},
		submit() {
			if (this.content.trim().length == 0) {
				uni.showToast({ title: '请填写投诉内容', icon: 'none' });
				return;
			}
			if (this.content.length > 200) {
				uni.showToast({ title: '投诉内容不能超过200字', icon: 'none' });
				return;
			}
			if (this.images.length > 4) {
				uni.showToast({ title: '证据截图最多上传4张', icon: 'none' });
				return;
			}
			if (this.submitting) {
				return;
			}
			this.submitting = true;
			this.$api('app.complaint.submit', {
				category_id: this.pageParams.category_id,
				content: this.content,
				images: this.images,
				target_type: this.pageParams.target_type || '',
				target_id: this.pageParams.target_id || '',
				target_title: decodeURIComponent(this.pageParams.target_title || '')
			}).then(res => {
				this.submitting = false;
				if (res.code == 1) {
					this.submitted = true;
				}
			}).catch(() => {
				this.submitting = false;
			});
		}
	}
}
</script>
