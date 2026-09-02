<template>
	<view class="tz-exam-group">
		<u-loading-page :loading="loading" bg-color="#F7F8FA"></u-loading-page>

		<view class="three-level-wrap tz-flex tz-col-top" v-if="!loading">
			<view class="side-menu-wrap">
				<scroll-view scroll-y style="height: 100vh;">
					<view
						class="menu-item tz-flex"
						v-for="(item, index) in categoryList"
						:key="item.id"
						:class="[{ 'menu-item-active': index == activeMenu }]"
						@tap="onMenu(index)"
					>
						<view class="menu-title tz-line-1">{{ item.name }}</view>
					</view>
				</scroll-view>
			</view>

			<view
				class="goods-list-box empty-box"
				v-if="!categoryList || !categoryList.length"
			>
				<u-empty
					icon="/static/image/empty.png"
					width="70"
					height="70"
					text="暂无分类"
				></u-empty>
			</view>

			<scroll-view
				scroll-y
				class="goods-list-box"
				v-else
				style="height: 100vh;"
				@scrolltolower="onScrollToLower"
			>
				<u-sticky bgColor="#fff" v-if="secondCategoryList.length > 0">
					<u-tabs :list="secondCategoryList" :current="activeSecondMenu" @click="onSecondMenu"></u-tabs>
				</u-sticky>

				<!-- 当前选中分类有子分类：展示子分类卡片导航 -->
				<template v-if="currentChildren && currentChildren.length > 0">
					<view class="sub-category-wrap" v-if="currentChildren && currentChildren.length > 0">
						<view
							class="sub-category-item"
							v-for="subItem in currentChildren"
							:key="subItem.id"
							@tap="goGoodsList(subItem.id, subItem.name, !!subItem.children && subItem.children.length > 0)"
						>
							<view class="sub-category-name tz-line-1">{{ subItem.name }}</view>
							<tz-icon name="enter" :size="14" color="#999"></tz-icon>
						</view>
					</view>
				</template>

				<!-- 当前选中分类为叶子节点：直接展示练习列表 -->
				<template v-else>
					<view class="loading-box" v-if="goodsLoading && goodsList.length === 0">
						<u-loading-icon mode="circle" size="40"></u-loading-icon>
						<text class="loading-text">加载中</text>
					</view>
					<template v-else>
						<tz-course :round="true" :border="false" :list="goodsList" v-if="goodsList.length > 0"></tz-course>
						<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="goodsList.length == 0" text="暂无练习"></u-empty>
					</template>
					<view class="load-more-box" v-if="goodsList.length > 0">
						<u-loadmore :status="loadStatus" />
					</view>
				</template>
			</scroll-view>
		</view>

		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
