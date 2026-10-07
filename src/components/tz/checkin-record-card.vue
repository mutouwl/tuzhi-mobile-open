<template>
	<!-- 外层只用来挂弹层（「更多」菜单与日签图海报）：弹层必须与可点的卡片平级（圈子列表卡片 tz-circle-post
	     也是把弹窗摆在 .post-card 之外），摆在卡内会被整卡的 @tap 接住，点遮罩就等于进动态详情 -->
	<view class="ck-record-card-wrap">
		<!-- 整卡可点进动态详情：空白区/头部/正文/评价/时间一律同一动作（与圈子列表卡片 tz-circle-post 的
		     @tap="onCard" 同一口径）。头部那一块由下面的 .ck-rc-head 单独接管（点头像进这个人、点正文进这条动态）；
		     媒体格/附件行/点赞/评论/右上角更多自带 @tap.stop，点到它们只执行各自动作，不会冒泡到整卡，
		     所以这些动作要在卡片内自己接住（图片走 uni.previewImage、视频/语音开 tz-file-preview，同圈子卡片） -->
		<view class="ck-record-card" @tap="onDetail">
			<!-- 右上角「更多」：与圈子列表卡片同一判据（tz-circle-post-head 只在 post.is_mine 时出入口），
			     官方动态 user_id=0 不算本人，入口自然不出；动作项也只有本人那条路拿得到 -->
			<!-- 头部（头像 + 昵称 + 元信息）单独包一层并接管点击：点这一块 = 看这个人（他的打卡记录页），
			     点卡片其余部分 = 看这条动态。共用头部组件不改口径（圈子的整卡可点照旧，见 M19），
			     收口写在调用方这一层；右上角「更多」自带 .stop 在本层之内，
			     点它既不会进记录页、也不会误进动态详情 -->
			<view class="ck-rc-head" @tap.stop="onHeadTap">
				<tz-circle-post-head :post="headPost" :type-tag="typeTag" :meta="subText" :show-more="!record.is_official" @more="openMore">
					<template #tags>
						<!-- 任务标签不在这里：2026-09-26 用户口径「要像日记详情页那样显示在动态卡的下方并可点击」，整枚搬到卡底那一行（.ck-rc-tags），组件与可点判据仍是同一份；昵称行只留运营标过的置顶/精选 -->
						<text class="ck-rc-tag ck-rc-tag-top" v-if="record.is_top == 1">置顶</text>
						<text class="ck-rc-tag ck-rc-tag-featured" v-if="record.is_featured == 1">精选</text>
						<!-- 本人那条「仅管理员可见」的动态现在会留在自己的动态流里（判据见 VisibilityService::canView），
						     不标出来就成了一条凭空只有自己能看见的动态；别人那一侧后端根本不下发，无需再判 -->
						<text class="ck-rc-tag ck-rc-tag-admin" v-if="record.is_mine == 1 && record.visible_to == 1">仅管理员</text>
					</template>
				</tz-circle-post-head>
			</view>
			<!-- 正文：版式照圈子动态卡（42px 缩进对齐昵称、最多 4 行、超出出「查看更多」跳详情） -->
			<view class="ck-rc-content">{{ record.content }}</view>
			<view v-if="record.content && showMore" class="ck-rc-more" @tap.stop="onDetail">查看更多</view>
			<!-- 图片/视频/语音同在一个九宫格（共用组件，口径同圈子卡片：与正文同一 42px 缩进），点击开预览 -->
			<tz-circle-media-grid v-if="mediaList.length" class="ck-rc-media" :items="mediaList" :content-indent="true"
				@preview-image="previewImage" @preview-video="previewVideo" @preview-audio="previewAudio" />
			<!-- 附件：与动态卡片同一份组件（tz-circle-file-list 卡片档最多 3 行，点开走 tz-file-preview），
			     组件内部已 @tap.stop，点文件不会冒泡到整卡详情（M19） -->
			<tz-circle-file-list class="ck-rc-files" v-if="(record.files || []).length" :files="record.files" :limit="3" preview />
			<!-- 课程卡片：官方动态挂的课（后台「发布动态」的课程列表字段，按 record.link_data 出，不看 post_type——
			     打卡这边没有那根字段），与圈子卡片同一份组件、同一档截断（卡上最多 2 门，全部去日记详情页看）；
			     @tap.stop 是 M19 的硬要求：点课程卡只跳课程详情，不冒泡成进本条动态详情 -->
			<view class="ck-rc-course" v-if="courseList.length" @tap.stop>
				<tz-course-mini :list="courseList" :round="true" :border="true" :margin="8" />
			</view>
			<!-- 卡底「关联」chip 行：左＝打卡名称（进活动主页）、右＝任务名称（进任务详情页），两枚与日记详情页卡底
			     同一份组件同一几何、只差行首图标（calendar = 所属活动 / list = 所属任务，§1「关联 chip」）。
			     两枚各自判「有没有那个实体」（活动名 = 行上的 checkin_title，只有跨活动列表下发；
			     任务 chip 的 task_id=0 自己不出），全空则整行不出，不留一条空白行、也不摆点了没反应的死标签。
			     长名字不折行：整行横向滑动，写法照 diary 的 .cdy-tags -->
			<scroll-view scroll-x :show-scrollbar="false" class="ck-rc-tags" v-if="showTagRow">
				<tz-checkin-activity-tag class="ck-rc-activity-chip" :checkin-id="record.checkin_id || checkinId" :title="record.checkin_title" />
				<tz-checkin-task-tag v-if="!hideTaskTag" class="ck-rc-task-chip" :task-id="record.task_id" :title="record.task_title" />
			</scroll-view>
			<!-- 卡片脚：时间在左（10px 灰字，与点评/评论行的灰字时间同一档），点赞与评论整组贴右缘；
			     两枚动作之间仍是 36px（自动留白只给第一枚，见样式里的 .ck-rc-action-first） -->
			<view class="ck-rc-foot">
				<text class="ck-rc-time">{{ fmt(record.createtime) }}</text>
				<view class="ck-rc-action ck-rc-action-first" @tap.stop="$emit('like', record)">
					<u-icon :name="record.is_liked ? 'heart-fill' : 'heart'" :color="record.is_liked ? '#F53F3F' : '#86909c'" size="18" />
					<text class="ck-rc-num">{{ record.like_count }}</text>
				</view>
				<view class="ck-rc-action" @tap.stop="$emit('comment', record)">
					<u-icon name="chat" color="#86909c" size="18" />
					<text class="ck-rc-num">{{ record.comment_count }}</text>
				</view>
			</view>
			<!-- 评论预览（2026-09-27 用户按参考图要求追加，只加这一块，卡片其余结构不动）：
			     卡片脚下面一块灰底，列这条动态的最新三条评论，每行「头像 + 昵称(+回复/管理员/点评) + 星级 + 正文 + 灰字时间」，
			     底部「查看全部」与卡片脚的评论图标同一个动作（弹共用的评论弹窗，不跳详情页，见 M18）。
			     行数与内容全由后端逐行下发（record.comments，取数见 CommentPreview、作者口径见 CommentAuthors），
			     前端不再数三条、也不自己判哪行是点评；没有评论时整块不排，不留一块没人认领的灰底（M13/M16）。
			     块内标签与灰字时间沿用共用评论行（tz-circle-comment-list）那一档，不按参考图另配一色；
			     左边缘仍与正文/媒体/附件/卡片脚同一条 42px 线（M21）。
			     整块不接管点击：点评论行 = 点卡片（进这条动态），只有「查看全部」自带 .stop（M19） -->
			<view class="ck-rc-comments" v-if="previewComments.length">
				<view class="ck-rc-comment" v-for="c in previewComments" :key="c.id">
					<image class="ck-rc-comment-avatar" :src="commentAvatar(c)" mode="aspectFill" @error="onCommentAvatarError(c)" />
					<view class="ck-rc-comment-body">
						<view class="ck-rc-comment-user">
							<text class="ck-rc-comment-nickname">{{ c.nickname }}</text>
							<text v-if="c.reply_nickname" class="ck-rc-comment-reply">回复 {{ c.reply_nickname }}</text>
							<text v-if="c.is_admin" class="ck-rc-comment-tag ck-rc-comment-tag-admin">管理员</text>
							<text v-if="c.star > 0" class="ck-rc-comment-tag ck-rc-comment-tag-review">点评</text>
						</view>
						<view class="ck-rc-comment-rate" v-if="c.star > 0">
							<u-rate :value="Number(c.star)" readonly size="14" active-color="#FF7D00" />
						</view>
						<view class="ck-rc-comment-text">{{ c.content }}</view>
						<view class="ck-rc-comment-time">{{ fmt(c.createtime) }}</view>
					</view>
				</view>
				<view class="ck-rc-comment-all" @tap.stop="$emit('comment', record)">查看全部 ></view>
			</view>
			<!-- 媒体预览弹窗（与动态详情同一份组件；视频/语音由本卡自己接住，图片走系统 previewImage）。
			     卡片在列表里成批渲染，弹窗用 v-if 按需挂载，不随列表留 N 份隐藏实例 -->
			<tz-file-preview v-if="previewVisible" :visible="true" :data="previewData" @close="previewVisible = false" />
		</view>
		<!-- 更多：动作项与日记详情页「更多」菜单同一份清单（日签图 / 编辑 / 删除，删除标红），只有本人动态才有入口；
		     编辑进提交页回填态、删除走打卡的 deleteOwn、日签图弹下面那只共用弹层。
		     与媒体预览弹窗同一口径按需挂载（列表里成批渲染，不留 N 份隐藏弹层实例） -->
		<u-action-sheet v-if="moreMounted" :show="moreVisible" title="更多操作" :round="10" :actions="moreActions" cancelText="取消"
			:closeOnClickOverlay="true" @select="onMoreSelect" @close="moreVisible = false"></u-action-sheet>
		<!-- 日签图弹层：与日记详情页那只同一份组件（tz-checkin-daily-card，海报版式与出图端路都在共用弹层里），
		     本页不自造第二份海报。
		     只在本人那条的「更多→日签图」点开时才挂（这一枚卡在列表里成批渲染，不留 N 份隐藏弹层与画布实例），
		     挂的方式与「更多」菜单同一套：先挂、下一拍再翻 show，同一拍以 show=true 创建会丢掉上滑动画。
		     海报要的金句库 / 底图清单 / 累计天数只随这条日记的详情下发（列表行里没有），故点这一项先取一次
		     diaryDetail，**取到了才挂弹层**（数据没到手弹出来是空海报，见 M20②），失败就把后端那句原因说出口（M13） -->
		<tz-checkin-daily-card v-if="dailyMounted" :show="dailyShow" :checkin-id="checkinId"
			:checkin-title="daily.checkin_title" :nickname="daily.nickname" :avatar="daily.avatar"
			:total-days="daily.total_days || 1" :quotes="daily.quotes" :share-bgs="daily.share_bgs"
			@close="dailyShow = false" />
	</view>
