<template>
	<u-popup :show="show" mode="bottom" :round="10" :closeable="true" :safeAreaInsetBottom="false" @close="close">
		<view class="student-popup">
			<view class="student-popup-title">选择上课学生</view>
			<!-- 列表区高度取 tz-popup-list 默认的确定高度（60vh）：只有一两名学生时下方留白，
			     但整块都是可拖动/可下拉刷新的活动区，且弹层高度不随条数跳动 -->
			<tz-popup-list padding="4px 16px 8px" :refreshing="refreshing" @refresh="loadStudents(true)" @lower="loadStudents(false)">
				<!-- 加载中（尚无数据）：骨架屏占位，行结构与真实学生行一致（圆头像 + 姓名一行，列表不展示班级标签） -->
				<view class="student-skeleton" v-if="showSkeleton">
					<view class="student-skeleton-item" v-for="i in 3" :key="i">
						<u-skeleton
							:loading="true"
							:animate="true"
							:avatar="true"
							avatar-shape="circle"
							avatar-size="36"
							:title="true"
							title-width="40%"
							title-height="16"
							:rows="0"
						/>
					</view>
				</view>
				<view class="student-item" v-for="s in students" :key="s.id" @tap="pickStudent(s)">
					<view class="radio" :class="{ on: selectedId == s.id }" />
					<student-info class="student-item-info" :student="s" :show-class="false" />
					<view class="student-edit-btn" @tap.stop="goEdit(s)">编辑</view>
				</view>
				<view class="student-loadmore" v-if="students.length && loading"><u-loadmore status="loading" /></view>
				<!-- 空状态：仅在首屏列表加载结束后展示，请求返回前由骨架屏占位，避免闪现「暂无学生」 -->
				<u-empty
					v-if="showEmpty"
					icon="/static/image/empty.png"
					width="70"
					height="70"
					:text="studentLimit > 0 ? '暂无学生，点击下方新建学生' : '暂无学生'"
				/>
			</tz-popup-list>
			<!-- 空列表（含加载中）无可用确认操作，底部只保留添加学生入口；创建上限为 0 表示机构不允许学生自行创建，隐藏新建入口 -->
			<view class="student-popup-footer" v-if="studentLimit > 0 || students.length">
				<view class="footer-btns">
					<button v-if="studentLimit > 0" class="student-add-btn" :class="{ 'student-add-btn-full': !students.length }" @tap="goAdd">新建学生</button>
					<button v-if="students.length" class="student-confirm-btn" :class="{ 'student-confirm-disabled': !selectedId }" @tap="onConfirm">确认</button>
				</view>
			</view>
		</view>
	</u-popup>
</template>

<script>
import schoolStudent from '@/common/utils/school-student';
import StudentInfo from './student-info.vue';

export default {
	name: 'StudentSelectPopup',
	components: { StudentInfo },
	props: {
		show: {
			type: Boolean,
			default: false
		},
		// 页面当前已选学生 id：打开弹层时回显选中态
		studentId: {
			type: [Number, String],
			default: 0
		}
	},
	data() {
		return {
			students: [],
			loading: false,
			// 首屏列表是否已返回过一次（成功或失败）：用于区分「加载中」与「确无学生」
			loaded: false,
			page: 1,
			hasMore: false,
			refreshing: false,
			selectedId: 0,
			selectedName: '',
			studentTotal: 0,
			studentLimit: 5
		};
	},
	watch: {
		// 打开时拉取学生列表；有传入学生 id 则回显该学生，否则保留上次选择
		show(val) {
			if (val) {
				if (this.studentId) {
					this.selectedId = this.studentId;
					this.selectedName = '';
				}
				this.loadStudents(true);
			}
		}
	},
	computed: {
		// 加载中（还没有可展示的数据）：骨架屏；已有列表时刷新不覆盖内容
		showSkeleton() {
			return this.loading && !this.students.length;
		},
		// 空状态：首屏列表返回后仍无学生才展示，加载中不显示
		showEmpty() {
			return this.loaded && !this.loading && !this.students.length;
		}
	},
	mounted() {
		// 新建学生页保存成功后：刷新列表并自动选中新学生
		uni.$on('schoolStudentCreated', this.onStudentCreated);
	},
	beforeDestroy() {
		uni.$off('schoolStudentCreated', this.onStudentCreated);
	},
	methods: {
		onStudentCreated(stu) {
			if (stu && stu.id) {
				this.selectedId = stu.id;
				this.selectedName = stu.name || '';
			}
			this.loadStudents(true);
		},
		goAdd() {
			// 达到创建上限（教务设置）时不再进入新建页，弹窗说明
			if (!schoolStudent.canCreate(this.studentTotal, this.studentLimit)) {
				uni.showModal({ title: '提示', content: schoolStudent.createLimitMessage(this.studentLimit), showCancel: false });
				return;
			}
			uni.navigateTo({ url: '/pages/app/school/student/edit/edit' });
		},
		// 编辑学生：跳转成功后再收起弹层——先收起时若跳转没走成，用户看到的只是「选中该学生并关掉弹窗」
		// （返回重新打开时列表随 show 刷新）
		goEdit(s) {
			uni.navigateTo({
				url: '/pages/app/school/student/edit/edit?id=' + s.id,
				success: () => this.$emit('close')
			});
		},
		// 学生列表（分页：refresh 拉首页，否则加载下一页）
		loadStudents(refresh) {
			if (this.loading) return;
			if (!refresh && !this.hasMore) return;
			const page = refresh ? 1 : this.page + 1;
			this.loading = true;
			if (refresh) this.refreshing = true;
			this.$api('school.user.students', { page, limit: 20 }).then((ret) => {
				const list = (ret.data && ret.data.list) || [];
				this.students = refresh ? list : this.students.concat(list);
				this.page = page;
				this.hasMore = !!(ret.data && ret.data.has_more);
				// 打开弹层时带进来的选中学生可能已被机构删除：名单已全部返回却查不到这个学生，就丢掉失效选中态，
				// 否则不点任何一行直接确认会把已删除的学生再写回页面和缓存。
				// 还有下一页时不下结论——合法选中的学生可能排在后面的页里（如刚新建的学生 id 最大、按 id 升序落在末页）
				if (refresh && !this.hasMore && this.selectedId && !list.some((x) => x.id == this.selectedId)) this.selectedId = 0;
				// 名下学生总数 + 创建上限（0 表示不限制），供新建入口超限提示
				this.studentTotal = parseInt(ret.data && ret.data.total) || 0;
				const createLimit = parseInt(ret.data && ret.data.student_limit);
				this.studentLimit = isNaN(createLimit) ? 5 : createLimit;
				this.loaded = true;
				this.loading = false;
				this.refreshing = false;
			}).catch(() => {
				this.students = refresh ? [] : this.students;
				// 请求失败也结束加载态：展示空状态（不至于骨架屏常驻）
				this.loaded = true;
				this.loading = false;
				this.refreshing = false;
			});
		},
		pickStudent(s) {
			this.selectedId = s.id;
			this.selectedName = s.name;
		},
		onConfirm() {
			if (!this.selectedId) {
				uni.showToast({ title: '请选择上课学生', icon: 'none' });
				return;
			}
			// 优先回传列表中的完整学生对象（含头像等），页面可直接用于展示
			const stu = this.students.find((x) => x.id == this.selectedId) || { id: this.selectedId, name: this.selectedName };
			// 记住本次选择：其他页面打开时默认选中该学生
			schoolStudent.set(stu);
			this.$emit('confirm', stu);
			this.close();
		},
		close() {
			this.$emit('close');
		}
	}
};
</script>

