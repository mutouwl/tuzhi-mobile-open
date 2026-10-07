<template>
	<!--
	  分享有礼活动详情弹窗（竞品图4 三态 + 图15/图16/图19，三态同一组件不做三个弹窗）。
	  版式按参考图那一段一段落：奖品大卡（多张可左右滑）→ 三格统计
	  → 已完成/未完成两档受邀人 → 吸底主按钮。
	  「我在这条活动里已中的奖」那一段自 2026-10-06 起不再摆在这里（用户点名「邀请完成之后，
	  下面这个我的奖品不需要显示了」）：达标由标题行「进行中」右侧那枚「已完成」标签说出口，
	  领奖那一整页只由底部主按钮「查看我的奖品」换页过去，弹窗内不再挂第二只领奖组件。
	  每一段的文字与能不能点都由后端逐行下发（M22），前端不数助力、不比时间、不拼句子。
	  观感走系统弹窗档（白底、顶部 12 圆角、16/600 左对齐标题、灰底信息块、tz-button 4px 圆角），
	  不抄竞品的橙色渐变运营皮肤（PRD M-P2 组件映射那一行明令）。
	-->
	<view>
	<u-popup
		:show="show"
		mode="bottom"
		bgColor="transparent"
		:round="12"
		:closeable="true"
		:safeAreaInsetBottom="false"
		:zIndex="10230"
		:overlayStyle="{ zIndex: 10220 }"
		@close="close"
	>
		<view class="sgd">
			<view class="sgd-head">
				<!-- 状态标签紧跟名称、落在名称右侧（口径标/状态标紧跟名称，见 ui-baseline W25 同族）。
				     标题行右内衬给到 36px：u-popup 的关闭图标绝对定位在右上角
				     （right:15 + 图标 18 ⇒ 占面板右缘往里 15~33px，见 u-popup.vue 的
				     .u-popup__content__close--top-right），内衬小于 33 时名称一长就钻到图标底下。
				     取数期间标题行照常摆：只把待到手的名称、状态文字换成灰块（M16 三档修法） -->
				<view class="sgd-sk-title" v-if="sk"></view>
				<text class="sgd-title" v-else>{{ activity.title || '分享有礼' }}</text>
				<!-- 状态标签这一格留真标签壳（#f2f3f5 底 + 4px 圆角 + 1px 6px 内衬都是最终那一档），
				     只把待到手的文字换成灰块：标签壳自带浅底与圆角、正是 M16① 说的「容器走真类、灰块进内部」，
				     整枚盖灰等于把壳那一档也换掉了。蓝底还是灰底由活动状态决定，取数时判不出来 ⇒ 取中性那一档、
				     不装 sgd-tag--on。壳自己 19px（1+17+1），里头那枚灰条 13+2+2=17 = 壳的内容盒，加载前后同高。 -->
				<view class="sgd-tag" v-if="sk">
					<view class="sgd-sk-tag"></view>
				</view>
				<text :class="['sgd-tag', ended ? '' : 'sgd-tag--on']" v-else>{{ activity.run_state_text }}</text>
				<!-- 「已完成」是第二根轴：活动此刻在不在跑（run_state_text）与我这个人做没做到点
				     （my.done_text）说的是两件事，两枚标签并排各说各的（2026-10-06 用户点名
				     「在完成的活动里，在 进行中 这个 Tag 右侧增加一个新的 Tag 显示已完成」）。
				     文案整枚由后端下发，前端不拿 assist_num 与 invite_num 自己比（M22）；
				     没做到点那一句是空串 ⇒ 整枚不出。
				     它和上面那枚 run_state 标签不同档：run_state 常显（取数期间留真标签壳垫灰条），
				     这一枚是「按状态才出」的元素 ⇒ 按 M16 不给灰块也不预留空位。
				     项与项的间距仍只由 .sgd-head 的 gap 给，这一枚不自带 margin（硬约束 20） -->
				<text class="sgd-tag sgd-tag--done" v-if="myDoneText">{{ myDoneText }}</text>
			</view>
			<!-- 条件说明与倒计时都是「有才出」的两行，取数期间一律不出：先垫灰块会凭空多出两格，
			     而加载完这两行多半仍然不出（倒计时那一枚 2026-09-30 用户点名「骨架屏有点多余」）。 -->
			<view class="sgd-sub" v-if="activity.condition_text">{{ activity.condition_text }}</view>

			<!-- 内容/失败两档统一装进登记在册的 tz-popup-list（M6 禁止自画滚动区，
			     M18⑨d 要求两档同一个高度：面板从首帧就占住这一档，到手不跳）。
			     取数期间不再另画一棵灰块树：面板底色是纯白，另外铺一层大灰块的形状跟最后显示的组件对不上
			     （2026-09-30 用户点名「骨架屏形状跟组件样式不一样」），所以内容那一档照常出，
			     只把每格里的名称、数值、图片换成同尺寸灰块（M16 第三档修法）。
			     高度分三档（condition_text 有无 × 底栏在不在），三档**面板总高都等于 60vh + 190px**，
			     与同屏「邀请达人榜」榜单弹层那一屏对齐（2026-10-02 第一次点名、2026-10-06 第二次点名
			     「分享有礼的弹窗高度，包括分享有礼的详情，可以跟这个邀请达人榜弹窗高度对齐」）：
			       无条件说明 + 有底栏（首帧骨架那一档就是它）：头 37 + 列表区 + 底栏 63 = 60vh + 190 ⇒ 列表区 60vh + 90
			       有条件说明（.sgd-sub 多 33）：              头 70 + 列表区 + 底栏 63 = 60vh + 190 ⇒ 列表区 60vh + 57
			       取失败那一档（活动连头都没有，底栏整块收掉）：头 37 + 列表区            = 60vh + 190 ⇒ 列表区 60vh + 153
			     差值都从列表区扣回去，所以数据到手那一刻头行多出 33px 时面板总高不动（M18⑨d 不跳）。
			     算式与逐档数值只在 @/common/utils/live-popup-height 一份里。 -->
			<tz-popup-list :height="listHeight" padding="0 0 12px" :refreshable="false">
				<view class="sgd-missing" v-if="error">
					<u-empty icon="/static/image/empty.png" width="70" height="70" :text="error"></u-empty>
				</view>
				<view class="sgd-body" v-else>
					<!-- 倒计时压在奖品卡上方那一档（图15/图19 的「距活动结束仅剩 …」）；
					     写法照 components/course/live-start-time-bar.vue 的 u-count-down，不自写 setInterval；
					     归零唯一收口点 = @finish 重取详情，让后端把 run_state 收敛成「已结束」并换主按钮文案（M13）。
					     这一行不给灰块：它 v-if 自己判（已结束/未设结束时间那两档加载完本来就不出这一行），
					     硬垫一条灰条等于凭空多一格，加载完那枚灰条还得自己消失
					     （2026-09-30 用户点名「最上方那枚倒计时的骨架屏有点多余」） -->
					<view class="sgd-countdown" v-if="showCountdown">
						<text class="sgd-countdown-label">距活动结束仅剩</text>
						<u-count-down :time="countdownMs" autoStart @change="onCountdownChange" @finish="onCountdownFinish">
							<view class="sgd-countdown-time">
								<text v-if="cd.days > 0" class="sgd-countdown-num">{{ cd.days }}天</text>
								<text class="sgd-countdown-num">{{ pad(cd.hours) }}时</text>
								<text class="sgd-countdown-num">{{ pad(cd.minutes) }}分</text>
								<text class="sgd-countdown-num">{{ pad(cd.seconds) }}秒</text>
							</view>
						</u-count-down>
					</view>

					<!-- 奖品大卡是共用组件：取数期间由它自己铺同尺寸的封面/名称/类型灰块
					     （外壳仍是那张 #f7f8fa 的真卡，加载完逐格换成封面与文字，不跳版） -->
					<prize-hero :prizes="prizes" :skeleton="sk"></prize-hero>

					<!-- 三格统计：需邀请 / 成功邀请 / 未成功，三个数都由后端一次算好（图15 那一排）。
					     灰底统计块与三格留白取数期间就位，只把待到手的数值换成灰块；
					     「需邀请/成功邀请/未成功」三句是本页写死的文案、加载前后一字不变，
					     垫灰块等于把没在取的东西也画成灰条（灰块全部只给真正会变的那一格） -->
					<view class="sgd-stats">
						<view class="sgd-stat" v-for="s in statCells" :key="s.label">
							<view class="sgd-sk-num" v-if="sk"></view>
							<text class="sgd-stat-num" v-else>{{ s.value }}</text>
							<text class="sgd-stat-label">{{ s.label }}</text>
						</view>
					</view>

					<!-- 受邀好友全列在这里（已完成/未完成两档 + 每一行），上面不再另设一排占位圆圈：
					     那一排原本按「还差 N 位」补空位，只要还差人就把五格补满，于是「仅需邀请 1 人」
					     也读成五个「+ 待邀请」（2026-09-30 用户点名）。已助力的人在这里已经全列过一遍。 -->
					<view class="sgd-section">受邀好友</view>
					<!-- 已完成 / 未完成两档：同一排 chip 走同一份类（M7）。切档是「换一次数据」不是本地换数组
					     （2026-10-01 用户点名「切换 Tabs 要触发加载」）：点哪一档就按那一次请求重取，取数期间
					     chip 照常出（灰底/蓝底/圆角/留白/两枚计数都是最终那一档，计数不回灰块），
					     只把下面那段好友行换成骨架 —— 标题、奖品、三格统计三段不跟着回（M16 只盖会变的那几格） -->
					<view class="sgd-tabs">
						<view class="sgd-tab" :class="{ 'sgd-tab--on': tab == 'done' }" @tap="pickTab('done')">
							<text class="sgd-tab-label">已完成</text>
							<text class="sgd-tab-count" v-if="!sk">({{ assistsDone.length }})</text>
							<view class="sgd-sk-tab-count" v-else></view>
						</view>
						<view class="sgd-tab" :class="{ 'sgd-tab--on': tab == 'undone' }" @tap="pickTab('undone')">
							<text class="sgd-tab-label">未完成</text>
							<text class="sgd-tab-count" v-if="!sk">({{ assistsUndone.length }})</text>
							<view class="sgd-sk-tab-count" v-else></view>
						</view>
					</view>
					<view class="sgd-friend" v-for="(item, index) in listRows" :key="index">
						<view class="sgd-friend-avatar sgd-sk-avatar" v-if="friendSk"></view>
						<image class="sgd-friend-avatar" v-else :src="item.avatar || '/static/image/default-avatar.png'" mode="aspectFill" @error="onRowAvatarError(item)"></image>
						<view class="sgd-friend-main">
							<view class="sgd-sk-name" v-if="friendSk"></view>
							<view class="sgd-friend-name" v-else>{{ mask(item.nickname) }}</view>
							<view class="sgd-sk-time" v-if="friendSk"></view>
							<view class="sgd-friend-time" v-else>{{ friendTime(item) }}</view>
						</view>
					</view>
					<!-- 空档走登记在册的 u-empty（M6 禁自绘空态）：自带图标 + 一句文案。
					     原来这一格只有一行文字、紧贴页签那排（2026-10-01 用户点名「只有文字没有 icon」
					     「太靠上了，应该往下一点」），改成组件后落位交给下面的留白与组件自身那圈外边距 -->
					<view class="sgd-friend-none" v-if="friendEmpty">
						<u-empty icon="/static/image/empty.png" width="70" height="70" :text="friendEmptyText"></u-empty>
					</view>
				</view>
			</tz-popup-list>

			<!-- 主操作：文案三档由后端逐态给（图19「去邀请好友」/ 图15「继续邀请好友」/ 已达标「查看我的奖品」），
			     一页只出一处主操作（M17）。取数中就置灰不收起（M18⑨d：收掉会让整块面板高度跳一下，
			     而且用户读不出「这次没反应是因为还在取」）；活动已结束时禁用，状态由标题行那枚状态标签
			     （run_state_text）说出口，按钮下面不再另加一句（2026-10-01 用户点名去掉）。
			     只有取失败那一档整块收掉——那时连活动都没有，留一枚按不动的按钮就是死控件。
			     达标那一档（后端 landing=prize）例外：活动已结束也照点——那一枚就是「我的奖品」的记录入口，
			     领奖那一条链（实物收地址 / 自定义弹兑奖方式 / 其余直接领）只住在 /pages/user/prize/index
			     那一份上、挂 tz-prize-claim 一只组件；本弹窗自 2026-10-06 起不再另挂第二只（见文件头）。
			     清单那一层的每一行都先落到这只详情上，要出「我的奖品」那一整页只由用户点这一枚才换页。 -->
			<view class="sgd-foot" v-if="!error">
				<tz-button
					class="sgd-foot-btn"
					size="normal"
					long
					type="primary"
					:text="footText"
					:disabled="loading || joining || (ended && !goPrize)"
					@click="invite"
				></tz-button>
			</view>
		</view>
	</u-popup>
	</view>
