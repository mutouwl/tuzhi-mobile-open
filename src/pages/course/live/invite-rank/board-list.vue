<template>
	<!--
	  邀请达人榜榜单弹层（直播间右侧入口点开，竞品图3）。
	  名次、人数、活动状态全部后端算好下发（M22）：前端不按下标 +1、不比时间戳、不拼「活动已结束」。
	  版式按图3 那一段一段落：奖品段 → TOP1/2/3 三卡 → 表头行 + 排行列表 → 底部我的名次条 →「立即分享」，
	  前三段一起进同一只滚动画布（图3 就是整屏在滚，领奖台会跟着滚走）。
	  图3 那套橙色渐变皮肤与「小组」第二行灰字不搬（§2.2 本系统无小组实体）；
	  三卡按 M21 全局档（白面板 + 灰底块 + 圆角 6，圆角只给封面/小元素档），不抄竞品的运营皮肤。
	-->
	<view>
			<!-- 关掉右上角那枚关闭图标（2026-10-05 用户点名「去掉右侧的这个退出按钮」）：
			     面板底是点遮罩就关（u-popup 的 closeOnClickOverlay 默认开），底部还有「立即分享」那一行，
			     头部右端改摆两枚文字动作。标题行原本给图标预留的右 26 一并撤掉（那是给它让位的，
			     留着就成了一块没人认领的空白） -->
			<u-popup
			:show="show"
			mode="bottom"
			bgColor="transparent"
			:round="12"
			:closeable="false"
			:safeAreaInsetBottom="false"
			:zIndex="10210"
			:overlayStyle="{ zIndex: 10200 }"
			@close="close"
		>
		<view class="irb">
			<!-- 标题行：左边「标题 + 状态 Tag」绑成一组（2026-10-04 用户点名「状态应该显示在标题的右侧，
			     使用一个 Tag 显示」），右边是「查看活动规则 + 我的邀请」两枚动作（2026-10-05 用户点名
			     「查看活动规则放到我的邀请左侧」）。组内间距只由各组的 gap 给，不给其中一枚写
			     margin-left（硬约束 20：同一行的项一律由容器 gap 给间距） -->
			<view class="irb-head">
				<view class="irb-head-l">
					<view class="irb-title">邀请达人榜</view>
					<!-- 文案吃后端下发的 run_state_text，上色吃 run_state_key 那一枚三档键，两枚同源；
					     前端不拿截止时间戳自己判活动状态（M22）；后端没给状态文案时整枚不出 -->
					<text :class="['irb-state-tag', acting ? 'irb-state-tag--on' : '']" v-if="activity.run_state_text">{{ activity.run_state_text }}</text>
				</view>
				<view class="irb-head-r">
					<!-- 规则入口：显隐吃「活动在进行中」那一枚（后端下发的 run_state_key，与状态 Tag 同一份），
					     **不再吃 show_rule**。原先那枚判据把「运营有没有勾规则」当成了入口的门槛，于是
					     运营没填规则正文时整枚收掉 → 用户连弹层都点不开 → 弹层里那句空态是一段永远读不到的
					     死代码（2026-10-05 用户点名「如果活动规则是空的，那么活动规则弹窗中可以显示空状态
					     提醒」）。判据只回答「这一段此刻适不适用」，不回答「它里面有没有内容」——后者归弹层里的
					     u-empty 说，属于硬约束 27②「入口显隐判据不许依赖只有该入口自己能产生的数据」那一族。
					     正文仍另起一层详情弹层，榜单那一屏不被撑长 -->
					<text class="irb-act-entry" v-if="ruleEntryOn" @tap="openRule">查看活动规则</text>
					<text class="irb-my" @tap="$emit('my')">我的邀请</text>
				</view>
			</view>

			<!-- 奖品段 + 领奖台 + 表头 + 列表一起进这一只确定高度的滚动画布（M6）。
			     规则正文不在这里展开：点「查看活动规则」另起一层详情弹层（rule-modal.vue，
			     叠在本弹层 10210 之上的 10330），榜单那一屏不被撑长、也不留第二块滚动区。 -->
			<tz-popup-list height="60vh" padding="0" :refreshing="refreshing" @refresh="$emit('refresh')" @lower="$emit('load-more')">
				<!-- 奖品段：状态与截止都搬走以后，这一段只剩档位清单（规则入口也搬到标题行了）。
				     2026-10-05 用户点名「查看活动规则弹窗中，也要显示这个第一到 N 名有什么奖励的面板」
				     ⇒ 这一整组字段（档位行 + 空态句 + 「查看更多 / 收起」+ 折叠档 + 判据 + 配色）抽成
				     prize-list.vue 一份，这里与 rule-modal.vue 共用同一枚（硬约束 11）；
				     本弹层只递活动段与「自己此刻开着没有」（弹层关掉时展开态复位），
				     本文件不再自带档位行 / 折叠常量 / 判据 / 样式，别在这里再抄第二份 -->
				<prize-list :activity="activity" :popup-show="show" />

				<!-- 前三名（图3 顶部那三张卡）：**只有榜上参与用户多于三位才摆这一档**
				     （2026-10-06 用户点名「参与用户只有 3 个的话，前三位不要用领奖台风格，直接使用列表；
				     4 个或以上再显示当前的格式」）——三张并排的卡只剩三行数据时，读起来是把一条列表
				     拆成了三个色块，横向还挤。判据吃后端下发的 total（参与用户总数，已按前 50 名截好），
				     前端不拿 rows.length 自己数：翻页时 rows 只是当前这一页（M22）。
				     吃 total 之后 top 与 listRows 都从同一根判据走：不出领奖台时下面那张表就从第 1 名排到底，
				     出领奖台时下面那张表仍从第 4 名开始，两档都不会把人重复一遍。
				     名次顺序按「第2名 - 第1名 - 第3名」摆（图3 就是这个站位），
				     三张卡各吃一档金/银/铜（2026-10-01 用户点名「排名一二三的块背景不要是灰色，
				     可以改变为金银铜色」——原来三张共用一块 #f7f8fa 灰底），第一名的卡另高一档，
				     只有名次与人数，没有奖品与领奖台装饰。
				     卡底一有颜色，压在它上面的每一档都得跟着换：徽标、昵称、邀请人数、头像占位块
				     四档全部从本档主色派生（M6 底色分块那一档②③⑤），不抄竞品的橙渐变与领奖台台阶 -->
				<view class="irb-podium" v-if="podium.length">
					<view :class="['irb-pod', 'irb-pod--r' + item.rank]" v-for="item in podium" :key="item.user_id">
						<text :class="['irb-pod-badge', 'irb-pod-badge--r' + item.rank]">TOP{{ item.rank }}</text>
						<image class="irb-pod-avatar" :src="item.avatar || '/static/image/default-avatar.png'" mode="aspectFill" @error="onAvatarError(item)" />
						<!-- 昵称脱敏：2026-10-03 用户点名「邀请达人榜里的这个用户昵称应该进行敏感化处理」。
						     口径吃全站那一档（§1「昵称公开展示」＝保留首字符、其余 ***），
						     实现只有 `common/utils/privacy.js` 一份，本组件经 maskName 转发（模板看不见模块级 import） -->
						<text class="irb-pod-name">{{ maskName(item.nickname) }}</text>
						<text class="irb-pod-num">邀请{{ item.invite_num }}人</text>
					</view>
				</view>

				<view class="irb-cols" v-if="listRows.length">
					<text class="irb-col-no">排名</text>
					<text class="irb-col-name">成员</text>
					<text class="irb-col-num">邀请人数</text>
				</view>

				<!-- 骨架按真实行的四块逐块铺（名次 16 + 头像 40 + 昵称条 + 右侧数值条），
				     不是一条 88% 宽的灰条：那条既盖不住行尾「邀请人数」那一格（右侧就露白），
				     也读不出这一行有几块信息（M16「灰块尺寸与真实版式逐块对齐」，
				     参照 pages/app/checkin/rank 的 .crk-sk-row 同一档写法） -->
				<view class="irb-sk" v-if="loading && !rows.length">
					<view class="irb-sk-row" v-for="i in 6" :key="'irb-sk-' + i">
						<view class="irb-sk-no"></view>
						<view class="irb-sk-avatar"></view>
						<view class="irb-sk-name"></view>
						<view class="irb-sk-num"></view>
					</view>
				</view>
				<block v-else>
					<view :class="['irb-row', item.is_me ? 'irb-row--me' : '']" v-for="(item, index) in listRows" :key="item.user_id">
						<text :class="['irb-no', item.rank <= 3 ? 'irb-no-top' : '']">{{ item.rank }}</text>
						<image class="irb-avatar" :src="item.avatar || '/static/image/default-avatar.png'" mode="aspectFill" @error="onAvatarError(item)" />
						<text class="irb-name">{{ maskName(item.nickname) }}</text>
						<!-- 「我」压在邀请人数左边：右缘那位是这一行唯一该右对齐的数，
						     标记跟着昵称走、项与项的间距全交给行容器的 gap（M6「间距只由容器 gap 给」） -->
						<view class="irb-me-tag" v-if="item.is_me">我</view>
						<text class="irb-num">{{ item.invite_num }}</text>
					</view>
					<u-empty
						v-if="!rows.length"
						icon="/static/image/empty.png"
						width="70"
						height="70"
						:text="error || '还没有人邀请好友，快去冲榜吧'"
					></u-empty>
					<u-loadmore :status="loadStatus" v-if="listRows.length && loadStatus !== 'nomore'"></u-loadmore>
				</block>
			</tz-popup-list>

			<!-- 底部固定行：正文逐字「弹窗底部展示当前用户的排名与邀请数据」。
			     两档同一份骨架：头像 + 昵称常显（2026-10-01 用户点名「下方的我的排名也要显示我的头像和昵称」），
			     已上榜再补一组名次，最右一组是邀请人数（是 0 就写 0，不落空、不换「暂未上榜」）；两组都是
			     「label + value」两枚节点，label 比 value 小一号轻一档，不拼成一句话（M22）。
			     身份两件与名次都吃后端 board 下发的 me，前端不读本地缓存拼（M22：不自己找身份来源），
			     三个身份读点各过一个 computed：调用点传 null 时模板读点抛的是渲染异常（M26） -->
			<view class="irb-me-bar">
				<image class="irb-me-avatar" :src="meAvatar" mode="aspectFill" @error="onMeAvatarError" />
				<text class="irb-me-name">{{ meName }}</text>
				<!-- 右边两组「label + value」（2026-10-04 用户点名「邀请人数也显示一下，label 的大小和粗细
				     比这个数值小一点」）：名次一组、邀请人数一组，两个字都定宽、组内间距只由组容器的 gap 给。
				     label 是写死的静态文案、value 吃后端下发的那两枚数，分成两枚节点各自渲染，
				     不拼成一句话（M22：前端不拼后端算好的名次）；人数是 0 也照写，不落空 -->
				<view class="irb-me-stat" v-if="meOnBoard">
					<text class="irb-me-stat-label">我的排名</text>
					<text class="irb-me-stat-val">第 {{ meRank }} 名</text>
				</view>
				<view class="irb-me-stat">
					<text class="irb-me-stat-label">邀请人数</text>
					<text class="irb-me-stat-val">{{ meInviteNum }}</text>
				</view>
			</view>

			<!-- 截止时间并到「立即分享」这一行（2026-10-04 用户点名「可以把截止时间放在立即分享按钮中，
			     比方说截止到某月某天某分某秒 立即分享」）。时间是后端下发的现成字符串，前端不 new Date()
			     也不自己比时间戳（M22）；后端没给截止时间就只剩按钮，项与项的间距仍由容器的 gap 给 -->
			<view class="irb-foot">
				<text class="irb-end" v-if="activity.end_time_text">截止到 {{ activity.end_time_text }}</text>
				<view class="irb-share">
					<tz-button size="normal" long type="primary" text="立即分享" @click="$emit('share')"></tz-button>
				</view>
			</view>
		</view>
	</u-popup>

	<!-- 规则详情叠一层（10330 > 本弹层 10210）：与「我的邀请」叠「榜单」同一档写法。
	     两层弹层互为兄弟、不嵌在可点节点里（M19：u-popup 只在自己的 __content 上 .stop，
	     嵌在带整卡监听的根里会把点遮罩冒成点卡片） -->
	<rule-modal :show="ruleShow" :activity="activity" @close="ruleShow = false" />
	</view>