</template>

<script>
import { goOwnerRecord } from '@/common/utils/checkin-owner';
import { mpKey } from '@/common/utils/mp-data-key';
/**
 * 打卡动态流卡片（活动详情-动态栏 / 日历某天记录共用）
 * 版式照圈子列表卡片 tz-circle-post：正文 42px 缩进 + 最多 4 行「查看更多」、媒体九宫格与附件行同一缩进、
 * 卡片脚左对齐 36px 间距；卡片外壳仍走打卡模块的教务口径（直角 / 内衬 14 / 卡间距 10，见 ui-baseline-mobile M21）
 * 卡片脚下面那块「最新评论预览」（2026-09-27 按用户参考图追加）：行数据是后端逐行的 record.comments
 *   （最新几条、按发布时间倒序，条数只在 CommentPreview::PER_RECORD 一处），标签与灰字时间沿用共用评论行那一档；
 *   「查看全部」与卡片脚的评论图标同一个 emit，不另开一条路
 * emits: detail（整卡点击进动态详情）、like（点赞）、comment（点击评论图标或预览块的「查看全部」，
 *        由调用页弹出与圈子动态卡片共用的评论弹窗：先评论列表、弹窗内再弹回复框，不跳详情页）、
 *        refresh（本人动态删除成功后，由调用页重取列表）
 * 卡片内部自己完成的跳转（不经调用页）：点头部那一块 → 该学员在本活动内的打卡记录页
 *   （口径与入口守卫见 common/utils/checkin-owner.js）、点任务标签 → 任务详情页、点「更多→编辑」→ 发表页回填态
 * props: checkinId —— 本条动态所属的打卡活动 id，编辑跳转与删除接口都要用（列表行只带日记 id，
 *        活动 id 由调用页给，两个调用点都握着自己那一页的 id）
 */
