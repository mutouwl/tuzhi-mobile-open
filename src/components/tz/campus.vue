<template>
	<view class="tz-campus-list">
		<view
			class="tz-campus-item"
			:class="{ active: selectable && value == c.id, 'tz-campus-item-square': !round, 'tz-campus-item-flat': !isCampus(c) }"
			:style="index ? 'margin-top:' + margin + 'px;' : ''"
			v-for="(c, index) in list"
			:key="c.id"
			@tap="onTap(c)"
		>
			<!-- 封面：模糊衬底 + 等比主图（LOGO 非横图也不留生硬留白，对齐套餐封面处理）；
			     聚合项（选择弹窗的「全部校区」id=0）没有校区实体，不渲染封面（同 tz-school-course） -->
			<view class="tz-campus-cover" v-if="isCampus(c)" :class="{ square: coverSquare }" :style="coverStyle">
				<template v-if="c.logo && !coverErrors[c.id]">
					<image class="tz-campus-back" :src="c.logo" mode="aspectFill" @error="onCoverError(c)" />
					<image class="tz-campus-front" :src="c.logo" mode="aspectFit" @error="onCoverError(c)" />
				</template>
				<view class="tz-campus-placeholder" v-else>
					<tz-icon name="picture" :size="40" color="#C9CDD4" />
				</view>
				<view class="tz-campus-badge" v-if="badgeText"><text>{{ badgeText }}</text></view>
			</view>
			<!-- 信息区：名称两行截断 + 营业时间/地址（同为内容行、同色）单行截断，纵向铺开填满卡片高度 -->
			<view class="tz-campus-info">
				<view class="tz-campus-name">{{ c.name }}</view>
				<view class="tz-campus-line tz-campus-hours" v-if="c.business_hours">
					<view class="tz-campus-ic"><tz-icon name="time" :size="12" color="#4E5969" /></view>
					<text class="tz-campus-txt">营业时间 {{ c.business_hours }}</text>
				</view>
				<view class="tz-campus-line tz-campus-addr" v-if="c.address">
					<view class="tz-campus-ic"><tz-icon name="coordinates" :size="12" color="#4E5969" /></view>
					<text class="tz-campus-txt">{{ c.address }}</text>
				</view>
			</view>
			<!-- 单选标识：仅选择场景（selectable）展示，选中态与模块其余选择弹窗同款 -->
			<view class="tz-campus-radio" :class="{ on: value == c.id }" v-if="selectable" />
		</view>
	</view>
</template>

<script>
export default {
	name: 'TzCampus',
	props: {
		// 校区列表：[{ id, name, logo, address, business_hours }]
		list: {
			type: Array,
			default: () => []
		},
		// 封面边长（固定正方形；校区列表页 93px、套餐详情 140px）
		coverSize: {
			type: String,
			default: '93px'
		},
		// 封面按卡片高度自适应正方形（高度由右侧信息决定，如教师详情「所属校区」），
		// 开启时 coverSize 作为最小宽度兜底（不支持 aspect-ratio 时宽度不塌陷）
		coverSquare: {
			type: Boolean,
			default: false
		},
		// 封面右下角角标文案（传空字符串隐藏角标）
		badgeText: {
			type: String,
			default: '校区'
		},
		// 选择场景：卡片右侧展示单选框（如选择校区弹窗）
		selectable: {
			type: Boolean,
			default: false
		},
		// 选中项 id（selectable 时生效）
		value: {
			type: [Number, String],
			default: 0
		},
		// 卡片圆角（1 显示 10px 圆角、0 直角）；默认与校区列表页一致
		round: {
			type: [Boolean, Number],
			default: 1
		},
		// 相邻卡片间距（首张无上间距、末张无下间距）；默认与校区列表页一致
		margin: {
			type: Number,
			default: 10
		}
	},
	data() {
		return {
			// 封面加载失败记录（按校区 id 记录，失败后走图片占位）
			coverErrors: {}
		};
	},
	computed: {
		// 自适应模式只给最小宽度（高度随卡片），固定模式宽高同值。
		// 必须拼成 CSS 字符串：小程序端 :style 绑「返回对象的 computed」不走 __get_style 序列化，
		// WXML 里渲染成 [object Object] ⇒ 封面拿不到宽高整块塌陷（校区列表/详情、套餐详情、教师详情、
		// 选择校区弹窗一起中招），H5 用真 Vue 的 normalizeStyle 故照常生效，症状即只有小程序没封面
		coverStyle() {
			return this.coverSquare
				? `min-width:${this.coverSize};`
				: `width:${this.coverSize};height:${this.coverSize};`;
		}
	},
	methods: {
		// 真实校区才有封面；聚合项（id=0）只有名称
		isCampus(c) {
			return parseInt(c.id, 10) > 0;
		},
		onCoverError(c) {
			this.$set(this.coverErrors, c.id, true);
		},
		onTap(c) {
			this.$emit('click', c);
		}
	}
};
</script>

