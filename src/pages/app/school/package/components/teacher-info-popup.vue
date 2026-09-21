<template>
	<u-popup :show="show" mode="bottom" :round="10" :closeable="true" :safeAreaInsetBottom="false" @close="close">
		<view class="teacher-popup">
			<view class="teacher-popup-title">授课老师</view>
			<tz-popup-list padding="4px 16px 8px" :refreshable="false">
				<view class="teacher-loading" v-if="loading"><u-loadmore status="loading" /></view>
				<template v-else>
					<!-- 整行可点进教师详情（简介/联系电话/授课课程/所属校区），行尾箭头提示可点 -->
					<view class="teacher-item" v-for="t in rows" :key="t.id" @click="goDetail(t)">
						<image class="teacher-avatar" :src="t.avatar" mode="aspectFill" v-if="t.avatar" />
						<view class="teacher-avatar placeholder" v-else>{{ (t.name || '?').slice(0, 1) }}</view>
						<view class="teacher-info">
							<view class="teacher-name-row">
								<text class="teacher-name">{{ t.name }}</text>
								<text class="teacher-role" :class="{ main: t.role == 1 }">{{ t.role == 1 ? '主讲' : '助教' }}</text>
							</view>
							<!-- 手机号按 3 4 4 格式展示（无号码时仅提示） -->
							<view class="teacher-phone" v-if="t.phone">{{ t.phone }}</view>
							<view class="teacher-phone" v-else>暂无联系电话</view>
							<!-- 简介原由 tz-teacher 卡片承载，改列表后收进弹窗，最多两行 -->
							<view class="teacher-intro" v-if="t.intro">{{ t.intro }}</view>
						</view>
						<tz-icon class="teacher-arrow" name="enter" color="#86909C" :size="13" />
					</view>
					<u-empty
						v-if="!rows.length"
						icon="/static/image/empty.png"
						width="70"
						height="70"
						text="老师信息不存在"
					/>
				</template>
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
		// 授课老师列表（来自课次 teachers：id/name/role/avatar/intro）
		teachers: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			// 弹层展示行：teachers 合并各自联系电话后的结果
			rows: [],
			loading: false
		};
	},
	watch: {
		// 打开时拉取各老师联系电话（列表接口不下发手机号，逐位走详情接口）
		show(val) {
			if (val) this.loadTeachers();
		}
	},
	methods: {
		loadTeachers() {
			// 无 id 的老师无法查详情，直接从展示行里剔除（避免出现查不到电话的空行）
			const list = (this.teachers || []).filter((t) => t && t.id);
			this.rows = [];
			if (!list.length) return;
			this.loading = true;
			Promise.all(list.map((t) => this.fetchPhone(t.id))).then((phones) => {
				this.rows = list.map((t, i) => ({ ...t, phone: phones[i] }));
				this.loading = false;
			});
		},
		// 单个老师查不到电话（网络异常/老师已删除）时按空号码处理，不阻断其余老师展示
		fetchPhone(teacherId) {
			return this.$api('school.user.teacherDetail', { teacher_id: teacherId }).then((ret) => {
				// 全局拦截器对 code=0 只 toast 不 reject，须校验业务码
				return ret && ret.code === 1 && ret.data ? this.$tools.formatPhone(ret.data.phone) : '';
			}).catch(() => '');
		},
		close() {
			this.$emit('close');
		},
		// 点某位老师进教师详情（与教师卡片 tz-school-teacher 同目标页、同参数口径）；
		// 弹层保持打开，返回后还能接着看另一位老师
		goDetail(t) {
			if (!t || !t.id) return;
			this.$nav.to('/pages/app/school/teacher/detail/detail?id=' + t.id);
		}
	}
};
</script>

<style scoped>
.teacher-popup {
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

.teacher-popup-title {
	padding: 15px 16px 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}

.teacher-loading {
	padding: 20px 0;
	display: flex;
	justify-content: center;
}

.teacher-item {
	display: flex;
	align-items: center;
	min-height: 72px;
	box-sizing: border-box;
	padding: 16px 0;
}

/* 分隔线用相邻兄弟上边框实现：最后一个成员不显示边框 */
.teacher-item + .teacher-item {
	border-top: 1px solid #f2f3f5;
}

.teacher-avatar {
	width: 36px;
	height: 36px;
	flex-shrink: 0;
	border-radius: 50%;
	background: #e5e6eb;
	margin-right: 12px;
}

.teacher-avatar.placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #0968f6;
	color: #fff;
	font-size: 16px;
}

.teacher-info {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 0;
}

.teacher-name-row {
	display: flex;
	align-items: center;
}

.teacher-name {
	font-size: 18.66px;
	color: #1d2129;
}

.teacher-role {
	flex-shrink: 0;
	margin-left: 8px;
	font-size: 12px;
	padding: 2px 8px;
	border-radius: 4px;
	color: #4e5969;
	background: #f2f3f5;
}

.teacher-role.main {
	color: #0968f6;
	background: #eef6ff;
}

.teacher-phone {
	margin-top: 4px;
	font-size: 12px;
	color: #86909c;
}

.teacher-intro {
	margin-top: 4px;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

/* 行尾箭头：提示整行可点进教师详情（与课次详情信息行箭头同色同尺寸） */
.teacher-arrow {
	flex-shrink: 0;
	margin-left: 8px;
}
</style>
