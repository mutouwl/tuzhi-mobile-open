<template>
	<view class="circle-comment-list">
		<!-- 评论头部：标题 + 排序（评论弹窗与动态详情共用，样式完全一致） -->
		<view class="comment-header">
			<view class="section-title">评论 {{ visibleComments.length }}</view>
			<view class="comment-sort">
				<text v-for="option in commentSortOptions" :key="option.value" class="sort-option" :class="{ active: commentSort === option.value }" @tap="changeSort(option.value)">{{ option.name }}</text>
			</view>
		</view>

		<!-- 骨架屏：弹窗首载时展示，加载完成后消失 -->
		<view v-if="loading && !loaded" class="comment-skeleton">
			<view v-for="i in 4" :key="i" class="comment-skeleton-item">
				<u-skeleton :loading="true" :rows="1" :title="true" title-width="30%" title-height="14" :avatar="true" avatar-shape="circle" avatar-size="32" rows-height="14" />
			</view>
		</view>

		<!-- 评论列表（点击条目/回复=回复；点赞/删除通过事件交给父级处理；头像/昵称点击跳成员主页）；
		     加载中（骨架屏显示）时隐藏列表，避免旧评论与骨架屏并存 -->
		<template v-if="loaded && !loading">
		<view v-for="c in sortedComments" :key="c.id" class="comment-item" :class="{ 'is-reply': c.reply_id }" @tap="$emit('reply', c)">
			<image class="comment-avatar" :src="c.avatar" mode="aspectFill" @tap.stop="goUserHome(c)" />
			<view class="comment-body">
				<view class="comment-user">
					<text class="comment-nickname" @tap.stop="goUserHome(c)">{{ c.nickname }}</text>
					<text v-if="c.is_owner" class="tag-owner small">圈主</text>
				</view>
				<view class="comment-content">
					<text v-if="c.reply_nickname" class="reply-tag">{{ c.nickname }} 回复 {{ c.reply_nickname }}：</text>
					<u-parse v-if="isHtml(c.content)" :content="c.content" :selectable="true"></u-parse>
					<text v-else>{{ c.content }}</text>
				</view>
				<view class="comment-images" v-if="c.media && c.media.images && c.media.images.length">
					<template v-for="(img, i) in c.media.images">
						<image v-if="!imgErrors[c.id + '_' + i]" :key="i" :src="img" class="comment-image" mode="aspectFill" @tap.stop="previewCommentImage(c.media.images, i)" @error="onCommentImgError(c.id, i)" />
						<view v-else :key="i" class="comment-image comment-image-error" @tap.stop="previewCommentImage(c.media.images, i)">
							<tz-icon name="tupian" :size="24" color="#c9cdd4" />
						</view>
					</template>
				</view>
				<view class="comment-meta">
					<text>{{ c.createtime_text || formatTime(c.createtime) }}</text>
					<text class="comment-reply" @tap.stop="$emit('reply', c)">回复</text>
					<text v-if="c.is_mine" class="comment-del" @tap.stop="$emit('del', c)">删除</text>
				</view>
			</view>
			<view class="comment-like" @tap.stop="$emit('like', c)">
				<text v-if="c.like_count" class="comment-like-count">{{ c.like_count }}</text>
				<tz-icon :name="c.liked == 1 ? 'like_fill' : 'like'" :size="20" :color="c.liked == 1 ? '#ff6a1a' : '#aeb5be'" />
			</view>
		</view>
		</template>

		<u-empty v-if="loaded && !loading && !visibleComments.length" text="还没有评论" icon="/static/image/empty.png" width="70" height="70" margin-top="40"></u-empty>
	</view>
</template>

<script>
/**
 * 圈子评论列表（通用组件：评论弹窗与动态详情页共用）
 * 评论排序/列表渲染/骨架屏/空状态单一来源，样式逻辑两处完全一致
 * props: post（动态对象，取 post.comments）、loading/loaded（骨架屏与空状态控制）
 * emits: reply(c)（点击回复）、del(c)（删除）、like(c)（点赞）、sort-change(sort)（切换排序）
 * 注意：切换排序（默认/最新/最早）时 emit sort-change，由父级携带 comment_sort 重新请求
 * circle.post.detail（后端按该参数排序评论）；本地 sortedComments 仅做主评论/回复分组合并，
 * 与后端返回顺序一致，不重复排序。
 */