<style scoped>
/* 卡片：左正方形封面 + 右信息区（封面高度随信息内容自适应，同校区列表页卡片） */
.tz-campus-item {
	display: flex;
	min-height: 88px;
	background: #fff;
	border-radius: 10px;
	overflow: hidden;
}

/* 卡片间距用相邻兄弟上外边距：首张无上间距、末张无下间距（详情页内嵌区块也适用）；
   装修组件等需要自定义间距的场景由 round/margin 入参覆盖为行内样式 */
.tz-campus-item + .tz-campus-item {
	margin-top: 10px;
}

/* 直角模式（装修组件「圆角」隐藏时） */
.tz-campus-item-square {
	border-radius: 0;
}

.tz-campus-cover {
	flex-shrink: 0;
	position: relative;
	overflow: hidden;
	background: #f2f3f5;
}

/* 自适应正方形封面：宽度随卡片高度（height 不设，由 flex 拉伸） */
.tz-campus-cover.square {
	aspect-ratio: 1;
}

.tz-campus-back {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	filter: blur(12px);
	transform: scale(1.5);
}

.tz-campus-front {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

/* 无 LOGO / 加载失败占位（同套餐封面） */
.tz-campus-placeholder {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f2f3f5;
}

/* 封面右下角角标（对齐套餐封面「课程套餐」角标） */
.tz-campus-badge {
	position: absolute;
	bottom: 4px;
	right: 4px;
	height: 20px;
	border-radius: 4px;
	padding: 0 3px;
	box-sizing: border-box;
	line-height: 18px;
	background: rgba(0, 0, 0, 0.25);
	-webkit-backdrop-filter: blur(10px);
	backdrop-filter: blur(10px);
}

.tz-campus-badge text {
	color: #fff;
	font-weight: 500;
	font-size: 12px;
}

/* 信息区纵向铺开：卡片高度由封面撑开（列表页 93px），三行原本全挤在上半部、底下空一块，
   改为名称贴顶、末行贴底、中间等分剩余空间；内容已铺满（名称占两行）时无空闲可分，等同原样。
   不用 space-evenly：iOS 15.4 以下 WKWebView 不支持该取值，会静默退回顶端对齐（问题照旧） */
.tz-campus-info {
	flex: 1;
	min-width: 0;
	padding: 8px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

/* 聚合项（「全部校区」）只剩名称一行：不再跟校区卡等高（88px），收成模块内纯文字行的 48px 档，
   与「选择课程」弹窗的聚合行同一口径 */
.tz-campus-item-flat {
	min-height: 48px;
}

/* 名称改为垂直居中（默认 space-between 会把唯一一行文字顶到卡片上沿） */
.tz-campus-item-flat .tz-campus-info {
	justify-content: center;
}

/* 名称两行截断（对齐套餐单列标题） */
.tz-campus-name {
	font-size: 14px;
	font-weight: 600;
	color: #1d2129;
	line-height: 20px;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
}

/* 选中项名称转主色（与模块其余选择弹窗的选中口径一致） */
.tz-campus-item.active .tz-campus-name {
	color: #0968f6;
}

.tz-campus-line {
	display: flex;
	align-items: center;
	margin-top: 4px;
	font-size: 12px;
	line-height: 17px;
}

/* 营业时间与地址同为卡片内容行，统一取模块的取值色 #4e5969（不再一深一浅），行首图标同色 */
.tz-campus-addr,
.tz-campus-hours {
	color: #4e5969;
}

/* 行内图标槽不参与截断，文本占满剩余宽度单行省略；槽高固定为文字行高（= .tz-campus-line 的
   line-height 17px），图标字形在槽内垂直居中，槽与文字行盒同轴 */
.tz-campus-ic {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 17px;
	margin-right: 3px;
	/* 光学垂直居中：iconfont 的 (asc-desc)/2 与字形墨迹中心几乎相等（0.375em），
	   故图标墨迹中心恒等于其行盒中心；而中文/数字的墨迹中心比行盒中心低约 0.4~0.5px
	   （12px/17px 实测：营业时间 +0.47、地址 +0.39、数字 +0.21），
	   两者相减图标看着偏上、上下留白不对称。整体下沉 0.5px 后图标墨迹中心与文字墨迹中心重合，
	   上下留白对称（对齐不依赖具体字体度量，跨端/跨字体一致） */
	transform: translateY(0.5px);
}

.tz-campus-txt {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* 右侧单选框：垂直居中在卡片右侧 */
.tz-campus-radio {
	flex-shrink: 0;
	align-self: center;
	margin: 0 12px 0 8px;
	width: 18px;
	height: 18px;
	border: 2px solid #c9cdd4;
	border-radius: 50%;
	box-sizing: border-box;
}

.tz-campus-radio.on {
	border-color: #0968f6;
	background: #0968f6;
	box-shadow: inset 0 0 0 4px #fff;
}
</style>
