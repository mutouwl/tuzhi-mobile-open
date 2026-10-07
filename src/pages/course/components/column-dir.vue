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

		<!-- 目录骨架（M16）：灰块与 column-dir-course 的真实行逐块对齐 —— 16px 标题条 + 12px 元信息条 +
		     行末那枚 20px 锁图标块，行内衬/行距同真实行（15px 内衬、5px 行距），换内容时不跳位。
		     rows-width 带冒号绑成数组：写成静态属性就是一条字符串，u-skeleton 认不出数组 -->
		<view class="dir-box cdir-sk" v-if="loading">
			<view class="cdir-sk-row" v-for="i in 5" :key="'cdir-sk-' + i">
				<view class="cdir-sk-main">
					<u-skeleton :loading="true" :animate="true" :title="false" :rows="2"
						:rows-width="['62%', '44%']" :rows-height="[16, 12]"></u-skeleton>
				</view>
				<view class="cdir-sk-lock"></view>
			</view>
		</view>
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

	/* 骨架行与 column-dir-course 的 .course-box 同一份几何（内衬 15、行距 5px 0） */
	.cdir-sk-row {
		display: flex;
		align-items: center;
		padding: 15px;
		margin: 5px 0;
	}

	.cdir-sk-main {
		flex: 1;
		min-width: 0;
		/* 一行内项与项的间距只由行首这一头给，锁图标块不写 margin-left */
		margin-right: 8px;
	}

	.cdir-sk-lock {
		width: 20px;
		height: 20px;
		flex: none;
		border-radius: 4px;
		background: #e5e6eb;
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