</template>

<script>
import ruleModal from './rule-modal.vue';
import prizeList from './prize-list.vue';
import { maskNickname } from '@/common/utils/privacy';

export default {
	name: 'invite-rank-board-list',
	components: { ruleModal, prizeList },
	props: {
		show: { type: Boolean, default: false },
		rows: { type: Array, default: () => [] },
		// 后端 board 接口一直就下发的 top（最多三条）：上一版没接，领奖台整段就没落点
		top: { type: Array, default: () => [] },
		// 榜上参与用户的总数（后端 board 下发的 total，已按「只显示前 50 名」截好）：
		// 只用来判前三名那一档摆不摆，前端不拿 rows.length 自己数（M22：翻页时 rows 只是当前这一页）
		total: { type: Number, default: 0 },
		loading: { type: Boolean, default: false },
		refreshing: { type: Boolean, default: false },
		// 取列表失败那一句（接口 msg）：空态吃它，不把接口故障说成「还没有人邀请」（M13）
		error: { type: String, default: '' },
		loadStatus: { type: String, default: 'loadmore' },
		me: { type: Object, default: () => { return { rank: 0, invite_num: 0, on_board: false, nickname: '', avatar: '' }; } },
		activity: { type: Object, default: () => { return {}; } },
	},
	// 事件名一律避开原生名（M28：H5 编译器把模板里的 @tap 单向改成 @click，组件发 tap 就永远收不到）
	emits: ['close', 'refresh', 'load-more', 'my', 'share'],
	data() {
		return { ruleShow: false, meAvatarFailed: false };
	},
	computed: {
		/** 底部条上那个昵称：后端没给（游客 / user 表里那一行取不到）就写「我」，不留空档。
		 *  取到就走脱敏那一档，**「我」自己也不打例外**——分档要靠 user_id 相等判「这是不是我」，
		 *  那是前端算身份（M22 不许拿字段比对认人）；底部条另有「我」字样与「我的排名」文案认领 */
		meName() {
			const name = (this.me && this.me.nickname) || '';
			return name ? maskNickname(name) : '我';
		},
		/** 底部条上那张头像：失败标记记在组件上，写不回 props（§四-21 末条：记「此刻摆着的那一张」） */
		meAvatar() {
			const avatar = this.me ? this.me.avatar : '';
			return this.meAvatarFailed || !avatar ? '/static/image/default-avatar.png' : avatar;
		},
		/** 有没有上榜：底部条上「我的排名 第 N 名」那一段的显隐判据，只吃后端下发的那一枚布尔 */
		meOnBoard() {
			return !!(this.me && this.me.on_board);
		},
		/** 名次：后端算好的那一个数，前端不拿榜上位置折算（M22） */
		meRank() {
			const num = Number(this.me && this.me.rank);
			return isNaN(num) || num <= 0 ? 0 : num;
		},
		/** 右侧那个数：没上榜也是「我一共邀请了几人」，是 0 就写 0（不落空、不换成「暂未上榜」） */
		meInviteNum() {
			const num = Number(this.me && this.me.invite_num);
			return isNaN(num) || num < 0 ? 0 : num;
		},
		/** 是否进行中：只认后端下发的 run_state_key 那一枚三档键（'off' 未开启 / 'running' 进行中 /
		 *  'ended' 已结束），与管理端运营设置那枚 Tag、只读详情抽屉同源；前端不拿时间戳自己算（M22）。
		 *  **不能退回 run_state === 1**：活动关掉时后端 RunState::of() 照样返回 1（那一档没有截止时间可判），
		 *  拿它上色会把「未开启」染成进行中的蓝（2026-10-05 用户点名 course 2736：未开启那一枚该是灰的）。
		 *  三档键没下发时（老后端）落回中性档＝灰，不拿 run_state 猜 */
		acting() {
			return !!(this.activity && this.activity.run_state_key === 'running');
		},
		/**
		 * 「查看活动规则」这枚入口显不显：活动在进行中就出，出了没正文由规则弹层里的 u-empty 说。
		 *
		 * 2026-10-05 用户点名「如果活动规则是空的，那么活动规则弹窗中可以显示空状态提醒」。原先这一枚
		 * 吃 `activity.show_rule`，而 show_rule 由运营在后台勾「展示活动规则」派生 ⇒ 没勾就整枚收掉，
		 * 弹层根本点不开，里面那句空态永远读不到。改成吃后端下发的 run_state_key（复用 acting 那一枚，
		 * 不另算一遍活动状态，M22）：「未开启 / 已结束」两档入口仍收着，「进行中但没填规则」这一档出入口，
		 * 进去看到空态——这才是空态该待的位置。
		 *
		 * 显隐判据不许依赖只有该入口自己能产生的数据（硬约束 27②）：把「运营填没填内容」当前置门，
		 * 商家读出来就是「明明活动开着却没有入口」，而内容恰恰要靠这枚入口去看。
		 */
		ruleEntryOn() {
			return this.acting;
		},
		/**
		 * 前三名那一档摆不摆（2026-10-06 用户点名「参与用户只有 3 个的话不要用领奖台风格，直接使用列表；
		 * 4 个或 4 个以上再显示当前的格式」）：多于三位才出那三张并排的卡。
		 *
		 * 判据只吃后端下发的 total（榜上有几位参与用户）。换两枚就会各错一头：
		 * 拿 rows.length 数，翻页后 rows 只是当前这一页，四人的榜翻到第 2 页会数成 1；
		 * 拿 top.length 数，那一枚本来就是「最多三条」，四位以上也永远 ≤3、领奖台再也出不来（M22）。
		 */
		usePodium() {
			return Number(this.total) > 3;
		},
		/** 领奖台站位：第2 - 第1 - 第3（图3 的站位）；不足三人时缺的那一档整格不出，不摆空壳 */
		podium() {
			if (!this.usePodium) {
				return [];
			}
			const top = this.top || [];
			if (!top.length) {
				return [];
			}
			const order = [top[1], top[0], top[2]];
			const out = [];
			for (let i = 0; i < order.length; i++) {
				if (order[i]) {
					out.push(order[i]);
				}
			}
			return out;
		},
		/**
		 * 列表段：领奖台已经摆过的前三名不再重复一遍（图3 那一屏下面就是从第 4 名开始的）；
		 * 领奖台整档收起时（三位及以内）这张表就从第 1 名排到底 —— 两档共用同一根判据，
		 * 合起来始终是一套完整榜单，既不漏人也不重复摆一遍。
		 * 按后端下发的 rank 判、不按数组下标——分页后第 2 页的下标 0 是全局第 21 名，
		 * 用下标切会把每一页的前三行都吞掉（M22）。
		 */
		listRows() {
			if (!this.usePodium || !(this.top || []).length) {
				return this.rows;
			}
			return this.rows.filter(function (row) {
				return Number(row.rank) > 3;
			});
		},
	},
	watch: {
		// 榜单弹层关掉时把规则详情一起关掉：留着会让下一次打开榜单先浮着一层上一场的规则。
		// 奖品面板的展开态由 prize-list 自己复位（它吃 popup-show，这里不替它记第二份状态）
		show(val) {
			if (!val) {
				this.ruleShow = false;
			}
		},
		// 换一场直播 / 重取一次榜之后，头像地址可能换成另一张：撤掉上一张的失败标记，否则一直吃兜底图
		'me.avatar'() {
			this.meAvatarFailed = false;
		},
	},
	methods: {
		/** 昵称脱敏的转发口：模板看不见模块级 import（硬约束 25），列表里的插值一律过这里 */
		maskName(name) {
			return maskNickname(name);
		},
		close() {
			this.$emit('close');
		},
		openRule() {
			this.ruleShow = true;
		},
		/** 头像三态的最后一档（§四-21）：记「此刻摆在界面上的那一张」，源字段为空时这一句是 no-op */
		onAvatarError(row) {
			if (row) { this.$set(row, 'avatar', '/static/image/default-avatar.png'); }
		},
		/** 底部条那张头像：失败只落组件上的标记，不改 props（my-invite 那一处同一写法） */
		onMeAvatarError() {
			this.meAvatarFailed = true;
		},
	},
};
</script>

