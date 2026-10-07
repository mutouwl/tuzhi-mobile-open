<template>
	<!--
		打卡-DIY 打卡列表组件（自定义页面用）
		两条来源的数据都由后端随装修接口下发（common/library/app/checkin/DecorPage），
		这里只负责渲染；无数据时整块不占位（与教务三个 DIY 组件同一口径）。
	-->
	<view class="tz-checkin-list" v-if="list && list.length">
		<view v-for="(item, index) in list" :key="item.id" class="checkin-card"
			:class="[type, { 'checkin-card-round': round, 'checkin-card-border': border }]"
			:style="{ 'margin-bottom': index === list.length - 1 ? '0px' : margin + 'px' }" @tap="goActivity(item)">
			<view class="checkin-cover">
				<image v-if="item.cover && !imgErrors[item.id]" class="checkin-cover-img" :src="item.cover" mode="aspectFill" @error="onCoverError(item.id)" />
				<!-- 封面为空/加载失败占位：浅灰底 + 居中图标（与圈子、课程卡兜底一致） -->
				<view v-else class="checkin-cover-img checkin-cover-error">
					<tz-icon name="picture" :size="24" color="#c9cdd4" />
				</view>
			</view>
			<view class="checkin-info">
				<view class="checkin-name">{{ item.name }}</view>
				<view class="checkin-stat">
					<text class="checkin-count">{{ (item.join_count || 0) }}人参与</text>
					<view class="checkin-btn">参与</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * 卡片一行只摆三件事：封面、活动名、参与人数 + 「参与」—— 装修接口免登录可访问，
 * 拿不到「当前学员是否已参与」，所以这一档不摆进度、不摆价格，也不在卡上直接调参与接口
 * （付费/密码/绑课活动绕过介绍页直接参与会跳过付款与告知）。
 * 「参与」与整卡是同一个动作：落点与分流只存 common/utils/checkin-activity 一处，
 * 未带 is_member 的行按介绍页走，介绍页自己认出已参与并换成「进入打卡」。
 */
import { goActivity } from '@/common/utils/checkin-activity';

export default {
	name: 'tz-checkin-list',
	props: {
		// 打卡活动列表（后端 DecorPage 下发：id / name / cover / join_count）
		list: { type: Array, default: () => [] },
		// list 列表（封面在左的横排卡） / big 大图（封面通栏在上的大卡）
		type: { type: String, default: 'list' },
		// 圆角/边框（装修端配置下发 1/0，缺省按圆角显示、边框隐藏，与其余 DIY 组件同档）
		round: { type: [Boolean, Number], default: true },
		border: { type: [Boolean, Number], default: false },
		// 卡片间距
		margin: { type: [Number, String], default: 10 },
	},
	data() {
		return {
			// 封面图加载失败标记：key = 活动 id，值为 true 时换成图标占位
			imgErrors: {},
		};
	},
	methods: {
		goActivity,
		onCoverError(id) {
			this.$set(this.imgErrors, id, true);
		},
	},
};
</script>

<style scoped>
.tz-checkin-list {
	display: flex;
	flex-direction: column;
}
.checkin-card {
	background: #fff;
	overflow: hidden;
}
.checkin-card-round {
	border-radius: 10px;
}
.checkin-card-border {
	border: 1px solid #efefef;
}
.checkin-cover {
	position: relative;
	overflow: hidden;
	flex-shrink: 0;
}
.checkin-cover .checkin-cover-img {
	width: 100%;
	height: 100%;
	display: block;
}
.checkin-cover .checkin-cover-error {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f2f3f5;
}
/* 列表：封面在左，名称在上、统计行贴底（卡高由封面那一档给，与大图档互不干涉） */
.checkin-card.list {
	display: flex;
	align-items: stretch;
}
.checkin-card.list .checkin-cover {
	width: 120px;
	height: 80px;
}
.checkin-card.list .checkin-info {
	flex: 1;
	min-width: 0;
	padding: 8px 10px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
/* 大图：封面通栏在上，活动封面按 750×420 上传，这一档高度取宽度的 ≈0.56 倍 */
.checkin-card.big .checkin-cover {
	width: 100%;
	height: 190px;
}
.checkin-card.big .checkin-info {
	padding: 10px;
}
.checkin-name {
	font-size: 15px;
	font-weight: 600;
	color: #1d2129;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.checkin-stat {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 6px;
	font-size: 12px;
	color: #86909c;
}
/* 列表档的统计行贴底，上下留白由 info 的 space-between 给，不再叠一次 margin-top */
.checkin-card.list .checkin-stat {
	margin-top: 0;
}
.checkin-count {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
/* 「参与」是这一档的胶囊动作，与圈子卡的「加入」同一档；圆角给到按钮高度的一半
   （22px 的一半），再大就撞上 M21 的卡片圆角档 */
.checkin-btn {
	height: 22px;
	line-height: 22px;
	padding: 0 12px;
	font-size: 11px;
	color: #fff;
	background: #0968f6;
	border-radius: 11px;
	flex-shrink: 0;
}
</style>
