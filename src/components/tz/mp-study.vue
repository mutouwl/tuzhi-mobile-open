<template>
	<!-- fullscreen=true：整页铺白（课程详情被拦时用，页面上其余内容全部盖住）；
	     false：支付成功页那一张提示卡。两种形态共用同一份内容与同一条取件/降级链 -->
	<view :class="['tz-mp-study', fullscreen ? 'tz-mp-study-full' : 'tz-mp-study-card']" v-if="!isMp">
		<view class="tz-mp-study-inner">
			<view class="tz-mp-study-hd">
				<text class="tz-mp-study-title">请在微信小程序中学习</text>
				<text class="tz-mp-study-desc">{{ mode === 'notice' ? '本课程需在微信小程序中学习' : '当前页面仅支持查看与购买，学习请前往微信小程序' }}</text>
				<text class="tz-mp-study-name" v-if="courseName">《{{ courseName }}》</text>
			</view>

			<!-- 商家自定义提示（课程设置里的「提示文字」，如：请先在个人中心绑定手机号）；留空整段不出 -->
			<view class="tz-mp-study-tip" v-if="tip">{{ tip }}</view>

			<!-- 动作区：按钮优先；取件中铺灰块（骨架），拿不到按钮或点了没跳走才出码 -->
			<view class="tz-mp-study-action">
				<view class="tz-mp-study-sk" v-if="actionLoading"></view>
				<template v-else-if="showButton">
					<view class="tz-mp-study-btn-wrap">
						<tz-button class="tz-mp-study-btn" :text="buttonText" type="primary" long @click="openMp" />
					</view>
					<text class="tz-mp-study-link" v-if="!codeVisible" @tap="showCodeFallback">无法跳转？长按识别小程序码</text>
				</template>
				<text class="tz-mp-study-unavailable" v-else-if="unavailable">{{ unavailableText }}</text>
			</view>

			<view class="tz-mp-study-code" v-if="showCode">
				<view class="tz-mp-study-code-box" v-if="!codeFailed">
					<image class="tz-mp-study-code-img" :src="qrcode" mode="aspectFit" show-menu-by-longpress
						@error="codeError" />
				</view>
				<text class="tz-mp-study-code-tip">{{ codeFailed ? '小程序码生成失败，请在微信中搜索小程序「' + storeName + '」' : '长按识别小程序码，在微信中打开学习' }}</text>
			</view>

			<text class="tz-mp-study-store" v-if="showButton && !showCode">或在微信中搜索「{{ storeName }}」小程序</text>
		</view>
	</view>
</template>

<script>
// #ifdef H5
import jweixin from 'jweixin-module';
// #endif