<style scoped>
/* 底部安全区只挂这一份（模板已关 u-popup 的 safeAreaInsetBottom，微信端按全站减半口径）；
   底部那一格内衬交给内容最后一块自己给（.irb-foot 的 padding-bottom）——
   面板不再写「20px + 安全区」：iPhone X 下那样叠成 20 + 34 = 54px，比同屏礼物/商品弹层
   （内容自己 10px + 安全区 34px = 44px）明显多一截，2026-10-01 用户点名
   「邀请达人榜、分享有礼模块相关的弹窗底部安全距离都太大了，参考其他的 popup 组件」 */
.irb {
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
/* 标题走 .school-popup-title 口径（16px/600 左对齐，不自造居中标题行，M18），
   右端是「查看活动规则 + 我的邀请」两枚文字动作（图3 那一枚胶囊降级为文字按钮，M17 禁胶囊）。
   右内衬从 26 收回 0：那 26 是给 u-popup 那枚绝对定位的关闭图标让位的（top/right 15 + 图标 18），
   2026-10-05 关掉那枚图标后一并撤掉，留着就是标题右侧一块没人认领的空白 */
.irb-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 15px 0 12px;
	flex: none;
}
.irb-title {
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
}
/* 标题与状态 Tag 绑成的左组：组内间距只由这一组的 gap 给（硬约束 20），
   组本身定宽，右端那一枚仍由外层的 space-between 推到最右 */
