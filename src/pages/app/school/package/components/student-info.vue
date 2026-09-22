<template>
	<view class="student-info">
		<!-- 头像（含空头像/图片加载失败）统一走 u-avatar，与学生编辑页同一组件同一默认图，不再用姓名首字占位 -->
		<u-avatar class="student-avatar" :src="student.avatar" :size="36" mode="aspectFill" />
		<view class="student-info-main">
			<view class="student-name">{{ student.name }}</view>
			<view class="student-classes" v-if="showClass && student.class_names">
				<text class="student-class-tag" v-for="(name, i) in classList" :key="i">{{ name }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'StudentInfo',
	props: {
		// 学生对象（{ name, avatar, class_names }）：班级以「、」分隔，展示为标签
		student: {
			type: Object,
			default: () => ({})
		},
		// 是否展示班级标签：选择上课学生弹窗列表不展示
		showClass: {
			type: Boolean,
			default: true
		}
	},
	computed: {
		classList() {
			return (this.student.class_names || '').split('、').filter((name) => name);
		}
	}
};
</script>

<style scoped>
/* 学生信息行（头像 + 姓名 + 班级标签）：选择上课学生弹层列表与确认报名页共用 */
.student-info {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
}

/* 头像盒只留布局（尺寸/不压缩/与文字间距），圆形与默认图由 u-avatar 自己出 */
.student-avatar {
	width: 36px;
	height: 36px;
	flex-shrink: 0;
	margin-right: 12px;
}

.student-info-main {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 0;
}

.student-name {
	font-size: 14px;
	color: #1d2129;
}

.student-classes {
	margin-top: 4px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: clip;
	line-height: 18px;
}

.student-class-tag {
	display: inline-block;
	max-width: 100%;
	box-sizing: border-box;
	padding: 1px 6px;
	margin-right: 6px;
	border-radius: 3px;
	font-size: 11px;
	line-height: 16px;
	color: #0968f6;
	background: #e8f4ff;
	vertical-align: top;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>