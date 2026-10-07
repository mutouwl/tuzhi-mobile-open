<template>
	<!--
	  分享有礼活动列表弹窗（直播间右侧入口点开，竞品图3）。
	  一行的四段文字全部来自接口（run_state_text / condition_text / progress_text / action_text），
	  前端不拼「邀请 N 人」、不自己数助力、不自己比 end_time（M22）。
	  行序照后端：进行中在前，历史行在后（图3 本身就是「进行中 + 已结束」各一条）。
	-->
	<u-popup
		:show="show"
		mode="bottom"
		bgColor="transparent"
		:round="12"
		:closeable="true"
		:safeAreaInsetBottom="false"
		:zIndex="10210"
		:overlayStyle="{ zIndex: 10200 }"
		@close="close"
	>
		<view class="sgl">
			<view class="sgl-title">分享有礼</view>
			<!-- 列表区给确定高度（M6：小程序 scroll-view 的滚动画布按自身 height 解析，
			     只写 min/max 会「下方空白还滑不动」）；骨架写在列表壳里面，
			     面板从首帧就占住这一档，到手不跳（M18⑨d）。
			     这一屏与「邀请达人榜」弹层**面板总高对齐**（2026-10-02 第一次点名「分享有礼弹窗可与邀请达人榜弹窗等高」，
			     2026-10-06 第二次点名「分享有礼的弹窗高度，包括分享有礼的详情，可以跟这个邀请达人榜弹窗高度对齐」）。
			     面板总高 = 标题行 + 列表区高 + 该面板自己的下方固定条，所以**是加不是减**：
			       达人榜（参照页，不动）：标题行 49 + 列表区 60vh + 我的排名条 76 + 底栏 65 = 60vh + 190px
			       本屏         ：标题行 49（与达人榜逐值相同：上下 15/12 + 16px/600）+ 列表区，
			                     下面那两段它没有 ⇒ 列表区要把同样的 141 **加进去**才齐：
			                     49 + (60vh + 141) = 60vh + 190px。
			     上一版写成 `calc(60vh - 141px)`（从列表区把参照页那两段**减**掉），
			     算出来比达人榜矮 141px，与「等高」正好相反。
			     逐档数值与两档算式只在 @/common/utils/live-popup-height 一份里，参照页那两段改档时改那一处；
			     calc() 的 + 两侧各留一个空格（CSS 硬要求，紧凑写法整条 height 作废 ⇒ 退回 60vh）。 -->
			<tz-popup-list :height="listHeight" padding="0 0 12px" :refreshable="false">
				<!-- 骨架按真实行的三行逐块铺：每一行右边那一块（状态标签 / 进度 x/y / 动作按钮）
				     也要占住，否则整屏右侧三格全是白的（M16「灰块尺寸与真实版式逐块对齐」）。
				     原先是一条 u-skeleton 出三行百分比灰条，只盖左半边 -->
				<view class="sgl-sk" v-if="loading && !rows.length">
					<view class="sgl-sk-item" v-for="i in 4" :key="'sgl-sk-' + i">
						<view class="sgl-sk-line">
							<view class="sgl-sk-title"></view>
							<view class="sgl-sk-tag"></view>
						</view>
						<view class="sgl-sk-line">
							<view class="sgl-sk-text"></view>
							<view class="sgl-sk-progress"></view>
						</view>
						<view class="sgl-sk-line">
							<view class="sgl-sk-time"></view>
							<view class="sgl-sk-btn"></view>
						</view>
					</view>
				</view>
				<block v-else>
					<!-- 整卡可点（M19）：点这一行 = 点行尾那颗按钮，一个实体一个落点，
					     且这一行的落点只有「这条活动的详情」一种——历史行也一样进详情，
					     不在清单这一层把人导航出直播间（要看已中的奖由详情那一屏说，2026-09-30 用户点名） -->
					<view
						class="sgl-item"
						:class="{ 'sgl-item--last': index == rows.length - 1 }"
						v-for="(row, index) in rows"
						:key="row.id"
						@tap="pick(row)"
					>
						<view class="sgl-item-head">
							<text class="sgl-item-title">{{ row.title }}</text>
							<text :class="['sgl-tag', row.run_state == 'ongoing' ? 'sgl-tag--on' : '']">{{ row.run_state_text }}</text>
						</view>
						<view class="sgl-item-line">
							<text class="sgl-item-text">{{ row.condition_text }}</text>
							<text class="sgl-item-progress">{{ row.progress_text }}</text>
						</view>
						<view class="sgl-item-line">
							<text class="sgl-item-time">{{ timeLine(row) }}</text>
							<!-- 按钮只是这一行的落点写法，点击由整卡接（tz-button 的 @click 不 stop 会双触发） -->
							<view class="sgl-item-btn">
								<tz-button size="mid" :type="row.run_state == 'ongoing' ? 'primary' : 'default'" :text="row.action_text"></tz-button>
							</view>
						</view>
					</view>
					<u-empty
						v-if="!rows.length"
						icon="/static/image/empty.png"
						width="70"
						height="70"
						:text="error || '本直播暂无分享有礼活动'"
					></u-empty>
				</block>
			</tz-popup-list>
		</view>
	</u-popup>