.irb-head-l {
	display: flex;
	align-items: center;
	gap: 8px;
	flex: none;
}
/* 右端两枚文字动作绑成一组：「查看活动规则」在「我的邀请」左侧（2026-10-05 用户点名）。
   组内间距只由这一组的 gap 给，不给左边那一枚写 margin-left——它按 ruleEntryOn 收起时，
   写在它身上的左边距就变成了「我的邀请」的左偏移（硬约束 20） */
.irb-head-r {
	display: flex;
	align-items: center;
	gap: 12px;
	flex: none;
}
/* 两枚都是 13px 主色蓝那一档（与原「我的邀请」同档）；规则入口跟着搬到标题行后，
   尺寸与字色一起跟过来，不新起一档 */
.irb-act-entry {
	font-size: 13px;
	color: #0968f6;
}
/* 状态 Tag：走全站状态标签那一档（小圆角 + 浅底 + 同族深字，字比标题小一号）。
   「进行中」吃主色那一档，其余两态（未开启 / 已结束）吃中性灰档；
   分档吃后端 run_state_key 三档键而不是拿文案反查（硬约束 29①，两档字都往深里取一档，各自压自己那块底都过 4.5:1） */
.irb-state-tag {
	flex: none;
	padding: 1px 6px;
	font-size: 12px;
	line-height: 17px;
	color: #4e5969;
	background: #f2f3f5;
	border-radius: 4px;
}
.irb-state-tag--on {
	color: #0d5bc4;
	background: #e8f1ff;
}
.irb-my {
	font-size: 13px;
	color: #0968f6;
}
/* ===== 前三名（图3 顶部那三张卡）=====
   三档同一份结构，只有第一名高一档；卡底与徽标各吃一档金/银/铜；不抄竞品的橙渐变与领奖台台阶。
   两层底（2026-10-01 用户两次点名：先「TOP2 与 TOP3 是同一块灰底、一眼看不出差在哪一档」，
   再「排名一二三的块背景不要是灰色，可以改变为金银铜色」——上一轮只换了徽标、三张卡底仍共用一块灰）：
   卡底是浅色、徽标底比卡底再深一档，徽标上是同族深色（深底压白字时银那一档只剩 2.2:1，读不出来）。
   逐档自己算过 WCAG：徽标字压徽标底 5.34 / 5.76 / 5.21，昵称与人数压卡底 8.92·5.30 / 8.98·5.11 / 8.80·5.41，
   均 ≥4.5；底取自站内既有的暖奶油与浅灰蓝两族，不引竞品橙（M6 底色分块那一档）。 */
