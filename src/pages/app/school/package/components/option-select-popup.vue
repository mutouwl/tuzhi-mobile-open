<template>
	<u-popup
		:show="show"
		mode="bottom"
		:round="10"
		:closeable="true"
		:safeAreaInsetBottom="false"
		:zIndex="zIndex"
		:overlayStyle="overlayStyle"
		@close="close"
	>
		<view class="option-popup">
			<view class="option-popup-title">{{ title }}</view>
			<tz-popup-list height="46vh" padding="0 16px" :refreshable="false">
				<view
					class="option-item"
					v-for="o in list"
					:key="o.id"
					@tap="pickOption(o)"
				>
					<view class="option-info">
						<view class="option-name" :class="{ 'option-name-active': value == o.id }">{{ o.name }}</view>
						<view class="option-desc" v-if="o.desc">{{ o.desc }}</view>
					</view>
					<view class="radio" :class="{ on: value == o.id }" />
				</view>
				<u-empty
					v-if="!list.length"
					icon="/static/image/empty.png"
					width="70"
					height="70"
					:text="emptyText"
				/>
			</tz-popup-list>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'OptionSelectPopup',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		// 弹层标题，如「选择课程」
		title: {
			type: String,
			default: '请选择'
		},
		// 选项列表：[{ id, name, desc? }]
		list: {
			type: Array,
			default: () => []
		},
		// 当前选中项 id
		value: {
			type: [Number, String],
			default: 0
		},
		// 空列表提示文案
		emptyText: {
			type: String,
			default: '暂无可选项'
		},
		// 弹层层级（u-popup 默认 10075）。嵌套在其它底部弹层内部打开时必须传更高值，
		// 否则与下层弹层同级、能否盖住取决于 DOM 顺序
		zIndex: {
			type: [Number, String],
			default: 10075
		},
		// 遮罩自定义样式（同上，嵌套时随 zIndex 一并抬高；默认沿用 u-overlay 自身层级）
		overlayStyle: {
			type: [Object, String],
			default: null
		}
	},
	methods: {
		pickOption(o) {
			this.$emit('input', o.id);
			this.$emit('select', o);
			this.close();
		},
		close() {
			this.$emit('close');
		}
	}
};
</script>

<style scoped>
.option-popup {
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	/* 底部安全区改由弹层自身承担（模板已关 u-popup 的 safeAreaInsetBottom），微信端按教务口径减半 */
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}

.option-popup-title {
	padding: 15px 16px 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}

.option-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 48px;
	box-sizing: border-box;
	padding: 10px 0;
}

/* 分隔线用相邻兄弟上边框实现：最后一个成员不显示边框 */
.option-item + .option-item {
	border-top: 1px solid #f2f3f5;
}

.option-info {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 0;
}

.option-name {
	font-size: 14px;
	color: #1d2129;
}

.option-name-active {
	color: #0968f6;
}

.option-desc {
	margin-top: 2px;
	font-size: 12px;
	color: #86909c;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.radio {
	width: 18px;
	height: 18px;
	flex-shrink: 0;
	border: 2px solid #c9cdd4;
	border-radius: 50%;
	box-sizing: border-box;
}

.radio.on {
	border-color: #0968f6;
	background: #0968f6;
	box-shadow: inset 0 0 0 4px #fff;
}
</style>
