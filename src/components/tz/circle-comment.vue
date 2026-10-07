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
					<tz-circle-comment-list :post="subject" :loading="loading" :loaded="loaded" :empty-text="emptyText" :sortable="sortable" :likeable="likeable" :deletable="deletable" :owner-record-id="ownerRecordId" @sort-change="onSortChange" @reply="replyComment" @del="delComment" @like="toggleCommentLike" />
				</scroll-view>
			</view>

			<!-- 底部操作栏（与动态详情 bottom-bar 一致：评论入口 + 点赞 + 分享，点击入口弹出回复评论弹窗） -->
			<tz-circle-comment-bar :post="subject" :disabled="!canComment" :safe-area-inset-bottom="false" @open="openReplyBar" @like="onBarLike" @share="onBarShare" />
		</view>
	</u-popup>

	<!-- 回复评论弹窗（与动态详情共用组件；须与主弹窗平级，同为 z-index 10075，DOM 靠后层级在上）
	     接口名/目标参数/回复键/是否收图原样下发给回复弹窗，复用方（打卡）只在这里覆盖差异项 -->
	<tz-circle-reply-popup ref="replyPopup" :post="subject" :api="replyApi" :id-params="idParams" :reply-key="replyKey" :allow-image="allowImage" @posted="onPosted" />

	<!-- 删除评论二次确认：必须用 u-modal 且放在 u-popup 之后（同为 z-index 10075，DOM 靠后层级在上）；
	     不能再用 uni.showModal——H5 端 uni-modal 层级低于 u-popup（App.vue 统一为 1010，u-popup/u-modal 为 10075），确认弹窗会被评论弹窗遮挡 -->
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
 * ── 以下全部是跨模块复用参数，默认值即圈子原口径（不传就是原来的圈子动态评论），复用方只覆盖差异项，
 *    不得复制一份弹窗改口径（口径见 ui-baseline-mobile.md M18）：
 *    entity        调用方手里已有的主体（如动态流卡片那一条日记），传入后不再请求详情接口；
 *                  底栏的点赞态直接读它，调用方改这条记录时弹窗跟着变
 *    listApi       非空 = 评论只走这个接口（返回 data.rows 或 data 数组），用于没有「主体详情」接口的模块
 *    listParams    listApi 的目标参数（如打卡的 { checkin_id, record_id }）
 *    replyApi / idParams / replyKey / allowImage  下发给内嵌回复弹窗，与 tz-circle-reply-popup 同名同口径
 *    sortable / likeable / deletable  本模块评论接口没有该能力时传 false，入口不渲染（不留点了没反应的假控件）
 *    commentLikeApi / commentLikeParams  评论点赞的接口名与目标参数：复用方（如打卡）的评论点赞不走圈子
 *        那套 target_type/comment 口径，接口名与参数由调用方下发；不传即按圈子原口径（circle.post.like/unlike）
 *    handleBarLike 底栏点赞是否由本组件调圈子点赞接口；复用方的点赞接口/参数不同，传 false 只 emit 给调用方
 *    ownerRecordId  评论行头像/昵称的跳转目标：打卡传本活动 id → 跳该学员在本活动的打卡记录页，
 *        不传（0）即按圈子原口径跳成员主页（下发给 tz-circle-comment-list 同名 prop）
 * emits: close、posted（评论成功）、deleted（删除评论）、like(post)、share(post)（弹窗底部栏点赞/分享）
 */