.irb-podium {
	display: flex;
	align-items: flex-end;
	justify-content: center;
	margin-bottom: 12px;
}
/* 底色不给默认档：三张卡各吃一档金/银/铜（2026-10-01 用户点名「排名一二三的块背景不要是灰色，
   可以改变为金银铜色」——原来三张共用一块 #f7f8fa 灰底，一眼看不出差在哪一档）。
   底色归到 --rN 三个档里，基类不兜灰：兜一块灰等于"某一档没落上色"时静默退回灰底，又是复发入口。 */
.irb-pod {
	flex: 1;
	min-width: 0;
	margin-right: 8px;
	padding: 10px 6px;
	display: flex;
	flex-direction: column;
	align-items: center;
	border-radius: 6px;
	box-sizing: border-box;
}
.irb-pod:last-child {
	margin-right: 0;
}
/* 金 / 银 / 铜三档的卡底：都取同族极浅一档，压在白面板上只比白深一档（M6 底色分块那一档） */
.irb-pod--r1 {
	padding: 14px 6px 12px;
	background: #fdf5e3;
}
.irb-pod--r2 {
	background: #eef1f6;
}
.irb-pod--r3 {
	background: #fbf0e8;
}
/* 徽标同样不给默认底：底与字都在 --rN 三档里（原来基类兜一块 #e5e6eb 灰，
   TOP2/TOP3 补色之前那两枚看上去一模一样；兜底看着省事，实际是"漏一档就静默退回旧观感"） */
