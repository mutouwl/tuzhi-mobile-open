<template>
	<div>
		<div v-if="!loading">
			<div class="dir-box" v-if="list.length > 0">
				<view v-for="(item, index) in list" :key="item.id">
					<u-collapse :value="checkedDir == item.id ? item.id : [0]" :accordion="checkedDir == item.id" :border="false" v-if="item.type == 2">

						<u-collapse-item :name="item.id" :title="item.title + '(' + item.children.length + '小节)'" :border="false" style="margin: 0px 0;">
							<template slot="title">
								<text style="width: 100%;font-weight: bolder;">{{item.title}}<span style="font-size: 14px;font-weight: normal;color: #86909c;">({{item.children.length}}小节)</span></text>
							</template>

							<div style="width: 100%;">
								<template v-if="item.children.length>0">
									<template v-for="(children, no) in item.children">
									<circle-course-dir-item v-if="children.bindcourse && children.bindcourse.id" :key="String(children.id)" :course="children.bindcourse" :course-id="currentCourseId"
											:subscription="isMember ? 1 : 0"
											:circle-id="circleId"
											:bordered="no < (item.children.length - 1)"/>
									</template>
								</template>
								<div class="empty-dir" v-else>
									暂无内容
								</div>
							</div>
						</u-collapse-item>
					</u-collapse>
					<template v-else>
						<circle-course-dir-item v-if="item.bindcourse && item.bindcourse.id" :key="'course-' + String(item.id)" :course="item.bindcourse" :course-id="currentCourseId"
							:subscription="isMember ? 1 : 0"
							:circle-id="circleId"
							:bordered="list[index+1] ? (list[index+1].type != 2 ? true : false) : false"/>
					</template>
				</view>
			</div>
			<u-empty v-else text="暂无课程" icon="/static/image/empty.png" width="70" height="70" margin-top="60"></u-empty>
		</div>

		<div class="loading" v-if="loading">
			<u-loading-icon text="加载中" textSize="16"></u-loading-icon>
		</div>
	</div>
</template>

<script>
	import circleCourseDirItem from "@/components/tz/circle-course-dir-item.vue";
	export default {
		components: { circleCourseDirItem },
		data() {
			return {
				list: [],
				loading: true,
				checkedDir: 0,
			};
		},
		props: {
			circleId: {
				type: [Number, String],
				default: 0,
			},
			isMember: {
				type: Boolean,
				default: false,
			},
			//当前打开的课程 ID，用于目录中高亮选中
			currentCourseId: {
				type: [Number, String],
				default: 0,
			},
		},
		watch: {
			circleId() {
				this.loadDir();
			},
			currentCourseId() {
				this.autoExpandCurrent();
			},
		},
		methods: {
			/**
			 * 加载圈子课程目录
			 */
			loadDir() {
				if (!this.circleId) {
					this.list = [];
					this.loading = false;
					return;
				}
				this.loading = true;
				this.$api('circle.circle.courseDir', { circle_id: this.circleId }).then((res) => {
					try {
						this.list = Number(res && res.code) === 1
							? this.transformData(Array.isArray(res.data) ? res.data : [])
							: [];
						this.autoExpandCurrent();
					} finally {
						this.loading = false;
					}
				}, () => {
					this.list = [];
					this.loading = false;
				});
			},

			/**
			 * 当前课程在折叠分组内时，自动展开对应分组，保证选中项可见
			 */
			autoExpandCurrent() {
				if (!this.currentCourseId) return;
				this.list.forEach(item => {
					if (item.type == 2 && item.children && item.children.length) {
						const found = item.children.some(children => children.bindcourse && Number(children.bindcourse.id) === Number(this.currentCourseId));
						if (found) {
							this.checkedDir = item.id;
						}
					}
				});
			},

			/**
			 * 扁平列表转树形结构
			 */
			transformData(data) {
				const rows = Array.isArray(data) ? data.filter(item => item && item.id != null) : [];
				const idMap = new Map();
				rows.forEach(item => {
					const itemCopy = { ...item };
					if (Number(item.type) === 2) {
						itemCopy.children = [];
					}
					idMap.set(String(item.id), itemCopy);
				});
				const result = [];
				rows.forEach(item => {
					const itemCopy = idMap.get(String(item.id));
					const parent = idMap.get(String(item.p_id));
					if (Number(item.p_id) !== 0 && parent && Array.isArray(parent.children)) {
						parent.children.push(itemCopy);
					} else {
						result.push(itemCopy);
					}
				});

				// 关联课程可能已被删除，接口会返回 bindcourse=null；过滤掉无效课程节点，
				// 避免渲染课程组件时读取 course.id 失败并阻断 loading=false 后的视图更新。
				const validCourse = item => item && item.bindcourse && item.bindcourse.id != null;
				const tree = result.map(item => {
					if (Number(item.type) === 2) {
						item.children = (item.children || []).filter(validCourse);
						return item;
					}
					return validCourse(item) ? item : null;
				}).filter(Boolean);

				// 编号
				var index = 1;
				for (var i in tree) {
					if (Number(tree[i].type) === 1) {
						if (tree[i].bindcourse) {
							tree[i].bindcourse.no = index++;
						}
					} else {
						for (var j in tree[i].children) {
							if (tree[i].children[j].bindcourse) {
								tree[i].children[j].bindcourse.no = index++;
							}
						}
					}
				}
				return tree;
			},
		},
		mounted() {
			this.loadDir();
		},
	};
</script>

<style>
	.dir-box {
		padding: 5px;
		background: #fff;
		border-radius: 8px;
		overflow: hidden;
	}

	.loading {
		width: 100%;
		height: 200px;
		padding-top: 100px;
	}

	::v-deep .u-cell__title-text {
		width: 100%;
		font-weight: bolder;
		color: #333 !important;
	}

	::v-deep .u-collapse-item__content__text {
		padding-bottom: 0px;
		padding-left: 5px;
		padding-right: 5px;
	}

	.empty-dir {
		padding: 30px;
		text-align: center;
		color: #999;
		font-size: 13px;
	}
</style>
