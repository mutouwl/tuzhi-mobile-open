<template>
	<!--
	  规格 / 档位弹层的**外壳**（2026-10-30 用户点名，抽成共用组件）

	  用户原话：「这个专栏本身它是一个单规格的商品，但是如果选择阶梯拼团之后，它会弹出一个多规格的
	  弹窗，并且这个弹窗跟上面这些多规格的商品，它弹窗是不一样的，所以说你样式要统一一下，
	  最好能够做到复用。你比如它的背景色、Tag，或者说按钮颜色等等，都是有区别的，这要统一一下，
	  以这个多商品、多规格商品的规格弹窗样式为准。」

	  四只弹层（实物 `pages/app/physical/components/sku-select-modal.vue`、组合
	  `pages/app/composite/components/spec-select-modal.vue`、圈子 `components/tz/circle-spec-popup.vue`、
	  拼团档位 `components/tz/group-buy-config-popup.vue`）的头区与底部确认按钮**逐值同形**，
	  所以收成这一只：面板（白底 / 12px 上圆角 / 内容自适应 + 下限）＋ 头区（封面 / 「拼团专享」标 /
	  「拼团」标 / 价格 / 划线原价 / N人团 / 第三行文案）＋ 底部确认按钮（46px / 4px 圆角 /
	  蓝底 / 拼团态红橙渐变 / 禁用灰）。

	  **正文仍是各宿主自己的**（规格树 / 内含商品 / 套餐权益 / 校区 / 购买数量 / 阶梯档位）——
	  那是各商品才有的东西，外壳不认商品大类（硬约束 11：同一件事只实现一处）。

	  ⚠ 教务套餐 `package-sku-select-modal` 暂不接：它是**定高 80vh** 的另一档（切换套餐时高度不跳），
	  与本壳「内容自适应 + 下限」不是同一套几何；配色仍与这四只同值（M76），别把定高那档塞进来。

	  props 全是有值给值的档：`cover` 空串 = 商品没配封面（落全站默认商品图，与取图失败同一档），
	  `origin-price` 空串 = 不摆划线原价，`sub-text` 空串 = 不摆第三行。确认按钮的**文案与禁用判据
	  仍在各宿主身上**（售罄 / 限购用尽 / 参团中三种禁用理由各商品不一样），外壳只负责画成同一档。

	  ⚠ 封面**不许再用「`cover === null` ⇒ 不摆这一格」那套判法**（2026-10-31 用户实报，微信小程序）：
	  `null` 经小程序组件的属性通道进来已经不是 `null`（`cover!==null` 恒真），于是这一格照渲染、
	  `src` 却是空的 ⇒ 弹窗左上角只剩一块 90px 的浅灰底，`@error` 也不会为「空地址」发一次回调
	  （默认图补不上），用户读出来就是「商品图片没加载、也没有默认填充，只有灰底」。
	  口径：**这一格恒在，地址拿不到就落 `coverFallback`**（M65 的默认商品图同一张），
	  「没配图」与「取图失败」在弹层头区这一格不再分两档（M65③ 的空态灰块是**列表**那一档的口径）。
	-->
	<u-popup :show="show" mode="bottom" :round="12" :safe-area-inset-bottom="safeArea" :closeable="closeable" @close="onClose">
		<view class="sps" :class="{ 'sps--flex': flexPanel }" :style="panelStyle">
			<view class="sps-head" :class="{ 'sps-head--gb': gbMode }">
				<image class="sps-cover" :src="coverSrc" mode="aspectFill" @error="onCoverError" @tap="onCoverTap" />
				<view class="sps-main">
					<view class="gb-badge" v-if="gbMode">{{ badgeText }}</view>
					<view class="sps-price" v-if="gbMode">
						<text class="gb-tag" v-if="tagText">{{ tagText }}</text>
						<text class="sps-symbol">¥</text>
						<text class="sps-num">{{ gbPrice }}</text>
						<text class="sps-origin" v-if="originPrice !== ''">¥{{ originPrice }}</text>
						<text class="gb-team" v-if="teamText">{{ teamText }}</text>
					</view>
					<view class="sps-price" v-else>
						<template v-if="!isVirtualPay">
							<text class="sps-symbol">¥</text>
							<text class="sps-num">{{ price }}</text>
							<text class="sps-marking" v-if="markingPrice !== ''">¥{{ markingPrice }}</text>
						</template>
						<template v-else>
							<text class="sps-num">{{ price }}</text>
							<text class="sps-coin">{{ coinName }}</text>
						</template>
					</view>
					<text class="sps-sub" v-if="subText">{{ subText }}</text>
					<slot name="sub"></slot>
				</view>
			</view>
			<scroll-view v-if="bodyScroll" class="sps-body" :style="bodyStyle" scroll-y><slot></slot></scroll-view>
			<view v-else class="sps-body" :style="bodyStyle"><slot></slot></view>
			<view class="sps-gap" v-if="fill"></view>
			<view class="sps-foot">
				<view class="sps-confirm" :class="{ 'sps-confirm--gb': gbMode && !confirmDisabled, 'sps-confirm--off': confirmDisabled }" @tap="onConfirm">{{ confirmText }}</view>
			</view>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'SpecPopupShell',
	props: {
		/** 弹层显隐（宿主自己的 show；外壳不持有状态） */
		show: { type: Boolean, default: false },
		/** 拼团态：标题区浅暖红渐隐底 + 「拼团专享」标 + 红橙渐变按钮（与商详「立即开团」同一条渐变） */
		gbMode: { type: Boolean, default: false },
		/**
		 * 封面地址（各商品自己的 `cover` / 规格图）。
		 * **空串 = 没配封面** ⇒ 落 `coverFallback`（全站默认商品图），不再画灰底空格：
		 * 小程序端 `null` 过属性通道会被转成空串（见文件头 2026-10-31 那条），
		 * 「不摆封面」这个语义在这里没有第二档，四只弹层一律有这一格。
		 */
		cover: { type: String, default: '' },
		/** 取图失败落全站默认商品图（M65：规格弹窗封面同一张） */
		coverFallback: { type: String, default: '/static/image/default-goods.jpg' },
		/** 普通态价格 */
		price: { type: [String, Number], default: '' },
		/** 拼团态价格 */
		gbPrice: { type: [String, Number], default: '' },
		/** 划线原价（拼团态那一行；空串 = 不摆） */
		originPrice: { type: [String, Number], default: '' },
		/** 普通态的划线价（圈子「续费」那一档；空串 = 不摆） */
		markingPrice: { type: [String, Number], default: '' },
		isVirtualPay: { type: Boolean, default: false },
		coinName: { type: String, default: '金币' },
		/** 「N人团」那一格（阶梯型写选中档人数；空串 = 不摆） */
		teamText: { type: String, default: '' },
		/** 「拼团」标文案（空串 = 不摆） */
		tagText: { type: String, default: '拼团' },
		/** 「拼团专享」标文案 */
		badgeText: { type: String, default: '拼团专享' },
		/** 头区第三行（「已选 X」这类；空串 = 不摆，需要多行时走 `#sub` 插槽） */
		subText: { type: String, default: '' },
		confirmText: { type: String, default: '确定' },
		confirmDisabled: { type: Boolean, default: false },
		/** 面板最低高度（circle 50vh / 拼团档位 450px；空串 = 内容自适应，不给下限） */
		minHeight: { type: String, default: '' },
		/** 面板最高高度（实物/组合/圈子 70vh；空串 = 不限） */
		maxHeight: { type: String, default: '' },
		/** 正文是否用 scroll-view（实物/组合：确定高度 + 内部滚动；圈子/档位：普通块） */
		bodyScroll: { type: Boolean, default: false },
		/** 正文样式串（各宿主自己的内衬 / 上限 / flex；写串不写对象，小程序端 WXML 只认串） */
		bodyStyle: { type: String, default: '' },
		/** 按钮前那枚收口占位块：面板有下限、正文又不吃 flex 时由它吸收剩余高度把按钮压到底 */
		fill: { type: Boolean, default: false },
		safeArea: { type: Boolean, default: true },
		closeable: { type: Boolean, default: true },
	},
	emits: ['close', 'confirm', 'cover'],
	data() {
		return {
			// 封面失败表（以地址作键：同一张图只换一次默认图，M65）
			coverFailed: '',
		};
	},
	computed: {
		/** 面板纵排只在「有下限 / 要收口」时才开：实物与组合那两只是内容自适应，不开 flex 几何不变 */
		flexPanel() {
			return !!this.minHeight || this.fill;
		},
		panelStyle() {
			const style = [];
			if (this.minHeight) { style.push('min-height: ' + this.minHeight); }
			if (this.maxHeight) { style.push('max-height: ' + this.maxHeight); }
			return style.join('; ');
		},
		/**
		 * 这一格实际取的图：**地址为空也落默认图**。
		 * 不这么写就只有「取图失败」才有回调（空 `src` 不触发 `@error`）——小程序端正好落进
		 * 「灰底、没图、也没默认填充」那一档（2026-10-31 用户实报）。
		 */
		coverSrc() {
			if (!this.cover) { return this.coverFallback; }
			return this.coverFailed === this.cover ? this.coverFallback : this.cover;
		},
	},
	watch: {
		cover() {
			// 换商品 / 换规格：上一张图的失败记录不能贴到新地址上
			this.coverFailed = '';
		},
	},
	methods: {
		onCoverError() {
			this.coverFailed = this.cover || '';
		},
		/** 点封面（组合商品那一只要预览这一档的规格图）；没接这一枚的宿主不响应 */
		onCoverTap() {
			this.$emit('cover');
		},
		onClose() {
			this.$emit('close');
		},
		onConfirm() {
			this.$emit('confirm');
		},
	},
};
</script>

