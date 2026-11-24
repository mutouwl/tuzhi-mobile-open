<template>
	<div class="container db-result">
		<!-- 首屏骨架（M16）：与真实版式同几何——蓝底头图只把数字盖灰，两张白卡同高占位 -->
		<template v-if="skeletonLoading">
			<view class="db-result-head">
				<view class="db-sk-head-label"></view>
				<view class="db-sk-head-ring"></view>
			</view>
			<view class="db-result-body">
				<view class="db-card">
					<view class="db-sk-line" style="width:90px;height:14px"></view>
					<view class="db-sk-line" style="width:100%;height:52px;margin-top:12px"></view>
				</view>
				<view class="db-card">
					<view class="db-sk-line" style="width:90px;height:14px"></view>
					<view class="db-sk-line" style="width:100%;height:122px;margin-top:28px"></view>
				</view>
			</view>
		</template>

		<u-empty v-else-if="!report.log" icon="/static/image/empty.png" width="70" height="70"
			text="刷题记录不存在" margin-top="30" />

		<template v-else>
			<!-- 正确率：环形月桂把数字整个托在环心（照参照图，不是左右各半支） -->
			<view class="db-result-head">
				<view class="db-result-head-label">正确率</view>
				<view class="db-result-head-main">
					<image class="db-result-wreath" src="/static/image/drill_book/wreath.png" mode="aspectFit" />
					<view class="db-result-head-value">{{ report.accuracy
						}}<text class="db-result-head-unit">%</text></view>
				</view>
			</view>

			<view class="db-result-body">
				<!-- 知识点情况：与刷题目录同构（父目录一行、子目录缩进 + 左侧竖线），层级行由后端
				     catalog_groups 给；目录归不上的记录（模拟测试）退回平铺的 groups。
				     行首圆钮照目录行那两档（父级实心蓝、子级蓝描边空心），钮内放图标而不是纯色块：
				     父级是分类（fenlei）、子级是知识点条目（document）；图标只做层级标记，不带
				     「＋/－」或箭头那种可点符号（本页是只读结果页，摆一个点了没反应的符号比不摆更差） -->
				<view class="db-card" v-if="groupRows.length">
					<view class="db-card-head">
						<view class="db-card-title">知识点情况</view>
					</view>
					<view class="db-group-item" :class="{ 'db-group-item-child': row.level > 0 }"
						v-for="(row, i) in groupRows" :key="row.catalog_id || ('g' + i)">
						<view v-if="row.level > 0" class="db-group-line"></view>
						<view class="db-group-head">
							<view class="db-group-dot" :class="{ 'db-group-dot-child': row.level > 0 }">
								<tz-icon :name="row.level > 0 ? 'document' : 'fenlei'" :size="12"
									:color="row.level > 0 ? '#0968f6' : '#ffffff'" />
							</view>
							<view class="db-group-name">{{ row.name }}</view>
							<view class="db-group-acc">{{ row.accuracy }}%</view>
						</view>
						<view class="db-group-meta">共{{ row.total }}题，答对{{ row.right }}题，正确率{{ row.accuracy }}%</view>
					</view>
				</view>

				<!-- 刷题情况：五格统计压在一条浅蓝底上（参照图第三块） -->
				<view class="db-card">
					<view class="db-card-head">
						<view class="db-card-title">刷题情况</view>
					</view>
					<view class="db-stat-row" :class="{ 'is-wrapped': timeWrapped }">
						<view class="db-stat-cell" :class="{ 'db-stat-cell-time': cell.key === 'time' }"
							v-for="cell in statCells" :key="cell.key">
							<view class="db-stat-num" :class="[cell.cls, 'db-stat-num-' + cell.key]">{{
								cell.value }}<text v-if="cell.unit" class="db-stat-unit">{{ cell.unit }}</text></view>
							<view class="db-stat-label">{{ cell.label }}</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 吸底两枚：全部解析 / 错题解析 —— 都落到共用做题页的解析态，本页不再内嵌解析列表。
			     胶囊走 u-button 自带的 shape="circle"（同练习结果页「查看解析 / 继续练习」那一档），
			     不在页面 CSS 里自造圆角 -->
			<view class="db-result-btns school-footer h5-bottom-bar">
				<view class="db-result-btn">
					<u-button plain color="#0968f6" shape="circle" :customStyle="btnAllStyle"
						@click="goAnalysis('all')">全部解析</u-button>
				</view>
				<view class="db-result-btn">
					<u-button type="primary" shape="circle" :customStyle="btnWrongStyle"
						@click="goAnalysis('wrong')">错题解析</u-button>
				</view>
			</view>

			<tz-tab-bar />
			<tz-footer />
		</template>
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
