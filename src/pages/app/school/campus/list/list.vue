<template>
    <view class="school-page">
        <!-- 搜索栏：对齐套餐列表页（吸顶 u-search，搜索/清空触发刷新） -->
        <u-sticky :offsetTop="0" bgColor="#fff">
            <view class="school-search-box">
                <u-search
                    placeholder="搜索校区名称/地址"
                    shape="square"
                    :showAction="false"
                    v-model="keyword"
                    bgColor="#f5f5f5"
                    @search="refresh"
                    @clear="refresh"
                ></u-search>
            </view>
        </u-sticky>
        <view class="school-cards">
            <!-- 刷新时仅列表区域展示骨架屏，顶部搜索保持可见（版式对齐套餐列表页） -->
            <view class="sk-list" v-if="loading">
                <view class="cl-sk-item" v-for="i in 4" :key="i">
                    <view class="cl-sk-cover"></view>
                    <view class="cl-sk-info">
                        <u-skeleton
                            :loading="true"
                            :animate="true"
                            :title="true"
                            title-width="85%"
                            title-height="16"
                            :rows="1"
                            rows-width="55%"
                            rows-height="12"
                        />
                        <view class="cl-sk-line"></view>
                    </view>
                </view>
            </view>
            <template v-else>
                <!-- 校区卡片：共用组件 tz-campus（左侧正方形封面 + 右侧名称/营业时间/地址），
                     与「选择校区」弹窗、套餐详情「可上课校区」、教师详情「所属校区」同一套卡片；
                     营业时间/地址展示行首图标，与其余场景口径一致；
                     圆角走组件默认档（不传 round）：套餐/校区两个复用列表组件按用户要求恢复圆角，
                     与其余教务列表页（直角）不同，这两页是明确例外 -->
                <tz-campus :list="list" @click="goDetail" />
                <!-- 分页加载行：校区列表滚动到底部续拉下一页（列表非空才展示；末页收起，与本模块其余列表口径一致） -->
                <view class="campus-loadmore" v-if="list.length && loadStatus !== 'nomore'"><u-loadmore :status="loadStatus" /></view>
                <u-empty
                    v-if="!list.length"
                    icon="/static/image/empty.png"
                    width="70"
                    height="70"
                    :text="keyword ? '未找到相关校区' : '暂无校区'"
                />
            </template>
        </view>

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
