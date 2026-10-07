<template>
	<!--
	  奖品大卡（竞品图4 / 图15 / 图19 中间那一张）：六型奖品共用这一份卡结构，
	  「按型出面」只换中间那一格给的是图还是数——课程/实物/自定义给封面，积分给数值 + 单位，
	  现金给 ¥ 金额，优惠券给名称 + 券档说明。

	  为什么不是六套卡：详情弹窗与助力弹窗都只摆这一张，两套版式同屏就是用户连着点名的
	  「内容区域上下间距不一致」那一族（requirement-delivery.md L1-2.10）。
	  为什么不用 tz-swiper：那只组件是纯图片轮播（u-swiper + list 只有 img 一格），
	  装不下「图/数值 + 名称 + 类型」三段，本卡不是它的第二种形态而是另一种东西。
	  多于一张时整排左右滑（口径同 M18⑦ 样式条那一档），不折行——折行会把这一屏顶高。
	-->
	<view class="sph" :class="{ 'sph--one': skeleton || prizes.length === 1 }">
		<scroll-view class="sph-rail" scroll-x>
			<!-- 加载档（skeleton）：卡片本体照常摆出来（#f7f8fa + 6px 圆角 + 12px 内衬那一档原样不动），
			     只把卡里「封面 / 名称 / 类型」三格盖成灰块，形状与加载完逐格同形。
			     为什么骨架写在组件里而不在调用页另画一块：这张卡的版式（200 宽、封面 176×120、
			     名称 20 行盒、类型 17 行盒、内衬 12）只存这一份，父页另抄一份 200×193 的整灰板
			     就等于第二份版式，加载完换真内容时形状必然对不上（2026-09-30 用户点名）。
			     一条只摆一张：详情首屏与助力弹窗都是一张，多张才左对齐换屏（M18 同一档）。 -->
			<block v-if="skeleton">
				<view class="sph-card">
					<!-- 封面那一格直接复用 .sph-cover--none（它本来就是「没有图」那一档的灰底），
					     尺寸/圆角与有图时同一个类，不另写一份 -->
					<view class="sph-cover sph-cover--none"></view>
					<view class="sph-sk-name"></view>
					<view class="sph-sk-type"></view>
				</view>
			</block>
			<block v-else>
				<view class="sph-card" v-for="item in prizes" :key="'prize-' + item.prize_id">
					<!-- 中间那一格按型出面：积分与现金给数值（这两型后端在 cover 里落的是内置图标，
					     数值与图标说的是同一件事，两张都摆就把一张卡撑成两屏），其余四型给封面。
					     两样都没有就留一块灰底，不写「暂无图片」那种占位字（图取不到是商家的事，
					     不是给学员看的信息）。 -->
					<image class="sph-cover" v-if="showCover(item)" :src="cover(item)" mode="aspectFill"></image>
					<view class="sph-cover sph-cover--none" v-else-if="!valueText(item)"></view>
					<view class="sph-value" v-if="valueText(item)">
						<!-- 内层那一只只管「数字与单位共一条基线」；垂直居中由外层给。
						     少这一层时外层只能取 baseline 才能让 34px 的数字与 12px 的单位齐脚，
						     而 baseline 在 120px 的盒子里等于把数字顶到上沿
						     （2026-10-05 用户点名「我说的内容是这个 n 元或者说 n 积分应该垂直居中」）。 -->
						<view class="sph-value-row">
							<text class="sph-value-num">{{ valueText(item) }}</text>
							<text class="sph-value-unit" v-if="valueUnit(item)">{{ valueUnit(item) }}</text>
						</view>
					</view>
					<view class="sph-name">{{ item.name || '奖品' }}</view>
					<view class="sph-type">{{ item.type_text }}</view>
				</view>
			</block>
		</scroll-view>
		<view class="sph-none" v-if="!skeleton && !prizes.length">商家暂未设置奖品</view>
	</view>
</template>

<script>
/**
 * 详情弹窗与助力弹窗共用的一排奖品卡（同一份判据只存这一处）
 * props: prizes 后端 GiftRow::prizes() 原样下发的行
 *       skeleton 加载档：卡壳照常摆，只把卡里三格内容盖灰（版式只有这一份，见模板注释）
 */