export default {
	props: {
		// 课程 ID：取小程序路径与码图都靠它
		courseId: {
			type: [Number, String],
			default: 0
		},
		// 课程名：提示卡上那句书名号文案
		courseName: {
			type: String,
			default: ''
		},
		// block = 课程详情拦截块；notice = 支付成功页提示卡
		mode: {
			type: String,
			default: 'block'
		},
		// true = 整页铺白（固定定位盖住整页）；false = 普通提示卡
		fullscreen: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			available: 0,
			path: '',
			qrcode: '',
			urllink: '',
			tip: '',
			loaded: false,
			urlLoading: false,
			// 点了跳转没走成 / 用户主动点「无法跳转」后出码
			codeVisible: false,
			codeFailed: false,
			entryFailed: false,
			wechatReady: false,
			alive: true
		};
	},
	computed: {
		isMp() {
			return this.$tools.isMpWechat();
		},
		inWechat() {
			return this.$tools.isWechat();
		},
		storeName() {
			return this.$tools.systemConfig('name') || '本店';
		},
		buttonText() {
			return '前往小程序学习';
		},
		unavailable() {
			return this.loaded && !this.available;
		},
		// 两种「没有入口」要分开说：真没配小程序 vs 这次取件失败，否则用户按错方向去联系商家
		unavailableText() {
			if (this.entryFailed) {
				return '暂时无法获取小程序入口，请稍后在微信中搜索小程序「' + this.storeName + '」';
			}
			return '商家尚未完成小程序配置，请联系商家';
		},
		// 微信内靠 JSSDK 拉起小程序（不需要 URL Link）；微信外靠 URL Link
		showButton() {
			if (!this.available) {
				return false;
			}
			if (this.inWechat) {
				return this.wechatReady && !!this.path;
			}
			return !!this.urllink;
		},
		// 动作区在取件期间占位成骨架：不先摆一个点不动的按钮，也不留空白
		actionLoading() {
			if (!this.loaded) {
				return true;
			}
			return !this.inWechat && this.urlLoading;
		},
		// 码只在「按钮这条路走不通」时出：微信内按钮不可用、微信外链接取不到、或点击后没跳走
		showCode() {
			if (!this.available || this.codeFailed) {
				return this.codeFailed;
			}
			if (this.codeVisible) {
				return true;
			}
			if (!this.loaded || this.actionLoading) {
				return false;
			}
			return !this.showButton;
		}
	},
	mounted() {
		this.alive = true;
		if (this.isMp) {
			return;
		}
		// #ifdef H5
		this.wechatReady = !!(jweixin && jweixin.miniProgram && typeof jweixin.miniProgram.navigateTo === 'function');
		// #endif
		this.loadEntry();
	},
	beforeDestroy() {
		this.alive = false;
	},
	methods: {
		/**
		 * 取小程序路径与码图地址
		 * 失败也把 loaded 置 true：页面交给文案兜底，不能一直停在骨架
		 */
		loadEntry() {
			var that = this;
			if (!this.courseId) {
				that.loaded = true;
				return;
			}
			that.$api('course.mpStudy.entry', { id: that.courseId }).then(function(res) {
				if (!that.alive) return;
				if (res && res.code === 1 && res.data) {
					that.available = Number(res.data.available) || 0;
					that.path = res.data.path || '';
					that.qrcode = res.data.qrcode || '';
					that.tip = res.data.tip || '';
				}
				that.loaded = true;
				if (that.available && !that.inWechat) {
					that.loadUrlLink();
				}
			}).catch(function() {
				if (!that.alive) return;
				that.entryFailed = true;
				that.loaded = true;
			});
		},
		/**
		 * 微信外才取 URL Link（有配额，不白打）；失败回空串 → computed 自动降级成小程序码
		 */
		loadUrlLink() {
			var that = this;
			that.urlLoading = true;
			that.$api('course.mpStudy.urllink', { id: that.courseId }).then(function(res) {
				if (!that.alive) return;
				that.urlLoading = false;
				that.urllink = res && res.code === 1 && res.data ? (res.data.url || '') : '';
			}).catch(function() {
				if (!that.alive) return;
				that.urlLoading = false;
				that.urllink = '';
			});
		},
		showCodeFallback() {
			this.codeVisible = true;
		},
		codeError() {
			this.codeFailed = true;
		},
		/**
		 * 点按钮：微信内走 JSSDK；微信外走 URL Link
		 * 两条路都可能静默失败（未关联公众号 / 小程序未发布 / 系统拦截），
		 * 所以都挂一个短定时器：还在当前页就认为没跳走，把码露出来
		 */
		openMp() {
			// #ifdef H5
			var that = this;
			if (that.inWechat) {
				if (!that.wechatReady || !that.path) {
					that.codeVisible = true;
					return;
				}
				var jumped = false;
				var timer = setTimeout(function() {
					if (!jumped && that.alive) {
						that.codeVisible = true;
					}
				}, 1500);
				var options = {
					url: '/' + that.path,
					success: function() {
						jumped = true;
						clearTimeout(timer);
					},
					fail: function() {
						jumped = true;
						clearTimeout(timer);
						if (that.alive) {
							that.codeVisible = true;
						}
					}
				};
				var appId = that.$tools.systemConfig('wx_mp_app_id') || '';
				if (appId) {
					options.appId = appId;
				}
				jweixin.miniProgram.navigateTo(options);
				return;
			}

			if (!that.urllink) {
				that.codeVisible = true;
				return;
			}
			var fallback = setTimeout(function() {
				if (that.alive && document.visibilityState === 'visible') {
					that.codeVisible = true;
				}
			}, 2500);
			that._fallbackTimer = fallback;
			window.location.href = that.urllink;
			// #endif
		}
	}
};
</script>