export default {
	name: 'tz-circle-comment',
	props: {
		visible: { type: Boolean, default: false },
		postId: { type: [Number, String], default: 0 },
		entity: { type: Object, default: null },
		listApi: { type: String, default: '' },
		listParams: { type: Object, default: null },
		replyApi: { type: String, default: 'circle.post.comment' },
		idParams: { type: Object, default: null },
		replyKey: { type: String, default: 'reply_id' },
		allowImage: { type: Boolean, default: true },
		sortable: { type: Boolean, default: true },
		likeable: { type: Boolean, default: true },
		deletable: { type: Boolean, default: true },
		handleBarLike: { type: Boolean, default: true },
		// 关闭「允许用户发布评论」时点击入口给的那句话：默认沿用圈子那句（圈子调用点一字不改），
		// 复用方传自己与后端同名接口逐字一致的那句（打卡是「该打卡活动已关闭评论」），
		// 共用组件不替第二个模块定文案（M13：拦截分支必须有可读出口）
		closedText: { type: String, default: '该圈子已关闭评论' },
		// 评论点赞接口名与目标参数（复用方下发差异：打卡的点赞接口按 checkin_id + record_id + comment_id 定位）
		commentLikeApi: { type: String, default: '' },
		commentLikeParams: { type: Object, default: null },
		// 原样下发给评论列表：打卡复用方传本活动 id，评论行的头像/昵称就改跳那个学员在本活动的
		// 打卡记录页（默认 0 = 圈子原口径，跳成员主页）
		ownerRecordId: { type: [Number, String], default: 0 },
	},
	data() {
		return {
			loading: false,
			loaded: false,
			post: null,
			// 复用方（listApi 模式）：评论列表单独拉回来放这儿，与 entity 合成 subject
			commentRows: [],
			// 评论列表加载失败的原因：空状态要把「加载失败，请重试」与「还没有评论」分开说，不能都报成没评论
			listMsg: '',
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
	computed: {
		// 弹窗渲染用的主体：
		//  - 圈子：打开时由详情接口拉回（评论在 post.comments 里）
		//  - 复用方（打卡）：调用方传 entity（卡片那条日记），评论按 listApi 拉回来后合进来
		// 恒不为 null：详情接口回来前底栏读 post.liked 不能炸
		subject() {
			if (this.listApi) return Object.assign({}, this.entity || {}, { comments: this.commentRows });
			return this.post || {};
		},
		// 管理端「发布设置-允许用户发布评论」：关闭后评论入口置灰、点击提示；字段缺失（旧版接口/其它模块）按允许处理
		canComment() {
			return Number((this.subject || {}).allow_user_comment) !== 0;
		},
		emptyText() {
			return this.listMsg || '还没有评论';
		},
	},
	methods: {
		async load() {
			// 复用方只拉评论列表（主体由调用方传入，再请求一次详情接口既浪费也会把浏览量等字段刷一遍）
			if (this.listApi) return this.loadRows();
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
		// 复用方的评论列表：接口回 data.rows（打卡 commentList）或 data 数组（圈子 commentList），两种都收
		async loadRows() {
			this.loading = true;
			this.loaded = false;
			this.listMsg = '';
			let res;
			try {
				res = await this.$api(this.listApi, Object.assign({}, this.listParams, { sort: this.commentSort }));
			} catch (e) {
				this.loading = false;
				this.listMsg = '加载失败，请重试';
				this.loaded = true;
				uni.showToast({ title: this.listMsg, icon: 'none' });
				return;
			}
			this.loading = false;
			if (!res || res.code !== 1) {
				this.listMsg = (res && res.msg) || '加载失败，请重试';
				this.commentRows = [];
				this.loaded = true;
				uni.showToast({ title: this.listMsg, icon: 'none' });
				return;
			}
			this.commentRows = this.normalizeRows(res.data);
			this.loaded = true;
		},
		// 行数据归一：圈子评论列表回数组、打卡回 {total, rows}，两种都收
		// （reply_id / parent_id 的键名差异由 circle-comment-list 内部统一，这里不再转一遍）
		normalizeRows(data) {
			return Array.isArray(data) ? data : (data && data.rows) || [];
		},
		// 评论区排序切换：记录所选排序并调用独立评论列表接口（只拉评论，避免重拉详情导致浏览量 +1）
		onSortChange(sort) {
			this.commentSort = sort;
			if (this.listApi) {
				this.loadRows();
				return;
			}
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
			if (!this.canComment) {
				uni.showToast({ title: this.closedText, icon: 'none' });
				return;
			}
			this.$refs.replyPopup.open(null);
		},
		// 点击评论条目/回复按钮：设置回复对象并弹出回复评论弹窗
		replyComment(c) {
			if (!this.canComment) {
				uni.showToast({ title: this.closedText, icon: 'none' });
				return;
			}
			this.$refs.replyPopup.open({ id: c.id, user_id: c.user_id, nickname: c.nickname });
		},
		// 回复发送成功：重新加载评论列表并通知父级更新卡片评论数
		onPosted() {
			this.load();
			this.$emit('posted');
		},
		// 弹窗内点赞（与动态详情 bottom-bar 点赞一致）：接口切换后同步弹窗 post（含点赞人列表），并上抛给卡片列表同步点赞态
		async onBarLike(post) {
			// 复用方（打卡）传 handleBarLike=false：本模块点赞接口与参数不同（按 record_id 整条切换），
			// 这里只上抛，由调用页走它那套乐观更新与回滚，组件不再自己发一次请求
			if (!this.handleBarLike) {
				this.$emit('like', post);
				return;
			}
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
			// 复用方（打卡）的评论点赞接口与参数都不同：接口名与目标参数由调用方下发，
			// 后端回权威的 liked / like_count 直接落进行对象，不再前端自增
			if (this.commentLikeApi) {
				const res = await this.$api(this.commentLikeApi, Object.assign({}, this.commentLikeParams, { comment_id: c.id }));
				if (!res || res.code !== 1) {
					uni.showToast({ title: (res && res.msg) || '操作失败', icon: 'none' });
					return;
				}
				c.liked = Number(res.data.liked) ? 1 : 0;
				c.like_count = Number(res.data.like_count) || 0;
				return;
			}
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
