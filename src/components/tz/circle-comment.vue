<template>
	<!-- 根节点用 view 包裹：u-modal 需与 u-popup 平级（同为 z-index 10075，DOM 靠后层级在上），
	     Vue2 模板只允许一个根元素 -->
	<view class="circle-comment-wrap">
	<!-- 不展示关闭按钮：右上角与排序按钮重叠，点击遮罩/弹窗内操作即可关闭 -->
	<!-- 安全区由 u-popup 统一处理；弹窗内的静态底栏不再重复增加安全区高度 -->
	<u-popup :show="visible" mode="bottom" :round="16" :closeOnClickOverlay="true" :safeAreaInsetBottom="true" @close="closePopup">
		<view class="circle-comment">
			<!-- 评论列表（滚动）：头部/排序/骨架屏/空状态都在共用组件 circle-comment-list 内，与动态详情完全一致 -->
			<view class="cc-body">
				<scroll-view scroll-y class="cc-scroll">
					<tz-circle-comment-list :post="post" :loading="loading" :loaded="loaded" @sort-change="onSortChange" @reply="replyComment" @del="delComment" @like="toggleCommentLike" />
				</scroll-view>
			</view>

			<!-- 底部操作栏（与动态详情 bottom-bar 一致：评论入口 + 点赞 + 分享，点击入口弹出回复评论弹窗） -->
			<tz-circle-comment-bar :post="post" :safe-area-inset-bottom="false" @open="openReplyBar" @like="onBarLike" @share="onBarShare" />
		</view>
	</u-popup>

	<!-- 回复评论弹窗（与动态详情共用组件；须与主弹窗平级，同为 z-index 10075，DOM 靠后层级在上） -->
	<tz-circle-reply-popup ref="replyPopup" :post="post" @posted="onPosted" />

	<!-- 删除评论二次确认：必须用 u-modal 且放在 u-popup 之后（同为 z-index 10075，DOM 靠后层级在上）；
	     不能再用 uni.showModal——H5 端 uni-modal z-index 仅 999，确认弹窗会被评论弹窗遮挡 -->
	<u-modal
		:show="delConfirmVisible"
		title="提示"
		content="确定删除该评论吗？"
		:showCancelButton="true"
		confirmText="删除"
		cancelText="取消"
		confirmColor="#f53f3f"
		@confirm="confirmDelComment"
		@cancel="cancelDelComment"
	/>
	</view>
</template>

<script>
/**
 * 圈子动态评论弹窗（通用组件，动态列表/详情均可复用）
 * 底部弹窗：评论列表（共用 circle-comment-list：排序/点赞/回复/删除）+ 底部操作栏（共用 circle-comment-bar，
 * 与动态详情 bottom-bar 一致：评论入口 + 点赞 + 分享，点击入口弹出回复评论弹窗 circle-reply-popup）
 * props: visible（弹窗显隐）、postId（动态 id，打开时自动加载评论）
 * emits: close、posted（评论成功）、deleted（删除评论）、like(post)、share(post)（弹窗底部栏点赞/分享）
 */
