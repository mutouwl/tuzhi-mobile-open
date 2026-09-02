<template>
	<!-- 评论底部操作栏（共用组件：动态详情页固定 bottom-bar / 评论弹窗内静态底栏，样式与交互一致） -->
	<view class="comment-bar" :class="{ 'comment-bar-fixed': fixed }" :style="barStyle">
		<!-- 评论入口：点击由父级弹出回复评论弹窗 -->
		<view class="comment-entry" @tap="$emit('open')">写下你的评论吧</view>
		<view class="bar-actions">
			<view class="bar-action" @tap="$emit('like', post)">
				<tz-icon :name="post.liked == 1 ? 'like_fill' : 'like'" :size="24" :color="post.liked == 1 ? '#f53f3f' : '#4e5969'" />
				<text class="bar-label">点赞</text>
			</view>
			<view class="bar-action" @tap="$emit('share', post)">
				<tz-icon name="share" :size="24" color="#4e5969" />
				<text class="bar-label">分享</text>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * 圈子动态评论底部操作栏（共用组件：动态详情页 / 评论弹窗，样式与交互一致）
 * props: post（动态对象，用于点赞态展示）、fixed（是否固定屏幕底部：详情页 true，评论弹窗内 false）、safeAreaInsetBottom（是否由本组件增加安全区）
 * emits: open（点击评论入口，父级打开回复评论弹窗）、like(post)、share(post)
 */
export default {
	name: 'tz-circle-comment-bar',
	props: {
		post: { type: Object, default: null },
		fixed: { type: Boolean, default: false },
		// 评论弹窗的安全区由外层 u-popup 处理；详情页固定底栏保留本组件的安全区
		safeAreaInsetBottom: { type: Boolean, default: true },
	},
	emits: ['open', 'like', 'share'],
	data() {
		return {
			// 底部安全区高度（px）：JS 计算，避免 env() 在微信小程序 scoped 样式下不可靠
			safeAreaPx: '0px',
		};
	},
	computed: {
		barStyle() {
			// 安全区只保留一个来源：固定详情底栏由本组件处理，弹窗内底栏交给 u-popup
			if (!this.safeAreaInsetBottom) return {};
			return { paddingBottom: 'calc(7px + ' + this.safeAreaPx + ')' };
		},
	},
	created() {
		try {
			const sys = uni.getSystemInfoSync();
			let h = (sys.safeAreaInsets || {}).bottom || 0;
			// 微信小程序端：安全区按设计减半（iPhone X 约 17px），与 tab bar 一致，避免底栏过厚
			// #ifdef MP-WEIXIN
			h = Math.round(h / 2);
			// #endif
			this.safeAreaPx = h > 0 ? h + 'px' : '0px';
		} catch (e) {
			this.safeAreaPx = '0px';
		}
	},
};
</script>

<style scoped>
.comment-bar { display: flex; align-items: center; flex: none; padding: 7px 12px; background: #fff; border-top: 0.5px solid #edf0f3; }
/* 详情页固定底部：去分隔线改阴影，与页面滚动内容区分 */
.comment-bar-fixed { position: fixed; left: 0; right: 0; bottom: 0; border-top: 0; box-shadow: 0 -1px 6px rgba(0,0,0,0.05); }
.comment-entry { flex: 1; padding: 8px 11px; border-radius: 16px; background: #f3f4f6; color: #9ba2aa; font-size: 12.5px; }
.bar-actions { display: flex; align-items: center; margin-left: 10px; }
.bar-action { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 40px; padding: 0 6px; }
.bar-label { font-size: 11px; color: #4e5969; margin-top: 2px; }
</style>
