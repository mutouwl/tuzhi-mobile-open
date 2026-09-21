<template>
	<view class="student-info">
		<image class="student-avatar" :src="student.avatar" mode="aspectFill" v-if="student.avatar" />
		<view class="student-avatar placeholder" v-else>{{ (student.name || '?').slice(0, 1) }}</view>
		<view class="student-info-main">
			<view class="student-name">{{ student.name }}</view>
			<view class="student-classes" v-if="student.class_names">
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

.student-avatar {
	width: 36px;
	height: 36px;
	flex-shrink: 0;
	border-radius: 50%;
	background: #e5e6eb;
	margin-right: 12px;
}

.student-avatar.placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #0968f6;
	color: #fff;
	font-size: 16px;
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