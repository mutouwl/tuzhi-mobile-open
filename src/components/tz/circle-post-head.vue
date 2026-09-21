<template>
	<view class="post-head">
		<!-- 头像/昵称不阻止冒泡：列表卡片整卡点击进动态详情（含头部区域），详情页 @user 仍可进成员主页 -->
		<image class="post-avatar" :src="post.avatar" mode="aspectFill" @tap="$emit('user', post)" />
		<view class="post-user" @tap="$emit('user', post)">
			<view class="post-nickname">
				<text class="post-nickname-text">{{ post.nickname }}</text>
				<slot name="tags" />
			</view>
			<view class="post-meta" v-if="meta">{{ meta }}</view>
		</view>
		<view v-if="post.is_mine && showMore" class="post-more" @tap.stop="$emit('more')"><tz-icon name="more" :size="32" color="#86909c" /></view>
	</view>
</template>

<script>
/**
 * 圈子动态头部（通用组件：动态卡片与动态详情共用）
 * 头像 + 昵称 + 标签插槽 + 元信息 + 更多按钮（icon）
 * props: post（动态对象）、meta（元信息文案，如 时间/阅读数）、showMore（是否展示更多按钮）
 * emits: more（点击更多按钮）
 */
export default {
	name: 'tz-circle-post-head',
	props: {
		post: { type: Object, default: null },
		meta: { type: String, default: '' },
		showMore: { type: Boolean, default: true },
	},
	emits: ['more', 'user'],
};
</script>

<style scoped>
.post-head { display: flex; align-items: center; }
.post-avatar { width: 36px; height: 36px; border-radius: 50%; flex: none; background: #f2f3f5; }
.post-user { flex: 1; min-width: 0; margin-left: 8px; }
.post-nickname { font-size: 15px; font-weight: 500; color: #1d2129; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.post-nickname-text { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.post-meta { margin-top: 2px; font-size: 11px; color: #86909c; }
/* 更多按钮：图标自带尺寸与颜色，padding 保证点击区域 */
.post-more { color: #86909c; padding: 2px 3px; }
</style>