export default {
	name: 'tz-checkin-record-card',
	props: {
		record: { type: Object, default: function () { return {}; } },
		checkinId: { type: [Number, String], default: 0 },
		// 任务详情页的动态栏传 true：任务名已经是那一页的标题，卡上再摆一枚点自己页面的标签纯属重复
		hideTaskTag: { type: Boolean, default: false },
	},
	emits: ['detail', 'like', 'comment', 'refresh'],
	data() {
		return {
			// 正文是否超出 4 行（超出才出「查看更多」，与圈子卡片同一判法：量实际高度）
			moreContent: false,
			// 媒体预览弹窗（视频/语音点击后播放）
			previewVisible: false,
			previewData: null,
			// 右上角「更多」菜单（只在本人动态出现入口，见 headPost.is_mine）：
			// moreMounted 按需挂载、moreVisible 控制显隐，两者分开才既不留隐藏实例、又保住上滑动画
			moreVisible: false,
			moreMounted: false,
			// 日签图弹层：daily 是这条日记的详情（金句库 / 底图清单 / 累计天数只在 diaryDetail 里给），
			// 取到之前不挂弹层（挂了就是海报上一片空白），同一次打开只取一次
			daily: {},
			dailyMounted: false,
			dailyShow: false,
			dailyLoading: false,
			// 评论预览行的头像加载失败标记（key = 头像地址，列表换行无需手动重置）：
			// 与共用评论行同一处理，坏图/没设过头像都回默认头像，不留空圈也不留破图
			// key = mpKey(头像地址)：地址原样作 data 键会被 setData 当成嵌套路径解析后抛错（common/utils/mp-data-key）
			commentAvatarErrors: {},
		};
	},
	computed: {
		headPost() {
			return {
				avatar: this.record.avatar || '/static/image/default-avatar.png',
				nickname: this.record.nickname,
				// 更多入口的显示判据由 tz-circle-post-head 按 is_mine 判（与圈子列表卡片同一口径）
				is_mine: this.record.is_mine,
			};
		},
		// 动作项与日记详情页「更多」菜单同一份清单与同一顺序（日签图 / 编辑 / 删除，删除标红）：
		// 三项全是「本人对自己这条动态」的动作 —— 日签图画的是本人这一条打卡的天数、头像与昵称，
		// 挂在别人的动态上等于拿他的记录生成一张海报（2026-09-26 用户口径：日签图仅自己可见），
		// 入口本身只在 is_mine 时出（tz-circle-post-head 原判据），官方动态（后台发布）连入口一起隐掉
		// （菜单里一项都没有时不出入口，点开只剩「取消」的更多按钮算违规，M18）。
		// 2026-09-26 用户点名「列表中点右上角更多，是我发的就要有日签图」⇒ 卡片不再少摆这一项
		moreActions() {
			if (this.record.is_official) return [];
			return [{ name: '日签图' }, { name: '编辑' }, { name: '删除', color: '#f53f3f' }];
		},
		// 动态类型：官方动态（管理员后台发布，is_official=1）用昵称行的标签表达，文字取后端 task_title（官方行下发「官方动态」），
		// 前端不再另存一份说法；学员动态没有类型标签（第 N 天打卡/任务名是元信息，见 subText）
		typeTag() {
			return this.record.is_official ? this.record.task_title : '';
		},
		subText() {
			// 官方动态没有「第 N 天打卡/任务」的学员语义（day_seq 恒为 0），元信息留空，类型由 typeTag 的标签表达
			if (this.record.is_official) return '';
			// 挂了任务的动态：任务名在卡底那枚可点 chip 上（tz-checkin-task-tag），元信息不再重复一遍；
			// task_id=0 的普通动态没有任务可去，那句说明留在灰字元信息里（做成标签就是一枚点了没反应的死标签）
			if (Number(this.record.task_id) > 0) return '第' + this.record.day_seq + '天打卡';
			return '第' + this.record.day_seq + '天打卡' + (this.record.task_title ? ' · ' + this.record.task_title : '');
		},
		// 卡底「关联」chip 行有没有内容：两枚各判各的（打卡名称 = 行上的 checkin_title，
		// 只有跨活动列表下发；任务名称 = 未被调用页收起且有 task_id），全空则整行不出
		showTagRow() {
			const hasActivity = !!this.record.checkin_title && Number(this.record.checkin_id || this.checkinId) > 0;
			const hasTask = !this.hideTaskTag && Number(this.record.task_id) > 0;
			return hasActivity || hasTask;
		},
		// 课程清单：link_data 由后端按关联表现拼（单课程对象与数组都兼容，同圈子卡片），
		// 卡片档最多 2 门、全部去日记详情页看（口径与 tz-circle-post 的 courseList 一致）
		courseList() {
			const d = this.record.link_data;
			if (!d) return [];
			const list = Array.isArray(d) ? d : [d];
			return list.slice(0, 2);
		},
		showMore() {
			return this.moreContent;
		},
		mediaList() {
			const list = [];
			(this.record.images || []).forEach(url => list.push({ type: 'image', url: url }));
			(this.record.videos || []).forEach(url => list.push({ type: 'video', url: url }));
			// 语音与图片/视频同在九宫格展示（圈子卡片口径），不再单列语音条就地自播
			(this.record.audios || []).forEach(url => list.push({ type: 'audio', url: url }));
			return list;
		},
		// 评论预览：后端逐行下发的最新几条评论（条数这一档只在 CommentPreview::PER_RECORD 一处，
		// 前端不再 slice 一份「3」出来，否则两处数字会分叉）；接口没给这一键就整块不排
		previewComments() {
			const list = this.record && this.record.comments;
			return Array.isArray(list) ? list : [];
		},
	},
	watch: {
		'record.content'() {
			this.measureContent();
		},
	},
	mounted() {
		this.measureContent();
	},
	methods: {
		pad(n) { return n < 10 ? '0' + n : '' + n; },
		// 正文超 4 行才出「查看更多」（4 行高度阈值 14.5px * 1.7 * 4 ≈ 98.6，与圈子卡片同一判法）
		measureContent() {
			if (!this.record || !this.record.content) {
				this.moreContent = false;
				return;
			}
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this);
				query.select('.ck-rc-content').boundingClientRect((rect) => {
					// 组件已销毁就不要再写：量宽回调晚于页面卸载时，写数据 ⇒ Vue patch ⇒ setData 打到空页面上
					// ⇒ WeChat 运行时抛 TypeError 并废掉整个 setData 通道（见 tz-share-poster-body 的 gone()）
					if (this._isDestroyed || this._isBeingDestroyed) return;
					if (rect && rect.height) this.moreContent = rect.height >= 98.6;
				}).exec();
			});
		},
		// 整卡点击：无 id 的异常条目不进详情（与 tz-circle-post 的 onCard 兜底一致，避免 ?id=undefined 报「动态不存在」）
		onDetail() {
			if (!this.record || !this.record.id) return;
			this.$emit('detail', this.record);
		},
		// 头部那一块（头像 + 昵称 + 元信息）的点击：进这个人「在本活动内的打卡记录页」，
		// 与排行榜行、成员卡同一个入口（守卫与地址只在 common/utils/checkin-owner 一处）。
		// 能不能看、看到哪些条全由后端判（未参与 / 分组隔离 / 仅管理员可见），前端不重复判一遍；
		// 官方动态（user_id=0）没有这个人的记录页可去 ⇒ 退回整卡的默认动作（进这条动态），不留死点击
		onHeadTap() {
			if (!goOwnerRecord(this.record, this.checkinId)) this.onDetail();
		},
		// 更多入口：先挂弹层、下一拍再翻 show——同一拍里以 show=true 创建弹层，它直接就展开，
		// 上滑动画会被丢掉（弹层内部靠 show 从 false 翻到 true 才跑动画）
		openMore() {
			this.moreMounted = true;
			this.$nextTick(() => {
				this.moreVisible = true;
			});
		},
		// 更多菜单选中：编辑进提交页回填态、删除走本模块 deleteOwn、日签图弹这一条的海报
		// （三项动作与日记详情页的「更多」同一套接口与文案，不在这儿另存一份）
		onMoreSelect(item) {
			this.moreVisible = false;
			if (!item || !this.record || !this.record.id) return;
			if (item.name === '日签图') this.openDaily();
			else if (item.name === '编辑') this.goEdit();
			else if (item.name === '删除') this.removeOwn();
		},
		/**
		 * 「更多→日签图」：先取这一条日记的详情，再挂弹层、下一拍翻 show
		 *
		 * 为什么要多这一次接口：海报上的金句库（quotes）、底图清单（share_bgs）与「累计打卡 N 天」
		 * 只随 diaryDetail 下发，动态流那一页的行里没有这些字段，
		 * 前端也不写死一份兜底语录与样式（frame.md 第 9 条）。
		 * 2026-09-27 起这两份后端恒给系统默认（内置 10 条金句 + 空底图清单，管理端「打卡设置」暂时下线），
		 * 「累计打卡 N 天」仍要这一趟，接口与缓存照旧。
		 * 数据没到手不挂弹层（弹出来是海报上一片空白，M20②「等数据到位再弹」），
		 * 取失败要把后端那句原因说出口（M13：不留点了没反应）；到手过一次就缓存，重开不再请求。
		 * 「更多」入口只在本人那条出（headPost.is_mine），所以这里不重复判归属——能不能看由后端
		 * viewTarget 一处判，跨组/已删除它会直接把原因回给我。
		 */
		openDaily() {
			if (this.dailyMounted) {
				this.dailyShow = true;
				return;
			}
			if (this.dailyLoading) return;
			this.dailyLoading = true;
			this.$api('checkin.checkin.diaryDetail', { checkin_id: this.checkinId, record_id: this.record.id })
				.then((ret) => {
					this.dailyLoading = false;
					if (!ret || ret.code !== 1 || !ret.data || !ret.data.id) {
						uni.showToast({ title: (ret && ret.msg) || '日签图打开失败，请重试', icon: 'none' });
						return;
					}
					this.daily = ret.data;
					this.dailyMounted = true;
					// 先挂、下一拍再 show：同一拍以 show=true 创建弹层会丢掉上滑动画（与「更多」菜单同一写法）
					this.$nextTick(() => {
						this.dailyShow = true;
					});
				})
				.catch(() => {
					this.dailyLoading = false;
					uni.showToast({ title: '加载失败，请重试', icon: 'none' });
				});
		},
		goEdit() {
			uni.navigateTo({
				url: '/pages/app/checkin/submit/submit?id=' + this.checkinId + '&record_id=' + this.record.id,
			});
		},
		removeOwn() {
			uni.showModal({
				title: '提示',
				content: '删除后该打卡记录不可恢复，确定要删除吗？',
				success: (res) => {
					if (!res.confirm) return;
					this.$api('checkin.checkin.deleteOwn', { checkin_id: this.checkinId, record_id: this.record.id })
						.then((ret) => {
							// 任务已结束等后端拦截：把原因说清，不要静默停在原处（M13）
							if (!ret || ret.code !== 1) {
								uni.showToast({ title: (ret && ret.msg) || '删除失败，请重试', icon: 'none' });
								return;
							}
							uni.showToast({ title: '删除成功', icon: 'none' });
							this.$emit('refresh');
						});
				},
			});
		},
		fmt(ts) {
			if (!ts) return '';
			const d = new Date(ts * 1000);
			return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate()) + ' ' + this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
		},
		// 评论预览行的头像：接口没给（管理员没设过头像）或这张图坏了 → 全站默认头像，不留空圈/破图
		commentAvatar(c) {
			const url = c && c.avatar;
			return !url || this.commentAvatarErrors[mpKey(url)] ? '/static/image/default-avatar.png' : url;
		},
		onCommentAvatarError(c) {
			const url = c && c.avatar;
			if (url) this.$set(this.commentAvatarErrors, mpKey(url), true);
		},
		// 图片点击放大预览（与 tz-circle-post 同一写法）：媒体格在组件内部 .stop，整卡监听接不到
		previewImage(images, index) {
			uni.previewImage({ current: index, urls: images });
		},
		// 视频/语音点击开预览弹窗（与动态详情、圈子卡片同一口径）
		previewVideo(item) {
			this.openMediaPreview(item, 'video');
		},
		previewAudio(item) {
			this.openMediaPreview(item, 'audio');
		},
		openMediaPreview(item, filetype) {
			if (!item || !item.url) return;
			this.previewData = {
				id: filetype,
				filename: item.name || (filetype === 'video' ? '视频' : '语音'),
				filetype: filetype,
				fullurl: item.url,
				filesize: item.size || 0,
			};
			this.previewVisible = true;
		},
	},
};
</script>