<style scoped>
/* 面板：白底 + 12px 上圆角（弹层 `round` 同值，三处同一档：u-popup / 本容器 / 顶格）。
   有下限时才纵排（见 `flexPanel`），实物与组合那两只内容自适应的几何保持不变。 */
.sps {
	background: #fff;
	border-radius: 12px 12px 0 0;
}
.sps--flex {
	display: flex;
	flex-direction: column;
}
/* 顶格自带上圆角（2026-10-30 用户点名「拼团的规格选择弹窗要有上圆角」）：
   `border-radius` 只裁元素自己的背景、不裁子节点背景 ⇒ 拼团态那层浅暖红会把父级圆掉的两角
   重新涂成直角；顶格自己带同值圆角，任一处上底色都不会退回方角。 */
.sps-head {
	display: flex;
	flex-shrink: 0;
	padding: 20px 16px;
	border-bottom: 1px solid #F7F8FA;
	border-radius: 12px 12px 0 0;
}
/* 拼团态：标题区一层极浅暖红、渐隐到白（正文仍白底，选规格的对比度不变） */
.sps-head--gb {
	background: linear-gradient(180deg, #fff3ee 0%, #ffffff 100%);
	border-bottom-color: #ffece8;
}
.sps-cover {
	width: 90px;
	height: 90px;
	flex-shrink: 0;
	border-radius: 8px;
	background-color: #F7F8FA;
}
.sps-main {
	flex: 1;
	min-width: 0;
	margin-left: 12px;
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.sps-price {
	display: flex;
	align-items: baseline;
}
.sps-symbol {
	font-size: 12px;
	font-weight: 700;
	color: #F53F3F;
}
.sps-num {
	margin-left: 2px;
	font-size: 24px;
	font-weight: 700;
	color: #F53F3F;
}
.sps-origin,
.sps-marking {
	margin-left: 6px;
	font-size: 12px;
	color: #86909c;
	text-decoration: line-through;
}
.sps-coin {
	margin-left: 2px;
	font-size: 12px;
	font-weight: 500;
	color: #F53F3F;
}
.sps-sub {
	margin-top: 8px;
	font-size: 13px;
	color: #666;
}
/* 正文：默认内衬由各宿主用 `bodyStyle` 覆盖（实物 20/16、组合 16、圈子 flex:1、档位 20/16） */
.sps-body {
	padding: 20px 16px;
}
/* 收口间距：吃掉下限之下的剩余高度把「确定」压到底；内容撑满时仍保底 20px
   （不写 `margin-top:auto`：内容一过下限 auto 归零，按钮会贴住最后一节） */
.sps-gap {
	flex: 1 0 20px;
}
.sps-foot {
	flex-shrink: 0;
	padding: 16px;
	border-top: 1px solid #F7F8FA;
}
/* 确认按钮：46px / 4px 圆角（M21 小元素档，与弹层里的 chips 同一档；禁胶囊）
   普通蓝 / 拼团态红橙渐变 / 禁用灰三档，色值与商详按钮、`gb-ladder-picker` 同源 */
.sps-confirm {
	width: 100%;
	height: 46px;
	line-height: 46px;
	text-align: center;
	background: #0968f6;
	color: #fff;
	font-size: 16px;
	font-weight: 500;
	border-radius: 4px;
}
.sps-confirm--gb {
	background: linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%);
}
.sps-confirm--off {
	background: #c9cdd4;
}
/* 「拼团」标：浅红底 + 红字（与 group-buy-banner 同值） */
.gb-tag {
	align-self: center;
	margin-right: 6px;
	padding: 0 5px;
	border-radius: 3px;
	background: #ffece8;
	color: #f53f3f;
	font-size: 11px;
	line-height: 16px;
}
/* 「拼团专享」标：红橙渐变底 + 白字，与商详拼团按钮同一条渐变 */
.gb-badge {
	align-self: flex-start;
	margin-bottom: 4px;
	padding: 0 6px;
	border-radius: 3px;
	background: linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%);
	color: #fff;
	font-size: 10px;
	font-weight: 500;
	line-height: 17px;
	letter-spacing: .2px;
}
.gb-team {
	margin-left: 6px;
	font-size: 12px;
	color: #f53f3f;
}
</style>
