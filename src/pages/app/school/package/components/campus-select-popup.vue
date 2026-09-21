<template>
	<u-popup :show="show" mode="bottom" :round="10" :closeable="true" :safeAreaInsetBottom="false" @close="close">
		<view class="campus-popup">
			<view class="campus-popup-title">选择校区</view>
			<tz-popup-list padding="0 16px 12px" :refreshable="false">
				<!-- 校区卡与校区列表页同款（共用组件 tz-campus），仅在右侧多一个单选框；图标/封面尺寸同样走校区列表页口径 -->
				<tz-campus :list="list" selectable :value="value" @click="pickCampus" />
				<u-empty
					v-if="!list.length"
					icon="/static/image/empty.png"
					width="70"
					height="70"
					text="暂无可选校区"
				/>
			</tz-popup-list>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'CampusSelectPopup',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		// 校区列表
		list: {
			type: Array,
			default: () => []
		},
		// 当前选中校区 id
		value: {
			type: [Number, String],
			default: 0
		}
	},
	methods: {
		pickCampus(c) {
			this.$emit('input', c.id);
			this.$emit('select', c);
			this.close();
		},
		close() {
			this.$emit('close');
		}
	}
};
</script>

<style scoped>
.campus-popup {
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

.campus-popup-title {
	padding: 15px 16px 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}
</style>