<style scoped>
/* 动态卡：直角通栏、无阴影、内衬 14、卡间距 10（教务列表条目卡档，同 .school-card）；
   组件为自定义组件，app.wxss 的全局档进不来，故在组件内按同口径写死数值 */
.ck-record-card {
	background: #fff;
	border-radius: 0;
	padding: 14px;
	margin-bottom: 10px;
}
/* 标签几何照圈子卡片（10px/13 行高/0 3px 内衬/2px 圆角/500 字重），配色沿用打卡模块语义（置顶蓝、精选橙） */
.ck-rc-tag {
	flex: none;
	font-size: 10px;
	line-height: 13px;
	padding: 0 3px;
	border-radius: 2px;
	font-weight: 500;
}
.ck-rc-tag-top {
	color: #0968f6;
	background: #eaf1fe;
}
.ck-rc-tag-featured {
	color: #FF7D00;
	background: #fff3e8;
}
/* 仅管理员可见 = 中性状态，配色走全站辅助灰档（文字 #86909c + 底 #f2f3f5），不与置顶/精选的语义色抢 */
.ck-rc-tag-admin {
	color: #86909c;
	background: #f2f3f5;
}
/* 正文：42px 缩进对齐昵称、最多 4 行（字号/行高/色与圈子卡片 .post-content 同一档）。
   pre-wrap 是给换行的：正文是发布页 textarea 存的纯文本，后端只 trim 首尾、段内 \n 原样入库，
   默认 white-space 会把 \n 折成空格——用户分了段，列表里看着是一整段 */
