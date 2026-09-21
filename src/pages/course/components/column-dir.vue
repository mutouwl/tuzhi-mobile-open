<template>
	<div>
		<div v-if="!loading">
			<div class="dir-box" v-if="list.length > 0 || subscription">
				<template v-for="(item, index) in list">
					<u-collapse :value="checkedDir == item.id ? item.id : [0]" :accordion="checkedDir == item.id" :border="false" v-if="item.type == 2">
						
						<u-collapse-item :name="item.id" :title="item.title+'('+item.children.length+'小节)'" :border="false" style="margin: 0px 0;">
							<template slot="title">
								<text style="width: 100%;font-weight: bolder;">{{item.title}}<span style="font-size: 14px;font-weight: normal;color: #86909c;">({{item.children.length}}小节)</span></text>
							</template>
							
							<div style="width: 100%;">
								<template v-if="item.children.length>0">
									<template v-for="(children, no) in item.children">
										<column-dir-course :course="children.bindcourse" :courseId="courseId"
											:columnId="columnId" :subscription="children.subscription"
											:is_try="children.try" :bordered="no < (item.children.length - 1)"/>
									</template>
								</template>
								<div class="empty-dir" v-else>
									暂无内容
								</div>
							</div>
						</u-collapse-item>
					</u-collapse>
					<template v-else>
						<column-dir-course :course="item.bindcourse" :courseId="courseId" :columnId="columnId"
							:subscription="item.subscription" :is_try="item.try" :bordered="list[index+1] ? (list[index+1].type != 2 ? true : false) :false"/>
					</template>
				</template>
			</div>
			<!-- <subscription-tip v-if="!subscription" text="订阅后查看完整目录内容" /> -->
		</div>

		<div class="loading" v-if="loading">
			<u-loading-icon text="加载中" textSize="16"></u-loading-icon>
		</div>
	</div>
</template>

<script>
	import subscriptionTip from "@/pages/course/components/subscription-tip.vue";
	import columnDirCourse from "@/pages/course/components/column-dir-course.vue";
	// #ifdef MP-TOUTIAO
	import i18n from "@/components/language/index.js";
import value from "../../../components/uview-ui/components/u-text/value";
	// #endif
	export default {
		// #ifdef MP-TOUTIAO
		i18n,
		// #endif
		components: { subscriptionTip, columnDirCourse },
		data() {
			return {
				list: [],
				subscription: false,
				loading: true,
				checkedDir:0
			};
		},
		computed: {},
		props: {
			dir: {
				type: [Array, Object],
				default: () => {
					return [];
				},
			},
			columnId: {
				//专栏ID
				type: [Number, String],
				default: () => {
					return 0;
				},
			},
			courseId: {
				//这里的课程ID
				type: [Number, String],
				default: () => {
					return 0;
				},
			},
			sort: {
				type: String,
				default: "asc",
			},
		},
		watch: {
			columnId() {
				this.detail();
			},
			sort() {
				this.detail();
			},
		},
		methods: {


			/**
			 * 获取专栏包含的课程
			 */
			getColumnCourse() {
				this
					.$api("course.columndir", {
						id: this.columnId,
						sort: this.sort,
					})
					.then((res) => {
						if (res && res.code === 1 && Array.isArray(res.data)) {
							this.list = this.transformData(res.data);
						} else {
							// 业务失败（code!=1 或数据非数组）按空目录处理，不能把 loading 留在 true
							this.list = [];
						}
						// 无论成功失败都必须复位，否则目录区永久停在「加载中」
						this.loading = false;
					})
					.catch(() => {
						// 请求层失败（非 200/网络异常/取消）同样复位并退化为空目录
						this.list = [];
						this.loading = false;
					});
			},

			detail() {
				this.loading = true;
				this
					.$api("course.detail", {
						id: this.columnId,
					})
					.then((res) => {
						// 原实现直接读 res.data.subscription：业务失败（code!=1）或 data 为空时
						// 这里抛异常 → getColumnCourse() 永不执行 → loading 永久为 true，
						// 表现为「详情数据已返回，目录区一直显示加载中」
						if (!res || res.code !== 1 || !res.data) {
							this.loading = false;
							return;
						}
						this.subscription = !!res.data.subscription;
						this.getColumnCourse();
					})
					.catch(() => {
						// 请求层失败同样复位，避免骨架/加载态驻留
						this.loading = false;
					});
			},

			/**
			 * 转换格式 适配专栏目录
			 */
			transformData(data) {
				if (!Array.isArray(data)) {
					return [];
				}
				const idMap = new Map();
				data.forEach(item => {
					const itemCopy = { ...item };
					if (item.type !== 1) {
						itemCopy.children = [];
					}
					idMap.set(item.id, itemCopy);
				});
				const result = [];
				data.forEach(item => {
					if (item.p_id !== 0 && idMap.has(item.p_id)) {
						idMap.get(item.p_id).children.push(idMap.get(item.id));
					} else {
						result.push(idMap.get(item.id));
					}
				});

				var index = 1;
				for(var i in result){
					if(result[i].type == 1){
						// 目录项未绑定课程时后端会下发 bindcourse=null（loadCircleCourseNav 已按此过滤），
						// 直接取 .no 会抛异常并中断整个目录渲染
						if(result[i].bindcourse){
							result[i].bindcourse.no = index++;
						}
					}else{

						for(var j in result[i].children){
							var bindcourse = result[i].children[j].bindcourse;
							// 同上：未绑定课程的章节直接跳过编号与选中判定
							if(!bindcourse){
								continue;
							}

							if(bindcourse.id == this.courseId){
								this.checkedDir = result[i].id;
							}

							bindcourse.no = index++;
						}
					}
				}
				return result;
			}
		},
	mounted() {
		this.detail();
	},
	};
</script>

<style>
	.dir-box {
		margin-top: 10px;
	}

	.loading {
		width: 100%;
		height: 200px;
		padding-top: 100px;
	}

	::v-deep .u-cell__body {
		/* border-radius: 6px;
		background-color: #f6f6f6 !important;
		height: 50px;
		line-height: 50px;
		padding: 10px 0; */
	}

	::v-deep .u-cell__title-text{
		width: 100%;
		font-weight: bolder;
		color: #333!important;
	}

	::v-deep .u-collapse-item__content__text{
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