<style scoped>
.student-popup {
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	/* 底部安全区统一挂在弹层根节点（模板已关 u-popup 的 safeAreaInsetBottom，
	   此前两处各补一份全量安全区、iPhone X 上底部空出 12px + 34px + 34px）；微信端按教务口径减半 */
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}

.student-popup-title {
	padding: 15px 16px 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}

.student-loadmore {
	padding: 8px 0 4px;
}

/* 加载态骨架屏：行高与真实学生行对齐（头像 + 姓名一行），列表高度不跳动 */
.student-skeleton-item {
	display: flex;
	align-items: center;
	min-height: 68px;
	box-sizing: border-box;
	padding: 16px 0;
}

.student-item {
	display: flex;
	align-items: center;
	min-height: 72px;
	box-sizing: border-box;
	padding: 16px 0;
}

/* 分隔线用相邻兄弟上边框实现：最后一个成员不显示边框 */
.student-item + .student-item {
	border-top: 1px solid #f2f3f5;
}

/* 学生信息是自定义组件：小程序端行内真实 flex 子项是它的宿主节点，
   组件内部 scoped 的 flex:1 只影响自身根节点（H5 有效），撑开剩余宽度的规则必须写在父侧标签上 */
.student-item-info {
	flex: 1;
	min-width: 0;
}

.radio {
	width: 18px;
	height: 18px;
	flex-shrink: 0;
	margin-right: 12px;
	border: 2px solid #c9cdd4;
	border-radius: 50%;
	box-sizing: border-box;
}

.radio.on {
	border-color: #0968f6;
	background: #0968f6;
	box-shadow: inset 0 0 0 4px #fff;
}

/* 行内编辑按钮：白底描边，与学生列表页编辑按钮风格一致 */
.student-edit-btn {
	flex-shrink: 0;
	margin-left: 12px;
	padding: 5px 14px;
	font-size: 13px;
	color: #4e5969;
	border: 1px solid #ddd;
	border-radius: 4px;
	background: #fff;
}

.student-popup-footer {
	padding: 12px 16px;
}

.footer-btns {
	display: flex;
	align-items: center;
	gap: 12px;
}

.student-add-btn {
	width: 110px;
	height: 46px;
	line-height: 46px;
	font-size: 16px;
	font-weight: 500;
	background: #fff;
	color: #4e5969;
	border: 1px solid #ddd;
	padding: 0;
	margin: 0;
}

.student-add-btn::after {
	border: none;
}

/* 列表为空时新建按钮是唯一操作，占满整行（与确认按钮单独存在时同款布局） */
.student-add-btn-full {
	flex: 1;
}

.student-confirm-btn {
	flex: 1;
	height: 46px;
	line-height: 46px;
	font-size: 16px;
	font-weight: 500;
	background: #0968f6;
	color: #fff;
	border: none;
	padding: 0;
	margin: 0;
}

.student-confirm-btn::after {
	border: none;
}

.student-confirm-disabled {
	background: #a9c8fb !important;
}
</style>