.ck-rc-content {
	margin: 9px 0 0 42px;
	font-size: 14.5px;
	color: #313943;
	line-height: 1.7;
	word-break: break-all;
	white-space: pre-wrap;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 4;
	overflow: hidden;
}
.ck-rc-more {
	margin: 4px 0 0 42px;
	font-size: 14px;
	color: #0968f6;
}
/* 媒体九宫格：左缩进由组件的 content-indent 给（42px），此处只给上间距（圈子卡片 .card-media-margin 同档） */
.ck-rc-media {
	margin-top: 10px;
}
/* 附件行与正文/媒体同缩进（圈子卡片 .card-file-margin 口径） */
.ck-rc-files {
	margin: 10px 0 0 42px;
}
/* 课程卡片与附件行同一条左边缘（M21：卡内侧 42px 缩进只存一处口径），间距取圈子卡片那档 */
.ck-rc-course {
	margin: 10px 0 0 42px;
}
/* 卡底任务 chip 行：与正文/附件/卡片脚同一条 42px 左边缘（M21），一行放不下整行横滑（不折行、不加省略号，
   口径与几何都归 ui-baseline-mobile §1「关联 chip」行，参照实现是 diary 的 .cdy-tags） */
.ck-rc-tags {
	margin: 10px 0 0 42px;
	white-space: nowrap;
}
/* scroll-view 里的 chip 要按 inline-flex 排，vertical-align:top 锁基线：
   inline-flex 的基线由内部第一个 flex 项给，跟着基线走会错开几像素（组件是 isolated 的，只能打在宿主节点上，M12） */
