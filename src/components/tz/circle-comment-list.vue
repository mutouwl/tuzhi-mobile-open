<template>
	<view class="circle-comment-list">
		<!-- 评论头部：标题 + 排序（评论弹窗与动态详情共用，样式完全一致）。
		     外面这一层 u-sticky 只在复用方传 sticky-header 时才真的吸顶（不传就 disabled＝一个普通
		     静态块，弹窗那几处版式一字不变）：打卡日记详情页整页很长，标题与排序一带滚走就切不了
		     排序（2026-09-27 用户点名「评论区的 title 栏应该吸顶」）。吸顶带不给负 margin 出血——
		     评论行与带子共用卡片的同一份左右内衬，带子两侧那十几像素永远只有白卡底、没有内容经过，
		     看不出色块边界；白底也与两张评论卡的底色同值（M5 的 u-sticky 档） -->
		<u-sticky bgColor="#fff" :offsetTop="0" :disabled="!stickyHeader">
			<view class="comment-header">
				<view class="section-title">
					评论
					<!-- 计数是在取的：骨架期间给一枚灰块，别把「评论 0」这一帧当成真值显示出来（M16②）。
					     「评论」二字是写死的静态文案，保持真文字。 -->
					<view v-if="loading && !loaded" class="ccl-sk-count"></view>
					<text v-else>{{ visibleComments.length }}</text>
				</view>
				<!-- 排序分段控件：只在接口支持 sort 参数时出现（接口不接 sort 时留着就是点了列表不动的假控件） -->
				<view class="comment-sort" v-if="sortable">
					<text v-for="option in commentSortOptions" :key="option.value" class="sort-option" :class="{ active: commentSort === option.value }" @tap="changeSort(option.value)">{{ option.name }}</text>
				</view>
			</view>
		</u-sticky>

		<!-- 骨架屏：弹窗首载时展示，加载完成后消失 -->
		<view v-if="loading && !loaded" class="comment-skeleton">
			<view v-for="i in 4" :key="i" class="comment-skeleton-item">
				<u-skeleton :loading="true" :rows="1" :title="true" title-width="30%" title-height="14" :avatar="true" avatar-shape="circle" avatar-size="32" rows-height="14" />
			</view>
		</view>

		<!-- 评论列表（点击条目/回复=回复；点赞/删除通过事件交给父级处理；头像/昵称点击「点开这个人」——
		     圈子跳成员主页，打卡复用方传 owner-record-id 时跳他在本活动的打卡记录页，见 goUserHome）；
		     加载中（骨架屏显示）时隐藏列表，避免旧评论与骨架屏并存 -->
		<template v-if="loaded && !loading">
		<view v-for="c in sortedComments" :key="c.id" class="comment-item" :class="{ 'is-reply': replyIdOf(c), 'is-group-end': groupEndIds[c.id] }" @tap="$emit('reply', c)">
			<image class="comment-avatar" :src="avatarSrcOf(c)" mode="aspectFill" @tap.stop="goUserHome(c)" @error="onAvatarError(c)" />
			<view class="comment-body">
				<view class="comment-user">
					<text class="comment-nickname" @tap.stop="goUserHome(c)">{{ c.nickname }}</text>
					<text v-if="c.is_owner" class="tag-owner small">圈主</text>
					<!-- 管理员身份的一条评论（打卡的点评就是这一档：带星级与附件的管理员评论），与圈主同一枚标签档 -->
					<text v-if="c.is_admin" class="tag-owner small">管理员</text>
					<!-- 点评标记紧跟「管理员」右侧：点评＝带星级的那条评论行（判据 star>0，不是 admin_id，
					     存量点评回填成评论时没有操作人），一眼看出这一行是运营给的结论而不是学员的评论 -->
					<text v-if="c.star > 0" class="tag-review small">点评</text>
				</view>
				<!-- 点评星级：只有点评行有值（普通评论恒 0），排在正文之上，与后台评论行同一顺序 -->
				<view class="comment-rate" v-if="c.star > 0">
					<u-rate :value="Number(c.star)" readonly size="14" active-color="#FF7D00" />
				</view>
				<view class="comment-content">
					<text v-if="c.reply_nickname" class="reply-tag">{{ c.nickname }} 回复 {{ c.reply_nickname }}：</text>
					<u-parse v-if="isHtml(c.content)" :content="c.content" :selectable="true"></u-parse>
					<text v-else class="comment-plain">{{ c.content }}</text>
				</view>
				<!-- 评论附件：图片/视频/语音进同一份九宫格（登记组件 tz-circle-media-grid，点评会带这三类），
				     图片走系统放大、视频/语音开共用预览弹窗播；格子内部每格 @tap.stop，点附件不会冒泡成「回复这条评论」（M19）；
				     宿主 class 只给左缩进与上间距（组件是 isolated 的，M12/M21） -->
				<tz-circle-media-grid class="comment-media" v-if="mediaItems(c).length" :items="mediaItems(c)"
					@preview-image="previewImage" @preview-video="previewMedia" @preview-audio="previewMedia" />
				<!-- 评论附件里的文档：与动态卡/日记详情同一份附件行（tz-circle-file-list 的 preview 档，点开走组件自带的
				     tz-file-preview），后台点评可选文档（2026-09-26），这一行就是它在学员端的落点（M15②）；
				     每行自带 @tap.stop，同样不会冒泡成「回复这条评论」 -->
				<tz-circle-file-list class="comment-files" v-if="mediaFiles(c).length" :files="mediaFiles(c)" preview />
				<view class="comment-meta">
					<text>{{ c.createtime_text || formatTime(c.createtime) }}</text>
					<text class="comment-reply" @tap.stop="$emit('reply', c)">回复</text>
					<text v-if="c.is_mine && deletable" class="comment-del" @tap.stop="$emit('del', c)">删除</text>
				</view>
			</view>
			<view class="comment-like" v-if="likeable" @tap.stop="$emit('like', c)">
				<text v-if="c.like_count" class="comment-like-count">{{ c.like_count }}</text>
				<!-- 已赞色与底栏 tz-circle-comment-bar、动态卡卡片脚同一档 #f53f3f（原先这行是 #ff6a1a 橙，
				     同一页两枚赞图标两种色会被读成两个动作；未赞仍按评论行的浅灰，图标小一档不抢正文） -->
				<tz-icon :name="c.liked == 1 ? 'like_fill' : 'like'" :size="20" :color="c.liked == 1 ? '#f53f3f' : '#aeb5be'" />
			</view>
		</view>
		</template>

		<u-empty v-if="loaded && !loading && !visibleComments.length" :text="emptyText" icon="/static/image/empty.png" width="70" height="70" margin-top="40"></u-empty>

		<!-- 评论附件里的视频/语音：与动态卡、日记详情同一份预览弹窗（按需挂载，不随列表留隐藏实例） -->
		<tz-file-preview v-if="previewVisible" :visible="true" :data="previewData" @close="previewVisible = false" />
	</view>