export default {
	name: 'tz-circle-comment',
	props: {
		visible: { type: Boolean, default: false },
		postId: { type: [Number, String], default: 0 },
	},
	data() {
		return {
			loading: false,
			loaded: false,
			post: null,
			// 评论区排序（默认/最新/最早）：切换时调用独立评论列表接口（commentList）
			commentSort: 'default',
			delConfirmVisible: false,
			delCommentTarget: null,
		};
	},
	watch: {
		visible(val) {
			if (val) this.load();
		},
	},
	methods: {
		async load() {
			if (!this.postId) return;
			this.loading = true;
			// 复位 loaded：弹窗重开时旧评论列表隐藏，骨架屏重新显示
			this.loaded = false;
			let res;
			try {
				res = await this.$api('circle.post.detail', { id: this.postId });
			} catch (e) {
				// 请求异常（网络错误/接口 500 等）：结束加载态，避免骨架屏永久转圈（弹窗表现为"内容弹不出来"）
				this.loading = false;
				uni.showToast({ title: '加载失败，请重试', icon: 'none' });
				return;
			}
			this.loading = false;
			if (res.code !== 1) {
				uni.showToast({ title: res.msg || '加载失败', icon: 'none' });
				return;
			}
			this.post = res.data;
			this.loaded = true;
		},
		// 评论区排序切换：记录所选排序并调用独立评论列表接口（只拉评论，避免重拉详情导致浏览量 +1）
		onSortChange(sort) {
			this.commentSort = sort;
			this.loadComments();
		},
		async loadComments() {
			// 排序切换请求期间展示评论区骨架屏（与初载 load() 一致），避免旧列表残留
			this.loading = true;
			this.loaded = false;
			let res;
			try {
				res = await this.$api('circle.post.commentList', { post_id: this.postId, sort: this.commentSort });
			} catch (e) {
				// 请求异常：恢复旧列表展示（不清空），避免骨架屏卡死
				this.loading = false;
				this.loaded = !!this.post;
				uni.showToast({ title: '加载失败，请重试', icon: 'none' });
				return;
			}
			this.loading = false;
			this.loaded = true;
			if (res.code === 1 && this.post) {
				this.post.comments = res.data || [];
			}
		},
		// 点击底部评论入口：清空回复对象，弹出回复评论弹窗（与动态详情一致）
		openReplyBar() {
			this.$refs.replyPopup.open(null);
		},
		// 点击评论条目/回复按钮：设置回复对象并弹出回复评论弹窗
		replyComment(c) {
			this.$refs.replyPopup.open({ id: c.id, user_id: c.user_id, nickname: c.nickname });
		},
		// 回复发送成功：重新加载评论列表并通知父级更新卡片评论数
		onPosted() {
			this.load();
			this.$emit('posted');
		},
		// 弹窗内点赞（与动态详情 bottom-bar 点赞一致）：接口切换后同步弹窗 post（含点赞人列表），并上抛给卡片列表同步点赞态
		async onBarLike(post) {
			const api = post.liked == 1 ? 'circle.post.unlike' : 'circle.post.like';
			const res = await this.$api(api, { target_type: 'post', target_id: post.id });
			if (res.code === 1) {
				post.liked = post.liked == 1 ? 0 : 1;
				post.like_count = Math.max(0, Number(post.like_count || 0) + (post.liked == 1 ? 1 : -1));
				// 同步点赞人列表（与列表卡片点赞逻辑一致），驱动点赞区 like-users 更新
				const userInfo = uni.getStorageSync('user_info') || {};
				const nickname = userInfo.nickname || '我';
				if (!post.like_users) post.like_users = [];
				const idx = post.like_users.indexOf(nickname);
				if (post.liked == 1 && idx === -1) {
					post.like_users.unshift(nickname);
				} else if (post.liked == 0) {
					if (idx > -1) post.like_users.splice(idx, 1);
					if (post.like_count <= 0) post.like_users = [];
				}
				this.$emit('like', post);
			} else {
				uni.showToast({ title: res.msg || '操作失败', icon: 'none' });
			}
		},
		// 弹窗内分享（与动态详情 bottom-bar 分享一致）：上抛由卡片列表处理（share-modal 在列表组件内）
		onBarShare(post) {
			this.$emit('share', post);
		},
		async toggleCommentLike(c) {
			const api = c.liked == 1 ? 'circle.post.unlike' : 'circle.post.like';
			const res = await this.$api(api, { target_type: 'comment', target_id: c.id });
			if (res.code === 1) {
				c.liked = c.liked == 1 ? 0 : 1;
				c.like_count = Math.max(0, Number(c.like_count || 0) + (c.liked == 1 ? 1 : -1));
			} else {
				uni.showToast({ title: res.msg || '操作失败', icon: 'none' });
			}
		},
		delComment(c) {
			this.delCommentTarget = c;
			this.delConfirmVisible = true;
		},
		cancelDelComment() {
			this.delCommentTarget = null;
			this.delConfirmVisible = false;
		},
		async confirmDelComment() {
			const c = this.delCommentTarget;
			this.cancelDelComment();
			if (!c) return;
			const res = await this.$api('circle.post.delComment', { id: c.id });
			if (res.code === 1) {
				this.load();
				this.$emit('deleted');
			} else {
				uni.showToast({ title: res.msg || '删除失败', icon: 'none' });
			}
		},
		closePopup() {
			this.$emit('close');
		},
	},
};
</script>

<style scoped>
.circle-comment { display: flex; flex-direction: column; height: 75vh; background: #fff; border-top-left-radius: 8px; border-top-right-radius: 8px; overflow: hidden; }
.cc-body { flex: 1; min-height: 0; }
.cc-scroll { height: 100%; padding: 12px 14px 0; box-sizing: border-box; }
</style>