export default {
	name: 'tz-circle-comment-list',
	props: {
		post: { type: Object, default: null },
		loading: { type: Boolean, default: false },
		loaded: { type: Boolean, default: true },
	},
	data() {
		return {
			commentSort: 'default',
			// 评论图片加载失败标记：key = commentId_index，值为 true 表示该图加载失败，用图标占位
			imgErrors: {},
		};
	},
	computed: {
		commentSortOptions() {
			return [
				{ name: '默认', value: 'default' },
				{ name: '最新', value: 'latest' },
				{ name: '最早', value: 'earliest' },
			];
		},
		// 问答动态：圈主回答在动态正文中展示，不重复出现在评论列表
		visibleComments() {
			const post = this.post;
			if (!post || !post.comments) return [];
			if (post.post_type == 'question') {
				const ans = (post.comments || []).find(c => c.is_owner == 1);
				if (ans) {
					return post.comments.filter(c => Number(c.id) !== Number(ans.id));
				}
			}
			return post.comments;
		},
		sortedComments() {
			if (!this.post || !this.visibleComments.length) return [];
			const list = this.visibleComments.slice();
			// 构建 id -> comment 映射，用于沿 reply_id 链查找根主评论
			const idMap = {};
			list.forEach(c => { idMap[c.id] = c; });
			const rootCache = {};
			const findRoot = (c) => {
				if (rootCache[c.id] !== undefined) return rootCache[c.id];
				const visited = {};
				let cur = c;
				while (cur && cur.reply_id && idMap[cur.reply_id] && !visited[cur.id]) {
					visited[cur.id] = true;
					cur = idMap[cur.reply_id];
				}
				const rootId = cur ? cur.id : c.id;
				rootCache[c.id] = rootId;
				return rootId;
			};
			// 主评论沿用后端返回顺序（comment_sort 已在接口层排序，本地不重排）；
			// 回复统一按 id 升序分组合并到所属主评论下（对话顺序展示）
			const mains = list.filter(c => !c.reply_id);
			const replies = list.filter(c => c.reply_id);
			replies.sort((a, b) => a.id - b.id);
			const repliesByRoot = {};
			replies.forEach(r => {
				const rid = findRoot(r);
				if (!repliesByRoot[rid]) repliesByRoot[rid] = [];
				repliesByRoot[rid].push(r);
			});
			const result = [];
			mains.forEach(c => {
				result.push(c);
				(repliesByRoot[c.id] || []).forEach(r => result.push(r));
			});
			const appended = new Set(result.map(c => c.id));
			replies.forEach(r => { if (!appended.has(r.id)) result.push(r); });
			return result;
		},
	},
	methods: {
		// 切换排序：更新本地选中态并通知父级携带 comment_sort 重新请求接口（后端按该参数排序评论）
		changeSort(value) {
			if (this.commentSort === value) return;
			this.commentSort = value;
			this.$emit('sort-change', value);
		},
		formatTime(ts) {
			if (!ts) return '';
			const d = new Date(Number(ts) * 1000);
			return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
		},
		isHtml(content) {
			if (!content) return false;
			return /<[a-z][^>]*>/i.test(content);
		},
		previewCommentImage(images, index) {
			uni.previewImage({ current: index, urls: images });
		},
		// 评论图片加载失败：记录失败标记，用图标占位替代
		onCommentImgError(commentId, index) {
			this.$set(this.imgErrors, commentId + '_' + index, true);
		},
		// 点击头像/昵称：跳转成员个人主页（与动态卡片 goUserHome 一致）
		goUserHome(c) {
			const post = this.post;
			if (!post || !post.circle_id || !c || !c.user_id) return;
			this.$nav.to('/pages/app/circle/user/home?circle_id=' + post.circle_id + '&user_id=' + c.user_id);
		},
	},
};
</script>

<style scoped>
.comment-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.section-title { font-size: 15px; font-weight: 600; color: #1d2129; }
/* 排序按钮：分段控件（与动态列表卡片脚一致） */
.comment-sort { display: flex; padding: 2px; border-radius: 16px; background: #f3f4f6; }
.comment-sort .sort-option { padding: 4.5px 10px; border-radius: 13px; color: #707780; font-size: 11.5px; }
.comment-sort .sort-option.active { background: #fff; color: #0968f6; font-weight: 600; box-shadow: 0 1px 4px rgba(31,35,41,.06); }
.comment-item { display: flex; gap: 8px; padding: 9px 0; }
.comment-item.is-reply { margin-left: 28px; }
.comment-avatar { flex: none; width: 28px; height: 28px; border-radius: 50%; background: #f2f3f5; }
.comment-body { flex: 1; min-width: 0; }
/* 评论区文字统一 14px（除删除/回复按钮） */
.comment-user { font-size: 14px; color: #576b95; font-weight: 500; display: flex; align-items: center; gap: 4px; }
.tag-owner { flex: none; font-size: 10px; line-height: 13px; padding: 0 4px; border-radius: 2px; color: #fff; background: #ff7d00; }
.comment-content { margin-top: 3px; font-size: 14px; color: #1d2129; line-height: 1.65; word-break: break-all; }
.reply-tag { color: #86909c; }
.comment-images { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.comment-image { width: 90px; height: 90px; border-radius: 5px; }
/* 评论图片加载失败占位：浅灰底 + 居中图标（与 post 媒体占位一致） */
.comment-image-error { display: flex; align-items: center; justify-content: center; background: #f2f3f5; }
.comment-meta { margin-top: 4px; font-size: 14px; color: #86909c; display: flex; align-items: center; gap: 10px; }
.comment-reply { color: #0968f6; font-size: 11px; }
.comment-del { color: #f53f3f; font-size: 11px; }
.comment-like { flex: none; display: flex; align-items: center; gap: 2px; padding: 3px; align-self: flex-start; }
.comment-like-count { color: #7c848e; font-size: 11px; }
.comment-skeleton { padding: 10px 0; }
.comment-skeleton-item { margin-bottom: 15px; }
</style>