import { prizeImage } from '@/common/utils/share-gift';

export default {
	name: 'prize-hero',
	props: {
		prizes: { type: Array, default: () => [] },
		skeleton: { type: Boolean, default: false },
	},
	methods: {
		cover(item) {
			return prizeImage(item && item.cover, this.$tools);
		},
		/** 这一张要不要画封面：数值型（积分/现金）不画，内置图标与那一个大数字是同一件事 */
		showCover(item) {
			return !!item && !this.valueText(item) && !!this.cover(item);
		},
		/**
		 * 这一型出面的是数值还是图片：积分给分、现金给钱，其余四型给封面。
		 * 判据读后端逐行的 type（M22），前端不自己看 score_value 有没有值来猜是哪一型。
		 */
		valueText(item) {
			if (!item) {
				return '';
			}
			if (item.type === 'score') {
				return String(item.score_value || 0);
			}
			if (item.type === 'cash') {
				return String(item.cash_amount || '0.00');
			}
			return '';
		},
		valueUnit(item) {
			if (!item) {
				return '';
			}
			if (item.type === 'score') {
				return '积分';
			}
			if (item.type === 'cash') {
				return '元';
			}
			return '';
		},
	},
};
</script>

<style scoped>
.sph {
	/* 多张时靠左（整排居中会把左边那张顶出 scroll-view 的可滚范围，划不回去）；
	   只有一张才居中，对应图4「单个奖品图」那一档 */
	text-align: left;
}
.sph--one {
	text-align: center;
}
.sph-rail {
	white-space: nowrap;
	/* 行盒由色板自己给高，否则 inline-block 下面多撑一条行盒的空（M18⑨e 同一条） */
	line-height: 0;
}
.sph-card {
	display: inline-block;
	width: 200px;
	margin-right: 10px;
	padding: 12px;
	vertical-align: top;
	text-align: left;
	background: #f7f8fa;
	border-radius: 6px;
	box-sizing: border-box;
}
.sph-card:last-child {
	margin-right: 0;
}
/* 封面/缩略图档圆角 6（§1 只有四类东西能有圆角） */
.sph-cover {
	display: block;
	width: 176px;
	height: 120px;
	border-radius: 6px;
}
.sph-cover--none {
	background: #e5e6eb;
}
/* 数值那一格：积分与现金没有图，用大号数字出面（图15 的「⭐ 80」那一档，本系统不装图标字体）。
   高度 120 与 .sph-cover 同一档 ⇒ 两种奖品那张卡的整高一致，切换/换型时下面名称那一行不跳位 */
.sph-value {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 120px;
}
/* 数字与单位共一条基线的那一只：34px 数字与 12px 单位必须 baseline 齐脚，
   而 baseline 只能作用在这一层的小盒子上——作用在 120px 那一只上会把数字顶到上沿 */
.sph-value-row {
	display: flex;
	align-items: baseline;
}
.sph-value-num {
	font-size: 34px;
	font-weight: 600;
	line-height: 40px;
	color: #f53f3f;
}
.sph-value-unit {
	margin-left: 4px;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
}
.sph-name {
	margin-top: 10px;
	font-size: 14px;
	line-height: 20px;
	font-weight: 600;
	color: #1d2129;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.sph-type {
	margin-top: 2px;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
}
.sph-none {
	padding: 24px 0;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
	text-align: center;
}
/* 加载档里名称/类型两块灰（封面那一格复用 .sph-cover--none）
   高度取真实行盒高（20 / 17），宽度取该行文字实宽（14px 加粗约 8 字 / 12px 约 4 字），
   这样「内衬 12 + 封面 120 + 10 + 20 + 2 + 17 + 内衬 12 = 193」与加载完那张卡同高，
   灰块一块块换成真文字时卡内没有任何一格跳位（M16「灰块尺寸与真实版式逐块对齐」） */
.sph-sk-name {
	width: 112px;
	height: 20px;
	margin-top: 10px;
	border-radius: 4px;
	background: #e5e6eb;
}
.sph-sk-type {
	width: 48px;
	height: 17px;
	margin-top: 2px;
	border-radius: 4px;
	background: #e5e6eb;
}
</style>
