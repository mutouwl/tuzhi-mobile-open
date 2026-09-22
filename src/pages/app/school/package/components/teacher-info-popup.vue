<template>
	<u-popup :show="show" mode="bottom" :round="10" :closeable="true" :safeAreaInsetBottom="false" @close="close">
		<view class="teacher-popup">
			<view class="teacher-popup-title">授课老师</view>
			<!-- 名单卡片与校区/套餐详情的教师列表共用 tz-school-teacher（方形头像 + 姓名两行截断 + 简介两行截断），
			     整卡可点进教师详情；本弹层多开一个身份标签（主讲/助教），身份只在这份名单里可见 -->
			<tz-popup-list padding="4px 0 8px" :refreshable="false">
				<tz-school-teacher :list="rows" :show-role="true" />
				<u-empty
					v-if="!rows.length"
					icon="/static/image/empty.png"
					width="70"
					height="70"
					text="老师信息不存在"
				/>
			</tz-popup-list>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'TeacherInfoPopup',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		// 授课老师列表（课次/预约接口 teachers：id/name/role/avatar/intro；1 主讲、2 助教）
		teachers: {
			type: Array,
			default: () => []
		}
	},
	computed: {
		// 展示行：剔除空条目（接口下发脏数据时不渲染空白卡）
		rows() {
			return (this.teachers || []).filter((t) => t);
		}
	},
	methods: {
		close() {
			this.$emit('close');
		}
	}
};
</script>

<style scoped>
/* 弹层内衬与标题口径对齐全局教务档 .school-popup / .school-popup-title
   （小程序自定义组件样式隔离，全局档进不来，故在本组件内自带一份），
   顶部圆角取教师列表弹窗原档 12px（与校区/套餐详情页一致） */
.teacher-popup {
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	padding: 0 16px 20px;
	padding-bottom: calc(20px + constant(safe-area-inset-bottom));
	padding-bottom: calc(20px + env(safe-area-inset-bottom));
	/*  #ifdef  MP-WEIXIN  */
	/* 微信端底部安全区按设计减半（与全局档 .school-popup 同口径） */
	padding-bottom: calc(20px + constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(20px + env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}

.teacher-popup-title {
	padding: 15px 0 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}
</style>
