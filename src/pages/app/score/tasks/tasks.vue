<template>
	<view class="tasks-page">
		<view v-if="!loaded" class="tasks-skeleton">
			<view v-for="i in 4" :key="i" class="tasks-skeleton-row">
				<view class="tasks-skeleton-main">
					<u-skeleton :loading="true" :animate="true" :title="true" title-width="36%" title-height="15" :rows="1" :rows-width="['58%']" rows-height="12" />
				</view>
				<view class="tasks-skeleton-btn"></view>
			</view>
		</view>
		<u-empty v-else-if="tasks.length === 0" icon="/static/image/empty.png" width="70" height="70" text="暂无积分任务" />
		<template v-else>
			<view v-for="group in groups" :key="group.name" class="task-group">
				<view class="task-group-title">{{ group.name }}</view>
				<task-list :tasks="group.tasks" @claim="claimTask" @go="goTask" />
			</view>
		</template>
		<tz-footer />
	</view>
</template>

<script>
import taskList from '@/pages/app/score/components/task-list.vue';
import taskActions from '@/pages/app/score/mixins/task-actions.js';

export default {
	components: { taskList },
	mixins: [taskActions],
	data() {
		return {
			loaded: false,
			tasks: [],
		};
	},
	computed: {
		/**
		 * 按后端下发的 category 分段（签到/基础/学习/助学），段顺序沿用后端任务顺序，
		 * 前端不再自建 key→类别映射（枚举只留后端一处）
		 */
		groups() {
			const out = [];
			const index = {};
			(this.tasks || []).forEach((task) => {
				const name = task.category || '其他任务';
				if (!index[name]) {
					index[name] = { name, tasks: [] };
					out.push(index[name]);
				}
				index[name].tasks.push(task);
			});
			return out;
		},
	},
	onShow() {
		this.getTasks(this.loaded);
	},
	onPullDownRefresh() {
		this.getTasks(true);
	},
	methods: {
		getTasks(silent) {
			this.$api('app.score.tasks', {}).then((res) => {
				if (res.code === 1) {
					this.tasks = (res.data && res.data.tasks) || [];
				}
				this.loaded = true;
				uni.stopPullDownRefresh();
			}).catch(() => {
				this.loaded = true;
				uni.stopPullDownRefresh();
			});
		},
		refreshAfterTask() {
			this.getTasks(true);
		},
	},
};
</script>

<style scoped>
.tasks-page {
	min-height: 100vh;
	background: #fafafa;
}

.task-group {
	background: #fff;
}

/* 分组之间留出页面底色缝（10px，与积分中心首页 .score-block 同档）；
   第一组贴顶不留缝，只作用于后续分组 */
.task-group + .task-group {
	margin-top: 10px;
}

.task-group-title {
	padding: 14px 15px 6px;
	font-size: 13px;
	color: #86909c;
}

.tasks-skeleton-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 15px;
	background: #fff;
	border-bottom: 1px solid #f2f3f5;
}

.tasks-skeleton-main {
	flex: 1;
	padding-right: 20px;
}

.tasks-skeleton-btn {
	flex-shrink: 0;
	width: 64px;
	height: 28px;
	border-radius: 4px;
	background: #e5e6eb;
}
</style>