.ck-rc-activity-chip {
	display: inline-flex;
	vertical-align: top;
	/* 两枚 chip 的间距 8 由行首这枚的 margin-right 给（口径同 diary 的 .cdy-*，§1「关联 chip」档）：
	   挂在右侧那枚的 margin-left 上，会让它在活动 chip 不出时自己带着一段左偏移 */
	margin-right: 8px;
}
.ck-rc-task-chip {
	display: inline-flex;
	vertical-align: top;
}
/*  #ifdef  H5  */
/* uni 这一版 scroll-view 运行时不认 show-scrollbar（口径同 diary 的 .cdy-tags 与 share-poster 的 .sh-themes） */
.ck-rc-tags ::-webkit-scrollbar {
	display: none;
}
/*  #endif  */
/* 卡片脚：42px 左缩进；灰字时间在左、点赞与评论整组贴右缘（2026-09-25 用户口径，
   动作跟在时间后面会被读成时间的延续，落位要与时间分两端） */
.ck-rc-foot {
	display: flex;
	align-items: center;
	margin: 10px 0 0 42px;
}
/* 灰字时间：10px（与点评/评论行的 .comment-meta 同一档，见 ui-baseline-mobile §1「灰字时间」；
   与正文同号会被读成正文的延续） */
.ck-rc-time {
	font-size: 10px;
	color: #86909c;
}
.ck-rc-action {
	display: flex;
	align-items: center;
	margin-left: 36px;
}
/* 自动留白只给第一枚动作 ⇒ 点赞/评论一起推到右缘，两枚之间仍是固定的 36px。
   不用 gap、也不用 :first-of-type（小程序端对结构伪类支持不稳） */
