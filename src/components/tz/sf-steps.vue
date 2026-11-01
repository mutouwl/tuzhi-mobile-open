<template>
	<!--
	  送好友三步指示条（全站唯一一份）：
	   1. 购买礼物（下单页）→ 2. 赠送好友（送礼页）→ 3. 好友收礼（领取页）

	  2026-10-28 用户点名「上面的 step 最好复用提交订单页面上面的 step」：
	  原来它写死在 `components/order/submit-order.vue` 里（白底通栏、三格等分、图标在上文字在下），
	  送礼页要用同一根条 —— 抄一份就是同一枚 UI 两张皮，故抽到这里，两处只差 `active` 那一档。

	  `active` = 当前进行到第几步（1/2/3）：**已走过的步骤与当前步骤同为深色**，未到的才是浅色
	  （参考页第 2 步那一屏里 ① 与 ② 都是深钢蓝、只有 ③ 是浅灰）。分档只在这一处算，调用点不传颜色。

	  几何口径见 M57（2026-10-27 用户点名「向右的箭头要与 icon+文字 垂直方向居中对齐」）：
	  容器 `align-items: center` + 分隔三角**自身不写 height**，三角就落在「图标行 + 间距 + 文字行」
	  整组的中线上（20 + 8 + 20 = 48，中线 24）；写死三角 20px 再配 flex-start 会让它只与图标行齐顶。
	-->
	<view class="sf-steps" :style="{ background: bgColor }">
		<view class="sf-step" :class="{ 'sf-step--active': isDone(1) }">
			<tz-icon name="dingdan" :size="20" :color="isDone(1) ? '#0B4C8A' : '#8AA9C7'" />
			<text class="sf-step-text">1. 购买礼物</text>
		</view>
		<view class="sf-step-sep"></view>
		<view class="sf-step" :class="{ 'sf-step--active': isDone(2) }">
			<tz-icon name="lipin" :size="20" :color="isDone(2) ? '#0B4C8A' : '#8AA9C7'" />
			<text class="sf-step-text">2. 赠送好友</text>
		</view>
		<view class="sf-step-sep"></view>
		<view class="sf-step" :class="{ 'sf-step--active': isDone(3) }">
			<tz-icon name="gouwu" :size="20" :color="isDone(3) ? '#0B4C8A' : '#8AA9C7'" />
			<text class="sf-step-text">3. 好友收礼</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TzSfSteps',
	props: {
		// 当前进行到第几步（1/2/3）：≤ active 的步骤都算「已到」，其余是未到
		active: {
			type: Number,
			default: 1
		},
		// 底色：默认白（下单页那一档）；送礼页不铺底色，传 `transparent` 让页面底色（全站默认 #f7f8fa）透上来
		// （2026-10-28 用户点名「去掉上面 step 的白色背景」）。只换底色，几何与配色档不动。
		bgColor: {
			type: String,
			default: '#fff'
		}
	},
	methods: {
		/** 第 index 步是否已经走到（含当前这一步） */
		isDone(index) {
			return Number(index) <= Number(this.active || 1);
		}
	}
};
</script>

<style>
/* 白底通栏、三格等分；色值：已到 #0B4C8A / 未到 #8AA9C7 / 三角 #004C8B
   （送好友下单页 2026-10-27 逐值定的那一档，两个宿主页共用同一份） */
.sf-steps {
	display: flex;
	align-items: center;
	padding: 20px 0 16px;
	box-sizing: border-box;
}

.sf-step {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.sf-step-text {
	margin-top: 8px;
	font-size: 14px;
	line-height: 20px;
	color: #8AA9C7;
	white-space: nowrap;
}

.sf-step--active .sf-step-text {
	color: #123C6B;
	font-weight: 500;
}

/* 三角自身不写 height：写死 20px 就把它钉在图标那一行的高度上（M57） */
.sf-step-sep {
	flex: none;
	width: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sf-step-sep::after {
	content: '';
	width: 0;
	height: 0;
	border-left: 5px solid #004C8B;
	border-top: 4px solid transparent;
	border-bottom: 4px solid transparent;
}
</style>