</template>

<script>
import { maskNickname } from '@/common/utils/share-gift';
import { detailListHeight } from '@/common/utils/live-popup-height';
import prizeHero from './prize-hero.vue';

export default {
	name: 'activity-detail',
	components: { prizeHero },
	props: {
		show: { type: Boolean, default: false },
		activityId: { type: [Number, String], default: 0 },
		courseId: { type: [Number, String], default: 0 },
	},
	emits: ['close', 'share'],
	data() {
		return {
			loading: false,
			listLoading: false,
			error: '',
			listError: '',
			activity: {},
			prizes: [],
			stats: { need: 0, success: 0, fail: 0 },
			assistsDone: [],
			assistsUndone: [],
			my: { joined: false },
			tab: 'done',
			joining: false,
			cd: {},
			/** 取数序号：连点页签时只有最后一条结果算数（竞态闸门，见 fetch） */
			reqSeq: 0,
		};
	},
	computed: {
		/**
		 * 列表区高度：与同屏「邀请达人榜」榜单弹层**面板总高对齐**（60vh + 190px）用的那一档，
		 * 三档的差值是「有才出」的那两处——条件说明 .sgd-sub（33px）与取失败那档整块收掉的底栏（63px）——
		 * 算式在 @/common/utils/live-popup-height（head 37 / sub 33 / foot 63 都从各自样式逐字抄）
		 */
		listHeight() {
			return detailListHeight(!!this.activity.condition_text, !!this.error);
		},
		/**
		 * 首帧骨架判据：带 !activity.id，重取详情（参与后/倒计时归零）时不要把已有内容换成灰块（M16）。
		 * 这一档不另画一棵灰块树：面板底色是纯白，另起一棵大灰块跟最后显示的组件对不上
		 * （2026-09-30 用户点名），所以内容那一档照常出，只把每格里的名称/数值/图片换成同尺寸灰块。
		 */
		sk() {
			return this.loading && !this.activity.id;
		},
		/**
		 * 好友段自己的加载态：首屏那一支(sk) + 切档重取那一支(listLoading)。
		 * 切档期间只这段盖骨架，上面三段照常显示（M16：骨架只替换会变的那几格，不整面板回骨架）。
		 */
		friendSk() {
			return this.sk || this.listLoading;
		},
		friendRows() {
			return this.tab == 'done' ? this.assistsDone : this.assistsUndone;
		},
		/** 好友行要铺的真实行：取数期间先铺两行占位（行壳/分隔线/头像档都取最终那一版式） */
		listRows() {
			return this.friendSk ? [{ sk: 1 }, { sk: 2 }] : this.friendRows;
		},
		friendEmpty() {
			return !this.friendSk && !this.friendRows.length;
		},
		/** 切档重取失败时这一格照旧显示空态，只是文案换成后端那句话（M13：失败那一句交给空态，不往别处塞提示） */
		friendEmptyText() {
			if (this.listError) {
				return this.listError;
			}
			return this.tab == 'done' ? '还没有好友完成助力' : '暂无未完成的好友';
		},
		/**
		 * 标题行第二枚标签那一句（「已完成」）：整枚文案由后端下发（my.done_text，判据＝有效邀请数
		 * 已达需邀请数），前端不拿 assist_num 与 invite_num 自己比（M22），没做到点就是空串、整枚不出。
		 * 读点带 (this.my || {})：调用点给 null 时渲染期取属性会把整轮 patch 丢掉（M26）
		 */
		myDoneText() {
			return (this.my || {}).done_text || '';
		},
		/** 三格统计（图15）：数值在上、灰字标签在下，与打卡排行榜「我的成绩」那一档同一版式 */
		statCells() {
			return [
				{ label: '需邀请', value: this.stats.need },
				{ label: '成功邀请', value: this.stats.success },
				{ label: '未成功', value: this.stats.fail },
			];
		},
		/** 进行中且还没到点才出倒计时；已结束/已失效那两档由标题行的状态标签说话 */
		showCountdown() {
			return this.activity.run_state == 'ongoing' && Number(this.activity.end_time || 0) * 1000 > Date.now();
		},
		countdownMs() {
			return Math.max(0, Number(this.activity.end_time || 0) * 1000 - Date.now());
		},
		/** 活动已结束或已失效：主按钮禁用（后端 join 的闸门与这一判据同源），达标那一档除外（见 goPrize） */
		ended() {
			return !!this.activity.run_state && this.activity.run_state !== 'ongoing';
		},
		/**
		 * 主按钮那一句：后端逐态给（button_text），取不到时按参与态兜一句，
		 * 绝不留一枚没有文字的空白按钮（M17：tz-button 没有 slot，文案只有 text prop 这一条路）
		 */
		footText() {
			return this.my.button_text || (this.my.joined ? '继续邀请好友' : '去邀请好友');
		},
		/**
		 * 主按钮落点是「去看已到手的奖」那一个标识，只读后端逐态下发的 landing（M22）：
		 * 拿 button_text 那句中文当分支就是同一根判据存两份，改那句文案会把落点一起改没。
		 */
		goPrize() {
			return (this.my || {}).landing == 'prize';
		},
	},
	watch: {
		show(val) {
			if (val) {
				this.fetch();
			}
		},
		activityId() {
			if (this.show) {
				this.fetch();
			}
		},
	},
	methods: {
		gone() {
			return this._isDestroyed === true || this._isBeingDestroyed === true;
		},
		close() {
			this.$emit('close');
		},
		onCountdownChange(e) {
			this.cd = e;
		},
		/**
		 * 切档 = 换一次数据，不在本地换数组（2026-10-01 用户点名「切换 Tabs 要触发加载」）。
		 * 首屏那一支还在飞的时候按不动：两枚 chip 都还是灰块，切过去读起来像这一档坏了（M13 死控件）；
		 * 切档重取这一支期间 chip 与两枚计数都是真内容，可以接着点回另一档 —— 那就再发一次请求，
		 * 由 reqSeq 判谁算数，不做「点了没反应」。
		 */
		pickTab(name) {
			if (name === this.tab || this.sk) {
				return;
			}
			this.tab = name;
			this.fetch(true);
		},
		pad(v) {
			const n = Number(v || 0);
			return n > 9 ? String(n) : '0' + n;
		},
		mask(name) {
			return maskNickname(name);
		},
		/** 列表行头像兜底：写回源行而不是模板里造出来的临时对象，否则这一句是 no-op、裂图一直挂着 */
		onRowAvatarError(row) {
			if (row) {
				this.$set(row, 'avatar', '/static/image/default-avatar.png');
			}
		},
		/**
		 * 一行好友只讲一件事：时间 + 后端那一句状态（未完成那档带上失败原因）
		 */
		friendTime(item) {
			const parts = [];
			if (item.assist_time_text) {
				parts.push(item.assist_time_text);
			}
			if (item.status_text) {
				parts.push(item.status_text);
			}
			if (!item.valid && item.fail_text) {
				parts.push(item.fail_text);
			}
			return parts.join(' · ');
		},
		/**
		 * 倒计时归零唯一收口点（硬约束 12 的 @finish）：走首屏那一支重取，不是切档那一支。
		 * 不写 `@finish="fetch"`：事件一旦带上 payload，payload 就会当 reload 传进来，
		 * 归零那一刻好友段会平白闪一次骨架、失败时也只说一句列表错误。
		 */
		onCountdownFinish() {
			this.fetch();
		},
		/**
		 * 取详情。reload=true 是切档那一支：只把下面那段好友行换成骨架（首屏那一支才整面板走 sk）。
		 * reqSeq 是竞态闸门：连点页签时只有最后一条结果算数，早回来的那条整条丢弃 ——
		 * 不丢弃的话慢的那次会把新选中的那一档内容盖回去，用户读到「点未完成却看到已完成的名单」。
		 * loading / listLoading 在每一条退出分支（成功 / code!==1 / catch）上一起收口（硬约束 22：
		 * 收口判据是整条链都收尾，不许只关被点到的那一支）。
		 */
		fetch(reload) {
			if (!this.activityId) {
				this.error = '这条活动已经打不开了';
				return Promise.resolve();
			}
			const seq = ++this.reqSeq;
			this.loading = true;
			this.error = '';
			this.listError = '';
			if (reload) {
				this.listLoading = true;
			}
			return this.$api('share_gift.gift.detail', { activity_id: this.activityId }).then((ret) => {
				if (this.gone() || seq !== this.reqSeq) {
					return;
				}
				this.loading = false;
				this.listLoading = false;
				if (!ret || ret.code !== 1) {
					// 切档这一支失败不把已经摆着的整面板收成错误空态：留在好友段里说一句，M13
					if (reload) {
						this.listError = (ret && ret.msg) || '加载失败，请重试';
						return;
					}
					this.reset();
					this.error = (ret && ret.msg) || '活动详情获取失败，请重试';
					return;
				}
				this.apply(ret.data || {});
			}).catch(() => {
				if (this.gone() || seq !== this.reqSeq) {
					return;
				}
				this.loading = false;
				this.listLoading = false;
				if (reload) {
					this.listError = '加载失败，请重试';
					return;
				}
				this.error = '活动详情获取失败，请重试';
			});
		},
		apply(data) {
			this.activity = data.activity || {};
			this.prizes = data.prizes || [];
			this.stats = data.stats || { need: 0, success: 0, fail: 0 };
			this.assistsDone = data.assists_done || [];
			this.assistsUndone = data.assists_undone || [];
			this.my = data.my || { joined: false };
			// 首屏两档都空/当前那一档空而另一档有 → 落在有数据的那一档，不要留一档没人认领的空列表；
			// 切档重取不能把用户刚选的那一档改回去（否则点「未完成」拿到的是「已完成」的名单）
			if (!this.friendRows.length && (this.tab == 'done' ? this.assistsUndone.length : this.assistsDone.length)) {
				this.tab = this.tab == 'done' ? 'undone' : 'done';
			}
		},
		reset() {
			this.activity = {};
			this.prizes = [];
			this.stats = { need: 0, success: 0, fail: 0 };
			this.assistsDone = [];
			this.assistsUndone = [];
			this.my = { joined: false };
		},
		/**
		 * 主按钮那一下按后端下发的 landing 分流（M22：判据只存后端一处，前端只认那一个标识，
		 * 拿 button_text 那句中文当分支会把落点和文案绑成同一根）：
		 *  · landing=prize（已达标）→ 这一枚就是「我的奖品」的记录入口，用户点它才换页
		 *    （清单那一层的每一行都先落在活动详情上，不在行里直接把人选出直播间，2026-09-30 用户点名）
		 *  · 还没达标 → 先确保参与（join 幂等，没参与时点一次就建一行），再交给页面那一只分享弹层
		 * 分享链接、海报与按端取码四条端路只在 share-modal 那一份实现里，本弹窗不再拼一套（M18⑧）。
		 */
		invite() {
			if (this.goPrize) {
				// 奖品页已升入标准版（pages/user 分包），不再是本插件的页面文件
				this.$nav.to('/pages/user/prize/index');
				return;
			}
			// 这两条拦挡必须有出口：主按钮走 tz-button 的 disabled（按不动），
			// 静默 return 的用户症状就是「点了没反应」（M13）
			if (this.ended) {
				uni.showToast({ title: '该活动已结束或已失效，感谢参与', icon: 'none' });
				return;
			}
			if (this.joining) {
				uni.showToast({ title: '正在参与，请稍候', icon: 'none' });
				return;
			}
			if (this.my.joined) {
				this.$emit('share');
				return;
			}
			this.joining = true;
			this.$api('share_gift.gift.join', { course_id: this.courseId }).then((ret) => {
				this.joining = false;
				if (this.gone()) {
					return;
				}
				if (!ret || ret.code !== 1) {
					uni.showToast({ title: (ret && ret.msg) || '参与失败，请重试', icon: 'none' });
					return;
				}
				// 参与成功先重取一次（那一行的 joined / 进度都翻态了），再把人交给分享
				this.fetch().then(() => {
					if (!this.gone()) {
						this.$emit('share');
					}
				});
			}).catch(() => {
				this.joining = false;
				if (this.gone()) {
					return;
				}
				uni.showToast({ title: '参与失败，请重试', icon: 'none' });
			});
		},
	},
};
</script>