.irb-pod-badge {
	padding: 1px 8px;
	font-size: 11px;
	line-height: 16px;
	font-weight: 600;
	border-radius: 4px;
}
/* 三枚徽标＝金/银/铜：浅底压深字（深底压白字时银那一档只剩 2.2:1，读不出来）。
   徽标底要比它下面那块卡底再深一档，两块才分得开（不是同一块底贴在一起）。
   类名里的数字只由后端下发的 item.rank 拼出，前端不自己排名次（M22）。
   三档逐档自己算过：字压徽标底 5.34 / 5.76 / 5.21，均 ≥4.5（硬约束 29①） */
.irb-pod-badge--r1 {
	color: #7a5205;
	background: #f7e0ab;
}
.irb-pod-badge--r2 {
	color: #4a5563;
	background: #dbe1ea;
}
.irb-pod-badge--r3 {
	color: #8a4620;
	background: #f3d9c3;
}
.irb-pod-avatar {
	width: 40px;
	height: 40px;
	margin-top: 8px;
	border-radius: 50%;
	background: #f2f3f5;
}
/* 头像占位块：第一名大一档，压在有色卡底上的那一小块跟该档同族更浓一档，不留全站中性灰
   （M6 底色分块那一档⑤：压在有色底上的占位块必须跟着换，白底上的才照旧灰） */
