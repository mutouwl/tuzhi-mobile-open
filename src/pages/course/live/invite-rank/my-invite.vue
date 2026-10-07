<template>
	<!--
	  我的邀请弹层（竞品图5）：叠在榜单弹层之上，z-index 比它高一档（同 redpacket 10210→10310 那一档口径）。
	  版式按图5 那三段：顶部身份行 → 统计格 → 明细表头 + 明细行。
	  「邀请明细」那一行小节标题 2026-10-05 用户点名去掉，三段里的第三段直接由表头起（表头两列
	  「受邀人 / 接受邀请时间」是列名不是段落名，保留）；身份行到表头的间距由 .irm-user 自己给。
	  数据由本组件自己按 course_id 现取（M23：从这一层退回榜单时，由榜单那一层自己重取，
	  不在本页 onUnload 里跨页替上级取数）。
	-->
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
		<view class="irm">
			<view class="irm-title">我的邀请</view>

			<!-- 身份行：头像 44 + 昵称（档位照 pages/app/checkin/rank 的 .crk-my-user）
			     + 「已邀请人数」那一格。
			     2026-10-01 用户点名：这一格移到头像昵称的右侧、与它们同一基线垂直对齐
			     （原来是身份行下面单独一整条 .irm-stats 灰卡）；格内把顺序翻过来：
			     数值在上、label 在下，label 与数值同一轴水平居中。
			     图5 顶部本是三格统计，其中两格被模糊读不出（附录 B⑬）→ 仍只出这一格，不留两格空壳 -->
			<view class="irm-user">
				<image class="irm-avatar" :src="myAvatar" mode="aspectFill" @error="onMyAvatarError" />
				<text class="irm-name">{{ maskName(nickname) }}</text>
				<view class="irm-stat">
					<text class="irm-stat-num">{{ inviteNum }}</text>
					<text class="irm-stat-label">已邀请人数</text>
				</view>
			</view>

			<!-- 身份行与下面那档表头之间原本还夹着一行「邀请明细」小节标题，2026-10-05 用户点名
			     「我的邀请弹窗中不要显示邀请明细 title」⇒ 整行删掉，那行标题的上下留白一并交给
			     .irm-user 自己给（见样式里那一档 margin-bottom）：搬走了就不留第二处，也不让两段贴在一起。
			     表头「受邀人 / 接受邀请时间」两列仍在（那是列名不是段落名），身份行那一格仍是
			     「这是谁的名单」，两截的区分靠那一档间距，不再靠一行字 -->
			<tz-popup-list height="46vh" padding="0 0 12px" :refreshing="refreshing" @refresh="$emit('refresh')" @lower="$emit('load-more')">
				<view class="irm-cols" v-if="rows.length">
					<text class="irm-col-name">受邀人</text>
					<text class="irm-col-time">接受邀请时间</text>
				</view>
				<!-- 骨架按真实行的三块逐块铺（头像 32 + 昵称条 + 右侧时间条），
				     不是一条 72% 宽的灰条：那一档盖不到第二列「接受邀请时间」，右侧就露白（M16） -->
				<view class="irm-sk" v-if="loading && !rows.length">
					<view class="irm-sk-row" v-for="i in 5" :key="'irm-sk-' + i">
						<view class="irm-sk-who">
							<view class="irm-sk-avatar"></view>
							<view class="irm-sk-name"></view>
						</view>
						<view class="irm-sk-time"></view>
					</view>
				</view>
				<block v-else>
					<view class="irm-row" v-for="item in rows" :key="item.user_id">
						<view class="irm-row-who">
							<image class="irm-row-avatar" :src="item.avatar || '/static/image/default-avatar.png'" mode="aspectFill" @error="onRowAvatarError(item)" />
							<!-- 昵称脱敏：2026-10-03 用户点名（与榜单一档），口径与实现都吃全站那一份 -->
							<text class="irm-row-name">{{ maskName(item.nickname) }}</text>
						</view>
						<text class="irm-row-time">{{ item.count_time_text }}</text>
					</view>
					<u-empty
						v-if="!rows.length"
						icon="/static/image/empty.png"
						width="70"
						height="70"
						:text="error || '还没有好友接受你的邀请'"
					></u-empty>
					<u-loadmore :status="loadStatus" v-if="rows.length && loadStatus !== 'nomore'"></u-loadmore>
				</block>
			</tz-popup-list>
		</view>
	</u-popup>
</template>

<script>
import { maskNickname } from '@/common/utils/privacy';