<style scoped>
.tz-mp-study-card {
	background: #fff;
	padding: 24px 15px;
	text-align: center;
}

/* 整页铺白：课程详情被拦时用，页面其余内容（播放器/详情/目录/推荐等）全部被盖住。
   inner 用 margin:auto 居中：内容短时上下居中，内容长（自定义提示多行）时可滚动不裁顶 */
.tz-mp-study-full {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 9999;
	display: flex;
	overflow-y: auto;
	padding: 24px;
	box-sizing: border-box;
	background: #fff;
	text-align: center;
}

.tz-mp-study-inner {
	width: 100%;
	max-width: 360px;
	margin: 0 auto;
	text-align: center;
}

.tz-mp-study-full .tz-mp-study-inner {
	margin: auto;
}

.tz-mp-study-hd {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.tz-mp-study-title {
	font-size: 18px;
	font-weight: 600;
	color: #1d2129;
	line-height: 26px;
}

.tz-mp-study-full .tz-mp-study-title {
	font-size: 20px;
	line-height: 28px;
}

.tz-mp-study-desc {
	max-width: 300px;
	margin-top: 8px;
	font-size: 12px;
	color: #86909c;
	line-height: 18px;
}

.tz-mp-study-name {
	max-width: 100%;
	margin-top: 6px;
	font-size: 14px;
	color: #4e5969;
	line-height: 20px;
	word-break: break-all;
}

/* 商家自定义提示：提醒色（与 tz-button.warning 同一档），左对齐便于读整句 */
.tz-mp-study-tip {
	max-width: 320px;
	margin: 16px auto 0;
	padding: 10px 12px;
	border-radius: 4px;
	background: #fff7e8;
	color: #ff7d00;
	font-size: 12px;
	line-height: 18px;
	text-align: left;
	word-break: break-all;
}

.tz-mp-study-action {
	margin-top: 16px;
}

.tz-mp-study-full .tz-mp-study-action {
	margin-top: 24px;
}

/* 取件中的动作位：与真实按钮同高（tz-button size=normal 热区 40）的灰块 */
.tz-mp-study-sk {
	width: 220px;
	height: 40px;
	margin: 0 auto;
	border-radius: 4px;
	background: #e5e6eb;
}

/* 按钮定宽 220：宿主与内部根节点都要撑开（M17：只给 long 不给宿主宽度时小程序端仍按内容宽） */
.tz-mp-study-btn-wrap {
	width: 220px;
	margin: 0 auto;
}

.tz-mp-study-btn {
	display: block;
	width: 100%;
}

.tz-mp-study-link {
	display: block;
	margin-top: 12px;
	font-size: 12px;
	color: #0968f6;
}

.tz-mp-study-unavailable {
	display: block;
	margin-top: 8px;
	font-size: 12px;
	color: #86909c;
	line-height: 18px;
}

.tz-mp-study-code {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 20px;
}

.tz-mp-study-full .tz-mp-study-code {
	margin-top: 24px;
}

.tz-mp-study-code-box {
	padding: 10px;
	border-radius: 8px;
	background: #f7f8fa;
}

.tz-mp-study-code-img {
	display: block;
	width: 160px;
	height: 160px;
	border-radius: 4px;
	background: #fff;
}

.tz-mp-study-code-tip {
	max-width: 300px;
	margin-top: 12px;
	font-size: 12px;
	color: #86909c;
	line-height: 18px;
	text-align: center;
}

.tz-mp-study-store {
	display: block;
	margin-top: 14px;
	font-size: 12px;
	color: #86909c;
	line-height: 18px;
}
</style>
