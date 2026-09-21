<template>
	<!--
		教务-老师卡片（模块共用）
		左侧正方形头像（无头像/加载失败走蓝底首字占位）+ 右侧姓名（两行截断）/ 简介（两行截断）。
		使用方：套餐详情「教师」区与教师列表弹窗、校区详情「教师」区与教师列表弹窗、DIY 自定义页面老师组件。
	-->
	<view class="tz-school-teacher" v-if="list && list.length">
		<view
			class="tz-school-teacher-item"
			:class="{ 'tz-school-teacher-item-square': !round }"
			:style="index ? { marginTop: margin + 'px' } : null"
			v-for="(t, index) in list"
			:key="t.id"
			@tap="onTap(t)"
		>
			<view class="tz-school-teacher-cover">
				<image
					class="tz-school-teacher-avatar"
					:src="t.avatar"
					mode="aspectFill"
					v-if="t.avatar && !avatarErrors[t.id]"
					@error="onAvatarError(t)"
				/>
				<view class="tz-school-teacher-placeholder" v-else>{{ (t.name || '?').slice(0, 1) }}</view>
			</view>
			<view class="tz-school-teacher-info">
				<view class="tz-school-teacher-name">{{ t.name }}</view>
				<view class="tz-school-teacher-intro" v-if="t.intro">{{ t.intro }}</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TzSchoolTeacher',
	props: {
		// 老师列表（字段：id / name / avatar / intro）
		list: {
			type: Array,
			default: () => []
		},
		// 卡片圆角（1 显示 10px 圆角、0 直角）
		round: {
			type: [Boolean, Number],
			default: 1
		},
		// 相邻卡片间距（首张无上间距、末张无下间距）
		margin: {
			type: Number,
			default: 10
		},
		// 点击是否进入教师详情；弹窗等不需要跳转的场景传 false
		navigate: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			// 头像加载失败记录（按老师 id 记录，失败后走首字占位）
			avatarErrors: {}
		};
	},
	methods: {
		onAvatarError(t) {
			this.$set(this.avatarErrors, t.id, true);
		},
		onTap(t) {
			this.$emit('click', t);
			if (this.navigate && t && t.id) {
				this.$nav.to('/pages/app/school/teacher/detail/detail?id=' + t.id);
			}
		}
	}
};
</script>

<style scoped>
.tz-school-teacher {
	width: 100%;
}

/* 卡片：浅灰底 + 右侧白色信息区（与校区卡片同族，模块内教师区统一版式） */
.tz-school-teacher-item {
	display: flex;
	border-radius: 10px;
	overflow: hidden;
	background: #f7f8fa;
}

.tz-school-teacher-item-square {
	border-radius: 0;
}

.tz-school-teacher-cover {
	width: 72px;
	height: 72px;
	flex-shrink: 0;
	position: relative;
	overflow: hidden;
	background: #f2f3f5;
}

.tz-school-teacher-avatar {
	width: 100%;
	height: 100%;
}

/* 无头像 / 加载失败占位（蓝底首字） */
.tz-school-teacher-placeholder {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #0968f6;
	color: #fff;
	font-size: 20px;
}

.tz-school-teacher-info {
	flex: 1;
	min-width: 0;
	padding: 8px;
	background: #fff;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.tz-school-teacher-name {
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

.tz-school-teacher-intro {
	margin-top: 4px;
	font-size: 12px;
	color: #86909c;
	line-height: 17px;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}
</style>