.ck-rc-action-first {
	margin-left: auto;
}
.ck-rc-num {
	font-size: 13.5px;
	color: #86909c;
	margin-left: 4px;
}
/* ===== 评论预览（卡片脚下面那块灰底）=====
   块：灰底 #f7f8fa + 6px 圆角（§1「封面/缩略图」档，与圈子卡片那块 .comment-preview 同一档，
   卡片本身仍直角无投影，M21 只管卡片外壳）；左边缘仍与正文/媒体/附件/卡片脚同一条 42px 线。
   上下留边只由「容器 4 + 每行 6」两档凑，首行上沿与末行下沿都是 10，不出「下面比上面空」那种不一致 */
.ck-rc-comments {
	margin: 10px 0 0 42px;
	padding: 4px 10px;
	background: #f7f8fa;
	border-radius: 6px;
}
.ck-rc-comment {
	display: flex;
	gap: 8px;
	padding: 6px 0;
}
/* 头像 28 圆：与共用评论行 .comment-avatar 同一档（含没图时那层 #f2f3f5 底，不留白圈） */
.ck-rc-comment-avatar {
	flex: none;
	width: 28px;
	height: 28px;
	border-radius: 50%;
	background: #f2f3f5;
}
.ck-rc-comment-body {
	flex: 1;
	min-width: 0;
}
/* 昵称行：14px 蓝灰 + 标签，字号/颜色与共用评论行 .comment-user 同一档 */
.ck-rc-comment-user {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 14px;
	color: #576b95;
	font-weight: 500;
}
.ck-rc-comment-reply {
	flex: none;
	font-weight: normal;
	color: #86909c;
}
/* 昵称后的身份标记：几何与配色都取共用评论行那一档（管理员橙 / 点评蓝），不按参考图另配一色 */
.ck-rc-comment-tag {
	flex: none;
	font-size: 10px;
	line-height: 13px;
	padding: 0 4px;
	border-radius: 2px;
	color: #fff;
	font-weight: normal;
}
.ck-rc-comment-tag-admin {
	background: #ff7d00;
}
.ck-rc-comment-tag-review {
	background: #0968f6;
}
/* 点评星级：单独一排跟在昵称之后（挤进昵称那一排会把长昵称挤掉），与评论行 .comment-rate 同一档 */
.ck-rc-comment-rate {
	margin-top: 3px;
}
/* 正文 14px，预览这一档最多两行（超出由卡片截，看全文进详情或点查看全部） */
.ck-rc-comment-text {
	margin-top: 3px;
	font-size: 14px;
	color: #1d2129;
	line-height: 1.65;
	word-break: break-all;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}
/* 灰字时间：10px（§1「灰字时间」唯一档，与评论行 .comment-meta、卡片脚时间同一档） */
.ck-rc-comment-time {
	margin-top: 4px;
	font-size: 10px;
	color: #86909c;
}
/* 「查看全部」：与圈子卡片那块 .comment-more 同一档（14px + 那个偏蓝灰的链接色），
   点它 = 卡片脚的评论图标那一下（弹评论弹窗），不另开一条路 */
.ck-rc-comment-all {
	padding: 2px 0 6px;
	font-size: 14px;
	color: #4c78a7;
}
</style>