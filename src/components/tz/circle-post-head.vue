<template>
	<view class="post-head">
		<!-- 头像/昵称不阻止冒泡：列表卡片整卡点击进动态详情（含头部区域），详情页 @user 仍可进成员主页。
		     打卡动态卡要「点头像进这个人、点正文进这条动态」两条路分开，是在调用方外面再包一层
		     @tap.stop 的容器做的（见 components/tz/checkin-record-card.vue 的 .ck-rc-head），
		     本组件口径不动，圈子列表卡片的整卡可点照旧（ui-baseline-mobile.md M19） -->
		<image class="post-avatar" :src="avatarSrc" mode="aspectFill" @tap="$emit('user', post)" @error="onAvatarError" />
		<view class="post-user" @tap="$emit('user', post)">
			<view class="post-nickname">
				<text class="post-nickname-text">{{ post.nickname }}</text>
				<text class="post-type" v-if="typeTag">{{ typeTag }}</text>
				<slot name="tags" />
			</view>
			<view class="post-meta" v-if="meta">{{ meta }}</view>
		</view>
		<!-- 更多按钮只给作者：入口的显示判据就这一条（post.is_mine），菜单里给哪几项由调用方按同一件事裁剪。
		     曾经有过一个 moreForAll prop 让访客也看到入口（打卡日记的「日签图人人可用」），2026-09-26 用户
		     改口径「日签图仅自己可见」后没有任何调用点需要访客态，点开只剩一张空菜单的入口反而是要修的病 -->
		<view v-if="showMore && post.is_mine" class="post-more" @tap.stop="$emit('more')"><tz-icon name="more" :size="32" color="#86909c" /></view>
	</view>
</template>

<script>
import { mpKey } from '@/common/utils/mp-data-key';
/**
 * 圈子动态头部（通用组件：动态卡片与动态详情共用）
 * 头像 + 昵称 + 类型标签 + 标签插槽 + 元信息 + 更多按钮（icon）
 * props: post（动态对象）、meta（元信息文案，如 时间/阅读数）、
 *        typeTag（动态类型标签文字，如「官方动态」，空则不出；「这条动态是什么」用它表达，
 *        不再混进 meta 的灰色元信息里。标签的几何与配色只存本组件一处，调用方只给文字，
 *        避免打卡动态卡与日记详情各抄一份），showMore（是否展示更多按钮：即便为 true，也只有本人
 *        —— post.is_mine —— 才出入口）
 * emits: more（点击更多按钮）
 * 头像加载失败（坏链/文件被删）自动兜底全站默认头像，调用方不必自己处理
 */
export default {
	name: 'tz-circle-post-head',
	props: {
		post: { type: Object, default: null },
		meta: { type: String, default: '' },
		typeTag: { type: String, default: '' },
		showMore: { type: Boolean, default: true },
	},
	emits: ['more', 'user'],
	data() {
		// 头像加载失败标记：key = mpKey(头像地址)（地址作 key，列表换行时无需手动重置；
		// 不转键会被 setData 当成嵌套路径解析后抛错，见 common/utils/mp-data-key）
		return { avatarErrors: {} };
	},
	computed: {
		// 头像加载失败兜底全站默认头像，不留破图；地址为空时保持原样（是否给默认值由调用方决定）
		avatarSrc() {
			const url = (this.post && this.post.avatar) || '';
			return this.avatarErrors[mpKey(url)] ? '/static/image/default-avatar.png' : url;
		},
	},
	methods: {
		onAvatarError() {
			const url = (this.post && this.post.avatar) || '';
			if (url) this.$set(this.avatarErrors, mpKey(url), true);
		},
	},
};
</script>

<style scoped>
.post-head { display: flex; align-items: center; }
.post-avatar { width: 36px; height: 36px; border-radius: 50%; flex: none; background: #f2f3f5; }
.post-user { flex: 1; min-width: 0; margin-left: 8px; }
.post-nickname { font-size: 15px; font-weight: 500; color: #1d2129; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.post-nickname-text { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* 动态类型标签：几何照圈子卡片昵称行的标签档（10px / 13 行高 / 0 3px 内衬 / 2px 圆角 / 500 字重，
   与打卡卡片的 .ck-rc-tag 同一份），配色取「身份标识」那一档（描边浅蓝，同圈子 .tag-owner「圈主」），
   与打卡卡片上的实心 tint 标签（置顶蓝 / 精选橙）区分开 */
.post-type { flex: none; font-size: 10px; line-height: 13px; padding: 0 3px; border: 0.5px solid #78a9d4; border-radius: 2px; background: #f4f9fd; color: #3478be; font-weight: 500; }
.post-meta { margin-top: 2px; font-size: 11px; color: #86909c; }
/* 更多按钮：图标自带尺寸与颜色，padding 保证点击区域 */
.post-more { color: #86909c; padding: 2px 3px; }
</style>