</template>

<script>
import { SHARE_GIFT_LIST_H } from '@/common/utils/live-popup-height';

export default {
	name: 'activity-list',
	props: {
		show: { type: Boolean, default: false },
		rows: { type: Array, default: () => [] },
		loading: { type: Boolean, default: false },
		// 取列表失败那一句（接口 msg）：空态吃它，不把接口故障说成「暂无活动」（M13）
		error: { type: String, default: '' },
	},
	emits: ['close', 'pick'],
	computed: {
		/** 列表区高度：与达人榜榜单弹层**面板总高对齐**用的那一档（算式见 @/common/utils/live-popup-height） */
		listHeight() {
			return SHARE_GIFT_LIST_H;
		},
	},
	methods: {
		close() {
			this.$emit('close');
		},
		/**
		 * 一行的落点只有活动详情那一个（进行中与历史行都一样）：清单装在本直播间里，
		 * 点一行就把人留在直播间看这一条活动，「我的奖品/记录」那一整页由详情里的入口说，
		 * 不在这一层直接换页——换页就等于跳出了直播。
		 * 事件名不用 tap/click（M28：H5 编译器只单向改模板里的监听名，组件发的那一份不改名收不到）。
		 */
		pick(row) {
			this.$emit('pick', row.id);
		},
		/**
		 * 一行只讲一件事：截止时间后端已格式化，缺这一段就不铺那半句（不留「截止 」孤零零三个字）
		 */
		timeLine(row) {
			return row.end_time_text ? '截止时间: ' + row.end_time_text : '';
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
.sgl {
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
}
/* 标题走 .school-popup-title 口径（16px/600 左对齐，不自造居中标题行，M18） */
.sgl-title {
	padding: 15px 0 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}
.sgl-sk {
	padding: 0;
}
/* 骨架行与 .sgl-item 同内衬同发丝线（上下 14、行间 6），加载完不跳版（M16） */
.sgl-sk-item {
	padding: 14px 0;
	border-bottom: 1px solid #f2f3f5;
}
.sgl-sk-item:last-child {
	border-bottom: none;
}
.sgl-sk-line {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.sgl-sk-line + .sgl-sk-line {
	margin-top: 6px;
}
.sgl-sk-title {
	flex: 1;
	min-width: 0;
	height: 16px;
	margin-right: 8px;
	border-radius: 4px;
	background: #e5e6eb;
}
/* 行尾三块的宽度取真实元素那一档：状态标签 44×19、进度 26×12、按钮 68×27（tz-button size=mid） */
.sgl-sk-tag {
	width: 44px;
	height: 19px;
	flex: none;
	border-radius: 4px;
	background: #e5e6eb;
}
.sgl-sk-text {
	flex: 1;
	min-width: 0;
	height: 12px;
	margin-right: 8px;
	border-radius: 4px;
	background: #e5e6eb;
}
.sgl-sk-progress {
	width: 26px;
	height: 12px;
	flex: none;
	border-radius: 4px;
	background: #e5e6eb;
}
.sgl-sk-time {
	width: 55%;
	height: 12px;
	flex: none;
	border-radius: 4px;
	background: #e5e6eb;
}
.sgl-sk-btn {
	width: 68px;
	height: 27px;
	flex: none;
	border-radius: 4px;
	background: #e5e6eb;
}
/* 行：通栏白底 + 下沿发丝线，末条收口（弹窗整片白底，末条下面留一根线会悬空，M24） */
.sgl-item {
	padding: 14px 0;
	border-bottom: 1px solid #f2f3f5;
}
.sgl-item--last {
	border-bottom: none;
}
.sgl-item-head {
	display: flex;
	align-items: center;
}
.sgl-item-title {
	flex: 1;
	min-width: 0;
	font-size: 14px;
	font-weight: 600;
	line-height: 20px;
	color: #1d2129;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
/* 状态标签档（M22）：12px / 圆角 4 / 灰底灰字；进行中那一档换成主色浅底，与同排 chip 的选中档一致 */
.sgl-tag {
	flex: none;
	margin-left: 8px;
	padding: 1px 6px;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
	background: #f2f3f5;
	border-radius: 4px;
}
.sgl-tag--on {
	color: #0968f6;
	background: #e8f1ff;
}
/* 一行两项：左文字右数值/按钮，两端对齐；项与项的间距只由这一行的 space-between 给 */
.sgl-item-line {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 6px;
}
.sgl-item-text {
	flex: 1;
	min-width: 0;
	font-size: 12px;
	line-height: 17px;
	color: #4e5969;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.sgl-item-progress {
	flex: none;
	margin-left: 8px;
	font-size: 12px;
	line-height: 17px;
	font-weight: 600;
	color: #0968f6;
}
.sgl-item-time {
	flex: 1;
	min-width: 0;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.sgl-item-btn {
	flex: none;
	margin-left: 8px;
}
</style>