<style scoped>
/* 底部安全区只挂这一份（模板已关 u-popup 的 safeAreaInsetBottom，微信端按全站减半口径）；
   底部那一格内衬交给内容最后一块自己给（.sgd-foot 的 padding-bottom）——
   面板不再写「20px + 安全区」：iPhone X 下那样叠成 20 + 34 = 54px，比同屏礼物/商品弹层
   （内容自己 10px + 安全区 34px = 44px）明显多一截，2026-10-01 用户点名
   「邀请达人榜、分享有礼模块相关的弹窗底部安全距离都太大了，参考其他的 popup 组件」 */
.sgd {
	position: relative;
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	padding: 0 16px;
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
	display: flex;
	flex-direction: column;
}
/* 标题走 .school-popup-title 口径（16px/600 左对齐，不自造居中标题行，M18）；
   状态标签紧跟名称右侧（口径问号/状态标紧跟名称，不挂到别处，见 ui-baseline W25 同族） */
.sgd-head {
	display: flex;
	align-items: center;
	/* 项与项的间距只由容器 gap 给，不给某一项写 margin（硬约束 20） */
	gap: 8px;
	/* 右内衬 36px > 关闭图标那 15~33px：名称再长、标签再靠右也不进图标那一格 */
	padding: 15px 36px 0 0;
	flex: none;
}
/* 名称按内容宽度排（不占满整行），标签才贴得到名称右侧；超长才截断 */
.sgd-title {
	flex: 0 1 auto;
	min-width: 0;
	font-size: 16px;
	font-weight: 600;
	line-height: 22px;
	color: #1d2129;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.sgd-tag {
	flex: none;
	padding: 1px 6px;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
	background: #f2f3f5;
	border-radius: 4px;
}
.sgd-tag--on {
	color: #0968f6;
	background: #e8f1ff;
}
/* 「已完成」那一枚（2026-10-06 用户点名，排在 run_state 标签右侧）：
   底取全站绿标签那一档（#e8ffea，与 pages/app/school/* 的 .status.green 逐值相同），
   字按硬约束 29① 从该业务主色往下压一档 —— 全站绿标签那枚 #00b42a 压在这块底上只有 2.63:1，
   取 success-8 的 #008123 实算 4.78:1（同屏参照页「邀请达人榜」标题行那两档也是这么压的：
   #0d5bc4 on #e8f1ff、#4e5969 on #f2f3f5，见 scripts/check-invite-rank-board.js 第 ⑧ 组） */