</template>

<script>
import { goOwnerRecord } from '@/common/utils/checkin-owner';
import { mpKey } from '@/common/utils/mp-data-key';

/**
 * 圈子评论列表（通用组件：评论弹窗与动态详情页共用）
 * 评论排序/列表渲染/骨架屏/空状态单一来源，样式逻辑两处完全一致
 * props: post（动态对象，取 post.comments 原样喂接口返回的行即可，reply_id / parent_id 两种键名本组件都认）、
 *        loading/loaded（骨架屏与空状态控制）
 *        sortable/likeable/deletable（跨模块复用的能力开关，默认全 true = 圈子现口径）：
 *        本组件只按开关渲染入口，接口没有该能力时对应入口一律传 false 隐掉，不留「点了没反应」的假控件
 *        （口径见 ui-baseline-mobile.md M13）；打卡的评论删除只有后台有接口，学员端那一个仍传 false
 *        emptyText（空状态文案，默认「还没有评论」；请求失败时父级下发原因）
 *        ownerRecordId（跨模块复用的跳转开关，默认 0 = 圈子现口径）：打卡那三处评论（弹窗 + 日记详情的
 *        评论区）传本活动 id，头像/昵称就改跳「这个学员在本活动的打卡记录页」
 *        （common/utils/checkin-owner 的 goOwnerRecord，地址与守卫不在这儿再抄一份，见 M25）
 *        stickyHeader（默认 false）：整页很长的详情页传 true，让「评论 N」+ 排序那一行带子吸顶；
 *        评论弹窗与动态详情不传＝不吸，版式一字不变
 * 评论行的三种「多出来的东西」都由后端逐行下发的字段决定，组件自己不算：
 *        is_admin（管理员身份的行，如打卡的点评）→ 昵称后一枚「管理员」标签；
 *        star（>0 才有星级，普通评论恒 0）→ 昵称后那枚「点评」标签 + 正文之上那排 u-rate
 *        （点评行由后端逐行置顶，排序档 default/最新/最早都不影响它，见 CommentPage::paginate）；
 *        media（{images,videos,audios}）→ 一份 tz-circle-media-grid，视频/语音点开走本组件自带的预览弹窗
 *        （打卡 2026-09-26 起点评＝一条带星级与附件的管理员评论，落点就在这一行，不再在动态正文里排一块点评）
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
		sortable: { type: Boolean, default: true },
		likeable: { type: Boolean, default: true },
		deletable: { type: Boolean, default: true },
		// 空状态文案：列表请求失败时由父级把原因传进来（不能把「加载失败」说成「还没有评论」）
		emptyText: { type: String, default: '还没有评论' },
		// 复用方（打卡）传本活动 id：头像/昵称改跳「这个学员在本活动的打卡记录页」。
		// 默认 0 = 圈子原口径（跳成员主页），复用方只覆盖跳转目标，不复制一份评论行
		ownerRecordId: { type: [Number, String], default: 0 },
		// 标题带（「评论 N」+ 右侧排序）是否吸顶，默认 false = 弹窗与动态详情原口径（不吸）。
		// 只在整页很长的详情页打开（打卡日记详情），评论行滚出屏幕后还能切排序
		stickyHeader: { type: Boolean, default: false },
	},
	data() {
		return {
			commentSort: 'default',
			// 评论头像加载失败标记：key = 头像地址（地址作 key，列表换行时无需手动重置），改用默认头像
			// 头像为空（管理员没设过头像）同样走默认头像，不留一个空圈
			// key = mpKey(头像地址)：地址原样作 key 会被 setData 当成嵌套路径解析后抛错（common/utils/mp-data-key）
			avatarErrors: {},
			// 评论附件里的视频/语音预览（图片走系统放大，不占这份弹窗实例）
			previewVisible: false,
			previewData: null,
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
		// 「被回复的评论 id」圈子接口叫 reply_id、打卡日记叫 parent_id，键名差异统一由下面的 replyIdOf 一处读（见方法注释）。
		// 这里必须把接口下发的行原样递出去，不能 Object.assign 出一份拷贝：点赞/删除后父级是拿着 emit 出去的那一对象
		// 直接回写 liked / like_count 的（打卡 2026-09-26「给回复的评论点赞无效」即此：回复走拷贝分支，写进去的是拷贝，
		// 源行没动、组件也不重渲染，主评论因为不进拷贝那一路所以看着是好的）
		commentRows() {
			return (this.post && this.post.comments) || [];
		},
		// 问答动态：圈主回答在动态正文中展示，不重复出现在评论列表
		visibleComments() {
			const post = this.post;
			if (!post || !post.comments) return [];
			if (post.post_type == 'question') {
				const ans = this.commentRows.find(c => c.is_owner == 1);
				if (ans) {
					return this.commentRows.filter(c => Number(c.id) !== Number(ans.id));
				}
			}
			return this.commentRows;
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
				while (cur && this.replyIdOf(cur) && idMap[this.replyIdOf(cur)] && !visited[cur.id]) {
					visited[cur.id] = true;
					cur = idMap[this.replyIdOf(cur)];
				}
				const rootId = cur ? cur.id : c.id;
				rootCache[c.id] = rootId;
				return rootId;
			};
			// 主评论沿用后端返回顺序（comment_sort 已在接口层排序，本地不重排）；
			// 回复统一按 id 升序分组合并到所属主评论下（对话顺序展示）
			const mains = list.filter(c => !this.replyIdOf(c));
			const replies = list.filter(c => this.replyIdOf(c));
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
		// 一级评论块的末行（带回复的主评论 = 它最后一条回复，无回复的主评论 = 自身）：
		// 列表按「主评论 + 其回复」分块排列，下一条不是回复即说明本条是块末行。
		// 末行不画线（下面没有下一条评论了，与 .school-cell-item:last-child 同口径）
		groupEndIds() {
			const list = this.sortedComments;
			const map = {};
			for (let i = 0; i < list.length - 1; i++) {
				if (!this.replyIdOf(list[i + 1])) map[list[i].id] = true;
			}
			return map;
		},
	},
	methods: {
		// 被回复的评论 id：圈子接口叫 reply_id、打卡日记叫 parent_id，键名差异只在这一处读，
		// 调用点与本组件其余逻辑都不必再各自转一遍（转成数字，0 = 一级评论）
		replyIdOf(c) {
			return Number((c && (c.reply_id || c.parent_id)) || 0);
		},
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
		// 评论附件 → 媒体格清单：图 → 视频 → 语音 依次排进同一格，命名口径与语音条「语音1」一致；
		// 圈子回复只有图片一组，打卡点评三类都可能带，缺哪组就少几格
		mediaItems(c) {
			const m = (c && c.media) || {};
			const items = [];
			(m.images || []).forEach((url, i) => items.push({ type: 'image', url: url, name: '图片' + (i + 1) }));
			(m.videos || []).forEach((url, i) => items.push({ type: 'video', url: url, name: '视频' + (i + 1) }));
			(m.audios || []).forEach((url, i) => items.push({ type: 'audio', url: url, name: '语音' + (i + 1) }));
			return items.filter((item) => !!item.url);
		},
		// 评论附件里的文档一组：后端 media.files 下发 [{url,name,size}]（与日记 files 列同一形态），
		// 行归一由 tz-circle-file-list 自己判，这里只把不是数组的历史值挡掉，别让整块附件渲染打空
		mediaFiles(c) {
			const files = ((c && c.media) || {}).files;
			return Array.isArray(files) ? files : [];
		},
		previewImage(images, index) {
			uni.previewImage({ current: index, urls: images });
		},
		// 视频/语音格子点了必须有反应：地址直接交给共用预览弹窗（附件都来自本站上传通道）
		previewMedia(item) {
			if (!item || !item.url) return;
			this.previewData = {
				id: item.type,
				filename: item.name || (item.type === 'video' ? '视频' : '语音'),
				filetype: item.type,
				fullurl: item.url,
				filesize: item.size || 0,
			};
			this.previewVisible = true;
		},
		// 评论头像：接口没给或这张图坏了 → 全站默认头像，不留破图。查表包在方法里而不是写在模板上：
		// 模板看不到模块级 import，而失败表的 key 是 mpKey(url)（见 common/utils/mp-data-key）
		avatarSrcOf(c) {
			const url = c && c.avatar;
			return !url || this.avatarErrors[mpKey(url)] ? '/static/image/default-avatar.png' : url;
		},
		// 评论头像加载失败（坏链/文件被删）：记录失败标记，改用全站默认头像，不留破图
		onAvatarError(c) {
			const url = c && c.avatar;
			if (url) this.$set(this.avatarErrors, mpKey(url), true);
		},
		// 点击头像/昵称：跳转该评论人的主页。圈子 = 成员主页；打卡复用方（ownerRecordId 非 0）
		// = 他在这个打卡活动里的打卡记录页，地址与两道守卫只存 common/utils/checkin-owner 一处（M25）。
		// 点评/官方那一行没有记录页可去，跳不成时退回这一行的默认动作（回复这条评论），不留死点击
		goUserHome(c) {
			if (!c) return;
			if (this.ownerRecordId) {
				if (!goOwnerRecord(c, this.ownerRecordId)) this.$emit('reply', c);
				return;
			}
			const post = this.post;
			if (!post || !post.circle_id || !c.user_id) return;
			this.$nav.to('/pages/app/circle/user/home?circle_id=' + post.circle_id + '&user_id=' + c.user_id);
		},
	},
};
</script>

<style scoped>
/* 与首行评论的 10 间距给 padding 而非 margin：margin 会从吸顶带里塌出去，带子就只剩标题那一行高，
   评论行滚到带子下沿时正贴着字；padding 把这 10 留在带子里当遮挡缓冲 */