.irb-pod--r1 .irb-pod-avatar {
	width: 52px;
	height: 52px;
	background: #f6e6c2;
}
.irb-pod--r2 .irb-pod-avatar {
	background: #e2e7ef;
}
.irb-pod--r3 .irb-pod-avatar {
	background: #f4e0d1;
}
.irb-pod-name {
	margin-top: 6px;
	max-width: 100%;
	font-size: 12px;
	line-height: 17px;
	color: #1d2129;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
/* 卡内两档文字各从本档主色派生，不再是白底那套近黑 + 主色蓝
   （M6 底色分块那一档②③：外来色系一律不许搬进来；压在卡底上逐档算过 ≥4.5）。
   金 昵称 8.92 / 人数 5.30，银 8.98 / 5.11，铜 8.80 / 5.41 */
.irb-pod--r1 .irb-pod-name {
	color: #5c3f05;
}
.irb-pod--r2 .irb-pod-name {
	color: #39424f;
}
.irb-pod--r3 .irb-pod-name {
	color: #6b3417;
}
.irb-pod-num {
	margin-top: 2px;
	font-size: 11px;
	line-height: 15px;
	color: #1d2129;
}
.irb-pod--r1 .irb-pod-num {
	color: #8a5d06;
}
.irb-pod--r2 .irb-pod-num {
	color: #5c6678;
}
.irb-pod--r3 .irb-pod-num {
	color: #96501f;
}
/* ===== 表头行：三列的左偏移与下面的行逐格对齐（排名 28 → 成员紧跟头像左缘） ===== */
.irb-cols {
	display: flex;
	align-items: center;
	padding: 0 8px 8px;
	border-bottom: 1px solid #f2f3f5;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
}
.irb-col-no {
	width: 28px;
	flex: none;
}
.irb-col-name {
	flex: 1;
	min-width: 0;
}
.irb-col-num {
	flex: none;
}
.irb-sk {
	padding: 0;
}
/* 骨架行与 .irb-row 逐块同尺寸同留白（上下 14 + 左右各 8 + 发丝线），加载完不跳版（M16） */
.irb-sk-row {
	display: flex;
	align-items: center;
	padding: 14px 8px;
	border-bottom: 1px solid #f2f3f5;
}
/* 名次那一格：16 的块 + 12 的右距 = 真实 .irb-no 的 28 列宽，行尾才对得齐 */
.irb-sk-no {
	width: 16px;
	height: 16px;
	margin-right: 12px;
	border-radius: 4px;
	background: #e5e6eb;
	flex: none;
}
.irb-sk-avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: #e5e6eb;
	margin: 0 10px;
	flex: none;
}
.irb-sk-name {
	flex: 1;
	min-width: 0;
	height: 14px;
	border-radius: 4px;
	background: #e5e6eb;
}
.irb-sk-num {
	width: 36px;
	height: 14px;
	margin-left: 10px;
	border-radius: 4px;
	background: #e5e6eb;
	flex: none;
}
/* 排行行：档位整块照 pages/app/checkin/rank/rank.vue 的 .crk-row（通栏、上下 14、分隔线 #f2f3f5）。
   项与项的间距全部由这一行容器的 gap 给：头像不再自带左右 margin，「我」标记按 v-if 出现时
   也不会把后面那一格顶走（间距写在某一项上的话，它一收起就变成下一项的左偏移） */
.irb-row {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 14px 8px;
	border-bottom: 1px solid #f2f3f5;
}
.irb-no {
	width: 28px;
	flex: none;
	font-size: 16px;
	font-weight: bold;
	color: #86909c;
}
.irb-no-top {
	color: #0968f6;
}
.irb-avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: #f2f3f5;
	flex: none;
}
.irb-name {
	flex: 1;
	min-width: 0;
	font-size: 14px;
	color: #1d2129;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.irb-num {
	flex: none;
	font-size: 14px;
	font-weight: 600;
	color: #1d2129;
}
/* 我的那一行（2026-10-01 用户点名）：整行铺浅蓝底，用来在满屏一样的白行里一眼找到自己。
   底色一改，压在这块底上的每一档都要跟着换：全站冷灰 #86909c 压在这块底上只有 3.1:1、
   主色蓝 #0968f6 只剩 2.6:1，都不够读，一律从这块蓝底派生。
   用整块负 margin 通栏铺：底色从 -8 出血到面板边上，由面板的 overflow:hidden 裁齐，仍是通栏。

   内衬算式（2026-10-03 用户第二次点名「并未给背景增加内边距，导致左侧的排序与右侧的
   邀请人数贴住了背景的左右边」，**同一处 2026-10-04 已点过一次「数字贴到边框了」——
   上一版把整张表内缩到 24，这一行却只把 padding 写成 24，等于刚补回负 margin 就收手，
   行自身那 8px 没加回来**，于是内容落在 24-24+16 = 16px，比上下每一行少 8px）：
     内容左缘 = 面板内衬(16) - 出血(24) + 行内 padding
     要与普通行齐平（16 + 8 = 24px），padding 必须是 **出血 + 行内那一档 = 24 + 8 = 32**。
   所以这一处的 padding 不是 24，是 32；写成 24 只是「取消负 margin」，不等于「与上下行对齐」。
   验法：node tuzi-mobile/scripts/check-invite-rank-board.js（② 组按真实内缩量算，不按名义值） */
