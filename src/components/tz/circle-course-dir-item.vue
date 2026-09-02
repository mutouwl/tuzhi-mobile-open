<template>
	<view v-if="course && course.id" :class="['course-box', { border: bordered, selected: course.id == courseId }]" @tap="jump(course.id)">
		<view class="course-data">
			<view :class="['course-name', 'one-line-hidden', { selected: course.id == courseId }]">
				{{ course.no }}. {{ course.name }}
			</view>
			<view class="course-info">
				<text class="course-meta">{{ $t(course.type) }}｜{{ $tools.timestamp(course.updatetime) }}｜{{ course.views }}次浏览</text>
				<view class="course-more">
					<tz-icon name="lock" color="#4E5969" :size="20" v-if="!subscription" />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'tz-circle-course-dir-item',
	props: {
		course: { type: Object, default: () => ({}) },
		courseId: { type: [String, Number], default: 0 },
		circleId: { type: [String, Number], default: 0 },
		subscription: { type: [Boolean, Number], default: false },
		bordered: { type: [Boolean, Number], default: false },
	},
	methods: {
		jump(courseId) {
			if (courseId == this.courseId) {
				uni.$u.toast('正在浏览该课程');
				return;
			}
			let path = '/pages/course/detail/detail?id=' + courseId;
			if (this.circleId) path += '&circle_id=' + this.circleId;
			this.$nav.to(path, 'local');
		},
	},
};
</script>

<style scoped>
.course-box { display: flex; align-items: center; justify-content: space-between; margin: 5px 0; padding: 15px; }
.course-box.selected { background-color: #e8f3ff; border-bottom: 0 !important; }
.course-box.border { border-bottom: 1px solid #efefef; }
.course-data { width: 100%; overflow: hidden; padding-bottom: 2px; }
.course-name { color: #333; font-size: 16px; }
.course-name.selected { color: #165dff; }
.course-info { display: flex; align-items: center; margin-top: 6px; }
.course-box.selected .course-info { background-color: transparent; }
.course-meta { flex: 1; min-width: 0; color: #86909c; font-size: 12px; }
.course-more { flex: none; }
</style>
