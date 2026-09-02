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
	var that;
	export default {
		// #ifdef MP-TOUTIAO
		i18n,
		// #endif
		components: { subscriptionTip, columnDirCourse },
		data() {
			return {
				list: [],
				subscription: false,
				loading: false,
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
				that.detail();
			},
			sort() {
				that.detail();
			},
		},
		methods: {


			/**
			 * 获取专栏包含的课程
			 */
			getColumnCourse() {
				that
					.$api("course.columndir", {
						id: that.columnId,
						sort: that.sort,
					})
					.then((res) => {
						if (res.code === 1) {
							that.list = that.transformData(res.data);
						}
						this.loading = false;
					});
			},

			detail() {
				this.loading = true;
				that
					.$api("course.detail", {
						id: that.columnId,
					})
					.then((res) => {
						that.subscription = res.data.subscription;
						this.getColumnCourse();
					});
			},

			/**
			 * 转换格式 适配专栏目录
			 */
			transformData(data) {
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
						result[i].bindcourse.no = index++;
					}else{

						for(var j in result[i].children){

							if(result[i].children[j].bindcourse.id == this.courseId){
								this.checkedDir = result[i].id;
							}

							result[i].children[j].bindcourse.no = index++;
						}
					}
				}
				return result;
			}
		},
		mounted() {
			that = this;
			that.detail();
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