.sgd-tag--done {
	color: #008123;
	background: #e8ffea;
}
.sgd-sub {
	margin-top: 4px;
	padding-bottom: 12px;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
	flex: none;
}
/* 取数期间的灰块：面板/卡片/行壳一律是真实那一版（纯白底、#f7f8fa 灰底块、圆角、留白都不变），
   只把每格里待到手的名称、数值、图片换成同尺寸灰块，逐块对齐真实那一行的行盒，加载完不跳版。
   倒计时那一行不给灰块：它是有才出的一段，先垫会凭空多出一格（2026-09-30 用户点名）。 */
.sgd-sk-title {
	width: 120px;
	height: 16px;
	/* 头行是 align-items:center，这一格不撑到 .sgd-title 的 22px 行盒时数据一落下来整行短 6px、
	   底下每一格跟着上移（m16「灰块高 + 上下外衬 = 真实行盒高」）。16px 字那一档的字高 + 上下各 3 = 22。 */
	margin: 3px 0;
	border-radius: 4px;
	background: #e5e6eb;
}
.sgd-sk-tag {
	width: 32px;
	height: 13px;
	/* 状态标签壳（.sgd-tag：1+17+1 = 19）里那一枚灰条，撑满壳的内容盒：13 + 上下各 2 = 17。
	   这一格不是标签壳本身，壳那一档的浅底/圆角/内衬照常摆着（M16①）。 */
	margin: 2px 0;
	border-radius: 3px;
	background: #e5e6eb;
}
/* 数值取 18px 那一档的块高，上下各留 3px 撑成 .sgd-stat-num 的 24px 行盒，统计块加载前后同高 */
.sgd-sk-num {
	width: 26px;
	height: 18px;
	margin: 3px 0;
	border-radius: 4px;
	background: #e5e6eb;
}
/* chip 里的计数：已到手的 "(3)" 是括号 + 一位数字那么宽，加载时给一块同宽的灰条 */
.sgd-sk-tab-count {
	width: 14px;
	height: 10px;
	border-radius: 2px;
	background: #e5e6eb;
}
.sgd-friend-avatar.sgd-sk-avatar {
	background: #e5e6eb;
}
.sgd-sk-name {
	width: 96px;
	height: 14px;
	/* 上下各留 3px 把灰块撑成 .sgd-friend-name 那一档 20px 行盒，好友行加载前后同高 */
	margin: 3px 0;
	border-radius: 4px;
	background: #e5e6eb;
}
.sgd-sk-time {
	width: 120px;
	height: 10px;
	/* 与 .sgd-friend-time 同一档：上间距 2px + 14px 行盒 */
	margin: 2px 0 4px;
	border-radius: 4px;
	background: #e5e6eb;
}
.sgd-missing {
	padding: 20px 0 40px;
}
/* 倒计时一行（图15/图19 奖品卡上方那一档）：灰字说明 + 加粗数字，整行居中，不垫灰底（2026-09-30 用户点名） */
.sgd-countdown {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 10px;
	padding: 8px 0;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
}
.sgd-countdown-label {
	margin-right: 6px;
}
.sgd-countdown-time {
	display: flex;
	align-items: center;
}
.sgd-countdown-num {
	margin-right: 4px;
	font-weight: 600;
	color: #1d2129;
}
.sgd-stats {
	display: flex;
	align-items: flex-start;
	margin-top: 12px;
	padding: 12px 0;
	background: #f7f8fa;
	border-radius: 6px;
}
.sgd-stat {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.sgd-stat-num {
	font-size: 18px;
	font-weight: bold;
	line-height: 24px;
	color: #1d2129;
}
.sgd-stat-label {
	margin-top: 4px;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
}
.sgd-section {
	margin-top: 16px;
	font-size: 14px;
	font-weight: 600;
	line-height: 20px;
	color: #1d2129;
}
.sgd-tabs {
	display: flex;
	align-items: center;
	/* 项与项的间距只由容器 gap 给，不给某一枚 chip 写 margin（硬约束 20） */
	gap: 8px;
	margin-top: 8px;
}
/* 同一排的档切换共用这一份 chip 类（M7：一处灰底一处裸文字算分叉）。
   chip 内横向排开（档名 + 计数），计数那一格取数期间换成同宽灰块，chip 高仍是 5+17+5 */
.sgd-tab {
	display: flex;
	align-items: center;
	gap: 2px;
	padding: 5px 14px;
	font-size: 12px;
	line-height: 17px;
	color: #4e5969;
	background: #f2f3f5;
	border-radius: 4px;
}
.sgd-tab--on {
	color: #0968f6;
	background: #e8f1ff;
}
.sgd-friend {
	display: flex;
	align-items: center;
	padding: 10px 0;
	border-bottom: 1px solid #f2f3f5;
}
.sgd-friend-avatar {
	width: 28px;
	height: 28px;
	border-radius: 50%;
	flex: none;
}
.sgd-friend-main {
	flex: 1;
	min-width: 0;
	margin-left: 8px;
}
.sgd-friend-name {
	font-size: 14px;
	line-height: 20px;
	color: #1d2129;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.sgd-friend-time {
	margin-top: 2px;
	font-size: 10px;
	line-height: 14px;
	color: #86909c;
}
/* 好友段空档：内容交给 u-empty（图标 + 一句文案都是组件自己的，字号/颜色/居中不许在这里再抄一遍，
   M7），这里只管落位 —— 原来 16px 上留白配一行文字，整块贴着页签那排读起来像页签的脚注
   （2026-10-01 用户点名「太靠上了，应该往下一点」），上留白比 .sgd-missing（整面板失败那一档）多一截 */
.sgd-friend-none {
	padding: 40px 0 48px;
}
/* 主操作那一行：面板最后一块，底部 12px 内衬由它自己带（面板只挂安全区那一份） */
.sgd-foot {
	flex: none;
	margin-top: 14px;
	padding-bottom: 12px;
}
.sgd-foot-btn {
	width: 100%;
}
</style>