.irb-row--me {
	margin: 0 -24px;
	padding: 14px 32px;
	background: #e8f4ff;
}
.irb-row--me .irb-no {
	color: #4c6b91;
}
.irb-row--me .irb-name,
.irb-row--me .irb-num {
	color: #1a3352;
}
/* 「我」那一行的标记：底部条与列表行说的是两件事（一个是全局名次、一个是这一行是谁），
   所以列表里保留后端下发的 is_me，只贴一枚小标，不把整行高亮成第二个焦点。
   标记跟在昵称后面、右缘那个「邀请人数」是这一行唯一右对齐的数（跟着昵称走的那一枚
   压到右缘上，那个数就没法对齐了）；它现在排在人数左边，间距吃行容器的 gap。
   底/字取蓝族两档：压在白行上是一枚浅蓝底蓝字的标，压在「我」那一行的蓝底上自然更深一档 */
.irb-me-tag {
	flex: none;
	padding: 1px 5px;
	border-radius: 4px;
	background: #d6e8fd;
	font-size: 11px;
	line-height: 15px;
	color: #0d5bc4;
}
.irb-me-bar {
	display: flex;
	align-items: center;
	gap: 10px;
	flex: none;
	margin-top: 12px;
	padding: 10px 12px;
	border-radius: 6px;
	background: #f7f8fa;
}
/* 右边两组「label + value」：一组一格、两格都定宽（flex:none），名次再长也不会把右缘那一格顶走。
   组内间距只由组容器的 gap 给（硬约束 20：不给 value 写 margin-left）。
   名次那一组已上榜才出，人数那一组常显（是 0 也写 0） */
.irb-me-stat {
	flex: none;
	display: flex;
	align-items: center;
	gap: 4px;
}
/* label 那一档：比 value 小一号、比 value 轻一档（2026-10-04 用户点名「label 的大小和粗细
   比这个数值小一点」）。压在这块浅灰底上，所以字色从全站冷灰往深里取一档（硬约束 29①） */
.irb-me-stat-label {
	flex: none;
	font-size: 12px;
	color: #4e5969;
	white-space: nowrap;
}
.irb-me-stat-val {
	flex: none;
	font-size: 15px;
	font-weight: 600;
	color: #1d2129;
	white-space: nowrap;
}
/* 身份块（两档共用）：头像 44 + 昵称，档位照 pages/app/checkin/rank 的 .crk-my-user
   （两个身份行参照页都是 44 圆头像 + 10px 间距的昵称，不在本弹层另起一档尺寸）；
   已上榜那一档也摆这两件（2026-10-01 用户点名「下方的我的排名也要显示我的头像和昵称」），
   昵称吃掉余量把后面两段顶到右缘，与 .irb-me-name 同款一行档位 */
.irb-me-avatar {
	width: 44px;
	height: 44px;
	border-radius: 50%;
	background: #f2f3f5;
	flex: none;
}
.irb-me-name {
	flex: 1;
	min-width: 0;
	font-size: 15px;
	font-weight: 600;
	color: #1d2129;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
/* 「立即分享」定宽 120px（2026-10-01 用户点名「下方的立即分享按钮有点宽，可以压缩下宽度，改为120px」）：
   原来是 flex:1 通栏，一颗按钮铺满整个面板下缘。宽度写在这一格上、按钮仍带 long（长按钮 = 填满本格），
   尺寸只此一处，调用点不抄。相邻档 100 / 140 报给用户定，不擅自挪。
   底部 12px 是这一行自己的内衬（面板那份安全区之外的那一格）：面板不再自带底部内衬，
   这一格不改，非刘海机型上按钮也不会贴到屏幕边 */
.irb-foot {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	flex: none;
	margin-top: 16px;
	padding-bottom: 12px;
}
/* 截止时间：吃后端下发的现成字符串，前端不格式化（M22）。有截止时间就显示；
   吃 flex:1 吃余量并单行截断——按钮定宽之后它才是那个可压缩的一档，
   写死 flex:none 时一句长的时间会把右缘的按钮顶出面板（面板 overflow:hidden 会把它裁掉一截）。
   没有截止时间时整段收起，右缘那枚按钮由 space-between 顶到右缘（间距仍只由容器的 gap 给） */
.irb-end {
	flex: 1;
	min-width: 0;
	font-size: 12px;
	color: #86909c;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
/* 「立即分享」定宽 120px（2026-10-01 用户点名「下方的立即分享按钮有点宽，可以压缩下宽度，改为120px」）：
   原来是 flex:1 通栏，一颗按钮铺满整个面板下缘。宽度写在这一格上、按钮仍带 long（长按钮 = 填满本格），
   尺寸只此一处，调用点不抄。相邻档 100 / 140 报给用户定，不擅自挪 */
.irb-share {
	flex: none;
	width: 120px;
}
</style>
