<template>
	<!--
	  奖品身份卡（2026-10-03）：封面 + 名称 + 类型标签，就这三块

	  **只摆「这是哪一个奖品」，不摆「兑到什么东西」**——券面额/积分数/订单号那些
	  形态各异的部分是详情弹窗里各型专属的那一张卡（见 tz-prize-detail）。
	  两处调用：奖品详情弹窗的抬头、兑奖方式窗里联系方式上面那一段。

	  为什么单独抽一只：自定义礼盒的「兑奖方式」窗与「奖品详情」窗要显示同一枚奖品，
	  两处各写一遍封面/名称/类型就是两份会分叉的版式（硬约束 11）。
	-->
	<view class="ppc">
		<image
			class="ppc-cover"
			v-if="coverSrc && !coverError"
			:src="coverSrc"
			mode="aspectFill"
			@error="coverError = true"
		></image>
		<!-- 没配奖品图、或图加载不出来（地址失效/网慢/图被删）：落默认商品图。
		     少了这一支，<image> 加载失败在弹窗里就是一块空白，比列表上还明显 -->
		<image class="ppc-cover" v-else :src="defaultCover" mode="aspectFill"></image>
<view class="ppc-info">
				<view class="ppc-name">{{ nameText }}</view>
				<view class="ppc-meta">
					<text class="ppc-type">{{ typeText }}</text>
					<!-- 状态短标签走小元素档（12px / #86909c / #f2f3f5 / 圆角 4，与列表行同一档，M22） -->
					<text class="ppc-tag" v-if="tagText">{{ tagText }}</text>
				</view>
			</view>
	</view>
</template>

<script>
import { prizeImage } from '@/common/utils/prize';

/**
 * props: row（奖品行，读 name/cover/type_text/status_text）、mode（mini=兑奖窗里那一档）
 *        兜底图走 prizeImage()，与列表页同一个工具（相对路径要按站点根补全）
 */
export default {
	name: 'tz-prize-card',
	props: {
		row: { type: Object, default: null },
		mode: { type: String, default: '' },
	},
	data() {
		return {
			// 单向切换（失败后不再回切），避免同一张坏图在两个 src 之间反复抖
			coverError: false,
			// 没配图 / 加载失败时的兜底图（与套餐卡、校区卡、奖品列表同一张默认商品图）
			defaultCover: '/static/image/default-goods.jpg',
		};
	},
	computed: {
		coverSrc() {
			// prop 可能是 null：渲染期取属性一律走这一层（硬约束 23 的同族，属性读点不许直接摸）
			return this.row ? prizeImage(this.row.cover, this.$tools) : '';
		},
		// 下面三格同理。row 为 null 不是边角：奖品详情窗的兜底分支传的就是 current，
		// 而它关窗时先把 current 置空、u-popup 的离场动画期间 DOM 还挂着 ⇒ 模板直接摸
		// row.name 抛 TypeError，整轮 patch 被跳过（表现是弹窗关不掉、内容停更）
		nameText() {
			return (this.row && this.row.name) || '-';
		},
		typeText() {
			return (this.row && this.row.type_text) || '';
		},
		tagText() {
			return (this.row && this.row.status_text) || '';
		},
	},
	watch: {
		// 换一枚奖品时把失败标志复位，否则上一枚的坏图会把下一枚的封面也吃掉
		'row.prize_log_id'() {
			this.coverError = false;
		},
	},
};
</script>

<style scoped>
.ppc {
	display: flex;
	align-items: center;
	padding: 10px;
	background: #f7f8fa;
	border-radius: 4px;
}
/* 封面档：56 方、圆角 6（§1 封面/缩略图 6–8）。底色留一层给图解码前的那一瞬，不白闪 */
.ppc-cover {
	width: 56px;
	height: 56px;
	border-radius: 6px;
	flex: none;
	background: #e5e6eb;
}
.ppc-info {
	flex: 1;
	min-width: 0;
	margin-left: 10px;
}
.ppc-name {
	font-size: 14px;
	line-height: 20px;
	font-weight: 600;
	color: #1d2129;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.ppc-meta {
	display: flex;
	align-items: center;
	margin-top: 4px;
}
.ppc-type {
	font-size: 12px;
	line-height: 17px;
	color: #4e5969;
}
/* 标签与类型之间的间距由容器 gap 给（这里没有多枚并排的项，margin 只这一处且是首项之后的） */
.ppc-tag {
	margin-left: 8px;
	padding: 1px 6px;
	font-size: 10px;
	line-height: 14px;
	color: #86909c;
	background: #f2f3f5;
	border-radius: 4px;
}
</style>