.comment-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; }
.section-title { font-size: 15px; font-weight: 600; color: #1d2129; }
/* 排序按钮：分段控件（与动态列表卡片脚一致） */
.comment-sort { display: flex; padding: 2px; border-radius: 16px; background: #f3f4f6; }
.comment-sort .sort-option { padding: 4.5px 10px; border-radius: 13px; color: #707780; font-size: 11.5px; }
.comment-sort .sort-option.active { background: #fff; color: #0968f6; font-weight: 600; box-shadow: 0 1px 4px rgba(31,35,41,.06); }
.comment-item { display: flex; gap: 8px; padding: 9px 0; }
.comment-item.is-reply { margin-left: 28px; }
/* 一级评论之间的浅灰分隔线（与 .school-cell-item 行间线同一档 1px #f7f8fa）：
   线画在每个一级评论块的末行之下——带回复时落在最后一条回复之后，
   主评论与其回复、回复与回复之间不断开，末行与最后一条评论下不画 */
.comment-item.is-group-end { border-bottom: 1px solid #f7f8fa; }
.comment-avatar { flex: none; width: 28px; height: 28px; border-radius: 50%; background: #f2f3f5; }
.comment-body { flex: 1; min-width: 0; }
/* 评论区昵称/正文统一 14px（时间行 10px、删除/回复按钮 11px，见下面各自那条） */
.comment-user { font-size: 14px; color: #576b95; font-weight: 500; display: flex; align-items: center; gap: 4px; }
/* 昵称后的身份/类型标记：几何只存一处（10px / 行高 13 / 内衬 0 4 / 圆角 2 / 白字），底色按语义分两档
   —— 圈主与管理员 = 橙（这一行是谁发的），点评 = 主色蓝（这一行是运营给的结论，与下面那排橙色星级区分开） */
.tag-owner, .tag-review { flex: none; font-size: 10px; line-height: 13px; padding: 0 4px; border-radius: 2px; color: #fff; }
.tag-owner { background: #ff7d00; }
.tag-review { background: #0968f6; }
.comment-content { margin-top: 3px; font-size: 14px; color: #1d2129; line-height: 1.65; word-break: break-all; }
/* 换行只给纯文本那一支（评论输入框是 textarea，段内 \n 原样入库，默认 white-space 会折成空格）。
   写在 text 上不写在 .comment-content 上：white-space 会继承进 u-parse 渲染的富文本，
   把 HTML 源码里的缩进与换行也排成可见空白 */
.comment-plain { white-space: pre-wrap; }
.reply-tag { color: #86909c; }
/* 点评星级：单独一排跟在昵称之后（挤进昵称那一排会把长昵称挤掉），橙色与「管理员」标签、
   动态卡精选橙同一档，数值沿用点评原本的 14 号橙色档 */
.comment-rate { margin-top: 3px; }
/* 评论附件：三列几何由 tz-circle-media-grid 给，这里只给与正文之间的间距（宿主 class 两端都生效，M21） */
.comment-media { margin-top: 6px; }
/* 评论附件里的文档行：行高与图标由 tz-circle-file-list 给，这里只给与上面媒体格之间的间距（同一档 6px） */
.comment-files { margin-top: 6px; }
/* 评论正文/昵称 14px，时间行 10px（2026-09-25 用户点名：时间比正文小一档才不像「另一句评论」）；
   回复/删除入口另走 11px（下面两条自己的类） */
.comment-meta { margin-top: 4px; font-size: 10px; color: #86909c; display: flex; align-items: center; gap: 10px; }
.comment-reply { color: #0968f6; font-size: 11px; }
.comment-del { color: #f53f3f; font-size: 11px; }
.comment-like { flex: none; display: flex; align-items: center; gap: 2px; padding: 3px; align-self: flex-start; }
.comment-like-count { color: #7c848e; font-size: 11px; }
.comment-skeleton { padding: 10px 0; }
.comment-skeleton-item { margin-bottom: 15px; }
/* 计数占位块：与真实数字同字号档（15px 字高约 15），内联在标题文字之后 */
.ccl-sk-count {
	display: inline-block;
	width: 22px;
	height: 13px;
	margin-left: 3px;
	border-radius: 4px;
	background: #e5e6eb;
	vertical-align: middle;
}
</style>
