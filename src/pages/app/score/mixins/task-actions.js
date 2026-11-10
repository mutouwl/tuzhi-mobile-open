/**
 * 积分任务动作（积分中心首页与「全部任务」页共用）
 *
 * 领取走逐笔顺序请求（后端一次只认一条记录），失败由请求层统一 toast；
 * 完成/失败都把最新余额与任务状态拉回来。页面需实现 refreshAfterTask()。
 */
const TASK_ROUTES = {
	sign: '/pages/app/sign/center/center',
	bind_mobile: '/pages/user/changemobile/changemobile',
	profile: '/pages/user/index/index',
	study_time: '/pages/user/study/study',
	study_course: '/pages/app/score/course/course',
	checkin: '/pages/app/score/checkin/checkin',
	exam: '/pages/app/test/index/index',
	// 消费发放类（基础规则 + 自定义活动）的落点是店铺首页去挑商品消费；
	// 首页是全站根页（底部导航自绘、切换走 redirectTo），按既有写法只走 reLaunch
	consume: '/pages/index/index',
	consume_activity: '/pages/index/index',
};

/** 落点是店铺首页的任务（栈里不留本页，一律 reLaunch） */
const RELAUNCH_KEYS = ['consume', 'consume_activity'];

export default {
	data() {
		return {
			// 领取进行中：逐笔顺序请求期间忽略重复点击（后端按记录 status 也会挡，
			// 这里只避免连点打出重复请求与一串「已领取」报错）
			taskClaiming: false,
		};
	},
	methods: {
		claimTask(task) {
			if (this.taskClaiming) {
				return;
			}
			const ids = (task.pending_ids || []).slice();
			if (!ids.length) {
				return;
			}
			this.taskClaiming = true;
			const finish = () => {
				this.taskClaiming = false;
				if (typeof this.refreshAfterTask === 'function') {
					this.refreshAfterTask();
				}
			};
			const run = (index, total) => {
				if (index >= ids.length) {
					if (total > 0) {
						uni.showToast({ title: '领取成功，+' + total + '积分', icon: 'none' });
					}
					finish();
					return;
				}
				this.$api('app.score.claim', { log_id: ids[index] }).then((res) => {
					const score = res.code === 1 && res.data ? Number(res.data.score) || 0 : 0;
					run(index + 1, total + score);
				}).catch(() => {
					finish();
				});
			};
			run(0, 0);
		},
		goTask(task) {
			// 购买商品任务范围为「指定商品」时，去逛的是那批商品的清单页，不是店铺首页
			// （范围 key 与件数由后端 consume 明细下发，端上不另判）
			const consume = task.consume || {};
			if ((task.key === 'consume' || task.key === 'consume_activity') && consume.scope === 'assign') {
				let path = '/pages/app/score/consume/consume?source=base';
				if (consume.source === 'activity') {
					path = '/pages/app/score/consume/consume?source=activity&activity_id=' + (Number(consume.activity_id) || 0);
				}
				this.$nav.to(path, 'local', 'navigateTo');
				return;
			}
			const path = TASK_ROUTES[task.key];
			if (!path) {
				return;
			}
			// 落点是 tabBar 页时只能用 reLaunch（navigateTo 到 tab 页直接失败，点击像没反应）
			this.$nav.to(path, 'local', RELAUNCH_KEYS.indexOf(task.key) >= 0 ? 'reLaunch' : 'navigateTo');
		},
	},
};