export default {
	name: 'invite-rank-my-invite',
	props: {
		show: { type: Boolean, default: false },
		// 顶部那一行身份：吃页面已登录用户的头像与昵称，不为这一行再发一次用户接口
		avatar: { type: String, default: '' },
		nickname: { type: String, default: '' },
		rows: { type: Array, default: () => [] },
		loading: { type: Boolean, default: false },
		refreshing: { type: Boolean, default: false },
		error: { type: String, default: '' },
		loadStatus: { type: String, default: 'loadmore' },
		inviteNum: { type: [Number, String], default: 0 },
	},
	// 事件名一律避开原生名（M28：H5 编译器把模板里的 @tap 单向改成 @click，组件发 tap 就永远收不到）
	emits: ['close', 'refresh', 'load-more'],
	data() {
		return { myAvatarFailed: false };
	},
	computed: {
		/** 自己那一行的头像是 props，写不回源字段：记「此刻摆在界面上的那一张」（§四-21 + 硬约束 22 末条） */
		myAvatar() {
			return this.myAvatarFailed || !this.avatar ? '/static/image/default-avatar.png' : this.avatar;
		},
	},
	watch: {
		// 换一场直播（props 上的头像跟着用户刷新）要撤掉上一次的失败标记，否则一直吃兜底图
		avatar() {
			this.myAvatarFailed = false;
		},
	},
	methods: {
		/** 昵称脱敏的转发口：模板看不见模块级 import（硬约束 25），两处插值都过这里 */
		maskName(name) {
			return maskNickname(name);
		},
		close() {
			this.$emit('close');
		},
		onMyAvatarError() {
			this.myAvatarFailed = true;
		},
		onRowAvatarError(row) {
			if (row) { this.$set(row, 'avatar', '/static/image/default-avatar.png'); }
		},
	},
};
</script>

<style scoped>
/* 底部安全区只挂这一份（模板已关 u-popup 的 safeAreaInsetBottom，微信端按全站减半口径）；
   底部那一格内衬交给滚动画布自己给（tz-popup-list 的 padding="0 0 12px"）——
   面板不再写「20px + 安全区」：iPhone X 下那样叠成 20 + 34 = 54px，比同屏礼物/商品弹层
   （内容自己 10px + 安全区 34px = 44px）明显多一截，2026-10-01 用户点名
   「邀请达人榜、分享有礼模块相关的弹窗底部安全距离都太大了，参考其他的 popup 组件」 */
.irm {
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
.irm-title {
	padding: 15px 0 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
	flex: none;
}
/* 身份行到下面那档表头的间距（原来这一段是「邀请明细」小节标题那一行的上下留白，
   2026-10-05 用户点名去掉那行标题 ⇒ 间距不能跟着一起塌掉，搬到这里给，数值沿用原那一档）。
   24px 是当初点名「身份行（44 头像）到明细贴着读，整段像一块」定的下档；
   相邻档 16 / 32 报给用户定，不擅自再挪 */
.irm-user {
	display: flex;
	align-items: center;
	gap: 10px;
	flex: none;
	margin-bottom: 24px;
}
.irm-avatar {
	width: 44px;
	height: 44px;
	border-radius: 50%;
	background: #f2f3f5;
	flex: none;
}
.irm-name {
	flex: 1;
	min-width: 0;
	font-size: 16px;
	font-weight: bold;
	color: #1d2129;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
/* 已邀请人数那一格：靠右、与 44px 头像同一基线；格内纵向排，label 与数值同一轴水平居中。
   原来是一整条 .irm-stats 灰卡（#f7f8fa + 12px 内衬），并进身份行后不再单列一格 */
.irm-stat {
	flex: none;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.irm-stat-num {
	font-size: 18px;
	font-weight: bold;
	line-height: 24px;
	color: #1d2129;
}
.irm-stat-label {
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
}
/* 表头两列与下面的行、上面那组骨架共用同一份 flex 档（几何对得上）：
   受邀人那一列含头像，吃余量（flex:1 + min-width:0，超长昵称省略号）；
   「接受邀请时间」定宽一档靠右（2026-10-01 用户点名「应该靠右侧对齐」）。
   108px = 后端 date('Y-m-d H:i') 的 16 个字符按 12px 最宽字形估出来的上限，
   少于它就 left、多于它就右 —— 表头 6 个字只有 72px，靠同一列的右缘与下面每行的时间对齐 */
.irm-cols {
	display: flex;
	align-items: center;
	padding: 0 0 8px;
	border-bottom: 1px solid #f2f3f5;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
}
.irm-col-name {
	flex: 1;
	min-width: 0;
}
.irm-col-time {
	flex: none;
	width: 108px;
	white-space: nowrap;
	text-align: right;
}
.irm-sk {
	padding: 0;
}
/* 骨架行与 .irm-row 同结构同留白：受邀人那一列吃余量、时间那一列同宽同右缘，与上面那行表头逐格对得上 */
.irm-sk-row {
	display: flex;
	align-items: center;
	padding: 14px 0;
	border-bottom: 1px solid #f2f3f5;
}
.irm-sk-who {
	flex: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 10px;
}
.irm-sk-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: #e5e6eb;
	flex: none;
}
.irm-sk-name {
	flex: 1;
	min-width: 0;
	height: 14px;
	border-radius: 4px;
	background: #e5e6eb;
}
/* 骨架的时间条与真实那一列同宽同右缘：跟着表头那一档一起改，别留成半行宽的灰条 */
.irm-sk-time {
	flex: none;
	width: 108px;
	height: 12px;
	border-radius: 4px;
	background: #e5e6eb;
}
.irm-row {
	display: flex;
	align-items: center;
	padding: 14px 0;
	border-bottom: 1px solid #f2f3f5;
}
.irm-row-who {
	flex: 1;
	min-width: 0;
	display: flex;
	align-items: center;
	gap: 10px;
}
.irm-row-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: #f2f3f5;
	flex: none;
}
.irm-row-name {
	flex: 1;
	min-width: 0;
	font-size: 14px;
	line-height: 20px;
	color: #1d2129;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.irm-row-time {
	flex: none;
	width: 108px;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
	white-space: nowrap;
	text-align: right;
}
</style>
