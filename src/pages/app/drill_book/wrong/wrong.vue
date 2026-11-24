<template>
	<div class="container db-wrong" :class="{ 'db-wrong-with-bottom': detailMode }">
		<!-- 分组视图：刷题 / 试卷 两个页签（参照图3） -->
		<template v-if="!detailMode">
			<u-sticky bgColor="#fff" :offsetTop="0">
				<u-tabs :list="tabs" :current="tabIndex" @change="onTab" lineColor="#0968f6"
					:activeStyle="{ color: '#1d2129', fontWeight: 'bold' }" />
			</u-sticky>

			<template v-if="skeletonLoading">
				<view class="db-wrong-sk-card">
					<view class="db-sk-line" style="width:100%;height:44px;margin-bottom:10px" v-for="i in 4" :key="i"></view>
				</view>
			</template>

			<template v-else>
				<u-empty v-if="groupEmpty" icon="/static/image/empty.png" width="70" height="70"
					:text="emptyText" margin-top="60" />

				<!-- 刷题页签：「所有题目」汇总行 + 目录树（只摆有错题的目录）。
				     汇总行与目录行是同一套行结构、同一档字号字重（16px / 600），
				     行与行之间不画分割线；树本身复用 drill_book 共用的目录组件
				     （缩进 + 祖先导引线 + 折叠圆钮 + 名称），本页只把右侧那格适配成「N题 ›」 -->
				<template v-else-if="currentKey === 'practice'">
					<view class="db-wrong-card">
						<view class="db-wrong-row" @click="openAll">
							<view class="db-wrong-row-name">所有题目</view>
							<view class="db-wrong-row-right">
								<text class="db-wrong-row-count">{{ totalCount }}题</text>
								<tz-icon name="enter" :size="14" color="#c9cdd4" />
							</view>
						</view>
						<drill-catalog :rows="groupRows" name-bold @node-click="openGroupRow"
							@toggle="toggleGroup">
							<template v-slot:right="{ node }">
								<view class="db-wrong-row-right">
									<text class="db-wrong-row-count">{{ node.count }}题</text>
									<tz-icon name="enter" :size="14" color="#c9cdd4" />
								</view>
							</template>
						</drill-catalog>
					</view>
				</template>

				<!-- 试卷页签：一次已交卷的模拟测试一行（参照图5）；整块白底，行间浅灰细线分隔 -->
				<template v-else>
					<view class="db-wrong-paper-list" v-if="paperGroups.length">
						<view class="db-wrong-paper" v-for="p in paperGroups" :key="p.log_id" @click="openPaper(p)">
							<view class="db-wrong-paper-name">{{ p.name }}</view>
							<view class="db-wrong-paper-meta">
								<text class="db-wrong-paper-time">提交时间：{{ p.submittime_text || '-' }}</text>
								<text class="db-wrong-paper-stat">共 {{ p.question_count }} 道 · 做对 {{ p.true_count }} 道</text>
							</view>
						</view>
					</view>
					<view class="db-loadmore" v-if="paperGroups.length && paperLoadStatus !== 'nomore'">
						<u-loadmore :status="paperLoadStatus" />
					</view>
				</template>
			</template>
		</template>

		<!-- 错题列表（参照图2 / 图4）：顶部只有搜索；管理模式「取消」落在搜索框右侧 -->
		<template v-else>
			<u-sticky bgColor="#fff" :offsetTop="0">
				<view class="db-wrong-searchbar">
					<view class="db-wrong-search">
						<u-search v-model="keyword" placeholder="搜索题目" :showAction="false" bgColor="#f7f8fa"
							shape="square" @search="refreshQuestions" @clear="refreshQuestions" />
					</view>
					<text v-if="managing" class="db-wrong-cancel" @click="exitManage">取消</text>
				</view>
			</u-sticky>

			<template v-if="skeletonLoading">
				<view class="db-wrong-sk-card">
					<view class="db-sk-line" style="width:100%;height:64px;margin-bottom:10px" v-for="i in 3" :key="i"></view>
				</view>
			</template>

			<template v-else>
				<u-empty v-if="!questions.length" icon="/static/image/empty.png" width="70" height="70"
					:text="emptyText" margin-top="60" />

				<!-- 管理态的勾选走 uview 的 u-checkbox（全站同一枚选择框组件，选中态自带给对号）；
				     卡片顶部一行：左边题型标签，右边「错误次数」整块不换行 -->
				<u-checkbox-group v-else v-model="selectedIds" placement="column" shape="circle" :size="20"
					:iconSize="12" activeColor="#0968f6" inactiveColor="#c9cdd4" class="db-wrong-list">
					<view class="db-wrong-qrow" v-for="q in questions" :key="q.id">
						<view v-if="managing" class="db-wrong-check-hit" @click.stop="toggleOne(q)">
							<u-checkbox :name="Number(q.id)" />
						</view>
						<view class="db-wrong-qcard" @click="onQuestionTap(q)">
							<view class="db-wrong-qhead">
								<text class="db-wrong-type">{{ $t(q.type) }}</text>
								<view class="db-wrong-qreminder">
									<text class="db-wrong-meta-text">错误次数：{{ q.error_count || 0 }}次</text>
								</view>
							</view>
							<view class="db-wrong-qtext">
								<tz-parse :content="q.question" />
							</view>
						</view>
					</view>
				</u-checkbox-group>

				<view class="db-loadmore" v-if="questions.length && loadStatus !== 'nomore'">
					<u-loadmore :status="loadStatus" />
				</view>
			</template>

			<view class="db-wrong-bottom school-footer h5-bottom-bar">
				<template v-if="managing">
					<view class="db-wrong-selectall">
						<u-checkbox-group :value="selectAllValue" shape="circle" :size="20" :iconSize="12"
							activeColor="#0968f6" inactiveColor="#c9cdd4" @change="onSelectAllChange">
							<u-checkbox name="all" label="全选" :labelSize="14" labelColor="#1d2129" />
						</u-checkbox-group>
					</view>
					<view class="db-wrong-delete">
						<u-button type="primary" :disabled="!selectedCount" :customStyle="{ width: '100%' }"
							@click="removeSelected">删除({{ selectedCount }})</u-button>
					</view>
				</template>
				<template v-else>
					<view class="db-wrong-manage" @click="enterManage">
						<tz-icon name="setting" :size="20" color="#4e5969" />
						<text>管理</text>
					</view>
					<view class="db-wrong-practice">
						<u-button type="primary" :customStyle="{ width: '100%' }" @click="retryCurrent">错题练习</u-button>
					</view>
				</template>
			</view>
		</template>
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
